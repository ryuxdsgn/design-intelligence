---
name: ryux-product
description: "Ryux Product thinking: user, task, goal, primary action, constraints, assumptions. Load when starting a new screen or flow, or when the scope is unclear."
---

# ryux-product: Product thinking

> Group Foundation · Delivery Gate area PRODUCT · RX-2.0. Levels are defined in `ryux-core`.

Answer these before any layout exists. Write the answers down; they are the brief.

1. **Who** is the user, and in what situation (device, place, time pressure)?
2. **What** are they trying to finish on this screen?
3. **Business goal**: what does the product need from this screen?
4. **Information that matters**: what must they see to decide or act?
5. **Primary action**: the one thing this screen exists for.
6. **Constraints**: platform, data that exists, technical or legal limits.
7. **Success**: how would you know the screen works?
8. **Assumptions**: everything you had to guess. Keep them visible.

Unknown facts stay assumptions. Do not invent business rules, metrics, user data, permissions,
pricing, requirements, or API behavior; mark them [REAL DATA] or ask.

Find evidence with the ryux MCP (`search_screens`, `get_flow`, `get_local_pattern`) and cite the
`screen_id`, or call the decision a judgment call.

Does not cover: layout or visual decisions (see ryux-ux and ryux-ui).

## Evidence from Ryux Knowledge

How comparable Indonesian products frame the same task and offer: `search_screens` (category, flow) and `get_flow` for the full sequence. Without the ryux MCP, say the evidence comes from the design and standards alone.

> Hard Gates always apply, whichever skills are loaded: no invented numbers, people, urgency, business
> rules, or terms; no placeholder shipped as final; no missing critical states. See `ryux-core`.

## Rules

### RX-PR-01 [Required] State the context first

- Do: Before designing, write down the user, their task, the business goal, the information that matters, the primary action, the constraints, and what success looks like.
- Do not: Start from a generic template with no stated user or task.
- Why: Without a task, design and review drift into taste. (ryux-critique playbook; NNGroup task-based evaluation)
- Check: review

### RX-PR-02 [Required] [Hard Gate] Unknowns stay assumptions

- Do: List what you do not know as assumptions, and mark the matching UI with [REAL DATA] or a question.
- Do not: Invent business rules, metrics, user data, permissions, pricing, requirements, or API behavior.
- Why: Invented facts turn into promises and bugs that someone has to unwind. (ryux run 2026-10-02: an unconstrained agent invented a 30-day trial and user counts)
- Check: review

### RX-PR-03 [Required] [Hard Gate] One goal, one primary action

- Do: Give each screen one primary goal and one primary action; make secondary actions look secondary.
- Do not: Put two equal-weight calls to action side by side, or leave the main action unclear.
- Why: A single clear path shortens the decision and the task. (Hick's law; NNGroup visual hierarchy)
- Check: review

### RX-PR-04 [Required] Back decisions with real screens

- Do: Cite at least one real screen_id for each meaningful design decision, or label it a judgment call with no reference.
- Do not: Claim "apps usually do X" without a screen to show it.
- Why: A cited screen makes a decision checkable instead of a matter of opinion. (ryux evidence principle)
- Check: search_screens, delivery_gate

### RX-PR-05 [Required] Indonesian context first

- Do: Start from how Indonesian apps and users work, and check a foreign pattern's local fit before reusing it.
- Do not: Import a pattern such as card-first checkout or dollar pricing without checking local relevance.
- Why: Payment, address, and trust habits differ locally (QRIS, virtual accounts, COD, WhatsApp). (ryux taxonomy of local patterns)
- Check: search_screens

### RX-PR-06 [Preferred] Outcome before feature

- Do: Lead with what the user gets or finishes, in their words, then explain the feature.
- Do not: Open with product features or technology.
- Why: People scan for relevance to their task before reading details. (NNGroup scanning research)
- Check: review

### RX-PR-07 [Preferred] Only what serves the task

- Do: Keep the elements and options the stated task needs and move the rest to a later step.
- Do not: Add sections, stats, settings, or badges because similar products have them.
- Why: Every extra element competes with the primary action and adds states to maintain. (Nielsen heuristic 8 (1994))
- Check: review

### RX-PR-08 [Contextual] Follow the project's direction

- When: the project has a DESIGN.md, a brand guide, or an existing design language
- Do: Follow it and write down any deliberate departure as a design decision record.
- Do not: Override it with the agent's default style.
- Why: Ryux filters and reasons; visual direction belongs to the project. (ryux run 2026-10-02: rules alone produced honest but undirected layouts)
- Check: review
