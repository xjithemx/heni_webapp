# Stack: shadcn/ui + Creative Tim UI blocks

Source: `creativetimofficial/ui` (read Oct 2026), including its own agent skill (`skills/creative-tim-ui`). A shadcn/ui registry with 390+ React + Tailwind v4 blocks across 40+ categories (hero, pricing, KPI, stats, charts, tables, CRUD, account, auth, billing, ecommerce, AI agents, modals...). Blocks are copied into your repo as source, so you own and edit them.

## When to pick it
- Next.js (App Router), Vite, Remix or Astro app with Tailwind
- SaaS product UI that must carry a custom brand
- You want app screens and marketing pages from one primitive set (shadcn), so Marketing and Product mode share tokens

## 1. Install
```bash
npx shadcn@latest init                      # prerequisite
npx @creative-tim/ui@latest init            # optional, auto-detects framework
npx @creative-tim/ui@latest add <block>     # e.g. invoices-01, transaction-history-01, cruds-01
npx shadcn@latest add https://www.creative-tim.com/ui/r/<block>.json   # equivalent via shadcn CLI
```
Discovery: browse `https://www.creative-tim.com/ui/blocks` or the AI index `https://www.creative-tim.com/ui/llms.txt`. Some blocks are PRO and need `CREATIVE_TIM_UI_API_KEY` in `.env.local` (never commit it); ask the user to set it rather than handling the key yourself.

Treat installed blocks as a **starting composition**, then apply Taste: replace demo copy and data, re-token colors, cut what the screen does not need.

## 2. Design philosophy (Creative Tim's, compatible with Taste)
- **The 95% rule**: build the common case (tables, cards, sidebars, charts, forms, modals) exceptionally well; do not add config props for hypothetical needs. A plain `Table` beats a `DataTable` with 12 flags nobody asked for.
- **The "light" principle**: a block is done when nothing is left to remove. Question every wrapper div, prop, animation, icon. No icons that repeat the text next to them.
- **Research before rendering**: what decision does this screen help someone make?
- **Build on foundations**: compose shadcn `Card`, `Table`, `Button`, `Badge`, `Sheet`, `Dialog`; never re-implement them.
- **Real use, not demo use**: a gradient card header that encodes nothing is decoration; a badge that turns red on breach is communication. Only the second ships.

