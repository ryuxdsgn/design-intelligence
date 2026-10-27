# Food delivery order tracking, DESIGN.md written by RYUX: protocol

A quick follow-up to [order-tracking](../order-tracking/). Written before the run; results go in README.md after
scoring, and nothing here changes after the run starts.

## Question

When nobody writes DESIGN.md and RYUX writes it from the brief first (Design, "Write or update DESIGN.md",
RX-PR-12, unreleased at the time of the run), does the build that follows keep what order-tracking measured (no
invented policy, the states for when things go wrong) and get a clear visual direction of its own?

## Arms

- **B, RYUX (main after b15aa12, the DESIGN.md writer):** one run, B1, in an empty folder with RYUX installed and
  no DESIGN.md. Three turns in one session:
  1. [`prompt-designmd.txt`](prompt-designmd.txt): write DESIGN.md from order-tracking's brief, then wait.
  2. order-tracking's [`reply.txt`](../order-tracking/reply.txt), sent once if turn 1 ends with questions.
  3. [`prompt-build.txt`](prompt-build.txt): build it from the brief and that DESIGN.md.
  If turn 1 writes the file without asking, turn 2 is skipped.
- **A, No skill:** not rerun; order-tracking's A1-A3 (same brief, Opus 5.5, Claude Code 2.1.310 then). They had
  no DESIGN.md. Here B's DESIGN.md is RYUX's own, so the label is "No skill vs RYUX".
- Harness as before: `claude -p`, auto permission mode, no MCP servers, synced plugins off, global skills aside.

One B run, by choice, to keep this quick: what this run did, not a rate.

## What is counted

Order-tracking's counts, the same way ([`traps.txt`](../order-tracking/traps.txt), states, `ryux scan`, cost),
plus for the DESIGN.md: the eight sections present, each of the five questions answered with a source or listed
under Open questions, chosen values marked proposed with a reason, and any policy written as fact (a trap).

## What is shown

B1 and order-tracking's A1 in the root README video, with the same tap script whatever they show, and the
DESIGN.md's opening lines on screen.
