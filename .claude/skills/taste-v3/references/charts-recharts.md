# Charts: Recharts 3 + Data-Viz Taste

Source: `recharts/recharts` (read Oct 2026). Stable on npm: **3.10.x** (`latest`); `3.11.0-canary` exists, do not target it. Guides read: Chart sizing, Theming, Performance, Rounded bars, Cell deprecation. Sections 1, 2 and 7 apply to any chart library (G2/`@ant-design/plots` included).

## Contents
1. Pick the chart from the question
2. Dashboard chart anatomy
3. Recharts 3 essentials (sizing, theming, a11y, animation)
4. Canonical skeletons
5. Performance
6. No-build / single-file HTML
7. Data-viz honesty and color
8. Chart Pre-Flight

---

## 1. Pick the chart from the question

| Question | Chart | Recharts |
|---|---|---|
| How is it trending over time? | Line (1-4 series) | `LineChart` + `Line` |
| Trend + magnitude of a single total | Area (single series, or stacked when parts sum to a meaningful whole) | `AreaChart` + `Area stackId` |
| Compare categories / rank | Bar, **horizontal and sorted** when labels are long (hubs, carriers) | `BarChart layout="vertical"` |
| Part-to-whole, ≤ 5 parts | Donut | `PieChart` + `Pie innerRadius` |
| Part-to-whole, > 5 parts or over time | 100% stacked bar | `BarChart` + `Bar stackId` |
| Actual vs target | Bar or line + target `ReferenceLine`; bullet-style bar | `ReferenceLine y={target}` |
| Two metrics, different units, same time axis | Two small charts stacked, synced (`syncId`) | Dual axis only if the user insists |
| Volume + rate on one time axis | Composed bar + line, rate on right axis, both axes labeled | `ComposedChart` |
| Relationship / outliers | Scatter (optionally sized by `ZAxis`) | `ScatterChart` |
| Distribution | Histogram (bars of binned counts), box plot | `BarChart` with pre-binned data |
| Flow between stages (first mile → sort → linehaul → last mile) | Funnel for drop-off, Sankey for splits | `FunnelChart`, `Sankey` |
| Hierarchical share | Treemap / Sunburst | `Treemap`, `SunburstChart` |
| Single value vs goal on a KPI card | Number + delta (+ tiny sparkline). Not a gauge unless it is a wall screen | `AreaChart` 46px tall, no axes |

Avoid: 3D anything, radar for > 1 entity comparison of unlike metrics, pies with > 5 slices, gauges stacked in rows, word clouds for anything quantitative.

---

## 2. Dashboard chart anatomy

- **Title states the message** in reports ("Northern hubs drove 80% of the backlog"); in dashboards, title = metric + unit ("Backlog (parcels)"), and the message is carried by highlight.
- **Gridlines**: horizontal only, light (`vertical={false}`, low-contrast stroke, dashed `3 3` or solid hairline). No chart border.
- **Axes**: no axis line, no tick lines, `tickMargin={8}`, formatted ticks (`12k`, `95%`, `13 Oct`), `minTickGap` to avoid crowding. Y axis `width="auto"` (3.x) so labels never clip.
- **Legend**: prefer direct labels (`LabelList` at line end) for ≤ 3 series; legend top-left otherwise. Click-to-toggle series is optional, not default.
- **Tooltip**: shared cursor on time series, values formatted with units, series ordered like the chart, comparison included when meaningful (e.g. "vs target -2.1 pts").
- **Reference marks**: targets (`ReferenceLine`), incident windows (`ReferenceArea`), notable points (`ReferenceDot`) with short labels.
- **Height**: fix per row (e.g. 240 / 280 / 320px) so cards in a row align.
- **Empty / loading / error**: skeleton in chart shape; "No data for this range" with a range reset; never render an empty axis frame.

---

## 3. Recharts 3 essentials

