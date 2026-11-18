// Where the deterministic checks run. By default in the TypeScript (scan.ts, drift.ts, figma-audit.ts);
// RYUX_ENGINE=rust runs ryux-core, the Rust crate in crates/ryux-core, built to WebAssembly in ../wasm. Both
// answer to fixtures/checks. Rust stays opt-in until it earns the default with a measured gain (owner,
// 2026-11-18): as WebAssembly it is about twice as slow on these regex checks.
import { createRequire } from "node:module";
import { neutralCanvas } from "./canvas-json.js";
import { readDirection as tsDirection, unusedTokens, type Direction } from "./drift.js";
import { figmaAudit } from "./figma-audit.js";
import { scanSources, toSource, type ScanFinding } from "./scan.js";

export type Engine = "rust" | "ts";
export const engine = (): Engine => (process.env.RYUX_ENGINE === "rust" ? "rust" : "ts");

interface Core {
  scan(input: string): string;
  syntaxScan(input: string): string;
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
    throw new Error(`RYUX's check engine (wasm/ryux_wasm.js) is missing from this install. In a checkout, run pnpm build:wasm; or leave RYUX_ENGINE unset to run the TypeScript checks. (${err instanceof Error ? err.message.split("\n")[0] : err})`);
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

const input = (sources: RawSource[], opts: ScanOpts): string => JSON.stringify({ sources, folder: opts.folder, skip: [...(opts.skip ?? [])], design: opts.design ?? null });
const byPlace = (a: ScanFinding, b: ScanFinding): number => a.file.localeCompare(b.file) || a.line - b.line || a.column - b.column;

/** The source detectors over files, ordered by file, then line and column. Shared with the TypeScript:
 *  both engines give the same findings (fixtures/checks/scan.json). */
export function scanShared(sources: RawSource[], opts: ScanOpts, which: Engine = engine()): ScanFinding[] {
  if (which === "ts") return scanSources(sources.map((s) => toSource(s.path, s.raw)), opts);
  // ryux-core keeps source order; the file order is JavaScript's localeCompare, as in scanSources.
  return answer<ScanFinding[]>(rust().scan(input(sources, opts))).sort(byPlace);
}

let warned = false;
/** The JSX and TSX syntax checks (SYNTAX_CHECKS). They exist only in ryux-core, so they run through the
 *  WebAssembly whichever engine the shared checks use. Without it (a checkout before pnpm build:wasm) they
 *  are skipped with a note, unless RYUX_ENGINE=rust asked for ryux-core. */
export function scanSyntax(sources: RawSource[], opts: ScanOpts): ScanFinding[] {
  const jsx = sources.filter((s) => /\.(?:jsx|tsx)$/i.test(s.path));
  if (!jsx.length) return [];
  let core: Core;
  try {
    core = rust();
  } catch (err) {
    if (engine() === "rust") throw err;
    if (!warned) console.error("ryux scan: the JSX and TSX syntax checks were skipped: wasm/ryux_wasm.js is missing (run pnpm build:wasm).");
    warned = true;
    return [];
  }
  return answer<ScanFinding[]>(core.syntaxScan(input(jsx, opts)));
}

/** Every source check: the shared detectors and the syntax checks, ordered by file, then line and column. */
export function scan(sources: RawSource[], opts: ScanOpts, which: Engine = engine()): ScanFinding[] {
  return [...scanShared(sources, opts, which), ...scanSyntax(sources, opts)].sort(byPlace);
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
