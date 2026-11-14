// The opt-in hook that runs `ryux scan --hook` after an agent edits a file, for the agents whose hooks can
// hand the result back to the model: Claude Code (.claude/settings.json), Codex (.codex/hooks.json), and
// Cursor (.cursor/hooks.json). Only the RYUX entry is added, updated, or removed; the rest of the file stays.
import { join } from "node:path";
import { CLI_CMD, VERSION } from "../product.js";
import { readIfExists, writeFileEnsured } from "./fsutil.js";

export type HookAgent = "claude" | "codex" | "cursor";

interface Spec {
  file: string;
  event: string;
  matcher: string;
  /** How `scan --hook` answers this agent: exit 2 + stderr (claude), or JSON context on stdout. */
  format: "" | " codex" | " cursor";
  /** Cursor keeps the command on the entry itself, with a top-level version; the others nest a hooks list. */
  flat?: boolean;
}

export const HOOK_SPECS: Record<HookAgent, Spec> = {
  claude: { file: ".claude/settings.json", event: "PostToolUse", matcher: "Edit|MultiEdit|Write", format: "" },
  codex: { file: ".codex/hooks.json", event: "PostToolUse", matcher: "apply_patch", format: " codex" },
  cursor: { file: ".cursor/hooks.json", event: "postToolUse", matcher: "Write|Edit", format: " cursor", flat: true },
};
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

export async function hasHook(root: string, agent: HookAgent): Promise<boolean> {
  const s = await read(root, agent);
  return Boolean(s && ours(s, agent).length);
}

/** The agents in this project that already have the RYUX scan hook. */
export async function hookAgents(root: string): Promise<HookAgent[]> {
  const found: HookAgent[] = [];
  for (const a of HOOK_AGENTS) if (await hasHook(root, a)) found.push(a);
  return found;
}

/** Add the hook, or move an existing one to this version. Throws when the file is not valid JSON,
 *  so a file we cannot read is never overwritten. */
export async function installHook(root: string, agent: HookAgent): Promise<string> {
  const spec = HOOK_SPECS[agent];
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
export async function removeHook(root: string, agent: HookAgent): Promise<boolean> {
  const spec = HOOK_SPECS[agent];
  const s = await read(root, agent);
  if (!s || !ours(s, agent).length) return false;
  const kept = s.hooks![spec.event]!.filter((e) => !ours(s, agent).includes(e));
  if (kept.length) s.hooks![spec.event] = kept;
  else delete s.hooks![spec.event];
  if (!Object.keys(s.hooks!).length) delete s.hooks;
  await writeFileEnsured(join(root, spec.file), `${JSON.stringify(s, null, 2)}\n`);
  return true;
}
