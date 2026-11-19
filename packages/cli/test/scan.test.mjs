// Tests for `ryux scan`: each detector on a wrong and a right sample, ignore comments, and the CLI and
// hook around it. Run on the built dist.
import { test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { SOURCE_CHECKS, SYNTAX_CHECKS } from "../dist/checks.js";
import { readDirection as directionIn, scan as scanEngine, scanShared } from "../dist/engine.js";
import { FIXTURES, chromium, probePage, recordDirection, recordScan, recording, toSource } from "./golden.mjs";
import { BASICS, PAGES, QUIET, SLOP, bar } from "./pages.mjs";
import { RULES } from "../dist/intelligence/content.js";
import { VERSION } from "../dist/product.js";

const cli = join(dirname(fileURLToPath(import.meta.url)), "..", "dist", "cli", "index.js");
const run = (cwd, args, input) => {
  const r = spawnSync("node", [cli, ...args], { cwd, input, encoding: "utf8", env: { ...process.env, NO_COLOR: "1" } });
  return { code: r.status, out: `${r.stdout}${r.stderr}` };
};
const scanSources = recordScan(scanShared);
const scan = (path, raw, folder = false) => scanSources([toSource(path, raw)], { folder });
const rules = (findings) => findings.map((f) => `${f.level} ${f.rule}`);

test("every detector checks a rule that exists", () => {
  const ids = new Set(RULES.map((r) => r.id));
  for (const d of [...SOURCE_CHECKS, ...SYNTAX_CHECKS]) assert.ok(ids.has(d.rule), d.rule);
});

test("syntax checks: a drag with no keyboard way in JSX and TSX, read by ryux-core as a syntax tree", () => {
  // Owner review 2026-11-18 of the markup detector sheet: a drag-only comparison slider was a real problem
  // the text patterns missed.
  const slider = 'export const C = () => (\n  <div className="compare" onPointerDown={(e) => drag(e)}>\n    <img src="a.png" alt="Sebelum" />\n  </div>\n);\n';
  const found = scanEngine([{ path: "Compare.tsx", raw: slider }], { folder: false });
  assert.deepEqual(found.map((f) => `${f.level} ${f.rule} ${f.line}:${f.column}`), ["warn RX-A11Y-03 2:3"]);
  assert.match(found[0].message, /<div> that starts a drag \(onPointerDown\) with no keyboard way/);
  const fine = [
    '<div role="slider" tabIndex={0} aria-valuenow={v} onPointerDown={d} onKeyDown={k} />',
    "<Slider onPointerDown={d} />",
    "<button onPointerDown={d}>Geser</button>",
    "const s = '<div onPointerDown={x}>';",
  ];
  for (const raw of fine) assert.deepEqual(scanEngine([{ path: "a.tsx", raw: `const a = ${raw};` }], { folder: false }), [], raw);
  // the same ignore comments, and the same skip
  assert.deepEqual(scanEngine([{ path: "a.jsx", raw: `// ryux-ignore RX-A11Y-03 drawing canvas, keyboard mode below\nconst a = <div onMouseDown={d} />;` }], { folder: false }), []);
  assert.deepEqual(scanEngine([{ path: "a.tsx", raw: slider }], { folder: false, skip: new Set(["RX-A11Y-03"]) }), []);
  // a .js or .html file is not read as a syntax tree
  assert.deepEqual(scanEngine([{ path: "a.html", raw: '<div onpointerdown="d()"></div>' }], { folder: false }), []);
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

test("markup detectors: a label a script fills, a scrim around a dialog, one heading skip per file", () => {
  // Owner review 2026-11-18 of the markup detector sheet: these were false alarms or repeats.
  const runtime = [
    '<button id="pay"><svg aria-hidden="true"></svg> <span id="payLabel"></span></button>',
    '<button><svg aria-hidden="true"></svg><span data-bind="payLabel"></span></button>',
    '<button><span class="txt" id="pay-txt"></span> <span class="spin" aria-hidden="true"></span></button>',
  ];
  for (const html of runtime) assert.deepEqual(scan("a.html", html), [], html);
  // an empty child hidden from assistive technology is no name
  assert.deepEqual(rules(scan("a.html", '<button><svg></svg><span aria-hidden="true" id="ic"></span></button>')), ["warn RX-A11Y-04"]);
  // a scrim whose first child is the dialog is skipped; a plain clickable div is not
  // (the dialog itself shows no Esc or focus trap, which RX-A11Y-03 reports)
  assert.deepEqual(rules(scan("a.tsx", '<div className="scrim" onClick={close}>\n  <div className="sheet" role="dialog" aria-modal="true">x</div></div>')), ["warn RX-A11Y-03"]);
  assert.deepEqual(rules(scan("a.tsx", '<div onClick={go}><span>Open</span></div>')), ["warn RX-A11Y-04"]);
  // a repeated card repeats its skip: one finding, with the count
  const cards = scan("a.html", "<h2>A</h2>" + "<div><h4>x</h4></div><h2>B</h2>".repeat(3));
  assert.equal(cards.length, 1);
  assert.match(cards[0].message, /h2 then h4: .* \(3 times in this file/);
  assert.deepEqual(scan("a.html", "<h2>A</h2><h4>x</h4><h1>C</h1><h3>y</h3>").map((f) => f.message.split(":")[0]), ["h2 then h4", "h1 then h3"]);
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

test("markup checks the owner named on 2026-11-18: a button that submits by accident, a wait only shown, a dialog with no way out", () => {
  const at = (findings) => findings.map((f) => `${f.level} ${f.rule} ${f.line}:${f.column}`);
  // a typeless button in a form submits it; the form's last typeless button with no click handler is its submit
  const login = '<form>\n  <input type="password" />\n  <button onClick={toggle}>Show password</button>\n  <button>Sign in</button>\n</form>';
  const typed = scan("Login.tsx", login);
  assert.deepEqual(at(typed), ["warn RX-A11Y-04 3:3"]);
  assert.match(typed[0].message, /a <button> with no type inside a <form> submits the form when pressed: add type="button"/);
  assert.deepEqual(at(scan("a.html", '<form><button>Add item</button><input type="submit" value="Save"></form>')), ["warn RX-A11Y-04 1:7"]);
  for (const raw of [
    '<form><button type="button" onClick={t}>Show</button><button type={kind}>Go</button><button {...rest}>More</button><button>Save</button></form>',
    '<form method="dialog"><button>Close</button><button>OK</button></form>',
    "<div><button onClick={t}>Show</button></div>",
  ]) assert.deepEqual(scan("a.tsx", raw), [], raw);
  // a loading indicator with nothing announcing it: once per file, at the first one
  const pay = '<button disabled={busy}>\n  <span className="spinner" aria-hidden="true" />\n  {busy ? "Memproses…" : "Bayar"}\n</button>';
  const wait = scan("Pay.tsx", pay);
  assert.deepEqual(at(wait), ["warn RX-IX-02 2:3"]);
  assert.match(wait[0].message, /a loading indicator that only shows: .* aria-busy on the region that is loading/);
  assert.deepEqual(at(scan("a.html", '<div class="card skeleton"></div>\n<p>Memuat data…</p>')), ["warn RX-IX-02 1:1"]);
  for (const raw of [
    '<div aria-busy={busy}><Spinner /></div>',
    '<p role="status">{busy ? "Memproses…" : ""}</p>',
    'import { Spinner } from "@chakra-ui/react";\nexport const A = () => <Spinner />;',
    '<img loading="lazy" alt="" src={s} /><p>Loading times vary by region</p>',
  ]) assert.deepEqual(scan("a.tsx", raw), [], raw);
  // a dialog the file shows no keyboard way out of: once per file, at the dialog
  const sheet = '<div className="sheet" role="dialog" aria-modal="true">\n  <h2>Filter</h2>\n</div>';
  const shut = scan("Sheet.tsx", sheet);
  assert.deepEqual(at(shut), ["warn RX-A11Y-03 1:1"]);
  assert.match(shut[0].message, /a dialog with no keyboard way out in this file: close it on Esc and keep Tab inside it/);
  assert.deepEqual(at(scan("a.html", "<dialog open>Saved</dialog>")), ["warn RX-A11Y-03 1:1"]);
  for (const raw of [
    '<div role="dialog" onKeyDown={(e) => e.key === "Escape" && close()}>x</div>',
    '<dialog ref={r} onCancel={close}>x</dialog>',
    'import * as Dialog from "@radix-ui/react-dialog";\nexport const A = () => <Dialog.Content role="dialog">x</Dialog.Content>;',
    '<Sheet role="dialog">x</Sheet>',
  ]) assert.deepEqual(scan("a.tsx", raw), [], raw);
  assert.deepEqual(scan("a.html", "<dialog id=d>x</dialog><script>d.showModal()</script>"), []);
  // an HTML page whose script is in a file may do it there: not judged
  assert.deepEqual(scan("a.html", '<div role="dialog">x</div><div class="spinner"></div><script src="app.js"></script>'), []);
  // Vue, Svelte, and Astro get none of these checks
  for (const ext of ["vue", "svelte", "astro"]) assert.deepEqual(scan(`a.${ext}`, '<form><button @click="t">Show</button><button>Go</button></form><div class="spinner"></div><div role="dialog">x</div>'), [], ext);
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
  // (nothing announces this skeleton, which RX-IX-02 reports)
  assert.deepEqual(rules(scan("a.tsx", '<div className="skeleton animate-pulse" />')), ["warn RX-IX-02"]);
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
  // RX-FM-05: a textarea needs something in the folder that makes it grow
  assert.deepEqual(folder([["a.html", '<textarea id="note" rows="5"></textarea>']]), ["warn RX-FM-05"]);
  assert.deepEqual(folder([["a.html", '<textarea id="note"></textarea>'], ["b.css", "textarea { field-sizing: content }"]]), []);
  assert.deepEqual(folder([["a.tsx", "<Textarea minRows={3} />"]]), []);
  assert.deepEqual(folder([["a.html", "<textarea></textarea>"], ["b.js", "t.style.height = t.scrollHeight + 'px'"]]), []);
  assert.deepEqual(scan("a.html", "<textarea></textarea>"), [], "single files skip the textarea check");
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

test("RX-CD-12: a heading that opens with a stock phrase warns; a front-loaded heading does not", () => {
  assert.deepEqual(rules(scan("a.tsx", "<h1 className=\"t\">Selamat datang di Sejuk</h1>")), ["warn RX-CD-12"]);
  assert.deepEqual(rules(scan("a.html", "<h2>Yuk, pesan teknisi</h2>")), ["warn RX-CD-12"]);
  assert.deepEqual(scan("a.tsx", "<h1>Pesan teknisi AC</h1>"), []);
  assert.deepEqual(scan("a.tsx", "<h2>Ayam goreng</h2>"), []);
  assert.deepEqual(scan("a.tsx", "<p>Selamat datang di Sejuk</p>"), []);
});

test("RX-CD-18: filler phrases in visible text warn; plain copy and code do not", () => {
  assert.deepEqual(rules(scan("a.tsx", "<p>Fitur ini memungkinkan Anda membayar dengan QRIS.</p>")), ["warn RX-CD-18"]);
  assert.deepEqual(rules(scan("a.html", "<span>We understand that waiting is hard</span>")), ["warn RX-CD-18"]);
  assert.deepEqual(scan("a.tsx", "<p>Bayar dengan QRIS.</p>"), []);
  assert.deepEqual(scan("a.ts", "const t = \"memungkinkan Anda\";"), []);
});

test("RX-CD-19: superlatives in visible text warn; ordinary words do not", () => {
  assert.deepEqual(rules(scan("a.tsx", "<p>Teknisi AC terbaik di Jakarta</p>")), ["warn RX-CD-19"]);
  assert.deepEqual(rules(scan("a.html", "<h2>The fastest way to pay</h2>")), ["warn RX-CD-19"]);
  assert.deepEqual(rules(scan("a.tsx", "<span>#1 di Indonesia</span>")), ["warn RX-CD-19"]);
  assert.deepEqual(scan("a.tsx", "<p>Teknisi datang dalam 2 jam</p>"), []);
  assert.deepEqual(scan("a.tsx", "<p>Langkah 1 dari 3</p>"), []);
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

test("scan --hook: a warn-only file also exits 2, so Claude Code shows it to the agent; a plain scan exits 0", () => {
  const dir = mkdtempSync(join(tmpdir(), "ryux-scan-"));
  writeFileSync(join(dir, "warn.tsx"), "<p>Dikirim untuk Anda 10/02/2026, 2:30 PM</p>");
  const hook = run(dir, ["scan", "--hook"], JSON.stringify({ tool_name: "Edit", tool_input: { file_path: join(dir, "warn.tsx") } }));
  assert.equal(hook.code, 2);
  assert.match(hook.out, /0 fail, 2 warn/);
  assert.match(hook.out, /ryux-ignore comment with the reason/);
  assert.equal(run(dir, ["scan"]).code, 0, "warnings alone do not fail a plain scan or CI");
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

// Codex's apply_patch hands over patch text, not a path; Codex and Cursor read the result as JSON context.
// Payload shapes follow each agent's hook docs (2026-11-14); not yet run inside Codex or Cursor.
test("scan --hook codex|cursor reads each agent's payload and answers in its JSON", () => {
  const dir = mkdtempSync(join(tmpdir(), "ryux-scan-"));
  mkdirSync(join(dir, "src"));
  writeFileSync(join(dir, "src", "bad.tsx"), "<p>Rp 50.000</p>");
  writeFileSync(join(dir, "ok.tsx"), "<p>Rp50.000</p>");
  const patch = (file) => ["*** Begin Patch", `*** Update File: ${file}`, "@@", "-<p>x</p>", "+<p>y</p>", "*** End Patch"].join("\n");
  const codex = (file) => run(dir, ["scan", "--hook", "codex"], JSON.stringify({ cwd: dir, hook_event_name: "PostToolUse", tool_name: "apply_patch", tool_input: { command: patch(file) } }));
  const bad = codex("src/bad.tsx");
  assert.equal(bad.code, 0, "Codex keeps the edit's result; the finding goes in as context");
  assert.match(JSON.parse(bad.out).hookSpecificOutput.additionalContext, /RX-CD-02/);
  assert.equal(codex("ok.tsx").out.trim(), "");
  const cursor = (input) => run(dir, ["scan", "--hook", "cursor"], JSON.stringify({ cwd: dir, tool_name: "Write", ...input }));
  const c = cursor({ tool_input: { file_path: join(dir, "src", "bad.tsx") } });
  assert.equal(c.code, 0);
  assert.match(JSON.parse(c.out).additional_context, /RX-CD-02/);
  assert.match(JSON.parse(cursor({ file_path: join(dir, "src", "bad.tsx") }).out).additional_context, /RX-CD-02/, "afterFileEdit shape");
  assert.equal(cursor({ tool_input: { file_path: join(dir, "ok.tsx") } }).out.trim(), "");
  rmSync(dir, { recursive: true, force: true });
});

test("install --hook writes the Codex and Cursor hook files next to their own entries, and remove takes only ours", () => {
  const dir = mkdtempSync(join(tmpdir(), "ryux-scan-"));
  writeFileSync(join(dir, "package.json"), "{}");
  mkdirSync(join(dir, ".cursor"));
  const cursorFile = join(dir, ".cursor", "hooks.json");
  const theirs = { command: ".cursor/hooks/format.sh" };
  writeFileSync(cursorFile, JSON.stringify({ version: 1, hooks: { afterFileEdit: [theirs] } }));
  assert.equal(run(dir, ["install", "--agent", "codex,cursor", "--hook"]).code, 0);
  const codex = JSON.parse(readFileSync(join(dir, ".codex", "hooks.json"), "utf8"));
  assert.deepEqual(codex.hooks.PostToolUse, [{ matcher: "apply_patch", hooks: [{ type: "command", command: `npx -y @ryuxdsgn/design-intelligence@${VERSION} scan --hook codex` }] }]);
  const cursor = JSON.parse(readFileSync(cursorFile, "utf8"));
  assert.equal(cursor.version, 1);
  assert.deepEqual(cursor.hooks.afterFileEdit, [theirs]);
  assert.deepEqual(cursor.hooks.postToolUse, [{ matcher: "Write|Edit", command: `npx -y @ryuxdsgn/design-intelligence@${VERSION} scan --hook cursor` }]);
  run(dir, ["install", "--agent", "codex,cursor", "--hook"]);
  assert.equal(JSON.parse(readFileSync(cursorFile, "utf8")).hooks.postToolUse.length, 1, "installing twice adds it once");
  const check = run(dir, ["check"]).out;
  assert.match(check, /\.codex\/hooks\.json.*scan hook present/);
  assert.match(check, /\.cursor\/hooks\.json.*scan hook present/);
  assert.equal(run(dir, ["remove", "--yes"]).code, 0);
  assert.deepEqual(JSON.parse(readFileSync(cursorFile, "utf8")), { version: 1, hooks: { afterFileEdit: [theirs] } });
  assert.equal(JSON.parse(readFileSync(join(dir, ".codex", "hooks.json"), "utf8")).hooks, undefined);
  rmSync(dir, { recursive: true, force: true });
});

// OpenCode's hook is a plugin file RYUX owns; run end to end in OpenCode 2.2.7 on 2026-11-14 (the agent fixed Rp 50.000).
test("install --hook writes the OpenCode plugin, scan --hook opencode prints plain text, and remove deletes only ours", async () => {
  const dir = mkdtempSync(join(tmpdir(), "ryux-scan-"));
  writeFileSync(join(dir, "package.json"), "{}");
  writeFileSync(join(dir, "bad.tsx"), "<p>Rp 50.000</p>");
  const r = run(dir, ["scan", "--hook", "opencode"], JSON.stringify({ cwd: dir, file_path: "bad.tsx" }));
  assert.equal(r.code, 0);
  assert.match(r.out, /^RYUX scan found 1 issue/);
  assert.match(r.out, /RX-CD-02/);
  assert.equal(run(dir, ["install", "--agent", "opencode", "--hook"]).code, 0);
  const plugin = join(dir, ".opencode", "plugins", "ryux-scan.js");
  const src = readFileSync(plugin, "utf8");
  assert.match(src, new RegExp(`const COMMAND = "npx -y @ryuxdsgn/design-intelligence@${VERSION.replace(/\./g, "\\.")} scan --hook opencode";`));
  const mod = await import(`file://${plugin}`);
  assert.equal(mod.default.id, "ryux-scan");
  assert.equal(typeof mod.default.setup, "function");
  assert.equal(typeof mod.default.server, "function");
  assert.match(run(dir, ["check"]).out, /\.opencode\/plugins\/ryux-scan\.js.*scan hook present/);
  assert.match(run(dir, ["install", "--agent", "opencode", "--hook"]).out, /already present/);
  assert.equal(run(dir, ["remove", "--yes"]).code, 0);
  assert.equal(existsSync(plugin), false);
  mkdirSync(join(dir, ".opencode", "plugins"), { recursive: true });
  writeFileSync(plugin, "export default {}");
  assert.equal(run(dir, ["install", "--agent", "opencode", "--hook"]).code, 1, "a file of the same name that is not ours is never overwritten");
  assert.equal(readFileSync(plugin, "utf8"), "export default {}");
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
// Skipped when neither has one; with RYUX_REQUIRE_BROWSER=1 (as in CI) a missing browser fails instead.
const noBrowser = (t) => {
  assert.ok(process.env.RYUX_REQUIRE_BROWSER !== "1", "RYUX_REQUIRE_BROWSER=1, but no Playwright browser was found (RYUX_PLAYWRIGHT_CWD)");
  return t.skip("no Playwright browser here");
};
test("scan <url> measures overflow, contrast, targets, and collisions, and skips what it cannot know", (t) => {
  const dir = mkdtempSync(join(tmpdir(), "ryux-page-"));
  const page = join(dir, "page.html");
  writeFileSync(page, BASICS);
  const r = run(process.env.RYUX_PLAYWRIGHT_CWD ?? join(dirname(cli), "..", "..", ".."), ["scan", `file://${page}`, "--widths", "320", "--json"]);
  if (/needs Playwright|could not start Chromium/.test(r.out)) {
    rmSync(dir, { recursive: true, force: true });
    return noBrowser(t);
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

// Refine bench R2/R2b, 2026-11-13: a sticky total bar sliced the card's own Total row twice, and a
// written before/after check did not see it. Same Playwright requirement as above.
test("scan <url> fails text a bar cuts on the first screen or still covers at the end, not padded content", (t) => {
  const dir = mkdtempSync(join(tmpdir(), "ryux-bar-"));
  const page = (pad) => {
    const path = join(dir, `bar-${pad}.html`);
    writeFileSync(path, bar(pad));
    const r = run(process.env.RYUX_PLAYWRIGHT_CWD ?? join(dirname(cli), "..", "..", ".."), ["scan", `file://${path}`, "--widths", "390", "--json"]);
    return r;
  };
  const cut = page(0);
  if (/needs Playwright|could not start Chromium/.test(cut.out)) {
    rmSync(dir, { recursive: true, force: true });
    return noBrowser(t);
  }
  const bars = (r) => JSON.parse(r.out).findings.filter((f) => f.rule === "RX-QA-03" && f.level === "fail").map((f) => f.message.split(" bar ")[1].split(/[,:]/)[0]);
  assert.deepEqual(bars(cut).sort(), ["on the first screen", "with the page scrolled to its end"]);
  assert.deepEqual(bars(page(96)), []);
  rmSync(dir, { recursive: true, force: true });
});

// Visual tells (knowledge/anti-slop.md): warn once per page, never at a single, reasoned use.
test("scan <url> warns each visual tell once per page, and stays quiet on one reasoned use", (t) => {
  const dir = mkdtempSync(join(tmpdir(), "ryux-tells-"));
  const page = (name, html) => {
    const path = join(dir, `${name}.html`);
    writeFileSync(path, html);
    return run(process.env.RYUX_PLAYWRIGHT_CWD ?? join(dirname(cli), "..", "..", ".."), ["scan", `file://${path}`, "--widths", "390,1280", "--json"]);
  };
  const tells = (r) => JSON.parse(r.out).findings.filter((f) => f.level === "warn" && /^RX-(AS-05|UI-10|UI-26|UI-01)$/.test(f.rule)).map((f) => `${f.rule} ${f.message.split(/[:(]/)[0].trim()}`);
  const slop = page("slop", SLOP);
  if (/needs Playwright|could not start Chromium/.test(slop.out)) {
    rmSync(dir, { recursive: true, force: true });
    return noBrowser(t);
  }
  assert.deepEqual(tells(slop).sort(), [
    "RX-AS-05 3 elements glow",
    "RX-AS-05 3 layers blur what is behind them",
    "RX-AS-05 a pill above the heading",
    "RX-UI-01 cards sit inside a card",
    "RX-UI-10 3 pieces of prose are set in monospace",
    "RX-UI-10 a blue-to-purple gradient behind a large area",
    "RX-UI-10 an italic serif word inside the heading",
    "RX-UI-26 a near-black page with a neon accent",
  ]);
  const quiet = page("quiet", QUIET);
  assert.deepEqual(tells(quiet), []);
  rmSync(dir, { recursive: true, force: true });
});

// The rendered checks run in ryux-core; the page only reads (cli/page-probe.ts). Each test page is rendered in
// Chromium as `ryux scan <url>` renders it, read by the shipped extract, and judged by ryux-core; the judgement must
// be the one recorded in fixtures/checks/probe.json, which golden.test.mjs and `cargo test` replay without a browser.
// With RYUX_RECORD=1 this test writes probe.json, so recording without Playwright fails instead of dropping it. The
// boxes depend on this Chromium and its fonts: on another machine, a different extract can mean a different judgement.
test("probe parity: the shipped extract in Chromium, judged by ryux-core, gives every recorded result", async (t) => {
  const browser = await (await chromium())?.launch().catch(() => null);
  if (!browser) {
    assert.ok(!recording, "recording fixtures/checks/probe.json needs Playwright with its Chromium (RYUX_PLAYWRIGHT_CWD)");
    return noBrowser(t);
  }
  const recorded = recording ? [] : JSON.parse(readFileSync(join(FIXTURES, "probe.json"), "utf8"));
  const dir = mkdtempSync(join(tmpdir(), "ryux-probe-"));
  let k = 0;
  try {
    for (const p of PAGES) {
      const file = join(dir, `${p.name}.html`);
      writeFileSync(file, p.html);
      for (const width of p.widths) {
        const ctx = await browser.newContext({ viewport: { width, height: width <= 480 ? 844 : 900 }, reducedMotion: "reduce" });
        const page = await ctx.newPage();
        await page.goto(`file://${file}`, { waitUntil: "networkidle", timeout: 30_000 });
        await page.waitForTimeout(300);
        const { extract, out } = await probePage(page);
        await ctx.close();
        const bytes = JSON.stringify(extract).length;
        t.diagnostic(`${p.name} at ${width}px: extract ${bytes} bytes, ${out.findings.length} findings`);
        assert.ok(bytes < 16_000, `${p.name} at ${width}px: extract ${bytes} bytes`);
        if (recording) continue;
        const want = recorded[k++];
        assert.ok(want, `probe.json has no case for ${p.name} at ${width}px`);
        assert.deepEqual(out, want.output, `${p.name} at ${width}px${JSON.stringify(extract) === JSON.stringify(want.input) ? "" : " (the extract differs from the recorded one: another Chromium or other fonts?)"}`);
      }
    }
    if (!recording) assert.equal(k, recorded.length, "every recorded case has a test page");
  } finally {
    await browser.close();
    rmSync(dir, { recursive: true, force: true });
  }
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
const readDirection = recordDirection(directionIn);
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

test("drift: quoted YAML lists and trailing comments, as an agent writes them from a Figma file", () => {
  const d = readDirection([
    "## Visual and motion language", "", "```yaml", "direction:", "  type:",
    '    families: ["Nunito Sans", \'Inter\']   # heading and body', "    weights: [Regular, Bold]   # plus Italic",
    "  colour:", '    roles: {primary: "#875BF7"}   # Primary/500', "  shape:", "    radius: [8, 16]   # 2 roles",
    "  durations: []   # none in the kit", "```",
  ].join("\n"));
  assert.deepEqual(d.fonts, ["Nunito Sans", "Inter"]);
  assert.deepEqual(d.colours, ["#875bf7"]);
  assert.deepEqual(d.radius, [8, 16], "a number in a comment is not a radius");
  assert.deepEqual(d.durations, [], "an empty list is read as none, not unread");
  const map = readDirection("## Visual and motion language\n\n```yaml\ndirection:\n  type:\n    families: { heading: Nunito Sans, body: \"Inter\" }\n```");
  assert.deepEqual(map.fonts, ["Nunito Sans", "Inter"], "a map of role: family");
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

// Inputs where JavaScript and a second implementation could part ways (line ends, UTF-16, number forms,
// regex lookarounds); recorded into fixtures/checks by RYUX_RECORD=1 for the Rust port.
test("drift: edge inputs are read the same way every time", () => {
  const variants = [
    DESIGN.replace(/\n/g, "\r\n"),
    DESIGN.replace("Fraunces SemiBold", "\"Fraunces\" SemiBold").replace("[8, 16]", "[8, 12.5, 999]"),
    DESIGN.replace("  motion: one layer settles once (L4, 240ms)", "  motion:\n    enter: 180ms\n    exit: 0.2s 120ms"),
    DESIGN.replace("## Visual and motion language", "## Visual and motion language ✦").replace("Test", "Tést 😀"),
    "## Visual and motion language\n\ndirection:\n  colour: { a: #ABC, b: #12345678 } # brand\n  type:\n    families: { heading: 'Söhne Breit', body: Inter }\n  durations: [150, 240.5]\n",
    "intro\n## Visual and motion language\n```yaml\ndirection:  \n\tcolour: #fff\n```\n## Next\ndirection:\n  colour: #000\n",
  ];
  for (const md of variants) assert.ok(readDirection(md) !== undefined);
  const css = [
    ".a{border-radius:12.5 %;border-top-left-radius:6px 4px}",
    ".b{transition:opacity .3s ease 100ms, transform 1.5s;animation-duration:250ms,0.4s}\r\n.c{transition-delay:300ms}",
    ".d{color:#ABCDEF80;background:linear-gradient(#123,#fff)} #idx{color:#000}",
    ".e{font-family:\"Söhne\",serif} .f{font-family:var(--x)} .g{font-family:$body}",
  ];
  for (const c of css) drift("x.css", c);
  const tsx = [
    '<p style={{ color: "#12abef" }}>Rp😀</p><a href="#abc">x</a><i to="#def"/>',
    'const c = ["#123", "#ffffff",\'#9E3B22\', `#aaa`]; const s = { fontFamily: "Roboto, sans-serif", borderRadius: 7 };',
    '<div className="bg-[#9E3B22] text-[#123456]" data-x="(#abc)" />',
  ];
  for (const t of tsx) drift("x.tsx", t);
  assert.equal(drift("x.css", ".a{border-radius:12.5 %}").length, 0, "a percentage is not a radius, decimal or not");
  assert.equal(drift("x.css", ".a{border-radius:12.5px}")[0].message.split(" ")[1], "12.5px", "a decimal radius is read whole");
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
