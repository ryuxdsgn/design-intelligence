// `ryux read-gate --hook`: Claude Code's PreToolUse hook. Before a RYUX run writes to a design canvas (Figma
// use_figma, pen.dev, FigCraft), it checks the transcript: has the run read each file in CANVAS_READS whole? If not,
// the call is held (exit 2, the files to read on stderr) and the agent reads them first. A session that never loaded
// RYUX, a read-only canvas call, or anything it cannot read lets the call through. The judgement runs in ryux-core.
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { readGate, type ReadGateInput } from "../engine.js";
import { CANVAS_READS } from "../intelligence/content.js";

// Figma Plugin API calls that change the file. A use_figma script without one of them only reads.
const FIGMA_WRITE = /figma\.create|\.appendChild\(|\.insertChild\(|setBoundVariable|combineAsVariants|createVariable|setValueForMode|\.remove\(\)|\.characters\s*=|\.resize\(|\.fills\s*=|\.strokes\s*=|\.name\s*=|setPluginData|importComponent/;
const FIGCRAFT_WRITE = /__(create_node|set_properties|run_command|batch|type_text|save_file)$/;

/** Is this tool call a write to a design canvas? */
export function canvasWrite(tool: string, input: Record<string, unknown>): boolean {
  if (/__use_figma$/.test(tool)) return FIGMA_WRITE.test(String(input.code ?? ""));
  if (/^mcp__pencil__execute$/.test(tool)) return true;
  if (/^mcp__figcraft__/.test(tool)) return FIGCRAFT_WRITE.test(tool);
  return false;
}

const lineCount = (path: string): number => {
  try {
    const text = readFileSync(path, "utf8");
    return text.endsWith("\n") ? text.split("\n").length - 1 : text.split("\n").length;
  } catch {
    return 0;
  }
};

type Part = { type?: string; name?: string; id?: string; input?: Record<string, unknown>; tool_use_id?: string; is_error?: boolean; content?: unknown };

/** What the run read, from a Claude Code transcript (JSONL): RYUX loaded or not, the skill folder, and each Read. */
export function readsFromTranscript(jsonl: string, tool: string, toolInput: Record<string, unknown>): ReadGateInput {
  const uses: Part[] = [];
  const failed = new Set<string>();
  let folder = "";
  let loaded = false;
  for (const line of jsonl.split("\n")) {
    let o: { message?: { content?: unknown } };
    try {
      o = JSON.parse(line);
    } catch {
      continue;
    }
    const c = o.message?.content;
    if (!Array.isArray(c)) continue;
    for (const p of c as Part[]) {
      if (p?.type === "tool_use") uses.push(p);
      if (p?.type === "tool_result") {
        if (p.is_error && p.tool_use_id) failed.add(p.tool_use_id);
        const text = typeof p.content === "string" ? p.content : Array.isArray(p.content) ? p.content.map((x: { text?: string }) => x?.text ?? "").join("\n") : "";
        const m = /Base directory for this skill: (\S+\/ryux)\b/.exec(text);
        if (m) folder = m[1];
      }
    }
  }
  const reads: ReadGateInput["reads"] = [];
  for (const u of uses) {
    if (u.name === "Skill" && /(^|:)ryux$/.test(String(u.input?.skill ?? ""))) loaded = true;
    if (u.name !== "Read" || (u.id && failed.has(u.id))) continue;
    const path = String(u.input?.file_path ?? "");
    const m = /^(.*\/ryux)\/((?:knowledge|capabilities)\/[\w-]+\.md|SKILL\.md)$/.exec(path);
    if (!m) continue;
    if (m[2] === "SKILL.md") loaded = true;
    if (!folder) folder = m[1];
    if (m[1] !== folder) continue;
    const start = Number(u.input?.offset ?? 1) || 1;
    const limit = Number(u.input?.limit ?? 2000) || 2000;
    reads.push({ path: m[2], lines: lineCount(path), ranges: [[start, start + limit - 1]] });
  }
  // A required file the run never opened still needs its length, so the message can name it.
  for (const r of CANVAS_READS) if (folder && !reads.some((x) => x.path === r)) reads.push({ path: r, lines: lineCount(join(folder, r)), ranges: [] });
  return { skillLoaded: loaded && Boolean(folder), write: canvasWrite(tool, toolInput), required: CANVAS_READS, reads };
}

const readStdin = (): string => {
  try {
    return readFileSync(0, "utf8");
  } catch {
    return "";
  }
};

export function runReadGate(argv: string[]): void {
  if (!argv.includes("--hook")) {
    console.log("ryux read-gate --hook: a Claude Code PreToolUse hook; install it with ryux install --hook.");
    return;
  }
  let input: { transcript_path?: string; tool_name?: string; tool_input?: Record<string, unknown> };
  try {
    input = JSON.parse(readStdin());
  } catch {
    return;
  }
  if (!input.transcript_path || !input.tool_name) return;
  let jsonl: string;
  try {
    jsonl = readFileSync(input.transcript_path, "utf8");
  } catch {
    return;
  }
  const r = readGate(readsFromTranscript(jsonl, input.tool_name, input.tool_input ?? {}));
  if (r.ok) return;
  process.stderr.write(`${r.message}\n`);
  process.exitCode = 2;
}

