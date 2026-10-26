# Case TD-2.6 · One screen through RYUX's five steps

> **Historical (RYUX 2.6.2).** Kept as a record, not as evidence for current claims. Current benchmarks are
> listed in [`docs/benchmarks/`](../).

One session of RYUX 2.6.2, five turns, on the transaction detail screen that the agent designed
**without** RYUX in EN-TD-2.3.3 (run A2). Protocol, written before the run: [PROTOCOL.md](PROTOCOL.md).
This is one run, a case study, not a benchmark.
One edit to the raw transcripts: the local MCP connect command quoted from the 2.6.2 skill text in
`run/turn1.jsonl` is replaced with `[local MCP connect command]`.

| Turn | Prompt | Output |
| --- | --- | --- |
| 1 | "Analyze this screen: screen.png. It is a transaction detail screen from a fintech app, shown after the user pays." | [1-analyze.md](1-analyze.md) |
| 2 | "Critique it." | [2-critique.md](2-critique.md) |
| 3 | "Improve it in pen.dev." | [3-design.md](3-design.md), frames in [design/](design/) |
| 4 | "Build it as one HTML and CSS file." | [4-build.md](4-build.md), [run/receipt.html](run/receipt.html) |
| 5 | "QA the build against your design." | [5-qa.md](5-qa.md), renders in [qa/](qa/) |

Input: [input/screen.png](input/screen.png). Full transcripts: `run/turn1.jsonl` to `run/turn5.jsonl`.
`after/` holds our renders of the final `receipt.html` (Chromium, en-US): 390 × 963 (the input's
size, for the before and after view), 390 × 844, 375 × 667 and 320 × 568.

## What it did

- **Analyze:** described the screen, labeled each point Observed or Inferred, listed what is
  unknown, and did not judge it.
- **Critique:** 11 findings, most severe first. The top one, severity 3: only the success version
  exists. It also flagged the "within 30 days" rule as a business rule with no source, and measured
  the outlined borders at about 1.16:1.
- **Design:** four screens in pen.dev (success, pending, failed, loading), each fitting 390 × 844,
  every change tied to a finding, plus a notes frame with behaviour and open questions.
- **Build:** one HTML file with the four states, copy and share behaviour with failure messages,
  rendered at 390, 375 and 320 wide.
- **QA:** compared the build with the pen.dev frames by measuring, fixed 6 differences, re-checked to
  within 0 to 4 px, and listed what it did not test.

## What went wrong

- **It asked nothing.** The fact sheet was never sent, because no question came. So the design kept
  the input's example data and actions (Wallet balance, $24.50, Blue Bottle Coffee) instead of the
  fact sheet's (card and bank transfer, currency not decided).
- **It added two things nobody gave**, both flagged for confirmation but on screen: "Try again" on
  the failed screen, and "Your wallet wasn't charged".
- **A new number:** the failed screen shows "Balance: $200.00", derived from the input
  ($175.50 + $24.50), not given anywhere.
- **The removed "within 30 days" line** was right to go, but the help row now promises nothing
  specific either.
- The build's first date format ("Oct 6") differed from the design ("6 Oct"); QA kept the locale
  approach and fixed mixed-language dates, so the final build shows "Oct 6" for en-US.

## Evidence status

- **Observed:** every turn's output, the transcripts, the pen.dev frames, the HTML, and QA's renders.
- **Inferred:** our reading of what went well and what did not.
- **Not tested:** other models and tools, more runs, Safari or real devices (the run said so too).
