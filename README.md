<p align="center">
  <a href="https://www.npmjs.com/package/@ryuxdsgn/design-intelligence"><img src="https://img.shields.io/badge/version-early__access%20v2.19-1f6feb" alt="Version: early access v2.19"></a>
  <a href="https://github.com/ryuxdsgn/design-intelligence/actions/workflows/ci.yml"><img src="https://github.com/ryuxdsgn/design-intelligence/actions/workflows/ci.yml/badge.svg" alt="CI"></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/license-MIT-2ea44f" alt="MIT License"></a>
</p>

# RYUX

### Understand before you design.

A design skill for AI agents. Your agent stops filling the gaps in your brief with invented fees, promos, and
policies, builds the screens for when things go wrong, and tells you what it checked.

```bash
npx @ryuxdsgn/design-intelligence
```

Works with Claude Code, Codex, Cursor, Gemini CLI, GitHub Copilot, OpenCode, Cline, Amp, Kimi Code, and
Antigravity. Free, MIT.

## See the difference

Same brief, same model, a fresh agent per run: a personal finance app designed in pen.dev.

<a href="docs/benchmarks/hero-finance/"><img src="docs/benchmarks/hero-finance/see-the-difference.gif" alt="Animation: the same brief; with no skill the agent draws right away, with RYUX it asks three questions first; then both sets of screens; close-ups with seven invented facts circled on the left and labeled assumptions on the right; seven states drawn on the right and none on the left; then the totals across three runs, and a follow-up turn on the RYUX side with its recorded success animation" width="100%"></a>

Both sides look finished. The difference is in what the agent decided on your behalf. Two briefs, three runs
per side each:

| | Finance app<br>no skill | Finance app<br>with RYUX | Order tracking<br>no skill | Order tracking<br>with RYUX |
| --- | :-: | :-: | :-: | :-: |
| **Things the brief never gave, shown as real** (per run) | 7–9 | 0 | 8–9 | 0–1 |
| **Screens for when things go wrong** (per run) | 0 | 6–7 | 0 | 3 |
| **Asked before starting** | 0 of 3 | 3 of 3 | 0 of 3 | 0 of 3 |

Without a skill, the agents invented points, promos, a PayLater limit, and vouchers for the finance app, and a
$5 late credit, free cancellation, an auto-pick timer, and tips for order tracking. With RYUX, the same gaps
were listed as assumptions, and the agents built loading, empty, offline, error, and declined states. On order
tracking no RYUX run asked first; each built, left the open policies out, and said so: *"Left out on purpose:
calling the courier, cancelling the order, compensation for lateness, and fees, because I don't know your
policies."*

[Finance app](docs/benchmarks/hero-finance/): designed in pen.dev, RYUX 2.9.3.
[Order tracking](docs/benchmarks/order-tracking/): a working prototype, RYUX 2.19.0. Briefs, method, and every
run are in each folder.

## Why

An agent can produce a screen that looks finished without the product context behind it, and the gaps
quietly become content: an invented fee, a feature nobody confirmed, a promise the product never made. Each
one is a business decision nobody made. RYUX makes the agent sort what it is working with first:

- **Known**: stated in the prompt, DESIGN.md, or your product docs, or seen in the design itself.
- **Design assumptions**: low-risk choices made from the context, written down.
- **Unconfirmed capabilities**: actions products like yours usually have, proposed and labeled unconfirmed.
- **Facts, policies, and claims**: fees, refund times, guarantees. Never invented.

Each major choice comes with a receipt. This one is quoted from a benchmark run:

```
Decision     Amount + Fee = Total paid, shown in the card
Evidence     None
Confidence   Low
Assumption   [CONFIRM] The fee is charged on top of the amount.
             If the fee is taken out of the amount instead, the rows change.
```

## Use it

Say what you are doing, in your own words. RYUX picks the step and reads only the knowledge it needs.

| You say | RYUX runs | You get |
| --- | --- | --- |
| "Analyze this checkout screen" (screenshot attached) | **Analyze** | what is there, what is measured, what is only inferred |
| "Design the transaction detail screen for our wallet, in pen.dev" | **Design** | two or three directions to pick from, then the screens and their states |
| "Build this design in our React app" | **Build** | the code, without invented rules, data, or API behavior |
| "Critique our pricing page at https://example.com/pricing" | **Critique** | what to change first, with severity, evidence, and a fix |
| "QA the build against the design at 390 and 320 wide" | **QA** | a check of every width and state against the design |

Every task ends with a report of what was verified and what was not. The installer also offers a short setup
that writes DESIGN.md, your project's direction (`npx @ryuxdsgn/design-intelligence setup` to change it).

## Scan your code

`scan` checks what a machine can see, with no LLM and no API key. A fail exits 1, so it works in CI.

