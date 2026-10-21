<p align="center">
  <a href="https://www.npmjs.com/package/@ryuxdsgn/design-intelligence"><img src="https://img.shields.io/badge/version-early__access%20v2.13-1f6feb" alt="Version: early access v2.13"></a>
  <a href="https://github.com/ryuxdsgn/design-intelligence/actions/workflows/ci.yml"><img src="https://github.com/ryuxdsgn/design-intelligence/actions/workflows/ci.yml/badge.svg" alt="CI"></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/license-MIT-2ea44f" alt="MIT License"></a>
</p>

# RYUX

### Understand before you design.

AI can generate UI in seconds. But does it understand what it's designing?

RYUX helps AI agents make better-informed design decisions. It gives them a structured way to
understand product context, separate facts from assumptions, decide, and verify the result.

**The goal isn't more UI. It's fewer decisions made silently.**

**[Get started](#get-started)** · **[See the benchmark](#see-the-difference)** · **[Documentation](GUIDE.md)**

## See the difference

Same brief, same model, a fresh agent per run: a personal finance app with a dashboard, a payment,
and the payment success screen, designed in pen.dev. Run 1 of each side, chosen before the runs.

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

Three runs per side, RYUX 2.9.3. The end of the clip is a follow-up turn on the RYUX side only
("more modern, simpler, a success that feels like a thank-you"), recorded from the build it made.
Real brand names in the no-skill screens are blurred.
[Brief, method, and every run](docs/benchmarks/hero-finance/).

## Who it's for

- **Product designers** using AI to explore and produce screens, who want the UX decisions to stay
  visible and checkable.
- **Developers with AI coding agents** who want fewer product and design decisions made on guesses.
- **Design engineers** connecting design direction, implementation, critique, and visual QA.

## The problem and the approach

- AI can generate an interface without the product context behind it.
- Missing information quietly turns into assumptions on screen: an invented fee, a feature nobody
  confirmed, a promise the product never made.
- A screen that looks complete is not necessarily correct.

RYUX sorts what the agent is working with before it designs:

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

## Benchmarks

Each benchmark fixes its criteria before the first run, uses a fresh agent per run, and publishes the
raw outputs. What each one shows, and its scope:

- **Asking, invented facts, and states** (personal finance, above): asked first in 3 of 3 runs, no
  fact shown that the brief did not give, 6 to 7 more states. 3 + 3 runs, counts only.
- **States and promises** (Lumo transaction detail): more states covered, and no added action or
  promise shown as fact. 3 + 3 runs.
- **Typography**: on one Billing page, RYUX 2.9.2 brought paragraph lines down to 75–77 characters
  in 2 of 3 runs (2.9.1: about 90 in all three) and scored higher on nine checks in 2 of 3 pairs; a product designer shipped the 2.9.2 page
  in 2 of 3 blind pairs. 3 + 3 runs, one rater.
- **Three directions**: on an expressive brief, every run rendered three structurally different
  directions before building one; the designer found them real choices in 2 of 3 sets. 3 runs, one
  rater.
- **Hierarchy in Critique**: on screens with planted defects, "control far from its data" was found
  in 4 of 6 cases, up from 0 of 6, with no false findings. 3 runs per condition.

| Benchmark | Runs |
| --- | --- |
| [Personal finance app](docs/benchmarks/hero-finance/) | 3 + 3 |
| [Lumo transaction detail](docs/benchmarks/lumo-td-2.6/) | 3 + 3 |
| [Typography](docs/benchmarks/typo-craft/) (scorer included, [run it yourself](docs/benchmarks/typo-craft/#run-it-yourself)) | 3 + 3 |
| [Explore, judge, critique](docs/benchmarks/explore-judge/) | 3–6 per condition |
| [Five steps on one screen](docs/benchmarks/case-td-2.6/) | 1 |
| [Scenarios](docs/benchmarks/scenarios/) | 1 + 1 each |

Counts come from a few runs on one model. The [showcase](docs/showcase.md) reads them in context,
including what designers picked and what is being improved next.

<details>
<summary><b>Technical details</b></summary>

### What gets installed

One skill folder, `ryux/`: a router (`SKILL.md`) that picks the step, five capability files, and
the knowledge modules those steps read. Rules have levels (Required, Preferred, Contextual) and a
few Hard Gates that are never waived, such as no invented numbers and no missing critical states.
Browse them in [`skills/ryux/`](./skills/ryux) and [`docs/design-rules.md`](./docs/design-rules.md).

### MCP tools

RYUX works on its own. The hosted RYUX MCP for reference screens is coming; the server runs locally
with sample data. Nine tools: research (`search_screens`, `get_flow`, `get_local_pattern`,
`compare_apps`, `extract_design_direction`) and review (`audit_ui`, `audit_copy`, `heuristic_eval`,
`delivery_gate`). See [`apps/mcp/README.md`](./apps/mcp/README.md).

### Reference data

RYUX may use reference screens and product evidence during analysis. Private reference data is not
included in this repository; the repository contains the schemas, rules, and tooling used to work
with evidence.

### Repository

```
apps/mcp/         MCP server (Cloudflare Workers)
apps/web/         ryux.design (Next.js)
packages/core/    shared tool logic
packages/cli/     the ryux CLI (npx @ryuxdsgn/design-intelligence)
skills/ryux/      the RYUX skill, generated from packages/cli/src
docs/             design rules, taxonomy, showcase, benchmarks
```

```bash
pnpm install
pnpm dev:mcp        # MCP server, local (see apps/mcp/README.md)
pnpm dev:web        # ryux.design on http://localhost:3000
pnpm typecheck
```

### Further reading

- [GUIDE.md](GUIDE.md): install, MCP, and how RYUX reasons
- [docs/design-rules.md](docs/design-rules.md): every rule, level, and gate
- [docs/showcase.md](docs/showcase.md): every case, in context
- [docs/benchmarks/](docs/benchmarks/): every raw run, and how to run one yourself
- [DEPLOY.md](DEPLOY.md): run your own instance (database, MCP server, website)

</details>

## Contributing

Issues and pull requests are welcome on [GitHub](https://github.com/ryuxdsgn/design-intelligence).
Rules and skills are generated from `packages/cli/src`; run `pnpm sync:skills` after changing them.
Designers who want to rate the next blind round: open an issue and say so. To report a
vulnerability, see [SECURITY.md](./SECURITY.md).

## Status and license

RYUX 2.13, early access, free. Available now: the skill, the CLI, skills.sh, the Claude Code plugin,
and the MCP server run locally. Coming: the hosted MCP and a larger reference library.

**MIT**, © 2026 ryux.design (see [LICENSE](./LICENSE)). The code and the RYUX skill are covered by
this license. The reference data and the hosted service are separate.

Assets in this repository are synthetic outputs and illustrations created for RYUX experiments and
its website, unless otherwise noted. Brand names may appear as text in mock interfaces and do not
indicate affiliation.
