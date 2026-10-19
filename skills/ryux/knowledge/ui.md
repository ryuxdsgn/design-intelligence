# UI design

Gives a product a visual point of view: hierarchy, type, layout, color, imagery, art direction, and motion that communicate instead of decorate.

> Group UI · Delivery Gate area UI · RYUX 2.10.0. Levels are defined in `SKILL.md`.

**Visuals are not decoration. They are communication.** RYUX UI owns the visual expression of
a product: what each visual decision communicates, why it exists, and how it behaves. Functional UI
helps the user read, decide, or act. Anything decorative needs a stated reason (see the purpose
gates in `knowledge/anti-slop.md`). It works in four layers.

**1. UI system.** Work in this order:
1. **Hierarchy**: what is read first, second, third? The primary action and key information win.
2. **Layout and alignment**: a shared grid; groups by meaning; consistent edges.
3. **Spacing and type**: one scale; size and weight carry hierarchy, not color alone.
4. **Density**: compact for repeat work, roomier for first-time or high-stakes decisions.
5. **Color**: roles first (surface, text, accent for the primary action, status); contrast checked.
6. **Containers**: use a container only when it groups or separates something.
7. **Icons**: next to labels, from one set, at consistent sizes.

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

**2. Art direction.** Each visual has a job (RX-UI-07), its composition leaves room for the
content (RX-UI-09), and the visual language is chosen, not defaulted (RX-UI-10). Name the visual
language in a few words (editorial, product-centric, human, technical, playful, premium,
institutional) and its form (shape language, geometric or organic, flat or with depth).

**Composition exploration.** For an expressive surface, sketch three compositions of the chosen
direction (subject left, subject right, centered or full-bleed) as quick frames, then choose by
focal point, hierarchy, negative space, relation to the copy, and balance (RX-UI-09).

**Expressive surfaces** (hero, landing, onboarding, empty states, brand moments). Restraint keeps
task UI usable; on expressive surfaces it is only the floor. Work concept, then signature, then
system:
1. **Concept**: write three directions first (name, concept, signature), then choose one. The idea
   comes from the product itself, not from the category: a tool about evidence might use receipts,
   citations, and marks of proof; a calm finance app might use the ledger. The category default
   (a terminal panel for developer tools, a dashboard screenshot for SaaS) is never the signature.
2. **Signature**: one element that carries the concept and that people would remember. Choose the
   lever: type (scale contrast, a distinctive face), composition (a broken grid, an unexpected
   crop, a large number), art direction, color temperature, motion personality, or copy voice.
3. **System**: everything else stays quiet and consistent so the signature reads.
The Liveliness you set (Design Direction) turns into these levers: one focal point per screen,
contrast in size and weight that builds the hierarchy, whitespace that groups, one deliberate
accent, and a motif the signature repeats. Low energy uses the same levers, quietly.
Then run the swap test (RX-AS-09): with a competitor's name and logo, would anything need to change?
If not, the surface has no point of view yet. Stay honest while being bold: a strong idea never
needs invented numbers, people, or logos.

**3. Motion.** Start from purpose: what the motion communicates; with no purpose, no motion.
Then ask how often someone will see it. The more often, the less of it they should notice: what
people open many times a day (a command palette, a shortcut, core navigation) appears at once, and
expression is kept for occasional or first-time moments. A purpose does not outweigh frequency.
Every motion follows one lifecycle: before, trigger, transition, new state, feedback.
The states themselves (waiting, result, recovery) are defined in `knowledge/interaction.md` (RX-IX-01,
RX-IX-02); motion only makes them visible, and it never compensates for weak UX. Decide the trigger,
duration, easing, distance, opacity or scale, and how several elements are choreographed. Define
duration and easing once as motion tokens, and animate transform and opacity rather than layout
properties (width, height, top, margin), which cause jank. What opens and closes should be able to
reverse halfway: use transitions, not an open-only keyframe animation.

