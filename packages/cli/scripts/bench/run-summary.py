import json,sys,re,collections
tools=collections.Counter();res=None;skills=set();sid=None
for l in open(sys.argv[1]):
    try:d=json.loads(l)
    except:continue
    s=json.dumps(d); skills.update(re.findall(r'Base directory for this skill: ([^\\"]+)',s))
    sid=d.get('session_id') or sid
    if d.get('type')=='assistant':
        for c in d['message'].get('content',[]):
            if c.get('type')=='tool_use': tools[c['name']]+=1
    if d.get('type')=='result': res=d
print('SID',sid,'SKILLS',skills,'TOOLS',dict(tools))
print('ERR',res and res.get('is_error'),'TURNS',res and res.get('num_turns')); print((res or {}).get('result','')[:int(sys.argv[2]) if len(sys.argv)>2 else 3000])
