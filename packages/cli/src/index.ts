#!/usr/bin/env node
import { existsSync, readdirSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
import * as p from "@clack/prompts";
import pc from "picocolors";
import {
  AGENT_TARGETS,
  AGENTS_MD_INLINE,
  ALL_INSTALLABLE_IDS,
  CLI_CMD,
  LEGACY_CURSOR_RULES_DIR,
  LEGACY_SKILL_DIRS,
  MARK_START,
  MCP_ADD_CMD,
  RULES_VERSION,
  type AgentTarget,
  type PointerFile,
} from "./content.js";
import { renderAgentsBlock, renderBundle, renderPointerBlock, SKILL_NAME } from "./render.js";
import { readIfExists, rel, removeBlock, removePath, upsertBlock, writeFileEnsured } from "./fsutil.js";

type Flags = Record<string, string | boolean>;

interface Scope {
  global: boolean;
  root: string;
}

const AGENT_IDS = [...AGENT_TARGETS.map((a) => a.id), AGENTS_MD_INLINE.id];
const targetDir = (a: AgentTarget, scope: Scope): string => join(scope.root, scope.global ? a.globalDir : a.dir);

/** Unique skill folders for the chosen agents (agents that share a folder are written once). */
function dirsFor(agentIds: string[], scope: Scope): string[] {
  const dirs = AGENT_TARGETS.filter((a) => agentIds.includes(a.id)).map((a) => targetDir(a, scope));
  return [...new Set(dirs)];
}

function pointersFor(agentIds: string[]): PointerFile[] {
  const files = AGENT_TARGETS.filter((a) => agentIds.includes(a.id)).map((a) => a.pointer);
  return [...new Set(files)];
}

async function removeLegacy(dir: string, root: string): Promise<string[]> {
  const done: string[] = [];
  for (const c of LEGACY_SKILL_DIRS) {
    const target = join(dir, `ryux-${c}`);
    if (await removePath(target)) done.push(`${rel(target)} (legacy)`);
  }
  const cursorRules = join(root, LEGACY_CURSOR_RULES_DIR);
  if (existsSync(cursorRules)) {
    for (const f of readdirSync(cursorRules)) {
      if (f.startsWith("ryux-") && f.endsWith(".mdc") && (await removePath(join(cursorRules, f)))) {
        done.push(`${rel(join(cursorRules, f))} (legacy)`);
      }
    }
  }
  return done;
}

/** Former per-skill folders (RYUX 1.x), removed when the single `ryux` skill is written. */
const OLD_SKILL_DIRS = ["core", ...ALL_INSTALLABLE_IDS].map((id) => `ryux-${id}`);

async function writeSkills(dir: string, root: string): Promise<string[]> {
  const done = await removeLegacy(dir, root);
  for (const name of OLD_SKILL_DIRS) if (await removePath(join(dir, name))) done.push(`${rel(join(dir, name))} (replaced)`);
  const skillDir = join(dir, SKILL_NAME);
  await removePath(skillDir);
  const files = renderBundle();
  for (const [path, content] of Object.entries(files)) await writeFileEnsured(join(skillDir, path), content);
  done.push(`${rel(skillDir)}/ (${Object.keys(files).length} files)`);
  return done;
}

async function install(agentIds: string[], scope: Scope): Promise<string[]> {
  const done: string[] = [];
  for (const dir of dirsFor(agentIds, scope)) done.push(...(await writeSkills(dir, scope.root)));
  if (scope.global) return done;

  const inline = agentIds.includes(AGENTS_MD_INLINE.id);
  for (const file of pointersFor(agentIds)) {
    if (file === "AGENTS.md" && inline) continue;
    await upsertBlock(join(scope.root, file), renderPointerBlock());
    done.push(`${file} (block)`);
  }
  if (inline) {
    await upsertBlock(join(scope.root, "AGENTS.md"), renderAgentsBlock());
    done.push("AGENTS.md (rules inline)");
  }
  return done;
}

const hasInstall = (dir: string): boolean =>
  existsSync(join(dir, SKILL_NAME, "SKILL.md")) || existsSync(join(dir, "ryux-core")) || existsSync(join(dir, "ryux-rules"));

/** Skill folders that already hold a RYUX install (the single skill, or the RYUX 1.x folders). */
function detectInstalled(scope: Scope): string[] {
  return [...new Set(AGENT_TARGETS.map((a) => targetDir(a, scope)))].filter(hasInstall);
}

/** Agent ids whose folders hold a RYUX install (or, for preselection, whose folders exist). */
function agentsAt(scope: Scope, requireInstall: boolean): string[] {
  return AGENT_TARGETS.filter((a) => {
    const dir = targetDir(a, scope);
    return requireInstall ? hasInstall(dir) : existsSync(join(dir, ".."));
  }).map((a) => a.id);
}

function parseFlags(argv: string[]): Flags {
  const flags: Flags = {};
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (!a.startsWith("--")) continue;
    const key = a.slice(2);
    const next = argv[i + 1];
    if (next && !next.startsWith("--")) {
      flags[key] = next;
      i++;
    } else {
      flags[key] = true;
    }
  }
  return flags;
}

