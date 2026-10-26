# UI design

Gives a product a visual system: hierarchy, type, layout, density, color, icons, and detail craft that communicate instead of decorate.

> Group UI · Delivery Gate area UI · RYUX 2.19.1. Levels are defined in `SKILL.md`.

**Visuals are not decoration. They are communication.** RYUX UI owns the visual expression of
a product: what each visual decision communicates, why it exists, and how it behaves. Functional UI
helps the user read, decide, or act. Anything decorative needs a stated reason (see the purpose
gates in `knowledge/anti-slop.md`). This module is the visual system; art direction, motion, assets, and
illustration live in knowledge/imagery.md, read when the work has them.

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
- Do not: Give everything equal weight, let decoration outrank content, park a control far from what it acts on, or make the main action look like one more tab.
- Why: Hierarchy is how users know what to read and do first; a control beside its data shows what it changes, and an action that looks like a tab reads as a place, not a task. (NNGroup visual hierarchy; Gestalt proximity; Fitts's law (Fitts 1954) for the primary action's size and reach; ryux four-problems blind rating, rater 1 (product designer), 2026-10-16: a hide toggle far from the balance and a CTA crowding the bottom nav were reasons not to ship; explore-judge blind rating 2026-10-18: the same rater shipped a screen with a distinct centered pay button in the bottom bar)
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
- Do not: Reach for the category cliché (coins, money rain, floating dashboards, or gradient blobs for fintech; generic 3D characters for any app), or write an image prompt without a brief (role, concept, composition).
- Why: A default visual language makes the product interchangeable with its competitors. (art direction practice; RX-AS-05 purpose gate)
- Not when: an existing brand system already defines the visual language; follow it
- Trade-off: a brief takes time before any image exists
- Check: the Visual Brief; review

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
