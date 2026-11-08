# Product Mode (Operate) - Dashboards, Reports, Admin, Web Apps

> Taste v3: this is the **Operate** mode. Read-once and printable reports also follow `read-mode.md`. §10 adds Impeccable's Operate doctrine.

Distilled from three production sources, read at source in Oct 2026:
- **Ant Design Pro v6** (antd 6, ProComponents 3, Umi Max 4): page archetypes, KPI card anatomy, list/detail/batch patterns.
- **Recharts 3.10** (stable): chart sizing, theming, accessibility, performance.
- **Creative Tim UI** (shadcn/ui registry, 390+ blocks): restraint philosophy, KPI/table/sidebar conventions, hydration safety.

Marketing mode optimises for *memorability*. Product mode optimises for **time-to-decision**: how fast can the person on this screen see the number that matters, trust it, and act on it. Every rule below serves that.

## Contents
1. Product Design Read
2. Product Dials and presets
3. Page archetypes (pick one per screen)
4. App shell
5. KPI card anatomy
6. Tables, lists, detail, forms, batch actions
7. Report mode (read-once and printable)
8. Rule overrides vs Marketing mode
9. Product Pre-Flight Check

---

## 1. Product Design Read

Before code, output one line:

**"Reading this as: \<surface> for \<user role> who needs to \<decision or action>, checked \<cadence>, leaning toward \<stack>."**

Examples:
- "Reading this as: ops monitoring dashboard for hub supervisors who need to spot backlog before cut-off, checked every 15 min on a wall screen, leaning toward shadcn + Recharts, dark theme."
- "Reading this as: admin CRUD for finance staff who reconcile COD invoices, used all day, leaning toward Ant Design Pro ProTable + Drawer detail."
- "Reading this as: weekly exec report for regional leadership who need 3 decisions, read once then forwarded as PDF, leaning toward single-page HTML + Recharts, print-safe."

Then answer the Creative Tim "research before rendering" questions silently:
1. **What is the one number** this person acts on? It goes top-left, biggest.
2. **What action follows** if it is bad? That action must be reachable from the screen (link, filter, button).
3. **What is the comparison?** A number without a reference (target, last period, peer) is decoration.
4. **What can be removed?** If the screen works without it, cut it.

If the brief is ambiguous, ask ONE question, usually: "Who opens this, and what do they do right after?"

---

## 2. Product Dials

Same three dials, re-tuned. Variance stays low because users learn the layout and scan it repeatedly; novelty costs them time.

| Preset | VARIANCE | MOTION | DENSITY |
|---|---|---|---|
| Executive dashboard (few KPIs, trends) | 3 | 3 | 4 |
| Analyst explorer (filters, drill-down) | 3 | 2 | 7 |
| Ops monitoring / wall screen / NOC | 2 | 2 | 8 |
| Admin CRUD / back-office | 2 | 2 | 6 |
| SaaS app workspace (consumer-facing app) | 4 | 4 | 5 |
| Read-once report / data story (screen) | 4 | 3 | 4 |
| Printable report / PDF | 3 | 1 | 5 |

Dial meaning in Product mode:
- **VARIANCE 1-3**: strict 24-col (antd) or 12-col grid, equal gutters (antd default gutter 24, Tailwind `gap-4`/`gap-6`). **4-5**: one asymmetric split allowed (e.g. 18/6 or `lg:grid-cols-3` with a 2-span chart). Never above 5.
- **MOTION 1-2**: no entrance animation, hover/active states only, charts `isAnimationActive={false}`. **3-4**: one-time chart entrance (`isAnimationActive="auto"` honours reduced motion), skeleton shimmer, drawer/sheet slide. Never animate values that refresh on an interval beyond a brief highlight.
- **DENSITY 4-5**: card padding 20-24px, row height 48-56px. **6-7**: padding 16px, row height 40px, `text-sm` everywhere. **8**: padding 12px, row height 32-36px, borderless cards separated by 1px lines, side panels collapsible.

