// Tests for the Figma audit (scripts/figma-audit.js): each check on a wrong and a right fake canvas, and
// the shipped script running as use_figma runs it. Run on the built dist.
import { test } from "node:test";
import assert from "node:assert/strict";
import { figmaAudit, figmaAuditScript } from "../dist/figma-audit.js";
import { renderBundle } from "../dist/render.js";
import { RULES } from "../dist/intelligence/content.js";

const white = { type: "SOLID", color: { r: 1, g: 1, b: 1 } };
const ink = { type: "SOLID", color: { r: 0.08, g: 0.07, b: 0.06 } };
const pale = { type: "SOLID", color: { r: 0.78, g: 0.78, b: 0.78 } };
const img = (h) => ({ type: "IMAGE", imageHash: h });
const shadow = { type: "DROP_SHADOW", visible: true };

// A node with an absolute box; children are listed bottom to top, as in the Plugin API.
function node(type, name, [x, y, width, height], props = {}, children = []) {
  const n = { type, name, x, y, width, height, absoluteBoundingBox: { x, y, width, height }, visible: true, opacity: 1, fills: [], strokes: [], effects: [], ...props };
  if (type !== "TEXT") {
    n.children = children;
    n.findAll = (fn) => { const out = []; const go = (m) => { for (const c of m.children || []) { if (fn(c)) out.push(c); go(c); } }; go(n); return out; };
    n.findOne = (fn) => n.findAll(fn)[0] || null;
  }
  return n;
}
const text = (name, chars, box, props = {}) => node("TEXT", name, box, { characters: chars, fills: [ink], fontSize: 15, fontName: { family: "Inter", style: "Regular" }, textStyleId: "S:1", ...props });
const screen = (name, children, props = {}) => node("FRAME", name, [0, 0, 390, 844], { fills: [white], clipsContent: true, ...props }, children);
function canvas(frames, annotationCats = []) {
  const page = { name: "Flow", children: frames };
  return { root: { children: [page] }, currentPage: page, setCurrentPageAsync: async () => {}, annotations: { getAnnotationCategoriesAsync: async () => annotationCats } };
}
const audit = async (frames, cats) => figmaAudit(canvas(frames, cats), "Flow");
const rules = (r) => r.findings.map((f) => `${f.level} ${f.rule}`);

test("every check names a rule that exists", () => {
  const ids = new Set(RULES.map((r) => r.id));
  const src = figmaAuditScript();
  for (const id of new Set(src.match(/RX-[A-Z0-9]+-\d{2}/g))) assert.ok(ids.has(id), id);
});

test("contrast: pale text on white fails, ink passes, text over an image is not measured", async () => {
  const r = await audit([screen("01", [text("Hint", "Pick a seat", [16, 100, 200, 20], { fills: [pale] }), text("Title", "Panggung", [16, 60, 200, 20])])]);
  assert.deepEqual(rules(r), ["fail RX-A11Y-01"]);
  const over = await audit([screen("01", [node("RECTANGLE", "Art", [0, 0, 390, 300], { fills: [img("aaa")] }), text("On art", "Senja", [16, 100, 200, 20], { fills: [white] })])]);
  assert.equal(over.counts.contrastFails, 0);
  assert.equal(over.counts.contrastUnknown, 1);
});

test("images: fills, distinct images, and reuse across screens", async () => {
  const card = (h, y) => node("RECTANGLE", "Art", [16, y, 60, 60], { fills: [img(h)] });
  const r = await audit([screen("01-list", [card("aaa", 100), card("bbb", 200)]), screen("02-event", [card("aaa", 100)]), screen("09-ticket", [card("aaa", 100)])]);
  assert.equal(r.counts.imageFills, 4);
  assert.equal(r.counts.distinctImages, 2);
  assert.equal(r.counts.reusedImages, 1);
  assert.match(r.gate, /images 2 distinct, 4 fills, 1 reused/);
});

test("a component sheet is not a screen", async () => {
  const sheet = node("FRAME", "Components", [0, 1000, 800, 400], {}, [node("COMPONENT", "Button", [0, 1000, 100, 44])]);
  const r = await audit([screen("01", []), sheet]);
  assert.equal(r.counts.screens, 1);
});

test("text cut by a bar fails; text fully under it (scroll content) and text above it pass", async () => {
  const bar = node("FRAME", "Bottom bar", [0, 760, 390, 84], { fills: [white] });
  const cut = await audit([screen("06", [text("Total", "Total Rp1.250.000", [16, 750, 200, 24]), bar])]);
  assert.deepEqual(rules(cut), ["fail RX-QA-03"]);
  const fine = await audit([screen("06", [text("Total", "Total Rp1.250.000", [16, 700, 200, 24]), text("Row", "Under", [16, 800, 200, 20]), bar])]);
  assert.deepEqual(rules(fine), []);
});

test("an overlay with no shadow or border warns; a lifted one passes", async () => {
  const dialog = (props) => node("FRAME", "Processing dialog", [55, 340, 280, 150], { fills: [white], ...props }, [text("T", "Done", [70, 360, 200, 20])]);
  assert.deepEqual(rules(await audit([screen("08", [dialog({})])])), ["warn RX-UI-15"]);
  assert.deepEqual(rules(await audit([screen("08", [dialog({ effects: [shadow] })])])), []);
});

