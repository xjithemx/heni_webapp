# Presto / Trino playbook — the pipeline engine

Contents: 1. Mindset · 2. Syntax that bites · 3. Partition discipline ·
4. Joins & skew · 5. Memory & distributed gotchas · 6. Pipeline step
patterns (idempotent, step-by-step) · 7. Diagnosis workflow ·
8. Verification snippets

> Presto (PrestoDB) and Trino share most syntax but diverge in details
> (e.g. `from_unixtime` return type, `INSERT OVERWRITE` support, some
> session properties). If the user has not said which, ask once; until
> then write SQL that works on both and mark fork-specific lines.

## 1. Mindset

Presto is a **stateless, in-memory, pull-from-storage** engine. Three
consequences shape every query:

1. It reads from remote storage every time → bytes scanned is the cost.
   Partition pruning and column pruning are not optimisation, they are
   correctness for a pipeline that must finish before the SLA.
2. Memory per query is capped and not spilled by default on most
   clusters → wide `DISTINCT`, huge `ORDER BY` without `LIMIT`,
   `array_agg` over hot groups, and build sides that don't fit will fail
   at 90% progress, after burning the time.
3. It is distributed by hash → a skewed key means one worker does the
   work of a hundred.

## 2. Syntax that bites (Presto/Trino vs what people expect)

| Topic | Presto/Trino | Common mistake |
|---|---|---|
| Integer division | `7/2 = 3` | expecting 3.5 → `CAST(7 AS DOUBLE)/2` |
| Division by zero | **error**, not NULL | always `x / NULLIF(y, 0)` |
| Invalid cast | **error** | use `TRY_CAST(x AS BIGINT)` / `TRY(...)` |
| Date arithmetic | `date_add('day', -7, d)`, `date_diff('day', a, b)` (b − a) | Spark-style `date_add(d, 7)` fails; argument order of `date_diff` is `(unit, start, end)` |
| Date format | `date_format(ts, '%Y-%m-%d')` MySQL-style `%` tokens; `date_parse(s, '%Y-%m-%d')` | Java `yyyy-MM-dd` patterns don't work here |
| Literals | `DATE '2026-10-01'`, `TIMESTAMP '2026-10-01 00:00:00'`, `INTERVAL '7' DAY` | `'2026-10-01'` string compared to a date works via implicit cast but defeats pruning on some connectors — use the typed literal |
| Unix time | `from_unixtime(x)` → timestamp (Trino: with time zone); `to_unixtime(ts)` → double | treating result as string |
| Timezone | `ts AT TIME ZONE 'Asia/Ho_Chi_Minh'`; `current_timezone()` shows the session TZ | assuming session TZ = local |
| String split | `split(s, ',')` is literal; `regexp_split(s, '\s+')` for regex; `split_part(s, '-', 2)` | thinking `split` takes a regex |
| Position/substr | `strpos(s, 'x')` 1-based, `substr(s, 1, 3)` | `instr`, `substring_index` don't exist (use `split_part`) |
| JSON | `json_extract_scalar(j, '$.a.b')`, `json_parse`, `CAST(json_parse(j) AS ARRAY<VARCHAR>)` | `get_json_object` is Spark |
| Arrays/maps | `UNNEST(arr) AS t(x)` (CROSS JOIN), `cardinality`, `contains`, `element_at`, `array_join`, `filter(arr, x -> x > 0)`, `transform`, `map_agg`, `array_agg(x ORDER BY y)` | `explode`, `LATERAL VIEW`, `size` are Spark |
| Approx | `approx_distinct(x)`, `approx_percentile(x, 0.5)` | fine for exploration; **not** for finance/SLA reporting — say which you chose |
| Handy aggs | `count_if(cond)`, `max_by(a, b)`, `min_by`, `arbitrary(x)`, `bool_or` | `arbitrary` is non-deterministic — never use it on a column that matters |
| NULL ordering | ASC → NULLs **last** (NULL treated as largest) | Spark puts NULLs **first** in ASC — a `ROW_NUMBER() ... ORDER BY ts` dedup behaves differently across engines |
| Window frame | with `ORDER BY`, default frame is `RANGE ... CURRENT ROW` → ties are included | running totals over duplicate timestamps double up; use `ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW` |
| `count(DISTINCT a, b)` | not supported in Trino → `count(DISTINCT ROW(a, b))` or `count(DISTINCT concat(a,'|',b))` | copying Spark/MySQL syntax |
| `GROUP BY 1,2` | supported | fine, but name columns in pipeline tables |
| Identifiers | double quotes `"col"`; single quotes are strings | backticks are Spark/MySQL |
| `LIKE` escaping | `LIKE '%\_%' ESCAPE '\'` | unescaped underscore matches any char |
| Decimal | `DECIMAL(18,2)` arithmetic is exact; `DOUBLE` is not | summing money in DOUBLE then comparing to finance → cents off |

