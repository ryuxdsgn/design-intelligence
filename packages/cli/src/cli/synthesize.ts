// `ryux synthesize check [synthesis.md]`: does a research synthesis stand on its raw data? It reads the synthesis,
// reads every text file its Data table names (relative to the synthesis), and asks ryux-core: each quote word for
// word in that participant's data, each "n of N" counted right, no participant outside the table, every theme backed.
// Nothing is sent anywhere; the raw data stays on this machine.
import { existsSync, readFileSync } from "node:fs";
import { dirname, extname, join } from "node:path";
import { synthCheck } from "../engine.js";

const TEXT = new Set([".md", ".txt", ".csv", ".tsv", ".vtt", ".srt", ".json"]);

/** The file cells of the synthesis's Data table, as written. */
export function dataFiles(synthesis: string): string[] {
  const files = new Set<string>();
  let inData = false;
  for (const line of synthesis.split("\n")) {
    const t = line.trim();
    if (t.startsWith("## ")) inData = /^## (data|sumber|inventor)/i.test(t);
    if (!inData || !t.startsWith("|") || t.includes("---")) continue;
    for (const cell of t.replace(/^\||\|$/g, "").split("|").map((c) => c.trim().replace(/^`|`$/g, ""))) {
      if (/[/.]/.test(cell) && extname(cell)) files.add(cell);
    }
  }
  return [...files];
}

export function runSynthesize(argv: string[]): void {
  const [sub, ...rest] = argv;
  if (sub !== "check") {
    console.log("Usage: ryux synthesize check [synthesis.md] [--json]");
    process.exitCode = 1;
    return;
  }
  const path = rest.find((a) => !a.startsWith("--")) ?? "synthesis.md";
  if (!existsSync(path)) {
    console.log(`✗ ${path} not found. Write the synthesis first (capabilities/analyze-research.md), or name its file.`);
    process.exitCode = 1;
    return;
  }
  const synthesis = readFileSync(path, "utf8");
  const files: Record<string, string> = {};
  const unread: string[] = [];
  for (const f of dataFiles(synthesis)) {
    const full = join(dirname(path), f);
    if (TEXT.has(extname(f).toLowerCase()) && existsSync(full)) files[f] = readFileSync(full, "utf8");
    else unread.push(f);
  }
  const r = synthCheck(synthesis, files);
  if (rest.includes("--json")) {
    console.log(JSON.stringify({ ...r, unread }, null, 2));
  } else {
    console.log(`${r.participants} participants, ${r.themes} themes, ${Object.keys(files).length} data files read`);
    for (const f of r.findings) console.log(`${f.level === "fail" ? "✗" : "!"} ${f.at}: ${f.message}`);
    if (unread.length) console.log(`  not read (a text copy is needed: .md, .txt, .csv, .vtt, .srt): ${unread.join(", ")}`);
    console.log(r.ok ? "✓ Every quote, count, and participant stands on the data." : "✗ Fix the lines above, then run it again.");
  }
  if (!r.ok) process.exitCode = 1;
}
