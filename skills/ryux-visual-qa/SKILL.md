---
name: ryux-visual-qa
description: Ryux Visual QA: render, inspect, critique, fix, render again; ranked by impact. Load when something visual has been implemented and is about to be called done.
---

# ryux-visual-qa: Visual QA

> Group Quality · Delivery Gate area VISUAL QA · RX-2.0. Levels are defined in `ryux-core`.

Do not claim visual quality without inspecting the actual result when inspection is possible.

**Loop**: implement → render → inspect → critique → fix → render again.

**Render with what is available**, in this order: the project's own preview or test setup;
`npx playwright screenshot --viewport-size=1440,900 <url>` (and 360 wide for mobile); a browser
tool; a design-tool export such as pen.dev `Export`. If none is available, say so in the gate.

**Inspect**: layout, hierarchy, spacing, typography, alignment, density, component consistency,
responsive behavior, interaction states, accessibility, and edge cases.

**Rank issues by impact**:
1. Blocks the task (covered action, broken layout, unreadable text).
2. Misleads (wrong numbers, unclear primary action).
3. Adds friction (inconsistent spacing, weak hierarchy).
4. Polish.

For a structured review, use ryux-critique (Design Read plus heuristic_eval).

> Hard Gates always apply, whichever skills are loaded: no invented numbers, people, urgency, business
> rules, or terms; no placeholder shipped as final; no missing critical states. See `ryux-core`.

## Rules

### RX-QA-01 [Required] Render it and look

- Do: Render the result at the target viewport (browser, screenshot, or design-tool export) and inspect it before calling it done; if no render tool is available, say so in the report.
- Do not: Claim visual quality for a layout you have only seen as code.
- Why: Overlaps and clipping are invisible in source and obvious on screen. (ryux run 2026-10-02: two runs shipped overlaps they never saw)
- Check: screenshot

### RX-QA-02 [Required] Fix, then render again

- Do: Rank issues by impact (blocks the task, misleads, adds friction, polish), fix from the top, and render again to confirm.
- Do not: Fix by guesswork without checking the result, or polish while a blocking issue remains.
- Why: The loop is what turns a first draft into a reviewed result. (ryux visual QA loop)
- Check: screenshot

### RX-QA-03 [Required] No covered or colliding text

- Do: Keep floating cards and mockups over empty space only, and keep navigation items clear of the logo and buttons.
- Do not: Let a card cover prices or labels, or let nav items touch.
- Why: Covered text is lost information and looks broken. (ryux run 2026-10-02: QRIS card over prices, colliding nav)
- Check: screenshot

### RX-QA-04 [Required] Numbers agree

- Do: Make line items add up to subtotals and totals, and show the same value the same way everywhere on the screen.
- Do not: Show sample numbers that contradict each other.
- Why: Readers check sums; one wrong total undermines everything else. (ryux README checkout image (items Rp125.000, subtotal Rp1.200.000))
- Check: review

### RX-QA-05 [Preferred] Check states and widths

- Do: Inspect at least the main state, one empty or error state, and the smallest supported width.
- Do not: Review only the happy path at one width.
- Why: Most visual bugs live outside the default screenshot. (ryux visual QA loop)
- Check: screenshot

### RX-QA-06 [Preferred] Compare with a reference

- Do: Compare the result with at least one reference screen_id and note any intentional difference.
- Do not: Judge the result only against itself.
- Why: A reference shows what you missed. (ryux evidence principle)
- Check: search_screens
