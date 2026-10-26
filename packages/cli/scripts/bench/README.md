# Benchmark harness

Scripts for the RYUX visual and decision benchmarks. Results live in `docs/benchmarks/` (public) or
`knowledge/benchmarks/` (local); never overwrite an earlier run's folder.

## Controls

- One run = `claude -p` in a fresh empty folder outside any project, with the same model for every run (`BENCH_MODEL`, default `claude-opus-5-5`) and the same permission mode.
- `run.sh A …` turns off every skill and command for the session: the baseline is "no skill".
- `run.sh B … [DESIGN.md]` copies the DESIGN.md (B only) and installs the local build (`packages/cli/dist`) into the run folder.
- Both arms: no MCP servers, synced plugins off (`BENCH_SETTINGS` overrides the settings JSON), and the whole `~/.claude/skills` moved aside and put back after, even when Claude Code recreates the folder during the run.
- Run one at a time. Three Opus runs in parallel hit the account's session limit in about 16 minutes.
- Check each run's first line with `run-summary.py`: only B lists `ryux`, and no MCP server is listed.
- Design runs need pen.dev open on a blank canvas. Clear frames **and** variables between runs (`SetVariables({}, true)`), or later runs see earlier ones.
- The ryux MCP is off unless the scenario says otherwise.

## Scripts

| Script | Use |
| --- | --- |
| `run.sh <A\|B> <out_dir> <prompt_file> [DESIGN.md]` | One run; writes `turn1.jsonl` |
| `turn2.sh <run_dir> <factsheet_file> [name]` | Answers turn-1 questions from the fact sheet in the same session; writes `turn2.jsonl`, or `<name>.jsonl` for a later turn |
| `run-summary.py <turn1.jsonl> [chars]` | Skills and MCP servers the session could load, skill path loaded, tools used, turns, minutes, cost, the final answer |
| `genericness.py name=<turn1.jsonl> …` | Counts 11 model defaults (fonts, colors, layout tells) from the executed pen.dev code, plus font-set diversity |
| `ds-measure.js` | pen.dev `execute` snippet, run on the run's canvas before it is cleared: variables, components and instances, and per kind (color, spacing, radius, type, font) how many values use a `$variable` vs a literal; prints JSON with `tokenShare`. Spacing counts only `gap` and `padding`, so absolutely positioned layouts show none |
| `comprehension.sh <screen.png> <questions.txt> <out.json>` | A fresh agent sees only the screen and answers factual questions; score the answers by hand against keys from the run's own screen data. Measures legibility of facts, not preference |
| `judge.sh <work_dir> <A1.png> <B1.png> …` | AI judge: pairwise in both orders, `REPS` times (default 3), plus VisAWI-S. The prompt in `judge-prompt.txt` holds the wallet-home brief; edit it per scenario |
| `judge-summary.py <work_dir> [why]` | Totals per pair, VisAWI-S per screen |

## What decides

- **Visual claims** need **blind human pairwise ratings**: a majority in 3 of 3 pairs.
- **The AI judge is reported, never decisive.** It is uncalibrated and has preferred the model's default look in every run so far. Calibrate it against human labels before giving it weight.
- **Decision claims** use objective counts: invented rules, features, or claims; unknowns marked; needed states covered.
