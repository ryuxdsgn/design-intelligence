// Integration tests: run the built CLI in throwaway project folders.
import { test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const cli = join(dirname(fileURLToPath(import.meta.url)), "..", "dist", "cli", "index.js");
const run = (cwd, ...args) => {
  const r = spawnSync("node", [cli, ...args], { cwd, encoding: "utf8", env: { ...process.env, NO_COLOR: "1", RYUX_NO_UPDATE_CHECK: "1" } });
  return { code: r.status, out: `${r.stdout}${r.stderr}` };
};
const project = () => {
  const dir = mkdtempSync(join(tmpdir(), "ryux-test-"));
  writeFileSync(join(dir, "package.json"), JSON.stringify({ name: "acme-app" }));
  return dir;
};

test("install, then check passes", () => {
  const dir = project();
  assert.equal(run(dir, "install", "--agent", "claude").code, 0);
  assert.ok(existsSync(join(dir, ".claude/skills/ryux/SKILL.md")));
  const c = run(dir, "check");
  assert.equal(c.code, 0, c.out);
  assert.match(c.out, /complete, RYUX \d+\.\d+\.\d+/);
  rmSync(dir, { recursive: true, force: true });
});

test("install copies the CLI into the skill folder, so it runs with node in a folder with no package.json", () => {
  const dir = mkdtempSync(join(tmpdir(), "ryux-test-"));
  const i = run(dir, "install", "--agent", "claude");
  assert.match(i.out, /bin\/ \(the RYUX CLI: scan, audit, pick run with node, nothing downloaded\)/);
  const bin = join(dir, ".claude/skills/ryux/bin");
  assert.equal(readFileSync(join(bin, ".gitignore"), "utf8"), "*\n");
  writeFileSync(join(dir, "a.html"), "<p>Halo</p>");
  const r = spawnSync("node", [join(bin, "dist/cli/index.js"), "scan", dir, "--json"], { cwd: tmpdir(), encoding: "utf8", env: { ...process.env, RYUX_NO_UPDATE_CHECK: "1" } });
  assert.equal(r.status, 0, r.stderr);
  assert.equal(JSON.parse(r.stdout).files, 1);
  rmSync(dir, { recursive: true, force: true });
});

test("install over an existing skill folder names the files it removes that RYUX does not write", () => {
  const dir = project();
  run(dir, "install", "--agent", "claude");
  writeFileSync(join(dir, ".claude/skills/ryux/my-notes.md"), "mine");
  const plan = run(dir, "install", "--agent", "claude", "--dry-run");
  assert.match(plan.out, /remove 1 file RYUX does not write: \.claude\/skills\/ryux\/my-notes\.md/);
  assert.ok(existsSync(join(dir, ".claude/skills/ryux/my-notes.md")), "a dry run deletes nothing");
  const i = run(dir, "install", "--agent", "claude");
  assert.equal(i.code, 0, i.out);
  assert.match(i.out, /removed 1 file RYUX does not write: \.claude\/skills\/ryux\/my-notes\.md/);
  assert.ok(existsSync(join(dir, ".claude/skills/ryux/SKILL.md")));
  const again = run(dir, "install", "--agent", "claude");
  assert.doesNotMatch(again.out, /does not write/, "a clean folder reports nothing");
  rmSync(dir, { recursive: true, force: true });
});

test("check fails on a missing module and on no install", () => {
  const dir = project();
  assert.equal(run(dir, "check").code, 1);
  run(dir, "install", "--agent", "claude");
  rmSync(join(dir, ".claude/skills/ryux/knowledge/forms.md"));
  const c = run(dir, "check");
  assert.equal(c.code, 1);
  assert.match(c.out, /missing knowledge\/forms\.md/);
  rmSync(dir, { recursive: true, force: true });
});

test("update migrates a RYUX 1.x install", () => {
  const dir = project();
  for (const name of ["ryux-core", "ryux-forms", "ryux-critique"]) {
    mkdirSync(join(dir, ".claude/skills", name), { recursive: true });
    writeFileSync(join(dir, ".claude/skills", name, "SKILL.md"), `---\nname: ${name}\n---\n`);
  }
  assert.equal(run(dir, "check").code, 1);
  assert.equal(run(dir, "update").code, 0);
  assert.ok(!existsSync(join(dir, ".claude/skills/ryux-forms")));
  assert.equal(run(dir, "check").code, 0);
  rmSync(dir, { recursive: true, force: true });
});

test("init adds project context once and keeps what the user wrote", () => {
  const dir = project();
  assert.equal(run(dir, "init", "--agent", "claude").code, 0);
  const design = readFileSync(join(dir, "DESIGN.md"), "utf8");
  assert.match(design, /ryux-context:start/);
  assert.match(design, /\*\*Product\*\*: acme-app/);
  for (const field of ["Why choose it", "Taste references", "What people do in it", "Numbers that may be shown"]) {
    assert.match(design, new RegExp(`\\*\\*${field}\\*\\*:`), field);
  }
  writeFileSync(join(dir, "DESIGN.md"), design.replace("**Audience**:", "**Audience**: freelancers"));
  run(dir, "init", "--agent", "claude");
  assert.match(readFileSync(join(dir, "DESIGN.md"), "utf8"), /\*\*Audience\*\*: freelancers/);
  assert.match(run(dir, "check").out, /project context present/);
  rmSync(dir, { recursive: true, force: true });
});

test("setup fills only the answered fields and keeps the rest", () => {
  const dir = project();
  run(dir, "init", "--agent", "claude");
  const design = readFileSync(join(dir, "DESIGN.md"), "utf8");
  writeFileSync(join(dir, "DESIGN.md"), design.replace("**UX direction**:", "**UX direction**: guide first-time users"));
  const s = run(dir, "setup", "--audience", "Small business owners", "--market", "Indonesia, id-ID, IDR");
  assert.equal(s.code, 0, s.out);
  const after = readFileSync(join(dir, "DESIGN.md"), "utf8");
  assert.match(after, /\*\*Audience\*\*: Small business owners\n/);
  assert.match(after, /\*\*Market and locale\*\*: Indonesia, id-ID, IDR\n/);
  assert.match(after, /\*\*Product\*\*: acme-app \(what it does/);
  assert.match(after, /\*\*UX direction\*\*: guide first-time users/);
  assert.match(after, /\*\*Design intent\*\*: \(what users should understand/);
  assert.match(run(dir, "check").out, /4 of 10 setup fields filled/);
  // the short context block is not the whole file: setup and check point to the agent for the rest (RX-PR-12)
  assert.match(s.out, /ask your agent: "Write our DESIGN\.md from this brief"/);
  assert.match(run(dir, "check").out, /0 of 10 design sections/);
  writeFileSync(join(dir, "DESIGN.md"), after + "\n## Users and needs\n\n## Jobs to be done\n");
  assert.match(run(dir, "check").out, /2 of 10 design sections/);
  rmSync(dir, { recursive: true, force: true });
});

test("setup --voice records voice and tone next to the UI direction", () => {
  const dir = project();
  run(dir, "init", "--agent", "claude");
  assert.match(readFileSync(join(dir, "DESIGN.md"), "utf8"), /\*\*Voice and tone\*\*: \(voice words/);
  assert.equal(run(dir, "setup", "--voice", "Warm and casual, not salesy or hyped").code, 0);
  const after = readFileSync(join(dir, "DESIGN.md"), "utf8");
  assert.match(after, /\*\*UI direction\*\*:.*\n- \*\*Voice and tone\*\*: Warm and casual, not salesy or hyped\n/);
  rmSync(dir, { recursive: true, force: true });
});

test("setup adds a field that an older block does not have, after the field before it", () => {
  const dir = project();
  run(dir, "init", "--agent", "claude");
  const path = join(dir, "DESIGN.md");
  writeFileSync(path, readFileSync(path, "utf8").replace("- **Current work**:\n", ""));
  assert.doesNotMatch(readFileSync(path, "utf8"), /Current work/);
  assert.equal(run(dir, "setup", "--work", "A redesign").code, 0);
  assert.match(readFileSync(path, "utf8"), /\*\*Product\*\*:.*\n- \*\*Current work\*\*: A redesign\n- \*\*Audience\*\*/);
  rmSync(dir, { recursive: true, force: true });
});

test("setup writes a context block when none exists", () => {
  const dir = project();
  assert.equal(run(dir, "setup", "--intent", "Make financial status easy to understand").code, 0);
  const design = readFileSync(join(dir, "DESIGN.md"), "utf8");
  assert.match(design, /ryux-context:start/);
  assert.match(design, /\*\*Design intent\*\*: Make financial status easy to understand\n/);
  rmSync(dir, { recursive: true, force: true });
});

test("setup without a terminal or flags, or with --global, explains and fails", () => {
  const dir = project();
  const a = run(dir, "setup");
  assert.equal(a.code, 1);
  assert.match(a.out, /--audience/);
  assert.ok(!existsSync(join(dir, "DESIGN.md")));
  assert.equal(run(dir, "setup", "--global", "--audience", "x").code, 1);
  rmSync(dir, { recursive: true, force: true });
});

test("remove takes RYUX out but leaves the project context", () => {
  const dir = project();
  run(dir, "init", "--agent", "claude");
  assert.equal(run(dir, "remove", "--yes").code, 0);
  assert.ok(!existsSync(join(dir, ".claude/skills/ryux")));
  assert.ok(!existsSync(join(dir, "CLAUDE.md")) || !readFileSync(join(dir, "CLAUDE.md"), "utf8").includes("ryux-rules:start"));
  assert.match(readFileSync(join(dir, "DESIGN.md"), "utf8"), /ryux-context:start/);
  rmSync(dir, { recursive: true, force: true });
});

test("setup suggests three prompts for the product it was told about", () => {
  const dir = project();
  const store = run(dir, "setup", "--product", "Online store", "--work", "A redesign");
  assert.equal(store.code, 0, store.out);
  assert.match(store.out, /Try:/);
  assert.match(store.out, /"Design the checkout page for our app\."/);
  assert.match(store.out, /"Analyze our checkout flow before we change it/);
  const other = run(dir, "setup", "--product", "Ticketing for local events");
  assert.match(other.out, /"Critique our pricing page/);
  rmSync(dir, { recursive: true, force: true });
});

test("check --json reports findings with fixes, and its exit code", () => {
  const dir = project();
  const none = run(dir, "check", "--json");
  assert.equal(none.code, 1);
  const empty = JSON.parse(none.out);
  assert.equal(empty.ok, false);
  assert.match(empty.findings[0].fix, /init$/);
  run(dir, "install", "--agent", "claude");
  const healthy = run(dir, "check", "--json");
  assert.equal(healthy.code, 0, healthy.out);
  const report = JSON.parse(healthy.out);
  assert.equal(report.ok, true);
  assert.equal(report.installs[0].dir, ".claude/skills/ryux");
  rmSync(join(dir, ".claude/skills/ryux/knowledge/forms.md"));
  const broken = run(dir, "check", "--json");
  assert.equal(broken.code, 1);
  const fail = JSON.parse(broken.out).findings.find((f) => f.level === "fail");
  assert.match(fail.message, /forms\.md/);
  assert.match(fail.fix, /update$/);
  rmSync(dir, { recursive: true, force: true });
});

// A stand-in package manager on PATH records what install asked it to do, so the test needs no network.
const fakePm = (dir, name) => {
  const bin = join(dir, ".bin-test");
  mkdirSync(bin, { recursive: true });
  writeFileSync(join(bin, name), `#!/bin/sh\necho "$@" > "${join(dir, "pm-args.txt")}"\n`, { mode: 0o755 });
  return { ...process.env, NO_COLOR: "1", PATH: `${bin}:${process.env.PATH}` };
};
const runEnv = (cwd, env, ...args) => {
  const r = spawnSync("node", [cli, ...args], { cwd, encoding: "utf8", env });
  return { code: r.status, out: `${r.stdout}${r.stderr}` };
};
const cliVersion = JSON.parse(readFileSync(join(dirname(cli), "..", "..", "package.json"), "utf8")).version;

test("install --save-dev adds the RYUX CLI to devDependencies with the project's package manager", () => {
  const dir = project();
  writeFileSync(join(dir, "pnpm-lock.yaml"), "lockfileVersion: '9.0'\n");
  const env = fakePm(dir, "pnpm");
  const plan = runEnv(dir, env, "install", "--agent", "claude", "--save-dev", "--dry-run");
  assert.match(plan.out, new RegExp(`add @ryuxdsgn/design-intelligence@${cliVersion.replace(/\./g, "\\.")} to devDependencies \\(pnpm add -D`));
  assert.ok(!existsSync(join(dir, "pm-args.txt")), "a dry run runs no package manager");
  const i = runEnv(dir, env, "install", "--agent", "claude", "--save-dev");
  assert.equal(i.code, 0, i.out);
  assert.equal(readFileSync(join(dir, "pm-args.txt"), "utf8").trim(), `add -D @ryuxdsgn/design-intelligence@${cliVersion}`);
  assert.match(i.out, /devDependencies/);
  rmSync(dir, { recursive: true, force: true });
});

test("install --save-dev uses npm without a lockfile, and skips a project that already has the CLI or has no package.json", () => {
  const dir = project();
  const env = fakePm(dir, "npm");
  assert.equal(runEnv(dir, env, "install", "--agent", "claude", "--save-dev").code, 0);
  assert.equal(readFileSync(join(dir, "pm-args.txt"), "utf8").trim(), `install -D @ryuxdsgn/design-intelligence@${cliVersion}`);
  rmSync(join(dir, "pm-args.txt"));
  writeFileSync(join(dir, "package.json"), JSON.stringify({ name: "acme-app", devDependencies: { "@ryuxdsgn/design-intelligence": "^2.0.0" } }));
  const again = runEnv(dir, env, "install", "--agent", "claude", "--save-dev");
  assert.match(again.out, /already in devDependencies/);
  assert.ok(!existsSync(join(dir, "pm-args.txt")));
  const bare = mkdtempSync(join(tmpdir(), "ryux-test-"));
  const b = runEnv(bare, fakePm(bare, "npm"), "install", "--agent", "claude", "--save-dev");
  assert.equal(b.code, 0, b.out);
  assert.match(b.out, /no package\.json/);
  assert.ok(!existsSync(join(bare, "pm-args.txt")));
  rmSync(dir, { recursive: true, force: true });
  rmSync(bare, { recursive: true, force: true });
});

test("install and init --dry-run list the plan and write nothing", () => {
  const dir = project();
  writeFileSync(join(dir, "CLAUDE.md"), "# Our notes\n");
  const i = run(dir, "install", "--agent", "claude", "--dry-run");
  assert.equal(i.code, 0, i.out);
  assert.match(i.out, /Dry run: nothing was written/);
  assert.match(i.out, /create \.claude\/skills\/ryux\//);
  assert.match(i.out, /add the pointer block to CLAUDE\.md/);
  const n = run(dir, "init", "--agent", "claude", "--dry-run");
  assert.match(n.out, /add the project context block to DESIGN\.md/);
  assert.ok(!existsSync(join(dir, ".claude")));
  assert.ok(!existsSync(join(dir, "DESIGN.md")));
  assert.equal(readFileSync(join(dir, "CLAUDE.md"), "utf8"), "# Our notes\n");
  rmSync(dir, { recursive: true, force: true });
});

test("a wrongly used command exits with 2", () => {
  const dir = project();
  assert.equal(run(dir, "frobnicate").code, 2);
  assert.equal(run(dir, "install", "--agent", "nope").code, 2);
  rmSync(dir, { recursive: true, force: true });
});

// `ryux audit` on a FigCraft document: one screen with one heading, nothing to report.
const solid = (r, g, b) => ({ type: "solid", visible: true, opacity: 1, color: { r, g, b, a: 1 } });
const neutralDoc = {
  pages: [1], current_page: 1, annotation_categories: [],
  nodes: {
    1: { id: 1, type: "page", name: "Home", children: [2] },
    2: { id: 2, type: "frame", name: "01-home", parent: 1, transform: [1, 0, 0, 1, 0, 0], width: 390, height: 844, clip: true, fills: [solid(1, 1, 1)], layout: { mode: "vertical", gap: 16, padding: [24, 16, 24, 16] }, children: [3] },
    3: { id: 3, type: "text", name: "Title", parent: 2, transform: [1, 0, 0, 1, 16, 24], width: 200, height: 28, characters: "Orders", fills: [solid(0.1, 0.1, 0.1)], style: { font_size: 22 } },
  },
};
const GATE = /^figcraft audit \((?<page>[^)]+)\): screens (?<screens>\d+) · .+ · (?<fail>\d+) fail, (?<warn>\d+) warn$/m;

test("audit: a neutral canvas exits 0 with one gate line; --json carries the same gate", () => {
  const dir = project();
  writeFileSync(join(dir, "doc.json"), JSON.stringify(neutralDoc));
  const r = run(dir, "audit", "doc.json");
  assert.equal(r.code, 0, r.out);
  const gate = r.out.trim().split("\n");
  assert.equal(gate.length, 1, r.out);
  assert.deepEqual({ ...GATE.exec(gate[0]).groups }, { page: "Home", screens: "1", fail: "0", warn: "0" });
  assert.match(gate[0], /contrast fails 0 .* targets under 24 0, under 44 0 .* annotations none/);
  const j = run(dir, "audit", "doc.json", "--json");
  assert.equal(j.code, 0, j.out);
  const out = JSON.parse(j.out);
  assert.deepEqual(out.findings, []);
  assert.equal(out.gate, gate[0]);
  rmSync(dir, { recursive: true, force: true });
});

test("audit: a missing file, an unknown page, another format, or no file at all fails and says why", () => {
  const dir = project();
  const missing = run(dir, "audit", "nope.json");
  assert.equal(missing.code, 1, missing.out);
  assert.match(missing.out, /no such file or directory, open .*nope\.json/);
  assert.doesNotMatch(missing.out, GATE);
  writeFileSync(join(dir, "doc.json"), JSON.stringify(neutralDoc));
  const page = run(dir, "audit", "doc.json", "--page", "Checkout");
  assert.equal(page.code, 1, page.out);
  assert.match(page.out, /no page named "Checkout"; pages: Home/);
  writeFileSync(join(dir, "doc.fig"), "");
  const other = run(dir, "audit", "doc.fig");
  assert.equal(other.code, 1, other.out);
  assert.match(other.out, /audit reads a \.figcraft file or the \.json figcraft-cli converts it to, not doc\.fig/);
  const none = run(dir, "audit");
  assert.equal(none.code, 2, none.out);
  assert.match(none.out, /^Usage: ryux audit <file\.figcraft \| file\.json \| Figma link>/m);
  rmSync(dir, { recursive: true, force: true });
});

const figcraftCli = spawnSync(process.env.FIGCRAFT_CLI || "figcraft-cli", ["--version"], { encoding: "utf8" }).status === 0;

test("audit: a .figcraft file goes through figcraft-cli and gets the same gate line", { skip: figcraftCli ? false : "figcraft-cli is not on PATH" }, () => {
  const dir = project();
  const script = [
    { command: "frame.create", params: { x: 0, y: 0, width: 390, height: 844, name: "01-home" } },
    { command: "text.create", params: { text: "Orders", x: 16, y: 24, parent: 2, props: { fontSize: 22 } } },
  ];
  writeFileSync(join(dir, "make.json"), JSON.stringify(script));
  const made = spawnSync(process.env.FIGCRAFT_CLI || "figcraft-cli", ["run", join(dir, "make.json"), "--out", join(dir, "home.figcraft"), "--automation-write-root", dir], { encoding: "utf8" });
  assert.equal(made.status, 0, made.stderr);
  const r = run(dir, "audit", "home.figcraft");
  assert.equal(r.code, 0, r.out);
  const gate = r.out.trim().split("\n").at(-1);
  const g = GATE.exec(gate)?.groups;
  assert.ok(g, r.out);
  assert.equal(g.screens, "1");
  assert.equal(g.fail, "0");
  rmSync(dir, { recursive: true, force: true });
});