## 3. Partition discipline

Typical platform tables are partitioned by a date column (confirm the name
with the user — e.g. `grass_date`, `dt`, `partition_date`) and sometimes a
region column. Rules:

- Filter the partition column with a **typed literal or a constant
  expression**, directly: `WHERE grass_date BETWEEN DATE '2026-10-01' AND
  DATE '2026-10-07'`. Not `date_format(grass_date, ...) = ...`, not
  `CAST(grass_date AS VARCHAR) LIKE '2026-10%'`.
- Put the partition filter in **every** subquery/CTE that reads the table,
  not just the outer query — Presto pushes predicates down well, but
  through joins and window functions it often cannot.
- A join to a partitioned dimension also needs its own partition filter
  (`AND d.grass_date = DATE '…'`) — the most common full-table scan in
  pipelines is a dimension joined without its snapshot date.
- Scan-size check before running anything heavy: `EXPLAIN` (look for the
  TableScan partition count / "fully pruned") or, for Hive-connector
  tables, query the `"<table>$partitions"` meta table to see what you'd
  touch.
- Snapshot vs event: for a snapshot table, "latest state" = `grass_date =
  <one day>`. For an event table, "latest state per key" = `max_by` or
  `ROW_NUMBER() OVER (PARTITION BY key ORDER BY event_ts DESC)` across
  the window — scanning the whole window.

## 4. Joins & skew

- Presto hash-joins: the **right** side is built in memory, the left is
  streamed. Without CBO stats, put the **smaller table on the right**.
  With the CBO (`join_reordering_strategy=AUTOMATIC`, `ANALYZE TABLE`
  stats present) order matters less — but stats are frequently missing on
  freshly written pipeline tables, so still write it right.
- Pre-aggregate before joining: join a `(key, metric)` CTE, not raw
  events.
- Skew: hot keys (one giant merchant, hub, or `NULL`) → one worker lags.
  Fixes, in order: (1) filter NULL / sentinel keys out of the join and
  union them back; (2) split the hot key into its own branch with a
  broadcast-sized right side; (3) salt: add `mod(rand_id, N)` to the hot
  side and explode the small side N times.
- Fan-out: a join that returns more rows than the left side is almost
  always a grain error. Check with `SELECT COUNT(*), COUNT(DISTINCT
  left_key)` on the joined result.
- Anti/semi joins: prefer `NOT EXISTS` / `EXISTS` over `NOT IN (subquery)`
  — `NOT IN` with a NULL in the subquery returns nothing, silently.
- Dynamic filtering (Trino) and `LEFT JOIN … WHERE right.col IS NULL`
  are fine; `WHERE right.col = 'x'` after a `LEFT JOIN` turns it into an
  INNER join — a classic requester mistake worth calling out.

## 5. Memory & distributed gotchas

- `ORDER BY` without `LIMIT` on a big result → single-node sort. Pipelines
  never need global order; drop it.
- `COUNT(DISTINCT x)` over hundreds of millions of rows → consider
  `approx_distinct` for monitoring, exact only where the number is
  contractual.
- `array_agg` / `map_agg` / `listagg` over a hot group can exceed per-row
  limits — cap with a window filter first.
- Many `COUNT(DISTINCT …)` in one `SELECT` → Presto expands each into its
  own aggregation; use `GROUPING SETS` or pre-deduplicate once.
- Nested data (`ROW`, `MAP`): select only the fields you need —
  dereference pushdown works on Parquet/ORC; `SELECT *` on nested
  columns reads everything.
- Resource groups and query queues: a step that waits 20 minutes in queue
  is not "slow SQL". Check the UI/`system.runtime.queries` state
  (`QUEUED` vs `RUNNING`) before tuning the query.
- Writes: many small output files hurt the next reader. Writer count is
  controlled by session properties (`task_writer_count` / scale writers);
  for a daily partition aim for tens, not thousands, of files.

## 6. Pipeline step patterns (Presto-first, step-by-step)

A pipeline on this platform is a DAG of SQL steps; each step = one table
(or partition) materialised. Design each step so that **re-running it for
a date produces exactly the same partition** (idempotent) and **running
it for 30 dates in a loop is feasible** (backfillable).

### Step template

