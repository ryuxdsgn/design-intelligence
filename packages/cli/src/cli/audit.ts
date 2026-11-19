import { spawnSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { basename, dirname, extname, join, resolve } from "node:path";
import { audit } from "../engine.js";
import { figcraftCanvas } from "../figcraft-doc.js";
import { figmaExtract } from "../figma-audit.js";

/** Reads a design file: a .json (the Figma script's extract, or a FigCraft document from `figcraft-cli convert`),
 *  or a .figcraft converted here with figcraft-cli. */
export function readDesign(file: string): Record<string, unknown> {
  const path = resolve(file);
  if (extname(path).toLowerCase() === ".json") return JSON.parse(readFileSync(path, "utf8"));
  if (extname(path).toLowerCase() !== ".figcraft") throw new Error(`audit reads the .json the Figma script returns, a .figcraft file, or the .json figcraft-cli converts it to, not ${basename(path)}`);
  const dir = mkdtempSync(join(tmpdir(), "ryux-audit-"));
  try {
    const out = join(dir, "doc.json");
    const cli = process.env.FIGCRAFT_CLI || "figcraft-cli";
    const run = spawnSync(cli, ["convert", path, out, "--automation-read-root", dirname(path), "--automation-write-root", dir], { encoding: "utf8" });
    if (run.error) throw new Error(`could not run ${cli} (${run.error.message}); install FigCraft's CLI, or convert the file to .json and pass that`);
    if (run.status !== 0) throw new Error(`${cli} convert failed: ${(run.stderr || run.stdout).trim()}`);
    return JSON.parse(readFileSync(out, "utf8"));
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

/** The Figma script's extract: pages as objects with children. A FigCraft document lists page ids and a node map. */
const isExtract = (doc: Record<string, unknown>): boolean =>
  !("nodes" in doc) && (typeof doc.error === "string" || (Array.isArray(doc.pages) && doc.pages.every((p) => p && typeof p === "object" && Array.isArray((p as { children?: unknown }).children))));

/** `ryux audit <file> [--page name] [--json]`: the canvas audit on a Figma extract or a FigCraft file. Exit 1 on a fail. */
export async function runAudit(args: string[]): Promise<void> {
  const file = args.find((a, i) => !a.startsWith("--") && args[i - 1] !== "--page");
  const pi = args.indexOf("--page");
  const page = pi >= 0 ? args[pi + 1] || "" : "";
  if (!file) {
    console.error("Usage: ryux audit <canvas.json | file.figcraft | file.json> [--page <name>] [--json]");
    process.exitCode = 2;
    return;
  }
  const doc = readDesign(file);
  const figma = isExtract(doc);
  let canvas: Record<string, unknown>;
  if (figma) {
    if (page && !doc.error && page !== doc.page) {
      console.error(`${basename(file)} holds the page "${String(doc.page)}" only: set PAGE = "${page}" in the Figma script and run it again`);
      process.exitCode = 2;
      return;
    }
    canvas = doc;
  } else canvas = await figmaExtract(figcraftCanvas(doc), page);
  const result = canvas.error ? { error: canvas.error } : audit(canvas);
  if (!figma && typeof result.gate === "string") result.gate = result.gate.replace(/^figma audit/, "figcraft audit");
  const findings: { level: string; rule: string; frame: string; node: string; message: string }[] = result.findings || [];
  if (args.includes("--json")) console.log(JSON.stringify(result, null, 2));
  else if (result.error) console.error(result.error);
  else {
    for (const f of findings) console.log(`${f.level.padEnd(4)} ${f.rule.padEnd(11)} ${f.frame}${f.node ? ` / ${f.node}` : ""}: ${f.message}`);
    if (result.more) console.log(`... and ${result.more} more`);
    console.log(`\n${result.gate}`);
  }
  if (result.error) process.exitCode = 2;
  else if (findings.some((f) => f.level === "fail")) process.exitCode = 1;
}
