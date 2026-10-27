# Food delivery, round 2: a DESIGN.md from a brief and a motion reference

Written before the run; results go in README.md after scoring, and nothing here changes after the run starts.

## Why a second round

Round 1's B1 built a plain screen: nobody answered its questions (a script error skipped the reply), so it used
its own calm defaults, and the owner asked for illustration and motion as interactive as their own motion study
of a ride-hailing booking flow (owner review, 2026-10-27).

## Question

Given the same brief plus a visual reference, does RYUX write a DESIGN.md that turns the reference into a
direction of its own (not a copy of its brand), and does the build carry illustration and interactive motion
while keeping round 1's results: no invented policy, the states for when things go wrong?

## Arm

- **B, RYUX (main after b15aa12):** one run, B1, in an empty folder with RYUX installed, no DESIGN.md, and
  `ref/`: seven frames of the owner's motion study (another company's app, so not published here) and
  [`motion.md`](motion.md). Three turns in one session:
  1. [`prompt-designmd.txt`](prompt-designmd.txt): write DESIGN.md from the brief and the reference, then wait.
  2. [`reply.txt`](reply.txt): order-tracking's fixed reply plus one line on look and motion, sent whenever
     turn 1's final message asks anything (round 1's script sent it only when no DESIGN.md was written).
  3. [`prompt-build.txt`](prompt-build.txt): build it from the brief and that DESIGN.md.
- **A, No skill:** order-tracking's A1-A3, not rerun. They had no reference and no look direction, so this round
  compares what each side built, not one variable.

One run, by choice: what this run did, not a rate.

## What is counted

Round 1's counts ([`traps.txt`](../../order-tracking/traps.txt), states, `ryux scan`, cost), plus:
- **Illustration:** what is illustrated (courier, states), drawn by the run (provenance labeled), any reference
  asset or brand reused (a miss).
- **Motion:** each event in [`motion.md`](motion.md)'s kind (touch feedback, same sheet new state, numbers that
  roll, the courier on the route, a playful moment) present or not, and whether reduced motion is handled.

## What is shown

B1 next to round 1's A1 in the root README video, with the same scenario as round 1.
