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

test("the README names no RYUX version, so no result reads as tied to one", () => {
  const readme = readFileSync(join(root, "README.md"), "utf8");
  assert.doesNotMatch(readme, /RYUX v?\d+\.\d+/, "README: say RYUX, keep versions in docs/benchmarks");
  assert.doesNotMatch(readme, /(?<![\d.]|Rp)\d+\.\d+\.\d+(?![\d.])/, "README: no version numbers (the npm badge shows the current one); Rupiah amounts are fine");
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
  for (const h of ["Users and needs", "Jobs to be done", "Design principles", "Evidence", "Interaction patterns", "Visual and motion language", "Voice and tone", "Business rules", "How we evaluate", "Open questions"]) {
    assert.match(design, new RegExp(`## ${h}`), h);
  }
  assert.match(flat("capabilities/design.md"), /At most three questions per message/);
  assert.match(flat("capabilities/design.md"), /keep every line the user wrote/);
  assert.match(flat("SKILL.md"), /write or update DESIGN\.md from a brief or references/);
  assert.match(flat("capabilities/analyze.md"), /Write or update DESIGN\.md, RX-PR-12/);
  assert.match(flat("knowledge/product.md"), /RX-PR-12/);
  assert.match(flat("knowledge/product.md"), /A DESIGN\.md answers five questions or names what is unknown/);
  // illustration direction A, passed 2026-11-07 (Sejuk, one run): RYUX directs, an image model draws, RYUX reads
  assert.match(flat("knowledge/illustration.md"), /Generated raster, RYUX directing: the default for feature icons at 48 pt and up/);
  assert.match(flat("knowledge/illustration.md"), /SVG, drawn or procedural: system icons always/);
  assert.match(flat("knowledge/illustration.md"), /3\. \*\*Make it\.\*\* Pick the method from the job \(RX-UI-21\)/);
  assert.match(flat("knowledge/illustration.md"), /paste the same block into every\s+prompt/);
  assert.match(flat("knowledge/illustration.md"), /craft 4\.67 against 1\.67 for drawn vectors/);
  // benchmark 2026-11-08: headless runs drew vectors silently when the credit question had no answer
  assert.match(flat("knowledge/illustration.md"), /search the tools for generate_image/);
  assert.match(flat("knowledge/illustration.md"), /end the turn with that question, as with a direction pick; do not draw vectors in its place/);
  assert.match(flat("knowledge/illustration.md"), /two services never share one main object/);
  // owner request 2026-11-06 (NNGroup): named UI styles, icon kind/style/meaning, research methods by question
  assert.match(flat("knowledge/ui.md"), /\*\*Named styles, and what each costs\*\* \(NNGroup\)/);
  assert.match(flat("knowledge/ui.md"), /\| Neumorphism \| soft embossed depth/);
  assert.match(flat("knowledge/ui.md"), /\*\*resemblance\*\*.*\*\*reference\*\*.*\*\*arbitrary\*\*/);
  assert.match(flat("knowledge/ui.md"), /\| 3D, clay, glassy, gradient \| feature icons and spot illustrations, 48 pt and up \|/);
  assert.match(flat("knowledge/ux.md"), /\*\*Research methods, by question\*\* \(NNGroup\)/);
  assert.match(flat("knowledge/ux.md"), /\| Can people find things in this structure\? \| design \| tree test/);
  assert.match(flat("knowledge/ux.md"), /name the method that answers it instead \(a tree test for a navigation change/);
  // owner review 2026-11-06 (Sejuk rerun in Figma): scaled icon strokes, icon colours, uneven variants went unmeasured
  assert.match(flat("capabilities/design.md"), /Design system listing \(RX-UI-15, RX-DS-06\)/);
  assert.match(flat("capabilities/design.md"), /resize icons, never scale them/);
  assert.match(flat("capabilities/design.md"), /return \{ iconStrokes: strokes, iconColours: colours, unbound: \[\.\.\.unbound\], mixedInOnePlace: mixed, unevenSets: uneven, missingVariants: missing \};/);
  assert.match(flat("SKILL.md"), /DESIGN SYSTEM +PASS \| FAIL \| NOT VERIFIED \| N\/A +· one-line reason · icon strokes <n>, icon colours <n>/);
  assert.match(flat("knowledge/ui.md"), /the same stroke at every icon size \(resize an icon, never scale it, or draw a master per size\)/);
  assert.match(flat("capabilities/design.md"), /A RYUX rule ID, name, or title \("one-way door", "full cost before commitment"\) is not a principle/);
  assert.match(flat("capabilities/design.md"), /A cost that a decided fact forced \(a price known only after the check\) names that fact in place of the design principle; the UX principle stays on the line/);
  // owner decision 2026-11-06 (NNGroup psychology study guide): information scent, change blindness, explicit differences
  assert.match(flat("knowledge/ux.md"), /\| Information scent \| the words on each link and button \|/);
  assert.match(flat("knowledge/ux.md"), /\| Change blindness \| values that change outside the element touched/);
  assert.match(flat("knowledge/ux.md"), /\| Explicit differences \| the attributes of peer options/);
  assert.match(flat("knowledge/ux.md"), /### RX-UX-14 \[Preferred\] Options show what sets them apart/);
  assert.match(flat("knowledge/interaction.md"), /mark the change where it lands: a short highlight or a number transition/);
  assert.match(flat("knowledge/content.md"), /information scent \(Pirolli and Card 1999; NNGroup\)/);
  // owner decision 2026-11-06 (NNGroup, Rosala 2020): product design principles take a side and decide trade-offs
  assert.match(flat("knowledge/product.md"), /the product's design principles: three to five value statements, each "X over Y"/);
  assert.match(flat("capabilities/design.md"), /when two alternatives fit equally, the design principles in DESIGN\.md decide/);
  assert.match(flat("capabilities/critique.md"), /DESIGN\.md, its design principles, an earlier Design Direction/);
  // NNGroup visual design heuristics posters (Gordon 2021): squint test, similarity, natural mapping
  for (const law of ["Visual hierarchy, squint test", "Similarity", "Natural mapping"]) assert.match(flat("knowledge/ux.md"), new RegExp(`\\| ${law} \\|`), law);
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
  // rationale test 2026-11-06: the cut line had no principle, a rule name was cited as one, a cost line named no design principle
  assert.match(design, /The line on what was cut names a principle too/);
  assert.match(design, /A line with a cost trades one value for another/);
  assert.match(design, /what was decided, why, and the UX principle behind it by name/);
  assert.match(product, /a RYUX rule ID, name, or title is not a principle, so name the principle behind it; the line on what was cut names one too/);
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

test("marketing surfaces: annotations instead of sample labels, the deciding number, units with money, mockups apart", () => {
  const files = renderBundle();
  const f = (p) => files[p].replace(/\s+/g, " ");
  assert.match(f("knowledge/product.md"), /for task UI and marketing surfaces alike/);
  assert.match(f("knowledge/anti-slop.md"), /nothing on the design says sample, example, or placeholder/);
  assert.match(f("knowledge/imagery.md"), /the owner's name as plain text in the page's type instead of an empty slot/);
  assert.match(f("knowledge/ux.md"), /put that number first in the handoff's open questions/);
  assert.match(f("knowledge/content.md"), /An unfamiliar unit comes with its everyday value/);
  assert.match(f("knowledge/illustration.md"), /a mascot's or character's tone matches the stakes/);
  const design = f("capabilities/design.md");
  assert.match(design, /for \(const a of p\.annotations \|\| \[\]\)/);
});

test("design-tool canvases label open rules with annotations; buttons keep their in-progress label; focus rings follow the keyboard", () => {
  // owner blind review 2026-11-09 of the head-to-head runs (docs/benchmarks/checkout, docs/benchmarks/motion)
  const files = renderBundle();
  const f = (p) => files[p].replace(/\s+/g, " ");
  assert.match(f("knowledge/product.md"), /On a design-tool canvas \(Figma, pen\.dev\), the label is the tool's annotation on that node or its row instead of visible text, for task UI and marketing surfaces alike/);
  assert.match(f("knowledge/product.md"), /A built prototype or code keeps the visible label/);
  assert.match(f("capabilities/design.md"), /On the canvas the label is a Figma annotation on that node or its row/);
  assert.doesNotMatch(f("capabilities/design.md"), /const MARKETING/);
  assert.match(f("capabilities/qa.md"), /in a design file the label is an annotation on the node, not a chip in the UI/);
  assert.match(f("knowledge/anti-slop.md"), /sample values carry a "Sample data" annotation, never a chip in the UI/);
  assert.match(f("knowledge/interaction.md"), /The in-progress label .* stays on the button until the result replaces the screen/);
  assert.match(f("knowledge/accessibility.md"), /:focus-visible/);
});

test("design runs carry the deciding number and the unit rule without loading content or ux; Rupiah keeps dots in English", () => {
  const files = renderBundle();
  const f = (p) => files[p].replace(/\s+/g, " ");
  assert.match(f("capabilities/design.md"), /the page answers without a number and the handoff asks for it first/);
  assert.match(f("capabilities/design.md"), /shows its Rupiah value beside it, at a beginner's precision \(RX-CD-20\)/);
  assert.match(f("knowledge/content.md"), /no decimals for whole Rupiah, in English copy too/);
  assert.match(f("knowledge/anti-slop.md"), /an empty logo slot reads as a bug/);
});

test("Design in Figma reads the libraries added to the file before the first frame, and marks what it had to create", () => {
  // owner decision 2026-11-10: a designer's file with a team library in Assets is the design system by default
  const files = renderBundle();
  const f = (p) => files[p].replace(/\s+/g, " ");
  const design = f("capabilities/design.md");
  assert.match(design, /\*\*Libraries first\.\*\* In Figma, before the first frame, call `get_libraries`/);
  assert.match(design, /every library in `libraries_added_to_file` is this product's design system/);
  assert.match(design, /`libraries_available_to_add` only when the user names one/);
  assert.match(design, /`search_design_system` with those library keys in `includeLibraryKeys`/);
  assert.match(design, /Write the inventory in the reply before building/);
  assert.match(design, /an element the library has is an instance of it, never redrawn/);
  assert.match(design, /build it in the file from the library's variables and styles, name it `Local\/<name>`, and mark it with a Figma annotation \("Not in the library yet: <name>"\)/);
  assert.match(design, /unless the prompt or DESIGN\.md says not to use the library/);
  // the "other pages" rule no longer blocks a library that the file has enabled
  assert.match(design, /a library added to the file always counts/);
  // pen.dev and code: the same mark for what the system did not have
  assert.match(design, /In pen\.dev, the file's own components and styles are the system/);
  assert.match(f("capabilities/build.md"), /a component the project's library does not have is named in the reply as new/);
  // the module names the library as the first source in Figma
  assert.match(f("knowledge/design-system.md"), /In Figma, the libraries added to the file come first/);
  // the gate measures it: a read-only listing, numbers in the DESIGN SYSTEM line
  assert.match(design, /Library listing \(RX-DS-01\): in Figma, count from the canvas, not from memory/);
  assert.match(design, /return \{ libraryInstances: lib, localInstances: local, newLocal: \[\.\.\.created\], redrawn \}/);
  assert.match(f("SKILL.md"), /missing variants <n> · library instances <n>, new local <n> \(marked <n>\), redrawn <n> \| not drawn/);
});

test("Figma→DESIGN.md generation serves frontend handoff and onboarding, with a resolved token matrix and system do's and don'ts", () => {
  // owner 2026-11-11, from comparing a ryux DESIGN.md with the Legion team's: add the resolved per-state
  // token matrix (buildable), an atmosphere/overview for onboarding, and the behavioural do's and don'ts tokens can't show
  const files = renderBundle();
  const f = (p) => files[p].replace(/\s+/g, " ");
  const design = f("capabilities/design.md");
  // generation guidance: resolved per-state token matrix for frontend handoff
  assert.match(design, /resolve the token matrix per state/i);
  assert.match(design, /variant . treatment . state/i);
  // generation guidance: capture behavioural do's and don'ts and flag failing contrast pairs
  assert.match(design, /do's and don'ts the tokens cannot show/i);
  assert.match(design, /contrast pair that fails/i);
  // template gains an Atmosphere (onboarding) section and a Do's and don'ts section
  assert.match(design, /## Atmosphere/);
  assert.match(design, /onboarding/i);
  assert.match(design, /## Do's and don'ts/);
  // two audiences named: frontend handoff and onboarding
  assert.match(design, /frontend handoff/i);
  // new rules
  assert.match(f("knowledge/design-system.md"), /### RX-DS-13 .* Resolve the token matrix per state/i);
  assert.match(f("knowledge/design-system.md"), /### RX-DS-14 .* Capture the system's do's and don'ts/i);
  assert.match(f("knowledge/frontend.md"), /### RX-FE-19 .* Build a system component from its tokens and rules/i);
  // the DS matrix rule names the behaviours a build cannot derive from tokens
  assert.match(f("knowledge/design-system.md"), /reuses success, not primary|current breadcrumb|body padding is 0|hover and focus share/i);
});
