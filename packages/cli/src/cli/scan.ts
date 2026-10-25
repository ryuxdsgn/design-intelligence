// `ryux scan`: run the deterministic detectors (../scan.ts) over files and folders, measure rendered
// pages given as URLs (./page-scan.ts), or check the file an agent just edited (--hook, fed by a
// Claude Code PostToolUse hook on stdin).
import { existsSync, statSync } from "node:fs";
import { readFile, readdir } from "node:fs/promises";
import { join, relative } from "node:path";
import pc from "picocolors";
import { RULES } from "../intelligence/content.js";
import { VERSION } from "../product.js";
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

async function scanPaths(paths: string[], skip: Set<string>): Promise<{ files: number; findings: ScanFinding[] }> {
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
  return { files: sources.length, findings: scanSources(sources, { folder, skip }) };
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
  let widths = DEFAULT_WIDTHS;
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--json") opts.json = true;
    else if (a === "--hook") opts.hook = true;
    else if (a === "--list-rules") opts.list = true;
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

  if (opts.hook) {
    // A hook must never block an edit by crashing: anything unexpected ends quietly with exit 0.
    const file = await hookFile();
    if (!file || !existsSync(file) || !scannable(file)) return;
    const { findings } = await scanPaths([file], skip);
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
  const { files, findings } = targets.length ? await scanPaths(targets, skip) : { files: 0, findings: [] };
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
    console.log(JSON.stringify({ ok, cli: VERSION, files, pages: urls.length, widths: urls.length ? widths : [], findings }, null, 2));
    return;
  }
  console.log(report(findings, files, urls.length));
}
