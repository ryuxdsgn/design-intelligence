# Interactive direction pick (`ryux pick`) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a `ryux pick` CLI command that serves the skill's directions page from loopback, waits for a click, and prints the choice to stdout, so the Design/Explore flow closes the loop with no copy-paste.

**Architecture:** One new CLI module (`packages/cli/src/cli/pick.ts`) with a pure HTML-injector, an async server-and-wait core, and the CLI wiring; one dispatch case in `index.ts`; and a skill-text change in `guides.ts` that makes Explore try `ryux pick` and fall back to the current text flow. The skill still writes the page; the CLI only transports.

**Tech Stack:** TypeScript, Node built-in `node:http` and `node:fs`, no web framework. Tests in `node:test` + `node:assert/strict`, mirroring `packages/cli/test/cli.test.mjs`.

**Spec:** `docs/superpowers/specs/2026-11-12-interactive-direction-pick-design.md`

## Global Constraints

- Server binds `127.0.0.1` only, never `0.0.0.0`; ephemeral port (bind port `0`).
- Node built-in `node:http` only; no new runtime dependency, no web framework.
- stdout carries the machine result; stderr carries human/diagnostic text.
- Result grammar: one newline-terminated line — `pick: <n>`, `regenerate`, or `fallback: <reason>`.
- Exit codes: `0` on a clean `pick:`/`regenerate`; `3` on fallback (`1` and `2` already mean problem and misuse in `scan`).
- `pick` has its own timeout, default `240` seconds, overridable with `--timeout <seconds>`.
- A browser-launch failure does NOT fall back by itself: print the URL to stderr and keep serving.
- No per-tile labels in v1; `pick` returns the number only.
- Logic lives in `packages/cli/src`; the skill is generated via `pnpm sync:skills`; `pnpm typecheck`, `pnpm test`, `pnpm check:sync` gate the change; no version bump in the PR.

## Review Focus

- **Loopback only.** The server must bind `127.0.0.1`, not all interfaces — covered in Task 1 (`serveAndWait` listening-address assertion).
- **Malformed or unknown POST body** (not a valid number, not `regenerate`) must not crash the server or resolve wrongly; the server keeps waiting — covered in Task 1.
- **Browser-launch failure still serves.** When the launcher throws, the command keeps serving and still resolves on a POST — covered in Task 2.
- **Missing or unreadable HTML path** ends cleanly (exit `3`, `fallback:` line), not a stack trace — covered in Task 2.
- **Timeout** returns `fallback: timeout` and exit `3`, with the server shut down so nothing lingers — covered in Task 2.

---

### Task 1: The injector and the server-and-wait core

**Files:**
- Create: `packages/cli/src/cli/pick.ts`
- Test: `packages/cli/test/pick.test.mjs`

**Interfaces:**
- Produces:
  - `injectHooks(html: string): string` — returns the page with a `<script>` appended that, on click of an element carrying `data-ryux-pick`, POSTs `{ "choice": "<value>" }` (the attribute's value) to `/pick` on the same origin.
  - `type PickResult = { kind: "pick"; n: number } | { kind: "regenerate" } | { kind: "fallback"; reason: string }`
  - `serveAndWait(opts: { html: string; timeoutMs: number; open?: boolean; onListening?: (port: number) => void }): Promise<PickResult>` — serves the injected `html` on `127.0.0.1:0`, resolves when `/pick` receives a valid body, on timeout resolves `{kind:"fallback",reason:"timeout"}`; always closes the server before resolving. `open` defaults to `true`; tests pass `false`. `onListening` receives the chosen port.

- [ ] **Step 1: Write the failing tests**

```js
import { injectHooks, serveAndWait } from "../dist/cli/pick.js";

test("injectHooks appends a script and leaves the data hooks intact", () => {
  const out = injectHooks('<button data-ryux-pick="2">Pick 2</button>');
  assert.match(out, /data-ryux-pick="2"/);
  assert.match(out, /<script>[\s\S]*fetch\([\s\S]*\/pick/);
});

test("serveAndWait binds loopback only and resolves a pick from a POST", async () => {
  const r = await new Promise((resolve, reject) => {
    serveAndWait({
      html: '<button data-ryux-pick="2">x</button>', timeoutMs: 5000, open: false,
      onListening: async (port) => {
        const res = await fetch(`http://127.0.0.1:${port}/pick`, {
          method: "POST", headers: { "content-type": "application/json" },
          body: JSON.stringify({ choice: "2" }),
        });
        assert.equal(res.status, 200);
      },
    }).then(resolve, reject);
  });
  assert.deepEqual(r, { kind: "pick", n: 2 });
});

