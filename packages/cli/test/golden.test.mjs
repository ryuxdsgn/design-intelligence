// Replays fixtures/checks/*.json (recorded by the tests with RYUX_RECORD=1, see golden.mjs) through the engine
// the CLI calls, ryux-core as WebAssembly: every case must give the same output. `cargo test` replays the same
// files against the crate.
import { test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { figmaAudit } from "../dist/figma-audit.js";
import { SOURCE_CHECKS, SYNTAX_CHECKS } from "../dist/checks.js";
import { FIXTURES, core, hydrate } from "./golden.mjs";
import { audit, readDirection, scanShared as scan, unused } from "../dist/engine.js";

const load = (check) => JSON.parse(readFileSync(join(FIXTURES, `${check}.json`), "utf8"));
const plain = (v) => JSON.parse(JSON.stringify(v ?? null));

test("golden through ryux-core: scan, direction, drift, unused, audit", async () => {
  const scans = load("scan");
  assert.ok(scans.length > 100);
  for (const { input, output } of scans) {
    const opts = { folder: input.folder, skip: new Set(input.skip), design: input.design || undefined };
    assert.deepEqual(plain(scan(input.sources, opts)), output, input.sources.map((s) => s.path).join(", "));
  }
  for (const { input, output } of load("direction")) assert.deepEqual(plain(readDirection(input.md)), output);
  for (const { input, output } of load("drift")) assert.deepEqual(JSON.parse(core.drift(JSON.stringify(input))), output, input.text);
  for (const { input, output } of load("unused")) assert.deepEqual(JSON.parse(core.unused(JSON.stringify(input))), output);
  // Unused tokens through the engine read raw sources: the scan cases that carry a direction.
  for (const { input } of scans.filter((c) => c.input.design)) {
    const texts = input.sources.map((s) => JSON.parse(core.source(s.path, s.raw)).text);
    assert.deepEqual(plain(unused(input.sources, input.design)), JSON.parse(core.unused(JSON.stringify({ texts, design: input.design }))));
  }
  const audits = load("audit");
  assert.ok(audits.length > 0);
  for (const { input, output } of audits) assert.deepEqual(plain(await audit(hydrate(input), input.page)), output, input.pages.map((p) => p.children.map((f) => f.name).join(",")).join(" | "));
});

test("golden: the in-Figma audit script gives what ryux-core records", async () => {
  // figma-audit.ts is still the script agents run in Figma; until it only extracts, it must agree with ryux-core.
  for (const { input, output } of load("audit")) assert.deepEqual(plain(await figmaAudit(hydrate(input), input.page)), output, input.pages.map((p) => p.children.map((f) => f.name).join(",")).join(" | "));
});

test("the catalogue lists ryux-core's detectors: same rules, levels, and folder-only flags, in order", () => {
  const ours = (list) => list.map((d) => ({ rule: d.rule, level: d.level, folder: Boolean(d.folder) }));
  assert.deepEqual(ours(SOURCE_CHECKS), JSON.parse(core.detectors()));
  assert.deepEqual(ours(SYNTAX_CHECKS), JSON.parse(core.syntaxDetectors()));
});

test("the checks have one engine: RYUX_ENGINE is ignored and nothing names it", () => {
  const cli = join(dirname(fileURLToPath(import.meta.url)), "..", "dist", "cli", "index.js");
  const dir = mkdtempSync(join(tmpdir(), "ryux-engine-"));
  writeFileSync(join(dir, "a.html"), "<p>Rp 50.000</p>");
  const scanned = (env) => {
    const r = spawnSync("node", [cli, "scan", "a.html", "--json"], { cwd: dir, encoding: "utf8", env: { ...process.env, NO_COLOR: "1", ...env } });
    return { out: r.stdout, err: r.stderr };
  };
  const base = scanned({});
  for (const value of ["ts", "rust"]) {
    const r = scanned({ RYUX_ENGINE: value });
    assert.equal(r.out, base.out, value);
    assert.equal(r.err, "", value);
  }
  assert.match(base.out, /RX-CD-02/);
  const engineSrc = readFileSync(join(dirname(fileURLToPath(import.meta.url)), "..", "src", "engine.ts"), "utf8");
  assert.doesNotMatch(engineSrc, /RYUX_ENGINE|TypeScript/);
});
