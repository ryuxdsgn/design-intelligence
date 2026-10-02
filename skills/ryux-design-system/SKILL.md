---
name: ryux-design-system
description: "Ryux Design system: search before create, tokens, component states, consistency locks. Load when adding or changing components, styles, or tokens."
---

# ryux-design-system: Design system

> Group UI · Delivery Gate area DESIGN SYSTEM · RX-2.0. Levels are defined in `ryux-core`.

Prioritize the existing system. Before creating anything:

1. Search existing components.
2. Search existing tokens (color, spacing, radius, type, elevation).
3. Search existing patterns (how similar screens solve this).
4. Reuse if an existing component fits.
5. Extend with a variant if it almost fits.
6. Create a new component only for a real semantic or behavioral difference, and name why.

**Quality Locks** to keep across the product: spacing, typography, color roles, terminology,
components, interaction patterns and states, responsive behavior, and visual hierarchy.

If the project has no system yet, define the smallest token set the screen needs and use it
consistently. Do not introduce a component library the project does not use.

> Hard Gates always apply, whichever skills are loaded: no invented numbers, people, urgency, business
> rules, or terms; no placeholder shipped as final; no missing critical states. See `ryux-core`.

## Rules

### RX-DS-01 [Required] [Hard Gate] Search before you create

- Do: Before adding a component, search existing components, tokens, and patterns; reuse, then extend with a variant, and create new only for a real semantic or behavioral difference.
- Do not: Create a near-duplicate component or pattern for one screen.
- Why: Duplicates drift apart, multiply maintenance, and break consistency. (Design-system practice)
- Check: review

### RX-DS-02 [Required] [Quality Lock] Consistency and conventions

- Do: Follow platform conventions and the project's own patterns; the same component looks and behaves the same everywhere.
- Do not: Style or wire similar components differently from screen to screen.
- Why: Consistency lets users transfer what they learned. (Nielsen heuristic 4; Apple HIG; Material Design)
- Check: heuristic_eval H-04

### RX-DS-03 [Preferred] [Quality Lock] Tokens over one-off values

- Do: Use tokens or variables for color, spacing, radius, elevation, and type.
- Do not: Hard-code one-off values for things the system already defines.
- Why: Tokens keep changes consistent and reviewable. (W3C Design Tokens Community Group)
- Check: review

### RX-DS-04 [Preferred] [Quality Lock] Defined component states

- Do: Define default, hover, focus, pressed, disabled, loading, and error states once per interactive component.
- Do not: Leave states for each screen to improvise.
- Why: Undefined states get designed inconsistently, or not at all. (Material Design state guidance)
- Check: review
