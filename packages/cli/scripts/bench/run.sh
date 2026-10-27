#!/bin/zsh
# One benchmark run in a fresh folder, outside any project.
#   [BENCH_FIXTURE=<repo>] run.sh <A|B> <out_dir> <prompt_file> [DESIGN.md]
# A = no skill: every skill and command is turned off for the session.
# B = with RYUX: the local build (packages/cli/dist) is installed into the run folder, after the optional
#     DESIGN.md is copied in (B only; A never gets it).
# Both: no MCP servers, synced plugins off (BENCH_SETTINGS), the whole ~/.claude/skills moved aside so no
# global skill loads, same model and permission mode. Runs are sequential: parallel Opus runs hit the
# session limit, and a parallel run could find the skills folder already moved.
set -e
COND=$1; OUT=$2; PROMPT_FILE=${3:A}; DESIGN=${4:+${4:A}}; FIXTURE=${BENCH_FIXTURE:+${BENCH_FIXTURE:A}}
ROOT=${0:A:h}/../../../..
CLI=$ROOT/packages/cli/dist/cli/index.js
mkdir -p $OUT && cd $OUT
# BENCH_FIXTURE=<dir>: start from a copy of that repo instead of an empty folder, dependencies installed and
# committed once, so the run's changes are `git diff` against that commit. Same for both arms.
if [[ -n $FIXTURE && ! -e package.json ]]; then
  rsync -a --exclude node_modules --exclude dist --exclude '*.tsbuildinfo' $FIXTURE/ .
  npm ci --no-audit --no-fund >/dev/null 2>&1
  git init -q && git add -A && git -c user.name=fixture -c user.email=fixture@example.com commit -qm fixture
fi
if [[ $COND == B && ! -d .claude/skills/ryux ]]; then
  [[ -n $DESIGN ]] && cp $DESIGN DESIGN.md
  node $CLI install --agent claude >/dev/null
fi
# Claude Code may recreate ~/.claude/skills (synced/) during a run: keep that copy aside and put the
# original back, so the restore never fails silently.
G=$HOME/.claude/skills; ASIDE=$(mktemp -d)/skills
restore() { [[ -e $G ]] && mv $G $ASIDE.recreated; mv $ASIDE $G; }
if [[ -d $G ]]; then mv $G $ASIDE; trap restore EXIT; fi
FLAGS=(--model ${BENCH_MODEL:-claude-opus-5-5} --permission-mode auto
  --settings ${BENCH_SETTINGS:-'{"enabledPlugins":{"design@synced":false,"product-management@synced":false},"permissions":{"deny":["Skill(design)","Skill(design-sync)"]}}'}
  --output-format stream-json --verbose)
# BENCH_CONNECTORS=1 keeps the claude.ai connectors (for a design-tool benchmark); deny the ones not
# under test in BENCH_SETTINGS. Default: no MCP servers at all.
[[ -n $BENCH_CONNECTORS ]] || FLAGS+=(--strict-mcp-config)
[[ $COND == A ]] && FLAGS+=(--disable-slash-commands)
claude -p "$(cat $PROMPT_FILE)" $FLAGS < /dev/null > turn1.jsonl 2> turn1.err
