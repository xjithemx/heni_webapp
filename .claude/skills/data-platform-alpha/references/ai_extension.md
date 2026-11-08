# AI extension points — where an LLM/agent earns its keep on this platform

Every answer ends with one. Make it specific to the request, feasible
inside the security boundary, and honest about the guardrail. The goal
is to turn each solved request into a reusable capability, not to bolt
"use AI" onto the end.

Contents: 1. Menu of extension points · 2. Guardrails that keep it inside
the boundary · 3. Patterns (how to build each) · 4. How to phrase it

## 1. Menu — pick the one that fits the request

| Request type | AI extension point | Value |
|---|---|---|
| Ad-hoc metric question | **Request-intake agent**: runs this skill's clarification protocol, produces the Request Brief, checks a metric glossary before anyone writes SQL | fewer wrong numbers, faster turnaround |
| Repeated similar questions | **Semantic layer + NL-to-SQL** with a curated set of certified tables, metric definitions, and templated SQL; LLM fills parameters, never free-form joins | self-serve for business users without free-form SQL risk |
| Pipeline step design | **Step scaffolder**: from the brief + table schemas (from the catalog), drafts the layered steps, headers, idempotency clause, and quality gates in Presto SQL | consistent structure, gates never forgotten |
| Code review | **SQL reviewer agent** that runs `scripts/sql_sanity_check.py` plus the failure-mode catalogue and comments with flaw-point format (name / example / fix) | catches the 80% mechanical mistakes before a human reviews |
| Data-quality incident | **Anomaly explainer**: given the failing gate, the lineage, and recent upstream row counts, ranks likely causes and proposes the diagnostic queries | minutes to triage instead of hours |
| "Why did the number change?" | **Lineage + diff narrator**: compares two runs' partitions and the step SQL diff, writes the change note for the consumer | trust, fewer Slack threads |
| Documentation debt | **Auto-doc**: generates table/step docs (grain, sources, definition in words) from SQL + header comments, for human approval | metric defined in words, not only in SQL |
| Notebook sprawl | **Notebook → pipeline promoter**: detects notebooks run on a schedule, extracts the SQL, drafts the steps and the access request | kills shadow pipelines |
| Monitoring | **Gate rule suggester**: proposes thresholds from the trailing distribution; **alert summariser** that groups failures by root cause | alert fatigue down |
| Sheet delivery | **Publish agent** that batches writes, respects quotas, and posts the reconciliation number with the sheet link | fewer 429s, auditable output |

## 2. Guardrails (non-negotiable)

- **Data stays in the platform.** The LLM sees schemas, SQL, metric
  definitions, row counts, and aggregates — not row-level restricted
  data — unless the platform provides an approved internal model
  endpoint. Say which case applies.
- **Human approval on anything that writes**: agents draft steps, open
  access requests, propose alerts; a person merges, approves, deploys.
- **Access is inherited, never widened**: an agent acts with the
  requester's permissions through the internal access system; no shared
  super-token.
- **Determinism where it matters**: templated SQL with parameters for
  production; free-form generation only for exploration, always run with
  `LIMIT` and `EXPLAIN` first.
- **Verification is part of the agent's output**: the generated SQL ships
  with its grain check and reconciliation query, same as a human's.
- **Logging**: prompts, generated SQL, and who approved — the audit trail
  the security team will ask for.

## 3. Patterns

**Semantic-layer NL-to-SQL (the safe kind)**
```
user question → classify (which metric, grain, window, segment) → look up
certified definition → fill a templated Presto query → EXPLAIN + LIMIT run →
show SQL + result + definition → user confirms → full run
```
The model never writes joins; it selects a template and parameters. Add
a "cannot answer with certified metrics — route to a human" branch.

**Step scaffolder via Claude Code / an agent with MCP**
Inputs: Request Brief, schemas (from the catalog connector), this skill's
`presto_trino_playbook.md` §6 template. Output: a PR with `NN_step.sql`
files, headers, gates, and a backfill script. Reviewer = this skill in
review mode.

**Anomaly explainer**
Inputs: failing gate row, step lineage (upstream tables + their partition
row counts for 7 days), last SQL change. Prompt it to rank 3 hypotheses
and write one diagnostic query per hypothesis; a human runs them.

**Reviewer bot**
Run the sanity script, then the catalogue; output in the flaw-point
format; severity-tagged; never auto-approves.

## 4. How to phrase it in an answer

One to four sentences for a quick request; a short section for design
work. Always: *where* (the step/moment), *what the agent does*, *what
stays human*, *the guardrail*.

> **AI extension:** chỗ đáng tự động hoá nhất ở request này là bước
> clarify — một intake agent chạy đúng bộ câu hỏi grain/window/timezone
> và trả về Request Brief trước khi DA mở editor. Guardrail: agent chỉ
> đọc glossary + schema, không chạm dữ liệu dòng; brief vẫn do requester
> confirm.
