# GSAP Playbook

From the official GSAP skills (greensock/gsap-skills, MIT). Replaces Taste v2's §5.A/5.B skeletons, which imported `useReducedMotion` from `motion/react` inside GSAP components (breaking Taste's own "never mix GSAP and Motion" rule) and used raw `useEffect`.

## 1. Setup facts

- **Every GSAP plugin is free**, including SplitText, MorphSVG, DrawSVG, ScrollSmoother, Flip, Draggable, Inertia (since the Webflow acquisition). Install from public npm: `npm install gsap @gsap/react`. Never generate an `.npmrc` auth token or point to a private registry.
- Register plugins once at module or app level, not inside a re-rendering component: `gsap.registerPlugin(useGSAP, ScrollTrigger, SplitText)`.
- In single-file HTML artifacts: pinned CDN UMD builds (`https://cdn.jsdelivr.net/npm/gsap@3.13.0/dist/gsap.min.js`, plus `ScrollTrigger.min.js`, `SplitText.min.js`), then `gsap.registerPlugin(...)`.
- GSAP runs only on the client. In Next.js keep it in `'use client'` leaves; never call gsap during SSR.

## 2. React rules

- Prefer `useGSAP()` over `useEffect`: automatic revert of tweens, ScrollTriggers and SplitText on unmount.
- Always pass `scope` (a container ref) so selector strings cannot match outside the component.
- Callbacks created later (event handlers, `onComplete`) go through `contextSafe`; remove listeners in the returned cleanup.
- `dependencies` + `revertOnUpdate: true` when animation depends on props.
- Without `@gsap/react`: `gsap.context(() => {...}, ref)` inside `useEffect`, and **always** `return () => ctx.revert()`.

## 3. Reduced motion and breakpoints: `gsap.matchMedia()`

```js
const mm = gsap.matchMedia();
mm.add(
  { motion: "(prefers-reduced-motion: no-preference)", desktop: "(min-width: 768px)" },
  (ctx) => {
    const { motion, desktop } = ctx.conditions;
    if (!motion) return; // reduced motion: leave the static layout
    // create tweens / ScrollTriggers here; they revert automatically when conditions change
  },
  containerRef
);
// cleanup: mm.revert()  (do not nest gsap.context inside matchMedia)
```

## 4. Core API rules

- Transform aliases (`x`, `y`, `xPercent`, `scale`, `rotation`) over raw `transform` strings; camelCase properties.
- `autoAlpha` instead of `opacity` for fades that should end hidden and non-interactive.
- Timelines with the position parameter (`"<"`, `">"`, `"<0.2"`, labels) instead of chained `delay`; pass `defaults: { duration: 0.5, ease: "power3.out" }`.
- Stacked `from()` / `fromTo()` on the same property: `immediateRender: false` on the later ones.
- `stagger` instead of many tweens with manual delays; `gsap.quickTo()` for values updated every frame (pointer followers, magnetic buttons).
- Ease vocabulary that matches the token system: `power3.out` / `expo.out` for entrances, `"none"` for scrubbed motion; avoid `elastic` / `bounce` except small-control entrances.
- `clearProps` when a class should take over after the tween.

## 5. ScrollTrigger rules

