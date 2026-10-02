<p align="center">
  <a href="LICENSE"><img src="https://img.shields.io/badge/license-MIT-2ea44f" alt="MIT License"></a>
  <img src="https://img.shields.io/badge/status-early__access%20v0.1-1f6feb" alt="Status: early access v0.1">
  <img src="https://img.shields.io/badge/MCP%20tools-9-8957e5" alt="9 MCP tools">
  <img src="https://img.shields.io/badge/skills-14%20modular-e36209" alt="Ryux: 14 modular design skills">
</p>

# ryux: design intelligence

> Design intelligence from real Indonesian apps, for the AI agents that build and the designers who
> review. It's evidence-based: every design decision has to cite a real screen instead of a generic
> pattern.

> **New here?** Start with [GUIDE.md](./GUIDE.md). It walks you through it from scratch: install the
> rules into your agent, then connect it to the reference data.

## Three products, one knowledge base

```
                         RYUX
                           │
              ┌────────────┴────────────┐
              │                         │
         RYUX BUILD                RYUX CRITIQUE
              │                         │
        AI Coding                    Designer
              │                         │
              ↓                         ↓
      Design Intelligence        Design Intelligence
              │                         │
              └────────────┬────────────┘
                           ↓
                    RYUX KNOWLEDGE
```

| Product | For | What it is today |
| --- | --- | --- |
| **Ryux Build** | AI coding agents (Claude Code, Cursor, Codex) | `ryux-core` plus 13 design skills, installed with `npx ryux`, `npx skills add`, or the Claude Code plugin, and the MCP research tools |
| **Ryux Critique** | Designers, and agents asked to review | The `ryux-critique` skill (Design Read plus evidence-backed findings) and the MCP audit tools |
| **Ryux Knowledge** | Both | Screens, flows, local patterns, and human-written designer notes from Indonesian apps, served over MCP |

Build and Critique use the same rules, so what an agent builds is judged by the same standard a
designer reviews with.

## What makes it different

- **Evidence-based.** Every result carries a `screen_id`, app name, version, and capture date. A design decision has to point at a real screen, and `delivery_gate` enforces that.
- **Indonesia-first.** QRIS, virtual accounts, WhatsApp OTP, paylater, e-KYC, Rupiah formatting. These are the patterns global libraries skip.
- **Human judgment.** Designer notes (why a flow works, where it falls short) are written by people, not generated. That's the part that matters most.
- **Its own ruleset.** Ryux (RX-2.0, installed with `npx ryux` or `npx skills add`) is original work, MIT-licensed, with no third-party dependencies.

## What's inside

- **Nine MCP tools** in three groups: research (`search_screens`, `get_flow`, `get_local_pattern`, `compare_apps`, `extract_design_direction`), audit (`audit_ui`, `audit_copy`, `heuristic_eval`, `delivery_gate`), and a design bridge.
- **Ryux** is a senior product designer's reasoning for coding agents: a small `ryux-core` (workflow, which skills to load, a 10-area Delivery Gate, honest claims) plus 13 skills from product thinking to visual QA, and `ryux-critique` for reviews. Each skill is a short framework plus rules marked [Required], [Preferred], or [Contextual], with Hard Gates, Purpose Gates instead of style bans, and Quality Locks.
- **One install for every agent.** `npx skills add`, the `npx ryux` CLI, or the Claude Code plugin put the skills into Claude Code, Codex, Cursor, Gemini CLI, OpenCode, Cline, Copilot, and more. Agents load only the skills a task needs. Browse every skill in [`skills/`](./skills).

## See the difference

Each brief below ran headless (`claude -p`) in an empty folder, once without Ryux and once with the
Ryux RX-2.0 skills installed by the CLI (`npx ryux`). The agent chose which skills to load. The
screenshots are the agents' real output, not edited by hand. The colored boxes are annotations added
afterwards to point at what changed.

### UI

