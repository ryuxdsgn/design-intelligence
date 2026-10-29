# Illustration baseline: protocol

Written before the runs; results go in README.md after scoring, and nothing here changes after the first run starts.
Amendments, if any, are dated and made before any result is scored.

## Why

Agents make generic illustration: they draw before they have a concept, lean on style words (modern, playful,
clean) that set no shape or proportion, and make each asset on its own, so a set drifts. In the Figma pilot the
owner called RYUX's first illustrations "clip art"; the redrawn set was still stiff in its standing poses
([food-delivery-figma](../food-delivery-figma/)). The owner wants RYUX to work like an art director and illustrator
(owner research, 2026-10-29). Before anything changes, this baseline measures where RYUX 2.20.0 stands against no
skill, and what kind of failure dominates: construction (geometry) or art direction.

## Question

Across four asset families, how do illustrations made with RYUX 2.20.0 compare with no skill on originality, art
direction, craft, cohesion, editability, and brief fidelity, and which failures are construction and which are
art direction?

## Tasks

Each brief names a made-up product, where the art is used, and its size; none names a style. Both arms get the
same text.

| Task | Family | Brief |
| --- | --- | --- |
| T0 | Icons, a set of six | [`prompts/t0-icons.txt`](prompts/t0-icons.txt) |
| T1 | Empty states, a set of three | [`prompts/t1-empty-states.txt`](prompts/t1-empty-states.txt) |
| T2 | Character with objects | [`prompts/t2-mascot.txt`](prompts/t2-mascot.txt) |
| T3 | Complex editorial | [`prompts/t3-editorial.txt`](prompts/t3-editorial.txt) |

## Arms

Both: Opus 5.5, Claude Code `claude -p` through [`run.sh`](../../../packages/cli/scripts/bench/run.sh), auto
permission mode, a fresh empty folder, no MCP server (`--strict-mcp-config`), the whole `~/.claude/skills` moved
aside. Both may render their own work (for example with Playwright) and install any library in the run folder;
which ones they used is recorded, not restricted.

- **A, No skill:** every skill and command off.
- **B, RYUX 2.20.0:** the local build installed into the run folder. No DESIGN.md.

If turn 1 ends with no SVG in `art/`, [`prompts/reply.txt`](prompts/reply.txt) is sent once through
[`turn2.sh`](../../../packages/cli/scripts/bench/turn2.sh), on either arm. Nothing else is sent.

Two runs per arm per task, 16 runs, one at a time in this order per task: A1, B1, A2, B2. A resumed session
reports its running total, so a run's cost is its last turn's `total_cost_usd`.

## What is counted

**Deterministic, a floor, not quality** ([`score-svg.mjs`](score-svg.mjs), checked on a planted good and a planted
bad SVG before the first run): the file parses as SVG; a `viewBox`; no fixed `width`/`height` on the root; no
embedded raster (`<image>`, base64); no `<text>`; no editor metadata; elements, groups, named groups, nesting depth,
file size; elements whose box falls outside the `viewBox`.

**Blind rating by the owner.** Per task, A1 is paired with B1 and A2 with B2: eight pairs, each side labelled X or
Y at random, the mapping sealed in `knowledge/benchmarks/illustration/sealed/` (local) until every score is in.
Each side is shown at its display size and at 2x, on light and on dark, with its layer outline (group and element
names) beside it. Each side gets 1 to 5 on:

| Dimension | What is rated |
| --- | --- |
| Originality | How specific and unclichéd the concept is |
| Art direction | Whether shape, composition, and style serve the message |
| Craft | Silhouette, curves, overlap, detail, and light |
| Cohesion | Consistency within the image and across the set |
| Editability | Layer structure and naming a designer could revise |
| Brief fidelity | How exactly it answers the brief, sizes and modes included |

Results are a profile per dimension, never a single winner. A 5 needs no note; every score of 1 or 2 names the
failure and labels it **construction** (broken booleans, curves, overlaps, paths, or geometry) or **art direction**
(concept, pose, composition, genericness, inconsistency).

**From the runs:** cost and minutes; whether the run asked first; whether it rendered and looked at its own work
before finishing, and how many times; libraries installed; whether light and dark were handled.

**Figma import, information only:** the best-rated SVG of each arm per task is imported with
`figma.createNodeFromSvg()`. Recorded: whether group names and nesting survive, and what changes (gradients,
masks, filters, text).

The AI judge ([`judge.sh`](../../../packages/cli/scripts/bench/judge.sh), with a per-task copy of its prompt) may be
reported. It never decides.

## What happens after

The owner reviews the gaps and decides two things: what goes into RYUX's illustration module, and whether
construction failures are common enough to justify geometry tooling. Nothing in RYUX changes during the runs.

## Scope

One model, one harness, two runs per cell: a baseline to find gaps, not a rate. One rater, the owner.
