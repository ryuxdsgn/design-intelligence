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
  // a screen that holds the one main component it was drawn first in stays a screen
  const titled = screen("02", [node("COMPONENT", "Titlebar", [0, 0, 390, 40]), node("FRAME", "Isi jendela", [0, 40, 390, 804])]);
  assert.equal((await audit([screen("01", []), titled, sheet])).counts.screens, 2);
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
  assert.match(r.gate, /empty bands 1, small uppercase labels 0, section cards 0, text under 12 px 0\/3, screens with text sizes off a scale 0, uneven button rows 0/);
});

test("tells: text in sizes 1 px apart is a type scale with no steps; 12, 14, 16, 20 is a scale", async () => {
  const at = (sizes) => screen("01", sizes.map((fontSize, i) => text(`T${i}`, `Teks ukuran ${fontSize}`, [16, 60 + i * 40, 300, 24], { fontSize })));
  const r = await audit([at([13, 14, 15, 16, 24])]);
  assert.deepEqual(rules(r), ["warn RX-UI-03"]);
  assert.match(r.findings[0].message, /text in 5 sizes \(13, 14, 15, 16, 24 px\), 3 of them 1 px from the next/);
  assert.match(r.gate, /screens with text sizes off a scale 1/);
  assert.deepEqual(rules(await audit([at([12, 14, 16, 20, 28])])), []);
});