*"A 1920×1080 landing page for Catat, a cashier and bookkeeping app for Indonesian UMKM."* Both runs
designed in pen.dev through its MCP. The "with" run also had the ryux MCP for reference screens.

<a href="assets/compare/ui/compare.png"><img src="assets/compare/ui/compare.png" alt="Two Catat landing pages designed in pen.dev, stacked. Without Ryux: a polished hero with invented stats (48.000+ warung, 210 kota, 4,8 stars on Google Play), an unconfirmed 30-day trial, an unsourced +12% growth tag, amounts written as Rp 2.840.000 with a space, and a stock photo of a stranger presented as the user. With Ryux: one primary action, a sales ledger labeled Contoh data whose cash and QRIS totals add up to Rp164.000, and a plain three-step strip with no invented counts, ratings, or photos" width="100%"></a>

Both look finished, and that is the trap. Without Ryux, the polish hides invented numbers, a borrowed
face, and the wrong Rupiah format (RX-AS-01, RX-AS-02, RX-CD-02). With Ryux, there is one primary
action (RX-PR-03), the sample data is labeled and adds up (RX-AS-03, RX-QA-04), and the agent closed
with a Delivery Gate that marked its own gap honestly: only the 1920 frame was drawn, so RESPONSIVE
was reported as FAIL.

### Code

*"A TypeScript module that calculates an order total with shipping, an admin fee, and PPN 11%, and
formats it as Rupiah."*

<a href="assets/compare/code/compare.png"><img src="assets/compare/code/compare.png" alt="Two versions of order-total.ts side by side. Without Ryux: 100 lines with doc comments that restate each field and a formatter that outputs Rp 1.500.000 with a space. With Ryux: 71 lines, a comment that says why amounts are integers, the unknown PPN base marked as an ASSUMPTION to confirm instead of invented, and a formatter that outputs Rp1.250.000" width="100%"></a>

Comments only say why (RX-FE-06). The tax rule nobody specified is marked as an assumption instead of
invented (RX-PR-02, RX-FE-02). Money comes out as `Rp1.250.000`, not `Rp 1.250.000` (RX-FE-12).

### Copy

*"Tulis pengumuman promo gratis ongkir untuk grup WhatsApp pelanggan toko online saya."*

<a href="assets/compare/chat/compare.png"><img src="assets/compare/chat/compare.png" alt="Two WhatsApp promo announcements side by side. Without Ryux: emoji on almost every line, emoji number bullets, ALL CAPS, and three urgency lines including selama persediaan masih ada and sebelum kehabisan. With Ryux: one emoji in the greeting, a plain list of terms where every unknown value stays a placeholder, no invented code or quota, and a clear line on how to ask or order" width="100%"></a>

No emoji bullets or invented scarcity (RX-CD-06, RX-AS-04). Minimums, codes, and quotas the shop never
gave stay placeholders instead of invented terms (RX-PR-02), and the message ends with a clear next
step.

