---
name: ryux-critique
description: Ryux design review playbook. Gather context, run a Design Read across nine dimensions (clarity, hierarchy, coherence, density, confidence, efficiency, specificity, recoverability, accessibility), then record findings with severity 0-4 and real screen evidence through heuristic_eval, and close with fix priorities. Use when critiquing or reviewing UI, a screen, or a flow.
---

# ryux-critique

> How Ryux reviews a design: evidence-based, structured, and not shallow.

The goal is a critique someone can act on: what works, what does not, why, and what to fix first,
backed by real screens instead of vague comments like "add white space". It uses the Ryux rules
(`docs/design-rules.md`) and the ryux MCP tools `search_screens` and `heuristic_eval`.

## When to use it

- You are asked to review, audit, or critique a UI, screen, or flow.
- During visual QA, after rendering, before the Delivery Gate.

## Principles

1. **Evidence-based.** Every major finding (severity 3 or more) points to at least one real
   `screen_id` as a comparison. Find it with `search_screens`.
2. **Look at the real thing.** Review a render or screenshot when one is available, not only code.
3. **A first pass, not a human replacement.** Say so in the output.
4. **Concise and prioritized.** At most 12 findings; the ones that hurt users most come first.

## Steps

### 1. Gather context

Settle who the user is, what task happens on this screen, the platform, and the point in the flow.
Without it, the review turns into taste.

### 2. Design Read

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

### 3. Findings

Walk the screen with the Ryux skills that apply. [Required] rules are the gate, [Preferred] rules
need a reason when broken, and [Contextual] rules count only when their situation is present.
- **Product** (RX-PR): stated context, one primary action, no invented facts.
- **UX** (RX-UX, RX-IX, RX-FM, RX-EC, RX-CD): structure, wayfinding, before/during/result/recovery,
  confirm or undo, cost upfront, forms, states, error copy, natural Indonesian, Rupiah. Local
  patterns (QRIS, VA, OTP, paylater, e-KYC) are Contextual rules.
- **UI** (RX-UI, RX-DS, RX-A11Y, RX-RD): hierarchy, purpose of decoration, consistency, contrast,
  targets, focus, responsive behavior.
- **Quality** (RX-QA, RX-AS): covered text, numbers that add up, invented numbers or people, fake
  urgency, honest placeholders.

For each finding write the location, the problem, the rule, a severity from 0 to 4 with its reason
(`0` not a problem · `1` cosmetic · `2` minor · `3` major · `4` catastrophic), and a concrete fix.

### 4. Pull real evidence

For each major finding, find 1 to 3 comparison screens from Indonesian apps with `search_screens`
(for example "how F&B apps show payment status") and cite the `screen_id`.

### 5. Structure it through heuristic_eval

Send the findings to `heuristic_eval` (`task_context` + `findings`). Its `heuristic` field only
accepts the Nielsen codes `H-01` to `H-10`, so map each finding to its closest heuristic and name the
Ryux rule in `issue`:

| Finding from | Map to |
| --- | --- |
| RX-EC-01 states, RX-IX-02 feedback | `H-01` visibility of system status |
| RX-CD-01..03 copy, RX-UX-09 the user's words | `H-02` match with the real world |
| RX-IX-03 exits, RX-UX-02 wayfinding | `H-03` user control and freedom |
| RX-DS-02 consistency, RX-A11Y-01..05 | `H-04` consistency and standards |
| RX-IX-04 confirm or undo, RX-FM-01..05 forms | `H-05` error prevention |
| RX-UX-08 recognition | `H-06` recognition rather than recall |
| RX-IX-08 shortcuts | `H-07` flexibility and efficiency |
| RX-UI-02 decoration, RX-AS-05 purpose gates, RX-AS-01..04 honesty | `H-08` aesthetic and minimalist design |
| RX-CD-04 error messages, RX-EC-02 recovery | `H-09` error recovery |
| RX-CD-07 help | `H-10` help and documentation |

The tool validates severity, rejects major findings without valid evidence, caps the list at 12
(dropping the lowest severity first), and returns a summary with PASS or FAIL. Any finding of
severity 3 or more means FAIL. Fix any finding marked `supported: false` before moving on.

### 6. Close with priorities

Order the fixes: catastrophic, major, minor. For each, name the concrete fix and the reference
screen. Then fill the relevant areas of the Delivery Gate in `ryux-core`.

## Don'ts

- Don't give a critique with no location and no reason.
- Don't raise severity to major without `screen_id` evidence.
- Don't paste generic recommendations ("modernize", "add white space") without a real problem.
- Don't invent claims like "app X does this" without a comparison `screen_id`.
- Don't call the result "fully accessible" or "UX optimized"; say what was checked.

## Example

```
Design Read
Clarity       Strong    · the title and amount make the purpose obvious
Confidence    Weak      · fees appear only after choosing a method
Specificity   Adequate  · local payment methods, but a generic card layout

Finding
H-01 (RX-IX-02) · severity 3 · Payment confirmation screen
problem:  no indicator while verification is running
fix:      show status + a time estimate
evidence: scr_demo_001
```

## References

- Rules: `docs/design-rules.md` (Ryux RX-2.0)
- Tools: `search_screens`, `heuristic_eval`, `delivery_gate`, `audit_ui`, `audit_copy`
