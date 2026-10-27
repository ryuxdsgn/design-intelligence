# Food delivery, round 3: does the on-screen label fix hold?

Written before the run; results go in README.md after scoring, and nothing here changes after the run starts.

## Question

Rounds 1 and 2 showed an undecided rule as a plain sentence on screen ("If you don't choose by pickup, we'll leave
it out and you won't be charged for it"), labelled an assumption only in DESIGN.md and the reply. RYUX 2.19.4
tightens RX-PR-02 (a Hard Gate): such a sentence is left out, or labelled on that same screen. Does a run now do
that, and keep round 2's results?

## Arm

- **B, RYUX 2.19.4:** one run, B1, round 2 repeated exactly: the same [`prompt-designmd.txt`](../round-2/prompt-designmd.txt),
  [`reply.txt`](../round-2/reply.txt) (sent whenever turn 1 asks), [`prompt-build.txt`](../round-2/prompt-build.txt),
  and `ref/` (the same seven frames and [`motion.md`](../round-2/motion.md)). Only the RYUX version changes.
- **A:** order-tracking's A1-A3, not rerun.

One run, by choice: it shows whether the fix can work, not how often.

## What is counted

- **The fix:** every undecided rule the screens state (what happens with no answer, time limits, charges, refunds):
  left out, labelled on the same screen, or shown as fact (a miss).
- Round 2's counts: [`traps.txt`](../../order-tracking/traps.txt), states, `ryux scan`, food shown and its
  provenance, illustration, motion kinds, cost and minutes.
