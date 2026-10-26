# Benchmarks

Raw outputs behind every claim in the [README](../../README.md) and the [showcase](../showcase.md).
Everything in a run folder is the agent's own output; the only edits are removed local paths, and
each folder says what was edited.

## Current evidence

| Benchmark | The question it answers | RYUX | Runs |
| --- | --- | --- | --- |
| [Order tracking](order-tracking/) | Does the agent invent policies the brief left open, and build the states for when things go wrong? A working prototype, no skill vs RYUX + DESIGN.md, with `ryux scan` | 2.19.0 | 3 + 3 |
| [Personal finance app](hero-finance/) | Does the agent ask first, invent facts, and cover states? Designed in pen.dev, no skill vs RYUX; the README demo | 2.9.3 | 3 + 3 |
| [Explore, judge, critique](explore-judge/) | Does it offer real alternatives before one design, and does Critique find planted problems? Rated blind by a designer | 2.8 vs 2.9 | 3–6 per condition |
| [Typography](typo-craft/) | Does a craft rule change the built result? One rule measured by a script, one blind designer rating | 2.9.1 vs 2.9.2 | 3 + 3 |

### What each one measures

Five dimensions, kept apart on purpose: an agent can understand the brief and still ship a plain screen, or ship a
striking screen built on invented facts.

| | Context understanding | UX correctness | Visual quality | Creative range | Reliability |
| --- | :-: | :-: | :-: | :-: | :-: |
| Order tracking | traps counted | states counted | not scored | — | `ryux scan`, assumptions listed |
| Personal finance app | asked first, traps counted | states counted, comprehension | not scored | — | assumptions listed |
| Explore, judge, critique | — | Critique on planted problems | blind, one designer | three directions | — |
| Typography | — | — | script, blind, one designer | — | — |

Not measured yet: creative range and visual quality with no skill vs RYUX (both are version comparisons so far),
work inside an existing codebase, more than one rater, and agents other than Claude Code.

## Historical

Kept as a record of how RYUX got here, not as evidence for current claims; their findings are covered by the
benchmarks above.

| Benchmark | What it showed then | RYUX | Runs |
| --- | --- | --- | --- |
| [Lumo transaction detail](lumo-td-2.6/) | More states; no added action or promise shown as fact | 2.6.3 | 3 + 3 |
| [Five steps on one screen](case-td-2.6/) | Analyze, Critique, Design, Build, and QA in one session; a case study | 2.6.2 | 1 |

Older runs (RYUX 1.x to 2.4, including the Indonesian-language runs) are kept at the tag
[`archive/docs-2.7.0`](https://github.com/ryuxdsgn/design-intelligence/tree/archive/docs-2.7.0/docs/benchmarks).

## Run one yourself

```bash
pnpm install && pnpm --filter @ryuxdsgn/design-intelligence build
packages/cli/scripts/bench/run.sh A <empty folder outside any repo> <prompt file>   # without RYUX
packages/cli/scripts/bench/run.sh B <empty folder outside any repo> <prompt file> [DESIGN.md]   # with this build
```

Each run is a fresh `claude -p` session in its own empty folder, one at a time. A runs with every skill turned
off; B gets this build of RYUX and the optional DESIGN.md (pass it as a fourth argument). Neither arm gets MCP
servers or your global skills. Design runs need pen.dev open on a cleared canvas. The
[harness README](../../packages/cli/scripts/bench/README.md) has every control and script.

To test more than one brief, [`scenarios/`](scenarios/) holds six repeatable scenarios with a weighted rubric
(results so far: [two of six, RYUX 2.7.0](scenarios/results-2.7.md)).

## How to read the numbers

Every result is a count out of a small number of runs on one model. Treat it as what happened in
those runs, not as a rate. Where visual quality is rated, a designer rates it blind; the folder says how.
Every run so far uses Claude Code; the other supported agents are not benchmarked yet.