const list = (v: string | boolean | undefined): string[] | null =>
  typeof v === "string" ? v.split(",").map((s) => s.trim()).filter(Boolean) : null;

const scopeOf = (flags: Flags): Scope => ({ global: Boolean(flags.global), root: flags.global ? homedir() : process.cwd() });

function cancel(): void {
  p.cancel("Cancelled.");
}

async function runInstall(flags: Flags): Promise<void> {
  const scope = scopeOf(flags);
  const flagAgents = list(flags.agent);
  const nonInteractive = Boolean(flagAgents);
  if (flags.for || flags.groups || flags.concerns) {
    console.log(pc.yellow("RYUX 2 installs one skill that picks the knowledge each task needs; --for, --groups, and --concerns are no longer needed."));
  }

  let agents: string[];
  let showMcp: boolean;

  if (flagAgents) {
    agents = flagAgents.includes("all") ? AGENT_TARGETS.map((a) => a.id) : flagAgents.filter((a) => AGENT_IDS.includes(a));
    showMcp = Boolean(flags.mcp);
    if (!agents.length) {
      console.error(`Invalid agent.\nAgents: ${AGENT_IDS.join(",")},all`);
      process.exitCode = 1;
      return;
    }
  } else {
    if (!process.stdin.isTTY) {
      console.error(`Interactive mode needs a terminal. Use flags, e.g.: ${CLI_CMD} install --agent claude,cursor`);
      process.exitCode = 1;
      return;
    }
    p.intro(pc.bgCyan(pc.black(" RYUX ")));
    const detected = agentsAt(scope, false);
    const a = await p.multiselect({
      message: "Which agents do you use?",
      options: [
        ...AGENT_TARGETS.map((x) => ({ value: x.id, label: x.label, hint: scope.global ? `~/${x.globalDir}` : x.dir })),
        { value: AGENTS_MD_INLINE.id, label: AGENTS_MD_INLINE.label, hint: "AGENTS.md" },
      ],
      initialValues: detected.length ? detected : ["claude"],
      required: true,
    });
    if (p.isCancel(a)) return cancel();
    const m = await p.confirm({ message: "Show the ryux MCP connect command?", initialValue: false });
    if (p.isCancel(m)) return cancel();
    agents = a as string[];
    showMcp = Boolean(m);
  }

  if (scope.global && agents.includes(AGENTS_MD_INLINE.id)) {
    console.log(pc.yellow("agents-md is project-only; skipped for --global."));
    agents = agents.filter((x) => x !== AGENTS_MD_INLINE.id);
  }

  const written = await install(agents, scope);
  const summary = written.map((w) => pc.green("✓ ") + w).join("\n");
  if (nonInteractive) console.log(summary);
  else p.note(summary, "Installed");

  if (showMcp) {
    if (nonInteractive) console.log(`\nMCP: ${MCP_ADD_CMD}`);
    else p.note(MCP_ADD_CMD, "Connect the ryux MCP");
  }
  if (!nonInteractive) p.outro(`Try: ${pc.cyan('"Critique this page: https://..."')}`);
}

