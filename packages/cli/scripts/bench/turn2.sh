#!/bin/zsh
# Answer turn-1 questions from the fact sheet in the same session (same text for A and B).
# Also sends later turns (a feedback round): pass the output name as the third argument; the session
# continues from the most recent turn file.
#   turn2.sh <run_dir> <factsheet_file> [turn3]
set -e
DIR=$1; FACTS=$2; NAME=${3:-turn2}
SID=$(python3 -I -c "import json,sys
for l in open(sys.argv[1]):
    try: o=json.loads(l)
    except: continue
    if o.get('session_id'): sid=o['session_id']
print(sid)" $(ls -t $DIR/turn*.jsonl | head -1))
cd $DIR
# As in run.sh: the global skill is moved aside so A stays without RYUX and B loads only its own build.
G=$HOME/.claude/skills/ryux; ASIDE=$(mktemp -d)/ryux
if [[ -d $G ]]; then mv $G $ASIDE; trap 'mv $ASIDE $G' EXIT; fi
claude -p --resume "$SID" "$(cat $FACTS)" --model ${BENCH_MODEL:-claude-opus-5-5} --output-format stream-json --verbose < /dev/null > $NAME.jsonl 2> $NAME.err
