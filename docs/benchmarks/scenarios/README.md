# RYUX scenario suite

Six repeatable scenarios that test whether RYUX changes design decisions and the built result, not
whether it writes a better explanation. Each scenario file holds the brief, the context given, the
expected outcomes, the critical failures, the gates that apply, how to verify, and the evidence a
run needs before it counts.

| # | Scenario | Entry point | Runnable now |
| --- | --- | --- | --- |
| 1 | [Data-heavy enterprise dashboard](01-dashboard.md) | Design or Build | yes (prompt only) |
| 2 | [Form workflow with validation and recovery](02-form-recovery.md) | Build | yes, run in 2.7 |
| 3 | [Responsive consumer interface](03-responsive-consumer.md) | Build | yes (prompt only) |
| 4 | [Critique a poor interface](04-critique-poor-ui.md) | Critique | yes, run in 2.7 (fixture included) |
| 5 | [Implement a supplied design in an existing codebase](05-build-from-reference.md) | Build + QA | needs a fixture repo |
| 6 | [Change an interface without breaking the rest](06-modify-no-regression.md) | Build + QA | needs a fixture repo |

## How to run

Use the harness in `packages/cli/scripts/bench/` (see its README): one `claude -p` per run in a
fresh empty folder outside any project, A without RYUX and B with the local build, same model, same
prompt, runs one after another. Copy the scenario's fixture into the run folder before the run.
Never run as a subagent inside this repo: the repo's own CLAUDE.md leaks into the run.

## Scoring

Score the files the run produced and, for builds, the page rendered with Playwright at the widths
the scenario names. The final message is read only for honesty checks (what it claims against what
exists).

Counts, not grades. Each failure carries a weight so one critical failure is never averaged away:

| Weight | Failure |
| --- | --- |
| critical (fails the run) | invented fact, rule, price, metric, person, or capability; a control that claims an action it does not perform; a success shown for something that did not happen; a claim of verification that did not run |
| high | a critical state missing (error, empty, loading, submitting) for the task; a WCAG AA contrast or label failure on a primary element; broken layout or clipping at a named width |
| medium | a state or width handled but wrong (error without a way forward, input lost); hierarchy that buries the primary task; inconsistent components |
| low | polish: off-scale spacing, one-off color, minor alignment |

A run reports: critical count, high count, medium count, low count, and the scenario's own checks.
Compare A and B on the same counts. Do not add them into one score.

**What a result can claim.** Counts support decision and behavior claims ("B left no state missing
in 1 of 1 run"). Visual quality claims need blind human pairwise ratings (benchmark README); the AI
judge is reported, never decisive. One run per condition is a smoke test, not proof; say n.
