import { existsSync } from "node:fs";
import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { dirname, relative } from "node:path";
import { MARK_END, MARK_START } from "./content.js";

function escapeRe(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

const blockRe = new RegExp(`${escapeRe(MARK_START)}[\\s\\S]*?${escapeRe(MARK_END)}`);

export function rel(path: string): string {
  return relative(process.cwd(), path) || path;
}

export async function writeFileEnsured(path: string, content: string): Promise<void> {
  await mkdir(dirname(path), { recursive: true });
  await writeFile(path, content, "utf8");
}

/** Tulis atau perbarui HANYA blok bertanda ryux-rules. File lain milik pengguna tidak disentuh. */
export async function upsertBlock(path: string, body: string): Promise<void> {
  const block = `${MARK_START}\n${body}\n${MARK_END}`;
  const existing = existsSync(path) ? await readFile(path, "utf8") : "";
  let next: string;
  if (blockRe.test(existing)) {
    next = existing.replace(blockRe, block);
  } else {
    const base = existing.trimEnd();
    next = base ? `${base}\n\n${block}\n` : `${block}\n`;
  }
  await writeFileEnsured(path, next);
}

/** Hapus blok bertanda ryux-rules; kembalikan true jika ada yang dihapus. */
export async function removeBlock(path: string): Promise<boolean> {
  if (!existsSync(path)) return false;
  const existing = await readFile(path, "utf8");
  if (!blockRe.test(existing)) return false;
  const stripped = existing.replace(blockRe, "").replace(/\n{3,}/g, "\n\n").trimEnd();
  if (!stripped) {
    // File hanya berisi blok ryux-rules (kita yang buat) -> hapus, jangan tinggalkan file kosong.
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