| Level | Examples | Needs |
| --- | --- | --- |
| L1 State feedback | button press, checkbox, toggle | starts on touch and lasts 100 to 150 ms; buttons and cards press to about 0.97 scale, list rows change background only |
| L2 Component transition | dropdown, modal, drawer, tooltip | shows where something came from or went: enters from about 0.95 scale with a fade (never from 0), exits faster along the same path, a menu grows from its trigger |
| L3 Page transition | navigation, route change | keeps the user oriented between places |
| L4 Storytelling | onboarding, product introduction, marketing | a message that is clearer moving than still |
| L5 Decorative | background particles, floating elements | a brand reason, and never delaying content or input |

Pick one **motion personality** per product and derive timing and easing from it:

| Trait | Calm (banking) | Energetic (game) |
| --- | --- | --- |
| Character | calm, precise | energetic, playful |
| Speed | moderate | fast |
| Easing | ease-out; default token `cubic-bezier(0.23, 1, 0.32, 1)` | spring |
| Movement | short, controlled | larger, expressive |
| Expression | subtle | high |

When neither the brief nor DESIGN.md sets the motion direction, start from Calm: the easing token
above, interface transitions under 300 ms, and no ease-in on anything that enters. Replace these
defaults as soon as the product sets its own. Data the user is reading (a balance, an amount, a
table value) does not move for effect. With reduced motion requested, large movement becomes a fade
or a cut (RX-A11Y-08).

**4. Visual production.** Decide where each asset comes from before making anything (RX-UI-13):

| Asset | First choice | Then | Never |
| --- | --- | --- | --- |
| Product visuals | real screens, labeled sample data | a rebuilt screen labeled illustrative | a fake dashboard shown as real |
| Photography | the brand's own shoot | a licensed library you can name | a stranger presented as a customer |
| Illustration and 3D | the brand's system | custom or generated from the brief, labeled | a generic character or blob unrelated to the product |
| Icons | the project's set | one set that matches the chosen icon style (for example Tabler, Iconoir, Phosphor, or Material Symbols), or a custom set drawn to that style | mixed sets, or one-off icons outside the style |
| Logos | official files from each owner; the product's own file (RX-AS-11) | the name in plain text, or [LOGO] | a redrawn, imitated, or invented logo; initials or an emoji as a mark; a generated favicon or app icon |
| Video | real product footage | a screen recording of the real product | stock footage implying use |
| Missing | a placeholder that looks like one (RX-AS-03) | | an invented stand-in |

Label every asset's provenance: observed (from the real product), sourced (licensed, with its
source), illustrative, generated, or inferred (a stand-in). See the evidence model in the router.

RYUX directs the generator; it is not the generator. Work context, goal,
audience, role, art direction, composition, then generate, critique the result against the brief,
and refine. A prompt without a brief is not art direction. Write the brief first:

```
# Visual Brief
Role:           its job (explain, orient, demonstrate, emotion, identity, context, story)
Objective:      what the viewer must understand or feel
Audience:       who sees it, in which context
Emotion:        the feeling, in two or three words
Concept:        the visual thesis, in one sentence
Subject:        what is shown (the product concept, not a generic person or device)
Visual language: editorial / product-centric / technical / ..., and the art direction
Form:           shape language, geometric or organic, depth
Composition:    where the subject sits, and the space kept for copy
Color, material, lighting: from the product palette; surfaces; direction and softness
Motion:         level (L1 to L5) and personality
Output:         format, background, aspect ratios and sizes
Avoid:          the category clichés (for fintech: coins, money rain, floating dashboards)
Sources:        reference screen_ids or the analysis it came from
```

A generated image is illustrative art; never present it as a real customer or a real product
screen (RX-UI-07).

Does not cover: component reuse and tokens (see `knowledge/design-system.md`).

## Evidence from RYUX Knowledge

A design direction from comparable screens: `extract_design_direction` (patterns, principles, pitfalls) with the screen_ids behind it. Without the ryux MCP, say the evidence comes from the design and standards alone.

> Hard Gates always apply, whichever skills are loaded: no invented numbers, people, urgency, business
> rules, or terms; no placeholder shipped as final; no missing critical states. Labeled sample data is
> not an invented number; an unconfirmed capability is never presented as confirmed. See `SKILL.md`.

