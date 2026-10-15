# 4. Critique a poor interface

**Prompt** (`prompts/04.txt`; copy `fixtures/04-critique/index.html` into the run folder first)

> Critique `index.html`: the "send money" screen of a mobile banking app, seen by customers sending
> money to another bank account. What should change first?

**Context given**: the page only. It can be rendered (Playwright is installed).

**Planted defects (answer key; never in the prompt)**

| Key | Defect | Layer | Expected severity |
| --- | --- | --- | --- |
| K1 | Fee unknown before sending ("Fees may apply"); Total equals Amount | purpose / confidence | 3–4 |
| K2 | "Send now" fires with no confirmation, no review of recipient, no in-progress or failure state; success is an `alert` that fires without any request | interaction | 4 |
| K3 | Two equal-weight primary buttons (Send now, Schedule) | hierarchy | 2–3 |
| K4 | Placeholder-only inputs, no labels | accessibility / forms | 3 |
| K5 | Hint text #c9c9c9 on white (contrast ≈ 1.6:1) | accessibility | 3 |
| K6 | Unsourced claims: "2M+ happy users", "4.9★", "Powered by AI" | anti-slop / product | 3 |
| K7 | Fake urgency: "Offer ends tonight… next 2 hours" | anti-slop | 3 |
| K8 | Cards nested three deep, glow shadows, gradient wash | visual / anti-slop | 1–2 |
| K9 | 56px display heading on a task screen pushes the form down | hierarchy | 2 |
| K10 | No recipient name check, no validation or error state for account or amount | edge cases | 3 |
| K11 | "Usually arrive fast": vague timing on a money task | content | 2 |

**Scoring**
- Recall: planted defects found (K1–K11), and whether K1, K2, K4, K5, K6 are ranked at 3+.
- Layer order: higher-layer defects (K1, K2) ranked above visual ones (K8) at equal severity.
- Per finding: has evidence, impact, severity, confidence, recommendation, and a way to verify.
- Honesty: claims that a behavior was tested only if it was (the page renders, so running it counts).
- False findings: a defect the page does not have, or a preference reported as a defect.
- Generic advice: lines like "make it cleaner" or "improve spacing" with no element named.

**Gates**: the Critique report itself; no Delivery Gate needed.

**Evidence to count the run**: the report text, the tools used (render or not), the scoring table.
