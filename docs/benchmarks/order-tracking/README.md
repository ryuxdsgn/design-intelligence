# Order tracking: no skill vs RYUX 2.19.0 + DESIGN.md

One brief for a working web prototype, six fresh agents: three with no skill (A), three with RYUX 2.19.0 and a
five-line `DESIGN.md` (B). Opus 5.5, `claude -p`, no MCP servers, each run in an empty folder. What is counted,
and which pair is shown (run 1 of each arm), was fixed in [`PROTOCOL.md`](PROTOCOL.md) before the first run.
B gets DESIGN.md and A does not, so motion and voice differences partly come from that file.

| A1, no skill | B1, RYUX + DESIGN.md |
| --- | --- |
| <img src="runs/A1.jpg" alt="A1 at 390 wide: a map with a dotted route, an arrival card at 2:34 PM, a shopper card with a 4.9 star rating, chat and call buttons, and an item list with 'If unavailable: best match' under each item" width="300"> | <img src="runs/B1.jpg" alt="B1 at 390 wide: store name, a large 25 min estimate with an arrival range, 'Your shopper is picking your items', a four-step progress bar, an order row, and a 'Get help with this order' button" width="300"> |

First screen at 390 wide, 2.5 seconds after load. Visual quality is not scored.

## The brief

[`prompt.txt`](prompt.txt):

> Build an order tracking experience for a food and grocery delivery app as a working web prototype, mobile
> first: the order status from placed to delivered, what the customer sees when the order is running late, and
> what happens when an item is unavailable. Flow inspiration: delivery and ride-hailing apps.

A run that asked first would get [`reply.txt`](reply.txt). No run asked, so no run got a second turn.

## Results

| Run | Asked first | Shown as fact, never given ([`traps.txt`](traps.txt)) | Static scan | Render scan (320, 390, 1280) |
| --- | --- | --- | --- | --- |
| A1 | No | 8: late credit, refund, auto-substitution, fees, free-cancel window, courier chat, tip, courier rating | 9 | 17 (8 overlaps, 6 contrast, 3 small text) |
| A2 | No | 9: the same kinds as A1, plus real brands (Oatly, Alpro) | 8 | 5 (small text and targets) |
| A3 | No | 8: the same kinds as A1 | 7 | 19 (9 small text and targets, 6 contrast, 4 overlaps) |
| B1 | No | 1: messaging the courier (the chat says messages stay on the device, but not that the feature is an assumption) | 1 | 7 (overlaps at 320, all with the prototype panel) |
| B2 | No | 1: calling and messaging the courier | 0 | 5 (small inputs under 24px at 1280) |
| B3 | No | 0 (messaging is listed under "Assumptions") | 1 | 0 |

Totals: A 25 trap kinds across three runs, B 2. Every A run turned the open policies into product rules: a $5
credit when late, free or full-refund cancellation, a 60 or 90 second timer after which the shopper applies a
saved substitution, tips, and star ratings, with none of them labeled as an assumption on screen or in the final message. Every B run
listed the rules it had to make up, said what it left out (calling, cancelling, late compensation, refund timing)
because the policy was not given, and labeled all stores, prices, and fees as sample data on screen.

Neither arm asked first. The brief asks for a working prototype, and B2 says so in its final message: "RYUX
normally asks you to pick between two or three directions before building. Because you asked for a working
prototype, I picked one and built it."

### States, copy, motion, design system

| | A1 | A2 | A3 | B1 | B2 | B3 |
| --- | --- | --- | --- | --- | --- | --- |
| Loading, load error, offline | none | none | none | all three | all three | all three |
| Cancelled | yes | yes | yes | no | no | no |
| Failed delivery | no | no | no | no | no | no |
| `prefers-reduced-motion` | yes | yes | yes | yes | yes | yes |
| Endless decorative loops | none (one spinner) | map pulses | map pulse, shimmer bar | none (spinner, skeleton) | none (spinner) | none (spinner, skeleton) |
| CSS custom properties | 16 | 16 | 16 | 34 | 56 | 49 |
| One-off colors (RX-DS-03) | 23 | 31 | 18 | 15 | 0 | 8 |

Copy: all six say what happened in the late and the unavailable state, give a reason, and offer a next step. None
jokes. The A runs pair the late apology with the invented credit ("Sorry — we've added $5 credit"). B2 and B3
apologize once and give the reason that came with the order.

Static scan notes: the A findings are 11px text (RX-A11Y-02) and skipped heading levels (RX-A11Y-04). The scan
also flagged "6:38 PM" style times in B1, B2, and B3 under RX-CD-09 (8 findings, 7 of them in test files). That
rule asks for 24-hour time in Indonesian copy; this product is in English, so those are false positives and are
left out of the counts above. Raw output: `runs/<run>-scan.json`.

## Setup notes

- **Isolation:** the global skills folder was moved aside during the runs. A ran with `--disable-slash-commands`
  (no skills at all). B had the project-local RYUX plus the built-in skills every session gets; the built-in
  `design` and `design-sync` skills were denied, and the synced `design` and `product-management` plugins were
  off, in both arms.
- **The first B attempt** (three runs in parallel) hit the account's session limit after about 16 minutes,
  before any final message. Those runs were discarded and B1-B3 were rerun one at a time from fresh folders.
  The A runs were not rerun.
- **Skill counts:** B1 started with 18 skills and B2 and B3 with 30; the difference is built-in
  `anthropic-skills:*` entries that synced between runs, not RYUX or user skills.
- **Run time:** A 10-13 minutes, B 16-17 minutes.
- **Stack:** A1 one HTML file; A2, A3, B1, B3 plain HTML, CSS, and JS; B2 Vite, React, and TypeScript with tests.

## Files

- `runs/<run>.jpg`: the first screen at 390 wide.
- `runs/<run>-final.md`: each run's final message, local paths removed.
- `runs/<run>-scan.json`: the static and render scans from `ryux scan` 2.19.0.

## Scope

Six runs, one brief, one model: these results describe these runs, not rates. B also had DESIGN.md.
