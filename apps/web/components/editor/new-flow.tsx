"use client";

import { BUCKET, checkMeta, flowIds, mediaTypeFor, saveFlowRows, screenIdFromHash, sha256Hex, storagePath, type FlowMeta } from "@ryux/core/knowledge";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { editorBrowserClient } from "@/lib/editor/supabase";
import { Button, Field, Problems, inputClass } from "./ui";

interface Picked {
  file: File;
  hash: string;
  preview: string;
}

const MAX_MB = 10;

export function NewFlow() {
  const router = useRouter();
  const [meta, setMeta] = useState<FlowMeta>({ app: "", category: "", platform: "android", version: "", captured_at: new Date().toISOString().slice(0, 10), device: "", flow_type: "", title: "" });
  const [files, setFiles] = useState<Picked[]>([]);
  const [notes, setNotes] = useState<string[]>([]);
  const [problems, setProblems] = useState<string[]>([]);
  const [progress, setProgress] = useState("");

  useEffect(() => () => files.forEach((f) => URL.revokeObjectURL(f.preview)), [files]);

  const set = (k: keyof FlowMeta) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setMeta({ ...meta, [k]: e.target.value });

  async function add(list: FileList | null) {
    if (!list) return;
    const added: Picked[] = [];
    const skipped: string[] = [];
    const known = new Set(files.map((f) => f.hash));
    for (const file of Array.from(list)) {
      if (!/\.(png|jpe?g|webp)$/i.test(file.name)) { skipped.push(`${file.name}: not a PNG, JPEG, or WebP image`); continue; }
      if (file.size > MAX_MB * 1024 * 1024) { skipped.push(`${file.name}: larger than ${MAX_MB} MB`); continue; }
      const hash = await sha256Hex(await file.arrayBuffer());
      if (known.has(hash)) { skipped.push(`${file.name}: same image as one already added`); continue; }
      known.add(hash);
      added.push({ file, hash, preview: URL.createObjectURL(file) });
    }
    // Files picked together are ordered by name (01.png, 02.png, ...), as in a flow folder.
    added.sort((a, b) => a.file.name.localeCompare(b.file.name, undefined, { numeric: true }));
    setFiles([...files, ...added]);
    setNotes(skipped);
    setProblems([]);
  }

  const move = (i: number, d: -1 | 1) => {
    const next = [...files];
    [next[i], next[i + d]] = [next[i + d], next[i]];
    setFiles(next);
    setProblems([]);
  };
  const remove = (i: number) => {
    URL.revokeObjectURL(files[i].preview);
    setFiles(files.filter((_, j) => j !== i));
    setProblems([]);
  };

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const LABELS: Record<string, string> = { app: "App", category: "Category", version: "App version", captured_at: "Captured on", flow_type: "Flow type", title: "Title" };
    const found = checkMeta(meta).map((p) =>
      p.startsWith("missing ") ? `Fill in ${p.slice(8).split(", ").map((k) => LABELS[k] ?? k).join(", ")}` : p.replace("captured_at must be YYYY-MM-DD", "Captured on needs a full date"));
    if (!files.length) found.push("Add at least one screen");
    setProblems(found);
    if (found.length) return;

    const sb = editorBrowserClient();
    const { flowId } = flowIds(meta);
    const existing = await sb.from("flows").select("id").eq("id", flowId).maybeSingle();
    if (existing.data) {
      setProblems([`A flow with this app, version, type, and title already exists. Open it from the list, or change the title.`]);
      return;
    }
    // Screen IDs come from the image hash: a screenshot already in another flow would be moved here.
    const ids = files.map((f) => screenIdFromHash(f.hash));
    const taken = await sb.from("screens").select("id, flow_id").in("id", ids).neq("flow_id", flowId);
    if (taken.data?.length) {
      const names = taken.data.map((t) => files[ids.indexOf(t.id)]?.file.name).filter(Boolean);
      setProblems([`Already in another flow: ${names.join(", ")}. Remove ${names.length > 1 ? "them" : "it"}, or open that flow instead.`]);
      return;
    }
    try {
      const screens = [];
      for (const [i, f] of files.entries()) {
        setProgress(`Uploading screen ${i + 1} of ${files.length}…`);
        const screenId = screenIdFromHash(f.hash);
        const path = storagePath(meta, flowId, i + 1, screenId, f.file.name.slice(f.file.name.lastIndexOf(".")).toLowerCase());
        const up = await sb.storage.from(BUCKET).upload(path, f.file, { contentType: mediaTypeFor(f.file.name), upsert: true });
        if (up.error) throw new Error(`${f.file.name}: ${up.error.message}`);
        screens.push({ position: i + 1, screenId, path });
      }
      setProgress("Saving the flow…");
      await saveFlowRows(sb, meta, screens);
      router.push(`/editor/flows/${flowId}`);
    } catch (err) {
      setProblems([`Upload stopped: ${err instanceof Error ? err.message : String(err)}. Screens already uploaded stay in storage; submit again to continue.`]);
      setProgress("");
    }
  }

  return (
    <form onSubmit={submit} className="grid gap-8 lg:grid-cols-[minmax(0,22rem)_minmax(0,1fr)]">
      <fieldset className="flex flex-col gap-4" disabled={!!progress}>
        <legend className="sr-only">About this flow</legend>
        <Field label="App" htmlFor="app"><input id="app" value={meta.app} onChange={set("app")} placeholder="Gojek" className={inputClass} /></Field>
        <Field label="Category" htmlFor="category" hint="The kind of product, as in docs/taxonomy.md."><input id="category" value={meta.category} onChange={set("category")} placeholder="ewallet" className={inputClass} /></Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Platform" htmlFor="platform">
            <select id="platform" value={meta.platform} onChange={set("platform")} className={inputClass}>
              <option value="android">Android</option>
              <option value="ios">iOS</option>
              <option value="web">Web</option>
            </select>
          </Field>
          <Field label="App version" htmlFor="version"><input id="version" value={meta.version} onChange={set("version")} placeholder="5.80.0" className={inputClass} /></Field>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Captured on" htmlFor="captured_at"><input id="captured_at" type="date" value={meta.captured_at} onChange={set("captured_at")} className={inputClass} /></Field>
          <Field label="Device" htmlFor="device"><input id="device" value={meta.device} onChange={set("device")} placeholder="iPhone 15 Pro" className={inputClass} /></Field>
        </div>
        <Field label="Flow type" htmlFor="flow_type" hint="For example payment, onboarding, checkout."><input id="flow_type" value={meta.flow_type} onChange={set("flow_type")} placeholder="payment" className={inputClass} /></Field>
        <Field label="Title" htmlFor="title"><input id="title" value={meta.title} onChange={set("title")} placeholder="Pay a QRIS code with GoPay" className={inputClass} /></Field>
      </fieldset>

      <div className="flex flex-col gap-4">
        <label htmlFor="screens" className="flex cursor-pointer flex-col items-center justify-center gap-1 rounded-lg border border-dashed border-hair p-8 text-center hover:border-accent/60 focus-within:outline-2 focus-within:outline-accent">
          <span className="text-sm text-ink">Choose screenshots</span>
          <span className="text-xs text-muted">PNG, JPEG, or WebP, up to {MAX_MB} MB each. Hide personal data before uploading.</span>
          <input id="screens" type="file" accept="image/png,image/jpeg,image/webp" multiple className="sr-only" disabled={!!progress} onChange={(e) => { add(e.target.files); e.target.value = ""; }} />
        </label>
        <Problems title="Not added" items={notes} />

        {files.length > 0 && (
          <ol className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
            {files.map((f, i) => (
              <li key={f.hash} className="flex flex-col gap-2 rounded-lg border border-hair bg-paper-2 p-2">
                <div className="relative aspect-[9/16] overflow-hidden rounded bg-panel">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={f.preview} alt={`Screen ${i + 1}: ${f.file.name}`} className="h-full w-full object-contain" />
                  <span className="absolute left-1.5 top-1.5 rounded bg-paper/90 px-1.5 font-mono text-xs text-ink">{i + 1}</span>
                </div>
                <p className="truncate font-mono text-xs text-muted" title={f.file.name}>{f.file.name}</p>
                <div className="flex items-center gap-0.5">
                  <Button type="button" kind="quiet" className="min-h-8 px-1.5" disabled={i === 0 || !!progress} onClick={() => move(i, -1)} aria-label={`Move screen ${i + 1} earlier`}>←</Button>
                  <Button type="button" kind="quiet" className="min-h-8 px-1.5" disabled={i === files.length - 1 || !!progress} onClick={() => move(i, 1)} aria-label={`Move screen ${i + 1} later`}>→</Button>
                  <Button type="button" kind="quiet" className="ml-auto min-h-8 px-2 text-xs" disabled={!!progress} onClick={() => remove(i)} aria-label={`Remove screen ${i + 1}`}>Remove</Button>
                </div>
              </li>
            ))}
          </ol>
        )}

        <Problems title="Can't upload yet" items={problems} />
        <div className="flex items-center gap-3">
          <Button kind="primary" type="submit" disabled={!!progress}>{progress ? "Uploading…" : `Upload ${files.length || ""} ${files.length === 1 ? "screen" : "screens"}`.replace("  ", " ")}</Button>
          <p aria-live="polite" className="text-sm text-ink-2">{progress}</p>
        </div>
      </div>
    </form>
  );
}