```sql
-- [Presto] step: <layer>_<entity>_daily  | grain: one row per (grass_date, hub_id)
-- inputs: <schema>.<fact> (event, partition grass_date), <schema>.<dim_hub> (snapshot)
-- idempotency: partition grass_date = ${run_date} is fully replaced
-- (1) make the target partition empty — choose ONE per platform:
--     Trino/Hive: SET SESSION hive.insert_existing_partitions_behavior = 'OVERWRITE';
--     or DELETE FROM <target> WHERE grass_date = DATE '${run_date}';   -- whole-partition delete only
--     or the workflow tool's "overwrite partition" option (ask the user which exists)
INSERT INTO <schema>.<target>
WITH src AS (
  SELECT ...
  FROM <schema>.<fact>
  WHERE grass_date = DATE '${run_date}'          -- partition filter, typed literal
    AND is_test = FALSE
), dim AS (
  SELECT hub_id, hub_name, region
  FROM <schema>.<dim_hub>
  WHERE grass_date = DATE '${run_date}'          -- snapshot date on the dimension too
)
SELECT
  s.hub_id,
  d.hub_name,
  COUNT(*)                                        AS parcels,
  COUNT_IF(s.first_attempt_success)               AS fas_parcels,
  CAST(COUNT_IF(s.first_attempt_success) AS DOUBLE) / NULLIF(COUNT(*), 0) AS fas_rate,
  DATE '${run_date}'                              AS grass_date  -- partition column LAST
FROM src s
LEFT JOIN dim d ON s.hub_id = d.hub_id
GROUP BY s.hub_id, d.hub_name;
```

### Layering (keep it boring)

```
raw/ingested  →  staging (typed, deduped, one grain)  →  core (joined, enriched)
             →  mart (aggregates per consumer)  →  publish (sheet/dashboard extract)
```

Each layer has one job; a step that both dedups and aggregates is the one
that will be wrong at 2 a.m. Dedup once, in staging, with an explicit
rule (`ROW_NUMBER() ... ORDER BY updated_at DESC, id`) and a tie-breaker.

### Quality gates as steps

Add a SQL step after every core/mart step that fails the workflow when:
- row count for the partition is 0 or deviates > X% from the trailing
  7-day median,
- the grain key is not unique,
- a critical column's NULL ratio exceeds a threshold,
- the partition is missing in an upstream table (readiness check before,
  not after).

Write the check so that its result is a single row with `pass boolean,
detail varchar` — easy to alert on.

### Backfill rules

- Parameterise everything by `${run_date}`; never `CURRENT_DATE` inside a
  step (it breaks reruns).
- Document the max safe backfill batch (partitions × scan size) so nobody
  launches 365 steps at once into the queue.
- Downstream steps must be re-run for the same dates — list them in the
  step header.

## 7. Diagnosis workflow for a slow or failing step

1. **Queued or running?** UI / `system.runtime.queries`. Queued → cluster
   capacity/resource group, not SQL.
2. **Failed with what?** "Exceeded per-node memory" → section 5 fixes.
   "Query exceeded max time" → scan size or skew. "Cannot cast" → `TRY_CAST`
   at staging.
3. `EXPLAIN ANALYZE` (Trino) / `EXPLAIN (TYPE DISTRIBUTED)`: find the
   stage with the largest input rows or wall time; check whether the
   TableScan shows the partition count you expect.
4. Measure, don't guess: run the heaviest CTE alone with the same filters,
   compare rows in vs rows out at each stage.
5. Fix the biggest lever first: partition pruning → join side/order →
   pre-aggregation → skew handling → approximation.
6. Re-verify the numbers after the rewrite (section 8) — a faster wrong
   query is a regression.

## 8. Verification snippets

```sql
-- [Presto] grain uniqueness
SELECT COUNT(*) AS rows_, COUNT(DISTINCT key_col) AS keys_,
       COUNT(*) - COUNT(DISTINCT key_col) AS dup_rows
FROM <schema>.<table> WHERE grass_date = DATE '…';

-- [Presto] partition freshness / row profile
SELECT grass_date, COUNT(*) AS n
FROM <schema>.<table>
WHERE grass_date >= date_add('day', -14, CURRENT_DATE)
GROUP BY 1 ORDER BY 1 DESC;

-- [Presto] reconcile against a trusted number
SELECT SUM(parcels) FROM <schema>.<mart> WHERE grass_date = DATE '…';
-- expected ≈ <number the requester already trusts>; explain any gap > 0.5%

-- [Presto] join fan-out check
SELECT COUNT(*) AS joined_rows, COUNT(DISTINCT l.key) AS left_keys
FROM l LEFT JOIN r ON l.key = r.key WHERE …;
```