---

## 3. Page Archetypes

Ant Design Pro ships these as reference pages. Pick one archetype per screen, then compose. Mixing two archetypes on one screen is the most common dashboard mess.

| Archetype | Use for | Composition (top to bottom) |
|---|---|---|
| **Analysis** | Periodic performance review | KPI row (4 cards, `xl=6 / sm=12 / xs=24`) → main trend card with metric tabs + date range presets (today/week/month/year) → two-column split (ranking table, proportion chart) → tabbed detail by segment |
| **Monitor** | Real-time operations | Wide live card (`xl=18`) with a 4-up statistic strip + map or big trend, narrow column (`xl=6`) with gauges/targets and countdown to cut-off → secondary row of small realtime tiles |
| **Workplace** | Personal home for a role | Greeting header with 2-3 personal stats → "my items" card list → activity feed → quick links. No company-wide KPIs here |
| **Table list** | Find and act on records | Query form (collapsible after 3 fields) → toolbar (title left, primary action right) → table with status badges and row actions → row link opens **Drawer** detail → selection reveals **footer batch bar** |
| **Basic / card list** | Browse items with rich metadata | Summary strip → filter tabs → list rows or card grid with pagination |
| **Profile (detail)** | One record end to end | Header with status + primary actions → process **Steps** → description groups (2-3 columns of label:value) → related tables → audit log |
| **Form (basic / step / advanced)** | Create or edit | Basic: single column `max-w-2xl`. Step: 3-5 steps max with review step. Advanced: grouped cards + sticky footer toolbar with Submit |
| **Result** | Outcome of an action | Icon + title + one line + 1-2 actions (next step, back to list). Failure shows what to fix |
| **Exception** | 403 / 404 / 500 | Plain explanation + one recovery action. No jokes on 500 |

Responsive collapse, from the Ant Design Pro analysis page: KPI cards 4 → 2 → 1 columns at `xl / sm / xs`; two-column splits become stacked below `xl` (1280px). State this explicitly per section.

---

## 4. App Shell

- **Layout modes** (ProLayout naming, useful vocabulary for any stack): `side` (sidebar nav, best for 8+ sections), `top` (top nav, best for 3-6 sections), `mix` (top bar for app-level + sidebar for section nav, Ant Design Pro default).
- **Sidebar**: 256px (`w-64`), collapsible to icons at 64-80px, active item = surface lift (background + subtle shadow), not a saturated fill. Creative Tim: `bg-muted/30 border-r`.
- **Header**: 48-64px. Left: product + breadcrumb. Right: search, notifications, locale, avatar menu. Nothing else.
- **Page header**: title (one line) + short description or last-updated timestamp left; primary action right; secondary actions in an overflow menu.
- **Content width**: `Fluid` for dashboards and tables, fixed `max-w-2xl` to `max-w-3xl` for forms and settings.
- **Fixed sidebar, non-fixed header** is the Ant Design Pro default and a sane one; fix the header only if pages are long tables with sticky column headers.
- **Permissions**: hide nav items the user cannot access (route-level `access` in Ant Design Pro) rather than showing them disabled; show disabled actions with a tooltip explaining why only inside pages.

---

## 5. KPI Card Anatomy

Combined from Ant Design Pro `ChartCard` + `Trend` and Creative Tim KPI blocks:

```
┌─────────────────────────────────────┐
│ Metric name            (i) tooltip  │  14px, secondary text color; info icon explains definition
│ 126,560                             │  24-30px, heading color, tabular-nums, nowrap + ellipsis
│ ▲ 12% vs last week   ▼ 3% vs target │  delta with direction + color + comparison label
│ ▁▂▃▅▆▇ sparkline / mini bars / bar │  fixed height ~46px, no axes
├─────────────────────────────────────┤  1px split line
│ Daily avg  12,423                   │  one secondary metric
└─────────────────────────────────────┘
```

