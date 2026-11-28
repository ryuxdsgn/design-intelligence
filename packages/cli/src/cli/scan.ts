// `ryux scan`: run the deterministic detectors (ryux-core, through ../engine.ts) over files and folders, measure rendered
// pages given as URLs (./page-scan.ts), or check the file an agent just edited (--hook, fed by a
// Claude Code PostToolUse hook on stdin).
import { existsSync, readFileSync, realpathSync, statSync } from "node:fs";
import { readFile, readdir } from "node:fs/promises";
import { join, relative, resolve } from "node:path";
import pc from "picocolors";
import { RULES } from "../intelligence/content.js";
import { VERSION } from "../product.js";
import { readDirection, scanReading, unused, type RawSource } from "../engine.js";
import { RENDER_CHECKS, SCAN_EXTS, SOURCE_CHECKS, SYNTAX_CHECKS, type Direction, type ScanFinding } from "../checks.js";
import { scanPages } from "./page-scan.js";

const DEFAULT_WIDTHS = [320, 390, 1280];
const isUrl = (t: string): boolean => /^(?:https?|file):\/\//.test(t);

const SKIP_DIRS = new Set(["node_modules", "dist", "build", "out", "coverage", "vendor", ".next", ".nuxt", ".svelte-kit", ".output"]);
const MAX_BYTES = 512 * 1024;

/** A file ryux-core asked for, by the path it named (relative to the working directory), when it exists. */
function readOne(path: string): RawSource | undefined {
  const full = resolve(process.cwd(), path);
  if (!existsSync(full) || !statSync(full).isFile() || statSync(full).size > MAX_BYTES) return undefined;
  return { path, raw: readFileSync(full, "utf8") };
}

const scannable = (path: string): boolean =>
  SCAN_EXTS.includes(path.slice(path.lastIndexOf(".") + 1).toLowerCase()) && !/\.(?:min\.\w+|d\.ts)$/.test(path);

async function walk(dir: string, out: string[]): Promise<void> {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    if (entry.name.startsWith(".") || SKIP_DIRS.has(entry.name)) continue;
    const full = join(dir, entry.name);
    if (entry.isDirectory()) await walk(full, out);
    else if (entry.isFile() && scannable(full)) out.push(full);
  }
}

const MAX_PEERS = 2000;

/** The app an edited file belongs to: the nearest folder above it with a package.json, or the working directory. */
function appRoot(file: string): string {
  const cwd = process.cwd();
  let dir = resolve(file, "..");
  while (dir.startsWith(cwd)) {
    if (existsSync(join(dir, "package.json"))) return dir;
    const up = resolve(dir, "..");
    if (up === dir) break;
    dir = up;
  }
  return cwd;
}

/** The other .jsx and .tsx files in the apps the edited files belong to, so a hook scan of one file can see a
 *  control copied from another file or a component it bypasses. At most MAX_PEERS files. */
async function peersOf(edited: string[]): Promise<RawSource[]> {
  const jsx = edited.filter((f) => /\.(?:jsx|tsx)$/i.test(f));
  if (!jsx.length) return [];
  const mine = new Set(edited.map((f) => resolve(f)));
  const out: RawSource[] = [];
  for (const root of new Set(jsx.map(appRoot))) {
    const files: string[] = [];
    await walk(root, files);
    for (const f of files) {
      if (out.length >= MAX_PEERS) return out;
      if (!/\.(?:jsx|tsx)$/i.test(f) || mine.has(resolve(f)) || statSync(f).size > MAX_BYTES) continue;
      out.push({ path: relative(process.cwd(), f) || f, raw: await readFile(f, "utf8") });
    }
  }
  return out;
}

/** The Components field of the project context in DESIGN.md (the app's own, else the working directory's): what the
 *  user chose for controls written again. Undefined when no DESIGN.md has the field. */
export function componentsChoice(near?: string): string | undefined {
  const dirs = [...new Set([near ? appRoot(near) : process.cwd(), process.cwd()])];
  for (const dir of dirs) {
    const path = join(dir, "DESIGN.md");
    if (!existsSync(path)) continue;
    const line = readFileSync(path, "utf8").match(/^- \*\*Components\*\*:(.*)$/m);
    if (line) return line[1].trim();
  }
  return undefined;
}

