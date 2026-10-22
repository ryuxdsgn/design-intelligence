import { createHash } from "node:crypto";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { checkMeta, flowIds, screenIdFromHash, storagePath as corePath, type FlowMeta } from "@ryux/core/knowledge";

export type { FlowMeta };

export interface ScreenFile {
  position: number;
  file: string;
  hash: string;
  screenId: string;
}

export interface FlowFolder {
  dir: string;
  meta: FlowMeta;
  appId: string;
  versionId: string;
  flowId: string;
  screens: ScreenFile[];
  duplicates: string[];
}

// flow.yaml is a flat "key: value" file; a tiny parser avoids a YAML dependency.
function parseFlowYaml(text: string): Record<string, string> {
  const out: Record<string, string> = {};
  for (const line of text.split("\n")) {
    const m = line.match(/^\s*([a-z_]+)\s*:\s*(.*?)\s*$/);
    if (m && !line.trimStart().startsWith("#")) out[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
  return out;
}

export function readFlow(dir: string): FlowFolder {
  const metaPath = join(dir, "flow.yaml");
  if (!existsSync(metaPath)) throw new Error(`${dir}: flow.yaml not found`);
  const raw = parseFlowYaml(readFileSync(metaPath, "utf8"));
  const problems = checkMeta(raw);
  if (problems.length) throw new Error(`${metaPath}: ${problems.join("; ")}`);
  const meta: FlowMeta = {
    app: raw.app,
    category: raw.category,
    platform: raw.platform ?? "android",
    version: raw.version,
    captured_at: raw.captured_at,
    device: raw.device ?? "",
    flow_type: raw.flow_type,
    title: raw.title,
  };

  const { appId, versionId, flowId } = flowIds(meta);

  const files = readdirSync(dir).filter((f) => /\.(png|jpe?g|webp)$/i.test(f)).sort();
  const seen = new Set<string>();
  const screens: ScreenFile[] = [];
  const duplicates: string[] = [];
  for (const f of files) {
    const hash = createHash("sha256").update(readFileSync(join(dir, f))).digest("hex");
    if (seen.has(hash)) {
      duplicates.push(f);
      continue;
    }
    seen.add(hash);
    screens.push({ position: screens.length + 1, file: f, hash, screenId: screenIdFromHash(hash) });
  }
  if (!screens.length) throw new Error(`${dir}: no screenshots (.png, .jpg, .webp)`);
  return { dir, meta, appId, versionId, flowId, screens, duplicates };
}

export const storagePath = (f: FlowFolder, s: ScreenFile): string =>
  corePath(f.meta, f.flowId, s.position, s.screenId, s.file.slice(s.file.lastIndexOf(".")));
