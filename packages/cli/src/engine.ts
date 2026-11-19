// Where the deterministic checks run. By default in ryux-core, the Rust crate in crates/ryux-core, built to
// WebAssembly in ../wasm (owner, 2026-11-19). RYUX_ENGINE=ts runs the TypeScript (scan.ts, drift.ts,
// figma-audit.ts), kept for one release to compare; RYUX_ENGINE=rust insists on ryux-core and fails when it is
// missing. Both answer to fixtures/checks. Measured 2026-11-18: as WebAssembly the regex checks run about twice as
// slow as the TypeScript; the findings are the same.
import { createRequire } from "node:module";
import { neutralCanvas } from "./canvas-json.js";
import { readDirection as tsDirection, unusedTokens, type Direction } from "./drift.js";
import { figmaAudit } from "./figma-audit.js";
import { scanSources, toSource, type ScanFinding } from "./scan.js";

export type Engine = "rust" | "ts";
let fellBack = false;
/** RYUX_ENGINE=ts or =rust when set; otherwise ryux-core, or the TypeScript with a note when the WebAssembly is
 *  missing (a checkout before pnpm build:wasm). */
export const engine = (): Engine => {
  const asked = process.env.RYUX_ENGINE;
  if (asked === "ts" || asked === "rust") return asked;
  if (hasCore()) return "rust";
  if (!fellBack) console.error("ryux: the checks ran in TypeScript: wasm/ryux_wasm.js is missing (run pnpm build:wasm).");
  fellBack = true;
  return "ts";
};

interface Core {
  scan(input: string): string;
  syntaxScan(input: string): string;
  unused(input: string): string;
  readDirection(md: string): string;
  audit(input: string): string;
}

let core: Core | undefined;
let coreMissing = false;
function hasCore(): boolean {
  if (core) return true;
  if (coreMissing) return false;
  try {
    rust();
    return true;
  } catch {
    coreMissing = true;
    return false;
  }
}
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
 *  are skipped with a note, unless RYUX_ENGINE=rust insisted on ryux-core. */
export function scanSyntax(sources: RawSource[], opts: ScanOpts): ScanFinding[] {
  const jsx = sources.filter((s) => /\.(?:jsx|tsx)$/i.test(s.path));
  if (!jsx.length) return [];
  let core: Core;
  try {
    core = rust();
  } catch (err) {
    if (process.env.RYUX_ENGINE === "rust") throw err;
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