Rules:
- **Every KPI needs a comparison** (vs target, vs previous period, vs peer). No comparison = not a KPI, demote it.
- **Delta color follows meaning, not direction.** Ant Design Pro's `Trend` has `reverseColor` for this: for cost per parcel, RTS rate, lead time, backlog, error rate, *down is good* and must be green. Never let a falling cost show red.
- **Direction is never color-only**: caret/arrow + sign + color.
- **Definition on hover**: the (i) tooltip states formula and data freshness. Ops teams argue about definitions more than about numbers.
- **Fixed micro-viz height** (Ant Design Pro uses 46px) so the row aligns; the micro-viz has no axes, no tooltip clutter, no animation at DENSITY ≥6.
- **Card padding**: Ant Design Pro `20px 24px 8px`; Creative Tim stat grids use `CardContent px-4 py-0` so the grid controls rhythm. Pick one per project.
- **4 KPIs per row is the default**, 3 when values are long (currency), 6 only on wide monitoring screens. More than 8 KPIs on one screen means the brief has not decided what matters: push back.
- **Loading**: skeleton in the card's final shape (antd `Card loading`, shadcn `Skeleton`), never a page spinner.
- **Status encoding:** a dot + text badge, or a tinted header band. A colored left stripe thicker than 1px on a rounded card is the `side-tab` tell; Creative Tim's 1-4px left bar is allowed only as a full-height 1px rail on square table rows or list rows, and only when it encodes status (on-track / at-risk / breached).

---

## 6. Tables, Lists, Detail, Forms, Batch Actions

**Tables**
- Columns ordered by scan priority: identifier → status → the metric people sort by → secondary fields → actions last.
- Numbers right-aligned, `tabular-nums`, same decimals per column, units in the header ("Cost (VND)"), not every cell.
- Identifiers (AWB, order ID, invoice no.) in mono, copyable on hover.
- Status as badge = dot + text, from one enum map (Ant Design Pro `valueEnum` with `Default / Processing / Success / Warning / Error`). Same status, same color, everywhere in the app.
- Row separation: `divide-y` lines OR zebra striping, never both. Row hover tint always.
- Sorting on the 2-3 columns people actually sort; filters in the query form or column header, not both for the same field.
- First column links to detail; row actions limited to 2 visible + overflow menu. Destructive actions confirm.
- Empty state says why it is empty (no data yet vs filters too narrow) and offers the fix (create, clear filters).
- Long lists inside cards use a scroll container (Creative Tim: `ScrollArea`), with sticky header.

**Detail**: Drawer (≈600px) for quick look from a list; full page when the record has its own sub-tables or workflow. Description lists in 2 columns (1 on mobile), labels muted, values primary.

**Batch actions**: selecting rows reveals a footer bar (Ant Design Pro `FooterToolbar`): "N selected" + an aggregate that matters (e.g. total COD amount) + actions with the primary one rightmost.

**Forms**: `marketing-mode.md` §5 form rules still apply (label above, error below, no placeholder-as-label). Plus: group into cards by topic for long forms, sticky footer with Submit + Cancel, validate on blur, disable Submit only while submitting (show why otherwise). Step forms: 3-5 steps, last step is review.

**Feedback**: toast for transient success, inline alert for errors that need action, `Result` page after irreversible multi-step flows.

---

## 7. Report Mode (read-once and printable)

A report is a dashboard frozen into an argument. Structure it like one:

1. **Title that states the takeaway** ("OTD fell 3.1 pts on Tet week, driven by 4 northern hubs"), not the topic ("OTD report").
2. **Summary block first**: 3 bullets max, each a finding + implication, plus the decision or ask.
3. **Sections in SCQA order** (situation, complication, question, answer) or one section per decision.
4. **One message per chart**, written as the chart title. Highlight the series that carries the message; gray the context.
5. **Every chart has a source line**: data source, period, timezone, refresh time. Mock data is labeled as mock.
6. **Appendix** for definitions and full tables; the body stays short.

