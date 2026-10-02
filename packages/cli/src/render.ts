import {
  ACTIVATION,
  ALL_SKILL_IDS,
  GATE_AREAS,
  GROUPS,
  HARD_GATES,
  LEVEL_LABEL,
  MCP_ADD_CMD,
  PURPOSE_GATES,
  QUALITY_LOCKS,
  RULES,
  RULES_VERSION,
  RULESET_VERSION,
  SKILLS,
  type Rule,
  type Skill,
} from "./content.js";
import {
  CORE_DECISION_RECORD,
  CORE_HONESTY,
  CORE_PRINCIPLE,
  CORE_WORKFLOW,
  GATE_RULES,
  GUIDES,
} from "./guides.js";

const skillById = (id: string): Skill | undefined => SKILLS.find((s) => s.id === id);
const rulesOf = (id: string): Rule[] => RULES.filter((r) => r.skill === id);
const groupLabel = (id: string): string => GROUPS.find((g) => g.id === id)?.label ?? id;

function tag(r: Rule): string {
  const gate = r.gate === "hard" ? " [Hard Gate]" : r.gate === "lock" ? " [Quality Lock]" : "";
  return `[${LEVEL_LABEL[r.level]}]${gate}`;
}

function ruleBlock(r: Rule): string {
  const lines = [`### ${r.id} ${tag(r)} ${r.title}`, ""];
  if (r.when) lines.push(`- When: ${r.when}`);
  lines.push(`- Do: ${r.do}`, `- Do not: ${r.dont}`, `- Why: ${r.why} (${r.basis})`);
  if (r.check) lines.push(`- Check: ${r.check}`);
  return lines.join("\n");
}

const LEVELS = `- **[Required]**: applies within its stated scope; an exception needs a written reason.
- **[Preferred]**: the default; break it only with a short written reason.
- **[Contextual]**: applies only when its "When" situation is present.
- **[Hard Gate]**: a Required rule with no exceptions. Fix it before declaring the work complete.
- **[Quality Lock]**: consistency that must hold across the product.`;

export function activationTable(): string {
  const rows = ACTIVATION.map((a) => `| ${a.task} | ${a.skills.map((s) => `\`ryux-${s}\``).join(", ")} |`);
  return `| Task | Load (plus ryux-core) |\n| --- | --- |\n${rows.join("\n")}\n| Review or critique | \`ryux-critique\` (Design Read + heuristic_eval), plus \`ryux-visual-qa\` |`;
}

export function deliveryGateTemplate(): string {
  const width = Math.max(...GATE_AREAS.map((a) => a.length), "FINAL".length) + 2;
  const lines = [...GATE_AREAS, "FINAL"].map((a) =>
    a === "FINAL" ? `${a.padEnd(width)}PASS | FAIL` : `${a.padEnd(width)}PASS | FAIL | N/A  · one-line reason`,
  );
  return `\`\`\`\n${lines.join("\n")}\n\`\`\``;
}

function coreBody(installed: string[]): string {
  const skills = SKILLS.map((s) => {
    const mark = installed.includes(s.id) ? "" : " (not installed)";
    return `- \`ryux-${s.id}\`: ${s.summary}. Load when ${s.loadWhen}.${mark}`;
  });
  return `# ryux-core

> Ryux ${RULESET_VERSION} (rules v${RULES_VERSION}), MIT licensed. A senior product designer's
> reasoning for coding agents. Indonesia first, evidence first.

## Principle

${CORE_PRINCIPLE}

## Workflow

${CORE_WORKFLOW}

## Levels

${LEVELS}

## Load only what the task needs

${activationTable()}

${skills.join("\n")}

## Delivery Gate

End UI, UX, copy, or frontend work with this report:

${deliveryGateTemplate()}

${GATE_RULES}

## Honest claims

${CORE_HONESTY}

## Design Decision Record

${CORE_DECISION_RECORD}

Reference screens and structured review come from the ryux MCP (\`search_screens\`,
\`heuristic_eval\`, \`delivery_gate\`). Connect: \`${MCP_ADD_CMD}\``;
}

export function hardGatesTable(): string {
  return `| Hard Gate | Rules |\n| --- | --- |\n${HARD_GATES.map((h) => `| ${h.item} | ${h.rules.join(", ")} |`).join("\n")}`;
}

export function purposeGatesTable(): string {
  return `| Pattern | Acceptable when |\n| --- | --- |\n${PURPOSE_GATES.map((p) => `| ${p.pattern} | ${p.acceptableWhen} |`).join("\n")}`;
}

export function qualityLocksTable(): string {
  return `| Quality Lock | Rules |\n| --- | --- |\n${QUALITY_LOCKS.map((q) => `| ${q.item} | ${q.rules.join(", ")} |`).join("\n")}`;
}

