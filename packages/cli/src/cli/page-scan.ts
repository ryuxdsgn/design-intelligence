// `ryux scan <url>`: render a page with Playwright at each width, read it with the in-page extract (./page-probe.ts),
// and judge that in ryux-core (../engine.ts).
// Playwright is optional: it is loaded from the user's project (or a global install) and never
// bundled, so installing RYUX stays light.
import { createRequire } from "node:module";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import type { ScanFinding } from "../checks.js";
import { probe } from "../engine.js";
import { probeAnswer, probeExtract, probeHide, probePixels, probeShow, type ProbeAsk, type ProbeFinding, type ProbeResult } from "./page-probe.js";

interface Page {
  on(event: "pageerror", cb: (err: Error) => void): void;
  goto(url: string, opts: { waitUntil: string; timeout: number }): Promise<unknown>;
  waitForTimeout(ms: number): Promise<void>;
  evaluate<T>(fn: () => T): Promise<T>;
  evaluate<T, A>(fn: (arg: A) => T, arg: A): Promise<T>;
  screenshot(opts: { clip: { x: number; y: number; width: number; height: number }; animations: "disabled"; caret: "hide" }): Promise<Buffer>;
}

/** The rendered checks over the page as it is now: the shipped extract, judged by ryux-core. When ryux-core asks,
 *  the page answers (hit tests, a filled textarea), and for each text over an image or a gradient the text is hidden
 *  and what is behind it photographed, so ryux-core can judge the pixels; then it judges again. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function judgePage(page: Page): Promise<{ extract: Record<string, unknown>; out: any }> {
  const extract: Record<string, unknown> = await page.evaluate(probeExtract);
  let out = probe(extract);
  if (out.ask) {
    const ask = out.ask as ProbeAsk;
    const answers: Record<string, unknown> = await page.evaluate(probeAnswer, ask);
    const behind: Record<number, { px: number[][] } | null> = {};
    const list = ask.behind ?? [];
    for (const [n, i] of list.entries()) {
      try {
        const clip = await page.evaluate(probeHide, i);
        const shot = clip ? await page.screenshot({ clip, animations: "disabled", caret: "hide" }) : null;
        await page.evaluate(probeShow, { i, last: n === list.length - 1 });
        behind[i] = shot ? { px: await page.evaluate(probePixels, shot.toString("base64")) } : null;
      } catch {
        behind[i] = null; // not measured; ryux-core says so
      }
    }
    if (list.length) answers.behind = behind;
    extract.answers = answers;
    out = probe(extract);
  }
  return { extract, out };
}
interface Browser {
  newContext(opts: { viewport: { width: number; height: number }; reducedMotion: string }): Promise<{ newPage(): Promise<Page>; close(): Promise<void> }>;
  close(): Promise<void>;
}
interface Chromium {
  launch(): Promise<Browser>;
}

export const PLAYWRIGHT_MISSING =
  "Scanning a URL needs Playwright, which RYUX does not install for you. In this project run:\n  npm i -D playwright && npx playwright install chromium";

async function loadChromium(): Promise<Chromium | null> {
  const fromProject = createRequire(join(process.cwd(), "noop.js"));
  for (const name of ["playwright", "playwright-core", "@playwright/test"]) {
    try {
      const mod = (await import(pathToFileURL(fromProject.resolve(name)).href)) as { chromium?: Chromium; default?: { chromium?: Chromium } };
      const chromium = mod.chromium ?? mod.default?.chromium;
      if (chromium) return chromium;
    } catch {
      // not installed under this name; try the next
    }
  }
  return null;
}

/** Render each URL at each width and return the findings. Throws PLAYWRIGHT_MISSING when there is no
 *  Playwright, and a launch error when its browser is not installed. */
export interface PageScan {
  findings: ScanFinding[];
  /** Per URL, the regions marked data-ryux-ignore that were not measured. */
  ignored: { url: string; regions: string[] }[];
}

export async function scanPages(urls: string[], widths: number[]): Promise<PageScan> {
  const chromium = await loadChromium();
  if (!chromium) throw new Error(PLAYWRIGHT_MISSING);
  let browser: Browser;
  try {
    browser = await chromium.launch();
  } catch (err) {
    throw new Error(`Playwright could not start Chromium. Run: npx playwright install chromium\n${err instanceof Error ? err.message.split("\n")[0] : err}`);
  }
  const findings: ScanFinding[] = [];
  const seen = new Set<string>();
  const ignored = new Map<string, Set<string>>();
  try {
    for (const url of urls) {
      for (const width of widths) {
        // Reduced motion lets animations settle, so the page is measured in its final state.
        const ctx = await browser.newContext({ viewport: { width, height: width <= 480 ? 844 : 900 }, reducedMotion: "reduce" });
        const page = await ctx.newPage();
        const errors: string[] = [];
        page.on("pageerror", (e) => errors.push(e.message.split("\n")[0]));
        const add = (f: ProbeFinding): void => {
          const { once, ...rest } = f;
          if (once) { if (seen.has(`${url} ${f.rule} ${once}`)) return; seen.add(`${url} ${f.rule} ${once}`); }
          findings.push({ ...rest, file: url, line: 0, column: 0, width });
        };
        try {
          await page.goto(url, { waitUntil: "networkidle", timeout: 30_000 }).catch(() => page.goto(url, { waitUntil: "load", timeout: 30_000 }));
        } catch (err) {
          add({ rule: "RX-QA-08", level: "fail", selector: "page", message: `the page did not load: ${err instanceof Error ? err.message.split("\n")[0] : err}` });
          await ctx.close();
          continue;
        }
        await page.waitForTimeout(300);
        // The page only reads; ryux-core judges. When it needs a hit test or a filled textarea, it asks, the page
        // does that, and it judges again with the answers.
        const result: ProbeResult = (await judgePage(page)).out;
        result.findings.forEach(add);
        if (result.ignored.length) {
          const set = ignored.get(url) ?? new Set<string>();
          result.ignored.forEach((r) => set.add(r));
          ignored.set(url, set);
        }
        for (const message of [...new Set(errors)]) {
          add({ rule: "RX-QA-08", level: "warn", selector: "page", message: `the page threw "${message}" while loading; check that the primary task still completes` });
        }
        await ctx.close();
      }
    }
  } finally {
    await browser.close();
  }
  return { findings, ignored: [...ignored].map(([url, regions]) => ({ url, regions: [...regions] })) };
}