Print / PDF rules:
- `@page { size: A4; margin: 14mm; }`, `break-inside: avoid` on cards and charts, `break-before: page` for major sections.
- Charts: `isAnimationActive={false}` and fixed pixel width/height for print (responsive measuring can produce 0-width charts in headless PDF renderers).
- Light theme for print regardless of screen theme; check that series remain distinguishable in grayscale (vary lightness, not just hue).
- Hide nav, filters and interactive controls via `@media print`.

---

## 8. Rule Overrides vs Marketing Mode

| Marketing rule | Product mode | Why |
|---|---|---|
| Hero rules, eyebrow restraint, bento, zigzag cap, layout-repetition ban, logo wall | **Not applicable** | No persuasion surface |
| 3-equal-card ban | **Suspended for KPI rows** | Equal width signals equal weight; scanning needs repetition |
| "Real images required" | **Suspended**; no stock photos in apps | Images compete with data |
| Status-dot ban | **Suspended** for status badges (dot + text) | Status is information |
| `border-t + border-b` on rows ban | **Suspended** for tables (lines OR zebra) | Row tracking needs separation |
| Progress/score bar ban | **Allowed** when it encodes a real ratio vs target | It is a chart |
| Inter discouraged | **Allowed**. Prefer fonts with good tabular figures (Inter, Geist, IBM Plex Sans, system UI). Use `font-variant-numeric: tabular-nums` on all numbers | Column alignment |
| DENSITY 8-10 "font-mono for all numbers" | **Replaced**: tabular-nums for numbers, mono only for identifiers and code | Mono reduces number readability |
| Icon family rule | Use the system's family (`@ant-design/icons`, `lucide-react` for shadcn) | Consistency with primitives |
| Max 1 accent color | **Split into 3 token sets**: one brand accent (interactive), one semantic status set (success/warning/error/info), one categorical chart palette. They never borrow from each other | Status must stay unambiguous |
| Dark mode mandatory | Mandatory for monitoring/wall screens; recommended elsewhere; charts must theme with the UI | Glare and consistency |
| Motion presets | Capped per §2 | Motion on live data reads as change |

Universal rules that stay on (`SKILL.md` §5): eyebrow ban, gradient-text ban, side-stripe ban, nested-card ban, `transition: all` ban, em-dash ban in UI copy (use "-" or "No data" for empty cells), Jane Doe / fake-precise numbers ban (use realistic domain data, label mock), WCAG AA contrast (including chart text and status badges), one design system per project, reduced motion, copy self-audit, Creative Tim's "no `violet/purple/indigo` default accent" agrees with Taste's Lila rule.

---

## 9. Product Pre-Flight Check

Run every box. Any failure means not done.

Read and structure
- [ ] Product Design Read declared (surface, role, decision, cadence, stack)?
- [ ] One archetype per screen (§3), responsive collapse stated per section?
- [ ] The one number that matters is top-left and largest?
- [ ] Every KPI has a comparison and a definition tooltip?
- [ ] Delta colors follow meaning (down-is-good metrics use reversed color)?
- [ ] Direction never encoded by color alone?
- [ ] ≤ 8 KPIs on the screen, or pushback given?

Stack and tokens
- [ ] One design system (antd/Ant Design Pro OR shadcn/Creative Tim), one chart library?
- [ ] Brand accent, status palette and chart palette defined as separate tokens?
- [ ] Same status = same badge color across the whole app?
- [ ] Charts follow light/dark theme with the UI?

Tables, forms, states
- [ ] Numbers right-aligned, tabular-nums, units in headers, consistent decimals?
- [ ] Row separation: lines OR zebra, not both; hover state present?
- [ ] Detail opens in Drawer or page per §6; batch bar appears on selection?
- [ ] Skeletons in final shape for every async block; empty states explain cause + fix; errors actionable?
- [ ] Data freshness ("Updated 10:45, GMT+7") visible on dashboards and reports?

