# Wallet transaction detail, expressive direction: no skill vs RYUX 2.19.3 + DESIGN.md

A follow-up to [wallet-detail](../wallet-detail/). Same brief, same model. This time the RYUX side's
[`DESIGN.md`](DESIGN.md) asks for a strong visual character and motion that explains what happens to the money.
Three new RYUX runs (B1-B3) are compared with wallet-detail's three no-skill runs (A1-A3), which had no DESIGN.md.

<a href="see-the-difference.mp4"><img src="see-the-difference.gif" alt="Animation: the brief and the two sides; the first reply, where A1 has already built and B1 asks three questions with no specific market as its recommendation; both prototypes played side by side with the same taps on a failed transfer, a completed payment, and a pending transfer, A1 showing an invented fee, a real bank and merchant, and a cancel window, B1 showing where the money is with a dot that travels to the merchant; then totals across all six runs, including what RYUX missed and the cost" width="100%"></a>

Video: [`see-the-difference.mp4`](see-the-difference.mp4). Still: [`see-the-difference.png`](see-the-difference.png).
Shown: A1 and B1, the pair [`PROTOCOL.md`](PROTOCOL.md) fixed before the first run. Both phones play each
prototype's own screens, recorded in Chromium at 390 wide with the same tap script; the finger and captions are
drawn on top, the same way on both sides. Prototype controls are hidden; nothing else is edited.

## What happened

**The direction was built.** All three B runs animate every event DESIGN.md names: rows press down, the detail
pushes in over 240 ms, the amount settles with a spring, sheets rise, a status change animates to the new state,
and a completed payment gets one success moment (B1 an arrival, B2 a burst, B3 a ring). Each run made a
"where the money is" element its signature: a line with a travelling dot (B1, B2) or a money trail (B3), with
the accent kept for money that moved. All three set amounts in a display face (Bricolage Grotesque in B1 and
B2, Archivo in B3) on a dark ink base, and all three switch to fades under `prefers-reduced-motion`.

**What wallet-detail measured held.** Two of three asked before building, both recommending "No specific
market" (the 2.19.3 fix); the reply then set USD. Traps shown as fact: 0, 1, 0, against A's 7, 9, 9. Loading,
load error, and offline in all three, against none in A. B1's final message: "no policies were given, so the copy
promises no times, fees or support channels."

**What RYUX missed.**
- **B2 did not ask.** It built straight away and said so: "I didn't stop to ask your product questions first,
  though the RYUX guidance says to." It listed the questions at the end instead.
- **B2 put Visa on a sample top-up** ("Top-up from Visa ••4821"), after RX-AS-03 in 2.19.3 asks for made-up
  card networks. B1 and B3 use no network ("Debit card ••4417", B3).
- **Loops outside loading, borderline.** B1 pulses and B2 moves a dot while a transaction is pending. DESIGN.md
  says "Nothing loops except loading"; a pending transaction is still in progress, so it is listed here and not
  counted as a failure.
- **No run ran `ryux scan`.** All three declined to download the package without asking. Scans below were run
  after the session.
- **Cost.** $2.48-3.38 per run against $1.57-2.03, and 12-16 minutes against 8-11.
- **Visual quality** is not rated by designers yet. "Built" above means present in the code and on screen, not
  that it is good.

## Per run

| Run | Asked first | Shown as fact, never given | Loading, error, offline | Motion events built (of 6) | Loops outside loading | Display face | `ryux scan`: static · rendered | Cost · minutes |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| A1 | no | 7 | none | not asked | n/a | n/a | 1 · 8 | $1.63 · 8 |
| A2 | no | 9 | none | not asked | n/a | n/a | 5 · 8 | $1.57 · 8 |
| A3 | no | 9 | none | not asked | n/a | n/a | 2 · 31 | $2.03 · 11 |
| B1 | 3 questions | 0 | all three | 6 | pending pulse | Bricolage Grotesque | 1 · 14 | $3.29 · 14 |
| B2 | no | 1: Visa | all three | 6 | pending dot | Bricolage Grotesque | 1 · 6 | $2.48 · 12 |
| B3 | 3 questions | 0 | all three | 6 | none | Archivo | 0 · 4 | $3.38 · 16 |

A1-A3 are wallet-detail's runs, unchanged; their traps are listed there. Motion events: row press, detail push,
amount settle, sheet or banner in, status change, success moment, read from each run's CSS and scripts, and for
B1 also from the recording in the video. Spinners and skeletons loop in every B run and are not counted. B cost
and minutes include the question turn ($0.33 and $0.51). Rendered scans at 320, 390, and 1280: most of B1's 14
are small radio targets in its prototype control panel (11) and ellipsis-truncated row titles read as overlap
(3), neither in the product proper; the scan does not tell them apart yet. Raw output in `runs/<run>-scan.json`.

## Method

- **Brief:** wallet-detail's [`prompt.txt`](../wallet-detail/prompt.txt). Runs that asked got wallet-detail's
  [`reply.txt`](../wallet-detail/reply.txt) once; no other turns.
- **Arms:** B is new: Opus 5.5, `claude -p`, Claude Code 2.1.311, no MCP servers, an empty folder holding this
  DESIGN.md and RYUX 2.19.3, one run at a time; all three loaded RYUX. A is wallet-detail's A1-A3 (Claude Code
  2.1.310, every skill and command off, no DESIGN.md), not rerun. Any difference is RYUX and DESIGN.md together.
- **Scoring:** questions, traps, and copy by hand from the screens, the HTML, and each final message, with
  wallet-detail's [`traps.txt`](../wallet-detail/traps.txt); motion from the code and recordings; scans with
  `ryux scan` 2.19.3. Human scores (visual quality, blind, at least three designers, all six runs): not rated
  yet.

Three new runs against three earlier ones, one brief, one model: what these runs did, not a rate.

## Files

- `runs/<run>.jpg`: the Activity list at 390 wide.
- `runs/<run>-final.md`: the question turn, when there was one, and the final message, local paths removed.
- `runs/<run>-scan.json`: the static and rendered scans.
