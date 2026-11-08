#!/usr/bin/env python3
"""Static sanity checks for Presto/Trino or Spark SQL used in pipeline steps.

Usage:
    python sql_sanity_check.py step.sql [--dialect presto|spark] [--partition-col grass_date]
    cat step.sql | python sql_sanity_check.py - --dialect spark

It is a heuristic linter (regex-based, no parser): it catches the mechanical
mistakes that cost the most in practice — missing/non-sargable partition
filters, SELECT * in pipeline tables, division without NULLIF, filters after a
LEFT JOIN, NOT IN subqueries, CURRENT_DATE inside a step, dialect mix-ups,
non-deterministic picks — and prints them in flaw-point style. Treat every
finding as a question to answer, not a verdict.
"""
import argparse
import re
import sys

CHECKS = []


def check(name, severity):
    def deco(fn):
        CHECKS.append((name, severity, fn))
        return fn
    return deco


def strip_comments(sql: str) -> str:
    sql = re.sub(r"/\*.*?\*/", " ", sql, flags=re.S)
    sql = re.sub(r"--[^\n]*", " ", sql)
    return sql


@check("partition filter missing in a FROM/JOIN block", "error")
def partition_filter(sql, d, pcol):
    if not pcol:
        return []
    # each SELECT ... FROM ... (until next SELECT) should mention the partition col in a WHERE/ON
    blocks = re.split(r"\bSELECT\b", sql, flags=re.I)[1:]
    out = []
    for i, b in enumerate(blocks, 1):
        if re.search(r"\bFROM\s+[\w.\"`]+", b, re.I) and not re.search(rf"\b{re.escape(pcol)}\b\s*(=|>=|<=|<|>|BETWEEN|IN)", b, re.I):
            out.append(f"SELECT block #{i} reads a table without a `{pcol}` predicate → likely full scan. "
                       f"Add `WHERE {pcol} = DATE '${{run_date}}'` (or a BETWEEN) in that block, including dimensions.")
    return out


@check("partition column wrapped in a function (non-sargable)", "error")
def non_sargable(sql, d, pcol):
    if not pcol:
        return []
    pat = rf"\b(date_format|cast|substr|substring|date_trunc|to_date|year|month)\s*\(\s*[\w.]*\b{re.escape(pcol)}\b"
    return [f"`{m.group(0)}…` prevents partition pruning. Compare `{pcol}` directly to a typed literal."
            for m in re.finditer(pat, sql, re.I)]


@check("SELECT * in a pipeline step", "warn")
def select_star(sql, d, pcol):
    return ["`SELECT *` found → schema drift upstream silently changes your output; list columns explicitly "
            "(and avoids reading nested columns you don't need)."] if re.search(r"\bSELECT\s+\*", sql, re.I) else []


@check("division without NULLIF guard", "error")
def division(sql, d, pcol):
    out = []
    for m in re.finditer(r"/\s*([\w.]+(?:\((?:[^()]|\([^()]*\))*\))?)", sql):
        rhs = m.group(1)
        if rhs.upper().startswith("NULLIF") or re.fullmatch(r"[\d.]+", rhs):
            continue
        out.append(f"`/ {rhs}` — denominator not guarded. Presto/Trino raises on division by zero; "
                   f"Spark returns NULL or errors in ANSI mode. Use `/ NULLIF({rhs}, 0)`"
                   + (" and CAST the numerator to DOUBLE (integer division truncates)." if d == "presto" else "."))
    return out


@check("WHERE filter on the right side of a LEFT JOIN", "error")
def left_join_filter(sql, d, pcol):
    out = []
    for m in re.finditer(r"LEFT\s+(OUTER\s+)?JOIN\s+[\w.\"`]+\s+(?:AS\s+)?(\w+)", sql, re.I):
        alias = m.group(2)
        where = re.search(r"\bWHERE\b(.*?)(\bGROUP\b|\bORDER\b|\bLIMIT\b|$)", sql[m.end():], re.I | re.S)
        if where and re.search(rf"\b{alias}\.\w+\s*(=|<>|!=|>|<|IN|LIKE)\s*(?!NULL)", where.group(1), re.I):
            if not re.search(rf"\b{alias}\.\w+\s+IS\s+NULL", where.group(1), re.I):
                out.append(f"LEFT JOIN alias `{alias}` is filtered in WHERE → unmatched rows (NULL) are dropped; "
                           f"this is an INNER JOIN in disguise. Move the condition into the ON clause or use COALESCE.")
    return out


@check("NOT IN (subquery) — NULL trap", "error")
def not_in(sql, d, pcol):
    return ["`NOT IN (SELECT …)` returns zero rows if the subquery yields any NULL. Use `NOT EXISTS` or add "
            "`WHERE col IS NOT NULL` inside the subquery."] if re.search(r"\bNOT\s+IN\s*\(\s*SELECT", sql, re.I) else []


@check("CURRENT_DATE / now() inside a pipeline step", "warn")
def current_date(sql, d, pcol):
    return ["`CURRENT_DATE`/`now()` found. A backfill for an old date will compute against today; parameterise "
            "with `${run_date}`."] if re.search(r"\b(CURRENT_DATE|CURRENT_TIMESTAMP|now\(\))", sql, re.I) else []


