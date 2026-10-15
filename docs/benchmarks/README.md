# Benchmarks

Raw outputs behind every claim in the [README](../../README.md) and the [showcase](../showcase.md).
Everything in a run folder is the agent's own output; the only edits are removed local paths, and
each folder says what was edited.

| Folder | What it tests | RYUX | Runs |
| --- | --- | --- | --- |
| [`lumo-td-2.6/`](lumo-td-2.6/) | Transaction detail from one brief, with and without RYUX: states covered, actions and promises the brief didn't give | 2.6.3 | 3 + 3 |
| [`case-td-2.6/`](case-td-2.6/) | One screen through all five steps in one session: analyze, critique, design in pen.dev, build, QA | 2.6.2 | 1 (case study) |
| [`scenarios/`](scenarios/) | Six repeatable scenarios with a weighted rubric; [results for 2.7.0](scenarios/results-2.7.md) cover two of them | 2.7.0 | 1 + 1 per scenario |

## Run one yourself

```bash
pnpm install && pnpm --filter @ryuxdsgn/design-intelligence build
packages/cli/scripts/bench/run.sh A <empty folder outside any repo> <prompt file>   # without RYUX
packages/cli/scripts/bench/run.sh B <empty folder outside any repo> <prompt file>   # with this build
```

Each run is a fresh `claude -p` session in its own empty folder. The global RYUX skill is moved
aside during the run, so A really runs without RYUX. Design runs need pen.dev open on a cleared
canvas.

## How to read the numbers

Every result is a count out of a small number of runs on one model. Treat it as what happened in
those runs, not as a rate. Visual quality is not measured here (see the showcase).

Older runs (RYUX 1.x to 2.4, including the Indonesian-language runs) are kept at the tag
[`archive/docs-2.7.0`](https://github.com/ryuxdsgn/design-intelligence/tree/archive/docs-2.7.0/docs/benchmarks).
