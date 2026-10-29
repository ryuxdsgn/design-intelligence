# Food delivery order tracking, DESIGN.md written by RYUX

A quick follow-up to [order-tracking](../order-tracking/): nobody wrote DESIGN.md. RYUX wrote it from the brief
first (Design, "Write or update DESIGN.md", RX-PR-12), then built. **Round 2**, with Airbnb's look and a ride-hailing motion study as references: [`round-2/`](round-2/). **Round 3**, round 2 repeated with 2.19.4 to check the on-screen label fix: [`round-3/`](round-3/).
Protocol, fixed before the run:
[`PROTOCOL.md`](PROTOCOL.md).

<a href="https://github.com/ryuxdsgn/design-intelligence/releases/download/media/benchmarks--food-delivery-designmd--see-the-difference.mp4"><img src="https://github.com/ryuxdsgn/design-intelligence/releases/download/media/benchmarks--food-delivery-designmd--see-the-difference.gif" alt="Animation: the brief and the two sides; the first reply, where the agent with no skill has already built and RYUX writes a DESIGN.md that answers who the users are, their job, the evidence, the interaction patterns, and how to evaluate, with eight open questions; both prototypes side by side on the same scenario, an unavailable item then a late order, the left showing a one-minute auto-pick, refund timing, and an automatic credit, the right showing the price of each choice and the new time with no promise; then the numbers and what RYUX missed" width="100%"></a>

Video: [`see-the-difference.mp4`](https://github.com/ryuxdsgn/design-intelligence/releases/download/media/benchmarks--food-delivery-designmd--see-the-difference.mp4). Shown: order-tracking's A1 and this B1, the same
scenario on both (an item becomes unavailable, remove it, then the order runs late). Scenario controls were
clicked by script with the prototype panels hidden; the dots are in-app taps only.

## What happened

**Turn 1, the DESIGN.md** ($0.56, 2 min): [`runs/B1-DESIGN.md`](runs/B1-DESIGN.md). It names the brief as its only
source, then answers the five questions: Users and needs (each line marked Observed or Inferred), Jobs to be
done, Evidence (each decision rated; the layout calls are "None" because no reference screens were connected),
Interaction patterns, How we evaluate (five criteria, the riskiest assumption, a five-person test). Voice and
tone, Visual and motion language, and eight Open questions with who can answer each. No fee, refund rule, or late
credit was decided. It ended with three questions.

**Turn 2 was skipped, by a script error.** The protocol sends order-tracking's fixed reply when turn 1 ends with
questions, and it did; the run script only checked whether the file had been written. So the questions went
unanswered, and turn 3 built on RYUX's own recommended defaults: English, USD, calm teal, the system font, and a
rule for the unavailable item. It said so: *"You didn't answer my three questions, so I used the recommended
defaults. They're assumptions."*

**Turn 3, the build** ($3.00, 20 min): a Vite, React, and TypeScript app with 17 tests, typecheck and build
passing, rendered by the agent at 320, 390, and 1280.

| | No skill, A1-A3 ([order-tracking](../order-tracking/)) | RYUX, B1 |
| --- | --- | --- |
| Policies made up, shown as real (fewer is better; [`traps.txt`](../order-tracking/traps.txt)) | 8 · 9 · 8 | 0 |
| A DESIGN.md before building | none | 8 of 8 sections, 8 open questions |
| Asked before building | 0 of 3 | 3 questions, unanswered |
| Loading, error, offline screens | none | all three, plus map failed and order not found |
| `ryux scan`: static · rendered | 9 · 17, 8 · 5, 7 · 19 | 2 · 24 |
| Cost | $1.79–2.50 | $3.56 ($0.56 + $3.00) |

B1's 0 follows order-tracking's scoring: "Message" opens a note that the feature is not confirmed, and the
unavailable-item rule is named an assumption in the final message. The 24 rendered findings are all the 8
inputs of the prototype panel, at three widths (18px targets); static: one 11px label and 4 one-off colors.

## What RYUX missed

- **The no-answer rule reads as fact on screen.** "If you don't choose in time, we'll remove it and you won't be
  charged for it." It is labeled an assumption in the code and the reply, not on the card.
- **A plain look.** With no direction answered, it chose calm teal and the system font. The DESIGN.md left the
  visual direction open (Open question 2), so the build has no visual concept of its own.
- **It cost up to twice a no-skill run**, most of it in the build turn. First published as $4.12, adding
  the turns' running totals (corrected 2026-10-28).
- One run, by choice: what this run did, not a rate. Visual quality is not rated by designers yet.

## Method

- RYUX: main after b15aa12 (the DESIGN.md writer, unreleased at the time), Opus 5.5, Claude Code `claude -p`,
  auto permission mode, no MCP servers. A: order-tracking's A1-A3, not rerun.
- Raw output: [`runs/`](runs/) (turn 1 and turn 3 final messages, the DESIGN.md, the scan). Local paths removed.
