// Regenerate the browsable skills/ folder and the generated sections of docs/design-rules.md from
// the CLI's render functions, then install Ryux into this repo (dogfooding). Run: pnpm sync:skills
// (builds the CLI first). Source of truth: packages/cli/src/content.ts and guides.ts.
import { readFile, readdir, mkdir, writeFile, rm } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { execFileSync } from "node:child_process";
import {
  renderCoreSkill,
  renderSkill,
  renderRulesDoc,
  renderMigrationTable,
  groupsTable,
  activationTable,
  hardGatesTable,
  purposeGatesTable,
  qualityLocksTable,
  deliveryGateTemplate,
} from "../dist/render.js";
import { ALL_SKILL_IDS, ALL_GROUP_IDS } from "../dist/content.js";

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, "..", "..", "..");
const skillsDir = join(root, "skills");
const keep = new Set(["ryux-core", "ryux-critique", ...ALL_SKILL_IDS.map((id) => `ryux-${id}`)]);

async function writeSkill(name, content) {
  await mkdir(join(skillsDir, name), { recursive: true });
  await writeFile(join(skillsDir, name, "SKILL.md"), content, "utf8");
}

for (const entry of await readdir(skillsDir, { withFileTypes: true })) {
  if (entry.isDirectory() && entry.name.startsWith("ryux-") && !keep.has(entry.name)) {
    await rm(join(skillsDir, entry.name), { recursive: true, force: true });
  }
}

await writeSkill("ryux-core", renderCoreSkill(ALL_SKILL_IDS));
for (const id of ALL_SKILL_IDS) await writeSkill(`ryux-${id}`, renderSkill(id));

// ryux-critique is hand-authored; mirror it from .claude/skills into the browsable skills/.
const critique = await readFile(join(root, ".claude/skills/ryux-critique/SKILL.md"), "utf8");
await writeSkill("ryux-critique", critique);

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
]) {
  doc = fill(doc, name, body);
}
await writeFile(docPath, doc, "utf8");

// Dogfood: install Ryux into this repo with the real CLI. The generated .claude/skills/ryux-*
// folders are gitignored; ryux-critique there is the hand-authored source and is not touched.
execFileSync(
  "node",
  [join(here, "..", "dist", "index.js"), "install", "--agent", "claude", "--groups", ALL_GROUP_IDS.join(",")],
  { cwd: root, stdio: "ignore" },
);

console.log(`done: ${ALL_SKILL_IDS.length + 2} skills synced, docs regenerated, dogfood install updated`);
