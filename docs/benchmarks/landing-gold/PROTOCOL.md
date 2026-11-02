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

## Amendment, 2026-10-30: round 3, RYUX with RX-UI-26 vs Impeccable

Written before the first round 3 run; nothing above changes.

**Why:** round 2 held a gap on AI-Slop Resistance (RYUX 1.33 v Impeccable 4.00) and showed one on Originality
(1.67 v 4.33). Reading both skills' runs: Impeccable assigns one grounded direction by a dice roll that refuses
the model's top-ranked pick, then commits to it; RYUX's RX-UI-10 said a page with no direction "will look plain",
and all three RYUX runs built the calm default. RX-UI-26 (branch `ryux/rx-ui-26`, commit 8d61fd5, still versioned
2.21.0) asks for three grounded directions, names the category default and does not build it, commits to one
direction as a labeled assumption, and keeps the purpose gate and the factual rules. The owner chose a rule alone,
with no dice tool, before adding any mechanism (2026-10-30).

**Arms:** R′, RYUX at 8d61fd5, installed the same way as R; and I, Impeccable 4.8.0 as in round 2, run again so
both are rated in one sitting. The same brief with the skill's name in front (`/ryux `, `/impeccable `), reply
rule, model, harness, isolation, and transcript check as round 2.

**Runs:** three per arm, six runs, one at a time in the order I1, R′1, I2, R′2, I3, R′3, in a new empty Figma file
so no run sees round 1 or round 2: the owner's `Untitled` (Fl5n1GE7IhRWwzMRezxz4N, checked empty), brief
[`prompt-r3.txt`](prompt-r3.txt), round 2's with only the file link changed. Letters drawn again and sealed in `~/bench-runs/landing-gold/r3/mapping.txt`.

**Rating:** the same eight areas, 1–5, blind, in one sitting, on one page "Uji" with the same brief and form.

**What counts as RX-UI-26 working,** all four:

1. R′'s AI-Slop Resistance mean is at least Impeccable's minus 0.33 (within one point over three runs).
2. R′'s Originality mean is at least 3.00 (round 2 RYUX: 1.67).
3. R′'s Restraint mean is at least 3.00 (round 2 RYUX: 3.00).
4. No R′ run shows a fact the brief never gave.

Also counted, as in round 2: typeface families per run (whether R′ still converges on one), whether each R′ run
names the default it declined and a signature element, cost, minutes, Figma craft.

**Then:** if all four hold, RX-UI-26 goes into the next release and the README states the round 3 result. If 1 or
2 fails, the next step is the dice mechanism (option B), tested the same way. If 3 or 4 fails, RX-UI-26 is revised
before anything else.

### Round 3, amendment: P1 cut by the account limit

I1 finished. P1 asked first, then hit the 5-hour account limit in turn 2 (21:47) after five Figma calls. Its partial
page "Uji R", its variable collection, and its nine text styles were deleted (none were used by "Uji F"), its folder
moved aside, and P1 rerun from the start with the same page name after the limit reset, followed by I2, P2, I3, P3.
Instead of waiting for the reset, the owner switched the CLI to the second account (the team org, Figma connected,
no RYUX in its synced skills) at 00:2x, so P1 to P3 run there; I1 ran on the first account. Google Drive, connected
on that account, is denied like the other connectors.
P1 finished there. I2 then hit that account's limit at 00:49 after about 14 minutes; its partial page "Uji L" (no
styles or variables of its own) was deleted and I2 rerun from the start after the 04:00 reset, followed by P2, I3, P3.

## Round 4: RYUX with Direction Discovery (P0), four runs, against round 3

Locked 2026-10-31, before the first run.

**Why:** round 3 failed criteria 1 and 2: a rule that tells the model to commit to a grounded direction moved all
three runs to one new default. The owner approved Design Direction Intelligence (spec in the platform repo):
with no direction given, RYUX writes a product profile, offers three directions (conventional, grounded,
stretching) as style tiles, and the user chooses. P0 is the new RX-UI-26, the direction grammar in
knowledge/ui.md, and the Understand-stage change, on branch `ryux/direction-discovery`.

