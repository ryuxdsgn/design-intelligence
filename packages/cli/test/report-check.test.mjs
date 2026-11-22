// The report check: the one-line gate in a RYUX report must count the same areas as the detail block.
// It runs in ryux-core (fixtures/checks/report.json); the CLI reads a file, stdin, or Claude Code's Stop hook.
import { test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { reportCheck } from "../dist/engine.js";
import { GATE_AREAS } from "../dist/intelligence/content.js";
import { VERSION } from "../dist/product.js";

const here = dirname(fileURLToPath(import.meta.url));
const cli = join(here, "..", "dist", "cli", "index.js");
const cases = JSON.parse(readFileSync(join(here, "..", "..", "..", "fixtures", "checks", "report.json"), "utf8"));
const run = (cwd, args, input) => {
  const r = spawnSync("node", [cli, ...args], { cwd, input, encoding: "utf8", env: { ...process.env, NO_COLOR: "1", RYUX_NO_UPDATE_CHECK: "1" } });
  return { code: r.status, stdout: r.stdout, stderr: r.stderr };
};
const mismatch = cases[0].input.text;
const matching = cases[1].input.text;

test("the CLI's engine answers every recorded case the same as ryux-core", () => {
  for (const c of cases) assert.deepEqual(reportCheck(c.input.text), c.output, c.name);
  assert.deepEqual(cases[0].input.areas, [...GATE_AREAS], "fixtures use the gate areas the skill ships");
});

test("ryux report-check <file> and stdin: exit 1 with the reason on a mismatch, 0 when the counts agree", () => {
  const dir = mkdtempSync(join(tmpdir(), "ryux-rc-"));
  writeFileSync(join(dir, "reply.md"), mismatch);
  const bad = run(dir, ["report-check", "reply.md"]);
  assert.equal(bad.code, 1);
  assert.match(bad.stdout, /NOT VERIFIED is 9 in the gate line and 8 in the detail/);
  const good = run(dir, ["report-check"], matching);
  assert.equal(good.code, 0);
  assert.match(good.stdout, /gate line matches the detail/);
  const json = JSON.parse(run(dir, ["report-check", "reply.md", "--json"]).stdout);
  assert.equal(json.ok, false);
  rmSync(dir, { recursive: true, force: true });
});

test("report-check --hook reads the last assistant reply from Claude Code's transcript and holds the stop on a mismatch", () => {
  const dir = mkdtempSync(join(tmpdir(), "ryux-rc-"));
  const transcript = (text) => {
    const p = join(dir, `t${Math.random()}.jsonl`);
    writeFileSync(p, [
      JSON.stringify({ type: "user", message: { role: "user", content: "kritik halaman ini" } }),
      JSON.stringify({ type: "assistant", message: { role: "assistant", content: [{ type: "text", text: "Saya cek dulu." }] } }),
      JSON.stringify({ type: "assistant", message: { role: "assistant", content: [{ type: "text", text } ] } }),
    ].join("\n"));
    return p;
  };
  const held = run(dir, ["report-check", "--hook"], JSON.stringify({ transcript_path: transcript(mismatch), stop_hook_active: false }));
  assert.equal(held.code, 2);
  assert.match(held.stderr, /NOT VERIFIED is 9 in the gate line and 8 in the detail/);
  assert.equal(run(dir, ["report-check", "--hook"], JSON.stringify({ transcript_path: transcript(matching) })).code, 0);
  assert.equal(run(dir, ["report-check", "--hook"], JSON.stringify({ transcript_path: transcript(mismatch), stop_hook_active: true })).code, 0, "a second stop is never held: no loop");
  assert.equal(run(dir, ["report-check", "--hook"], JSON.stringify({ transcript_path: transcript("Halo, ada yang bisa dibantu?") })).code, 0, "a reply with no report passes");
  assert.equal(run(dir, ["report-check", "--hook"], "not json").code, 0, "bad input never blocks the agent");
  assert.equal(run(dir, ["report-check", "--hook"], JSON.stringify({ transcript_path: join(dir, "missing.jsonl") })).code, 0);
  rmSync(dir, { recursive: true, force: true });
});

test("install --agent claude --hook adds the Stop report check beside the scan hook; remove takes both away", () => {
  const dir = mkdtempSync(join(tmpdir(), "ryux-rc-"));
  mkdirSync(join(dir, ".claude"));
  const settings = join(dir, ".claude", "settings.json");
  const mine = { hooks: [{ type: "command", command: "echo done" }] };
  writeFileSync(settings, JSON.stringify({ hooks: { Stop: [mine] } }));
  assert.equal(run(dir, ["install", "--agent", "claude", "--hook"]).code, 0);
  let s = JSON.parse(readFileSync(settings, "utf8"));
  assert.equal(s.hooks.Stop.length, 2);
  assert.equal(s.hooks.Stop[1].hooks[0].command, `npx -y @ryuxdsgn/design-intelligence@${VERSION} report-check --hook`);
  run(dir, ["install", "--agent", "claude", "--hook"]);
  assert.equal(JSON.parse(readFileSync(settings, "utf8")).hooks.Stop.length, 2, "installing twice adds it once");
  assert.equal(run(dir, ["remove", "--yes"]).code, 0);
  s = JSON.parse(readFileSync(settings, "utf8"));
  assert.deepEqual(s.hooks.Stop, [mine]);
  rmSync(dir, { recursive: true, force: true });
});
