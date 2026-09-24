# ryux Guide (from scratch)

A short guide: what ryux is, how to install its rules into your agent, and how to connect to
the reference data over MCP. If you just want a quick overview, read the [README](./README.md).

## What ryux is

ryux is two things that work together:

1. **ryux-rules**: design rules (RX-C / RX-H / RX-N / RX-L) that filter output so it doesn't
   "smell like AI": evidence-backed, accessible, and fitted to the Indonesian context. Doc: [`docs/design-rules.md`](./docs/design-rules.md).
2. **MCP server**: gives your agent access to **reference screens from Indonesian apps** (real
   data, designer notes) plus audit tools. Nine tools; see [`apps/mcp/README.md`](./apps/mcp/README.md).

Rules without data are just style; data without rules is just a pile of images. ryux combines the two.

## 1. Install ryux-rules into your agent

One command, then answer a few questions (which agent you use, which concerns to install, MCP connection):

```bash
npx ryux-rules
```

The CLI writes to the right place for each agent:

| Agent | File |
| --- | --- |
| Claude Code | `.claude/skills/ryux-rules/SKILL.md` + a marked block in `CLAUDE.md` |
| Cursor | `.cursor/rules/ryux-rules.mdc` |
| Codex / others | a marked block in `AGENTS.md` |

Your files are never overwritten wholesale. Changes stay inside the block
`<!-- ryux-rules:start -->` … `<!-- ryux-rules:end -->`.

### Non-interactive

```bash
npx ryux-rules install --agent claude,cursor --concerns ui,copy,a11y,ux,local
```

## 2. Connect to MCP (reference data)

The ryux rules are at their strongest when your agent can pull real evidence. Connect the ryux MCP:

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

- "Find a reference for a payment method picker with QRIS via ryux."
- "Audit this checkout page with ryux-rules."
- "Review this screen with `heuristic_eval`, and include a comparison screen as evidence."

## Update & Remove

```bash
npx ryux-rules update     # update the rules you've installed
npx ryux-rules remove     # remove them (restores your files to their original state)
```

## What's next

- Full rules: [`docs/design-rules.md`](./docs/design-rules.md)
- Vocabulary (categories, flows, patterns): [`docs/taxonomy.md`](./docs/taxonomy.md)
