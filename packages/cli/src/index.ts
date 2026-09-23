#!/usr/bin/env node
import { join } from "node:path";
import * as p from "@clack/prompts";
import pc from "picocolors";
import {
  ALL_LAYERS,
  LAYERS,
  MARK_START,
  MCP_ADD_CMD,
  RULES_VERSION,
  type LayerId,
} from "./content.js";
import {
  detectLayers,
  renderBody,
  renderClaudeBlock,
  renderClaudeSkill,
  renderCursorMdc,
} from "./render.js";
import {
  readIfExists,
  rel,
  removeBlock,
  removePath,
  upsertBlock,
  writeFileEnsured,
} from "./fsutil.js";

type AgentId = "claude" | "cursor" | "codex";

const AGENTS: { id: AgentId; label: string; hint: string }[] = [
  { id: "claude", label: "Claude Code", hint: ".claude/skills/ryux-rules/ + CLAUDE.md" },
  { id: "cursor", label: "Cursor", hint: ".cursor/rules/ryux-rules.mdc" },
  { id: "codex", label: "Codex / lainnya", hint: "AGENTS.md" },
];

const isAgent = (v: string): v is AgentId => AGENTS.some((a) => a.id === v);
const isLayer = (v: string): v is LayerId => (ALL_LAYERS as string[]).includes(v);

function paths(cwd: string) {
  return {
    claudeSkill: join(cwd, ".claude/skills/ryux-rules/SKILL.md"),
    claudeSkillDir: join(cwd, ".claude/skills/ryux-rules"),
    claudeEntry: join(cwd, "CLAUDE.md"),
    cursorMdc: join(cwd, ".cursor/rules/ryux-rules.mdc"),
    codexEntry: join(cwd, "AGENTS.md"),
  };
}

async function installAgent(id: AgentId, selected: LayerId[], cwd: string): Promise<string[]> {
  const P = paths(cwd);
  const done: string[] = [];
  if (id === "claude") {
    await writeFileEnsured(P.claudeSkill, renderClaudeSkill(selected));
    done.push(rel(P.claudeSkill));
    await upsertBlock(P.claudeEntry, renderClaudeBlock(selected));
    done.push(`${rel(P.claudeEntry)} (blok ryux-rules)`);
  } else if (id === "cursor") {
    await writeFileEnsured(P.cursorMdc, renderCursorMdc(selected));
    done.push(rel(P.cursorMdc));
  } else {
    await upsertBlock(P.codexEntry, renderBody(selected));
    done.push(`${rel(P.codexEntry)} (blok ryux-rules)`);
  }
  return done;
}

async function removeAgent(id: AgentId, cwd: string): Promise<string[]> {
  const P = paths(cwd);
  const done: string[] = [];
  if (id === "claude") {
    if (await removePath(P.claudeSkillDir)) done.push(rel(P.claudeSkillDir));
    if (await removeBlock(P.claudeEntry)) done.push(`${rel(P.claudeEntry)} (blok)`);
  } else if (id === "cursor") {
    if (await removePath(P.cursorMdc)) done.push(rel(P.cursorMdc));
  } else {
    if (await removeBlock(P.codexEntry)) done.push(`${rel(P.codexEntry)} (blok)`);
  }
  return done;
}

