# RYUX Analyze

> What is actually in this interface?

Analyze answers "what exists?" and nothing more: it describes an existing design so that the next
decision (design, build, or critique) starts from facts. It is not screenshot-to-code, and it does not judge quality; that is
`capabilities/critique.md`. When the ryux MCP is connected, comparable Indonesian screens back the patterns
you name (`search_screens`, `get_local_pattern`).

## When to use it

- Before changing or extending a product you did not design.
- When asked to analyze, reverse-engineer, document, or learn from a design or a competitor.
- To turn an existing design into a `DESIGN.md` that Build can follow.

## Steps

### 1. Capture the design

| Source | How to capture | If it is not available |
| --- | --- | --- |
| Figma link (`figma.com/design/<fileKey>/...?node-id=1-2`) | Figma MCP: `get_screenshot` with the file key and node id (turn `1-2` into `1:2`) for the image; `get_metadata` for the frame tree; `get_design_context` and `get_variable_defs` for text, components, and variables (measured values) | Ask for a PNG export of the frames, or for the Figma MCP to be connected |
| pen.dev design | pencil MCP: `get_app_state` to list frames; `execute` with `TakeScreenshot([frameId])` for the image, and a `Get` visitor that prints text nodes, node properties (fonts, sizes, fills, gaps), and any `ctx.problems` (clipped content) | Ask for an exported PNG |
| Website URL | `npx playwright screenshot --full-page --viewport-size=1440,900 <url> desktop.png` and `--viewport-size=390,844` for mobile; a browser tool for interaction states (hover, focus, an error) when one is available; the page HTML and CSS for headings, labels, alt text, landmarks, and declared values | Ask for screenshots at desktop and mobile width |
| Screenshot or image | Read the image directly | none |
| Code only | Render it first (see `capabilities/qa.md`) | Work from the code and state that it was not rendered |

Stay read-only: do not edit the Figma file, the pen.dev document, or the site. Record what you
captured: the frames or URLs, the viewports, and the tools.

### 2. Label every observation

| Label | Meaning | Example |
| --- | --- | --- |
| **Measured** | Read from the source: Figma variables, CSS, pen.dev node properties | body 16px / 24px, from CSS |
| **Observed** | Clearly visible in a capture, not measured | two-column layout at 1440 |
| **Inferred** | A reasonable guess | probably an 8px spacing scale |

Never present an inferred value as measured. When only a screenshot is available, most values are
Observed or Inferred; say so.

Then list what is **Unknown**: what matters for the next decision and the input cannot answer, such
as what an action does on tap, the business priority behind an order, a fact's source, or a rule
nobody gave. Never fill an unknown with a guess. List meaningful unknowns, not mandatory ones: if
the input answers something, it is not unknown, and a short list is fine.

### 3. Inventory

Cover what the captures show; skip what they do not, and say it was not visible.

| Group | What to record |
| --- | --- |
| **Structure** | page and sections, containers and max width, grid (columns, gutters), navigation model and depth, content hierarchy (the order the eye follows, the primary action) |
| **Visual** | typography (families, size and weight scale, line heights), spacing scale and where it breaks, color roles (surface, text, accent, status, with values when measured), radius, border, shadow, density, alignment |
| **Components** | each component seen (button, input, select, table, card, modal, tabs, navigation, others), its variants, and the states seen (default, hover, focus, disabled, error, loading) |
| **Behavior** | interaction and feedback, loading, error, and empty states, confirmation and undo, responsive behavior (only when more than one width was captured) |
| **Imagery and motion** | art direction (product UI, photography, illustration, 3D) and its style; each visual's job; composition (where the focal point sits, the space kept for copy); motion character and level (L1 to L5) when motion was captured |
| **Design language** | the visual language in 3 to 5 traits, each tied to evidence; component patterns; the spacing and typography systems; interaction patterns |

Also note content and tone (natural Indonesian or translated, how money and dates are written) and
local patterns (QRIS, virtual accounts, OTP, addresses, paylater, e-KYC).

### 4. Patterns and evidence

Name the recurring patterns and where they appear. With the ryux MCP connected, cite comparable
screens by `screen_id`; without it, say the patterns come from this design alone. A pattern seen in
real apps is an **observed pattern**, not a best practice: say where it was observed, when it is
useful, and its risk. Popular apps can be wrong. Keep three sources apart: what you **observed**
in this design, what you **inferred**, and what is **knowledge** (a known pattern or standard,
cited).

### 5. Report

Structured, not an essay. This report is the input for `capabilities/critique.md` and for a `DESIGN.md`.

```
# RYUX Design Analysis

## Context
Source:        Figma frame "Checkout" (node 1:2) / https://... / pen.dev frame "..."
Viewport:      1440 desktop, 390 mobile
Captured with: Figma MCP / Playwright / pencil MCP
Not visible:   hover and focus states, empty and error states
Assumptions:   ...

## Layout
Container:  1200 max width, 24px side padding            (Measured)
Grid:       12 columns, 24 gutter                         (Inferred)
Spacing:    8px scale; one 20px gap breaks it             (Observed)
Density:    compact, ledger-like                          (Observed)
Alignment:  left-aligned text, numbers right-aligned      (Observed)

## Typography
Font:       Inter; JetBrains Mono for amounts              (Measured)
Scale:      14 / 16 / 20 / 32 / 56                         (Measured)
Hierarchy:  headline, amount, label, helper                (Observed)

## Visual
Color roles: surface #F6F3EC, text #1C1B18, accent #0F6B4B (Measured)
Radius / Border / Shadow: ...

## Components
Primary:    button (filled, 48 tall), payment method row
Secondary:  text link, tag
States seen: default, selected

## Interaction
Navigation: top nav, 3 items
Actions:    one primary action per screen
States:     ...
Feedback:   ...

## Design Language
- Dense and ledger-like: monospaced amounts, thin row dividers

## Patterns Detected
- Payment method picker with QRIS first (scr_...)

## Evidence
Each item above carries its label and source; RYUX Knowledge screen_ids where used.

## Unknown
- What the primary action does on tap: loading, result, failure
- Why QRIS is first: business priority or habit
- Whether the amounts are real data or examples
```

### 6. Optional: a visual direction, not a copy

When asked to make something "with the same visual language", extract the direction (traits, art
direction, composition habits, motion personality) and write it as a Visual Brief for the new
product (see `knowledge/ui.md`). Never reproduce the reference's images, layout, or brand assets.

### 7. Optional: a DESIGN.md draft

When the next step is Build, turn the inventory into a short `DESIGN.md`: tokens (color roles,
type scale, spacing, radius), principles (the design-language traits), and patterns, each with its
source and confidence. Keep Inferred values marked so the builder can confirm them.

## Don'ts

- Don't edit the source while analyzing.
- Don't generate code from the screenshot as the analysis.
- Don't judge good or bad; list open questions and hand off to `capabilities/critique.md`.
- Don't fill gaps with typical values and present them as found.
