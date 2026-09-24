import {
  ALL_CONCERN_IDS,
  CONCERNS,
  CORE_RULES,
  MCP_ADD_CMD,
  RULES,
  RULES_VERSION,
  type Concern,
} from "./content.js";

function lines(ids: string[]): string {
  return ids.map((id) => `- **${id}** ${RULES[id] ?? id}`).join("\n");
}

function byId(id: string): Concern | undefined {
  return CONCERNS.find((c) => c.id === id);
}

const header = (scope: string): string =>
  `> Aturan desain ryux.design — versi ${RULES_VERSION}, lisensi MIT.
> Terapkan pada pekerjaan ${scope} sebelum menganggapnya selesai.`;

const gate = `## Delivery Gate

Keputusan desain wajib punya bukti (\`screen_id\`); aturan wajib tidak boleh dilanggar, anjuran hanya
dengan alasan tertulis. Data referensi & review terstruktur lewat MCP ryux (\`search_screens\`,
\`heuristic_eval\`, \`delivery_gate\`). Sambungkan: \`${MCP_ADD_CMD}\``;

function coreBody(concernIds: string[]): string {
  const list = concernIds.length
    ? `\nSkill concern terpasang: ${concernIds.map((i) => `\`ryux-${i}\``).join(", ")}. Muat yang relevan dengan tugas.\n`
    : "";
  return `# ryux-rules (inti)

${header("UI atau copy")}

## Bukti & kejujuran

${lines(CORE_RULES)}
${list}
${gate}`;
}

function concernBody(id: string): string {
  const c = byId(id);
  if (!c) return "";
  return `# ryux-${c.id} — ${c.label}

${header(c.label.toLowerCase())}

${lines(c.rules)}`;
}

// ── Claude Code skills ────────────────────────────────────────────────────────
export function renderCoreSkill(concernIds: string[]): string {
  return `---
name: ryux-rules
description: Inti aturan desain ryux (bukti + kejujuran konten). Selalu berlaku untuk pekerjaan UI atau copy; muat skill concern (ryux-ui, ryux-copy, ryux-a11y, ryux-ux, ryux-local) sesuai tugas.
---

${coreBody(concernIds)}
`;
}

export function renderConcernSkill(id: string): string {
  const c = byId(id);
  if (!c) return "";
  return `---
name: ryux-${c.id}
description: ryux-rules — ${c.label}. ${c.hint}. Muat saat mengerjakan ${c.label.toLowerCase()}.
---

${concernBody(id)}
`;
}

// ── Cursor .mdc ───────────────────────────────────────────────────────────────
export function renderCoreMdc(concernIds: string[]): string {
  return `---
description: Inti aturan desain ryux (bukti + kejujuran)
globs:
alwaysApply: false
---

${coreBody(concernIds)}
`;
}

export function renderConcernMdc(id: string): string {
  const c = byId(id);
  if (!c) return "";
  return `---
description: ryux-rules — ${c.label}
globs:
alwaysApply: false
---

${concernBody(id)}
`;
}

// ── AGENTS.md blok (inti + concern terpilih, inline) ─────────────────────────
export function renderAgentsBlock(concernIds: string[]): string {
  const secs = concernIds.map((id) => concernBody(id)).filter(Boolean).join("\n\n");
  return `${coreBody(concernIds)}${secs ? `\n\n${secs}` : ""}`;
}

// ── Blok penunjuk di CLAUDE.md ───────────────────────────────────────────────
export function renderClaudeBlock(concernIds: string[]): string {
  const list = ["ryux-rules (inti)", ...concernIds.map((i) => `ryux-${i}`)]
    .map((s) => `\`${s}\``)
    .join(", ");
  return `## ryux-rules

Aturan desain ryux terpasang sebagai skill: ${list} (di \`.claude/skills/\`). Terapkan pada
pekerjaan UI atau copy sebelum menganggapnya selesai. Data & review terstruktur lewat MCP ryux:
\`${MCP_ADD_CMD}\`.`;
}

// Deteksi concern id dari sebuah konten (blok AGENTS.md, dsb).
export function detectConcerns(content: string): string[] {
  return ALL_CONCERN_IDS.filter((id) => content.includes(`ryux-${id}`));
}
