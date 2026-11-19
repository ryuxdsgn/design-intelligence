// Tests for the Figma audit (ryux-core's audit; scripts/figma-audit.md in Figma): each check on a wrong and a right fake canvas, and
// the shipped script running as use_figma runs it. Run on the built dist.
import { test } from "node:test";
import assert from "node:assert/strict";
import { figmaAuditScript } from "../dist/figma-audit.js";
import { audit as auditCanvas } from "../dist/engine.js";
import { recordAudit } from "./golden.mjs";
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
const figmaAudit = recordAudit(auditCanvas);
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
  const busy = text("Status", "Confirming payment", [100, 700, 200, 20]);
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
  // Shipped as Markdown (the plugin directory refuses script files): one fenced block, the script unchanged.
  const md = renderBundle()["scripts/figma-audit.md"];
  const blocks = [...md.matchAll(/^(`{3,})js\n([\s\S]*?)\n\1$/gm)];
  assert.equal(blocks.length, 1);
  const src = blocks[0][2] + "\n";
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

test("a text link is a target: bare 16 px text fails, a 44 px wrapper holding only it passes", async () => {
  const row = (link) => node("FRAME", "Bag item", [0, 200, 390, 120], {}, [text("T", "Pengantar Ekonomi Mikro", [20, 210, 300, 20]), link]);
  const bare = await audit([screen("04", [row(text("action/remove", "Remove", [20, 290, 318, 16], { fontSize: 13 }))])]);
  assert.deepEqual(rules(bare), ["fail RX-A11Y-02"]);
  assert.equal(bare.counts.targetsUnder24, 1);
  const wrapped = node("FRAME", "remove", [20, 270, 68, 44], {}, [text("label", "Hapus", [26, 282, 56, 20])]);
  assert.deepEqual(rules(await audit([screen("04", [row(wrapped)])])), []);
  const button = node("FRAME", "Button", [20, 270, 350, 52], {}, [text("label", "Batal", [160, 286, 40, 20])]);
  assert.deepEqual(rules(await audit([screen("04", [button])])), [], "text inside a named button is measured as the button");
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

test("construction: a screen of loose layers fails, auto layout sections with pinned bars pass", async () => {
  const rows = (n) => Array.from({ length: n }, (_, i) => text(`Row ${i}`, `Book ${i}`, [16, 120 + i * 110, 200, 20]));
  const loose = screen("01", rows(6), { layoutMode: "NONE" });
  assert.deepEqual(rules(await audit([loose])), ["fail RX-DS-12"]);
  const stack = node("FRAME", "Content", [0, 100, 390, 600], { layoutMode: "VERTICAL" }, rows(6));
  const bar = node("FRAME", "Bottom bar", [0, 760, 390, 84], { fills: [white], layoutMode: "HORIZONTAL" });
  const status = node("FRAME", "Status bar", [0, 0, 390, 54]);
  const bg = node("RECTANGLE", "Background", [0, 0, 390, 844], { fills: [white] });
  const built = await audit([screen("01", [bg, status, stack, bar], { layoutMode: "NONE" })]);
  assert.deepEqual(rules(built), []);
  assert.match(built.gate, /built in auto layout 1\/1 screens, loose layers 0/);
});

test("construction: layers outside the screens warn, a parts frame does not; raw effects are counted", async () => {
  const parts = node("FRAME", "Parts", [0, 1000, 600, 300], {}, [node("COMPONENT", "Button", [0, 1000, 100, 44])]);
  const stray = node("RECTANGLE", "TEST cover", [500, 0, 120, 160]);
  const card = node("FRAME", "Card", [16, 100, 358, 120], { layoutMode: "VERTICAL", effects: [shadow], effectStyleId: "" });
  const r = await audit([screen("01", [card], { layoutMode: "VERTICAL" }), parts, stray]);
  assert.deepEqual(rules(r), ["warn RX-DS-12"]);
  assert.equal(r.counts.strayLayers, 1);
  assert.equal(r.counts.rawEffects, 1);
});

test("construction: the inside of a sheet is checked, the inside of a status bar is not", async () => {
  const items = (n, y) => Array.from({ length: n }, (_, i) => text(`Opt ${i}`, `Option ${i}`, [16, y + i * 40, 200, 20]));
  const sheet = node("FRAME", "Payment sheet", [0, 400, 390, 444], { layoutMode: "NONE", effects: [shadow] }, items(4, 420));
  const status = node("FRAME", "Status bar", [0, 0, 390, 54], { layoutMode: "NONE" }, items(4, 4));
  const r = await audit([screen("05", [status, sheet], { layoutMode: "NONE" })]);
  assert.equal(r.counts.looseLayers, 4);
});

test("tells: more than three small uppercase labels on a screen warn; three pass", async () => {
  const labels = (n) => Array.from({ length: n }, (_, i) => text(`Eyebrow ${i}`, ["ON THE SHELF", "SOLD BY", "DELIVERY", "SUMMARY"][i], [16, 100 + i * 60, 200, 14], { fontSize: 12 }));
  const four = await audit([screen("04", labels(4))]);
  assert.deepEqual(rules(four), ["warn RX-UI-01"]);
  assert.equal(four.counts.capsLabels, 4);
  assert.deepEqual(rules(await audit([screen("04", labels(3))])), []);
  const caseUpper = text("Eyebrow", "Pay with", [16, 100, 200, 14], { fontSize: 12, textCase: "UPPER" });
  assert.equal((await audit([screen("05", [caseUpper])])).counts.capsLabels, 1, "uppercase set by text case counts too");
});

test("tells: more than three bordered section cards warn; option rows and buttons are not cards", async () => {
  const card = (name, y) => node("FRAME", name, [16, y, 358, 80], { cornerRadius: 12, strokes: [pale] });
  assert.deepEqual(rules(await audit([screen("05", [card("Deliver to", 100), card("Your order", 190), card("Waiting", 280), card("Order", 370)])])), ["warn RX-UI-01"]);
  assert.deepEqual(rules(await audit([screen("05", [card("Deliver to", 100), card("Option QRIS", 190), card("Option VA", 280), card("Pay button", 370)])])), []);
});

test("tells: an empty band of 96 pt or more between blocks warns", async () => {
  const bag = (gap) => screen("04", [text("Item", "Bumi Manusia", [16, 100, 200, 20]), text("Courier", "Courier", [16, 140, 200, 20]), text("Book", "Book Rp65.000", [16, 160 + gap, 200, 20])]);
  const r = await audit([bag(150)]);
  assert.deepEqual(rules(r), ["warn RX-UI-05"]);
  assert.match(r.findings[0].message, /empty band 150 pt tall from y 160/);
  assert.deepEqual(rules(await audit([bag(40)])), []);
  assert.match(r.gate, /empty bands 1, small uppercase labels 0, section cards 0, text under 12 px 0\/3, uneven button rows 0/);
});

test("tells: text under 12 px warns with its share; the status bar's insides are not counted", async () => {
  const status = node("INSTANCE", "Status bar", [0, 0, 390, 54], {}, [text("Time", "9:41", [20, 15, 40, 20], { fontSize: 10 })]);
  const r = await audit([screen("01", [status, text("Author", "Pramoedya Ananta Toer", [16, 60, 200, 14], { fontSize: 11 }), text("Title", "Bumi Manusia", [16, 80, 200, 20])])]);
  assert.deepEqual(rules(r), ["warn RX-A11Y-02"]);
  assert.match(r.findings[0].message, /1 of 2 text layers under 12 px/);
});

test("tells: buttons in one row with labels off line or an icon in only one warn; matched buttons pass", async () => {
  const btn = (name, x, labelY, withIcon) => node("FRAME", name, [x, 600, 160, 44], { strokes: [pale] }, [...(withIcon ? [node("VECTOR", "Share", [x + 40, 612, 20, 20])] : []), text("Label", name.replace(" button", ""), [x + 64, labelY, 80, 20])]);
  const off = await audit([screen("06", [btn("Save QR button", 16, 604, false), btn("Share button", 200, 612, true)])]);
  assert.deepEqual(rules(off), ["warn RX-UI-15"]);
  assert.match(off.findings[0].message, /labels 8 px apart, an icon in some, not all/);
  assert.deepEqual(rules(await audit([screen("06", [btn("Save QR button", 16, 612, true), btn("Share button", 200, 612, true)])])), []);
});

test("figcraft: a FigCraft document is read through the same audit (boxes, styles, bindings, annotations, instances)", async () => {
  const { figcraftCanvas } = await import("../dist/figcraft-doc.js");
  const solid = (r, g, b) => ({ type: "solid", visible: true, opacity: 1, color: { r, g, b, a: 1 } });
  const T = (x, y) => [1, 0, 0, 1, x, y];
  const doc = {
    pages: [1], current_page: 1,
    annotation_categories: [{ id: "c1", name: "Sample data" }],
    nodes: {
      1: { id: 1, type: "page", name: "Rak", children: [2, 8] },
      2: { id: 2, type: "frame", name: "06-pay", parent: 1, transform: T(1000, 0), width: 390, height: 844, clip: true, fills: [solid(1, 1, 1)], bound: { fill: "VariableID:1" }, children: [3, 4, 5, 6] },
      3: { id: 3, type: "text", name: "Eyebrow", parent: 2, transform: T(16, 100), width: 80, height: 13, characters: "STEP 2 OF 2", fills: [solid(0.1, 0.1, 0.1)], style: { font_size: 11, font_family: "Inter", font_style: "Regular", case: "upper" }, styles: { text: "S:1" }, annotations: [{ category: "c1", label: "made up" }] },
      4: { id: 4, type: "rectangle", name: "QR card", parent: 2, transform: T(16, 130), width: 358, height: 300, corners: { radii: [16, 16, 16, 16] }, fills: [solid(1, 1, 1)], effects: [{ type: "dropShadow", visible: true }], styles: { effect: "S:2" } },
      5: { id: 5, type: "instance", name: "Save QR button", parent: 2, source: 8, transform: T(16, 600), width: 160, height: 44, strokes: [solid(0.8, 0.8, 0.8)], children: [9] },
      6: { id: 6, type: "frame", name: "Share button", parent: 2, transform: T(200, 600), width: 160, height: 44, layout: { mode: "horizontal", gap: 8, padding: [12, 12, 12, 12] }, children: [7, 10] },
      7: { id: 7, type: "vector", name: "Share", parent: 6, transform: T(40, 12), width: 20, height: 20 },
      10: { id: 10, type: "text", name: "Label", parent: 6, transform: T(64, 12), width: 60, height: 20, characters: "Share", fills: [solid(0.1, 0.1, 0.1)], style: { font_size: 15 } },
      8: { id: 8, type: "component", name: "Local/Button", parent: 1, transform: T(0, 2000), width: 160, height: 44, children: [] },
      9: { id: 9, type: "text", name: "Label", parent: 5, transform: T(64, 4), width: 60, height: 20, characters: "Save QR", fills: [solid(0.1, 0.1, 0.1)], style: { font_size: 15 } },
    },
  };
  const fig = figcraftCanvas(doc);
  const shot = fig.root.children[0].children[0];
  assert.deepEqual(shot.children[3].children[1].absoluteBoundingBox, { x: 1264, y: 612, width: 60, height: 20 }, "boxes compose the parents' transforms");
  const r = await figmaAudit(fig, "Rak");
  assert.equal(r.counts.screens, 1, "the component at page level is not a screen");
  assert.equal(r.counts.rawEffects, 0, "a shadow from an effect style counts as styled");
  assert.equal(r.counts.unstyledText, 1, "the Share label has no text style");
  assert.equal(r.counts.smallText, 1);
  assert.deepEqual(r.annotations, { "Sample data": 1 });
  assert.match(r.findings.find((f) => f.rule === "RX-UI-15").message, /"Save QR", "Share"\): labels 8 px apart, an icon in some, not all/);
});
