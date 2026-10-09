# Design system

Keeps the interface consistent: reuse before create, tokens, component states, and consistency locks.

> Group UI · Delivery Gate area DESIGN SYSTEM · RYUX 2.5.0. Levels are defined in `SKILL.md`.

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

## Evidence from RYUX Knowledge

How reference apps keep components consistent for this pattern: `search_screens` by component, `extract_design_direction`. Without the ryux MCP, say the evidence comes from the design and standards alone.

> Hard Gates always apply, whichever skills are loaded: no invented numbers, people, urgency, business
> rules, or terms; no placeholder shipped as final; no missing critical states. See `SKILL.md`.

## Rules

### RX-DS-01 [Required] [Hard Gate] Search before you create

- Do: Before adding a component, search existing components, tokens, and patterns; reuse, then extend with a variant, and create new only for a real semantic or behavioral difference.
- Do not: Create a near-duplicate component or pattern for one screen.
- Why: Duplicates drift apart, multiply maintenance, and break consistency. (Design-system practice)
- Check: review

### RX-DS-02 [Required] [Quality Lock] Consistency, conventions, and states

- Do: Follow platform conventions and the project's own patterns; the same component looks and behaves the same everywhere, with its states (default, hover, focus, pressed, disabled, loading, error) defined once.
- Do not: Style or wire similar components differently from screen to screen.
- Why: Consistency lets users transfer what they learned. (Nielsen heuristic 4; Apple HIG; Material Design)
- Check: heuristic_eval H-04

### RX-DS-03 [Preferred] [Quality Lock] Tokens over one-off values

- Do: Use tokens or variables for color, spacing, radius, elevation, and type.
- Do not: Hard-code one-off values for things the system already defines.
- Why: Tokens keep changes consistent and reviewable. (W3C Design Tokens Community Group)
- Check: review

### RX-DS-05 [Contextual] Every theme you ship works

- When: The product ships more than one theme (light and dark, or brand themes), or a theme is being chosen.
- Do: Choose the default theme from the product, its users, and where it is used, then check every shipped theme with the same care: contrast, every component state, images and charts, and focus.
- Do not: Pick dark mode because the product is technical, or ship a toggle whose second theme was never rendered.
- Why: A theme that was never checked fails for everyone who picks it, often in contrast and states first. (pattern also in anti-slop (MIT) R-21, R-34; written for RYUX)
- Check: render each theme; contrast check
