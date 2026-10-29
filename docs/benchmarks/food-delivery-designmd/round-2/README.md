# Food delivery, round 2: a DESIGN.md from a brief and two references

Round 1's B1 was honest but plain. Here RYUX wrote the DESIGN.md from the same brief plus two references (Airbnb's
look, in words; the owner's motion study of a ride-hailing booking flow, in frames), then built. Protocol, fixed
before the run and amended once before any result: [`PROTOCOL.md`](PROTOCOL.md).

<a href="https://github.com/ryuxdsgn/design-intelligence/releases/download/media/benchmarks--food-delivery-designmd--round-2--see-the-difference.mp4"><img src="https://github.com/ryuxdsgn/design-intelligence/releases/download/media/benchmarks--food-delivery-designmd--round-2--see-the-difference.gif" alt="Animation: the brief and the two sides; the agent with no skill builds straight away while RYUX writes a DESIGN.md answering who the users are, their job, the evidence, the patterns, and how to evaluate, and declines the reference app's late voucher as someone else's policy; both prototypes side by side on an unavailable item, a late order, and the way to the door, the left showing a one-minute auto-pick, refund timing, and a $5 credit, the right showing real food photos, the price of each choice with Undo, a time that rolls with no promise, and the food riding with the courier on the map; then the numbers and what RYUX missed" width="100%"></a>

Video: [`see-the-difference.mp4`](https://github.com/ryuxdsgn/design-intelligence/releases/download/media/benchmarks--food-delivery-designmd--round-2--see-the-difference.mp4). Shown: order-tracking's A1 and this B1, the same
scenario (an item becomes unavailable, remove it, the order runs late, then on to the door). Scenario controls
were clicked by script with the prototype panels hidden; the dots are in-app taps only. Screens:
[`runs/B1-screens.jpg`](https://github.com/ryuxdsgn/design-intelligence/releases/download/media/benchmarks--food-delivery-designmd--round-2--runs--B1-screens.jpg), illustrations: [`runs/B1-illustrations.png`](https://github.com/ryuxdsgn/design-intelligence/releases/download/media/benchmarks--food-delivery-designmd--round-2--runs--B1-illustrations.png).

## What happened

**Turn 1, the DESIGN.md** ($1.16, 3 min): [`runs/B1-DESIGN.md`](runs/B1-DESIGN.md). The five questions answered,
each line with its source; every reference frame it relied on is cited and rated Thin ("one product, another
context: rides, not food"). Its own concept: *"the order travels as the food"*: the ordered items' photos stack on
the card, ride with the courier on the map, and land at the door. A paprika accent chosen "deliberately far from
both references' brand colours". And it declined a policy it saw in the reference: *"the reference app pays a
voucher when a pickup runs late. That's their policy, so I didn't adopt it."* It ended with three questions.

**Turn 2, the fixed reply** ($0.47): recorded the answers and added "Prototype assumptions" P1–P9, each labeled
and "never shown on screen as a promise": no late compensation, contact sheets that say they are a prototype,
fees as labeled sample lines, cancelling, tipping, and rating out of scope.

**Turn 3, the build** ($8.80, 42 min): Vite, React, and TypeScript; typecheck, lint, 28 unit and 30 end-to-end
tests pass (reported by the run; `ryux scan` rerun here: 0 findings static and rendered). Food photos from
Wikimedia Commons under free licences, with a credits sheet in the app. Twelve illustrations of its own (a courier
character, a receipt, a chef, a basket, the door); no reference asset, brand, or character reused.

| | No skill, A1-A3 ([order-tracking](../../order-tracking/)) | RYUX, B1 |
| --- | --- | --- |
| Policies made up, shown as real (fewer is better; [`traps.txt`](../../order-tracking/traps.txt)) | 8 · 9 · 8 | 0 |
| A DESIGN.md before building | none | 8 of 8 sections, 10 open questions |
| The food on screen | emoji | real photos, credited in the app |
| Loading, error, offline screens | none | all three, plus a failed send and a photo fallback |
| `ryux scan`: static · rendered | 9 · 17, 8 · 5, 7 · 19 | 0 · 0 |
| Cost | $1.79–2.50 | $10.43 ($1.16 + $0.47 + $8.80) |

B1's 0 follows order-tracking's scoring. The delivery and service fees on the receipt sit under the order list's
"Sample orders in a prototype. Stores, couriers, prices, and times are not real." Message and Call open sheets
that say they are a prototype. The rendered scan saw the order list only (the app opens there).

**Motion from the reference** ([`motion.md`](motion.md)), read from the recording and the code:

| Kind | Built |
| --- | --- |
| Touch feedback | yes |
| Same sheet, new state (the stage title changes in place) | yes |
| Numbers that roll only the changed digits | yes (arrival time) |
| The courier on the route, with the food | yes: the photo stack rides with the courier |
| Pin drop | yes, when the map appears |
| Shared element between screens | yes: the food stack across card, panel, and map |
| Camera zoom, a playful leap into the card | no (listed by the run as a departure) |
| Reduced motion | yes: movement becomes a cut; all 10 flows tested in that mode |

## What RYUX missed

- **The no-answer rule reads as fact on screen**, as in round 1: "If you don't choose by pickup, we'll leave it
  out and you won't be charged for it." It is labeled P1, an assumption, in DESIGN.md and the reply, not on the
  sheet. Fixed in 2.19.4 and checked in [round 3](../round-3/).
- **Two reference moments not built:** the map camera stays still and the courier never leaps into the card. The
  run listed both as departures in [`runs/B1-app-README.md`](runs/B1-app-README.md).
- **It cost four to six times a no-skill run** and took 42 minutes to build. First published as $13.22:
  the per-turn totals were added, but a resumed session already reports its running total (corrected 2026-10-28).
- One run, by choice: what this run did, not a rate. Visual quality is not rated by designers yet.

## Method

- RYUX: main after b15aa12 (the DESIGN.md writer, unreleased at the time), Opus 5.5, Claude Code `claude -p`,
  auto permission mode, no MCP servers. A: order-tracking's A1-A3, not rerun, no references.
- Two starts were stopped during turn 1 with nothing written (a direction change, then an owner pause); kept
  aside, not scored. After the build, stopping the run's own dev server so the session could end triggered a
  one-line correction from the agent ($0.09, not counted above).
- Raw output: [`runs/`](runs/) (the final message of each turn, the DESIGN.md, the app's README, the scan). The
  reference frames are not published (another company's brand).
