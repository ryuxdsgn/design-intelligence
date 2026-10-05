// One version: packages/cli/package.json. Write it into the Claude Code plugin manifests.
// Run by sync-skills; `--check` exits 1 when a manifest disagrees (for CI).
import { readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "..");
const { version } = JSON.parse(await readFile(join(root, "packages/cli/package.json"), "utf8"));
const check = process.argv.includes("--check");
let drift = 0;

for (const file of [".claude-plugin/plugin.json", ".claude-plugin/marketplace.json"]) {
  const path = join(root, file);
  const text = await readFile(path, "utf8");
  const next = text.replace(/"version": "[^"]+"/g, `"version": "${version}"`);
  if (next === text) continue;
  if (check) {
    console.error(`${file}: version differs from packages/cli/package.json (${version})`);
    drift++;
  } else {
    await writeFile(path, next, "utf8");
  }
}
if (check && drift) process.exit(1);
