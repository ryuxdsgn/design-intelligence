# UI design

Gives a product a visual system: hierarchy, type, layout, density, color, icons, and detail craft that communicate instead of decorate.

> Group UI · Delivery Gate area UI · RYUX 2.21.0. Levels are defined in `SKILL.md`.

**Visuals are not decoration. They are communication.** RYUX UI owns the visual expression of
a product: what each visual decision communicates, why it exists, and how it behaves. Functional UI
helps the user read, decide, or act. Anything decorative needs a stated reason (see the purpose
gates in `knowledge/anti-slop.md`). This module is the visual system; art direction, motion, and assets live in
knowledge/imagery.md, and illustration in knowledge/illustration.md, read when the work has them.

**1. UI system.** Work in this order:
1. **Hierarchy**: what is read first, second, third? The primary action and key information win.
2. **Layout and alignment**: a shared grid; groups by meaning; consistent edges.
3. **Spacing and type**: one scale; size and weight carry hierarchy, not color alone.
4. **Density**: compact for repeat work, roomier for first-time or high-stakes decisions.
5. **Color**: roles first (surface, text, accent for the primary action, status); contrast checked.
6. **Containers**: use a container only when it groups or separates something.
7. **Icons**: next to labels, from one set, at consistent sizes, one meaning each (RX-UI-20).

**Justify values.** Every value comes from the scale and has a reason you can say in one line:
"12px between these two fields because they belong together; 24px before the next group because it
is a new topic." Tighter inside a group, looser between groups; density follows the task. If you
cannot say why 8 and not 12, the choice is not a decision yet.

**Set the type, don't only size it** (RX-UI-14). Body text reads best at 45 to 75 characters per line:
give paragraphs a max width and check the rendered count (about 30 to 34em in most text faces; CSS
`ch` is the width of a zero, so 65ch runs well past 75 characters). Line-height falls as size rises:
about 1.5 for body, 1.2 to 1.3 for headings, close to 1.1 for display. Large display text tightens
slightly; small uppercase labels open up (about 0.05em). Numbers people compare or watch change use
tabular figures. Two families at most, three weights at most: hierarchy comes from size and weight
steps, not from more faces. Headings do not end on one stranded word (`text-wrap: balance`, or
rewrite).

**Direction grammar** (RX-UI-26). A direction is a set of visual decisions with reasons, not a style
name. Build it from these dimensions; the values are vocabulary, not a menu:
- **Philosophy**: minimal, expressive, functional, experimental
- **Grounding**: the product's mechanism, an object, a place, a ritual, a material, or none (conventional)
- **Movement**: swiss, editorial, brutalist, retro, vernacular, or none
- **Type**: grotesk, humanist, geometric, serif, slab, mono; a display face with a partner
- **Colour behaviour**: monochromatic, tonal, high contrast, vibrant, muted
- **Shape**: geometric, organic, sharp, soft
- **Layout**: modular, editorial, asymmetric, structured; composition moves that break the stack of
  split sections: a visual crossing a band edge, a full-bleed image with type on it, oversized type
  cropped by the frame, layered cards overlapping, a sticky column beside scrolling content, a
  horizontal rail, an asymmetric editorial grid, one centred statement between wide sections
- **Density**: compact, balanced, spacious
- **Material**: flat, dimensional (soft gradients and shadows), atmospheric (mesh, light, glow with a
  job), textured (grain, print), translucent
- **Imagery**: flat vector, dimensional vector, 3D render, the product's UI composed large and layered,
  retouched photography, mixed media (photo with drawn devices), atmosphere, illustration styles (line,
  hand-drawn, collage, editorial, character; RX-UI-17), or type alone; none needs a reason
- **Motion**: functional, expressive, playful, cinematic (RX-UI-11)

Coherence: at most two dimensions at an extreme, the rest support them; each value has a reason from
the product profile or follows another dimension for unity (say which). Risky pairs carry a condition:
translucent with long text needs measured contrast; compact for older users fails; vibrant on money
screens keeps the status colours readable. A keyword is not a recipe: swiss is not every B2B product,
editorial is not always a big serif, minimal is not always cream and white space, playful is not
always pastel and round.

