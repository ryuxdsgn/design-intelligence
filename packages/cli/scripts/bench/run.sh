#!/bin/zsh
# One benchmark run in a fresh folder, outside any project.
#   run.sh <A|B> <out_dir> <prompt_file>
# A = without RYUX: the global ~/.claude/skills/ryux is moved aside for the run and restored after.
# B = with RYUX: the local build (packages/cli/dist) is installed into the run folder; the global skill
#     is also moved aside so only this build loads.
# Open a blank canvas in pen.dev first, and clear it between runs (frames and variables).
set -e
COND=$1; OUT=$2; PROMPT_FILE=$3
ROOT=${0:A:h}/../../../..
CLI=$ROOT/packages/cli/dist/cli/index.js
G=$HOME/.claude/skills/ryux; ASIDE=$(mktemp -d)/ryux
mkdir -p $OUT && cd $OUT
[[ $COND == B && ! -d .claude/skills/ryux ]] && node $CLI install --agent claude >/dev/null
# Runs are sequential: a parallel run could find the global skill already moved.
if [[ -d $G ]]; then mv $G $ASIDE; trap 'mv $ASIDE $G' EXIT; fi
claude -p "$(cat $PROMPT_FILE)" --model ${BENCH_MODEL:-claude-opus-5-5} --output-format stream-json --verbose < /dev/null > turn1.jsonl 2> turn1.err
