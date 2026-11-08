# Review - Critique, Audit, Polish, Finish

From Impeccable's critique / audit / polish / finish-reviewer, plus the polish report format from make-interfaces-feel-better. Keep deterministic evidence (detector, computed values) separate from visual judgment, and never imply an uninspected surface was reviewed.

## Contents
1. Critique (UX, scored /40)
2. Audit (technical, scored /20)
3. Polish (final pass)
4. Finish review (dispositions)

---

## 1. Critique

**Inputs:** the target (screenshot, URL, code, artifact), PRODUCT.md and the surface brief if they exist. Run two assessments and keep them apart until synthesis: (A) your unanchored design review; (B) evidence: `scripts/detect.sh` on rendered HTML or URL, computed contrast, measured spacing.

**Report, in this order:**

1. **Design Specificity Verdict (start here).** Does it feel authored for this product, or category-interchangeable? Cover coherence, structural sameness, interchangeable choices, missed chances for product character. Then the deterministic scan: counts, locations, what it caught that you missed, false positives.
2. **Design Health Score**, Nielsen's 10 heuristics, 0-4 each:

| # | Heuristic | Score | Key issue |
|---|---|---|---|
| 1 | Visibility of system status | | |
| 2 | Match between system and real world | | |
| 3 | User control and freedom | | |
| 4 | Consistency and standards | | |
| 5 | Error prevention | | |
| 6 | Recognition rather than recall | | |
| 7 | Flexibility and efficiency of use | | |
| 8 | Aesthetic and minimalist design | | |
| 9 | Error recognition and recovery | | |
| 10 | Help and documentation | | |
| | **Total** | **/applicable max** | **band** |

Scale: 0 absent or broken, 1 major failures, 2 partial, 3 good with minor gaps, 4 genuinely excellent. Most real interfaces land 20-32/40. On Persuade/Experience surfaces heuristics 7 and 10 (and any that truly cannot apply) may be `n/a` with a one-line reason; renormalise (e.g. 24/32), never print /40 over a partial set. Bands by percentage: ≥ 85% excellent, 70-84% good, 50-69% acceptable, 30-49% poor, < 30% critical.

3. **Overall impression:** gut reaction, the single biggest opportunity.
4. **What's working:** 2-3 specifics and why.
5. **Priority issues:** 3-5, each `[P?] What / Why it matters / Fix / Suggested command`.
6. **Persona red flags:** pick 2-3 relevant personas, walk the primary action, name exactly what breaks for each:
   - **Alex, impatient power user:** keyboard shortcuts, clicks to primary action, forced tours, bulk actions.
   - **Jordan, confused first-timer:** jargon, icon-only navigation, no visible help, unclear next step.
   - **Sam, accessibility-dependent:** keyboard path, focus visibility, screen-reader names, contrast, motion.
   - **Riley, deliberate stress tester:** long strings, empty and error states, double submits, odd inputs.
   - **Casey, distracted mobile user:** thumb reach, hit areas, interrupted flows, slow network.
   Add 1-2 project personas from PRODUCT.md when it exists.
7. **Minor observations**, then **Questions to consider** (provocative, unlocking).
8. **Recommended actions:** commands in priority order, ending with `polish` if fixes were recommended.

**Cognitive load lens:** count the decisions on screen; flag walls of options, memory bridges (information needed from a previous screen), hidden navigation, jargon, visual noise floors, inconsistent patterns, multi-task demands, context switches. Working memory holds ~4 chunks.

**Severity:** P0 blocks task completion; P1 significant difficulty or WCAG AA violation; P2 annoyance with workaround; P3 polish. Keep P3s few.

---

## 2. Audit

Code-level, measurable. Document, do not fix. Score each dimension 0-4:

| # | Dimension | Checks |
|---|---|---|
| 1 | Accessibility | contrast (4.5 / 3 / 7 AAA), reduced-motion alternative that keeps feedback (a global 0.01ms kill fails), ARIA roles/labels/states, keyboard path and traps, focus indicators, semantic HTML and landmarks, heading order, alt text, labelled inputs and errors |
| 2 | Performance | layout thrashing, layout-property animation, unbounded blur/shadow, missing lazy loading, oversized assets, `will-change` left on, unused dependencies, re-renders |
| 3 | Theming | hard-coded colors, broken dark mode, mixed token types, values that ignore theme switches |
| 4 | Responsive | fixed widths, hit areas (44 touch / 24 WCAG floor with spacing), touch gestures that fail or swallow scroll, horizontal overflow, text scaling, missing breakpoints |
| 5 | Implementation integrity | detector findings verified in context, repeated shortcuts, design-system drift, decorative or misleading content, structure interchangeable with an unrelated product |