async function runUpdate(flags: Flags): Promise<void> {
  const scope = scopeOf(flags);
  const dirs = detectInstalled(scope);
  const agentsFile = scope.global ? null : await readIfExists(join(scope.root, "AGENTS.md"));
  const inline = Boolean(agentsFile?.includes(MARK_START) && (agentsFile.includes("# RYUX\n") || agentsFile.includes("# ryux-core")));
  if (!dirs.length && !inline) {
    console.log(`No RYUX install found. Run: ${CLI_CMD} install`);
    return;
  }
  const done: string[] = [];
  for (const dir of dirs) done.push(...(await writeSkills(dir, scope.root)));
  if (!scope.global) {
    for (const file of ["CLAUDE.md", "GEMINI.md", "AGENTS.md"] as PointerFile[]) {
      const path = join(scope.root, file);
      const content = await readIfExists(path);
      if (!content?.includes(MARK_START)) continue;
      await upsertBlock(path, file === "AGENTS.md" && inline ? renderAgentsBlock() : renderPointerBlock());
      done.push(`${file} (block)`);
    }
  }
  console.log(`${pc.green("✓ ")}Updated to v${RULES_VERSION}:\n${done.map((d) => `  ${d}`).join("\n")}`);
}

async function runRemove(flags: Flags): Promise<void> {
  const scope = scopeOf(flags);
  const dirs = [...new Set(AGENT_TARGETS.map((a) => targetDir(a, scope)))];
  const hasSkills = dirs.some(hasInstall);
  const pointerFiles = scope.global ? [] : (["CLAUDE.md", "GEMINI.md", "AGENTS.md"] as PointerFile[]);
  const hasBlocks = (
    await Promise.all(pointerFiles.map(async (f) => (await readIfExists(join(scope.root, f)))?.includes(MARK_START)))
  ).some(Boolean);
  const hasLegacyCursor = existsSync(join(scope.root, LEGACY_CURSOR_RULES_DIR));
  if (!hasSkills && !hasBlocks && !hasLegacyCursor) {
    console.log("No RYUX install found.");
    return;
  }
  if (!flags.yes) {
    const ok = await p.confirm({ message: `Remove RYUX from ${scope.global ? "your home directory" : "this project"}?` });
    if (p.isCancel(ok) || !ok) {
      console.log("Cancelled.");
      return;
    }
  }
  const removed: string[] = [];
  for (const dir of dirs) {
    for (const name of [SKILL_NAME, ...OLD_SKILL_DIRS]) {
      const target = join(dir, name);
      if (await removePath(target)) removed.push(rel(target));
    }
    removed.push(...(await removeLegacy(dir, scope.root)));
  }
  for (const f of pointerFiles) if (await removeBlock(join(scope.root, f))) removed.push(`${f} (block)`);
  console.log(removed.length ? removed.map((r) => pc.red("− ") + r).join("\n") : "No files removed.");
}

function help(): void {
  const agents = AGENT_TARGETS.map((a) => `  ${a.id.padEnd(12)} ${a.label.padEnd(15)} ${a.dir}  (global ~/${a.globalDir})`).join("\n");
  console.log(`ryux v${RULES_VERSION}: install RYUX, design intelligence for AI agents and designers, into your agents.
One skill, five entry points: Analyze, Design, Build, Critique, QA. RYUX picks the knowledge each task needs.

Usage:
  ${CLI_CMD} [command] [options]

Commands:
  install     Install RYUX (interactive, or with flags). Default.
  update      Update an install to this version (also migrates RYUX 1.x folders).
  remove      Remove RYUX and the marked blocks.
  help        Show this help.

Agents:
${agents}
  ${AGENTS_MD_INLINE.id.padEnd(12)} any other agent: RYUX inline in AGENTS.md (project only)

Options:
  --agent <list|all>   agents to install for (non-interactive)
  --global             install into your home directory instead of this project
  --mcp                print the ryux MCP connect command
  --yes                skip the confirmation (remove)

Examples:
  ${CLI_CMD}
  ${CLI_CMD} install --agent claude,cursor,codex
  ${CLI_CMD} install --agent all
  ${CLI_CMD} install --agent claude --global
  ${CLI_CMD} update
  ${CLI_CMD} remove --yes`);
}

async function main(): Promise<void> {
  const argv = process.argv.slice(2);
  const first = argv[0];

  if (argv.includes("--help") || argv.includes("-h") || first === "help") return help();
  if (argv.includes("--version") || argv.includes("-v") || first === "version") {
    console.log(RULES_VERSION);
    return;
  }

  const cmd = first && !first.startsWith("--") ? first : "install";
  const flags = parseFlags(first && first.startsWith("--") ? argv : argv.slice(1));

  switch (cmd) {
    case "update":
      return runUpdate(flags);
    case "remove":
      return runRemove(flags);
    case "install":
      return runInstall(flags);
    default:
      console.error(`Unknown command: ${cmd}\n`);
      help();
      process.exitCode = 1;
  }
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exitCode = 1;
});
