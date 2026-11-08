# Clarification protocol

Purpose: turn a vague data request into a brief so precise that two
engineers would write the same query from it. The protocol is the main
reason this skill beats a fast answer — most wrong numbers in a data org
come from an unasked question, not from a bug.

## Why "no assumptions" is a rule, not a preference

- The cost of one clarifying question is a minute of the requester's time.
  The cost of a wrong assumption is a wrong dashboard that a director acts
  on, then a week of re-work and lost trust in the data team.
- Column names lie. `delivered_time`, `is_active`, `order_amount` each
  have 3–5 plausible meanings on any real platform (gross vs net, incl.
  cancelled or not, first vs latest attempt, local vs UTC).
- Requesters usually ask for a *proxy* of what they need ("give me daily
  parcels per hub") when the decision is something else ("do we need more
  couriers in Hub X next month"). The real question often changes the
  grain, the window, and whether a forecast is needed.

## The intake sequence

1. **Restate** in one sentence: "Tôi hiểu là bạn cần … để quyết định …".
2. **Classify**: one-off answer / recurring report / pipeline change /
   debugging / design review / code help. The class decides which
   questions matter.
3. **Ask the deciding questions** (3–5 per turn, highest-leverage first).
   Closed questions → tappable options (`ask_user_input_v0`) when
   available. Open questions → prose, one line each.
4. **Repeat** until every field of the Request Brief is filled or
   explicitly marked "not needed".
5. **Confirm the brief** back to the requester before writing code.

If the requester insists on skipping ("cứ làm đi"), proceed with a
numbered **Assumptions** list at the top of the answer, build the smallest
safe version, and name the single assumption that most likely breaks it.

## Question bank (pick what the request leaves open)

### Intent
- What decision or action will this number drive? Who consumes it?
- Is there an existing report/number this must reconcile with? What is
  that number today?
- One-off, or will it run again (daily/weekly)? Deadline?

### Metric definition
- Exact definition in words: numerator, denominator, inclusions and
  exclusions (cancelled, test accounts, returns, internal orders…).
- Count of what — orders, parcels, AWBs, attempts, shipments? One can
  map to many.
- For rates: computed per row then averaged, or sum/sum? (Almost always
  sum/sum — but ask.)

### Grain
- One row per what? (day × hub, day × courier × hub, parcel…)
- Should the key be unique in the output? If a parcel changes hub, which
  hub owns it?

### Time
- Window: calendar dates, rolling N days, or a campaign period? Inclusive
  boundaries?
- Which timestamp defines "the day": created, picked up, delivered,
  updated? Event time or snapshot date (`grass_date`-style partition)?
- Timezone: local (e.g. Asia/Ho_Chi_Minh, Asia/Jakarta) or UTC? Are
  source timestamps already local?
- Late data: is "yesterday" final at 00:05, or do statuses keep updating
  for days? Does the number need to be re-stated?

### Sources
- Which table is the source of truth for each entity? Is there a certified
  / published layer the requester already trusts?
- Snapshot table (one row per entity per day) or event/log table (one row
  per change)? Append-only or overwritten?
- Known data-quality issues, backfills, schema changes in the window?

### Filters & segments
- Region / country / business unit / service type filters?
- Breakdowns needed (by hub, lane, courier type)? Top-N cutoffs?

### Output
- Format and destination: table on the platform, notebook result,
  Google Sheet (mind quotas), dashboard, CSV, a number in chat?
- Column list and naming, sort order, rounding, currency.
- For pipelines: schedule, upstream dependency, SLA, who gets alerted.

### Access & constraints
- Does the requester already have access to the sources? Do you? If not,
  the first deliverable is the access request, not the SQL.
- Any PII or restricted columns involved? Output destination allowed for
  that classification?

## Request Brief (the stop condition)

Fill this and confirm it before writing production SQL. A copy lives in
`assets/request_brief_template.md`.

```
REQUEST BRIEF
Decision / purpose:
Consumer(s) & deadline:
Type: one-off | recurring (schedule) | pipeline change | debug | review
Metric(s): name — plain-language definition — numerator/denominator — exclusions
Grain: one row per …; unique key = …
Window: from … to … (inclusive?); defining timestamp = …; timezone = …
Late data / restatement policy:
Sources: <schema>.<table> (snapshot|event, partition col, freshness) …
Filters / segments:
Output: destination, columns, format, sort
Reconciles with: <existing number/report> (expected value ≈ …)
Access / sensitivity:
Open risks / assumptions:
```

## Batching and tone

- Group questions by theme; never more than 5 in one turn. Lead with the
  one whose answer changes the query the most (usually grain or
  defining timestamp).
- Explain *why* you ask when it isn't obvious — "hỏi timezone vì bảng này
  lưu UTC, lệch 7 tiếng sẽ đẩy ~30% đơn sang ngày khác" — this teaches the
  requester to pre-answer next time.
- Offer defaults when you can: "Mặc định tôi sẽ lấy theo delivered_time
  local, trừ cancelled — đúng không?" A good default plus a yes/no is
  faster than an open question and still not an assumption.
- Never make the requester feel interrogated: one short paragraph of
  context, then the questions.
