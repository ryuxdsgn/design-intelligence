# Gold savings landing page, four arms: protocol

Written before the runs; results go in README.md after scoring, and nothing here changes after the first run starts.

## Why

The owner asked for one prompt run once on each of four arms, no skill, Impeccable, antislop, and RYUX, with a
landing page in desktop and mobile designed in Figma (owner request, 2026-10-30). Case and copy language chosen
by the owner: a gold savings app, copy in English.

## Question

Given the same short brief, what does each arm put on the page: how it looks to a designer rating blind, what it
shows as fact that the brief never gave, whether mobile is designed or only shrunk, and what it costs.

## Brief

[`prompt.txt`](prompt.txt), `{PAGE}` replaced by the run's page name. Product context is in the brief, no
DESIGN.md, no brand assets. If a run ends turn 1 with a question and nothing on its page, [`reply.txt`](reply.txt)
is sent once through `turn2.sh`, on any arm. Nothing else is sent.

## Arms

All: Opus 5.5, Claude Code `claude -p` through [`run.sh`](../../../packages/cli/scripts/bench/run.sh), auto
permission mode, a fresh empty folder per run, the whole `~/.claude/skills` moved aside, the claude.ai Figma
connector and no other MCP server (`BENCH_CONNECTORS=1`; `mcp__ryux`, `mcp__pencil`, and
`mcp__claude-in-chrome` denied in `BENCH_SETTINGS` for every arm), and the owner's global Superpowers plugin off
in every arm (its session hook would otherwise reach all four). Each skill is installed into a template folder the
way its own README recommends for one project in Claude Code, and `run.sh` copies that folder in
(`BENCH_INSTALL`):

- **A, No skill:** every skill and command off.
- **I, Impeccable** ([`pbakaus/impeccable`](https://github.com/pbakaus/impeccable) at `02523ae`, npm 4.8.0):
  `npx impeccable install -y --providers=claude --scope=project`: the skill, its four agents, and the hook, as
  the README says. `/impeccable init` is not run, as no arm gets a DESIGN.md.
- **S, antislop** ([`miqdadbadjuber/anti-slop`](https://github.com/miqdadbadjuber/anti-slop) at `3005235`):
  its installer (`cli/lib/install.mjs`) with all skills, this project, Claude Code: the six skill folders and the
  pointer block in `CLAUDE.md`. The installer only runs interactively, so its install functions (npm
  `antislop-ai@3.2.24`, same skill files as `3005235`) are called with those three answers. antislop asks
  "during or after" in every session unless a mode is saved, so `antislop-ai --mode during` is set for this run
  only and removed after it: a design task is built during, and no other arm needs a mode.
- **R, RYUX 2.21.0:** built from tag `v2.21.0` (not the current branch, which carries held rules), installed with
  `ryux install --agent claude`.

One run per arm, by the owner's choice: what happened once, not a rate. Order A, I, S, R, one at a time, never in
parallel. Each run designs on its own new page so no run sees another's work. After the four runs, the eight
frames are copied side by side onto page "Uji" (`532:12011`), labeled only by page letter.

## Blind labels

Page names are `Uji K`, `Uji M`, `Uji P`, `Uji T`, drawn at random before the runs. The mapping is sealed in
`~/bench-runs/landing-gold/mapping.txt`, outside the repo, and goes into README.md after the owner's ratings.

## What is counted

From the Figma pages and each run's final message:

- **Owner rating, blind, 1–5 per area:** Context Fit, Originality, Restraint, Visual Hierarchy, Consistency,
  Production Plausibility, AI-Slop Resistance, Intentionality. A profile per area, no winner.
- **Shown as fact, never given:** regulator or license (for example OJK), custodian or partner names, prices,
  fees, spreads, returns, user counts, ratings, testimonials, awards, press logos. Labeled sample data does not
  count.
- **Both widths delivered**, their widths, and whether mobile reflows (order, stacking, tap targets) or only
  scales the desktop down.
- **Figma craft:** auto layout, named layers, text styles or variables, text clipped or overflowing (checked on
  screenshots).
- **Process:** asked before designing, cost (`total_cost_usd` of the last turn), minutes, Figma tool calls.

Reasoning in the final message (assumptions, stated intent) is noted separately and not mixed into the visual
rating.
