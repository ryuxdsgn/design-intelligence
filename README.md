<p align="center">
  <a href="https://www.npmjs.com/package/@ryuxdsgn/design-intelligence"><img src="https://img.shields.io/npm/v/@ryuxdsgn/design-intelligence?label=npm&color=B9A8FF&labelColor=1E232B" alt="npm version"></a>
  <a href="#use-it"><img src="https://img.shields.io/badge/works%20with-Claude%20Code%20%C2%B7%20Codex%20%C2%B7%20Cursor%20%C2%B7%20Gemini%20CLI%20%C2%B7%20%2B6-C8F25A?labelColor=1E232B" alt="Works with Claude Code, Codex, Cursor, Gemini CLI, and 6 more agents"></a>
  <a href="https://github.com/ryuxdsgn/design-intelligence/actions/workflows/ci.yml"><img src="https://img.shields.io/github/actions/workflow/status/ryuxdsgn/design-intelligence/ci.yml?branch=main&label=CI&labelColor=1E232B" alt="CI"></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/license-MIT-F6F1E7?labelColor=1E232B" alt="MIT License"></a>
</p>

<h1>
  <picture>
    <source media="(prefers-reduced-motion: reduce)" srcset="https://github.com/ryuxdsgn/design-intelligence/releases/download/media/readme--ryux-banner-still.png">
    <img src="https://github.com/ryuxdsgn/design-intelligence/releases/download/media/readme--ryux-banner.gif" width="100%" alt="RYUX. Pixel-art office. A product owner gives an AI agent a task; the agent rushes it, and the owner reads each draft, crumples it, and throws it in the bin, three times. The owner installs RYUX, and a RYUX designer drops in. Now the agent asks first, sketches the wireframe on a board with RYUX, and ticks off a checklist. The owner reads the finished work, has a light-bulb moment, and everyone cheers as a flag goes up.">
  </picture>
</h1>

### Understand before you design.

A design skill for AI agents. Your agent asks about the product before it designs, keeps what it does not know
out of the screens instead of inventing fees, promos, and policies, designs for when things go wrong, and
explains each decision.

```bash
npx @ryuxdsgn/design-intelligence
```

Works with Claude Code, Codex, Cursor, Gemini CLI, GitHub Copilot, OpenCode, Cline, Amp, Kimi Code, and
Antigravity. Free, MIT.

## How it works

One prompt in Claude Code with the Figma connector, RYUX 2.22.5, from the [landing page benchmark](docs/benchmarks/landing-gold/):
a landing page for Raja Emas, a made-up gold savings app for Indonesia.

```
Design a one-page marketing landing page for a gold savings app called Raja Emas, in two versions: desktop and
mobile. [...] It is for young first-job savers who save small amounts toward a goal and find gold shops
intimidating. Confirmed: supervised by OJK; gold partners Antam and UBS (their role is not stated); physical gold
delivery. No minimum, fee, or price is confirmed. [...] Design it in Figma, on a new page in this file: <Figma link>
```

1. **It offers three directions and asks you to pick.** Each starts from a different idea: the app's own gram
   balance, read like a bank record; the clay *celengan* (piggy bank) many Indonesians saved coins in as children;
   and a *songket* weave. Each tile names its type, colour roles with contrast, and its risk.

<img src="https://github.com/ryuxdsgn/design-intelligence/releases/download/media/showcase--raja-emas-2.22.5-directions.jpg" alt="Three style tiles side by side: 1 On Record, mint white and forest green with a phone showing a gold balance of 2.4180 g labelled sample data, marked Recommended and Chosen; 2 Celengan, terracotta with a clay rooster piggy bank, not chosen; 3 Songket, deep red with a woven gold band, not chosen. Each lists type, colour roles with contrast ratios, a button and card, and the direction's risk." width="100%">

2. **It asks what it cannot know,** before building: whether there are real app screens and logo files, and what
   Antam and UBS actually do. Without answers, the app screens are labelled sample data, the OJK, Antam, and UBS
   logos are named slots, and the partners are only "gold partners".
3. **It designs both widths** in the chosen direction, with the official App Store and Google Play badges as the
   only action, and no price, fee, or minimum, since none was confirmed.