@check("non-deterministic value pick", "warn")
def arbitrary(sql, d, pcol):
    pat = r"\b(arbitrary|any_value|first|first_value)\s*\(" if d == "spark" else r"\b(arbitrary|any_value)\s*\("
    return [f"`{m.group(1)}()` is non-deterministic across runs/engines. Fine for a label that is constant per key; "
            f"otherwise use max_by/min_by or ROW_NUMBER with a tie-breaker."
            for m in re.finditer(pat, sql, re.I)]


@check("ORDER BY without LIMIT (single-node sort)", "warn")
def order_no_limit(sql, d, pcol):
    tail = sql[sql.upper().rfind("ORDER BY"):] if "ORDER BY" in sql.upper() else ""
    return ["Global `ORDER BY` without `LIMIT` on a pipeline result → single-node sort, no benefit to the table. "
            "Drop it (sort at read time)."] if tail and not re.search(r"\bLIMIT\b", tail, re.I) and not re.search(r"\bOVER\s*\(", tail, re.I) else []


@check("dialect mix-up", "error")
def dialect(sql, d, pcol):
    presto_only = {r"\bdate_add\s*\(\s*'": "date_add('day', n, d) is Presto; Spark is date_add(d, n)",
                   r"\bjson_extract_scalar\s*\(": "json_extract_scalar is Presto; Spark uses get_json_object",
                   r"\bUNNEST\s*\(": "UNNEST is Presto; Spark uses explode / LATERAL VIEW",
                   r"\bapprox_distinct\s*\(": "approx_distinct is Presto; Spark uses approx_count_distinct",
                   r"\bstrpos\s*\(": "strpos is Presto; Spark uses instr/locate",
                   r"\bcount_if\s*\(": None,  # both
                   r"%Y": "'%Y-%m-%d' is a Presto/MySQL pattern; Spark uses 'yyyy-MM-dd'"}
    spark_only = {r"\bget_json_object\s*\(": "get_json_object is Spark; Presto uses json_extract_scalar",
                  r"\bexplode\s*\(|LATERAL\s+VIEW": "explode/LATERAL VIEW is Spark; Presto uses UNNEST",
                  r"\bcollect_(list|set)\s*\(": "collect_list/set is Spark; Presto uses array_agg",
                  r"\bdatediff\s*\(": "datediff(end,start) is Spark; Presto uses date_diff('day', start, end)",
                  r"\bpercentile_approx\s*\(": "percentile_approx is Spark; Presto uses approx_percentile",
                  r"yyyy-MM": "'yyyy-MM-dd' is a Spark/Java pattern; Presto uses '%Y-%m-%d'",
                  r"`\w+`": "backtick identifiers are Spark; Presto uses double quotes"}
    out = []
    table = spark_only if d == "presto" else presto_only
    for pat, msg in table.items():
        if msg and re.search(pat, sql, re.I):
            out.append(msg)
    return out


@check("RANGE window frame over an ORDER BY with possible ties", "warn")
def window_frame(sql, d, pcol):
    out = []
    for m in re.finditer(r"\b(SUM|COUNT|AVG)\s*\((?:[^()]|\([^()]*\))*\)\s*OVER\s*\(([^)]*)\)", sql, re.I):
        body = m.group(2)
        if re.search(r"\bORDER\s+BY\b", body, re.I) and not re.search(r"\bROWS\b", body, re.I):
            out.append(f"Running `{m.group(1)}` with ORDER BY and no ROWS frame → default RANGE frame includes tied rows "
                       f"(running totals double on duplicate timestamps). Add `ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW`.")
    return out


@check("INSERT without idempotency hint", "warn")
def insert_idempotent(sql, d, pcol):
    if re.search(r"\bINSERT\s+INTO\b", sql, re.I) and not re.search(r"OVERWRITE|insert_existing_partitions_behavior|DELETE\s+FROM", sql, re.I):
        return ["`INSERT INTO` with no overwrite/delete of the target partition → a retry duplicates rows. "
                "Use the platform's partition-overwrite mechanism (Trino session property, DELETE + INSERT, "
                "or Spark INSERT OVERWRITE with dynamic partition mode)."]
    return []


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("path", help="SQL file or - for stdin")
    ap.add_argument("--dialect", choices=["presto", "spark"], default="presto")
    ap.add_argument("--partition-col", default="grass_date", help="partition column name ('' to skip the check)")
    a = ap.parse_args()
    raw = sys.stdin.read() if a.path == "-" else open(a.path, encoding="utf-8").read()
    sql = strip_comments(raw)
    findings = []
    for name, sev, fn in CHECKS:
        for msg in fn(sql, a.dialect, a.partition_col):
            findings.append((sev, name, msg))
    if not findings:
        print("No mechanical findings. Now verify the logic: grain uniqueness, reconciliation, fan-out.")
        return 0
    icon = {"error": "❌", "warn": "⚠️"}
    for sev, name, msg in sorted(findings, key=lambda f: f[0] != "error"):
        print(f"{icon[sev]} [{name}] {msg}")
    print(f"\n{len(findings)} finding(s). Each is a question to answer, not a verdict — confirm against the actual tables.")
    return 1 if any(s == "error" for s, _, _ in findings) else 0


if __name__ == "__main__":
    sys.exit(main())