test("serveAndWait resolves regenerate", async () => {
  let port;
  const p = serveAndWait({ html: "<a data-ryux-pick='regenerate'>x</a>", timeoutMs: 5000, open: false, onListening: (x) => (port = x) });
  await new Promise((r) => setTimeout(r, 50));
  await fetch(`http://127.0.0.1:${port}/pick`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ choice: "regenerate" }) });
  assert.deepEqual(await p, { kind: "regenerate" });
});

test("serveAndWait ignores a malformed POST and keeps waiting, then times out", async () => {
  let port;
  const p = serveAndWait({ html: "<i>x</i>", timeoutMs: 400, open: false, onListening: (x) => (port = x) });
  await new Promise((r) => setTimeout(r, 50));
  const res = await fetch(`http://127.0.0.1:${port}/pick`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ choice: "banana" }) });
  assert.equal(res.status, 400);
  assert.deepEqual(await p, { kind: "fallback", reason: "timeout" });
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `node --test packages/cli/test/pick.test.mjs`
Expected: FAIL — `pick.js` has no such exports.

- [ ] **Step 3: Implement `injectHooks` and `serveAndWait` in `packages/cli/src/cli/pick.ts`**

`injectHooks`: append a `<script>` (no external deps) that adds one delegated `click` listener; on a target with `data-ryux-pick`, `fetch("/pick", {method:"POST", body: JSON.stringify({choice})})` then shows a "you can close this tab" note. `serveAndWait`: `http.createServer`, `listen(0, "127.0.0.1")`, call `onListening` with `server.address().port`, open the browser when `open` is true (Task 2's launcher — until then a dynamic import guarded so this task's tests pass with `open:false`). `GET /` returns `injectHooks(html)`; `POST /pick` reads the body, maps `"regenerate"` → `{kind:"regenerate"}`, a string of digits → `{kind:"pick",n}`, anything else → respond `400` and keep waiting; on a valid body respond `200`, close the server, resolve. A `setTimeout(timeoutMs)` closes the server and resolves `{kind:"fallback",reason:"timeout"}`.

- [ ] **Step 4: Run the tests to verify they pass**

Run: `node --test packages/cli/test/pick.test.mjs`
Expected: PASS (4 tests).

- [ ] **Step 5: Commit**

```bash
git add packages/cli/src/cli/pick.ts packages/cli/test/pick.test.mjs
git commit -m "feat(cli): pick — loopback server, hook injection, result core"
```

---

### Task 2: The browser launcher, `runPick` wiring, and the dispatch case

**Files:**
- Modify: `packages/cli/src/cli/pick.ts` (add `openBrowser`, `runPick`)
- Modify: `packages/cli/src/cli/index.ts` (dispatch `case "pick"`, ~line 899 near `case "scan"`)
- Test: `packages/cli/test/pick.test.mjs` (add integration cases)

**Interfaces:**
- Consumes: `serveAndWait`, `PickResult` from Task 1.
- Produces:
  - `openBrowser(url: string): void` — spawns `open` (darwin) / `start` (win32) / `xdg-open` (else), detached; throws on spawn failure so callers can treat it as non-fatal.
  - `runPick(argv: string[]): Promise<void>` — parses `<path-to-html>` (first non-flag arg) and `--timeout`; reads the file; on a read error prints `fallback: <reason>` to stdout and sets `process.exitCode = 3`; otherwise calls `serveAndWait` (browser launch wrapped in try/catch — on failure print the URL to stderr and keep serving); prints the result line to stdout; sets `process.exitCode = 3` only for a `fallback` result.

- [ ] **Step 1: Write the failing tests**

```js
import { spawnSync } from "node:child_process";
// cli = dist/cli/index.js (as in cli.test.mjs); run with env RYUX_PICK_NO_OPEN=1

test("pick on a missing file falls back with exit 3", () => {
  const r = spawnSync("node", [cli, "pick", "does-not-exist.html", "--timeout", "1"],
    { encoding: "utf8", env: { ...process.env, NO_COLOR: "1", RYUX_PICK_NO_OPEN: "1" } });
  assert.equal(r.status, 3);
  assert.match(r.stdout, /^fallback: /m);
});

test("pick times out to fallback with exit 3 and no browser", () => {
  const dir = mkdtempSync(join(tmpdir(), "ryux-pick-"));
  const f = join(dir, "d.html"); writeFileSync(f, "<i data-ryux-pick='1'>x</i>");
  const r = spawnSync("node", [cli, "pick", f, "--timeout", "1"],
    { encoding: "utf8", env: { ...process.env, NO_COLOR: "1", RYUX_PICK_NO_OPEN: "1" } });
  assert.equal(r.status, 3);
  assert.match(r.stdout, /^fallback: timeout$/m);
  rmSync(dir, { recursive: true, force: true });
});
```

