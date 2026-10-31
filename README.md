<p align="center">
  <a href="https://www.npmjs.com/package/@ryuxdsgn/design-intelligence"><img src="https://img.shields.io/npm/v/@ryuxdsgn/design-intelligence?label=npm&color=6A4DF5" alt="npm version"></a>
  <a href="#use-it"><img src="https://img.shields.io/badge/works%20with-Claude%20Code%20%C2%B7%20Codex%20%C2%B7%20Cursor%20%C2%B7%20Gemini%20CLI%20%C2%B7%20%2B6-555" alt="Works with Claude Code, Codex, Cursor, Gemini CLI, and 6 more agents"></a>
  <a href="https://github.com/ryuxdsgn/design-intelligence/actions/workflows/ci.yml"><img src="https://github.com/ryuxdsgn/design-intelligence/actions/workflows/ci.yml/badge.svg" alt="CI"></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/license-MIT-2ea44f" alt="MIT License"></a>
</p>

<h1>
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset=".github/assets/ryux-dark.svg">
    <img src=".github/assets/ryux-light.svg" alt="RYUX" width="130">
  </picture>
</h1>

### Understand before you design.

A design skill for AI agents. Your agent stops filling the gaps in your brief with invented fees, promos, and
policies, builds the screens for when things go wrong, and tells you what it checked.

```bash
npx @ryuxdsgn/design-intelligence
```

Works with Claude Code, Codex, Cursor, Gemini CLI, GitHub Copilot, OpenCode, Cline, Amp, Kimi Code, and
Antigravity. Free, MIT.

## See the difference

Same brief, same model, a fresh agent per side: food delivery order tracking, designed in Figma. Nobody wrote a
DESIGN.md: RYUX wrote one from the brief and two references (Airbnb's look, a ride-hailing motion study), asked,
then designed. Both phones play each run's own Figma frames through the same scenario; the motion is made for the video.

<a href="docs/benchmarks/food-delivery-figma/"><img src="https://github.com/ryuxdsgn/design-intelligence/releases/download/media/benchmarks--food-delivery-figma--see-the-difference.gif" alt="Animation: the brief; the no-skill agent designs straight away while RYUX writes DESIGN.md, asks, and explores three layouts; two Android phones play both Figma pages through an unavailable item, a late order, and the way to the door, the left showing a reply timer with an auto-pick, an instant refund, a late voucher, tips, and a rating, the right waiting for the customer's choice, keeping it after a failed send, and tagging every undecided rule on screen; then the numbers" width="100%"></a>

Both sides look finished. The difference is in what the agent decided on your behalf:

- **It made up less.** Without a skill, the agent invented 8 policies (a late voucher, automatic refunds, an
  auto-pick if you don't answer in time, tips…) and showed them as real. RYUX invented 1 and tagged the rest
  "Prototype rule, not decided yet".
- **It asked first, and designed for when things go wrong:** no courier, offline, a map that failed to load.
- **It cost more:** about four times as much for this run.

The video shows RYUX's frames after four rounds of owner feedback on a copy; the points above are the runs as
they left them. One run per side, not yet rated by designers. Brief, method, every frame, and the numbers:
[food delivery in Figma](docs/benchmarks/food-delivery-figma/).

## Made with RYUX

Mancing, an app for finding fishing spots and logging catches, designed with RYUX in Figma after a few rounds of
the owner's feedback. The motion was added afterwards for the video.

<a href="https://github.com/ryuxdsgn/design-intelligence/releases/download/media/showcase--mancing-flow.mp4"><img src="https://github.com/ryuxdsgn/design-intelligence/releases/download/media/showcase--mancing-poster.png" alt="Five phone screens from Mancing: a map of fishing spots, logging a catch, a spot's best hours today, the catch journal, and a badge unlocked. Links to the video." width="100%"></a>

More briefs are under All benchmarks below.

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
| "Write our DESIGN.md from this brief" (brief or links attached) | **Design** | a DESIGN.md that says who the users are, their job, the evidence, the patterns that fit, and how to evaluate; unknowns listed, not invented |
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

| Benchmark | The question it answers | RYUX | Runs |
| --- | --- | --- | --- |
| [Food delivery in Figma](docs/benchmarks/food-delivery-figma/) | Designed in Figma instead of code: is it cheaper, and does the difference still show in the frames? A pilot | 2.19.4 | 1 + 1 |
| [Illustration](docs/benchmarks/illustration/) | Icons, empty states, a mascot, an editorial picture: do they say what they mean, in one style? Rated blind by an AI rater the owner approved | 2.20.0, 2.21.0 | 8 + 8 + 8 |
| [Food delivery, DESIGN.md by RYUX](docs/benchmarks/food-delivery-designmd/) | With no DESIGN.md given, does RYUX write one from a brief and references that answers the five questions, then build that direction without inventing policy? Three rounds | main before 2.19.4, 2.19.4 | 1 + 1 + 1 new + 3 |
| [Billing page in an existing repo](docs/benchmarks/billing-dashboard/) | Does a new page fit a real repo, keep checks passing, and invent no billing rule? | 2.19.3 | 3 + 3 |
| [Wallet, expressive direction](docs/benchmarks/wallet-expressive/) | With a DESIGN.md that asks for character and motion, does it build that direction and still ask first and invent no money rule? | 2.19.3 | 3 new + 3 |
| [Wallet transaction detail](docs/benchmarks/wallet-detail/) | Does it ask what changes the build, keep open money rules open, and build the states a money screen needs? | 2.19.2 | 3 + 3 |
| [Order tracking](docs/benchmarks/order-tracking/) | Does the agent invent policies the brief left open, and build the states for when things go wrong? | 2.19.0 | 3 + 3 |
| [Personal finance app](docs/benchmarks/hero-finance/) | Does it ask first, invent facts, and cover states? | 2.9.3 | 3 + 3 |
| [Explore, judge, critique](docs/benchmarks/explore-judge/) | Does it offer real alternatives first, and does Critique find planted problems? Rated blind | 2.8 vs 2.9 | 3–6 per condition |
| [Typography](docs/benchmarks/typo-craft/) | Does a craft rule change the built result? Measured by a script | 2.9.1 vs 2.9.2 | 3 + 3 |

Every run so far uses Claude Code; the other supported agents are not benchmarked yet. Older and historical runs
are listed in [`docs/benchmarks/`](docs/benchmarks/).

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

Issues and pull requests are welcome; start with [CONTRIBUTING.md](./CONTRIBUTING.md). Rules and skills are generated from `packages/cli/src`; run
`pnpm sync:skills` after changing them. Designers who want to rate the next blind round: open an issue. To
report a vulnerability, see [SECURITY.md](./SECURITY.md).

</details>

## Status and license

RYUX 2.21, early access. Available now: the skill, the CLI with `scan`, skills.sh, and the Claude Code
plugin. Coming: an optional MCP with reference screens from real products. RYUX works fully without it; the
reference data is private and not in this repository.

**MIT**, © 2026 ryux.design (see [LICENSE](./LICENSE)). The code and the RYUX skill are covered by this
license; the reference data and the hosted service are separate. Assets in this repository are synthetic
outputs and illustrations created for RYUX experiments and its website, unless otherwise noted. Brand names may
appear as text in mock interfaces and do not indicate affiliation.
