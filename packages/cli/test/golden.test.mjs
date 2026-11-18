// Replays fixtures/checks/*.json (recorded by the tests with RYUX_RECORD=1, see golden.mjs): every case must
// give the same output, so the TypeScript checks and their Rust port answer to one contract.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { scanSources, toSource } from "../dist/scan.js";
import { readDirection } from "../dist/drift.js";
import { figmaAudit } from "../dist/figma-audit.js";
import { FIXTURES, hydrate } from "./golden.mjs";
import { audit, readDirection as directionIn, scan, unused } from "../dist/engine.js";

const load = (check) => JSON.parse(readFileSync(join(FIXTURES, `${check}.json`), "utf8"));
const plain = (v) => JSON.parse(JSON.stringify(v ?? null));

test("golden: scan", () => {
  const cases = load("scan");
  assert.ok(cases.length > 0);
  for (const { input, output } of cases) {
    const got = scanSources(input.sources.map((s) => toSource(s.path, s.raw)), { folder: input.folder, skip: new Set(input.skip), design: input.design || undefined });
    assert.deepEqual(plain(got), output, input.sources.map((s) => s.path).join(", "));
  }
});

test("golden: direction", () => {
  for (const { input, output } of load("direction")) assert.deepEqual(plain(readDirection(input.md)), output);
});

test("golden: audit", async () => {
  const cases = load("audit");
  assert.ok(cases.length > 0);
  for (const { input, output } of cases) assert.deepEqual(plain(await figmaAudit(hydrate(input), input.page)), output, input.pages.map((p) => p.children.map((f) => f.name).join(",")).join(" | "));
});

// The same contract through the engine the CLI calls: ryux-core as WebAssembly (the default) and the
// TypeScript (RYUX_ENGINE=ts). Unused tokens are recorded over comment-blanked texts; the engine reads raw
// sources, so its cases are the scan cases that carry a direction.
for (const which of ["rust", "ts"]) {
  test(`golden through the ${which} engine: scan, direction, unused, audit`, async () => {
    for (const { input, output } of load("scan")) {
      const opts = { folder: input.folder, skip: new Set(input.skip), design: input.design || undefined };
      assert.deepEqual(plain(scan(input.sources, opts, which)), output, input.sources.map((s) => s.path).join(", "));
      if (input.design) assert.deepEqual(plain(unused(input.sources, input.design, which)), plain(unused(input.sources, input.design, "ts")));
    }
    for (const { input, output } of load("direction")) assert.deepEqual(plain(directionIn(input.md, which)), output);
    for (const { input, output } of load("audit")) assert.deepEqual(plain(await audit(hydrate(input), input.page, which)), output);
  });
}
