import json,sys,re,collections
tools=collections.Counter();res=None;skills=set();sid=None;init=None
for l in open(sys.argv[1]):
    try:d=json.loads(l)
    except:continue
    s=json.dumps(d); skills.update(re.findall(r'Base directory for this skill: ([^\\"]+)',s))
    sid=d.get('session_id') or sid
    if d.get('type')=='system' and d.get('subtype')=='init': init=d
    if d.get('type')=='assistant':
        for c in d['message'].get('content',[]):
            if c.get('type')=='tool_use': tools[c['name']]+=1
    if d.get('type')=='result': res=d
res=res or {}
# What the session could load: check that only B lists ryux and that no MCP server is connected.
if init: print('MODEL',init.get('model'),'AVAILABLE',[k for k in init.get('skills',[]) if not k.startswith('anthropic-skills:')],'MCP',[m['name'] for m in init.get('mcp_servers',[])])
print('SID',sid,'SKILLS',skills,'TOOLS',dict(tools))
print('ERR',res.get('is_error'),'TURNS',res.get('num_turns'),'MIN',round(res.get('duration_ms',0)/60000,1),'COST_USD',round(res.get('total_cost_usd',0),2))
print(res.get('result','')[:int(sys.argv[2]) if len(sys.argv)>2 else 3000])
