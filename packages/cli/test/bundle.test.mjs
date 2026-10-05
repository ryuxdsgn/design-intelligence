// Unit tests for the generated skill bundle, the rule set, and versioning. Run on the built dist.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { renderBundle, toModuleRefs, modulePath } from "../dist/render.js";
import { expectedFiles, validateBundle, validateRules } from "../dist/validate.js";
import { VERSION } from "../dist/product.js";

const root = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "..");

test("the bundle has every expected file and passes validation", () => {
  const files = renderBundle();
  assert.deepEqual(Object.keys(files).sort(), expectedFiles().sort());
  const report = validateBundle(files);
  assert.deepEqual(report.errors, []);
  assert.equal(report.version, VERSION);
});

test("the router stays short enough to read on every task", () => {
  assert.ok(renderBundle()["SKILL.md"].split("\n").length <= 180);
});

test("validation catches a missing module, a broken reference, and 1.x names", () => {
  const files = renderBundle();
  const missing = { ...files };
  delete missing["knowledge/forms.md"];
  assert.ok(validateBundle(missing).errors.some((e) => e.includes("missing knowledge/forms.md")));
  const broken = { ...files, "capabilities/qa.md": files["capabilities/qa.md"] + "\nSee `knowledge/nope.md`.\n" };
  assert.ok(validateBundle(broken).errors.some((e) => e.includes("knowledge/nope.md")));
  const legacy = { ...files, "capabilities/qa.md": files["capabilities/qa.md"] + "\nLoad ryux-forms.\n" };
  assert.ok(validateBundle(legacy).errors.some((e) => e.includes("ryux-forms")));
  const unknownRule = { ...files, "capabilities/qa.md": files["capabilities/qa.md"] + "\nRX-ZZ-99\n" };
  assert.ok(validateBundle(unknownRule).errors.some((e) => e.includes("RX-ZZ-99")));
});

test("the rule set is consistent", () => {
  assert.deepEqual(validateRules(), []);
});

test("old skill names map to module paths", () => {
  assert.equal(modulePath("forms"), "knowledge/forms.md");
  assert.equal(modulePath("visual-qa"), "capabilities/qa.md");
  assert.equal(modulePath("core"), "SKILL.md");
  assert.equal(toModuleRefs("Load `ryux-critique` and ryux-forms."), "Load `capabilities/critique.md` and `knowledge/forms.md`.");
  assert.equal(toModuleRefs("npx @ryuxdsgn/ryux and ryux.design"), "npx @ryuxdsgn/ryux and ryux.design");
});

test("one version: package, plugin manifests, and router agree", () => {
  const pkg = JSON.parse(readFileSync(join(root, "packages/cli/package.json"), "utf8")).version;
  assert.equal(VERSION, pkg);
  for (const f of [".claude-plugin/plugin.json", ".claude-plugin/marketplace.json"]) {
    for (const m of readFileSync(join(root, f), "utf8").matchAll(/"version": "([^"]+)"/g)) assert.equal(m[1], pkg, f);
  }
  assert.match(renderBundle()["SKILL.md"], new RegExp(`RYUX ${pkg.replace(/\./g, "\\.")}`));
});

test("every bundle file is tracked by git, so skills.sh and the plugin ship it", async () => {
  const { spawnSync } = await import("node:child_process");
  const tracked = new Set(spawnSync("git", ["ls-files", "skills/ryux"], { cwd: root, encoding: "utf8" }).stdout.split("\n"));
  const missing = expectedFiles().filter((f) => !tracked.has(`skills/ryux/${f}`));
  assert.deepEqual(missing, [], "not tracked (check .gitignore)");
});
