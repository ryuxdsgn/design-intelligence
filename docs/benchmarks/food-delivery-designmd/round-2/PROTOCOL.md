# Food delivery, round 2: a DESIGN.md from a brief and a motion reference

Written before the run; results go in README.md after scoring, and nothing here changes after the run starts.

**Amended once, before any result (2026-10-27):** the first start was stopped during turn 1, before it wrote
anything, because the owner added a visual direction: Airbnb's look, the food shown, Gojek's flow. That partial
turn is kept aside, not scored. The amended run was then paused by the owner, also during turn 1 with nothing
written, and restarted from a fresh folder; also kept aside, not scored. The text below is the amended protocol.

## Why a second round

Round 1's B1 built a plain screen: nobody answered its questions (a script error skipped the reply), so it used
its own calm defaults, and the owner asked for illustration and motion as interactive as their own motion study
of a ride-hailing booking flow, with Airbnb's visual direction and the food itself on screen (owner review,
2026-10-27).

## Question

Given the same brief plus two references (Airbnb's visual direction, in words; a ride-hailing motion study, in
frames), does RYUX write a DESIGN.md that turns them into a direction of its
own (not a copy of either brand), and does the build show the food and carry illustration and interactive motion
while keeping round 1's results: no invented policy, the states for when things go wrong?

## Arm

- **B, RYUX (main after b15aa12):** one run, B1, in an empty folder with RYUX installed, no DESIGN.md, and
  `ref/`: seven frames of the owner's motion study (another company's app, so not published here) and
  [`motion.md`](motion.md). Three turns in one session:
  1. [`prompt-designmd.txt`](prompt-designmd.txt): write DESIGN.md from the brief and the reference, then wait.
  2. [`reply.txt`](reply.txt): order-tracking's fixed reply plus one line on look, food, and motion, sent whenever
     turn 1's final message asks anything (round 1's script sent it only when no DESIGN.md was written).
  3. [`prompt-build.txt`](prompt-build.txt): build it from the brief and that DESIGN.md.
- **A, No skill:** order-tracking's A1-A3, not rerun. They had no reference and no look direction, so this round
  compares what each side built, not one variable.

One run, by choice: what this run did, not a rate.

## What is counted

Round 1's counts ([`traps.txt`](../../order-tracking/traps.txt), states, `ryux scan`, cost), plus:
- **Food:** whether the dishes and groceries are shown, how (photo, illustration, drawn), and with provenance
  labeled; any image presented as a real product photo it is not counts as a miss.
- **Illustration:** what is illustrated (courier, states), drawn by the run (provenance labeled), any reference
  asset or brand reused (a miss).
- **Motion:** each event in [`motion.md`](motion.md)'s kind (touch feedback, same sheet new state, numbers that
  roll, the courier on the route, a playful moment) present or not, and whether reduced motion is handled.

## What is shown

B1 next to round 1's A1 in the root README video, with the same scenario as round 1.
