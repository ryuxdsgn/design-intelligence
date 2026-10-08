import {
  ACTIVATION,
  GATE_AREAS,
  GROUPS,
  HARD_GATES,
  LEVEL_LABEL,
  PURPOSE_GATES,
  QUALITY_LOCKS,
  RETIRED,
  RULES,
  SKILLS,
  type Rule,
  type Skill,
} from "./intelligence/content.js";
import { MCP_LOCAL_ADD_CMD, VERSION } from "./product.js";
import {
  CORE_CAPABILITIES,
  CORE_DECISION_RECORD,
  CORE_EVIDENCE,
  CORE_HONESTY,
  CORE_POSITIONING,
  CORE_PRINCIPLE,
  CORE_WORKFLOW,
  BUILD_BODY,
  DESIGN_BODY,
  GATE_RULES,
  GUIDES,
} from "./intelligence/guides.js";
import { CRITIQUE_BODY, CRITIQUE_DESCRIPTION } from "./intelligence/critique.js";
import { ANALYZE_BODY, ANALYZE_DESCRIPTION } from "./intelligence/analyze.js";

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
  const rows = ACTIVATION.map((a) => `| ${a.task} | ${a.skills.map((s) => `\`${modulePath(s)}\``).join(", ")} |`);
  return `| Task | Read |\n| --- | --- |\n${rows.join("\n")}\n| Review or critique | \`capabilities/critique.md\` (Design Read + heuristic_eval), plus \`capabilities/qa.md\` |`;
}

export function deliveryGateTemplate(): string {
  const width = Math.max(...GATE_AREAS.map((a) => a.length), "FINAL".length) + 2;
  const lines = [...GATE_AREAS, "FINAL"].map((a) =>
    a === "FINAL"
      ? `${a.padEnd(width)}PASS | FAIL`
      : a === "UI"
        ? `${a.padEnd(width)}PASS | FAIL | N/A  · one-line reason · point of view: <concept> | task UI`
        : a === "PRODUCT"
        ? `${a.padEnd(width)}PASS | FAIL | N/A  · one-line reason · evidence Strong | Thin | None`
        : `${a.padEnd(width)}PASS | FAIL | N/A  · one-line reason`,
  );
  return `\`\`\`\n${lines.join("\n")}\n\`\`\``;
}

function routerBody(): string {
  return `# RYUX

> Design intelligence for AI agents and designers. RYUX ${VERSION}, MIT licensed.

${CORE_POSITIONING}

## Start with what you are doing

${CORE_CAPABILITIES}

## How RYUX works

${CORE_WORKFLOW}

## Principle

${CORE_PRINCIPLE}

## Evidence model

${CORE_EVIDENCE}

## Levels

${LEVELS}

## Hard Gates (always apply)

No written exception; fix before delivery.

${hardGatesBrief()}

## Task table: which knowledge to read

${activationTable()}

## Delivery Gate

End UI, UX, copy, or frontend work with this report:

${deliveryGateTemplate()}

${GATE_RULES}

## Honest claims

${CORE_HONESTY}

## Design Decision Record

${CORE_DECISION_RECORD}

Reference screens and structured review come from the ryux MCP (\`search_screens\`,
\`heuristic_eval\`, \`delivery_gate\`). The hosted server is not live yet; run it locally and connect:
\`${MCP_LOCAL_ADD_CMD}\``;
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

> Group ${groupLabel(s.group)} · Delivery Gate area ${s.gateArea} · RYUX ${VERSION}. Levels are defined in \`ryux-core\`.

${GUIDES[s.id]}${extra}

## Evidence from RYUX Knowledge

${s.evidence} Without the ryux MCP, say the evidence comes from the design and standards alone.

> Hard Gates always apply, whichever skills are loaded: no invented numbers, people, urgency, business
> rules, or terms; no placeholder shipped as final; no missing critical states. See \`ryux-core\`.

## Rules

${rulesOf(s.id).map(ruleBlock).join("\n\n")}`;
}

export const SKILL_NAME = "ryux";

const RYUX_DESCRIPTION =
  "RYUX - design intelligence for AI agents and designers. Tell it what you are doing and it routes to Analyze (understand an existing interface), Design (create or improve UI and UX in Figma, pen.dev, or mockups), Build (implement in code), Critique (find what to change first, with evidence), or QA (verify a build against the design), reads only the knowledge the task needs (product, UX, UI, interaction, forms, content, accessibility, responsive, design system, frontend, anti-slop), and closes with quality gates. Use for any UI, UX, copy, frontend, design review, or design analysis task.";

