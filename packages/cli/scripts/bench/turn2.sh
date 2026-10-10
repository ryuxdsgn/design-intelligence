#!/bin/zsh
# Answer turn-1 questions from the fact sheet in the same session (same text for A and B).
#   turn2.sh <run_dir> <factsheet_file>
set -e
DIR=$1; FACTS=$2
SID=$(python3 -I -c "import json,sys
for l in open(sys.argv[1]):
    try: o=json.loads(l)
    except: continue
    if o.get('session_id'): print(o['session_id']); break" $DIR/turn1.jsonl)
cd $DIR
claude -p --resume "$SID" "$(cat $FACTS)" --model ${BENCH_MODEL:-claude-opus-5-5} --output-format stream-json --verbose < /dev/null > turn2.jsonl 2> turn2.err