<img src="https://github.com/ryuxdsgn/design-intelligence/releases/download/media/showcase--raja-emas-2.22.5-page.jpg" alt="The top of the Raja Emas page at desktop and mobile: a mint hero, 'Real gold that's yours. Start small.', the official store badges, and two phones on a forest green band showing a gram balance labelled sample data; below, a safety section and how it works written as ledger lines." width="100%">

4. **It explains its decisions,** in its final message and as Figma annotations on the frames. Three of the six
   lines, word for word:

```
The real app screen fills the hero. People choose Raja Emas for real gold that's theirs, so a gold balance
  in grams is the most direct proof. [...] An illustration would win only if the screenshots turn out weak.
Safety comes second. This audience finds gold shops intimidating, so trust is answered before how it works.
Store badges are the only action. They appear in the hero and again at the end; there's no competing
  "Learn more".
```

One run, unedited. Nobody picked a direction, so it got one reply: "Go with the direction you recommend and build the
page." It also changed its own headline from "in your name" to "yours", because "in your name" suggests a legal
ownership record the brief does not confirm.

## What it changes

Without the product context, an agent fills the gaps in a brief with content: an invented fee, a feature nobody
confirmed, a promise the product never made. RYUX makes it sort what it has first:

- **Known**: stated in the prompt, DESIGN.md, or your product docs, or seen in the design itself.
- **Design assumptions**: low-risk choices made from the context, written down.
- **Unconfirmed capabilities**: actions products like yours usually have, proposed and labeled unconfirmed.
- **Facts, policies, and claims**: fees, refund times, guarantees. Never invented.

The [order tracking benchmark](docs/benchmarks/order-tracking/) tests exactly this. An agent builds a working
order-tracking prototype from a short brief that leaves policies open, three runs with no skill and three with
RYUX 2.22.5:

- **Without a skill**, no run asked anything, and the runs showed 28 policies as fact: refund times, a $4.99
  cancellation fee, "$5 credit added — sorry for the wait", tips, courier ratings, a late-delivery guarantee.
- **With RYUX**, every run asked first. One policy was shown as fact across three runs; the rest were marked on
  screen as not decided. Every RYUX run built offline, loading, and error states; no run without a skill did.

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
<summary><b>Benchmarks: where RYUX helps, and where it doesn't</b></summary>

Three benchmarks on RYUX 2.22.5. Each compares the same brief with no skill and with RYUX. Criteria were locked
before the first run, and every run starts with a fresh agent. There were 2 to 3 runs per side, so these numbers
describe these runs, not rates.

**Order tracking (code): pass.** Policies the brief left open were shown as fact 28 times in the
[no-skill runs](docs/benchmarks/order-tracking/) and once with RYUX. Offline, loading, and error states appeared in
every RYUX run and in none of the no-skill runs. Every RYUX run asked before building.

**Landing page (Figma): pass.** The owner rated the [pages](docs/benchmarks/landing-gold/) blind. RYUX scored higher
on originality (4.0 v 2.0), on AI-slop resistance (3.5 v 2.0), and overall (3.69 v 3.19). It scored lower on
production plausibility: sample-data labels and logo slots showed on the design.

**Illustration (Figma): fail.** In the [illustration benchmark](docs/benchmarks/illustration/), RYUX lost on concept,
craft, and fit at real size (3.30 v 3.73). It led only on cohesion. A RYUX run costs about 1.5 to 4 times a run
without a skill.

Setup, raw outputs, and how to run one yourself: [`docs/benchmarks/`](docs/benchmarks/).

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
docs/             design rules, benchmarks
```

```bash
pnpm install && pnpm typecheck && pnpm test
```

Issues and pull requests are welcome; start with [CONTRIBUTING.md](./CONTRIBUTING.md). Rules and skills are generated from `packages/cli/src`; run
`pnpm sync:skills` after changing them. Designers who want to rate the next blind round: open an issue. To
report a vulnerability, see [SECURITY.md](./SECURITY.md).

</details>

## Status and license

RYUX 2.22, early access. Available now: the skill, the CLI with `scan`, skills.sh, and the Claude Code
plugin. Coming: an optional MCP with reference screens from real products. RYUX works fully without it; the
reference data is private and not in this repository.

**MIT**, © 2026 ryux.design (see [LICENSE](./LICENSE)). The code and the RYUX skill are covered by this
license; the reference data and the hosted service are separate. Assets in this repository are synthetic
outputs and illustrations created for RYUX experiments and its website, unless otherwise noted. Brand names may
appear as text in mock interfaces and do not indicate affiliation.
