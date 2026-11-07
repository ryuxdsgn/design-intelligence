# Benchmarks

Three benchmarks, all run on **RYUX 2.22.5** (the current release). Each one compares the same brief with no skill
and with RYUX. Older results are archived at the tag
[`archive/benchmarks-2.22.4`](https://github.com/ryuxdsgn/design-intelligence/tree/archive/benchmarks-2.22.4/docs/benchmarks).

## How to read the numbers

- **The samples are small:** 3 runs per side for code, 2 per side for Figma. These numbers describe these runs, not
  rates.
- **Same setup for both sides:** Opus 5.5, Claude Code `claude -p`, a fresh folder per run, global skills moved
  aside, runs one at a time. The RYUX side gets "Use the ryux skill." before the brief.
- **Criteria were written before the first run** and are listed in each folder.
- **Ratings:**
  - Visual quality was rated blind by the project owner, from shuffled letters.
  - Invented facts and states were counted blind by a fresh AI counter.
  - The owner is not an independent rater.
- **Cost** is the API cost each run reported.

## Results

| Benchmark | Question | No skill | RYUX 2.22.5 | Locked criteria |
| --- | --- | --- | --- | --- |
| [Order tracking](order-tracking/) (code, 3 + 3) | Does it invent policies the brief left open, and build the states for when things go wrong? | 28 invented facts; 3 extra states; asked first 0/3 | 1 invented fact; 5–6 extra states; asked first 3/3 | **Pass** |
| [Landing page](landing-gold/) (Figma, 2 + 2) | Does a landing page fit its product, or read as a template? | owner mean 3.19; originality 2.0 | owner mean 3.69; originality 4.0 | **Pass** |
| [Illustration](illustration/) (Figma, 2 + 2) | Do icons and spot illustrations say what they mean, in one style? | owner mean 3.73 | owner mean 3.30; cohesion higher | **Fail** |

### Where RYUX helps
- **Order tracking:**
  - RYUX asked about open policies before building.
  - It showed almost no invented rules: 1 against 9–10 per no-skill run. Those were refunds, fees, tips, compensation,
    courier ratings, a late guarantee, and a real store name.
  - It built offline, loading, error, and empty states that the no-skill runs did not.
- **Landing page:**
  - Rated more original (4.0 v 2.0), less generic (AI-slop resistance 3.5 v 2.0), a better fit for its context
    (4.0 v 3.0), and more intentional (4.0 v 3.0).
  - No side invented a price, fee, or user count.
  - RYUX labelled its sample figures and used the official store badges; the no-skill pages showed mock data without
    a label and drew their own badges.

### Where it doesn't
- **Illustration:**
  - RYUX lost on concept, craft, and fit at real size. One RYUX icon set drew two services as the same bottle.
  - Neither side used an image model. RYUX's rule to hand illustration to an image model did not trigger without
    being asked.
- **Production on the landing page:** no skill scored higher on production plausibility (4.0 v 3.0) and hierarchy
  (4.0 v 3.5). RYUX left "Sample data" labels and logo slots on the design itself, and one hero had two overlapping
  phones.
- **Cost:** RYUX runs cost more. Order tracking was $3.5–5.3 against $1.6–4.5, landing $4.9–8.5 against $1.8–1.9,
  and illustration $2.2–8.2 against $1.2–1.3.
- **Asking first stops headless runs:** on the landing page, one RYUX run stopped at three style tiles and asked for
  a pick. It needed one reply ("go with the direction you recommend") to build.

## Run one yourself

Each folder has the brief, the reply rule, and the criteria. Run the brief once with no skill and once after
`npx @ryuxdsgn/design-intelligence`. The harness used here is
[`packages/cli/scripts/bench/`](../../packages/cli/scripts/bench/).
