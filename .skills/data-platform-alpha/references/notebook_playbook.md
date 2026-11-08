# Notebook playbook — Python-on-k8s and Spark-via-Livy, inside the security boundary

Contents: 1. Choosing the base · 2. Pulling data without killing the pod ·
3. Security model · 4. Google service accounts & API quotas ·
5. Notebook → pipeline promotion · 6. Notebook structure & reproducibility

## 1. Choosing the base

| | Python kernel on Kubernetes | Spark kernel via Livy |
|---|---|---|
| Compute | the pod (CPU/RAM limit set by the platform) | the Spark cluster; pod only holds the client |
| Data path | Presto client → result set → pandas/pyarrow | Spark reads storage directly; `%%sql -o` brings a sample back |
| Best for | ad-hoc pulls ≤ a few million rows, pandas/plots, Google API delivery, light ML | heavy transforms, large joins, feature pipelines, writing big tables |
| Ceiling | pod memory (pandas ≈ 5–10× the on-disk size) | driver memory for anything collected; session quotas |
| Failure mode | kernel dies silently at the memory limit | session lost on idle timeout / OOM; orphaned sessions |

Rule: **compute in the engine, bring back only the answer.** If the
notebook needs more than ~1 GB of data in memory, the request is either a
pipeline step or a Spark job, not a notebook.

Ask the user which base they are on if the question depends on it
(memory, library availability, how Presto is reached).

## 2. Pulling data without killing the pod

Do not invent the internal client's API; ask what module they use
(`presto-python-client`/`trino` package, an internal SDK, `%sql` magic).
The patterns below are client-agnostic.

- Aggregate in SQL first. `SELECT grass_date, hub_id, COUNT(*)` beats
  pulling parcels and `groupby` in pandas by 1000× in bytes.
- Always `LIMIT` while developing; remove it deliberately, once.
- Chunk by partition: loop over dates, fetch one partition, append to a
  list of frames, `pd.concat` at the end — or better, write the loop's
  output back to a scratch table and read the aggregate.
- Use typed, narrow columns: cast in SQL, `SELECT` only needed columns,
  `category` dtype for low-cardinality strings in pandas, `pyarrow` for
  large frames.
- Check memory before you need to: `df.memory_usage(deep=True).sum()/1e9`.
- Long queries: run them as a pipeline step or scheduled job and read the
  result table; a notebook cell blocked for 40 minutes is a lost
  session waiting to happen.
- Never paste result data into chat or files outside the platform.

## 3. Security model (the platform's, not yours)

The platform has its own system that governs **ingestion** (what sources
can be loaded, by whom) and **access** (who can read which table/column,
from which surface). Treat it as the law:

- If a query fails with permission denied → the deliverable is the access
  request (which table, which purpose, which duration), not a workaround.
- Do not suggest: copying restricted tables into a personal schema,
  exporting to a personal Drive/laptop, sharing another user's token,
  reading from the storage layer directly to skip table ACLs, or asking a
  colleague with access to "just run it".
- Credentials and tokens come from the platform's injected environment /
  secret mounts. Code never contains them; notebooks never print them;
  `os.environ[...]` reads are fine, hard-coded strings are not.
- Ingesting a new source (CSV from a vendor, a Google Sheet, an API) goes
  through the ingestion system → a landing table → the pipeline. A
  notebook that reads a sheet and writes a production table is a shadow
  pipeline — call it out and propose the proper path.
- Sensitive columns (PII, finance): confirm the output destination is
  approved for that classification before building the extract. Default
  to aggregates and masking.
- Audit: write the purpose in the notebook header and in the access
  request; the person who asks "why did you query that" is doing their job.

Never guess what the security system is called or how its UI works — say
"the internal access-request flow for <table>" and let the user fill in
the name.

## 4. Google service accounts & API quotas

Notebooks reach Google Sheets/Drive through a **small, shared pool of
service accounts**. That means two constraints at once:

1. **Few accounts** → a sheet must be shared with the specific SA the
   platform exposes; the SA is shared by many users, so your heavy job
   throttles someone else's dashboard refresh.
2. **Per-minute API quotas** (reads and writes are counted separately,
   per project and per user) → row-by-row writes in a loop are the
   failure, not the volume.

Patterns:
- One `batchUpdate` / `values.batchUpdate` per sheet, not one call per
  row or per cell. Prepare the whole 2-D array in pandas, write once.
- Clear-then-write the range in one request each; don't append in loops.
- Exponential backoff on `429`/`RESOURCE_EXHAUSTED` (`time.sleep(2**i)`),
  max 5 retries, then fail loudly.
- Keep sheets small: Sheets caps cells per workbook (millions, but
  formulas and formatting make it slow long before). A sheet is a
  delivery surface for ≤ ~50k rows; beyond that, deliver a table + a
  dashboard, or a CSV via the approved channel.
- Reads: pull a sheet once into a frame, cache it in the notebook, never
  re-read inside a loop.
- Scheduling: if the same sheet refresh runs daily, it belongs in a
  pipeline publish step with the platform's connector, not in a notebook
  someone must open.
- Clarify first: "limit" can mean quota errors, number of SAs, or which
  sheets the SA can see — ask which one the user is hitting.

## 5. Notebook → pipeline promotion

A notebook is an experiment; a pipeline is a promise. Promote when the
logic is run more than twice or someone else depends on the number:

1. Freeze the SQL: parameterise by `${run_date}`, remove `LIMIT`,
   remove `CURRENT_DATE`.
2. Split into steps by layer (staging → core → mart), each one table.
3. Add the quality-gate step (`presto_trino_playbook.md` §6).
4. Register in the workflow tool with upstream readiness checks.
5. Replace the notebook's body with a read of the mart table + the
   presentation layer (plots / sheet publish).
6. Delete the shadow version. One source of truth.

## 6. Notebook structure & reproducibility

```
Cell 0  — header: owner, purpose, decision it serves, sources, run_date param, access ticket id
Cell 1  — imports + config (env vars, no secrets), base check (k8s vs Livy)
Cell 2+ — one query per cell, each ending with a sanity print: rows, min/max date, key uniqueness
...     — transforms, each cell idempotent (re-runnable top to bottom)
Last    — outputs: where written, row count, a reconciliation number
```

- Restart kernel → run all must work. Hidden state (a variable from a
  deleted cell) is the most common "works on my notebook".
- Pin the assumptions as asserts: `assert df.parcel_id.is_unique`,
  `assert df.grass_date.max() == run_date`.
- Keep SQL in triple-quoted strings with the dialect in a comment on the
  first line; never build SQL with f-strings from untrusted input.
- Name outputs with the grain and date: `fas_by_hub_daily_2026-10-22`.
