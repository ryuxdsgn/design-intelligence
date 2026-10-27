# Food delivery, round 3: does the on-screen label fix hold?

Rounds 1 and 2 showed an undecided rule as a plain sentence on screen ("If you don't choose by pickup, we'll leave
it out and you won't be charged for it"), labelled an assumption only in DESIGN.md and the reply. RYUX 2.19.4
tightened RX-PR-02: such a sentence is left out, or labelled on that same screen. This round repeats round 2
exactly with 2.19.4. Protocol, fixed before the run: [`PROTOCOL.md`](PROTOCOL.md).

## Result: the fix held, in this run

- **No answer, no rule.** The sold-out sheet has no deadline and no auto-pick: "Your order continues once you
  choose." DESIGN.md (A7) says why: "No auto-decision and no countdown".
- **Undecided rules are tagged on the screen** with a "Proposed rule" tag: the subtotal change on a swap, the
  price difference of a replacement, "Sold out, removed. Not charged.", the handoff code, and the late reason.
- **Fees are left out:** "Fees and payment are not part of this prototype."
- **Message and Get help** open sheets that say the policy isn't decided and nothing is sent, also tagged.

The run itself flagged one tag as probably wrong: "a reason is really data, not policy. You may want to drop
that tag." Over-labelling is the cheaper mistake, but it is noise on screen.

| | Round 2 (main before 2.19.4) | Round 3 (2.19.4) |
| --- | --- | --- |
| Undecided rule shown as fact on screen | 1 (the no-answer rule) | 0 |
| Policies made up ([`traps.txt`](../../order-tracking/traps.txt)) | 0 | 0 |
| DESIGN.md | 8 of 8 sections | 8 of 8 sections |
| Food on screen | Commons photos, credited | 13 Commons photos, credits linked from the controls |
| Loading, error, offline | all three | all three, plus a failed send with retry |
| `ryux scan`: static · rendered | 0 · 0 | 0 · 0 |
| Tests reported by the run | 28 unit, 30 end-to-end | 18 unit, plus scripted browser runs at 390, 360, 1280 |
| Build minutes | 42 | 61 |
| Cost | $10.43 | about $10.60 (see Method) |

Motion from the reference, read from the code and the run's report: round 2's kinds again, plus the two it
skipped: the courier lifting off the map into the panel, and a searching sweep while a courier is found. The map
camera still does not zoom. The run listed six places it departed from DESIGN.md, each with a reason
([`runs/B1-turn3-final.md`](runs/B1-turn3-final.md)).

## What this does not show

- One run: the fix can work, not how often it does.
- The run could not run `ryux scan` itself (the sandbox blocked the download) and checked its four points with its
  own scripts; the scan above was run here afterwards.
- Visual quality is not rated by designers yet.

## Method

- RYUX 2.19.4, Opus 5.5, Claude Code `claude -p`, auto permission mode, no MCP servers. Same prompts, reply, and
  `ref/` as round 2. A: order-tracking's A1-A3, not rerun.
- Cost: turn 1 (DESIGN.md) $1.00, turn 2 (the reply) $0.40, build about $9.20. A harness edit during the build
  made the build prompt run a second time after it finished; that repeat checked the work, rebuilt nothing, and
  overwrote the build's log ([`runs/B1-turn3-repeat-final.md`](runs/B1-turn3-repeat-final.md)). The build's final
  message was recovered from the session transcript. The session's running total was $10.83 with the repeat; the
  repeat's share (about $0.23) is estimated, so the build cost is approximate.
- Raw output: [`runs/`](runs/) (DESIGN.md, the final message of each turn, the scan, screens, illustrations).
