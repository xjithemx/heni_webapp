# Spark SQL / PySpark playbook — when Presto is not enough

Contents: 1. When to use Spark here · 2. Presto → Spark translation table ·
3. Performance (AQE, shuffle, skew, broadcast) · 4. Writing tables
idempotently · 5. Livy session hygiene · 6. PySpark patterns ·
7. Diagnosis

## 1. When to use Spark on this platform

Presto is the default. Reach for Spark when:
- the transform is multi-stage and heavy (several wide joins + windows
  over months of events) and Presto fails on memory or time after the
  tuning in `presto_trino_playbook.md` §5–7;
- you need UDFs, complex nested manipulation, or Python libraries
  (geospatial, ML feature prep);
- the output is huge and needs controlled file layout (repartition before
  write);
- the logic is iterative (loops over dates/keys) and must run inside one
  job.

Say explicitly in the answer why Spark and not Presto; the cost is a
second engine for the team to operate and a Livy session to babysit.

## 2. Presto → Spark translation table (the mistakes that survive copy-paste)

| Concept | Presto/Trino | Spark SQL |
|---|---|---|
| Integer division | `7/2 = 3` | `7/2 = 3.5`; integer division is `7 div 2` |
| Division by zero | error | NULL (non-ANSI) / error (ANSI mode, default in Spark 4) — ask which Spark version |
| Invalid cast | error (`TRY_CAST` to soften) | NULL silently (non-ANSI) — NULLs appear instead of failures; `try_cast` exists in 3.2+ |
| Date add/diff | `date_add('day', 7, d)`, `date_diff('day', a, b)` | `date_add(d, 7)`, `datediff(end, start)` |
| Date format/parse | `%Y-%m-%d` tokens | Java patterns `yyyy-MM-dd`; `to_date`, `to_timestamp`, `unix_timestamp`, `from_unixtime` → **string** |
| Current time | `now()`, `current_date` | `current_timestamp()`, `current_date()` |
| Timezone | `AT TIME ZONE 'Asia/Ho_Chi_Minh'` | `from_utc_timestamp(ts, 'Asia/Ho_Chi_Minh')`; session `spark.sql.session.timeZone` |
| String position | `strpos`, `split_part` | `instr`, `locate`, `substring_index`, `split(s, ',')` (regex!) |
| JSON | `json_extract_scalar` | `get_json_object(j, '$.a')`, `from_json(j, schema)` |
| Arrays | `UNNEST`, `cardinality`, `filter(arr, x -> …)` | `explode`/`LATERAL VIEW explode`, `size`, `filter(arr, x -> …)`, `collect_list`, `collect_set` |
| Approx | `approx_distinct`, `approx_percentile` | `approx_count_distinct`, `percentile_approx` |
| Handy aggs | `count_if`, `max_by`, `arbitrary` | `count_if`, `max_by` (3.0+), `first`/`any_value` (non-deterministic) |
| NULL sort order | ASC → NULLs last | ASC → NULLs **first** (dedup with `ROW_NUMBER ... ORDER BY ts DESC` behaves the same, but `ORDER BY ts ASC` picks NULLs first) |
| Identifiers | `"col"` | `` `col` `` |
| `count(DISTINCT a, b)` | not supported | supported |
| Overwrite partition | session property / DELETE + INSERT | `INSERT OVERWRITE TABLE t PARTITION (dt='…') SELECT …`; dynamic: `spark.sql.sources.partitionOverwriteMode=dynamic` |
| Hints | none in SQL | `/*+ BROADCAST(d) */`, `/*+ REPARTITION(200, key) */`, `/*+ COALESCE(10) */` |

Window frame defaults (RANGE with ORDER BY) are the same in both — the
running-total-over-ties bug exists in both engines.

## 3. Performance

**Adaptive Query Execution (AQE)** — on by default since Spark 3.2; verify
with `spark.conf.get("spark.sql.adaptive.enabled")`. It coalesces shuffle
partitions, switches sort-merge → broadcast when a side turns out small,
and splits skewed partitions (`spark.sql.adaptive.skewJoin.enabled`).
Most "tune shuffle partitions" advice from 2019 is obsolete with AQE on;
set `spark.sql.shuffle.partitions` only as an upper bound for the first
stage.

