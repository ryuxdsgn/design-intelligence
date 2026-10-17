# RYUX showcase: what it changes, and how we know

> New to RYUX? The [README](../README.md) is the short version. This page is the evidence: what we
> ran, what changed, what did not, and where the raw outputs are so you can check them yourself.

## In 60 seconds

**Same brief, same model, one variable: RYUX.** Each run was a fresh agent in an empty folder.

On the transaction detail screen of a wallet called Lumo (three runs each, RYUX 2.6.3,
[raw outputs](benchmarks/lumo-td-2.6/)):

- **Coverage.** Without RYUX, every run designed Completed, Processing, and Failed. With RYUX, every
  run also designed loading, couldn't load, the report window after 30 days, and the screen at 320 wide.
- **Actions.** Without RYUX, every run added Share or Save receipt as if the brief had asked for it.
  With RYUX, added actions were listed as unconfirmed, for the team to keep or cut.
- **Promises.** Without RYUX, 2 of 3 runs told users "No money was taken" on a failed payment, a
  promise the brief never made. With RYUX, none did.

**How it looks is rated by designers, blind.** In the latest round, a product designer shipped
RYUX 2.9.2's typography in 2 of 3 pairs and found its three directions to be real choices in 2 of 3
sets (see [below](#visual-quality-rated-by-designers)).

**Don't judge the output first. Inspect how the decision was made.**

## Cases

### Lumo · Transaction detail (benchmark, 3 + 3 runs)

<a href="../apps/web/public/proof/lumo-without.png"><img src="../apps/web/public/proof/lumo-without.png" alt="Without RYUX: Completed, Processing and Failed screens for a Rp48.000 card payment, with Share and Save receipt buttons that the brief never mentioned" width="100%"></a>

<a href="../apps/web/public/proof/lumo-with.png"><img src="../apps/web/public/proof/lumo-with.png" alt="With RYUX: Completed, Processing and Failed screens, plus loading, a couldn't-load error, the report window after 30 days, a copied-ID message, and the screen at 320 wide; Share receipt is listed as unconfirmed" width="100%"></a>

Both sides put the fee on its own line and flagged that "Rp48.000 paid" can be read two ways. No run
on either side asked a question before designing. Full table, brief, and method:
[`benchmarks/lumo-td-2.6/`](benchmarks/lumo-td-2.6/).

### One screen through all five steps (case study, RYUX 2.6.2)

One session, five short prompts in order: analyze, critique, improve in pen.dev, build as HTML, QA.
The input was a transaction detail screen an agent had designed without RYUX. One run: a case study,
not a benchmark. [Every turn, raw](benchmarks/case-td-2.6/).

- **Analyze:** labeled every point Observed or Inferred, listed what is unknown, judged nothing.
- **Critique:** 11 findings, most severe first. The top one: only the success version exists. It
  flagged "within 30 days" as a rule with no source.
- **Design:** success, pending, failed, and loading in pen.dev, each change tied to a finding.
- **Build:** one HTML file with the four states, rendered at 390, 375, and 320 wide.
- **QA:** measured the build against the design, fixed 6 differences, re-checked to within 0 to 4 px,
  and listed what it did not test (Safari, a real iPhone, dark mode, the largest text sizes).

**What went wrong:** it asked nothing, so it kept the input's example data. It added "Try again" and
"Your wallet wasn't charged" on its own (flagged, but on screen). The failed screen shows a balance
it worked out ($200.00), not one anyone gave.

### Three directions before one design (RYUX 2.9, 3 + 3 runs, pen.dev)

<a href="benchmarks/explore-judge/three-directions.png"><img src="benchmarks/explore-judge/three-directions.png" alt="Three wallet home directions from one pen.dev run: Counter, Receipt, and Pass, and the Receipt direction built out" width="100%"></a>

A wallet home with "more personality while it stays trustworthy". Every run rendered three
directions that differed on 3 to 5 structural axes, rated them against the brief, and built one out;
RYUX 2.8 built one concept straight away. The designer picked a different direction than RYUX
recommended in all three sets, which is why the pick stays with the person.
[Details](benchmarks/explore-judge/).

### Typography and craft (RYUX 2.9.1 vs 2.9.2, 3 + 3 runs, measured)

<a href="benchmarks/typo-craft/typography-measure.png"><img src="benchmarks/typo-craft/typography-measure.png" alt="The same help paragraph from two runs: RYUX 2.9.1 at 91 characters per line, RYUX 2.9.2 at 75" width="100%"></a>

The same Billing page, scored by a script on nine typography and craft checks. 2.9.2 scored higher
in 2 of 3 pairs and tied the third; every 2.9.1 run set paragraphs in `ch` units and ran to about 90
characters per line. [Scorer, prompt, and all six pages](benchmarks/typo-craft/).

### Scenario suite (RYUX 2.7.0, one run per side)

Six repeatable scenarios with a weighted rubric; two have been run
([results](benchmarks/scenarios/results-2.7.md)).

- **Critique a poor page.** Both sides found all 11 planted defects, so RYUX adds no recall here.
  With RYUX, the agent rendered the page before judging (finding clipping at 320 and a low-contrast
  input border), and gave every finding a severity, confidence, and status.
- **Build a form with validation and recovery.** Both built working, accessible forms. Without RYUX,
  the form showed 3 rules the brief never gave (a tax hint, USD as currency, a bank account length).
  With RYUX, none: it asked about them instead.

## Visual quality, rated by designers

Looks are judged by people, blind: sides shuffled, nothing labeled. Each round turns the designers'
reasons into the next change.

- **Early rounds (RYUX 2.5–2.8).** Wallet home pairs scored about even (3.67 without RYUX, 3.71 with
  it, on eight areas). The reasons given for not shipping were mostly hierarchy: a control far from its
  data, an action crowding the navigation, a fact shown twice. Those became RYUX's hierarchy pass,
  which now finds "control far from its data" in 4 of 6 planted cases, up from 0 of 6.
- **An AI judge is not the target.** In 18 blind comparisons it preferred dense, conventional layouts,
  including content the brief never gave, so ratings come from designers.
- **Latest round (RYUX 2.9).** Typography: the 2.9.2 page shipped in 2 of 3 pairs. Three directions:
  real choices in 2 of 3 sets; final wallet screens one each, and one pair neither.
- **Next: motion.** Watching recorded menus, dialogs, toasts, tabs, and drawers, the designer
  preferred the plain agent's motion in all five, for its easing and purpose. RYUX keeps frequent
  menus and tabs almost still; the next change gives them a short, reversible transition, to be
  re-rated before it ships.

## Where RYUX is going next

- **Asking before designing.** RYUX asks when a missing answer would change the design. Since 2.6.4 it
  asks on prompts with no context (2 of 2 runs, up from 0 of 2); on detailed briefs it designs around
  what is open and lists it.
- **Reasoning with reference screens.** The runs here rate their evidence None because the hosted
  RYUX MCP is not live yet. It is the next layer: real reference screens behind each decision.

## Reproduce it

The harness and the rules for a fair run are in [`benchmarks/`](benchmarks/README.md#run-one-yourself).
In short: a fresh agent per run in an empty folder outside any project, the same model and prompt
for both sides, answers to questions only from a fact sheet, a cleared pen.dev canvas per run. Decide
before looking which pair you will show, and publish every run.

## Limitations

- **Small samples.** Three runs per side at most, often one.
- **Counted by us.** The counts come from the outputs and were made by the operator.
- **One model.** We compare with and without RYUX on one model, and cannot separate the model's
  share from RYUX's.
- **One design tool.** Every design run used pen.dev.

## History

Earlier runs (RYUX 1.x to 2.4: the Indonesian-language runs, the English 2.3.3 set that left the
currency open as `[CUR]`, and the early before/after playbook with the MCP) are kept at the tag
[`archive/docs-2.7.0`](https://github.com/ryuxdsgn/design-intelligence/tree/archive/docs-2.7.0/docs).
RYUX no longer works the way some of them show. For example, it now fills mockups with labeled sample
data instead of placeholders.
