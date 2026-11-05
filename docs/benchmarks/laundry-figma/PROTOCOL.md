# Laundry order in Figma: protocol

Written before the runs. Results go in README.md after counting; nothing here changes after the first run starts.

## Why

A side-by-side piece for the README and portfolio (owner request, 2026-11-05): the same brief designed in Figma with
no skill and with RYUX, then shown left and right in a 16:9 Remotion video. Laundry pickup was chosen because its
price is only known after weighing, so a run has to decide whether to invent prices, minimums, and turnaround
times or say what is not decided.

## Arms

Both: Opus 5.5, Claude Code `claude -p` through `packages/cli/scripts/bench/run.sh` (auto permission mode, a fresh
empty folder in `~/bench-runs/laundry-figma/`, `~/.claude/skills` moved aside for the run, synced and superpowers
plugins off), `BENCH_CONNECTORS=1` with every MCP server but the claude.ai Figma connector denied, one empty Figma file per arm owned by the owner ("Porto A" FZmN4BAMmfNh7XMgVFjhHx, "Porto B" Zq8v2pwQPX9fPCShDpKKpj), one new page per run.

- **A, No skill:** [`prompt-a.txt`](prompt-a.txt), file "Porto A", page "Porto A1". Skills and slash commands are off
  (the harness's arm A); the transcript is checked for no Skill call.
- **B, RYUX 2.22.1:** [`prompt-b.txt`](prompt-b.txt), file "Porto B", page "Porto B1". The released 2.22.1 skill, copied into the
  run folder (`BENCH_INSTALL`), not the local build of `main`; the transcript's "Base directory" line and the
  skill's version line are checked for 2.22.1. Rules merged to `main` after 2.22.1 (for example
  RX-CD-17, honest choices) are not in this arm and are not credited.

The prompts differ only in "Use the ryux skill.", the page name, and the file URL. If either arm asks questions,
[`reply.txt`](reply.txt) is sent once, the same text for both. A runs first, then B, never in parallel.

One run per arm, by choice. Whatever it produces is shown, including a result that favours A. If a run is cut off by
a session or account limit, it is set aside unscored and run again once on a page with the next number (A2, B2); the
reason is written here before the rerun.

## What is counted

Each with its direction:

- **Traps shown as fact (fewer is better):** a price per kilo or per item, a minimum weight, a turnaround time, an
  express or delivery fee, a discount or promo, a damaged or lost item policy, a courier ETA presented as a promise.
  A labeled sample value or an "after weighing" statement is not a trap.
- **States present (more is better):** pickup failed or late, weighed laundry differs from the estimate, payment,
  being washed, out for delivery, delivered, plus loading, error, and empty where they apply.
- **How the price is shown:** invented as fact, or explained as known after weighing.
- **Rupiah and Indonesian date format:** right or wrong, per frame that shows one.
- **Copy:** natural Bahasa Indonesia or literal translation (owner's read, noted as judgment).
- **Cost ($), minutes, and Figma tool calls** per run.

The owner may also rate the two pages blind (X/Y) for visual quality; that rating is reported separately from the
counts, as a profile per area, not a win or loss.

## What is shown

Frames exported at 2x from both pages, placed left (No skill) and right (RYUX) in a 16:9 Remotion composition in
`~/PenDEV/video`. The same step plays on both sides at once; then the right side shows any state the left does not
have. Captions give each count with its direction. Motion is added in Remotion, not by the runs, and the video says
so. The closing card names what RYUX fixed and what it still missed.