function skillBody(id: string): string {
  const s = skillById(id);
  if (!s) return "";
  const extra =
    s.id === "anti-slop"
      ? `\n\n## Hard Gates\n\n${hardGatesTable()}\n\n## Purpose Gates\n\n${purposeGatesTable()}\n\n## Quality Locks\n\n${qualityLocksTable()}`
      : "";
  return `# ryux-${s.id}: ${s.label}

> Group ${groupLabel(s.group)} · Delivery Gate area ${s.gateArea} · ${RULESET_VERSION}. Levels are defined in \`ryux-core\`.

${GUIDES[s.id]}${extra}

## Rules

${rulesOf(s.id).map(ruleBlock).join("\n\n")}`;
}

const skillDescription = (s: Skill): string =>
  `Ryux ${s.label}: ${s.summary}. Load when ${s.loadWhen}.`;

// ── Claude Code skills ────────────────────────────────────────────────────────
export function renderCoreSkill(installed: string[]): string {
  return `---
name: ryux-core
description: Ryux core - the senior product designer workflow, levels, which Ryux skills to load for a task, the Delivery Gate report, and honest-claims wording. Load for any UI, UX, copy, or frontend task.
---

${coreBody(installed)}
`;
}

export function renderSkill(id: string): string {
  const s = skillById(id);
  if (!s) return "";
  return `---
name: ryux-${s.id}
description: ${skillDescription(s)}
---

${skillBody(id)}
`;
}

// ── Cursor .mdc ───────────────────────────────────────────────────────────────
export function renderCoreMdc(installed: string[]): string {
  return `---
description: Ryux core (workflow, levels, skill activation, Delivery Gate, honest claims)
globs:
alwaysApply: false
---

${coreBody(installed)}
`;
}

export function renderSkillMdc(id: string): string {
  const s = skillById(id);
  if (!s) return "";
  return `---
description: "${skillDescription(s)}"
globs:
alwaysApply: false
---

${skillBody(id)}
`;
}

// ── AGENTS.md block (core + selected skills, inline) ──────────────────────────
export function renderAgentsBlock(installed: string[]): string {
  const secs = installed.map(skillBody).filter(Boolean).join("\n\n");
  return `${coreBody(installed)}${secs ? `\n\n${secs}` : ""}`;
}

// ── Pointer block for CLAUDE.md ──────────────────────────────────────────────
export function renderClaudeBlock(installed: string[]): string {
  const list = ["ryux-core", ...installed.map((i) => `ryux-${i}`)].map((s) => `\`${s}\``).join(", ");
  return `## Ryux

Ryux design skills are installed: ${list} (in \`.claude/skills/\`). For UI, UX, copy, or frontend
work, follow the ryux-core workflow, load only the skills the task needs, and end with the
Delivery Gate. Reference data and structured review come from the ryux MCP: \`${MCP_ADD_CMD}\`.`;
}

// ── docs/design-rules.md generated sections ──────────────────────────────────
export function renderRulesDoc(): string {
  const sections = SKILLS.map((s) => {
    const intro = `### ryux-${s.id}: ${s.label} (RX-${s.abbr})\n\nGroup ${groupLabel(s.group)} · gate area ${s.gateArea}. Covers ${s.summary}. Load when ${s.loadWhen}.`;
    return `${intro}\n\n${rulesOf(s.id).map((r) => ruleBlock(r).replace(/^### /, "#### ")).join("\n\n")}`;
  });
  const counts = (["required", "preferred", "contextual"] as const)
    .map((l) => `${RULES.filter((r) => r.level === l).length} ${LEVEL_LABEL[l]}`)
    .join(", ");
  const hard = RULES.filter((r) => r.gate === "hard").length;
  const locks = RULES.filter((r) => r.gate === "lock").length;
  return `${RULES.length} rules across ${SKILLS.length} skills: ${counts}; ${hard} Hard Gates and ${locks} Quality Locks.\n\n${sections.join("\n\n---\n\n")}`;
}

export function renderMigrationTable(): string {
  const rows: [string, string][] = [];
  for (const r of RULES) for (const old of r.formerly ?? []) rows.push([old, r.id]);
  rows.sort((a, b) => a[0].localeCompare(b[0], "en", { numeric: true }));
  const grouped = new Map<string, string[]>();
  for (const [old, now] of rows) grouped.set(old, [...(grouped.get(old) ?? []), now]);
  const lines = [...grouped.entries()].map(([old, now]) => `| ${old} | ${now.join(", ")} |`);
  return `| RX-1.x ID | ${RULESET_VERSION} ID |\n| --- | --- |\n${lines.join("\n")}`;
}

export function groupsTable(): string {
  return [
    "| Group | Skills |",
    "| --- | --- |",
    ...GROUPS.map((g) => `| \`${g.id}\` | ${SKILLS.filter((s) => s.group === g.id).map((s) => `\`ryux-${s.id}\` (RX-${s.abbr})`).join(", ")} |`),
  ].join("\n");
}

// Detect installed skill ids from a piece of content (an AGENTS.md block, etc.).
export function detectSkills(content: string): string[] {
  return ALL_SKILL_IDS.filter((id) => content.includes(`# ryux-${id}:`));
}