**Sizing** (biggest source of blank charts)
- A chart with no size renders nothing.
- Preferred since 3.3: `responsive` prop on the chart root + CSS sizing via `style`:
  `<LineChart responsive style={{ width: '100%', height: 280 }} ...>` or `style={{ width: '100%', maxWidth: 720, aspectRatio: 1.618 }}`.
- `responsive` works with flex and grid cells. Inside flex, give the item `min-width: 0` or charts can refuse to shrink.
- Older code: `ResponsiveContainer` (still exported; parent must have a defined size). shadcn `ChartContainer` uses it internally.
- Print/PDF: fixed `width`/`height` numbers, `isAnimationActive={false}`.

**Theming: use CSS variables.** Every chart color comes from a token (`--chart-1..n`, `--chart-muted`, `--chart-grid`, `--chart-axis`, `--chart-text`, `--chart-warn`), redefined under `.dark` / `[data-theme="dark"]`, passed as `stroke="var(--chart-1)"`. Works in every 3.x version, switches theme without re-render, and lets antd tokens or shadcn `--chart-*` variables drive charts.
```css
:root { --chart-1:#0f766e; --chart-2:#b45309; --chart-muted:#d4d4d8; --chart-grid:#e4e4e7; --chart-axis:#52525b; --chart-warn:#d97706; }
.dark { --chart-1:#5eead4; --chart-2:#fcd34d; --chart-muted:#3f3f46; --chart-grid:#27272a; --chart-axis:#a1a1aa; --chart-warn:#fbbf24; }
```
About `RechartsThemeProvider`: in stable **3.10.x it only themes `grid`** (`lightTheme` / `darkTheme` exist, marked experimental). The full theme object (series colors, typography, `autoTheme` following `color-scheme`) exists only in the 3.11 canary docs. Do not write code against it unless the project pins a version that has it; check `node_modules/recharts/types/theme/RechartsTheme.d.ts` first.

**Accessibility**: `accessibilityLayer` is **on by default** in 3.x (keyboard navigation of data points, ARIA). Keep it. Add a visible title/summary near the chart and never encode series by color alone (dash patterns, direct labels, markers).

**Animation**: `isAnimationActive` defaults to `'auto'`, which disables animation under `prefers-reduced-motion` and SSR. Keep `'auto'` at MOTION 3-4; set `false` at MOTION ≤2, for sparklines, for interval-refreshed data, and for print.

**Deprecations / modern APIs**
- `Cell` is **deprecated** (removed in 4.0). Use the `shape` prop (Bar, Pie, Scatter, Funnel...) to vary fill per entry.
- Rounded bars: `Bar radius={4}` or `radius={[4,4,0,0]}` for top-only. For stacks, wrap in `BarStack radius={4}` so only the stack's outer corners round.
- Hooks for custom overlays inside a chart: `usePlotArea`, `useXAxisScale`, `useYAxisScale`, `useActiveTooltipDataPoints`, `useChartWidth`, `useChartHeight`.
- Custom tooltip: `content={(props) => <MyTooltip {...props} />}` (props typed as `TooltipContentProps`).

---

## 4. Canonical skeletons

**KPI sparkline (no axes, no animation)**
```tsx
<AreaChart data={series} responsive style={{ width: '100%', height: 46 }} margin={{ top: 2, right: 0, bottom: 0, left: 0 }}>
  <Area dataKey="v" type="monotone" stroke="var(--chart-1)" strokeWidth={1.5} fill="var(--chart-1)" fillOpacity={0.12} dot={false} isAnimationActive={false} />
</AreaChart>
```