## Rules

### RX-UI-01 [Required] [Quality Lock] Hierarchy follows priority

- Do: Make the primary action and the key information the most prominent things in each area, with one clear focal point. Place each control next to the data it changes (a hide-balance toggle beside the balance it hides, not in the header), and make the primary action read as an action, not a place: its own button with an action label. It may sit in the center of a bottom bar when it is clearly different from the tabs (its own shape, color, and size, with room around it), but it is never styled as one of the tabs and never crammed between them. Use one display size per screen, for its single most important number or heading.
- Do not: Give everything equal weight, let decoration outrank content, park a control far from what it acts on, or make the main action look like one more tab.
- Why: Hierarchy is how users know what to read and do first; a control beside its data shows what it changes, and an action that looks like a tab reads as a place, not a task. (NNGroup visual hierarchy; Gestalt proximity; Fitts's law (Fitts 1954) for the primary action's size and reach; ryux four-problems blind rating, rater 1 (product designer), 2026-10-16: a hide toggle far from the balance and a CTA crowding the bottom nav were reasons not to ship; explore-judge blind rating 2026-10-18: the same rater shipped a screen with a distinct centered pay button in the bottom bar)
- Not when: screens with several equal peers, such as a dashboard of comparable items; use consistent hierarchy within each card instead
- Trade-off: emphasizing one thing de-emphasizes the rest
- Check: visual QA

### RX-UI-03 [Preferred] [Quality Lock] One spacing and type scale

- Do: Use the project's spacing and type scale, or define one (for example multiples of 4 or 8) and align elements to a shared grid. State the shape lock in one sentence, a radius per component role ("action buttons pill, cards 16, inputs 12, sheets 28"), and keep emphasis inside the type family (weight or size), not a second face dropped into one word.
- Do not: Pick spacing and sizes one element at a time.
- Why: A scale produces rhythm and makes hierarchy legible. (Material Design 8dp grid; shape lock and in-family emphasis: pattern also in appllama-app-design-skill (MIT); written for RYUX)
- Not when: a one-off marketing piece outside the product
- Trade-off: a scale limits choices; occasional exceptions need a written reason
- Check: count radii and type faces (RX-AS-10); review

### RX-UI-04 [Preferred] [Quality Lock] A palette with roles

- Do: Use a small set of colors with defined roles: surface, text, accent for the primary action, and status colors. Pick one grey family, warm or cool, for surfaces, borders, and secondary text.
- Do not: Introduce new colors per component, or use the accent for decoration.
- Why: When color has a role, the accent and status colors mean something. (ryux visual principle; isolation effect (von Restorff 1933): the one item that differs is the one remembered, so the accent marks only the primary action; one grey family: pattern also in appllama-app-design-skill (MIT); written for RYUX)
- Not when: data visualization, which needs its own categorical or sequential palette
- Trade-off: fewer colors means relying on type and space for emphasis
- Check: count accent hues and grey families (RX-AS-10); review

### RX-UI-05 [Preferred] Layout from content, not a template

- Do: Choose the layout from the content, the task, and the reference screens.
- Do not: Default to hero, three feature cards, and a logo wall.
- Why: Template layouts look interchangeable and hide what is specific to the product. (ryux anti-slop principle)
- Not when: a standard pattern users expect fits the content (a settings list, a table); familiarity is the right choice
- Trade-off: custom layouts cost design and build time
- Check: review

### RX-UI-07 [Contextual] Imagery has a job and is what it claims

- When: the design uses photos, illustration, or 3D
- Do: Name each visual's job in one line: explain, orient, demonstrate, set the emotion, carry the identity, give context, or tell the story. Use real product screens or clearly illustrative art.
- Do not: Add a visual because the hero looks empty, or present a stock photo of a stranger, or a generated image, as a real customer or product screen.
- Why: A visual without a job competes with the content; borrowed faces and fake screens imply things that do not exist. (ryux run 2026-10-02: pen.dev landing without ryux; RX-AS-05 purpose gate)
- Not when: pure illustration that clearly is not a photo of a customer
- Trade-off: real product screenshots age quickly and need updating
- Check: review

