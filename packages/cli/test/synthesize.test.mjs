// `ryux synthesize check`: a research synthesis is checked against its raw data (RX-UX-21). The counting runs in
// ryux-core (crates/ryux-core/src/synth.rs); the CLI reads the synthesis and the files its Data table names.
import { test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const cli = join(dirname(fileURLToPath(import.meta.url)), "..", "dist", "cli", "index.js");
const run = (cwd, args) => spawnSync("node", [cli, ...args], { cwd, encoding: "utf8", env: { ...process.env, NO_COLOR: "1", RYUX_NO_UPDATE_CHECK: "1" } });

const DATA = "## Data\n\n| ID | Kind | File |\n| --- | --- | --- |\n| P1 | interview | data/p1.md |\n| P2 | usability | data/p2.txt |\n";

function study(synthesis) {
  const dir = mkdtempSync(join(tmpdir(), "ryux-synth-"));
  mkdirSync(join(dir, "data"));
  writeFileSync(join(dir, "data", "p1.md"), "P1: Saya jarang ke laundry karena harus antre.\n");
  writeFileSync(join(dir, "data", "p2.txt"), "Tugas 1 gagal. P2: Tombol jemputnya tidak kelihatan.\n");
  writeFileSync(join(dir, "synthesis.md"), synthesis);
  return dir;
}

test("synthesize check passes a synthesis whose quotes and counts stand on the data", () => {
  const dir = study(`# Synthesis\n\n${DATA}\n## Tema\n\n### T1 Antre dan jemput\n\n- 2 dari 2 (P1, P2)\n> "jarang ke laundry karena harus antre" — P1\n> "Tombol jemputnya tidak kelihatan" — P2\n`);
  const r = run(dir, ["synthesize", "check"]);
  assert.equal(r.status, 0, r.stdout);
  assert.match(r.stdout, /2 participants, 1 themes, 2 data files read/);
  assert.match(r.stdout, /✓ Every quote, count, and participant stands on the data/);
  rmSync(dir, { recursive: true, force: true });
});

test("synthesize check fails an invented quote, a wrong count, and a participant outside the data", () => {
  const dir = study(`${DATA}\n## Themes\n\n### T1 Semua pengguna ingin dijemput\n\n- Support: 2 of 3 (P1)\n> "saya selalu minta dijemput" — P1\n> "laundry mahal" — P7\n`);
  const r = run(dir, ["synthesize", "check", "synthesis.md", "--json"]);
  assert.equal(r.status, 1);
  const out = JSON.parse(r.stdout);
  const text = out.findings.map((f) => f.message).join("\n");
  assert.match(text, /P7 is named in the synthesis but not in the Data table/);
  assert.match(text, /is not in P1's data word for word/);
  assert.match(text, /lists 1 participant IDs/);
  assert.match(text, /counts out of 3, and the Data table holds 2/);
  assert.ok(out.findings.every((f) => f.rule === "RX-UX-21"));
  rmSync(dir, { recursive: true, force: true });
});

test("synthesize check says what it could not read, and asks for the synthesis when there is none", () => {
  const dir = study(`## Data\n\n| P1 | interview | data/p1.pdf |\n\n## Themes\n\n### T1 x\n\n- 1 of 1 (P1)\n`);
  const r = run(dir, ["synthesize", "check"]);
  assert.match(r.stdout, /not read \(a text copy is needed/);
  const empty = mkdtempSync(join(tmpdir(), "ryux-synth-"));
  assert.match(run(empty, ["synthesize", "check"]).stdout, /synthesis\.md not found/);
  rmSync(dir, { recursive: true, force: true });
  rmSync(empty, { recursive: true, force: true });
});