/** Where a former skill id lives inside the single `ryux` skill folder. */
export function modulePath(id: string): string | null {
  if (id === "core") return "SKILL.md";
  if (id === "analyze" || id === "critique" || id === "design" || id === "build") return `capabilities/${id}.md`;
  if (id === "visual-qa") return "capabilities/qa.md";
  if (SKILLS.some((s) => s.id === id)) return `knowledge/${id}.md`;
  return null;
}

/** Rewrite references to the former 16 skills (ryux-forms, `ryux-critique`) as module paths. */
export function toModuleRefs(text: string): string {
  return text.replace(/`ryux-([a-z]+(?:-[a-z]+)*)`|\bryux-([a-z]+(?:-[a-z]+)*)\b/g, (m, a?: string, b?: string) => {
    const path = modulePath((a ?? b) as string);
    return path ? `\`${path}\`` : m;
  });
}

function knowledgeModule(id: string): string {
  const s = skillById(id)!;
  const body = skillBody(id).split("\n").slice(1).join("\n").trimStart();
  return `# ${s.label}\n\n${s.pitch ? `${s.pitch}\n\n` : ""}${body}`;
}

/** The single installable skill: relative path -> file content. */
export function renderBundle(): Record<string, string> {
  const files: Record<string, string> = {
    "SKILL.md": `---\nname: ${SKILL_NAME}\ndescription: ${JSON.stringify(RYUX_DESCRIPTION)}\n---\n\n${routerBody()}\n`,
    "capabilities/analyze.md": `${ANALYZE_BODY}\n`,
    "capabilities/design.md": `${DESIGN_BODY}\n`,
    "capabilities/build.md": `${BUILD_BODY}\n`,
    "capabilities/critique.md": `${CRITIQUE_BODY}\n`,
    "capabilities/qa.md": `${knowledgeModule("visual-qa")}\n`,
  };
  for (const s of SKILLS) if (s.id !== "visual-qa") files[`knowledge/${s.id}.md`] = `${knowledgeModule(s.id)}\n`;
  for (const k of Object.keys(files)) files[k] = toModuleRefs(files[k]);
  return files;
}

// ── AGENTS.md block (the whole skill, inline) ─────────────────────────────────
export function renderAgentsBlock(): string {
  const files = renderBundle();
  const router = files["SKILL.md"].replace(/^---[\s\S]*?---\n\n/, "");
  const rest = Object.entries(files)
    .filter(([k]) => k !== "SKILL.md")
    .map(([k, v]) => `<!-- ${k} -->\n${v.trim()}`)
    .join("\n\n");
  return `${router.trim()}\n\n${rest}`;
}

// ── Pointer block for CLAUDE.md / GEMINI.md / AGENTS.md ─────────────────────
export function renderPointerBlock(): string {
  return `## RYUX

RYUX is installed as one skill, \`ryux\`, in this project's agent skills folder. For UI, UX, copy, or
frontend work, say what you are doing (analyze, design, build, critique, or QA); RYUX picks the
knowledge it needs and ends with the Delivery Gate. Reference data and structured review come from
the ryux MCP (hosted server not live yet; local: \`${MCP_LOCAL_ADD_CMD}\`).`;
}

// ── docs/design-rules.md generated sections ──────────────────────────────────
export function renderRulesDoc(): string {
  const sections = SKILLS.map((s) => {
    const intro = `### ${s.label} (RX-${s.abbr}) · \`${modulePath(s.id)}\`\n\nGate area ${s.gateArea}. Covers ${s.summary}. Read when ${s.loadWhen}.`;
    return `${intro}\n\n${rulesOf(s.id).map((r) => ruleBlock(r).replace(/^### /, "#### ")).join("\n\n")}`;
  });
  const counts = (["required", "preferred", "contextual"] as const)
    .map((l) => `${RULES.filter((r) => r.level === l).length} ${LEVEL_LABEL[l]}`)
    .join(", ");
  const hard = RULES.filter((r) => r.gate === "hard").length;
  const locks = RULES.filter((r) => r.gate === "lock").length;
  return toModuleRefs(`${RULES.length} rules across ${SKILLS.length} modules: ${counts}; ${hard} Hard Gates and ${locks} Quality Locks.\n\n${sections.join("\n\n---\n\n")}`);
}

