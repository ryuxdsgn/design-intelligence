// `ryux scan`: run the deterministic detectors (../scan.ts) over files and folders, measure rendered
// pages given as URLs (./page-scan.ts), or check the file an agent just edited (--hook, fed by a
// Claude Code PostToolUse hook on stdin).
import { existsSync, statSync } from "node:fs";
import { readFile, readdir } from "node:fs/promises";
import { join, relative } from "node:path";
import pc from "picocolors";
import { RULES } from "../intelligence/content.js";
import { VERSION } from "../product.js";
import { readDirection, unusedTokens, type Direction } from "../drift.js";
import { DETECTORS, RENDER_CHECKS, SCAN_EXTS, scanSources, toSource, type ScanFinding } from "../scan.js";
import { scanPages } from "./page-scan.js";

const DEFAULT_WIDTHS = [320, 390, 1280];
const isUrl = (t: string): boolean => /^(?:https?|file):\/\//.test(t);

const SKIP_DIRS = new Set(["node_modules", "dist", "build", "out", "coverage", "vendor", ".next", ".nuxt", ".svelte-kit", ".output"]);
const MAX_BYTES = 512 * 1024;

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

async function scanPaths(paths: string[], skip: Set<string>, design?: Direction): Promise<{ files: number; findings: ScanFinding[]; texts: string[] }> {
  const files: string[] = [];
  let folder = false;
  for (const p of paths) {
    if (statSync(p).isDirectory()) {
      folder = true;
      await walk(p, files);
    } else if (scannable(p)) files.push(p);
  }
  const sources = [];
  for (const f of files) {
    if (statSync(f).size > MAX_BYTES) continue;
    sources.push(toSource(relative(process.cwd(), f) || f, await readFile(f, "utf8")));
  }
  return { files: sources.length, findings: scanSources(sources, { folder, skip, design }), texts: sources.map((s) => s.text) };
}

const title = (id: string): string => RULES.find((r) => r.id === id)?.title ?? "";

function listRules(json: boolean): void {
  if (json) {
    const entry = (d: { rule: string; level: string; looksFor: string; folder?: boolean }, kind: string) => ({ rule: d.rule, title: title(d.rule), level: d.level, kind, looksFor: d.looksFor, folderOnly: Boolean(d.folder) });
    console.log(JSON.stringify([...DETECTORS.map((d) => entry(d, "source")), ...RENDER_CHECKS.map((d) => entry(d, "render"))], null, 2));
    return;
  }
  const row = (d: { rule: string; level: string; looksFor: string; folder?: boolean }): void => {
    console.log(`${d.level === "fail" ? pc.red("fail") : pc.yellow("warn")}  ${d.rule.padEnd(11)} ${title(d.rule)}`);
    console.log(`      ${d.looksFor}${d.folder ? " (folder scans only)" : ""}`);
  };
  console.log(`ryux scan v${VERSION}: checks for rules a machine can see. No LLM.\n\nSource files (${DETECTORS.length}):`);
  DETECTORS.forEach(row);
  console.log(`\nRendered pages, for a URL (${RENDER_CHECKS.length}; needs Playwright in the project; widths ${DEFAULT_WIDTHS.join(", ")} unless --widths):`);
  RENDER_CHECKS.forEach(row);
  console.log(`\nfail: wrong wherever it appears, exit 1. warn: worth a look, exit 0.
Not checked: a judgment call, which belongs to Critique.`);
}

/** Read the PostToolUse payload Claude Code sends on stdin and return the edited file, if any. */
async function hookFile(): Promise<string | null> {
  let input = "";
  for await (const chunk of process.stdin) input += chunk;
  try {
    const payload = JSON.parse(input) as { tool_input?: { file_path?: string } };
    return payload.tool_input?.file_path ?? null;
  } catch {
    return null;
  }
}

function report(findings: ScanFinding[], files: number, pages = 0): string {
  const mark = { fail: pc.red("✗"), warn: pc.yellow("!") };
  const lines = findings.map((f) =>
    f.width ? `${mark[f.level]} ${f.file} @${f.width}px ${f.rule} ${f.message} [${f.selector}]` : `${mark[f.level]} ${f.file}:${f.line}:${f.column} ${f.rule} ${f.message}`,
  );
  const fails = findings.filter((f) => f.level === "fail").length;
  const warns = findings.length - fails;
  const what = [files || !pages ? `${files} file${files === 1 ? "" : "s"}` : "", pages ? `${pages} page${pages === 1 ? "" : "s"}` : ""].filter(Boolean).join(" and ");
  lines.push(`${lines.length ? "\n" : ""}${what} scanned: ${fails} fail, ${warns} warn.`);
  return lines.join("\n");
}

export async function runScan(argv: string[]): Promise<void> {
  const paths: string[] = [];
  const skip = new Set<string>();
  const opts = { json: false, hook: false, list: false };
  let designFile: string | null = null;
  let widths = DEFAULT_WIDTHS;
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--json") opts.json = true;
    else if (a === "--hook") opts.hook = true;
    else if (a === "--list-rules") opts.list = true;
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
    const file = await hookFile();
    if (!file || !existsSync(file) || !scannable(file)) return;
    const { findings } = await scanPaths([file], skip, design);
    if (!findings.length) return;
    console.error(`RYUX scan found ${findings.length} issue${findings.length === 1 ? "" : "s"} in the file you just edited. Fix each fail; for each warn, fix it or add a ryux-ignore comment with the reason.\n${report(findings, 1)}`);
    process.exitCode = 2;
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
  const { files, findings, texts } = targets.length ? await scanPaths(targets, skip, design) : { files: 0, findings: [], texts: [] as string[] };
  const drift = design && designFile ? { file: designFile, read: { colours: design.colours.length, fonts: design.fonts, radius: design.radius, durations: design.durations }, notRead: design.unread, unused: unusedTokens(texts, design) } : undefined;
  if (urls.length) {
    try {
      findings.push(...(await scanPages(urls, widths)).filter((f) => !skip.has(f.rule)));
    } catch (err) {
      console.error(err instanceof Error ? err.message : err);
      process.exitCode = 1;
      return;
    }
  }
  const ok = !findings.some((f) => f.level === "fail");
  if (!ok) process.exitCode = 1;
  if (opts.json) {
    console.log(JSON.stringify({ ok, cli: VERSION, files, pages: urls.length, widths: urls.length ? widths : [], ...(drift ? { design: drift } : {}), findings }, null, 2));
    return;
  }
  console.log(report(findings, files, urls.length));
  if (drift) {
    const r = drift.read;
    const lines = [`\nDesign drift against ${drift.file}: ${r.colours} colours, ${r.fonts.length} type families${r.radius ? `, radius ${r.radius.join("/")}` : ""}${r.durations ? `, durations ${r.durations.join("/")}ms` : ""}.`];
    if (drift.notRead.length) lines.push(`Not checked: ${drift.notRead.join("; ")}.`);
    if (drift.unused.colours.length || drift.unused.fonts.length) lines.push(`In DESIGN.md but used by no scanned file: ${[...drift.unused.colours, ...drift.unused.fonts].join(", ")}.`);
    console.log(lines.join("\n"));
  }
}