async function scanPaths(paths: string[], skip: Set<string>, design?: Direction, peers?: RawSource[], components = componentsChoice(paths[0])): Promise<{ files: number; findings: ScanFinding[]; sources: RawSource[] }> {
  const files: string[] = [];
  let folder = false;
  for (const p of paths) {
    if (statSync(p).isDirectory()) {
      folder = true;
      await walk(p, files);
    } else if (scannable(p)) files.push(p);
  }
  const sources: RawSource[] = [];
  for (const f of files) {
    if (statSync(f).size > MAX_BYTES) continue;
    sources.push({ path: relative(process.cwd(), f) || f, raw: await readFile(f, "utf8") });
  }
  return { files: sources.length, findings: scanReading(sources, { folder, skip, design, peers, components }, readOne), sources };
}

/** Every file a folder scan reads, as sources (the inventory and its verify read the same tree). */
export async function readTree(dir: string): Promise<RawSource[]> {
  const files: string[] = [];
  await walk(dir, files);
  const out: RawSource[] = [];
  for (const f of files) if (statSync(f).size <= MAX_BYTES) out.push({ path: relative(process.cwd(), f) || f, raw: await readFile(f, "utf8") });
  return out;
}

/** The RX-DS-01 copy findings in a folder: each file's first copy of a control written again elsewhere. */
export async function componentCopies(dir: string): Promise<{ files: number; copies: ScanFinding[] }> {
  // read as undecided, so a project that chose "later" still sees what it put off
  const { findings } = await scanPaths([dir], new Set(), undefined, undefined, "");
  return { files: new Set(findings.filter((f) => f.rule === "RX-DS-01").map((f) => f.file)).size, copies: findings.filter((f) => f.rule === "RX-DS-01" && / is written \d+ times /.test(f.message)) };
}

const title = (id: string): string => RULES.find((r) => r.id === id)?.title ?? "";

function listRules(json: boolean): void {
  if (json) {
    const entry = (d: { rule: string; level: string; looksFor: string; folder?: boolean }, kind: string) => ({ rule: d.rule, title: title(d.rule), level: d.level, kind, looksFor: d.looksFor, folderOnly: Boolean(d.folder) });
    console.log(JSON.stringify([...SOURCE_CHECKS.map((d) => entry(d, "source")), ...SYNTAX_CHECKS.map((d) => entry(d, "syntax")), ...RENDER_CHECKS.map((d) => entry(d, "render"))], null, 2));
    return;
  }
  const row = (d: { rule: string; level: string; looksFor: string; folder?: boolean }): void => {
    console.log(`${d.level === "fail" ? pc.red("fail") : d.level === "note" ? pc.cyan("note") : pc.yellow("warn")}  ${d.rule.padEnd(11)} ${title(d.rule)}`);
    console.log(`      ${d.looksFor}${d.folder ? " (folder scans only)" : ""}`);
  };
  console.log(`ryux scan v${VERSION}: checks for rules a machine can see. No LLM.\n\nSource files (${SOURCE_CHECKS.length}):`);
  SOURCE_CHECKS.forEach(row);
  console.log(`\nJSX and TSX, read as a syntax tree (${SYNTAX_CHECKS.length}):`);
  SYNTAX_CHECKS.forEach(row);
  console.log(`\nRendered pages, for a URL (${RENDER_CHECKS.length}; needs Playwright in the project; widths ${DEFAULT_WIDTHS.join(", ")} unless --widths):`);
  RENDER_CHECKS.forEach(row);
  console.log(`\nfail: wrong wherever it appears, exit 1. warn: worth a look, exit 0.
Not checked: a judgment call, which belongs to Critique.`);
}

/** Read the PostToolUse payload Claude Code sends on stdin and return the edited file, if any. */
/** The files an agent just edited, from its hook payload on stdin. Claude Code and Cursor name the file in
 *  tool_input (Cursor's afterFileEdit at the top level); Codex's apply_patch carries the patch text, whose
 *  "*** Add File:", "*** Update File:", and "*** Move to:" lines name the files, relative to its cwd. */
async function hookFiles(): Promise<string[]> {
  let input = "";
  for await (const chunk of process.stdin) input += chunk;
  try {
    const payload = JSON.parse(input) as { cwd?: string; file_path?: string; tool_input?: Record<string, unknown> | string };
    const tool = typeof payload.tool_input === "object" && payload.tool_input ? payload.tool_input : {};
    const named = [payload.file_path, tool.file_path, tool.path, tool.target_file].find((v): v is string => typeof v === "string");
    if (named) return [resolve(payload.cwd ?? ".", named)];
    const patch = [tool.command, tool.input, tool.patch, payload.tool_input].find((v): v is string => typeof v === "string") ?? "";
    const files = [...patch.matchAll(/^\*\*\* (?:Add File|Update File|Move to): (.+)$/gm)].map((m) => resolve(payload.cwd ?? ".", m[1].trim()));
    return [...new Set(files)];
  } catch {
    return [];
  }
}

