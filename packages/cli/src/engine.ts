// Where the deterministic checks run: ryux-core, the Rust crate in crates/ryux-core, built to WebAssembly in
// ../wasm. It is the only implementation (owner, 2026-11-19); the checks answer to fixtures/checks. checks.ts
// keeps what they look for as data, for --list-rules and the rule text.
import { createRequire } from "node:module";
import type { Direction, ScanFinding } from "./checks.js";

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
    throw new Error(`RYUX's check engine (wasm/ryux_wasm.js) is missing from this install. In a checkout, run pnpm build:wasm. (${err instanceof Error ? err.message.split("\n")[0] : err})`);
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

/** The source detectors (SOURCE_CHECKS) over files, ordered by file, then line and column: the output
 *  fixtures/checks/scan.json records. */
export function scanShared(sources: RawSource[], opts: ScanOpts): ScanFinding[] {
  // ryux-core keeps source order; the file order is JavaScript's localeCompare.
  return answer<ScanFinding[]>(rust().scan(input(sources, opts))).sort(byPlace);
}

/** The JSX and TSX syntax checks (SYNTAX_CHECKS). */
export function scanSyntax(sources: RawSource[], opts: ScanOpts): ScanFinding[] {
  const jsx = sources.filter((s) => /\.(?:jsx|tsx)$/i.test(s.path));
  if (!jsx.length) return [];
  return answer<ScanFinding[]>(rust().syntaxScan(input(jsx, opts)));
}

/** Every source check: the source detectors and the syntax checks, ordered by file, then line and column. */
export function scan(sources: RawSource[], opts: ScanOpts): ScanFinding[] {
  return [...scanShared(sources, opts), ...scanSyntax(sources, opts)].sort(byPlace);
}

/** The DESIGN.md direction, or null when the file has none. */
export function readDirection(md: string): Direction | null {
  return answer<Direction | null>(rust().readDirection(md));
}

/** Direction colours and fonts no scanned source uses. */
export function unused(sources: RawSource[], design: Direction): { colours: string[]; fonts: string[] } {
  return answer(rust().unused(JSON.stringify({ sources, design })));
}

/** The canvas audit over a canvas as JSON: what figmaExtract returns, in Figma or over a FigCraft document. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function audit(canvas: Record<string, unknown>): any {
  return answer(rust().audit(JSON.stringify(canvas)));
}
