import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

// Reads KEY=VALUE lines from the repo's .env (gitignored) without adding a dependency.
// Values already in the environment win.
export function loadEnv(root: string): void {
  const file = join(root, ".env");
  if (!existsSync(file)) return;
  for (const line of readFileSync(file, "utf8").split("\n")) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (!m || process.env[m[1]] !== undefined) continue;
    process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
}

export function required(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing ${name}. Add it to .env at the repo root (see DEPLOY.md, Knowledge pipeline).`);
  return v;
}
