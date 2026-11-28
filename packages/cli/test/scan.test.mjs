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
import { BASICS, BEHIND, COUNTS, DARK_CANVAS, EDGES, MARKS, FADED, PAGES, QUIET, SLOP, STORE_QUIET, STORE_SLOP, bar, choice, choiceSplit } from "./pages.mjs";
import { RULES } from "../dist/intelligence/content.js";
import { VERSION } from "../dist/product.js";

const cli = join(dirname(fileURLToPath(import.meta.url)), "..", "dist", "cli", "index.js");
const run = (cwd, args, input) => {
  const r = spawnSync("node", [cli, ...args], { cwd, input, encoding: "utf8", env: { ...process.env, NO_COLOR: "1", RYUX_NO_UPDATE_CHECK: "1" } });
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
  // needs evidence: a count, a rating, or a growth claim once per file; a testimonial, a customer row, a generated face
  assert.deepEqual(rules(scan("a.tsx", "<p>Dipakai 10.000+ pengguna, ★ 4,9, naik 30%</p>")), ["warn RX-AS-01"]);
  assert.deepEqual(rules(scan("a.html", '<h2>Apa kata mereka</h2><p>Dipercaya oleh 500 klinik</p><img src="https://i.pravatar.cc/80" alt="Rina">')), ["warn RX-AS-02", "warn RX-AS-02", "warn RX-AS-01", "warn RX-AS-02"]);
  assert.deepEqual(scan("a.tsx", "<p>Gratis untuk 3 klien, Rp49.000 per bulan, diskon 40%</p>"), []);
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
  assert.deepEqual(rules(scan("a.tsx", "<input aria-label=\"Kode\" tabIndex={2} />")), ["fail RX-A11Y-03"]);
  assert.deepEqual(scan("a.tsx", "<input aria-label=\"Kode\" tabIndex={0} /><h2 tabIndex={-1}>x</h2>"), []);
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
  const login = '<form>\n  <input type="password" aria-label="Password" />\n  <button onClick={toggle}>Show password</button>\n  <button>Sign in</button>\n</form>';
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
  // a modal dialog the file shows no keyboard way out of: once per file, at the dialog
  const sheet = '<div className="sheet" role="dialog" aria-modal="true">\n  <h2>Filter</h2>\n</div>';
  const shut = scan("Sheet.tsx", sheet);
  assert.deepEqual(at(shut), ["warn RX-A11Y-03 1:1"]);
  assert.match(shut[0].message, /a modal dialog that does not close on Esc and does not keep Tab inside it: close it on Esc and keep focus inside it/);
  // Esc alone leaves Tab free to move to the page behind a modal
  const esc = scan("a.tsx", '<div role="dialog" aria-modal="true" onKeyDown={(e) => e.key === "Escape" && close()}>x</div>');
  assert.deepEqual(at(esc), ["warn RX-A11Y-03 1:1"]);
  assert.match(esc[0].message, /closes on Esc but lets Tab move to the page behind it/);
  // Tab kept inside, but no Esc
  const tab = scan("a.tsx", '<div role="dialog" aria-modal="true" onKeyDown={(e) => e.key === "Tab" && keep(e)}>x</div>');
  assert.deepEqual(at(tab), ["warn RX-A11Y-03 1:1"]);
  assert.match(tab[0].message, /keeps Tab inside but does not close on Esc: close it on Esc too/);
  // an inline confirmation (alertdialog, not modal) that nothing moves focus into; autoFocus or .focus() is enough
  const ask = scan("Keys.tsx", '<li>\n  <div role="alertdialog" aria-labelledby="c"><p id="c">Cabut key?</p><button onClick={no}>Batal</button></div>\n</li>');
  assert.deepEqual(at(ask), ["warn RX-A11Y-03 2:3"]);
  assert.match(ask[0].message, /an inline confirmation \(role="alertdialog"\) that nothing moves focus into: .* put focus on one of its buttons/);
  assert.deepEqual(at(scan("a.html", "<div role=alertdialog><p>Hapus?</p><button>Batal</button></div>")), ["warn RX-A11Y-03 1:1"]);
  for (const raw of [
    '<div role="alertdialog"><button onClick={no}>Batal</button><Button autoFocus onClick={yes}>Cabut</Button></div>',
    '<div role="alertdialog" ref={box} tabIndex={-1}>x</div>; useEffect(() => box.current?.focus(), []);',
  ]) assert.deepEqual(scan("a.tsx", raw), [], raw);
  // not modal: a panel with no aria-modal and no scrim, and a <dialog> opened with show() or open
  assert.deepEqual(scan("a.html", '<div id="chat" role="dialog" aria-label="Help"><button>Close</button></div>'), []);
  assert.deepEqual(scan("a.html", "<dialog open>Saved</dialog>"), []);
  for (const raw of [
    '<div role="dialog" aria-modal="true" onKeyDown={(e) => { if (e.key === "Escape") close(); if (e.key === "Tab") keep(e); }}>x</div>',
    'import * as Dialog from "@radix-ui/react-dialog";\nexport const A = () => <Dialog.Content role="dialog" aria-modal="true">x</Dialog.Content>;',
    '<Sheet role="dialog" aria-modal="true">x</Sheet>',
  ]) assert.deepEqual(scan("a.tsx", raw), [], raw);
  assert.deepEqual(scan("a.html", "<dialog id=d>x</dialog><script>d.showModal()</script>"), []);
  // an HTML page is judged with the scripts it loads from the project; one the scan does not have keeps it quiet
  const page = '<div class="scrim" hidden></div>\n<div role="dialog" aria-modal="true" hidden></div><div class="spinner"></div>\n<script src="app.js"></script>';
  assert.deepEqual(scan("a.html", page), []);
  const withScript = (code) => scanSources([toSource("a.html", page)], { folder: false, context: [toSource("app.js", code)] });
  assert.deepEqual(at(withScript("open();")), ["warn RX-A11Y-03 2:1", "warn RX-IX-02 2:51"]);
  assert.deepEqual(withScript("on('keydown', (e) => { if (e.key === 'Escape') close(); if (e.key === 'Tab') trap(e); }); el.setAttribute('aria-busy', 'true');"), []);
  // a loading component from another module is judged by its own markup there
  const kit = [toSource("src/components/index.ts", 'export * from "./Skeleton";'), toSource("src/components/Skeleton.tsx", 'export const Skeleton = () => <span className="skeleton" aria-hidden="true" />;\nexport const SkeletonList = () => <div aria-busy="true"><Skeleton /></div>;')];
  const home = (name) => scanSources([toSource("src/screens/Home.tsx", `import { ${name} } from "../components";\nexport const Home = () => <${name} />;`)], { folder: false, context: kit });
  assert.deepEqual(at(home("Skeleton")), ["warn RX-IX-02 2:27"]);
  assert.deepEqual(home("SkeletonList"), []);
  // Vue, Svelte, and Astro get none of these checks
  for (const ext of ["vue", "svelte", "astro"]) assert.deepEqual(scan(`a.${ext}`, '<form><button @click="t">Show</button><button>Go</button></form><div class="spinner"></div><div role="dialog">x</div>'), [], ext);
});

