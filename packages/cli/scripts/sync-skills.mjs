// Regenerate the browsable skills/ folder and the generated sections of docs/design-rules.md from
// the CLI's render functions, then install RYUX into this repo (dogfooding). Run: pnpm sync:skills
// (builds the CLI first). Source of truth: packages/cli/src/content.ts and guides.ts.
import { readFile, readdir, mkdir, writeFile, rm } from "node:fs/promises";
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

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, "..", "..", "..");
const skillsDir = join(root, "skills");

// RYUX 2 ships one skill folder, skills/ryux/, with capabilities/ and knowledge/ inside.
// Remove the RYUX 1.x per-skill folders, then write the bundle fresh.
for (const entry of await readdir(skillsDir, { withFileTypes: true })) {
  if (entry.isDirectory() && (entry.name.startsWith("ryux-") || entry.name === SKILL_NAME)) {
    await rm(join(skillsDir, entry.name), { recursive: true, force: true });
  }
}
const files = renderBundle();
for (const [path, content] of Object.entries(files)) {
  const target = join(skillsDir, SKILL_NAME, path);
  await mkdir(dirname(target), { recursive: true });
  await writeFile(target, content, "utf8");
}

function fill(doc, name, body) {
  const start = `<!-- ${name}:start -->`;
  const end = `<!-- ${name}:end -->`;
  const i = doc.indexOf(start);
  const j = doc.indexOf(end);
  if (i < 0 || j < i) throw new Error(`docs/design-rules.md is missing the ${name} markers`);
  return `${doc.slice(0, i + start.length)}\n${body}\n${doc.slice(j)}`;
}

const docPath = join(root, "docs/design-rules.md");
let doc = await readFile(docPath, "utf8");
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
await writeFile(docPath, doc, "utf8");

// Dogfood: install RYUX into this repo with the real CLI. The generated .claude/skills/ryux folder
// is gitignored.
execFileSync("node", [join(here, "..", "dist", "index.js"), "install", "--agent", "claude"], { cwd: root, stdio: "ignore" });

console.log(`done: skills/${SKILL_NAME}/ (${Object.keys(files).length} files) synced, docs regenerated, dogfood install updated`);