test("tells: more than six sizes, or two neighbours under 12% apart, is a scale with too many steps (RX-UI-03)", async () => {
  const at = (sizes) => screen("01", sizes.map((fontSize, i) => text(`T${i}`, `Teks ukuran ${fontSize}`, [16, 60 + i * 40, 300, 24], { fontSize })));
  // Klipin R5 Beranda (2026-11-25): eight sizes, steps of one or two pixels
  const r = await audit([at([12, 14, 16, 18, 20, 22, 26])]);
  assert.deepEqual(rules(r), ["warn RX-UI-03"]);
  assert.match(r.findings[0].message, /text in 7 sizes \(12, 14, 16, 18, 20, 22, 26 px\), 18\/20, 20\/22 read as one level \(under 12% apart\): a screen holds at most six steps/);
  assert.match(r.gate, /screens with text sizes off a scale 1/);
  const two = await audit([at([13, 15, 20, 28])]);
  assert.deepEqual(rules(two), []);
  assert.deepEqual(rules(await audit([at([12, 14, 17, 20, 24])])), [], "a drawn ramp passes");
  assert.deepEqual(rules(await audit([at([14, 15, 20, 22])])), ["warn RX-UI-03"]);
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

test("contrast: a text shows its top fill, so white over ink on white fails", async () => {
  const on = (fills) => audit([screen("01", [text("Total", "Rp1.250.000", [16, 100, 200, 20], { fills })])]);
  assert.deepEqual(rules(await on([ink, white])), ["fail RX-A11Y-01"]);
  assert.deepEqual(rules(await on([white, ink])), []);
});

test("a hidden layer's insides are not on screen: a hidden busy label or icon counts for nothing", async () => {
  const busy = text("Status", "Confirming payment", [100, 700, 200, 20]);
  const loading = node("FRAME", "Loading", [120, 780, 150, 20], { visible: false }, [text("Label", "Paying…", [120, 780, 150, 20], { fills: [white] })]);
  const button = node("INSTANCE", "Button", [20, 764, 350, 52], { fills: [ink] }, [text("Label", "Pay Rp1.250.000", [120, 780, 150, 20], { fills: [white] }), loading]);
  assert.deepEqual(rules(await audit([screen("08", [busy, button])])), ["warn RX-IX-02"]);
  const btn = (name, x, hiddenIcon) => node("FRAME", name, [x, 600, 160, 44], { strokes: [pale] }, [...(hiddenIcon ? [node("FRAME", "Icon", [x + 40, 612, 20, 20], { visible: false }, [node("VECTOR", "Share", [x + 40, 612, 20, 20])])] : []), text("Label", name.replace(" button", ""), [x + 64, 612, 80, 20])]);
  assert.deepEqual(rules(await audit([screen("06", [btn("Save QR button", 16, false), btn("Share button", 200, true)])])), []);
});

test("a screen inside a section inside a section is a screen", async () => {
  const section = (name, children) => node("SECTION", name, [0, 0, 1000, 1000], {}, children);
  const r = await audit([section("Flow", [section("Checkout", [screen("01", [text("Hint", "Pick a seat", [16, 100, 200, 20], { fills: [pale] })])])])]);
  assert.equal(r.counts.screens, 1);
  assert.deepEqual(rules(r), ["fail RX-A11Y-01"]);
});

test("targets: a fractional size is shown as it is and grouped with its own limit", async () => {
  const b = (y, h) => node("FRAME", "Button", [10, y, 80, h], { strokes: [pale], layoutMode: "HORIZONTAL" }, [text("Label", "Pilih", [20, y, 40, Math.min(h, 20)])]);
  const r = await audit([screen("01", [b(100, 23.6), b(200, 24.4), b(300, 43.7)])]);
  const msgs = r.findings.filter((f) => f.rule === "RX-A11Y-02").map((f) => `${f.level} ${f.message}`);
  assert.deepEqual(msgs, ['fail "Button" 80x23.6, under 24x24', 'warn "Button" 80x24.4, under 44x44', 'warn "Button" 80x43.7, under 44x44']);
});

test("contrast: a ratio just under the need is never written as the need", async () => {
  const g = 0.4656;
  const r = await audit([screen("01", [text("Hint", "Pilih kursi", [16, 100, 200, 20], { fills: [{ type: "SOLID", color: { r: g, g, b: g } }] })])]);
  assert.match(r.findings[0].message, /" 4\.49:1, needs 4\.5:1$/);
});

test("across screens: a band on one screen, the main button in another colour, a tab that is not there, an hour the profile does not offer", async () => {
  const green = { type: "SOLID", color: { r: 0.04, g: 0.29, b: 0.28 } };
  const rust = { type: "SOLID", color: { r: 0.73, g: 0.32, b: 0.17 } };
  const cta = (label, fill, y = 760) => node("FRAME", "Button", [16, y, 358, 52], { fills: [fill] }, [text("Label", label, [140, y + 16, 120, 20], { fills: [white] })]);
  const tabbar = node("FRAME", "Tab bar", [0, 780, 390, 64], { fills: [white] }, [text("Tab", "Cari", [40, 800, 40, 16]), text("Tab", "Akun", [300, 800, 40, 16])]);
  const card = node("FRAME", "Card", [16, 120, 358, 120], { fills: [white] }, [text("Name", "Ftr. Rina Kusuma", [32, 136, 200, 20]), text("When", "Bisa datang besok, 09.00", [32, 166, 200, 20])]);
  const slot = (h, x, y) => node("FRAME", "Slot", [x, y, 100, 44], { fills: [white] }, [text("Time", h, [x + 30, y + 12, 40, 20])]);
  const list = screen("01-cari", [card, tabbar]);
  const profile = screen("02-profil", [text("Name", "Ftr. Rina Kusuma", [16, 80, 300, 28]), slot("08.00", 16, 300), slot("09.30", 140, 300), slot("11.00", 264, 300), cta("Pesan kunjungan", green, 700)]);
  const done = screen("03-terkonfirmasi", [node("FRAME", "Hero", [0, 0, 390, 260], { fills: [green] }), cta("Kembali ke beranda", rust, 700)]);
  const r = await audit([list, profile, done]);
  const flow = r.findings.filter((f) => ["RX-DS-02", "RX-CD-12", "RX-AS-03"].includes(f.rule)).map((f) => `${f.rule} ${f.frame}: ${f.message}`);
  assert.deepEqual(flow, [
    'RX-DS-02 03-terkonfirmasi: only "03-terkonfirmasi" opens with a full-width #0a4a47 band ("Hero"); the other 2 screens start on the page colour: carry the treatment to every screen of the flow, or drop it',
    'RX-DS-02 03-terkonfirmasi: the main button changes colour between screens (02-profil "Pesan kunjungan" #0a4a47; 03-terkonfirmasi "Kembali ke beranda" #ba522b): one action colour for the main action on every screen',
    'RX-CD-12 03-terkonfirmasi: "Kembali ke beranda" leads to a place the flow does not have: the tab bar holds akun, cari; name the tab or screen it opens',
    'RX-AS-03 01-cari: "Ftr. Rina Kusuma": 01-cari promises 09.00, but 02-profil offers 08.00, 09.30, 11.00: sample data must agree across screens',
  ]);
  assert.equal(r.counts.flowBreaks, 4);
  assert.match(r.gate, /breaks across screens 4/);
  // the same flow made consistent: no finding
  const ok = await audit([
    screen("01-cari", [node("FRAME", "Card", [16, 120, 358, 120], { fills: [white] }, [text("Name", "Ftr. Rina Kusuma", [32, 136, 200, 20]), text("When", "Bisa datang besok, 09.30", [32, 166, 200, 20])]), tabbar]),
    profile,
    screen("03-terkonfirmasi", [cta("Kembali ke pencarian", green, 700)]),
  ]);
  assert.equal(ok.counts.flowBreaks, 0);
  // an address under "Ke", and a badge every card repeats, are neither a way back nor a person (Rawat r4 D3)
  const badgeCard = (y, who, when) => node("FRAME", "Card", [16, y, 358, 120], { fills: [white] }, [text("Name", who, [32, y + 16, 200, 20]), text("Badge", "STR terverifikasi KKI", [32, y + 46, 200, 20]), text("When", when, [32, y + 76, 200, 20])]);
  const quiet = await audit([
    screen("01-cari", [text("Lokasi", "Ke Jl. Dipatiukur No. 35, Coblong", [16, 60, 340, 20]), badgeCard(120, "Ftr. Rina Kusuma", "Paling cepat 09.30"), badgeCard(260, "Ftr. Dimas Putra", "Paling cepat 08.00"), tabbar]),
    screen("02-profil", [text("Name", "Ftr. Rina Kusuma", [16, 80, 300, 28]), text("Badge", "STR terverifikasi KKI", [16, 112, 300, 20]), slot("08.30", 16, 300), slot("09.30", 140, 300), slot("11.00", 264, 300), cta("Pesan kunjungan", green, 700)]),
  ]);
  assert.deepEqual(quiet.findings.filter((f) => ["RX-CD-12", "RX-AS-03"].includes(f.rule)).map((f) => f.message), []);
});

test("booking: the chosen hour away from the bar that commits, a confirmation with no way to pay, two words for a taken slot", async () => {
  const chip = (h, x, y, extra = "", sub) => node("FRAME", `Jam/${h}${extra}`, [x, y, 100, 44], { fills: [white] }, [text("Time", sub ? `${h} · ${sub}` : h, [x + 20, y + 12, 60, 20])]);
  const bar = (lines) => node("FRAME", "Bottom bar", [0, 724, 390, 120], { fills: [white] }, [...lines.map((l, i) => text("Line", l, [16, 740 + i * 22, 200, 20])), node("FRAME", "Button", [220, 744, 154, 52], { fills: [white] }, [text("Label", "Pesan kunjungan", [240, 760, 120, 20])])]);
  const slots = [chip("09.00", 16, 300), chip("10.30", 140, 300, " (dipilih)"), chip("13.00", 264, 300, "", "Terisi")];
  const profile = (lines) => screen("02-profil", [text("Name", "Ftr. Rina Kusuma", [16, 80, 300, 28]), text("Hari", "Sen 23 · Penuh", [16, 240, 200, 20]), ...slots, bar(lines)]);
  const done = (lines) => screen("03-terkonfirmasi", [text("Head", "Kunjungan terkonfirmasi", [16, 80, 300, 28]), ...lines.map((l, i) => text("Line", l, [16, 140 + i * 30, 300, 20]))]);
  const r = await audit([profile(["Rp250.000", "per sesi"]), done(["Total bayar", "Rp250.000"])]);
  const got = r.findings.filter((f) => ["RX-IX-17", "RX-IX-05", "RX-CD-05"].includes(f.rule)).map((f) => `${f.rule} ${f.frame}: ${f.message}`);
  assert.deepEqual(got, [
    'RX-IX-17 02-profil: "Bottom bar" holds the action but not the chosen hour 10.30: put the date and hour with the price and the button, so the person sees what they book as they commit',
    'RX-IX-05 03-terkonfirmasi: "03-terkonfirmasi" confirms the order but never says how it is paid: name the method with the total ("Bayar ke terapis setelah sesi"); if the business has not chosen one, show a neutral sample method with the file\'s sample-data marker',
    'RX-CD-05 02-profil: "penuh" and "terisi" name the same state: pick one word for a taken slot and use it on every screen',
  ]);
  // the hour in the bar, a method on the confirmation, and one word: quiet
  const slotsOk = [chip("09.00", 16, 300), chip("10.30", 140, 300, " (dipilih)"), chip("13.00", 264, 300, "", "Penuh")];
  const ok = await audit([
    screen("02-profil", [text("Name", "Ftr. Rina Kusuma", [16, 80, 300, 28]), text("Hari", "Sen 23 · Penuh", [16, 240, 200, 20]), ...slotsOk, bar(["Rp250.000", "Sel, 24 Nov · 10.30"])]),
    done(["Total bayar", "Rp250.000", "Bayar ke terapis setelah sesi"]),
  ]);
  assert.deepEqual(ok.findings.filter((f) => ["RX-IX-17", "RX-IX-05", "RX-CD-05"].includes(f.rule)).map((f) => f.message), []);
});

test("lists: a count the list under it does not bear out", async () => {
  const card = (y) => node("FRAME", "Kartu terapis", [20, y, 350, 166], { fills: [white] }, [text("Name", "Ftr. Dewi", [36, y + 16, 200, 20])]);
  const bar = node("FRAME", "Tab bar", [0, 761, 390, 83], { fills: [white] }, [text("Tab", "Cari", [40, 790, 40, 16])]);
  const list = (count, n) => node("FRAME", "Daftar terapis", [0, 306, 390, 506], {}, [text("Jumlah hasil", count, [20, 318, 200, 18]), ...[...Array(n)].map((_, i) => card(348 + i * 178))]);
  const r = await audit([screen("01-cari", [list("8 terapis · urut dari yang terdekat", 2), bar])]);
  assert.deepEqual(r.findings.filter((f) => f.rule === "RX-AS-03").map((f) => f.message), ['"8 terapis · urut dari yang te…" counts 8, but the list under it shows 2 and ends with room for the next: show what the count says, or count what is shown']);
  assert.equal(r.counts.listCounts, 1);
  assert.match(r.gate, /list counts that disagree 1/);
  // a list that runs under the tab bar scrolls; "3 dari 12" and "2 langkah" are not counts of the list
  for (const [count, n] of [["12 terapis", 3], ["Menampilkan 2 dari 12", 2], ["2 langkah lagi", 2], ["2 terapis", 2]]) {
    const ok = await audit([screen("01-cari", [list(count, n), bar])]);
    assert.equal(ok.counts.listCounts, 0, count);
  }
});

test("across screens: a list card that says today while the profile opens on a later day", async () => {
  const card = (when) => node("FRAME", "Kartu terapis", [16, 120, 358, 120], { fills: [white] }, [text("Name", "Ftr. Rina Kartika", [32, 136, 200, 20]), text("When", when, [32, 166, 200, 20])]);
  const chip = (d, x, picked) => node("FRAME", `Tanggal ${d}${picked ? " (dipilih)" : ""}`, [x, 300, 62, 68], { fills: [white] }, [text("Day", d, [x + 10, 320, 40, 20])]);
  const profile = (at) => screen("02-profil", [text("Name", "Ftr. Rina Kartika", [16, 80, 300, 28]), node("FRAME", "Pilihan tanggal", [16, 300, 342, 68], {}, ["Sel 24", "Rab 25", "Kam 26", "Jum 27"].map((d, i) => chip(d, 16 + i * 70, i === at)))]);
  const r = await audit([screen("01-cari", [card("Tersedia hari ini")]), profile(1)]);
  assert.deepEqual(r.findings.filter((f) => f.rule === "RX-AS-03").map((f) => f.message), ['"Ftr. Rina Kartika": 01-cari says "Tersedia hari ini", but 02-profil opens on Rab 25, date 2 of the row: open on the day the list promised, or say that day in the list']);
  // today on the first date, and tomorrow on the first or second, agree
  for (const [when, at] of [["Tersedia hari ini", 0], ["Besok, 09.00", 0], ["Besok, 09.00", 1]]) {
    const ok = await audit([screen("01-cari", [card(when)]), profile(at)]);
    assert.equal(ok.counts.flowBreaks, 0, `${when} ${at}`);
  }
});

test("across screens: a fee the confirmation shows first is a cost met after committing", async () => {
  const row = (label, amount, y) => [text("Label", label, [16, y, 200, 20]), text("Amount", amount, [290, y, 84, 20])];
  const list = screen("01-cari", [text("Price", "Rp185.000/sesi", [16, 160, 200, 20])]);
  const profile = screen("02-profil", [...row("Tarif per sesi", "Rp185.000", 300)]);
  const done = screen("03-terkonfirmasi", [...row("Biaya sesi", "Rp185.000", 300), ...row("Biaya kunjungan (1,2 km)", "Rp15.000", 330), ...row("Total bayar", "Rp200.000", 360)]);
  const r = await audit([list, profile, done]);
  const fee = r.findings.filter((f) => f.rule === "RX-UX-15").map((f) => `${f.frame}: ${f.message}`);
  assert.deepEqual(fee, ['03-terkonfirmasi: "Biaya kunjungan (1,2 km)" Rp15.000 first shows on "03-terkonfirmasi": no earlier screen shows it, so the person meets the cost after committing; show every cost with the price before the action']);
  // the fee shown with the price on the profile: no finding, and a new total is never one
  const ok = await audit([list, screen("02-profil", [...row("Tarif per sesi", "Rp185.000", 300), text("Fee", "+ transport Rp15.000", [16, 330, 200, 20])]), done]);
  assert.equal(ok.findings.filter((f) => f.rule === "RX-UX-15").length, 0);
});

test("REST: a Figma page read over the REST API is judged by the same audit, without annotations", async () => {
  const { figmaRestCanvas, parseFigmaUrl } = await import("../dist/figma-rest.js");
  assert.deepEqual(parseFigmaUrl("https://www.figma.com/design/AbCdEfGhIjKlMnOpQrStUv/Rawat?node-id=12-34&t=x"), { key: "AbCdEfGhIjKlMnOpQrStUv", node: "12:34" });
  assert.equal(parseFigmaUrl("not a link"), null);
  const bb = (x, y, width, height) => ({ absoluteBoundingBox: { x, y, width, height } });
  const grey = { type: "SOLID", color: { r: 0.8, g: 0.8, b: 0.8, a: 1 } };
  const page = {
    id: "0:1", name: "Flow", type: "CANVAS", children: [{
      id: "1:1", name: "01", type: "FRAME", ...bb(0, 0, 390, 844), fills: [{ type: "SOLID", color: { r: 1, g: 1, b: 1, a: 1 } }], layoutMode: "VERTICAL", itemSpacing: 16, boundVariables: { itemSpacing: { type: "VARIABLE_ALIAS", id: "VariableID:1" } },
      children: [
        { id: "1:2", name: "Hint", type: "TEXT", ...bb(16, 100, 200, 20), characters: "Pilih kursi", style: { fontSize: 14, fontFamily: "Inter", fontStyle: "Regular" }, fills: [grey], characterStyleOverrides: [], styleOverrideTable: {} },
        { id: "1:3", name: "Mixed", type: "TEXT", ...bb(16, 140, 200, 20), characters: "Rp185.000", style: { fontSize: 14, fontFamily: "Inter", fontStyle: "Regular" }, fills: [{ type: "SOLID", color: { r: 0, g: 0, b: 0, a: 1 } }], characterStyleOverrides: [0, 0, 1], styleOverrideTable: { 1: { fontSize: 18 } } },
        { id: "1:4", name: "Seat", type: "INSTANCE", componentId: "9:1", ...bb(16, 200, 44, 44), fills: [], children: [] },
      ],
    }],
  };
  const replies = {
    "/files/AbCdEfGhIjKlMnOpQrStUv?depth=1": { document: { children: [{ id: "0:1", name: "Flow" }, { id: "0:2", name: "Parts" }] } },
    "/files/AbCdEfGhIjKlMnOpQrStUv/nodes?ids=0%3A1": { nodes: { "0:1": { document: page, components: { "9:1": { name: "State=Free", componentSetId: "9:0" } }, componentSets: { "9:0": { name: "Local/Seat" } } } } },
  };
  const seen = [];
  const real = globalThis.fetch;
  globalThis.fetch = async (url, init) => {
    const path = String(url).replace("https://api.figma.com/v1", "");
    seen.push([path, init.headers["X-Figma-Token"]]);
    const body = replies[path];
    return { ok: !!body, status: body ? 200 : 404, headers: { get: () => null }, json: async () => body || {} };
  };
  try {
    const { figma, page: name } = await figmaRestCanvas("https://www.figma.com/design/AbCdEfGhIjKlMnOpQrStUv/Rawat", "Flow", "test-token");
    assert.equal(name, "Flow");
    assert.ok(seen.every(([, t]) => t === "test-token"));
    const frame = figma.currentPage.children[0];
    assert.equal(typeof frame.children[1].fontSize, "symbol", "a size override on some characters is mixed");
    assert.deepEqual(frame.children[2].mainComponent, { name: "State=Free", parent: { type: "COMPONENT_SET", name: "Local/Seat" } });
    const r = await auditCanvas(figma, name);
    assert.ok(r.findings.some((f) => f.rule === "RX-A11Y-01" && f.node === "Hint"), "grey text on white is measured");
    assert.equal(r.counts.unboundSpacing, 0, "spacing bound to a variable over REST counts as bound");
    assert.match(r.gate, /annotations unreadable 1/);
    await assert.rejects(figmaRestCanvas("AbCdEfGhIjKlMnOpQrStUv", "", "test-token"), /name the page with --page; pages: Flow, Parts/);
  } finally {
    globalThis.fetch = real;
  }
});

test("text behind a modal's scrim is covered on purpose, not cut; text in the dialog still is", async () => {
  const dark = { type: "SOLID", color: { r: 0, g: 0, b: 0 }, opacity: 0.5 };
  const list = (n) => node("FRAME", "Konten", [0, 0, 390, 844], {}, [text("Judul kartu", "Kartu di belakang", [16, 700, 200, 20])]);
  const footer = node("FRAME", "Footer", [0, 704, 390, 140], { fills: [white] });
  const cutAlone = await audit([screen("01", [list(), footer])]);
  assert.equal(cutAlone.counts.cutText, 1);
  const dialog = node("FRAME", "Dialog ekspor", [16, 200, 358, 400], { fills: [white] }, [
    text("Ringkasan", "Teks di dialog", [32, 560, 200, 20]),
    node("FRAME", "Footer dialog", [16, 568, 358, 32], { fills: [white] }),
  ]);
  const modal = await audit([screen("01", [list(), footer, node("RECTANGLE", "Scrim", [0, 0, 390, 844], { fills: [dark] }), dialog])]);
  assert.equal(modal.counts.cutText, 1, JSON.stringify(modal.findings.filter((f) => f.rule === "RX-QA-03")));
  assert.match(JSON.stringify(modal.findings), /Teks di dialog/);
  assert.doesNotMatch(JSON.stringify(modal.findings), /Kartu di belakang/);
});

test("an error colour on the action accent's hue is a warn; its own hue, or the accent itself, is not (RX-UI-04)", async () => {
  const fill = (hex) => ({ type: "SOLID", color: { r: parseInt(hex.slice(1, 3), 16) / 255, g: parseInt(hex.slice(3, 5), 16) / 255, b: parseInt(hex.slice(5, 7), 16) / 255 } });
  const button = (y, hex) => node("FRAME", "Tombol utama", [16, y, 200, 44], { fills: [fill(hex)] }, [text("Label", "Lanjut", [32, y + 12, 100, 20], { fills: [white] })]);
  const flow = (accent, error) => [
    screen("01", [button(700, accent)]),
    screen("02", [button(700, accent), text("Status", "Gagal diunggah", [16, 100, 200, 20], { fills: [fill(error)] })]),
  ];
  const hits = async (accent, error) => (await audit(flow(accent, error))).findings.filter((f) => f.rule === "RX-UI-04");
  const same = await hits("#c2410c", "#b42318");
  assert.equal(same.length, 1);
  assert.match(same[0].message, /the error colour #b42318 is the hue of the action accent #c2410c/);
  assert.equal((await hits("#1d4ed8", "#b42318")).length, 0, "a blue accent beside a red error");
  assert.equal((await hits("#c2410c", "#c2410c")).length, 0, "the accent itself on a failure is not two colours");
});