More before/after pairs (accessibility, forms, local payment, review) are in
[`docs/showcase.md`](docs/showcase.md#earlier-gallery).

## Ryux Critique

> **Get a senior design critique before your users do.**

Point it at a **Figma link**, a **pen.dev** design, a **website URL**, or a **screenshot**. It
captures the real design first (read-only), runs a Design Read across nine dimensions (clarity,
hierarchy, coherence, density, confidence, efficiency, specificity, recoverability, accessibility),
then lists at most 12 findings with severity, the rule behind each one, a fix, and what to keep. It
also says what it could not test, such as hover states on a static frame.

```text
Critique this Figma frame: https://www.figma.com/design/<file>/<name>?node-id=1-2
Review https://example.com at desktop and mobile width
Review the selected frame in pen.dev
```

| Source | How it is captured |
| --- | --- |
| Figma | Figma MCP (`get_screenshot`, `get_metadata`, `get_design_context`) |
| pen.dev | pen.dev MCP (`TakeScreenshot`, plus a check for clipped content) |
| Website | `npx playwright screenshot` at 1440 and 390 wide, or a browser tool |
| Screenshot | Read directly |

## Install

Three ways in, all installing the same skills. Every route includes Ryux Critique.

**1. Any agent, via [skills.sh](https://skills.sh)**

```bash
npx skills add ryuxdsgn/design-intelligence
```

**2. The Ryux CLI** (picks folders per agent, keeps `CLAUDE.md` / `GEMINI.md` / `AGENTS.md` pointers
in sync, and handles update and remove)

```bash
npx ryux                                         # interactive
npx ryux install --agent claude,cursor,codex     # non-interactive
npx ryux install --agent all --groups critique   # Ryux Critique only, every agent
npx ryux install --agent claude --global         # into your home directory
npx ryux update
npx ryux remove
```

**3. Claude Code plugin**

```text
/plugin marketplace add ryuxdsgn/design-intelligence
/plugin install ryux@design-intelligence
```

| Agent | Project folder | `--agent` |
| --- | --- | --- |
| Claude Code | `.claude/skills/` | `claude` |
| Codex | `.codex/skills/` | `codex` |
| Cursor | `.cursor/skills/` | `cursor` |
| Gemini CLI | `.gemini/skills/` | `gemini` |
| OpenCode | `.opencode/skills/` | `opencode` |
| Cline | `.cline/skills/` | `cline` |
| GitHub Copilot, Amp, Kimi Code, Antigravity | `.agents/skills/` | `copilot`, `amp`, `kimi`, `antigravity` |
| Anything else | rules inline in `AGENTS.md` | `agents-md` |

Groups: `foundation`, `ux`, `ui`, `engineering`, `quality`, and `critique`. `ryux-core` always comes
along. The reference data (Ryux Knowledge) is a separate hosted MCP service:
`claude mcp add --transport http ryux https://mcp.ryux.design/mcp` (early access).

## Repo layout (pnpm monorepo)

```
apps/mcp/         MCP server (Cloudflare Workers), 9 tools
apps/web/         ryux.design site (Next.js), landing + waitlist
packages/core/    @ryux/core, shared data and tool logic
packages/cli/     ryux, the CLI that installs the skills into agents (npx ryux)
skills/           the 15 Ryux skills (Build + Critique), one folder each
.claude-plugin/   Claude Code plugin and marketplace manifests
docs/             taxonomy.md, design-rules.md
```

Still to come: `packages/pipeline`, which turns captured video into data.

## Quick start

You'll need Node 20+ and pnpm.

```bash
pnpm install
pnpm dev:mcp        # MCP server on http://localhost:8787/mcp
pnpm dev:web        # ryux.design site on http://localhost:3000
pnpm typecheck
```

The MCP endpoint speaks **Streamable HTTP**, so connect through an MCP client (Claude Code, MCP
Inspector) rather than a regular browser.

To install Ryux into your own agent, see [Install](#install).

## Docs

| Document | What's in it |
| --- | --- |
| [`docs/taxonomy.md`](./docs/taxonomy.md) | Controlled vocabulary: categories, flows, patterns, components |
| [`docs/design-rules.md`](./docs/design-rules.md) | The Ryux skills and rules: levels, Hard Gates, Purpose Gates, Quality Locks, Delivery Gate |
| [`apps/mcp/README.md`](./apps/mcp/README.md) | Running and trying the MCP server |

## Status

**v0.1, early access, free.** The data is still sample data, there's no login yet, and quota lives
in memory. On the way to production: Supabase (`published` data with RLS on), OAuth, ledger-based
quota, and full-text plus pgvector search.

## Security

See [`SECURITY.md`](./SECURITY.md) for how to report a vulnerability. A few things we already do:
OCR text is treated as data and never as instructions, RLS is on from the first migration, and no
secrets live in the repo.

## License

**MIT**, © 2026 ryux.design (see [`LICENSE`](./LICENSE)). Use it, change it, ship it. The code and the
Ryux skills and rules are covered by this license. The reference data (screens, flows, designer notes)
and the hosted service are separate and not part of this repo.
