# Surface Details

The small details that compound into a finished interface. From make-interfaces-feel-better (MIT, Jakub Krehel), adapted to Taste's modes. Express every fix in the project's existing styling system (Tailwind in Tailwind, CSS in CSS, the established CSS-in-JS); never introduce a second system for a polish fix.

## 1. Concentric border radius
`outerRadius = innerRadius + padding`. Equal radii on nested surfaces is the most common thing that makes an interface feel off.

```tsx
<div className="rounded-2xl p-2">   {/* 16px outer, 8px padding */}
  <div className="rounded-lg">…</div>  {/* 8px inner = 16 - 8 */}
</div>
```
When padding exceeds ~24px, the layers are separate surfaces: choose each radius independently. Cards stay around 12-16px; pills are for small controls.

## 2. Optical over geometric alignment
- Button with text + trailing icon: icon-side padding = text-side padding - 2px (`pl-4 pr-3.5`).
- Play triangles shift right ~2px.
- Asymmetric icons (stars, arrows, carets): fix the SVG viewBox first; margin nudge (`ml-px`) only as fallback.
- Verify optical corrections on the render, not in code.

## 3. Shadows for elevation, borders for structure
For buttons, cards and containers whose border only fakes depth, use layered transparent shadows: they adapt to any background. Keep borders for dividers, table cells, input outlines, hairline separators in dense UI, and selected/focus states.

```css
:root {
  --shadow-border:
    0 0 0 1px oklch(0 0 0 / 0.06),
    0 1px 2px -1px oklch(0 0 0 / 0.06),
    0 2px 4px 0 oklch(0 0 0 / 0.04);
  --shadow-border-hover:
    0 0 0 1px oklch(0 0 0 / 0.08),
    0 1px 2px -1px oklch(0 0 0 / 0.08),
    0 2px 4px 0 oklch(0 0 0 / 0.06);
}
[data-theme="dark"], .dark {
  --shadow-border: 0 0 0 1px oklch(1 0 0 / 0.08);
  --shadow-border-hover: 0 0 0 1px oklch(1 0 0 / 0.13);
}
.card { box-shadow: var(--shadow-border); transition: box-shadow 150ms ease-out; }
.card:hover { box-shadow: var(--shadow-border-hover); }
```
Declare elevation once: never a 1px border plus a wide diffuse shadow on the same card (`gpt-thin-border-wide-shadow`). Tint larger shadows to the background hue; no pure-black drop shadows on light grounds.

## 4. Image outlines
A 1px inset outline gives images consistent depth. Color is non-negotiable: pure black at 10% in light mode, pure white at 10% in dark mode. A tinted outline (slate, zinc, the accent) picks up the surface and reads as dirt.

```tsx
<img className="outline outline-1 -outline-offset-1 outline-black/10 dark:outline-white/10" … />
```

## 5. Hit areas
44 × 44px for touch, at least 40 × 40px in dense desktop UI (WCAG 2.5.8 floor is 24 × 24 with spacing). Extend small controls with a pseudo-element; never let two hit areas overlap (shrink the extension until they don't).

```tsx
<button className="relative size-5 after:absolute after:left-1/2 after:top-1/2 after:size-11 after:-translate-1/2">…</button>
```

## 6. Icons
- Stroke matches adjacent text weight on a 24px grid: 1.5px beside regular (400), 2px beside medium/semibold, 2.5px beside bold or standalone emphasis. One stroke weight per surface; never mix libraries.
- Size inline icons ~1em-1.25em of the text; use the set's native sizes (16, 20, 24).
- One SVG with `currentColor`; hover, selected and disabled come from CSS color/opacity, never separate assets. Strip hardcoded `fill`/`stroke`.
- Outline is the default; fill marks the active state (active tab, liked heart). The swap uses the icon-swap values in `motion-system.md`.
- Test at the smallest render size; simplify glyphs for 16px.
- RTL: flip directional arrows, chevrons, send glyphs (`[dir="rtl"] .icon-directional { scale: -1 1; }`); never flip logos, checkmarks, clocks, media controls.
- Icon-only controls need accessible names; decorative icons are `aria-hidden`.

## 7. Numbers and text rendering
- `tabular-nums` on counters, timers, prices that update, table columns, dashboards, animated numbers. Not on phone numbers, zip codes, versions, decorative numerals. Check how the face changes the `1` glyph.
- `text-wrap: balance` on headings, `pretty` on paragraphs, captions, list items; neither on long text or code.
- `antialiased` once on the root.

## 8. Browser surfaces
Theme from the palette: `::selection { background: color-mix(in oklch, var(--accent) 25%, transparent); }`, `caret-color: var(--accent)`, `:focus-visible` rings with offset (`outline: 2px solid var(--accent); outline-offset: 2px`), `text-underline-offset: 0.2em`, `accent-color` on native checkboxes/radios, `scrollbar-color` where a custom scrollbar is part of the world (never reinvent scrollbars on Operate surfaces).

## 9. Overlays
Dropdowns, tooltips and menus inside `overflow: hidden/auto` ancestors get clipped (`clipped-overflow-container`). Use `<dialog>`, the popover API, `position: fixed`, or a portal.

## 10. Review format for polish findings

Group findings by principle; one table per principle:

| Severity | Location | Before | After | Why |
|---|---|---|---|---|
| MEDIUM | `src/Counter.tsx:17` | `<span>{count}</span>` | `<span className="tabular-nums">{count}</span>` | Proportional digits shift as values change |

- **HIGH:** inaccessible, misleading, unreadable or repeatedly disruptive. **MEDIUM:** noticeable usability or consistency problem. **LOW:** isolated polish (full mode only).
- Quick mode: primary path, HIGH and MEDIUM only, cap 5. Full mode: whole scope, cap 15.
- Consolidate a systemic issue into one row listing every location; never pad to reach the cap.
- Add "Considered but rejected" (1-3 quick, 2-5 full) and a Verification list (what was actually run; unrun checks marked **Not verified**).
- Verdict: `Block` if any HIGH remains, `Needs changes` for MEDIUM/LOW, `Approve` only with no actionable findings.
