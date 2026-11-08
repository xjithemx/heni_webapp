# Type and Color

## 1. Choosing faces

**Choose faces like objects from the subject's world, in the mode's register.**

- **Operate / Read:** system stacks and workhorse UI faces serve well (Inter, Geist, IBM Plex Sans, SF / Segoe system UI). One well-tuned family carries headings, labels, body and data. Prefer faces with good tabular figures. The detector flags Inter/Geist as `overused-font`; on Operate surfaces that is expected: record the reason (`npx impeccable ignores add-value overused-font Inter --reason "Operate workhorse"`) instead of swapping for novelty.
- **Persuade / Experience:** faces with a point of view. These training-data defaults mean you stopped looking, and need a reason no other face could satisfy: Fraunces, Instrument Serif, Playfair Display, Cormorant, Lora, Crimson, Newsreader, Syne, Space Grotesk, Space Mono, IBM Plex (as display), Inter or Geist as display, DM Sans, DM Serif, Outfit, Plus Jakarta Sans, Instrument Sans. A subject association (books want serif, tech wants mono, bookshop wants hand-lettering) is never the reason.
- **Note for Taste v2 users:** v2 suggested Geist and Outfit as Inter alternatives. Both are now in the reflex set; do not reach for them on Persuade surfaces by default.
- Where to look instead: the world's own lettering (signage, timetables, specimen books, packaging, period publications), then open catalogs (Google Fonts, Fontshare, Velvetyne, Collletttivo, Open Foundry) for a face whose character matches. Rotate; never reuse the face from your previous project. Commercial faces are brand decisions with a practical fallback stack.
- **Never a system display face** (Impact, Arial Black, platform sans) as the display voice of an own-world page. Self-host the real face.
- **Serif discipline:** serif display only when the brief names one or the world is genuinely editorial / heritage and you can say why this serif fits this brand. Oversized italic serif hero headlines are a tell.
- **Emphasis** inside a headline uses italic or weight of the same family, never a random serif word dropped into a sans headline.
- **Italic descenders:** italic display with `y g j p q` needs `leading-[1.1]` minimum and `pb-1` on the wrapper.
- Monospace for code, data identifiers and measurement, never as a "technical" costume.

## 2. Type scale and rendering

| | Persuade / Experience | Operate | Read |
|---|---|---|---|
| Scale | fluid `clamp()` allowed on display | fixed rem | fixed rem |
| Ratio | 1.25-1.5, decisive | 1.125-1.2 | ~1.2 |
| Families | display + text pair allowed | one is often right | one reading face (+ mono) |
| Body | 16-18px | 14-16px (`text-sm` at density ≥6) | 16-18px |

- Body measure 65-75ch (data tables can run far wider). Line height 1.5-1.7 for body; below 1.3 is the `tight-leading` tell.
- Display max ~6rem; tracking floor -0.04em (usually -0.02 to -0.03em); body tracking ≤ 0.05em; uppercase only for short labels.
- Headings `text-wrap: balance` (≤ 6 lines Chromium); body, captions, list items `text-wrap: pretty`; neither for 10+ line text or code.
- `-webkit-font-smoothing: antialiased` once on the root.
- `font-variant-numeric: tabular-nums` on any number that updates or aligns in columns; not on phone numbers, versions or decorative numerals.
- Dominant heading vs body ≥ 1.25x apart at each step (`flat-type-hierarchy`).
- Load only used weights; metric-compatible fallbacks; no invisible text during load.
- Respect zoom, user font size, and localisation expansion; test long strings.

## 3. Color

### 3.1 Roles, not swatches
Canvas and elevated surfaces; primary and secondary text; action, focus, selection; borders and separators; success, warning, error, info; data categories or scales. Operate splits these into **three token sets that never borrow from each other**: brand accent (interactive only), semantic status, categorical chart palette (`product-mode.md` §8).

### 3.2 Calibration rules
- One accent role per page; saturation under ~80%; the accent spends itself on the primary action, selection and focus, not decoration.
- **Lila rule:** no default AI purple/violet gradients or cyan-on-dark (`ai-color-palette`). An already-purple brand stays purple.
- **Cream / premium-consumer ban as default:** warm paper grounds (`#f5f1ea`, `#f7f5f1`, `#fbf8f1`, `#efeae0`, `#ece6db`), brass/clay/oxblood/ochre accents (`#b08947`, `#b6553a`, `#9a2436`, `#9c6e2a`), espresso near-black text (`#1a1714`). Rotate instead: cold luxury (silver, chrome, smoke), forest (deep green, bone, amber), black and tan, cobalt + one neutral, terracotta + slate, pure monochrome + one saturated pop. Or better, derive from the world.
- No pure `#000` or `#fff` surfaces; off-black and off-white. (Image outlines are the exception: pure black/white at 10% alpha, `surface-details.md`.)
- One neutral temperature per project; tint neutrals from the brand hue only when it creates real cohesion.
- Never gray text on a colored surface: derive secondary text from that surface's hue or the foreground.
- Prefer explicit colors over stacks of translucent overlays when alpha makes contrast unpredictable.
- No glow: zero-offset colored halos and radial spotlight washes are decoration (`dark-glow`, `radial-halo`).

### 3.3 Building palettes in OKLCH
For new web palettes use OKLCH: vary lightness in even steps, reduce chroma near white and black (high chroma at extreme lightness clips and looks cheap). Choose hue from product meaning and the world, never from a category association ("finance = blue").

```css
:root {
  --accent: oklch(0.58 0.16 255);
  --accent-hover: oklch(0.53 0.16 255);
  --surface: oklch(0.985 0.004 255);
  --surface-2: oklch(0.965 0.006 255); /* second neutral layer for rails and panels */
  --ink: oklch(0.22 0.02 255);
  --ink-muted: oklch(0.45 0.02 255);
}
@media (prefers-color-scheme: dark) {
  :root:not([data-theme="light"]) {
    --surface: oklch(0.18 0.01 255);
    --surface-2: oklch(0.22 0.012 255);
    --ink: oklch(0.95 0.008 255);
    --ink-muted: oklch(0.74 0.015 255);
    --accent: oklch(0.70 0.15 255);
  }
}
```

### 3.4 Dark mode
Compose it; never invert mechanically. Design surface elevation explicitly (lighter = higher), lift accent lightness for contrast, simplify shadows to a 1px light ring. One token strategy per project (CSS variables or Tailwind `dark:`), tested in both modes.

### 3.5 Contrast (verify computed pairs, both themes, every state)

| Content | WCAG AA |
|---|---|
| Body text, placeholders | 4.5:1 |
| Large text (≥ 18px, or 14px bold) | 3:1 |
| Controls, icons, focus indicators, chart marks | 3:1 |

Information carried by color also needs text, shape, icon or position. Simulate common color-vision deficiencies for status and chart palettes.
