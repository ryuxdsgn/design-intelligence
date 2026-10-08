# RYUX Guide (from scratch)

A short guide: what RYUX is, how to install its rules into your agent, and how to connect to
the reference data over MCP. If you just want a quick overview, read the [README](./README.md).

## What RYUX is

RYUX is two things that work together:

1. **RYUX** (installed with `npx @ryuxdsgn/ryux` or `npx skills add`): design skills that guide decisions and filter output so it doesn't
   "smell like AI": evidence-backed, accessible, and fitted to the product's market. Doc: [`docs/design-rules.md`](./docs/design-rules.md).
2. **MCP server**: gives your agent access to **reference screens from real products** (captured
   screens, designer notes) plus audit tools. Nine tools; see [`apps/mcp/README.md`](./apps/mcp/README.md).

Rules without data are just style; data without rules is just a pile of images. RYUX combines the two.

## 1. Install RYUX into your agent

One command, then answer a few questions (which agents you use, and an optional project setup):

```bash
npx @ryuxdsgn/ryux
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

### Project setup

After the install, the CLI offers a short setup: product, audience, market and locale, constraints,
design intent, and UX, UI, and motion direction. Press Enter to skip any question. The answers go
into a `<!-- ryux-context -->` block in `DESIGN.md`, which RYUX reads before every design task.
Blanks stay unknown; RYUX does not fill them in by guessing.

Change the answers later, or set them without questions:

```bash
npx @ryuxdsgn/ryux setup
npx @ryuxdsgn/ryux setup --audience "small business owners" --market "Indonesia, id-ID, IDR"
npx @ryuxdsgn/ryux check     # shows how many setup fields are filled
```

### Non-interactive

```bash
npx @ryuxdsgn/ryux install --agent claude,cursor,codex   # these agents, this project
npx @ryuxdsgn/ryux install --agent all --global         # every agent, home directory
npx skills add ryuxdsgn/design-intelligence     # alternative: skills.sh, any agent
```

## 2. Connect to MCP (reference data)

The RYUX rules are at their strongest when your agent can pull real evidence. The hosted MCP
(`mcp.ryux.design`) is not live yet. RYUX works without it and rates evidence None. To use the MCP
now, run the server yourself from this repo and connect to it:

```bash
pnpm install
pnpm dev:mcp        # http://localhost:8787/mcp
claude mcp add --transport http ryux http://localhost:8787/mcp
```

Without Supabase env, the local server serves the bundled sample data, not the reference library.

Connect through an MCP client (Claude Code, MCP Inspector), not a regular browser (the endpoint
uses the Streamable HTTP transport).

## 3. Try it

Talk to your agent as you would to a designer. There is no special RYUX prompt:

```text
Design a transaction detail page for our app.
```

RYUX reads DESIGN.md and the prompt, finds what is missing, and asks only the questions that would
change a major decision (at most three, often none). Then it designs, critiques, and checks its
work.

You can give it more up front. Good input answers what you are making, who it is for, what the user
should accomplish, which constraints exist, and what evidence you have. Leave out what you don't
know; RYUX asks when it matters.

```text
Design a transaction detail page for our mobile banking app. Users are consumers in Indonesia.
It shows after a successful payment, and it should help them understand what happened and what
they can do next. Use the existing design system.
```

```text
Here are three existing screens and our support-ticket findings. Design the new checkout flow
from them.
```

All three use the same RYUX. More examples:

- "Find a reference for a payment method picker with QRIS via RYUX."
- "Critique this checkout page." RYUX routes to Critique on its own.
- "Analyze this screenshot, then design a better version in pen.dev."
- "Review this screen with `heuristic_eval`, and include a comparison screen as evidence."

## Update & Remove

```bash
npx @ryuxdsgn/ryux update     # update the rules you've installed
npx @ryuxdsgn/ryux remove     # remove them (restores your files to their original state)
```

## How RYUX thinks

The evidence RYUX can reason with, the knowledge it reads, and the gates every task ends with.

### Design knowledge, not just design rules

RYUX can work from curated references: real product screens, flows, local patterns, observations,
and designer notes. This is RYUX Knowledge, the evidence layer. Each entry keeps what was seen
apart from what it means:

```
Interface (screen_id) → Observation (what it visibly does) → Why it works or not (designer note)
  → Context (market, category, flow) → Pattern (observed in N screens across M apps) → Design implication
```

- **References**: real product screens and flows, each with a `screen_id`, app, version, and capture date.
- **Observations**: what a screen visibly does, drafted by AI and confirmed by a person.
- **Patterns**: when a pattern is useful, its risk, and where it was observed. An observed pattern, never a "best practice".
- **Designer notes**: why a flow works and where it falls short, written by people, never generated.

Agents reach it through the RYUX MCP (`search_screens`, `compare_apps`, `get_local_pattern`), and
RYUX keeps three sources apart: "I observed this", "I inferred this", and "this is a known pattern".

It is being built first with Indonesian products (fintech, e-commerce, government, telco, and SaaS),
because that is where global libraries are thinnest: QRIS, virtual
accounts, WhatsApp OTP, paylater, e-KYC, and Rupiah formats. Knowledge is in pilot: the capture and
review pipeline works, the library is still small, and the hosted MCP is not live yet. Without it,
RYUX says the evidence is "None" instead of inventing a reference.

### Design intelligence

The knowledge RYUX reasons with, read only when a task needs it:

- **UX**: structure, flows, navigation, grouping, and disclosure.
- **UI**: hierarchy, type, layout, density, and color, plus a point of view on expressive surfaces.
- **Visual**: art direction, imagery, illustration, and composition, with a Visual Brief before anything is generated, and the source of every asset.
- **Interaction**: what happens before, during, and after an action; confirmation, undo, and local payments.
- **Motion**: a lifecycle and a level for every motion, one motion personality, and reduced motion.
- **Accessibility**: semantics, keyboard, focus, contrast, and targets, checked against WCAG 2.2.
- **Responsive**: what changes, stays, disappears, or stacks at each width.
- Also: product thinking, forms, content, edge cases, design systems, and frontend.

### Quality: a gate, not the design process

```
Analyze → Design → Build → Critique → QA → Anti-Slop → done
```

- **Critique** asks whether the design is right, after a fact check of every product claim.
- **Visual QA** asks whether the build matches the design, at every width and state.
- **Anti-Slop** runs last. RYUX does not use anti-slop rules to decide what good design is; it uses them to catch generic, invented, unnecessary, or unsupported output before delivery.
- **The Delivery Gate** reports PASS, FAIL, or N/A for ten areas, and claims only what was checked.

## What's next

- Full rules: [`docs/design-rules.md`](./docs/design-rules.md)
- Vocabulary (categories, flows, patterns): [`docs/taxonomy.md`](./docs/taxonomy.md)
