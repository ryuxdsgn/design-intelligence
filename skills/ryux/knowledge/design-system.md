# Design system

Keeps the interface consistent: reuse before create, tokens, component states, and consistency locks.

> Group UI · Delivery Gate area DESIGN SYSTEM · RYUX 2.20.0. Levels are defined in `SKILL.md`.

Prioritize the existing system. Before creating anything:

1. Search existing components.
2. Search existing tokens (color, spacing, radius, type, elevation).
3. Search existing patterns (how similar screens solve this).
4. Reuse if an existing component fits.
5. Extend with a variant if it almost fits.
6. Create a new component only for a real semantic or behavioral difference, and name why.

**Quality Locks** to keep across the product: spacing, typography, color roles, terminology,
components, interaction patterns and states, responsive behavior, and visual hierarchy.

Look for the existing system before defining one: DESIGN.md, a tokens or theme file in the repo, the
design file's variables and components, or a linked library. If the project has no system yet, define
the smallest token set the screen needs and use it consistently: color roles, a spacing scale, a
radius scale, and a type scale, not color alone. After rendering, count the literal values left and
convert them (RX-DS-03). Do not introduce a component library the project does not use.

## Evidence from RYUX Knowledge

How reference apps keep components consistent for this pattern: `search_screens` by component, `extract_design_direction`. Without the ryux MCP, say the evidence comes from the design and standards alone.

> Hard Gates always apply, whichever skills are loaded: no invented numbers, people, urgency, business
> rules, or terms; no placeholder shipped as final; no missing critical states. Labeled sample data is
> not an invented number; an unconfirmed capability is never presented as confirmed. See `SKILL.md`.

## Rules

### RX-DS-01 [Required] [Hard Gate] Search before you create

- Do: Before adding a component, search existing components, tokens, and patterns; reuse, then extend with a variant, and create new only for a real semantic or behavioral difference.
- Do not: Create a near-duplicate component or pattern for one screen.
- Why: Duplicates drift apart, multiply maintenance, and break consistency. (Design-system practice)
- Check: for each new component or token, name the existing ones searched and why none fits; fails on a new one that duplicates an existing one

### RX-DS-02 [Required] [Quality Lock] Consistency, conventions, and states