### RX-UI-09 [Contextual] Composition leaves room for the content

- When: a visual sits next to or behind text or actions
- Do: Place the visual's focal point away from the headline and the primary action, keep text contrast over the image, and check the crop at every target width. On expressive surfaces, try three compositions first (subject left, subject right, centered or full-bleed) and choose by focal point, hierarchy, negative space, relation to the copy, and balance.
- Do not: Put the subject's focal point behind the headline, or let a crop cut the subject or the text at narrow widths.
- Why: The eye goes to the strongest focal point first; when it fights the headline, neither is read. (visual hierarchy (RX-UI-01); WCAG 1.4.3 contrast (RX-A11Y-01))
- Not when: a full-bleed visual with no text over it
- Trade-off: less freedom to place the subject
- Check: render at each width; review

### RX-UI-10 [Preferred] Visual language is chosen, not defaulted

- Do: Derive the art direction from the brand, the audience, the product context, and reference screens, and write it as a Visual Brief (objective, concept, composition, color, material, lighting, motion, avoid) before designing an expressive surface or generating images, 3D, or motion.
- Do not: Reach for the category cliché (coins, money rain, floating dashboards, or gradient blobs for fintech; generic 3D characters for any app), or write an image prompt without a brief (role, concept, composition).
- Why: A default visual language makes the product interchangeable with its competitors. (art direction practice; RX-AS-05 purpose gate)
- Not when: an existing brand system already defines the visual language; follow it
- Trade-off: a brief takes time before any image exists
- Check: the Visual Brief; review

### RX-UI-11 [Contextual] Motion earns its level

- When: the design adds motion or transitions
- Do: Classify each motion: L1 state feedback, L2 component transition, L3 page transition, L4 storytelling, L5 decorative. The higher the level, the stronger the reason it needs. Then weigh how often people see it: a surface opened many times a day (command palette, shortcut, core navigation, list selection) appears and closes without movement, at most a fade too short to notice; standard transitions belong to occasional surfaces (modal, drawer, toast), and expression to rare or first-time moments. Take timing and easing from one motion personality, define them once as motion tokens, animate transform and opacity rather than layout properties, and honor reduced motion (RX-A11Y-08). Anything that opens and closes (menu, popover, dialog, drawer) uses transitions that can reverse halfway, so a close or reopen mid-animation turns back from where it is, and it closes no slower than it opened.
- Do not: Animate everything, give a surface people open many times a day an entrance they must sit through, play an open-only keyframe animation on something people can close or reopen at any moment, use one generic duration and easing (transition: all 0.3s) everywhere, let decorative motion delay content or input, or move data the user is reading (a balance, an amount, a table value) for effect.
- Why: Motion directs attention; unearned motion steals it from the task and can make some people unwell. (NNGroup animation and usability guidance; WCAG 2.3.3 animation from interactions; frequency check: pattern also in emilkowalski/skills (MIT) find-animation-opportunities; reversible open and close: pattern also in emilkowalski/skills (MIT) animate; default timing, press state, and still data: pattern also in appllama-app-design-skill (MIT); all written for RYUX)
- Not when: L1 feedback on standard controls that follows the platform defaults
- Trade-off: fewer flourishes on marketing pages
- Check: review; reduced-motion test

### RX-UI-12 [Contextual] A point of view on expressive surfaces

