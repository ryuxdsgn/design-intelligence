import { ALL_LAYERS, LAYERS, MCP_ADD_CMD, RULES_VERSION, type LayerId } from "./content.js";

function layerSection(id: LayerId): string {
  const layer = LAYERS[id];
  const items = layer.rules.map((r) => `- **${r.id}** ${r.text}`).join("\n");
  return `### ${id} — ${layer.title}\n\n${items}`;
}

/** Isi aturan inti (dipakai skill Claude, mdc Cursor, dan blok AGENTS.md). */
export function renderBody(selected: LayerId[]): string {
  const sections = selected.map(layerSection).join("\n\n");
  return `# ryux-rules

> Aturan desain ryux.design — versi ${RULES_VERSION}, lisensi source-available.
> Terapkan pada setiap pekerjaan UI atau copy sebelum menganggapnya selesai.

${sections}

## Delivery Gate

Sebelum selesai: tiap keputusan wajib punya bukti (screen_id), aksesibilitas dan interaksi inti wajib lolos, copy sesuai. Aturan wajib tidak boleh dilanggar; anjuran hanya boleh dilanggar dengan alasan tertulis.

Data referensi dan review terstruktur tersedia lewat MCP ryux (tool \`search_screens\`, \`heuristic_eval\`, \`delivery_gate\`). Sambungkan: \`${MCP_ADD_CMD}\``;
}

/** Skill Claude Code: frontmatter + isi aturan. */
export function renderClaudeSkill(selected: LayerId[]): string {
  const layers = selected.join(", ");
  return `---
name: ryux-rules
description: Aturan desain ryux (${layers}) untuk UI dan copy produk Indonesia. Pakai saat membangun atau mereview antarmuka, dan jalankan sebelum menganggap pekerjaan UI/copy selesai.
---

${renderBody(selected)}
`;
}

/** Blok bertanda di CLAUDE.md: penunjuk ke skill (aturan lengkap ada di skill). */
export function renderClaudeBlock(selected: LayerId[]): string {
  const layers = selected.join(", ");
  return `## ryux-rules

Aturan desain ryux (lapisan ${layers}) ada di skill \`ryux-rules\`: \`.claude/skills/ryux-rules/SKILL.md\`. Terapkan pada setiap pekerjaan UI atau copy sebelum menganggapnya selesai. Data dan review terstruktur lewat MCP ryux: \`${MCP_ADD_CMD}\`.`;
}

/** Aturan Cursor (.mdc): frontmatter Cursor + isi aturan. */
export function renderCursorMdc(selected: LayerId[]): string {
  const layers = selected.join(", ");
  return `---
description: Aturan desain ryux (${layers}) untuk UI dan copy produk Indonesia
globs:
alwaysApply: false
---

${renderBody(selected)}
`;
}

/** Deteksi lapisan yang terpasang dari sebuah konten (heading "### RX-x —"). */
export function detectLayers(content: string): LayerId[] {
  const found = ALL_LAYERS.filter((id) => content.includes(`### ${id} —`));
  return found.length ? found : [];
}
