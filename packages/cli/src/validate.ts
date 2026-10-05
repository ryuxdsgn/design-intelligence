// Deterministic validation of a RYUX skill bundle. Pure: takes the files, returns findings. Used by
// `ryux check`, by `sync-skills --check`, and by the tests, so all three agree on what "valid" means.
import { RETIRED, RULES, SKILLS } from "./intelligence/content.js";

export interface BundleReport {
  errors: string[];
  warnings: string[];
  /** The version written in the router header, when found. */
  version: string | null;
}

/** Every file a complete bundle must contain, relative to the skill folder. */
export function expectedFiles(): string[] {
  return [
    "SKILL.md",
    ...["analyze", "design", "build", "critique", "qa"].map((c) => `capabilities/${c}.md`),
    ...SKILLS.filter((s) => s.id !== "visual-qa").map((s) => `knowledge/${s.id}.md`),
  ];
}

const OLD_NAMES = new RegExp(`\\bryux-(core|${["analyze", "critique", ...SKILLS.map((s) => s.id)].join("|")})\\b`, "g");

export function validateBundle(files: Record<string, string>): BundleReport {
  const errors: string[] = [];
  const warnings: string[] = [];
  const ruleIds = new Set(RULES.map((r) => r.id));

  for (const f of expectedFiles()) if (!(f in files)) errors.push(`missing ${f}`);

  const router = files["SKILL.md"] ?? "";
  const fm = router.match(/^---\n([\s\S]*?)\n---\n/);
  if (!fm) errors.push("SKILL.md has no frontmatter");
  else {
    if (!/^name: ryux$/m.test(fm[1])) errors.push('SKILL.md frontmatter: name must be "ryux"');
    const desc = fm[1].match(/^description: (.*)$/m)?.[1];
    if (!desc) errors.push("SKILL.md frontmatter: description is missing");
    else if (desc.length > 1024) warnings.push(`SKILL.md description is ${desc.length} characters; agents may truncate it`);
  }
  const version = router.match(/RYUX (\d+\.\d+\.\d+)/)?.[1] ?? null;
  if (!version) errors.push("SKILL.md has no RYUX version marker");
  const routerLines = router.split("\n").length;
  if (routerLines > 180) warnings.push(`SKILL.md is ${routerLines} lines; the router is read on every task`);

  for (const [path, text] of Object.entries(files)) {
    for (const m of text.matchAll(/`((?:knowledge|capabilities)\/[a-z-]+\.md)`/g)) {
      if (!(m[1] in files)) errors.push(`${path}: reference to ${m[1]}, which does not exist`);
    }
    for (const m of text.matchAll(/RX-[A-Z0-9]+-\d{2}/g)) {
      if (!ruleIds.has(m[0]) && !(m[0] in RETIRED)) errors.push(`${path}: unknown rule ${m[0]}`);
    }
    const old = [...new Set([...text.matchAll(OLD_NAMES)].map((m) => m[0]))];
    if (old.length) errors.push(`${path}: RYUX 1.x skill names left in the text (${old.join(", ")})`);
  }
  return { errors, warnings, version };
}

/** Internal consistency of the rule set itself (no files needed). */
export function validateRules(): string[] {
  const errors: string[] = [];
  const seen = new Set<string>();
  for (const r of RULES) {
    if (seen.has(r.id)) errors.push(`duplicate rule id ${r.id}`);
    seen.add(r.id);
    if (r.id in RETIRED) errors.push(`${r.id} is retired but reused`);
    if (r.level === "contextual" && !r.when) errors.push(`${r.id} is contextual but has no "when"`);
  }
  return errors;
}
