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

test("a brief with no market gets no default market, and a real brand is asked about or shown with its own logo", () => {
  // wallet-detail benchmark, 2.19.2: 3 of 3 runs proposed Indonesia and IDR; owner decision 2026-11-06: real brand logos, or ask
  const files = renderBundle();
  const product = files["knowledge/product.md"].replace(/\s+/g, " ");
  assert.match(product, /propose no market as your default/);
  const design = files["capabilities/design.md"].replace(/\s+/g, " ");
  assert.match(design, /name no market, ask with no market as the recommended default/);
  assert.match(files["capabilities/build.md"].replace(/\s+/g, " "), /no default market when nothing names one/);
  const antiSlop = files["knowledge/anti-slop.md"].replace(/\s+/g, " ");
  assert.match(antiSlop, /ask once, with the fact questions, whether to show the real brands with their official logos or made-up names/);
  assert.match(antiSlop, /Never a made-up brand with a drawn logo, or a real brand set as plain text where its logo belongs/);
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
  for (const h of ["Users and needs", "Jobs to be done", "Evidence", "Interaction patterns", "Visual and motion language", "Voice and tone", "Business rules", "How we evaluate", "Open questions"]) {
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
  // owner review 2026-11-02 of App 5: fee, minimum, and hold time listed on a read-me board, plain on the screens
  const design = files["capabilities/design.md"].replace(/\s+/g, " ");
  assert.match(design, /Open-rule sweep \(RX-PR-02\)/);
  assert.match(design, /a read-me board, a notes frame, or the final message does not count/);
  assert.match(files["SKILL.md"], /open rules on screen <tagged>\/<shown> \| none/);
  assert.match(files["capabilities/qa.md"].replace(/\s+/g, " "), /\*\*Open rules\*\*/);
  // laundry and Pasarku Figma runs, 2026-11-05/06: counts recalled, then a label naming another fee judged as labelled
  assert.match(design, /the listing decides "labelled", not you/);
  assert.match(design, /The unit is one rule on one screen/);
  assert.match(design, /the listing is the last use_figma call before the gate/);
  assert.match(design, /const RULES = \[/);
  assert.match(design, /r\.label === null \|\| |b\.includes\(r\.label\.toLowerCase\(\)\)/);
  assert.match(design, /native annotation in a "Placeholder" category/);
});

test("builds keep their cost down: fresh session, contact sheets, targeted tests", () => {
  // owner request 2026-10-28, after food-delivery round 2 cost $10.43 to build
  const files = renderBundle();
  const flat = (f) => files[f].replace(/\s+/g, " ");
  assert.match(flat("capabilities/design.md"), /suggest building in a fresh session that starts from DESIGN\.md/);
  assert.match(flat("capabilities/qa.md"), /one contact sheet/);
  assert.match(flat("knowledge/frontend.md"), /run the whole suite once before handing off/);
});

test("illustration is its own module: concept line first, then the read test on the render", () => {
  // illustration baseline, 2026-10-29: every low score was a concept that said the wrong thing
  // (a crew-list icon with no list, empty states drawn full); none was broken geometry
  const files = renderBundle();
  const ill = files["knowledge/illustration.md"].replace(/\s+/g, " ");
  assert.match(ill, /RX-UI-24/);
  assert.match(ill, /an empty state is visibly empty/);
  assert.match(ill, /with the label covered/);
  assert.match(ill, /concepts are written, not drawn/);
  for (const id of ["RX-UI-17", "RX-UI-18", "RX-UI-19", "RX-UI-21", "RX-UI-22"]) {
    assert.match(ill, new RegExp(`### ${id} `));
    assert.doesNotMatch(files["knowledge/imagery.md"], new RegExp(`### ${id} `));
  }
  assert.match(files["SKILL.md"], /knowledge\/illustration\.md/);
});

test("direction discovery: the user chooses among three directions that differ in visual language", () => {
  // owner trials T1 to T9, 2026-10-31: options that differed only in concept all landed on cream and flat
  const files = renderBundle();
  const flat = (f) => files[f].replace(/\s+/g, " ");
  const product = flat("knowledge/product.md");
  assert.match(product, /### RX-PR-13 /);
  assert.match(product, /never a word for restraint/);
  assert.match(product, /What people do in it, Numbers that may be shown/);
  const ui = flat("knowledge/ui.md");
  assert.match(ui, /### RX-UI-26 /);
  // owner decision 2026-11-06: an existing product's screens and code are its direction
  assert.match(ui.replace(/\s+/g, " "), /or the product already has screens, code, or a design file: their visual language is the direction/);
  assert.match(files["capabilities/design.md"].replace(/\s+/g, " "), /A product that exists already has a direction\./);
  assert.match(ui, /cream, ivory, warm white, and paper are one family, used once at most/);
  assert.match(ui, /flat with flat vectors once at most/);
  assert.match(ui, /hands back only that question/);
  // landing-gold round 5, 2026-11-01: every idea came from the product; options numbered two ways
  assert.match(ui, /At least one comes from culture and place, at most one from the product mechanic/);
  assert.match(ui, /numbered once: the same number in the message, the question, and the tiles/);
  assert.match(ui, /### RX-UI-31 /);
  assert.match(ui, /neutrals from the dominant hue/);
  assert.match(flat("capabilities/design.md"), /`direction:` YAML block/);
});

test("Laws of UX: every law named in a rule's basis, and measured in Critique and QA", () => {
  // owner request 2026-11-02 (lawsofux.com): the laws were cited for 18 of 30, and never measured
  const files = renderBundle();
  const all = Object.values(files).join(" ").replace(/\s+/g, " ");
  for (const law of ["Fitts", "Hick", "Jakob", "Miller", "Peak-end|peak-end", "Von Restorff", "aesthetic-usability", "Doherty", "goal-gradient", "proximity", "common region", "uniform connectedness", "Prägnanz", "similarity", "Postel", "Tesler", "Zeigarnik", "serial position", "Parkinson", "Occam", "Pareto", "selective attention", "cognitive load", "chunk", "mental model", "working memory", "choice overload", "flow \\(Csikszentmihalyi", "active user", "cognitive bias"]) {
    assert.match(all, new RegExp(law, "i"), law);
  }
  const ux = files["knowledge/ux.md"].replace(/\s+/g, " ");
  assert.match(ux, /\*\*Laws of UX, measured\.\*\*/);
  for (const id of [...ux.matchAll(/\| (RX-[A-Z0-9]+-\d+(?:, RX-[A-Z0-9]+-\d+)*) \|/g)].flatMap((m) => m[1].split(", "))) {
    assert.match(all, new RegExp(`### ${id} `), id);
  }
  assert.match(files["capabilities/critique.md"], /measured Laws of UX checks/);
  assert.match(files["capabilities/qa.md"].replace(/\s+/g, " "), /measured Laws of UX checks/);
});

test("design rationale: every shaping decision has a reason, and a design-tool canvas carries it", () => {
  // owner review 2026-11-02 of trial T10: the final message said what was made, not why
  const files = renderBundle();
  const product = files["knowledge/product.md"].replace(/\s+/g, " ");
  assert.match(product, /### RX-PR-14 /);
  assert.match(product, /never to a taste word: modern, clean, premium, elegant, and sleek are not reasons/);
  assert.match(product, /Name the alternative that lost and why/);
  const design = files["capabilities/design.md"].replace(/\s+/g, " ");
  assert.match(design, /decision → because \(user, brief, or evidence, with its strength\) → principle/);
  assert.match(design, /Figma, pen\.dev, Penpot, Framer, or another\), annotate three to five of those decisions beside the frames/);
  assert.match(files["SKILL.md"], /rationale <n> lines, annotations <n> \| none/);
  // owner review 2026-11-02 of trial T12: a notes frame first; native annotations only after the owner asked
  assert.match(design, /in Figma, native annotations in a "Design rationale" category/);
  assert.match(design, /The final message says how many annotations there are, on which frames, and how to see them/);
  // owner request 2026-11-06: the rationale and the annotations explain each decision with a UX principle
  assert.match(design, /The principle is a UX principle by name and how it works on this screen/);
  assert.match(design, /A RYUX rule ID alone is not a principle/);
  assert.match(design, /what was decided, why, and the UX principle behind it by name/);
  assert.match(product, /a RYUX rule ID alone is not a principle/);
});

test("frontend libraries: platform first, then the repo's, then verified options across frameworks", () => {
  // owner request 2026-11-02: library recommendations for proper frontend code, across frameworks
  const fe = renderBundle()["knowledge/frontend.md"].replace(/\s+/g, " ");
  assert.match(fe, /### RX-FE-18 /);
  assert.match(fe, /Choose in this order: the platform/);
  for (const name of ["Radix UI", "Reka UI", "Bits UI", "Kobalte", "Angular CDK", "Ark UI", "TanStack Query", "VeeValidate"]) assert.match(fe, new RegExp(name), name);
  assert.match(fe, /check on the npm registry and its documentation that the package exists under that exact name/);
});

test("expressive pages: one weight carrier, devices with a job, one world, the task first", () => {
  // owner trials T3 to T9, 2026-10-31: plain pages, a repeated ruler, a carried-over render, a timid fix
  const files = renderBundle();
  const img = files["knowledge/imagery.md"].replace(/\s+/g, " ");
  for (const id of ["RX-UI-27", "RX-UI-28", "RX-UI-29", "RX-UI-32"]) assert.match(img, new RegExp(`### ${id} `), id);
  assert.match(img, /drop the one any product in the category would draw first/);
  assert.match(img, /at most two same-skeleton sections in a row/);
  assert.match(img, /visible on the first screen at desktop and at 390 by 844/);
  assert.match(img, /cut only when it cannot be/);
  // landing-gold round 5: the same jar as the focal visual of four sections read as monotonous
  assert.match(img, /The system repeats, the subject does not/);
  assert.match(img, /focal visual of two sections at most/);
  assert.match(img, /\*\*Making images\.\*\*/);
  // owner review 2026-11-02 of the Raja Emas app: a landing direction applied to the app read as flat, its mockup rebuilt
  // RX-UI-33 sits in ui.md, read on every visual task: a mobile app task does not load imagery.md
  const uiMd = files["knowledge/ui.md"].replace(/\s+/g, " ");
  assert.match(uiMd, /### RX-UI-33 /);
  assert.match(uiMd, /never trace the real screens from it/);
  // App 5, imagery mapped to app moments, read as forced: imagery is optional, small, never behind data
  assert.match(uiMd, /imagery in the app is optional and small/);
  assert.match(uiMd, /never behind data, figures, or actions/);
  // App 6 read as plain: the brand band takes one surface treatment from the direction, not a trend
  assert.match(uiMd, /one surface treatment taken from the direction's grammar/);
  assert.match(uiMd, /glass only when the material is glass or digital/);
  assert.match(files["capabilities/design.md"].replace(/\s+/g, " "), /carries its brand layer, not its mockups/);
  // owner review 2026-11-02 of trial T11: renders, flat phones, and a flat edge read as undecided between 3D and 2D
  assert.match(img, /one named mix with its binding/);
  assert.match(img, /photo and vector: the photo cut out and graded to the palette/);
  assert.match(img, /each naming the part of the inventory it comes from/);
  assert.match(img, /\*\*A set is one family\*\*/);
  const ill = files["knowledge/illustration.md"].replace(/\s+/g, " ");
  assert.match(ill, /### RX-UI-30 /);
  assert.match(ill, /seven checks/);
  assert.match(ill, /write one asset spec for the page in the direction block, so the subjects change and the treatment does not/);
  assert.match(files["knowledge/frontend.md"].replace(/\s+/g, " "), /### RX-FE-17 /);
});

test("context stays scoped, visible, and honest about failed sources", () => {
  // NN/g context libraries (2026): context bleeding, stale context, unchecked agent edits, system decay
  const files = renderBundle();
  const skill = files["SKILL.md"].replace(/\s+/g, " ");
  assert.match(skill, /context from elsewhere \(another project, file pages the task does not name, an earlier run\) is not direction at all/);
  assert.match(skill, /list every change to DESIGN\.md as old → new/);
  assert.match(skill, /a business rule moves to Decided only on the user's own words/);
  assert.match(skill, /A source that fails \(the MCP answers 401 or 429, a file does not load\) is NOT VERIFIED in the gate/);
  const design = files["capabilities/design.md"].replace(/\s+/g, " ");
  assert.match(design, /## Business rules two lists\. Decided/);
  assert.match(design, /Start from Business rules in DESIGN\.md/);
  assert.match(design, /Ambient sources the user points to/);
  assert.match(design, /another page's components and variables are this product's library only when DESIGN\.md or the user says so/);
  assert.match(design, /a correction the user makes for this product/);
  assert.match(design, /Cite each item you use by its id and date/);
  assert.match(design, /an added line is "\(none\) → the new line"/);
  assert.match(files["knowledge/imagery.md"].replace(/\s+/g, " "), /list every mark in the handoff: the mark, the file's source URL, its licence or terms/);
});
