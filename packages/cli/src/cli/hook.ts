// The opt-in hook that runs `ryux scan --hook` after an agent edits a file, for the agents whose hooks can
// hand the result back to the model: Claude Code (.claude/settings.json), Codex (.codex/hooks.json), and
// Cursor (.cursor/hooks.json), where only the RYUX entry is added, updated, or removed and the rest of the
// file stays; and OpenCode, whose hook is a plugin file RYUX owns (.opencode/plugins/ryux-scan.js).
import { join } from "node:path";
import { CLI_CMD, VERSION } from "../product.js";
import { readIfExists, removePath, writeFileEnsured } from "./fsutil.js";

export type HookAgent = "claude" | "codex" | "cursor" | "opencode";

interface Spec {
  file: string;
  event: string;
  matcher: string;
  /** How `scan --hook` answers this agent: exit 2 + stderr (claude), or JSON context on stdout. */
  format: "" | " codex" | " cursor" | " opencode";
  /** Cursor keeps the command on the entry itself, with a top-level version; the others nest a hooks list. */
  flat?: boolean;
}

export const HOOK_SPECS: Record<HookAgent, Spec> = {
  claude: { file: ".claude/settings.json", event: "PostToolUse", matcher: "Edit|MultiEdit|Write", format: "" },
  codex: { file: ".codex/hooks.json", event: "PostToolUse", matcher: "apply_patch", format: " codex" },
  cursor: { file: ".cursor/hooks.json", event: "postToolUse", matcher: "Write|Edit", format: " cursor", flat: true },
  opencode: { file: ".opencode/plugins/ryux-scan.js", event: "", matcher: "", format: " opencode" },
};
// OpenCode reads global plugins from ~/.config/opencode/plugins, not ~/.opencode.
const OPENCODE_GLOBAL = ".config/opencode/plugins/ryux-scan.js";
export const hookFile = (agent: HookAgent, global = false): string => (agent === "opencode" && global ? OPENCODE_GLOBAL : HOOK_SPECS[agent].file);

/** The OpenCode plugin. It speaks both plugin APIs: setup() with ctx.tool.hook("execute.after") for 2.x,
 *  where text added to result.content reaches the model (checked in OpenCode 2.2.7), and server() with
 *  "tool.execute.after" for 1.x, where it is appended to the tool output. */
const opencodePlugin = (agent: HookAgent): string => `// RYUX scan hook for OpenCode, written by \`ryux install --hook\` (${VERSION}).
// \`ryux update\` rewrites this file and \`ryux remove\` deletes it; edits here are not kept.
import { spawn } from "node:child_process";
import { resolve } from "node:path";

const COMMAND = ${JSON.stringify(command(agent))};
const EDITS = new Set(["write", "edit", "multiedit", "patch", "apply_patch"]);

function files(cwd, input = {}, result = {}) {
  const out = result.output && typeof result.output === "object" ? result.output : {};
  const named = [input.path, input.filePath, input.file_path, out.target, ...(Array.isArray(out.files) ? out.files.map((f) => f && f.file) : [])];
  return [...new Set(named.filter((f) => typeof f === "string" && f).map((f) => resolve(cwd, f)))];
}

function scan(cwd, file) {
  return new Promise((done) => {
    const child = spawn(COMMAND, { cwd, shell: true, stdio: ["pipe", "pipe", "ignore"] });
    let text = "";
    child.stdout.on("data", (d) => (text += d));
    child.on("error", () => done(""));
    child.on("close", () => done(text.trim()));
    child.stdin.end(JSON.stringify({ cwd, file_path: file }));
  });
}

async function report(cwd, tool, input, result) {
  if (!EDITS.has(tool)) return "";
  const found = [];
  for (const file of files(cwd, input, result)) {
    const text = await scan(cwd, file);
    if (text) found.push(text);
  }
  return found.join("\\n\\n");
}

export default {
  id: "ryux-scan",
  async setup(ctx) {
    const cwd = (ctx.location && ctx.location.directory) || process.cwd();
    ctx.tool.hook("execute.after", async (event) => {
      if (event.status !== "completed" || !event.result) return;
      const text = await report(cwd, event.tool, event.input, event.result);
      if (text) event.result = { ...event.result, content: [...(event.result.content || []), { type: "text", text }] };
    });
  },
  async server(input) {
    const cwd = (input && input.directory) || process.cwd();
    return {
      "tool.execute.after": async (call, output) => {
        const text = await report(cwd, call.tool, call.args, {});
        if (text && output && typeof output.output === "string") output.output += "\\n\\n" + text;
      },
    };
  },
};
`;
export const HOOK_AGENTS = Object.keys(HOOK_SPECS) as HookAgent[];

