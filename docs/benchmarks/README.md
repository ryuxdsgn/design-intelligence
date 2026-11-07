# Benchmarks

The evidence behind the [README](../../README.md). Each benchmark locks its criteria in a `PROTOCOL.md` before the
first run, gives every run a fresh agent, and reports what happened, including where RYUX lost. Screenshots, GIFs,
and videos live in the [`media` release](https://github.com/ryuxdsgn/design-intelligence/releases/tag/media) to keep the repo small: `docs/benchmarks/x/y.png` is the asset
`benchmarks--x--y.png`.

## How to read the numbers

- **Small samples.** One to three runs per side, on one model, in Claude Code. A count is what those runs did, not
  a rate. The other supported agents are not benchmarked yet.
- **Who rates visual quality.** Since 2.9 it has been the owner, who also leads RYUX, rating blind letters, or an AI
  rater the owner approved. No independent designer has rated a release since 2.9 ([Historical](#historical)).
  Each row says who rated it.
- **Raw outputs.** Most folders hold each run's own files under `runs/`. The two Figma-only benchmarks
  (gold savings landing page, illustration) keep their frames in Figma files and say so.
- **Not a level start, when said.** Some RYUX runs had a DESIGN.md the other side did not; each folder says when.

## Where RYUX helps, and where it doesn't

**It helped:**
- **Facts nobody decided.** Without a skill, agents showed open policies as fact: 25 across three
  [order-tracking](order-tracking/) runs, against 2 with RYUX, and 25 against 3 in
  [wallet detail](wallet-detail/), where all three were real card networks.
- **Things going wrong.** Loading, load error, and offline states in 3 of 3 RYUX order-tracking runs, 0 of 3 without.
- **Asking first.** In wallet detail every RYUX run asked three questions that changed the build; no run without a
  skill asked.
- **An existing repo.** In [billing](billing-dashboard/) both sides wrote the same quality of code. No RYUX run
  invented a billing rule (each run without a skill invented one or two), and every RYUX run checked the page in a
  browser.
- **Illustration through an image model** ([direction A](illustration/#direction-a-in-figma)): 4.18 against 2.82 and
  3.12, owner-rated, not fully blind, one run per side.

**It didn't:**
- **The one blind visual comparison.** On the [gold savings landing page](landing-gold/) against Impeccable, RYUX's
  pages were the more consistent and plausible ones but read as more generic: AI-slop resistance 2.67 against 3.67,
  originality 3.33 against 4.33 (round 5, owner-rated). The changes since shipped in 2.22.0 without a new blind
  round.
- **Hand-drawn vector illustration** (2.20.0) rated lower than no skill on five of six dimensions. 2.21.0 narrowed
  the gap but did not close it.
- **Cost.** A RYUX run cost about 1.5 to 4 times a run without a skill: more turns, more checking.
- **Asking with a design in hand.** Given a wireframe, a DESIGN.md, and a repo, no RYUX run asked first.

## Current benchmarks

| Benchmark | The question it answers | Rated by | RYUX | Runs |
| --- | --- | --- | --- | --- |
| [Gold savings landing page](landing-gold/) | One landing page in desktop and mobile in Figma, facts made up counted and visual quality rated per area. Rounds 2, 3, and 5: Impeccable against RYUX | owner, blind letters | 2.21.0, then branches before 2.22.0 | 1 + 1 + 1 + 1, then 3 + 3 per round |
| [Illustration](illustration/) | Icons, empty states, a mascot, an editorial picture: do they say what they mean, in one style? Hand-drawn vectors, then direction A, where an image model draws | AI rater, owner approved; direction A by the owner, not fully blind | 2.20.0, 2.21.0, 2.22.4 + rule (shipped in 2.22.5) | 8 + 8 + 8, then 1 + 1 + 1 |
| [Food delivery in Figma](food-delivery-figma/) | The food-delivery brief designed in Figma instead of built in code: is it cheaper, and does the difference still show in the frames? A pilot | frames compared, not scored | 2.19.4 | 1 + 1 |
| [Food delivery, DESIGN.md by RYUX](food-delivery-designmd/) | With no DESIGN.md given, does RYUX write one from the brief, then build without inventing policy? Round 2 adds references; round 3 repeats round 2 on 2.19.4 | counted, not scored | main before 2.19.4, 2.19.4 | 1 + 1 + 1 new + 3 |
| [Billing page in an existing repo](billing-dashboard/) | Does a new page fit a real repo: reuse, tokens, checks passing, states covered, no invented billing rule? | counted from each diff | 2.19.3 | 3 + 3 |
| [Wallet, expressive direction](wallet-expressive/) | With a DESIGN.md that asks for character and motion, does RYUX build that direction and still invent no money rule? | counted, not scored | 2.19.3 | 3 new + 3 |
| [Wallet transaction detail](wallet-detail/) | Does the agent ask what changes the build, keep open money rules open, and build the states a money screen needs? | counted, not scored | 2.19.2 | 3 + 3 |
| [Order tracking](order-tracking/) | Does the agent invent policies the brief left open, and build the states for when things go wrong? | counted, not scored | 2.19.0 | 3 + 3 |

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

Not measured yet: creative range, visual quality from more than one human rater, the 2.22.0 design rationale and annotations, and agents other than Claude Code.

## Historical

Kept as a record, not as evidence for current claims. These two hold the only ratings by an independent designer.

| Benchmark | What it showed then | Rated by | RYUX | Runs |
| --- | --- | --- | --- | --- |
| [Explore, judge, critique](explore-judge/) | Real alternatives before one design, and Critique finding planted problems; the way RYUX offers directions was replaced in 2.22.0 | one designer, blind | 2.8 vs 2.9 | 3–6 per condition |
| [Typography](typo-craft/) | Whether one craft rule changed the built result, measured by a script and one blind designer rating; the UI rules have been revised since | script, one designer, blind | 2.9.1 vs 2.9.2 | 3 + 3 |

Older runs are kept at tags: RYUX 2.6 to 2.9 (personal finance in pen.dev, Lumo transaction detail, the five-step
case study, scenario results for 2.7.0) at
[`archive/docs-2.9`](https://github.com/ryuxdsgn/design-intelligence/tree/archive/docs-2.9/docs/benchmarks), and
RYUX 1.x to 2.4, including the Indonesian-language runs, at
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

To test more than one brief, [`scenarios/`](scenarios/) holds six repeatable scenarios with a weighted rubric.
