# Lumo TD · Transaction detail, with and without RYUX

The benchmark behind the comparison in the [README](../../../README.md#see-the-difference). One brief,
six runs: three without RYUX (`a1`–`a3`) and three with RYUX 2.6.3 (`c1`–`c3`). Each run is one
fresh agent in an empty folder, designing in pen.dev on a cleared canvas.

- Brief: [`prompt.txt`](prompt.txt). Every run got exactly this prompt.
- Fact sheet: [`factsheet.txt`](factsheet.txt), sent only to a run that asked questions. No run
  asked, so no run saw it.
- Each run folder holds the agent's final answer (`reasoning.md`), every frame it drew (`*.png`), and
  `frames.txt`, which names the main frame.

## Result

| | Without RYUX (a1–a3) | With RYUX 2.6.3 (c1–c3) |
| --- | --- | --- |
| States designed | Completed, Processing, Failed, in 3 of 3 | Those three plus loading, couldn't load, report window closed, and 320 wide, in 3 of 3 |
| Actions the brief didn't mention | Share or Save receipt added and presented as given, in 3 of 3 | Proposed and listed as unconfirmed, in 3 of 3 |
| Promises the brief didn't make | "No money was taken" on a failed payment, in 2 of 3 (a1, a3) | None, in 3 of 3 |
| Placeholders on screen | None | None: realistic sample data, labeled as sample |
| Questions before designing | 0 in 3 of 3 | 0 in 3 of 3 |

Both sides put the fee on its own line, and both flag that "Rp48.000 paid" can be read two ways.
RYUX proposed a receipt action in 1 of 3 runs (c2).

## Method and limits

- Same model (Claude Opus), same harness (`packages/cli/scripts/bench/run.sh`: `claude -p` in an
  empty folder outside any project, global RYUX moved aside), same brief.
- The runs without RYUX come from the 2.6 visual benchmark (2026-10-10). The RYUX runs used the same
  brief and harness on 2026-10-13, with the build that became 2.6.3.
- Three runs per side: a small benchmark, not a study. It shows what the screens cover and claim,
  not that they look better. Visual quality is a separate, unproven question (see the
  [showcase](../../showcase.md#what-ryux-has-not-proven)).
- Edits to the raw output: the local path of the pen.dev file is replaced with `[local path]`.