**Craft is the last 10 percent people notice first** (RX-UI-15). Icons sit on the optical center of
their text, sized to its line-height, with a stroke that matches the type weight. Number columns align
right or on the decimal. Borders, dividers, and shadows come from one small token set. Long text
truncates on purpose, with the full value still reachable.

Does not cover: component reuse and tokens (see `knowledge/design-system.md`), or imagery, motion, and
assets (see knowledge/imagery.md).

## Evidence from RYUX Knowledge

A design direction from comparable screens: `extract_design_direction` (patterns, principles, pitfalls) with the screen_ids behind it. Without the ryux MCP, say the evidence comes from the design and standards alone.

> Hard Gates always apply, whichever skills are loaded: no invented numbers, people, urgency, business
> rules, or terms; no placeholder shipped as final; no missing critical states. Labeled sample data is
> not an invented number; an unconfirmed capability is never presented as confirmed. See `SKILL.md`.

## Rules

### RX-UI-01 [Required] [Quality Lock] Hierarchy follows priority

- Do: Make the primary action and the key information the most prominent things in each area, with one clear focal point.
  - Place each control next to the data it changes (a hide-balance toggle beside the balance it hides, not in the header).
  - Make the primary action read as an action, not a place: its own button with an action label. It may sit in the center of a bottom bar when it is clearly different from the tabs (its own shape, color, and size, with room around it), but it is never styled as one of the tabs and never crammed between them.
  - Use one display size per screen, for its single most important number or heading.
  - Show each fact and each action once per view. When an action needs two places (a header and a bottom bar), each appears only at the widths where the other is hidden. Show a state as text, not as a disabled button ("Up to date", "All drafted").
- Do not: Give everything equal weight, let decoration outrank content, park a control far from what it acts on, make the main action look like one more tab, or repeat a count or an action in the same view.
- Why: Hierarchy is how users know what to read and do first; a control beside its data shows what it changes, and an action that looks like a tab reads as a place, not a task. A fact shown twice makes users check whether the two agree, and a second button for one action, or a disabled button that only reports a state, takes the place of the next real step. (NNGroup visual hierarchy; Gestalt proximity; Fitts's law (Fitts 1954) for the primary action's size and reach; ryux four-problems blind rating, rater 1 (product designer), 2026-10-16: a hide toggle far from the balance and a CTA crowding the bottom nav were reasons not to ship; explore-judge blind rating 2026-10-18: the same rater shipped a screen with a distinct centered pay button in the bottom bar; owner review of the RYUX editor, 2026-10-28 ("no double information or double action"): one personal-data count shown three times, Publish in both the header and the review card, and disabled "Up to date" and "All drafted" buttons that only reported a state)
- Not when: screens with several equal peers, such as a dashboard of comparable items; use consistent hierarchy within each card instead
- Trade-off: emphasizing one thing de-emphasizes the rest
- Check: visual QA

### RX-UI-03 [Preferred] [Quality Lock] One spacing and type scale

- Do: Use the project's spacing and type scale, or define one (for example multiples of 4 or 8), and align elements to a shared grid.
  - Keep a screen's main content to two or three text sizes, the most important the largest, and count them on the render (RX-AS-10).
  - State the shape lock in one sentence, a radius per component role ("action buttons pill, cards 16, inputs 12, sheets 28").
  - Keep emphasis inside the type family (weight or size), not a second face dropped into one word.
- Do not: Pick spacing and sizes one element at a time.
- Why: A scale produces rhythm and makes hierarchy legible. (Material Design 8dp grid; NNGroup principles of visual design (scale: two or three sizes); shape lock and in-family emphasis: pattern also in appllama-app-design-skill (MIT); written for RYUX)
- Not when: a one-off marketing piece outside the product
- Trade-off: a scale limits choices; occasional exceptions need a written reason
- Check: count radii and type faces (RX-AS-10); review

### RX-UI-04 [Preferred] [Quality Lock] A palette with roles

- Do: Use a small set of colors with defined roles: surface, text, accent for the primary action, and status colors.
  - Pick one grey family, warm or cool, for surfaces, borders, and secondary text.
  - Elements that behave the same look the same, and elements that behave differently look different: a destructive action has its own color role, not the primary accent.
  - Lower importance with size, weight, or position, never by lowering text contrast.
