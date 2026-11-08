# Process - From Product Truth to a Finished Surface

Adapted from Impeccable's init / shape / new-work flow for environments without its engine binary, image generation or subagents. Where Impeccable runs a script, this file says what Taste does instead.

## Contents
1. Init: PRODUCT.md
2. Shape: the brief without code
3. New work: decide what is already true, ask, choose invention level
4. The direction round (concept roll)
5. The direction contract
6. Build with full commitment
7. Inspect and finish

Three documents, three owners:
- **PRODUCT.md** owns product truth (users, purpose, positioning, evidence, constraints). Never visual decisions.
- **DESIGN.md** owns durable visual decisions (tokens, components, rules). Written at finish from the built world.
- **Surface brief** owns one route's strategy: mode, audience, job, proof, the direction contract, open decisions.

In a chat environment these live as files you hand to the user. When the user uploads them later, they are authority: read them before anything else.

---

## 1. Init: PRODUCT.md

Run when a new surface or replacement world is requested and no PRODUCT.md exists, or when the user says `init`. A narrow refinement of existing code does not block on init; offer it afterwards.

1. **Explore before asking.** Read whatever exists: product copy, README, routes, roles, logos, legal and proof assets, uploaded files. Treat repository evidence as a hypothesis.
2. **Interview for gaps only**, at most three questions per round, at least one real answer round before writing a new file:
   - Who is the primary user, in what situation, doing what job?
   - What does the product make possible, and what mechanism could a neighbour not truthfully copy?
   - What constraints, assets, evidence or facts must future work preserve?
   - Greenfield with no stack: ask once whether they want static HTML/CSS, a named framework, or your recommendation.
3. **Never ask** about aesthetic direction, colors, fonts or references during init. If the user volunteers a binding visual constraint, record it as a brand commitment without expanding it.
4. **Write only confirmed facts**, mark open decisions, omit irrelevant sections:

```markdown
# Product

## Platform
web

## Stack
[greenfield only: the user's answer, or "delegated: <choice and why>"]

## Users
## Product Purpose
## Positioning
## Operating Context
## Capabilities and Constraints
## Brand Commitments
## Evidence on Hand
[real content, data, testimonials, assets with paths; state absences future work must not fabricate]
## Product Principles
[3-5 strategic principles, no visual recipes]
## Accessibility & Inclusion
```

If nobody answers after one real probe, infer from the brief, label every inferred fact, and disclose that in your first reply.

---

## 2. Shape: the brief without code

Use for `shape`, "lên brief", or any request to plan before building.

**Round 1 (purpose, people, outcome)**, pick the 2-3 questions that most change the result: what the surface is for; who reaches it in what state of mind; the one thing they must understand or do; what is uniquely true here.

**Round 2 (material, behaviour, boundaries)**, only for material gaps: real content and data ranges (min / typical / max); states that matter (first run, empty, loading, error, permissions, overflow, expert use); fidelity and breadth; what must stay untouched and what would feel wrong; binding constraints.

Assert the likely reading and invite correction instead of turning obvious facts into menus.

**The brief** (3-5 bullets when settled, full structure only when ambiguous): job and audience with mode; outcome and proof; selected direction (if a direction round ran); scope and anti-goals; states and ranges; interaction and layout intent (not CSS); constraints and open decisions.

Present it for confirmation, then **stop**: shape never writes code or a direction contract.

---

## 3. New work

### 3.1 Decide what is already true
- **Redesign:** keep product truth, content, function, constraints, explicit brand commitments. Replace the old visual world; treat it as evidence of what the subject is, not authority over what it becomes.
- **Established world** (coherent identity in code, even without DESIGN.md): inherit it; document it instead of inventing a replacement.
- **Incomplete brand:** keep confirmed assets and recognisable traits, expand with the user.
- **No visual authority:** create a new world with the user.

A section, component, feature or state inside an established surface inherits that surface. Never turn a local addition into an identity exercise.

### 3.2 Ask what will change the work
Two or three related questions (tappable tool on mobile), mode-specific:
- **Persuade:** who must act, what they should believe, which real proof or assets earn that belief.
- **Operate:** the task, the information, important states, frequency, constraints.
- **Read:** the reader's question, source material, structure, wayfinding.
- **Experience:** what leads, how exploration unfolds, which interaction or transition matters.

Across modes: what success looks like, what must stay untouched, what would make a polished result feel wrong.