test("field and control checks the owner rated on 2026-11-20: a field with no label, a link to nowhere, the keyboard, an error not tied", () => {
  const at = (findings) => findings.map((f) => `${f.level} ${f.rule} ${f.line}:${f.column}`);
  // a placeholder is not a label; a wrapper component with htmlFor is
  const chat = scan("Chat.tsx", '<form>\n  <input id="msg" placeholder="Tanya soal pengiriman…" />\n  <button>Kirim</button>\n</form>');
  assert.deepEqual(at(chat), ["warn RX-FM-01 2:3"]);
  assert.match(chat[0].message, /a form field with no label tied to it \(a placeholder or text beside it is not one\)/);
  assert.deepEqual(at(scan("a.html", '<textarea id="out" readonly></textarea>')), ["warn RX-FM-01 1:1"]);
  for (const raw of [
    '<Field label="Pemilik" htmlFor="owner"><input id="owner" /></Field>',
    '<label>Email <input name="email" /></label>',
    '<input type="file" hidden /><input aria-hidden="true" tabIndex={-1} />',
  ]) assert.deepEqual(scan("a.tsx", raw), [], raw);
  // a link to "#" with no handler, or an empty handler; a directions preview is a sample
  const dead = scan("Footer.tsx", '<footer>\n  <a href="#">Syarat</a>\n</footer>');
  assert.deepEqual(at(dead), ["warn RX-IX-12 2:3"]);
  assert.match(dead[0].message, /a control that goes nowhere/);
  assert.deepEqual(at(scan("a.tsx", "<button onClick={() => {}}>Simpan</button>")), ["warn RX-IX-12 1:1"]);
  assert.deepEqual(scan("directions.html", '<a class="btn" href="#">Jadwalkan demo</a>'), []);
  // a phone number with the text keyboard
  const phone = scan("a.tsx", '<label>No. HP <input name="phone" /></label>');
  assert.deepEqual(at(phone), ["warn RX-FM-05 1:15"]);
  assert.match(phone[0].message, /use type="tel" for a phone number/);
  assert.deepEqual(scan("a.tsx", '<label>No. HP <input type="tel" name="phone" /></label>'), []);
  // aria-invalid with nothing pointing at the error
  const bad = scan("a.tsx", "<label>Email <input aria-invalid={!!error} /></label>");
  assert.deepEqual(at(bad), ["warn RX-A11Y-07 1:14"]);
  assert.deepEqual(scan("a.tsx", '<label>Email <input aria-invalid={!!error} aria-describedby="email-error" /></label>'), []);
});

