// Golden fixtures: the contract ryux-core's checks answer to.
// With RYUX_RECORD=1 the tests record what each pure check was given and what ryux-core returned, as plain
// JSON, into fixtures/checks/<check>.json; golden.test.mjs and `cargo test` replay every case. Canvas nodes are
// stored in a neutral form (no functions): an instance keeps its main component as data, and figma.mixed is
// {"$mixed": true}.
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

export const FIXTURES = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "..", "fixtures", "checks");
const recording = process.env.RYUX_RECORD === "1";
const cases = new Map();

/** ryux-core as WebAssembly, the module engine.ts loads. */
export const core = createRequire(import.meta.url)("../wasm/ryux_wasm.js");

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

/** A fake Figma canvas as the full neutral JSON the audit fixtures record: every own property, no functions, an
 *  instance's main component as data, figma.mixed as {"$mixed": true}. */
export async function neutralCanvas(figma, pageName) {
  const neutral = async (n) => {
    const out = {};
    for (const [k, v] of Object.entries(n)) {
      if (typeof v === "function" || k === "parent") continue;
      if (typeof v === "symbol") out[k] = { $mixed: true };
      else if (k === "children") out[k] = await Promise.all(v.map(neutral));
      else out[k] = plain(v);
    }
    if (typeof n.getMainComponentAsync === "function") {
      const mc = await n.getMainComponentAsync().catch(() => null);
      const parent = mc?.parent;
      out.mainComponent = mc ? { name: mc.name, parent: parent ? { type: parent.type, name: parent.name } : null } : null;
    }
    return out;
  };
  return {
    pages: await Promise.all(figma.root.children.map(async (p) => ({ name: p.name, children: await Promise.all((p.children || []).map(neutral)) }))),
    current: figma.currentPage.name,
    page: pageName || "",
    annotationCategories: plain(await figma.annotations.getAnnotationCategoriesAsync()),
  };
}

const { figmaAuditScript } = await import("../dist/figma-audit.js");
const AsyncFunction = Object.getPrototypeOf(async () => {}).constructor;
/** The shipped in-Figma script, run as use_figma runs it (top-level return, `figma` in scope), on a page. */
export const extract = (figma, pageName = "") =>
  new AsyncFunction("figma", figmaAuditScript().replace('const PAGE = "";', `const PAGE = ${JSON.stringify(pageName)};`))(figma);

/** The canvas audit as an agent runs it: the script in Figma, its JSON through ryux-core (`ryux audit`). */
export async function auditCanvas(figma, pageName) {
  const canvas = JSON.parse(JSON.stringify(await extract(figma, pageName)));
  return canvas.error ? { error: canvas.error } : JSON.parse(core.audit(JSON.stringify(canvas)));
}

/** A source as the checks read it: path, raw, and ryux-core's ext and comment-blanked text. */
export const toSource = (path, raw) => ({ path, raw, ...JSON.parse(core.source(path, raw)) });

/** The source detectors (engine.scanShared) over {path, raw} sources. With a direction, each source's drift
 *  hits and the unused tokens are recorded too, over the comment-blanked text. */
export const recordScan = (scanShared) => (sources, opts) => {
  const out = scanShared(sources.map((s) => ({ path: s.path, raw: s.raw })), opts);
  if (recording && opts.design) {
    const d = opts.design;
    const read = sources.map((s) => (s.text === undefined ? toSource(s.path, s.raw) : s));
    for (const s of read) save("drift", { text: s.text, ext: s.ext, design: d }, JSON.parse(core.drift(JSON.stringify({ text: s.text, ext: s.ext, design: d }))));
    const texts = read.map((s) => s.text);
    save("unused", { texts, design: d }, JSON.parse(core.unused(JSON.stringify({ texts, design: d }))));
  }
  save("scan", { sources: sources.map((s) => ({ path: s.path, raw: s.raw })), folder: !!opts.folder, skip: [...(opts.skip || [])].sort(), design: opts.design || null }, plain(out));
  return out;
};

export const recordDirection = (readDirection) => (md) => {
  const out = readDirection(md);
  save("direction", { md }, plain(out));
  return out;
};

export const recordAudit = (audit) => async (figma, pageName) => {
  const input = recording ? await neutralCanvas(figma, pageName) : null;
  const out = await audit(figma, pageName);
  if (input) save("audit", input, plain(out));
  return out;
};

/** The Plugin API slice the audit reads, rebuilt from a recorded canvas. */
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