**Time series vs target, with incident window**
```tsx
const fmtPct = (v: number) => `${v}%`;
const fmtDay = (d: string) => d.slice(5); // pre-formatted 'MM-DD', hydration-safe

<LineChart data={data} responsive style={{ width: '100%', height: 280 }} margin={{ top: 8, right: 16, bottom: 0, left: 0 }}>
  <CartesianGrid vertical={false} stroke="var(--chart-grid)" strokeDasharray="3 3" />
  <XAxis dataKey="day" tickFormatter={fmtDay} tickLine={false} axisLine={false} tickMargin={8} minTickGap={24} />
  <YAxis domain={[85, 100]} tickFormatter={fmtPct} tickLine={false} axisLine={false} width="auto" />
  <Tooltip formatter={(v) => fmtPct(Number(v))} />
  <ReferenceArea x1="10-08" x2="10-10" fill="var(--chart-warn)" fillOpacity={0.08} label={{ value: 'Storm', position: 'insideTop', fontSize: 12 }} />
  <ReferenceLine y={95} stroke="var(--chart-axis)" strokeDasharray="4 4" label={{ value: 'Target 95%', position: 'insideTopRight', fontSize: 12 }} />
  <Line dataKey="otd" stroke="var(--chart-1)" strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
</LineChart>
```
A line chart may start above zero (it shows change); say so with clear tick labels.

**Ranked horizontal bars, one highlighted (no `Cell`)**
```tsx
import { Bar, BarChart, LabelList, Rectangle, XAxis, YAxis, type BarShapeProps } from 'recharts';

const sorted = [...hubs].sort((a, b) => b.backlog - a.backlog);
// defined outside the component: stable reference
const HighlightBar = (p: BarShapeProps) => (
  <Rectangle {...p} fill={p.payload?.flag ? 'var(--chart-1)' : 'var(--chart-muted)'} />
);

<BarChart data={sorted} layout="vertical" responsive style={{ width: '100%', height: 32 * sorted.length + 24 }} margin={{ right: 48 }}>
  <XAxis type="number" hide domain={[0, 'dataMax']} />
  <YAxis type="category" dataKey="hub" width="auto" tickLine={false} axisLine={false} />
  <Bar dataKey="backlog" radius={[0, 4, 4, 0]} shape={HighlightBar} isAnimationActive={false}>
    <LabelList dataKey="backlog" position="right" formatter={(v) => Number(v).toLocaleString('en-US')} />
  </Bar>
</BarChart>
```
Bars always start at zero.

**Volume (bars) + rate (line), composed**
```tsx
<ComposedChart data={d} responsive style={{ width: '100%', height: 300 }}>
  <CartesianGrid vertical={false} stroke="var(--chart-grid)" />
  <XAxis dataKey="week" tickLine={false} axisLine={false} />
  <YAxis yAxisId="vol" tickFormatter={k} tickLine={false} axisLine={false} width="auto" label={{ value: 'Parcels', angle: -90, position: 'insideLeft' }} />
  <YAxis yAxisId="rate" orientation="right" domain={[0, 10]} unit="%" tickLine={false} axisLine={false} width="auto" label={{ value: 'RTS rate', angle: 90, position: 'insideRight' }} />
  <Tooltip />
  <Bar yAxisId="vol" dataKey="parcels" fill="var(--chart-muted)" radius={[3, 3, 0, 0]} />
  <Line yAxisId="rate" dataKey="rts" stroke="var(--chart-1)" strokeWidth={2} dot={false} />
</ComposedChart>
```

**Donut with center total (≤ 5 slices)**: `PieChart` + `Pie innerRadius="62%" outerRadius="80%" paddingAngle={2}` with the total rendered as a centered `Label` (`position="center"`); legend as a list beside it with values and %.

---

## 5. Performance (from the Recharts guide)
- **Isolate frequently changing state**: hover or selection state lives in a small child component (e.g. `HoverableLine`), not at chart root, so the whole chart does not re-render.
- **Stable references**: define `dataKey` functions, formatters and custom shapes outside the component or with `useCallback` / `useMemo`. A new `dataKey` function forces recomputing every point. (New object props are optimised since 3.5; new arrays/functions/JSX props are not.)
- **Keep it simple**: 50,000 points is not insight. Aggregate (daily → weekly), sample, or pre-compute server-side. Rule of thumb: ≤ ~1,000 points per series on screen; `Brush` for zooming long ranges.
- **Debounce** mouse-move-driven external state; disable animation for large or live datasets.
- Measure with React Profiler before optimising further.