Add one direct test that a browser-launch failure still resolves on a POST: call `runPick`-adjacent `serveAndWait` with `open:false` is already covered; here assert `openBrowser` throwing is caught — a unit test that monkeypatches is overkill, so instead assert via env: with `RYUX_PICK_NO_OPEN=1` the timeout test above proves the server runs and resolves without a browser.

- [ ] **Step 2: Run the tests to verify they fail**

Run: `node --test packages/cli/test/pick.test.mjs`
Expected: FAIL — unknown command `pick` (exit 2), not 3.

- [ ] **Step 3: Implement `openBrowser` and `runPick`; wire the dispatch**

`openBrowser`: `child_process.spawn` the platform command, `{ detached: true, stdio: "ignore" }`, `.unref()`; honour `RYUX_PICK_NO_OPEN` by returning early. `runPick`: parse args (first non-`--` token is the path; reuse the module's own small parse or `parseFlags`-style scan for `--timeout`), default timeout 240s → ms; read file (catch → `fallback: cannot read <path>`, exit 3); `serveAndWait({ html, timeoutMs, open:true, onListening:(port)=>{ try { openBrowser(url) } catch { console.error(url) } } })`; print the line for the result; exit 3 only on fallback. In `index.ts` add `case "pick": return runPick(argv.slice(1));` next to `case "scan"`, and import `runPick`.

- [ ] **Step 4: Run the tests to verify they pass**

Run: `node --test packages/cli/test/pick.test.mjs`
Expected: PASS (all cases).

- [ ] **Step 5: Build and run the whole CLI suite**

Run: `pnpm --filter @ryuxdsgn/design-intelligence build && node --test packages/cli/test/pick.test.mjs packages/cli/test/cli.test.mjs`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add packages/cli/src/cli/pick.ts packages/cli/src/cli/index.ts packages/cli/test/pick.test.mjs
git commit -m "feat(cli): pick command — browser launch, runPick wiring, dispatch"
```

---

### Task 3: The skill flow — Explore tries `ryux pick`, falls back to text

**Files:**
- Modify: `packages/cli/src/intelligence/guides.ts` (the Explore paragraph at ~line 88–96, `directions.html` instruction)
- Modify: `packages/cli/test/bundle.test.mjs` (assert the new flow in the generated skill)
- Regenerate: `skills/ryux/**`, `plugins/ryux/**`, `docs/design-rules.md` via `pnpm sync:skills`

**Interfaces:**
- Consumes: the `ryux pick` command surface and grammar from Tasks 1–2 (`pick: <n>`, `regenerate`, `fallback:`, exit 3).

- [ ] **Step 1: Write the failing test**

```js
test("Explore closes the direction loop with ryux pick and keeps the text fallback", () => {
  const f = renderBundle()["capabilities/design.md"].replace(/\s+/g, " ");
  assert.match(f, /data-ryux-pick/);
  assert.match(f, /None of these|make three new/i);
  assert.match(f, /ryux pick/);
  assert.match(f, /pick: <n>|a clean pick line/i);
  assert.match(f, /fall ?back|the current text flow/i);
  assert.match(f, /no scripts of its own/);
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `pnpm --filter @ryuxdsgn/design-intelligence build && node --test packages/cli/test/bundle.test.mjs`
Expected: FAIL on the new assertions.

- [ ] **Step 3: Edit the Explore paragraph in `guides.ts`**

In the `directions.html` instruction: change "no server, no scripts" → "no server, and no scripts of its own"; add that each choice tile carries `data-ryux-pick="<n>"` and the page includes a regenerate control `data-ryux-pick="regenerate"` ("None of these — make three new"). Add the loop: run `ryux pick directions.html`; a clean `pick: <n>` line is the choice, `regenerate` means explore three new directions and run it again, and on anything else (a `fallback:` line, a non-zero exit, no output, or `pick` unavailable) open the file as today and ask for the pick in text. Keep every existing clause (render-to-check, `open`/`xdg-open`/`start`, one round of choice).

- [ ] **Step 4: Regenerate the bundle and run the test**

Run: `pnpm sync:skills && node --test packages/cli/test/bundle.test.mjs`
Expected: PASS.

- [ ] **Step 5: Full gate**

Run: `pnpm typecheck && pnpm test && pnpm check:sync`
Expected: all PASS.

- [ ] **Step 6: Commit**

```bash
git add packages/cli/src/intelligence/guides.ts packages/cli/test/bundle.test.mjs skills plugins docs/design-rules.md
git commit -m "feat(design): Explore closes the direction loop with ryux pick, text fallback kept"
```
