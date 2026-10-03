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
  RETIRED,
  RULES,
  RULES_VERSION,
  RULESET_VERSION,
  SKILLS,
  type Rule,
  type Skill,
} from "./content.js";
import {
  CORE_CAPABILITIES,
  CORE_DECISION_RECORD,
  CORE_HONESTY,
  CORE_POSITIONING,
  CORE_PRINCIPLE,
  CORE_WORKFLOW,
  GATE_RULES,
  GUIDES,
} from "./guides.js";
import { CRITIQUE_BODY, CRITIQUE_DESCRIPTION } from "./critique.js";
import { ANALYZE_BODY, ANALYZE_DESCRIPTION } from "./analyze.js";

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
  if (r.notWhen) lines.push(`- Not when: ${r.notWhen}`);
  if (r.tradeoff) lines.push(`- Trade-off: ${r.tradeoff}`);
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
    a === "FINAL"
      ? `${a.padEnd(width)}PASS | FAIL`
      : a === "PRODUCT"
        ? `${a.padEnd(width)}PASS | FAIL | N/A  · one-line reason · evidence Strong | Thin | None`
        : `${a.padEnd(width)}PASS | FAIL | N/A  · one-line reason`,
  );
  return `\`\`\`\n${lines.join("\n")}\n\`\`\``;
}

function coreBody(installed: string[]): string {
  const missing = SKILLS.filter((s) => !installed.includes(s.id)).map((s) => `\`ryux-${s.id}\``);
  const note = missing.length ? `\n\nNot installed here: ${missing.join(", ")}.` : "";
  return `# ryux-core

> RYUX ${RULESET_VERSION} (rules v${RULES_VERSION}), MIT licensed. Evidence first, local where it matters.

${CORE_POSITIONING}

## Start by choosing the capability

${CORE_CAPABILITIES}

## Principle

${CORE_PRINCIPLE}

## Workflow

${CORE_WORKFLOW}

## Levels

${LEVELS}

## Hard Gates (always apply)

These hold even when \`ryux-anti-slop\` is not loaded. No written exception; fix before delivery.

${hardGatesBrief()}

## Build: load only what the task needs

${activationTable()}${note}

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

function hardGatesBrief(): string {
  return HARD_GATES.map((h) => {
    const r = RULES.find((x) => x.id === h.rules[0]);
    const dont = r ? `Do not ${r.dont.charAt(0).toLowerCase()}${r.dont.slice(1)}` : "";
    return `- **${h.item}.** ${dont} (${h.rules.join(", ")})`;
  }).join("\n");
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

## Evidence from RYUX Knowledge

${s.evidence} Without the ryux MCP, say the evidence comes from the design and standards alone.

> Hard Gates always apply, whichever skills are loaded: no invented numbers, people, urgency, business
> rules, or terms; no placeholder shipped as final; no missing critical states. See \`ryux-core\`.

## Rules

${rulesOf(s.id).map(ruleBlock).join("\n\n")}`;
}

const CORE_DESCRIPTION =
  "RYUX core - a design intelligence layer for AI and designers. Choose the capability (Analyze, Build, Critique, QA), then the levels, which RYUX skills to load, the Hard Gates, the Delivery Gate, and honest-claims wording. Load for any UI, UX, copy, or frontend task.";

const skillDescription = (s: Skill): string =>
  `RYUX ${s.label}: ${s.summary}. Load when ${s.loadWhen}.`;

// ── Claude Code skills ────────────────────────────────────────────────────────
export function renderCoreSkill(installed: string[]): string {
  return `---
name: ryux-core
description: ${JSON.stringify(CORE_DESCRIPTION)}
---

${coreBody(installed)}
`;
}

export function renderAnalyzeSkill(): string {
  return `---
name: ryux-analyze
description: ${JSON.stringify(ANALYZE_DESCRIPTION)}
---

${ANALYZE_BODY}
`;
}

export function renderCritiqueSkill(): string {
  return `---
name: ryux-critique
description: ${JSON.stringify(CRITIQUE_DESCRIPTION)}
---

${CRITIQUE_BODY}
`;
}

export function renderSkill(id: string): string {
  if (id === "critique") return renderCritiqueSkill();
  if (id === "analyze") return renderAnalyzeSkill();
  const s = skillById(id);
  if (!s) return "";
  return `---
name: ryux-${s.id}
description: ${JSON.stringify(skillDescription(s))}
---

${skillBody(id)}
`;
}

// ── AGENTS.md block (core + selected skills, inline) ──────────────────────────
export function renderAgentsBlock(installed: string[]): string {
  const body = (id: string): string => (id === "critique" ? CRITIQUE_BODY : id === "analyze" ? ANALYZE_BODY : skillBody(id));
  const secs = installed.map(body).filter(Boolean).join("\n\n");
  return `${coreBody(installed)}${secs ? `\n\n${secs}` : ""}`;
}

// ── Pointer block for CLAUDE.md / GEMINI.md / AGENTS.md ─────────────────────
export function renderPointerBlock(installed: string[]): string {
  const list = ["ryux-core", ...installed.map((i) => `ryux-${i}`)].map((s) => `\`${s}\``).join(", ");
  return `## RYUX

RYUX design skills are installed in this project's agent skills folder: ${list}. For UI, UX, copy, or
frontend work, start in ryux-core by choosing the capability (Analyze, Build, Critique, QA), load only the
skills the task needs, and end with the Delivery Gate. Reference data and structured review come from the
ryux MCP: \`${MCP_ADD_CMD}\`.`;
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
  for (const [id, x] of Object.entries(RETIRED)) for (const old of x.formerly ?? []) rows.push([old, `${x.to} (retired ${id})`]);
  rows.sort((a, b) => a[0].localeCompare(b[0], "en", { numeric: true }));
  const grouped = new Map<string, string[]>();
  for (const [old, now] of rows) grouped.set(old, [...(grouped.get(old) ?? []), now]);
  const lines = [...grouped.entries()].map(([old, now]) => `| ${old} | ${now.join(", ")} |`);
  return `| RX-1.x ID | ${RULESET_VERSION} ID |\n| --- | --- |\n${lines.join("\n")}`;
}

export function retiredTable(): string {
  const rows = Object.entries(RETIRED).map(([id, x]) => `| ${id} | ${x.to} |`);
  return `| Retired ID | Now in |\n| --- | --- |\n${rows.join("\n")}`;
}

export function groupsTable(): string {
  return [
    "| Group | Skills |",
    "| --- | --- |",
    ...GROUPS.map((g) => {
      const knowledge = SKILLS.filter((s) => s.group === g.id).map((s) => `\`ryux-${s.id}\` (RX-${s.abbr})`);
      const cell = knowledge.length ? knowledge.join(", ") : `\`ryux-${g.id}\` (capability skill)`;
      return `| \`${g.id}\` | ${cell} |`;
    }),
  ].join("\n");
}

// Detect installed skill ids from a piece of content (an AGENTS.md block, etc.).
export function detectSkills(content: string): string[] {
  return [...ALL_SKILL_IDS, "analyze", "critique"].filter((id) => content.includes(`# ryux-${id}:`));
}
