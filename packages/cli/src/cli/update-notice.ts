// The update notice: `ryux check` says when npm has a newer RYUX. It only tells; it never installs anything.
// At most one registry call a day (cached under ~/.cache/ryux), off with RYUX_NO_UPDATE_CHECK=1 and in CI.
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { dirname, join } from "node:path";

const PACKAGE = "@ryuxdsgn/design-intelligence";
const DAY = 24 * 60 * 60 * 1000;

export const DEFAULT_CACHE = join(homedir(), ".cache", "ryux", "update.json");

export interface UpdateNotice {
  latest: string;
  message: string;
}

export interface UpdateOptions {
  current: string;
  now: number;
  cacheFile: string;
  fetchLatest: () => Promise<string>;
  env: Record<string, string | undefined>;
}

const parse = (v: string): number[] | null => {
  const m = /^(\d+)\.(\d+)\.(\d+)$/.exec(v.trim());
  return m ? [Number(m[1]), Number(m[2]), Number(m[3])] : null;
};

/** True when `a` is a higher release than `b` (plain x.y.z only). */
export function isNewer(a: string, b: string): boolean {
  const x = parse(a);
  const y = parse(b);
  if (!x || !y) return false;
  for (let i = 0; i < 3; i++) if (x[i] !== y[i]) return x[i] > y[i];
  return false;
}

/** The latest published version from the npm registry, with a short timeout. */
export async function fetchLatestFromNpm(timeoutMs = 1500): Promise<string> {
  const res = await fetch(`https://registry.npmjs.org/${PACKAGE}/latest`, { signal: AbortSignal.timeout(timeoutMs) });
  if (!res.ok) throw new Error(`registry ${res.status}`);
  const body = (await res.json()) as { version?: unknown };
  if (typeof body.version !== "string") throw new Error("no version");
  return body.version;
}

const readCache = (file: string): { checked: number; latest: string } | null => {
  try {
    const c = JSON.parse(readFileSync(file, "utf8")) as { checked?: unknown; latest?: unknown };
    return typeof c.checked === "number" && typeof c.latest === "string" ? { checked: c.checked, latest: c.latest } : null;
  } catch {
    return null;
  }
};

/** A one-line notice when a newer RYUX is published, or null (up to date, offline, opted out, or CI). */
export async function updateNotice(o: UpdateOptions): Promise<UpdateNotice | null> {
  if (o.env.RYUX_NO_UPDATE_CHECK === "1" || o.env.CI) return null;
  let latest: string;
  const cached = readCache(o.cacheFile);
  if (cached && o.now - cached.checked < DAY) latest = cached.latest;
  else {
    try {
      latest = await o.fetchLatest();
    } catch {
      return null;
    }
    try {
      mkdirSync(dirname(o.cacheFile), { recursive: true });
      writeFileSync(o.cacheFile, JSON.stringify({ checked: o.now, latest }));
    } catch {
      // a read-only home is fine: the next run asks again
    }
  }
  if (!isNewer(latest, o.current)) return null;
  return { latest, message: `RYUX ${latest} is out (this is ${o.current}). Update: npx ${PACKAGE}@latest update` };
}
