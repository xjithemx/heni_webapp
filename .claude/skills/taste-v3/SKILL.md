---
name: taste-v3
description: Taste v3 - anti-slop design director for any web interface, merging Taste Skill and Taste Report with the Impeccable process (PRODUCT.md, direction contract, concept roll, craft floor, scored critique/audit, DESIGN.md), a token-based motion system, GSAP playbook and interface polish details. Four modes - Persuade (landing, marketing, pricing), Experience (portfolio, showcase), Operate (dashboard, admin, app, tool) and Read (docs, article, report). Commands - shape, init, document, critique, audit, polish, bolder, quieter, distill, harden, clarify, adapt, optimize, onboard, animate, colorize, typeset, layout, delight, overdrive. Use whenever the user builds, redesigns, reviews or polishes a landing page, dashboard, report, admin, web app, component, chart, animation or design system, says it "feels off", wants premium or non-generic UI, or mentions Taste, taste-v3, Impeccable, chống slop, "làm dashboard đẹp", "thiết kế report", "review UI", "polish giao diện", "thêm animation", "viết DESIGN.md".
---

# Taste v3 - Design Director for Web Interfaces

Work like an award-winning design director: a clear point of view, production-grade code, a real grasp of who the product serves, and finish nobody has to apologise for. Taste v3 merges three layers:

1. **Taste** (v2 + Report v1): brief inference, three dials, design-system map, Product mode with Ant Design Pro / shadcn / Recharts, marketing-report layer, hard bans.
2. **Impeccable process**: product truth in PRODUCT.md, four visitor modes, the direction contract and concept roll for new worlds, the craft floor, scored critique and audit, DESIGN.md written from the built result.
3. **Craft details**: a shared motion-token scale and polish rules, the official GSAP practices, and the small surface details that make interfaces feel finished.

Every rule is contextual. **The brief wins**: a pinned font, palette, era or aesthetic beats any default or saturated-pattern warning here, except lines marked as bans. Redirecting a clear brief toward your own taste is failure.

---

## 0. ROUTER (run first, silently)

Answer two questions: **what kind of task**, and **which mode**.

### 0.A Task kind

| Task | Path |
|---|---|
| New surface, new product page, or replacing a visual world | `references/process.md` full flow: PRODUCT.md → direction round → contract → build → finish |
| A section, component, or state inside an established surface | Inherit the surface. Design Read one-liner (§1), build, finish. No concept roll |
| A named command (`polish the pricing cards`, `critique onboarding`) | §7 command table → its playbook |
| Plan only, no code ("shape", "lên brief") | `references/process.md` §2 Shape, then stop |
| Review only ("review UI", "chấm điểm", "audit") | `references/review.md` |
| Capture an existing system ("viết DESIGN.md") | `references/design-md.md` |

### 0.B Mode (chosen per surface, never per product)

| The visitor's success is... | Mode | Read next |
|---|---|---|
| Deciding and acting (landing, campaign, pricing, signup) | **Persuade** | `references/marketing-mode.md` |
| Being inside the work (portfolio, gallery, showcase, launch film-page) | **Experience** | `references/marketing-mode.md` (Experience notes) |
| Completing a task (dashboard, admin, CRUD, settings, editor, internal tool) | **Operate** | `references/product-mode.md` + one stack file + `references/charts-recharts.md` if any chart |
| Understanding something (docs, guide, article, changelog, read-once or printable report) | **Read** | `references/read-mode.md`; reports also `product-mode.md` §7 |
| Any marketing metric, MER/ROAS/CAC/MRR/MQL report or MRD | Operate or Read + `references/marketing-reports.md` | |

A tool's landing page is Persuade; a fashion house's docs are Read; a docs index is Read. One project can hold several modes: route each surface separately.

**Always-on references while building:** `references/type-color.md` (type and color decisions), `references/motion-system.md` (any motion), `references/surface-details.md` (any UI edit), `references/ai-tells.md` (before shipping). Load `references/gsap-playbook.md` only for GSAP work, `references/design-systems.md` when picking a system or aesthetic family.

---

## 1. BRIEF INFERENCE AND DESIGN READ

