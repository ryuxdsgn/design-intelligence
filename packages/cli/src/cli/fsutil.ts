import { existsSync } from "node:fs";
import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { dirname, relative } from "node:path";
import { MARK_END, MARK_START } from "../product.js";

function escapeRe(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

type Marks = [string, string];
const RULES_MARKS: Marks = [MARK_START, MARK_END];
const blockRe = ([start, end]: Marks): RegExp => new RegExp(`${escapeRe(start)}[\\s\\S]*?${escapeRe(end)}`);

/** True when the file holds a block between these markers. */
export function hasBlock(content: string | null, marks: Marks = RULES_MARKS): boolean {
  return Boolean(content && blockRe(marks).test(content));
}

export function rel(path: string): string {
  return relative(process.cwd(), path) || path;
}

export async function writeFileEnsured(path: string, content: string): Promise<void> {
  await mkdir(dirname(path), { recursive: true });
  await writeFile(path, content, "utf8");
}

/** Write or update ONLY the marked ryux-rules block. The rest of the user's file is untouched. */
export async function upsertBlock(path: string, body: string, marks: Marks = RULES_MARKS): Promise<void> {
  const block = `${marks[0]}\n${body}\n${marks[1]}`;
  const existing = existsSync(path) ? await readFile(path, "utf8") : "";
  let next: string;
  if (blockRe(marks).test(existing)) {
    next = existing.replace(blockRe(marks), block);
  } else {
    const base = existing.trimEnd();
    next = base ? `${base}\n\n${block}\n` : `${block}\n`;
  }
  await writeFileEnsured(path, next);
}

/** Remove the marked ryux-rules block; return true if anything was removed. */
export async function removeBlock(path: string, marks: Marks = RULES_MARKS): Promise<boolean> {
  if (!existsSync(path)) return false;
  const existing = await readFile(path, "utf8");
  if (!blockRe(marks).test(existing)) return false;
  const stripped = existing.replace(blockRe(marks), "").replace(/\n{3,}/g, "\n\n").trimEnd();
  if (!stripped) {
    // The file only holds the ryux-rules block (we created it) -> delete it, don't leave an empty file.
    await rm(path, { force: true });
  } else {
    await writeFile(path, `${stripped}\n`, "utf8");
  }
  return true;
}

export async function readIfExists(path: string): Promise<string | null> {
  return existsSync(path) ? readFile(path, "utf8") : null;
}

export async function removePath(path: string): Promise<boolean> {
  if (!existsSync(path)) return false;
  await rm(path, { recursive: true, force: true });
  return true;
}

export { existsSync };
