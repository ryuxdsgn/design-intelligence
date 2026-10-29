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

test("Build with no design asks Design's stage 1 questions, even for a prototype", () => {
  // order-tracking benchmark, 2.19.0: a "working prototype" brief skipped the questions in 3 of 3 runs
  const build = renderBundle()["capabilities/build.md"].replace(/\s+/g, " ");
  assert.match(build, /run Design's stages 1-4 first/);
  assert.match(build, /even when the request is a quick build or a working prototype/);
});

test("a brief with no market gets no default market, and sample data names no real brand", () => {
  // wallet-detail benchmark, 2.19.2: 3 of 3 runs proposed Indonesia and IDR, and 3 of 3 showed Visa
  const files = renderBundle();
  const product = files["knowledge/product.md"].replace(/\s+/g, " ");
  assert.match(product, /propose no market as your default/);
  const design = files["capabilities/design.md"].replace(/\s+/g, " ");
  assert.match(design, /name no market, ask with no market as the recommended default/);
  assert.match(files["capabilities/build.md"].replace(/\s+/g, " "), /no default market when nothing names one/);
  const antiSlop = files["knowledge/anti-slop.md"].replace(/\s+/g, " ");
  assert.match(antiSlop, /Names are made up, including merchants, banks, and card networks/);
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
  assert.equal(toModuleRefs("npx @ryuxdsgn/design-intelligence and ryux.design"), "npx @ryuxdsgn/design-intelligence and ryux.design");
});

test("one version: package, plugin manifests, and router agree", () => {
  const pkg = JSON.parse(readFileSync(join(root, "packages/cli/package.json"), "utf8")).version;
  assert.equal(VERSION, pkg);
  for (const f of ["plugins/ryux/.claude-plugin/plugin.json", "plugins/ryux/plugin.json", "gemini-extension.json"]) {
    assert.match(readFileSync(join(root, f), "utf8"), new RegExp(`"version": "${pkg.replace(/\./g, "\\.")}"`), f);
  }
  for (const f of ["plugins/ryux/.claude-plugin/plugin.json", "plugins/ryux/plugin.json", "gemini-extension.json", ".claude-plugin/marketplace.json"]) {
    for (const m of readFileSync(join(root, f), "utf8").matchAll(/"version": "([^"]+)"/g)) assert.equal(m[1], pkg, f);
  }
  assert.match(renderBundle()["SKILL.md"], new RegExp(`RYUX ${pkg.replace(/\./g, "\\.")}`));
});

test("every bundle file is tracked by git, so skills.sh and the plugin ship it", async () => {
  const { spawnSync } = await import("node:child_process");
  for (const dir of ["skills/ryux", "plugins/ryux/skills/ryux"]) {
    const tracked = new Set(spawnSync("git", ["ls-files", dir], { cwd: root, encoding: "utf8" }).stdout.split("\n"));
    const missing = expectedFiles().filter((f) => !tracked.has(`${dir}/${f}`));
    assert.deepEqual(missing, [], `${dir}: not tracked (check .gitignore)`);
  }
});

test("the README shows the current version", () => {
  const minor = VERSION.split(".").slice(0, 2).join(".");
  const readme = readFileSync(join(root, "README.md"), "utf8");
  assert.match(readme, new RegExp(`^RYUX ${minor.replace(".", "\\.")}, early access`, "m"));
});

test("critique findings keep the fields that make them actionable", () => {
  const critique = renderBundle()["capabilities/critique.md"];
  for (const field of ["| Severity |", "| Evidence |", "| Status |", "| Impact |", "| Recommendation |", "| Confidence |", "| Verify by |"]) {
    assert.ok(critique.includes(field), `critique schema lost ${field}`);
  }
  assert.match(critique, /4 critical .* 3 high .* 2 medium .* 1 low/);
  assert.match(critique, /Walk the layers in the table's order, from purpose down to detail/);
  assert.match(critique, /A preference is not a defect/);
  assert.match(critique, /### 7\. Validate before reporting/);
});

test("the Delivery Gate separates verified from assumed", () => {
  const router = renderBundle()["SKILL.md"];
  assert.match(router, /NOT VERIFIED \(it applies, but the evidence was not available/);
  assert.match(router, /FINAL is FAIL if any area fails/);
  assert.match(router, /VISUAL QA without a render is NOT VERIFIED/);
  assert.match(router, /or was validated with users/);
});

test("Design can write or update a full DESIGN.md that answers five questions", () => {
  // owner request 2026-10-27, after wallet-expressive rounds 2 and 3
  const files = renderBundle();
  const flat = (f) => files[f].replace(/\s+/g, " ");
  const design = files["capabilities/design.md"];
  assert.match(design, /## Write or update DESIGN\.md/);
  for (const h of ["Users and needs", "Jobs to be done", "Evidence", "Interaction patterns", "Visual and motion language", "Voice and tone", "How we evaluate", "Open questions"]) {
    assert.match(design, new RegExp(`## ${h}`), h);
  }
  assert.match(flat("capabilities/design.md"), /At most three questions per message/);
  assert.match(flat("capabilities/design.md"), /keep every line the user wrote/);
  assert.match(flat("SKILL.md"), /write or update DESIGN\.md from a brief or references/);
  assert.match(flat("capabilities/analyze.md"), /Write or update DESIGN\.md, RX-PR-12/);
  assert.match(flat("knowledge/product.md"), /RX-PR-12/);
  assert.match(flat("knowledge/product.md"), /A DESIGN\.md answers five questions or names what is unknown/);
});

test("an undecided rule shown on screen is labelled on that screen", () => {
  // owner review 2026-10-27, food-delivery rounds 1 and 2
  const files = renderBundle();
  const flat = (f) => files[f].replace(/\s+/g, " ");
  assert.match(flat("knowledge/product.md"), /label it on that same screen/);
  assert.match(flat("knowledge/product.md"), /labelled only outside the screen/);
  assert.match(flat("SKILL.md"), /Do not show an undecided rule as a plain sentence on screen/);
});

test("builds keep their cost down: fresh session, contact sheets, targeted tests", () => {
  // owner request 2026-10-28, after food-delivery round 2 cost $10.43 to build
  const files = renderBundle();
  const flat = (f) => files[f].replace(/\s+/g, " ");
  assert.match(flat("capabilities/design.md"), /suggest building in a fresh session that starts from DESIGN\.md/);
  assert.match(flat("capabilities/qa.md"), /one contact sheet/);
  assert.match(flat("knowledge/frontend.md"), /run the whole suite once before handing off/);
});
