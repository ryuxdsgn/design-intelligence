import { CAPTURE_TABLE } from "./capture.js";

// Ryux Analyze: understand an existing interface before changing it. Source of truth for
// skills/ryux-analyze/SKILL.md, rendered by render.ts and installed by the CLI (group "analyze").

export const ANALYZE_DESCRIPTION =
  "Ryux Analyze - understand an existing interface before you change it. Inventories layout, type, spacing, color roles, components, hierarchy, navigation, interaction, and design language from a Figma link, pen.dev design, website URL, screenshot, or code, each with a confidence label. Use when asked to analyze, reverse-engineer, document, or learn from an existing design.";

export const ANALYZE_BODY = `# ryux-analyze: Ryux Analyze

> What is actually in this interface?

Analyze describes an existing design so that the next decision (build, extend, redesign, or
critique) starts from facts. It is not screenshot-to-code, and it does not judge quality; that is
\`ryux-critique\`. When the ryux MCP is connected, comparable Indonesian screens back the patterns
you name (\`search_screens\`, \`get_local_pattern\`).

## When to use it

- Before changing or extending a product you did not design.
- When asked to analyze, reverse-engineer, document, or learn from a design or a competitor.
- To turn an existing design into a \`DESIGN.md\` that Build can follow.

## Steps

### 1. Capture the design

${CAPTURE_TABLE}

### 2. Label every observation

| Label | Meaning | Example |
| --- | --- | --- |
| **Measured** | Read from the source: Figma variables, CSS, pen.dev node properties | body 16px / 24px, from CSS |
| **Observed** | Clearly visible in a capture, not measured | two-column layout at 1440 |
| **Inferred** | A reasonable guess | probably an 8px spacing scale |

Never present an inferred value as measured. When only a screenshot is available, most values are
Observed or Inferred; say so.

### 3. Inventory

Cover what the captures show; skip what they do not, and say it was not visible.

| Area | What to record |
| --- | --- |
| Layout and grid | columns, max width, gutters, breakpoints seen |
| Typography | families, the size and weight scale, line heights |
| Spacing | the scale in use, and where it breaks |
| Color roles | surface, text, accent (primary action), status colors, with values when measured |
| Components | each component, its variants, and the states seen (default, hover, focus, disabled, error, loading) |
| Hierarchy | the order the eye follows; the primary action |
| Navigation | the model (tabs, sidebar, top nav, steps), depth, and how users get back |
| Interaction | feedback, confirmation, undo, and loading patterns seen |
| Content and tone | voice, language (natural Indonesian or translated), how money and dates are written |
| Local patterns | QRIS, virtual accounts, OTP, addresses, paylater, e-KYC, and how they are handled |
| Responsive behavior | only when more than one width was captured: what moves, collapses, or hides |
| Design language | 3 to 5 traits (for example "dense, ledger-like, monospaced numbers"), each tied to evidence |

### 4. Patterns and evidence

Name the recurring patterns and where they appear. With the ryux MCP connected, cite comparable
Indonesian screens by \`screen_id\`; without it, say the patterns come from this design alone.

### 5. Report

\`\`\`
Summary: one or two sentences on what this interface is and how it is built

What was analyzed and how
  Source:      Figma frame "Checkout" (node 1:2) / https://... / pen.dev frame "..."
  Captured:    desktop 1440 and mobile 390 screenshots, CSS, via Playwright
  Not visible: hover and focus states, empty and error states

Inventory (with Measured / Observed / Inferred)
  Typography   Measured   Inter; 14 / 16 / 20 / 32px; weights 400, 600
  Spacing      Inferred   8px scale; one 20px gap breaks it
  ...

Patterns
  - Payment method picker with QRIS first (scr_...)

Design language
  - Dense and ledger-like: monospaced amounts, thin row dividers

Open questions
  - Are the amounts in the mockup real data or examples?
\`\`\`

### 6. Optional: a DESIGN.md draft

When the next step is Build, turn the inventory into a short \`DESIGN.md\`: tokens (color roles,
type scale, spacing, radius), principles (the design-language traits), and patterns, each with its
source and confidence. Keep Inferred values marked so the builder can confirm them.

## Don'ts

- Don't edit the source while analyzing.
- Don't generate code from the screenshot as the analysis.
- Don't judge good or bad; list open questions and hand off to \`ryux-critique\`.
- Don't fill gaps with typical values and present them as found.`;
