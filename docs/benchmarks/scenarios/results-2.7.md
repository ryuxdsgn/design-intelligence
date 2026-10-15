# Scenario results, RYUX 2.7.0 (2026-10-15)

Two scenarios, one run per condition (n=1 each: a smoke test, not proof). Harness:
`packages/cli/scripts/bench/run.sh`, `claude -p` with claude-opus-5-5, fresh folders outside any
project, global RYUX moved aside. A = no RYUX. B = this 2.7.0 build. Both runs saw the same user-level
setup (other global skills, global CLAUDE.md), so it is a shared confound, not a difference.
No visual-quality claim is made (no human raters).

## Scenario 4: critique a poor interface

| Check | A (no RYUX) | B (RYUX 2.7.0) |
| --- | --- | --- |
| Rendered the page before judging | no (read the source only) | yes, Playwright at 390 and 320 |
| Planted defects found (K1–K11) | 11 / 11 | 11 / 11 |
| K1, K2, K4, K5, K6 ranked as top issues | yes (in prose order; no severities) | yes, severity 3–4 |
| Higher layers before visual | yes | yes (C-01 flow … C-07 nested cards) |
| Findings with severity + confidence + status | 0 | 7 / 7 |
| Findings with a "Verify by" | 0 | 3 / 7 (C-01–C-03 only) |
| Real defects beyond the key | 1 (summary hard-coded, not tied to the input) | 3 (the same, input border 1.2:1 under WCAG 1.4.11, clipping and wrapping at 320) |
| False findings / preferences as defects | 0 | 0 |
| Generic advice | 0 | 0 |
| Honesty slips | none | "VISUAL QA PASS" inside a critique (the area is about a build matching its design); one vague rule ref "RX-IX (show the cost…)" in place of RX-IX-05; "compliance risk" stated without a source |

Reading: the baseline model already finds every planted defect on a page this obvious; recall is
not where RYUX adds value here. RYUX's difference is the evidence: it rendered the page, found the
defects you only see on screen (320 clipping, border contrast), and gave every finding a severity,
confidence, and status. Gap: "Verify by" was given for 3 of 7 findings, not all.

## Scenario 2: form with validation and recovery

Checked with Playwright by the reviewer (not the runs' own claims): empty submit at 390 and 1280,
and the "email already used" path at 390.

| Check | A (no RYUX) | B (RYUX 2.7.0) |
| --- | --- | --- |
| Labels on all 5 fields / horizontal scroll at 390 | 5/5 / none | 5/5 / none |
| Empty submit: errors on all 5, focus on first | yes | yes |
| Error summary announced (role=alert / aria-live) | no | yes ("5 fields need attention.") |
| Submitting: button disabled, label changes | yes | yes |
| Email already used: field error, focus on email, data kept | yes | yes |
| Server failure with retry keeping data (run's own claim) | claimed, not re-checked | claimed, not re-checked |
| Invented facts or rules shown as real | 3: "Before tax" hint, "USD" shown as the currency, a 5–34 character bank account rule | 0 (no currency shown; asked about tax and start-date rules instead) |
| Controls that lead nowhere real | Back and Cancel to an Employees list that does not exist (they show a notice) | none (only "Add another employee") |
| Delivery Gate / verification report | prose; says what it tested | Delivery Gate, every area with its tool; FINAL PASS "not tested with users or on real phones" |

Weighted (README rubric): A has 3 critical-weight inventions (rules or facts the brief did not
give), B has 0. Both built working, accessible forms; the difference is what each made up.
Side note: B wrote its QA script to /tmp outside the run folder.

## What this does and does not show

- Shows (n=1): with RYUX, critiques render before judging and carry per-finding evidence; builds
  invent fewer rules and report verification per area.
- Does not show: better visual quality (needs human raters), stable behavior (needs repeats), or
  value on scenarios 1, 3, 5, 6 (not run).
