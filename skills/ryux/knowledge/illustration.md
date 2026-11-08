# Illustration

Makes illustration, mascots, and custom icon sets that say something: a concept for each asset's meaning, a written style, one family, checked on the render.

> Group UI · Delivery Gate area UI · RYUX 2.22.6. Levels are defined in `SKILL.md`.

**Illustration that says something.** Read this with knowledge/imagery.md when the work
draws illustration, a mascot or character, or a custom icon set. The common failure is not broken
geometry but a concept that says the wrong thing: an empty state drawn full, an icon that is the
category's pictogram (illustration baseline, 2026-10-29). Work in five stages; each leaves something
you can check.

1. **Brief.** Each asset's job, the line it must say (RX-UI-24), its display size, and its modes
   (light, dark). On an expressive surface, the Visual Brief comes first (knowledge/imagery.md).
2. **Concepts.** Two or three concepts per asset, a line each, from the product's own world rather
   than the category's; pick the one that reads fastest without its label. Write the style before the
   first drawing (RX-UI-17); a set shares it (RX-UI-18). Only the chosen concept is drawn.
3. **Make it.** Pick the method from the job (RX-UI-21). With an image tool (in Figma,
   generate_image), RYUX directs and the model draws: the default for feature icons at 48 pt and up and
   for spot, empty-state, success, and onboarding illustration. Write the concept line per asset and one
   style block for the set (type such as clay, 3D, duotone, or flat; palette as hex; light; camera;
   background, matched to where the asset sits; level of detail), paste the same block into every
   prompt, and keep text out of the image. A connector's image tool may load on demand: look for it
   (in Claude Code, search the tools for generate_image) before deciding there is none. Say how many
   images and ask once, recommending generation; when no answer can come during the run, end the turn
   with that question instead of drawing vectors, and name the method used in the final message. Read each result at
   display size, regenerate at most twice, then change the concept or the method; label each one
   generated. Draw vectors for system icons, and for art that must follow the theme by itself, animate,
   or stay editable; then build it as below.
   **Drawing vectors.** Silhouette first: the subject reads as one flat shape at display size before
   any detail. Then the relations between parts (what touches, what overlaps, where the light comes
   from), then detail. Name layers for what they are (`recipe-box`, `steam`, not `path-12` or a
   coordinate). Pick the method from the asset's job (RX-UI-21) and ship it themed (RX-UI-19).
   **Craft on a canvas.** Draw from paths, not stacked rectangles and circles: in Figma, write the
   SVG and import it (`createNodeFromSvg`); in pen.dev, use its path nodes. Give each object the parts
   that make it that object (a scale has a pan, a beam, and a needle; a plain box with a number is a
   display, not a scale). Light comes from one side; each material gets three tones from the palette
   (base, shadow, highlight): metal a bright band and a dark reflection, paper an edge and a soft
   shadow. A photo or a 3D render of the real product is often better than drawing it: generate it
   from the Visual Brief with the tool's image generation (in Figma, generate_image) and label it
   (RX-UI-13). A planned asset is made, never dropped for type or a slot because it takes longer.
4. **Render and read** (RX-UI-30). Render each asset alone at display size and 2x, on light and dark, and look before anything
   else; read it against the seven checks, and redraw or switch method on two fails. Cover the label and write what each asset says; compare it with the stage 1 line. Then
   craft: the silhouette, joints and overlaps, the size of shadows, contrast between the subject and
   what is behind it, and what is lost at the smallest size. Fix and render again; compare a set side
   by side (RX-UI-18).
5. **Final direction.** Hold the result against the brief: each asset says its line, in one style,
   with no part that reads as something else. A mode or size you did not render is NOT VERIFIED.

Keep the cost in proportion: concepts are written, not drawn, and the render loop stops when the
read matches the line, not when nothing more could be polished.

Does not cover: photos, 3D scenes, motion, and sourcing (see knowledge/imagery.md), or functional
icons from the icon set (see `knowledge/ui.md`).

## Evidence from RYUX Knowledge

How comparable products illustrate the same moment: `search_screens` by pattern (empty state, onboarding), with the screen_ids behind it. Without the ryux MCP, say the evidence comes from the design and standards alone.

> Hard Gates always apply, whichever skills are loaded: no invented numbers, people, urgency, business
> rules, or terms; no placeholder shipped as final; no missing critical states. Labeled sample data is
> not an invented number; an unconfirmed capability is never presented as confirmed. See `SKILL.md`.

## Rules

### RX-UI-17 [Contextual] Illustration follows a written style

