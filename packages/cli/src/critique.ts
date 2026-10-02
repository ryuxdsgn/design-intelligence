import { CAPTURE_TABLE } from "./capture.js";

// Ryux Critique: the review skill. Source of truth for skills/ryux-critique/SKILL.md, rendered by
// render.ts and installed by the CLI (group "critique").

export const CRITIQUE_DESCRIPTION =
  "Ryux Critique - get a senior design critique before your users do. Reviews a Figma link, a pen.dev design, a website URL, or a screenshot: a Design Read across nine dimensions, then findings with evidence, impact, recommendation, and confidence, and fix priorities. Use when asked to critique, review, or audit a UI, screen, or flow.";

export const CRITIQUE_BODY = `# ryux-critique: Ryux Critique

> Get a senior design critique before your users do.

A review someone can act on: what works, what does not, why, and what to fix first, backed by what
was actually seen and by real screens, not vague advice like "add white space". It uses the Ryux
rules and, when connected, the ryux MCP tools \`search_screens\` and \`heuristic_eval\`.

## When to use it

- You are asked to review, audit, or critique a design, screen, flow, or live page.
- During visual QA, after rendering, before the Delivery Gate in \`ryux-core\`.

## Principles

1. **Review what you can see.** Capture the real design first. Never review from memory or from a
   description alone when the source is reachable.
2. **Read-only.** Do not edit the Figma file, the pen.dev document, or the site while reviewing.
3. **Evidence-based.** Every major finding (severity 3 or more) points to a real comparison
   \`screen_id\` when the ryux MCP is connected; otherwise say the evidence is from the design alone.
4. **Honest scope.** A static frame shows no hover, focus, loading, or narrow widths. Say what was
   not tested instead of guessing.
5. **Concise and prioritized.** At most 12 findings; the ones that hurt users most come first.

## Steps

### 1. Capture the design

${CAPTURE_TABLE}

### 2. Gather context

Who the user is, what task happens on this screen, the platform, and the point in the flow. If the
request does not say, infer from the design and list it as an assumption. Without context, a
review turns into taste.

### 3. Design Read

Rate each dimension **Strong**, **Adequate**, or **Weak**, with one sentence of reason.

| Dimension | Question |
| --- | --- |
| Clarity | Can the user understand what this screen is for? |
| Hierarchy | Can the user identify what matters first? |
| Coherence | Does it feel like part of the same product? |
| Density | Is the information density right for how often and how carefully it is used? |
| Confidence | Does the user have enough information to act safely (cost, consequence, status)? |
| Efficiency | Can the task be done without unnecessary work? |
| Specificity | Does it feel designed for this product, or could it belong to any generic SaaS app? |
| Recoverability | Can users recover from mistakes and failures? |
| Accessibility | Can people with different abilities and input methods operate and understand it? |

### 4. Findings

Walk the design with the Ryux rules that apply. [Required] rules are the gate, [Preferred] rules
need a reason when broken, and [Contextual] rules count only when their situation is present.
- **Product** (RX-PR): stated purpose, one primary action, no invented facts or numbers.
- **UX** (RX-UX, RX-IX, RX-FM, RX-EC, RX-CD): structure, wayfinding, feedback, confirm or undo, cost
  upfront, forms, states, error copy, natural Indonesian, Rupiah. Local patterns (QRIS, VA, OTP,
  paylater, e-KYC) are Contextual rules.
- **UI** (RX-UI, RX-DS, RX-A11Y, RX-RD): hierarchy, purpose of decoration, consistency, contrast,
  targets, focus, responsive behavior.
- **Quality** (RX-QA, RX-AS): covered text, numbers that add up, invented numbers or people, fake
  urgency, honest placeholders.

For each finding write:
- **Finding**: where it is and what the problem is, with the Ryux rule.
- **Evidence**: what you saw (the capture, a measured value, a \`screen_id\`).
- **Impact**: who is affected, in which task, and how badly; plus a severity from 0 to 4
  (\`0\` not a problem · \`1\` cosmetic · \`2\` minor · \`3\` major · \`4\` catastrophic).
- **Recommendation**: a concrete fix.
- **Confidence**: High (seen directly), Medium (partly seen, such as one width only), or Low
  (inferred, such as a state that was not captured).

### 5. Evidence and structure (ryux MCP)

When the ryux MCP is connected:
- For each major finding, find 1 to 3 comparison screens from Indonesian apps with
  \`search_screens\` and cite the \`screen_id\`.
- Send the findings to \`heuristic_eval\` (\`task_context\` + \`findings\`). Its \`heuristic\` field
  takes the Nielsen codes \`H-01\` to \`H-10\`; map each finding and name the Ryux rule in \`issue\`:

| Finding from | Map to |
| --- | --- |
| RX-EC-01 states, RX-IX-02 feedback | \`H-01\` visibility of system status |
| RX-CD-01..03 copy, RX-UX-09 the user's words | \`H-02\` match with the real world |
| RX-IX-03 exits, RX-UX-02 wayfinding | \`H-03\` user control and freedom |
| RX-DS-02 consistency, RX-A11Y-01..05 | \`H-04\` consistency and standards |
| RX-IX-04 confirm or undo, RX-FM-01..05 forms | \`H-05\` error prevention |
| RX-UX-08 recognition | \`H-06\` recognition rather than recall |
| RX-IX-08 shortcuts | \`H-07\` flexibility and efficiency |
| RX-UI-02 decoration, RX-AS-01..05 honesty | \`H-08\` aesthetic and minimalist design |
| RX-CD-04 error messages, RX-EC-02 recovery | \`H-09\` error recovery |
| RX-CD-07 help | \`H-10\` help and documentation |

The tool rejects major findings without valid evidence, caps the list at 12, and returns PASS or
FAIL. Any finding of severity 3 or more means FAIL.

### 6. Report

\`\`\`
Verdict: one sentence (what works, the biggest risk)

What was reviewed and how
  Source:      Figma frame "Checkout" (node 1:2) / https://... / pen.dev frame "..."
  Captured:    desktop 1440 and mobile 390 screenshots, via Playwright
  Not tested:  hover and focus states, live data, screen reader

Design Read
  Clarity       Strong    · ...
  Confidence    Weak      · ...
  (all nine)

Findings (most severe first, at most 12)
  1. [severity 3 · confidence High] Location · problem · rule RX-..
     Evidence:        what was seen, scr_...
     Impact:          who and which task, how badly
     Recommendation:  the fix

What works (keep it)
  - ...

Fix priorities
  1. ...
\`\`\`

## Don'ts

- Don't review a design you have not captured when it is reachable.
- Don't edit the source file while reviewing.
- Don't give a critique with no location and no reason.
- Don't raise severity to major without evidence, or claim "app X does this" without a \`screen_id\`.
- Don't mark an inferred issue High confidence.
- Don't paste generic advice ("modernize", "add white space") without a real problem.
- Don't call the result "fully accessible" or "UX optimized"; say what was checked.`;