---

## 6. No-build / single-file HTML
Recharts ships a UMD build (`recharts/umd/Recharts.js`, global `Recharts`). React 19 ships no UMD, so pin React 18:
```html
<script src="https://cdn.jsdelivr.net/npm/react@18.3.1/umd/react.production.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/react-dom@18.3.1/umd/react-dom.production.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/prop-types@15.8.1/prop-types.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/recharts@3.10.1/umd/Recharts.js"></script>
<script>
  const { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } = Recharts;
  const h = React.createElement;
  ReactDOM.createRoot(document.getElementById('chart')).render(
    h(LineChart, { data, responsive: true, style: { width: '100%', height: 280 } },
      h(CartesianGrid, { vertical: false }), h(XAxis, { dataKey: 'day' }), h(YAxis, { width: 'auto' }),
      h(Tooltip), h(Line, { dataKey: 'otd', stroke: 'var(--chart-1)', dot: false }))
  );
</script>
```
Pin exact versions. In locked-down environments where only some CDNs are allowed, check which host is permitted and swap the base URL.

---

## 7. Data-viz honesty and color
**Honesty**
- Bars and areas start at zero. Lines may not, but label ticks clearly.
- Same metric, same scale across small multiples (share the domain).
- Show the denominator for rates when volumes differ a lot (a 50% fail rate on 4 parcels is noise).
- Time axis: consistent granularity, no silently missing periods (show gaps, do not interpolate across them), state the timezone.
- Never smooth (`type="monotone"`) data where exact points matter (counts per hour); `"linear"` or `"step"` instead.
- Partial periods (today, current week) visually marked (dashed segment or lighter bar) so a dip is not misread.

**Color**
- One highlight color + neutral gray for context beats a rainbow. Most charts need 1-3 colors.
- Categorical palette: max 6-8 hues, fixed order, defined as tokens; the same series keeps the same color on every chart of the app (a hub is always the same color).
- Semantic colors (green/amber/red) are reserved for status and good/bad meaning; never use them as plain categorical colors.
- Sequential data (heat, density): single-hue light-to-dark ramp. Diverging (vs target): two hues with a neutral midpoint at the target.
- Colorblind-safe: vary lightness as well as hue; avoid red/green-only distinctions; add markers or dash patterns for line series.
- Dark mode: lighten series colors (e.g. 300-400 shades) and lower grid contrast; never invert the whole chart.
- Taste Lila rule applies: no default purple/indigo series-1.

**Numbers**
- `Intl.NumberFormat` with explicit locale; compact notation for axes (`notation: 'compact'`), full values in tooltips.
- Percent vs percentage points: a change of a rate is in **pts** ("OTD -3.1 pts"), not %.
- Currency: unit in header/axis label, not in every tick.

---

## 8. Chart Pre-Flight
- [ ] Chart type matches the question (§1); no pie > 5 slices, no 3D, no gauge rows?
- [ ] Every chart has an explicit size (`responsive` + style, fixed px, or sized container)?
- [ ] Bars/areas start at zero; partial periods marked; gaps not interpolated?
- [ ] Target or threshold drawn when one exists?
- [ ] Horizontal gridlines only, no axis/tick lines, formatted ticks, `YAxis width="auto"`?
- [ ] Colors from tokens; semantic colors only for meaning; same series = same color app-wide?
- [ ] Distinguishable without color (labels, markers, dashes) and in grayscale for print?
- [ ] Tooltip values formatted with units; pts vs % correct?
- [ ] Animation off for sparklines, live data, MOTION ≤2 and print; otherwise `'auto'`?
- [ ] No `Cell` in new code (use `shape`); stacks rounded via `BarStack`?
- [ ] Stable references for `dataKey` functions, formatters, shapes; ≤ ~1k points per series?
- [ ] Theme follows UI light/dark via CSS variables (no reliance on canary-only theme APIs)?
- [ ] One chart library per project?