```text
$ npx @ryuxdsgn/design-intelligence scan src
✗ src/Checkout.tsx:4:7 RX-A11Y-04 an <img> with no alt: describe meaningful images, use alt="" for decorative ones
✗ src/Checkout.tsx:5:16 RX-CD-02 "Rp 50.000": write Rp1.250.000 (Rp right before the number, dots for thousands, no decimals)
! src/Checkout.tsx:6:10 RX-AS-04 "Only 2 left": urgency copy; keep it only when the deadline or quota is real, stated as a plain fact
! src/Checkout.tsx:7:7 RX-A11Y-04 an icon-only <button> with no name: add aria-label or visually hidden text

1 file scanned: 2 fail, 2 warn.
```

Give it a URL and it renders the page at 320, 390, and 1280 px and measures sideways scroll, contrast, target
size, and colliding text (Playwright in your project):

```text
$ npx @ryuxdsgn/design-intelligence scan file://$PWD/page.html --widths 320
✗ file:///…/page.html @320px RX-RD-01 the page scrolls sideways: 480px of content in 320px; widest: div.promo (to 480px) [div.promo]
✗ file:///…/page.html @320px RX-A11Y-01 "Transfers usually arrive in minutes.": contrast 2.32:1 (#aaaaaa on #ffffff), needs 4.5:1 [p.hint]
```

Add `--hook` to `install` and Claude Code gets the findings for each file it edits. `scan --list-rules` lists
every check.

<details>
<summary><b>Other ways to install</b></summary>

- [skills.sh](https://skills.sh): `npx skills add ryuxdsgn/design-intelligence`
- Claude Code plugin: `/plugin marketplace add ryuxdsgn/design-intelligence`, then
  `/plugin install ryux@design-intelligence`
- Plugins for Codex, GitHub Copilot, VS Code, and Gemini CLI, global installs, and updates: see the
  [guide](GUIDE.md).

</details>

<details>
<summary><b>All benchmarks</b></summary>

Each benchmark fixes its criteria before the first run, uses a fresh agent per run, and publishes the raw
outputs. Counts come from a few runs on one model: what those runs did, not rates.

| Benchmark | What it tests | Runs |
| --- | --- | --- |
| [Personal finance app](docs/benchmarks/hero-finance/) | Asking first, invented facts, and states, designed in pen.dev | 3 + 3 |
| [Order tracking](docs/benchmarks/order-tracking/) | Invented policies, failure states, and `scan` results in a working prototype | 3 + 3 |
| [Lumo transaction detail](docs/benchmarks/lumo-td-2.6/) | States covered; actions and promises the brief didn't give | 3 + 3 |
| [Typography](docs/benchmarks/typo-craft/) | Line length, line-height, and weights, scored by a script; one blind designer rating | 3 + 3 |
| [Explore, judge, critique](docs/benchmarks/explore-judge/) | Three directions before one design; planted problems found in Critique | 3–6 per condition |
| [Five steps on one screen](docs/benchmarks/case-td-2.6/) | Analyze, Critique, Design, Build, and QA in one session; a case study | 1 |
| [Scenarios](docs/benchmarks/scenarios/) | Six repeatable scenarios with a weighted rubric | 1 + 1 each |

The [showcase](docs/showcase.md) reads them in context.

</details>

<details>
<summary><b>What gets installed, and the repository</b></summary>

One skill folder, `ryux/`: a router (`SKILL.md`) that picks the step, five capability files, and the knowledge
modules those steps read. Behind every step runs one workflow: understand, frame the problem, explore two or
three alternatives, evaluate them against the brief (you pick), build and critique, then verify. Rules have
levels (Required, Preferred, Contextual) and a few Hard Gates that are never waived, such as no invented
numbers and no missing critical states. Browse them in [`skills/ryux/`](./skills/ryux) and
[`docs/design-rules.md`](./docs/design-rules.md).

```
packages/cli/     the ryux CLI (npx @ryuxdsgn/design-intelligence)
skills/ryux/      the RYUX skill, generated from packages/cli/src
docs/             design rules, showcase, benchmarks
```

```bash
pnpm install && pnpm typecheck && pnpm test
```

Issues and pull requests are welcome. Rules and skills are generated from `packages/cli/src`; run
`pnpm sync:skills` after changing them. Designers who want to rate the next blind round: open an issue. To
report a vulnerability, see [SECURITY.md](./SECURITY.md).

</details>

## Status and license

RYUX 2.19, early access. Available now: the skill, the CLI with `scan`, skills.sh, and the Claude Code
plugin. Coming: an optional MCP with reference screens from real products. RYUX works fully without it; the
reference data is private and not in this repository.

**MIT**, © 2026 ryux.design (see [LICENSE](./LICENSE)). The code and the RYUX skill are covered by this
license; the reference data and the hosted service are separate. Assets in this repository are synthetic
outputs and illustrations created for RYUX experiments and its website, unless otherwise noted. Brand names may
appear as text in mock interfaces and do not indicate affiliation.
