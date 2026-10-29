// sheet.mjs <runs_dir> <out_dir>: blind rating sheets for the illustration protocol.
// Pairs A1-B1 and A2-B2 per task, X/Y at random, mapping sealed in <out_dir>/sealed/mapping.json.
// Each side: its SVGs inline at display size and 2x, on light and on dark, with the layer outline.
//   PLAYWRIGHT_ROOT=<dir> node sheet.mjs ~/bench-runs/illustration knowledge/benchmarks/illustration
import { readFileSync, readdirSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { join } from 'path';
import { randomInt } from 'crypto';
import { createRequire } from 'module';
const require = createRequire(process.env.PLAYWRIGHT_ROOT ? process.env.PLAYWRIGHT_ROOT + '/' : import.meta.url);
const { chromium } = require('playwright');

const [runs, out] = process.argv.slice(2);
// Display width per task (px), from each brief.
const TASKS = { 't0-icons': 24, 't1-empty-states': 240, 't2-mascot': 320, 't3-editorial': 800 };
const svgs = dir => existsSync(join(dir, 'art'))
  ? readdirSync(join(dir, 'art')).filter(f => f.endsWith('.svg')).sort().map(f => ({ name: f, src: readFileSync(join(dir, 'art', f), 'utf8') }))
  : [];
// A file named for dark mode is shown on dark only; one named for light, on light only (then the plain
// file, a default, is left out of that mode). With no mode files, every file shows in both.
const forMode = (files, mode) => {
  const dark = files.filter(f => /dark/i.test(f.name)), light = files.filter(f => /light/i.test(f.name));
  if (mode === 'dark') return dark.length ? dark : files;
  return light.length ? light : files.filter(f => !/dark/i.test(f.name));
};
// Layer outline: groups and shapes by id or data-name, nested; long lists cut.
const outline = src => {
  const lines = []; let depth = 0;
  for (const m of src.matchAll(/<(\/?)(g|path|rect|circle|ellipse|line|polyline|polygon|use)\b([^>]*?)(\/?)>/g)) {
    const [, close, tag, attrs, self] = m;
    if (close) { if (tag === 'g') depth--; continue; }
    const name = (attrs.match(/\b(?:id|data-name)="([^"]+)"/) || [])[1];
    if (tag === 'g' || name) lines.push('  '.repeat(Math.max(depth, 0)) + (tag === 'g' ? '▸ ' : '· ') + (name || `(${tag})`));
    if (tag === 'g' && !self) depth++;
  }
  return lines.length > 60 ? [...lines.slice(0, 60), `… ${lines.length - 60} more`] : lines;
};
// Each inline SVG gets its own id prefix, so two sides with the same ids (grad1, clip) never share defs.
let uid = 0;
const scoped = src => {
  const k = `s${++uid}-`;
  return src.replace(/<\?xml[^>]*>/, '')
    .replace(/\bid="([^"]+)"/g, `id="${k}$1"`)
    .replace(/url\(\s*#([^)\s]+)\s*\)/g, `url(#${k}$1)`)
    .replace(/((?:xlink:)?href)="#([^"]+)"/g, `$1="#${k}$2"`)
    .replace(/<svg\b/, '<svg style="width:100%;height:auto;display:block"');
};
const side = (label, files, w) => `
  <section><h2>${label}</h2>
  ${['light', 'dark'].map(mode => `<div class="mode ${mode}">${[1, 2].map(k => `<div class="row">${forMode(files, mode).map(f =>
    `<figure style="width:${w * k}px">${scoped(f.src)}</figure>`).join('')}</div>`).join('')}</div>`).join('')}
  <pre>${files.map(f => f.name + '\n' + outline(f.src).join('\n')).join('\n\n').replace(/</g, '&lt;')}</pre></section>`;

mkdirSync(join(out, 'sealed'), { recursive: true }); mkdirSync(join(out, 'survey'), { recursive: true });
const mapping = {}; const pages = [];
let n = 0;
for (const [task, w] of Object.entries(TASKS)) for (const i of [1, 2]) {
  const a = svgs(join(runs, task, `A${i}`)), b = svgs(join(runs, task, `B${i}`));
  const flip = randomInt(2) === 1; n++;
  const pair = `pair-${n}`;
  mapping[pair] = { task, X: flip ? `B${i}` : `A${i}`, Y: flip ? `A${i}` : `B${i}` };
  const [x, y] = flip ? [b, a] : [a, b];
  const html = `<!doctype html><meta charset="utf-8"><title>${pair}</title><style>
    body{font:14px system-ui;margin:24px;color:#222} h1{font-size:18px} section{margin:0 0 40px}
    .mode{padding:16px;margin:8px 0;border-radius:8px} .light{background:#fff;color:#16181d;border:1px solid #ddd}
    .dark{background:#111317;color:#eef0f3} .row{display:flex;gap:16px;align-items:flex-end;margin:8px 0;flex-wrap:wrap}
    figure{margin:0} pre{font-size:11px;background:#f5f5f5;padding:8px;max-height:320px;overflow:auto}</style>
    <h1>${pair} · ${task} · display width ${w}px, then 2x · light, then dark</h1>
    <p>Brief: ${readFileSync(new URL(`./prompts/${task}.txt`, import.meta.url), 'utf8').replace(/</g, '&lt;')}</p>
    ${side('X', x, w)}${side('Y', y, w)}`;
  writeFileSync(join(out, 'survey', `${pair}.html`), html);
  pages.push(pair);
}
writeFileSync(join(out, 'sealed', 'mapping.json'), JSON.stringify(mapping, null, 2));
// Score sheet: one row per side, filled in by the rater.
const dims = ['originality', 'art_direction', 'craft', 'cohesion', 'editability', 'brief_fidelity'];
writeFileSync(join(out, 'scores.csv'), ['pair,side,' + dims.join(',') + ',notes',
  ...pages.flatMap(p => ['X', 'Y'].map(s => `${p},${s},${dims.map(() => '').join(',')},`))].join('\n') + '\n');
// A PNG of each sheet for the release (full page).
const browser = await chromium.launch(); const page = await browser.newPage({ viewport: { width: 1400, height: 900 } });
for (const p of pages) {
  await page.goto('file://' + join(process.cwd(), out, 'survey', `${p}.html`));
  await page.screenshot({ path: join(out, 'survey', `${p}.png`), fullPage: true });
}
await browser.close();
console.log(`${pages.length} sheets in ${join(out, 'survey')}; mapping sealed; scores.csv ready`);
