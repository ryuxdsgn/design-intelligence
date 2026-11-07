# Benchmarks

Raw outputs behind every claim in the [README](../../README.md) and the [showcase](../showcase.md).
Everything in a run folder is the agent's own output; the only edits are removed local paths, and
each folder says what was edited. Screenshots, GIFs, and videos live in the
[`media` release](https://github.com/ryuxdsgn/design-intelligence/releases/tag/media) to keep the
repo small: `docs/benchmarks/x/y.png` is the asset `benchmarks--x--y.png`.

## Current evidence

| Benchmark | The question it answers | RYUX | Runs |
| --- | --- | --- | --- |
| [Gold savings landing page](landing-gold/) | One brief for a landing page in desktop and mobile in Figma, rated blind by the owner per area, with facts made up and Figma craft counted. Round 1: no skill, antislop, and RYUX (its Impeccable arm ran an old RYUX router instead). Rounds 2, 3, and 5: Impeccable vs RYUX, three runs each; round 5 ran the direction rules that shipped in 2.22.0 | 2.21.0, then a branch before 2.22.0 | 1 + 1 + 1 + 1, then 3 + 3 per round |
| [Food delivery in Figma](food-delivery-figma/) | The food-delivery brief designed in Figma instead of built in code, through the Figma connector: is it cheaper, and does the difference still show in the frames? A pilot, one run per side | 2.19.4 | 1 + 1 |
| [Illustration](illustration/) | Icons, empty states, a mascot, an editorial picture: do they say what they mean, in one style? Hand-drawn vectors rated blind by an AI rater the owner approved (2.20.0, 2.21.0). Then direction A in Figma, where RYUX directs and an image model draws, rated by the owner: 4.18 against no skill's 2.82 and 3.12 | 2.20.0, 2.21.0, 2.22.4 + rule (shipped 2.22.5) | 8 + 8 + 8, then 1 + 1 + 1 |
| [Food delivery, DESIGN.md by RYUX](food-delivery-designmd/) | With no DESIGN.md given, does RYUX write one from the brief that answers who, which job, what evidence, which patterns, and how to evaluate, then build without inventing policy? Round 2 adds two references (Airbnb's look, a ride-hailing motion study). One RYUX run per round against order-tracking's no-skill runs | main before 2.19.4 | 1 + 1 new + 3 |
| [Billing page in an existing repo](billing-dashboard/) | Does a new page fit a real repo: reuse, tokens, checks passing, states covered, no invented billing rule? A React + TS fixture, no skill vs RYUX + DESIGN.md, measured from each run's diff | 2.19.3 | 3 + 3 |
| [Wallet, expressive direction](wallet-expressive/) | With a DESIGN.md that asks for character and motion, does RYUX build that direction and still ask first, invent no money rule, and cover the states? Three new RYUX runs against wallet-detail's no-skill runs, with motion counted per event | 2.19.3 | 3 new + 3 |
| [Wallet transaction detail](wallet-detail/) | Does the agent ask what changes the build, keep open money rules open, and build the states a money screen needs? One HTML file, no skill vs RYUX + DESIGN.md, with `ryux scan` and cost per run | 2.19.2 | 3 + 3 |
| [Order tracking](order-tracking/) | Does the agent invent policies the brief left open, and build the states for when things go wrong? A working prototype, no skill vs RYUX + DESIGN.md, with `ryux scan` | 2.19.0 | 3 + 3 |

### What each one measures

Five dimensions, kept apart on purpose: an agent can understand the brief and still ship a plain screen, or ship a
striking screen built on invented facts.

| | Context understanding | UX correctness | Visual quality | Creative range | Reliability |
| --- | :-: | :-: | :-: | :-: | :-: |
| Gold savings landing page | facts made up, counted | — | blind, one rater, per area | — | text styles, variables, cost |
| Food delivery in Figma | asked first, traps counted | states counted | frames compared, not scored | — | cost |
| Illustration | — | — | blind AI rater, owner approved; direction A rated by the owner | — | technical floor, cost |
| Billing page in an existing repo | traps counted | scenarios reached | not scored | — | typecheck, tests, build, reuse, tokens, `ryux scan`, cost |
| Wallet, expressive direction | asked first, traps counted | states counted | not scored yet; motion events and direction counted | — | `ryux scan`, cost |
| Wallet transaction detail | asked first, traps counted | statuses and states counted | not scored | — | `ryux scan`, assumptions listed, cost |
| Order tracking | traps counted | states counted | not scored | — | `ryux scan`, assumptions listed |

Not measured yet: creative range with no skill vs RYUX, visual quality from more than one human rater, the 2.22.0 design rationale and annotations, and agents other than Claude Code.

## Historical

Kept as a record of how RYUX got here, not as evidence for current claims; their findings are covered by the
benchmarks above.

| Benchmark | What it showed then | RYUX | Runs |
| --- | --- | --- | --- |
| [Personal finance app](hero-finance/) | Designed in pen.dev: RYUX asked first in 3 of 3 runs and showed no fact the brief left out, no skill 7 to 9 kinds per run; covered since by the 2.19 benchmarks | 2.9.3 | 3 + 3 |
| [Explore, judge, critique](explore-judge/) | Real alternatives before one design, and Critique finding planted problems, rated blind by a designer; the way RYUX offers directions was replaced in 2.22.0 | 2.8 vs 2.9 | 3–6 per condition |
| [Typography](typo-craft/) | Whether one craft rule changed the built result, measured by a script and one blind designer rating; the UI rules have been revised since | 2.9.1 vs 2.9.2 | 3 + 3 |
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
