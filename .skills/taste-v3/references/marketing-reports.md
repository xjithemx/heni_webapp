# Marketing Reports - Metrics, Blueprints, Visual Patterns

Use with `product-mode.md` (layout, KPI anatomy, report mode) and `charts-recharts.md` (chart mechanics). This file adds the **domain layer**: what a standard marketing report must contain so a CMO, growth lead or RevOps analyst trusts it.

Acronym interpretation (state yours in the Design Read if the user's org may differ):
- **MRD** = Marketing Requirements Document (a document, not a dashboard).
- **MER** = Marketing Efficiency Ratio = revenue ÷ total marketing spend. Some finance teams use "Marketing Expense Ratio" = spend ÷ revenue (the inverse). Ask once if unclear.
- **MRR** = Monthly Recurring Revenue (subscription businesses).
- **MQL** = Marketing Qualified Lead; "MQL report" = the lead funnel report.

## Contents
1. Metric dictionary (formulas)
2. Universal rules for marketing reports
3. Report blueprints (10 types)
4. Visual patterns with code (waterfall, funnel, cohort heatmap, pacing, model comparison, response curve, RAG scorecard)
5. MRD document template
6. Marketing Report Pre-Flight

---

## 1. Metric dictionary

Show the formula in the KPI definition tooltip (§5 of product-mode). Never relabel a metric without changing its formula.

**Efficiency and acquisition**
| Metric | Formula | Notes |
|---|---|---|
| MER (blended ROAS) | total revenue ÷ total marketing spend | Attribution-free, the "truth check" on platform ROAS. State revenue basis (gross/net of refunds, incl./excl. VAT) |
| aMER (acquisition MER) | new-customer revenue ÷ total marketing spend | Removes returning-customer revenue that marketing did not buy |
| ROAS | attributed revenue ÷ ad spend (per channel/campaign) | Depends on attribution model + window: always show both |
| CPA / CPL | spend ÷ conversions / spend ÷ leads | Name the conversion event |
| CAC (paid) | paid media spend ÷ new customers from paid | Lowest number, easiest to flatter |
| CAC (blended) | total marketing spend ÷ all new customers | Default for exec reports |
| CAC (fully loaded) | (marketing + sales spend incl. salaries, tools, agencies) ÷ new customers | Use for unit economics / board |
| CTR, CPC, CPM | clicks ÷ impressions; spend ÷ clicks; spend ÷ impressions × 1000 | Delivery metrics: diagnostic, never headline |
| CVR | conversions ÷ sessions (or clicks); name the denominator | |

**Value and unit economics**
| Metric | Formula | Notes |
|---|---|---|
| LTV (simple) | ARPA × gross margin % ÷ revenue churn rate (monthly) | Gross-margin based, never revenue-only |
| LTV (cohort) | cumulative gross profit per customer of a cohort at month N | Preferred when ≥ 12 months of data |
| LTV:CAC | LTV ÷ CAC (same CAC definition stated) | Rule of thumb ≥ 3:1 healthy; > 5:1 may mean under-investing |
| CAC payback | CAC ÷ (ARPA × gross margin %) in months | SMB SaaS benchmark < 12 mo, enterprise < 18-24 mo |

**Recurring revenue (MRR)**
| Metric | Formula |
|---|---|
| New MRR | MRR from customers whose first paid month is this month |
| Expansion MRR | MRR increase from existing customers (upgrade, seats, add-ons) |
| Contraction MRR | MRR decrease from customers who stay (downgrade) |
| Churned MRR | MRR lost from customers who cancelled |
| Reactivation MRR | MRR from previously churned customers returning |
| Net new MRR | new + expansion + reactivation − contraction − churned |
| Ending MRR | starting MRR + net new MRR (the bridge must reconcile) |
| ARR | MRR × 12 (recurring only, no one-off fees) |
| ARPA | MRR ÷ paying accounts |
| Logo churn | customers lost ÷ customers at start of period |
| Gross revenue churn | (contraction + churned) ÷ starting MRR |
| GRR | (starting MRR − contraction − churned) ÷ starting MRR, capped at 100% |
| NRR | (starting MRR + expansion − contraction − churned) ÷ starting MRR (cohort of starting customers only, no new) |
| Quick ratio | (new + expansion + reactivation) ÷ (contraction + churned); > 4 strong |

Normalisation rules to state: annual/quarterly plans divided into monthly MRR; discounts applied (MRR = what is billed recurring); trials and one-off fees excluded; FX converted at a fixed (budget) rate, with the rate disclosed.

**Lead funnel (B2B)**
| Stage | Definition to document |
|---|---|
| Lead / Inquiry | Any known contact (form, event, import) |
| MQL | Meets fit + engagement threshold (lead score ≥ X, ICP fit). Write the rule |
| SAL | Sales accepted the MQL within SLA (e.g. 24-48h) |
| SQL | Sales qualified (BANT/MEDDIC criteria met) |
| Opportunity | Pipeline record with amount and close date |
| Closed won | Booked revenue |
Derived: stage conversion (stage N+1 ÷ stage N), overall lead→won, **velocity** (median days in stage), MQL acceptance rate (SAL ÷ MQL), pipeline **sourced** (first touch marketing) vs **influenced** (any marketing touch before close), win rate, average deal size.

**Web, SEO, email**
| Metric | Formula / note |
|---|---|
| Sessions, users, engaged sessions (GA4) | Engaged = > 10s, or ≥ 2 pageviews, or a conversion. Engagement rate = engaged ÷ sessions |
| Landing-page CVR | key events ÷ sessions starting on that page |
| Organic impressions, clicks, CTR, avg. position | From Search Console; position is impression-weighted, lower is better |
| Delivered rate | delivered ÷ sent; bounce rate split hard/soft |
| Open rate | Inflated by Apple Mail Privacy Protection since 2021: treat as directional only |
| CTR (email) / CTOR | clicks ÷ delivered / clicks ÷ opens (CTOR also MPP-affected) |
| Unsubscribe, spam complaint rate | ÷ delivered; complaints must stay < 0.1% (Gmail/Yahoo sender rules cap at 0.3%) |
| Revenue per recipient (RPR) | attributed revenue ÷ delivered |

---

## 2. Universal rules for marketing reports

1. **Define the period and its basis.** Calendar vs fiscal; *cohort basis* (leads created in March, tracked to today) vs *period basis* (all MQLs that happened in March regardless of creation). Mixing them in one funnel produces conversion rates > 100%. Label every funnel with its basis.
2. **Disclose attribution** on every attributed number: model (last-click, first-click, linear, time-decay, position-based, data-driven) + lookback window (e.g. 7-day click / 1-day view). Platform-reported conversions double-count across platforms; their sum will exceed actual orders. Show MER or backend revenue next to platform ROAS.
3. **Incrementality caveat**: attributed ≠ caused. When decisions shift budget, reference lift tests, geo holdouts or MMM if they exist; otherwise say "correlational".
4. **Every KPI vs target and vs comparable period** (MoM, YoY for seasonal businesses; same weekday alignment for daily data; flag campaign peaks like 9.9, 11.11, Tet).
5. **Pacing beats month-end surprise**: month-to-date actual vs plan-to-date (linear or seasonally weighted) with end-of-month projection.
6. **Revenue basis stated**: gross vs net (refunds, cancellations, returns/RTS), tax incl./excl., currency + FX rate.
7. **Small numbers flagged**: rates on n < 30 shown greyed with the n; no RAG color on them.
8. **Source and freshness line** on every section: system (GA4, Ads, CRM, billing), extract time, timezone.
9. **RAG thresholds documented** (e.g. green ≥ 100% of target, amber 90-99%, red < 90%), and RAG is never the only cue (show the % too).
10. **Recommendations close the loop**: every exec-facing report ends with decisions/next actions, each tied to an owner and a metric.

---

## 3. Report blueprints

Each blueprint: purpose → audience/cadence → required scorecard → required visuals (top to bottom) → pitfalls.

### 3.1 MER / efficiency report
- **Purpose**: is total spend producing revenue efficiently? Audience: founder, CMO, finance. Weekly + monthly.
- **Scorecard**: MER, aMER, total spend, total revenue, new-customer revenue, blended CAC. Each vs target and vs prior period.
- **Visuals**: MER trend (weekly) with target band (`ReferenceArea` between floor and goal) → spend vs revenue by week (composed: bars spend, line revenue) → spend share by channel (100% stacked bar over time) → channel ROAS table *labelled with model + window*, beside MER → response curve (scatter weekly spend vs revenue, §4.6) to show diminishing returns.
- **Pitfalls**: comparing MER across periods with very different returning-customer mix (use aMER); including non-marketing revenue (B2B wholesale) silently.

### 3.2 MRR report
- **Purpose**: is recurring revenue growing and retained? Audience: CEO, finance, board. Monthly.
- **Scorecard**: ending MRR, net new MRR, ARR, NRR, GRR, logo churn, ARPA, quick ratio.
- **Visuals**: ending MRR and net new MRR vs plan (actual line, plan dashed, variance labels; §4.4 pattern for in-month) → MRR bridge waterfall starting → new → expansion → reactivation → contraction → churn → ending (§4.1) → MRR trend stacked by component (12-18 months) → cohort revenue retention heatmap (§4.3) → segment table (plan, region, acquisition channel) with NRR per segment.
- **Pitfalls**: NRR computed including new customers; churn timed at cancellation request vs end of paid period inconsistently; annual plans counted in full in month 1.

### 3.3 MQL / lead funnel report
- **Purpose**: are we generating enough qualified pipeline, and where does it leak? Audience: marketing + sales leadership. Weekly.
- **Scorecard**: MQLs vs target (pacing), MQL→SQL rate, SQLs, pipeline sourced ($), pipeline influenced, median velocity MQL→SQL.
- **Visuals**: horizontal funnel bars with stage counts, stage conversion % and drop-off (§4.2) → MQL pacing vs plan (§4.4) → conversion by source/channel table (volume + rates, sorted by SQLs) → velocity box/median by stage → MQL rejection reasons (ranked bars) → SLA compliance (% MQLs actioned within SLA).
- **Pitfalls**: period vs cohort mixing (rule 2.1); celebrating MQL volume while MQL→SQL falls; no definition of MQL on the page.

### 3.4 Campaign / paid media performance
- **Purpose**: which campaigns to scale, fix or kill. Audience: performance marketers. Daily/weekly.
- **Scorecard**: spend vs budget (pacing), conversions, CPA, ROAS, CVR, CTR.
- **Visuals**: budget pacing by channel (§4.4) → ranked campaign table (spend, conv, CPA, ROAS, delta vs prior) with anomaly flags (§4.8) → CPA/ROAS trend with annotations for creative launches/bid changes (`ReferenceDot`) → creative leaderboard → recommendations block (scale / hold / cut with reason).
- **Pitfalls**: headlining CTR/CPM; mixing attribution windows across platforms in one ROAS column; no minimum-spend filter (tiny campaigns top the ROAS rank).

### 3.5 CAC / LTV unit economics
- **Purpose**: can we afford growth? Audience: CEO, CFO, board. Monthly/quarterly.
- **Scorecard**: blended CAC, fully loaded CAC, LTV, LTV:CAC, payback months, gross margin.
- **Visuals**: CAC trend by definition (paid vs blended vs fully loaded, 3 lines) → LTV:CAC by channel (bars with 3:1 reference line) → payback by acquisition cohort → cumulative gross profit per customer by cohort vs CAC line (break-even point visible).
- **Pitfalls**: LTV on revenue not margin; LTV extrapolated from 3 months of data without saying so; CAC numerator and denominator from different periods.

### 3.6 Attribution report
- **Purpose**: how credit for conversions is distributed, and how sensitive that is to the model. Audience: growth/analytics. Monthly.
- **Scorecard**: conversions, revenue, model + lookback disclosed in the header.
- **Visuals**: model comparison grouped bars per channel (last-click vs first-click vs linear vs data-driven, §4.5) → top conversion paths table (path, conversions, avg touches, avg days to convert) → assisted vs last-touch conversions per channel → time-lag and path-length distributions → incrementality panel (lift test results, or "not measured").
- **Pitfalls**: presenting one model as truth; view-through conversions counted without saying so; ignoring offline/sales-assisted touches.

### 3.7 Executive MBR / QBR marketing report
- **Purpose**: decisions for the next period. Audience: exec team. Monthly/quarterly. Read once, often printed (product-mode §7).
- **Structure**: takeaway title → summary (3 findings + decisions) → KPI scorecard with RAG (§4.7) → pipeline and revenue contribution (sourced/influenced, % of company bookings) → channel performance (MER/CAC by channel) → budget vs actual (by line, variance %, reforecast) → wins, risks, next-period plan with owners → appendix (definitions, methodology).
- **Pitfalls**: 20-KPI walls; activity metrics (posts, emails sent) presented as outcomes; no budget section.

### 3.8 Web / SEO analytics
- **Purpose**: is the site attracting and converting the right traffic? Weekly/monthly.
- **Scorecard**: sessions, engaged sessions, engagement rate, key events, CVR, organic clicks.
- **Visuals**: sessions by default channel group (stacked area) → landing-page table (sessions, engagement rate, CVR, sorted by sessions, flag high-traffic low-CVR) → Search Console: clicks + impressions trend, CTR vs position scatter by query → top movers (queries/pages gained/lost) → annotated trend for site releases and search algorithm updates (`ReferenceLine`).
- **Pitfalls**: GA4 thresholding/sampling on small segments; consent-mode gaps making traffic look like a drop; comparing UA-era bounce rate to GA4 engagement rate.

### 3.9 Email / lifecycle
- **Purpose**: is owned-channel revenue healthy and is the list sustainable? Weekly/monthly.
- **Scorecard**: delivered rate, CTR, RPR, revenue, unsub rate, spam complaint rate, list size net growth.
- **Visuals**: flows vs campaigns revenue split (stacked bars by week) → campaign table (sent, delivered, CTR, conv, RPR, unsub) → flow performance table (welcome, abandoned cart, post-purchase, win-back) → list health trend (new subs, unsubs, bounces, net growth) → deliverability thresholds as reference lines (complaints 0.1%, bounce 2%).
- **Thresholds**: delivered ≥ 98%, hard bounce < 0.5%, total bounce < 2%, spam complaints < 0.1%, unsub per send < 0.3%. Engagement benchmarks vary widely by industry and region: compare to your own trailing 90-day median first, published industry benchmarks second (cite source and year).
- **Pitfalls**: open rate as a headline KPI after Apple MPP; revenue attribution window for email not stated (often 5-day click).

### 3.10 MRD
Not a dashboard: write it as a document (Claude Doc / Markdown / Word as the user's format rules decide). Template in §5.

---

## 4. Visual patterns with code

All snippets type-check against Recharts 3.10.1. Colors are CSS variables (`charts-recharts.md` §3). Compute data server-side or in a memo; keep shapes/formatters outside components.

### 4.1 Waterfall / bridge (MRR bridge, budget variance, revenue bridge)
Use Recharts ranged bars: each bar's value is `[low, high]`.
```tsx
import { Bar, BarChart, CartesianGrid, LabelList, Rectangle, Tooltip, XAxis, YAxis, type BarShapeProps } from 'recharts';

type Step = { name: string; delta: number; kind: 'total' | 'up' | 'down' };
type Row = Step & { range: [number, number] };

export function toWaterfall(steps: Step[]): Row[] {
  let run = 0;
  return steps.map((s) => {
    if (s.kind === 'total') { run = s.delta; return { ...s, range: [0, s.delta] }; }
    const start = run; run += s.delta;
    return { ...s, range: [Math.min(start, run), Math.max(start, run)] };
  });
}
const fill = { total: 'var(--chart-muted-strong)', up: 'var(--status-good)', down: 'var(--status-bad)' } as const;
const WaterfallBar = (p: BarShapeProps) => <Rectangle {...p} fill={fill[(p.payload as Row).kind]} />;
const fmtK = (v: unknown) => `${(Number(v) / 1000).toFixed(0)}k`;
const fmtDelta = (_: unknown, __: unknown, item: { payload?: Row }) => {
  const r = item.payload; return r ? (r.kind === 'total' ? fmtK(r.delta) : `${r.delta > 0 ? '+' : ''}${fmtK(r.delta)}`) : '';
};

// steps: Starting MRR(total) → New(up) → Expansion(up) → Reactivation(up) → Contraction(down, negative) → Churn(down) → Ending MRR(total)
export const MrrBridge = ({ rows }: { rows: Row[] }) => (
  <BarChart data={rows} responsive style={{ width: '100%', height: 300 }} margin={{ top: 24 }}>
    <CartesianGrid vertical={false} stroke="var(--chart-grid)" />
    <XAxis dataKey="name" tickLine={false} axisLine={false} interval={0} />
    <YAxis tickFormatter={fmtK} tickLine={false} axisLine={false} width="auto" />
    <Tooltip formatter={(_v, _n, item) => fmtDelta(_v, _n, item as { payload?: Row })} />
    <Bar dataKey="range" shape={WaterfallBar} isAnimationActive={false}>
      <LabelList dataKey="delta" position="top" formatter={(v) => fmtK(v)} />
    </Bar>
  </BarChart>
);
```
Rules: totals neutral, increases good-color, decreases bad-color (flip for cost bridges); the ending bar must equal the computed sum (assert it in code; a non-reconciling bridge destroys trust); order components the same way every month.

### 4.2 Funnel with conversion and drop-off (MQL funnel, checkout funnel)
Prefer horizontal bars over trapezoid `FunnelChart`: bar length stays proportional and labels fit.
```tsx
import { Bar, BarChart, LabelList, XAxis, YAxis } from 'recharts';
type Stage = { stage: string; count: number };
export const withConv = (s: Stage[]) => s.map((x, i) => ({
  ...x,
  conv: i === 0 ? null : x.count / s[i - 1].count,      // stage conversion
  overall: x.count / s[0].count,                         // from top
}));
const stageLabel = (v: unknown) => Number(v).toLocaleString('en-US');

export const LeadFunnel = ({ data }: { data: ReturnType<typeof withConv> }) => (
  <div className="flex items-center gap-4">
    <BarChart data={data} layout="vertical" responsive style={{ width: '100%', height: 44 * data.length }} margin={{ right: 56 }}>
      <XAxis type="number" hide domain={[0, 'dataMax']} />
      <YAxis type="category" dataKey="stage" width="auto" tickLine={false} axisLine={false} />
      <Bar dataKey="count" fill="var(--chart-1)" radius={[0, 4, 4, 0]} isAnimationActive={false}>
        <LabelList dataKey="count" position="right" formatter={stageLabel} />
      </Bar>
    </BarChart>
    {/* right rail: stage conversion %, red when below target; drop-off count on hover */}
  </div>
);
```
Show beside each stage: stage conversion %, its target, and the basis label ("Cohort: leads created Sep 2026"). Highlight the single worst stage vs target; everything else neutral.

### 4.3 Cohort retention heatmap (MRR/logo retention, LTV build-up)
An HTML table, not an SVG chart: it needs exact numbers, sticky headers and scroll.
```tsx
type Cohort = { cohort: string; size: number; pct: (number | null)[] }; // pct[m] = retained share at month m
const shade = (p: number) => `color-mix(in oklch, var(--chart-1) ${Math.round(p * 100)}%, var(--surface))`;

export function CohortHeatmap({ rows, months }: { rows: Cohort[]; months: number }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-separate border-spacing-0.5 text-sm tabular-nums">
        <thead><tr>
          <th className="sticky left-0 bg-background text-left font-medium">Cohort</th>
          <th className="text-right font-medium">Customers</th>
          {Array.from({ length: months }, (_, m) => <th key={m} className="text-right font-medium">M{m}</th>)}
        </tr></thead>
        <tbody>{rows.map((r) => (
          <tr key={r.cohort}>
            <td className="sticky left-0 bg-background">{r.cohort}</td>
            <td className="text-right">{r.size.toLocaleString('en-US')}</td>
            {r.pct.map((p, m) => p == null
              ? <td key={m} aria-label="not yet observed" />
              : <td key={m} className="rounded-sm px-2 py-1 text-right"
                    style={{ background: shade(p), color: p > 0.55 ? 'var(--on-accent)' : 'var(--foreground)' }}>
                  {(p * 100).toFixed(0)}%
                </td>)}
          </tr>))}
        </tbody>
      </table>
    </div>
  );
}
```
Rules: single-hue sequential scale; M0 = 100% for logo retention (revenue retention may exceed 100%: cap the color, keep the number); unobserved cells empty, not 0; a weighted-average row at the bottom; cohorts with size < 30 greyed.

### 4.4 Pacing (MQLs vs plan, budget burn, revenue MTD)
```tsx
import { Area, ComposedChart, Line, ReferenceLine, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
type P = { day: number; plan: number; actual?: number; projected?: number }; // cumulative values
export const Pacing = ({ data, target, today }: { data: P[]; target: number; today: number }) => (
  <ComposedChart data={data} responsive style={{ width: '100%', height: 260 }}>
    <CartesianGrid vertical={false} stroke="var(--chart-grid)" />
    <XAxis dataKey="day" tickLine={false} axisLine={false} />
    <YAxis tickLine={false} axisLine={false} width="auto" />
    <Tooltip />
    <Area dataKey="plan" stroke="var(--chart-axis)" strokeDasharray="4 4" fill="transparent" isAnimationActive={false} />
    <Line dataKey="actual" stroke="var(--chart-1)" strokeWidth={2} dot={false} isAnimationActive={false} />
    <Line dataKey="projected" stroke="var(--chart-1)" strokeDasharray="2 4" dot={false} isAnimationActive={false} />
    <ReferenceLine y={target} stroke="var(--chart-axis)" label={{ value: 'Month target', position: 'insideTopLeft', fontSize: 12 }} />
    <ReferenceLine x={today} stroke="var(--chart-grid)" />
  </ComposedChart>
);
```
Plan curve linear by default, seasonally weighted when daily history exists (weekends, paydays, campaign days). KPI text beside it: "MTD 1,240 / plan-to-date 1,380 (90%), projected 2,610 vs target 2,900".

### 4.5 Attribution model comparison
Grouped horizontal bars, one group per channel, one bar per model, fixed model colors app-wide; sort channels by the default model; a table toggle shows absolute conversions and % share. Add a "max swing" column (max − min share across models): channels with large swings are where the model choice drives the decision.

### 4.6 Response curve (diminishing returns, MER)
`ScatterChart` of weekly spend (x) vs revenue or new customers (y), points colored by recency (older lighter), optional fitted log curve as a `Line` from precomputed points; annotate the current spend level. Caption: correlational unless from MMM/lift tests.

### 4.7 RAG KPI scorecard (MBR/QBR)
Table, not cards, for > 6 KPIs. Columns: KPI · Actual · Target · % of target · vs prior period · Status (dot + text "On track / At risk / Off track") · Owner. Thresholds in the footer. Status text color passes AA; the % column carries the precision, status carries the judgement.

### 4.8 Anomaly flags (campaign and channel tables)
Flag, do not just color: an icon + tooltip with the rule that fired. Default rules: metric outside ±2σ of its trailing 28-day mean (same weekday for daily data), or WoW change > ±30% with spend ≥ a minimum threshold. Suppress flags on n < 30 conversions. List flagged rows first in a "Needs attention" section.

---

## 5. MRD document template

A Marketing Requirements Document answers *what the market needs and why*, before the PRD answers *how the product delivers it*. Write as a document (product-mode Report rules apply: takeaway headings, summary first, sources).

```
Title: <Product/initiative> - Marketing Requirements
Owner · Version · Status (Draft / In review / Approved) · Approvers · Last updated
1. Executive summary - the opportunity in 3-5 sentences, the ask, the expected impact
2. Purpose and scope - in scope / out of scope, related docs (PRD, GTM plan)
3. Market problem - evidence (research, data, quotes, support tickets), who feels it, cost of not solving
4. Market opportunity - TAM / SAM / SOM with method and sources; growth trends
5. Target segments and personas - firmographics/demographics, jobs-to-be-done, buying roles, priority segment
6. Competitive landscape - comparison table (alternatives incl. "do nothing"), strengths/gaps, differentiation
7. Positioning and value proposition - positioning statement (for / who / our product is / that / unlike), proof points, messaging pillars
8. Market requirements - table: ID · requirement (market language) · persona · priority (Must / Should / Could / Won't) · rationale/evidence · success measure
9. Pricing and packaging considerations - willingness-to-pay evidence, competitor price points
10. Go-to-market outline - channels, launch tier, timeline, enablement needs
11. Success metrics - KPI · baseline · target · timeframe · data source (adoption, pipeline, revenue, win rate, NPS)
12. Assumptions, risks, dependencies - each with owner and mitigation
13. Open questions and decision log
Appendix - research details, glossary, sources
```
Taste for MRDs: one requirement per row, written as a market need, not a feature ("Hub managers need to know backlog risk 2h before cut-off", not "Add backlog alert"). Every Must has evidence. Charts only where they carry evidence (market size, survey results, competitor price map).

## 6. Marketing Report Pre-Flight
- [ ] Acronyms interpreted and stated (MER direction, MQL definition)?
- [ ] Every metric matches §1 formula; definition + formula in tooltip or appendix?
- [ ] Period basis (cohort vs period) labelled on funnels and cohort views?
- [ ] Attribution model + lookback window shown next to every attributed number; MER/backend revenue shown beside platform ROAS?
- [ ] Incrementality stated (measured / not measured)?
- [ ] KPIs vs target and vs comparable period; seasonality/campaign peaks flagged?
- [ ] Pacing with projection for in-progress periods?
- [ ] Revenue basis (gross/net, tax, currency, FX rate) stated?
- [ ] Small-n rates greyed with n shown, no RAG on them?
- [ ] RAG thresholds documented and never color-only?
- [ ] Source + freshness line per section?
- [ ] Ends with decisions/next actions with owners (exec-facing)?
- [ ] Bridges/waterfalls reconcile (start + components = end, asserted in code)?
- [ ] Cohort heatmaps: unobserved cells empty, small cohorts greyed, weighted average row?
- [ ] Funnels show stage conversion, target and basis label; worst stage highlighted?
- [ ] Anomaly flags show the rule that fired and respect minimum volume?
- [ ] MRD: every Must requirement has evidence; owner, version, approval status present?
