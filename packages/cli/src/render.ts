import {
  ALL_CONCERN_IDS,
  CONCERNS,
  CORE_RULES,
  MCP_ADD_CMD,
  REQUIRED_RULES,
  RULES,
  RULES_VERSION,
  type Concern,
} from "./content.js";

function lines(ids: string[]): string {
  return ids
    .map((id) => `- **${id}**${REQUIRED_RULES.has(id) ? " [Required]" : ""} ${RULES[id] ?? id}`)
    .join("\n");
}

function byId(id: string): Concern | undefined {
  return CONCERNS.find((c) => c.id === id);
}

const header = (scope: string): string =>
  `> ryux.design design rules, version ${RULES_VERSION}, MIT licensed.
> Apply to ${scope} work before considering it done. [Required] rules are a hard gate; the rest
> may be broken only with a written reason.`;

const gate = `## Delivery Gate

Design decisions must carry evidence (\`screen_id\`). Required rules cannot be broken; recommendations
only with a written reason. Reference data and structured review come from the ryux MCP
(\`search_screens\`, \`heuristic_eval\`, \`delivery_gate\`). Connect: \`${MCP_ADD_CMD}\``;

function coreBody(concernIds: string[]): string {
  const list = concernIds.length
    ? `\nInstalled concern skills: ${concernIds.map((i) => `\`ryux-${i}\``).join(", ")}. Load the ones relevant to your task.\n`
    : "";
  return `# ryux-rules (core)

${header("UI or copy")}

## Evidence and honesty

${lines(CORE_RULES)}
${list}
${gate}`;
}

function concernBody(id: string): string {
  const c = byId(id);
  if (!c) return "";
  return `# ryux-${c.id}: ${c.label}

${header(c.label)}

${lines(c.rules)}`;
}

// ── Claude Code skills ────────────────────────────────────────────────────────
export function renderCoreSkill(concernIds: string[]): string {
  const all = CONCERNS.map((c) => `ryux-${c.id}`).join(", ");
  return `---
name: ryux-rules
description: Core ryux design rules (evidence + honest content). Always applies to UI or copy work; load the concern skills (${all}) as needed.
---

${coreBody(concernIds)}
`;
}

export function renderConcernSkill(id: string): string {
  const c = byId(id);
  if (!c) return "";
  return `---
name: ryux-${c.id}
description: ryux-rules: ${c.label}. ${c.hint}. Load when working on ${c.label}.
---

${concernBody(id)}
`;
}

// ── Cursor .mdc ───────────────────────────────────────────────────────────────
export function renderCoreMdc(concernIds: string[]): string {
  return `---
description: Core ryux design rules (evidence + honesty)
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
description: "ryux-rules: ${c.label}"
globs:
alwaysApply: false
---

${concernBody(id)}
`;
}

// ── AGENTS.md block (core + selected concerns, inline) ────────────────────────
export function renderAgentsBlock(concernIds: string[]): string {
  const secs = concernIds.map((id) => concernBody(id)).filter(Boolean).join("\n\n");
  return `${coreBody(concernIds)}${secs ? `\n\n${secs}` : ""}`;
}

// ── Pointer block for CLAUDE.md ──────────────────────────────────────────────
export function renderClaudeBlock(concernIds: string[]): string {
  const list = ["ryux-rules (core)", ...concernIds.map((i) => `ryux-${i}`)]
    .map((s) => `\`${s}\``)
    .join(", ");
  return `## ryux-rules

ryux design rules installed as skills: ${list} (in \`.claude/skills/\`). Apply to UI or copy work
before considering it done. Reference data and structured review come from the ryux MCP:
\`${MCP_ADD_CMD}\`.`;
}

// Detect concern ids from a piece of content (an AGENTS.md block, etc.).
export function detectConcerns(content: string): string[] {
  return ALL_CONCERN_IDS.filter((id) => content.includes(`ryux-${id}`));
}