- When: the design adds or makes illustration (spot, empty state, onboarding, hero) and the brand has no illustration system
- Do: Before the first drawing, write the style in five lines (six with characters) in DESIGN.md or the Assumptions:
  - line: stroke weight and cap, or no stroke
  - shape: geometric or hand-drawn, and the corner radius
  - colour: 2 to 4 tokens from the palette, one accent
  - depth and detail: flat, one shadow tone, or 3D; how much detail
  - subject: objects from the product, people, or abstract
  - texture, when the style has any: one family, its source, and its strength (RX-UI-22)
  - characters, when the style has people or a mascot: proportions, face detail, the range of people shown, and a short set of poses and expressions; one character system across the product
  - Derive each line from the visual language (RX-UI-10): the stroke from the icon set, the radius from the components, the colour from the tokens. Functional icons stay in the icon set (RX-UI-13), not in the illustration style.
  - Record the style as a Decision Receipt: evidence from a brand guide, references, or the brief; Evidence None when it is derived from the visual language alone.
- Do not: Draw in the generator's default style (flat people with oversized limbs, gradient blobs, isometric 3D), or mix line and filled illustration in one product.
- Why: Without a written style, illustration drifts toward the generator's default and away from the UI around it. (Art direction practice (a written illustration style); RX-UI-10 chosen visual language; anti-slop tell (generic illustration); owner review 2026-10-22: request for illustration guidance)
- Not when: the brand already has an illustration system; follow it (RX-UI-13)
- Trade-off: one more step before the first drawing, and less variety
- Check: review

### RX-UI-18 [Contextual] A set reads as one family

- When: the product uses more than one illustration (empty states, onboarding steps, errors)
- Do: Make the set together: same canvas and framing, same stroke and palette, same subject scale and footprint (an added badge stays inside it), viewpoint, and level of detail.
  - Tie each subject to the screen's job: an empty state shows what will appear there, drawn empty (RX-UI-24), not a mascot shrugging.
  - In an icon set, each icon is a different object: two services never share one main object (cleaning and a refill both drawn as a bottle). When the set is about one thing (the AC unit), that thing stays in every icon and the icons differ in what happens to it. Check that no cue reads as the opposite state (steam on an AC reads as heat).
  - Put the set side by side before handoff and fix the one that stands out.
  - People in the set look like the product's users: skin tones, ages, bodies, and dress (a hijab, glasses, a wheelchair) chosen from who uses it, not one default figure; an outline figure with no skin tone is often read as white, so give each figure a tone on purpose.
- Do not: Make each illustration in a separate prompt and hand them off without comparing them, give one more detail or colour than the rest, or draw every person as the same default figure.
- Why: Users read a mismatched set as a mistake or a different product, and a generator drifts in style from prompt to prompt. (Design-system practice (one illustration family); RX-DS-02 consistency; owner review 2026-10-22: request for illustration guidance; people who look like the users: NNGroup Inclusive Design (Kendrick 2022); benchmark 2026-11-08 (docs/benchmarks/illustration, owner blind): a RYUX icon set drew two services as the same bottle, a no-skill set put steam on an AC)
- Not when: a single illustration
- Trade-off: the whole set is redone when the style changes
- Check: render, side by side

### RX-UI-19 [Contextual] Illustration ships as a themed, accessible asset

- When: illustration goes into a build, or into a design file that will be built
- Do: Flat and line art as SVG: colours from tokens (currentColor or CSS variables) so dark mode follows (RX-DS-05), a viewBox with no fixed size, no embedded raster, no text inside the art; text stays in the HTML so it can be translated and scaled.
  - Raster art (generated or 3D) at 2x the displayed size, compressed, with width and height set so the layout does not jump; a transparent background, or one image per theme when its background shows (a tile colour, dark mode).
  - Decorative art gets aria-hidden or an empty alt; art that carries meaning gets alt text that says the meaning, not the drawing (RX-A11Y-04).
- Do not: Hard-code colours that vanish on dark, bake words into the image, ship an export with editor metadata, or write alt text that describes the picture ("a woman holding a box") instead of what it means.
- Why: Art that ignores tokens breaks in other themes, text inside an image cannot be read, translated, or zoomed, and alt text that only describes the drawing says nothing. (WCAG 2.2 SC 1.1.1 (non-text content); RX-DS-03; RX-DS-05; RX-A11Y-04; owner review 2026-10-22: request for illustration guidance)
- Not when: a concept frame that will not be built
- Trade-off: SVG built from tokens takes longer than one export
- Check: render in every theme; read the SVG source
- Machine check: `ryux scan` flags an .svg file whose root has no viewBox, so it cannot scale (fail); an .svg file with a fixed width or height on the root, an embedded raster, <text> inside the art, or editor metadata (warn)

