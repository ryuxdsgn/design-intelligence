---
name: ryux-core
description: "Ryux core - a design intelligence layer for AI and designers. Choose the capability (Analyze, Build, Critique, QA), then the levels, which Ryux skills to load, the Hard Gates, the Delivery Gate, and honest-claims wording. Load for any UI, UX, copy, or frontend task."
---

# ryux-core

> Ryux RX-2.0 (rules v1.3.0), MIT licensed. Indonesia first, evidence first.

Ryux is a design intelligence layer for AI and designers: it helps understand, build, evaluate,
and fix interfaces through design reasoning. It is not a UI generator, an anti-slop framework, or
a design system.

## Start by choosing the capability

| Capability | When | Load |
| --- | --- | --- |
| **Analyze** | understand an interface that exists | `ryux-analyze` |
| **Build** | create or change UI, copy, or frontend code | decide with evidence (ryux-product), then the workflow and task table |
| **Critique** | evaluate a design, page, or flow | `ryux-critique` |
| **QA** | verify what was just built | `ryux-visual-qa` |

Skill roles: **core** is the operating system; **knowledge** skills (product, ux, interaction,
forms, edge-cases, content, ui, design-system, accessibility, responsive, frontend) say how to
reason; **capability** skills (analyze, critique) are workflows; **gate** skills (visual-qa,
anti-slop) verify and filter. Ryux Knowledge is the evidence layer for all of them. Every
capability ends at the Anti-Slop Quality Gate: the Hard Gates below and the Delivery Gate.

## Principle

Do not optimize for visual novelty. Optimize for clarity, usability, consistency, product fit,
accessibility, and intentional decisions. Understand the context before deciding; separate observed
facts from assumptions; prefer evidence over aesthetic preference; do not invent requirements;
explain meaningful decisions with their trade-off; validate before claiming.

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

## Hard Gates (always apply)

These hold even when `ryux-anti-slop` is not loaded. No written exception; fix before delivery.

- **Fake data or fake metrics.** Do not invent "48.000+ users", "4,8★", or "+12%". (RX-AS-01)
- **Fake testimonials or people.** Do not make up testimonials, reviewers, or customer photos. (RX-AS-02)
- **Invented business rules or product requirements.** Do not invent business rules, metrics, user data, permissions, pricing, requirements, or API behavior. (RX-PR-02, RX-FE-02)
- **Placeholder copy shipped as final.** Do not ship placeholder copy or data disguised as final. (RX-AS-03)
- **Fake urgency or scarcity.** Do not write "sebelum kehabisan", "kuota terbatas", or fake countdowns with nothing behind them. (RX-AS-04)
- **Missing critical states.** Do not ship only the filled, happy-path screen. (RX-EC-01)
- **Broken responsive behavior.** Do not design for one width only. (RX-RD-01)
- **Accessibility failures.** Do not put light grey text on white or white text on a pale accent. (RX-A11Y-01, RX-A11Y-02, RX-A11Y-03, RX-A11Y-04)
- **Unclear primary action.** Do not put two equal-weight calls to action side by side, or leave the main action unclear. (RX-PR-03)
- **Unexplained interaction behavior.** Do not ship an action whose in-progress, result, or failure behavior is undefined. (RX-IX-01)
- **Duplicate components.** Do not create a near-duplicate component or pattern for one screen. (RX-DS-01)
- **Unnecessary complexity.** Do not add settings, sections, abstractions, or packages "for later", or features because similar products have them. (RX-AS-06)

## Build: load only what the task needs

| Task | Load (plus ryux-core) |
| --- | --- |
| UI implementation | `ryux-product`, `ryux-ux`, `ryux-ui`, `ryux-design-system`, `ryux-frontend`, `ryux-visual-qa`, `ryux-anti-slop` |
| Form implementation | `ryux-product`, `ryux-ux`, `ryux-forms`, `ryux-interaction`, `ryux-accessibility`, `ryux-edge-cases`, `ryux-content` |
| Mobile UI | `ryux-ux`, `ryux-ui`, `ryux-responsive`, `ryux-accessibility`, `ryux-anti-slop` |
| Checkout or payment | `ryux-product`, `ryux-interaction`, `ryux-forms`, `ryux-content`, `ryux-edge-cases` |
| Data-heavy view (list, table, dashboard) | `ryux-ux`, `ryux-edge-cases`, `ryux-responsive`, `ryux-design-system`, `ryux-frontend` |
| Frontend logic or utilities (formatting, state, data shown to users) | `ryux-frontend`, `ryux-content`, `ryux-edge-cases` |
| Copy only (UI text, chat, announcements) | `ryux-content`, `ryux-anti-slop` |
| Visual refinement | `ryux-ui`, `ryux-design-system`, `ryux-visual-qa`, `ryux-anti-slop` |
| Review or critique | `ryux-critique` (Design Read + heuristic_eval), plus `ryux-visual-qa` |

## Delivery Gate

End UI, UX, copy, or frontend work with this report:

```
PRODUCT        PASS | FAIL | N/A  · one-line reason · evidence Strong | Thin | None
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
"fully accessible", "production ready", "senior-level", or "UX optimized" without evidence. Say
"Keyboard and focus checked by hand; no automated accessibility test was available" instead.

## Design Decision Record

For consequential choices (RX-PR-09) and deviations, write **Decision**, **Options** compared, **Evidence**,
**Trade-off**, and **Choice**. Evidence is Strong (2+ comparable screen_ids), Thin (one, or another context),
or None (no screen_id: a judgment call). With None on a consequential choice, show options or ask (RX-PR-10).

Reference screens and structured review come from the ryux MCP (`search_screens`,
`heuristic_eval`, `delivery_gate`). Connect: `claude mcp add --transport http ryux https://mcp.ryux.design/mcp`
