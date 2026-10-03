# RYUX Guide (from scratch)

A short guide: what RYUX is, how to install its rules into your agent, and how to connect to
the reference data over MCP. If you just want a quick overview, read the [README](./README.md).

## What RYUX is

RYUX is two things that work together:

1. **RYUX** (installed with `npx @ryuxdsgn/ryux` or `npx skills add`): design skills (RX-2.0) that guide decisions and filter output so it doesn't
   "smell like AI": evidence-backed, accessible, and fitted to the product's market. Doc: [`docs/design-rules.md`](./docs/design-rules.md).
2. **MCP server**: gives your agent access to **reference screens from real products** (captured
   screens, designer notes) plus audit tools. Nine tools; see [`apps/mcp/README.md`](./apps/mcp/README.md).

Rules without data are just style; data without rules is just a pile of images. RYUX combines the two.

## 1. Install RYUX into your agent

One command, then answer a few questions (which agents you use, which groups to install, MCP connection):

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

### Non-interactive

```bash
npx @ryuxdsgn/ryux install --agent claude,cursor,codex   # these agents, this project
npx @ryuxdsgn/ryux install --agent all --global         # every agent, home directory
npx skills add ryuxdsgn/design-intelligence     # alternative: skills.sh, any agent
```

## 2. Connect to MCP (reference data)

The RYUX rules are at their strongest when your agent can pull real evidence. Connect the RYUX MCP:

```bash
claude mcp add --transport http ryux https://mcp.ryux.design/mcp
```

For local development, run the server yourself:

```bash
pnpm install
pnpm dev:mcp        # http://localhost:8787/mcp
```

Connect through an MCP client (Claude Code, MCP Inspector), not a regular browser (the endpoint
uses the Streamable HTTP transport).

## 3. Try it

Ask your agent:

- "Find a reference for a payment method picker with QRIS via RYUX."
- "Critique this checkout page." RYUX routes to Critique on its own.
- "Analyze this screenshot, then design a better version in pen.dev."
- "Review this screen with `heuristic_eval`, and include a comparison screen as evidence."

## Update & Remove

```bash
npx @ryuxdsgn/ryux update     # update the rules you've installed
npx @ryuxdsgn/ryux remove     # remove them (restores your files to their original state)
```

## What's next

- Full rules: [`docs/design-rules.md`](./docs/design-rules.md)
- Vocabulary (categories, flows, patterns): [`docs/taxonomy.md`](./docs/taxonomy.md)
