# @ryuxdsgn/ryux

Install **Ryux**, a design intelligence layer for AI and designers, with one command:

- **Analyze** (`ryux-analyze`): understand an existing interface, with every finding labeled
  Measured, Observed, or Inferred.
- **Build** (`ryux-core` plus 13 knowledge skills): senior product design reasoning while an agent
  creates UI, copy, and frontend code.
- **Critique** (`ryux-critique`): a senior design critique of a Figma link, a pen.dev design, a
  website URL, or a screenshot.
- **QA** (`ryux-visual-qa`): render, inspect, fix, render again.

Original work by ryux.design, MIT licensed. Rules and rationale:
[`docs/design-rules.md`](https://github.com/ryuxdsgn/design-intelligence/blob/main/docs/design-rules.md).

## Usage

```bash
npx @ryuxdsgn/ryux                                          # interactive: agents, groups, scope
npx @ryuxdsgn/ryux install --agent claude,cursor,codex      # non-interactive
npx @ryuxdsgn/ryux install --agent all --for designer      # Analyze, Critique, QA
npx @ryuxdsgn/ryux install --agent all --for builder       # Build, QA, Critique
npx @ryuxdsgn/ryux install --agent all                      # every supported agent, every skill
npx @ryuxdsgn/ryux install --agent all --groups critique    # Ryux Critique only
npx @ryuxdsgn/ryux install --agent claude --global          # into your home directory
npx @ryuxdsgn/ryux update                                   # refresh what's installed
npx @ryuxdsgn/ryux remove --yes                             # remove skills and marked blocks
```

`ryux-rules` still works as an alias of the same command.

## Agents

| Agent | `--agent` | Project folder | Global folder | Pointer file |
| --- | --- | --- | --- | --- |
| Claude Code | `claude` | `.claude/skills/` | `~/.claude/skills/` | `CLAUDE.md` |
| Codex | `codex` | `.codex/skills/` | `~/.agents/skills/` | `AGENTS.md` |
| Cursor | `cursor` | `.cursor/skills/` | `~/.cursor/skills/` | `AGENTS.md` |
| Gemini CLI | `gemini` | `.gemini/skills/` | `~/.gemini/skills/` | `GEMINI.md` |
| OpenCode | `opencode` | `.opencode/skills/` | `~/.config/opencode/skills/` | `AGENTS.md` |
| Cline | `cline` | `.cline/skills/` | `~/.cline/skills/` | `AGENTS.md` |
| GitHub Copilot | `copilot` | `.agents/skills/` | `~/.agents/skills/` | `AGENTS.md` |
| Amp | `amp` | `.agents/skills/` | `~/.config/agents/skills/` | `AGENTS.md` |
| Kimi Code | `kimi` | `.agents/skills/` | `~/.agents/skills/` | `AGENTS.md` |
| Antigravity | `antigravity` | `.agents/skills/` | `~/.gemini/config/skills/` | `AGENTS.md` |
| Anything else | `agents-md` | rules inline in `AGENTS.md` | (project only) | `AGENTS.md` |

Agents that share a folder are written once. Project installs add a short marked block to the
pointer file; global installs only write skill folders.

## Groups

| Group | Skills |
| --- | --- |
| `foundation` | `ryux-product` |
| `ux` | `ryux-ux`, `ryux-interaction`, `ryux-forms`, `ryux-edge-cases`, `ryux-content` |
| `ui` | `ryux-ui`, `ryux-design-system`, `ryux-accessibility`, `ryux-responsive` |
| `engineering` | `ryux-frontend` |
| `quality` | `ryux-visual-qa`, `ryux-anti-slop` |
| `analyze` | `ryux-analyze` |
| `critique` | `ryux-critique` |

Presets pick groups for you: `--for designer` installs `analyze`, `critique`, `quality`, `ux`, and
`ui`; `--for builder` installs `foundation`, `ux`, `ui`, `engineering`, `quality`, and `critique`;
`--for all` installs everything. `--groups` overrides a preset.

`ryux-core` (choose the capability, which skills to load, Hard Gates, the Delivery Gate) is always
installed. The default is every group.

## Safe for your repo

- Your files are never overwritten wholesale. `CLAUDE.md`, `GEMINI.md`, and `AGENTS.md` only change
  inside the `<!-- ryux-rules:start -->` ... `<!-- ryux-rules:end -->` block.
- `update` only touches what is installed; `remove` takes it back out.
- Upgrading from `ryux-rules` 0.x: old skill folders (`ryux-rules`, `ryux-copy`, `ryux-a11y`,
  `ryux-local`, `ryux-code`) and Cursor `.mdc` files are removed, and their content maps to the new
  skills. `--concerns` still works as a deprecated alias.

## Other ways to install

```bash
npx skills add ryuxdsgn/design-intelligence      # skills.sh, any agent
```

```text
/plugin marketplace add ryuxdsgn/design-intelligence
/plugin install ryux@design-intelligence          # Claude Code plugin
```

## Develop

```bash
pnpm --filter @ryuxdsgn/ryux build      # tsc -> dist/
node packages/cli/dist/index.js --help
pnpm sync:skills              # regenerate skills/ and docs/design-rules.md
```