- Do not: Introduce new colors per component, or use the accent for decoration.
- Why: When color has a role, the accent and status colors mean something. (ryux visual principle; NNGroup principles of visual design (contrast signals a different function; similarity); isolation effect (von Restorff 1933): the one item that differs is the one remembered, so the accent marks only the primary action; one grey family: pattern also in appllama-app-design-skill (MIT); written for RYUX)
- Not when: data visualization, which needs its own categorical or sequential palette
- Trade-off: fewer colors means relying on type and space for emphasis
- Check: count accent hues and grey families (RX-AS-10); review

### RX-UI-05 [Preferred] Layout from content, not a template

- Do: Choose the layout from the content, the task, and the reference screens. Set the balance on purpose: symmetric for calm, focused screens, asymmetric for dynamic ones. On the render, check that visual weight is distributed, counting element size and not only the number of elements, with no side left empty or heavy without a reason.
- Do not: Default to hero, three feature cards, and a logo wall.
- Why: Template layouts look interchangeable and hide what is specific to the product. (ryux anti-slop principle; NNGroup principles of visual design (balance))
- Not when: a standard pattern users expect fits the content (a settings list, a table); familiarity is the right choice
- Trade-off: custom layouts cost design and build time
- Check: review

### RX-UI-10 [Preferred] Visual language is chosen, not defaulted

- Do: Derive the art direction from the brand, the audience, the product context, and reference screens, and write it as a Visual Brief (template in knowledge/imagery.md) (objective, concept, composition, color, material, lighting, motion, avoid) before designing an expressive surface or generating images, 3D, or motion.
  - For a new product, decide the brand direction before the tokens, task UI included: palette, type, and shape follow from the product's character (fast, warm, trusted, and so on), not from the one accent that passes contrast.
  - With no visual direction in the brief or DESIGN.md, discover it with the user before building: three directions, one chosen (RX-UI-26).
- Do not: Reach for the category cliché (coins, money rain, floating dashboards, or gradient blobs for fintech; generic 3D characters for any app), write an image prompt without a brief (role, concept, composition), or decline the category default by retreating to a neutral surface (cream or white, ink, one muted accent, no imagery): declining a look is not choosing one.
- Why: A default visual language makes the product interchangeable with its competitors. (art direction practice; RX-AS-05 purpose gate; owner review 2026-10-27: a food-delivery build "too plain, no illustration" from a DESIGN.md with no visual direction)
- Not when: an existing brand system already defines the visual language; follow it
- Trade-off: a brief takes time before any image exists
- Check: the Visual Brief; review

### RX-UI-26 [Preferred] With no direction given, discover three and let the user choose

