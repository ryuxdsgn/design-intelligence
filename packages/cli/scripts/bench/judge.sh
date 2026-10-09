#!/bin/zsh
# AI judge: secondary signal only. Each pair is judged in both left/right orders, REPS times.
#   judge.sh <work_dir> <A1.png> <B1.png> [<A2.png> <B2.png> ...]
# Uncalibrated LLM judges prefer the model's own default look; never use this alone to decide.
set -e
J=$1; shift; HERE=${0:A:h}; REPS=${REPS:-3}
mkdir -p $J/img $J/out
python3 -I - "$J" "$@" <<'PY'
import sys,json
from PIL import Image
J=sys.argv[1]; files=sys.argv[2:]; jobs=[]
for p in range(len(files)//2):
    a,b=files[2*p],files[2*p+1]; ims={"A":Image.open(a).convert("RGB"),"B":Image.open(b).convert("RGB")}
    for order in ("AB","BA"):
        L,R=ims[order[0]],ims[order[1]]; h=max(L.height,R.height)
        c=Image.new("RGB",(L.width+R.width+120,h+80),(236,236,236)); c.paste(L,(40,40)); c.paste(R,(L.width+80,40))
        n=f"pair{p+1}-{order}"; c.save(f"{J}/img/{n}.png"); jobs.append({"img":n+".png","left":order[0]+str(p+1),"right":order[1]+str(p+1)})
json.dump(jobs,open(f"{J}/jobs.json","w"))
PY
G=$HOME/.claude/skills/ryux; ASIDE=$(mktemp -d)/ryux
[[ -d $G ]] && mv $G $ASIDE
trap '[[ -d $ASIDE ]] && mv $ASIDE $G' EXIT
for rep in $(seq 1 $REPS); do for f in $J/img/*.png; do n=$(basename $f .png); d=$J/run-$n-$rep; mkdir -p $d; cp $f $d/image.png
  (cd $d && claude -p "$(sed "s#IMAGE_PATH#$d/image.png#" $HERE/judge-prompt.txt)" --model ${BENCH_MODEL:-claude-opus-5-5} --allowedTools Read --output-format json < /dev/null > $J/out/$n-$rep.json 2>/dev/null) &
done; wait; done
python3 -I $HERE/judge-summary.py $J
