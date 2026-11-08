# Marketing Mode - Persuade and Experience

Carries Taste v2 marketing rules, updated with Impeccable's Persuade/Experience doctrine. Persuade: the visitor decides and acts; the design is the product. Experience: the visitor is inside the work; the artifact leads.

## Contents
1. Dial definitions
2. Layout discipline
3. Hero and first viewport
4. Imagery and assets
5. Content, copy, quotes
6. Reference vocabulary
7. Redesign protocol
8. Persuade / Experience pre-flight

---

## 1. Dial definitions

**DESIGN_VARIANCE**
- 1-3: symmetric 12-col grid, equal paddings, centered alignment.
- 4-7: controlled overlaps (`-mt-8`), varied image aspect ratios, left-aligned headers over centered data.
- 8-10: masonry, fractional grids (`2fr 1fr 1fr`), large deliberate empty zones.
- Mobile override: levels 4-10 collapse to a strict single column below 768px, stated per section.

**MOTION_INTENSITY**
- 1-3: no automatic animation; hover/active only.
- 4-7: token transitions on named properties (`transition-property: transform, opacity; transition-duration: var(--duration-fast); transition-timing-function: var(--ease-smooth-out)`), one staged entrance on the hero. Never `transition: all`.
- 8-10: scroll-driven reveals, pin/scrub, parallax, WebGL where the world names it. Never `window.addEventListener('scroll')`.
- "Motion claimed, motion shown": above 4 the page must actually animate, working, with a reduced-motion path.

**VISUAL_DENSITY**
- 1-3: `py-32` to `py-48` sections.
- 4-7: `py-16` to `py-24`.
- 8-10: tight padding, 1px rules instead of card boxes, `tabular-nums` on numbers (mono only for identifiers and code).

---

## 2. Layout discipline

- **Anti-center bias:** at VARIANCE > 4 avoid the centered hero; use split, left-aligned copy with right asset, asymmetric whitespace, or scroll-pinned structure. Centered is fine for manifesto, editorial, launch-announcement briefs.
- **Cards only when elevation means hierarchy.** Otherwise group with spacing, `divide-y`, or rules. Never nested. At DENSITY > 7 generic card containers are banned.
- **Template skeletons stay templates whatever world paints them:** the split hero (copy one side, product the other, badge row under) and the centered headline over a row of equal cards. Change the structure, not the skin.
- **Section-layout repetition:** each layout family at most once per page; at least 4 families across 8 sections.
- **Zigzag cap:** max 2 consecutive image+text split sections.
- **Split-header ban:** no "big headline left + small explainer right" section header; stack them.
- **Bento:** needs rhythm (full-width rows, asymmetric tiles, vertical breaks), exact cell count (N items, N cells), and 2-3 cells with real visual variation.
- **Long lists (>5 items):** 2-column split, tabs/accordion, scroll-snap pills, carousel; never a bare `<ul>`.
- **Navigation:** one line at desktop, 64-72px tall (max 80).
- **Pace like a studio:** a dense passage earns a quiet one; the page ends on a real close, not a fade-out of sections.
- **Page theme lock:** one theme; sections do not invert except one deliberate color-block story.
- **Shape lock:** one radius system (all-sharp, all-soft 12-16px, or pill for small interactive controls only), applied concentrically (`surface-details.md`).

---

## 3. Hero and first viewport

The first viewport is a thesis, not a header (`process.md` §6).

- Fits the initial viewport: headline ≤ 2 lines at desktop, subtext ≤ 20 words and ≤ 4 lines, primary action visible without scroll.
- Plan font size and image size together. Most heroes: `text-4xl md:text-5xl lg:text-6xl`; `text-7xl` only for 3-5 word headlines. Display max ~6rem. A full-sentence headline at display size is the `oversized-h1` tell.
- Top padding max `pt-24` at desktop.
- **Hero stack, max 3 text elements:** headline, subtext, actions (1 primary + max 1 secondary). No eyebrow, no pill chip above the headline, no tagline under the CTAs, no trust strip, no pricing teaser, no avatar row, no logo wall inside the hero.
- **Persuade:** the primary action is the working one the category's visitors came for (search form, slot picker, add to cart), not a decorative link to it.
- **Experience:** the work itself leads; chrome recedes.
- "Trusted by" logos sit under the hero, logos only, real SVG marks (Simple Icons / devicon), never text wordmarks or category labels.
- Banned at hero level: version labels (`V0.6`, `BETA`), "Brand · No. 01" sub-labels, scroll cues, decoration text strips (`BRAND. MOTION. SPATIAL.`), locale/time/weather strips.

---

## 4. Imagery and assets

