# Wallet, expressive direction, round 2: a full visual language in DESIGN.md

Round 1's [`DESIGN.md`](../DESIGN.md) described the look in words, and the screens stayed close to a plain list.
This round's [`DESIGN.md`](DESIGN.md) gives the visual language a team would hand over: colour roles with
values, two typefaces and a type scale, shape and depth, a signature (a perforated receipt sheet and a money
path), and motion specs with durations. Three new RYUX 2.19.3 runs (B1-B3) against wallet-detail's three no-skill
runs (A1-A3), which had no DESIGN.md.

**Next:** [round 3](../round-3/) gives character and concept but no values.

<a href="https://github.com/ryuxdsgn/design-intelligence/releases/download/media/benchmarks--wallet-expressive--round-2--see-the-difference.mp4"><img src="https://github.com/ryuxdsgn/design-intelligence/releases/download/media/benchmarks--wallet-expressive--round-2--see-the-difference.gif" alt="Animation: the brief and the two sides; the first reply, where A1 has already built and B1 asks three questions with no specific market as its recommendation; both prototypes played side by side with the same taps: a failed transfer, where A1 shows an invented fee and a real bank and B1 shows money coming back on a lime money path above a perforated cream receipt; a completed payment, A1 at a real merchant and B1 with the path reaching the merchant; a pending payment; then totals across all six runs, including what RYUX missed and the cost" width="100%"></a>

Video: [`see-the-difference.mp4`](https://github.com/ryuxdsgn/design-intelligence/releases/download/media/benchmarks--wallet-expressive--round-2--see-the-difference.mp4). Still: [`see-the-difference.png`](https://github.com/ryuxdsgn/design-intelligence/releases/download/media/benchmarks--wallet-expressive--round-2--see-the-difference.png).
Shown: A1 and this round's B1, the pair [`PROTOCOL.md`](PROTOCOL.md) fixed before the first run. Both phones play
each prototype's own screens, recorded in Chromium at 390 wide with the same tap script; the finger and captions
are drawn on top. Prototype controls are hidden; nothing else is edited. The pending step opens a pending payment
on the B side (B1 has no pending transfer in its list) and a pending transfer on the A side.

## What happened

**The visual language was followed.** All three runs use the night-ink base, the cream receipt sheet with a
perforated edge, Unbounded for amounts (B1 also raises the currency sign as asked; B2 and B3 do not), Inter for text, the `volt` accent for the
money path and the one primary button, category-tinted tiles with no logos, and a paper grain. All three draw
the money path from source to where the money is now, break it on a failure, and show the way back on a return (a curve in B1 and B2, a dashed line in B3). The
spec's motion values appear in all three (240 ms push, the `cubic-bezier(.2,.8,.2,1)` curve, a spring on the
amount, 420 ms path draw, 280 ms sheet, a 600 ms success ring), with `prefers-reduced-motion` handled; only
spinners and skeletons loop. B2 moved the primary button to a bottom bar and said why: "The lime button on
cream paper has almost no visible edge."

**What wallet-detail measured held, and asking improved.** All three asked before building (round 1: two of
three), each recommending "No specific market". Traps shown as fact: 0, 1, 0, against A's 7, 9, 9. Loading and
load-error screens in all three.

**What RYUX missed.**
- **Real card networks again.** B2 shows "Visa •••• 4821" and "Mastercard •••• 1907" on sample top-ups while its
  final message says "All names, cards and IDs are sample data". RX-AS-03 asks for made-up networks; B2 missed it
  in both rounds.
- **Offline.** Only B1 built an offline state. B2 and B3 show a load error that mentions the connection, with
  retry, but no offline screen with saved data; round 1 had offline in all three.
- **Added colours.** Each run added a few colours outside the given roles (B1 5, B2 7, B3 4, mostly darker
  backdrops and paper shades), and each static scan flags them (RX-DS-03). B1 named its one addition, a field
  border, and why.
- **No run ran `ryux scan`.** All three were blocked from downloading the package; scans below ran after the
  session.
- **Cost.** $2.06-2.89 per run against $1.57-2.03; B3 took 23 minutes. Corrected 2026-10-28: first published with the question turn added twice.
- **Visual quality** is not rated by designers yet.

**Our spec caused some findings.** The rendered scans flag 11 px group labels and, in B1, a 10 px currency sign at 320
wide (RX-A11Y-02). DESIGN.md asked for 11/14 caps labels and a currency sign at 60% size; the runs followed it.
The spec should have set 12 px as a floor.

## Per run

| Run | Asked first | Shown as fact, never given | Loading · load error · offline | Spec followed: colours, type, sheet, path, motion values | Added colours | `ryux scan`: static · rendered | Cost · minutes |
| --- | --- | --- | --- | --- | --- | --- | --- |
| A1 | no | 7 | none | no DESIGN.md | n/a | 1 · 8 | $1.63 · 8 |
| A2 | no | 9 | none | no DESIGN.md | n/a | 5 · 8 | $1.57 · 8 |
| A3 | no | 9 | none | no DESIGN.md | n/a | 2 · 31 | $2.03 · 11 |
| B1 | 3 questions | 0 | yes · yes · yes | all | 5 | 1 · 19 | $2.42 · 14 |
| B2 | 3 questions | 1: Visa, Mastercard | yes · yes · no | all but the raised currency sign; primary button moved to a bottom bar, with a reason | 7 | 1 · 21 | $2.06 · 12 |
| B3 | 3 questions | 0 | yes · yes · no | all but the raised currency sign | 4 | 1 · 6 | $2.89 · 23 |

A1-A3 are wallet-detail's runs, unchanged; their traps are listed there. "Spec followed" is read from each run's
code and screens: the colour values, both typefaces, the perforated sheet and grain, the money path, and the motion
durations and curves listed above. Rendered scans at 320, 390, and 1280: most findings are the prototype panels'
small inputs (B1 12, B2 15, B3 1) and the spec's small labels (above); the rest are long names truncated next to
the amount (RX-QA-03, 1-3 per run). Raw output in `runs/<run>-scan.json`. B3's "Bluebird Coffee" is a common café
name, not a chain, and is not counted.

## Method

As round 1 ([`../README.md`](../README.md)): wallet-detail's [`prompt.txt`](../../wallet-detail/prompt.txt) and
[`reply.txt`](../../wallet-detail/reply.txt); Opus 5.5, `claude -p`, Claude Code 2.1.311, no MCP servers, an empty
folder holding this DESIGN.md and RYUX 2.19.3, one run at a time; all three loaded RYUX. The only change from round
1 is the DESIGN.md. Traps and copy read by hand with wallet-detail's [`traps.txt`](../../wallet-detail/traps.txt);
scans with `ryux scan` 2.19.3.

Three new runs against three earlier ones, one brief, one model: what these runs did, not a rate.

## Files

- `runs/<run>.jpg`: the Activity list at 390 wide.
- `runs/<run>-final.md`: the question turn and the final message, local paths removed.
- `runs/<run>-scan.json`: the static and rendered scans.
