#!/usr/bin/env node
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
import * as p from "@clack/prompts";
import pc from "picocolors";
import {
  AGENT_TARGETS,
  AGENTS_MD_INLINE,
  LEGACY_CURSOR_RULES_DIR,
  LEGACY_SKILL_DIRS,
  type AgentTarget,
  type PointerFile,
} from "../adapters.js";
import { ALL_INSTALLABLE_IDS } from "../intelligence/content.js";
import { CLI_CMD, CONTEXT_END, CONTEXT_FILE, CONTEXT_START, MARK_START, MCP_STATUS, VERSION } from "../product.js";
import { validateBundle } from "../validate.js";
import { renderAgentsBlock, renderBundle, renderPointerBlock, SKILL_NAME } from "../render.js";
import { hasBlock, readIfExists, rel, removeBlock, removePath, upsertBlock, writeFileEnsured } from "./fsutil.js";
import { hasHook, installHook, removeHook } from "./hook.js";
import { runScan } from "./scan.js";
import { readFile, readdir } from "node:fs/promises";

type Flags = Record<string, string | boolean>;

interface Scope {
  global: boolean;
  root: string;
}

const AGENT_IDS = [...AGENT_TARGETS.map((a) => a.id), AGENTS_MD_INLINE.id];
const targetDir = (a: AgentTarget, scope: Scope): string => join(scope.root, scope.global ? a.globalDir : a.dir);

/** Unique skill folders for the chosen agents (agents that share a folder are written once). */
function dirsFor(agentIds: string[], scope: Scope): string[] {
  const dirs = AGENT_TARGETS.filter((a) => agentIds.includes(a.id)).map((a) => targetDir(a, scope));
  return [...new Set(dirs)];
}

function pointersFor(agentIds: string[]): PointerFile[] {
  const files = AGENT_TARGETS.filter((a) => agentIds.includes(a.id)).map((a) => a.pointer);
  return [...new Set(files)];
}

async function removeLegacy(dir: string, root: string): Promise<string[]> {
  const done: string[] = [];
  for (const c of LEGACY_SKILL_DIRS) {
    const target = join(dir, `ryux-${c}`);
    if (await removePath(target)) done.push(`${rel(target)} (legacy)`);
  }
  const cursorRules = join(root, LEGACY_CURSOR_RULES_DIR);
  if (existsSync(cursorRules)) {
    for (const f of readdirSync(cursorRules)) {
      if (f.startsWith("ryux-") && f.endsWith(".mdc") && (await removePath(join(cursorRules, f)))) {
        done.push(`${rel(join(cursorRules, f))} (legacy)`);
      }
    }
  }
  return done;
}

/** Former per-skill folders (RYUX 1.x), removed when the single `ryux` skill is written. */
const OLD_SKILL_DIRS = ["core", ...ALL_INSTALLABLE_IDS].map((id) => `ryux-${id}`);

async function writeSkills(dir: string, root: string): Promise<string[]> {
  const done = await removeLegacy(dir, root);
  for (const name of OLD_SKILL_DIRS) if (await removePath(join(dir, name))) done.push(`${rel(join(dir, name))} (replaced)`);
  const skillDir = join(dir, SKILL_NAME);
  await removePath(skillDir);
  const files = renderBundle();
  for (const [path, content] of Object.entries(files)) await writeFileEnsured(join(skillDir, path), content);
  done.push(`${rel(skillDir)}/ (${Object.keys(files).length} files)`);
  return done;
}

async function install(agentIds: string[], scope: Scope): Promise<string[]> {
  const done: string[] = [];
  for (const dir of dirsFor(agentIds, scope)) done.push(...(await writeSkills(dir, scope.root)));
  if (scope.global) return done;

  const inline = agentIds.includes(AGENTS_MD_INLINE.id);
  for (const file of pointersFor(agentIds)) {
    if (file === "AGENTS.md" && inline) continue;
    await upsertBlock(join(scope.root, file), renderPointerBlock());
    done.push(`${file} (block)`);
  }
  if (inline) {
    await upsertBlock(join(scope.root, "AGENTS.md"), renderAgentsBlock());
    done.push("AGENTS.md (rules inline)");
  }
  return done;
}

/** What install would do, without writing: each skill folder and pointer block, created or updated. */
async function planInstall(agentIds: string[], scope: Scope): Promise<string[]> {
  const plan: string[] = [];
  for (const dir of dirsFor(agentIds, scope)) {
    const skillDir = join(dir, SKILL_NAME);
    const old = OLD_SKILL_DIRS.filter((n) => existsSync(join(dir, n))).length;
    plan.push(`${existsSync(skillDir) ? "update" : "create"} ${rel(skillDir)}/ (${Object.keys(renderBundle()).length} files)`);
    if (old) plan.push(`replace ${old} RYUX 1.x folder${old === 1 ? "" : "s"} in ${rel(dir)}`);
  }
  if (scope.global) return plan;
  const inline = agentIds.includes(AGENTS_MD_INLINE.id);
  const files = pointersFor(agentIds).filter((f) => !(f === "AGENTS.md" && inline));
  for (const file of [...files, ...(inline ? (["AGENTS.md"] as PointerFile[]) : [])]) {
    const content = await readIfExists(join(scope.root, file));
    const what = file === "AGENTS.md" && inline ? "rules inline" : "pointer block";
    plan.push(content === null ? `create ${file} with the ${what}` : hasBlock(content) ? `update the ${what} in ${file}` : `add the ${what} to ${file} (the rest of the file is kept)`);
  }
  return plan;
}

