# Billing page in an existing repo: no skill vs RYUX 2.19.3 + DESIGN.md

Flagship C, "Design that survives delivery". Six fresh agents got the same small React + TypeScript app
([`fixture/`](fixture/): design tokens, seven shared components, a fake API, tests, a low-fi wireframe) and the same
request: add a Billing page. Three had no skill (A1-A3), three had RYUX and a short [`DESIGN.md`](DESIGN.md)
(B1-B3). The repo says nothing about what happens after a failed payment.

<a href="https://github.com/ryuxdsgn/design-intelligence/releases/download/media/benchmarks--billing-dashboard--see-the-difference.gif"><img src="https://github.com/ryuxdsgn/design-intelligence/releases/download/media/benchmarks--billing-dashboard--see-the-difference.gif" alt="Animation: the brief and the two arms; the failed-payment state at 390 wide with 'to keep your plan active' and a period ending 'Nov 1' circled in A1, next to B1's what-happened copy and a period ending Oct 31; how each run checked its work, A1 by tests only and B1 with browser screenshots of every scenario; then totals across all six runs, including where the arms were the same and the cost" width="100%"></a>

Still version: [`see-the-difference.png`](https://github.com/ryuxdsgn/design-intelligence/releases/download/media/benchmarks--billing-dashboard--see-the-difference.png). Shown: A1 and B1, the pair
[`PROTOCOL.md`](PROTOCOL.md) fixed before the first run. Nothing in the captures is edited.

## What happened

**On the code, the two arms were the same.** All six runs passed typecheck, tests, and build; imported all seven
shared components; added no color, font-size, or spacing literal outside the tokens; added one `Meter` component
for the usage bars (the repo had none); and reached every scenario the fake API offers: loading, load error with
retry, failed payment, over a limit, no card and no invoices. `ryux scan` found nothing in any run, in the source
or on the rendered page at 320, 390, and 1280, and no page logged a console error. A repo with clear conventions
carried the code in both arms.

**The no-skill runs still filled the open billing rule.** A1: "Update your payment method to keep your plan
active." A2: "to keep your workspace active." A3: "so your workspace stays active", plus four buttons ("Change
plan", "Update card", "Add payment method", "Update payment method") that do nothing, because the API cannot do
those things. A3's final message says so; the screen does not. 4 across three runs. No B run did either; all
three left the buttons out and said why ("a button that does nothing would be worse", B2).

**Only the RYUX runs looked at the page before calling it done.** All three B runs took browser screenshots of
the scenarios at several widths. All three A runs said they had not ("I haven't opened it in a browser, so I
haven't checked how it looks", A1).

**Also found, outside the locked counts:** the API's billing period ends at `23:59:59Z`. A1 and A2 format it in the
viewer's time zone, so the period reads "Oct 1 – Nov 1" on this machine (UTC+7) and would start "Sep 30" west of
UTC. A3 and all three B runs kept billing dates in UTC and said so.

**What RYUX did not change, or cost.**
- **No run asked first**, B included. With a wireframe, DESIGN.md, and a repo, RYUX treats the design as given and
  builds; the open rule was handled by leaving it out, not by asking.
- **Tests:** B moved page logic into a small module with its own tests (9 cases in new files per run against 5),
  but A's page tests covered the same scenarios.
- **Cost:** B cost about three times as much ($1.02-1.30 per run against $0.37-0.43) and took 4-6 minutes
  against 2.
- **Shared code:** B1-B3 also changed shared components or styles for the whole app (no wrapping in buttons and
  table cells, a keyboard-reachable table scroll area). Each said so, but it is a wider change than the request.
- **Narrow screens:** at 320 the nav's Billing link sits partly off screen in every run, inside the fixture's
  scrollable nav; no run changed that.

## Per run

| Run | Shown as fact, never given ([`traps.txt`](traps.txt)) | Billing dates | Checked in a browser | Checks | New test cases | Cost · minutes |
| --- | --- | --- | --- | --- | --- | --- |
| A1 | 1: plan stops if not paid | off by a day | no | pass | 5 | $0.37 · 2 |
| A2 | 1: workspace stops if not paid | off by a day | no | pass | 5 | $0.37 · 2 |
| A3 | 2: workspace stops if not paid; four buttons with no action | UTC | no | pass | 5 | $0.43 · 2 |
| B1 | 0 | UTC | yes | pass | 9 | $1.30 · 6 |
| B2 | 0 | UTC | yes | pass | 9 | $1.02 · 4 |
| B3 | 0 | UTC | yes | pass | 9 | $1.27 · 6 |

Same in every run, so left out of the table: seven of seven shared components imported, zero one-off values,
zero `ryux scan` findings (static and rendered), zero console errors, all six scenarios reachable. Checks are
typecheck, tests, and build, run after each session. New test cases count `test(` in added test files. Raw output
in `runs/<run>-measure.json`; each run's full change in `runs/<run>.diff`.

## Method

- **Brief:** [`prompt.txt`](prompt.txt). A run that asked first would have got [`reply.txt`](reply.txt); none did.
- **Arms:** Opus 5.5, `claude -p`, no MCP servers, one at a time. Each run started from a copy of the fixture with
  dependencies installed and one commit (`BENCH_FIXTURE`, `packages/cli/scripts/bench/run.sh`). A ran with every
  skill and command turned off. B had RYUX 2.19.3 installed in the copy, plus DESIGN.md, which A did not have.
  All three B runs loaded RYUX; no A run had it. A probe per arm confirmed this before the first run.
- **Scoring:** [`measure.py`](measure.py) for checks, reuse, literals, and tests, from each run's `git diff`;
  traps, dates, and copy read by hand from the screens, the diff, and the final message; `ryux scan` 2.19.3 on
  `src` and on the built page in four scenarios; Playwright for console errors and sideways scroll in all six
  scenarios at 320, 390, and 1280. The date finding was not in the protocol's list and is reported apart.
- **Human scores:** visual quality, blind, from at least three designers: not rated yet.

Six runs, one repo, one brief, one model: what these runs did, not a rate.

## Files

- `fixture/`: the repo every run started from.
- `runs/<run>.diff`: everything the run changed under `src`.
- `runs/<run>-default.jpg`, `runs/<run>-payment-failed.jpg`: the page at 390 wide.
- `runs/<run>-final.md`: each run's final message, local paths removed.
- `runs/<run>-measure.json`: `measure.py`, both scans, console errors, and sideways scroll per scenario.
