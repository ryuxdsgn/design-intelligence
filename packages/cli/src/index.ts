#!/usr/bin/env node
import { existsSync, readdirSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
import * as p from "@clack/prompts";
import pc from "picocolors";
import {
  AGENT_TARGETS,
  AGENTS_MD_INLINE,
  ALL_GROUP_IDS,
  ALL_INSTALLABLE_IDS,
  CLI_CMD,
  GROUPS,
  LEGACY_CONCERNS,
  LEGACY_CURSOR_RULES_DIR,
  LEGACY_SKILL_DIRS,
  MARK_START,
  MCP_ADD_CMD,
  PRESETS,
  RULES_VERSION,
  SKILLS,
  skillsInGroups,
  type AgentTarget,
  type PointerFile,
} from "./content.js";
import { detectSkills, renderAgentsBlock, renderCoreSkill, renderPointerBlock, renderSkill } from "./render.js";
import { readIfExists, rel, removeBlock, removePath, upsertBlock, writeFileEnsured } from "./fsutil.js";

type Flags = Record<string, string | boolean>;

interface Scope {
  global: boolean;
  root: string;
}

const AGENT_IDS = [...AGENT_TARGETS.map((a) => a.id), AGENTS_MD_INLINE.id];
const isGroup = (v: string): boolean => (ALL_GROUP_IDS as string[]).includes(v);
const isLegacyConcern = (v: string): boolean => v in LEGACY_CONCERNS;
const groupHint = (id: string): string =>
  id === "analyze" || id === "critique" ? `ryux-${id}` : SKILLS.filter((s) => s.group === id).map((s) => s.id).join(", ");
const targetDir = (a: AgentTarget, scope: Scope): string => join(scope.root, scope.global ? a.globalDir : a.dir);

// Legacy --concerns values (RX-1.x) mapped to current skill ids, in workflow order.
const skillsFromConcerns = (concerns: string[]): string[] => {
  const wanted = new Set<string>(concerns.flatMap((c) => LEGACY_CONCERNS[c] ?? []));
  return ALL_INSTALLABLE_IDS.filter((id) => wanted.has(id));
};

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

async function writeSkills(dir: string, skills: string[], root: string): Promise<string[]> {
  const done = await removeLegacy(dir, root);
  for (const id of ALL_INSTALLABLE_IDS) if (!skills.includes(id)) await removePath(join(dir, `ryux-${id}`));
  const core = join(dir, "ryux-core/SKILL.md");
  await writeFileEnsured(core, renderCoreSkill(skills));
  done.push(rel(core));
  for (const id of skills) {
    const file = join(dir, `ryux-${id}/SKILL.md`);
    await writeFileEnsured(file, renderSkill(id));
    done.push(rel(file));
  }
  return done;
}

async function install(agentIds: string[], skills: string[], scope: Scope): Promise<string[]> {
  const done: string[] = [];
  for (const dir of dirsFor(agentIds, scope)) done.push(...(await writeSkills(dir, skills, scope.root)));
  if (scope.global) return done;

  const inline = agentIds.includes(AGENTS_MD_INLINE.id);
  for (const file of pointersFor(agentIds)) {
    if (file === "AGENTS.md" && inline) continue;
    await upsertBlock(join(scope.root, file), renderPointerBlock(skills));
    done.push(`${file} (block)`);
  }
  if (inline) {
    await upsertBlock(join(scope.root, "AGENTS.md"), renderAgentsBlock(skills));
    done.push("AGENTS.md (rules inline)");
  }
  return done;
}

/** Skill folders that already hold a RYUX install, with the skills found in each. */
function detectInstalled(scope: Scope): Map<string, string[]> {
  const found = new Map<string, string[]>();
  for (const a of AGENT_TARGETS) {
    const dir = targetDir(a, scope);
    if (found.has(dir)) continue;
    if (existsSync(join(dir, "ryux-core/SKILL.md"))) {
      found.set(dir, ALL_INSTALLABLE_IDS.filter((id) => existsSync(join(dir, `ryux-${id}/SKILL.md`))));
    } else if (existsSync(join(dir, "ryux-rules/SKILL.md"))) {
      found.set(dir, skillsFromConcerns(Object.keys(LEGACY_CONCERNS).filter((c) => existsSync(join(dir, `ryux-${c}`)))));
    }
  }
  return found;
}

/** Agent ids whose folders hold a RYUX install (or, for preselection, whose folders exist). */
function agentsAt(scope: Scope, requireInstall: boolean): string[] {
  return AGENT_TARGETS.filter((a) => {
    const dir = targetDir(a, scope);
    return requireInstall ? existsSync(join(dir, "ryux-core")) || existsSync(join(dir, "ryux-rules")) : existsSync(join(dir, ".."));
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
  const flagGroups = list(flags.groups);
  const preset = typeof flags.for === "string" ? PRESETS[flags.for] : undefined;
  if (typeof flags.for === "string" && !preset) {
    console.error(`Unknown --for "${flags.for}". Use: ${Object.keys(PRESETS).join(", ")}`);
    process.exitCode = 1;
    return;
  }
  const flagConcerns = list(flags.concerns);
  const nonInteractive = Boolean(flagAgents);

  let agents: string[];
  let skills: string[];
  let showMcp: boolean;

  if (flagAgents) {
    agents = flagAgents.includes("all") ? AGENT_TARGETS.map((a) => a.id) : flagAgents.filter((a) => AGENT_IDS.includes(a));
    if (flagConcerns && !flagGroups) {
      skills = skillsFromConcerns(flagConcerns.filter(isLegacyConcern));
      console.log(pc.yellow(`--concerns is deprecated; use --groups ${ALL_GROUP_IDS.join(",")}.`));
    } else {
      skills = skillsInGroups((flagGroups ?? preset?.groups ?? [...ALL_GROUP_IDS]).filter(isGroup));
    }
    showMcp = Boolean(flags.mcp);
    if (!agents.length || !skills.length) {
      console.error(`Invalid agent or group.\nAgents: ${AGENT_IDS.join(",")},all\nGroups: ${ALL_GROUP_IDS.join(",")}`);
      process.exitCode = 1;
      return;
    }
  } else {
    if (!process.stdin.isTTY) {
      console.error(`Interactive mode needs a terminal. Use flags, e.g.: ${CLI_CMD} install --agent claude,cursor --for designer`);
      process.exitCode = 1;
      return;
    }
    p.intro(pc.bgCyan(pc.black(" ryux ")));
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
    const who = await p.select({
      message: "Who is this for?",
      options: Object.entries(PRESETS).map(([value, x]) => ({ value, label: x.label })),
      initialValue: flags.for && preset ? String(flags.for) : "all",
    });
    if (p.isCancel(who)) return cancel();
    const g = await p.multiselect({
      message: "Which groups? (ryux-core is always included)",
      options: GROUPS.map((x) => ({
        value: x.id,
        label: x.label,
        hint: groupHint(x.id),
      })),
      initialValues: [...PRESETS[who as string].groups],
      required: true,
    });
    if (p.isCancel(g)) return cancel();
    const m = await p.confirm({ message: "Show the ryux MCP connect command?", initialValue: false });
    if (p.isCancel(m)) return cancel();
    agents = a as string[];
    skills = skillsInGroups(g as string[]);
    showMcp = Boolean(m);
  }

  if (scope.global && agents.includes(AGENTS_MD_INLINE.id)) {
    console.log(pc.yellow("agents-md is project-only; skipped for --global."));
    agents = agents.filter((x) => x !== AGENTS_MD_INLINE.id);
  }

  const written = await install(agents, skills, scope);
  const summary = written.map((w) => pc.green("✓ ") + w).join("\n");
  if (nonInteractive) console.log(summary);
  else p.note(summary, "Installed");

  if (showMcp) {
    if (nonInteractive) console.log(`\nMCP: ${MCP_ADD_CMD}`);
    else p.note(MCP_ADD_CMD, "Connect the ryux MCP");
  }
  if (!nonInteractive) p.outro(`Try: ${pc.cyan('"Critique this page with ryux-critique: https://..."')}`);
}

async function runUpdate(flags: Flags): Promise<void> {
  const scope = scopeOf(flags);
  const installed = detectInstalled(scope);
  const agentsFile = scope.global ? null : await readIfExists(join(scope.root, "AGENTS.md"));
  const inline = Boolean(agentsFile?.includes(MARK_START) && agentsFile.includes("# ryux-core"));
  if (!installed.size && !inline) {
    console.log(`No RYUX install found. Run: ${CLI_CMD} install`);
    return;
  }
  const done: string[] = [];
  for (const [dir, found] of installed) {
    done.push(...(await writeSkills(dir, found.length ? found : [...ALL_INSTALLABLE_IDS], scope.root)));
  }
  if (!scope.global) {
    const all = [...new Set([...installed.values()].flat())];
    const skills = all.length ? all : [...ALL_INSTALLABLE_IDS];
    for (const file of ["CLAUDE.md", "GEMINI.md", "AGENTS.md"] as PointerFile[]) {
      const path = join(scope.root, file);
      const content = await readIfExists(path);
      if (!content?.includes(MARK_START)) continue;
      if (file === "AGENTS.md" && inline) {
        const found = detectSkills(content);
        await upsertBlock(path, renderAgentsBlock(found.length ? found : skills));
      } else {
        await upsertBlock(path, renderPointerBlock(skills));
      }
      done.push(`${file} (block)`);
    }
  }
  console.log(`${pc.green("✓ ")}Updated to v${RULES_VERSION}:\n${done.map((d) => `  ${d}`).join("\n")}`);
}

async function runRemove(flags: Flags): Promise<void> {
  const scope = scopeOf(flags);
  const dirs = [...new Set(AGENT_TARGETS.map((a) => targetDir(a, scope)))];
  const hasSkills = dirs.some((d) => existsSync(join(d, "ryux-core")) || existsSync(join(d, "ryux-rules")));
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
    for (const id of ["core", ...ALL_INSTALLABLE_IDS]) {
      const target = join(dir, `ryux-${id}`);
      if (await removePath(target)) removed.push(rel(target));
    }
    removed.push(...(await removeLegacy(dir, scope.root)));
  }
  for (const f of pointerFiles) if (await removeBlock(join(scope.root, f))) removed.push(`${f} (block)`);
  console.log(removed.length ? removed.map((r) => pc.red("− ") + r).join("\n") : "No files removed.");
}

function help(): void {
  const groups = GROUPS.map(
    (g) => `  ${g.id.padEnd(12)} ${groupHint(g.id)}`,
  ).join("\n");
  const agents = AGENT_TARGETS.map((a) => `  ${a.id.padEnd(12)} ${a.label.padEnd(15)} ${a.dir}  (global ~/${a.globalDir})`).join("\n");
  console.log(`ryux v${RULES_VERSION}: install RYUX, a design intelligence layer (Analyze, Build, Critique, QA), into your AI agents

Usage:
  ${CLI_CMD} [command] [options]

Commands:
  install     Install the skills (interactive, or with flags). Default.
  update      Update installed skills to this version.
  remove      Remove installed skills and the marked blocks.
  help        Show this help.

Agents:
${agents}
  ${AGENTS_MD_INLINE.id.padEnd(12)} any other agent: rules inline in AGENTS.md (project only)

Groups (ryux-core is always included):
${groups}

Options:
  --agent <list|all>   agents to install for (non-interactive)
  --for <who>          preset: designer (Analyze, Critique, QA), builder (Build, QA, Critique), all
  --groups <list>      groups to install (overrides --for; default: all)
  --global             install into your home directory instead of this project
  --mcp                print the ryux MCP connect command
  --yes                skip the confirmation (remove)
  --concerns <list>    deprecated RX-1.x alias, mapped to groups

Examples:
  ${CLI_CMD}
  ${CLI_CMD} install --agent claude,cursor,codex
  ${CLI_CMD} install --agent all --for designer
  ${CLI_CMD} install --agent claude,codex --for builder
  ${CLI_CMD} install --agent all --groups critique
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
