import json,re,sys,statistics as st
def load(p):
    code=[];res=""
    for l in open(p):
        try:d=json.loads(l)
        except:continue
        if d.get('type')=='assistant':
            for c in d['message'].get('content',[]):
                if c.get('type')=='tool_use' and c['name']=='mcp__pencil__execute': code.append(json.dumps(c['input']))
        if d.get('type')=='result': res=d.get('result') or ""
    return "\n".join(code),res
FONTS=["Inter","Bricolage Grotesque","Instrument Sans","Instrument Serif","IBM Plex Mono","IBM Plex Sans","IBM Plex Serif","JetBrains Mono","Schibsted Grotesk","Plus Jakarta Sans","Manrope","DM Sans","DM Serif Display","DM Mono","Space Grotesk","Space Mono","Geist","Fraunces","Outfit","Sora","Figtree","Onest","Familjen Grotesk","Hanken Grotesk","Archivo","Rubik","Work Sans","Newsreader","Literata","Source Serif 4","Libre Franklin","Public Sans","Atkinson Hyperlegible","Lexend","Epilogue","Syne","Unbounded","Young Serif","Gloock","Recursive","Azeret Mono","Martian Mono","Red Hat Display","Red Hat Text","Nunito","Poppins","Montserrat","Roboto","Lato","Open Sans","Karla","Barlow","Chivo","Overpass","Bitter","Crimson Pro","Playfair Display","Cormorant","EB Garamond","Spectral","Zilla Slab","Roboto Slab","Roboto Mono","Fira Sans","Fira Code"]
def rgb(h): return tuple(int(h[i:i+2],16) for i in (0,2,4))
def lum(c): return (0.2126*c[0]+0.7152*c[1]+0.0722*c[2])/255
def score(p):
    t,res=load(p); low=(t+res).lower()
    fonts=[f for f in FONTS if re.search(r'\b'+re.escape(f)+r'\b',t)]
    cs=[rgb(h.upper()) for h in set(re.findall(r'#([0-9A-Fa-f]{6})\b',t))]
    def hot(c):
        r_,g,b=c
        return max(c)-min(c)>=90 and ((r_>200 and b<120 and g<200) or (g>200 and r_>150 and b<90))
    f={"F1 Inter":"Inter" in fonts,"F2 Bricolage":"Bricolage Grotesque" in fonts,
       "C1 warm off-white":any(lum(c)>0.9 and c[0]-c[2]>=6 and c!=(255,255,255) for c in cs),
       "C2 warm near-black":any(lum(c)<0.1 and c[0]>=c[2] for c in cs),"C3 hot accent":any(hot(c) for c in cs),
       "L1 dark balance panel":bool(re.search(r'dark[^.\n]{0,40}(balance|panel|card)|(balance|panel|card)[^.\n]{0,30}(dark|black|near-black)',res.lower())),
       "L2 initials avatars":bool(re.search(r'initial|avatar',low)),"L3 Hide":"hide" in low,"L4 Updated":"updated" in low,
       "L5 Today/Yesterday":"yesterday" in low,"L6 pill":bool(re.search(r'cornerRadius\\?"?:\s*(999|9999|[4-9]\d)',t))}
    return fonts,f
if __name__=="__main__":
    rows={}
    for arg in sys.argv[1:]:
        name,p=arg.split("=",1); fonts,f=score(p); rows[name]=(fonts,f)
        print(f"{name:6} {sum(f.values())}/11  fonts={fonts}  defaults={[k for k,v in f.items() if v]}")
    print("mean",round(st.mean(sum(f.values()) for _,f in rows.values()),2))
    sets=[frozenset(fo) for fo,_ in rows.values()]; print("identical font sets:",len(sets)-len(set(sets))+ (1 if len(set(sets))<len(sets) else 0), "distinct sets",len(set(sets)))
