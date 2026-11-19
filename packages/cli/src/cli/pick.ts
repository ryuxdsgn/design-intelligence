import { createServer } from "node:http";
import { spawn } from "node:child_process";
import { readFile } from "node:fs/promises";

export type PickResult =
  | { kind: "pick"; n: number; name?: string }
  | { kind: "regenerate" }
  | { kind: "fallback"; reason: string };

const CLIENT_SCRIPT = `<script>
(function () {
  var id = /^id\\b/i.test(document.documentElement.lang || "");
  var t = id
    ? { picked: "Kamu memilih", regen: "Kamu minta tiga arah baru.", sent: "Pilihan sudah diterima di terminal. Kembali ke CLI untuk melanjutkan; tab ini boleh ditutup.", fail: "Pilihan belum terkirim: terminal tidak lagi menunggu. Ketik pilihanmu di terminal:", sending: "Mengirim pilihan..." }
    : { picked: "You picked", regen: "You asked for three new directions.", sent: "Your choice reached the terminal. Go back to the CLI to continue; you can close this tab.", fail: "Your choice was not sent: the terminal is no longer waiting. Type it in the terminal instead:", sending: "Sending your choice..." };
  var busy = false;
  function nameOf(el) {
    var n = el.getAttribute("data-ryux-pick-name");
    if (!n) {
      var box = el.closest("[data-ryux-direction],article,section,li,figure");
      var h = box && box.querySelector("h1,h2,h3,h4");
      n = h ? h.textContent : "";
    }
    return (n || "").replace(/\\s+/g, " ").trim().slice(0, 80);
  }
  function show(title, body, ok) {
    var old = document.getElementById("ryux-pick-note");
    if (old) old.remove();
    var wrap = document.createElement("div");
    wrap.id = "ryux-pick-note";
    wrap.setAttribute("role", ok ? "status" : "alert");
    wrap.style.cssText = "position:fixed;inset:0;z-index:2147483647;display:grid;place-items:center;background:rgba(0,0,0,.55);padding:1rem;font:16px/1.5 system-ui,sans-serif";
    var card = document.createElement("div");
    card.tabIndex = -1;
    card.style.cssText = "max-width:28rem;background:#fff;color:#111;border-radius:12px;padding:1.5rem;box-shadow:0 10px 40px rgba(0,0,0,.3);border-top:6px solid " + (ok ? "#1a7f37" : "#b42318");
    var h = document.createElement("p");
    h.style.cssText = "margin:0 0 .5rem;font-weight:700;font-size:1.125rem";
    h.textContent = title;
    var p = document.createElement("p");
    p.style.margin = "0";
    p.textContent = body;
    card.appendChild(h);
    card.appendChild(p);
    wrap.appendChild(card);
    document.body.appendChild(wrap);
    card.focus();
  }
  document.addEventListener("click", function (e) {
    var el = e.target.closest("[data-ryux-pick]");
    if (!el) return;
    e.preventDefault();
    if (busy) return;
    busy = true;
    var choice = el.getAttribute("data-ryux-pick");
    var name = nameOf(el);
    var title = choice === "regenerate" ? t.regen : t.picked + " " + choice + (name ? " \\u00b7 " + name : "");
    show(title, t.sending, true);
    fetch("/pick", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ choice: choice, name: name }),
    })
      .then(function (r) {
        if (!r.ok) throw new Error(String(r.status));
        show(title, t.sent, true);
        setTimeout(function () { window.close(); }, 1500);
      })
      .catch(function () {
        busy = false;
        show(title, t.fail + " " + choice, false);
      });
  });
})();
</script>`;

// With a recommendation the page marks that option. It never counts down or chooses for the person: an agent
// that picks on the person's behalf reads as bypassing their oversight (owner 2026-11-19, after Claude Code's
// permission check refused the timed pick in two of four runs).
const MARK_SCRIPT = `<script>
(function () {
  var cfg = JSON.parse(document.getElementById("ryux-pick-recommend").textContent);
  var label = /^id\\b/i.test(document.documentElement.lang || "") ? "Rekomendasi" : "Recommended";
  document.querySelectorAll('[data-ryux-pick="' + cfg.recommend + '"]').forEach(function (el) {
    var tag = document.createElement("span");
    tag.textContent = label;
    tag.style.cssText = "display:inline-block;margin-left:.5rem;padding:.1rem .5rem;border-radius:999px;background:#1a7f37;color:#fff;font:600 12px/1.6 system-ui,sans-serif;vertical-align:middle";
    el.appendChild(tag);
  });
})();
</script>`;

export interface MarkOptions {
  recommend: number;
}

/** Append the choice-return script, and with a recommendation a mark on that option. The data-ryux-pick hooks are left untouched. */
export function injectHooks(html: string, mark?: MarkOptions): string {
  if (!mark) return html + "\n" + CLIENT_SCRIPT;
  const cfg = `<script type="application/json" id="ryux-pick-recommend">${JSON.stringify({ recommend: mark.recommend })}</script>`;
  return html + "\n" + CLIENT_SCRIPT + "\n" + cfg + "\n" + MARK_SCRIPT;
}