/** Motion notes: places that change with a cut where a short transition would help. Not faults; the agent lists
 *  them at the end and asks whether to build them. At most five shown, the rest counted. */
function motionReport(notes: ScanFinding[]): string {
  if (!notes.length) return "";
  const level = (n: ScanFinding) => (/^motion (L\d)/.exec(n.message)?.[1] ?? "L?");
  const by = new Map<string, number>();
  for (const n of notes) by.set(level(n), (by.get(level(n)) ?? 0) + 1);
  const kinds = [...by.entries()].sort().map(([k, v]) => `${v} ${k}`).join(", ");
  const lines = [`\nMotion: ${notes.length} place${notes.length === 1 ? "" : "s"} could move (${kinds}). Not a fault: list them for the person and ask whether to build them.`];
  for (const n of notes.slice(0, 5)) lines.push(`${pc.cyan("~")} ${n.file}:${n.line}:${n.column} ${n.rule} ${n.message}`);
  if (notes.length > 5) lines.push(`  and ${notes.length - 5} more (--json lists all).`);
  return lines.join("\n");
}

function report(findings: ScanFinding[], files: number, pages = 0): string {
  const mark = { fail: pc.red("✗"), warn: pc.yellow("!"), note: pc.cyan("~") };
  const lines = findings.map((f) =>
    f.width ? `${mark[f.level]} ${f.file} @${f.width}px ${f.rule} ${f.message} [${f.selector}]` : `${mark[f.level]} ${f.file}:${f.line}:${f.column} ${f.rule} ${f.message}`,
  );
  const fails = findings.filter((f) => f.level === "fail").length;
  const warns = findings.length - fails;
  const what = [files || !pages ? `${files} file${files === 1 ? "" : "s"}` : "", pages ? `${pages} page${pages === 1 ? "" : "s"}` : ""].filter(Boolean).join(" and ");
  lines.push(`${lines.length ? "\n" : ""}${what} scanned: ${fails} fail, ${warns} warn.`);
  if (findings.length) lines.push("Fix them all in one pass, then run this scan once more to confirm; a scan after each small fix only repeats this list.");
  return lines.join("\n");
}

