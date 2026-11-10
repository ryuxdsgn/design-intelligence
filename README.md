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

Given a one-line brief for an order-tracking prototype, agents without a skill made up 28 business rules across three
runs and showed them as fact: refund times, a $4.99 cancellation fee, courier ratings, a late-delivery guarantee. With
RYUX: 1, counted blind ([order tracking benchmark](docs/benchmarks/order-tracking/)).

## No skill vs RYUX

Same short brief, same agent (Claude Code), one side with RYUX. Quotes are the agent's own words from that run;
scores are blind ratings, 1 to 5, by a senior designer who didn't know which side used RYUX. The principles the callouts name
(Fitts, Hick, Gestalt, Nielsen's heuristics, WCAG) and the rules built on them are listed in
[Design principles](docs/principles.md).

**Checkout, from one sentence.** The brief names the product (Sejuk, an iOS app for booking an AC technician in
Jakarta) and nothing else. Without a skill, the agent filled the gaps with a price, fees, a promo code, a warranty, and a
cancellation rule. The RYUX run asked first: which direction, how the price is set, how people pay, what the screen may
promise. Told to go with its recommended direction, it took its other recommendations as assumptions, labelled the
price and payment as not decided, left out fees and promises, and built five states.

<img src="https://github.com/ryuxdsgn/design-intelligence/releases/download/media/showcase--h2h-1-checkout.jpg" alt="Two checkout screens for Sejuk. No skill: a light grey iOS list with an invented per-unit price, what each unit includes, a 90-minute duration, a GoPay balance, promo SEJUKHEMAT, transport and service fees, a 30-day cooling warranty, and free cancellation until 11:00; red boxes mark 9 of them. RYUX: a deep teal header with a sawtooth trim from Betawi roof eaves, the units stepper beside the price, a 'Sample price. Per-unit pricing not decided' label, QRIS preselected, and one Pay with QRIS button; two red boxes mark a unit type and an arrival window the brief did not give. Five quotes from the RYUX run's Figma annotations and final message explain the choices." width="100%">

Blind rating: 4.33 with RYUX, 2.83 without; honesty 5 v 1, states 5 v 1, visual direction 4 v 2. The screen
without a skill fit the AC service better (5 v 4), and copy tied (4 v 4). [Checkout benchmark](docs/benchmarks/checkout/)

**Illustration.** Asked for the service icons, an empty state, and a success screen, the RYUX run built one system from
the product: the same AC unit in every icon, no steam that would read as heat, a technician on a motorbike as in Jakarta.
The brief asked for Indonesian copy; for this image it was translated to English the same way on both sides, and the art
is unchanged.

<img src="https://github.com/ryuxdsgn/design-intelligence/releases/download/media/showcase--h2h-2-illustration.jpg" alt="Three app screens per side for Sejuk, an AC service app. No skill: flat line icons, a clipboard empty state, and a success screen that names a technician, Pak Budi, with an arrival time of 2:30 PM and a contact button. RYUX: soft clay-style icons of one AC unit with water spray, a gauge, and a wrench; a blank clipboard with a remote; a technician on a motorbike riding to an apartment block. Three numbered quotes from the RYUX run explain the choices." width="100%">

Blind rating of these two runs: 4.06 with RYUX, 3.06 without; over both runs per side, 3.97 v 3.00
([illustration benchmark](docs/benchmarks/illustration/#rerun-with-the-fix-pr-36-released-in-2226)).

**Motion, in a clickable prototype.** Asked for a booking flow with motion for each step, the RYUX run asked about
price, payment, and rules first. With its defaults agreed, it labelled the price as an estimate, showed no fee or
cancellation policy, and gave each movement a job: a slide for a step deeper, visible progress while booking, a fade
for the finished booking.

<img src="https://github.com/ryuxdsgn/design-intelligence/releases/download/media/showcase--h2h-3-motion.gif" alt="Two booking prototypes for Sejuk, recorded along the same path: pick a time slot, review, confirm. No skill: an iOS-blue flow that assigns a rated technician before booking, shows '1 slot left', and ends on 'You're booked!'. RYUX: a teal flow that starts from the request, slides to the time list, shows 'Booking…' with a spinner, and ends on 'Booking confirmed' with airflow lines around the check. Three quotes from the RYUX run explain its motion." width="100%">

Blind rating from the recordings: 3.83 with RYUX, 3.00 without; honesty 4 v 2, visual direction 4 v 2,
motion 4 v 3. Craft tied at 3: in both, the button label overlaps during the confirm transition.
[Motion benchmark](docs/benchmarks/motion/)

**Direction, before the first screen.** Same one-sentence checkout brief. Without a skill, the agent drew one screen;
its only line on visual direction was about colour. The RYUX run first offered three directions drawn from the product
and its city, each with its risk, then built the checkout in the one it recommended, with every undecided price and
rule in Figma annotations rather than on the screen.

<img src="https://github.com/ryuxdsgn/design-intelligence/releases/download/media/showcase--h2h-4-direction.jpg" alt="No skill: a light grey iOS checkout for Sejuk, with its only line on visual direction quoted: the colors are a cool teal, with green used only for savings. RYUX: a page offering three directions for the Sejuk checkout, Mega Mendung (Cirebon batik rain clouds in five blues, recommended), Cool Down (a warm-to-cool temperature line), and The Remote (a dark AC-remote look with an LCD readout), each with palette, type, sample card, and risk; next to it, the checkout built in Mega Mendung with a deep indigo cloud band in the header only. Four quotes from the RYUX run explain the choices." width="100%">

Not rated: a later RYUX run with the same brief, set against the no-skill run above.
[Checkout benchmark](docs/benchmarks/checkout/#later-run-direction-and-annotations)

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

<details>
<summary><b>Scan your code</b></summary>

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

Add `--hook` to `install` and Claude Code gets the findings for each file it edits: any finding, warn included,
returns exit 2 so the agent sees it and fixes it or adds a `ryux-ignore` comment with the reason. A plain `scan`
fails (exit 1) only on a fail. `scan --list-rules` lists every check.

</details>

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

Each benchmark compares the same brief with no skill and with RYUX. Criteria were locked before the first run, and
every run starts with a fresh agent. The head-to-heads above are one run per side; the three below are 2 to 3 per
side. These numbers describe these runs, not rates.

**Order tracking (code): pass.** Policies the brief left open were shown as fact 28 times in the
[no-skill runs](docs/benchmarks/order-tracking/) and once with RYUX. Offline, loading, and error states appeared in
every RYUX run and in none of the no-skill runs. Every RYUX run asked before building.

**Landing page (Figma): pass.** A senior designer rated the [pages](docs/benchmarks/landing-gold/) blind. RYUX scored higher
on originality (4.0 v 2.0), on AI-slop resistance (3.5 v 2.0), and overall (3.69 v 3.19). It scored lower on
production plausibility: sample-data labels and logo slots showed on the design.

**Illustration (Figma): fail.** In the [illustration benchmark](docs/benchmarks/illustration/), RYUX lost on concept,
craft, and fit at real size (3.30 v 3.73). It led only on cohesion. A fix, now released, passed a rerun (3.97 v 3.00).

**Cost:** a RYUX run costs more, about 1.5 to 7 times a run without a skill in these benchmarks; it asks first,
checks states, and writes its rationale.

Setup, raw outputs, and how to run one yourself: [`docs/benchmarks/`](docs/benchmarks/).

</details>

<details>
<summary><b>What gets installed, and the repository</b></summary>

One skill folder, `ryux/`: a router (`SKILL.md`) that picks the step, five capability files, and the knowledge
modules those steps read. Behind every step runs one workflow: understand, frame the problem, explore two or
three alternatives, evaluate them against the brief (you pick), build and critique, then verify. Rules have
levels (Required, Preferred, Contextual) and a few Hard Gates that are never waived, such as no invented
numbers and no missing critical states. Browse them in [`skills/ryux/`](./skills/ryux) and
[`docs/design-rules.md`](./docs/design-rules.md), and the principles behind them in
[`docs/principles.md`](./docs/principles.md).

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

Early access. Available now: the skill, the CLI with `scan`, skills.sh, and the Claude Code
plugin. In early access: an optional MCP with reference screens from real products (a key per person, a small
library so far). RYUX works fully without it; the reference data is private and not in this repository.

**MIT**, © 2026 ryux.design (see [LICENSE](./LICENSE)). The code and the RYUX skill are covered by this
license; the reference data and the hosted service are separate. Assets in this repository are synthetic
outputs and illustrations created for RYUX experiments and its website, unless otherwise noted. Brand names may
appear as text in mock interfaces and do not indicate affiliation.