- Do: Follow platform conventions and the project's own patterns; the same component looks and behaves the same everywhere, with its states (default, hover, focus, pressed, disabled, loading, error) defined once.
- Do not: Style or wire similar components differently from screen to screen.
- Why: Consistency lets users transfer what they learned. (Nielsen heuristic 4; Jakob's law (Nielsen 2000): people spend most of their time in other products and expect yours to work the same way; Apple HIG; Material Design)
- Check: heuristic_eval H-04

### RX-DS-03 [Preferred] [Quality Lock] Tokens over one-off values

- Do: Use tokens or variables for color, spacing, radius, elevation, and type.
  - First look for the ones that exist (DESIGN.md, a tokens or theme file in the repo, the design file's variables and components, a linked library) and use them.
  - When the project has none, define them before the first frame: color roles, a spacing scale, a radius scale, and a type scale (sizes and font families).
  - Name color tokens by role (surface, text, accent, status), not by value, so a second theme is a swap of values, not a rename.
  - In a design tool, create them as the tool's variables, reference them in every value, and make anything that repeats (a row, a button, a bar) a component.
  - After rendering, count the values that are still literal, by kind, and turn each into a token or name why it is an exception.
- Do not: Hard-code one-off values for things the system already defines, or define tokens for color only and leave spacing, radius, and type size literal.
- Why: Tokens keep changes consistent and reviewable; values that are not tokens drift from frame to frame and state to state. (W3C Design Tokens Community Group; ryux four-problems baseline 2026-10-16: in all 12 runs, with or without RYUX, spacing, radius, and font size were 100% literal)
- Check: count literal values after render; review
- Machine check: `ryux scan` flags three or more one-off hex colors in a file that is not a token or theme file (warn)

### RX-DS-05 [Contextual] Every theme you ship works

- When: The product ships more than one theme (light and dark, or brand themes), or a theme is being chosen.
- Do: Choose the default theme from the product, its users, and where it is used, then check every shipped theme with the same care: contrast, every component state, images and charts, and focus.
- Do not: Pick dark mode because the product is technical, or ship a toggle whose second theme was never rendered.
- Why: A theme that was never checked fails for everyone who picks it, often in contrast and states first. (pattern also in anti-slop (MIT) R-21, R-34; written for RYUX)
- Check: render each theme; contrast check

### RX-DS-06 [Preferred] [Quality Lock] The component sheet is a spec

- Do: Lay out each component as a labeled grid: one row per property, one column per state (default, hover on web, pressed, disabled, loading, error), each cell labeled with its variant name, and one line of usage under each component; no overlapping or clipped variants. Render and inspect the sheet like a screen.
  - When the component ships to code, put its contract beside the grid: one row per property with its design-tool type, values, default, the code prop it maps to (or "none: CSS state"), and a note. Designers and developers read the same table.
- Do not: Leave variants scattered, unlabeled, or cut off at the frame edge.
- Why: Developers build from the component sheet; a variant they cannot find or read gets rebuilt or guessed. (ryux run: blind review of a delivery flow 2026-10-20; design-system practice; written for RYUX)
- Not when: a single screen with no shared components
- Trade-off: takes time to lay out; pays back at handoff
- Check: render the sheet; every variant visible and labeled

### RX-DS-07 [Contextual] [Quality Lock] Property names are the code's props

- When: Building or changing reusable components or variables in a design tool (Figma, pen.dev) or a component library, meant to be used by designers and in code.
- Do: Name each component property and value the way the code names the prop: camelCase names (variant, size, hasLeadingIcon) and lowercase values (primary, secondary, sm, md). When the repo already has the component, take its prop names; otherwise agree them once in the contract (RX-DS-06) and use them on both sides.
- Do not: Name properties for one audience, such as Type=Primary Big in the design file and kind="main" in code, or rename a value on one side only.
- Why: When the panel and the props use the same words, handoff needs no translation table and nobody guesses which variant is which. (Design-system practice; Figma component properties and Code Connect (help.figma.com); written for RYUX)
- Check: compare the property and value names in the design file with the contract and the code props

### RX-DS-08 [Contextual] Each property has the type its job needs

- When: Building or changing reusable components or variables in a design tool (Figma, pen.dev) or a component library, meant to be used by designers and in code.
- Do: Use a variant property for a change in look or structure (variant, size); a boolean for a part that shows or hides (hasLeadingIcon); an instance swap for the icon or slot that fills it (leadingIcon); a text property for copy (label). Set a default for each, the one used most.
- Do not: Make an icon position or a label a variant, or add a variant per icon.
- Why: The right property type keeps the variant count small and the panel readable, and maps one to one to a prop, a boolean, a slot, or a string in code. (Design-system practice; Figma component properties: variant, boolean, instance swap, text (help.figma.com); written for RYUX)
- Check: review the property list against the contract

### RX-DS-09 [Contextual] Variants stay few and valid

- When: Building or changing reusable components or variables in a design tool (Figma, pen.dev) or a component library, meant to be used by designers and in code.
- Do: Before building, multiply the values of every variant axis. Above about 48 variants, or when some combinations make no sense (a loading state on a link-style button), split the component, turn an axis into a boolean or instance swap, or leave the invalid combinations out and note them in the contract.
- Do not: Build every combination because the tool can, or add an axis for one case.
- Why: Each extra axis multiplies what designers scroll through and developers must support; invalid combinations get used. (Design-system practice; ryux owner review 2026-10-25 (3 hierarchies × 3 sizes × 4 states is 36 before icons); written for RYUX)
- Trade-off: a split component is one more name to find
- Check: count the variants per component set; list the combinations left out and why

### RX-DS-10 [Contextual] Interaction states are spec, data states are props

- When: Building or changing reusable components or variables in a design tool (Figma, pen.dev) or a component library, meant to be used by designers and in code.
- Do: Draw hover, pressed, and focus as variants so the look is specified, and mark them in the contract as CSS states with no prop. Make disabled, loading, selected, and error props, because the product sets them.
- Do not: Map state=hover to a prop, or leave loading and error as drawings with no prop behind them.
- Why: A hover prop has nothing to set it, and a loading state with no prop never ships. (ryux owner review 2026-10-25 of a design-system proposal; W3C WAI-ARIA states; written for RYUX)
- Check: every state in the contract is either a prop or marked CSS state

### RX-DS-11 [Contextual] Components bind semantic variables

- When: Building or changing reusable components or variables in a design tool (Figma, pen.dev) or a component library, meant to be used by designers and in code.
- Do: Keep variables in two layers: primitives (blue/500, space/4) and semantic roles that point to them (text/accent, surface/raised, space/control-gap). Components bind only the semantic layer; themes and brands are modes of the semantic collection. Give code the same names as tokens.
- Do not: Bind a component to a primitive, or make a second theme by duplicating components.
- Why: With one semantic layer, a theme or rebrand changes values in one place and every component follows, in the design file and in code. (W3C Design Tokens Community Group (aliases); Figma variables and modes (help.figma.com); extends RX-DS-03)
- Check: count component values bound to a primitive or to no variable

### RX-DS-12 [Contextual] Components resize like the code

- When: Building or changing reusable components or variables in a design tool (Figma, pen.dev) or a component library, meant to be used by designers and in code.
- Do: Build each component with auto layout, padding and gap bound to spacing variables, and a stated resize rule (hug the content, or fill the container). Check it with the longest real label, including Indonesian copy, which often runs longer than English, and at the smallest width it is used in.
- Do not: Position layers absolutely inside a component, or set a fixed width that clips a long label.
- Why: A component that does not resize the way the code does gets detached in the design file and rebuilt in code. (Design-system practice; Figma auto layout (help.figma.com); RX-RD-01; written for RYUX)
- Check: render each component with its longest label and at its smallest width
