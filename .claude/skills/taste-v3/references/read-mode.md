# Read Mode - Docs, Guides, Articles, Changelogs, Long Reports

New in v3, from Impeccable's Read mode. The visitor came to understand something: the page is first a document of its kind, framed by the world. Docs read as docs, a guide as a guide, an article as an article.

## 1. Frame vs column

- **The world owns the frame:** masthead, navigation rail, ground, title and section openers, how code, tables and callouts are set, a numbering or margin system. Palette, type and the signature move commit fully there, so the page could belong to no other product.
- **The column stays calm:** a reading face, real contrast, 60-75ch measure, body near 16-18px, nothing performing behind the text.
- **The world never supplies the reading order** or replaces navigation with something a reader must learn.
- Candidates that transfer best: reference books, type specimens, timetables, field guides, technical manuals, scholarly apparatus, a newspaper's wayfinding. Tools and fictional interfaces come back as costumes.

## 2. Shell first

Write the first viewport as: navigation and where the reader stands in it → title and the opening that answers or frames the question → reading column → the way forward (contents, headings, previous/next). Then name where the world owns the frame and where the signature move lives (masthead, colored rail, running head, margin notes, a way of setting code).

## 3. Typography and rhythm

- One reading family is often enough; a second only for a role it alone performs (display in the frame, mono for code and parameters, never for running text or headings by default).
- Fixed rem scale, ratio ~1.2; headings balanced, body `text-wrap: pretty`; more space above headings than below.
- Paragraph rhythm by spacing *or* first-line indent, never both.
- Light text on dark: slightly more leading, a touch more tracking, one weight step up when the face needs it.
- Code blocks scroll horizontally inside their own container; tables wider than the column get `overflow-x: auto`, never the page.
- Links: underline with `text-underline-offset: 0.2em`, themed color, visited state where useful.

## 4. Wayfinding and components

- Sidebar tree, top tabs or inline contents: pick one navigation model; show the reader's position.
- Sticky on-page contents for long pages (≥ 3 screens) on desktop; collapsible on mobile.
- Anchor every heading (`scroll-margin-top` past sticky headers).
- Callouts (note, warning, danger) as standard forms in the world's palette: tinted background or icon + label, never a thick colored left stripe.
- Search results, empty search, and 404 are part of the docs.
- Reports read once: takeaway titles, summary first, one message per chart, source line per chart, appendix for definitions (`product-mode.md` §7); print CSS when it will be forwarded as PDF.

## 5. Read pre-flight

- [ ] Reader can tell where they are and where to go next?
- [ ] Body comfortable: measure 60-75ch, contrast AA (aim AAA), size ≥ 16px?
- [ ] Cover the name: could this be any other product's docs? If yes, push the frame further into the world.
- [ ] Does the world reach the column? If yes, pull it back to the frame.
- [ ] Code and tables scroll inside their containers; no horizontal page scroll?
- [ ] Headings anchored, hierarchy unskipped (h1 → h2 → h3)?
- [ ] Hardest content sample (code, reference table, diagram) designed, not just prose?
- [ ] No eyebrows, no em-dashes in UI chrome, no motion in the column?
