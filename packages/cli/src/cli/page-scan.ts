// `ryux scan <url>`: render a page with Playwright at each width and measure it (./page-probe.ts).
// Playwright is optional: it is loaded from the user's project (or a global install) and never
// bundled, so installing RYUX stays light.
import { createRequire } from "node:module";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import type { ScanFinding } from "../scan.js";
import { probe, type ProbeFinding } from "./page-probe.js";

interface Page {
  on(event: "pageerror", cb: (err: Error) => void): void;
  goto(url: string, opts: { waitUntil: string; timeout: number }): Promise<unknown>;
  waitForTimeout(ms: number): Promise<void>;
  evaluate<T>(fn: () => T): Promise<T>;
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
export async function scanPages(urls: string[], widths: number[]): Promise<ScanFinding[]> {
  const chromium = await loadChromium();
  if (!chromium) throw new Error(PLAYWRIGHT_MISSING);
  let browser: Browser;
  try {
    browser = await chromium.launch();
  } catch (err) {
    throw new Error(`Playwright could not start Chromium. Run: npx playwright install chromium\n${err instanceof Error ? err.message.split("\n")[0] : err}`);
  }
  const findings: ScanFinding[] = [];
  try {
    for (const url of urls) {
      for (const width of widths) {
        // Reduced motion lets animations settle, so the page is measured in its final state.
        const ctx = await browser.newContext({ viewport: { width, height: width <= 480 ? 844 : 900 }, reducedMotion: "reduce" });
        const page = await ctx.newPage();
        const errors: string[] = [];
        page.on("pageerror", (e) => errors.push(e.message.split("\n")[0]));
        const add = (f: ProbeFinding): void => {
          findings.push({ ...f, file: url, line: 0, column: 0, width });
        };
        try {
          await page.goto(url, { waitUntil: "networkidle", timeout: 30_000 }).catch(() => page.goto(url, { waitUntil: "load", timeout: 30_000 }));
        } catch (err) {
          add({ rule: "RX-QA-08", level: "fail", selector: "page", message: `the page did not load: ${err instanceof Error ? err.message.split("\n")[0] : err}` });
          await ctx.close();
          continue;
        }
        await page.waitForTimeout(300);
        (await page.evaluate(probe)).forEach(add);
        for (const message of [...new Set(errors)]) {
          add({ rule: "RX-QA-08", level: "warn", selector: "page", message: `the page threw "${message}" while loading; check that the primary task still completes` });
        }
        await ctx.close();
      }
    }
  } finally {
    await browser.close();
  }
  return findings;
}