### RX-UI-21 [Contextual] Pick the production method from the asset's job

- When: the design makes illustration, 3D, or a generated visual rather than sourcing one (RX-UI-13)
- Do: Choose the method from what the asset must do later, and write it on the Visual Brief's Method line:
  - Generated raster, RYUX directing: the default for feature icons at 48 pt and up, spot, empty-state, success, and onboarding illustration when an image tool is available (in Figma, generate_image). RYUX writes the concept line per asset and one art direction for the set (type, palette as hex, light, camera, background, detail); the model draws; RYUX reads the result at display size. The same style block goes into every prompt of a set, no text inside the image, at most two regenerations per asset before the concept or the method changes, then refine in steps (mask, edit), not by re-rolling.
  - Before deciding there is no image tool, look for one: a connector's tools can be loaded on demand (in Claude Code, search the tools for generate_image).
  - Paid generation is asked once, with the count and generation recommended. When the user cannot answer during the run, end the turn with that question, as with a direction pick; do not draw vectors in its place. Whichever method is used, the Method line and the final message name it and why.
  - SVG, drawn or procedural: system icons always; and art that must follow the theme by itself, animate, stay editable as vectors, or be made with no image tool (RX-UI-19).
  - 3D render: when form, material, and light carry the meaning, or the same object appears from several angles or in motion. One scene per set: the same camera, lights, and materials, coloured from tokens.
  - Combined: for example a 3D render with an SVG overlay; text stays in the HTML either way.
  - Name the tool you actually have. With no generator or 3D tool available, hand off the brief with SVG or a placeholder that looks like one (RX-AS-03), and never claim a render you did not make.
- Do not: Hand-draw detailed illustration as vectors when an image tool is available and nothing needs the vectors, give a generator a vague prompt instead of the written art direction, make an empty state that must follow dark mode as one raster (make one per mode, or SVG), re-roll a prompt until something looks good, switch to drawn vectors without saying so because generation needed an answer, or mix 3D and flat art in one set without a rule for it.
- Why: The method decides what the asset can do later (theme, scale, animate, edit) and how far its style drifts from one image to the next. (Art direction practice (choosing a production method); RX-UI-19; owner review 2026-10-23: request for illustration production methods; ryux illustration trials 2026-10-29 to 31: drawn vectors trailed on craft in every pass; ryux run 2026-11-07 (Sejuk, one run, owner-rated): a generated set directed by one written style block rated craft 4.67 against 1.67 for drawn vectors, mean 4.18 against 2.82; benchmark 2026-11-08 (docs/benchmarks/illustration, RYUX 2.22.5, headless): no run generated, because the credit question had no one to answer, and the vector fallback went unmentioned)
- Not when: the brand's illustration system already sets the method; follow it
- Trade-off: a generated raster cannot be edited as vectors or follow the theme by itself, and paid generation costs credits; say how many images before generating
- Check: the Visual Brief's Method line; review

### RX-UI-22 [Contextual] Texture has a source and a limit

- When: the style uses texture or mixed media: grain, risograph, halftone, paper cut, collage, or hand-drawn marks
- Do: Choose one texture family and write it into the illustration style (RX-UI-17): what it refers to (a print process, a paper, a craft), why that fits the product's concept, and its strength.
  - Keep it on illustration and brand surfaces, never behind body text, amounts, or data, and measure contrast with the texture on (RX-A11Y-01).
  - Risograph uses two or three inks from the tokens with one fixed misregistration offset; collage uses only pieces the team made or can license (RX-UI-13).
  - On the web, build it as an SVG filter or a small tiled asset and check the page weight; reduce it at small sizes, where it turns to noise.
- Do not: Add grain or noise to make generic art look handmade, stack several textures, put texture under text or numbers, or run a wobble filter over geometric art and call it hand-drawn.
- Why: Texture with no source reads as an effect applied afterwards, not as character, and it costs contrast and page weight. (Art direction practice (print and craft texture: risograph, halftone, collage); RX-A11Y-01; RX-UI-13; owner review 2026-10-23: request for texture and mixed media)
- Not when: a clean, flat illustration style with no texture
- Trade-off: one texture family limits how expressive a single piece can be
- Check: render at the smallest and largest size; contrast with the texture on

### RX-UI-24 [Contextual] Each illustration shows its meaning