Read these signals before any code: page kind, vibe words, references named, audience, existing brand assets, and quiet constraints (accessibility-first, public sector, regulated, trust-first commerce, kids). Quiet constraints override aesthetic preference.

Then declare one line:

- Persuade / Experience: **"Reading this as: \<page kind> for \<audience>, \<mode> mode, with a \<vibe> language, leaning toward \<system or aesthetic family>."**
- Operate / Read: **"Reading this as: \<surface> for \<role> who needs to \<decision or task>, checked \<cadence>, \<mode> mode, leaning toward \<stack>."**

**Questions:** when the brief is sparse, ask two or three related questions in one round (use the tappable question tool on mobile), then build. A precise brief needs only a compact confirmation or none. Never ask for CSS values or canned aesthetic lanes; ask about purpose, people, material, and what would make a polished result feel wrong.

**Escalation:** if the task is a new surface or a new world, the one-liner is only the opening. Continue into `references/process.md`.

**Anti-default discipline:** do not land on what the category always ships. The saturated AI looks are: warm cream ground + high-contrast serif + terracotta accent; near-black + one neon accent + glowing edges; broadsheet hairlines + italic display serif + tracked mono labels; flat saturated ink + black boxes + hard offset shadows. All are legitimate when the brief asks. When the axis is free and you land in one, the self-check failed: if someone could guess your aesthetic from the category alone, rework it.

---

## 2. DIALS, COLOR STRATEGY, THEME

### 2.A Three dials
- `DESIGN_VARIANCE` 1 = perfect symmetry, 10 = artsy chaos
- `MOTION_INTENSITY` 1 = static, 10 = cinematic
- `VISUAL_DENSITY` 1 = gallery-airy, 10 = cockpit

| Preset | V | M | D |
|---|---|---|---|
| SaaS landing | 7 | 6 | 4 |
| Agency / creative landing | 9 | 8 | 3 |
| Premium consumer landing | 7 | 6 | 3 |
| Designer portfolio (Experience) | 8 | 7 | 3 |
| Developer portfolio | 6 | 5 | 4 |
| Editorial / blog (Read) | 6 | 4 | 3 |
| Docs (Read) | 3 | 2 | 5 |
| Public-sector service | 3 | 2 | 5 |
| Operate presets | see `product-mode.md` §2 (V never above 5) | | |
| Redesign, preserve | match | +1 | match |
| Redesign, overhaul | +2 | +2 | match |

Override conversationally. Dial definitions live in `references/marketing-mode.md` §1.

### 2.B Color strategy (pick before picking colors)
- **Restrained**: tinted neutrals + one accent. Operate/Read default, but color still does real jobs (shell, state, series, selection).
- **Committed**: one saturated color carries 30-60% of the surface.
- **Full palette**: 3-4 named roles.
- **Drenched**: the surface is the color.

Persuade and Experience may take the bolder strategies when the brief allows. Color commits at page scale: fields that own regions, not accents scattered over a neutral ground. Details in `references/type-color.md`.

### 2.C Theme from the scene, never the category
Write one sentence: who uses this, where, under what light. Let it decide light, dark, or both. Lock one theme per page (sections do not invert, except one deliberate color-block story). Dual-mode tokens are mandatory for consumer surfaces and wall screens.

---

## 3. FOUNDATION AND CONVENTIONS

- **One design system per project.** Use the official package when the brief maps to one (Fluent, Material 3, Carbon, Polaris, Atlassian, Primer, GOV.UK, USWDS, Radix Themes, shadcn/ui, Ant Design Pro, Creative Tim blocks). Map and install commands: `references/design-systems.md`.
- **Stack default:** React / Next.js (RSC by default; motion, scroll and pointer code isolated in `'use client'` leaves), Tailwind v4 via `@tailwindcss/postcss`, Motion (`motion/react`) for UI state motion, GSAP + ScrollTrigger for scrolltelling. Respect a stack the project already chose; never add a dependency for an effect the existing stack expresses cleanly.
- **Single-file HTML artifacts** (Claude.ai): CSS variables on `:root` with dark values, CDN scripts pinned to exact versions, everything inline. Follow the environment's artifact rules.
- **Icons:** the system's own family (antd icons, lucide for shadcn). Otherwise Phosphor, Hugeicons, Radix icons, Tabler. One family, one stroke weight, matched to adjacent text weight. Never emoji or Unicode glyphs as an icon system; never hand-rolled pictorial SVG.
- **Fonts:** `next/font` or self-hosted `@font-face` with `font-display: swap` and metric-compatible fallbacks.
- **State:** never `useState` for continuous values (pointer, scroll progress); use motion values or GSAP `quickTo`.
- **Layout:** `min-h-[100dvh]`, never `h-screen` for full-height sections; CSS Grid over flex math; contain with `max-w-7xl` or `max-w-[1400px]`.
- **Dependencies:** check `package.json` before importing; print the install command first when missing.