- When: a new product, a new look, or an expressive surface, and no visual direction in the prompt or DESIGN.md
- Do: Build the directions from the Product Discovery answers (RX-PR-13): the audience, why they would choose it, its character, and the taste references; name the category default (the look most products in this category ship).
  - Build three directions from the direction grammar (knowledge/ui.md): one conventional (close to the category default, done well), one grounded in this audience's world (an object, place, ritual, or material these users know, not the category's), one that stretches how the product speaks. Conventional means a familiar structure, not a bare surface: it too has a signature and a visual anchor the tile shows. The three use different weight carriers (RX-UI-29), and grounded does not mean a paper object.
  - Each tile's palette is built by RX-UI-31 (roles, a named scheme, neutrals from the dominant hue).
  - The three speak different visual languages, not one language in three concepts: each has a base surface (the colour most of the page sits on) from a different family: light and cool (white, blue-grey), dark (ink, near-black), or a saturated colour as the canvas. Cream, ivory, warm white, and paper are one family (very light with a warm tint), used by one direction at most. At least one direction is cool or neutral in temperature whatever the character: warmth can come from type, shape, and imagery.
  - They differ in material and imagery model too: material from flat, dimensional (soft gradients and shadows), atmospheric (mesh, light, glow with a job), or textured (grain, print); imagery model from flat vector, dimensional vector, 3D render, the product's UI composed large and layered, retouched photography, mixed media, or atmosphere. At most one direction is flat with flat vectors; at least one uses a render, a retouched photo, or a UI composite (knowledge/imagery.md, Making images).
  - Calibrate each against a well-known product of its visual language (a vivid gradient with product UI, warm photography or illustration, dark and precise, display type over colour blocks) for its level of craft, never for its look: name it in the tile, and take nothing from it (palette, type, or signature). Name each by its character (Quiet Financial Confidence), not by a style keyword, and say which answer each rests on; two products with different answers get different directions.
  - Each pair differs on at least three grammar dimensions, philosophy or grounding among them; a palette change alone is the same direction. Each has a reason from the profile, and passes the coherence rules.
  - Each names its imagery: the product photographed or rendered (generated from a Visual Brief and labeled), an illustration style, the product's own complete screens, or type alone; "none" needs a reason, and a landing page keeps at least one strong visual anchor.
  - Show each as a style tile with the same content in all three (name and philosophy, base surface, type pair with a heading, body, and figures, palette with roles, a button and a card in its shape, its imagery strategy, a small hero holding one asset made for it (the carrier's asset at small scale: a vector illustration, a generated image, a mesh, a product screen), its signature, its calibration product, and its risk): frames side by side on a canvas, or text with the same fields.
  - Ask as choices (capabilities/design.md, stage 1), the recommended one first, with room to combine ("type from B, colour from C"); a combination passes the coherence rules again. Asked for other options, offer three new ones and do not repeat.
  - Ask even without a question or choice tool: write the three as numbered options, end the turn, and wait. Choose yourself only when the user hands this choice back, or the task says to run without questions (a pipeline, a batch job). "Up to you" on another question (the numbers, the screenshots) hands back that question only; the direction is still asked as its own choice. When you do choose: one with a reason from the profile, marked provisional in the Assumptions, the other two offered in a line each.
- Do not: Build the directions from the category alone, pick three style keywords from a list, offer three palettes of one layout, put all three on light warm surfaces, describe a carrier in the tile instead of making it, offer a conventional direction with no signature or visual anchor, recommend the category default because it feels safer, ask an open "what look do you want?" with no options, or let a direction change the facts: assumptions about the look are allowed, assumptions about the product are not (RX-AS-01, RX-PR-02).
- Why: With no direction, an agent ranks the familiar look first and ships it, and a rule that tells it to be bold moves it to the next familiar look; the variety has to come from the user's choice among directions that fit. (Art direction practice (style tiles; a direction as a set of reasoned visual decisions); landing-gold rounds 2 and 3, 2026-10-30/31 (docs/benchmarks/landing-gold): owner's blind rating, RYUX 1.33 then 2.00 v 4.00 and 3.67 AI-slop resistance against a skill that assigns a direction; in round 3 a rule to commit to a grounded direction moved all three runs to one new default; owner decision 2026-10-31 (Design Direction Intelligence))
- Not when: the prompt or DESIGN.md sets the direction, or an existing brand system defines it; follow it. A small change inside an existing product
- Trade-off: one more question and three tiles before the design starts
- Check: the Delivery Gate names the three directions offered, the answer each rests on, the one used, and whether the user chose it or it is provisional; the three differ on at least three grammar dimensions; three base surface families, warm off-white at most one, one cool or neutral direction; flat with flat vectors at most one, a render, retouched photo, or UI composite in at least one; a made asset in each tile

### RX-UI-31 [Preferred] A palette is built from roles, not picked

- When: a new palette: a new product, a new look, or a direction's tile (RX-UI-26)
- Do: Build the palette in this order and write each step down:
  - roles first: dominant, supporting, the action accent, neutrals, and the semantic colours (success, warning, error); each colour keeps one meaning everywhere it appears
  - name the scheme (monochromatic, analogous, complementary, or split-complementary) and why it fits the character
  - derive the neutrals from the dominant hue: light and dark surfaces take that hue at very low saturation (a cobalt page gets a blue-tinted white, a green page a green-tinted white); a warm neutral (cream, ivory, warm white) only when the dominant hue is warm, or with a written reason
  - three or four hues besides the neutrals; the brightest and most saturated colour goes to what matters most, the primary action first, and less important elements stay muted
  - share the page roughly as dominant, supporting, and accent, about 60/30/10 as a guide, not a formula
  - every text pair passes WCAG contrast, and colour is never the only cue (RX-A11Y-01)
  - Write the scheme and where the neutrals come from into the direction block in DESIGN.md (capabilities/design.md, stage 1).
- Do not: Reach for cream or ivory as the light colour because the character is warm or the product is gold, add a hue without a role, give one colour two meanings, or spend the strongest colour on decoration while the action stays muted.
- Why: A palette chosen colour by colour drifts to the model's defaults (cream, one accent, grey); roles and a named scheme make every colour answer to the page's meaning and keep the neutrals in the same family as the brand. (NNGroup visual design articles (good visual design, the anatomy of a good design, principles of visual design: a limited palette of three or four colours, consistent meaning, bright for what matters, muted for the rest, contrast for low vision and colour blindness); colour practice for schemes and proportions; owner review 2026-10-31 of RYUX trial 5: a cobalt page still used cream for its light bands, and the owner asked why cream appeared in every trial)
- Not when: a brand or design system that already defines the palette; then follow it
- Trade-off: tinted neutrals tie the page to one hue and make a later change of the dominant colour touch every surface
- Check: the scheme named; the light neutral's hue within 30 degrees of the dominant hue, or a written reason; hues besides neutrals four or fewer; the strongest colour on the primary action; text pairs measured

### RX-UI-14 [Preferred] [Quality Lock] Type that is set, not only sized

- Do: Set the type, not only its size:
  - body paragraphs at 45 to 75 characters per line, checked in the render
  - line-height from size: about 1.5 for body, 1.2 to 1.3 for headings, about 1.1 for display
  - small uppercase labels opened slightly (about 0.05em), large display text tightened slightly
  - tabular figures for numbers that are compared or that change (amounts, tables, timers)
  - at most two families and three weights
  - headings balanced so none ends on one stranded word
- Do not: Let paragraphs run the full width of a desktop container, use one line-height for every size, set uppercase labels with no tracking, or let amounts in a column shift because digits differ in width.
- Why: Line length and leading decide whether text is read or skimmed; aligned figures make numbers comparable at a glance. (Bringhurst, The Elements of Typographic Style (a measure of 45 to 75 characters; leading by size); WCAG 2.2 SC 1.4.12 text spacing; OpenType tnum; Apple HIG and Material type scales)
- Not when: a single display line or a logo lockup, where the type is an image
- Trade-off: narrower text columns leave more empty space on wide screens
- Check: measure the render: characters per line, line-height, letter-spacing, font-variant-numeric, families and weights in use

### RX-UI-15 [Preferred] [Quality Lock] Detail craft

- Do: Center icons on the optical middle of the text beside them and size them to its line-height; take every icon from one set and match its stroke to the type weight; right-align (or decimal-align) number columns; take borders, dividers, radii, and shadows from a small token set; truncate long text on purpose, with the full value still reachable (a tooltip, a detail view, or wrapping).
- Do not: Let icons sit high or low against their labels, mix icon sets or stroke weights, center amounts in a table, or invent a one-off shadow for one card.
- Why: Each detail is small; together they are what makes a screen look made rather than generated. (Bringhurst (figures and alignment); Apple HIG and Material iconography (optical size and alignment); owner review 2026-10-17: wrong tab icons in withryux.pen)
- Check: render inspection at 390 and 1280: icon center within 2 px of the text center; column alignment

### RX-UI-20 [Preferred] An icon means one thing, and says it

- When: the design uses icons for actions, navigation, or status
- Do: Pick each icon for the action or concept it stands for, not for its look.
  - One icon, one meaning across the product: no icon for two actions, no two icons for one action.
  - Pair the icon with a text label unless it is one of the few users know without one in this context (search, close, back, menu, home). Keep the label in a tab bar, on uncommon actions, and on destructive ones.
  - Tell look-alikes apart by what they do: back leaves the screen, close dismisses a sheet or modal; delete removes, cancel stops.
  - Use the platform's icon for platform actions (share differs on iOS and Android).
- Do not: Choose an icon because it looks good, reuse one icon for two meanings, or ship an icon-only control whose meaning users have to guess.
- Why: Few icons are recognised without a label; an ambiguous icon costs more than a word, and an icon whose meaning changes breaks what users learned. (NNGroup icon usability; Nielsen heuristic 4 (consistency and standards); Apple HIG and Material iconography)
- Not when: a dense expert tool whose users learn the set; then a tooltip plus an accessible name
- Trade-off: labels take space, especially in toolbars and tab bars
- Check: review: list each icon with its meaning and flag duplicates; heuristic_eval H-04