test("a busy screen whose button keeps its idle label warns; 'Paying…' and Cancel pass", async () => {
  const button = (label) => node("INSTANCE", "Button", [20, 764, 350, 52], { fills: [ink] }, [text("Label", label, [120, 780, 150, 20], { fills: [white] })]);
  const busy = text("Status", "Confirming payment", [100, 400, 200, 20]);
  assert.deepEqual(rules(await audit([screen("08", [busy, button("Pay Rp1.250.000")])])), ["warn RX-IX-02"]);
  assert.deepEqual(rules(await audit([screen("08", [busy, button("Paying…")])])), []);
  assert.deepEqual(rules(await audit([screen("08", [busy, button("Cancel")])])), []);
  assert.deepEqual(rules(await audit([screen("07", [button("Pay Rp1.250.000")])])), [], "no busy text, no warning");
});

test("targets: under 24 fails, under 44 warns, 44 passes", async () => {
  const seat = (name, s) => node("FRAME", name, [100, 300, s, s], { fills: [ink] });
  assert.deepEqual(rules(await audit([screen("03", [seat("Seat A1", 20)])])), ["fail RX-A11Y-02"]);
  assert.deepEqual(rules(await audit([screen("03", [seat("Seat A1", 30)])])), ["warn RX-A11Y-02"]);
  assert.deepEqual(rules(await audit([screen("03", [seat("Seat A1", 44)])])), []);
});

test("tokens and annotations are counted for the gate", async () => {
  const t = text("Loose", "Hello", [16, 100, 100, 20], { textStyleId: "" });
  t.annotations = [{ label: "Sample", categoryId: "c1" }];
  const r = await audit([screen("01", [t])], [{ id: "c1", label: "Sample data" }]);
  assert.equal(r.counts.unstyledText, 1);
  assert.equal(r.counts.unboundFills, 1);
  assert.deepEqual(r.annotations, { "Sample data": 1 });
  assert.match(r.gate, /annotations Sample data 1/);
});

test("the shipped script runs as use_figma runs it, and says which page is missing", async () => {
  const src = renderBundle()["scripts/figma-audit.js"];
  assert.equal(src, figmaAuditScript());
  const AsyncFunction = Object.getPrototypeOf(async () => {}).constructor;
  const ok = await new AsyncFunction("figma", src.replace('const PAGE = "";', 'const PAGE = "Flow";'))(canvas([screen("01", [])]));
  assert.match(ok.gate, /^figma audit \(Flow\): screens 1/);
  const missing = await new AsyncFunction("figma", src.replace('const PAGE = "";', 'const PAGE = "Nope";'))(canvas([]));
  assert.match(missing.error, /no page named "Nope"/);
});

test("an unnamed dialog painted over a full-screen scrim is an overlay", async () => {
  const scrim = node("RECTANGLE", "Scrim", [0, 0, 390, 844], { fills: [ink], opacity: 0.4 });
  const box = node("FRAME", "Processing", [55, 340, 280, 150], { fills: [white] }, [text("T", "Wait", [70, 360, 200, 20])]);
  assert.deepEqual(rules(await audit([screen("08", [scrim, box])])), ["warn RX-UI-15"]);
  box.effects = [shadow];
  assert.deepEqual(rules(await audit([screen("08", [scrim, box])])), []);
});

test("a dot inside a radio is one target, and a 56 px row holding one radio passes", async () => {
  const radio = () => node("FRAME", "Radio", [20, 300, 20, 20], {}, [node("ELLIPSE", "Radio dot", [25, 305, 10, 10], { fills: [ink] })]);
  assert.deepEqual(rules(await audit([screen("05", [radio()])])), ["fail RX-A11Y-02"]);
  const row = node("FRAME", "Payment method row", [0, 282, 390, 56], {}, [radio(), text("L", "QRIS", [56, 300, 100, 20])]);
  assert.deepEqual(rules(await audit([screen("05", [row])])), []);
  const option = node("FRAME", "Option BCA", [0, 282, 350, 56], {}, [node("ELLIPSE", "Radio", [20, 300, 20, 20]), node("ELLIPSE", "Radio dot", [25, 305, 10, 10]), text("L", "BCA", [56, 300, 100, 20])]);
  assert.deepEqual(rules(await audit([screen("07", [option])])), [], "a selected radio drawn as two siblings is one target");
  const seats = node("FRAME", "Seat row", [0, 300, 390, 56], {}, [node("FRAME", "Seat A1", [10, 310, 30, 30]), node("FRAME", "Seat A2", [50, 310, 30, 30])]);
  assert.equal((await audit([screen("03", [seats])])).counts.targetsUnder44, 2, "a row of several seats does not hide them");
});

test("an instance is known by its component, so seats named A1 are measured as seats", async () => {
  const seat = (name, x) => node("INSTANCE", name, [x, 300, 30, 30], { getMainComponentAsync: async () => ({ name: "State=Available", parent: { type: "COMPONENT_SET", name: "Local/Seat" } }) });
  const map = node("FRAME", "Seat map", [0, 280, 390, 80], {}, [seat("A1", 10), seat("A2", 50)]);
  const r = await audit([screen("03", [map])]);
  assert.equal(r.counts.targetsUnder44, 2);
  assert.equal(r.findings.length, 1, "one finding for the group");
  assert.match(r.findings[0].message, /"A1" and 1 more \(Local\/Seat\) 30x30, under 44x44/);
});