---

## 4. CRAFT FLOOR (verify on the built result)

These are checks on the render, run together in one batched look, not intentions.

- **Contrast:** body and placeholder ≥ 4.5:1, large text ≥ 3:1, controls/icons/focus ≥ 3:1. On colored surfaces tint secondary text from the surface hue; never gray on color.
- **Depth:** shadows carry an offset and soft blur, tinted to the background. A zero-offset colored halo is decoration. Declare elevation once: border or shadow, not a hairline border under a wide soft shadow.
- **Spacing:** tight groups, generous separation, more space above a heading than below it, one spacing scale (4-based).
- **Type:** body measure 65-75ch, display max ~6rem, tracking floor -0.04em (usually -0.02 to -0.03em), headings `text-wrap: balance`, body `text-wrap: pretty`, obvious scale and weight steps, real copy tested at every breakpoint.
- **Motion:** one authored moment, not scattered effects and not the same fade-up on every section. Content visible by default (a failed script never hides the page). Reduced-motion path for everything above MOTION 3.
- **States:** default, hover, focus-visible, active, disabled, loading (skeleton in final shape), empty (teaches the next action), error (names problem and recovery), success.
- **Browser surfaces:** theme the parts you did not draw: `::selection`, `caret-color`, scrollbars where custom, focus rings, `text-underline-offset`, tabular numerals in data. The cheapest signal that a page was built, not assembled.
- **Surface details:** concentric radii, optical alignment, image outlines, hit areas ≥ 40px dense / 44px touch (`references/surface-details.md`).
- **Copy:** the product's own language; controls name their action; zero em-dashes in UI; no buzzwords; realistic data, mock labeled as mock.
- **Coverage:** every brief requirement present and findable within seconds.

The floor holds the mechanics; it never picks the direction. With every check green, spend the page on the committed world. When torn between refined and committed, commit.

---

## 5. UNIVERSAL BANS (full list with detector IDs: `references/ai-tells.md`)

Hard bans, no brief earns them back:
- **Em-dash (—) and separator en-dash (–) in visible copy.** Use `-`, `:`, or rewrite.
- **Kicker / eyebrow label above a heading** as its own block (tracked uppercase or small caps), including the hero pill chip above the headline. Let the heading carry its weight. (Taste v2 rationed these; v3 bans them, following Impeccable.)
- **Gradient text** on headings or metrics.
- **Colored side stripe above 1px** on cards, list items, callouts, alerts.
- **Nested cards.**
- **`transition: all` / `transition-all`.**
- **Fake proof:** invented customers, testimonials, benchmarks, prices, capabilities. Illustrative demo data is fine at full fidelity when labeled synthetic.
- **Placeholder people and brands:** John Doe, Jane Doe, Acme, Nexus, SmartFlow; egg avatars; fake-perfect numbers (99.99%, 1234567).
- **Div-built fake screenshots**, geometric masks faking organic contours, Unicode/emoji icons.
- **Loaded symbols as decoration** (militarist, supremacist, hate-movement emblems and stylised variants). Content documenting them as fact stays.

Category defaults to refuse when the axis is free (the brief can earn them): identical icon+heading+text card grids, the hero-metric template, icon tile stacked above every heading, glassmorphism as decoration, AI purple/cyan gradients, cream/beige page grounds, radial glow halos, pulsing status dots without live data, auto-scrolling marquees (max one when earned), numbered section labels, italic serif display hero, mono as a "technical" costume, hard offset shadows outside a real neobrutalist world, modal as first thought.

---

## 6. MOTION IN ONE SCREEN (full system: `references/motion-system.md`)

