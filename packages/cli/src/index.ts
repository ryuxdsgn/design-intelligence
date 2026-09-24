#!/usr/bin/env node
import { existsSync } from "node:fs";
import { join } from "node:path";
import * as p from "@clack/prompts";
import pc from "picocolors";
import { ALL_CONCERN_IDS, CONCERNS, MARK_START, MCP_ADD_CMD, RULES_VERSION } from "./content.js";
import {
  detectConcerns,
  renderAgentsBlock,
  renderClaudeBlock,
  renderConcernMdc,
  renderConcernSkill,
  renderCoreMdc,
  renderCoreSkill,
} from "./render.js";
import { readIfExists, rel, removeBlock, removePath, upsertBlock, writeFileEnsured } from "./fsutil.js";

type AgentId = "claude" | "cursor" | "codex";

const AGENTS: { id: AgentId; label: string; hint: string }[] = [
  { id: "claude", label: "Claude Code", hint: ".claude/skills/ryux-*" },
  { id: "cursor", label: "Cursor", hint: ".cursor/rules/ryux-*.mdc" },
  { id: "codex", label: "Codex / others", hint: "AGENTS.md" },
];

const isAgent = (v: string): v is AgentId => AGENTS.some((a) => a.id === v);
const isConcern = (v: string): boolean => ALL_CONCERN_IDS.includes(v);

function paths(cwd: string) {
  return {
    core: join(cwd, ".claude/skills/ryux-rules/SKILL.md"),
    coreDir: join(cwd, ".claude/skills/ryux-rules"),
    concernSkill: (id: string) => join(cwd, `.claude/skills/ryux-${id}/SKILL.md`),
    concernDir: (id: string) => join(cwd, `.claude/skills/ryux-${id}`),
    claudeEntry: join(cwd, "CLAUDE.md"),
    cursorCore: join(cwd, ".cursor/rules/ryux-rules.mdc"),
    cursorConcern: (id: string) => join(cwd, `.cursor/rules/ryux-${id}.mdc`),
    codexEntry: join(cwd, "AGENTS.md"),
  };
}

async function installAgent(id: AgentId, concerns: string[], cwd: string): Promise<string[]> {
  const P = paths(cwd);
  const done: string[] = [];
  if (id === "claude") {
    await writeFileEnsured(P.core, renderCoreSkill(concerns));
    done.push(rel(P.core));
    for (const c of concerns) {
      await writeFileEnsured(P.concernSkill(c), renderConcernSkill(c));
      done.push(rel(P.concernSkill(c)));
    }
    await upsertBlock(P.claudeEntry, renderClaudeBlock(concerns));
    done.push(`${rel(P.claudeEntry)} (block)`);
  } else if (id === "cursor") {
    await writeFileEnsured(P.cursorCore, renderCoreMdc(concerns));
    done.push(rel(P.cursorCore));
    for (const c of concerns) {
      await writeFileEnsured(P.cursorConcern(c), renderConcernMdc(c));
      done.push(rel(P.cursorConcern(c)));
    }
  } else {
    await upsertBlock(P.codexEntry, renderAgentsBlock(concerns));
    done.push(`${rel(P.codexEntry)} (block)`);
  }
  return done;
}

async function removeAgent(id: AgentId, cwd: string): Promise<string[]> {
  const P = paths(cwd);
  const done: string[] = [];
  if (id === "claude") {
    if (await removePath(P.coreDir)) done.push(rel(P.coreDir));
    for (const c of ALL_CONCERN_IDS) if (await removePath(P.concernDir(c))) done.push(rel(P.concernDir(c)));
    if (await removeBlock(P.claudeEntry)) done.push(`${rel(P.claudeEntry)} (block)`);
  } else if (id === "cursor") {
    if (await removePath(P.cursorCore)) done.push(rel(P.cursorCore));
    for (const c of ALL_CONCERN_IDS) if (await removePath(P.cursorConcern(c))) done.push(rel(P.cursorConcern(c)));
  } else {
    if (await removeBlock(P.codexEntry)) done.push(`${rel(P.codexEntry)} (block)`);
  }
  return done;
}

/** Map of agent -> installed concerns (null if not installed). */
async function detectInstalled(cwd: string): Promise<Record<AgentId, string[] | null>> {
  const P = paths(cwd);
  const codex = await readIfExists(P.codexEntry);
  return {
    claude: existsSync(P.core) ? ALL_CONCERN_IDS.filter((c) => existsSync(P.concernSkill(c))) : null,
    cursor: existsSync(P.cursorCore) ? ALL_CONCERN_IDS.filter((c) => existsSync(P.cursorConcern(c))) : null,
    codex: codex && codex.includes(MARK_START) ? detectConcerns(codex) : null,
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
  const flagAgents = typeof flags.agent === "string" ? flags.agent.split(",").map((s) => s.trim()) : null;
  const flagConcerns = typeof flags.concerns === "string" ? flags.concerns.split(",").map((s) => s.trim()) : null;

  let agents: AgentId[];
  let concerns: string[];
  let mcpChoice: string;
  const nonInteractive = Boolean(flagAgents && flagConcerns);

  if (flagAgents && flagConcerns) {
    agents = flagAgents.filter(isAgent);
    concerns = flagConcerns.filter(isConcern);
    mcpChoice = flags.mcp ? "show" : "later";
    if (!agents.length || !concerns.length) {
      console.error(`Invalid agent or concern. Agents: claude,cursor,codex. Concerns: ${ALL_CONCERN_IDS.join(",")}.`);
      process.exitCode = 1;
      return;
    }
  } else {
    if (!process.stdin.isTTY) {
      console.error("Interactive mode needs a terminal. Use flags, e.g.: ryux-rules install --agent claude --concerns ui,copy,local");
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
    const c = await p.multiselect({
      message: "Which concerns do you want? (core is always included)",
      options: CONCERNS.map((x) => ({ value: x.id, label: x.label, hint: x.hint })),
      initialValues: [...ALL_CONCERN_IDS],
      required: true,
    });
    if (p.isCancel(c)) return cancel();
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
    concerns = c as string[];
    mcpChoice = m as string;
  }

  const written: string[] = [];
  for (const ag of agents) written.push(...(await installAgent(ag, concerns, cwd)));

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
    const concerns = found.length ? found : [...ALL_CONCERN_IDS];
    await installAgent(ag, concerns, cwd);
    updated.push(`${ag} (${concerns.join(", ") || "core"})`);
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
  console.log(`ryux-rules v${RULES_VERSION}: install the ryux design rules (per concern) into your AI agent

Usage:
  npx ryux-rules [command] [options]

Commands:
  install     Install the rules (interactive: pick agent + concerns). Default.
  update      Update installed rules to the latest version.
  remove      Remove installed rules.
  help        Show this help.

Concerns: ${CONCERNS.map((c) => c.id).join(", ")} (core is always included).

Non-interactive options (install):
  --agent <list>       claude,cursor,codex
  --concerns <list>    ${ALL_CONCERN_IDS.join(",")}
  --mcp                show the MCP connect command
  --yes                skip confirmation (remove)

Examples:
  npx ryux-rules
  npx ryux-rules install --agent claude --concerns ui,copy,local
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
