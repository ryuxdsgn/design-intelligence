# UI design

Gives a product a visual point of view: hierarchy, type, layout, color, imagery, art direction, and motion that communicate instead of decorate.

> Group UI · Delivery Gate area UI · RYUX 2.4.1. Levels are defined in `SKILL.md`.

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
Then run the swap test (RX-AS-09): with a competitor's name and logo, would anything need to change?
If not, the surface has no point of view yet. Stay honest while being bold: a strong idea never
needs invented numbers, people, or logos.

**3. Motion.** Start from purpose: what the motion communicates; with no purpose, no motion.
Every motion follows one lifecycle: before, trigger, transition, new state, feedback.
The states themselves (waiting, result, recovery) are defined in `knowledge/interaction.md` (RX-IX-01,
RX-IX-02); motion only makes them visible, and it never compensates for weak UX. Decide the trigger,
duration, easing, distance, opacity or scale, and how several elements are choreographed. Define
duration and easing once as motion tokens, and animate transform and opacity rather than layout
properties (width, height, top, margin), which cause jank.

| Level | Examples | Needs |
| --- | --- | --- |
| L1 State feedback | button press, checkbox, toggle | nothing beyond being fast (about 100 to 200 ms) |
| L2 Component transition | dropdown, modal, drawer, tooltip | shows where something came from or went |
| L3 Page transition | navigation, route change | keeps the user oriented between places |
| L4 Storytelling | onboarding, product introduction, marketing | a message that is clearer moving than still |
| L5 Decorative | background particles, floating elements | a brand reason, and never delaying content or input |

Pick one **motion personality** per product and derive timing and easing from it:

| Trait | Calm (banking) | Energetic (game) |
| --- | --- | --- |
| Character | calm, precise | energetic, playful |
| Speed | moderate | fast |
| Easing | smooth ease-out | spring |
| Movement | short, controlled | larger, expressive |
| Expression | subtle | high |

With reduced motion requested, large movement becomes a fade or a cut (RX-A11Y-08).

**4. Visual production.** Decide where each asset comes from before making anything (RX-UI-13):

| Asset | First choice | Then | Never |
| --- | --- | --- | --- |
| Product visuals | real screens, labeled sample data | a rebuilt screen labeled illustrative | a fake dashboard shown as real |
| Photography | the brand's own shoot | a licensed library you can name | a stranger presented as a customer |
| Illustration and 3D | the brand's system | custom or generated from the brief, labeled | a generic character or blob unrelated to the product |
| Icons | the project's set | one open-source set (for example Lucide or Phosphor) | mixed sets or hand-drawn one-offs |
| Logos | official files from each owner | the name in plain text | a redrawn or imitated logo |
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
> rules, or terms; no placeholder shipped as final; no missing critical states. See `SKILL.md`.

## Rules

### RX-UI-01 [Required] [Quality Lock] Hierarchy follows priority

- Do: Make the primary action and the key information the most prominent things in each area, with one clear focal point.
- Do not: Give everything equal weight, or let decoration outrank content.
- Why: Hierarchy is how users know what to read and do first. (NNGroup visual hierarchy)
- Not when: screens with several equal peers, such as a dashboard of comparable items; use consistent hierarchy within each card instead
- Trade-off: emphasizing one thing de-emphasizes the rest
- Check: visual QA

### RX-UI-03 [Preferred] [Quality Lock] One spacing and type scale

- Do: Use the project's spacing and type scale, or define one (for example multiples of 4 or 8) and align elements to a shared grid.
- Do not: Pick spacing and sizes one element at a time.
- Why: A scale produces rhythm and makes hierarchy legible. (Material Design 8dp grid)
- Not when: a one-off marketing piece outside the product
- Trade-off: a scale limits choices; occasional exceptions need a written reason
- Check: review

### RX-UI-04 [Preferred] [Quality Lock] A palette with roles

- Do: Use a small set of colors with defined roles: surface, text, accent for the primary action, and status colors.
- Do not: Introduce new colors per component, or use the accent for decoration.
- Why: When color has a role, the accent and status colors mean something. (ryux visual principle)
- Not when: data visualization, which needs its own categorical or sequential palette
- Trade-off: fewer colors means relying on type and space for emphasis
- Check: review

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
- Do: Classify each motion: L1 state feedback, L2 component transition, L3 page transition, L4 storytelling, L5 decorative. The higher the level, the stronger the reason it needs. Take timing and easing from one motion personality, define them once as motion tokens, animate transform and opacity rather than layout properties, and honor reduced motion (RX-A11Y-08).
- Do not: Animate everything, use one generic duration and easing (transition: all 0.3s) everywhere, or let decorative motion delay content or input.
- Why: Motion directs attention; unearned motion steals it from the task and can make some people unwell. (NNGroup animation and usability guidance; WCAG 2.3.3 animation from interactions)
- Not when: L1 feedback on standard controls that follows the platform defaults
- Trade-off: fewer flourishes on marketing pages
- Check: review; reduced-motion test

### RX-UI-12 [Contextual] A point of view on expressive surfaces

- When: the surface is expressive: a hero, landing page, onboarding, empty state, or brand moment
- Do: Before designing, write three directions, each with a name, a concept taken from the product's own idea (for a tool about evidence: receipts, citations, marks of proof), and a signature element (type, composition, imagery, or motion). Choose one and say why (RX-PR-09), then make the rest of the design serve that signature. Put the chosen concept in the Visual Brief.
- Do not: Let the signature be the category's default (for developer tools a terminal or agent-session panel; for SaaS a dashboard screenshot; copy on the left and product on the right), or relabel that default as a concept. A product screen can support the signature, not be it.
- Why: Users remember a product by its idea; a correct but generic surface is forgotten and could belong to any competitor. (brand and art direction practice; RX-UI-05 layout from content)
- Not when: task UI such as forms, tables, settings, and checkout, where restraint and convention win
- Trade-off: a strong idea takes a decision someone may disagree with; keep it honest and on brand
- Check: the swap test (RX-AS-09); review

### RX-UI-13 [Contextual] Source assets on purpose

- When: the design needs photos, illustration, 3D, icons, logos, or video
- Do: Pick each asset's source in this order: real product screens or the brand's own assets; a licensed library (one icon set, photos whose license you can name); a custom or generated asset made from the Visual Brief and labeled illustrative; otherwise a placeholder that looks like one (RX-AS-03). Record where each asset came from.
- Do not: Draw or imitate another company's logo, mix icon sets, use a photo you cannot license, or fill a gap with a generic stock scene.
- Why: Assets carry claims about the product and its users; an unsourced or borrowed asset is a claim nobody can back. (licensing and trademark practice; RX-UI-07; RX-AS-02)
- Not when: a wireframe or internal prototype where placeholders are expected
- Trade-off: real or licensed assets take longer than a stock search
- Check: asset list with sources; review
