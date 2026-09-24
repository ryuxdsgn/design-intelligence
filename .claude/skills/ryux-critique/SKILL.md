---
name: ryux-critique
description: ryux usability review playbook. Gather context, walk screen by screen against ryux-rules (RX-C/RX-H/RX-N/RX-L), assign severity 0-4 with real screen evidence, structure it through heuristic_eval, and close with priorities. Use when critiquing or reviewing UI, a screen, or a flow.
---

# ryux-critique

> How ryux runs a usability review: evidence-based, structured, and not shallow.

This skill guides a review of a screen or flow using **ryux-rules** (`docs/design-rules.md`) and the
`heuristic_eval` tool. The goal is a critique you can act on because it comes with real examples,
not vague comments like "add white space".

## When to use it

- You're asked to review, audit, or critique a UI, screen, or flow.
- Before you consider UI work done (Delivery Gate).

## Principles

1. **Evidence-based.** Every major finding (severity >= 3) must point to at least one real `screen_id` as a comparison. Find it with `search_screens`.
2. **A first pass, not a human replacement.** The result is a fast initial review, not a final usability evaluation.
3. **Concise and prioritized.** Cap the findings (max 12); put the ones that hurt users most first.

## Steps

### 1. Gather context (don't skip)

Settle these first:
- Who the user is (e.g. a warung customer, a new user).
- What task is happening on this screen (e.g. paying with QRIS).
- The platform and the point in the flow.

Without this context, the review turns into taste, not usability.

### 2. Walk screen by screen

For each screen, check against the four ryux-rules layers:
- **RX-C** are there generic UI patterns? bland copy? dishonest content?
- **RX-H** test the 10 heuristics: is status visible? can you cancel (control)? is error prevented? does the error message offer a way out? is contrast and touch target size enough?
- **RX-N** applied UX patterns (NNGroup): feedback that matches response time, forms (labels above, inline validation that keeps input, minimal fields), transparent cost, mistake prevention, wayfinding.
- **RX-L** are the local patterns right? transparent QRIS/VA, fees up front, Rupiah format, natural Bahasa Indonesia.

### 3. Assign severity and a reason

Scale 0 to 4: `0` not a problem · `1` cosmetic · `2` minor · `3` major · `4` catastrophic.
For each finding write: heuristic, location, problem, and a concrete recommendation. The reason is required, not just a label.

### 4. Pull real evidence

For each major finding, find 1 to 3 comparison screens from Indonesian apps with `search_screens`
(e.g. "how F&B apps show payment status"). Cite the `screen_id`.

### 5. Structure it through heuristic_eval

Send all findings to the `heuristic_eval` tool (`task_context` + `findings`). The tool will:
- validate severity and reject major findings without valid evidence,
- cap the number of findings,
- return a summary (catastrophic/major/minor) + PASS/FAIL.

Fix any finding marked `supported: false` before moving on.

### 6. Close with fix priorities

Order them: catastrophic, then major, then minor. For each priority name a concrete fix plus the
reference screen. If you need a release gate, run `delivery_gate` (evidence) and `audit_ui`/`audit_copy` (programmatic checks).

## Don'ts (anti-shallow)

- Don't give a critique with no location and no reason.
- Don't raise severity to major without `screen_id` evidence.
- Don't paste generic recommendations ("modernize", "add white space") without linking them to a real problem.
- Don't invent claims like "app X does this" without a comparison `screen_id`.

## Example finding (short)

```
H-01 · severity 3 · Payment confirmation screen
problem: no indicator while verification is running
fix:     show status + a time estimate
evidence: scr_demo_001
```

## References

- Rules: `docs/design-rules.md` (RX-C / RX-H / RX-N / RX-L)
- Tools: `heuristic_eval`, `search_screens`, `delivery_gate`, `audit_ui`, `audit_copy`
