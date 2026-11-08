# DESIGN.md, Tokens and Handoff

Sources: Impeccable `document` / `extract`, the Google DESIGN.md spec (popularised by Stitch), VoltAgent awesome-design-md (84 brand analyses), and DesignHandoff's export formats.

## 1. What DESIGN.md is
A plain-markdown design-system file that agents read to keep UI consistent. YAML frontmatter carries machine-readable tokens (**tokens are normative**); the markdown body explains how to apply them. Sections may be omitted, but those present keep the canonical order. Lint with `npx @google/design.md lint DESIGN.md` when npm is available.

## 2. When to write it
- **New or replacement world:** at finish, from the built result, never before the build (a rulebook written first gets defended against reality).
- **`document` on an existing project:** scan, extract, confirm qualitative language with the user, write.
- **Existing DESIGN.md:** show it; offer refresh, overwrite or merge. Never overwrite silently. Ordinary extensions do not rewrite it; report pre-existing drift without repairing it unasked.

## 3. Format

```markdown
---
version: alpha
name: <project>-design-system
description: "<2-3 sentences: ground, ink, the one accent and where it appears, display type, the signature move>"
colors:
  primary: "#2f5bd3"          # one format project-wide (hex or oklch); descriptive slugs for brand colors
  on-primary: "#ffffff"
  ink: "#16181d"
  ink-muted: "#5b6170"
  canvas: "#fbfbfa"
  surface-1: "#f2f2ef"
  hairline: "#e3e3de"
  semantic-success: "#1f8a4c"
typography:
  display-lg: { fontFamily: <Face>, fontSize: 56px, fontWeight: 600, lineHeight: 1.05, letterSpacing: -1.6px }
  body: { fontFamily: <Face>, fontSize: 16px, fontWeight: 400, lineHeight: 1.55, letterSpacing: 0 }
  label: { fontFamily: <Face>, fontSize: 13px, fontWeight: 500, lineHeight: 1.3, letterSpacing: 0 }
rounded: { sm: 6px, md: 10px, lg: 16px, pill: 9999px }
spacing: { xs: 4px, sm: 8px, md: 16px, lg: 24px, xl: 40px, section: 96px }
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
    typography: "{typography.label}"
    rounded: "{rounded.md}"
    padding: 10px 16px
  button-primary-hover: { backgroundColor: "#2549b3" }
---

# Design System: <Project>

## Overview            (mood, density, philosophy, key characteristics as bullets)
## Colors              (Primary / Secondary / Tertiary / Neutral roles; Named Rules)
## Typography          (families, hierarchy table, principles, substitutes for proprietary faces)
## Layout              (spacing scale, grid and containers, whitespace philosophy)
## Elevation & Depth   (shadow vocabulary, surface ladder)
## Shapes              (radius scale, image geometry)
## Components          (buttons, chips, cards, inputs, navigation, signature components, with states)
## Do's and Don'ts     (concrete guardrails with token references)
```

Extended sections used by awesome-design-md and worth adding when useful: **Responsive Behavior** (breakpoints, touch targets, collapse strategy), **Motion** (the token scale from `motion-system.md` and the signature interaction), **Iteration Guide** (how an agent should extend the system), **Known Gaps** (what was not observable).

Rules: one source of truth per value (never redefine a token in prose with a different value); one entry per component variant; express only Primary + Neutral when the project has one accent rather than inventing Secondary/Tertiary; Do's and Don'ts reference tokens (`Use {colors.primary} only for the primary CTA, focus ring, links`).

## 4. Using awesome-design-md
The collection (`github.com/VoltAgent/awesome-design-md`, `design-md/<site>/DESIGN.md`, previews at getdesign.md) is a **vocabulary and calibration library**, not a costume rack.
- Good uses: learning how real systems structure surface ladders, accent scarcity, type ramps and Do/Don't lists; calibrating finish level; borrowing a *discipline* ("one accent used only on brand mark, focus and primary CTA").
- Do not clone a brand's identity for a different product (trademark and trade-dress risk, and it is the category-default move in disguise). When a user asks for "like Stripe", extract the discipline (weight-300 elegance, gradient restraint), then build the product's own world.
- Proprietary faces named in those files need open substitutes.
- Coverage is marketing-heavy: dashboards and chart palettes are barely documented, so Operate work still relies on `product-mode.md` and `charts-recharts.md`.

## 5. extract: promote repeated patterns
Find values repeated 3+ times (colors, radii, spacing, shadows, type combos) and components re-implemented in several places. Promote genuinely reusable ones to tokens or shared components; leave one-off local exceptions alone. Update DESIGN.md frontmatter and the body together.

## 6. Handoff exports
When the deliverable is a spec for developers (DesignHandoff-style), offer:
- **CSS custom properties** on `:root`, colors also as `--name-rgb: r, g, b` for alpha use, typography as `--role-font-size` etc.
- **JSON / W3C design tokens** (`{ "$value": "#2f5bd3", "$type": "color", "$description": "Primary action" }`, `$type: dimension` for spacing).
- **Tailwind v4 `@theme`** block mirroring the tokens.
- A contrast rating per color pair (AA / AAA / fail) next to each swatch.
- Measurements and spacing with their source coordinates when extracted from a mock.

Be honest about provenance: values measured from a real file vs inferred vs sample. (DesignHandoff's own typography panel generates random sample styles rather than extracting them; never present sampled values as extracted.)
