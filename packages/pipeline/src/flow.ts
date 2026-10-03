import { createHash } from "node:crypto";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { basename, join } from "node:path";

export interface FlowMeta {
  app: string;
  category: string;
  platform: string;
  version: string;
  captured_at: string;
  device: string;
  flow_type: string;
  title: string;
}

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

export const slug = (s: string): string =>
  s.toLowerCase().normalize("NFKD").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

// flow.yaml is a flat "key: value" file; a tiny parser avoids a YAML dependency.
function parseFlowYaml(text: string): Record<string, string> {
  const out: Record<string, string> = {};
  for (const line of text.split("\n")) {
    const m = line.match(/^\s*([a-z_]+)\s*:\s*(.*?)\s*$/);
    if (m && !line.trimStart().startsWith("#")) out[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
  return out;
}

const REQUIRED: (keyof FlowMeta)[] = ["app", "category", "version", "captured_at", "flow_type", "title"];

export function readFlow(dir: string): FlowFolder {
  const metaPath = join(dir, "flow.yaml");
  if (!existsSync(metaPath)) throw new Error(`${dir}: flow.yaml not found`);
  const raw = parseFlowYaml(readFileSync(metaPath, "utf8"));
  const missing = REQUIRED.filter((k) => !raw[k]);
  if (missing.length) throw new Error(`${metaPath}: missing ${missing.join(", ")}`);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(raw.captured_at)) throw new Error(`${metaPath}: captured_at must be YYYY-MM-DD`);
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

  const appId = `app_${slug(meta.app)}`;
  const versionId = `ver_${slug(meta.app)}_${slug(meta.version)}`;
  const flowId = `flw_${slug(meta.app)}_${slug(meta.version)}_${slug(meta.flow_type)}_${slug(meta.title)}`;

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
    screens.push({ position: screens.length + 1, file: f, hash, screenId: `scr_${hash.slice(0, 12)}` });
  }
  if (!screens.length) throw new Error(`${dir}: no screenshots (.png, .jpg, .webp)`);
  return { dir, meta, appId, versionId, flowId, screens, duplicates };
}

export const storagePath = (f: FlowFolder, s: ScreenFile): string =>
  `${slug(f.meta.app)}/${slug(f.meta.version)}/${basename(f.flowId)}/${String(s.position).padStart(2, "0")}-${s.screenId}${s.file.slice(s.file.lastIndexOf("."))}`;
