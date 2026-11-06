# UI design

Gives a product a visual system: hierarchy, type, layout, density, color, icons, and detail craft that communicate instead of decorate.

> Group UI · Delivery Gate area UI · RYUX 2.22.3. Levels are defined in `SKILL.md`.

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

- When: a new product, a new look, or an expressive surface, and no visual direction in the prompt, DESIGN.md, or the product that exists
- Do: Build three directions from the Product Discovery answers (RX-PR-13) and the direction grammar (knowledge/ui.md), and name the category default:
  - one conventional (a familiar structure done well, still with a signature and a visual anchor), one grounded in this audience's world (an object, place, ritual, or material they know; not a paper object by default), one that stretches how the product speaks; name each by its character, not a style keyword, and say which answer it rests on
  - Each idea comes from a different source: the product's own mechanic (what it measures, moves, or records), the audience's everyday objects and rituals, and the audience's culture and place (a craft or textile, a performance, a script, architecture, a landscape, street language). At least one comes from culture and place, at most one from the product mechanic. For a cultural source, name the motif, what it means, and why it fits the product; never use a sacred or restricted motif as decoration, and take the most touristic symbol only when its meaning fits.
  - The three differ in visual language, not only in concept: three or more grammar dimensions, philosophy or grounding among them; base surface from different families (light and cool, dark, a saturated colour; cream, ivory, warm white, and paper are one family, used once at most); temperature (one cool or neutral, whatever the character); weight carrier (RX-UI-29); material and imagery model (flat with flat vectors once at most; a render, a retouched photo, or a UI composite at least once). Palettes follow RX-UI-31; each passes the coherence rules.
  - Calibrate each against a known product of its visual language for craft only: name it in the tile and take nothing from it.
  - Show each as a style tile with the same fields (name and philosophy, base surface, type pair with a heading, body, and figures, palette with roles, a button and a card, medium (one, or a named mix with its binding, RX-UI-32), a small hero holding one asset made for it, signature, calibration product, risk), side by side on the canvas, or as text with the same fields.
  - Ask as choices, the recommended one first, numbered once: the same number in the message, the question, and the tiles; with room to combine (a combination passes the coherence rules again); asked for others, offer three new ones. Without a choice tool, write them as numbered options, end the turn, and wait.
  - Choose yourself only when the user hands this choice back or the task runs without questions (a pipeline, a batch job); "up to you" on another question hands back only that question. Then pick one with a reason, marked provisional in the Assumptions, and offer the other two in a line each.
- Do not: Build the directions from the category alone, draw all three ideas from the product and the transaction, number the options differently in two places, pick three style keywords from a list, offer three palettes of one layout, put all three on light warm surfaces, describe a carrier in the tile instead of making it, offer a conventional direction with no signature or visual anchor, recommend the category default because it feels safer, ask an open "what look do you want?" with no options, or let a direction change the facts: assumptions about the look are allowed, assumptions about the product are not (RX-AS-01, RX-PR-02).
- Why: With no direction, an agent ranks the familiar look first and ships it, and a rule that tells it to be bold moves it to the next familiar look; the variety has to come from the user's choice among directions that fit. (Art direction practice (style tiles; a direction as a set of reasoned visual decisions); landing-gold rounds 2 to 4 and owner trials T1 to T9, 2026-10-30/31 (docs/benchmarks/landing-gold): with a direction assigned or chosen by the agent, RYUX runs converged on one look and rated below a peer for slop resistance; owner decision 2026-10-31 (Design Direction Intelligence); landing-gold round 5, 2026-11-01, and owner review: all three RYUX runs drew their ideas from the product and the saving habit and offered nearly the same three directions, while the peer drew on Indonesian textile, theatre, and shop culture; owner decision 2026-11-06: a product that exists keeps its own direction, read from its screens and code, instead of being offered three new ones)
- Not when: the prompt or DESIGN.md sets the direction, an existing brand system defines it, or the product already has screens, code, or a design file: their visual language is the direction, read through Analyze and written as the direction: block with status observed and its source files, unless the user asks for a new look; follow it, and on a surface it was not written for, carry it by RX-UI-33. A small change inside an existing product
- Trade-off: one more question and three tiles before the design starts
- Check: the Delivery Gate names the three directions offered, the answer each rests on, the one used, and whether the user chose it or it is provisional; the three differ on at least three grammar dimensions; three base surface families, warm off-white at most one, one cool or neutral direction; flat with flat vectors at most one, a render, retouched photo, or UI composite in at least one; three idea sources, one from the audience's culture or place, its meaning named; one numbering for the options; a made asset in each tile