- When: the surface is expressive: a hero, landing page, onboarding, empty state, or brand moment, or the brief asks for a new look or more personality
- Do: Before designing, make three directions, each with a name, a concept taken from the product's own idea (for a tool about evidence: receipts, citations, marks of proof), and a signature element (type, composition, imagery, or motion). Render them as frames of the main state with the same content, different on at least two structural axes (information order, layout model, interaction model, type class, colour temperature), rate each against criteria taken from the brief, recommend one (RX-PR-09), and let the user choose; then make the rest of the design serve the chosen signature and put its concept in the Visual Brief. When the brief names reference products, read each one before it shapes the direction: the principle you borrow, what stays theirs (colours, mascot, signature features), and where you use it.
- Do not: Show three directions that differ only in colour or copy, choose for the user without showing them, or let the signature be the category's default (for developer tools a terminal or agent-session panel; for SaaS a dashboard screenshot; copy on the left and product on the right), or relabel that default as a concept. A product screen can support the signature, not be it. Turn a named reference into adjectives ("calm, white, soft") or copy what belongs to its brand.
- Why: Users remember a product by its idea; a correct but generic surface is forgotten and could belong to any competitor. (brand and art direction practice; RX-UI-05 layout from content; rendered variants on named axes, compared side by side, chosen by the user: pattern also in emilkowalski/skills (MIT) prototype; written for RYUX)
- Not when: task UI such as forms, tables, settings, and checkout, where restraint and convention win: skip the three directions and keep structure and interaction conventional. A new product's brand layer may still carry one signature from the product's own domain (a mark, the type voice, or one brand moment in the flow), never a layout change and never decoration without a job (RX-AS-05)
- Trade-off: a strong idea takes a decision someone may disagree with; keep it honest and on brand
- Check: the swap test (RX-AS-09); review

### RX-UI-13 [Contextual] Source assets on purpose

- When: the design needs photos, illustration, 3D, icons, logos, or video
- Do: Pick each asset's source in this order: real product screens or the brand's own assets; a licensed library (one icon set, photos whose license you can name); a custom or generated asset made from the Visual Brief and labeled illustrative; otherwise a placeholder that looks like one (RX-AS-03). Record where each asset came from.
- Do not: Draw or imitate another company's logo, invent the product's own mark (RX-AS-11), mix icon sets, use a photo you cannot license, or fill a gap with a generic stock scene.
- Why: Assets carry claims about the product and its users; an unsourced or borrowed asset is a claim nobody can back. (licensing and trademark practice; RX-UI-07; RX-AS-02)
- Not when: a wireframe or internal prototype where placeholders are expected
- Trade-off: real or licensed assets take longer than a stock search
- Check: asset list with sources; review

### RX-UI-14 [Preferred] [Quality Lock] Type that is set, not only sized

- Do: Keep body paragraphs at 45 to 75 characters per line, checked in the render; take line-height from size (about 1.5 for body, 1.2 to 1.3 for headings, about 1.1 for display); open small uppercase labels slightly (about 0.05em) and tighten large display text slightly; use tabular figures for numbers that are compared or that change (amounts, tables, timers); use at most two families and three weights; balance headings so none ends on one stranded word.
- Do not: Let paragraphs run the full width of a desktop container, use one line-height for every size, set uppercase labels with no tracking, or let amounts in a column shift because digits differ in width.
- Why: Line length and leading decide whether text is read or skimmed; aligned figures make numbers comparable at a glance. (Bringhurst, The Elements of Typographic Style (a measure of 45 to 75 characters; leading by size); WCAG 2.2 SC 1.4.12 text spacing; OpenType tnum; Apple HIG and Material type scales)
- Not when: a single display line or a logo lockup, where the type is an image
- Trade-off: narrower text columns leave more empty space on wide screens
- Check: measure the render: characters per line, line-height, letter-spacing, font-variant-numeric, families and weights in use

### RX-UI-15 [Preferred] [Quality Lock] Detail craft

- Do: Center icons on the optical middle of the text beside them and size them to its line-height; match icon stroke to the type weight; right-align (or decimal-align) number columns; take borders, dividers, radii, and shadows from a small token set; truncate long text on purpose, with the full value still reachable (a tooltip, a detail view, or wrapping).
- Do not: Let icons sit high or low against their labels, mix stroke weights, center amounts in a table, or invent a one-off shadow for one card.
- Why: Each detail is small; together they are what makes a screen look made rather than generated. (Bringhurst (figures and alignment); Apple HIG and Material iconography (optical size and alignment); owner review 2026-10-17: wrong tab icons in withryux.pen)
- Check: render inspection at 390 and 1280: icon center within 2 px of the text center; column alignment