// Pinned to this version so every edit runs the same detectors; `update` moves the pin.
const command = (agent: HookAgent): string => `${CLI_CMD.replace("npx ", "npx -y ")}@${VERSION} scan --hook${HOOK_SPECS[agent].format}`;
const isOurs = (c: unknown): boolean => typeof c === "string" && c.includes("@ryuxdsgn/design-intelligence") && c.includes("scan --hook");

interface HookEntry {
  matcher?: string;
  command?: string;
  hooks?: { type?: string; command?: string }[];
}
type Settings = { version?: number; hooks?: Record<string, HookEntry[]> } & Record<string, unknown>;

const commands = (e: HookEntry): (string | undefined)[] => [e.command, ...(e.hooks ?? []).map((h) => h.command)];

async function read(root: string, agent: HookAgent): Promise<Settings | null> {
  const raw = await readIfExists(join(root, HOOK_SPECS[agent].file));
  if (raw === null) return {};
  try {
    return JSON.parse(raw) as Settings;
  } catch {
    return null;
  }
}

const ours = (s: Settings, agent: HookAgent): HookEntry[] => (s.hooks?.[HOOK_SPECS[agent].event] ?? []).filter((e) => commands(e).some(isOurs));

export async function hasHook(root: string, agent: HookAgent, global = false): Promise<boolean> {
  if (agent === "opencode") return isOurs((await readIfExists(join(root, hookFile(agent, global))))?.match(/const COMMAND = (".*");/)?.[1]);
  const s = await read(root, agent);
  return Boolean(s && ours(s, agent).length);
}

/** The agents in this project that already have the RYUX scan hook. */
export async function hookAgents(root: string, global = false): Promise<HookAgent[]> {
  const found: HookAgent[] = [];
  for (const a of HOOK_AGENTS) if (await hasHook(root, a, global)) found.push(a);
  return found;
}

/** Add the hook, or move an existing one to this version. Throws when the file is not valid JSON,
 *  so a file we cannot read is never overwritten. */
export async function installHook(root: string, agent: HookAgent, global = false): Promise<string> {
  const spec = HOOK_SPECS[agent];
  if (agent === "opencode") {
    const path = join(root, hookFile(agent, global));
    const had = await hasHook(root, agent, global);
    if ((await readIfExists(path)) === opencodePlugin(agent)) return `${hookFile(agent, global)} (scan hook already present)`;
    if (!had && (await readIfExists(path)) !== null) throw new Error(`${hookFile(agent, global)} exists and is not RYUX's; move it, then run this again`);
    await writeFileEnsured(path, opencodePlugin(agent));
    return `${hookFile(agent, global)} (scan hook ${had ? "updated" : "added"})`;
  }
  const s = await read(root, agent);
  if (!s) throw new Error(`${spec.file} is not valid JSON; fix it, then run this again`);
  const existing = ours(s, agent);
  if (existing.some((e) => commands(e).includes(command(agent)))) return `${spec.file} (scan hook already present)`;
  const kept = (s.hooks?.[spec.event] ?? []).filter((e) => !existing.includes(e));
  const entry: HookEntry = spec.flat ? { matcher: spec.matcher, command: command(agent) } : { matcher: spec.matcher, hooks: [{ type: "command", command: command(agent) }] };
  s.hooks = { ...s.hooks, [spec.event]: [...kept, entry] };
  const out = spec.flat ? { ...s, version: s.version ?? 1 } : s;
  await writeFileEnsured(join(root, spec.file), `${JSON.stringify(out, null, 2)}\n`);
  return `${spec.file} (scan hook ${existing.length ? "updated" : "added"})`;
}

/** Remove the RYUX entry and any hook lists it leaves empty. True when something was removed. */
export async function removeHook(root: string, agent: HookAgent, global = false): Promise<boolean> {
  const spec = HOOK_SPECS[agent];
  if (agent === "opencode") return (await hasHook(root, agent, global)) && removePath(join(root, hookFile(agent, global)));
  const s = await read(root, agent);
  if (!s || !ours(s, agent).length) return false;
  const kept = s.hooks![spec.event]!.filter((e) => !ours(s, agent).includes(e));
  if (kept.length) s.hooks![spec.event] = kept;
  else delete s.hooks![spec.event];
  if (!Object.keys(s.hooks!).length) delete s.hooks;
  await writeFileEnsured(join(root, spec.file), `${JSON.stringify(s, null, 2)}\n`);
  return true;
}
