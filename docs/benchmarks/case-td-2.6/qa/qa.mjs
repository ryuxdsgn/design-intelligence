import { chromium } from 'playwright';
const file = 'file://' + process.argv[2];
const b = await chromium.launch({executablePath: process.env.HOME+'/Library/Caches/ms-playwright/chromium-1234/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing'});
const out = [];
for (const [w,h] of [[390,844],[375,667],[320,568]]) {
  const ctx = await b.newContext({ viewport:{width:w,height:h}, deviceScaleFactor:2, permissions:['clipboard-read','clipboard-write'] });
  const p = await ctx.newPage(); const errs=[]; p.on('pageerror',e=>errs.push(e.message)); p.on('console',m=>m.type()==='error'&&errs.push(m.text()));
  for (const s of ['success','pending','failed','loading']) {
    await p.goto(`${file}?state=${s}`); await p.waitForLoadState('networkidle');
    await p.evaluate(()=>document.querySelector('.preview').style.display='none');
    const r = await p.evaluate(()=>{
      const sw=document.documentElement.scrollWidth, cw=document.documentElement.clientWidth;
      const f=document.querySelector('.footer').getBoundingClientRect();
      const small=[...document.querySelectorAll('.app button')].map(b=>b.getBoundingClientRect()).filter(r=>r.height<44||r.width<44).length;
      return {overflowX: sw>cw, footerBottom: Math.round(f.bottom), vh: innerHeight, docH: document.documentElement.scrollHeight, smallTargets: small, buttons:[...document.querySelectorAll('.footer button')].map(b=>b.textContent.trim())};
    });
    out.push(`${w}x${h} ${s} ${JSON.stringify(r)}`);
    if (w!==320) await p.screenshot({path:`/tmp/rx-qa/${s}-${w}.png`});
  }
  await p.goto(`${file}?state=success`); await p.click('[data-action=copy]'); await p.waitForTimeout(200);
  out.push(`${w} copy toast: "${await p.textContent('#toast')}" clipboard: ${await p.evaluate(()=>navigator.clipboard.readText())}`);
  out.push(`${w} errors: ${JSON.stringify(errs)}`);
  await ctx.close();
}
const ctx = await b.newContext({viewport:{width:390,height:844}}); const p=await ctx.newPage();
await p.goto(`${file}?state=success`); await p.keyboard.press('Tab');
const order=[]; for(let i=0;i<9;i++){order.push(await p.evaluate(()=>document.activeElement.textContent.trim().slice(0,24)||document.activeElement.getAttribute('aria-label'))); await p.keyboard.press('Tab');}
out.push('tab order: '+order.join(' | '));
await p.emulateMedia({}); await p.evaluate(()=>document.body.style.fontSize='');
console.log(out.join('\n')); await b.close();
