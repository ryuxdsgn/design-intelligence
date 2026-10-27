# Food delivery in Figma, pilot: protocol

Written before the runs; results go in README.md after scoring, and nothing here changes after the first run starts.

## Why

The food-delivery prototypes cost $1.79–2.50 (no skill) and $10.43 (RYUX, round 2; written here first as $13.22,
corrected 2026-10-28 after the runs began: a resumed session already reports its running total) per run, most of RYUX's in
building and testing code. The owner asked whether designing the screens in Figma, then animating the exported
frames in Remotion as natively as a phone would, is cheaper and still shows the difference (owner request,
2026-10-28).

## Question

Designing in Figma instead of building code: what does a run cost on each side, and does the difference
order-tracking measured (made-up policies, the states for when things go wrong) still show in the frames?

## Arms

Both: Opus 5.5, Claude Code `claude -p`, auto permission mode, a fresh folder, the claude.ai Figma connector and
no other MCP server (`BENCH_CONNECTORS=1`, every other server denied), the owner's file
`Ujicoba` (Vbgd7hohZiudPJNf4Pt9ay), one new page per run.

- **A, No skill:** [`prompt-a.txt`](prompt-a.txt): the brief, designed in Figma on page "Pilot A1". If it asks,
  [`reply-a.txt`](reply-a.txt) (order-tracking's fixed reply) is sent once.
- **B, RYUX 2.19.4 + DESIGN.md:** as food-delivery round 2, in Figma. Turn 1
  [`prompt-b-designmd.txt`](prompt-b-designmd.txt) with `ref/` (the same seven frames and motion notes); turn 2
  [`reply-b.txt`](reply-b.txt) when turn 1 asks; turn 3 [`prompt-b-design.txt`](prompt-b-design.txt), page
  "Pilot B1".

One run per side, by choice: a pilot for cost and feasibility, not a rate. A runs first, then B, never in
parallel.

Amended 2026-10-28, before any result was scored: the first A1 was cut off by the account's session limit after
10 minutes ($2.67), half-drawn on page "Pilot A1", and B1 never started. A1 is kept aside, not scored; A runs
again as A2 on page "Pilot A2" ([`prompt-a2.txt`](prompt-a2.txt), only the page name differs); B1 runs as written.

## What is counted

- Cost and minutes per turn; Figma tool calls.
- [`traps.txt`](../order-tracking/traps.txt) kinds shown as fact in the frames.
- Frames for: each order step, running late, item unavailable, loading, error, offline.
- How the food is shown (photo, illustration, generated) and whether its provenance is labeled.
- RX-PR-02 (2.19.4): an undecided rule on a frame is left out or labeled on that frame.

## What is shown

If the owner picks it for the video: the frames exported from both pages, animated in Remotion with native
mobile motion. The motion is made for the video, not by the runs, and the video says so.