export async function runScan(argv: string[]): Promise<void> {
  const paths: string[] = [];
  const skip = new Set<string>();
  const opts = { json: false, hook: false, list: false };
  let hookFormat = "claude";
  let designFile: string | null = null;
  let widths = DEFAULT_WIDTHS;
  let sheet: string | undefined;
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--json") opts.json = true;
    else if (a === "--hook") {
      opts.hook = true;
      if (["claude", "codex", "cursor", "opencode"].includes(argv[i + 1] ?? "")) hookFormat = argv[++i];
    }
    else if (a === "--list-rules") opts.list = true;
    else if (a === "--sheet") sheet = argv[i + 1]?.endsWith(".png") ? argv[++i] : "ryux-scan-sheet.png";
    else if (a === "--design") designFile = argv[i + 1]?.endsWith(".md") ? argv[++i] : "DESIGN.md";
    else if (a === "--widths") {
      widths = (argv[++i] ?? "").split(",").map(Number);
      if (!widths.length || widths.some((w) => !Number.isInteger(w) || w < 200 || w > 3840)) {
        console.error("--widths takes CSS pixel widths from 200 to 3840, e.g. --widths 320,390,1280");
        process.exitCode = 2;
        return;
      }
    } else if (a === "--ignore") (argv[++i] ?? "").split(",").filter(Boolean).forEach((id) => skip.add(id.trim()));
    else if (a.startsWith("--")) {
      console.error(`Unknown option for scan: ${a}`);
      process.exitCode = 2;
      return;
    } else paths.push(a);
  }
  if (opts.list) return listRules(opts.json);

  // --design: read the direction once; a missing file or block is an error, not a silent pass
  let design: Direction | undefined;
  if (designFile) {
    const md = existsSync(designFile) ? await readFile(designFile, "utf8") : null;
    const dir = md === null ? null : readDirection(md);
    if (!dir) {
      if (opts.hook) return;
      console.error(md === null ? `Not found: ${designFile}` : `${designFile} has no direction: block under "## Visual and motion language", so there is nothing to compare the code with.`);
      process.exitCode = 2;
      return;
    }
    design = dir;
  }

  if (opts.hook) {
    // A hook must never block an edit by crashing: anything unexpected ends quietly with exit 0.
    // the real path, so a file named through a symlink (/var for /private/var) is the same file its app holds
    const files = (await hookFiles()).filter((f) => existsSync(f) && scannable(f)).map((f) => realpathSync(f));
    if (!files.length) return;
    const findings = (await scanPaths(files, skip, design, await peersOf(files))).findings.filter((f) => f.level !== "note");
    if (!findings.length) return;
    const message = `RYUX scan found ${findings.length} issue${findings.length === 1 ? "" : "s"} in the file${files.length === 1 ? "" : "s"} you just edited. Fix each fail; for each warn, fix it or add a ryux-ignore comment with the reason.\n${report(findings, files.length)}`;
    // Claude Code shows stderr to the agent on exit 2. Codex and Cursor read context from JSON on stdout
    // and keep the edit's own result.
    if (hookFormat === "codex") console.log(JSON.stringify({ hookSpecificOutput: { hookEventName: "PostToolUse", additionalContext: message } }));
    else if (hookFormat === "cursor") console.log(JSON.stringify({ additional_context: message }));
    // The OpenCode plugin adds stdout to the tool result the model reads.
    else if (hookFormat === "opencode") console.log(message);
    else {
      console.error(message);
      process.exitCode = 2;
    }
    return;
  }

  const urls = paths.filter(isUrl);
  const local = paths.filter((t) => !isUrl(t));
  const targets = local.length || urls.length ? local : ["."];
  const missing = targets.filter((t) => !existsSync(t));
  if (missing.length) {
    console.error(`Not found: ${missing.join(", ")}`);
    process.exitCode = 2;
    return;
  }
  const scanned = targets.length ? await scanPaths(targets, skip, design) : { files: 0, findings: [] as ScanFinding[], sources: [] as RawSource[] };
  const { files, sources } = scanned;
  const findings = scanned.findings.filter((f) => f.level !== "note");
  const motion = scanned.findings.filter((f) => f.level === "note");
  const drift = design && designFile ? { file: designFile, read: { colours: design.colours.length, fonts: design.fonts, radius: design.radius, durations: design.durations }, notRead: design.unread, unused: unused(sources, design) } : undefined;
  let ignored: { url: string; regions: string[] }[] = [];
  if (urls.length) {
    try {
      const pages = await scanPages(urls, widths, sheet);
      findings.push(...pages.findings.filter((f) => !skip.has(f.rule)));
      ignored = pages.ignored;
    } catch (err) {
      console.error(err instanceof Error ? err.message : err);
      process.exitCode = 1;
      return;
    }
  }
  const ok = !findings.some((f) => f.level === "fail");
  if (!ok) process.exitCode = 1;
  if (opts.json) {
    console.log(JSON.stringify({ ok, cli: VERSION, files, pages: urls.length, widths: urls.length ? widths : [], ...(sheet && urls.length ? { sheet } : {}), ...(drift ? { design: drift } : {}), ...(ignored.length ? { ignored } : {}), findings, motion }, null, 2));
    return;
  }
  console.log(report(findings, files, urls.length));
  if (sheet && urls.length) console.log(`Contact sheet: ${sheet} (every width in one image, default state). Inspect it instead of one screenshot per width.`);
  else if (urls.length) console.log("Add --sheet to get every width in one image to inspect.");
  const moves = motionReport(motion);
  if (moves) console.log(moves);
  for (const i of ignored) {
    console.log(`Not measured in ${i.url}: ${i.regions.join(", ")} (marked data-ryux-ignore as prototype controls).`);
  }
  if (drift) {
    const r = drift.read;
    const lines = [`\nDesign drift against ${drift.file}: ${r.colours} colours, ${r.fonts.length} type families${r.radius ? `, radius ${r.radius.join("/")}` : ""}${r.durations ? `, durations ${r.durations.join("/")}ms` : ""}.`];
    if (drift.notRead.length) lines.push(`Not checked: ${drift.notRead.join("; ")}.`);
    if (drift.unused.colours.length || drift.unused.fonts.length) lines.push(`In DESIGN.md but used by no scanned file: ${[...drift.unused.colours, ...drift.unused.fonts].join(", ")}.`);
    console.log(lines.join("\n"));
  }
}