/** Peta agent -> lapisan terpasang (null jika belum terpasang). */
async function detectInstalled(cwd: string): Promise<Record<AgentId, LayerId[] | null>> {
  const P = paths(cwd);
  const claudeSkill = await readIfExists(P.claudeSkill);
  const cursor = await readIfExists(P.cursorMdc);
  const codex = await readIfExists(P.codexEntry);
  return {
    claude: claudeSkill ? detectLayers(claudeSkill) : null,
    cursor: cursor ? detectLayers(cursor) : null,
    codex: codex && codex.includes(MARK_START) ? detectLayers(codex) : null,
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
  p.cancel("Dibatalkan.");
}

async function install(flags: Record<string, string | boolean>): Promise<void> {
  const cwd = process.cwd();
  const flagAgents = typeof flags.agent === "string" ? flags.agent.split(",").map((s) => s.trim()) : null;
  const flagLayers = typeof flags.layers === "string" ? flags.layers.split(",").map((s) => s.trim()) : null;

  let agents: AgentId[];
  let layers: LayerId[];
  let mcpChoice: string;
  const nonInteractive = Boolean(flagAgents && flagLayers);

  if (flagAgents && flagLayers) {
    agents = flagAgents.filter(isAgent);
    layers = flagLayers.filter(isLayer);
    mcpChoice = flags.mcp ? "show" : "later";
    if (!agents.length || !layers.length) {
      console.error("Agent atau lapisan tidak valid. Agent: claude,cursor,codex. Lapisan: RX-C,RX-H,RX-L.");
      process.exitCode = 1;
      return;
    }
  } else {
    if (!process.stdin.isTTY) {
      console.error(
        "Mode interaktif butuh terminal. Pakai flag, mis: ryux-rules install --agent claude --layers RX-C,RX-H,RX-L",
      );
      process.exitCode = 1;
      return;
    }
    p.intro(pc.bgCyan(pc.black(" ryux-rules ")));
    const a = await p.multiselect({
      message: "Agent apa yang kamu pakai?",
      options: AGENTS.map((x) => ({ value: x.id, label: x.label, hint: x.hint })),
      required: true,
    });
    if (p.isCancel(a)) return cancel();
    const l = await p.multiselect({
      message: "Pasang lapisan aturan apa?",
      options: ALL_LAYERS.map((id) => ({ value: id, label: `${id} — ${LAYERS[id].title}`, hint: LAYERS[id].hint })),
      initialValues: [...ALL_LAYERS],
      required: true,
    });
    if (p.isCancel(l)) return cancel();
    const m = await p.select({
      message: "Sambungkan ke MCP ryux?",
      options: [
        { value: "later", label: "Nanti saja" },
        { value: "show", label: "Tampilkan perintahnya" },
      ],
      initialValue: "later",
    });
    if (p.isCancel(m)) return cancel();
    agents = a as AgentId[];
    layers = l as LayerId[];
    mcpChoice = m as string;
  }

  const written: string[] = [];
  for (const ag of agents) written.push(...(await installAgent(ag, layers, cwd)));

  const summary = written.map((w) => pc.green("✓ ") + w).join("\n");
  if (nonInteractive) console.log(summary);
  else p.note(summary, "Terpasang");

  if (mcpChoice === "show") {
    if (nonInteractive) console.log(`\nMCP: ${MCP_ADD_CMD}`);
    else p.note(MCP_ADD_CMD, "Sambungkan MCP ryux");
  }
  if (!nonInteractive) p.outro(`Coba minta agent-mu: ${pc.cyan('"Audit halaman ini dengan ryux-rules"')}`);
}

async function update(): Promise<void> {
  const cwd = process.cwd();
  const det = await detectInstalled(cwd);
  const targets = (Object.keys(det) as AgentId[]).filter((k) => det[k] !== null);
  if (!targets.length) {
    console.log("Belum ada ryux-rules terpasang. Jalankan: ryux-rules install");
    return;
  }
  const updated: string[] = [];
  for (const ag of targets) {
    const layers = det[ag]!.length ? det[ag]! : [...ALL_LAYERS];
    await installAgent(ag, layers, cwd);
    updated.push(`${ag} (${layers.join(", ")})`);
  }
  console.log(`${pc.green("✓ ")}Diperbarui ke v${RULES_VERSION}: ${updated.join("; ")}`);
}

async function remove(flags: Record<string, string | boolean>): Promise<void> {
  const cwd = process.cwd();
  const det = await detectInstalled(cwd);
  const targets = (Object.keys(det) as AgentId[]).filter((k) => det[k] !== null);
  if (!targets.length) {
    console.log("Tidak ada ryux-rules terpasang.");
    return;
  }
  if (!flags.yes) {
    const ok = await p.confirm({ message: `Hapus ryux-rules dari: ${targets.join(", ")}?` });
    if (p.isCancel(ok) || !ok) {
      console.log("Dibatalkan.");
      return;
    }
  }
  const removed: string[] = [];
  for (const ag of targets) removed.push(...(await removeAgent(ag, cwd)));
  console.log(removed.length ? removed.map((r) => pc.red("− ") + r).join("\n") : "Tidak ada file yang dihapus.");
}

function help(): void {
  console.log(`ryux-rules v${RULES_VERSION} — pasang aturan desain ryux ke agent AI

Penggunaan:
  npx ryux-rules [perintah] [opsi]

Perintah:
  install     Pasang aturan (interaktif). Default bila tanpa perintah.
  update      Perbarui aturan yang sudah terpasang ke versi terbaru.
  remove      Hapus aturan yang terpasang.
  help        Tampilkan bantuan ini.

Opsi non-interaktif (untuk install):
  --agent <daftar>   claude,cursor,codex (pisah koma)
  --layers <daftar>  RX-C,RX-H,RX-L (pisah koma)
  --mcp              tampilkan perintah sambung MCP
  --yes              lewati konfirmasi (remove)

Contoh:
  npx ryux-rules
  npx ryux-rules install --agent claude,cursor --layers RX-C,RX-H,RX-L
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
      console.error(`Perintah tidak dikenal: ${cmd}\n`);
      help();
      process.exitCode = 1;
  }
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exitCode = 1;
});
