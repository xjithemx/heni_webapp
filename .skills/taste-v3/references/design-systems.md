# Design Systems and Aesthetic Families

## 1. Real systems (use the official package; one per project)

| Brief reads as | Reach for |
|---|---|
| Microsoft / enterprise SaaS | `@fluentui/react-components` |
| Google / Material product | `@material/web` + Material 3 tokens |
| IBM-style enterprise analytics | `@carbon/react` + `@carbon/styles` |
| Shopify app surfaces | Polaris web components |
| Atlassian / Jira-style | `@atlaskit/*` + `@atlaskit/tokens` |
| GitHub-style devtool | `@primer/css` or `@primer/react-brand` |
| UK public sector | `govuk-frontend` |
| US public sector / trust-first | `uswds` |
| Fast local-business MVP | Bootstrap 5.3 |
| Modern accessible React | `@radix-ui/themes` |
| Modern SaaS, own components | shadcn/ui |
| Tailwind marketing | Tailwind v4 utilities + dark variant |
| Enterprise admin, CRUD-heavy, antd team | Ant Design Pro (`stack-antd-pro.md`) |
| SaaS app / blocks on shadcn | Creative Tim UI blocks (`stack-shadcn-creative-tim.md`) |
| Charts in React | Recharts 3.x (`charts-recharts.md`) |
| Neobrutalist product UI | RetroUI (retroui.dev) on shadcn conventions (§3) |

## 2. Aesthetic families (no package)

| Family | Implementation | Guardrails |
|---|---|---|
| Glassmorphism | `backdrop-filter`, layered borders | Only as a specific effect over real imagery; solid fallback for `prefers-reduced-transparency`; never default, never Operate |
| Bento | Grid with mixed cell sizes | Rhythm, exact cell count, real visual variation |
| Brutalism | Native CSS, raw structure, mono where data | Must still pass contrast and states |
| Editorial / magazine | Asymmetric grid, generous whitespace, a justified serif only when the world is genuinely editorial | The broadsheet-hairline + italic-serif look is a saturated AI default |
| Dark tech | Off-black ground, one accent | Neon glow and cyan-on-dark are tells; mono only for real code/data |
| Aurora / mesh | Layered radial gradients or SVG | Not as a hero halo behind text; must come from the world |
| Kinetic type | CSS, scroll-driven, GSAP SplitText | One focal moment, reduced-motion fallback |
| Liquid Glass (Apple) | Web approximation only (§4) | Label as approximation |

## 3. Neobrutalism (reference: RetroUI, seen in DesignHandoff)
A legitimate world when chosen deliberately, and the only world that earns hard offset shadows.
- Signature: 2-3px solid ink borders, zero-blur offset shadows (`4px 4px 0 var(--ink)`), flat saturated fills (yellow, pink, blue), chunky display face, square or small radii.
- Press pattern is part of the language: hover shifts `translate(2px, 2px)` while the shadow shrinks to 2px; active shifts 4px with no shadow, so the element "lands" on its shadow.
- Fix what RetroUI ships: name transition properties (`transition-property: transform, box-shadow, background-color` at 100-150ms) instead of `transition-all`; never set transitions on `*`; dark mode needs light shadows at reduced alpha; keep focus rings visible beyond the border; keep body text in a readable workhorse face.
- Do not use it as a costume on an Operate product whose users did not choose it.

## 4. Liquid Glass (honest web approximation)
No Apple CSS package exists for the web. Label it as an approximation.

```css
.liquid-glass-web-approx {
  position: relative; isolation: isolate; overflow: hidden; border-radius: 999px;
  border: 1px solid rgb(255 255 255 / .32);
  background: linear-gradient(135deg, rgb(255 255 255 / .30), rgb(255 255 255 / .08)), rgb(255 255 255 / .12);
  backdrop-filter: blur(24px) saturate(180%) contrast(1.05);
  -webkit-backdrop-filter: blur(24px) saturate(180%) contrast(1.05);
  box-shadow: inset 0 1px 0 rgb(255 255 255 / .48), inset 0 -1px 0 rgb(255 255 255 / .12), 0 18px 60px rgb(0 0 0 / .18);
}
@media (prefers-reduced-transparency: reduce) {
  .liquid-glass-web-approx { background: rgb(255 255 255 / .96); backdrop-filter: none; -webkit-backdrop-filter: none; }
}
```

## 5. Install commands

```bash
npm install @material/web
npm install @fluentui/react-components
npm install @carbon/react @carbon/styles
npm install @radix-ui/themes
npx shadcn@latest init && npx shadcn@latest add button card badge separator input
npm install --save @primer/css
npm install govuk-frontend
npm install uswds
npm install bootstrap
npm install tailwindcss @tailwindcss/postcss
npm install antd @ant-design/pro-components @ant-design/icons
npm install recharts
npx @creative-tim/ui@latest add <block-name>
npm install motion                 # Motion (import from "motion/react")
npm install gsap @gsap/react       # all GSAP plugins included, free
npx transitions-dev add <name>     # transitions.dev recipes (see motion-system.md §5)
npx impeccable detect <path|url>   # deterministic slop/quality detector
```
