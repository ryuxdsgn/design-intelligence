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

**What did not change:** how good the screens look. That is unproven (see
[below](#what-ryux-has-not-proven)).

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

### Scenario suite (RYUX 2.7.0, one run per side)

Six repeatable scenarios with a weighted rubric; two have been run
([results](benchmarks/scenarios/results-2.7.md)).

- **Critique a poor page.** Both sides found all 11 planted defects, so RYUX adds no recall here.
  With RYUX, the agent rendered the page before judging (finding clipping at 320 and a low-contrast
  input border), and gave every finding a severity, confidence, and status.
- **Build a form with validation and recovery.** Both built working, accessible forms. Without RYUX,
  the form showed 3 rules the brief never gave (a tax hint, USD as currency, a bank account length).
  With RYUX, none: it asked about them instead.

## What RYUX has not proven

**Visual quality.** Every test so far says RYUX does not make screens look better:

- Wallet home, three pairs scored blind by one person on eight areas: 3.67 without RYUX, 3.71 with
  it. One pair dropped by 1.25; no area moved the same way in all three pairs.
- An AI judge (18 blind comparisons) preferred the runs without RYUX in 17. Its reasons rewarded dense,
  conventional layouts, including content the brief never gave. So an AI judge cannot be the target.
- Two human designers rated later pairs. Both preferred the runs without RYUX in most pairs, and
  judged the RYUX runs more AI-looking in most of them. Two raters is too few for a claim either way.

**Asking before designing.** RYUX is meant to ask when a missing answer would change the design. In
the Lumo runs and the five-step case, it asked nothing and designed around the unknowns instead.
2.6.4 changed this for prompts with no context at all (0 of 2 runs asked before, 2 of 2 after).
More runs are needed.

**Reasoning with reference screens.** The hosted ryux MCP is not live, so every run here rates its
evidence None. None of these runs says anything about reasoning with real reference screens.

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
