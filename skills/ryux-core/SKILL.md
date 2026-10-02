---
name: ryux-core
description: Ryux core - the senior product designer workflow, levels, which Ryux skills to load for a task, the Delivery Gate report, and honest-claims wording. Load for any UI, UX, copy, or frontend task.
---

# ryux-core

> Ryux RX-2.0 (rules v1.0.0), MIT licensed. A senior product designer's
> reasoning for coding agents. Indonesia first, evidence first.

## Principle

Do not optimize for visual novelty. Optimize for clarity, usability, consistency, product fit,
accessibility, and intentional design decisions. Ryux guides good decisions and prevents generic
output; it is a filter and a reasoning aid, not a style.

## Workflow

Request → understand context → understand the product problem → define UX structure → define
interaction → define UI → apply the design system → implement → inspect (render) → critique →
refine → Delivery Gate → done.

Skip steps that do not apply to the task, but never skip from "generate" straight to "done".

## Levels

- **[Required]**: applies within its stated scope; an exception needs a written reason.
- **[Preferred]**: the default; break it only with a short written reason.
- **[Contextual]**: applies only when its "When" situation is present.
- **[Hard Gate]**: a Required rule with no exceptions. Fix it before declaring the work complete.
- **[Quality Lock]**: consistency that must hold across the product.

## Load only what the task needs

| Task | Load (plus ryux-core) |
| --- | --- |
| UI implementation | `ryux-product`, `ryux-ux`, `ryux-ui`, `ryux-design-system`, `ryux-frontend`, `ryux-visual-qa`, `ryux-anti-slop` |
| Form implementation | `ryux-product`, `ryux-ux`, `ryux-forms`, `ryux-interaction`, `ryux-accessibility`, `ryux-edge-cases`, `ryux-content` |
| Mobile UI | `ryux-ux`, `ryux-ui`, `ryux-responsive`, `ryux-accessibility`, `ryux-anti-slop` |
| Checkout or payment | `ryux-product`, `ryux-interaction`, `ryux-forms`, `ryux-content`, `ryux-edge-cases` |
| Data-heavy view (list, table, dashboard) | `ryux-ux`, `ryux-edge-cases`, `ryux-responsive`, `ryux-design-system`, `ryux-frontend` |
| Copy only | `ryux-content`, `ryux-anti-slop` |
| Visual refinement | `ryux-ui`, `ryux-design-system`, `ryux-visual-qa`, `ryux-anti-slop` |
| Review or critique | `ryux-critique` (Design Read + heuristic_eval), plus `ryux-visual-qa` |

- `ryux-product`: user, task, goal, primary action, constraints, assumptions. Load when starting a new screen or flow, or when the scope is unclear.
- `ryux-ux`: information architecture, navigation, flows, grouping, disclosure, search and filters. Load when designing multi-screen flows, navigation, or data-heavy views.
- `ryux-interaction`: before, during, result, recovery; feedback, control, confirmation, states, keyboard, local payments. Load when adding or changing anything the user can act on.
- `ryux-forms`: labels, layout, validation, input preservation, autofill, submission, unsaved work, OTP, address, e-KYC. Load when building or reviewing any form.
- `ryux-edge-cases`: data, form, network, permission, and system states beyond the happy path. Load when building data views, flows, or anything that talks to a network.
- `ryux-content`: specific copy, action labels, error messages, natural Indonesian, Rupiah, terminology. Load when writing or reviewing any user-facing text.
- `ryux-ui`: hierarchy, type, spacing, layout, density, color, containers, imagery, motion. Load when doing visual design or visual refinement.
- `ryux-design-system`: search before create, tokens, component states, consistency locks. Load when adding or changing components, styles, or tokens.
- `ryux-accessibility`: semantics, keyboard, focus, contrast, targets, names, errors, reduced motion. Load when building or reviewing any UI.
- `ryux-responsive`: prioritize, simplify, reorganize; tables, overlays, overflow, safe areas. Load when building a layout that ships to more than one width.
- `ryux-frontend`: the repo's own stack, semantic elements, components, state, no invented logic. Load when writing UI code.
- `ryux-visual-qa`: render, inspect, critique, fix, render again; ranked by impact. Load when something visual has been implemented and is about to be called done.
- `ryux-anti-slop`: hard gates, purpose gates, quality locks, honest claims. Load when work is about to be delivered, or during visual refinement.

## Delivery Gate

End UI, UX, copy, or frontend work with this report:

```
PRODUCT        PASS | FAIL | N/A  · one-line reason
UX             PASS | FAIL | N/A  · one-line reason
UI             PASS | FAIL | N/A  · one-line reason
DESIGN SYSTEM  PASS | FAIL | N/A  · one-line reason
ACCESSIBILITY  PASS | FAIL | N/A  · one-line reason
RESPONSIVE     PASS | FAIL | N/A  · one-line reason
EDGE CASES     PASS | FAIL | N/A  · one-line reason
CODE QUALITY   PASS | FAIL | N/A  · one-line reason
VISUAL QA      PASS | FAIL | N/A  · one-line reason
ANTI-SLOP      PASS | FAIL | N/A  · one-line reason
FINAL          PASS | FAIL
```

- Each area is PASS, FAIL, or N/A (with a reason when the area does not apply).
- An area FAILS when a [Required] rule in its skills fails without a written exception.
- A Hard Gate failure cannot be excepted: fix it before declaring the work complete.
- VISUAL QA cannot PASS without a render when a render tool is available; say which tool was used.
- FINAL is PASS only when no area is FAIL.

## Honest claims

Report what was checked, how, and what was not available. Do not claim "pixel perfect",
"fully accessible", "production ready", "senior-level", or "UX optimized" without evidence.

- Instead of "Fully accessible": "Keyboard navigation and focus were checked by hand; no automated
  accessibility test was available."
- Instead of "Pixel perfect": "Rendered at 1440px and 360px with Playwright; no overlap or clipping
  found."

## Design Decision Record

Record only meaningful decisions, such as a deviation from a rule, the design system, or a
reference screen. Skip trivial ones.

```
Decision:     what was chosen
Reason:       why, with a screen_id or "judgment call"
Trade-off:    what it costs
Alternative:  what was considered and why it lost
```

Reference screens and structured review come from the ryux MCP (`search_screens`,
`heuristic_eval`, `delivery_gate`). Connect: `claude mcp add --transport http ryux https://mcp.ryux.design/mcp`