function parseChoice(raw: string, rawName = ""): PickResult | null {
  if (raw === "regenerate") return { kind: "regenerate" };
  if (!/^\d+$/.test(raw)) return null;
  // The name is display text from the page, shown to the person in the terminal; one line, no control characters.
  const name = rawName.replace(/[\u0000-\u001f\u007f]+/g, " ").replace(/\s+/g, " ").trim().slice(0, 80);
  return name ? { kind: "pick", n: Number(raw), name } : { kind: "pick", n: Number(raw) };
}

export interface ServeOptions {
  html: string;
  timeoutMs: number;
  /** The option the agent recommends: marked on the page; never chosen for the person. */
  recommend?: number;
  open?: boolean;
  onListening?: (port: number, host: string) => void;
}

/** Serve the injected page on 127.0.0.1 and resolve when a valid choice is POSTed, or on timeout. */
export function serveAndWait(opts: ServeOptions): Promise<PickResult> {
  const host = "127.0.0.1";
  const page = injectHooks(opts.html, opts.recommend !== undefined ? { recommend: opts.recommend } : undefined);
  return new Promise<PickResult>((resolve) => {
    let done = false;
    const server = createServer((req, res) => {
      if (req.method === "POST" && req.url === "/pick") {
        let body = "";
        req.on("data", (c) => (body += c));
        req.on("end", () => {
          let choice = "";
          let name = "";
          try {
            const parsed = JSON.parse(body);
            choice = String(parsed.choice ?? "");
            name = typeof parsed.name === "string" ? parsed.name : "";
          } catch {
            choice = "";
          }
          const result = parseChoice(choice, name);
          if (!result) {
            res.writeHead(400).end("bad choice");
            return;
          }
          res.writeHead(200).end("ok");
          finish(result);
        });
        return;
      }
      res.writeHead(200, { "content-type": "text/html; charset=utf-8" }).end(page);
    });

    const timer = setTimeout(() => finish({ kind: "fallback", reason: "timeout" }), opts.timeoutMs);

    function finish(result: PickResult): void {
      if (done) return;
      done = true;
      clearTimeout(timer);
      server.close(() => resolve(result));
    }

    server.listen(0, host, () => {
      const port = (server.address() as { port: number }).port;
      opts.onListening?.(port, host);
      if (opts.open !== false) openBrowser(`http://${host}:${port}/`);
    });
  });
}

/** Open a URL in the user's browser, best-effort. A launch failure is swallowed so serving continues. Honours RYUX_PICK_NO_OPEN. */
export function openBrowser(url: string): void {
  if (process.env.RYUX_PICK_NO_OPEN) return;
  const cmd = process.platform === "darwin" ? "open" : process.platform === "win32" ? "start" : "xdg-open";
  try {
    const child = spawn(cmd, [url], { detached: true, stdio: "ignore", shell: process.platform === "win32" });
    child.on("error", () => {});
    child.unref();
  } catch {
    // launcher unavailable; the URL is already printed by the caller
  }
}

const DEFAULT_TIMEOUT_S = 240;

/** Read `--timeout <seconds>` from argv; a missing, non-numeric, zero, or negative value uses the default. */
export function parseTimeoutMs(argv: string[]): number {
  const i = argv.indexOf("--timeout");
  const n = i >= 0 ? Number(argv[i + 1]) : NaN;
  return (Number.isFinite(n) && n > 0 ? n : DEFAULT_TIMEOUT_S) * 1000;
}

/** Read the path, `--recommend <n>`, and `--timeout <seconds>`. */
export function parsePickArgs(argv: string[]): { path?: string; recommend?: number; timeoutMs: number } {
  const ri = argv.indexOf("--recommend");
  const rn = ri >= 0 ? Number(argv[ri + 1]) : NaN;
  const recommend = Number.isInteger(rn) && rn > 0 ? rn : undefined;
  const flagValues = new Set([ri, argv.indexOf("--timeout")].filter((i) => i >= 0).map((i) => i + 1));
  const path = argv.find((a, i) => !a.startsWith("--") && !flagValues.has(i));
  const timeoutMs = parseTimeoutMs(argv);
  return { path, recommend, timeoutMs };
}

export function resultLine(r: PickResult): string {
  if (r.kind === "pick") return `pick: ${r.n}`;
  return r.kind === "regenerate" ? "regenerate" : `fallback: ${r.reason}`;
}

/** CLI entry for `ryux pick <path> [--recommend <n>] [--timeout <seconds>]`. */
export async function runPick(argv: string[]): Promise<void> {
  const { path, recommend, timeoutMs } = parsePickArgs(argv);
  if (!path) {
    console.log("fallback: no html path given");
    process.exitCode = 3;
    return;
  }
  let html: string;
  try {
    html = await readFile(path, "utf8");
  } catch {
    console.log(`fallback: cannot read ${path}`);
    process.exitCode = 3;
    return;
  }
  const result = await serveAndWait({
    html,
    timeoutMs,
    recommend,
    open: true,
    onListening: (port, host) => console.error(`ryux pick: waiting at http://${host}:${port}/`),
  });
  // stdout stays one machine line for the agent; the person watching the terminal gets a plain confirmation.
  if (result.kind === "pick") console.error(`ryux pick: choice received: ${result.n}${result.name ? ` · ${result.name}` : ""}`);
  else if (result.kind === "regenerate") console.error("ryux pick: choice received: three new directions");
  console.log(resultLine(result));
  if (result.kind === "fallback") process.exitCode = 3;
}
