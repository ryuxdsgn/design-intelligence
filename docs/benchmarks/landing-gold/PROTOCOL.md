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

## Amendment, 2026-10-30: round 2, Impeccable vs RYUX

Written before the first round 2 run; nothing above changes.

**Why:** in round 1 the owner rated Impeccable above RYUX in Context Fit (5 v 4), Visual Hierarchy (5 v 4), and
AI-Slop Resistance (4 v 3), and tied in the other five areas. One run per arm cannot tell a gap from a draw. Round
2 asks whether the gap comes back, before any RYUX rule is written for it (owner request, 2026-10-30).

**Arms:** I and R only, the same versions and templates as round 1 (Impeccable 4.8.0 with its hook; RYUX 2.21.0
from the tag), the same brief, reply rule, model, harness, and isolation, through
`~/bench-runs/landing-gold/arm.sh`. No skill and antislop are not run again.

**Runs:** three per arm, six runs, one at a time in the order I1, R1, I2, R2, I3, R3. Folders
`~/bench-runs/landing-gold/r2/<arm><n>`.

**Figma:** a new, empty file for round 2, the owner's `New Test` (cXIhgEtqrC8lG7sEYCSEZP, checked empty: one blank
page, no variables, no styles), so no run can see round 1's pages, frames, or variable collections. Each run designs
on its own new page in that file. The brief is [`prompt-r2.txt`](prompt-r2.txt): round 1's, with only the file link
changed.

**Blind labels:** six page letters drawn at random before the first run, none of K, M, P, T; the mapping is
sealed in `~/bench-runs/landing-gold/r2/mapping.txt`. After the six runs, the twelve frames (desktop and mobile)
are copied to one page "Uji" in that file with only their letters, next to the same brief and rating form as
round 1. The owner rates the six letters in one sitting, the same eight areas, 1–5. Round 1 is not rated again.

**What is counted:** the same as round 1 (facts shown as given that the brief never gave, both widths, Figma craft,
cost, minutes, Figma calls, asked first), plus, for round 1's open question, each run's typeface families and
whether the page is built on a light warm (cream or beige) background with a display serif and gold.

**What counts as the gap holding, per area** (Context Fit, Visual Hierarchy, AI-Slop Resistance): Impeccable's
mean is at least 0.67 above RYUX's (two points over three runs), and Impeccable rates higher in at least two of
the three pairs (I1–R1, I2–R2, I3–R3). Then the next step is to read what Impeccable's skill says about the areas
that held and to write RYUX's own rule for them, tested in a round 3. If no area holds, round 1 is reported as one
run that did not repeat, and no rule is written from it.

**Typeface question:** reported as counts per arm next to each run's AI-Slop Resistance score; a pattern across six
runs is a lead for round 3, not a finding.

**Scope:** the owner has seen round 1's pages and knows its mapping, so the owner may recognize a skill's style in
round 2. The labels stay blind anyway, and this limit is named in the results.

## Amendment to round 2, 2026-10-30, after four runs

Written before any round 2 result was looked at for scoring; nothing above changes.

- **Account skills:** before round 2 the owner turned off the RYUX 2.14.1 skill on the claude.ai account (see the
  round 1 correction in README.md). Each run's start was checked: arm I lists `impeccable` and arm R lists `ryux`,
  and no `anthropic-skills:ryux`.
- **R1 and R2 asked first** and ended turn 1 without drawing; each gets [`reply.txt`](reply.txt) once, as the
  protocol says.
- **I3 was cut off** by the account's 5-hour limit after 3.7 minutes, half-drawn; R3 never started. The half-drawn
  page is deleted (the run log is kept, not scored), and I3 runs again on the same page name.
- **Account change:** the owner switched Claude Code to a second claude.ai account to continue, and connected the
  Figma connector there. I1, I2, R1, and R2's first turns ran on the first account; R1 and R2's replies, I3, and R3
  run on the second. The second account has no synced skills; this is checked at each run's start as above.

## Amendment to round 2, 2026-10-30: restarted with each skill called by name

Written before the restarted runs; the four earlier round 2 runs are discarded, not scored.

- **Why restarted:** in I1 and I2 Impeccable was installed and listed but never called; the agent designed with no
  skill. RYUX was called in every R run, because its installer writes a pointer into `CLAUDE.md` and Impeccable's
  writes none. That measured whether a skill gets called, not what it does when it is. The owner chose to call
  both by name (2026-10-30).
- **Brief:** [`prompt-r2.txt`](prompt-r2.txt) with one word in front: `/impeccable ` on arm I, `/ryux ` on arm R.
  Nothing else differs. A short check run confirmed that each prefix loads that skill's own `SKILL.md` into the
  session, and that arm I has no RYUX.
- **Cleared:** the earlier round 2 pages, variable collections, and styles were removed from `New Test`, leaving
  one empty page; the earlier run folders are kept aside in `~/bench-runs/landing-gold/aborted/`. Page letters are
  drawn again and sealed again.
- **Each run is checked** from its session transcript: arm I loaded Impeccable and never RYUX; arm R loaded RYUX.
  A run that fails the check is reported, not scored.
- Everything else as written above: three runs per arm in the order I1, R1, I2, R2, I3, R3, one reply if a run
  asks first, the second claude.ai account (no synced skills, Figma connected), the same rating and decision rule.
- **Account, restarted round 2:** I1, R1, I2, and R2 ran on the second account; I3 hit that account's 5-hour
  limit before its first tool call (nothing drawn) and runs again, with R3, on the first account. A check session
  on the first account before I3 listed no `anthropic-skills:ryux`, only document skills, the same set as the
  second account, and could read `New Test`.
