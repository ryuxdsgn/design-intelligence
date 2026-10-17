<p align="center">
  <a href="LICENSE"><img src="https://img.shields.io/badge/license-MIT-2ea44f" alt="MIT License"></a>
  <img src="https://img.shields.io/badge/version-early__access%20v2.9-1f6feb" alt="Version: early access v2.9">
</p>

# RYUX

**Design intelligence for AI. Understand before you design.**

RYUX is a skill for AI coding and design agents. Before the agent designs, it works out what it
knows, what it is guessing, and what nobody told it. Then it decides, and keeps the open questions
visible instead of filling them in.

**[Get started](#get-started)** · **[See the difference](#see-the-difference)** · **[How to prompt](GUIDE.md#prompting-ryux)** · **[Showcase](docs/showcase.md)**

## The problem

AI can generate an interface in seconds. The hard part is everything around it: what the screen
should contain, which states it needs, which rules are real, and which details were never decided.
A fast answer fills those gaps silently, so the result looks finished and is partly made up.

```
Without RYUX    prompt → generate → hope it makes sense
With RYUX       context → evidence → reasoning → decision → interface → critique → QA
```

## See the difference

Same brief, same agent, one with RYUX: the transaction detail screen of a wallet called Lumo, shown
after the user pays, with its currency, statuses, fee, and 30-day reporting window. Designed in pen.dev.

<a href="apps/web/public/proof/lumo-without.png"><img src="apps/web/public/proof/lumo-without.png" alt="Without RYUX: Completed, Processing and Failed screens for a Rp48.000 card payment, with Share and Save receipt buttons that the brief never mentioned" width="100%"></a>

<a href="apps/web/public/proof/lumo-with.png"><img src="apps/web/public/proof/lumo-with.png" alt="With RYUX: Completed, Processing and Failed screens, plus loading, a couldn't-load error, the report window after 30 days, a copied-ID message, and the screen at 320 wide; Share receipt is listed as unconfirmed" width="100%"></a>

Three runs each, fresh agent per run, same model, no reference screens:

| | Without RYUX | With RYUX 2.6.3 |
| --- | --- | --- |
| States designed | Completed, Processing, Failed, in 3 of 3 | Those three plus loading, couldn't load, report window closed, and 320 wide, in 3 of 3 |
| Actions the brief didn't mention | Share or Save receipt added and presented as given, in 3 of 3 | Proposed and listed as unconfirmed, in 3 of 3 |
| Promises the brief didn't make | "No money was taken" on a failed payment, in 2 of 3 | None, in 3 of 3 |
| Placeholders on screen | None | None: realistic sample data, labeled as sample |

Both sides put the fee on its own line, both flag what "Rp48.000 paid" means, and both look
finished. The difference is what the screens cover and what they claim. RYUX proposed a receipt
action in only 1 of 3 runs. The runs without RYUX are from the 2.6 visual benchmark; the RYUX runs
used the same brief and harness three days later. A small benchmark, not a study.
[Brief, method, and every run](docs/benchmarks/lumo-td-2.6/).

The goal isn't more UI. It's fewer decisions made silently.

### What about visual quality?

That's a separate question, and RYUX hasn't proven it. In a blind test of a wallet home screen,
RYUX and the plain agent scored about the same. The two human designers who have rated later pairs
mostly preferred the plain agent. RYUX makes no visual-quality claim.
[What RYUX has not proven](docs/showcase.md#what-ryux-has-not-proven).

**Help judge.** The next results come from blind ratings, and more designers make them worth more.
Each form shows AI-made work from different setups, shuffled, without saying which is which:

- [Wallet home](https://tally.so/r/1WP6Zb): 3 pairs of finished screens, then 3 sets of early
  directions. Pick what you would ship.
- [Motion](https://tally.so/r/M1KMk8): 5 components (menu, dialog, toast, tabs, drawer), three
  versions each. Pick the motion you would ship.

Results go here once the ratings are in, with the number of raters.

## Decisions come with a receipt

For each major choice, RYUX writes down what it decided and how sure it is. This one is quoted from
an earlier benchmark run:

```
Decision     Amount + Fee = Total paid, shown in the card
Evidence     None
Confidence   Low
Assumption   [CONFIRM] The fee is charged on top of the amount.
             If the fee is taken out of the amount instead, the rows change.
```

A guess stays a guess. When there is no evidence, the receipt says so, and the person reviewing the
design knows exactly what to confirm. The format is guidance RYUX follows, not a fixed output.

## Know what you know

RYUX sorts what it is working with before it designs:

- **Known**: stated in the prompt, DESIGN.md, or your product docs, or seen in the design itself.
- **Design assumptions**: low-risk choices made from the context, such as grouping by date. RYUX
  makes them and writes them down.
- **Unconfirmed capabilities**: actions that products like yours usually have, such as sharing a
  receipt, but that nobody confirmed for yours. RYUX may propose one, and lists it as unconfirmed,
  not as a requirement.
- **Facts, policies, and claims**: fees, refund times, guarantees, user counts. Never invented.
  RYUX asks, or leaves them out.

Mockups are filled with realistic sample data, labeled as sample, so a screen reads finished without
pretending to be real. That is the whole idea: missing information should not turn into
confident-looking UI.

## How it works

You tell the agent what you are doing. RYUX picks the step and reads only the design knowledge that
step needs.

- **Analyze**: understand the existing interface, its context, and its constraints.
- **Design**: turn context and evidence into UX, UI, visual, and motion direction.
- **Build**: implement the decisions in your stack without inventing rules, data, or API behavior.
- **Critique**: find what should change first, with the reason and a fix.
- **QA**: check the build against the intended design at each width and state.

Every task ends with a check of what was verified and what was not.

**Visual direction is part of Design.** Illustration, iconography, imagery, ornament, and motion
start from a purpose and a brief: what the visual should communicate and what to avoid. Don't make
it look less AI. Make it look more intentional.

**DESIGN.md gives RYUX your project's direction.** `ryux setup` asks a few questions about product,
current work, audience, market, constraints, design intent, and UX, UI, and motion direction. Each
offers plain choices, your own answer, or Skip, and the answers go into a short block in DESIGN.md.
RYUX reads it before it designs, follows it as direction (not evidence), and treats blanks as unknown.

**Your product docs come next.** Point the Product docs field in DESIGN.md at your PRD, or let RYUX
look for `PRD.md`, `docs/prd*`, `docs/product*`, or the README. It says which file it read, and what
the docs state counts as known.

**Direction is yours to set.** When neither the prompt nor DESIGN.md says how the product should look
and move, RYUX asks instead of choosing, then writes your answer into DESIGN.md so it is not asked
again.

```
prompt → DESIGN.md → product docs → design knowledge → evidence → decisions
```

## Using RYUX

You don't need a special prompt. Say what you are doing, in your own words, and RYUX picks the step:

```text
Analyze this checkout screen (screenshot attached).                → Analyze
Design the transaction detail screen for our wallet, in pen.dev.   → Design
Build this design in our React app.                                → Build
Critique our pricing page at https://example.com/pricing.          → Critique
QA the build against the design at 390 and 320 wide.               → QA
```

RYUX reads DESIGN.md and your product docs, and asks only what would change the design: at most
three questions, often none. Facts it is not given, such as fees, policies, and numbers, stay open
instead of being invented. So more context gives a better start: what you are making, who it is for,
what the user should accomplish, and any constraints or evidence you have.

Recipes for each step, a full five-step session, and what to leave out:
[Prompting RYUX](GUIDE.md#prompting-ryux).

## Get started

```bash
npx @ryuxdsgn/design-intelligence
```

It asks which agents you use, installs RYUX, then offers a short project setup that writes
DESIGN.md. Run `npx @ryuxdsgn/design-intelligence setup` again any time to change the answers.

Any agent, through [skills.sh](https://skills.sh):

```bash
npx skills add ryuxdsgn/design-intelligence
```

As a Claude Code plugin, inside Claude Code:

```text
/plugin marketplace add ryuxdsgn/design-intelligence
/plugin install ryux@design-intelligence
```

RYUX works on its own. The hosted RYUX MCP for reference screens is not live yet. You can run the
server locally with sample data (see [`apps/mcp/README.md`](./apps/mcp/README.md)).

The [guide](GUIDE.md) covers other agents, global installs, updates, and the MCP setup.

### Reference data

RYUX may use reference screens and product evidence during analysis. Private reference data is not
included in this repository. The open-source repository contains the schemas, rules, and tooling used
to work with evidence, not private source material.

<details>
<summary><b>Technical details</b></summary>

### What gets installed

One skill folder, `ryux/`: a router (`SKILL.md`) that picks the step, five capability files, and
the knowledge modules those steps read. Rules have levels (Required, Preferred, Contextual) and a
few Hard Gates that are never waived, such as no invented numbers and no missing critical states.
Browse them in [`skills/ryux/`](./skills/ryux) and [`docs/design-rules.md`](./docs/design-rules.md).

### MCP tools

Nine tools: research (`search_screens`, `get_flow`, `get_local_pattern`, `compare_apps`,
`extract_design_direction`) and review (`audit_ui`, `audit_copy`, `heuristic_eval`,
`delivery_gate`). See [`apps/mcp/README.md`](./apps/mcp/README.md).

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
- [docs/showcase.md](docs/showcase.md): what RYUX changes, what it hasn't proven
- [docs/benchmarks/](docs/benchmarks/): every raw run, and how to run one yourself
- [DEPLOY.md](DEPLOY.md): run your own instance (database, MCP server, website)

</details>

## Status

RYUX 2.9, early access, free. Available now: the skill, the CLI, skills.sh, the Claude Code plugin,
and the MCP server run locally. Coming: the hosted MCP and a larger reference library.

## Contributing, security, license

Issues and pull requests are welcome on [GitHub](https://github.com/ryuxdsgn/design-intelligence).
Rules and skills are generated from `packages/cli/src`; run `pnpm sync:skills` after changing them.
To report a vulnerability, see [SECURITY.md](./SECURITY.md).

**MIT**, © 2026 ryux.design (see [LICENSE](./LICENSE)). The code and the RYUX skill are covered by
this license. The reference data and the hosted service are separate.

Assets in this repository are synthetic outputs and illustrations created for RYUX experiments and
its website, unless otherwise noted. Brand names may appear as text in mock interfaces and do not
indicate affiliation.
