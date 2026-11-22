// The update notice: ryux check says when npm has a newer RYUX, at most one registry call a day, never installs.
import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { isNewer, updateNotice } from "../dist/cli/update-notice.js";

const DAY = 24 * 60 * 60 * 1000;
const cacheIn = () => join(mkdtempSync(join(tmpdir(), "ryux-upd-")), "update.json");

test("isNewer compares semver numerically", () => {
  assert.equal(isNewer("2.24.0", "2.23.7"), true);
  assert.equal(isNewer("2.23.10", "2.23.9"), true);
  assert.equal(isNewer("2.23.7", "2.23.7"), false);
  assert.equal(isNewer("2.23.6", "2.23.7"), false);
  assert.equal(isNewer("garbage", "2.23.7"), false);
});

test("a newer version gives one line with the update command, and caches the answer for a day", async () => {
  const cacheFile = cacheIn();
  let calls = 0;
  const fetchLatest = async () => { calls++; return "2.24.0"; };
  const n = await updateNotice({ current: "2.23.7", now: 1000, cacheFile, fetchLatest, env: {} });
  assert.deepEqual(n, { latest: "2.24.0", message: "RYUX 2.24.0 is out (this is 2.23.7). Update: npx @ryuxdsgn/design-intelligence@latest update" });
  assert.equal(JSON.parse(readFileSync(cacheFile, "utf8")).latest, "2.24.0");
  await updateNotice({ current: "2.23.7", now: 1000 + DAY - 1, cacheFile, fetchLatest, env: {} });
  assert.equal(calls, 1, "second call within a day reads the cache");
  await updateNotice({ current: "2.23.7", now: 1000 + DAY + 1, cacheFile, fetchLatest, env: {} });
  assert.equal(calls, 2, "after a day it asks again");
});

test("no notice when up to date, offline, opted out, or in CI", async () => {
  const fetchLatest = async () => "2.23.7";
  assert.equal(await updateNotice({ current: "2.23.7", now: 0, cacheFile: cacheIn(), fetchLatest, env: {} }), null);
  const offline = async () => { throw new Error("ENOTFOUND"); };
  assert.equal(await updateNotice({ current: "2.23.7", now: 0, cacheFile: cacheIn(), fetchLatest: offline, env: {} }), null);
  let called = false;
  const spy = async () => { called = true; return "9.9.9"; };
  assert.equal(await updateNotice({ current: "2.23.7", now: 0, cacheFile: cacheIn(), fetchLatest: spy, env: { RYUX_NO_UPDATE_CHECK: "1" } }), null);
  assert.equal(await updateNotice({ current: "2.23.7", now: 0, cacheFile: cacheIn(), fetchLatest: spy, env: { CI: "true" } }), null);
  assert.equal(called, false, "opted out and CI never call the registry");
});

test("a broken cache file is ignored, not fatal", async () => {
  const cacheFile = cacheIn();
  writeFileSync(cacheFile, "{not json");
  const n = await updateNotice({ current: "2.23.7", now: 0, cacheFile, fetchLatest: async () => "2.24.0", env: {} });
  assert.equal(n?.latest, "2.24.0");
});

import { spawnSync } from "node:child_process";
import { dirname as dn } from "node:path";
import { fileURLToPath } from "node:url";
const cli = join(dn(fileURLToPath(import.meta.url)), "..", "dist", "cli", "index.js");

test("ryux check shows the notice as a warn (and in --json) from a fresh cache, with no network call", () => {
  const dir = mkdtempSync(join(tmpdir(), "ryux-chk-"));
  const cacheFile = join(dir, "update.json");
  writeFileSync(cacheFile, JSON.stringify({ checked: Date.now(), latest: "99.0.0" }));
  const env = { ...process.env, NO_COLOR: "1", RYUX_UPDATE_CACHE: cacheFile };
  delete env.CI; delete env.RYUX_NO_UPDATE_CHECK;
  const r = spawnSync("node", [cli, "check"], { cwd: dir, encoding: "utf8", env });
  assert.match(r.stdout, /! npm: RYUX 99\.0\.0 is out \(this is \d+\.\d+\.\d+\)\. Update: npx @ryuxdsgn\/design-intelligence@latest update/);
  const j = JSON.parse(spawnSync("node", [cli, "check", "--json"], { cwd: dir, encoding: "utf8", env }).stdout);
  assert.equal(j.latest, "99.0.0");
  const off = spawnSync("node", [cli, "check"], { cwd: dir, encoding: "utf8", env: { ...env, RYUX_NO_UPDATE_CHECK: "1" } });
  assert.doesNotMatch(off.stdout, /is out/);
});
