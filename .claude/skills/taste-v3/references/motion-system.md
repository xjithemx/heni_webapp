# Motion System

Merges three sources into one system: the transitions.dev motion-token scale and polish rules, the animation rules from make-interfaces-feel-better, and Impeccable's motion doctrine. Where they disagreed, v3's resolution is stated.

## Contents
1. Doctrine
2. Tokens (install once)
3. Polish rules: when a value is right
4. Interaction rules
5. Element → transition decision table
6. Mode caps
7. Reduced motion
8. Review: tokenising existing motion

---

## 1. Doctrine

- Motion explains **state, relationship and hierarchy**, or delivers **one authored moment** the surface earned. Decoration without purpose is animation debt.
- Write a motion thesis before implementing: focal moment (if any), continuity (state/layout/navigation changes that need explaining), feedback (controls that need acknowledgment), budget (expensive effects and how often they run).
- The focal moment comes from this product and world. A generic fade-and-rise, hover lift, parallax layer or scroll reveal is not a thesis.
- Choose material by meaning, beyond transform and opacity: shared-element / FLIP / View Transitions for continuity; bounded blur, backdrop, shadow for focus and depth; `clip-path` and masks for reveal; color, gradient position, shaders for material energy when the world and runtime support them. One strong material idea, not a stack.
- Content is visible in the default state. Never ship a page whose text sits at opacity 0 until a script runs (`content-hidden-at-rest`).

## 2. Tokens

Install once in the global stylesheet. Values are the transitions.dev scale (credited in `NOTICE.md`).

```css
:root {
  /* Durations */
  --duration-stagger: 40ms;   /* per-item stagger offset */
  --duration-micro: 80ms;     /* intent delay, shake segment, large-item stagger */
  --duration-quick: 150ms;    /* modal/dropdown close, text swap, tooltip appear, press */
  --duration-fast: 250ms;     /* dropdown/modal open, icon swap, tabs, page slide, accordion */
  --duration-medium: 350ms;   /* panel close, toast open */
  --duration-slow: 400ms;     /* panel open, skeleton reveal */
  --duration-very-slow: 500ms;/* emphasis: badge appear, text reveal, success check */
  /* Easings */
  --ease-smooth-out: cubic-bezier(0.22, 1, 0.36, 1); /* default for surfaces: open, close, slide, resize */
  --ease-expo-out: cubic-bezier(0.16, 1, 0.3, 1);    /* one authored focal entrance only */
  --ease-in-out: ease-in-out;                        /* in-place swaps: icon, text, skeleton reveal */
  --ease-linear: linear;                             /* shimmer, pulse, spinner, scrubbed scroll */
  --ease-overshoot: cubic-bezier(0.34, 1.36, 0.64, 1); /* small-control entrances only: badge, toggle */
  /* Distances */
  --distance-micro: 4px;   /* text swap */
  --distance-small: 6px;   /* shake small segment */
  --distance-base: 8px;    /* page slide, badge, shake large segment */
  --distance-medium: 12px; /* text reveal, subtle exit */
  --distance-large: 30px;  /* one-off celebratory appear */
  /* Pre-scales (animate from, settle to 1) */
  --scale-press: 0.96;  /* button press, modal */
  --scale-dropdown: 0.97;
  --scale-tooltip: 0.98;
  --scale-tiny: 0.99;   /* dropdown close */
  /* Blur (animate from, settle to 0) */
  --blur-small: 2px;  /* swaps, panel reveal, skeleton reveal, number pop-in */
  --blur-medium: 3px; /* page slide, text reveal */
  --blur-large: 8px;  /* success moment */
}
@media (prefers-reduced-motion: reduce) {
  :root { --distance-micro: 0px; --distance-small: 0px; --distance-base: 0px; --distance-medium: 0px; --distance-large: 0px; }
}
```

Tailwind: map these in `@theme` (e.g. `--ease-smooth-out`, `--duration-fast`) and use `duration-(--duration-fast) ease-(--ease-smooth-out)`; avoid arbitrary one-off values like `duration-[300ms]`.

## 3. Polish rules: when a value is right

**Match on usage, never on the nearest number.** Infer what the motion does (modal close, tooltip, page slide), then use the token documented for that usage. A 300ms modal close maps to `--duration-quick` because closes are quick, not because 300 is near 250. If a value matches no usage, leave it.