// ── docs/design-rules.md: rule provenance ───────────────────────────────────
// Where each rule comes from, read from its basis (the source printed at the end of its Why line). A rule can cite
// several kinds of source. Where a rule comes from says nothing about how good or effective it is.
const PROVENANCE: { label: string; test: RegExp }[] = [
  {
    label: "Public standard or research",
    test: /WCAG|W3C|Nielsen|NNGroup|Baymard|Apple HIG|Material|Hick's law|HTML inputmode|prefers-reduced-motion|PUEBI|QRIS standard|UU PDP|OJK|locale conventions/,
  },
  { label: "Industry practice", test: /\b(?:[Cc]lean-code|Design-system|[Aa]rt direction|[Ll]icensing and trademark|Localization|Testing|responsive design) practice/ },
  { label: "Observed in a RYUX run", test: /ryux run|ryux README checkout image/ },
  {
    label: "RYUX principle, taxonomy, or review",
    test: /ryux (?:[a-z-]+ )?(?:principle|taxonomy|reference screens|review practice|interaction model|visual QA loop)|critique\.md` playbook|Critique Design Read|owner review/,
  },
];

const citation = (r: Rule): string => r.basis;

export function renderProvenanceDoc(): string {
  const kinds = RULES.map((r) => ({ id: r.id, kinds: PROVENANCE.filter((p) => p.test.test(citation(r))).map((p) => p.label) }));
  const unmatched = kinds.filter((k) => k.kinds.length === 0).map((k) => k.id);
  if (unmatched.length) throw new Error(`rule provenance: no source kind for ${unmatched.join(", ")}`);
  const rows = PROVENANCE.map((p) => {
    const ids = kinds.filter((k) => k.kinds.includes(p.label)).map((k) => k.id);
    const only = kinds.filter((k) => k.kinds.length === 1 && k.kinds[0] === p.label).length;
    return `| ${p.label} | ${ids.length} | ${only} |`;
  });
  return `| Source cited | Rules citing it | Rules citing only this |\n| --- | --- | --- |\n${rows.join("\n")}\n\nAll ${RULES.length} rules cite a source; ${kinds.filter((k) => k.kinds.length > 1).length} cite more than one kind, so the "Rules citing it" column adds up to more than ${RULES.length}.`;
}

export function renderMigrationTable(): string {
  const rows: [string, string][] = [];
  for (const r of RULES) for (const old of r.formerly ?? []) rows.push([old, r.id]);
  for (const [id, x] of Object.entries(RETIRED)) for (const old of x.formerly ?? []) rows.push([old, `${x.to} (retired ${id})`]);
  rows.sort((a, b) => a[0].localeCompare(b[0], "en", { numeric: true }));
  const grouped = new Map<string, string[]>();
  for (const [old, now] of rows) grouped.set(old, [...(grouped.get(old) ?? []), now]);
  const lines = [...grouped.entries()].map(([old, now]) => `| ${old} | ${now.join(", ")} |`);
  return `| RX-1.x ID | Current ID |\n| --- | --- |\n${lines.join("\n")}`;
}

export function retiredTable(): string {
  const rows = Object.entries(RETIRED).map(([id, x]) => `| ${id} | ${x.to} |`);
  return `| Retired ID | Now in |\n| --- | --- |\n${rows.join("\n")}`;
}

export function groupsTable(): string {
  const rows = [
    "| `SKILL.md` | the router: entry points, how RYUX works, levels, Hard Gates, task table, Delivery Gate | |",
    "| `capabilities/analyze.md` | Analyze: inventory of an existing interface | |",
    "| `capabilities/design.md` | Design: create or improve UI and UX without code | |",
    "| `capabilities/build.md` | Build: implement in the repo's own stack | |",
    "| `capabilities/critique.md` | Critique: Design Read and evidence-backed findings | |",
    ...SKILLS.map((x) => `| \`${modulePath(x.id)}\` | ${x.label}: ${x.summary} | RX-${x.abbr} |`),
  ];
  return ["| File | What it holds | Rules |", "| --- | --- | --- |", ...rows].join("\n");
}
