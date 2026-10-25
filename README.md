<p align="center">
  <a href="https://www.npmjs.com/package/@ryuxdsgn/design-intelligence"><img src="https://img.shields.io/badge/version-early__access%20v2.19-1f6feb" alt="Version: early access v2.19"></a>
  <a href="https://github.com/ryuxdsgn/design-intelligence/actions/workflows/ci.yml"><img src="https://github.com/ryuxdsgn/design-intelligence/actions/workflows/ci.yml/badge.svg" alt="CI"></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/license-MIT-2ea44f" alt="MIT License"></a>
</p>

# RYUX

### Understand before you design.

A design skill for AI agents: it asks before it invents, draws the loading, error, and empty states,
and checks the result.

```bash
npx @ryuxdsgn/design-intelligence
```

Works with Claude Code, Codex, Cursor, Gemini CLI, GitHub Copilot, OpenCode, Cline, Amp, Kimi Code,
and Antigravity.

**[Get started](#get-started)** · **[See the benchmark](#see-the-difference)** · **[Scan your code](#scan-your-code)** · **[Documentation](GUIDE.md)**

## See the difference

Same brief, same model, a fresh agent per run: a personal finance app designed in pen.dev.

<a href="docs/benchmarks/hero-finance/"><img src="docs/benchmarks/hero-finance/see-the-difference.gif" alt="Animation: the same brief; with no skill the agent draws right away, with RYUX it asks three questions first; then both sets of screens; close-ups with seven invented facts circled on the left and labeled assumptions on the right; seven states drawn on the right and none on the left; then the totals across three runs, and a follow-up turn on the RYUX side with its recorded success animation" width="100%"></a>

Both sides look finished, and a fresh reader understood both dashboards (3 of 3 questions). The
decisions differ:

- **Asking.** With no skill, the agent drew right away and picked a market and currency itself. With
  RYUX, it asked three questions first, in 3 of 3 runs.
- **Facts.** With no skill, 7 to 9 kinds of things the brief never gave were shown as real: points,
  promos, a PayLater limit with "0% fee", vouchers, ride and travel services. With RYUX, none; the fee
  and how a payment is confirmed were listed as assumptions.
- **States.** With no skill, the three screens only. With RYUX, 6 to 7 more: loading, empty, offline,
  processing, not enough balance, declined, and a narrow width.

Three runs per side, RYUX 2.9.3; brand names in the no-skill screens are blurred.
[Brief, method, and every run](docs/benchmarks/hero-finance/).

## Why RYUX

An agent can produce a screen that looks finished without the product context behind it, and the
gaps quietly become content: an invented fee, a feature nobody confirmed, a promise the product
never made. RYUX makes the agent sort what it is working with before it designs:

- **Known**: stated in the prompt, DESIGN.md, or your product docs, or seen in the design itself.
- **Design assumptions**: low-risk choices made from the context, written down.
- **Unconfirmed capabilities**: actions products like yours usually have, proposed and labeled
  unconfirmed.
- **Facts, policies, and claims**: fees, refund times, guarantees. Never invented.

Each major choice comes with a receipt. This one is quoted from a benchmark run:

```
Decision     Amount + Fee = Total paid, shown in the card
Evidence     None
Confidence   Low
Assumption   [CONFIRM] The fee is charged on top of the amount.
             If the fee is taken out of the amount instead, the rows change.
```

For product designers using AI to explore screens, developers with AI coding agents, and design
engineers who connect design, build, critique, and QA.

## How it works

Say what you are doing, in your own words. RYUX picks the step and reads only the knowledge it needs.
Behind every capability runs one workflow: understand, frame the problem, explore two or three
alternatives, evaluate them against the brief (you pick), build and critique, then verify.

| Capability | What it does |
| --- | --- |
| **Analyze** | Understands an existing interface: what is there, what is measured, what is inferred |
| **Design** | Turns context into UX, UI, and motion direction, in Figma, pen.dev, or a mockup |
| **Build** | Implements the decisions in your stack without inventing rules, data, or API behavior |
| **Critique** | Finds what to change first, with severity, evidence, and a fix, or runs a heuristic evaluation |
| **QA** | Checks the build against the design at each width and state |

```text
Analyze this checkout screen (screenshot attached).                → Analyze
Design the transaction detail screen for our wallet, in pen.dev.   → Design
Build this design in our React app.                                → Build
Critique our pricing page at https://example.com/pricing.          → Critique
QA the build against the design at 390 and 320 wide.               → QA
```

Every task ends with a report of what was verified and what was not. More in [Prompting RYUX](GUIDE.md#prompting-ryux).

## Get started

```bash
npx @ryuxdsgn/design-intelligence
```

It asks which agents you use, installs RYUX, and offers a short setup that writes DESIGN.md, your
project's direction. Run `npx @ryuxdsgn/design-intelligence setup` any time to change it.

Also available through [skills.sh](https://skills.sh) (`npx skills add ryuxdsgn/design-intelligence`)
and as a plugin for Claude Code (`/plugin marketplace add ryuxdsgn/design-intelligence`, then
`/plugin install ryux@design-intelligence`), Codex, GitHub Copilot, VS Code, and Gemini CLI. The
[guide](GUIDE.md) covers each agent's install, global installs, updates, and the MCP.

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

Give it a URL and it renders the page at 320, 390, and 1280 px and measures sideways scroll,
contrast, target size, and colliding text (Playwright in your project):

```text
$ npx @ryuxdsgn/design-intelligence scan file://$PWD/page.html --widths 320
✗ file:///…/page.html @320px RX-RD-01 the page scrolls sideways: 480px of content in 320px; widest: div.promo (to 480px) [div.promo]
✗ file:///…/page.html @320px RX-A11Y-01 "Transfers usually arrive in minutes.": contrast 2.32:1 (#aaaaaa on #ffffff), needs 4.5:1 [p.hint]
```

Add `--hook` to `install` and Claude Code gets the findings for each file it edits.
`scan --list-rules` lists every check and the rule behind it ([guide](GUIDE.md#scan-your-code)).

## Benchmarks

Each benchmark fixes its criteria before the first run, uses a fresh agent per run, and publishes the
raw outputs.

| Benchmark | What it showed | Runs |
| --- | --- | --- |
| [Personal finance app](docs/benchmarks/hero-finance/) | Asked first in 3 of 3 runs; no fact the brief did not give; 6 to 7 more states | 3 + 3 |
| [Lumo transaction detail](docs/benchmarks/lumo-td-2.6/) | More states covered; no added action or promise shown as fact | 3 + 3 |
| [Typography](docs/benchmarks/typo-craft/) ([run it yourself](docs/benchmarks/typo-craft/#run-it-yourself)) | Paragraph lines down to 75–77 characters in 2 of 3 runs (from about 90); a designer shipped it in 2 of 3 blind pairs | 3 + 3, one rater |
| [Explore, judge, critique](docs/benchmarks/explore-judge/) | Three structurally different directions in every run, real choices to the designer in 2 of 3 sets; "control far from its data" found in 4 of 6 planted cases, up from 0, with no false findings | 3–6 per condition |
| [Five steps on one screen](docs/benchmarks/case-td-2.6/) | One screen through Analyze, Critique, Design, Build, and QA; a case study, every turn published | 1 |
| [Scenarios](docs/benchmarks/scenarios/) | Six repeatable scenarios: does RYUX change the decisions and the built result | 1 + 1 each |

Counts come from a few runs on one model. The [showcase](docs/showcase.md) reads them in context,
including what designers picked and what is being improved next.

<details>
<summary><b>Technical details</b></summary>

### What gets installed

One skill folder, `ryux/`: a router (`SKILL.md`) that picks the step, five capability files, and
the knowledge modules those steps read. Rules have levels (Required, Preferred, Contextual) and a
few Hard Gates that are never waived, such as no invented numbers and no missing critical states.
Browse them in [`skills/ryux/`](./skills/ryux) and [`docs/design-rules.md`](./docs/design-rules.md).

### MCP

RYUX works fully on its own. An optional MCP for reference screens from real products is coming; it
is not available to install yet.

### Reference data

RYUX may use reference screens and product evidence during analysis. Private reference data is not
included in this repository; the repository contains the rules and the skill that work with evidence.

### Repository

```
packages/cli/     the ryux CLI (npx @ryuxdsgn/design-intelligence)
skills/ryux/      the RYUX skill, generated from packages/cli/src
docs/             design rules, showcase, benchmarks
```

```bash
pnpm install
pnpm test
pnpm typecheck
```

### Further reading

- [GUIDE.md](GUIDE.md): install, MCP, and how RYUX reasons
- [docs/design-rules.md](docs/design-rules.md): every rule, level, and gate
- [docs/showcase.md](docs/showcase.md): every case, in context
- [docs/benchmarks/](docs/benchmarks/): every raw run, and how to run one yourself

</details>

## Contributing

Issues and pull requests are welcome on [GitHub](https://github.com/ryuxdsgn/design-intelligence).
Rules and skills are generated from `packages/cli/src`; run `pnpm sync:skills` after changing them.
Designers who want to rate the next blind round: open an issue and say so. To report a
vulnerability, see [SECURITY.md](./SECURITY.md).

## Status and license

RYUX 2.19, early access, free. Available now: the skill, the CLI with `scan`, skills.sh, and the
Claude Code plugin. Coming: the optional reference-screen MCP and a larger reference library.

**MIT**, © 2026 ryux.design (see [LICENSE](./LICENSE)). The code and the RYUX skill are covered by
this license. The reference data and the hosted service are separate.

Assets in this repository are synthetic outputs and illustrations created for RYUX experiments and
its website, unless otherwise noted. Brand names may appear as text in mock interfaces and do not
indicate affiliation.