**Arms and runs:** RYUX P0 only, four runs (Q1–Q4), one at a time, `/ryux` in front of the same brief
([`prompt-r4.txt`](prompt-r4.txt): round 3's brief, a new empty Figma file). No new Impeccable runs: the owner
chose to compare against round 3's Impeccable means (owner decision 2026-10-31, option A).

**The reply:** a run that asks first gets one fixed reply ([`reply-r4.txt`](reply-r4.txt)) naming an option
number for the visual direction, drawn at random per run before the runs and sealed with the letter mapping, so
the choice stands in for different users. A run that asks no direction question gets no reply and is recorded as
Autonomous.

**Anchors:** two round 3 designs are added to the rating page under new letters, one Impeccable and one RYUX′,
drawn at random and sealed, as screenshots (Figma cannot copy frames between files). They check whether the
owner's scale moved since round 3.

**Rating:** the same eight areas, 1–5, blind, in one sitting, six letters. Separately, after the eight areas, the
owner rates the three directions each run offered (fit, real difference, clarity), 1–5 per run.

**What counts as P0 working,** all six:

1. RYUX P0's AI-Slop Resistance mean is at least 3.33 (round 3 Impeccable 3.67 minus 0.33).
2. Its Originality mean is at least 3.00.
3. Its Restraint mean is at least 3.00.
4. No run shows a product fact the brief never gave.
5. No two runs build a direction with the same philosophy and grounding.
6. The owner's mean rating of the offered directions is at least 3.5.

**Anchor check:** if an anchor's eight-area mean moves by more than 0.5 from its round 3 score, the result is
reported with that drift and criteria 1–3 are read as uncertain.

**Then:** if all six hold, P1 (visual style tiles, the foundation contract in DESIGN.md, illustration direction)
is next and P0 goes into a release. If 5 fails, the rotation fallback (spec decision 1) is built and tested. If 1
or 2 fails with 5 holding, the directions are distinct but not good enough: the grammar and the grounded and
stretching roles are revised. If 4 fails, that is fixed before anything else.

### Round 4, amendment: restarted after a P0 defect

Q1 never asked: it read "with nobody to ask" in the new RX-UI-26 as "no question tool in this session", chose a
direction itself (a gold-shop counter look in Plus Jakarta Sans, close to round 3's), and marked it provisional.
The owner stopped the series during Q2 and asked for a fix. RX-UI-26 and the Understand stage now say that a
session without a question tool still asks, as numbered text, and ends the turn; the agent chooses only when the
user hands the choice back or the task says to run without questions. Q1 and Q2 were discarded (pages, variables,
and styles deleted; folders kept aside as evidence), and the four runs restarted with the same sealed letters and
option numbers. Criteria unchanged.

### Round 4, amendment: stopped

After the restart, Q1 and Q2 were offered nearly the same three directions (option 1 was "The Gold Shop Receipt" in
both) and both drew option 1, so they built the same direction. With four runs and one converged set of three
options, criterion 5 could not hold by construction (a protocol design error). The owner stopped the series to
change the protocol, then ended round 4. One run completed (Q1, page "Uji M"); nothing was rated.

## Round 5: RYUX after the owner trials vs Impeccable, three runs each

Locked 2026-10-31, before the first run; nothing above changes.

**Why:** round 4 was stopped (a protocol flaw: identical option sets and one drawn number). The owner then ran nine
interactive trials (T1–T9, Figma file Fl5n1GE7IhRWwzMRezxz4N, pages Uji T1–T9) and RYUX changed after each:
Product Discovery (RX-PR-13), three directions that differ in visual language (RX-UI-26), the concept as a system
(RX-UI-27), official marks (RX-UI-28), a weight carrier (RX-UI-29), made imagery (RX-UI-30), palettes from roles
(RX-UI-31), and one world per page (RX-UI-32). The owner rated T7 "near final"; those ratings were one run each and
not blind. This round checks the gap to Impeccable blind.

**Arms:** R5, RYUX at branch `ryux/direction-discovery` commit 389fc08 (template `Rv`, still versioned 2.21.0);
and I, Impeccable 4.8.0 as in rounds 2 and 3 (template `I`). The skill's name goes in front of the brief
(`/ryux `, `/impeccable `). Same model, harness, isolation, connectors, and deny list as round 3; Blender is
allowed (local renders, RX-UI-30) for both arms.

**Brief:** [`prompt-r5.txt`](prompt-r5.txt), round 3's brief plus the product facts the trials established (audience,
why, what people do, confirmed facts, no numbers), so both arms start with the same facts and the round measures
the visual result, not who asked more. The owner's `New-Test` file (cXIhgEtqrC8lG7sEYCSEZP, round 2's file): its pages were empty, and the 8 variable collections and 26 text styles round 2 left were deleted before the first run, with the owner's approval (2026-11-01).

**Replies:** a run that ends a turn without building the 1440 page gets [`reply-r5.txt`](reply-r5.txt), at most twice,
with an option number for the visual direction. The three R5 runs get the numbers 1, 2, and 3 in a sealed random
order, so no two runs take the same option; the I runs get the same draw rule if they ask. A run that never asks is
recorded as Autonomous.

**Runs:** six, one at a time, in the order I1, R1, I2, R2, I3, R3. Letters drawn and sealed in
`~/bench-runs/landing-gold/r5/mapping.txt`.

**Rating:** the same eight areas, 1–5, blind, in one sitting, six letters.

**What counts as RYUX catching up,** all five:

1. R5's AI-Slop Resistance mean is at least Impeccable's minus 0.33.
2. R5's Originality mean is at least Impeccable's minus 0.33.
3. R5's Restraint mean is at least 3.00.
4. No R5 run shows a product fact the brief never gave.
5. In every R5 run the store badges are on the first screen at 1440 and at 390 by 844 (the UI does not cost the task).

Also counted: whether the three R5 runs differ in base surface and material (RX-UI-26), made assets per run, cost,
minutes, and the words the skill loads.

**Then:** if all five hold, the branch is merged and released, and the README states the round 5 result. If 1 or 2
fails, the README keeps the round 3 claim and the gap is read from the transcripts before any new rule. If 4 or 5
fails, that is fixed first.

**Run log.** I1, R1, and I2 ran without a break (2026-11-01, 04:35 to 05:37). R2's first turn finished (questions
plus three style tiles on its page); its reply turn hit the account's 5-hour limit after 75 seconds, with no Figma
writes. Per the bench rule for a cut run, the run folder was set aside (`R2-cut-limit`), its page was deleted (it made
no styles or variables), and R2 reran from the start under the same page letter and reply option. The owner switched to a second Claude account
with limit left (same model, claude-opus-5-5), so R2, I3, and R3 ran on it from 05:59 instead of waiting for the reset.

**Decision after round 5 (owner, 2026-11-02):** criteria 1 and 2 failed, so by this protocol the branch would wait.
After owner trials T10 to T12 the owner chose to release it in 2.22.0 anyway, with the README's comparison claim
left at the round 5 result and a blind round 6 to follow.