Total /20: 18-20 excellent, 14-17 good, 10-13 acceptable, 6-9 poor, 0-5 critical. Report: Implementation Integrity Verdict first (pass/fail, evidence), executive summary (score, counts by P0-P3, top issues), findings by severity (`[P?] name / location / category / impact / standard / recommendation / suggested command`), systemic patterns ("hard-coded colors in 15+ components"), positive findings, recommended commands. Say what produced each piece of evidence (emulated viewport vs real device, which engine) and what stayed untested.

---

## 3. Polish

Polish is refinement, never concealed redesign. If the concept itself is wrong, say so and recommend a redesign or `bolder`.

1. **Establish the system:** read DESIGN.md, tokens, shared components, neighbouring flows. Classify each drift: missing token, one-off implementation (should use a shared component), conceptual mismatch (flow differs from comparable areas), local defect. Fix at the narrowest correct level.
2. **Gather evidence:** use the feature at its representative sizes; know the quality bar and what is deliberately unfinished. Incorporate a prior critique's P0/P1 if one exists.
3. **Triage order:** broken tasks, data loss, misleading state, inaccessible paths → missing loading/empty/error/success/disabled/permission states → flow, hierarchy, responsive, system drift → visual and motion inconsistencies → code and asset cleanup. Do not perfect one corner while the rest stays below the bar.
4. **Polish the whole path:** flow and hierarchy, layout and type (grid, optical alignment, consistent roles, wrapping, zoom), color and icons (tokens, contrast in every state, one icon family and stroke), interaction (every state, focus, hit areas, interruptible motion on tokens), content (terminology, capitalisation, no em-dashes), code (dead code, duplicates, shared components, tokens for genuinely reusable values).
5. **Verify** with mouse, keyboard and touch across mobile, intermediate and wide; long, empty, error and slow states; console errors and layout shift. Finish with a clean diff.
6. **Report** in the surface-details format (`surface-details.md` §10): findings tables by principle, considered-but-rejected, verification, verdict.

---

## 4. Finish review

For new surfaces and worlds, after the build's two inspection rounds. Without subagents, run it in-thread: explicitly set aside the build's framing and optimism, and judge only from the inputs below. Disclose this in one line.

**Inputs:** the original request, confirmed answers, the direction contract, captured screenshots or the artifact, scan findings, the craft floor (`SKILL.md` §4), the mode's pre-flight.

**Check, in order:**
1. **Evidence validity:** captures show what they claim (no blank regions, no mid-animation states, correct section). Invalid evidence → `recapture`; nothing reviewed on it binds.
2. **Contract fidelity:** does the render deliver THESIS, OWN-WORLD, FIRST VIEWPORT and SIGNATURE in behaviour, not just mood? Would the memory test pass?
3. **Craft floor and bans:** every check green; every ban absent.
4. **Mode job:** Persuade - a first-time visitor knows what, why, and what to do within seconds, in the form's vocabulary. Operate - a category-fluent user finds everything before noticing the world. Read - the reader knows where they are and reads comfortably. Experience - the work leads.
5. **Brief coverage:** every requirement present and findable.

**Disposition, exactly one word:**
- `ship` - nothing material owed; continue to DESIGN.md.
- `fix` - list material fixes; apply in one batch, recapture the same views, then score each fix resolved / partial / unresolved. Two rounds is the unattended budget; then put the table in front of the user.
- `rebuild` - fidelity failed wholesale (the contract's world or first viewport is not there). Re-derive the named regions and run a full review again, not a fix-list pass.
- `recapture` - the evidence failed, not the build.

Report the verdict at its real scope: "all three fixes scored resolved" is supportable, "no issues remain" is not unless a full review said so. When the user answers a ship with contrary evidence (their screenshot, a named mismatch), their evidence outranks your captures: run a fresh full review.
