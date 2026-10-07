# Experiment EN-TD-2.3.3 · Transaction detail

Raw outputs of the benchmark summarized in the [showcase](../../showcase.md#case-01--transaction-detail).
Everything in the run folders is the agents' own output. The only edit: absolute local file paths
were replaced with `[local path]` or a bare file name.

## Experiment card

| | |
| --- | --- |
| Date | 2026-10-06 |
| Prompt (identical for every run) | "Design a transaction detail page for a fintech app, shown after the user pays. Make it in pen.dev." |
| Agent | A Claude Code subagent, a fresh one for every run, the same model for every run (the model name was not recorded) |
| Tool | pen.dev, one shared canvas, runs one after another |
| Changed variable | RYUX 2.3.3 (the repo's `skills/ryux/`), copied into the B run folders only |
| Same in every run | prompt, model, fact sheet, canvas, instructions to ignore the parent project's files |
| ryux MCP | off: no reference screens, so every decision is evidence None |
| Pairs | 3 (A = without RYUX, B = with RYUX) |
| Questions | any question was answered from the fact sheet below; runs that asked nothing never received it |
| Selection for display | the median pair by screen difference; on a tie, the strongest run without RYUX. Every pair had the same difference (1 → 6), so the tie rule picked pair 2 |
| Counted by | the operator, from the outputs |

**Fact sheet** (sent only to runs that asked):

> - Product: a digital wallet app that pays merchants by card and by bank transfer.
> - Users: adults aged 22–40 in large cities, on mobile.
> - Market: a global product in English. The market and the currency are not decided.
> - Platform: mobile, 390 wide.
> - Possible statuses: Completed, Processing, Failed.
> - Transaction data available: merchant name, amount, payment method, time, transaction ID, fee.
> - Actions: Share receipt, Report a problem, Back to home.
> - Brand, design system, which state to show, anything else: not decided.

## Runs

| Run | Output | Reasoning | Questions |
| --- | --- | --- | --- |
| A1 (without) | [output.png](a1/output.png) | [reasoning.md](a1/reasoning.md) | none asked |
| B1 (with) | [output.png](b1/output.png) | [reasoning.md](b1/reasoning.md) | [questions.md](b1/questions.md) |
| A2 (without) | [output.png](a2/output.png) | [reasoning.md](a2/reasoning.md) | none asked |
| B2 (with) | [output.png](b2/output.png) | [reasoning.md](b2/reasoning.md) | [questions.md](b2/questions.md) |
| A3 (without) | [output.png](a3/output.png) | [reasoning.md](a3/reasoning.md) | none asked |
| B3 (with) | [output.png](b3/output.png) | [reasoning.md](b3/reasoning.md) | [questions.md](b3/questions.md) |

## Counts

| Measure | A1 | B1 | A2 | B2 | A3 | B3 |
| --- | --- | --- | --- | --- | --- | --- |
| Questions asked | 0 | 3 | 0 | 3 | 0 | 3 |
| Screens designed | 1 | 6 | 1 | 6 | 1 | 6 |
| Currency | USD, assumed | `[CUR]` | USD, assumed | `[CUR]` | USD, assumed | `[CUR]` |
| Business rule on screen that nobody gave | "pending … up to 1 business day" | none | "Report it within 30 days" | none | none | none |
| Features not in the fact sheet | Save PDF, Category | none | Save PDF, balance, merchant location | none | Split bill, Pay again, Category change, balance, statement descriptor | none |
| Unconfirmed behavior shown on screen, flagged as an assumption | none | "This page updates when the status changes" | none | same | none | same |
| Decision receipts with confidence | none | yes | none | yes | none | yes |
| A section titled Design intent | no | yes | no | no | no | no |
| Examples from one market in the questions | (no questions) | yes | (no questions) | yes | (no questions) | yes |
| Reasoning file length (lines) | 27 | 84 | 29 | 122 | 34 | 158 |

The runs without RYUX received no fact sheet, so "features not in the fact sheet" describes what
they added on their own. It is not a rule they broke.

## Evidence status

- **Observed:** every output, reasoning file and question list above is raw and public.
- **Inferred:** our reading of the counts (for example, that RYUX made uncertainty explicit).
- **Not tested:** visual quality, the model's behavior without RYUX's questions, other models, other
  tools, and real users.

## What we saw go wrong with RYUX

- All three RYUX runs put "This page updates when the status changes" on the Processing screen. Each
  flagged it as an assumption to confirm, but the sentence still ships on the screen.
- B2 shows Total = amount + fee, a rule nobody gave, marked `[CONFIRM]` in its receipt. B1 and B3
  left the Total row out for the same reason.
- Only B1 wrote a section titled Design intent, although RYUX's Design capability asks for one.
- All three RYUX runs offered examples from one market (QRIS, virtual account, Rp) in questions about
  a generic prompt.
- The reasoning files are 3 to 5 times longer with RYUX.