test("group, link, and autofill checks the owner rated on 2026-11-20: radios with no question, a link Tab skips, autofill turned off", () => {
  const at = (findings) => findings.map((f) => `${f.level} ${f.rule} ${f.line}:${f.column}`);
  // each option has a label, but nothing names the question; one line per file, with the count
  const pay = scan("Pay.html", '<section>\n  <h2>Metode bayar</h2>\n  <label><input type="radio" name="pay"> QRIS</label>\n  <label><input type="radio" name="pay"> VA</label>\n</section>');
  assert.deepEqual(at(pay), ["warn RX-A11Y-04 3:10"]);
  assert.match(pay[0].message, /^radio buttons for one question with nothing naming the question/);
  const two = scan("a.tsx", '<><label><input type="radio" name="a" />1</label><label><input type="radio" name="a" />2</label><label><input type="radio" name="b" />1</label><label><input type="radio" name="b" />2</label></>');
  assert.match(two[0].message, /^2 groups of radio buttons, each for one question,/);
  for (const raw of [
    '<fieldset><legend>Metode bayar</legend><label><input type="radio" name="pay" /> QRIS</label><label><input type="radio" name="pay" /> VA</label></fieldset>',
    '<aside aria-label="Status demo"><form><label><input type="radio" name="st" /> Normal</label><label><input type="radio" name="st" /> Offline</label></form></aside>',
  ]) assert.deepEqual(scan("a.tsx", raw), [], raw);
  // a link with a click handler and no href
  const link = scan("Nav.tsx", "<nav>\n  <a onClick={logout}>Keluar</a>\n</nav>");
  assert.deepEqual(at(link), ["warn RX-A11Y-04 2:3"]);
  assert.match(link[0].message, /a link with a click handler and no href: Tab does not reach it/);
  // autofill off on the person's own email, not on an invite
  const own = scan("a.tsx", '<label>Email <input type="email" name="email" autoComplete="off" /></label>');
  assert.deepEqual(at(own), ["warn RX-FM-05 1:14"]);
  assert.match(own[0].message, /autocomplete="off" on a field for the person's own email/);
  assert.deepEqual(scan("a.tsx", '<form onSubmit={invite}><label>Email <input type="email" name="email" autoComplete="off" /></label></form>'), []);
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
  assert.deepEqual(folder([["a.html", '<textarea id="note" rows="5" aria-label="Note"></textarea>']]), ["warn RX-FM-05"]);
  assert.deepEqual(folder([["a.html", '<textarea id="note" aria-label="Note"></textarea>'], ["b.css", "textarea { field-sizing: content }"]]), []);
  assert.deepEqual(folder([["a.tsx", "<Textarea minRows={3} />"]]), []);
  assert.deepEqual(folder([["a.html", "<textarea aria-label=\"Note\"></textarea>"], ["b.js", "t.style.height = t.scrollHeight + 'px'"]]), []);
  assert.deepEqual(scan("a.html", "<textarea aria-label=\"Note\"></textarea>"), [], "single files skip the textarea check");
});

test("motion notes: listed apart from faults, never fail the scan, and kept out of the edit hook; hover alone is not a note", () => {
  const dir = mkdtempSync(join(tmpdir(), "ryux-motion-"));
  writeFileSync(join(dir, "Order.tsx"), 'export function Order({ open }) { return <div>{open && <ul><li>Item</li></ul>}<button className="px-4 hover:bg-zinc-50">Pesan</button></div> }\n');
  const text = run(dir, ["scan"]);
  assert.equal(text.code, 0);
  assert.match(text.out, /0 fail, 0 warn\./);
  assert.match(text.out, /Motion: 1 place could move \(1 L2\)\. Not a fault: list them for the person and ask whether to build them\./);
  const json = JSON.parse(run(dir, ["scan", "--json"]).out);
  assert.deepEqual(json.findings, []);
  assert.deepEqual(json.motion.map((n) => `${n.level} ${n.rule} ${n.message.slice(0, 9)}`), ["note RX-UI-11 motion L2"]);
  const hook = run(dir, ["scan", "--hook"], JSON.stringify({ tool_input: { file_path: join(dir, "Order.tsx") } }));
  assert.equal(hook.code, 0);
  assert.equal(hook.out, "");
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

test("RX-CD-21: a visible sentence over 20 words warns; short sentences, prices, and times do not", () => {
  const long = "Pesanan yang sudah kamu bayar akan kami proses setelah penjual mengonfirmasi stok barang yang tersedia di gudang mereka sehingga kamu perlu menunggu sebentar.";
  assert.deepEqual(rules(scan("a.tsx", `<p>${long}</p>`)), ["warn RX-CD-21"]);
  assert.deepEqual(rules(scan("a.html", "<p>Pesanan dikirim besok. Total Rp1.250.000, tiba 14.30 WIB. Lacak paketmu di halaman Pesanan.</p>")), []);
  assert.deepEqual(rules(scan("a.tsx", "<p>{items.map((item) => item.name + ' ' + item.price + ' ' + item.unit + ' ' + item.note + ' ' + item.tag + ' ' + item.city + ' ' + item.store + ' ' + item.seller + ' ' + item.status + ' ' + item.date + ' x')}</p>")), []);
  assert.deepEqual(rules(scan("a.html", "<script>const steps = ['Masukkan nomor virtual account dan nominal yang ingin kamu bayarkan lalu tekan tombol bayar untuk melanjutkan transaksi ini sekarang juga'];</script>")), []);
});

// Copy read from the parsed file, 2026-11-27: the patterns read only the text between ">" and "<", so a sentence
// with a bold phrase or a {value} in it, or a label wrapped in a <span>, was never judged, and JavaScript between a
// ">" and a "<" was. On six real folders (162 files) the parser dropped two such code findings and added none.
test("copy rules read a block's text whole: inline tags and values join it, buttons and code do not", () => {
  const long = "Dana akan kembali ke saldo Anda dalam tiga sampai lima hari kerja setelah permintaan pengembalian disetujui oleh tim kami dan bank penerbit kartu Anda.";
  const bold = long.replace("tiga sampai lima hari kerja", "<b>tiga sampai lima hari kerja</b>");
  assert.deepEqual(rules(scan("a.html", `<p>${bold}</p>`)), ["warn RX-CD-21"]);
  assert.deepEqual(rules(scan("a.tsx", `const A = ({ n }) => <p>${long.replace("tiga sampai lima", "{n}")}</p>;`)), ["warn RX-CD-21"]);
  assert.deepEqual(rules(scan("a.html", `<a href="/promo"><span>Klik di sini</span></a>`)), ["warn RX-CD-12"]);
  assert.deepEqual(rules(scan("a.tsx", `const B = () => <Link href="/promo"><span>Baca selengkapnya</span></Link>;`)), ["warn RX-CD-12"]);
  assert.deepEqual(rules(scan("a.html", `<p>Layanan <strong>terbaik</strong> untuk AC Anda.</p>`)), ["warn RX-CD-19"]);
  // buttons in a row are controls, not one sentence
  const buttons = Array.from({ length: 12 }, (_, i) => `<button type="button">Langkah ${i + 1} bayar</button>`).join("\n");
  assert.deepEqual(scan("a.html", `<div>${buttons}</div>`), []);
  // a label set in front of a sentence is not part of it
  assert.deepEqual(scan("a.tsx", `const C = () => <li><span>What went wrong</span> It asked nothing, so the fact sheet never came; it kept the example data, wallet balance and dollars.</li>;`), []);
  // spans laid out apart by CSS, with nothing between them
  assert.deepEqual(scan("a.html", `<div>${Array.from({ length: 12 }, (_, i) => `<span>${i + 1}</span><span>Progres terlihat</span>`).join("")}</div>`), []);
  // code between a ">" and a "<" is not copy
  assert.deepEqual(scan("a.tsx", `const D = () => { const [owner, setOwner] = useState(""); const x = a > b && c < d ? one(two, three, four, five, six, seven, eight, nine, ten, eleven, twelve, thirteen, fourteen, fifteen, sixteen, seventeen, eighteen, nineteen, twenty, more) : 0; return <p>Hai</p>; };`), []);
});

// Clean code, 2026-11-27: AI-written code tends to hide errors in an empty catch, reach for any, leave console.log,
// disable lint rules without a word, and copy values into state with an effect. Each check follows a public rule:
// ESLint no-empty and no-console, typescript-eslint no-explicit-any, ESLint directive descriptions, and react.dev's
// You Might Not Need an Effect.
test("code checks: empty catch, any, console.log in a component, a directive with no reason, an effect that copies state", () => {
  // the syntax checks run apart from the source detectors (scanShared); the engine's scan runs both
  const code = (path, raw) => scanEngine([{ path, raw }], { folder: false });
  assert.deepEqual(rules(code("a.ts", "try { go(); } catch {}")), ["warn RX-FE-05"]);
  assert.deepEqual(code("a.ts", "try { go(); } catch { /* the cache is optional: a miss just refetches */ }"), []);
  assert.deepEqual(code("a.ts", "try { go(); } catch (e) { report(e); }"), []);
  assert.deepEqual(rules(code("a.ts", "const a: any = 1; const b = c as any;")), ["warn RX-FE-07"]);
  assert.match(code("a.ts", "const a: any = 1; const b = c as any;")[0].message, /^2 uses of any/);
  assert.deepEqual(code("a.js", "const a = 1; // any value"), []);
  assert.deepEqual(code("a.ts", "// eslint-disable-next-line @typescript-eslint/no-explicit-any -- Figma's node JSON\ntype Raw = any;"), []);
  assert.deepEqual(rules(code("a.ts", "// eslint-disable-next-line @typescript-eslint/no-explicit-any\ntype Raw = any;")), ["warn RX-FE-07"]);
  assert.deepEqual(rules(code("a.tsx", "export const A = () => { console.log('x'); return <p>Hai</p>; };")), ["warn RX-FE-07"]);
  assert.deepEqual(code("a.ts", "console.log('done');"), []);
  assert.deepEqual(code("a.tsx", "export const A = () => { console.error('x'); return <p>Hai</p>; };"), []);
  assert.deepEqual(rules(code("a.ts", "// @ts-ignore\nfoo();")), ["warn RX-FE-07"]);
  assert.deepEqual(code("a.ts", "// @ts-expect-error the library's types miss the size prop\nfoo();"), []);
  const effect = (body) => `import { useEffect, useState } from "react";\nexport function A({ first, last }) { const [full, setFull] = useState(""); useEffect(${body}, [first, last]); return <p>{full}</p>; }`;
  assert.deepEqual(rules(code("a.jsx", effect("() => { setFull(first + ' ' + last); }"))), ["warn RX-FE-13"]);
  assert.deepEqual(rules(code("a.jsx", effect("() => setFull(first + ' ' + last)"))), ["warn RX-FE-13"]);
  assert.deepEqual(code("a.jsx", effect("() => { fetch('/n').then((r) => r.text()).then(setFull); }")), []);
  assert.deepEqual(code("a.jsx", effect("() => { const t = setTimeout(() => setFull(first), 300); return () => clearTimeout(t); }")), []);
  assert.deepEqual(code("a.jsx", effect("() => { setFull(ref.current.value); }")), []);
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

test("scan reads the scripts a page loads and the module a loading component comes from, and reports only the file asked", () => {
  const dir = mkdtempSync(join(tmpdir(), "ryux-scan-"));
  mkdirSync(join(dir, "js"));
  mkdirSync(join(dir, "src", "components"), { recursive: true });
  mkdirSync(join(dir, "src", "screens"));
  const page = '<div class="scrim" hidden></div>\n<div role="dialog" aria-modal="true" hidden></div>\n<script src="js/app.js?v=2"></script>';
  writeFileSync(join(dir, "index.html"), page);
  writeFileSync(join(dir, "js", "app.js"), "document.addEventListener('keydown', (e) => { if (e.key === 'Escape') close(); });");
  writeFileSync(join(dir, "src", "components", "index.ts"), 'export { Skeleton, SkeletonList } from "./Skeleton";');
  writeFileSync(join(dir, "src", "components", "Skeleton.tsx"), 'export function Skeleton() {\n  return <span className="skeleton" aria-hidden="true" />;\n}\nexport function SkeletonList() {\n  return <div aria-busy="true"><Skeleton /></div>;\n}');
  writeFileSync(join(dir, "src", "screens", "Home.tsx"), 'import { Skeleton } from "../components";\nexport const Home = ({ b }) => <p>{b ?? <Skeleton />}</p>;');
  writeFileSync(join(dir, "src", "screens", "History.tsx"), 'import { SkeletonList } from "../components";\nexport const History = () => <SkeletonList />;');
  const json = (args) => JSON.parse(run(dir, ["scan", ...args, "--json"]).out).findings.map((f) => `${f.rule} ${f.file}:${f.line}`);
  // the page's dialog closes on Esc in js/app.js, but nothing keeps Tab inside it
  assert.deepEqual(json(["index.html"]), ["RX-A11Y-03 index.html:2"]);
  assert.deepEqual(json([join("src", "screens", "Home.tsx")]), [`RX-IX-02 ${join("src", "screens", "Home.tsx")}:2`]);
  assert.deepEqual(json([join("src", "screens", "History.tsx")]), []);
  // the hook reads them too, from the file an agent just edited
  const hook = run(dir, ["scan", "--hook"], JSON.stringify({ tool_name: "Edit", tool_input: { file_path: join(dir, "src", "screens", "Home.tsx") } }));
  assert.equal(hook.code, 2);
  assert.match(hook.out, /RX-IX-02/);
  rmSync(join(dir, "js", "app.js"));
  assert.deepEqual(json(["index.html"]), []);
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

// Front-end bench, 2026-11-20: Tailwind 4 colours reach the page as lab() and oklch(), and the contrast check read a
// green "Bayar" button with white text as white on white in all six runs. Same Playwright requirement as above.
test("scan <url> reads lab() and oklch() colours for contrast", (t) => {
  const dir = mkdtempSync(join(tmpdir(), "ryux-lab-"));
  const path = join(dir, "lab.html");
  writeFileSync(path, `<!doctype html><html lang="id"><body style="margin:0;padding:24px;font:16px sans-serif">
<button style="background:lab(44.5 -41 11);color:#fff;border:0;padding:12px 24px">Bayar</button>
<p style="background:oklch(0.98 0.01 90);color:oklch(0.9 0.01 90);padding:8px">pale on pale</p>
<p style="color:lab(8 0.6 -2)">dark text</p></body></html>`);
  const r = run(process.env.RYUX_PLAYWRIGHT_CWD ?? join(dirname(cli), "..", "..", ".."), ["scan", `file://${path}`, "--widths", "390", "--json"]);
  if (/needs Playwright|could not start Chromium/.test(r.out)) {
    rmSync(dir, { recursive: true, force: true });
    return noBrowser(t);
  }
  const contrast = JSON.parse(r.out).findings.filter((f) => f.rule === "RX-A11Y-01").map((f) => f.message.split(":")[0]);
  assert.deepEqual(contrast, ['"pale on pale"']);
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

// Routing eval, 2026-11-26: long runs read 7 to 11 screenshots and ran scan up to 8 times, each kept in context for
// every later turn. --sheet gives every width in one image, and the report asks for one fix pass.
test("scan <url> --sheet writes every width as one PNG, and the report asks for one fix pass", (t) => {
  const dir = mkdtempSync(join(tmpdir(), "ryux-sheet-"));
  const path = join(dir, "page.html");
  writeFileSync(path, bar(0));
  const sheet = join(dir, "sheet.png");
  const cwd = process.env.RYUX_PLAYWRIGHT_CWD ?? join(dirname(cli), "..", "..", "..");
  const r = run(cwd, ["scan", `file://${path}`, "--widths", "320,1280", "--sheet", sheet, "--json"]);
  if (/needs Playwright|could not start Chromium/.test(r.out)) {
    rmSync(dir, { recursive: true, force: true });
    return noBrowser(t);
  }
  assert.equal(JSON.parse(r.out).sheet, sheet);
  const png = readFileSync(sheet);
  assert.equal(png.subarray(1, 4).toString(), "PNG");
  const width = png.readUInt32BE(16);
  assert.ok(width >= 320 + 640 && width < 1400, `sheet is ${width} px wide: 320 kept, 1280 scaled to 640`);
  const text = run(cwd, ["scan", `file://${path}`, "--widths", "390"]);
  assert.match(text.out, /Fix them all in one pass, then run this scan once more/);
  assert.match(text.out, /Add --sheet to get every width in one image/);
  rmSync(dir, { recursive: true, force: true });
});

// Front-end bench, 2026-11-20: on 5 of 6 rated checkout pages the payment methods sat below the first screen at
// 1280 px while "Bayar Rp…" stood in the sticky side column; the owner flagged all 5, and not the one with the
// methods in view. Same Playwright requirement as above.
test("scan <url> warns when the only choice sits below the first screen on desktop while the action with the total is on it", (t) => {
  const dir = mkdtempSync(join(tmpdir(), "ryux-choice-"));
  const scanAt = (low, width) => {
    const path = join(dir, `choice-${low}.html`);
    writeFileSync(path, choice(low));
    return run(process.env.RYUX_PLAYWRIGHT_CWD ?? join(dirname(cli), "..", "..", ".."), ["scan", `file://${path}`, "--widths", String(width), "--json"]);
  };
  const low = scanAt(true, 1280);
  if (/needs Playwright|could not start Chromium/.test(low.out)) {
    rmSync(dir, { recursive: true, force: true });
    return noBrowser(t);
  }
  const ux15 = (r) => JSON.parse(r.out).findings.filter((f) => f.rule === "RX-UX-15").map((f) => `${f.level} ${f.message}`);
  const found = ux15(low);
  assert.equal(found.length, 1);
  assert.match(found[0], /^warn "Metode pembayaran" \(3 options\) starts \d+px below the first screen at 1280px, while "Bayar Rp1\.424\.000" is on it/);
  assert.deepEqual(ux15(scanAt(false, 1280)), [], "the choice in view");
  assert.deepEqual(ux15(scanAt(true, 390)), [], "a phone screen scrolls to its choice");
  rmSync(dir, { recursive: true, force: true });
});

// Owner, A2 (2026-11-21): the payment card's heading on the first screen keeps the choice in view, though its first
// option starts just below it.
test("scan <url> counts a choice as in view when its heading is on the first screen, and warns when the heading is below too", (t) => {
  const dir = mkdtempSync(join(tmpdir(), "ryux-choice-split-"));
  const scanAt = (inView) => {
    const path = join(dir, `split-${inView}.html`);
    writeFileSync(path, choiceSplit(inView));
    return run(process.env.RYUX_PLAYWRIGHT_CWD ?? join(dirname(cli), "..", "..", ".."), ["scan", `file://${path}`, "--widths", "1280", "--json"]);
  };
  const low = scanAt(false);
  if (/needs Playwright|could not start Chromium/.test(low.out)) {
    rmSync(dir, { recursive: true, force: true });
    return noBrowser(t);
  }
  const ux15 = (r) => JSON.parse(r.out).findings.filter((f) => f.rule === "RX-UX-15").map((f) => `${f.level} ${f.message}`);
  const found = ux15(low);
  assert.equal(found.length, 1);
  assert.match(found[0], /^warn "Metode Pembayaran" \(3 options\) starts \d+px below the first screen at 1280px/);
  assert.deepEqual(ux15(scanAt(true)), [], "the heading is on the first screen");
  rmSync(dir, { recursive: true, force: true });
});

test("scan <url> measures contrast on the dark canvas a dark color scheme gives, and through an element's opacity", (t) => {
  const dir = mkdtempSync(join(tmpdir(), "ryux-canvas-"));
  const contrast = (html) => {
    const path = join(dir, `p${Math.random().toString(36).slice(2)}.html`);
    writeFileSync(path, html);
    return run(process.env.RYUX_PLAYWRIGHT_CWD ?? join(dirname(cli), "..", "..", ".."), ["scan", `file://${path}`, "--widths", "390", "--json"]);
  };
  const dark = contrast(DARK_CANVAS);
  if (/needs Playwright|could not start Chromium/.test(dark.out)) {
    rmSync(dir, { recursive: true, force: true });
    return noBrowser(t);
  }
  const a11y01 = (r) => JSON.parse(r.out).findings.filter((f) => f.rule === "RX-A11Y-01").map((f) => f.message);
  assert.deepEqual(a11y01(dark), [], "light text on the dark canvas");
  const faded = a11y01(contrast(FADED));
  assert.equal(faded.length, 1);
  assert.match(faded[0], /^"Segera hadir": contrast/);
  rmSync(dir, { recursive: true, force: true });
});

test("scan <url> measures text over a gradient or an image on its pixels, and names what it could not measure", (t) => {
  const dir = mkdtempSync(join(tmpdir(), "ryux-behind-"));
  const path = join(dir, "behind.html");
  writeFileSync(path, BEHIND);
  const r = run(process.env.RYUX_PLAYWRIGHT_CWD ?? join(dirname(cli), "..", "..", ".."), ["scan", `file://${path}`, "--widths", "390", "--json"]);
  rmSync(dir, { recursive: true, force: true });
  if (/needs Playwright|could not start Chromium/.test(r.out)) return noBrowser(t);
  const a11y01 = JSON.parse(r.out).findings.filter((f) => f.rule === "RX-A11Y-01").map((f) => `${f.level} ${f.message}`);
  assert.equal(a11y01.length, 4, a11y01.join("\n"));
  assert.match(a11y01[0], /^fail "Promo akhir tahun": contrast [\d.]+:1 \(#ffffff on #[0-9a-f]{6}, the weakest tenth of the gradient behind it\), needs 4\.5:1$/);
  assert.match(a11y01[1], /^fail "Foto terang di belakang": contrast [\d.]+:1 \(#ffffff on #f5f5f4, the weakest tenth of the image behind it\)/);
  assert.match(a11y01[2], /^fail "Digambar ulang": contrast [\d.]+:1 \(#ffffff on #[0-9a-f]{6}, the weakest tenth of the gradient behind it\)/, "a text the page redrew is found again");
  assert.match(a11y01[3], /^warn 1 text not measured for contrast \(under a blend mode or a filter.*first "Teks berbaur"/);
});

test("scan <url> counts emoji in the chrome and gradients that are no token, not gradients that draw a thing (RX-AS-10)", (t) => {
  const dir = mkdtempSync(join(tmpdir(), "ryux-counts-"));
  const path = join(dir, "counts.html");
  writeFileSync(path, COUNTS);
  const r = run(process.env.RYUX_PLAYWRIGHT_CWD ?? join(dirname(cli), "..", "..", ".."), ["scan", `file://${path}`, "--widths", "390", "--json"]);
  rmSync(dir, { recursive: true, force: true });
  if (/needs Playwright|could not start Chromium/.test(r.out)) return noBrowser(t);
  const counts = JSON.parse(r.out).findings.filter((f) => f.rule === "RX-AS-10").map((f) => f.message);
  assert.equal(counts.length, 2, counts.join("\n"));
  assert.match(counts[0], /^3 control or navigation labels carry an emoji \("🏠 Beranda", "🚀 Mulai", "💬"\).*; a control that is only an emoji is read by the emoji's name/);
  assert.match(counts[1], /^1 gradient with colours that are not among the page's colour tokens: div\.typed \(#f97316, #db2777\);/);
});

test("scan <url> names a stand-in box and a letter in a tile used as the logo, not an upload area or an avatar", (t) => {
  const dir = mkdtempSync(join(tmpdir(), "ryux-marks-"));
  const path = join(dir, "marks.html");
  writeFileSync(path, MARKS);
  const r = run(process.env.RYUX_PLAYWRIGHT_CWD ?? join(dirname(cli), "..", "..", ".."), ["scan", `file://${path}`, "--widths", "390", "--json"]);
  rmSync(dir, { recursive: true, force: true });
  if (/needs Playwright|could not start Chromium/.test(r.out)) return noBrowser(t);
  const found = JSON.parse(r.out).findings.filter((f) => f.rule === "RX-AS-03" || f.rule === "RX-AS-11").map((f) => `${f.rule} ${f.selector}: ${f.message}`);
  assert.equal(found.length, 2, found.join("\n"));
  assert.match(found[0], /^RX-AS-03 header > span\.logo-ph: a dashed box that says "Logo Kelasku": a stand-in/);
  assert.match(found[1], /^RX-AS-11 header > a\.logo > span\.tile: a letter in a tile \("K"\) stands in for the logo/);
});

test("scan <url> fails a faint field edge, a faint icon-only button, and a focus that shows nothing or too little (WCAG 1.4.11)", (t) => {
  const dir = mkdtempSync(join(tmpdir(), "ryux-edges-"));
  const path = join(dir, "edges.html");
  writeFileSync(path, EDGES);
  const r = run(process.env.RYUX_PLAYWRIGHT_CWD ?? join(dirname(cli), "..", "..", ".."), ["scan", `file://${path}`, "--widths", "390", "--json"]);
  rmSync(dir, { recursive: true, force: true });
  if (/needs Playwright|could not start Chromium/.test(r.out)) return noBrowser(t);
  const found = JSON.parse(r.out).findings.filter((f) => /WCAG 1\.4\.11|focus indicator/.test(f.message)).map((f) => `${f.rule} ${f.selector}: ${f.message}`);
  assert.equal(found.length, 4, found.join("\n"));
  assert.match(found[0], /^RX-A11Y-01 input#e: "Email" field: edge 1\.2\d:1 \(#e5e7eb border on #ffffff\).*; 1 more with the same colors$/);
  assert.match(found[1], /^RX-A11Y-01 p > button\.close: "Tutup" icon: contrast 1\.4\d:1 \(#cbd5e1 on #ffffff\)/);
  assert.match(found[2], /^RX-A11Y-03 p > a\.ghost: "Lupa sandi": no focus indicator/);
  assert.match(found[3], /^RX-A11Y-03 p > button\.soft: "Kirim": focus indicator 1\.\d+:1 \(#dbeafe on #ffffff\)/);
});

// Visual tells (knowledge/unslop.md): warn once per page, never at a single, reasoned use.
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

// owner notes H5 to H10 (2026-11-26): small text that passes WCAG 2 and reads weak; APCA catches it, ordinary dark text passes
test("scan <url> warns on small text that passes 4.5:1 and reads weak by APCA, and leaves dark body text alone", (t) => {
  const dir = mkdtempSync(join(tmpdir(), "ryux-apca-"));
  const page = (name, body) => {
    const path = join(dir, `${name}.html`);
    writeFileSync(path, `<!doctype html><html lang="id"><body style="margin:0;background:#fff;font:16px sans-serif"><main>${body}</main></body></html>`);
    return run(process.env.RYUX_PLAYWRIGHT_CWD ?? join(dirname(cli), "..", "..", ".."), ["scan", `file://${path}`, "--widths", "390", "--json"]);
  };
  const weak = (r) => JSON.parse(r.out).findings.filter((f) => f.rule === "RX-A11Y-01" && /reads weak/.test(f.message)).map((f) => f.message.match(/APCA Lc (\d+)/)[1]);
  const field = page("field", `<h1 style="color:#111">Lesin</h1><div style="background:#9ebdff;padding:16px"><p style="color:#12161f;font-size:14px">Unduh di App Store</p></div>`);
  if (/needs Playwright|could not start Chromium/.test(field.out)) {
    rmSync(dir, { recursive: true, force: true });
    return noBrowser(t);
  }
  assert.deepEqual(weak(field), ["67"]);
  assert.deepEqual(weak(page("plain", `<h1 style="color:#111">Lesin</h1><p style="color:#222;font-size:14px">Pilih guru dan jadwal.</p><p style="color:#555;font-size:16px">Gratis diunduh.</p>`)), []);
  rmSync(dir, { recursive: true, force: true });
});

// owner H6 and H9 2026-11-26: the proof in a small card beside the hero heading made three of five pages one idea; a centred
// hero and a split whose visual takes half the width or more are fine
test("scan <url> warns on the proof in a small card beside the hero heading, and leaves a centred hero and a wide visual alone", (t) => {
  const dir = mkdtempSync(join(tmpdir(), "ryux-hero-"));
  const page = (name, hero) => {
    const path = join(dir, `${name}.html`);
    writeFileSync(path, `<!doctype html><html lang="id"><body style="margin:0;background:#fff;font:16px sans-serif"><main>${hero}</main></body></html>`);
    return run(process.env.RYUX_PLAYWRIGHT_CWD ?? join(dirname(cli), "..", "..", ".."), ["scan", `file://${path}`, "--widths", "1280", "--json"]);
  };
  const hero = (r) => JSON.parse(r.out).findings.filter((f) => f.rule === "RX-UI-29").length;
  const left = `<div><h1 style="font-size:56px;margin:0">Les privat yang datang ke rumah</h1><p><a href="#" style="background:#123;color:#fff;padding:12px 20px">Unduh</a></p></div>`;
  const card = page("card", `<section style="display:grid;grid-template-columns:1fr 420px;gap:48px;padding:80px">${left}
<div style="border:1px solid #ccc;border-radius:12px;padding:20px;background:#f7f7f7"><p>Catatan sesi</p><p>Sudah bisa: perkalian 6 sampai 9</p><p>Masih sulit: pembagian</p></div></section>`);
  if (/needs Playwright|could not start Chromium/.test(card.out)) {
    rmSync(dir, { recursive: true, force: true });
    return noBrowser(t);
  }
  assert.equal(hero(card), 1);
  assert.equal(hero(page("centred", `<section style="text-align:center;padding:80px">${left}<div style="margin:40px auto 0;width:900px;height:360px;border:1px solid #ccc;border-radius:12px;background:#f7f7f7"><p>Catatan sesi</p><p>Sudah bisa: perkalian</p></div></section>`)), 0);
  const img = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='600' height='420'/%3E";
  assert.equal(hero(page("wide", `<section style="display:grid;grid-template-columns:1fr 1fr;gap:48px;padding:80px">${left}<div style="background:#f7f7f7;border-radius:12px"><img alt="Guru mengajar di rumah" src="${img}" style="width:100%;display:block"><p>Foto contoh</p></div></section>`)), 0);
  rmSync(dir, { recursive: true, force: true });
});

// H3 diversity bench, owner blind 2026-11-25: cream under a coloured hero, a day row that is not a picker, and a
// drawn store badge; the same page with a white body, real radios, and the store's image stays quiet.
test("scan <url> warns a cream page, a row that looks like a picker, a drawn store badge, and one button colour in two shapes", (t) => {
  const dir = mkdtempSync(join(tmpdir(), "ryux-store-"));
  const page = (name, html) => {
    const path = join(dir, `${name}.html`);
    writeFileSync(path, html);
    return run(process.env.RYUX_PLAYWRIGHT_CWD ?? join(dirname(cli), "..", "..", ".."), ["scan", `file://${path}`, "--widths", "390", "--json"]);
  };
  const tells = (r) => JSON.parse(r.out).findings.filter((f) => /^RX-(UI-26|UI-36|AS-11|DS-02)$/.test(f.rule)).map((f) => `${f.rule} ${f.message.split(/[:(]/)[0].trim()}`);
  const slop = page("slop", STORE_SLOP);
  if (/needs Playwright|could not start Chromium/.test(slop.out)) {
    rmSync(dir, { recursive: true, force: true });
    return noBrowser(t);
  }
  assert.deepEqual(tells(slop).sort(), ["RX-AS-11 a store badge drawn by hand", "RX-DS-02 buttons of one colour in two shapes", "RX-UI-26 the page is cream", "RX-UI-36 a row that looks like a picker with one option chosen"]);
  assert.deepEqual(tells(page("quiet", STORE_QUIET)), []);
  // owner H5 notes 2026-11-25: one store as text, the other a badge image cropped to a taller height
  const svg = (h) => `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='150' height='${h}'/%3E`;
  const pair = `<!doctype html><html lang="id"><body style="background:#fff"><main><h1>Bilas</h1><p style="display:flex;gap:12px">
<a href="#" style="display:inline-flex;height:48px;background:#000;color:#fff;padding:0 16px;align-items:center">Unduh di App Store</a>
<a href="#" style="display:inline-flex;height:48px;overflow:hidden"><img alt="Dapatkan di Google Play" src="${svg(71)}" style="height:71px"></a></p></main></body></html>`;
  assert.deepEqual(tells(page("pair", pair)).sort(), ["RX-AS-11 a store badge drawn by hand", "RX-DS-02 the store badges stand at two heights", "RX-DS-02 the store links come in two forms, a badge image and \"Unduh di App Store\""]);
  // owner H11 2026-11-26 (HI, WI): the store's name in a bordered button with no badge image, and a badge image that did not load
  const boxed = `<!doctype html><html lang="id"><body style="background:#fff"><main><h1>Lesin</h1><p><a href="#" style="display:inline-block;border:2px solid #111;border-radius:999px;padding:10px 18px;color:#111;text-decoration:none">Download di App Store</a></p></main></body></html>`;
  assert.deepEqual(tells(page("boxed", boxed)), ["RX-AS-11 a store badge drawn by hand"]);
  const gone = `<!doctype html><html lang="id"><body style="background:#fff"><main><h1>Lesin</h1><p><a href="#"><img alt="Download di App Store" width="150" height="50" src="file:///nowhere/badge-that-is-not-there.png"></a></p></main></body></html>`;
  assert.deepEqual(tells(page("gone", gone)), ["RX-AS-11 a store badge image did not load"]);
  // owner H9 2026-11-26 (GO, SE): the badge's two lines set in text, "Unduh di" over "App Store", with no icon and no image
  const stacked = `<!doctype html><html lang="id"><body style="background:#fff"><main><h1>Lesin</h1><p style="display:flex;gap:12px">
<a href="#" style="display:inline-flex;flex-direction:column;background:#000;color:#fff;padding:6px 14px;border-radius:8px;text-decoration:none"><small style="font-size:11px">Unduh di</small><b>App Store</b></a>
<a href="#" style="display:inline-flex;flex-direction:column;background:#000;color:#fff;padding:6px 14px;border-radius:8px;text-decoration:none"><small style="font-size:11px">Dapatkan di</small><b>Google Play</b></a></p></main></body></html>`;
  assert.deepEqual(tells(page("stacked", stacked)).filter((x) => x.startsWith("RX-AS-11")), ["RX-AS-11 a store badge drawn by hand"]);
  // one line of text is a plain link, and stays fine
  const plain = `<!doctype html><html lang="id"><body style="background:#fff"><main><h1>Lesin</h1><p><a href="#">Unduh di App Store</a> · <a href="#">Dapatkan di Google Play</a></p></main></body></html>`;
  assert.deepEqual(tells(page("plain", plain)), []);
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
        // Over a picture the weakest tenth depends on where this machine's fonts put the text, so its ratio may
        // move a little and its background colour with it; the finding, the text colour, and the need may not.
        const ratios = [];
        const loose = (v) => JSON.parse(JSON.stringify(v), (key, m) => key === "message" && typeof m === "string"
          ? m.replace(/contrast ([\d.]+):1 \((#[0-9a-f]{6}) on #[0-9a-f]{6}, the weakest tenth/, (_, r, fg) => (ratios.push(Number(r)), `contrast ~:1 (${fg} on ~, the weakest tenth`))
          : m);
        const [got, wanted] = [loose(out), loose(want.output)];
        const half = ratios.length / 2;
        ratios.slice(0, half).forEach((r, n) => assert.ok(Math.abs(r - ratios[half + n]) <= 0.15, `${p.name} at ${width}px: contrast over a picture ${r}:1, recorded ${ratios[half + n]}:1`));
        assert.deepEqual(got, wanted, `${p.name} at ${width}px${JSON.stringify(extract) === JSON.stringify(want.input) ? "" : " (the extract differs from the recorded one: another Chromium or other fonts?)"}`);
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

test("the edit hook checks the edited file against the other .jsx and .tsx files of its app (RX-DS-01)", () => {
  const root = mkdtempSync(join(tmpdir(), "ryux-dup-"));
  const app = join(root, "apps", "web");
  mkdirSync(join(app, "src"), { recursive: true });
  writeFileSync(join(app, "package.json"), "{}");
  const btn = `<button className="rounded-lg bg-lime-300 px-4 py-2 text-slate-900">Save</button>`;
  writeFileSync(join(app, "src", "a.tsx"), `export const A = () => <div>${btn}${btn}</div>;\n`);
  writeFileSync(join(app, "src", "b.tsx"), `export const B = () => <form>${btn}</form>;\n`);
  // another app with the same button is a different app: not counted
  mkdirSync(join(root, "apps", "admin"), { recursive: true });
  writeFileSync(join(root, "apps", "admin", "package.json"), "{}");
  writeFileSync(join(root, "apps", "admin", "c.tsx"), `export const C = () => <>${btn}${btn}${btn}</>;\n`);
  const edited = (file) => run(root, ["scan", "--hook"], JSON.stringify({ tool_input: { file_path: file } }));
  const b = edited(join(app, "src", "b.tsx"));
  assert.equal(b.code, 2);
  assert.match(b.out, /apps\/web\/src\/b\.tsx:1:\d+ RX-DS-01 this <button> is written 3 times with the same classes in 2 files \(also a\.tsx\)/);
  assert.doesNotMatch(b.out, /a\.tsx:1:\d+ RX-DS-01/, "only the edited file is reported");
  assert.doesNotMatch(edited(join(root, "apps", "admin", "c.tsx")).out, /RX-DS-01/, "one file in its app has nothing to copy from");
  rmSync(root, { recursive: true, force: true });
});

test("ryux components asks before a component library is built, and the scan follows the choice in DESIGN.md (RX-DS-01)", () => {
  const dir = mkdtempSync(join(tmpdir(), "ryux-choice-"));
  mkdirSync(join(dir, "src"));
  const btn = `<button className="rounded-lg bg-lime-300 px-4 py-2 text-slate-900">Save</button>`;
  writeFileSync(join(dir, "src", "a.tsx"), `export const A = () => <div>${btn}${btn}</div>;\n`);
  writeFileSync(join(dir, "src", "b.tsx"), `export const B = () => <form>${btn}</form>;\n`);
  const copies = () => JSON.parse(run(dir, ["scan", ".", "--json"]).out).findings.filter((f) => f.rule === "RX-DS-01");
  // undecided: the warning asks for the user's choice
  assert.match(copies()[0].message, /ask the user to choose.*Storybook.*ryux components --set/);
  // without a terminal, components lists the copies and says how to record the answer
  const listed = run(dir, ["components"], "");
  assert.match(listed.out, /2 places in 2 files write a control again/);
  assert.match(listed.out, /components --set extract\|storybook\|later/);
  // --set takes only the three answers
  assert.equal(run(dir, ["components", "--set", "maybe"]).code, 2);
  assert.equal(run(dir, ["components", "--set", "later"]).code, 0);
  assert.match(readFileSync(join(dir, "DESIGN.md"), "utf8"), /^- \*\*Components\*\*: later \(the user's choice, \d{4}-\d{2}-\d{2}\)$/m);
  assert.deepEqual(copies(), [], "later keeps the scan quiet");
  assert.match(run(dir, ["components"], "").out, /Current choice in DESIGN\.md: later[\s\S]*2 places in 2 files/, "and components still lists them");
  assert.doesNotMatch(run(dir, ["scan", "--hook"], JSON.stringify({ tool_input: { file_path: join(dir, "src", "b.tsx") } })).out, /RX-DS-01/);
  run(dir, ["components", "--set", "storybook"]);
  assert.match(copies()[0].message, /a story for each state.*Components: storybook/);
  assert.equal((readFileSync(join(dir, "DESIGN.md"), "utf8").match(/\*\*Components\*\*/g) ?? []).length, 1, "the field is replaced, not added again");
  rmSync(dir, { recursive: true, force: true });
});
