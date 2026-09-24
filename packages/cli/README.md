# ryux-rules (CLI)

Install the **ryux design rules** (RX-C / RX-H / RX-N / RX-L) into your AI agent with a single command.
Original work by ryux.design, MIT licensed. Rule source: [`docs/design-rules.md`](../../docs/design-rules.md).

## Usage

```bash
npx ryux-rules            # interactive wizard
npx ryux-rules update     # update what's installed
npx ryux-rules remove     # remove
```

The wizard asks: which agent you use, which **concern** you want to install, and (optionally) an MCP connection to ryux.

## Concern (pick the ones that matter, the core is always included)

| Concern | Contents | RX rules |
| --- | --- | --- |
| `ui` | UI and visuals | RX-C-02/07/08, RX-H-04/08/14, RX-N-12 |
| `copy` | Indonesian copywriting | RX-C-06, RX-L-06/07, RX-H-09, RX-N-05 |
| `a11y` | Accessibility | RX-H-11/12/13/14 |
| `ux` | Applied UX patterns (NNGroup) | RX-N-01/02/03/05/06/07/09/11 |
| `local` | Indonesian patterns | RX-L-01..05/09/10 |
| `code` | Clean code (add-on) | RX-K-01..06 |

The core (evidence and honesty: RX-C-01/03/04/05/09) is always installed as the `ryux-rules` skill.
A browsable version of each skill lives in [`skills/`](../../skills) (generated via `pnpm sync:skills`).

## Target per agent

| Agent | Files written |
| --- | --- |
| Claude Code | `.claude/skills/ryux-rules/SKILL.md` (core) + `.claude/skills/ryux-<concern>/SKILL.md` per concern + a marked block in `CLAUDE.md` |
| Cursor | `.cursor/rules/ryux-rules.mdc` (core) + `.cursor/rules/ryux-<concern>.mdc` per concern |
| Codex / others | a marked block in `AGENTS.md` (core plus the selected concerns, inline) |

## Safe for your repo

- Your files are never overwritten wholesale. Changes to `CLAUDE.md` and `AGENTS.md` stay
  inside the `<!-- ryux-rules:start -->` ... `<!-- ryux-rules:end -->` block.
- `update` only touches what is already installed; `remove` reverts it.

## Non-interactive mode

```bash
npx ryux-rules install --agent claude,cursor,codex --concerns ui,copy,a11y,ux,local,code --mcp
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
