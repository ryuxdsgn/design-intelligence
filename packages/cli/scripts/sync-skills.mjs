// Regenerate the browsable top-level skills/ folder from the CLI's render functions, so the
// committed skill files never drift from what `npx ryux-rules` installs. Run: pnpm sync:skills
// (builds the CLI first, then this script). Single source of truth: packages/cli/src/content.ts.
import { readFile, mkdir, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { renderCoreSkill, renderConcernSkill } from "../dist/render.js";
import { ALL_CONCERN_IDS } from "../dist/content.js";

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, "..", "..", "..");
const skillsDir = join(root, "skills");

async function writeSkill(name, content) {
  await mkdir(join(skillsDir, name), { recursive: true });
  await writeFile(join(skillsDir, name, "SKILL.md"), content, "utf8");
  console.log(`wrote skills/${name}/SKILL.md`);
}

await writeSkill("ryux-rules", renderCoreSkill(ALL_CONCERN_IDS));
for (const id of ALL_CONCERN_IDS) {
  await writeSkill(`ryux-${id}`, renderConcernSkill(id));
}

// ryux-critique is hand-authored; mirror it from .claude/skills into the browsable skills/.
const critique = await readFile(join(root, ".claude/skills/ryux-critique/SKILL.md"), "utf8");
await writeSkill("ryux-critique", critique);

console.log(`done: ${ALL_CONCERN_IDS.length + 2} skills synced`);
