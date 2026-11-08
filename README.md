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

One prompt in Claude Code with the Figma connector, from a run during the RYUX 2.22.0 work (before the current
release): a landing page for Raja Emas, a made-up gold savings app for Indonesia. Benchmark numbers below use
RYUX 2.22.5.

```
/ryux Design a one-page marketing landing page for a gold savings app, in two versions: desktop and mobile.
The app is for Indonesia: people buy and save gold in small amounts from their phone. Write the copy in
English. Design it in Figma, on a new page in this file: <Figma link>
```

1. **It starts from what is known.** The project's DESIGN.md already held the product context: who it is for,
   why they would choose it, what the app does, and that no price or fee is confirmed. In a new project, RYUX
   asks these first.
2. **It offers three directions and asks you to pick.** Drawn in Figma, each from a different idea: an
   Indonesian proverb (*ilmu padi*, "the fuller the rice, the lower it bows"), the app's own gram counter, and
   gold kept in a family drawer.

<img src="https://github.com/ryuxdsgn/design-intelligence/releases/download/media/showcase--raja-emas-directions.png" alt="Three style tiles side by side: 1 Ilmu Padi, deep green with rendered rice terraces ripening to gold, marked recommended; 2 Gram by Gram, a light page with an app screen and a gram ring; 3 Mum's Drawer, plum with a rendered gold bangle and a phone. Each lists type, palette, medium, signature, motion, and risk." width="100%">

3. **It asks one layout question, then designs both widths:** images rendered in Blender with one light, app
   screens with labeled sample data, and no number, rating, or logo the brief did not confirm.

<img src="https://github.com/ryuxdsgn/design-intelligence/releases/download/media/showcase--raja-emas-page.png" alt="The top of the Raja Emas page at desktop and mobile: a dark green hero, 'Gold that ripens, row by row.', store badges, a phone with the app's home screen over rendered rice terraces; below, a young green rice stalk beside a ripe gold one, 'Start small. No gold shop needed.', and the ilmu padi proverb." width="100%">

4. **It explains its decisions,** in its final message and as Figma annotations on the frames. Four of the six
   lines, word for word:

```
Rice terrace instead of coins, bars or a price chart. It fits your warm, steady, proud character and
  stays away from trading-app or pawn-shop looks. It would be wrong if users read the landscape as
  travel or farming.
Download is the only action, at the top and the end. The two badges sit in one row as one action for
  two platforms.
Section order follows the visitor's questions, not a template. I took the questions from DESIGN.md's
  audience, not from research, so this is the main thing to test.
Cut: a QR code, numbers, and partner or regulator logos, because none of them is confirmed.
```

One run; the owner answered two questions (direction 1, the hillside layout). The annotations were added when
asked; 2.22.0 makes them part of the design step.

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
craft, and fit at real size (3.30 v 3.73). It led only on cohesion. A fix that is not released yet passed a rerun (3.97 v 3.00). A RYUX run costs about 1.5 to 4 times a run
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