- When: the design draws illustration, a mascot, or a custom icon rather than taking one from the icon set
- Do: Before drawing, write one line per asset: what it must say (an empty recipe box: "nothing saved yet, add the first"), the concept that says it, taken from the product rather than the category (RX-UI-12), and the one visible cue that proves it (the box is open and empty; a crew-list icon has the list).
  - Write two or three concepts per asset, a line each, and pick the one that reads fastest without its label; draw only the chosen one.
  - The state is the meaning: an empty state is visibly empty (no cards, no full shelf), a no-results scene shows the search finding nothing, an offline scene shows the broken link.
  - A stock pictogram (a plain sailboat, two people, a sun and a cloud) is a choice: use it only when the meaning is the generic one, and say so.
  - The product's own object looks like the product (gold as a bar or a gram reading, not a card that reads as a credit card), and a mascot's or character's tone matches the stakes: for money, gold, health, or legal matters, no cartoon clowning.
  - One picture carrying several steps or states (an order tracker, a stepper, onboarding) is one asset per step: each shows that step's own action or object (the courier taking the bag, the scale, the machine, the scooter, the doorstep), not the same token recoloured or ticked. When the steps are too small for that at display size, keep the stepper plain and give the current step its own scene.
  - After rendering, look at each asset at its display size with the label covered and write what it says. When that is not the line you wrote, or a part reads as something else (a magnifier as a pan, a vehicle lost against a same-coloured background), redraw that part and look again.
- Do not: Draw the category's pictogram for a specific meaning, mark the steps of a tracker with one repeated shape that only colour or a label tells apart, put content in an empty state, or judge the art only enlarged with its caption beside it.
- Why: An illustration that does not show its meaning is decoration; in the illustration baseline every low score was a concept that said the wrong thing, none was broken drawing. (Art direction practice (concept before rendering; the read test without a caption); illustration baseline 2026-10-29 (docs/benchmarks/illustration): a crew-list icon with no list, empty states that read as full; AI rater approved by the owner; owner decision 2026-10-29: art direction first, no geometry engine; owner review 2026-11-05 of a laundry order tracker in Figma (RYUX 2.22.1, archived at tag archive/laundry-figma-2.22.1): five identical shirts on a clothesline, each step told apart only by colour and label; owner blind review 2026-11-08 of the Raja Emas landing (first round, not published): a gold card that read as a credit card, and a playful mascot judged wrong for a gold product)
- Not when: the brand's illustration system already fixes the subject for this asset; follow it
- Trade-off: a written line per asset and one more look at the render before handoff
- Check: the concept lines, one per step for a multi-step picture; the render at display size with the label covered

### RX-UI-30 [Preferred] Planned imagery is made, and passes a craft read before the page uses it

- When: the direction's carrier or imagery is an illustration, a render, or a photo
- Do: Make each planned asset before the page (RX-UI-29), by the method its job needs (RX-UI-21), with the tools in knowledge/imagery.md, Making images; label generated and retouched images, and before paid generation say how many and ask once.
  - Before the first asset, write one asset spec for the page in the direction block, so the subjects change and the treatment does not: the medium (RX-UI-32); for renders and photos, the camera (height, lens, angle) and the light (direction, temperature); the scale of an object that recurs; the staging (a contact shadow on a ground, or floating), the same for every asset; the crop and edge; the colour grade.
  - When the set is made, lay it side by side against the spec; an asset that differs on two or more axes is remade before the page uses it.
  - Read each asset alone at display size against seven checks: the silhouette reads with the label covered; the object has its defining parts; one light direction; three tones per material; clean joints; the written style (RX-UI-17); it reads at its smallest size.
  - Two or more fails: redraw or switch method (a render instead of hand-built vectors), two rounds at most, then use the better one and say what is weak.
  - Record each asset's method and read in the Delivery Gate.
- Do not: Drop a planned illustration or render for type, a slot, or a stock icon because making it takes longer; build a subject from stacked rectangles and circles; or place an asset on the page before reading it alone.
- Why: A direction sold on its imagery and then built without it is a different, plainer direction; an asset nobody read alone reaches the page with its flaws. (Illustration and art direction practice (silhouette, construction, light and tone; a shot list with one camera and light for a set); owner review 2026-10-31 of RYUX trials T1 to T4: no image was made in three, and the pages read as plain; owner review 2026-11-02 of trial T11: three renders with different cameras, scales, and staging read as three pages)
- Not when: the direction's imagery is type alone or the product's screens
- Trade-off: making and reading each asset costs tool calls before the page exists; the read stops when the seven checks pass, not when nothing could be polished
- Check: the asset spec written before the first asset; the set compared side by side against it; assets made out of those planned, each with its method and the seven-check read; report them in the Delivery Gate UI line
