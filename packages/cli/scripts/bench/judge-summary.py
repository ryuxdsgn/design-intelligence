import json,sys,glob,re,collections,os,statistics as st
J=sys.argv[1]; jobs={j["img"][:-4]:j for j in json.load(open(f"{J}/jobs.json"))}
pref=collections.defaultdict(collections.Counter); vis=collections.defaultdict(list); bad=[]; whys=[]
for f in sorted(glob.glob(f"{J}/out/*.json")):
    n,rep=os.path.basename(f)[:-5].rsplit("-",1); j=jobs[n]
    try:
        r=json.load(open(f)); txt=r.get("result","")
        if r.get("is_error"): bad.append((n,rep,txt[:60])); continue
        o=json.loads(re.search(r"\{.*\}",txt,re.S).group(0))
    except Exception as e: bad.append((n,rep,str(e)[:60])); continue
    p=n[4]
    for q in ("polished","senior_ship"):
        side=o[q]; win=j["left"] if side=="left" else j["right"] if side=="right" else "none"
        pref[(p,q)][win[0] if win!="none" else "none"]+=1
    for side in ("left","right"): vis[j[side][0]+p].append(o["visawi"][side])
    w=j["left"] if o["polished"]=="left" else j["right"]; whys.append(f"{n}-{rep} {w}: {o['why'][:170]}")
print("BAD",bad)
for k in sorted(pref): print("PAIR",k,dict(pref[k]))
tot=collections.Counter(); [tot.update(c) for (p,q),c in pref.items() if q=="polished"]; print("POLISHED TOTAL",dict(tot))
for r in sorted(vis):
    a=list(zip(*vis[r])); print("VISAWI",r,"n",len(vis[r]),[round(st.mean(x),2) for x in a],"mean",round(st.mean(sum(vis[r],[])),2))
for k in ("A","B"): print("MEAN",k,round(st.mean([x for r,v in vis.items() if r[0]==k for row in v for x in row]),2))
if len(sys.argv)>2: print("\n".join(whys))
