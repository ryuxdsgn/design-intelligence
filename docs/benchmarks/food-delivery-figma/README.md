# Food delivery in Figma, pilot

The same food-delivery brief, designed in Figma instead of built in code, one run per side. The question: is it
cheaper, and does the difference still show? Protocol, fixed before the runs and amended once before scoring:
[`PROTOCOL.md`](PROTOCOL.md).

## Cost: about the same for RYUX, faster

| | No skill | RYUX + DESIGN.md |
| --- | --- | --- |
| In Figma (this pilot) | $2.16, 8 min (A2) | $9.46: DESIGN.md $1.30, reply $0.61, design $7.55 (24 min) |
| In code ([order-tracking](../order-tracking/), [round 2](../food-delivery-designmd/round-2/)) | $1.79–2.50 | $10.43: DESIGN.md $1.16, reply $0.47, build $8.80 (42 min) |

Designing in Figma cost RYUX about 10% less and took about half the time, not a step change: the design turn
still reads the skill, renders and checks every screen, and fixes what it finds (50 Figma calls). The frames do
not move; motion for a video is made separately.

## What the frames show

Counted from the run's own renders ([`runs/`](runs/)), with order-tracking's
[`traps.txt`](../order-tracking/traps.txt):

| | No skill, A2 | RYUX, B1 |
| --- | --- | --- |
| Asked before designing | no | yes (wrote DESIGN.md first, then asked) |
| Policies made up, shown as real (fewer is better) | 8: a late voucher, automatic refunds, the shopper picks if you don't answer in time, a free-cancellation countdown and a 30-minute cancel rule, chat and call, tips, a courier rating, a real motorbike brand | 1: "Contact courier" on screen with its sheet not drawn; its "proposed" note sits beside the frame, not on it |
| Undecided rules on screen | shown as fact | dashed "Prototype rule, not decided yet" tags (no answer, refunds, what counts as late, payment after a cancel) |
| States | 8 screens: the stages, late, unavailable, lock screen | 24 screens: the stages, late, five unavailable screens (decide, sending, failed, done, dismissed), loading, no courier, offline, map failed, cancelled; checked at 390 and 360 |
| Food | grey placeholder shapes | Wikimedia Commons photos, credited on an asset board |
| Illustration | none | its own e-bike courier, 10 states |
| Explored alternatives | no | three layouts, rated, B built, A still open |

Also seen in B1: the "Paid at checkout $48.95" against $42.75 of items implies fees with no line on screen
(labelled sample only in the note beside the frame); the long rule tags are cut off at 390; its own gate says FAIL
for five text sizes in one panel. A2 used rupiah and Jakarta places from the file's other pages, not the brief.

## What this does not show

- One run per side: what these runs did, not a rate. Not rated by designers.
- The A2 page image is the run's last full-page render; the B1 images are its section renders.

## Method

- Opus 5.5, Claude Code `claude -p`, auto permission mode, the claude.ai Figma connector only
  (`BENCH_CONNECTORS=1`). RYUX 2.19.4. Figma file Ujicoba, pages "Pilot A2" (renamed "Pilot A1" by the owner
  after the run) and "Pilot B1".
- The first A1 was cut off by the account's session limit and is not scored; B1 had not started.
- Costs are each session's final running total (a resumed session reports its running total).

## After the pilot (not scored)

Two owner-requested rounds on a copy, page "Pilot B1 fixed"; "Pilot B1" and the counts above stay as the run left them.

- **Fixes** ($3.43, 12 min, [`runs/B1-turn4-final.md`](runs/B1-turn4-final.md)): "Contact courier" tagged on screen
  with its sheet drawn ("nothing is sent"); Delivered shows the items total only; every rule tag readable at 390
  and 360; three text sizes. Its gate: PASS.
- **Illustrations** ($6.21, 18 min, [`runs/B1-turn5-final.md`](runs/B1-turn5-final.md)): redrawn after an owner
  review ("clip art"): one shared head with eight expressions, elbows and knees, a place per scene, food visible,
  a real e-bike; built as SVG by a script and imported as editable vectors.
  [`runs/B1-fixed-illustrations.jpg`](runs/B1-fixed-illustrations.jpg). Still stiff in the standing scenes.
- With both, B1 cost $19.10 in all. [`runs/B1-fixed-DESIGN.md`](runs/B1-fixed-DESIGN.md) is DESIGN.md after them.
