# @ryuxdsgn/ryux

Install **RYUX**, design intelligence for AI agents and designers, with one command. RYUX is one
skill with five entry points. Tell your agent what you are doing; RYUX picks the knowledge the task
needs:

- **Analyze**: understand an existing interface, with every finding labeled Measured, Observed, or
  Inferred.
- **Design**: create or improve UI and UX without code, in Figma, pen.dev, or mockups.
- **Build**: implement the interface in your repo's own stack.
- **Critique**: a senior design critique of a Figma link, a pen.dev design, a website URL, or a
  screenshot.
- **QA**: render, inspect, fix, render again.

Original work by ryux.design, MIT licensed. Rules and rationale:
[`docs/design-rules.md`](https://github.com/ryuxdsgn/design-intelligence/blob/main/docs/design-rules.md).

## Usage

```bash
npx @ryuxdsgn/ryux                                          # start here: agents, install, project setup
npx @ryuxdsgn/ryux setup                                    # teach RYUX about the project (DESIGN.md)
npx @ryuxdsgn/ryux setup --audience "..." --market "..."    # same, without questions
npx @ryuxdsgn/ryux check                                    # health check (exit 1 on problems)
npx @ryuxdsgn/ryux init --agent claude                      # install + empty project context block
npx @ryuxdsgn/ryux install --agent claude,cursor,codex      # non-interactive
npx @ryuxdsgn/ryux install --agent all                      # every supported agent
npx @ryuxdsgn/ryux install --agent claude --global          # into your home directory
npx @ryuxdsgn/ryux update                                   # refresh, and migrate RYUX 1.x installs
npx @ryuxdsgn/ryux remove --yes                             # remove RYUX and marked blocks
```

`ryux-rules` still works as an alias of the same command.

| Command | What it does |
| --- | --- |
| `setup` | Asks a few questions with plain choices, "Write my own", or Skip: product, current work, audience, market and locale, constraints, design intent, and UX, UI, and motion direction. Saves the answers to the `<!-- ryux-context -->` block in `DESIGN.md`, changing only the fields you answer. The answers are direction, not evidence. Without a terminal, set fields with `--product`, `--work`, `--audience`, `--market`, `--constraints`, `--intent`, `--ux`, `--ui`, `--motion`. |
| `init` | Installs RYUX, then adds a `<!-- ryux-context -->` block to `DESIGN.md` (product, audience, market and locale, design system, evidence sources, constraints), prefilled only with what it can detect. Re-running never overwrites what you wrote. |
| `install` | Writes the `ryux/` skill into each agent's folder and a short pointer block into `CLAUDE.md`, `GEMINI.md`, or `AGENTS.md`. Interactive installs then offer `setup`. |
| `check` (`doctor`) | Checks every install: all files present, frontmatter valid, version matches this CLI, every module reference resolves, no RYUX 1.x folders, pointer blocks, project context and how many setup fields are filled. Exits 1 on errors, so it works in CI. |
| `update` | Rewrites installs at this version and migrates RYUX 1.x. |
| `remove` | Removes the skill and the pointer blocks. Leaves your `DESIGN.md` context. |

One version: `packages/cli/package.json`. The skill header, the plugin manifests, and
`ryux --version` all derive from it.

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

## What gets installed

One folder, `ryux/`, in each agent's skills folder:

```
ryux/
  SKILL.md            the router: entry points, how RYUX works, levels, Hard Gates, task table, Delivery Gate
  capabilities/       analyze, design, build, critique, qa
  knowledge/          product, ux, interaction, forms, edge-cases, content, ui, design-system,
                      accessibility, responsive, frontend, anti-slop
```

The agent reads the router, then only the capability and knowledge files a task needs.

## Safe for your repo

- Your files are never overwritten wholesale. `CLAUDE.md`, `GEMINI.md`, and `AGENTS.md` only change
  inside the `<!-- ryux-rules:start -->` ... `<!-- ryux-rules:end -->` block.
- `update` only touches what is installed; `remove` takes it back out.
- Upgrading from RYUX 1.x: `install` or `update` replaces the 16 `ryux-*` folders with the single
  `ryux/` folder. Folders from `ryux-rules` 0.x and Cursor `.mdc` files are removed too. The old
  `--for`, `--groups`, and `--concerns` flags are accepted and ignored.

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
node packages/cli/dist/cli/index.js --help
pnpm sync:skills              # regenerate skills/ryux/, docs/design-rules.md, plugin versions
pnpm test                     # unit + CLI integration tests (node:test, no extra dependencies)
pnpm check:sync               # CI: fail if the committed skill, docs, or versions drift from the sources
```
