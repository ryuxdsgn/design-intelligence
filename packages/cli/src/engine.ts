// Where the deterministic checks run: ryux-core, the Rust crate in crates/ryux-core, built to WebAssembly in
// ../wasm. It is the only implementation (owner, 2026-11-19); the checks answer to fixtures/checks. checks.ts
// keeps what they look for as data, for --list-rules and the rule text.
import { createRequire } from "node:module";
import { neutralCanvas } from "./canvas-json.js";
import type { Direction, ScanFinding } from "./checks.js";
import { GATE_AREAS } from "./intelligence/content.js";

interface Core {
  scan(input: string): string;
  syntaxScan(input: string): string;
  unused(input: string): string;
  readDirection(md: string): string;
  audit(input: string): string;
  probe(input: string): string;
  reportCheck(input: string): string;
  synthCheck(input: string): string;
  directions(input: string): string;
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
  /** Files the checks may consult but do not report on: what `references` names, read from disk. */
  context?: RawSource[];
}

const input = (sources: RawSource[], opts: ScanOpts, wants = false): string =>
  JSON.stringify({ sources, folder: opts.folder, skip: [...(opts.skip ?? [])], design: opts.design ?? null, context: opts.context ?? [], ...(wants ? { wants } : {}) });
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

const MAX_CONTEXT = 64;

/** Every source check, reading the files ryux-core asks for to judge the sources fully: the scripts a page loads,
 *  the module a loading component comes from, and its re-exports. `read` gives a file, or undefined when it does not
 *  exist. They are consulted, not reported; the scan repeats only when a round found a file. */
export function scanReading(sources: RawSource[], opts: ScanOpts, read: (path: string) => RawSource | undefined): ScanFinding[] {
  const context = [...(opts.context ?? [])];
  const tried = new Set([...sources, ...context].map((s) => s.path));
  let findings: ScanFinding[] = [];
  for (let round = 0; round < 5; round++) {
    const out = answer<{ findings: ScanFinding[]; wants: string[] }>(rust().scan(input(sources, { ...opts, context }, true)));
    findings = out.findings;
    const fresh: RawSource[] = [];
    for (const path of out.wants) {
      if (tried.has(path) || context.length + fresh.length >= MAX_CONTEXT) continue;
      tried.add(path);
      const file = read(path);
      if (file) fresh.push(file);
    }
    if (!fresh.length) break;
    context.push(...fresh);
  }
  return [...findings, ...scanSyntax(sources, opts)].sort(byPlace);
}

/** The DESIGN.md direction, or null when the file has none. */
export function readDirection(md: string): Direction | null {
  return answer<Direction | null>(rust().readDirection(md));
}

/** Direction colours and fonts no scanned source uses. */
export function unused(sources: RawSource[], design: Direction): { colours: string[]; fonts: string[] } {
  return answer(rust().unused(JSON.stringify({ sources, design })));
}

/** The canvas audit over a Figma-like canvas (figcraftCanvas). */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function audit(figma: any, page: string): Promise<any> {
  return answer(rust().audit(JSON.stringify(await neutralCanvas(figma, page))));
}

/** The rendered checks over what probeExtract read in the page (cli/page-probe.ts): the findings and the ignored
 *  regions, or what the page must do first (`ask`), when the extract has no `answers` yet. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function probe(extract: Record<string, unknown>): any {
  // A lone surrogate in page text cannot cross as JSON; it becomes U+FFFD, as String.prototype.toWellFormed does.
  const lone = /[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?<![\uD800-\uDBFF])[\uDC00-\uDFFF]/g;
  return answer(rust().probe(JSON.stringify(extract, (_k, v) => (typeof v === "string" ? v.replace(lone, "\uFFFD") : v))));
}

export type GateCounts = { PASS: number; FAIL: number; "NOT VERIFIED": number; "N/A": number };
export interface ReportCheck {
  ok: boolean;
  gate: GateCounts | null;
  detail: GateCounts | null;
  message: string | null;
}

export interface SynthFinding { level: "fail" | "warn"; rule: string; at: string; message: string }
export interface SynthCheck { ok: boolean; participants: number; themes: number; findings: SynthFinding[] }

/** Does a research synthesis stand on its raw data? `files` maps each path its Data table names to that file's text. */
export function synthCheck(synthesis: string, files: Record<string, string>): SynthCheck {
  return answer(rust().synthCheck(JSON.stringify({ synthesis, files })));
}

/** Does a RYUX report's one-line gate count the same areas as its detail block (report.md)? */
export function reportCheck(text: string): ReportCheck {
  return answer(rust().reportCheck(JSON.stringify({ text, areas: GATE_AREAS })));
}

/** Three direction draws for a project from the curated catalog (RX-UI-26), seeded by the project name. */
export function drawDirections(input: { project: string; context?: string; tags?: string[]; lock?: Record<string, string>; allow?: string[]; redraw?: number; extra?: Record<string, unknown[]> }): DirectionDraw {
  return answer<DirectionDraw>(rust().directions(JSON.stringify(input)));
}
export interface DirectionEntry { id: string; name: string; note: string; hue?: number; hues?: [number, number]; fonts?: string[] }
export interface DirectionDraw {
  seed: string;
  project: string;
  context: string;
  redraw: number;
  tags: string[];
  locked: Record<string, string>;
  unknownLocks: string[];
  unknownTags: string[];
  userEntries: string[];
  knownTags: Record<string, string[]>;
  notDefault: { id: string; note: string }[];
  directions: ({ n: number; ramp: { ratio: number; caption: number; body: number; heading: number; title: number; display: number; label: string }; treatment?: DirectionEntry & { check?: string }; model?: DirectionEntry; signature?: string; why?: string[]; pros?: string[]; cons?: string[]; buttons?: { radius: number | "pill"; height: number; primary: string; secondary: string; store: string }; colours?: { page: string; section: string; ink: string; muted: string; accent: string; onAccent: string; field?: string; onField?: string } } & Record<"surface" | "accent" | "type" | "layout" | "carrier" | "material" | "idea", DirectionEntry>)[];
}
