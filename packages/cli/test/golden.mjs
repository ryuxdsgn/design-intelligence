// Golden fixtures: the contract the TypeScript checks and their Rust port must both meet.
// With RYUX_RECORD=1 the tests record what each pure check was given and what it returned, as plain JSON,
// into fixtures/checks/<check>.json; golden.test.mjs replays every case. Canvas nodes are stored in a neutral
// form (no functions): an instance keeps its main component as data, and figma.mixed is {"$mixed": true}.
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

export const FIXTURES = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "..", "fixtures", "checks");
const recording = process.env.RYUX_RECORD === "1";
const cases = new Map();

function save(check, input, output) {
  if (!recording) return;
  const file = join(FIXTURES, `${check}.json`);
  if (!cases.has(check)) {
    let old = [];
    try { old = JSON.parse(readFileSync(file, "utf8")); } catch {}
    cases.set(check, new Map(old.map((c) => [JSON.stringify(c.input), c])));
  }
  const all = cases.get(check);
  all.set(JSON.stringify(input), { input, output });
  mkdirSync(FIXTURES, { recursive: true });
  writeFileSync(file, `${JSON.stringify([...all.values()], null, 1)}\n`);
}

const plain = (v) => JSON.parse(JSON.stringify(v ?? null));

const drift = await import("../dist/drift.js");

/** scanSources over {path, raw} sources; the check builds its own Source (ext, comment-blanked text).
 *  With a direction, each source's drift hits and the unused tokens are recorded too. */
export const recordScan = (scanSources) => (sources, opts) => {
  const out = scanSources(sources, opts);
  if (opts.design) {
    const d = opts.design;
    for (const s of sources) save("drift", { text: s.text, ext: s.ext, design: d }, plain({ colours: drift.driftColours(s.text, s.ext, d), fonts: drift.driftFonts(s.text, d), radius: drift.driftRadius(s.text, d), durations: drift.driftDurations(s.text, d) }));
    save("unused", { texts: sources.map((s) => s.text), design: d }, plain(drift.unusedTokens(sources.map((s) => s.text), d)));
  }
  save("scan", { sources: sources.map((s) => ({ path: s.path, raw: s.raw })), folder: !!opts.folder, skip: [...(opts.skip || [])].sort(), design: opts.design || null }, plain(out));
  return out;
};

export const recordDirection = (readDirection) => (md) => {
  const out = readDirection(md);
  save("direction", { md }, plain(out));
  return out;
};

async function neutral(n) {
  const out = {};
  for (const [k, v] of Object.entries(n)) {
    if (typeof v === "function" || k === "parent") continue;
    if (typeof v === "symbol") out[k] = { $mixed: true };
    else if (k === "children") out[k] = await Promise.all(v.map(neutral));
    else out[k] = plain(v);
  }
  if (typeof n.getMainComponentAsync === "function") {
    const mc = await n.getMainComponentAsync().catch(() => null);
    out.mainComponent = mc ? { name: mc.name, parent: mc.parent ? { type: mc.parent.type, name: mc.parent.name } : null } : null;
  }
  return out;
}

/** figmaAudit over a canvas; recorded as { pages, page, annotationCategories }. */
export const neutralCanvas = async (figma, pageName) => ({
  pages: await Promise.all(figma.root.children.map(async (p) => ({ name: p.name, children: await Promise.all((p.children || []).map(neutral)) }))),
  current: figma.currentPage.name,
  page: pageName || "",
  annotationCategories: plain(await figma.annotations.getAnnotationCategoriesAsync()),
});

export const recordAudit = (figmaAudit) => async (figma, pageName) => {
  const input = recording ? await neutralCanvas(figma, pageName) : null;
  const out = await figmaAudit(figma, pageName);
  if (input) save("audit", input, plain(out));
  return out;
};

/** The Plugin API slice figmaAudit reads, rebuilt from a recorded canvas. */
export function hydrate(input) {
  const build = (r) => {
    const n = {};
    for (const [k, v] of Object.entries(r)) n[k] = v && typeof v === "object" && v.$mixed ? Symbol("mixed") : v;
    if (r.mainComponent !== undefined) { const mc = r.mainComponent; delete n.mainComponent; n.getMainComponentAsync = async () => mc; }
    if (Array.isArray(r.children)) {
      n.children = r.children.map(build);
      n.findAll = (fn) => { const out = []; const go = (m) => { for (const c of m.children || []) { if (fn(c)) out.push(c); go(c); } }; go(n); return out; };
      n.findOne = (fn) => n.findAll(fn)[0] || null;
    }
    return n;
  };
  const pages = input.pages.map((p) => ({ name: p.name, children: p.children.map(build) }));
  const figma = {
    root: { children: pages },
    currentPage: pages.find((p) => p.name === input.current) || pages[0],
    setCurrentPageAsync: async (p) => { figma.currentPage = p; },
    annotations: { getAnnotationCategoriesAsync: async () => input.annotationCategories },
  };
  return figma;
}
