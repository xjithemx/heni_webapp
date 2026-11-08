# Pipeline, flow & system review — the systematic method

Contents: 1. The six-layer review · 2. Failure-mode catalogue ·
3. Designing a new workflow step by step · 4. Enhancement ladder ·
5. Review output format

Use this for "review my pipeline", "why does this step fail", "design a
flow for X", "improve this workflow", or when a data request turns out to
be a recurring need.

## 1. The six-layer review (walk all six, in order)

| Layer | Question | What "good" looks like |
|---|---|---|
| **Intent** | What decision does the output serve? Who owns the metric definition? | Written definition, named owner, one consumer list |
| **Grain** | One row per what, at every step? Where does grain change? | Each table states its grain; unique key enforced by a check |
| **Sources** | Snapshot or event? Partition column? When is upstream final? Any shadow sources (sheets, notebooks)? | Certified upstream, readiness check before the step, no shadow inputs |
| **Transform** | Where are dedup, joins, filters, windows? Fan-out risk? Timezone handling? NULL semantics? | Dedup once in staging; joins on declared keys; explicit TZ; `NULLIF` on denominators |
| **Output** | Idempotent per partition? Backfillable? File layout? Schema stable? | Partition overwrite; `${run_date}` param; tens of files per partition |
| **Operate** | Schedule, SLA, alerts, cost (bytes scanned), ownership, docs, lineage | Quality gate step, alert on fail + on anomaly, runbook, step header comments |

At each layer, write down one of: ✅ sound (and why — the requester
should know what to keep), ⚠️ risk (what would go wrong, under what
condition), ❌ flaw (wrong now; 3-row example; fix).

## 2. Failure-mode catalogue (look for these specifically)

**Logic**
- Grain mismatch: joining daily snapshot to event rows → metrics ×N.
- Filter after LEFT JOIN on the right table → silent INNER JOIN.
- `NOT IN` with NULLs → empty result.
- Average of ratios instead of ratio of sums → hub with 2 parcels counts
  like a hub with 20,000.
- Status snapshot used as event: "delivered today" computed from today's
  status table counts parcels delivered last week.
- Late-arriving updates: yesterday's partition changes for 3 days →
  dashboard restates; nobody told the consumer.
- Timezone: UTC storage, local reporting → ~25–30% of events sit in the
  wrong day near midnight; worse across SEA regions.
- Dedup without a tie-breaker → nondeterministic results between reruns.
- `arbitrary()` / `first()` on a column that matters.
- Currency / unit mixing across regions.

**Data & infra**
- Dimension joined without its snapshot date → full scan + wrong
  attributes for historical dates.
- Partition filter wrapped in a function → full scan.
- Missing upstream-readiness check → step runs on a half-loaded partition
  and "succeeds".
- Non-idempotent step (`INSERT` append) → duplicates after every retry.
- `CURRENT_DATE` inside the step → backfill writes today's data into old
  partitions.
- Shadow pipeline in a notebook or sheet feeding a production number.
- Thousands of small files → every downstream read slows.
- Skewed key → one worker, 10× runtime, flaky timeouts.
- No row-count/uniqueness gate → wrong numbers ship silently.

**Process**
- Metric defined in SQL only, not in words → three teams, three numbers.
- No owner → nobody fixes it when it breaks.
- Access granted per person, not per role → the pipeline dies when the
  owner leaves.
- Manual steps (download CSV, paste into sheet) inside a "pipeline".

## 3. Designing a new workflow step by step

1. **Brief** (from `clarification_protocol.md`) — decision, metric, grain,
   window, sources, output, schedule, SLA.
2. **Grain map** — list each step's output grain and unique key; the
   first place the grain is wrong is the design bug.
3. **Source readiness** — for each source: partition column, when it is
   final, how to detect completeness (row count vs expected, a marker
   partition, upstream workflow success). Readiness checks are step 0.
4. **Step list** — one table per step, layered staging → core → mart →
   publish. For each: dialect (Presto by default), inputs, filters,
   idempotency mechanism, expected scan size, expected runtime.
5. **Quality gates** — after core and mart: row count band, key
   uniqueness, NULL ratio on critical columns, reconciliation to a
   trusted number if one exists.
6. **Backfill plan** — parameterised by date, documented batch size,
   list of downstream steps to re-run.
7. **Operate** — schedule relative to upstream, alert routing, runbook
   (what to do on each failure type), owner, docs in the step header.
8. **Publish** — how consumers get it (table, dashboard, sheet via the
   approved connector), with the restatement policy written down.
9. **AI extension point** — see `ai_extension.md`: where an agent can
   draft steps, generate gates, explain anomalies, or answer "why did it
   change" from lineage.

## 4. Enhancement ladder (improve, don't rewrite)

Order by impact ÷ risk:

1. Add the missing quality gate (cheapest, catches the most).
2. Fix idempotency and `${run_date}` parameterisation.
3. Partition pruning in every read; snapshot date on every dimension.
4. Dedup once in staging with a deterministic rule.
5. Pre-aggregate before joins; fix join side/order; handle the hot key.
6. Split a monolithic step into layers so failures localise.
7. Move a notebook/sheet shadow input into the ingestion system.
8. Replace exact with approx where the consumer accepts it (monitoring,
   not finance).
9. Only then: engine change (Presto → Spark) for the step that still
   cannot finish.

Each rung: state the expected effect (bytes scanned −X%, runtime −Y,
incident class removed) and the verification that proves it.

## 5. Review output format

```
## Tổng quan — one paragraph: what the flow does, what it serves, overall verdict
## Điểm tốt (giữ lại) — 2–4 bullets, each with WHY it is good
## Flaw points — table: # | layer | flaw | evidence (3-row example or query) | fix | severity
## Risks — things not wrong yet
## Enhancement plan — ladder-ordered, each with effect + verification
## AI extension — one concrete place, with guardrail
## Coach note — the principle to carry forward
```
