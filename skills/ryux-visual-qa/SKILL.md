---
name: ryux-visual-qa
description: "RYUX Visual QA: did the build match the intended design: compare, list deviations, fix, render again. Load when something visual has been implemented and is about to be called done, or a build must match a design."
---

# ryux-visual-qa: Visual QA

> Group Quality · Delivery Gate area VISUAL QA · RX-2.0. Levels are defined in `ryux-core`.

Visual QA asks one question: **did the implementation match the intended design?** Whether the
design itself is good is Critique's question (ryux-critique).

**With a reference** (a Figma or pen.dev frame, DESIGN.md, or an approved screenshot):
1. Capture the reference and the implementation at the same viewport (see the capture table in
   ryux-analyze).
2. Compare property by property: spacing, typography, color, size, position, components, states,
   responsive behavior.
3. Report each deviation:

```
Area        | Expected (reference) | Actual (build) | Deviation       | Severity | Fix
Card radius | 16px                 | 8px            | half the radius | minor    | use radius-lg
```

**Without a reference**, check the build against its own intent and the rules below.

**Loop**: implement → render → compare → fix → render again.

**Render with what is available**, in this order: the project's own preview or test setup;
`npx playwright screenshot --viewport-size=1440,900 <url>` (and 390 wide for mobile); a browser
tool; a design-tool export such as pen.dev `Export`. If none is available, say so in the gate.

**Rank issues by impact**: blocks the task, misleads (wrong numbers, unclear action), adds friction,
polish.

## Evidence from RYUX Knowledge

The intended design (Figma, pen.dev, DESIGN.md) is the reference; RYUX screens are a secondary comparison: `search_screens`. Without the ryux MCP, say the evidence comes from the design and standards alone.

> Hard Gates always apply, whichever skills are loaded: no invented numbers, people, urgency, business
> rules, or terms; no placeholder shipped as final; no missing critical states. See `ryux-core`.

## Rules

### RX-QA-01 [Required] Render, inspect, fix, render again

- Do: Render the result at the target viewport (browser, screenshot, or design-tool export), inspect the main state, one empty or error state, and the smallest supported width, rank issues by impact, fix from the top, and render again; if no render tool is available, say so in the report.
- Do not: Claim visual quality for a layout you have only seen as code, or fix by guesswork without checking the result.
- Why: Overlaps and clipping are invisible in source and obvious on screen; the loop turns a draft into a reviewed result. (ryux run 2026-10-02: two runs shipped overlaps they never saw)
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

### RX-QA-06 [Preferred] Match the intended design

- Do: When a reference exists (a Figma or pen.dev frame, DESIGN.md, an approved screenshot), capture it and the build at the same viewport, compare spacing, typography, color, size, position, components, states, and responsive behavior, and list each deviation with its fix; without one, compare with at least one reference screen_id.
- Do not: Call the build done while it visibly differs from the design without saying so, or judge it only against itself.
- Why: Visual QA answers whether the build matches the intent; whether the design is good is Critique's question. (ryux visual QA loop; ryux evidence principle)
- Check: screenshot comparison, search_screens
