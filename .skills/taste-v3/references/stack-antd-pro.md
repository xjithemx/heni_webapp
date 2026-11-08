# Stack: Ant Design Pro

Source: `ant-design/ant-design-pro` v6.0.x (read Oct 2026). Stack: React 19, antd 6, `@ant-design/pro-components` 3.x, Umi Max 4, `@tanstack/react-query`, `@ant-design/plots` (G2) for charts, Tailwind v4 + `antd-style` for styling, Biome for lint.

Version note: ProComponents **3.x is still tagged beta on npm** (stable `latest` is 2.8.x). The Ant Design Pro template pins 3.x. For a new standalone project outside the template, either accept 3.x beta to match antd 6, or use antd 5 + ProComponents 2.8 stable. Say which one you chose.

## When to pick it
- Internal / enterprise back-office with many list-search-edit pages
- Permissions per route, i18n (8 locales built in), mock + OpenAPI-generated services
- Team already on antd, or orgs where antd is the house system (common in CN/SEA enterprise)

Do not pick it for consumer-facing SaaS that needs a distinctive brand, or for a 2-page tool (overkill; use shadcn).

## 1. Layout settings (`config/defaultSettings.ts`)
```ts
export default {
  navTheme: 'light',        // 'light' | 'realDark'
  colorPrimary: '#1677ff',  // replace with brand accent; never purple-by-default
  layout: 'mix',            // 'side' | 'top' | 'mix'
  contentWidth: 'Fluid',    // 'Fluid' for dashboards/tables, 'Fixed' for content sites
  fixedHeader: false,
  fixSiderbar: true,
  colorWeak: false,
  title: 'Hub Ops',
  token: {},                // ProLayout tokens for fine control of sider/header colors
};
```
Routes live in `config/routes.ts`: `name` maps to the `menu.<name>` i18n key, `icon` takes an `@ant-design/icons` name, `access: 'canAdmin'` gates visibility (defined in `src/access.ts`).

