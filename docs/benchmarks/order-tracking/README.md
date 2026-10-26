# Order tracking: no skill vs RYUX 2.19.0 + DESIGN.md

Six fresh agents built the same working prototype from one brief. Three had no skill (A1-A3), three had RYUX
and a five-line [`DESIGN.md`](DESIGN.md) (B1-B3). The brief left every business policy open: fees, refunds,
late compensation, cancellation, substitutions.

<a href="see-the-difference.gif"><img src="see-the-difference.gif" alt="Animation: the brief and the two arms; the late state with a $5 credit and 'Cancel for free' circled in A1 next to B1's reason and new time; the out-of-stock sheet with a one-minute auto-pick timer and refund timing circled in A1 next to B1's 'Decide later' with no timer; A1's delivered screen with a courier rating next to B1's offline and load-error screens; then totals across all six runs, including what RYUX missed" width="100%"></a>

Still version: [`see-the-difference.png`](see-the-difference.png). Shown: A1 and B1, the pair
[`PROTOCOL.md`](PROTOCOL.md) fixed before the first run. Prototype controls are hidden in the captures; nothing
else is edited.

## What happened

**The no-skill runs filled the open policies with their own.** A $5 credit when an order is late, free
cancellation, a 60- or 90-second timer after which the shopper picks a substitute, refund timing, tips, courier ratings,
and in A2 real brands (Oatly, Alpro). None of it was labeled as an assumption. 25 across three runs.

**The RYUX runs left the policies open and said so.** 2 across three runs. B1: "Left out on purpose: calling the
courier, cancelling the order, compensation for lateness, and fees, because I don't know your policies." Each B
run listed the rules it did have to make up for the prototype to work, and labeled stores, prices, and fees as
sample data on screen.

**Only the RYUX runs built for things going wrong.** Loading, load error, and offline in 3 of 3 B runs, 0 of 3
A runs.

This is why A looks more finished at first glance: more features on screen. Each extra feature is a business
decision nobody made.

**What RYUX missed.** No run asked before building, B included. B2 explained why: "RYUX normally asks you to pick
between two or three directions before building. Because you asked for a working prototype, I picked one and
built it." B1 and B2 still offered calling or messaging the courier as a given. And only the A runs built a
cancelled state; no run built a failed delivery.

## Per run

| Run | Shown as fact, never given ([`traps.txt`](traps.txt)) | Loading, error, offline | `ryux scan`: static · rendered |
| --- | --- | --- | --- |
| A1 | 8: late credit, refund timing, auto-substitution, fees, free cancellation, courier chat, tip, courier rating | none | 9 · 17 |
| A2 | 9: the same kinds, plus real brands | none | 8 · 5 |
| A3 | 8: the same kinds | none | 7 · 19 |
| B1 | 1: messaging the courier | all three | 1 · 7 |
| B2 | 1: calling and messaging the courier | all three | 0 · 5 |
| B3 | 0: messaging is listed under "Assumptions" | all three | 1 · 0 |

The scan columns count findings. Static: 11px text and skipped heading levels in A; one-off colors in both arms
(A 18-31 per run, B 0-15). Rendered, at 320, 390, and 1280 wide: overlapping text and low contrast in A1 and A3;
B1's overlaps are all in its prototype panel at 320. Raw output in `runs/<run>-scan.json`.

**Also checked, no clear split:** all six handle `prefers-reduced-motion`. All six say what happened in the late and
the unavailable state, why, and what to do next, and none jokes; the A runs pair the apology with the invented
credit ("$5.00 credit added to your wallet. No need to ask."). A2 and A3 loop decorative animations on the map;
the B runs loop only spinners and skeletons, as DESIGN.md asks. The B runs define more design tokens (34-56 CSS
custom properties against 16).

## Method

- **Brief:** [`prompt.txt`](prompt.txt). A run that asked first would have got [`reply.txt`](reply.txt); none did.
- **Arms:** Opus 5.5, `claude -p`, no MCP servers, an empty folder each. A ran with every skill turned off. B had
  RYUX 2.19.0 installed in the folder, plus DESIGN.md, which A did not have; motion and tone partly come from
  that file. All three B runs loaded RYUX; no A run had it.
- **Isolation:** global skills moved aside and synced plugins turned off for both arms. B also saw the built-in
  skills every session gets; built-in `design` and `design-sync` were denied.
- **Rerun:** the first B attempt (three runs in parallel) hit the account's session limit before any final
  message. It was discarded and B1-B3 were rerun one at a time from fresh folders. A was not rerun.
- **Scoring:** traps and copy read by hand from the screens and each final message; scans with `ryux scan`
  2.19.0. The scan's RX-CD-09 (24-hour time in Indonesian copy) flagged "6:38 PM" in B 8 times, 7 of them in
  test files; the product is in English, so those are left out.
- **Stacks:** A1 one HTML file; A2, A3, B1, B3 plain HTML, CSS, and JS; B2 Vite, React, and TypeScript with tests.
  A took 10-13 minutes, B 16-17.

Six runs, one brief, one model: what these runs did, not a rate.

## Files

- `runs/<run>.jpg`: the first screen at 390 wide.
- `runs/<run>-final.md`: each run's final message, local paths removed.
- `runs/<run>-scan.json`: the static and rendered scans.
