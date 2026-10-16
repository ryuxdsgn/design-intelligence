const P={fill:"color",stroke:"color",gap:"spacing",padding:"spacing",cornerRadius:"radius",fontSize:"type",fontFamily:"font"}
const o={};for(const k of new Set(Object.values(P)))o[k]={tok:0,lit:0,values:{}}
let comps=0,inst=0
Get(n=>{if(n.reusable)comps++;if(n.type==="ref")inst++;for(const k in P){const v=n[k];if(v===undefined)continue;for(const x of(Array.isArray(v)?v:[v])){if(x===null||typeof x==="object"||x===0||x==="0")continue;const m=o[P[k]];if(typeof x==="string"&&x.startsWith("$"))m.tok++;else{m.lit++;m.values[String(x)]=1}}}})
const r={variables:Object.keys(GetVariables().variables||{}).length,components:comps,instances:inst}
let t=0,l=0;for(const k in o){r[k]={tok:o[k].tok,lit:o[k].lit,distinctLiterals:Object.keys(o[k].values).length};t+=o[k].tok;l+=o[k].lit}
r.tokenShare=t+l?Math.round(100*t/(t+l)):null
Print(JSON.stringify(r))
