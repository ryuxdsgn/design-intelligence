# Case TD-2.6 · One screen through RYUX's five steps: protocol

Written and locked before the run, 2026-10-12.

## Question

What does RYUX 2.6.2 do with an existing screen when it is asked, in order, to analyze, critique,
improve, build, and QA it?

## Input

`input/screen.png`: the transaction detail screen designed **without** RYUX in EN-TD-2.3.3, run A2
(`../en-td-2.3.3/a2/output.png`, unedited). It is the agent's own output, not a real product.

## Setup

- One session, RYUX 2.6.2 (`packages/cli/dist`, installed into the run folder by
  `packages/cli/scripts/bench/run.sh B`; the global skill is moved aside).
- Clean harness: `claude -p` in an empty folder outside any project, model `claude-opus-5-5`.
- ryux MCP off: no reference screens, so every decision is evidence None.
- pen.dev open on an empty canvas (`bench.pen`), frames and variables cleared before the run.
- Five turns in the same session (`--resume`), one short neutral prompt each (`prompts/`).
- If the agent asks questions, they are answered only with the EN-TD fact sheet
  (`prompts/factsheet.md`, the same text as EN-TD-2.3.3), as its own turn, before the next step.

## Rules

- One run. It is shown as it came out, including what went wrong.
- A rerun only for a technical failure (a crash, a tool that does not start); any rerun is recorded here.
- Everything the agent writes is published in this folder. The only edit allowed: absolute local
  paths replaced with `[local path]`.
- This is a case study of one run, not a benchmark: it shows what RYUX did, not how often.

## Reruns

- Turn 1, first attempt: the agent never started (`Input must be provided…`). The harness was given a
  relative prompt path and read it after changing folder, so the prompt was empty. Rerun with an
  absolute path; nothing else changed.
