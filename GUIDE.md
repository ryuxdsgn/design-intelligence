# RYUX Guide

How to install RYUX, how to prompt it, and how it reasons. For the short version, read the
[README](./README.md).

RYUX is one skill, `ryux`, for AI coding and design agents. It works on its own. A RYUX MCP server
for reference screens exists, but it is optional and not hosted yet (see [MCP](#mcp-optional)).

## Install

One command, then answer a few questions (which agents you use, and an optional project setup):

```bash
npx @ryuxdsgn/design-intelligence
```

The CLI writes to the right place for each agent:

| Agent | Skills folder | Pointer file |
| --- | --- | --- |
| Claude Code | `.claude/skills/` | `CLAUDE.md` |
| Codex | `.codex/skills/` | `AGENTS.md` |
| Cursor | `.cursor/skills/` | `AGENTS.md` |
| Gemini CLI | `.gemini/skills/` | `GEMINI.md` |
| OpenCode, Cline | `.opencode/skills/`, `.cline/skills/` | `AGENTS.md` |
| Copilot, Amp, Kimi Code, Antigravity | `.agents/skills/` | `AGENTS.md` |
| Anything else | rules inline in `AGENTS.md` | `AGENTS.md` |

RYUX installs as one folder, `ryux/`: a router (`SKILL.md`), five capabilities (Analyze, Design,
Build, Critique, QA), and the knowledge modules the router reads when a task needs them.

Your files are never overwritten wholesale. Changes stay inside the block
`<!-- ryux-rules:start -->` … `<!-- ryux-rules:end -->`.

Other ways to install:

```bash
npx @ryuxdsgn/design-intelligence install --agent claude,cursor,codex   # these agents, this project
npx @ryuxdsgn/design-intelligence install --agent all --global         # every agent, home directory
npx skills add ryuxdsgn/design-intelligence                            # skills.sh, any agent
```

As a plugin or extension, with each agent's own installer:

| Agent | Install |
| --- | --- |
| Claude Code | `/plugin marketplace add ryuxdsgn/design-intelligence`, then `/plugin install ryux@design-intelligence` |
| Codex | `codex plugin marketplace add ryuxdsgn/design-intelligence`, then install `ryux` from `/plugins` |
| GitHub Copilot CLI | `copilot plugin marketplace add ryuxdsgn/design-intelligence`, then `copilot plugin install ryux@design-intelligence` |
| VS Code (agent plugins) | Command Palette → Chat: Install Plugin From Source → `https://github.com/ryuxdsgn/design-intelligence` |
| Gemini CLI | `gemini extensions install https://github.com/ryuxdsgn/design-intelligence` |

The plugin is the same skill in every agent: `plugins/ryux/` follows the open Agent Plugins format
(`plugin.json` and `skills/`) plus Claude Code's own manifest, and the Gemini extension reads
`skills/` at the repo root.

### Project setup (DESIGN.md)

After the install, the CLI offers a short setup: product, what you are building right now,
audience, market and locale, constraints, design intent, UX and UI direction, voice and tone, and
motion direction. You don't
need design vocabulary: each question offers plain choices, "Write my own", or "Skip, leave unknown".
The answers go into a `<!-- ryux-context -->` block in `DESIGN.md`, which RYUX reads before every
design task.

The answers are your team's direction, not evidence. RYUX follows them, still backs its decisions
with evidence, and treats blanks as unknown instead of guessing. A UI direction such as
"trustworthy" describes character, not a color or font.

```bash
npx @ryuxdsgn/design-intelligence setup                                  # change the answers
npx @ryuxdsgn/design-intelligence setup --audience "small business owners" --market "Global"
npx @ryuxdsgn/design-intelligence setup --voice "Warm and casual, not salesy or hyped"
npx @ryuxdsgn/design-intelligence check                                  # health check
```

**A full DESIGN.md, from a brief or references.** Setup fills the short context block. For the whole file,
ask your agent, with the brief, docs, links, or screenshots attached:

```
Write our DESIGN.md from this brief.
Update DESIGN.md with this reference: <link or screenshot>.
```

RYUX (Design) asks in rounds, at most three questions at a time, until it can answer five questions: who the
users are and what they need, which job they want done, what evidence supports each decision, which interaction
patterns fit, and how the result is evaluated. The file gets these sections: Users and needs, Jobs to be done,
Evidence, Interaction patterns, Visual and motion language, Voice and tone, How we evaluate, and Open questions.
Nothing is invented: what no source answers goes under Open questions, and values RYUX chooses (colors, type,
timing) are marked proposed, each with its reason. An update keeps the lines you wrote and lists what changed.

### Scan your code

`scan` checks source files for what a machine can see without an LLM: Rupiah written as `Rp 50.000`,
images with no alt text, zoom turned off, focus outlines removed from controls, filler text, and
more. A fail exits 1; a warn is worth a look. `--list-rules` shows every check and the RX rule
behind it.

Give it a URL and it renders the page at 320, 390, and 1280 px and measures it: sideways scroll,
text contrast, target size, and text that collides. Text over an image or a gradient is skipped
rather than guessed. This needs Playwright in your project (`npm i -D playwright && npx playwright
install chromium`); RYUX does not install it for you.

```bash
npx @ryuxdsgn/design-intelligence scan src                               # scan a folder
npx @ryuxdsgn/design-intelligence scan http://localhost:3000             # measure a running page
npx @ryuxdsgn/design-intelligence scan --json                            # for agents and CI
npx @ryuxdsgn/design-intelligence install --agent claude --hook          # scan each file Claude Code edits
```

Switch a check off for one line with a comment, `ryux-ignore RX-CD-02`, on that line or the line
above it, and give the reason next to it.

### Update and remove

```bash
npx @ryuxdsgn/design-intelligence update     # update the installed skill
npx @ryuxdsgn/design-intelligence remove     # remove it and restore your files
```

## Prompting RYUX

There is no magic prompt. Talk to your agent as you would to a designer: say **what you are doing**,
**what it is for**, and **where the work lives**. RYUX picks the step and the knowledge it needs.

### What to include, and what to leave out

Include what you know:

- **What** you are making or reviewing: the screen, flow, or page.
- **Who** it is for, and what they should get done.
- **Where** it lives: a screenshot, a URL, a Figma link, a pen.dev file, or code in this repo.
- **Facts** the design depends on: currency, fees, statuses, policies, limits, what the product
  can and cannot do.

Leave out:

- **What you don't know.** RYUX asks when a missing answer would change the design (at most three
  questions, often none), and otherwise keeps it open as an assumption. It never invents a fee, a
  policy, or a number.
- **Instructions about RYUX itself.** No need to write "check accessibility" or "avoid AI slop". The
  checks run on every task.
- **A style you haven't chosen.** If you have no visual direction yet, RYUX asks for one and saves
  your answer in DESIGN.md.

### One recipe per step

**Analyze**: understand what exists, without judging it.

```text
Analyze this checkout screen (screenshot attached).
Analyze https://example.com/pricing at desktop and mobile widths.
```

You get an inventory (layout, type, components, states, patterns), with every point labeled
Measured, Observed, or Inferred, and a list of what can't be known from the source.

**Design**: create or improve UI and UX, in a design tool or as a mockup.

```text
Design the transaction detail screen of our wallet app, shown after the user pays.
Mobile, 390 wide, in pen.dev. Currency IDR (Rp48.000). Statuses: Completed, Processing, Failed.
Card payments have a Rp1.000 fee; QRIS is free.
```

You get questions first if something material is missing, then the main screen plus the states it
needs (loading, error, empty, narrow widths), decisions with their evidence and confidence, and a
list of assumptions and unconfirmed actions.

**Build**: implement a design in your codebase.

```text
Build the transaction detail screen from the pen.dev design, in our Next.js app.
```

You get code in your existing stack, with its tests, rendered at the widths that matter, and a
report of what was and wasn't checked.

**Critique**: find what should change first, and why.

```text
Critique our signup page (screenshot attached). The goal: more people finish signup on mobile.
```

You get findings ordered by severity, each with the evidence, its impact, a fix, a confidence
level, and how to verify it. A preference is not reported as a defect. Critique does not redesign
unless you ask.

**QA**: check that a build matches its design.

```text
QA the checkout build at localhost:3000 against the Figma frame, at 390 and 320 wide.
```

You get every difference (expected, actual, severity, fix). RYUX fixes them, renders again, and
lists what it could not test.

Figma links need the Figma MCP connected in your agent; pen.dev files need the pen.dev (pencil) MCP.
URLs and builds are rendered with Playwright when it is available. Otherwise RYUX says it worked
from the source only.

### A full session

The steps work best in order, one prompt each, in the same session:

```text
1. Analyze the transaction detail screen in pen.dev (frame "Detail").
2. Critique it. The goal: users should understand what happened after paying.
3. Improve it in pen.dev, based on the critique.
4. Build it as one HTML file.
5. QA the build against the design at 390, 375, and 320 wide.
```

The [five-step case study](docs/benchmarks/case-td-2.6/) shows every turn of a real session like
this one.

### Naming the step

You rarely need to. Name it when you want a step on its own: "Critique only, don't redesign" keeps
RYUX from producing a new design, and "Analyze first" stops it from judging before it has looked.

### Short or long prompts

A short prompt works:

```text
Design a transaction detail page for our app.
```

RYUX checks whether that is enough. With no DESIGN.md and no product docs, it asks first (audience,
what the screen must do, visual direction), then designs. A prompt with your facts, or a project with
a filled DESIGN.md and a PRD, gets a design straight away:

```text
Here are three existing screens and our support-ticket findings. Design the new checkout flow
from them.
```

## MCP (optional)

The RYUX MCP serves reference screens from real products and review tools (`search_screens`,
`compare_apps`, `get_local_pattern`, `heuristic_eval`, `delivery_gate`, and more). The hosted server
is not live yet. RYUX works without it and rates its evidence None.

Once it is live, prompts that need it name the tool: "Find reference screens for a QRIS payment picker", or
"Review this screen with `heuristic_eval`".

## How RYUX reasons

### One workflow

Every capability runs the same six stages, or the part of them it needs:

1. **Understand**: the brief, the product, what exists; facts kept apart from assumptions.
2. **Frame**: the user's task, what must be seen first, and three to five success criteria, written
   before any design exists.
3. **Explore**: two or three alternatives that differ in hypothesis and structure, not only colour.
   Small changes skip it.
4. **Evaluate and select**: each alternative rated against the Frame criteria; you pick.
5. **Build and critique**: the chosen one designed or built, rendered, inspected, and fixed. If a
   finding shows the choice was wrong, RYUX goes back to an alternative and says why.
6. **Verify and deliver**: the Hard Gates and a report of what passed, failed, or was not verified.

### Know what you know

Before it designs, RYUX sorts what it is working with:

- **Known**: stated in the prompt, DESIGN.md, or your product docs, or seen in the design itself.
- **Design assumptions**: low-risk choices made from context. RYUX makes them and writes them down.
- **Unconfirmed capabilities**: actions products like yours usually have, which nobody confirmed for
  yours. RYUX may propose one, and lists it as unconfirmed.
- **Facts, policies, and claims**: fees, refund times, guarantees, numbers. Never invented: RYUX
  asks, or leaves them out.

Mockups use realistic sample data, labeled as sample, so a screen reads finished without pretending
to be real.

### Design knowledge

Each step reads only the knowledge it needs: product thinking, UX (structure, flows, navigation),
UI (hierarchy, type, layout, color, and a point of view on expressive surfaces), interaction (what
happens before, during, and after an action), motion (a purpose and a level for every motion, fitted
to how often it is seen), forms, content, edge cases, accessibility (WCAG 2.2), responsive behavior,
design systems, frontend, and anti-slop.

### Evidence

RYUX keeps three sources apart: what it observed, what it inferred, and what is a known pattern or
standard. Reference screens from the MCP carry a `screen_id`, app, version, and capture date. Designer
notes, the human judgment of why a flow works, are written by people, never generated. The first
reference library is being built from Indonesian products (QRIS, virtual accounts, paylater, e-KYC),
where global libraries are thinnest. It is in pilot and small.

### Gates

```
Understand → Frame → Explore → Evaluate and select → Build and critique → Verify and deliver → done
```

- **Hard Gates** are never waived: no invented numbers or claims, no missing critical states, among
  others.
- **Anti-Slop** runs last. It catches generic, invented, unnecessary, or unsupported output. It does
  not decide what good design is.
- **The Delivery Gate** reports each area as PASS, FAIL, NOT VERIFIED, or N/A, and claims only what
  was checked. An area that applies but was not checked is NOT VERIFIED, never PASS. PASS means the
  checked criteria were met, not that the design is good or was tested with users.

## More

- [`docs/design-rules.md`](./docs/design-rules.md): every rule, level, and gate
- [`docs/showcase.md`](./docs/showcase.md): the latest case, one moment up close
- [`docs/benchmarks/`](./docs/benchmarks/): raw runs, and how to run one yourself