Charts (see `charts-recharts.md` §8 for the full chart checklist)
- [ ] Chart type matches the question; bars start at zero; pies ≤ 5 slices?
- [ ] Target/threshold drawn as a reference line where one exists?

Universal
- [ ] Zero em-dashes in visible UI copy?
- [ ] Realistic domain data, mock clearly labeled, no "John Doe" / "Acme" / 99.99%?
- [ ] WCAG AA contrast for text, badges, chart labels, focus rings?
- [ ] Reduced motion honoured; no animation on interval-refreshing values; motion on tokens, 150-250ms, no page-load choreography?
- [ ] Operate doctrine §10: one family, fixed rem scale, second neutral layer, all component states, overlays escape containers, modal not first thought?
- [ ] Hit areas ≥ 40px (dense) / 44px (touch); concentric radii; shadow-as-border tokens (`surface-details.md`)?
- [ ] Hydration-safe (no `new Date()` / `toLocale*()` in SSR initial state, see `stack-shadcn-creative-tim.md` §5)?
- [ ] Report mode only: takeaway titles, summary first, source line per chart, print CSS tested?
- [ ] Marketing content: `marketing-reports.md` §6 Pre-Flight also passed?

---

## 10. Operate Doctrine (from Impeccable)

**The product slop test:** can a category-fluent user trust the interface immediately, or must they pause at every subtly-off component? Product UI fails through strangeness without purpose (over-decorated buttons, mismatched controls, gratuitous motion, display fonts in labels, invented affordances), not through flatness. The tool should disappear into the task.

**The world's limit:** the visual world lends exactly four things: type, palette, density, and one signature move. It never supplies the layout, the navigation model or the controls. Name the signature move concretely ("service health drawn as a transit map", "a schedule set in a timetable's column rhythm"). A world taken from a tool the audience operates (terminal, cockpit, control panel, ruled ledger) comes back as a costume: take only what transfers.

**Typography:** one well-tuned family is often right; fixed rem scale (no fluid clamp headings in product UI); ratio 1.125-1.2; prose still 65-75ch, tables may run 120ch+.

**Color:** Restrained is the floor, and color still does real jobs: a committed shell (colored rail or header, tinted ground), state colors, data series, selection, the signature move. A gray screen with one accent is the category default without its polish. Standardise the state vocabulary: hover, focus, active, disabled, selected, loading, error, warning, success, info. Accent only for primary actions, current selection and state indicators. A second neutral layer (slightly cooler or warmer) for sidebars, toolbars, panels. No heavy or saturated color on inactive states.

**Components:** every interactive component has default, hover, focus, active, disabled, loading, error. Skeletons, not spinners in content. Empty states teach the interface. One affordance vocabulary: if "Save" looks different in two places, one is wrong. Overlays escape `overflow` containers (`<dialog>`, popover API, portal). Exhaust inline and progressive alternatives before a modal.

**Motion:** 150-250ms on most transitions; motion conveys state, feedback, loading or reveal, nothing else; no orchestrated page-load sequences.

**Bans for Operate:** decorative motion, inconsistent component vocabulary, display fonts in labels/buttons/data, reinvented standard affordances (custom scrollbars, odd form controls, non-standard modals), heavy color on inactive states, modal as first thought.

**Permissions Operate has that Persuade lacks:** system fonts and familiar sans; standard navigation (top bar + side nav, breadcrumbs, tabs, command palette); density; consistency over surprise (delight saved for moments, not pages).

**Comps and variants:** when exploring alternatives, vary the product's organisation (navigation model, how work areas divide the screen, which data leads, density, where the signature move sits), never the amount of world. More world on a working screen is a costume. Self-check: with the name covered, does it read as a product of its category, could the user do the task from it, and is it at least as clean as the category standard and more distinctive?
