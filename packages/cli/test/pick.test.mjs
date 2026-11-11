// Unit and integration tests for the `ryux pick` command.
import { test } from "node:test";
import assert from "node:assert/strict";
import { injectHooks, serveAndWait } from "../dist/cli/pick.js";

test("injectHooks appends a script and leaves the data hooks intact", () => {
  const out = injectHooks('<button data-ryux-pick="2">Pick 2</button>');
  assert.match(out, /data-ryux-pick="2"/);
  assert.match(out, /<script>[\s\S]*fetch\([\s\S]*\/pick/);
});

test("serveAndWait binds loopback only and resolves a pick from a POST", async () => {
  let addr;
  const r = await new Promise((resolve, reject) => {
    serveAndWait({
      html: '<button data-ryux-pick="2">x</button>',
      timeoutMs: 5000,
      open: false,
      onListening: async (port, host) => {
        addr = host;
        const res = await fetch(`http://127.0.0.1:${port}/pick`, {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ choice: "2" }),
        });
        assert.equal(res.status, 200);
      },
    }).then(resolve, reject);
  });
  assert.deepEqual(r, { kind: "pick", n: 2 });
  assert.equal(addr, "127.0.0.1");
});

test("serveAndWait resolves regenerate", async () => {
  let port;
  const p = serveAndWait({
    html: "<a data-ryux-pick='regenerate'>x</a>",
    timeoutMs: 5000,
    open: false,
    onListening: (x) => (port = x),
  });
  await new Promise((r) => setTimeout(r, 50));
  await fetch(`http://127.0.0.1:${port}/pick`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ choice: "regenerate" }),
  });
  assert.deepEqual(await p, { kind: "regenerate" });
});

test("serveAndWait ignores a malformed POST and keeps waiting, then times out", async () => {
  let port;
  const p = serveAndWait({
    html: "<i>x</i>",
    timeoutMs: 400,
    open: false,
    onListening: (x) => (port = x),
  });
  await new Promise((r) => setTimeout(r, 50));
  const res = await fetch(`http://127.0.0.1:${port}/pick`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ choice: "banana" }),
  });
  assert.equal(res.status, 400);
  assert.deepEqual(await p, { kind: "fallback", reason: "timeout" });
});
