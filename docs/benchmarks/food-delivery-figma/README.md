# Food delivery in Figma, pilot

The same food-delivery brief, designed in Figma instead of built in code, one run per side. The question: is it
cheaper, and does the difference still show? Protocol, fixed before the runs and amended once before scoring:
[`PROTOCOL.md`](PROTOCOL.md).

<a href="https://github.com/ryuxdsgn/design-intelligence/releases/download/media/benchmarks--food-delivery-figma--see-the-difference.mp4"><img src="https://github.com/ryuxdsgn/design-intelligence/releases/download/media/benchmarks--food-delivery-figma--see-the-difference.gif" alt="Animation: the brief; the no-skill agent designs straight away while RYUX writes DESIGN.md, asks, and explores three layouts; two Android phones play both Figma pages through an unavailable item, a late order, and the way to the door, the left showing a reply timer with an auto-pick, an instant refund, a late voucher, tips, and a rating, the right waiting for the customer's choice, keeping it after a failed send, and tagging every undecided rule on screen; then the numbers" width="100%"></a>

Video: [`see-the-difference.mp4`](https://github.com/ryuxdsgn/design-intelligence/releases/download/media/benchmarks--food-delivery-figma--see-the-difference.mp4). The runs made still frames; all motion is made for the
video. Both sides get the same platform motion (a press and ripple under the finger, sheets, shared-axis pages); the
RYUX side also gets the motion its DESIGN.md specifies (times that roll, the courier moving with the food, the home
pin pulsing, illustrations that spring in). No Skill's design specified none. B's frames are from "Pilot B1 fixed" (see After the pilot).

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

Four owner-requested rounds on a copy, page "Pilot B1 fixed"; "Pilot B1" and the counts above stay as the run left them.

- **Fixes** ($3.43, 12 min, [`runs/B1-turn4-final.md`](runs/B1-turn4-final.md)): "Contact courier" tagged on screen
  with its sheet drawn ("nothing is sent"); Delivered shows the items total only; every rule tag readable at 390
  and 360; three text sizes. Its gate: PASS.
- **Illustrations** ($6.21, 18 min, [`runs/B1-turn5-final.md`](runs/B1-turn5-final.md)): redrawn after an owner
  review ("clip art"): one shared head with eight expressions, elbows and knees, a place per scene, food visible,
  a real e-bike; built as SVG by a script and imported as editable vectors.
  [`runs/B1-fixed-illustrations.jpg`](https://github.com/ryuxdsgn/design-intelligence/releases/download/media/benchmarks--food-delivery-figma--runs--B1-fixed-illustrations.jpg). Still stiff in the standing scenes.
- **Poses** ($6.02 with a $0.66 start cut by the session limit, [`runs/B1-turn6b-final.md`](runs/B1-turn6b-final.md)):
  each standing scene its own body (weight on one leg, a step, tiptoe, dropped shoulders), stronger brows, and the
  sheet's provenance corrected to "made by the agent as SVG from a script".
- **A critique's fixes** ($8.04 over five turns, including a $0.06 start that could not reach Figma;
  [`runs/B1-turn7b-final.md`](runs/B1-turn7b-final.md) to [`turn7e`](runs/B1-turn7e-final.md)): a RYUX critique of the
  360 screens found eight problems, among them stage labels 6 pt apart, a 24 pt-wide close button, clocks that
  contradicted the times on screen, and the offline chip covering the courier. All eight fixed:
  - one stage label at a time;
  - a 44 pt close button;
  - one timeline of clocks;
  - map labels clear of the markers;
  - Android system bars at 360.

  Two follow-ups:
  - a white status bar and a darker scrim on photo screens, measured at the worst pixel;
  - an audit of Alt C (a timeline rail, aligned markers).

  Not tested on a device.
- With all four, B1 cost $33.16 in all. [`runs/B1-fixed-DESIGN.md`](runs/B1-fixed-DESIGN.md) is DESIGN.md after them;
  [`runs/B1-fixed-360.jpg`](https://github.com/ryuxdsgn/design-intelligence/releases/download/media/benchmarks--food-delivery-figma--runs--B1-fixed-360.jpg) is every changed screen at 360.
