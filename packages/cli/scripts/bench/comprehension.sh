#!/bin/zsh
# Comprehension check: a fresh agent sees only one screen and answers factual questions.
#   comprehension.sh <screen.png> <questions.txt> <out.json>
# The answers are scored by hand against keys taken from the run's own screen data.
set -e
PNG=${1:A}; Q=${2:A}; OUT=${3:A}
W=$(mktemp -d); cp $PNG $W/screen.png; cd $W
claude -p "Look only at screen.png in this folder: one screen of a mobile app. Answer each question as a user would, using only what the screen shows. If the screen does not show the answer, write \"not shown\". Reply with JSON only: {\"answers\": [\"...\", \"...\", \"...\"]}.

$(cat $Q)" --model ${BENCH_MODEL:-claude-opus-5-5} --allowedTools Read --output-format json < /dev/null | jq -r '.result' > $OUT
rm -rf $W