- **Open/close asymmetry:** closes faster and quieter than opens. Dropdown and modal 250 → 150ms; panel 400 → 350ms; toast 350 → 250ms. Symmetric (do not split): page side-by-side, tabs sliding, accordion, icon swap (250ms), text swap (150ms).
- **Overshoot** belongs to entrances of small controls only (badge pop, toggle thumb, like). Never bounce a close, a page, a panel or a modal. Elastic and bounce easings by reflex read dated (`bounce-easing`).
- **Hover in vs out:** in is quick and direct (≤ 250ms, smooth-out); out may be softer and slightly longer so it settles instead of snapping.
- **Stagger:** 40ms per item (80ms for a few large items); keep offset × count under ~300ms; cap or shrink for long lists. 80-100ms word/chunk stagger only for a one-off hero split. Sibling stagger only when a list appears as a list; never reinterpret every scrolled section as a staggered list.
- **Intent delay:** 80ms filters accidental triggers (tooltip appear) or sequences two things. If motion feels late, trim duration before adding delay. Never delay a close or a hover-out.
- **Distance** scales down with frequency and up with ceremony. Translate over ~40px on anything but a full panel or drawer reads sluggish.
- **Pre-scale** below ~0.9 reads as a zoom and rarely fits UI chrome.
- **Blur** softens a swap or slide; never on a plain fade or a theme change.
- **Durations by consequence (Impeccable):** 100-150ms feedback; 150-300ms routine state; 300-500ms layout, overlay, view transition; 500-800ms a deliberately authored focal entrance.

## 4. Interaction rules

- **Interruptible:** CSS transitions (they retarget mid-flight) for interactive state: hover, toggle, open/close. Keyframes only for one-shot staged sequences. A drawer clicked twice mid-animation must reverse smoothly.
- **Press feedback:** `scale(0.96)` via `transition-property: scale` at 150ms ease-out. Never below 0.95. Provide a `static` prop to opt out where press motion distracts. Tailwind: `transition-transform duration-150 ease-out active:not-disabled:scale-[0.96]`.
- **Enter (infrequent staged entrances only):** split into semantic chunks (title, description, actions), combine opacity + `translateY(var(--distance-medium))` + `blur(var(--blur-medium))`. Not for row hovers, keystrokes or repeated tab changes.
- **Exit:** softer than enter: small fixed translate (-12px), shorter duration (~150ms), ease-out. Full slide-out only when spatial context matters (card returning to a list, drawer closing). Remove instantly when motion adds no information.
- **Contextual icon swap:** both icons cross-fade in one slot: scale 0.25 → 1, opacity 0 → 1, blur 2px → 0. CSS: 250ms `--ease-in-out`, both icons stay in the DOM (one absolutely positioned). Motion: `transition={{ type: "spring", duration: 0.3, bounce: 0 }}`, `AnimatePresence mode="popLayout" initial={false}`. (v3 resolution: make-interfaces-feel-better used blur 4px, transitions.dev 2px; v3 standardises on 2px. Bounce is always 0.)
- **Skip first-render animation** for state swaps: `AnimatePresence initial={false}`; do not apply it to intentional staged entrances.
- **Motion restraint:** high-frequency interactions get instant feedback or a ≤ 150ms color/opacity change, never a replayed entrance. Motion is never the only feedback channel: every animated state change also changes color, icon or label.
- **Name properties:** never `transition: all`; `transition-property: scale, opacity`. Tailwind's `transition-transform` covers transform/translate/scale/rotate; use `transition-[scale,opacity,filter]` for mixes.
- **`will-change`** only for `transform`, `opacity`, `filter`, only when first-frame stutter is observed, only during the animation. Never `will-change: all`.
- **Layout properties** (`width`, `height`, `top`, `left`, margin) are not animated casually; use transforms, FLIP, `grid-template-rows: 0fr → 1fr` (accordion), or `interpolate-size` where supported.
- **Continuous values** (pointer, scroll progress) never live in React state: Motion `useMotionValue` / `useScroll`, GSAP `quickTo`, CSS `animation-timeline`.
- **No `window.addEventListener('scroll')`.** Use ScrollTrigger, IntersectionObserver, Motion `useScroll`, or CSS scroll-driven animation with a static fallback.
- Modern CSS worth reaching for: `@starting-style` (animate from `display: none`), View Transitions (same-document all browsers), `@property` (animate gradients and custom properties), popover API for overlays that escape `overflow: hidden` ancestors.

## 5. Element → transition decision table

Match the visible element first, then the verb. Names correspond to transitions.dev recipes: install with `npx transitions-dev add <name>` or `npx skills add Jakubantalik/transitions.dev` rather than retyping them (its license forbids redistributing the library; Taste references it, never copies it).

