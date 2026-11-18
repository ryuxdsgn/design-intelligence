// Where the deterministic checks run. By default in ryux-core, the Rust crate in crates/ryux-core, built to
// WebAssembly in ../wasm; RYUX_ENGINE=ts runs the TypeScript (scan.ts, drift.ts, figma-audit.ts) instead,
// kept for one release so the two can be compared. Both answer to fixtures/checks.
import { createRequire } from "node:module";
import { neutralCanvas } from "./canvas-json.js";
import { readDirection as tsDirection, unusedTokens, type Direction } from "./drift.js";
import { figmaAudit } from "./figma-audit.js";
import { scanSources, toSource, type ScanFinding } from "./scan.js";

export type Engine = "rust" | "ts";
export const engine = (): Engine => (process.env.RYUX_ENGINE === "ts" ? "ts" : "rust");

interface Core {
  scan(input: string): string;
  unused(input: string): string;
  readDirection(md: string): string;
  audit(input: string): string;
}

let core: Core | undefined;
function rust(): Core {
  if (core) return core;
  try {
    core = createRequire(import.meta.url)("../wasm/ryux_wasm.js") as Core;
  } catch (err) {
    throw new Error(`RYUX's check engine (wasm/ryux_wasm.js) is missing from this install. In a checkout, run pnpm build:wasm; or set RYUX_ENGINE=ts to run the TypeScript checks. (${err instanceof Error ? err.message.split("\n")[0] : err})`);
  }
  return core;
}

/** Parse what ryux-core returned; it answers {"error": ...} only for input it could not read. */
function answer<T>(json: string): T {
  const out = JSON.parse(json);
  if (out && !Array.isArray(out) && typeof out.error === "string" && Object.keys(out).length === 1) throw new Error(`ryux-core: ${out.error}`);
  return out as T;
}

export interface RawSource {
  path: string;
  raw: string;
}

export interface ScanOpts {
  folder: boolean;
  skip?: Set<string>;
  design?: Direction;
}

/** The source detectors over files, ordered by file, then line and column. */
export function scan(sources: RawSource[], opts: ScanOpts, which: Engine = engine()): ScanFinding[] {
  if (which === "ts") return scanSources(sources.map((s) => toSource(s.path, s.raw)), opts);
  const found = answer<ScanFinding[]>(rust().scan(JSON.stringify({ sources, folder: opts.folder, skip: [...(opts.skip ?? [])], design: opts.design ?? null })));
  // ryux-core keeps source order; the file order is JavaScript's localeCompare, as in scanSources.
  return found.sort((a, b) => a.file.localeCompare(b.file) || a.line - b.line || a.column - b.column);
}

/** The DESIGN.md direction, or null when the file has none. */
export function readDirection(md: string, which: Engine = engine()): Direction | null {
  return which === "ts" ? tsDirection(md) : answer<Direction | null>(rust().readDirection(md));
}

/** Direction colours and fonts no scanned source uses. */
export function unused(sources: RawSource[], design: Direction, which: Engine = engine()): { colours: string[]; fonts: string[] } {
  if (which === "ts") return unusedTokens(sources.map((s) => toSource(s.path, s.raw).text), design);
  return answer(rust().unused(JSON.stringify({ sources, design })));
}

/** The canvas audit over a Figma-like canvas (figcraftCanvas). */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function audit(figma: any, page: string, which: Engine = engine()): Promise<any> {
  if (which === "ts") return figmaAudit(figma, page);
  return answer(rust().audit(JSON.stringify(await neutralCanvas(figma, page))));
}
