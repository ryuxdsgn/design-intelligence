// Golden fixtures: the contract ryux-core's checks answer to.
// With RYUX_RECORD=1 the tests record what each pure check was given and what ryux-core returned, as plain
// JSON, into fixtures/checks/<check>.json; golden.test.mjs and `cargo test` replay every case. The rendered checks
// (probe.json) are recorded from the test pages in Chromium (probePage), so recording needs Playwright. Canvas nodes are
// stored in a neutral form (no functions): an instance keeps its main component as data, and figma.mixed is
// {"$mixed": true}.
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

export const FIXTURES = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "..", "fixtures", "checks");
export const recording = process.env.RYUX_RECORD === "1";
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

const { neutralCanvas } = await import("../dist/canvas-json.js");
export { neutralCanvas };

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

/** Playwright's Chromium where the rendered tests find it (RYUX_PLAYWRIGHT_CWD, or the repo root and the folders
 *  above it), or null. */
export async function chromium() {
  const from = createRequire(join(process.env.RYUX_PLAYWRIGHT_CWD ?? join(FIXTURES, "..", ".."), "noop.js"));
  for (const name of ["playwright", "playwright-core", "@playwright/test"]) {
    try {
      const mod = await import(pathToFileURL(from.resolve(name)).href);
      const c = mod.chromium ?? mod.default?.chromium;
      if (c) return c;
    } catch {}
  }
  return null;
}

/** The rendered checks as `ryux scan <url>` runs them (cli/page-scan.ts): the shipped extract in the page, judged
 *  by ryux-core, the page answering what ryux-core asks. Records the extract with its answers and the judgement
 *  into probe.json. */
export async function probePage(page) {
  const { probeExtract, probeAnswer } = await import("../dist/cli/page-probe.js");
  const { probe } = await import("../dist/engine.js");
  const extract = await page.evaluate(probeExtract);
  let out = probe(extract);
  if (out.ask) {
    extract.answers = await page.evaluate(probeAnswer, out.ask);
    out = probe(extract);
  }
  save("probe", extract, plain(out));
  return { extract, out };
}
