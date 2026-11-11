import { createServer } from "node:http";

export type PickResult =
  | { kind: "pick"; n: number }
  | { kind: "regenerate" }
  | { kind: "fallback"; reason: string };

const CLIENT_SCRIPT = `<script>
document.addEventListener("click", function (e) {
  var el = e.target.closest("[data-ryux-pick]");
  if (!el) return;
  e.preventDefault();
  var choice = el.getAttribute("data-ryux-pick");
  fetch("/pick", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ choice: choice }),
  }).then(function () {
    document.body.innerHTML =
      '<p style="font:16px system-ui;padding:2rem">Choice sent. You can close this tab.</p>';
  });
});
</script>`;

/** Append the choice-return script. The data-ryux-pick hooks in the page are left untouched. */
export function injectHooks(html: string): string {
  return html + "\n" + CLIENT_SCRIPT;
}

function parseChoice(raw: string): PickResult | null {
  if (raw === "regenerate") return { kind: "regenerate" };
  if (/^\d+$/.test(raw)) return { kind: "pick", n: Number(raw) };
  return null;
}

export interface ServeOptions {
  html: string;
  timeoutMs: number;
  open?: boolean;
  onListening?: (port: number, host: string) => void;
}

/** Serve the injected page on 127.0.0.1 and resolve when a valid choice is POSTed, or on timeout. */
export function serveAndWait(opts: ServeOptions): Promise<PickResult> {
  const host = "127.0.0.1";
  const page = injectHooks(opts.html);
  return new Promise<PickResult>((resolve) => {
    let done = false;
    const server = createServer((req, res) => {
      if (req.method === "POST" && req.url === "/pick") {
        let body = "";
        req.on("data", (c) => (body += c));
        req.on("end", () => {
          let choice = "";
          try {
            choice = String(JSON.parse(body).choice ?? "");
          } catch {
            choice = "";
          }
          const result = parseChoice(choice);
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
    });
  });
}