### RX-UI-31 [Preferred] A palette is built from roles, not picked

- When: a new palette: a new product, a new look, or a direction's tile (RX-UI-26)
- Do: Build the palette in this order and write it down:
  - roles: dominant, supporting, action accent, neutrals, and semantic colours; one meaning per colour everywhere
  - the scheme (monochromatic, analogous, complementary, split-complementary) and why it fits the character
  - neutrals from the dominant hue at very low saturation (a cobalt page gets a blue-tinted white); a warm neutral (cream, ivory) only when the dominant hue is warm, or with a written reason
  - three or four hues besides neutrals; the strongest colour on the primary action, the rest muted; roughly 60/30/10 as a guide
  - every text pair passes WCAG contrast, and colour is never the only cue (RX-A11Y-01)
  - Write the scheme and the neutrals' source into the direction block in DESIGN.md.
- Do not: Reach for cream or ivory as the light colour because the character is warm or the product is gold, add a hue without a role, give one colour two meanings, or spend the strongest colour on decoration while the action stays muted.
- Why: A palette chosen colour by colour drifts to the model's defaults (cream, one accent, grey); roles and a named scheme make every colour answer to the page's meaning and keep the neutrals in the same family as the brand. (NNGroup visual design articles (a limited palette of three or four colours, consistent meaning, bright for what matters, muted for the rest, contrast for low vision and colour blindness); colour practice for schemes and proportions; owner review 2026-10-31 of RYUX trial T5: a cobalt page still used cream for its light bands)
- Not when: a brand or design system that already defines the palette; then follow it
- Trade-off: tinted neutrals tie the page to one hue and make a later change of the dominant colour touch every surface
- Check: the scheme named; the light neutral's hue within 30 degrees of the dominant hue, or a written reason; hues besides neutrals four or fewer; the strongest colour on the primary action; text pairs measured

### RX-UI-33 [Required] A direction moves to a new surface by its brand layer, not its mockups

- When: a direction chosen for one surface (a landing page, a campaign, a marketing image) is used on another (the product app, a dashboard, an email)
- Do: Carry the brand layer and decide the rest again for the new surface:
  - carry: the type pair, the colour roles, shape, voice, and the signature as one motif; in task UI the direction shows through these, not through the marketing page's imagery
  - decide again for the surface's job: density, components, navigation, hierarchy, and motion, with Frame and Explore for that surface (capabilities/design.md, stages 2 and 3)
  - a device mockup inside a marketing image is illustrative, a stand-in for screens nobody had designed; never trace the real screens from it
  - imagery in the app is optional and small: one or two moments at most that have room for it (an empty state, a success), sized to the component it sits in (a spot illustration in a card, not a landscape band); never behind data, figures, or actions; an asset that fails the craft read (RX-UI-30) is left out
  - give the app's brand band one surface treatment taken from the direction's grammar (material, shape, colour), so it is not a flat fill: contour lines for a direction grounded in a landscape, a tonal gradient with a soft light for a warm one, soft shapes for an organic one, glass only when the material is glass or digital; one treatment across the app, drawn flat or as an effect (not a picture), text over it still passing contrast (RX-A11Y-01), and never a trend effect the direction does not call for
  - write a surface entry in the DESIGN.md direction block: what carries, what changes, and which moments, if any, hold imagery
- Do not: Rebuild the marketing page's phone mockup as the app, read a direction written for a page as the spec for task screens, set a landscape render behind a balance or a form, add imagery to a screen only so it looks less plain, leave the brand band a flat fill when the direction has a ground, or pick blobs or glass because they are in fashion.
- Why: A direction is chosen for the surface in front of the user; an app carries it in its type, colour, and one motif, and a page's imagery set behind data reads as forced. (Art direction practice (a brand carried across surfaces); owner review 2026-11-02 of the Raja Emas app: App 3, the landing direction applied to the app, read as flat and as the landing's phone mockup built again; App 5, with imagery mapped to app moments, set a terrace render behind the balance and read as forced; App 6, with imagery left out, read as safe but plain; the owner compared contours, a gradient with warm light, soft bubbles, and glass on its green band and asked for a treatment chosen from the direction)
- Not when: the direction block already has an entry for this surface; a small change inside an existing app
- Trade-off: deciding the surface again costs a Frame and Explore round that the user may think is already done
- Check: the surface entry in the direction block (carry, change, moments, surface treatment and the grammar it comes from); screens not traced from a marketing mockup; imagery on two moments at most, sized to its component, none behind data or actions, each passing the craft read; the brand band carries one surface treatment, text contrast over it measured

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

