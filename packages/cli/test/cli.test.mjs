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
  const r = spawnSync("node", [cli, ...args], { cwd, encoding: "utf8", env: { ...process.env, NO_COLOR: "1" } });
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
  assert.match(run(dir, "check").out, /4 of 9 setup fields filled/);
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
