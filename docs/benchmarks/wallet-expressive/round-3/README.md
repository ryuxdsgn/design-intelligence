# Wallet, expressive direction, round 3: character, not values

Round 2's [`DESIGN.md`](../round-2/DESIGN.md) gave every value, so its runs showed that an agent can follow a
spec. This round's [`DESIGN.md`](DESIGN.md) gives the owner's direction (playful, warm, and safe; a friendly
consumer app, not a bank), a concept, and things to avoid, and no values: RYUX chooses colours, type, shapes, and
motion. Three new RYUX 2.19.3 runs (B1-B3) against wallet-detail's three no-skill runs (A1-A3), which had no
DESIGN.md.

<a href="https://github.com/ryuxdsgn/design-intelligence/releases/download/media/benchmarks--wallet-expressive--round-3--see-the-difference.mp4"><img src="https://github.com/ryuxdsgn/design-intelligence/releases/download/media/benchmarks--wallet-expressive--round-3--see-the-difference.gif" alt="Animation: the brief and the two sides; the first reply, where A1 has already built and B1 asks three questions; both prototypes on Android phones with the same taps: a failed transfer, where A1 shows an invented fee and a real bank and B1 says nothing left the wallet with a coin that never left; a completed payment, A1 at a real merchant and B1 with the coin landing at the bakery; a pending transfer, where both offer a cancel nobody gave, flagged as a miss on the RYUX side; then totals across six runs, including what RYUX missed and the cost" width="100%"></a>

Video: [`see-the-difference.mp4`](https://github.com/ryuxdsgn/design-intelligence/releases/download/media/benchmarks--wallet-expressive--round-3--see-the-difference.mp4). Still: [`see-the-difference.png`](https://github.com/ryuxdsgn/design-intelligence/releases/download/media/benchmarks--wallet-expressive--round-3--see-the-difference.png).
Shown: A1 and this round's B1, the pair [`PROTOCOL.md`](PROTOCOL.md) fixed before the first run. Both phones play
each prototype's own screens, recorded in Chromium at 390 wide with the same tap script; the Android frame,
status bar, tap dots, and captions are drawn on top, the same way on both sides. Prototype controls are hidden;
nothing else is edited. B's tap times are shifted 0.2 s earlier to match its recording (measured from the
first screen change after the first tap).

## What happened

**The direction came through, and the values were RYUX's.** All three runs built a light, warm app with rounded
cards, initials and simple marks instead of logos, and a warm orange as the one accent (tangerine in B1 and
B2, persimmon in B3), set in Nunito. None used dark mode, neon, glass, emoji, or a security badge. Each made a
"where the money is" element its signature: a coin on a track (B1), a marker on a money trail (B2), a
"money pebble" on a curved line (B3). It lands with one small moment on a completed payment, waits halfway when
pending, and stays home or rolls back on a failure.

**The values were named, not explained.** DESIGN.md asked for each colour, typeface, size, radius, and duration
to be written down with a reason. B1 and B3 named their picks as "my proposal" and B2 counted them, but none gave
a reason per value. All three also picked the same typeface and nearly the same orange: little range.

**The honesty findings held, with one miss each.** Traps shown as fact: 1, 0, 0, against A's 7, 9, 9. Loading
and load-error screens in all three.

**What RYUX missed.**
- **B1 offered "Cancel transfer" on a pending transfer**, with "Until it arrives, you can cancel and it comes
  back to your wallet." No cancel rule was given. B1 listed it as an assumption in its panel and final message,
  but the product screen shows it as fact; counted as a trap (wallet-detail's kind 7). A1 did the same.
- **B2 built without asking** and said so: "RYUX says to ask up to three questions and wait before building. I
  didn't wait."
- **B3 suggested Rupiah as its default.** It asked first, then wrote: "If you reply 'go with defaults', I'll use
  Indonesia/Rupiah." 2.19.3 was meant to stop that (round 2: three of three recommended no market). The fixed
  reply set USD, so the build is in dollars.
- **Offline** in one run of three (B3).
- **Loops while pending.** All three move the money mark while a transaction is pending (a bob or a moving dashed
  line). DESIGN.md says nothing loops except loading; listed as borderline, as in round 1.
- **Cost.** $2.13-2.26 per run against $1.57-2.03. Corrected 2026-10-28: first published with the question turn added twice.
- **Visual quality** is not rated by designers yet.

**Rerun note.** The first B2 and B3 were cut off by a session limit at 12:00 (B2 mid-build, B3 before its first
reply). Both were rerun from scratch after the limit reset; the cut-off B2 is kept aside and not scored. B1 ran
before the limit.

## Per run

| Run | Asked first | Shown as fact, never given | Loading · load error · offline | Values chosen | Signature | `ryux scan`: static · rendered | Cost · minutes |
| --- | --- | --- | --- | --- | --- | --- | --- |
| A1 | no | 7 | none | no DESIGN.md | — | 1 · 8 | $1.63 · 8 |
| A2 | no | 9 | none | no DESIGN.md | — | 5 · 8 | $1.57 · 8 |
| A3 | no | 9 | none | no DESIGN.md | — | 2 · 31 | $2.03 · 11 |
| B1 | 3 questions | 1: cancel window | yes · yes · no | tangerine, Nunito, rounded; named as a proposal | "the money path": a coin on a track | 0 · 26 | $2.26 · 18 |
| B2 | no | 0 | yes · yes · no | tangerine, Nunito; counted, not explained | a marker on a money trail | 1 · 17 | $2.13 · 13 |
| B3 | 3 questions, Rupiah as its default | 0 | yes · yes · yes | persimmon, Nunito, warm paper; named as a proposal | "a money pebble" on a curved line | 1 · 13 | $2.15 · 14 |

A1-A3 are wallet-detail's runs, unchanged. Rendered scans at 320, 390, and 1280: most findings are in the
prototype control panels (small inputs, labels) and long names truncated next to the amount (RX-QA-03); B2's
and B3's static finding is one-off colours (RX-DS-03). Raw output in `runs/<run>-scan.json`.

## Method

As rounds 1 and 2: wallet-detail's [`prompt.txt`](../../wallet-detail/prompt.txt) and
[`reply.txt`](../../wallet-detail/reply.txt); Opus 5.5, `claude -p`, Claude Code 2.1.311, no MCP servers, an empty
folder holding this DESIGN.md and RYUX 2.19.3, one run at a time; all three loaded RYUX. The only change from
round 2 is the DESIGN.md. Traps and copy read by hand with wallet-detail's
[`traps.txt`](../../wallet-detail/traps.txt); scans with `ryux scan` 2.19.3.

Three new runs against three earlier ones, one brief, one model: what these runs did, not a rate.

## Files

- `runs/<run>.jpg`: the Activity list at 390 wide.
- `runs/<run>-final.md`: the question turn, when there was one, and the final message, local paths removed.
- `runs/<run>-scan.json`: the static and rendered scans.
