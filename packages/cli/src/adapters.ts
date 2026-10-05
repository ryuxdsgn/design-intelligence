// Agent adapters: where each agent reads skills and which instruction file points to RYUX. Pure data;
// the install logic in cli/ reads it. Add an agent here, not in the install code.
import type { SkillId } from "./intelligence/content.js";

export type PointerFile = "CLAUDE.md" | "GEMINI.md" | "AGENTS.md";

export interface AgentTarget {
  id: string;
  label: string;
  dir: string;
  globalDir: string;
  pointer: PointerFile;
}

export const AGENT_TARGETS: AgentTarget[] = [
  { id: "claude", label: "Claude Code", dir: ".claude/skills", globalDir: ".claude/skills", pointer: "CLAUDE.md" },
  { id: "codex", label: "Codex", dir: ".codex/skills", globalDir: ".agents/skills", pointer: "AGENTS.md" },
  { id: "cursor", label: "Cursor", dir: ".cursor/skills", globalDir: ".cursor/skills", pointer: "AGENTS.md" },
  { id: "gemini", label: "Gemini CLI", dir: ".gemini/skills", globalDir: ".gemini/skills", pointer: "GEMINI.md" },
  { id: "opencode", label: "OpenCode", dir: ".opencode/skills", globalDir: ".config/opencode/skills", pointer: "AGENTS.md" },
  { id: "cline", label: "Cline", dir: ".cline/skills", globalDir: ".cline/skills", pointer: "AGENTS.md" },
  { id: "copilot", label: "GitHub Copilot", dir: ".agents/skills", globalDir: ".agents/skills", pointer: "AGENTS.md" },
  { id: "amp", label: "Amp", dir: ".agents/skills", globalDir: ".config/agents/skills", pointer: "AGENTS.md" },
  { id: "kimi", label: "Kimi Code", dir: ".agents/skills", globalDir: ".agents/skills", pointer: "AGENTS.md" },
  { id: "antigravity", label: "Antigravity", dir: ".agents/skills", globalDir: ".gemini/config/skills", pointer: "AGENTS.md" },
];

/** Inline target for any other agent: the full rules written into AGENTS.md (project only). */
export const AGENTS_MD_INLINE = { id: "agents-md", label: "Any other agent (rules inline in AGENTS.md)" };

// Old per-concern installs (ruleset RX-1.x) mapped to the new skills, for --concerns.
// RX-1.x --concerns values mapped to current skill ids (kept for migration).
export const LEGACY_CONCERNS: Record<string, SkillId[]> = {
  ui: ["ui", "design-system", "responsive"],
  copy: ["content"],
  a11y: ["accessibility"],
  ux: ["ux", "interaction", "forms", "edge-cases"],
  local: ["product", "interaction", "forms", "content"],
  code: ["frontend"],
};

// Skill folder names from earlier releases that no longer exist. "ui" and "ux" are not listed:
// they are current skill names again and get overwritten or removed with the current set.
export const LEGACY_SKILL_DIRS = ["rules", "copy", "a11y", "local", "code"];

/** Cursor used .mdc rule files before it read skill folders (ryux-rules 0.x). */
export const LEGACY_CURSOR_RULES_DIR = ".cursor/rules";