- `scrub` (progress tied to scroll) **or** `toggleActions` (discrete play/reverse), never both.
- ScrollTrigger lives on a timeline or a top-level tween, never on a child tween inside a timeline; never nest ScrollTriggered animations in a parent timeline.
- Create triggers top-to-bottom in page order, or set `refreshPriority`.
- `ScrollTrigger.refresh()` after layout changes (fonts loaded, images, async content); resize is automatic.
- Pin a wrapper and animate its children, never the pinned element itself. `pinSpacing` stays `true` unless layout is handled elsewhere.
- Fake horizontal scroll: the horizontal tween **must** use `ease: "none"`; nested triggers on it use `containerAnimation`; pinning and snapping are unavailable on those nested triggers. (The official skill's own example misspells `Math.max` as `Max.max`; do not copy it verbatim.)
- `ScrollTrigger.batch()` for many reveal-on-enter elements instead of one trigger each.
- Remove `markers: true` and GSDevTools before shipping.
- Smooth-scroll libraries: ScrollSmoother natively, others via `scrollerProxy` + `ScrollTrigger.update` listener. Smooth scrolling is a Persuade/Experience choice only; never on Operate or Read.

## 6. Canonical skeletons

### 6.1 Sticky stack
```tsx
"use client";
import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(useGSAP, ScrollTrigger);

export function StickyStack({ cards }: { cards: React.ReactNode[] }) {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    const mm = gsap.matchMedia();
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      const els = gsap.utils.toArray<HTMLElement>(".stack-card");
      els.forEach((card, i) => {
        const next = els[i + 1];
        if (!next) return;
        gsap.to(card.firstElementChild, {
          scale: 0.92,
          autoAlpha: 0.55,
          ease: "none",
          scrollTrigger: { trigger: next, start: "top bottom", end: "top top", scrub: true },
        });
      });
    });
  }, { scope: root });

  return (
    <div ref={root} className="relative">
      {cards.map((card, i) => (
        <section key={i} className="stack-card sticky top-0 grid min-h-[100dvh] place-items-center">
          <div className="w-full">{card}</div>
        </section>
      ))}
    </div>
  );
}
```
CSS `position: sticky` does the pinning; GSAP only scrubs the inner element's scale and alpha, driven by the next card. Under reduced motion the cards simply stack.

### 6.2 Horizontal pan
```tsx
"use client";
import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(useGSAP, ScrollTrigger);

export function HorizontalPan({ children }: { children: React.ReactNode }) {
  const wrap = useRef<HTMLElement>(null);
  const track = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    const mm = gsap.matchMedia();
    mm.add("(prefers-reduced-motion: no-preference) and (min-width: 768px)", () => {
      const distance = () => track.current!.scrollWidth - window.innerWidth;
      gsap.to(track.current, {
        x: () => -distance(),
        ease: "none",
        scrollTrigger: {
          trigger: wrap.current,
          start: "top top",
          end: () => `+=${distance()}`,
          pin: true,
          scrub: 1,
          invalidateOnRefresh: true,
        },
      });
    });
  }, { scope: wrap });

  return (
    <section ref={wrap} className="relative overflow-hidden">
      <div ref={track} className="flex h-[100dvh] items-center gap-8 max-md:h-auto max-md:flex-col">
        {children}
      </div>
    </section>
  );
}
```
Mobile and reduced motion get a vertical stack. Function-based values plus `invalidateOnRefresh` survive resizes.

### 6.3 Reveal on enter (batched)
```js
ScrollTrigger.batch(".reveal", {
  start: "top 85%",
  once: true,
  onEnter: (els) => gsap.from(els, { autoAlpha: 0, y: 12, stagger: 0.04, duration: 0.5, ease: "power3.out", overwrite: true }),
});
```
Use for one list that enters as a list, not for every section. Elements stay visible if the script fails because `from()` runs only on enter (set no initial hidden CSS).

### 6.4 SplitText line reveal (one hero headline)
```js
SplitText.create(".hero-title", {
  type: "lines",
  mask: "lines",
  autoSplit: true,
  aria: "auto",
  onSplit: (self) => gsap.from(self.lines, { yPercent: 100, duration: 0.8, stagger: 0.08, ease: "expo.out" }),
});
```
Return the tween from `onSplit` so re-splits (font load, resize) stay in sync. Split only what you animate; `aria: "auto"` keeps screen readers reading the whole heading; avoid `text-wrap: balance` on split elements; split after fonts load.

### 6.5 Flip for layout changes
```js
const state = Flip.getState(".item");
container.classList.toggle("grid-view"); // change DOM / classes
Flip.from(state, { duration: 0.4, ease: "power2.inOut", absolute: true });
```

### 6.6 Magnetic button
```js
const xTo = gsap.quickTo(btn, "x", { duration: 0.4, ease: "power3" });
const yTo = gsap.quickTo(btn, "y", { duration: 0.4, ease: "power3" });
btn.addEventListener("pointermove", (e) => {
  const r = btn.getBoundingClientRect();
  xTo((e.clientX - r.left - r.width / 2) * 0.3);
  yTo((e.clientY - r.top - r.height / 2) * 0.3);
});
btn.addEventListener("pointerleave", () => { xTo(0); yTo(0); });
```
Only at MOTION > 5 on Persuade/Experience; disabled under reduced motion and on touch.

## 7. Performance

Animate transforms and opacity; pin only what is needed; small numeric `scrub` (e.g. 1) smooths work; kill off-screen loops; virtualize long lists instead of hundreds of tweens; `will-change` only on elements actually animating; test on a low-end device.