- Do: Center icons on the optical middle of the text beside them and size them to its line-height; take every icon from one set and match its stroke to the type weight, the same stroke at every icon size (resize an icon, never scale it, or draw a master per size), in colours from the palette's roles; right-align (or decimal-align) number columns; take borders, dividers, radii, and shadows from a small token set; truncate long text on purpose, with the full value still reachable (a tooltip, a detail view, or wrapping).
- Do not: Let icons sit high or low against their labels, mix icon sets or stroke weights (a scaled icon changes its stroke), give icons near-duplicate colours, center amounts in a table, or invent a one-off shadow for one card.
- Why: Each detail is small; together they are what makes a screen look made rather than generated. (Bringhurst (figures and alignment); Apple HIG and Material iconography (optical size and alignment); owner review 2026-10-17: wrong tab icons in withryux.pen; owner review 2026-11-06 (Figma, Sejuk rerun): icon strokes 1.17 to 2.04 from scaled instances and eight icon colours, two of them near-identical greys)
- Check: render inspection at 390 and 1280: icon center within 2 px of the text center; column alignment; in Figma, the design system listing (capabilities/design.md, stage 6): icon strokes and icon colours

### RX-UI-20 [Preferred] An icon means one thing, and says it

- When: the design uses icons for actions, navigation, or status
- Do: Pick each icon for the action or concept it stands for, not for its look.
  - One icon, one meaning across the product: no icon for two actions, no two icons for one action.
  - Pair the icon with a text label unless it is one of the few users know without one in this context (search, close, back, menu, home). Keep the label in a tab bar, on uncommon actions, and on destructive ones.
  - Tell look-alikes apart by what they do: back leaves the screen, close dismisses a sheet or modal; delete removes, cancel stops.
  - Use the platform's icon for platform actions (share differs on iOS and Android).
- Do not: Choose an icon because it looks good, reuse one icon for two meanings, or ship an icon-only control whose meaning users have to guess.
- Why: Few icons are recognised without a label; an ambiguous icon costs more than a word, and an icon whose meaning changes breaks what users learned. (NNGroup icon usability; Nielsen heuristic 4 (consistency and standards); Apple HIG and Material iconography; Prägnanz (Gestalt; Wertheimer 1923): people read the simplest shape a figure allows, so a simple silhouette is recognised first)
- Not when: a dense expert tool whose users learn the set; then a tooltip plus an accessible name
- Trade-off: labels take space, especially in toolbars and tab bars
- Check: review: list each icon with its meaning and flag duplicates; heuristic_eval H-04

### RX-UI-35 [Contextual] Translucent surfaces stay readable

- When: a surface is translucent or blurred over other content (glass, frosted panels, bars or sheets over images, video, or a scrolling page)
- Do: Check the text and icons on it against every background it can sit over (photos, video, the busiest part of a scrolling page), not only the calm one in the mockup, and raise the blur and the opacity of the fill until they pass (RX-A11Y-01).
  - Give the edge a faint stroke or a tone step so the panel keeps its shape over a similar background.
  - Fall back to a solid surface when the user asks for less transparency or more contrast (prefers-reduced-transparency, prefers-contrast, and the platform settings); where the platform has its own material (Apple materials, Windows Acrylic), use it.
  - Keep it to a few surfaces with a reason (navigation layered over content), not the look of every card.
- Do not: Check glass contrast only over the mockup's background, set body text on a thin blur over a photo, or make every card glass.
- Why: Text on a translucent surface loses contrast over busy content, and the content behind it changes as people scroll, so a panel that passes in the mockup can fail in use. (NNGroup Glassmorphism: Definition and Best Practices (Brown 2024); WCAG 2.2 SC 1.4.3 and 1.4.11; Apple HIG materials and Reduce Transparency; RX-UI-33 (glass only when the direction calls for it); written for RYUX)
- Trade-off: more blur and opacity make the effect quieter
- Check: render over the busiest background it can meet; contrast check; turn on reduced transparency
- Machine check: `ryux scan` flags a backdrop blur in a folder where nothing handles prefers-reduced-transparency or prefers-contrast (warn)