## 2. Theming
Global tokens via `config/config.ts`:
```ts
antd: {
  configProvider: {
    theme: {
      cssVar: true,
      token: { colorPrimary: '#0f766e', borderRadius: 6, fontFamily: 'Inter, system-ui, sans-serif' },
    },
  },
},
```
- Dark: `theme.darkAlgorithm`; compact density: `theme.compactAlgorithm` (good for DENSITY ≥7). Algorithms can be combined.
- Styling priority (from the template's own rules): **Tailwind for layout → `antd-style` `createStyles(({ token }) => ...)` when you need theme tokens → CSS Modules → Less only for legacy**.
- Read colors from tokens (`token.colorTextSecondary`, `token.colorSplit`, `token.colorBgContainer`), never hardcode hex inside components. That is what makes dark mode free.
- Taste rules still apply on top: one accent, no AI-purple default, shape lock (`borderRadius` token is the single radius source).

## 3. Core building blocks
| Need | Component |
|---|---|
| Page frame with title, breadcrumb, tabs, extra actions | `PageContainer` |
| Responsive dashboard grid wrapper | `GridContent` + antd `Row gutter={24}` / `Col xl lg md sm xs` |
| Search form + table + pagination + toolbar in one | `ProTable` (`request`, `columns`, `valueType`, `valueEnum`, `search`, `toolBarRender`, `rowSelection`, `actionRef`) |
| Read-only record view reusing table columns | `ProDescriptions` (pass the same `columns`) |
| Batch action bar on selection | `FooterToolbar` |
| Forms with layout/validation helpers | `ProForm`, `StepsForm`, `ModalForm`, `DrawerForm` |
| Single statistic, countdown | antd `Statistic`, `Statistic.Timer` |
| Process status | antd `Steps` |
| Grouped label:value | antd `Descriptions` |
| Outcomes | antd `Result` |

`valueType` does formatting for you (`'dateTime'`, `'money'`, `'percent'`, `'digit'`, `'textarea'`, `'option'` for the actions column). Prefer it over custom `render` for plain formatting.

## 4. Canonical Table list page (pattern from `src/pages/table-list`)
```tsx
import { PageContainer, ProTable, FooterToolbar, ProDescriptions, type ProColumns, type ActionType } from '@ant-design/pro-components';
import { Button, Drawer } from 'antd';
import { useRef, useState } from 'react';

type Row = { awb: string; hub: string; status: 0 | 1 | 2 | 3; cod: number; updatedAt: string };

const columns: ProColumns<Row>[] = [
  { title: 'AWB', dataIndex: 'awb', copyable: true },
  { title: 'Hub', dataIndex: 'hub' },
  {
    title: 'Status', dataIndex: 'status',
    valueEnum: {
      0: { text: 'Created', status: 'Default' },
      1: { text: 'In transit', status: 'Processing' },
      2: { text: 'Delivered', status: 'Success' },
      3: { text: 'Failed attempt', status: 'Error' },
    },
  },
  { title: 'COD (VND)', dataIndex: 'cod', valueType: 'money', sorter: true, hideInSearch: true, align: 'right' },
  { title: 'Updated', dataIndex: 'updatedAt', valueType: 'dateTime', sorter: true, hideInSearch: true },
];

export default function ParcelList() {
  const actionRef = useRef<ActionType | null>(null);
  const [selected, setSelected] = useState<Row[]>([]);
  const [current, setCurrent] = useState<Row>();

  return (
    <PageContainer>
      <ProTable<Row>
        headerTitle="Parcels"
        actionRef={actionRef}
        rowKey="awb"
        search={{ labelWidth: 'auto' }}
        request={fetchParcels /* returns { data, success, total } */}
        columns={[
          { ...columns[0], render: (dom, row) => <a onClick={() => setCurrent(row)}>{dom}</a> },
          ...columns.slice(1),
        ]}
        rowSelection={{ onChange: (_, rows) => setSelected(rows) }}
        toolBarRender={() => [<Button key="export">Export</Button>]}
      />
      {selected.length > 0 && (
        <FooterToolbar extra={<span>{selected.length} selected · COD {sumCod(selected)}</span>}>
          <Button>Reassign hub</Button>
          <Button type="primary">Mark delivered</Button>
        </FooterToolbar>
      )}
      <Drawer size={600} open={!!current} onClose={() => setCurrent(undefined)} closable={false}>
        {current && (
          <ProDescriptions<Row> column={2} title={current.awb} dataSource={current} columns={columns as any} />
        )}
      </Drawer>
    </PageContainer>
  );
}
```
Notes: `request` must resolve `{ data, success, total }`. After mutations call `actionRef.current?.reload()` (or `reloadAndRest()` to clear selection). Check current prop names with `npx antd info <Component>` before writing (antd 6 renamed some props, e.g. `Card variant="borderless"` replaced `bordered={false}`, Drawer uses `size`).

## 5. Analysis dashboard skeleton (pattern from `src/pages/dashboard/analysis`)
```tsx
<GridContent>
  <Row gutter={24}>
    {kpis.map(k => (
      <Col key={k.key} xs={24} sm={12} xl={6} style={{ marginBottom: 24 }}>
        <ChartCard variant="borderless" title={k.label} action={<InfoTooltip text={k.definition} />}
          total={fmt(k.value)} footer={<Field label={k.footLabel} value={fmt(k.footValue)} />} contentHeight={46}
          loading={loading}>
          <Trend flag={k.delta >= 0 ? 'up' : 'down'} reverseColor={k.lowerIsBetter}>WoW {pct(k.delta)}</Trend>
        </ChartCard>
      </Col>
    ))}
  </Row>
  {/* main trend: Card with Tabs (metric switch) + tabBarExtraContent = range presets + RangePicker */}
  {/* row: Col xl=12 ranking table | Col xl=12 proportion chart */}
  {/* tabbed detail by segment */}
</GridContent>
```
`ChartCard`, `Field`, `Trend` are page-local components in the template (copy them from `src/pages/dashboard/analysis/components`), not library exports. Wrap each section in `Suspense` with a skeleton fallback; the template lazy-loads heavy widgets (map) with `React.lazy`.

## 6. Charts in Ant Design Pro
Default is `@ant-design/plots` (G2): `Area`, `Column`, `Line`, `Pie`, `Gauge`, `Liquid`, `WordCloud`. Stay with it inside an antd app; do not add Recharts alongside it (one chart library per project). The chart-choice and honesty rules in `charts-recharts.md` §1 and §7 apply to G2 charts too. Use Recharts with antd only if the org standardises on Recharts across apps; then theme it from antd tokens.

Skip the Taste-forbidden bits even if the template does them: the template's sparkline gradient to `#975FE4` (purple) and the blue-to-green gradient progress are demo flair. Use the brand accent or a single neutral.

## 7. Gotchas (from the template's own rules)
- `src/services/ant-design-pro/` is OpenAPI-generated: regenerate with `npm run openapi`, never hand-edit.
- `npm run simple` strips demo pages irreversibly: commit first.
- Delete `src/.umi` and restart if the dev server behaves oddly.
- Biome, not ESLint/Prettier. `npx antd lint ./src` must pass.
- Mocks: global `mock/` and co-located `src/pages/**/_mock.ts`. Mock creds `admin` / `ant.design`.
- Each page folder co-locates `index.tsx`, `service.ts`, `_mock.ts`, `data.d.ts`, styles.
