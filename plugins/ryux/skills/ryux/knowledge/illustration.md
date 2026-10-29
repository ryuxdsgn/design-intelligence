# Illustration

Makes illustration, mascots, and custom icon sets that say something: a concept for each asset's meaning, a written style, one family, checked on the render.

> Group UI · Delivery Gate area UI · RYUX 2.20.0. Levels are defined in `SKILL.md`.

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
3. **Construction.** Silhouette first: the subject reads as one flat shape at display size before
   any detail. Then the relations between parts (what touches, what overlaps, where the light comes
   from), then detail. Name layers for what they are (`recipe-box`, `steam`, not `path-12` or a
   coordinate). Pick the method from the asset's job (RX-UI-21) and ship it themed (RX-UI-19).
4. **Render and read.** Render at display size and 2x, on light and dark, and look before anything
   else. Cover the label and write what each asset says; compare it with the stage 1 line. Then
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
  - Put the set side by side before handoff and fix the one that stands out.
- Do not: Make each illustration in a separate prompt and hand them off without comparing them, or give one more detail or colour than the rest.
- Why: Users read a mismatched set as a mistake or a different product, and a generator drifts in style from prompt to prompt. (Design-system practice (one illustration family); RX-DS-02 consistency; owner review 2026-10-22: request for illustration guidance)
- Not when: a single illustration
- Trade-off: the whole set is redone when the style changes
- Check: render, side by side

### RX-UI-19 [Contextual] Illustration ships as a themed, accessible asset

- When: illustration goes into a build, or into a design file that will be built
- Do: Flat and line art as SVG: colours from tokens (currentColor or CSS variables) so dark mode follows (RX-DS-05), a viewBox with no fixed size, no embedded raster, no text inside the art; text stays in the HTML so it can be translated and scaled.
  - Raster art (generated or 3D) at 2x the displayed size, compressed, with width and height set so the layout does not jump.
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
  - SVG, drawn or procedural: art that must follow the theme, scale, animate, or stay editable; the default for spot and empty-state illustration (RX-UI-19).
  - Generated raster: painterly, photographic, or richly textured art for onboarding and hero moments. Lock the style with the written style (RX-UI-17) and reference images, then refine in steps (sketch, mask, edit), not by re-rolling the prompt.
  - 3D render: when form, material, and light carry the meaning, or the same object appears from several angles or in motion. One scene per set: the same camera, lights, and materials, coloured from tokens.
  - Combined: for example a 3D render with an SVG overlay; text stays in the HTML either way.
  - Name the tool you actually have. With no generator or 3D tool available, hand off the brief with SVG or a placeholder that looks like one (RX-AS-03), and never claim a render you did not make.
- Do not: Use whichever generator is at hand, make an empty state that must follow dark mode as a raster, re-roll a prompt until something looks good, or mix 3D and flat art in one set without a rule for it.
- Why: The method decides what the asset can do later (theme, scale, animate, edit) and how far its style drifts from one image to the next. (Art direction practice (choosing a production method); RX-UI-19; owner review 2026-10-23: request for illustration production methods)
- Not when: the brand's illustration system already sets the method; follow it
- Trade-off: the best method for the job may be slower than the generator at hand
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
  - After rendering, look at each asset at its display size with the label covered and write what it says. When that is not the line you wrote, or a part reads as something else (a magnifier as a pan, a vehicle lost against a same-coloured background), redraw that part and look again.
- Do not: Draw the category's pictogram for a specific meaning, put content in an empty state, or judge the art only enlarged with its caption beside it.
- Why: An illustration that does not show its meaning is decoration; in the illustration baseline every low score was a concept that said the wrong thing, none was broken drawing. (Art direction practice (concept before rendering; the read test without a caption); illustration baseline 2026-10-29 (docs/benchmarks/illustration): a crew-list icon with no list, empty states that read as full; AI rater approved by the owner; owner decision 2026-10-29: art direction first, no geometry engine)
- Not when: the brand's illustration system already fixes the subject for this asset; follow it
- Trade-off: a written line per asset and one more look at the render before handoff
- Check: the concept lines; the render at display size with the label covered
