// `ryux report-check [file]`: does the reply's one-line gate count the same areas as its detail block?
// Reads a file or stdin. `--hook` is Claude Code's Stop hook: it reads the last assistant reply from the transcript
// and holds the stop (exit 2, reason on stderr) once on a mismatch; anything it cannot read lets the agent stop.
import { readFileSync } from "node:fs";
import { reportCheck } from "../engine.js";

const readStdin = (): string => {
  try {
    return readFileSync(0, "utf8");
  } catch {
    return "";
  }
};

/** The text of the last assistant message in a Claude Code transcript (JSONL). */
export function lastAssistantText(jsonl: string): string {
  let last = "";
  for (const line of jsonl.split("\n")) {
    let o: { type?: string; message?: { content?: unknown } };
    try {
      o = JSON.parse(line);
    } catch {
      continue;
    }
    if (o.type !== "assistant") continue;
    const c = o.message?.content;
    const text = typeof c === "string" ? c : Array.isArray(c) ? c.filter((p) => p?.type === "text").map((p) => p.text).join("\n") : "";
    if (text.trim()) last = text;
  }
  return last;
}

function hook(): void {
  let input: { transcript_path?: string; stop_hook_active?: boolean };
  try {
    input = JSON.parse(readStdin());
  } catch {
    return;
  }
  if (input.stop_hook_active || !input.transcript_path) return;
  let text: string;
  try {
    text = lastAssistantText(readFileSync(input.transcript_path, "utf8"));
  } catch {
    return;
  }
  const r = reportCheck(text);
  if (r.ok) return;
  process.stderr.write(`RYUX report check: ${r.message}\n`);
  process.exitCode = 2;
}

export function runReportCheck(argv: string[]): void {
  if (argv.includes("--hook")) return hook();
  const file = argv.find((a) => !a.startsWith("--"));
  const text = file ? readFileSync(file, "utf8") : readStdin();
  const r = reportCheck(text);
  if (argv.includes("--json")) console.log(JSON.stringify(r, null, 2));
  else if (r.ok) console.log(r.gate && r.detail ? "✓ The gate line matches the detail." : "✓ Nothing to compare: no gate line or no detail block.");
  else console.log(`✗ ${r.message}`);
  if (!r.ok) process.exitCode = 1;
}