### 3.3 Choose the amount of invention
- **Extend an existing surface:** inherit world and composition; resolve only purpose, content, hierarchy, states, interaction. No roll, no DESIGN.md change unless the user approves a system change.
- **Whole surface inside an established world:** the visual system is fixed; derive 5-7 materially different *structures* from content, task and behaviour, then run a surface roll (§4.4).
- **Create or replace the visual world:** full direction round (§4).

---

## 4. The direction round (concept roll)

The roll exists to break the model's ranking rut: left alone, every run converges on the category default. Impeccable deals challengers from a curated catalog through its roll service; that service is unreachable here, so the round runs **degraded**: no challengers, no quality-bar boards, dice over your own grounded candidates. Tell the user so in one line.

### 4.1 Ground the material
1. Name, in one sentence each: the product's unique mechanism; the audience's real scene; its cultural home; what this first surface must prove.
2. Name **the rut**: the page this category always ships, and its predictable opposite. Both stay off the candidate list. A brief that paints its own picture (a product name, a governing metaphor) adds its literal reading to the rut: spend at most one candidate on it.
3. From the audience's cultural world, list **seven** concrete visual systems, artifacts, places or rituals they know by heart, ordered by resonance. For each: one line on why it resonates and can carry the mechanism; one line on how it looks (ground and main colors, type voices, the one signature that makes it recognisable).
   - Include graphic and screen traditions the audience reads daily: notation, publications, identity programmes, data graphics, timetables, field guides, manuals, specimen books.
   - Ask what this would look like as a physical object, and what its world looked like before the web.
   - **Operate / Read:** candidates come from anywhere in that world except the tools the audience operates (terminal, scope, cockpit, control panel): those return as costumes on a working screen.
   - **Persuade / Experience:** tools and instruments of the audience count toward the rut; at most one candidate.
   - If more than three of the seven share one material family, dig until the list spans at least three families. Near-duplicates count once.
4. Turn each into a complete direction: a reusable visual world joined to a concrete first-surface experience. Every candidate must already be viable: every claim it visualises true, a real palette and component family, a distinctive composition with one product-specific experience, buildable with the available assets. Replace a candidate that fails on truth before the roll.

### 4.2 Roll
Run:

```bash
python3 scripts/concept_roll.py --scope direction --mode <persuade|experience|operate|read> --candidates 7
```

It prints a seed reference, the **assigned** index (the direction to build), two **dealt** alternates, and your **pick** rule. Re-rolls: `--from <seed> --reroll <n>` with optional `--register safer|bolder`.

- The assignment binds unless the user or brief pins a direction, or the assigned direction cannot carry the product's truth on named factual grounds. Taste is never grounds for your own re-roll.
- Collisions with pinned constraints resolve field by field: keep every pinned constraint; in open dimensions the assignment still binds through topology, controls, state vocabulary and ritual; when only its materials conflict with a pinned look, translate the material and name the translation.

### 4.3 Present
One direction, fully committed, with: world (palette chips in words, materials, type voices), first viewport, visitor path, signature interaction, cross-surface reach, honest risk. Then, as tappable options:
1. **The assigned direction** (leads; label it as the roll).
2. **Two dealt alternates**, same anatomy, one line each.
3. **Your pick** (only if your top-ranked candidate was not dealt): kicker "Taste's pick", with an honest risk line naming its familiarity when true. Never a ranked list; never in the lead position.
4. **The standing exit**: the category standard played straight. Quiet, always present, never recommended. If taken, ask once for 2-3 products this should sit alongside, make their craft level the bar, execute convention at full fidelity without irony.
5. **Re-roll**, with registers plain / safer / bolder. "Bolder" deals foreign forms; in degraded mode there is no catalog, so say the bolder register is unavailable and run a plain grounded re-roll with your remaining candidates pushed further.

After two consecutive re-rolls, ask what quality is missing. If nobody answers, proceed with the assigned direction and state the assumptions.

### 4.4 Surface roll (whole surface in an established world)
World is settled; candidates are structures (navigation model, how work areas divide the screen, what data leads, density, where the signature move sits). Run `concept_roll.py --scope surface --mode <mode> --candidates <5-7>`; present the three dealt structures as equal cards, the lead marked as the roll; the user locks one. No pick card, no standing exit at surface scope.