**Broadcast**: dimensions under ~a few hundred MB → `/*+ BROADCAST(d) */`
or raise `spark.sql.autoBroadcastJoinThreshold`. Broadcasting a table that
doesn't fit the driver kills the session — check size first.

**Skew** (one task runs 10× longer): AQE skew join handles the join case;
for `GROUP BY` on a hot key use two-stage aggregation (salt → aggregate →
re-aggregate). For NULL-heavy join keys, filter NULLs out and union back
(same as Presto).

**Shuffle avoidance**: filter and project before joins; avoid `DISTINCT`
on wide rows; use `dropDuplicates([key])` with explicit ordering via
`ROW_NUMBER` instead (nondeterministic otherwise).

**Caching**: `df.cache()` only when the same DataFrame feeds ≥2 actions
in the same session; unpersist after. Caching a 500 GB frame "to be safe"
is a classic session killer.

**Small files**: before writing, `df.repartition(n, "partition_col")` or
`/*+ REPARTITION(n) */` so each output partition has a sane file count;
`coalesce` when reducing without a shuffle.

**Partition pruning**: same rule as Presto — literal filter on the
partition column, in every read.

## 4. Writing tables idempotently

```sql
-- [Spark SQL] overwrite only the run date's partition
SET spark.sql.sources.partitionOverwriteMode = dynamic;
INSERT OVERWRITE TABLE <schema>.<target>
SELECT ..., DATE('${run_date}') AS grass_date
FROM ...
WHERE grass_date = DATE('${run_date}');
```

```python
# [PySpark]
(df.repartition(16, "grass_date")
   .write.mode("overwrite")
   .insertInto("<schema>.<target>"))   # requires partitionOverwriteMode=dynamic, column order must match table
```

Pitfalls: `mode("overwrite")` with `saveAsTable` and static overwrite mode
wipes **all** partitions; `insertInto` is positional — a column reorder
silently writes the wrong data. Always `spark.table(target).limit(5)` and
a count after writing.

## 5. Livy session hygiene (Jupyter → Livy → Spark)

- Configure **before** the session starts: `%%configure -f {"driverMemory":
  "4g", "executorMemory": "8g", "executorCores": 4, "numExecutors": 10,
  "conf": {"spark.sql.adaptive.enabled": "true"}}`. Changing config
  afterwards restarts the session.
- Right-size: ask for what the job needs, not the cluster max — Livy
  sessions hold executors while idle, and shared queues starve.
- `%%sql -o df -n 1000` (sparkmagic) pulls at most 1000 rows to the
  local pandas side — use it; pulling a full result to the notebook pod
  is where notebooks die. `-q` to skip rendering.
- Sessions time out when idle (platform-specific; ask). Save intermediate
  results to a table, not to session memory, if the work spans hours.
- `%spark cleanup` / delete sessions when done; orphaned sessions are
  the number-one source of "no resources available" tickets.
- Logs: `%spark logs` or the Spark UI link the platform exposes; the
  stage with high shuffle read/spill is the culprit.

## 6. PySpark patterns worth copying

```python
# [PySpark] dedup with an explicit, deterministic rule
from pyspark.sql import Window, functions as F
w = Window.partitionBy("parcel_id").orderBy(F.col("updated_at").desc(), F.col("event_id").desc())
latest = (events.filter(F.col("grass_date") == run_date)
                .withColumn("rn", F.row_number().over(w))
                .filter("rn = 1").drop("rn"))

# [PySpark] safe rate
F.col("num") / F.when(F.col("den") == 0, None).otherwise(F.col("den"))

# [PySpark] loop over dates for a backfill, one partition at a time
for d in dates:
    spark.sql(step_sql.format(run_date=d))
    n = spark.table(target).filter(F.col("grass_date") == d).count()
    assert n > 0, f"empty partition {d}"
```

## 7. Diagnosis

1. Spark UI → Stages: which stage dominates? Shuffle read/spill size?
   Task time skew (max vs median)?
2. `df.explain(mode="formatted")` (3.0+): look for `Exchange` (shuffle),
   `BroadcastHashJoin` vs `SortMergeJoin`, `PartitionFilters` on the scan.
3. Executors tab: OOM → memory per executor vs partition size; many
   dead executors → raise memory or reduce partition size, not more cores.
4. Driver OOM → `collect()`/`toPandas()`/broadcast too large.
5. Fix the biggest lever, re-run, **re-verify the numbers**.
