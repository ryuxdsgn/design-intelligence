# Experiment EN-TD-2.4 · Transaction detail, acceptance rerun for RYUX 2.4

The release check for RYUX 2.4. It reruns the transaction-detail benchmark in a clean harness, to
see whether the 2.4 changes keep the 2.3.3 results without regressions. Everything in the run
folders is the agents' own output; the only edit is that absolute local paths were removed.

## Experiment card

| | |
| --- | --- |
| Date | 2026-10-07 |
| Prompt (identical for every run) | "Design a transaction detail page for a fintech app, shown after the user pays. Make it in pen.dev." |
| Harness | headless `claude -p`, one empty folder per run outside any project: no project instructions, no project memory |
| Agent | Claude Code, a fresh session per run, the same model for every run (the model name was not recorded) |
| Changed variable | RYUX at commit `4f7f43a` (the 2.4 content; its header still read 2.3.3 because the version was bumped after this check), copied into the B folders only |
| ryux MCP | off: evidence None for every decision |
| Questions | answered from the fact sheet below, in a second turn; runs that asked nothing never received it |
| Canvas | A1–A3 and B1–B3 on the shared `ryux.pen` canvas; B4–B6 on a new blank canvas |
| Counted by | the operator, from the outputs |

**Fact sheet** (the same as EN-TD-2.3.3):

> - Product: a digital wallet app that pays merchants by card and by bank transfer.
> - Users: adults aged 22–40 in large cities, on mobile.
> - Market: a global product in English. The market and the currency are not decided.
> - Platform: mobile, 390 wide.
> - Possible statuses: Completed, Processing, Failed.
> - Transaction data available: merchant name, amount, payment method, time, transaction ID, fee.
> - Actions: Share receipt, Report a problem, Back to home.
> - Brand, design system, which state to show, anything else: not decided.

**What changed between 2.3.3 and this run.** Two things changed at once: the skill, and the
harness. The 2.3.3 runs ran inside the RYUX repo and picked up its project instructions; these did
not. Read differences from 2.3.3 with that in mind.

## Runs

| Run | Output | Reasoning | Questions |
| --- | --- | --- | --- |
| A1 (without) | [output.png](a1/output.png) | [reasoning.md](a1/reasoning.md) | none asked |
| A2 (without) | [output.png](a2/output.png) | [reasoning.md](a2/reasoning.md) | none asked |
| A3 (without) | [output.png](a3/output.png) | [reasoning.md](a3/reasoning.md) | none asked |
| B1 (with) | [output.png](b1/output.png) | [reasoning.md](b1/reasoning.md) | [questions.md](b1/questions.md) |
| B2 (with) | [output.png](b2/output.png) | [reasoning.md](b2/reasoning.md) | [questions.md](b2/questions.md) |
| B3 (with) | [output.png](b3/output.png) | [reasoning.md](b3/reasoning.md) | [questions.md](b3/questions.md) |
| B4 (with) | [output.png](b4/output.png) | [reasoning.md](b4/reasoning.md) | [questions.md](b4/questions.md) |
| B5 (with) | [output.png](b5/output.png) | [reasoning.md](b5/reasoning.md) | [questions.md](b5/questions.md) |
| B6 (with) | [output.png](b6/output.png) | [reasoning.md](b6/reasoning.md) | [questions.md](b6/questions.md) |

## Counts

| Measure | A1 | A2 | A3 | B1 | B2 | B3 | B4 | B5 | B6 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Questions asked | 0 | 0 | 0 | 3 | 3 | 3 | 3 | 3 | 3 |
| Screens | 1 | 3 (one full, two status variants) | 1 | 6 | 6 | 6 | 6 | 6 | 6 |
| Currency | USD, assumed | Rupiah, from the canvas | USD, assumed | `[CUR]` | "$", labeled as sample | `[CUR]` | `[CUR]` | `[CUR]` | `[CUR]` |
| Business rule on screen that nobody gave | none | "usually within 2 minutes", "No money was taken", "you won't be charged twice" | none | none | none | none | none | none | none |
| Features not in the fact sheet | Save PDF, Pay again, Category | PLN token, Download PDF, Try again, Check status | Download PDF, Category | none | none | none | none | none | none |
| Fee added on top, as a labeled assumption | | | | yes | yes | no Total row | no Total row | yes | no Total row |
| Live-updates line on Processing | | | | yes | yes | yes | yes, flagged | no, listed as a question | yes |
| A design intent | no | no | no | yes | yes | yes | yes | no | yes |
| Examples from one market in the questions | | | | Indonesia and the US | Indonesia only | none | none | none | Indonesia, the US, the EU |
| Reasoning file length (lines) | 32 | 40 | 40 | 76 | 129 | 104 | 134 | 73 | 117 |

## Against the 2.4 acceptance criteria

| Criterion | 2.3.3 (3 runs, old harness) | 2.4 (6 runs, clean harness) |
| --- | --- | --- |
| Questions before designing | 3/3 | 6/6 |
| Six screens | 3/3 | 6/6 |
| No business rule nobody gave, on screen | 3/3 | 6/6 |
| No feature beyond the fact sheet | 3/3 | 6/6 |
| Currency left open as `[CUR]` | 3/3 | 5/6 |
| Examples from only one market | 3/3 | 1/6 |
| A design intent | 1/3 | 5/6 |
| Live-updates line on screen | 3/3 | 5/6 |
| Mean reasoning length | 121 lines | 106 lines |

The one currency miss, B2, used "$" as a labeled stand-in. It ran on the shared canvas, which
already held earlier frames with currencies; the three runs on the blank canvas all kept `[CUR]`.
We count it as a miss anyway.

## Evidence status

- **Observed:** every output, reasoning file and question list above.
- **Inferred:** that the 2.4 wording, not only the cleaner harness, reduced the one-market examples.
  The harness changed too, so this run cannot separate the two. A separate test with the same
  harness for both wordings, asking questions only, gave: 2.3.3 wording 1 of 2 Indonesia-only,
  2.4 wording 0 of 2. Two runs each; those replies are not published.
- **Not tested:** visual quality, other models and tools, real users.

## Harness lessons

- Runs made inside a project pick up its instructions, even when told to ignore them. Run each
  agent in an empty folder outside any project.
- A shared canvas leaks too: A2 chose Rupiah because "the canvas already has Indonesian fintech
  work". Use a fresh canvas per experiment.
- B2, A3 and B3 were interrupted by a usage limit. B2 was resumed in the same session after the
  reset; A3 and B3 were started again from scratch.
