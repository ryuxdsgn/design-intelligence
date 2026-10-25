// The opt-in Claude Code hook that runs `ryux scan --hook` after each Edit or Write. It lives in
// .claude/settings.json next to the user's own settings; only the RYUX entry is added, updated, or removed.
import { join } from "node:path";
import { CLI_CMD, VERSION } from "../product.js";
import { readIfExists, writeFileEnsured } from "./fsutil.js";

const SETTINGS = ".claude/settings.json";
const MATCHER = "Edit|MultiEdit|Write";
// Pinned to this version so every edit runs the same detectors; `update` moves the pin.
const command = (): string => `${CLI_CMD.replace("npx ", "npx -y ")}@${VERSION} scan --hook`;
const isOurs = (c: unknown): boolean => typeof c === "string" && c.includes("@ryuxdsgn/design-intelligence") && c.includes("scan --hook");

interface HookEntry {
  matcher?: string;
  hooks?: { type?: string; command?: string }[];
}
type Settings = { hooks?: Record<string, HookEntry[]> } & Record<string, unknown>;

async function read(root: string): Promise<Settings | null> {
  const raw = await readIfExists(join(root, SETTINGS));
  if (raw === null) return {};
  try {
    return JSON.parse(raw) as Settings;
  } catch {
    return null;
  }
}

const ours = (s: Settings): HookEntry[] => (s.hooks?.PostToolUse ?? []).filter((e) => e.hooks?.some((h) => isOurs(h.command)));

export async function hasHook(root: string): Promise<boolean> {
  const s = await read(root);
  return Boolean(s && ours(s).length);
}

/** Add the hook, or move an existing one to this version. Throws when settings.json is not valid JSON,
 *  so a file we cannot read is never overwritten. */
export async function installHook(root: string): Promise<string> {
  const s = await read(root);
  if (!s) throw new Error(`${SETTINGS} is not valid JSON; fix it, then run this again`);
  const existing = ours(s);
  if (existing.some((e) => e.hooks!.some((h) => h.command === command()))) return `${SETTINGS} (scan hook already present)`;
  const post = (s.hooks?.PostToolUse ?? []).filter((e) => !existing.includes(e));
  s.hooks = { ...s.hooks, PostToolUse: [...post, { matcher: MATCHER, hooks: [{ type: "command", command: command() }] }] };
  await writeFileEnsured(join(root, SETTINGS), `${JSON.stringify(s, null, 2)}\n`);
  return `${SETTINGS} (scan hook ${existing.length ? "updated" : "added"})`;
}

/** Remove the RYUX entry and any hook lists it leaves empty. True when something was removed. */
export async function removeHook(root: string): Promise<boolean> {
  const s = await read(root);
  if (!s || !ours(s).length) return false;
  const post = s.hooks!.PostToolUse!.filter((e) => !ours(s).includes(e));
  if (post.length) s.hooks!.PostToolUse = post;
  else delete s.hooks!.PostToolUse;
  if (!Object.keys(s.hooks!).length) delete s.hooks;
  await writeFileEnsured(join(root, SETTINGS), `${JSON.stringify(s, null, 2)}\n`);
  return true;
}
