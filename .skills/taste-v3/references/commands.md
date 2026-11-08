# Command Playbooks

Condensed from Impeccable's command references. Every command: name the target, inspect the rendered incumbent, preserve everything outside scope, verify with evidence (file, selector, computed value, screenshot), then hand off to `polish`. Mode decides how far each move goes.

## bolder
Raise one named target to the conviction the rest of the page already implies. Scope is sovereign: touch only the target, add no new color, font, radius, shadow or primitive unless the user approves the exact addition.
- Find why it reads flat: usually the section opts out of the system's strongest moves (display type at full strength, the signature motif, density and pacing its neighbours use).
- Amplify what the system owns; commit to one decisive move completely, then quiet everything around it. If every element got louder, the section got flatter.
- Give it its own rhythm: a peak in the scroll, a shift in density or pace.
- **Skeleton test:** strip the copy; does the bare structure still say what the section is? If it only works with words, the boldness is in text size, not design.
- The reflex answer (more effects) is the opposite of bold.

## quieter
Reduce intensity without going generic (generic quiet = gray text, one weight, identical cards).
- Sources: saturation, contrast extremes, competing heavy elements, motion excess, decoration, everything large.
- Persuade/Experience: more restrained palette, more air; the point of view stays. Operate/Read: less noise, flatter cards, less color and motion.
- Moves: desaturate to ~70-85%, fewer colors, neutrals do more work, high contrast only where it matters, weights down a step (700 → 500), remove decoration, shorten and soften motion. Never gray on color.

## distill
Strip to essence. One primary goal; every element justifies itself.
- Remove redundancy (said elsewhere? cut), secondary actions, decorative borders/shadows/backgrounds, unnecessary containers and cards, sidebars that can go inline.
- Progressive disclosure for the rest; smart defaults; inline editing over modal flows; one obvious next action.
- 1-2 colors plus neutrals, one family, 3-4 sizes, 2-3 weights, one spacing scale.
- Never remove necessary function, accessibility, or information users need to decide. Mystery is not minimalism.

## harden
Production resilience. Test and fix:
- **Text:** 100+ character names, long words, emoji, RTL (Arabic/Hebrew), CJK, 30-40% localisation expansion, pluralisation, truncation with full value on hover/title.
- **Errors:** offline, throttled, API failures, timeouts, partial data; every error names what failed and the recovery.
- **Edges:** empty, one item, 1000+ items, concurrent actions (submit clicked 10 times), permissions, stale data.
- **Input:** validation with clear messages, sanitisation, sensible limits.
- **Gestures:** interrupted drags (second finger, release outside, window switch), scroll across custom controls.
- **Accessibility and performance under stress:** focus after errors, announcements, large datasets virtualised.

## onboard
First-run, feature discovery, empty states.
- Show, don't tell; make it optional when possible; minimise time to value; context over ceremony (teach at the moment of need); respect intelligence.
- Empty states distinguish: first use (value + template or sample), user-cleared (light touch), no results (suggest query change, clear filters), no permission (why and how to get access), load failure (what happened, retry). Each says what will be here, why it matters, how to start.
- Measure: completion, skip rate, time to first value.

## animate
Write the motion thesis first (focal moment, continuity, feedback, budget), then implement on tokens (`motion-system.md`). Persuade/Experience: one rehearsed focal sequence beats repeated section reveals. Operate/Read: feedback, state and continuity only, fast. Every animation passes: removing it would lose meaning or authored character.

## colorize
Audit first: confirmed brand colors, current roles, places grayscale hides hierarchy or state, contrast failures, color-only signals. Name temperature, dominant relationship, contrast range and dosage; build roles not swatches (`type-color.md` §3). Let the strongest color own a region or role; keep the primary action findable; data colors differ in lightness too; compose dark mode separately. Do not replace a world while "colorizing" it.

## typeset
Two isolated assessments: typographic (authority and fit of faces, hierarchy at a glance, deliberate scale, reading measure, stress cases, delivery) and mechanical (`scripts/detect.sh` type rules). State roles, contrast between roles, measure, authoritative faces and constraints before editing. Fewest roles and families that make hierarchy unmistakable; size, weight, space and tone combined. Paragraph rhythm by spacing or indent, not both. Deliberate uneven breaks are rare and marked.

## layout
Two isolated assessments: spatial (squint test reveals primary, secondary, groups in order; grouping by proximity before containers; rhythm of tight vs generous; topology matches content; density matches frequency; adaptation and DOM/focus order; extremes) and mechanical. Name the spatial thesis (primary path, what groups, what leads, density, adaptation), then apply: group by meaning, 4-based spacing scale, `gap` for sibling rhythm, container queries for reused components, structural responsiveness (reorder, collapse, reveal). Variation is not a goal; repetition supports recognition.

## delight
One delight thesis: what the user should feel and why that feeling belongs to this product. Concentrate on moments that earn it: success proportional to effort, honest waiting, oriented first use, empathetic recovery, satisfying repeated interactions, discoverable utility. Never delay the task, override accessibility, add claims, play sound without consent, or exhaust on repeat. Jokes never near money, privacy, deletion or blocked work.

## overdrive
Highest misfire risk: propose 2-3 directions with technique, feel, browser support, performance cost and complexity; build only the one the user picks. "Extraordinary" depends on the surface: shaders and scroll-driven reveals on marketing; morphing dialogs (View Transitions), 100k-row virtualised tables, streaming validation, spring-physics drag on functional UI; Canvas/WebGL charts on data-heavy screens. Toolkit: View Transitions, `@starting-style`, scroll-driven animations (with static fallback), WebGL / OGL / Three.js, WebGPU with WebGL2 fallback, OffscreenCanvas in workers, SVG filter chains, `@property`, virtual scrolling. Verify timing and smoothness in the browser, not from code.

## clarify
Audit the whole interaction path's language. For each state: the one fact needed now, the next action, context that changes the decision, the right tone.
- Actions: specific verb + object; same words for the same concept everywhere; destructive actions name object and consequence; prefer undo over confirm; never "Yes / No / OK / Submit" on confirmations.
- Forms: persistent labels, requirements before submission, blame-free validation near the field.
- Errors: what failed, why (when known), how to recover; no raw codes as the message.
- Loading names the real operation; empty states distinguish their causes; success is brief.
- Complete translatable strings (no concatenated fragments), room for expansion, alt text that carries information.

## adapt
Identify source and target context (desktop → mobile, mobile → desktop, tablet, print, email). Adapt structurally: reflow with grid/flex, container queries, `clamp()` only where fluid type fits the mode, show/hide by importance, input-method detection (`@media (hover: hover) and (pointer: fine)`), safe areas (`env(safe-area-inset-*)`), `srcset` / `<picture>` for art direction, touch targets, navigation patterns per size. Verify the primary gesture with the target input (a resized viewport proves layout, never a gesture) and report what produced the evidence.

## optimize
Measure first (Lighthouse, Performance panel, real-user data), then fix the bottleneck: LCP < 2.5s (preload hero media, font strategy, server render), INP < 200ms (break long tasks, defer non-critical JS, avoid re-render storms), CLS < 0.1 (reserve media/embed/font space). Images: modern formats, responsive sizes, lazy below the fold. Animations: compositor properties, bounded effects. Frameworks: memoise expensive trees, virtualise long lists, code-split routes. Verify before/after on a low-end device and throttled network.