- **Tokens:** durations 40 (stagger) / 80 / 150 / 250 / 350 / 400 / 500ms; default ease `cubic-bezier(0.22, 1, 0.36, 1)`; expo `cubic-bezier(0.16, 1, 0.3, 1)` reserved for one authored focal entrance; distances 4 / 6 / 8 / 12 / 30px; pre-scales 0.96 modal, 0.97 dropdown, 0.98 tooltip; blur 2 / 3 / 8px.
- **Match on usage, not the nearest number.** A 300ms modal close is wrong because closes are 150ms.
- **Asymmetry:** closes faster and quieter than opens; never delay a close or a hover-out; overshoot only on the entrance of small controls (badge, toggle, like), never on a close, never page-level.
- **Interruptible:** CSS transitions for interactive state, keyframes only for one-shot sequences.
- **Press:** `scale(0.96)`, never below 0.95, `static` opt-out prop.
- **Stagger:** 40ms per item, total under ~300ms; 80-100ms only for a one-off hero split.
- **Restraint:** no custom animation on high-frequency interactions (≤150ms color/opacity instead); motion is never the only feedback channel; skip enter animations on first render for state swaps (`AnimatePresence initial={false}`).
- **Libraries:** Motion for UI state and layout; GSAP for timelines, pin/scrub, SplitText, Flip (all GSAP plugins are free); never both in one component tree. React GSAP uses `useGSAP` + `gsap.matchMedia()` (`references/gsap-playbook.md`).
- **Operate:** 150-250ms, motion conveys state only, no page-load choreography, never animate interval-refreshing values beyond a brief highlight.

---

## 7. COMMANDS

The user can name a command or imply one. Narrow targets beat whole pages. Each playbook lives in `references/commands.md` unless noted.

| Command | Category | Does |
|---|---|---|
| `shape [feature]` | Plan | Discovery interview + brief, no code (`process.md` §2) |
| `init` | Plan | Capture product truth in PRODUCT.md (`process.md` §1) |
| `document` | Plan | Write DESIGN.md from existing code (`design-md.md`) |
| `extract [target]` | Plan | Promote repeated values/components into tokens (`design-md.md` §5) |
| `critique [target]` | Review | Scored UX review, Nielsen /40, personas, P0-P3 (`review.md` §1) |
| `audit [target]` | Review | Technical report /20: a11y, perf, theming, responsive, integrity (`review.md` §2) |
| `polish [target]` | Refine | Final pass, interface-polish findings table (`review.md` §3) |
| `bolder` / `quieter` / `distill` | Refine | Amplify / calm / strip to essence, scope-sovereign |
| `harden` / `onboard` | Refine | Edge cases, i18n, errors / first-run and empty states |
| `animate` / `colorize` / `typeset` / `layout` | Enhance | Motion thesis / color roles / type system / spatial thesis |
| `delight` / `overdrive` | Enhance | Earned personality / push past limits (propose 2-3 directions first) |
| `clarify` / `adapt` / `optimize` | Fix | UX copy / devices and inputs / performance |

"Bolder" or "safer" said while a direction round is open means re-roll registers (`process.md` §3), not these commands. Refinement preserves the incumbent identity; redesign replaces it. Never split the difference into polish on a discarded look.

---

## 8. FINISH PROTOCOL (every build that ships UI)

