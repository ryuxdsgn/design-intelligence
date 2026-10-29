// score-svg.mjs <file.svg>...: the deterministic floor from the locked illustration protocol. Prints JSON per file.
// A pass here says the file is a sound, editable SVG; it says nothing about whether the art is good.
//   PLAYWRIGHT_ROOT=<dir with node_modules/playwright> node score-svg.mjs art/*.svg
import { readFileSync, statSync } from 'fs';
import { createRequire } from 'module';
const require = createRequire(process.env.PLAYWRIGHT_ROOT ? process.env.PLAYWRIGHT_ROOT + '/' : import.meta.url);
const { chromium } = require('playwright');

const SHAPES = 'path,rect,circle,ellipse,line,polyline,polygon,use';

// Runs in the page: parse the source as SVG, then measure the rendered geometry.
const measure = ({ src, shapes }) => {
  const doc = new DOMParser().parseFromString(src, 'image/svg+xml');
  if (doc.querySelector('parsererror') || doc.documentElement.localName !== 'svg') return { parses: false };
  const root = document.importNode(doc.documentElement, true);
  document.body.append(root);
  const vb = root.viewBox.baseVal;
  const hasViewBox = root.hasAttribute('viewBox') && vb.width > 0 && vb.height > 0;
  const fixed = ['width', 'height'].filter(a => root.hasAttribute(a) && !/%$/.test(root.getAttribute(a)));
  // An embedded raster is an <image>/<feImage>, or a raster data URI elsewhere (a style); counted once each.
  const raster = Math.max(root.querySelectorAll('image, feImage').length,
    (src.match(/data:image\/(png|jpe?g|gif|webp)/g) || []).length);
  const text = root.querySelectorAll('text').length;
  // Editor attributes, not the word: a comment that mentions Inkscape is not metadata (amended 2026-10-29, after scoring).
  const metadata = /\b(?:sodipodi|inkscape):|xmlns:sketch|data-figma|<metadata\b/.test(src);
  const groups = [...root.querySelectorAll('g')];
  const named = groups.filter(g => g.id || g.getAttribute('data-name') || g.getAttribute('inkscape:label'));
  const depth = el => { let d = 0; for (let p = el.parentElement; p && p !== root; p = p.parentElement) if (p.localName === 'g') d++; return d; };
  const els = [...root.querySelectorAll(shapes)].filter(e => !e.closest('defs, clipPath, mask, pattern, symbol, marker'));
  // Outside the artboard: an element whose box lies wholly outside the viewBox (partly outside is allowed: bleed).
  let outside = 0;
  if (hasViewBox) {
    const m = root.getScreenCTM().inverse();
    for (const e of els) {
      const r = e.getBoundingClientRect();
      if (!r.width && !r.height) continue;
      const a = new DOMPoint(r.left, r.top).matrixTransform(m), b = new DOMPoint(r.right, r.bottom).matrixTransform(m);
      if (b.x < vb.x || b.y < vb.y || a.x > vb.x + vb.width || a.y > vb.y + vb.height) outside++;
    }
  }
  return {
    parses: true, viewBox: hasViewBox, fixedSize: fixed, raster, text, editorMetadata: metadata,
    elements: els.length, groups: groups.length, namedGroups: named.length,
    maxDepth: els.reduce((d, e) => Math.max(d, depth(e)), 0), outside,
  };
};

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1600, height: 1000 } });
await page.setContent('<!doctype html><body style="margin:0"></body>');
for (const file of process.argv.slice(2)) {
  const src = readFileSync(file, 'utf8');
  const r = await page.evaluate(measure, { src, shapes: SHAPES });
  await page.evaluate(() => { document.body.innerHTML = ''; });
  r.bytes = statSync(file).size;
  r.floor = r.parses && r.viewBox && !r.fixedSize?.length && !r.raster && !r.text && !r.editorMetadata && !r.outside;
  console.log(JSON.stringify({ file, ...r }));
}
await browser.close();
