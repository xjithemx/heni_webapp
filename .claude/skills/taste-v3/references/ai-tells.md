# AI Tells - Full Ban List

Taste v2 §9 merged with Impeccable's deterministic detector (rule IDs in backticks, checkable with `scripts/detect.sh`). **Ban** = no brief earns it back. **Default** = a category reflex; the brief or the committed world can earn it, but reaching for it when the axis is free means you were not deciding. **Advisory** = detector flags it for judgment.

## 1. Bans (all modes)

| Tell | Detector ID |
|---|---|
| Em-dash / separator en-dash in visible copy (Taste: zero tolerance; detector flags saturation) | `em-dash-overuse` + `scripts/taste_scan.py` |
| Kicker / eyebrow label as its own block above a heading; hero pill chip | `kicker-above-heading`, `hero-eyebrow-chip` |
| Gradient text | `gradient-text` |
| Colored side stripe > 1px on cards, list items, callouts, alerts | `side-tab`, `border-accent-on-rounded` |
| Nested cards | `nested-cards` |
| `transition: all` | `scripts/taste_scan.py` |
| Broken or placeholder images | `broken-image` |
| Content invisible at rest after scripts run | `content-hidden-at-rest` |
| Text occluded or overflowing its container | `text-occlusion`, `text-overflow` |
| Low contrast, gray text on color | `low-contrast`, `gray-on-color` |
| Skipped heading levels | `skipped-heading` |
| Uncaught script errors on load | `script-error` |
| Fake proof: invented customers, testimonials, benchmarks, prices | review |
| Placeholder people/brands (John Doe, Acme, Nexus, SmartFlow), egg avatars, fake-perfect numbers | `scripts/taste_scan.py` |
| Div-built fake screenshots; shape-assembled SVG "illustration" | `shape-assembled-illustration` (advisory) |
| Geometric/clip-path masks faking organic contours | `organic-clip-path` |
| Emoji or Unicode glyphs as an icon system | review |
| Rasters buried under near-opaque washes | `buried-raster` |

## 2. Defaults to refuse when the axis is free

**Page scaffolds**
- Same-size icon + heading + text card grids as page structure; the 3-equal-card row (Operate KPI rows are exempt) - `icon-tile-stack`
- The hero-metric template (big number, small label, supporting stats, accent)
- Numbered section labels `01 / 02` - `numbered-section-labels` (advisory)
- Split header (big headline left, small explainer right); zigzag runs > 2
- Modal for a task that needs neither interruption nor protected focus
- Oversized full-sentence display headline - `oversized-h1`

**Surface habits**
- AI purple/violet gradients, cyan-on-dark - `ai-color-palette`
- Cream / beige reflex ground - `cream-palette`
- Glow: zero-offset colored halos, radial spotlight washes - `dark-glow`, `radial-halo`, `radial-spotlight-glow`
- Glass and blur as decoration
- Hard offset shadows outside a real neobrutalist world - `hard-offset-shadow` (advisory)
- Hairline border + wide diffuse shadow on every card - `gpt-thin-border-wide-shadow` (advisory)
- Repeating-gradient stripes, decorative grid backgrounds without a canvas under them - `repeating-stripes-gradient`, `codex-grid-background` (advisory)
- Sparklines, progress rings and soft rounded rectangles standing in for content
- Monospace as a technical costume
- System display face (Impact, Arial Black) as display voice
- Light or dark picked by category instead of the use scene
- Custom cursors; noise filters on scrolling containers (fixed `pointer-events-none` pseudo-elements only)

**Type**
- Reflex faces on Persuade/Experience (`type-color.md` §1) - `overused-font`
- Italic serif display hero - `italic-serif-display`
- Flat hierarchy (< 1.25x between roles) - `flat-type-hierarchy`
- Crushed tracking below -0.04em - `extreme-negative-tracking`
- Wide tracking on body, all-caps body, tiny text (< 12px body, < 11px UI) - `wide-tracking`, `all-caps-body`, `tiny-text`, `undersized-ui-text`
- Tight leading, long lines, justified narrow columns - `tight-leading`, `line-length`, `justified-text`
- Stragglers and unbalanced headings - `straggler`, `unbalanced-heading` (advisory; say which breaks are intended)

**Motion**
- Bounce/elastic easing by reflex - `bounce-easing` (advisory)
- Pulsing status dots without live data - `pulsing-dot`
- Decorative blinking cursor in a hero - `blinking-cursor` (advisory)
- Auto-scrolling marquee (max one, when earned) - `marquee`
- The same fade-up entrance on every section
- `window.addEventListener('scroll')`, React state for continuous values

**Spacing and layout**
- Monotonous spacing - `monotonous-spacing`
- Cramped padding, body text touching the viewport edge - `cramped-padding`, `body-text-viewport-edge`
- Heading closer to the previous block than to its content - `heading-rhythm`
- One column of a split opening running far past the fold - `first-viewport-column-overflow`
- Cards flush against a scroller edge - `edge-flush-cards`
- Same text repeated 3+ times in one container - `repeated-container-text`
- Positioned children clipped by overflow containers - `clipped-overflow-container` (advisory)

**Copy**
- Buzzwords (streamline, empower, supercharge, world-class, enterprise-grade, next-generation, cutting-edge, elevate, seamless, unleash, revolutionize) - `marketing-buzzword`
- Aphoristic cadence ("X. No Y." / "X. Just Y." on 3+ sections) - `aphoristic-cadence`
- "Theater" framing - `theater-slop-phrase` (advisory)
- Poetic labels ("Field notes", "Loose plates", "Quietly in use at"), generic step labels ("Phase 01"), micro-meta sentences under headings, version stamps on marketing pages, locale/weather strips, scroll cues

## 3. Design-system drift (when DESIGN.md exists)
`design-system-font`, `design-system-color`, `design-system-radius`, `design-system-font-size`: a value outside the documented system is either a mistake or a system change to record.

## 4. Mode exemptions
Operate suspends: 3-equal-card ban for KPI rows, status-dot ban (dot + text badges), row-border ban for tables, progress bars encoding a real ratio, Inter/Geist as workhorse faces. Full table: `product-mode.md` §8.
