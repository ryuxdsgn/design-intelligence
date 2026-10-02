# ryux-rules (CLI)

Install **Ryux** (RX-2.0), the design skills for AI coding agents, with a single command.
Original work by ryux.design, MIT licensed. Rule source: [`docs/design-rules.md`](../../docs/design-rules.md).

## Usage

```bash
npx ryux-rules            # interactive wizard
npx ryux-rules update     # update what's installed
npx ryux-rules remove     # remove
```

The wizard asks which agent you use, which **groups** you want, and (optionally) for an MCP
connection to ryux.

## Groups and skills (`ryux-core` is always included)

| Group | Skills |
| --- | --- |
| `foundation` | `ryux-product` (RX-PR) |
| `ux` | `ryux-ux` (RX-UX), `ryux-interaction` (RX-IX), `ryux-forms` (RX-FM), `ryux-edge-cases` (RX-EC), `ryux-content` (RX-CD) |
| `ui` | `ryux-ui` (RX-UI), `ryux-design-system` (RX-DS), `ryux-accessibility` (RX-A11Y), `ryux-responsive` (RX-RD) |
| `engineering` | `ryux-frontend` (RX-FE) |
| `quality` | `ryux-visual-qa` (RX-QA), `ryux-anti-slop` (RX-AS) |

`ryux-core` holds the workflow, the levels, which skills to load for a task, the 10-area Delivery
Gate, and honest-claims wording. Every other skill is a short framework followed by rules marked
**[Required]**, **[Preferred]**, or **[Contextual]**, some of them **[Hard Gate]** or
**[Quality Lock]**. A browsable version of each skill lives in [`skills/`](../../skills)
(generated via `pnpm sync:skills`).

## Target per agent

| Agent | Files written |
| --- | --- |
| Claude Code | `.claude/skills/ryux-core/SKILL.md` + `.claude/skills/ryux-<skill>/SKILL.md` per skill + a marked block in `CLAUDE.md` |
| Cursor | `.cursor/rules/ryux-core.mdc` + `.cursor/rules/ryux-<skill>.mdc` per skill |
| Codex / others | a marked block in `AGENTS.md` (core plus the selected skills, inline) |

## Safe for your repo

- Your files are never overwritten wholesale. Changes to `CLAUDE.md` and `AGENTS.md` stay
  inside the `<!-- ryux-rules:start -->` ... `<!-- ryux-rules:end -->` block.
- `update` only touches what is already installed; `remove` reverts it.
- Upgrading from RX-1.x: `install` and `update` replace the old core (`ryux-rules`) and remove the
  old `ryux-copy`, `ryux-a11y`, `ryux-local`, and `ryux-code` skills; `ryux-ui` and `ryux-ux` are
  rewritten with their new content. `--concerns` still works as a deprecated alias.

## Non-interactive mode

```bash
npx ryux-rules install --agent claude,cursor,codex --groups foundation,ux,ui,engineering,quality --mcp
npx ryux-rules remove --yes
```

## Develop

```bash
pnpm --filter ryux-rules build      # tsc -> dist/
node packages/cli/dist/index.js --help
```

## Publishing (later)

The package is still `private: true`. Before publishing to npm: check that the name `ryux-rules`
is available (alternative `@ryux/rules`), set `private: false`, and add a `LICENSE`.
