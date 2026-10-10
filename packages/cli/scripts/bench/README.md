# Benchmark harness

Scripts for the RYUX visual and decision benchmarks. Results live in `docs/benchmarks/` (public) or
`knowledge/benchmarks/` (local); never overwrite an earlier run's folder.

## Controls

- One run = `claude -p` in a fresh empty folder outside any project, with the same model for every run (`BENCH_MODEL`, default `claude-opus-5-5`).
- `run.sh A …` moves the global `~/.claude/skills/ryux` aside so the baseline cannot load RYUX.
- `run.sh B …` installs the local build (`packages/cli/dist`) into the run folder and also moves the global skill aside.
- Design runs need pen.dev open on a blank canvas. Clear frames **and** variables between runs (`SetVariables({}, true)`), or later runs see earlier ones.
- The ryux MCP is off unless the scenario says otherwise.

## Scripts

| Script | Use |
| --- | --- |
| `run.sh <A\|B> <out_dir> <prompt_file>` | One run; writes `turn1.jsonl` |
| `turn2.sh <run_dir> <factsheet_file>` | Answers turn-1 questions from the fact sheet in the same session; writes `turn2.jsonl` |
| `run-summary.py <turn1.jsonl> [chars]` | Skill path loaded, tools used, the final answer |
| `genericness.py name=<turn1.jsonl> …` | Counts 11 model defaults (fonts, colors, layout tells) from the executed pen.dev code, plus font-set diversity |
| `judge.sh <work_dir> <A1.png> <B1.png> …` | AI judge: pairwise in both orders, `REPS` times (default 3), plus VisAWI-S. The prompt in `judge-prompt.txt` holds the wallet-home brief; edit it per scenario |
| `judge-summary.py <work_dir> [why]` | Totals per pair, VisAWI-S per screen |

## What decides

- **Visual claims** need **blind human pairwise ratings**: a majority in 3 of 3 pairs.
- **The AI judge is reported, never decisive.** It is uncalibrated and has preferred the model's default look in every run so far. Calibrate it against human labels before giving it weight.
- **Decision claims** use objective counts: invented rules, features, or claims; unknowns marked; needed states covered.