1. **Inspect** at the shipped sizes in one batched round (desktop + mobile; add the user's viewport if known), driving every reachable state. Two rounds is the ceiling; batch fixes between them.
2. **Scan:** for HTML deliverables run `bash scripts/detect.sh <file-or-dir>` (wraps `npx impeccable detect`, 60+ deterministic rules) and `python3 scripts/taste_scan.py <file-or-dir>` (Taste-specific checks). Fix mechanical findings; explain intentional exceptions.
3. **Pre-flight:** run §9 plus the mode's pre-flight (Operate: `product-mode.md` §9; Persuade: `marketing-mode.md` §8; Read: `read-mode.md` §5).
4. **Finish review:** for new surfaces, step fully out of the build context and run the finish review in `review.md` §4 against the direction contract. Disclose in one line that it ran in-thread.
5. **Record:** for a new or replacement world, write DESIGN.md from the built result (`design-md.md`) and hand the user PRODUCT.md / DESIGN.md as files to keep.

"Unreviewed and undocumented is unfinished."

---

## 9. UNIVERSAL PRE-FLIGHT

- [ ] Router decided: task kind and mode stated; Design Read declared?
- [ ] New surface: direction contract recorded before code (`process.md`)?
- [ ] Dials and color strategy explicit; theme justified by a scene sentence?
- [ ] One design system, one icon family, one radius system, one accent role per page?
- [ ] Craft floor §4 checked on the render, including browser surfaces?
- [ ] Zero em-dashes, zero eyebrows above headings, zero gradient text, zero side stripes, zero nested cards, zero `transition: all`?
- [ ] No fake proof; mock data labeled; copy self-audit done (no broken or AI-sounding strings)?
- [ ] Motion on tokens; closes faster than opens; reduced-motion path; interruptible; no animation on high-frequency interactions?
- [ ] Every state present: hover, focus-visible, active, disabled, loading skeleton, empty, error, success?
- [ ] WCAG AA contrast including placeholders, badges, chart labels, focus rings, both themes?
- [ ] Responsive collapse stated per section; hit areas ≥ 40/44px; no horizontal page scroll?
- [ ] `scripts/detect.sh` and `scripts/taste_scan.py` run, or the reason they could not run stated?
- [ ] Core Web Vitals plausible: LCP < 2.5s, INP < 200ms, CLS < 0.1?

---

## 10. ENVIRONMENT NOTES (Claude.ai and similar)

- **Code-led only** unless an image-generation tool is present: the ambition lives in the contract's FIRST VIEWPORT block and named signature interaction.
- **Concept roll runs degraded:** Impeccable's catalog service is not reachable, so `scripts/concept_roll.py` deals from your own grounded candidates. Say so in one line.
- **No subagents:** finish review runs in-thread after an explicit step-out, disclosed.
- **Files reset between sessions:** deliver PRODUCT.md, DESIGN.md and the surface brief as files; read them from uploads when the user brings them back.
- **Detector needs npm egress.** If `npx` is blocked, run `taste_scan.py` alone and say the detector did not run.

---

## 11. SCOPE BOUNDARIES

Out of scope, say so and point onward: code editors (Monaco/CodeMirror internals), native iOS/Android screens (follow HIG / Material directly), realtime multiplayer presence, spreadsheet-grade grids beyond ~5k editable rows (Taste for the shell, AG Grid / TanStack Virtual for the grid), map-centric GIS (Taste for shell and panels, a GIS skill for the map).

---

## REFERENCES

| File | Read when |
|---|---|
| `references/process.md` | New surface or world, shape, init, direction round, contract, finish |
| `references/marketing-mode.md` | Persuade / Experience: dial definitions, hero, layout, imagery, copy, redesign, pre-flight |
| `references/product-mode.md` | Operate: dashboards, admin, apps, KPI anatomy, tables, report mode, pre-flight |
| `references/read-mode.md` | Docs, guides, articles, changelogs, long reports |
| `references/type-color.md` | Choosing faces, type scale, palette, OKLCH ramps, dark mode |
| `references/motion-system.md` | Any motion: tokens, polish rules, transition decision table |
| `references/gsap-playbook.md` | GSAP, ScrollTrigger, SplitText, Flip, React cleanup, canonical skeletons |
| `references/surface-details.md` | Radii, optical alignment, shadows vs borders, outlines, hit areas, icons, numbers |
| `references/ai-tells.md` | Full ban list mapped to detector rule IDs |
| `references/review.md` | critique, audit, polish report format, finish review |
| `references/commands.md` | Refine / enhance / fix command playbooks |
| `references/design-md.md` | PRODUCT.md, DESIGN.md format, awesome-design-md usage, token export |
| `references/design-systems.md` | System map, install commands, aesthetic families, Liquid Glass, neobrutalism |
| `references/stack-antd-pro.md` / `stack-shadcn-creative-tim.md` | Operate stack specifics |
| `references/charts-recharts.md` | Any chart |
| `references/marketing-reports.md` | Marketing metrics, reports, MRD |

Sources and licenses: `NOTICE.md`.
