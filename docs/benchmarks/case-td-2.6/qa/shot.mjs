import { chromium } from 'playwright';
const b = await chromium.launch({executablePath: process.env.HOME+'/Library/Caches/ms-playwright/chromium-1234/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing'});
const ctx = await b.newContext({ viewport:{width:390,height:782}, deviceScaleFactor:2, locale:'en-GB' });
const p = await ctx.newPage();
for (const s of ['success','pending','failed','loading']) {
  await p.goto('file://'+process.argv[2]+'?state='+s); await p.waitForLoadState('networkidle');
  await p.evaluate(()=>document.querySelector('.preview').remove());
  await p.screenshot({path:`/tmp/rx-qa/build-${s}.png`});
  const m = await p.evaluate(()=>{const q=(sel)=>[...document.querySelectorAll(sel)].map(e=>{const r=e.getBoundingClientRect();return [Math.round(r.y),Math.round(r.height),Math.round(r.width)]});
    const cs=(sel,props)=>{const e=document.querySelector(sel); if(!e) return null; const c=getComputedStyle(e); return props.map(p=>c[p]).join(' ')};
    return {header:q('.header'),pill:q('.pill'),amount:q('.amount'),card:q('.card'),rows:q('.card > .row'),help:q('.help'),footer:q('.footer'),btns:q('.footer .button'),
      fonts:{amount:cs('.amount',['fontFamily','fontSize','fontWeight','letterSpacing']),id:cs('.copy-button__value',['fontFamily','fontSize']),label:cs('.row dt',['fontSize','color']),pill:cs('.pill',['fontSize','fontWeight'])},
      fontsLoaded:[...document.fonts].filter(f=>f.status==='loaded').map(f=>f.family+' '+f.weight)}});
  console.log(s, JSON.stringify(m));
}
await b.close();
