#!/bin/zsh
# Answer turn-1 questions from the fact sheet in the same session (same text for A and B).
# Also sends later turns (a feedback round): pass the output name as the third argument; the session
# continues from the most recent turn file.
#   turn2.sh <run_dir> <factsheet_file> [turn3]
set -e
DIR=$1; FACTS=${2:A}; NAME=${3:-turn2}
SID=$(python3 -I -c "import json,sys
for l in open(sys.argv[1]):
    try: o=json.loads(l)
    except: continue
    if o.get('session_id'): sid=o['session_id']
print(sid)" $(ls -t $DIR/turn*.jsonl | head -1))
cd $DIR
# Same isolation as run.sh; a folder with RYUX installed is B, anything else is A.
G=$HOME/.claude/skills; ASIDE=$(mktemp -d)/skills
restore() { [[ -e $G ]] && mv $G $ASIDE.recreated; mv $ASIDE $G; }
if [[ -d $G ]]; then mv $G $ASIDE; trap restore EXIT; fi
FLAGS=(--model ${BENCH_MODEL:-claude-opus-5-5} --strict-mcp-config --permission-mode auto
  --settings ${BENCH_SETTINGS:-'{"enabledPlugins":{"design@synced":false,"product-management@synced":false},"permissions":{"deny":["Skill(design)","Skill(design-sync)"]}}'}
  --output-format stream-json --verbose)
[[ -d .claude/skills/ryux ]] || FLAGS+=(--disable-slash-commands)
claude -p --resume "$SID" "$(cat $FACTS)" $FLAGS < /dev/null > $NAME.jsonl 2> $NAME.err
