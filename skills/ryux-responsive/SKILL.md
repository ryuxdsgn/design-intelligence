---
name: ryux-responsive
description: Ryux Responsive design: prioritize, simplify, reorganize; tables, overlays, overflow, safe areas. Load when building a layout that ships to more than one width.
---

# ryux-responsive: Responsive design

> Group UI · Delivery Gate area RESPONSIVE · RX-2.0. Levels are defined in `ryux-core`.

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

Check the stated viewport and the smallest supported width. No horizontal page scroll.

> Hard Gates always apply, whichever skills are loaded: no invented numbers, people, urgency, business
> rules, or terms; no placeholder shipped as final; no missing critical states. See `ryux-core`.

## Rules

### RX-RD-01 [Required] [Hard Gate] Stated viewport plus the smallest

- Do: Check the stated viewport and the smallest supported width, with no horizontal page scroll at either.
- Do not: Design for one width only.
- Why: Users meet the layout at many widths, including small Android phones. (WCAG 2.2 SC 1.4.10 (reflow at 320 CSS px))
- Check: visual QA

### RX-RD-02 [Required] Prioritize, simplify, reorganize

- Do: As space shrinks, decide what matters most, simplify what remains, then reorganize: stack, collapse, or move secondary content behind a control. Keep text size.
- Do not: Squeeze the desktop layout into a smaller viewport.
- Why: Shrinking keeps the layout and loses the reader. (WCAG 2.2 SC 1.4.10; responsive design practice)
- Check: visual QA

### RX-RD-03 [Required] Safe areas and thumb reach

- Do: Keep content inside the safe areas and the primary action within thumb reach on phones.
- Do not: Put the main action under the notch or the home indicator.
- Why: Hidden or hard-to-reach actions stall the task. (Apple HIG layout; Material layout guidance)
- Check: visual QA

### RX-RD-04 [Contextual] Tables on small screens

- When: the layout has a data table
- Do: Pick the priority columns, then stack rows into labeled blocks or scroll the table inside its own container with the key column fixed.
- Do not: Shrink a wide table until it is unreadable or scroll the whole page sideways.
- Why: Tables carry comparisons; losing the key column loses the meaning. (NNGroup mobile tables guidance)
- Check: visual QA

### RX-RD-05 [Contextual] Overlays on small screens

- When: the layout uses modals, drawers, or popovers
- Do: On phones, use a full-screen or bottom sheet and keep the close and primary actions reachable.
- Do not: Show a desktop-sized modal that overflows a phone screen.
- Why: Overflowing overlays trap users. (Apple HIG sheets; Material bottom sheets)
- Check: visual QA

### RX-RD-06 [Preferred] [Quality Lock] Consistent responsive behavior

- Do: Make the same component adapt the same way wherever it appears.
- Do not: Collapse the same navigation differently on different pages.
- Why: Predictable adaptation is part of consistency. (Nielsen heuristic 4 (1994))
- Check: visual QA
