#!/usr/bin/env node
import { existsSync } from "node:fs";
import { join } from "node:path";
import * as p from "@clack/prompts";
import pc from "picocolors";
import {
  ALL_GROUP_IDS,
  ALL_SKILL_IDS,
  GROUPS,
  LEGACY_CONCERNS,
  LEGACY_SKILL_DIRS,
  MARK_START,
  MCP_ADD_CMD,
  RULES_VERSION,
  SKILLS,
  skillsInGroups,
} from "./content.js";
import {
  detectSkills,
  renderAgentsBlock,
  renderClaudeBlock,
  renderCoreMdc,
  renderCoreSkill,
  renderSkill,
  renderSkillMdc,
} from "./render.js";
import { readIfExists, rel, removeBlock, removePath, upsertBlock, writeFileEnsured } from "./fsutil.js";

type AgentId = "claude" | "cursor" | "codex";

const AGENTS: { id: AgentId; label: string; hint: string }[] = [
  { id: "claude", label: "Claude Code", hint: ".claude/skills/ryux-*" },
  { id: "cursor", label: "Cursor", hint: ".cursor/rules/ryux-*.mdc" },
  { id: "codex", label: "Codex / others", hint: "AGENTS.md" },
];

const isAgent = (v: string): v is AgentId => AGENTS.some((a) => a.id === v);
const isGroup = (v: string): boolean => (ALL_GROUP_IDS as string[]).includes(v);
const isLegacyConcern = (v: string): boolean => v in LEGACY_CONCERNS;

// Turn legacy --concerns values into skill ids (deduplicated, workflow order).
const skillsFromConcerns = (concerns: string[]): string[] => {
  const wanted = new Set<string>(concerns.flatMap((c) => LEGACY_CONCERNS[c] ?? []));
  return ALL_SKILL_IDS.filter((id) => wanted.has(id));
};

function paths(cwd: string) {
  return {
    core: join(cwd, ".claude/skills/ryux-core/SKILL.md"),
    coreDir: join(cwd, ".claude/skills/ryux-core"),
    skillFile: (id: string) => join(cwd, `.claude/skills/ryux-${id}/SKILL.md`),
    skillDir: (id: string) => join(cwd, `.claude/skills/ryux-${id}`),
    claudeEntry: join(cwd, "CLAUDE.md"),
    cursorCore: join(cwd, ".cursor/rules/ryux-core.mdc"),
    legacyCore: join(cwd, ".claude/skills/ryux-rules/SKILL.md"),
    legacyCursorCore: join(cwd, ".cursor/rules/ryux-rules.mdc"),
    cursorSkill: (id: string) => join(cwd, `.cursor/rules/ryux-${id}.mdc`),
    codexEntry: join(cwd, "AGENTS.md"),
  };
}

// Skill folders and Cursor files from earlier releases. Removed on install and remove so an upgrade
// never leaves stale rules next to the current skills.
async function removeLegacy(id: AgentId, cwd: string): Promise<string[]> {
  const P = paths(cwd);
  const done: string[] = [];
  for (const c of LEGACY_SKILL_DIRS) {
    const target = id === "claude" ? P.skillDir(c) : id === "cursor" ? P.cursorSkill(c) : null;
    if (target && (await removePath(target))) done.push(`${rel(target)} (legacy)`);
  }
  return done;
}

async function installAgent(id: AgentId, skills: string[], cwd: string): Promise<string[]> {
  const P = paths(cwd);
  const done: string[] = [...(await removeLegacy(id, cwd))];
  if (id === "claude") {
    for (const sk of ALL_SKILL_IDS) if (!skills.includes(sk)) await removePath(P.skillDir(sk));
    await writeFileEnsured(P.core, renderCoreSkill(skills));
    done.push(rel(P.core));
    for (const sk of skills) {
      await writeFileEnsured(P.skillFile(sk), renderSkill(sk));
      done.push(rel(P.skillFile(sk)));
    }
    await upsertBlock(P.claudeEntry, renderClaudeBlock(skills));
    done.push(`${rel(P.claudeEntry)} (block)`);
  } else if (id === "cursor") {
    for (const sk of ALL_SKILL_IDS) if (!skills.includes(sk)) await removePath(P.cursorSkill(sk));
    await writeFileEnsured(P.cursorCore, renderCoreMdc(skills));
    done.push(rel(P.cursorCore));
    for (const sk of skills) {
      await writeFileEnsured(P.cursorSkill(sk), renderSkillMdc(sk));
      done.push(rel(P.cursorSkill(sk)));
    }
  } else {
    await upsertBlock(P.codexEntry, renderAgentsBlock(skills));
    done.push(`${rel(P.codexEntry)} (block)`);
  }
  return done;
}

