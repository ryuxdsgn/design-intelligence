// Tests for `ryux scan`: each detector on a wrong and a right sample, ignore comments, and the CLI and
// hook around it. Run on the built dist.
import { test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { DETECTORS, scanSources, toSource } from "../dist/scan.js";
import { RULES } from "../dist/intelligence/content.js";
import { VERSION } from "../dist/product.js";

const cli = join(dirname(fileURLToPath(import.meta.url)), "..", "dist", "cli", "index.js");
const run = (cwd, args, input) => {
  const r = spawnSync("node", [cli, ...args], { cwd, input, encoding: "utf8", env: { ...process.env, NO_COLOR: "1" } });
  return { code: r.status, out: `${r.stdout}${r.stderr}` };
};
const scan = (path, raw, folder = false) => scanSources([toSource(path, raw)], { folder });
const rules = (findings) => findings.map((f) => `${f.level} ${f.rule}`);

test("every detector checks a rule that exists", () => {
  const ids = new Set(RULES.map((r) => r.id));
  for (const d of DETECTORS) assert.ok(ids.has(d.rule), d.rule);
});

test("Rupiah: wrong forms fail, Rp1.250.000 and Rp1,5 juta pass", () => {
  for (const bad of ["Rp 50.000", "Rp. 50.000", "Rp1,250,000", "Rp1.250.000,00", "Rp2500", "IDR 10000", "Rp {total}", "'Rp ' + n"]) {
    assert.deepEqual(rules(scan("a.tsx", `<p>${bad}</p>`)), ["fail RX-CD-02"], bad);
  }
  assert.deepEqual(scan("a.tsx", "<p>Rp1.250.000. Rp500, Rp1,5 juta, Rp{total}</p>"), []);
  assert.deepEqual(rules(scan("a.ts", 'format(n, { style: "currency", currency: "IDR" })')), ["warn RX-FE-12"]);
});

test("copy: dates, times, filler, placeholders, and urgency", () => {
  assert.deepEqual(rules(scan("a.tsx", "<p>Dikirim untuk Anda 10/02/2026, 2:30 PM</p>")), ["warn RX-CD-09", "warn RX-CD-09"]);
  assert.deepEqual(scan("a.tsx", "<p>2 Okt 2026, 14.30 WIB</p>"), []);
  // English copy follows its own locale; tests are not copy
  assert.deepEqual(scan("a.tsx", "<p>Arrives around 6:38 PM</p>"), []);
  const folder = (files) => rules(scanSources(files.map(([p, raw]) => toSource(p, raw)), { folder: true }));
  assert.deepEqual(folder([["src/format.ts", "`${h}:${m} PM`; const eta = '6:38 PM'"], ["src/App.tsx", '<html lang="id">']]), ["warn RX-CD-09"]);
  assert.deepEqual(folder([["src/App.test.tsx", "expect('6:38 PM')"], ["tests/a.mjs", "'6:38 PM'"], ["src/App.tsx", '<html lang="id">']]), []);
  assert.deepEqual(rules(scan("a.tsx", "<p>Lorem ipsum dolor</p>")), ["fail RX-AS-03"]);
  assert.deepEqual(rules(scan("a.tsx", "<p>John Doe, 0812-XXXX</p>")), ["warn RX-AS-03", "warn RX-AS-03"]);
  assert.deepEqual(rules(scan("a.tsx", "<p>Hanya tersisa 2 kursi, buruan!</p>")), ["warn RX-AS-04", "warn RX-AS-04"]);
  assert.deepEqual(scan("a.tsx", "<p>Kuota 40 kursi per kelas</p>"), []);
});

test("accessibility in markup: zoom, tabindex, alt, clickable div, icon button, headings", () => {
  assert.deepEqual(rules(scan("a.html", '<meta name="viewport" content="width=device-width, maximum-scale=1">')), ["fail RX-A11Y-02"]);
  assert.deepEqual(scan("a.html", '<meta name="viewport" content="width=device-width, initial-scale=1">'), []);
  assert.deepEqual(rules(scan("a.tsx", "<input tabIndex={2} />")), ["fail RX-A11Y-03"]);
  assert.deepEqual(scan("a.tsx", "<input tabIndex={0} /><h2 tabIndex={-1}>x</h2>"), []);
  assert.deepEqual(rules(scan("a.tsx", '<img src="/a.png">')), ["fail RX-A11Y-04"]);
  assert.deepEqual(scan("a.tsx", '<img alt="" src={x} onLoad={() => a > b} /><img {...props} />'), []);
  assert.deepEqual(rules(scan("a.tsx", "<div onClick={go}>Buka</div>")), ["warn RX-A11Y-04"]);
  assert.deepEqual(scan("a.tsx", '<div role="button" onClick={go}>Buka</div>'), []);
  assert.deepEqual(rules(scan("a.tsx", "<button><CloseIcon /></button>")), ["warn RX-A11Y-04"]);
  assert.deepEqual(scan("a.tsx", '<button aria-label="Tutup"><CloseIcon /></button><button><Icon /> Simpan</button><button>{label}</button>'), []);
  assert.deepEqual(rules(scan("a.tsx", "<h1>A</h1><h3>B</h3>")), ["warn RX-A11Y-04"]);
  assert.deepEqual(scan("a.tsx", "<h1>A</h1><h2>B</h2><h3>C</h3><h2>D</h2>"), []);
});

test("focus outlines: flagged on controls, not on focus targets or with a replacement", () => {
  assert.deepEqual(rules(scan("a.tsx", '<button className="outline-none">Simpan</button>')), ["warn RX-A11Y-03"]);
  assert.deepEqual(scan("a.tsx", '<button className="outline-none focus-visible:ring-2">x</button><h2 tabIndex={-1} className="outline-none">x</h2><div className="outline-none">x</div>'), []);
  assert.deepEqual(rules(scan("a.css", "button:focus { outline: none }")), ["warn RX-A11Y-03"]);
  assert.deepEqual(scan("a.css", ".card { outline: none }"), []);
  assert.deepEqual(scan("a.css", "button { outline: none } button:focus-visible { outline: 2px solid }"), []);
});

test("small text, one-off colors, and reduced motion", () => {
  assert.deepEqual(rules(scan("a.css", ".x { font-size: 11px }")), ["warn RX-A11Y-02"]);
  assert.deepEqual(rules(scan("a.tsx", '<p className="text-[10px]">x</p>')), ["warn RX-A11Y-02"]);
  assert.deepEqual(scan("a.css", ".x { font-size: 12px } .y { font-size: 0.75rem }"), []);
  assert.deepEqual(rules(scan("Card.tsx", 'const s = { a: "#ff0000", b: "#00ff00", c: "#0000ff" };')), ["warn RX-DS-03"]);
  assert.deepEqual(scan("theme.ts", 'const s = { a: "#ff0000", b: "#00ff00", c: "#0000ff" };'), []);
  assert.deepEqual(scan("a.css", ":root { --a: #ff0000; --b: #00ff00; --c: #0000ff; }"), []);
  assert.deepEqual(scan("a.tsx", "<p>Pesanan #123, #456, #789</p>"), []);
  assert.deepEqual(rules(scan("a.css", ".x { animation: spin 1s }", true)), ["warn RX-A11Y-08"]);
  assert.deepEqual(scan("a.css", ".x { animation: spin 1s }"), [], "single files skip folder checks");
  assert.deepEqual(scanSources([toSource("a.css", ".x { animation: spin 1s }"), toSource("b.css", "@media (prefers-reduced-motion: reduce) {}")], { folder: true }), []);
});

test("motion: endless loops, transition properties and length, and translucency", () => {
  assert.deepEqual(rules(scan("a.css", ".hero { animation: float 3s ease-in-out infinite }")), ["warn RX-A11Y-08"]);
  assert.deepEqual(rules(scan("a.tsx", '<div className="animate-bounce" />')), ["warn RX-A11Y-08"]);
  assert.deepEqual(rules(scan("a.tsx", "animate={{ y: 4 }} transition={{ repeat: Infinity }}")), ["warn RX-A11Y-08"]);
  // a loading indicator may loop while the wait lasts
  assert.deepEqual(scan("a.css", ".spinner { animation: spin 1s linear infinite }"), []);
  assert.deepEqual(scan("a.tsx", '<div className="skeleton animate-pulse" />'), []);
  assert.deepEqual(scan("a.css", ".toast { animation: in 200ms ease-out }"), []);

  assert.deepEqual(rules(scan("a.css", ".x { transition: all 0.2s }")), ["warn RX-UI-11"]);
  assert.deepEqual(rules(scan("a.tsx", '<div className="transition-all" />')), ["warn RX-UI-11"]);
  assert.deepEqual(rules(scan("a.css", ".x { transition: height 200ms, opacity 200ms }")), ["warn RX-UI-11"]);
  assert.deepEqual(scan("a.css", ".x { transition: transform 200ms ease-out, opacity 150ms }"), []);

  assert.deepEqual(rules(scan("a.css", ".x { transition: transform 0.8s ease }")), ["warn RX-UI-11"]);
  assert.deepEqual(rules(scan("a.tsx", '<div className="transition-opacity duration-700" />')), ["warn RX-UI-11"]);
  // the second time in a part is the delay, not the duration
  assert.deepEqual(scan("a.css", ".x { transition: opacity 200ms ease 600ms }"), []);
  assert.deepEqual(scan("a.tsx", '<div className="transition-opacity duration-300" />'), []);

  const folder = (files) => rules(scanSources(files.map(([p, raw]) => toSource(p, raw)), { folder: true }));
  assert.deepEqual(folder([["a.css", ".bar { backdrop-filter: blur(20px) }"]]), ["warn RX-UI-35"]);
  assert.deepEqual(folder([["a.css", ".bar { backdrop-filter: blur(20px) }"], ["b.css", "@media (prefers-reduced-transparency: reduce) { .bar { background: #fff } }"]]), []);
  assert.deepEqual(scan("a.css", ".bar { backdrop-filter: blur(20px) }"), [], "single files skip folder checks");
});

test("comments are not scanned, and ryux-ignore switches a rule off", () => {
  assert.deepEqual(scan("a.tsx", "{/* Rp 99 */}\n// Rp 99\n<p>x</p>"), []);
  assert.deepEqual(scan("a.tsx", "<p>Rp 99</p> {/* ryux-ignore RX-CD-02 */}"), []);
  assert.deepEqual(scan("a.tsx", "// ryux-ignore RX-CD-02\n<p>Rp 99</p>"), []);
  assert.deepEqual(rules(scan("a.tsx", "// ryux-ignore RX-AS-03\n<p>Rp 99</p>")), ["fail RX-CD-02"]);
  assert.deepEqual(scan("a.tsx", "// ryux-ignore-file RX-CD-02\n\n\n<p>Rp 99</p>"), []);
});

test("RX-CD-12: generic link and button text warns; a specific label or plain text does not", () => {
  assert.deepEqual(rules(scan("a.tsx", "<a href=\"/promo\">Selengkapnya</a>")), ["warn RX-CD-12"]);
  assert.deepEqual(rules(scan("a.tsx", "<Button onClick={() => go()}> Learn more </Button>")), ["warn RX-CD-12"]);
  assert.deepEqual(rules(scan("a.html", "<button>Klik di sini</button>")), ["warn RX-CD-12"]);
  assert.deepEqual(scan("a.tsx", "<a href=\"/promo\">Lihat syarat promo</a>"), []);
  assert.deepEqual(scan("a.tsx", "<p>Selengkapnya</p>"), []);
  assert.deepEqual(scan("a.ts", "const label = \"<a>Selengkapnya</a>\";"), []);
});

test("scan CLI: exit 1 on a fail, 0 on warnings only, 2 on a missing path; --json and --list-rules", () => {
  const dir = mkdtempSync(join(tmpdir(), "ryux-scan-"));
  mkdirSync(join(dir, "src"));
  mkdirSync(join(dir, "node_modules"));
  writeFileSync(join(dir, "node_modules", "x.tsx"), "<p>Rp 1</p>");
  writeFileSync(join(dir, "src", "ok.tsx"), "<p>Hanya tersisa 2</p>");
  assert.equal(run(dir, ["scan"]).code, 0);
  writeFileSync(join(dir, "src", "bad.tsx"), "<p>Rp 50.000</p>");
  const r = run(dir, ["scan", "--json"]);
  assert.equal(r.code, 1);
  const out = JSON.parse(r.out);
  assert.equal(out.files, 2, "node_modules is skipped");
  assert.deepEqual(out.findings.map((f) => `${f.file}:${f.line} ${f.rule}`), [join("src", "bad.tsx") + ":1 RX-CD-02", join("src", "ok.tsx") + ":1 RX-AS-04"]);
  assert.equal(run(dir, ["scan", "--ignore", "RX-CD-02"]).code, 0);
  assert.equal(run(dir, ["scan", "nope"]).code, 2);
  assert.match(run(dir, ["scan", "--list-rules"]).out, /RX-CD-02 +Rupiah as Rp1\.250\.000/);
  rmSync(dir, { recursive: true, force: true });
});

test("scan --hook reports on the edited file with exit 2 and stays quiet otherwise", () => {
  const dir = mkdtempSync(join(tmpdir(), "ryux-scan-"));
  writeFileSync(join(dir, "bad.tsx"), "<p>Rp 50.000</p>");
  writeFileSync(join(dir, "ok.tsx"), "<p>Rp50.000</p>");
  const hook = (file) => run(dir, ["scan", "--hook"], JSON.stringify({ tool_name: "Edit", tool_input: { file_path: join(dir, file) } }));
  const bad = hook("bad.tsx");
  assert.equal(bad.code, 2);
  assert.match(bad.out, /RX-CD-02/);
  assert.equal(hook("ok.tsx").code, 0);
  assert.equal(hook("notes.md").code, 0);
  assert.equal(run(dir, ["scan", "--hook"], "not json").code, 0);
  rmSync(dir, { recursive: true, force: true });
});

test("install --hook adds the hook, keeps the user's settings, and remove takes only the hook out", () => {
  const dir = mkdtempSync(join(tmpdir(), "ryux-scan-"));
  writeFileSync(join(dir, "package.json"), "{}");
  mkdirSync(join(dir, ".claude"));
  const settings = join(dir, ".claude", "settings.json");
  const mine = { matcher: "Bash", hooks: [{ type: "command", command: "echo mine" }] };
  writeFileSync(settings, JSON.stringify({ permissions: { allow: ["Bash(ls)"] }, hooks: { PostToolUse: [mine] } }));
  assert.equal(run(dir, ["install", "--agent", "claude", "--hook"]).code, 0);
  let s = JSON.parse(readFileSync(settings, "utf8"));
  assert.deepEqual(s.permissions, { allow: ["Bash(ls)"] });
  assert.equal(s.hooks.PostToolUse.length, 2);
  assert.equal(s.hooks.PostToolUse[1].hooks[0].command, `npx -y @ryuxdsgn/design-intelligence@${VERSION} scan --hook`);
  run(dir, ["install", "--agent", "claude", "--hook"]);
  assert.equal(JSON.parse(readFileSync(settings, "utf8")).hooks.PostToolUse.length, 2, "installing twice adds it once");
  assert.match(run(dir, ["check"]).out, /scan hook present/);
  assert.equal(run(dir, ["remove", "--yes"]).code, 0);
  s = JSON.parse(readFileSync(settings, "utf8"));
  assert.deepEqual(s.hooks.PostToolUse, [mine]);
  writeFileSync(settings, "{ broken");
  assert.equal(run(dir, ["install", "--agent", "claude", "--hook"]).code, 1);
  assert.equal(readFileSync(settings, "utf8"), "{ broken", "an unreadable settings file is never overwritten");
  rmSync(dir, { recursive: true, force: true });
});

test("scan <url> without Playwright says how to add it and exits 1", () => {
  const dir = mkdtempSync(join(tmpdir(), "ryux-scan-"));
  const r = run(dir, ["scan", "https://example.com"]);
  assert.equal(r.code, 1);
  assert.match(r.out, /npm i -D playwright && npx playwright install chromium/);
  assert.equal(run(dir, ["scan", "https://example.com", "--widths", "10"]).code, 2);
  rmSync(dir, { recursive: true, force: true });
});

// Needs Playwright with its Chromium where the CLI runs: RYUX_PLAYWRIGHT_CWD, or the repo root.
// Skipped when neither has one, so CI without a browser still passes.
test("scan <url> measures overflow, contrast, targets, and collisions, and skips what it cannot know", (t) => {
  const dir = mkdtempSync(join(tmpdir(), "ryux-page-"));
  const page = join(dir, "page.html");
  writeFileSync(
    page,
    `<!doctype html><meta name="viewport" content="width=device-width"><style>
body{margin:0;font:16px sans-serif;background:#fff}.wide{width:600px}.grey{color:#bbb}
.hero{position:relative;height:80px}.hero img{position:absolute;inset:0;width:100%;height:100%}.hero p{position:relative;color:#fff}
.icons button{width:16px;height:16px;padding:0;margin:0;border:0}.over{position:relative}.over span{position:absolute;top:0;left:0}
.sr{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0)}</style>
<div class="wide">wide</div><p class="grey">grey text</p><p>dark text</p>
<div class="hero"><img alt="" src="data:image/gif;base64,R0lGODlhAQABAAAAACw="><p>white on a photo</p></div>
<div class="icons"><button aria-label="a"></button><button aria-label="b"></button></div>
<p>Read <a href="#">the terms</a> first.</p><div class="over"><b>Rp50.000</b><span>Big sale</span></div>
<div class="sr">hidden header</div><span>hidden header</span><button disabled style="color:#ccc">Off</button>`,
  );
  const r = run(process.env.RYUX_PLAYWRIGHT_CWD ?? join(dirname(cli), "..", "..", ".."), ["scan", `file://${page}`, "--widths", "320", "--json"]);
  if (/needs Playwright|could not start Chromium/.test(r.out)) {
    rmSync(dir, { recursive: true, force: true });
    return t.skip("no Playwright browser here");
  }
  const found = JSON.parse(r.out).findings.map((f) => `${f.level} ${f.rule} ${f.message.split(/[:(]/)[0].trim()}`);
  assert.equal(r.code, 1);
  assert.deepEqual(found.sort(), [
    'fail RX-A11Y-01 "grey text"',
    'fail RX-A11Y-02 "a"',
    'fail RX-A11Y-02 "b"',
    "fail RX-RD-01 the page scrolls sideways",
    'warn RX-QA-03 "Rp50.000" overlaps "Big sale"',
  ]);
  rmSync(dir, { recursive: true, force: true });
});

test("SVG art: no viewBox fails; fixed size, raster, text, and editor metadata warn once each", () => {
  // illustration baseline, 2026-10-29: 23 of 23 no-skill files had a fixed size, 8 had editor metadata
  assert.deepEqual(rules(scan("art/empty.svg", '<svg xmlns="http://www.w3.org/2000/svg"><path d="M0 0h4"/></svg>')), ["fail RX-UI-19"]);
  const bad = '<svg xmlns="http://www.w3.org/2000/svg" xmlns:inkscape="x" width="240" height="180" viewBox="0 0 240 180">' +
    '<g inkscape:label="a" inkscape:groupmode="layer"><image href="data:image/png;base64,AA"/><text>Kosong</text></g></svg>';
  assert.deepEqual(rules(scan("art/empty.svg", bad)), ["warn RX-UI-19", "warn RX-UI-19", "warn RX-UI-19", "warn RX-UI-19"]);
  assert.deepEqual(scan("art/empty.svg", '<?xml version="1.0"?>\n<svg xmlns="http://www.w3.org/2000/svg" width="100%" viewBox="0 0 240 180"><g id="box"><path d="M0 0h4"/></g></svg>'), []);
});

test("SVG art: stroke-width is not a fixed size, and a comment naming an editor is not metadata", () => {
  assert.deepEqual(scan("a.svg", '<svg viewBox="0 0 8 8" stroke-width="3"><!-- drawn for Inkscape users --><path d="M0 0h4"/></svg>'), []);
});

// Design drift (scan --design): the direction block in DESIGN.md against the code.
const { readDirection } = await import("../dist/drift.js");
const DESIGN = [
  "# DESIGN.md", "", "## Visual and motion language", "", "```yaml", "direction:", "  name: Test",
  "  grammar:", "    motion: balanced", "  type:", "    display: Fraunces SemiBold (H1 72/75)", "    body: Plus Jakarta Sans 400/700, 16/24",
  "    figures: tabular", "  colour:", '    roles: {dominant: "#9E3B22", ink: "#3a1a10", action: "#F4C"}', "  shape:", "    radius: [8, 16]",
  "  motion: one layer settles once (L4, 240ms)", "```", "", "## Voice and tone", "", "Warm.",
].join("\n");
const drift = (path, raw) => scanSources([toSource(path, raw)], { folder: false, design: readDirection(DESIGN) }).filter((f) => f.rule === "RX-DS-03");

test("drift: reads colours, families, radius, and durations from the direction block", () => {
  const d = readDirection(DESIGN);
  assert.deepEqual(d.colours, ["#9e3b22", "#3a1a10", "#ff44cc"]);
  assert.deepEqual(d.fonts, ["Fraunces", "Plus Jakarta Sans"]);
  assert.deepEqual(d.radius, [8, 16]);
  assert.deepEqual(d.durations, [240]); // from the top-level motion line, not grammar.motion
  assert.deepEqual(d.unread, []);
  assert.equal(readDirection("# DESIGN.md\n\n## Visual and motion language\n\nCalm and warm."), null);
});

test("drift: flags values the direction does not have, and nothing else", () => {
  assert.equal(drift("a.css", ".a { color: #9e3b22; background: #fff; border-radius: 8px; transition: opacity 240ms ease; font-family: 'Fraunces', serif; }").length, 0);
  assert.equal(drift("a.css", "#add { color: #3A1A10 }").length, 0, "an id selector is not a colour");
  assert.equal(drift("a.tsx", '<a href="#add">x</a><div className="bg-[#9E3B22]" />').length, 0, "a link target is not a colour");
  const css = drift("b.css", ".b { color: #123456; border-radius: 12px; transition: transform 300ms, opacity 240ms 100ms; font-family: Inter, sans-serif; }");
  assert.deepEqual(css.map((f) => f.message.split(" ")[0]).sort(), ["#123456", "duration", "font", "radius"]);
  assert.ok(css.some((f) => /duration 300ms/.test(f.message)) && !css.some((f) => /100ms/.test(f.message)), "a delay is not a duration");
  assert.equal(drift("c.tsx", '<div style={{ color: "#00ff00", fontFamily: "Roboto" }} />').length, 2);
  assert.equal(scanSources([toSource("b.css", ".b { color: #123456 }")], { folder: false }).filter((f) => f.rule === "RX-DS-03").length, 0, "quiet without --design");
});

test("drift: scan --design reports what it read and what it could not check", () => {
  const dir = mkdtempSync(join(tmpdir(), "ryux-drift-"));
  try {
    writeFileSync(join(dir, "DESIGN.md"), DESIGN);
    writeFileSync(join(dir, "a.css"), ".a { color: #9e3b22; font-family: Fraunces; }");
    const text = run(dir, ["scan", "--design"]);
    assert.equal(text.code, 0);
    assert.match(text.out, /Design drift against DESIGN\.md: 3 colours, 2 type families, radius 8\/16, durations 240ms\./);
    assert.match(text.out, /used by no scanned file: #3a1a10, #ff44cc, Plus Jakarta Sans/);
    const json = JSON.parse(run(dir, ["scan", "--design", "--json"]).out);
    assert.deepEqual(json.design.notRead, []);
    writeFileSync(join(dir, "DESIGN.md"), "# DESIGN.md\n\n## Visual and motion language\n\nCalm.\n");
    const none = run(dir, ["scan", "--design"]);
    assert.equal(none.code, 2);
    assert.match(none.out, /has no direction: block/);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});
