import { chromium } from 'playwright';
const b = await chromium.launch({executablePath: process.env.HOME+'/Library/Caches/ms-playwright/chromium-1234/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing'});
for (const locale of ['en-US','en-GB','de-DE','id-ID']) {
  const p = await (await b.newContext({locale, viewport:{width:390,height:782}})).newPage();
  await p.goto('file://'+process.argv[2]+'?state=success');
  console.log(locale, await p.evaluate(()=>[...document.querySelectorAll('.amount,.row__value,.row__sub')].map(e=>e.textContent.trim()).join(' | ')));
}
await b.close();