async function removeAgent(id: AgentId, cwd: string): Promise<string[]> {
  const P = paths(cwd);
  const done: string[] = [];
  if (id === "claude") {
    if (await removePath(P.coreDir)) done.push(rel(P.coreDir));
    for (const sk of ALL_SKILL_IDS) if (await removePath(P.skillDir(sk))) done.push(rel(P.skillDir(sk)));
    done.push(...(await removeLegacy(id, cwd)));
    if (await removeBlock(P.claudeEntry)) done.push(`${rel(P.claudeEntry)} (block)`);
  } else if (id === "cursor") {
    if (await removePath(P.cursorCore)) done.push(rel(P.cursorCore));
    for (const sk of ALL_SKILL_IDS) if (await removePath(P.cursorSkill(sk))) done.push(rel(P.cursorSkill(sk)));
    done.push(...(await removeLegacy(id, cwd)));
  } else {
    if (await removeBlock(P.codexEntry)) done.push(`${rel(P.codexEntry)} (block)`);
  }
  return done;
}

/** Map of agent -> installed skills (null if not installed). Legacy installs report [] (= all skills on update). */
async function detectInstalled(cwd: string): Promise<Record<AgentId, string[] | null>> {
  const P = paths(cwd);
  const codex = await readIfExists(P.codexEntry);
  return {
    claude: existsSync(P.core)
      ? ALL_SKILL_IDS.filter((sk) => existsSync(P.skillFile(sk)))
      : existsSync(P.legacyCore)
        ? skillsFromConcerns(Object.keys(LEGACY_CONCERNS).filter((c) => existsSync(P.skillFile(c))))
        : null,
    cursor: existsSync(P.cursorCore)
      ? ALL_SKILL_IDS.filter((sk) => existsSync(P.cursorSkill(sk)))
      : existsSync(P.legacyCursorCore)
        ? skillsFromConcerns(Object.keys(LEGACY_CONCERNS).filter((c) => existsSync(P.cursorSkill(c))))
        : null,
    codex: codex && codex.includes(MARK_START) ? detectSkills(codex) : null,
  };
}