Priority:
1. An image-generation tool when available: section-specific assets.
2. Real, verified imagery of the subject's physical object (not the category). Check URLs resolve. In published Claude.ai pages remote images are blocked: inline as data URIs.
3. Clearly labeled placeholder slots plus a list of what the user must supply.

- Even minimal sites need real imagery; pure-text pages read unfinished. Experience mode lives on its artifacts.
- Real illustration or none: no sketch-style SVG scenes, `feTurbulence` grain as texture, or shape-assembled clip art. Crisp geometry, diagrams and animated linework are first-class.
- Backgrounds are surfaces textured only from the subject's world; stripes and grid overlays need a real canvas, map or blueprint under them.
- No div-built fake screenshots; no pills or labels overlaid on images; no photo-credit captions as decoration.
- Image outlines per `surface-details.md`.

---

## 5. Content, copy, quotes

- Default section load: headline ≤ 8 words, sub-paragraph ≤ 25 words, one visual or one action.
- **Copy self-audit before ship:** reread every string; rewrite broken grammar, unclear referents, AI-thoughtful filler, buzzwords (elevate, seamless, unleash, next-gen, revolutionize, streamline, empower, supercharge, world-class, cutting-edge), aphoristic cadence ("X. No Y." landing on three sections), "theater" framing, poetic labels ("Field notes", "Loose plates", "Quietly in use at").
- No duplicate CTA intent; CTA labels never wrap at desktop; button text contrast AA.
- Forms: label above, error below, `gap-2`, never placeholder-as-label.
- Quotes: max 3 lines, attribution name + role (+ company), typographic quotes or none, only real testimonials.
- Middle dot `·` max one per line; no colored status dots as decoration; no section numbers (`01 / 02`) unless the sequence carries information.

---

## 6. Reference vocabulary

**Heroes:** asymmetric split, editorial manifesto, media-mask, kinetic type, curtain reveal, scroll-pinned.
**Navigation:** dock magnification, magnetic button, dynamic island, radial menu, mega-menu reveal.
**Layouts:** bento, masonry, split-screen scroll, sticky-stack sections, horizontal pan.
**Cards:** tilt with glare, spotlight border, morphing modal, swipe stack.
**Scroll:** sticky stack, horizontal hijack, sequence scroll, zoom parallax, progress path.
**Media:** dome gallery, coverflow, drag-to-pan grid, accordion slider, hover image trail.
**Type:** kinetic marquee (max one), text mask reveal, scramble, SplitText line reveal, circular text path.
**Micro:** directional hover, SVG line draw, skeleton reveal, success check, number pop-in.

Library choice: Motion for UI and layout state; GSAP for pin/scrub/timelines/SplitText/Flip; Three.js / OGL for WebGL. Never GSAP or Three.js and Motion in the same component tree.

---

## 7. Redesign protocol

- **Detect:** greenfield, redesign-preserve (evolve the brand), redesign-overhaul (new world, same content and IA). If unclear ask once: "Preserve the existing brand, or start visually from scratch?"
- **Audit before touching:** brand tokens, IA and conversion paths, content blocks (real vs filler), patterns to keep or retire, the dial reading of the current site, SEO baseline (ranking pages, titles, structured data: the #1 redesign risk).
- **Preserve:** IA unless asked, existing brand colors (an already-purple brand stays purple), copy voice, accessibility wins, analytics events.
- **Levers in order:** typography, spacing and rhythm, color, motion layer, hero and key-section recomposition, full block replacement only when unsalvageable.
- **Never change silently:** URL structure, primary nav labels, form field names and order, logo, legal / consent / cookie copy.
- Overhaul = a real new world via `process.md` §4; never polish on the discarded look.

---

## 8. Persuade / Experience pre-flight

- [ ] Design Read + direction contract (new surface) declared?
- [ ] First viewport passes the memory test; offer intelligible; working primary action visible?
- [ ] Hero: ≤ 3 text elements, headline ≤ 2 lines, subtext ≤ 20 words, `pt-24` max, no eyebrow or chip?
- [ ] Not a template skeleton (split hero + badge row, centered headline + equal cards)?
- [ ] ≥ 4 layout families across 8 sections; zigzag ≤ 2; no split headers; bento rhythm and exact cells?
- [ ] One theme, one accent role, one radius system (concentric)?
- [ ] Real imagery or labeled slots; no fake screenshots, no overlaid pills, no sketchy SVG?
- [ ] Logo wall under hero, real logos only?
- [ ] Copy self-audit: no buzzwords, no aphoristic cadence, no em-dashes, no fake proof?
- [ ] Motion: one authored moment, tokens, reduced motion, nothing hidden at rest?
- [ ] Serif and reflex-face discipline (`type-color.md`); no cream/brass/oxblood default palette?
- [ ] Mobile collapse explicit per section; nav on one line?
