# Taste v3 - Sources and Licenses

Taste v3 is an internal skill built on these sources, read at source in October-November 2026. Doctrine is paraphrased and adapted; no third-party recipe library is redistributed.

| Source | License | What Taste v3 uses |
|---|---|---|
| Leonxlnx/taste-skill (Taste Skill v2) | MIT | Brief inference, dials, design-system map, marketing rules, bans |
| Taste Report v1 (internal; distilled from ant-design/ant-design-pro, recharts/recharts, creativetimofficial/ui, all MIT) | MIT sources | Product mode, stack files, charts, marketing reports (copied with v3 edits) |
| pbakaus/impeccable | Apache-2.0 | Modes, init/shape/new-work process, direction contract, concept roll procedure (degraded port), craft floor, critique/audit/polish/finish review, command playbooks, detector rule IDs. The detector itself is invoked via `npx impeccable`, not bundled. |
| jakubkrehel/make-interfaces-feel-better | MIT | Surface details, animation rules, icon rules, polish report format |
| greensock/gsap-skills | MIT | GSAP API, ScrollTrigger, React, plugin and performance practices |
| Jakubantalik/transitions.dev | Custom (free use; no redistribution of the library) | Motion-token scale values and polish rules, referenced with credit; recipes are installed via its CLI, never copied |
| VoltAgent/awesome-design-md | MIT | DESIGN.md section structure and usage guidance (brand files are referenced, not copied) |
| donxito/DesignHandoff | No license file | Concepts only (export formats, neobrutalist reference); no code copied |
| Google DESIGN.md spec | per spec repository | Frontmatter token schema and section order |

Changes from Taste v2 / Report v1 resolved in v3: eyebrows banned (was rationed); press scale 0.96 (was 0.98); `transition: all` removed from dial definitions; Geist/Outfit removed from Persuade suggestions; GSAP skeletons rewritten with `useGSAP` + `gsap.matchMedia` (v2 mixed Motion's `useReducedMotion` into GSAP leaves); motion moved onto one token scale; status accent strip restricted to avoid the side-tab tell; Read mode added.
