---
name: ryux-ui
description: "Ryux UI design: hierarchy, type, spacing, layout, density, color, containers, imagery, motion. Load when doing visual design or visual refinement."
---

# ryux-ui: UI design

> Group UI · Delivery Gate area UI · RX-2.0. Levels are defined in `ryux-core`.

Separate functional UI from decorative UI. Functional UI helps the user read, decide, or act.
Decorative UI needs a stated reason (see the purpose gates in ryux-anti-slop).

Work in this order:
1. **Hierarchy**: what is read first, second, third? The primary action and key information win.
2. **Layout and alignment**: a shared grid; groups by meaning; consistent edges.
3. **Spacing and type**: one scale; size and weight carry hierarchy, not color alone.
4. **Density**: compact for repeat work, roomier for first-time or high-stakes decisions.
5. **Color**: roles first (surface, text, accent for the primary action, status); contrast checked.
6. **Containers**: use a container only when it groups or separates something.
7. **Icons**: next to labels, from one set, at consistent sizes.
8. **Motion**: only to explain change; short; never blocking.

**Justify values.** Every value comes from the scale and has a reason you can say in one line:
"12px between these two fields because they belong together; 24px before the next group because it
is a new topic." Tighter inside a group, looser between groups; density follows the task. If you
cannot say why 8 and not 12, the choice is not a decision yet.

Does not cover: component reuse and tokens (see ryux-design-system).

## Evidence from Ryux Knowledge

A design direction from comparable screens: `extract_design_direction` (patterns, principles, pitfalls) with the screen_ids behind it. Without the ryux MCP, say the evidence comes from the design and standards alone.

> Hard Gates always apply, whichever skills are loaded: no invented numbers, people, urgency, business
> rules, or terms; no placeholder shipped as final; no missing critical states. See `ryux-core`.

## Rules

### RX-UI-01 [Required] [Quality Lock] Hierarchy follows priority

- Do: Make the primary action and the key information the most prominent things in each area, with one clear focal point.
- Do not: Give everything equal weight, or let decoration outrank content.
- Why: Hierarchy is how users know what to read and do first. (NNGroup visual hierarchy)
- Not when: screens with several equal peers, such as a dashboard of comparable items; use consistent hierarchy within each card instead
- Trade-off: emphasizing one thing de-emphasizes the rest
- Check: visual QA

### RX-UI-02 [Required] Functional before decorative

- Do: Give each decorative element (card, gradient, shadow, badge, illustration, large display type) a stated reason; see the anti-slop purpose gates.
- Do not: Add decoration because it looks modern.
- Why: Unjustified decoration is the fastest route to generic UI. (Nielsen heuristic 8; ryux anti-slop principle)
- Not when: brand or campaign pages where expression is the function; the decoration still needs its reason
- Trade-off: plain interfaces can feel undifferentiated; direction comes from DESIGN.md
- Check: review

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

### RX-UI-06 [Preferred] Density fits the task

- Do: Use compact density for repeat, data-heavy work and roomier layouts for first-time or high-stakes decisions.
- Do not: Apply the same generous whitespace to a cashier screen and a landing page.
- Why: The right density depends on how often and how carefully people use the screen. (Material density guidance)
- Not when: one screen serves both new and expert users; offer a density setting or a sensible middle
- Trade-off: dense screens are harder for newcomers; spacious ones slow experts
- Check: review

### RX-UI-07 [Contextual] Imagery that is what it claims

- When: the design uses photos or illustrations
- Do: Use real product screens or clearly illustrative art.
- Do not: Present a stock photo of a stranger as a customer or user.
- Why: Borrowed faces imply endorsements that do not exist. (ryux run 2026-10-02: pen.dev landing without ryux)
- Not when: pure illustration that clearly is not a photo of a customer
- Trade-off: real product screenshots age quickly and need updating
- Check: review

### RX-UI-08 [Preferred] Motion explains change

- Do: Use motion for feedback and continuity (where something came from, what changed), keep it short, and let users act while it runs.
- Do not: Animate for decoration alone or make users wait for an animation.
- Why: Purposeful motion helps users follow state changes; slow motion is friction. (Material motion principles; Apple HIG motion)
- Not when: reduced motion is requested; use a fade or a cut
- Trade-off: motion adds build time and can delay the task if overdone
- Check: review
