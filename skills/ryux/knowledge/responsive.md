# Responsive design

Makes layouts hold up at every width: what to prioritize, simplify, reorganize, and stack.

> Group UI · Delivery Gate area RESPONSIVE · RYUX 2.3.1. Levels are defined in `SKILL.md`.

Responsive design is behavioral. When space decreases: **prioritize → simplify → reorganize**.
Do not squeeze everything into a smaller viewport.

| Element | On narrow screens |
| --- | --- |
| Content | keep the priority content first; move secondary content behind a control |
| Navigation | collapse to the few top destinations; keep the current location visible |
| Tables | priority columns, stacked rows, or scroll inside the table with the key column fixed |
| Forms | one column; keyboards that match the input |
| Actions | primary action within thumb reach; not hidden under the fold |
| Modals and drawers | full-screen or bottom sheet; close and primary action reachable |
| Text | keep the size; let it wrap; truncate only with access to the full value |

For each section, answer before building: what **changes**, what **stays**, what **disappears**,
what **reorders**, what becomes **scrollable**, what becomes **stacked**, and which **interaction**
changes (hover becomes tap, a side panel becomes a sheet)?

Example: a data table on desktop → on tablet, scroll horizontally inside the table or show the
priority columns → on mobile, a different information architecture: a list of rows as summary cards
that open a detail view.

Check the stated viewport and the smallest supported width. No horizontal page scroll.

## Evidence from RYUX Knowledge

How reference flows adapt across widths when captured: `get_flow`, `search_screens` for the mobile pattern. Without the ryux MCP, say the evidence comes from the design and standards alone.

> Hard Gates always apply, whichever skills are loaded: no invented numbers, people, urgency, business
> rules, or terms; no placeholder shipped as final; no missing critical states. See `SKILL.md`.

## Rules

### RX-RD-01 [Required] [Hard Gate] Stated viewport plus the smallest

- Do: Check the stated viewport and the smallest supported width, with no horizontal page scroll at either.
- Do not: Design for one width only.
- Why: Users meet the layout at many widths, including small Android phones. (WCAG 2.2 SC 1.4.10 (reflow at 320 CSS px))
- Not when: a desktop-only internal tool with a documented minimum width
- Trade-off: more widths to design and test
- Check: visual QA

### RX-RD-02 [Required] Prioritize, simplify, reorganize

- Do: As space shrinks, decide what matters most, simplify what remains, then reorganize: stack, collapse, or move secondary content behind a control. Keep text size.
- Do not: Squeeze the desktop layout into a smaller viewport.
- Why: Shrinking keeps the layout and loses the reader. (WCAG 2.2 SC 1.4.10; responsive design practice)
- Not when: the content is already simple enough to stack as is
- Trade-off: mobile users may need a tap to reach secondary content
- Check: visual QA

### RX-RD-03 [Required] Safe areas and thumb reach

- Do: Keep content inside the safe areas and the primary action within thumb reach on phones.
- Do not: Put the main action under the notch or the home indicator.
- Why: Hidden or hard-to-reach actions stall the task. (Apple HIG layout; Material layout guidance)
- Not when: desktop-only layouts
- Trade-off: bottom-anchored actions cover content and need scroll padding
- Check: visual QA

### RX-RD-04 [Contextual] Tables and overlays on small screens

- When: the layout has a data table, or modals, drawers, or popovers
- Do: Pick a table's priority columns, then stack rows into labeled blocks or scroll the table inside its own container with the key column fixed; on phones, show overlays as a full-screen or bottom sheet with the close and primary actions reachable.
- Do not: Shrink a wide table until it is unreadable, scroll the whole page sideways, or show a desktop-sized modal that overflows a phone.
- Why: Tables carry comparisons and overlays can trap users when they overflow. (NNGroup mobile tables guidance; Apple HIG sheets; Material bottom sheets)
- Not when: the table is two or three columns and fits as is
- Trade-off: stacked rows lose side-by-side comparison
- Check: visual QA

### RX-RD-06 [Preferred] [Quality Lock] Consistent responsive behavior

- Do: Make the same component adapt the same way wherever it appears.
- Do not: Collapse the same navigation differently on different pages.
- Why: Predictable adaptation is part of consistency. (Nielsen heuristic 4 (1994))
- Not when: a page has a genuinely different purpose that needs a different pattern; write down why
- Trade-off: shared behavior can be suboptimal for an individual page
- Check: visual QA
