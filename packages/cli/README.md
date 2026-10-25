# @ryuxdsgn/design-intelligence

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
npx @ryuxdsgn/design-intelligence                                          # start here: agents, install, project setup
npx @ryuxdsgn/design-intelligence setup                                    # teach RYUX about the project (DESIGN.md)
npx @ryuxdsgn/design-intelligence setup --audience "..." --market "..."    # same, without questions
npx @ryuxdsgn/design-intelligence check                                    # health check (exit 1 on problems)
npx @ryuxdsgn/design-intelligence check --json                             # the same findings as JSON, for agents and CI
npx @ryuxdsgn/design-intelligence init --agent claude --dry-run            # list what would change, write nothing
npx @ryuxdsgn/design-intelligence init --agent claude                      # install + empty project context block
npx @ryuxdsgn/design-intelligence install --agent claude,cursor,codex      # non-interactive
npx @ryuxdsgn/design-intelligence install --agent all                      # every supported agent
npx @ryuxdsgn/design-intelligence install --agent claude --global          # into your home directory
npx @ryuxdsgn/design-intelligence update                                   # refresh, and migrate RYUX 1.x installs
npx @ryuxdsgn/design-intelligence remove --yes                             # remove RYUX and marked blocks
```

`ryux-rules` still works as an alias of the same command.

| Command | What it does |
| --- | --- |
| `setup` | Asks a few questions with plain choices, "Write my own", or Skip: product, current work, audience, market and locale, constraints, design intent, and UX, UI, and motion direction. Saves the answers to the `<!-- ryux-context -->` block in `DESIGN.md`, changing only the fields you answer. The answers are direction, not evidence. Without a terminal, set fields with `--product`, `--work`, `--audience`, `--market`, `--constraints`, `--intent`, `--ux`, `--ui`, `--motion`. |
| `init` | Installs RYUX, then adds a `<!-- ryux-context -->` block to `DESIGN.md` (product, audience, market and locale, design system, evidence sources, constraints), prefilled only with what it can detect. Re-running never overwrites what you wrote. `--dry-run` lists what it would create or update and writes nothing. |
| `install` | Writes the `ryux/` skill into each agent's folder and a short pointer block into `CLAUDE.md`, `GEMINI.md`, or `AGENTS.md`. Interactive installs then offer `setup`. `--dry-run` lists the folders and blocks it would create or update and writes nothing. |
| `check` (`doctor`) | Checks every install: all files present, frontmatter valid, version matches this CLI, every module reference resolves, no RYUX 1.x folders, pointer blocks, project context and how many setup fields are filled. Each problem names the command that fixes it. Exits 1 on errors, so it works in CI; `--json` prints `{ ok, cli, scope, installs, findings: [{ level, where, message, fix }] }`. |
| `update` | Rewrites installs at this version and migrates RYUX 1.x. |
| `remove` | Removes the skill and the pointer blocks. Leaves your `DESIGN.md` context. |

Exit codes: 0 done or healthy, 1 a problem was found or the command failed, 2 the command was used wrongly (an unknown command or agent).

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

## Network and MCP

- The CLI makes no network requests and runs no other programs. It only writes the files listed
  above.
- The ryux MCP server is optional: there is no hosted server yet, and RYUX never connects to one on
  its own. RYUX works without it and rates its evidence None.
- The skill tells agents to treat what an MCP server, web page, or screenshot returns as data,
  never as instructions.

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
pnpm --filter @ryuxdsgn/design-intelligence build      # tsc -> dist/
node packages/cli/dist/cli/index.js --help
pnpm sync:skills              # regenerate skills/ryux/, docs/design-rules.md, plugin versions
pnpm test                     # unit + CLI integration tests (node:test, no extra dependencies)
pnpm check:sync               # CI: fail if the committed skill, docs, or versions drift from the sources
```