### 4.5 Commit the world
- **Color strategy** first (Restrained, Committed, Full palette, Drenched), then colors. Fields own regions.
- **Theme** from one sentence of physical scene.
- **Faces** chosen like objects from the subject's world, in the mode's register (`type-color.md`). Reflex faces need a reason no other face could satisfy; a subject association (books want serif, tech wants mono) is never that reason.
- **Claude's measured prior:** warm, bookish, family and child-facing subjects come out as cream ground, serif display with italic accent, and lamplight even when the direction never asked. Treat that first palette as spent. If your OWN-WORLD block says cream, paper, parchment, ivory or lamplight for a Persuade surface the brief did not pin, rework it from the world's saturated materials (bookcloth, thread, jackets, endpapers) first.
- Energy is not the enemy of trust: "no gamification, no hype" rules out devices, not exuberance.

---

## 5. The direction contract

Before code, write the contract into the surface brief under `## Direction contract`. Six short blocks, about 150 words total:

```markdown
## Direction contract
THESIS: the one idea this surface owns, and the category-default arrangement it refuses.
OWN-WORLD: palette and component language, specific enough to recognise with all content removed.
STORY: what the visitor understands, believes, and does.
FIRST VIEWPORT: the exact composition, what sits where at what scale, where the primary action is.
FORM: the chosen form, its position on your ordered list, and the seed reference (or "seed: none").
SIGNATURE: the one signature interaction and the motion grammar (code-led builds carry their ambition here).
FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, and DESIGN.md.
```

If a block reads like a mood, the direction is not decided. Never copy the contract into shipped source: no comments, hidden DOM, `data-*`, JSON-LD, or files served beside the artifact.

---

## 6. Build with full commitment

Build the assigned direction, not a safer interpretation. The form supplies structure, reading order, component conventions and native motion; the product supplies every fact. Commit every atom: nav, buttons, inputs and links rebuilt in the form's vocabulary; a stock component inside a committed form is a lapse. Land the first build fully committed; later passes clarify, never dilute.

- **The first viewport is a thesis, not a header.** Demonstrate the mechanism at the scale it has in life. Memory test: if someone left after one viewport, what would they describe an hour later? A mood means the concept has not committed.
- **Prove, don't claim.** Show the subject doing its job. Demonstration data is design material: author it at full fidelity, label it synthetic. Claims (prices, customers, benchmarks, capabilities) stay uninventable.
- **Author the assets; never substitute chrome.** Names, entries, copy, covers, thumbnails, textures are yours to author in greenfield work. Gradients, glass, generic icon tiles and many-vertex `clip-path` polygons where an asset belongs are the gap wearing chrome.
- **Build the form's web leverage.** When the world names a technique (canvas, WebGL, view transitions, generative motion), build the technique, not a static imitation.
- **Pace the scroll like a studio.** Vary density, scale, image, motion and quiet inside one grammar; a dense passage earns a quiet one; the page ends on a real close.
- **Real, verified imagery** when the brief implies it: search for the subject's physical object, verify URLs resolve; one decisive photo beats five mediocre ones. In Claude.ai published pages remote images are blocked, so inline as data URIs or use an image-generation tool when present.
- **Motion as material:** the form's native motion once, orchestrated (`motion-system.md`).

Mode limits:
- **Persuade:** the opening makes the offer intelligible and desirable, exposes the working primary action (an airline's route search, a store's add-to-cart, not a decorative link), and demonstrates something only this product can prove. The world may carry the page but never becomes a picture of it: navigation set into a facade still reads as links.
- **Operate:** someone fluent in the category knows where everything is before noticing the world. The world lends only type, palette, density and one signature move; never layout, navigation model or controls. Name the signature move concretely ("service health drawn as a transit map").
- **Read:** the world owns the frame (masthead, rail, ground, section openers, how code and tables are set); the reading column stays calm.
- **Experience:** the work leads from the first viewport; the interface recedes.

---

## 7. Inspect and finish

1. **Batched inspection**, desktop and mobile (plus the user's viewport if known), driving every interaction and reachable state: open, closed, hover, focus, error, empty, overlong content. Settle entrance motion before capturing. Two rounds maximum, fixes batched between them.
2. **Scan:** `scripts/detect.sh` + `scripts/taste_scan.py` once; fix what is mechanical; carry the rest into the review.
3. **Finish review** (`review.md` §4): step out of the build context and judge the render against the request, the answers and the direction contract. Disposition is one of four words: `ship`, `fix`, `rebuild`, `recapture`. Act on it; report the verdict at its real scope (a fix-list pass is not whole-surface approval).
4. **Document:** new or replacement world → write DESIGN.md from the built result (`design-md.md`). If a DESIGN.md already exists, show it and offer refresh, overwrite or merge. Ordinary extensions do not rewrite DESIGN.md.
5. **Hand over files:** PRODUCT.md, surface brief (with contract), DESIGN.md.