const hasInstall = (dir: string): boolean =>
  existsSync(join(dir, SKILL_NAME, "SKILL.md")) || existsSync(join(dir, "ryux-core")) || existsSync(join(dir, "ryux-rules"));

/** Skill folders that already hold a RYUX install (the single skill, or the RYUX 1.x folders). */
function detectInstalled(scope: Scope): string[] {
  return [...new Set(AGENT_TARGETS.map((a) => targetDir(a, scope)))].filter(hasInstall);
}

/** Agent ids whose folders hold a RYUX install (or, for preselection, whose folders exist). */
function agentsAt(scope: Scope, requireInstall: boolean): string[] {
  return AGENT_TARGETS.filter((a) => {
    const dir = targetDir(a, scope);
    return requireInstall ? hasInstall(dir) : existsSync(join(dir, ".."));
  }).map((a) => a.id);
}

function parseFlags(argv: string[]): Flags {
  const flags: Flags = {};
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

const list = (v: string | boolean | undefined): string[] | null =>
  typeof v === "string" ? v.split(",").map((s) => s.trim()).filter(Boolean) : null;

const scopeOf = (flags: Flags): Scope => ({ global: Boolean(flags.global), root: flags.global ? homedir() : process.cwd() });

function cancel(): void {
  p.cancel("Cancelled.");
}

async function runInstall(flags: Flags): Promise<void> {
  const scope = scopeOf(flags);
  const flagAgents = list(flags.agent);
  const nonInteractive = Boolean(flagAgents);
  if (flags.for || flags.groups || flags.concerns) {
    console.log(pc.yellow("RYUX 2 installs one skill that picks the knowledge each task needs; --for, --groups, and --concerns are no longer needed."));
  }

  let agents: string[];
  let showMcp: boolean;

  if (flagAgents) {
    agents = flagAgents.includes("all") ? AGENT_TARGETS.map((a) => a.id) : flagAgents.filter((a) => AGENT_IDS.includes(a));
    showMcp = Boolean(flags.mcp);
    if (!agents.length) {
      console.error(`Invalid agent.\nAgents: ${AGENT_IDS.join(",")},all`);
      process.exitCode = 2;
      return;
    }
  } else {
    if (!process.stdin.isTTY) {
      console.error(`Interactive mode needs a terminal. Use flags, e.g.: ${CLI_CMD} install --agent claude,cursor`);
      process.exitCode = 1;
      return;
    }
    p.intro(pc.bgCyan(pc.black(" RYUX ")));
    p.log.message(KEY_LEGEND);
    const detected = agentsAt(scope, false);
    const a = await p.multiselect({
      message: "Which agents do you use? Pick any (a selects all).",
      options: [
        ...AGENT_TARGETS.map((x) => ({ value: x.id, label: x.label, hint: scope.global ? `~/${x.globalDir}` : x.dir })),
        { value: AGENTS_MD_INLINE.id, label: AGENTS_MD_INLINE.label, hint: "AGENTS.md" },
      ],
      initialValues: detected.length ? detected : ["claude"],
      required: true,
    });
    if (p.isCancel(a)) return cancel();
    agents = a as string[];
    showMcp = false;
  }

  if (scope.global && agents.includes(AGENTS_MD_INLINE.id)) {
    console.log(pc.yellow("agents-md is project-only; skipped for --global."));
    agents = agents.filter((x) => x !== AGENTS_MD_INLINE.id);
  }

  let hook = Boolean(flags.hook);
  if (!nonInteractive && agents.includes("claude")) {
    const h = await p.confirm({ message: "Run ryux scan on each file Claude Code edits? (adds a hook to .claude/settings.json)", initialValue: false });
    if (p.isCancel(h)) return cancel();
    hook = h;
  }
  if (hook && !agents.includes("claude")) {
    console.log(pc.yellow("--hook works with Claude Code only for now; skipped."));
    hook = false;
  }

  if (flags["dry-run"]) {
    const plan = await planInstall(agents, scope);
    if (hook) plan.push(`${(await hasHook(scope.root)) ? "update" : "add"} the scan hook in .claude/settings.json (runs ryux scan after each edit)`);
    console.log(`Dry run: nothing was written. ${CLI_CMD} ${flags.init ? "init" : "install"} would:\n${plan.map((l) => `  ${l}`).join("\n")}`);
    return;
  }
  const written = await install(agents, scope);
  if (hook) written.push(await installHook(scope.root));
  const summary = written.map((w) => pc.green("✓ ") + w).join("\n");
  if (nonInteractive) console.log(summary);
  else p.note(summary, "Installed");

  if (showMcp) {
    if (nonInteractive) console.log(`\nMCP: ${MCP_STATUS}`);
    else p.note(MCP_STATUS, "ryux MCP");
  }
  if (nonInteractive) return;
  let answers: Record<string, string> = {};
  if (!scope.global) {
    const s = await p.confirm({ message: "Set up project context now? Every question can be skipped.", initialValue: true });
    if (p.isCancel(s)) return cancel();
    if (s) {
      const a = await setupInteractive(scope.root);
      if (!a) return cancel();
      answers = a;
    } else p.log.info(`Set it up later with: ${CLI_CMD} setup`);
  }
  p.note(suggestionsText(answers), "Try");
  p.outro("RYUX is ready.");
}

async function runUpdate(flags: Flags): Promise<void> {
  const scope = scopeOf(flags);
  const dirs = detectInstalled(scope);
  const agentsFile = scope.global ? null : await readIfExists(join(scope.root, "AGENTS.md"));
  const inline = Boolean(agentsFile?.includes(MARK_START) && (agentsFile.includes("# RYUX\n") || agentsFile.includes("# ryux-core")));
  if (!dirs.length && !inline) {
    console.log(`No RYUX install found. Run: ${CLI_CMD} install`);
    return;
  }
  const done: string[] = [];
  for (const dir of dirs) done.push(...(await writeSkills(dir, scope.root)));
  if (await hasHook(scope.root)) done.push(await installHook(scope.root));
  if (!scope.global) {
    for (const file of ["CLAUDE.md", "GEMINI.md", "AGENTS.md"] as PointerFile[]) {
      const path = join(scope.root, file);
      const content = await readIfExists(path);
      if (!content?.includes(MARK_START)) continue;
      await upsertBlock(path, file === "AGENTS.md" && inline ? renderAgentsBlock() : renderPointerBlock());
      done.push(`${file} (block)`);
    }
  }
  console.log(`${pc.green("✓ ")}Updated to v${VERSION}:\n${done.map((d) => `  ${d}`).join("\n")}`);
}

async function runRemove(flags: Flags): Promise<void> {
  const scope = scopeOf(flags);
  const dirs = [...new Set(AGENT_TARGETS.map((a) => targetDir(a, scope)))];
  const hasSkills = dirs.some(hasInstall);
  const pointerFiles = scope.global ? [] : (["CLAUDE.md", "GEMINI.md", "AGENTS.md"] as PointerFile[]);
  const hasBlocks = (
    await Promise.all(pointerFiles.map(async (f) => (await readIfExists(join(scope.root, f)))?.includes(MARK_START)))
  ).some(Boolean);
  const hasLegacyCursor = existsSync(join(scope.root, LEGACY_CURSOR_RULES_DIR));
  if (!hasSkills && !hasBlocks && !hasLegacyCursor && !(await hasHook(scope.root))) {
    console.log("No RYUX install found.");
    return;
  }
  if (!flags.yes) {
    const ok = await p.confirm({ message: `Remove RYUX from ${scope.global ? "your home directory" : "this project"}?` });
    if (p.isCancel(ok) || !ok) {
      console.log("Cancelled.");
      return;
    }
  }
  const removed: string[] = [];
  for (const dir of dirs) {
    for (const name of [SKILL_NAME, ...OLD_SKILL_DIRS]) {
      const target = join(dir, name);
      if (await removePath(target)) removed.push(rel(target));
    }
    removed.push(...(await removeLegacy(dir, scope.root)));
  }
  for (const f of pointerFiles) if (await removeBlock(join(scope.root, f))) removed.push(`${f} (block)`);
  if (await removeHook(scope.root)) removed.push(".claude/settings.json (scan hook)");
  console.log(removed.length ? removed.map((r) => pc.red("− ") + r).join("\n") : "No files removed.");
}

/** Read every file of an installed skill folder, keyed by its path inside the folder. */
async function readBundle(skillDir: string): Promise<Record<string, string>> {
  const files: Record<string, string> = {};
  for (const entry of await readdir(skillDir, { recursive: true, withFileTypes: true })) {
    if (!entry.isFile()) continue;
    const full = join(entry.parentPath, entry.name);
    files[full.slice(skillDir.length + 1)] = await readFile(full, "utf8");
  }
  return files;
}

interface Finding {
  level: "ok" | "warn" | "fail";
  where: string;
  message: string;
  /** The command that fixes it, when there is one. */
  fix?: string;
}

async function runCheck(flags: Flags): Promise<void> {
  const scope = scopeOf(flags);
  const findings: Finding[] = [];
  const installs: { dir: string; version: string | null }[] = [];
  const add = (level: Finding["level"], where: string, message: string, fix?: string): void => {
    findings.push({ level, where, message, ...(fix ? { fix: `${CLI_CMD} ${fix}` } : {}) });
  };

  const dirs = detectInstalled(scope);
  if (!dirs.length) add("fail", scope.global ? "~" : ".", `RYUX is not installed ${scope.global ? "in your home directory" : "in this project"}`, "init");
  for (const dir of dirs) {
    const where = rel(dir);
    const skillDir = join(dir, SKILL_NAME);
    const leftovers = OLD_SKILL_DIRS.filter((n) => existsSync(join(dir, n)));
    if (leftovers.length) add("fail", where, `RYUX 1.x folders remain (${leftovers.length})`, "update");
    if (!existsSync(join(skillDir, "SKILL.md"))) {
      add("fail", where, `no ${SKILL_NAME}/ skill`, "update");
      continue;
    }
    const report = validateBundle(await readBundle(skillDir));
    installs.push({ dir: `${where}/${SKILL_NAME}`, version: report.version ?? null });
    for (const e of report.errors) add("fail", `${where}/${SKILL_NAME}`, e, "update");
    for (const w of report.warnings) add("warn", `${where}/${SKILL_NAME}`, w);
    if (report.version && report.version !== VERSION) add("warn", where, `installed RYUX ${report.version}, this CLI is ${VERSION}`, "update");
    if (!report.errors.length) add("ok", `${where}/${SKILL_NAME}`, `complete, RYUX ${report.version}`);
  }

  if (dirs.length && !scope.global) {
    const agentsHere = agentsAt(scope, true);
    for (const file of pointersFor(agentsHere)) {
      if (hasBlock(await readIfExists(join(scope.root, file)))) add("ok", file, "RYUX pointer block present");
      else add("warn", file, "no RYUX pointer block", "update");
    }
    const context = contextBody(await readIfExists(join(scope.root, CONTEXT_FILE)));
    if (context !== null) {
      add("ok", CONTEXT_FILE, `project context present, ${filledCount(context)} of ${ASKED_FIELDS.length} setup fields filled (blanks are treated as unknown)`);
    } else add("warn", CONTEXT_FILE, "no RYUX project context", "setup");
  }
  if (await hasHook(scope.root)) add("ok", ".claude/settings.json", "scan hook present");

  const ok = !findings.some((f) => f.level === "fail");
  if (!ok) process.exitCode = 1;
  if (flags.json) {
    console.log(JSON.stringify({ ok, cli: VERSION, scope: scope.global ? "global" : "project", installs, findings }, null, 2));
    return;
  }
  const mark = { ok: pc.green("✓"), warn: pc.yellow("!"), fail: pc.red("✗") };
  for (const f of findings) console.log(`${mark[f.level]} ${f.where}: ${f.message}${f.fix ? `. Run: ${f.fix}` : ""}`);
  if (ok) console.log(pc.green("\nRYUX is ready."));
}

/** Facts init can detect without guessing: the project name and where design tokens live. */
function detectContext(root: string): { name: string | null; system: string[] } {
  let name: string | null = null;
  try {
    name = (JSON.parse(readFileSync(join(root, "package.json"), "utf8")) as { name?: string }).name ?? null;
  } catch {
    name = null;
  }
  const candidates = [
    "tailwind.config.ts", "tailwind.config.js", "tailwind.config.mjs", "tokens.json", "design-tokens.json",
    "src/components", "components", "app/components", "src/styles", "styles",
  ];
  return { name, system: candidates.filter((c) => existsSync(join(root, c))) };
}

interface Choice {
  value: string;
  label: string;
  hint?: string;
}

interface ContextField {
  label: string;
  /** Text the template shows while the field is blank. */
  hint: string;
  /** Asked by `setup`, settable with --<flag>. Fields without it are detected or keep their default. */
  ask?: {
    flag: string;
    group: "Project" | "Design";
    question: string;
    /** Plain-language choices for people who are not designers; "Write my own" and "Skip" are always added. */
    options: Choice[];
    /** Shown in the "Write my own" text box, so a typed answer has a model to follow. */
    example: string;
    multi?: boolean;
    max?: number;
    /** A second question whose answer is added to the same field. */
    then?: { question: string; options: Choice[]; example: string; multi?: boolean };
  };
}

/** Every question also offers "Write my own" and "Skip, leave unknown"; a skipped field stays unknown. */
const CONTEXT_FIELDS: ContextField[] = [
  {
    label: "Product", hint: "(what it does, in one sentence:)",
    ask: { flag: "product", group: "Project", question: "What kind of product is it?", example: "Ticketing for local events", options: [
      { value: "Online store", label: "Online store" },
      { value: "Payments or finance", label: "Payments or finance" },
      { value: "Marketplace", label: "Marketplace" },
      { value: "Booking or scheduling", label: "Booking or scheduling" },
      { value: "SaaS or dashboard", label: "SaaS or dashboard", hint: "a tool people use for work" },
      { value: "Content or media", label: "Content or media" },
      { value: "Internal tool", label: "Internal tool", hint: "used by your own team" },
    ] },
  },
  {
    label: "Current work", hint: "",
    ask: { flag: "work", group: "Project", question: "What are you building right now?", example: "The checkout flow", options: [
      { value: "A new product", label: "A new product" },
      { value: "A new feature", label: "A new feature" },
      { value: "A new screen", label: "A new screen" },
      { value: "An existing flow", label: "An existing flow", hint: "changing something that already exists" },
      { value: "A redesign", label: "A redesign" },
    ] },
  },
  {
    label: "Audience", hint: "",
    ask: { flag: "audience", group: "Project", question: "Who is it for?", example: "Freelancers who send invoices", options: [
      { value: "Consumers", label: "Consumers", hint: "people using it for themselves" },
      { value: "Small business owners", label: "Small business owners" },
      { value: "Professionals at work", label: "Professionals at work" },
      { value: "An internal team", label: "An internal team" },
      { value: "Developers", label: "Developers" },
    ] },
  },
  {
    label: "Market and locale", hint: "(for example Indonesia, id-ID, Rupiah; or global, en-US, USD)",
    ask: { flag: "market", group: "Project", question: "Where is it used? This sets language and currency.", example: "Malaysia (ms-MY, MYR)", options: [
      { value: "Global, several markets", label: "Global, several markets" },
      { value: "Indonesia (id-ID, IDR)", label: "Indonesia", hint: "id-ID, Rupiah" },
      { value: "United States (en-US, USD)", label: "United States", hint: "en-US, US dollar" },
    ] },
  },
  { label: "Brand and design system", hint: "" },
  { label: "Product docs", hint: "paths RYUX reads for product facts, for example docs/prd.md:" },
  { label: "Evidence sources", hint: "RYUX MCP (not available yet), Figma files, reference URLs:" },
  {
    label: "Constraints", hint: "platforms, accessibility target (for example WCAG 2.2 AA), what must not change:",
    ask: { flag: "constraints", group: "Project", question: "Where does it run?", example: "Tablet app for shop staff", options: [
      { value: "Mobile app", label: "Mobile app" },
      { value: "Responsive website", label: "Website", hint: "phone and desktop" },
      { value: "Desktop website", label: "Desktop website" },
      { value: "Web and mobile app", label: "Web and mobile app" },
    ], then: { question: "What must stay as it is? Pick any.", example: "Our current logo and colours", multi: true, options: [
      { value: "Existing design system", label: "Existing design system" },
      { value: "Existing brand identity", label: "Existing brand identity" },
      { value: "Accessibility (WCAG 2.2 AA)", label: "Accessibility", hint: "WCAG 2.2 AA" },
    ] } },
  },
  {
    label: "Design intent", hint: "(what users should understand, feel, and do)",
    ask: { flag: "intent", group: "Design", question: "What should people get from it?", example: "Know when their order arrives", options: [
      { value: "Understand their status at a glance", label: "Understand their status at a glance" },
      { value: "Finish a task quickly", label: "Finish a task quickly" },
      { value: "Feel safe and in control", label: "Feel safe and in control" },
      { value: "Learn the product step by step", label: "Learn the product step by step" },
    ] },
  },
  {
    label: "UX direction", hint: "",
    ask: { flag: "ux", group: "Design", question: "How should the experience help users?", example: "Works one-handed at a shop counter", options: [
      { value: "Fast for people who use it often", label: "Fast for people who use it often" },
      { value: "Clear for people using it for the first time", label: "Clear for people using it for the first time" },
      { value: "Easy to scan and understand", label: "Easy to scan and understand" },
      { value: "Guided through a complex task", label: "Guided through a complex task" },
    ] },
  },
  {
    label: "UI direction", hint: "(character, for example calm, trustworthy, restrained)",
    ask: { flag: "ui", group: "Design", question: "What character should it have? A character, not colors or fonts. Pick up to 3.", example: "Warm, precise", multi: true, max: 3, options: [
      { value: "Calm", label: "Calm" },
      { value: "Trustworthy", label: "Trustworthy" },
      { value: "Friendly", label: "Friendly" },
      { value: "Playful", label: "Playful" },
      { value: "Bold", label: "Bold" },
      { value: "Minimal", label: "Minimal" },
      { value: "Information-rich", label: "Information-rich" },
      { value: "Premium", label: "Premium" },
    ] },
  },
  {
    label: "Voice and tone", hint: "(voice words, how it addresses people, what it must never sound like; tone shifts by moment)",
    ask: { flag: "voice", group: "Design", question: "How should it talk?", example: 'Hangat, lugas, pakai "kamu"', options: [
      { value: "Warm and casual", label: "Warm and casual" },
      { value: "Calm and professional", label: "Calm and professional" },
      { value: "Direct and brief", label: "Direct and brief" },
      { value: "Playful", label: "Playful", hint: "only where it costs no clarity" },
      { value: "Reassuring", label: "Reassuring", hint: "for money, health, or waiting" },
    ], then: { question: "What must it never sound like? Pick any.", example: "not preachy", multi: true, options: [
      { value: "not stiff or overly formal", label: "Stiff or overly formal" },
      { value: "not salesy or hyped", label: "Salesy or hyped" },
      { value: "not too familiar", label: "Too familiar" },
      { value: "no jokes when things go wrong", label: "Jokey when things go wrong" },
    ] } },
  },
  {
    label: "Motion direction", hint: "(feel, what motion communicates, what to avoid)",
    ask: { flag: "motion", group: "Design", question: "How much motion?", example: "Only to confirm a payment went through", options: [
      { value: "No motion unless necessary", label: "No motion unless necessary" },
      { value: "Subtle, only to show change", label: "Subtle, only to show change" },
      { value: "Expressive, part of the brand", label: "Expressive, part of the brand" },
    ] },
  },
];
const ASKED_FIELDS = CONTEXT_FIELDS.filter((f) => f.ask);
const CONTEXT_MARKS: [string, string] = [CONTEXT_START, CONTEXT_END];

const fieldLine = (label: string, text: string): string => `- **${label}**:${text ? ` ${text}` : ""}`;
const fieldRe = (label: string): RegExp => new RegExp(`^- \\*\\*${label}\\*\\*:.*$`, "m");

function contextBlock(root: string): string {
  const { name, system } = detectContext(root);
  const initial: Record<string, string> = {
    Product: `${name ?? ""} ${CONTEXT_FIELDS[0].hint}`,
    "Brand and design system": system.map((x) => `\`${x}\``).join(", "),
  };
  return `## RYUX project context

RYUX reads this block before any design task. These answers are the team's context and direction,
not evidence or verified facts: RYUX follows them and still backs its decisions with evidence.
Blanks stay unknown. UI direction describes character, not colors, fonts, or spacing.

${CONTEXT_FIELDS.map((f) => fieldLine(f.label, initial[f.label] ?? f.hint)).join("\n")}`;
}

/** The body between the context markers, or null when there is no block. */
function contextBody(content: string | null): string | null {
  if (!content) return null;
  const start = content.indexOf(CONTEXT_START);
  const end = content.indexOf(CONTEXT_END, start);
  return start === -1 || end === -1 ? null : content.slice(start + CONTEXT_START.length, end).trim();
}

/** What the user (or detection) wrote for a field; template hints count as blank. */
function fieldValue(body: string, f: ContextField): string {
  const line = body.match(fieldRe(f.label))?.[0];
  if (!line) return "";
  const value = line.slice(line.indexOf(":") + 1).trim();
  if (!f.hint) return value;
  if (value === f.hint) return "";
  return value.endsWith(` ${f.hint}`) ? value.slice(0, -f.hint.length).trim() : value;
}

const filledCount = (body: string): number => ASKED_FIELDS.filter((f) => fieldValue(body, f)).length;

/** Replace only the answered field lines; every other line of the block stays as the user left it. */
async function writeContext(root: string, answers: Record<string, string>): Promise<string> {
  const path = join(root, CONTEXT_FILE);
  let body = contextBody(await readIfExists(path)) ?? contextBlock(root);
  for (const f of ASKED_FIELDS) {
    const value = answers[f.label]?.trim();
    if (!value) continue;
    const line = fieldLine(f.label, value);
    if (fieldRe(f.label).test(body)) {
      body = body.replace(fieldRe(f.label), () => line);
      continue;
    }
    // A field added in a later version (e.g. Current work): place it after the field before it.
    const prev = CONTEXT_FIELDS[CONTEXT_FIELDS.indexOf(f) - 1];
    const anchor = prev && body.match(fieldRe(prev.label));
    body = anchor ? body.replace(fieldRe(prev.label), (m) => `${m}\n${line}`) : `${body}\n${line}`;
  }
  await upsertBlock(path, body, CONTEXT_MARKS);
  return body;
}

/** The text box hint: an example answer, and that an empty Enter skips. */
const typed = (example: string): string => `e.g. ${example} · empty Enter skips`;

/** Shown once at the start, not under every question (it stayed on screen after each answer). */
const KEY_LEGEND = pc.dim("↑/↓ move · Space select · Enter continue · Ctrl+C cancel");

const OWN = "\u0000own";
const KEEP = "\u0000keep";
const SKIP = "\u0000skip";

/** One select: Keep (when set), the choices, Write my own, Skip. Returns "" for skip, null on cancel. */
async function askOne(question: string, options: Choice[], current: string, example: string): Promise<string | null> {
  const v = await p.select({
    message: question,
    options: [
      ...(current ? [{ value: KEEP, label: `Keep: ${current}` }] : []),
      ...options.map((o) => ({ value: o.value || SKIP, label: o.label, hint: o.hint })),
      { value: OWN, label: "Write my own…" },
      { value: SKIP, label: "Skip, leave unknown" },
    ],
    initialValue: current ? KEEP : SKIP,
  });
  if (p.isCancel(v)) return null;
  if (v === KEEP || v === SKIP) return "";
  if (v === OWN) {
    const t = await p.text({ message: question, placeholder: typed(example) });
    return p.isCancel(t) ? null : (t ?? "").trim();
  }
  return v as string;
}

/** A multiselect: pick any, or none to skip. Returns "" for skip, null on cancel. */
async function askMany(question: string, options: Choice[], current: string, example: string, max?: number): Promise<string | null> {
  const parts = current ? current.split(",").map((x) => x.trim()).filter(Boolean) : [];
  const known = options.map((o) => o.value);
  const custom = parts.filter((x) => !known.includes(x)).join(", ");
  for (;;) {
    const v = await p.multiselect({
      message: question,
      options: [
        ...(custom ? [{ value: KEEP, label: `Keep: ${custom}` }] : []),
        ...options.map((o) => ({ value: o.value, label: o.label, hint: o.hint })),
        { value: OWN, label: "Write my own…" },
      ],
      initialValues: [...(custom ? [KEEP] : []), ...parts.filter((x) => known.includes(x))],
      required: false,
    });
    if (p.isCancel(v)) return null;
    const picked = v as string[];
    const values = picked.filter((x) => x !== KEEP && x !== OWN);
    if (picked.includes(KEEP)) values.push(custom);
    if (picked.includes(OWN)) {
      const t = await p.text({ message: question, placeholder: typed(example) });
      if (p.isCancel(t)) return null;
      if (t?.trim()) values.push(t.trim());
    }
    if (max && values.length > max) {
      p.log.warn(`Pick up to ${max}.`);
      continue;
    }
    return values.join(", ");
  }
}

/** Ask the setup questions as choices; every answer can be skipped. Returns null when cancelled. */
async function askContext(root: string): Promise<Record<string, string> | null> {
  const body = contextBody(await readIfExists(join(root, CONTEXT_FILE))) ?? contextBlock(root);
  const answers: Record<string, string> = {};
  let group = "";
  for (const f of ASKED_FIELDS) {
    const ask = f.ask!;
    if (ask.group !== group) {
      group = ask.group;
      p.log.step(group === "Project" ? "Project setup" : "Design setup");
    }
    const current = fieldValue(body, f);
    if (ask.then) {
      // Two questions, one field: split what is stored between them, and keep a part that is skipped.
      const parts = current.split(",").map((x) => x.trim()).filter(Boolean);
      const first = parts.find((x) => ask.options.some((o) => o.value === x)) ?? "";
      const rest = parts.filter((x) => x !== first).join(", ");
      const a = await askOne(ask.question, ask.options, first, ask.example);
      if (a === null) return null;
      const b = ask.then.multi ? await askMany(ask.then.question, ask.then.options, rest, ask.then.example) : await askOne(ask.then.question, ask.then.options, rest, ask.then.example);
      if (b === null) return null;
      answers[f.label] = [a || first, b || rest].filter(Boolean).join(", ");
      continue;
    }
    const v = ask.multi ? await askMany(ask.question, ask.options, current, ask.example, ask.max) : await askOne(ask.question, ask.options, current, ask.example);
    if (v === null) return null;
    answers[f.label] = v;
    if (f.label === "Product" && v) {
      const t = await p.text({ message: "In one sentence, what does it do?", placeholder: typed("A wallet for paying at shops by QR and sending money to friends") });
      if (p.isCancel(t)) return null;
      if (t?.trim()) answers[f.label] = `${v}: ${t.trim()}`;
    }
  }
  return answers;
}

async function setupInteractive(root: string): Promise<Record<string, string> | null> {
  p.log.info("Teach RYUX about this project. Every question can be skipped: blanks stay unknown, and RYUX asks when they matter.");
  const answers = await askContext(root);
  if (!answers) return null;
  const body = await writeContext(root, answers);
  p.log.success(`${CONTEXT_FILE} updated · ${filledCount(body)} of ${ASKED_FIELDS.length} setup fields filled`);
  return answers;
}

/** Curated, per product kind (setup's Product answer): a typical screen and flow to name in example prompts. */
const SUGGESTED: Record<string, { screen: string; flow: string }> = {
  "Online store": { screen: "the checkout page", flow: "our checkout flow" },
  "Payments or finance": { screen: "the transaction detail screen", flow: "our send-money flow" },
  "Marketplace": { screen: "the seller's new listing form", flow: "our listing flow" },
  "Booking or scheduling": { screen: "the date and time slot picker", flow: "our booking flow" },
  "SaaS or dashboard": { screen: "the billing settings page", flow: "our onboarding flow" },
  "Content or media": { screen: "the article reading page", flow: "our sign-up flow" },
  "Internal tool": { screen: "the orders table with filters", flow: "our approval flow" },
};

/** Three concrete prompts, one per entry point, from the setup answers; the README examples when there are none. */
function promptSuggestions(answers: Record<string, string>): string[] {
  const kind = Object.keys(SUGGESTED).find((k) => (answers["Product"] ?? "").startsWith(k));
  if (!kind) {
    return [
      "Design the transaction detail screen for our wallet, in pen.dev.",
      "Critique our pricing page at https://example.com/pricing.",
      "Analyze this checkout screen (screenshot attached).",
    ];
  }
  const { screen, flow } = SUGGESTED[kind];
  const changing = /existing flow|redesign/i.test(answers["Current work"] ?? "");
  return [
    `Design ${screen} for our app.`,
    `Critique ${flow} and tell us what to fix first.`,
    changing ? `Analyze ${flow} before we change it (screenshots attached).` : `QA the build of ${screen} against the design.`,
  ];
}

const suggestionsText = (answers: Record<string, string>): string =>
  [...promptSuggestions(answers).map((s) => `"${s}"`), "", "RYUX may ask up to three questions first."].join("\n");

async function runSetup(flags: Flags): Promise<void> {
  if (flags.global) {
    console.error(`setup is per project. Run it inside the project folder: ${CLI_CMD} setup`);
    process.exitCode = 1;
    return;
  }
  const root = scopeOf(flags).root;
  const fromFlags: Record<string, string> = {};
  for (const f of ASKED_FIELDS) {
    const v = flags[f.ask!.flag];
    if (typeof v === "string") fromFlags[f.label] = v;
  }

  if (Object.keys(fromFlags).length) {
    const body = await writeContext(root, fromFlags);
    console.log(`${pc.green("✓ ")}${CONTEXT_FILE} updated · ${filledCount(body)} of ${ASKED_FIELDS.length} setup fields filled`);
    console.log(`\nTry:\n${suggestionsText(fromFlags).split("\n").map((l) => (l ? `  ${l}` : "")).join("\n")}`);
    return;
  }
  if (!process.stdin.isTTY) {
    const names = ASKED_FIELDS.map((f) => `--${f.ask!.flag}`).join(" ");
    console.error(`setup asks questions and needs a terminal. Without one, pass fields as flags (${names}) or edit ${CONTEXT_FILE}.`);
    process.exitCode = 1;
    return;
  }
  p.intro(pc.bgCyan(pc.black(" RYUX setup ")));
  p.log.message(KEY_LEGEND);
  const answers = await setupInteractive(root);
  if (!answers) return cancel();
  p.note(suggestionsText(answers), "Try");
  p.outro(`RYUX is ready. Next: ${CLI_CMD} check`);
}

async function runInit(flags: Flags): Promise<void> {
  if (flags.global) {
    console.error(`init sets up a project. For a global install, use: ${CLI_CMD} install --global`);
    process.exitCode = 1;
    return;
  }
  const scope = scopeOf(flags);
  const path = join(scope.root, CONTEXT_FILE);
  const had = hasBlock(await readIfExists(path), CONTEXT_MARKS);
  await runInstall({ ...flags, init: true });
  if (process.exitCode) return;
  if (flags["dry-run"]) {
    console.log(`  ${had ? `keep the project context in ${CONTEXT_FILE} as you wrote it` : `add the project context block to ${CONTEXT_FILE}`}`);
    return;
  }
  if (had) {
    console.log(`${pc.green("✓ ")}${CONTEXT_FILE}: project context already present (left as you wrote it). Edit it with: ${CLI_CMD} setup`);
  } else if (!hasBlock(await readIfExists(path), CONTEXT_MARKS)) {
    await upsertBlock(path, contextBlock(scope.root), CONTEXT_MARKS);
    console.log(`${pc.green("✓ ")}${CONTEXT_FILE}: project context added. Fill it in with: ${CLI_CMD} setup`);
  }
  console.log(`\nNext: ${CLI_CMD} check`);
}

function help(): void {
  const agents = AGENT_TARGETS.map((a) => `  ${a.id.padEnd(12)} ${a.label.padEnd(15)} ${a.dir}  (global ~/${a.globalDir})`).join("\n");
  console.log(`ryux v${VERSION}: install RYUX, design intelligence for AI agents and designers, into your agents.
One skill, five entry points: Analyze, Design, Build, Critique, QA. RYUX picks the knowledge each task needs.

Usage:
  ${CLI_CMD} [command] [options]

Commands:
  install     Install RYUX (interactive, or with flags). Interactive also offers setup. Default. Start here.
  setup       Teach RYUX about this project: a few skippable questions, saved to DESIGN.md.
  init        Install RYUX and add the DESIGN.md project context block.
  check       Check the install: files, version, references, pointers, project context.
  scan        Check source files for rules a machine can see (Rupiah format, alt text, zoom, focus, ...).
              No LLM, no network. Default path: this folder. Give a URL to measure the rendered page
              (sideways scroll, contrast, target size, colliding text); that needs Playwright.
  update      Update an install to this version (also migrates RYUX 1.x folders).
  remove      Remove RYUX and the marked blocks.
  help        Show this help.

Agents:
${agents}
  ${AGENTS_MD_INLINE.id.padEnd(12)} any other agent: RYUX inline in AGENTS.md (project only)

Options:
  --agent <list|all>   agents to install for (non-interactive)
  --global             install into your home directory instead of this project
  --mcp                print the ryux MCP connect command
  --yes                skip the confirmation (remove)
  --dry-run            list what install or init would create or update, and write nothing
  --json               print check's or scan's findings as JSON (for agents and CI)
  --hook               install: run ryux scan after each Claude Code edit (opt-in)
  --list-rules         scan: list what each check looks for
  --ignore <ids>       scan: skip rules, e.g. RX-DS-03 (or a ryux-ignore RX-.. comment in the file)
  --widths <list>      scan <url>: viewport widths in CSS px (default 320,390,1280)
  --product, --work, --audience, --market, --constraints, --intent, --ux, --ui, --voice, --motion <text>
                       set project context fields without questions (setup)

Examples:
  ${CLI_CMD}
  ${CLI_CMD} setup
  ${CLI_CMD} setup --audience "small business owners" --market "Indonesia, id-ID, IDR"
  ${CLI_CMD} init --agent claude
  ${CLI_CMD} check
  ${CLI_CMD} install --agent claude,cursor,codex
  ${CLI_CMD} install --agent all
  ${CLI_CMD} install --agent claude --global
  ${CLI_CMD} update
  ${CLI_CMD} remove --yes
  ${CLI_CMD} init --agent claude --dry-run
  ${CLI_CMD} check --json
  ${CLI_CMD} scan src
  ${CLI_CMD} scan http://localhost:3000/checkout
  ${CLI_CMD} scan --list-rules
  ${CLI_CMD} install --agent claude --hook

Exit codes: 0 done or healthy, 1 a problem was found (for scan: a fail) or the command failed, 2 the command was used wrongly.`);
}

async function main(): Promise<void> {
  const argv = process.argv.slice(2);
  const first = argv[0];

  if (argv.includes("--help") || argv.includes("-h") || first === "help") return help();
  if (argv.includes("--version") || argv.includes("-v") || first === "version") {
    console.log(VERSION);
    return;
  }

  const cmd = first && !first.startsWith("--") ? first : "install";
  const flags = parseFlags(first && first.startsWith("--") ? argv : argv.slice(1));

  switch (cmd) {
    case "update":
      return runUpdate(flags);
    case "check":
    case "doctor":
      return runCheck(flags);
    case "scan":
      return runScan(argv.slice(1));
    case "init":
      return runInit(flags);
    case "setup":
      return runSetup(flags);
    case "remove":
      return runRemove(flags);
    case "install":
      return runInstall(flags);
    default:
      console.error(`Unknown command: ${cmd}\n`);
      help();
      process.exitCode = 2;
  }
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exitCode = 1;
});
