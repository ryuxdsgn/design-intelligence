#!/usr/bin/env node
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { loadEnv } from "./env.js";
import { capture, draft, ingest, publish, syncTags, writeReview } from "./commands.js";
import { editorClient } from "./supabase.js";

const root = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "..");

const HELP = `RYUX Knowledge pipeline (internal)

Usage: pnpm knowledge <command> [flow-folder]

  tags                 sync tag rows from docs/taxonomy.md
  capture <folder> <url...> [--width 1440]
                       screenshot web pages in order into a flow folder (web references)
  ingest  <folder>     upload screenshots and create draft rows
  draft   <folder>     Claude drafts tags and OCR (source: ai)
  review  <folder>     write review.md for the human review
  publish <folder>     publish after personal-data checks, tag decisions, and designer notes

A flow folder holds flow.yaml (app, category, version, captured_at, flow_type, title; optional
platform, device) and the screenshots in order (01.png, 02.png, ...). Keep capture folders outside
this repository. Settings come from .env: SUPABASE_URL, SUPABASE_ANON_KEY, RYUX_EDITOR_EMAIL,
RYUX_EDITOR_PASSWORD, and for draft ANTHROPIC_API_KEY (optional RYUX_TAG_MODEL).`;

async function main(): Promise<void> {
  loadEnv(root);
  const [cmd, folder, ...rest] = process.argv.slice(2);
  if (!cmd || cmd === "help" || cmd === "--help") {
    console.log(HELP);
    return;
  }
  const dir = folder ? resolve(process.env.INIT_CWD ?? process.cwd(), folder) : "";
  if (cmd !== "tags" && !dir) throw new Error(`"${cmd}" needs a flow folder`);
  if (cmd === "capture") {
    const w = rest.indexOf("--width");
    const width = w >= 0 ? Number(rest[w + 1]) : 1440;
    if (!Number.isInteger(width) || width < 320) throw new Error("--width must be a whole number of 320 or more");
    const urls = w >= 0 ? rest.filter((_, i) => i !== w && i !== w + 1) : rest;
    const files = capture(dir, urls, width);
    console.log(`Captured ${files.join(", ")} at ${width} wide into ${dir}. Fill in flow.yaml, then ingest.`);
    return;
  }
  const sb = await editorClient();
  switch (cmd) {
    case "tags": {
      const ids = await syncTags(sb, root);
      console.log(`${ids.size} tags in the vocabulary`);
      break;
    }
    case "ingest": {
      const f = await ingest(sb, dir);
      console.log(`${f.flowId}: ${f.screens.length} screens uploaded as draft${f.duplicates.length ? `, ${f.duplicates.length} duplicates skipped (${f.duplicates.join(", ")})` : ""}`);
      break;
    }
    case "draft": {
      if (!process.env.ANTHROPIC_API_KEY && !process.env.ANTHROPIC_AUTH_TOKEN) {
        console.log("Skipped: no ANTHROPIC_API_KEY in .env. Add tags by hand in review.md instead.");
        break;
      }
      for (const r of await draft(sb, root, dir)) console.log(`${r.screen}: ${r.tags.join(", ") || "(no tags)"}`);
      break;
    }
    case "review":
      console.log(`Wrote ${await writeReview(sb, dir)}`);
      break;
    case "publish":
      await publish(sb, root, dir);
      console.log("Published.");
      break;
    default:
      console.log(HELP);
      process.exitCode = 1;
  }
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exitCode = 1;
});