function parseFlags(argv: string[]): Record<string, string | boolean> {
  const flags: Record<string, string | boolean> = {};
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

function cancel(): void {
  p.cancel("Cancelled.");
}

async function install(flags: Record<string, string | boolean>): Promise<void> {
  const cwd = process.cwd();
  const list = (v: string | boolean | undefined): string[] | null =>
    typeof v === "string" ? v.split(",").map((s) => s.trim()).filter(Boolean) : null;
  const flagAgents = list(flags.agent);
  const flagGroups = list(flags.groups);
  const flagConcerns = list(flags.concerns);

  let agents: AgentId[];
  let skills: string[];
  let mcpChoice: string;
  const nonInteractive = Boolean(flagAgents && (flagGroups || flagConcerns));

  if (flagAgents && (flagGroups || flagConcerns)) {
    agents = flagAgents.filter(isAgent);
    if (flagGroups) {
      skills = skillsInGroups(flagGroups.filter(isGroup));
    } else {
      skills = skillsFromConcerns(flagConcerns!.filter(isLegacyConcern));
      console.log(pc.yellow("--concerns is deprecated; use --groups " + ALL_GROUP_IDS.join(",") + "."));
    }
    mcpChoice = flags.mcp ? "show" : "later";
    if (!agents.length || !skills.length) {
      console.error(`Invalid agent or group. Agents: claude,cursor,codex. Groups: ${ALL_GROUP_IDS.join(",")}.`);
      process.exitCode = 1;
      return;
    }
  } else {
    if (!process.stdin.isTTY) {
      console.error("Interactive mode needs a terminal. Use flags, e.g.: ryux-rules install --agent claude --groups ux,ui,quality");
      process.exitCode = 1;
      return;
    }
    p.intro(pc.bgCyan(pc.black(" ryux-rules ")));
    const a = await p.multiselect({
      message: "Which agent do you use?",
      options: AGENTS.map((x) => ({ value: x.id, label: x.label, hint: x.hint })),
      required: true,
    });
    if (p.isCancel(a)) return cancel();
    const g = await p.multiselect({
      message: "Which pipeline groups do you want? (core is always included)",
      options: GROUPS.map((x) => ({
        value: x.id,
        label: x.label,
        hint: SKILLS.filter((s) => s.group === x.id).map((s) => s.id).join(", "),
      })),
      initialValues: [...ALL_GROUP_IDS],
      required: true,
    });
    if (p.isCancel(g)) return cancel();
    const m = await p.select({
      message: "Connect to the ryux MCP?",
      options: [
        { value: "later", label: "Later" },
        { value: "show", label: "Show the command" },
      ],
      initialValue: "later",
    });
    if (p.isCancel(m)) return cancel();
    agents = a as AgentId[];
    skills = skillsInGroups(g as string[]);
    mcpChoice = m as string;
  }

  const written: string[] = [];
  for (const ag of agents) written.push(...(await installAgent(ag, skills, cwd)));

  const summary = written.map((w) => pc.green("✓ ") + w).join("\n");
  if (nonInteractive) console.log(summary);
  else p.note(summary, "Installed");

  if (mcpChoice === "show") {
    if (nonInteractive) console.log(`\nMCP: ${MCP_ADD_CMD}`);
    else p.note(MCP_ADD_CMD, "Connect the ryux MCP");
  }
  if (!nonInteractive) p.outro(`Try asking your agent: ${pc.cyan('"Audit this page with ryux-rules"')}`);
}

async function update(): Promise<void> {
  const cwd = process.cwd();
  const det = await detectInstalled(cwd);
  const targets = (Object.keys(det) as AgentId[]).filter((k) => det[k] !== null);
  if (!targets.length) {
    console.log("No ryux-rules installed yet. Run: ryux-rules install");
    return;
  }
  const updated: string[] = [];
  for (const ag of targets) {
    const found = det[ag] ?? [];
    const skills = found.length ? found : [...ALL_SKILL_IDS];
    await installAgent(ag, skills, cwd);
    updated.push(`${ag} (${skills.length} skills)`);
  }
  console.log(`${pc.green("✓ ")}Updated to v${RULES_VERSION}: ${updated.join("; ")}`);
}

async function remove(flags: Record<string, string | boolean>): Promise<void> {
  const cwd = process.cwd();
  const det = await detectInstalled(cwd);
  const targets = (Object.keys(det) as AgentId[]).filter((k) => det[k] !== null);
  if (!targets.length) {
    console.log("No ryux-rules installed.");
    return;
  }
  if (!flags.yes) {
    const ok = await p.confirm({ message: `Remove ryux-rules from: ${targets.join(", ")}?` });
    if (p.isCancel(ok) || !ok) {
      console.log("Cancelled.");
      return;
    }
  }
  const removed: string[] = [];
  for (const ag of targets) removed.push(...(await removeAgent(ag, cwd)));
  console.log(removed.length ? removed.map((r) => pc.red("− ") + r).join("\n") : "No files removed.");
}

function help(): void {
  const groups = GROUPS.map((g) => `  ${g.id.padEnd(12)} ${SKILLS.filter((s) => s.group === g.id).map((s) => s.id).join(", ")}`).join("\n");
  console.log(`ryux-rules v${RULES_VERSION}: install Ryux, the design skills for AI coding agents

Usage:
  npx ryux-rules [command] [options]

Commands:
  install     Install the rules (interactive: pick agent + groups). Default.
  update      Update installed rules to the latest version.
  remove      Remove installed rules.
  help        Show this help.

Groups (core is always included):
${groups}

Non-interactive options (install):
  --agent <list>       claude,cursor,codex
  --groups <list>      ${ALL_GROUP_IDS.join(",")}
  --concerns <list>    deprecated (ui,copy,a11y,ux,local,code), mapped to skills
  --mcp                show the MCP connect command
  --yes                skip confirmation (remove)

Examples:
  npx ryux-rules
  npx ryux-rules install --agent claude --groups ux,ui,quality
  npx ryux-rules update
  npx ryux-rules remove --yes`);
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
      return update();
    case "remove":
      return remove(flags);
    case "install":
      return install(flags);
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
