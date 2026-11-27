// The read gate: a Claude Code PreToolUse hook holds a design-canvas write until the RYUX run has read the design
// rules whole. The judgement runs in ryux-core (fixtures/checks/readgate.json); the CLI reads the transcript.
import { test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { readGate } from "../dist/engine.js";
import { CANVAS_READS } from "../dist/intelligence/content.js";
import { canvasWrite } from "../dist/cli/read-gate.js";
import { VERSION } from "../dist/product.js";

const here = dirname(fileURLToPath(import.meta.url));
const cli = join(here, "..", "dist", "cli", "index.js");
const cases = JSON.parse(readFileSync(join(here, "..", "..", "..", "fixtures", "checks", "readgate.json"), "utf8"));
const run = (cwd, args, input) => {
  const r = spawnSync("node", [cli, ...args], { cwd, input, encoding: "utf8", env: { ...process.env, NO_COLOR: "1", RYUX_NO_UPDATE_CHECK: "1" } });
  return { code: r.status, stdout: r.stdout, stderr: r.stderr };
};

test("the CLI's engine answers every recorded read-gate case the same as ryux-core", () => {
  for (const c of cases) assert.deepEqual(readGate(c.input), c.output, c.name);
});

test("only canvas writes are gated: a read-only use_figma script, other tools, and FigCraft reads pass", () => {
  assert.equal(canvasWrite("mcp__plugin_figma_figma__use_figma", { code: "const f = figma.createFrame(); return f.id" }), true);
  assert.equal(canvasWrite("mcp__figma__use_figma", { code: "return figma.root.children.map((p) => p.name)" }), false);
  assert.equal(canvasWrite("mcp__pencil__execute", {}), true);
  assert.equal(canvasWrite("mcp__figcraft__create_node", {}), true);
  assert.equal(canvasWrite("mcp__figcraft__inspect_document", {}), false);
  assert.equal(canvasWrite("Write", { file_path: "a.md" }), false);
});

test("read-gate --hook holds a canvas write until the run has read every required file whole", () => {
  const dir = mkdtempSync(join(tmpdir(), "ryux-rg-"));
  const skill = join(dir, "skills", "ryux");
  for (const p of ["SKILL.md", ...CANVAS_READS]) {
    mkdirSync(dirname(join(skill, p)), { recursive: true });
    writeFileSync(join(skill, p), Array.from({ length: 50 }, (_, i) => `line ${i + 1}`).join("\n") + "\n");
  }
  let n = 0;
  const read = (p, extra = {}) => JSON.stringify({ type: "assistant", message: { content: [{ type: "tool_use", id: `t${++n}`, name: "Read", input: { file_path: join(skill, p), ...extra } }] } });
  const transcript = join(dir, "t.jsonl");
  const hook = (tool_name, code) => run(dir, ["read-gate", "--hook"], JSON.stringify({ transcript_path: transcript, tool_name, tool_input: { code } }));
  const write = "figma.createFrame()";

  writeFileSync(transcript, [read("SKILL.md"), read("capabilities/design.md")].join("\n"));
  let r = hook("mcp__plugin_figma_figma__use_figma", write);
  assert.equal(r.code, 2);
  assert.match(r.stderr, /knowledge\/design-system\.md/);
  assert.equal(hook("mcp__plugin_figma_figma__use_figma", "return figma.root.name").code, 0, "a read-only script passes");

  writeFileSync(transcript, [read("SKILL.md"), ...CANVAS_READS.map((p) => read(p, p === "knowledge/ui.md" ? { offset: 10, limit: 5 } : {}))].join("\n"));
  r = hook("mcp__plugin_figma_figma__use_figma", write);
  assert.equal(r.code, 2);
  assert.match(r.stderr, /knowledge\/ui\.md \(5 of 50 lines read\)/);

  writeFileSync(transcript, [read("SKILL.md"), ...CANVAS_READS.map((p) => read(p))].join("\n"));
  assert.equal(hook("mcp__plugin_figma_figma__use_figma", write).code, 0);

  writeFileSync(transcript, read("capabilities/design.md").replace("/ryux/", "/other/"));
  assert.equal(hook("mcp__plugin_figma_figma__use_figma", write).code, 0, "a session without RYUX is never held");
  assert.equal(run(dir, ["read-gate", "--hook"], "not json").code, 0, "bad input never blocks the agent");
  rmSync(dir, { recursive: true, force: true });
});

test("install --agent claude --hook adds the read gate as a PreToolUse hook; remove takes it away", () => {
  const dir = mkdtempSync(join(tmpdir(), "ryux-rg-"));
  mkdirSync(join(dir, ".claude"));
  const settings = join(dir, ".claude", "settings.json");
  const mine = { matcher: "Bash", hooks: [{ type: "command", command: "echo mine" }] };
  writeFileSync(settings, JSON.stringify({ hooks: { PreToolUse: [mine] } }));
  assert.equal(run(dir, ["install", "--agent", "claude", "--hook"]).code, 0);
  let s = JSON.parse(readFileSync(settings, "utf8"));
  assert.equal(s.hooks.PreToolUse.length, 2);
  assert.equal(s.hooks.PreToolUse[1].hooks[0].command, `npx -y @ryuxdsgn/design-intelligence@${VERSION} read-gate --hook`);
  assert.match(s.hooks.PreToolUse[1].matcher, /use_figma/);
  run(dir, ["install", "--agent", "claude", "--hook"]);
  assert.equal(JSON.parse(readFileSync(settings, "utf8")).hooks.PreToolUse.length, 2, "installing twice adds it once");
  assert.equal(run(dir, ["remove", "--yes"]).code, 0);
  s = JSON.parse(readFileSync(settings, "utf8"));
  assert.deepEqual(s.hooks.PreToolUse, [mine]);
  rmSync(dir, { recursive: true, force: true });
});