## 3. Conventions worth adopting
**Brand and color**
- Creative Tim's own brand accent is orange (`orange-500/600`). That is *their* brand: use orange only when building in Creative Tim's look; otherwise map the accent to the user's brand token (`--primary`). Taste's Color Consistency Lock applies.
- Never `violet / purple / indigo` as default accent (same as Taste's Lila rule).
- Neutrals: `slate / gray / zinc` (pick one family). Status: `emerald` success, `amber` warning, `red` error, `blue` info.

**Typography**
- `text-sm` (14px) for all readable content: labels, descriptions, table cells, list items.
- `text-xs` only for badge pills, avatar initials, mono timestamps, uppercase sidebar group headers, tiny 24-28px action buttons.
- Headings: `text-base` card titles, `text-lg` section, `text-xl` page, `text-2xl` stat values.
- Never arbitrary sizes (`text-[11px]`).

**Tailwind v4 discipline**
- No arbitrary values: `h-96` not `h-[380px]`, `max-w-sm` not `max-w-[85%]`, `gap-3.5` not `gap-[14px]`.
- Standard breakpoints only (`sm md lg xl 2xl`).
- No inline `style={{}}` for things Tailwind expresses (charts are the exception: Recharts sizing props/styles are fine).

**Components**
- Grouping: `Card > CardHeader + CardContent`; card titles `text-sm font-medium` (muted for KPI labels).
- KPI grid cards: `CardContent className="px-4 py-0"`, the grid sets rhythm.
- Sidebar: `aside.w-64.border-r.bg-muted/30`, nav buttons `rounded-md px-3 py-2 text-sm`, active = `bg-background text-foreground shadow-sm`.
- Any overflowing list: `ScrollArea`, not raw `overflow-y-auto`.
- Status badge: dot + text, `rounded-full border px-2 py-0.5 text-xs font-medium` with tinted bg/text/border from the status color.
- Table row actions: `Button variant="ghost" size="sm" className="h-6 px-2 text-xs"`, max 2 visible.

## 4. Canonical KPI card + grid
```tsx
import { Card, CardContent } from "@/components/ui/card"
import { ArrowDownRight, ArrowUpRight, Info } from "lucide-react"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"

type Kpi = { label: string; value: string; delta: number; compare: string; lowerIsBetter?: boolean; definition: string }

export function KpiCard({ k }: { k: Kpi }) {
  const good = k.lowerIsBetter ? k.delta <= 0 : k.delta >= 0
  const Arrow = k.delta >= 0 ? ArrowUpRight : ArrowDownRight
  return (
    <Card className="py-4">
      <CardContent className="px-4 py-0">
        <div className="flex items-center justify-between">
          <p className="text-muted-foreground text-sm">{k.label}</p>
          <Tooltip>
            <TooltipTrigger aria-label={`Definition of ${k.label}`}><Info className="text-muted-foreground size-4" /></TooltipTrigger>
            <TooltipContent className="max-w-xs text-sm">{k.definition}</TooltipContent>
          </Tooltip>
        </div>
        <p className="mt-1 truncate text-2xl font-semibold tabular-nums">{k.value}</p>
        <p className={`mt-1 inline-flex items-center gap-1 text-sm tabular-nums ${good ? "text-emerald-700 dark:text-emerald-400" : "text-red-700 dark:text-red-400"}`}>
          <Arrow className="size-4" aria-hidden />
          {k.delta > 0 ? "+" : ""}{k.delta.toFixed(1)}%
          <span className="text-muted-foreground">{k.compare}</span>
        </p>
      </CardContent>
    </Card>
  )
}

// grid: 4 → 2 → 1
<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">{kpis.map(k => <KpiCard key={k.label} k={k} />)}</div>
```

## 5. Hydration safety (Next.js / SSR)
- Never put `new Date()`, `Date.now()`, `Math.random()` or `toLocaleString/DateString/TimeString()` in `useState` initialisers or render output that runs on the server. Server and client values differ and React throws a hydration mismatch.
- Seed SSR state with static strings; start live values in `useEffect` / `setInterval` (client only).
- Format dates/numbers with an explicit locale and timezone (`Intl.NumberFormat('vi-VN')`, `Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Ho_Chi_Minh' })`) or pre-format on the server.
- `suppressHydrationWarning` only for intentional mismatches (a live clock).

## 6. Charts on this stack
shadcn's `chart.tsx` (shipped in the Creative Tim registry too) wraps Recharts: `ChartContainer` (sets `aspect-video`, muted axis ticks, border-colored grid, and a `ResponsiveContainer`), `ChartConfig` (series key → label, icon, color or `{ light, dark }` theme colors exposed as `--color-<key>` CSS variables), `ChartTooltip` + `ChartTooltipContent`, `ChartLegend` + `ChartLegendContent`.

```tsx
const config = {
  otd: { label: "On-time delivery", color: "var(--chart-1)" },
  target: { label: "Target", color: "var(--muted-foreground)" },
} satisfies ChartConfig

<ChartContainer config={config} className="h-64 w-full aspect-auto">
  <LineChart data={data} margin={{ left: 0, right: 8 }}>
    <CartesianGrid vertical={false} />
    <XAxis dataKey="day" tickLine={false} axisLine={false} tickMargin={8} />
    <YAxis tickLine={false} axisLine={false} width="auto" domain={[85, 100]} unit="%" />
    <ChartTooltip content={<ChartTooltipContent />} />
    <ReferenceLine y={95} stroke="var(--color-target)" strokeDasharray="4 4" label={{ value: "Target 95%", position: "insideTopRight", fontSize: 12 }} />
    <Line dataKey="otd" stroke="var(--color-otd)" strokeWidth={2} dot={false} />
  </LineChart>
</ChartContainer>
```
Override `aspect-video` with an explicit height (`h-64 aspect-auto`) on dashboards so card rows align. Everything else about charts: `charts-recharts.md`.
