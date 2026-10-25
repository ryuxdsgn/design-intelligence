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
  assert.deepEqual(rules(scan("a.tsx", "<p>10/02/2026, 2:30 PM</p>")), ["warn RX-CD-09", "warn RX-CD-09"]);
  assert.deepEqual(scan("a.tsx", "<p>2 Okt 2026, 14.30 WIB</p>"), []);
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

test("comments are not scanned, and ryux-ignore switches a rule off", () => {
  assert.deepEqual(scan("a.tsx", "{/* Rp 99 */}\n// Rp 99\n<p>x</p>"), []);
  assert.deepEqual(scan("a.tsx", "<p>Rp 99</p> {/* ryux-ignore RX-CD-02 */}"), []);
  assert.deepEqual(scan("a.tsx", "// ryux-ignore RX-CD-02\n<p>Rp 99</p>"), []);
  assert.deepEqual(rules(scan("a.tsx", "// ryux-ignore RX-AS-03\n<p>Rp 99</p>")), ["fail RX-CD-02"]);
  assert.deepEqual(scan("a.tsx", "// ryux-ignore-file RX-CD-02\n\n\n<p>Rp 99</p>"), []);
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
