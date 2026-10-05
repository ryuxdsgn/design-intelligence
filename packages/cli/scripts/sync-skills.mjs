// Regenerate the browsable skill (skills/ryux/) and the generated sections of docs/design-rules.md
// from the CLI's render functions, sync the version into the plugin manifests, then install RYUX
// into this repo (dogfooding). Run: pnpm sync:skills (builds the CLI first).
//
// --check: change nothing; exit 1 when the committed skill, docs, or plugin versions differ from
// the sources, or when the bundle or rules fail validation. CI runs this.
import { readFile, readdir, mkdir, writeFile, rm } from "node:fs/promises";
import { existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { execFileSync } from "node:child_process";
import {
  renderBundle,
  SKILL_NAME,
  renderRulesDoc,
  renderMigrationTable,
  retiredTable,
  groupsTable,
  activationTable,
  hardGatesTable,
  purposeGatesTable,
  qualityLocksTable,
  deliveryGateTemplate,
} from "../dist/render.js";
import { validateBundle, validateRules } from "../dist/validate.js";

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, "..", "..", "..");
const skillsDir = join(root, "skills");
const check = process.argv.includes("--check");
const problems = [];

const files = renderBundle();
const report = validateBundle(files);
problems.push(...report.errors.map((e) => `bundle: ${e}`), ...validateRules().map((e) => `rules: ${e}`));
for (const w of report.warnings) console.warn(`warning: ${w}`);

function fill(doc, name, body) {
  const start = `<!-- ${name}:start -->`;
  const end = `<!-- ${name}:end -->`;
  const i = doc.indexOf(start);
  const j = doc.indexOf(end);
  if (i < 0 || j < i) throw new Error(`docs/design-rules.md is missing the ${name} markers`);
  return `${doc.slice(0, i + start.length)}\n${body}\n${doc.slice(j)}`;
}

const docPath = join(root, "docs/design-rules.md");
const currentDoc = await readFile(docPath, "utf8");
let doc = currentDoc;
for (const [name, body] of [
  ["groups", groupsTable()],
  ["activation", activationTable()],
  ["hardgates", hardGatesTable()],
  ["purpose", purposeGatesTable()],
  ["locks", qualityLocksTable()],
  ["gate", deliveryGateTemplate()],
  ["rules", renderRulesDoc()],
  ["migration", renderMigrationTable()],
  ["retired", retiredTable()],
]) {
  doc = fill(doc, name, body);
}

if (check) {
  const committed = {};
  const dir = join(skillsDir, SKILL_NAME);
  if (existsSync(dir)) {
    for (const e of await readdir(dir, { recursive: true, withFileTypes: true })) {
      if (e.isFile()) committed[join(e.parentPath, e.name).slice(dir.length + 1)] = await readFile(join(e.parentPath, e.name), "utf8");
    }
  }
  for (const [path, content] of Object.entries(files)) {
    if (committed[path] !== content) problems.push(`skills/${SKILL_NAME}/${path} is out of date`);
  }
  for (const path of Object.keys(committed)) if (!(path in files)) problems.push(`skills/${SKILL_NAME}/${path} should not exist`);
  if (doc !== currentDoc) problems.push("docs/design-rules.md generated sections are out of date");
  try {
    execFileSync("node", [join(here, "version.mjs"), "--check"], { stdio: "inherit" });
  } catch {
    problems.push("plugin manifest versions are out of date");
  }
  if (problems.length) {
    console.error(`sync check failed:\n- ${problems.join("\n- ")}\nRun: pnpm sync:skills`);
    process.exit(1);
  }
  console.log(`sync check passed: skills/${SKILL_NAME}/ (${Object.keys(files).length} files), docs, and versions match the sources`);
  process.exit(0);
}

if (problems.length) {
  console.error(`refusing to write an invalid bundle:\n- ${problems.join("\n- ")}`);
  process.exit(1);
}

// RYUX 2 ships one skill folder, skills/ryux/. Remove RYUX 1.x per-skill folders, then write fresh.
for (const entry of await readdir(skillsDir, { withFileTypes: true })) {
  if (entry.isDirectory() && (entry.name.startsWith("ryux-") || entry.name === SKILL_NAME)) {
    await rm(join(skillsDir, entry.name), { recursive: true, force: true });
  }
}
for (const [path, content] of Object.entries(files)) {
  const target = join(skillsDir, SKILL_NAME, path);
  await mkdir(dirname(target), { recursive: true });
  await writeFile(target, content, "utf8");
}
await writeFile(docPath, doc, "utf8");
execFileSync("node", [join(here, "version.mjs")], { stdio: "inherit" });

// Dogfood: install RYUX into this repo with the real CLI. The generated .claude/skills/ryux folder
// is gitignored.
execFileSync("node", [join(here, "..", "dist", "cli", "index.js"), "install", "--agent", "claude"], { cwd: root, stdio: "ignore" });

console.log(`done: skills/${SKILL_NAME}/ (${Object.keys(files).length} files) synced, docs regenerated, versions synced, dogfood install updated`);
