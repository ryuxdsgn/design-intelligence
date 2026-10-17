// score-type.mjs <index.html>...: T1-T7, C1-C2 from the locked typo-craft protocol. Prints JSON per file.
import { createRequire } from 'module';
const require = createRequire(process.env.PLAYWRIGHT_ROOT ?? import.meta.url);
const { chromium } = require('playwright');

const measure = () => {
  const vis = e => { const r = e.getBoundingClientRect(); const cs = getComputedStyle(e); return r.width > 0 && r.height > 0 && cs.visibility !== 'hidden' && cs.display !== 'none'; };
  const ownText = e => [...e.childNodes].filter(n => n.nodeType === 3).map(n => n.textContent).join('').trim();
  const texts = [...document.querySelectorAll('body *')].filter(e => vis(e) && ownText(e).length > 0);
  // word boxes for line detection
  const lines = e => {
    const tops = new Map(); const walker = document.createTreeWalker(e, NodeFilter.SHOW_TEXT);
    let n; while ((n = walker.nextNode())) {
      const re = /\S+/g; let m; while ((m = re.exec(n.textContent))) {
        const r = document.createRange(); r.setStart(n, m.index); r.setEnd(n, m.index + m[0].length);
        const b = r.getClientRects()[0]; if (!b) continue; const k = Math.round(b.top / 4);
        const l = tops.get(k) || { chars: 0, words: [] }; l.chars += m[0].length + 1; l.words.push(m[0]); tops.set(k, l);
      }
    }
    return [...tops.entries()].sort((a, b) => a[0] - b[0]).map(x => x[1]);
  };
  const out = {};
  // T1
  const paras = [...document.querySelectorAll('p, li, dd')].filter(e => vis(e) && e.textContent.trim().split(/\s+/).length >= 40);
  out.T1 = paras.length ? { pass: paras.every(p => Math.max(...lines(p).map(l => l.chars)) <= 75), max: Math.max(...paras.map(p => Math.max(...lines(p).map(l => l.chars)))) } : null;
  // T2
  const lh = e => { const cs = getComputedStyle(e); const fs = parseFloat(cs.fontSize); const v = cs.lineHeight === 'normal' ? 1.2 : parseFloat(cs.lineHeight) / fs; return { fs, r: v }; };
  const body = texts.filter(e => { const f = lh(e).fs; return f >= 14 && f <= 18 && ownText(e).split(/\s+/).length >= 8; });
  const big = texts.filter(e => lh(e).fs >= 28);
  const bad = [...body.filter(e => { const r = lh(e).r; return r < 1.35 || r > 1.7; }).map(e => 'body ' + lh(e).r.toFixed(2)), ...big.filter(e => lh(e).r > 1.3).map(e => 'big ' + lh(e).r.toFixed(2))];
  out.T2 = body.length + big.length ? { pass: bad.length === 0, bad: [...new Set(bad)].slice(0, 5) } : null;
  // T3
  const caps = texts.filter(e => { const cs = getComputedStyle(e); const t = ownText(e); return parseFloat(cs.fontSize) <= 16 && t.replace(/[^A-Za-z]/g, '').length >= 3 && (cs.textTransform === 'uppercase' || (t === t.toUpperCase() && /[A-Z]{3}/.test(t) && !/\d/.test(t))); });
  out.T3 = caps.length ? { pass: caps.every(e => parseFloat(getComputedStyle(e).letterSpacing) > 0), n: caps.length } : null;
  // T4
  const num = t => t.length < 24 && (/^[-+−]?\s?(Rp|[$€£¥])\s?\d[\d.,]*(\s*\/\s*\w+)?$/i.test(t) || /^[-+−]?\d[\d.,\s]*$/.test(t));
  const nums = texts.filter(e => num(ownText(e)) && (e.closest('table') || /Rp|[$€£¥]/.test(ownText(e))));
  const tab = e => { const cs = getComputedStyle(e); return /tabular-nums/.test(cs.fontVariantNumeric) || /mono/i.test(cs.fontFamily); };
  out.T4 = nums.length ? { pass: nums.every(tab), n: nums.length, notTabular: nums.filter(e => !tab(e)).map(e => ownText(e)).slice(0, 4) } : null;
  // T5
  const weights = new Set(texts.map(e => getComputedStyle(e).fontWeight)); const fams = new Set(texts.map(e => getComputedStyle(e).fontFamily.split(',')[0].trim().replace(/["']/g, '')));
  out.T5 = { pass: weights.size <= 3 && fams.size <= 2, weights: [...weights], families: [...fams] };
  // T7
  const disp = texts.filter(e => parseFloat(getComputedStyle(e).fontSize) >= 32);
  out.T7 = disp.length ? { pass: disp.every(e => { const ls = getComputedStyle(e).letterSpacing; return ls === 'normal' || parseFloat(ls) <= 0; }) } : null;
  // C1
  const icons = [...document.querySelectorAll('svg, img')].filter(i => { const r = i.getBoundingClientRect(); return vis(i) && r.width > 0 && r.width < 32 && r.height < 32 && i.parentElement && ownText(i.parentElement).length > 0; });
  const off = icons.map(i => { const ib = i.getBoundingClientRect(); const p = i.parentElement; const t = [...p.childNodes].find(n => n.nodeType === 3 && n.textContent.trim()); const r = document.createRange(); r.selectNodeContents(t); const tb = r.getClientRects()[0]; return tb ? Math.abs((ib.top + ib.height / 2) - (tb.top + tb.height / 2)) : 0; });
  out.C1 = icons.length ? { pass: off.every(d => d <= 2), worst: Math.max(...off).toFixed(1), n: icons.length } : null;
  // C2
  const tables = [...document.querySelectorAll('table')].filter(vis);
  if (tables.length) {
    const res = tables.map(t => { const rows = [...t.querySelectorAll('tbody tr')]; if (!rows.length) return null; const ncol = rows[0].children.length; const cols = [];
      for (let c = 0; c < ncol; c++) { const cells = rows.map(r => r.children[c]).filter(Boolean); if (cells.filter(x => /[$€£]\s?\d|\d[.,]\d{2}\b/.test(x.textContent)).length >= cells.length * 0.8) cols.push(cells); }
      return cols.length ? cols.every(cells => cells.every(x => /right|end/.test(getComputedStyle(x).textAlign) || getComputedStyle(x).justifyContent.includes('end'))) : null; }).filter(x => x !== null);
    out.C2 = res.length ? { pass: res.every(Boolean) } : null;
  } else out.C2 = null;
  return out;
};
const headings = () => {
  const vis = e => { const r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0; };
  const hs = [...document.querySelectorAll('h1, h2, h3')].filter(h => vis(h) && h.textContent.trim().split(/\s+/).length >= 3);
  const widow = h => { const cs = getComputedStyle(h); if (/balance|pretty/.test(cs.textWrap || cs.textWrapStyle || '')) return false;
    const tops = new Map(); const w = document.createTreeWalker(h, NodeFilter.SHOW_TEXT); let n;
    while ((n = w.nextNode())) { const re = /\S+/g; let m; while ((m = re.exec(n.textContent))) { const r = document.createRange(); r.setStart(n, m.index); r.setEnd(n, m.index + m[0].length); const b = r.getClientRects()[0]; if (b) { const k = Math.round(b.top / 4); tops.set(k, [...(tops.get(k) || []), m[0]]); } } }
    const ls = [...tops.entries()].sort((a, b) => a[0] - b[0]).map(x => x[1]); return ls.length > 1 && ls[ls.length - 1].length === 1 && ls[ls.length - 1][0].length <= 10; };
  return hs.length ? { pass: !hs.some(widow), widows: hs.filter(widow).map(h => h.textContent.trim().slice(0, 40)) } : null;
};
const b = await chromium.launch();
for (const f of process.argv.slice(2)) {
  const r = {};
  for (const [w, h] of [[1280, 800], [390, 844]]) {
    const p = await b.newPage({ viewport: { width: w, height: h } });
    await p.goto('file://' + f, { waitUntil: 'networkidle' }).catch(() => p.goto('file://' + f)); await p.waitForTimeout(800);
    if (w === 1280) Object.assign(r, await p.evaluate(measure)); else r.T6 = await p.evaluate(headings);
    await p.close();
  }
  const keys = ['T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'C1', 'C2'];
  const app = keys.filter(k => r[k]); const pass = app.filter(k => r[k].pass);
  console.log(JSON.stringify({ file: f.split('/').slice(-2).join('/'), score: `${pass.length}/${app.length}`, fails: app.filter(k => !r[k].pass), detail: r }));
}
await b.close();