| Element / moment | Transition | Core values |
|---|---|---|
| Surface grows from a trigger | `menu-dropdown` (origin-aware) | open 250 / close 150, from 0.97, close to 0.99 |
| Centered overlay, no anchor | `modal` | open 250 / close 150, from 0.96 |
| Surface slides into a page region | `panel-reveal` | open 400 / close 350, blur 2px |
| List ↔ detail, step 1 ↔ 2 | `page-side-by-side` | 250, 8px, blur 3px, symmetric |
| Container changes size | `card-resize` | 300, smooth-out |
| Label changes, shares letters (Copy → Copied) | `text-morph` | |
| Label changes, shares nothing | `text-states-swap` | 150, 4px, blur 2px |
| Values change because data changed (period, unit) | `text-swap-soft` | cross-blur, no movement |
| A number updates | `number-pop-in` | per digit, blurred slide |
| Two icons, one slot | `icon-swap` | §4 values |
| Done / paid / uploaded | `success-check` | fade + rotate + bob + path draw |
| Hover in a horizontal stack (avatars, chips) | `avatar-group-hover` | distance falloff |
| Invalid input | `error-state-shake` | 6/8px segments, auto revert |
| Clearing a field | `input-clear-dissolve` | |
| Placeholder then content | `skeleton-reveal` | pulse, cross-fade + blur 2px |
| In-progress text | `shimmer-text` / `thinking-states` | linear 2000ms loop |
| Segmented control | `tabs-sliding` | 250, set first position without transition |
| Hover/focus hint | `tooltip` | 80ms delay, 150 in, near-instant out |
| Headline + supporting line entering | `texts-reveal` | 40ms stagger, 12px, blur 3px |
| FAB becomes its panel | `plus-menu-morph` | |
| Collapsible section | `accordion` | grid-rows 0fr → 1fr, 250, padding on inner element, chevron `scaleY(-1)` |
| Transient message | `toast` / `banner-stacking` | rise from below, slower in than out |
| Toggle, checkbox, like | `toggle`, `checkbox-check`, `like-button` | small-control overshoot allowed |
| Donut/ring chart value change | `donut-chart` | even gaps, morph |
| Streaming AI output | `streaming-text`, `reasoning-stream` | |

If two fit, prefer the lower-overhead one (resize over panel, dropdown over modal, success check over a celebration modal). No clear match: list the options to the user rather than guessing.

## 6. Mode caps

| | Persuade | Experience | Operate | Read |
|---|---|---|---|---|
| Authored focal moment | yes, one | yes, the work's native motion | no page-load choreography | none in the column |
| Routine transitions | tokens | tokens | 150-250ms, state only | minimal |
| Scroll-driven | when the relationship carries meaning | yes | no | progress indicators only |
| Live data | n/a | n/a | never animate interval-refreshing values beyond a brief highlight | n/a |
| Charts | entrance once | entrance once | `isAnimationActive` off at density ≥ 6 | off for print |

## 7. Reduced motion

Every web animation needs an intentional `prefers-reduced-motion` alternative. Remove spatial movement (translate, scale, parallax, scroll hijack, magnetic physics, infinite loops) but keep the opacity, color and state changes that carry meaning: reduced means fewer and gentler, not none. A global `animation-duration: 0.01ms` kill that destroys feedback fails the audit. Nonessential loops stop when off-screen or hidden. GSAP: `gsap.matchMedia()` with a `reduceMotion` condition. Motion: `useReducedMotion()`. CSS: gate movement under `@media (prefers-reduced-motion: no-preference)`.

## 8. Review: tokenising existing motion

For "polish the motion", "timing feels off", or a `transitions review`:
1. Scan every `transition` / `animation` declaration, `@keyframes`, inline styles, CSS-in-JS, Tailwind arbitrary values, Motion `transition` props.
2. For each, infer the usage from selector and component, then propose the token whose usage matches: `path:line - modal close: 300ms → var(--duration-quick) (150ms)`. Values matching no usage: `no matching token usage`, untouched.
3. Flag rule breaks: `transition: all`, bounce on a close, delayed close, stagger total > 300ms, translate > 40px on chrome, motion as the only feedback, missing reduced-motion path, non-interruptible keyframes on interactive state.
4. Inspect at 10% speed in the browser Animations panel when possible: what feels off slowed down is what is subtly wrong at full speed.
5. Propose, do not edit, unless the user asked for the fix.
