#!/bin/zsh
# Routing eval: each case in cases.json, one at a time, through ../run.sh B (local build installed, no global skill,
# no MCP). Cases marked "full" run to the end so the Delivery Gate can be checked; the rest stop at the budget cap,
# since routing happens at the start.
#   routing.sh <out_dir> [case_id ...]      then: routing-score.py <out_dir>
set -e
OUT=${1:A}; shift; HERE=${0:A:h}; CASES=$HERE/cases.json
IDS=(${@:-$(python3 -c "import json;print(' '.join(c['id'] for c in json.load(open('$CASES'))['cases']))")})
CAP=$(python3 -c "import json;print(json.load(open('$CASES'))['budget_cap_usd'])")
# Plugins load from settings, not from ~/.claude/skills: turn off every enabled one (a globally installed RYUX plugin
# would otherwise sit beside the local build), plus the defaults run.sh already denies.
export BENCH_SETTINGS=$(python3 -I -c "
import json, pathlib
p = pathlib.Path.home() / '.claude/settings.json'
on = json.loads(p.read_text()).get('enabledPlugins', {}) if p.exists() else {}
off = {k: False for k in on} | {'design@synced': False, 'product-management@synced': False}
print(json.dumps({'enabledPlugins': off, 'permissions': {'deny': ['Skill(design)', 'Skill(design-sync)']}}))")
for id in $IDS; do
  dir=$OUT/$id
  [[ -e $dir/turn2.jsonl ]] && { echo "$id: done already, skipped"; continue; }
  mkdir -p $dir
  read -r fixture full <<< "$(python3 -c "import json;c=[c for c in json.load(open('$CASES'))['cases'] if c['id']=='$id'][0];print(c['fixture'] or '-', 'full' if c.get('full') else 'cap')")"
  [[ $fixture != - && ! -e $dir/turn1.jsonl ]] && rsync -a $HERE/fixtures/$fixture/ $dir/
  python3 -c "import json;print([c for c in json.load(open('$CASES'))['cases'] if c['id']=='$id'][0]['prompt'])" > $dir/prompt.txt
  echo "$id: $full"
  budget=(); [[ $full == full ]] || budget=(BENCH_MAX_BUDGET=$CAP)
  if [[ ! -e $dir/turn1.jsonl ]]; then
    env $budget $HERE/../run.sh B $dir $dir/prompt.txt || echo "$id: turn 1 ended with an error (see $dir/turn1.err)"
  fi
  # RYUX asks before it builds when an answer changes the work (RX-PR-01); the knowledge is read after the answer.
  # A reply with no Delivery Gate gets one more turn that tells it to assume and finish.
  gated=$(python3 -I -c "
import json, sys
r = ''
for l in open(sys.argv[1]):
    try: d = json.loads(l)
    except ValueError: continue
    if d.get('type') == 'result': r = d.get('result') or ''
print('yes' if 'modules read' in r.lower() else 'no')" $dir/turn1.jsonl)
  if [[ $gated == no ]]; then
    env $budget $HERE/../turn2.sh $dir $HERE/answers.txt || echo "$id: turn 2 ended with an error (see $dir/turn2.err)"
  fi
done
