# Wallet transaction detail: no skill vs RYUX 2.19.2 + DESIGN.md

Flagship A, "Think before designing". Six fresh agents got the same brief: a transaction detail screen for a
digital wallet, as one HTML file. Three had no skill (A1-A3), three had RYUX and a short [`DESIGN.md`](DESIGN.md)
(B1-B3). The brief left every money rule open: fees, refunds, disputes, timing, limits, support.

<a href="see-the-difference.gif"><img src="see-the-difference.gif" alt="Animation: the brief and the two arms; the first reply, where A1 has already built and B1 asks three questions (with its Indonesia and IDR default flagged); a failed transfer with a refunded fee and a real bank circled in A1 next to B1's what-happened and next-step copy; A1's pending transfer with an invented cancel window next to B1's offline and load-error screens; then totals across all six runs, including what RYUX missed and the cost per run" width="100%"></a>

Still version: [`see-the-difference.png`](see-the-difference.png). Shown: A1 and B1, the pair
[`PROTOCOL.md`](PROTOCOL.md) fixed before the first run. Prototype controls are hidden in the captures; nothing
else is edited.

## What happened

**The RYUX runs asked first; the no-skill runs built straight away.** Each B run asked three questions before
building, and each question changed the build: which market and currency, what happens to the money when a
payment fails, whether there are fees. No A run asked. Every run that asked got the same
[`reply.txt`](reply.txt): global, English, USD as sample data, no policy decided.

**The no-skill runs filled the open rules with their own.** A $1.50 transfer fee that is refunded on failure,
"within 3 days, we'll step in", "Usually within 1 hour", a cancel window on a pending transfer, a $2,500 limit,
24/7 chat, cashback and points, a promo code, "FDIC-insured up to $250,000", and real banks (Chase, BCA,
Mandiri, BRI). None of it was labeled as an assumption on screen. 25 across three runs.

**The RYUX runs left the rules open and said so.** 3 across three runs, all the same kind: a real card network
on a sample card ("Visa debit •••• 4821"). B1's page: "Fees, refunds, reversals, transfer timing, and support
channels are not decided, so the screen states none of them." Each B final message has an Assumptions list.

**Only the RYUX runs built for the screen itself failing.** Loading, load error, and offline in 3 of 3 B runs,
0 of 3 A runs. Both arms built failed and pending transactions.

**What RYUX missed.**
- **A market bias.** All three B runs proposed Indonesia and IDR as their default for a brief that named no
  market. B2: "RYUX's edge cases are built around Rp amounts." The fixed reply overrode it, so the builds are in
  USD, but an agent that gets "go with defaults" would ship a Rupiah wallet. A2 picked Indonesia on its own too.
  Fixed in 2.19.3 (RX-PR-05, Design stage 1, Build step 2): in two turn-1 checks on this brief, both runs
  recommended "No specific market" and listed Indonesia as one option. The runs above stay as they were.
- **Real brands.** B1, B2, and B3 all show Visa; B2 also Mastercard and Blue Bottle Coffee. RX-AS-03 in 2.19.3
  now asks for made-up merchants, banks, and card networks; not rerun yet.
- **Coverage.** B2 left out the refunded state on purpose ("not decided"), so its matrix is thinner than A1's.
- **Cost.** B costs more: $2.21-2.33 per run against $1.57-2.03, and B3 took 22 minutes for its build turn.
- **Scan noise.** Most of B's rendered findings sit in the prototype control panels (small radio targets,
  labels at 320), not in the product. The scan does not tell them apart yet.

## Per run

| Run | Asked first | Shown as fact, never given ([`traps.txt`](traps.txt)) | Statuses built (payment · transfer · top-up) | Loading, error, offline | `ryux scan`: static · rendered | Cost · minutes |
| --- | --- | --- | --- | --- | --- | --- |
| A1 | no | 7: fee, refund incl. fee, dispute timing, arrival time, cancel window, 24/7 chat, real brands (Chase, Visa, Mastercard, Uniqlo, Blue Bottle) | C P F R · C P F · C P F | none | 1 · 8 | $1.63 · 8 |
| A2 | no | 9: service fee, refund policy, dispute timing, points, promo code, arrival time, cancel top-up, 24/7 chat, real banks (BCA, Mandiri, BRI) | C F R · C P F · C P F | none | 5 · 8 | $1.57 · 8 |
| A3 | no | 9: free transfers, refund timing, cashback, arrival time, cancel transfer, $2,500 limit, chat support, Visa, "FDIC-insured up to $250,000" | C F R · C P F · C P F | none | 2 · 31 | $2.03 · 11 |
| B1 | 3 questions | 1: Visa | C P F R · C P F R · C P F | all three | 1 · 12 | $2.28 · 12 |
| B2 | 3 questions | 1: Visa, Mastercard, Blue Bottle Coffee | C F · C P F · C F | all three | 1 · 35 | $2.21 · 12 |
| B3 | 3 questions | 1: Visa | C P F R · C P F R · C P F R | all three | 1 · 8 | $2.33 · 22 |

C completed, P pending or processing, F failed, R refunded or reversed (partly refunded in A1). B cost and
minutes include the question turn. Corrected 2026-10-28: costs first published here added the question
turn twice ($2.50-2.80); a resumed session already reports its total. The scan columns count findings, at 320, 390, and 1280 wide for
the rendered one: low contrast in product UI in all three A runs and A3's overlapping text; for B, target-size
and overlap findings in the prototype panels, plus one product overlap in B1 (a long merchant name). A2's static
findings include three Rupiah format checks (RX-CD-02). Raw output in `runs/<run>-scan.json`.

**Borderline, kept out of the count:** B3 shows a "$0.00" fee row; its final message and code call it a value in
the sample record, not a fee policy. A3's final message says "Everything is invented (brands, money, dates)" but
the screens do not; its policies are counted.

**Also checked, no clear split:** all six handle `prefers-reduced-motion`. In the failed states all six say what
happened and what to do next, and none jokes; the A runs pair it with an invented rule ("Your $300.00 and the
$1.50 fee are back in your balance").

## Method

- **Brief:** [`prompt.txt`](prompt.txt). Runs that asked got [`reply.txt`](reply.txt) once; no other turns.
- **Arms:** Opus 5.5, `claude -p`, no MCP servers, an empty folder each, one at a time. A ran with every skill
  and command turned off. B had RYUX 2.19.2 installed in the folder, plus DESIGN.md, which A did not have. All
  three B runs loaded RYUX; no A run had it. A probe per arm confirmed this before the first run.
- **Isolation:** global skills moved aside and synced plugins turned off for both arms
  (`packages/cli/scripts/bench/run.sh`, `turn2.sh`).
- **Scoring:** questions, traps, and copy read by hand from the screens, the HTML, and each final message; scans
  with `ryux scan` 2.19.2. Human scores (UX correctness, Context understanding) from at least three blind
  raters: not rated yet.
- **Stacks:** one HTML file each, as asked.

Six runs, one brief, one model: what these runs did, not a rate.

## Files

- `runs/<run>.jpg`: the first screen at 390 wide.
- `runs/<run>-final.md`: each run's final message, local paths removed.
- `runs/<run>-scan.json`: the static and rendered scans.
