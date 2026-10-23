"use client";

import { BUCKET, checkMeta, flowIds, mediaTypeFor, saveFlowRows, screenIdFromHash, sha256Hex, storagePath, type FlowMeta } from "@ryux/core/knowledge";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { editorBrowserClient } from "@/lib/editor/supabase";
import { Icon } from "./icons";
import { FormFactorBadge, formFactorOf, type FormFactor } from "./form-factor";
import { UploadIllustration } from "./illustrations";
import { Redactor, applyBoxes, type Box } from "./redactor";
import { Button, Field, Problems, Select, cardClass, inputClass } from "./ui";
import { VideoFrames } from "./video-frames";

interface Picked {
  /** What gets uploaded: the original with its hidden areas painted solid. */
  file: File;
  hash: string;
  preview: string;
  original: File;
  boxes: Box[];
  /** The recording a frame came from; its areas follow the recording's until edited here (own). */
  source?: string;
  own?: boolean;
}

/** The picked file again with `boxes` painted over its original; hash and preview follow the result. */
async function cover(p: Picked, boxes: Box[], own: boolean): Promise<Picked> {
  const type = p.original.type || mediaTypeFor(p.original.name);
  const file = boxes.length ? new File([await applyBoxes(p.original, boxes, type)], p.original.name, { type }) : p.original;
  return { ...p, file, boxes, own, hash: await sha256Hex(await file.arrayBuffer()), preview: URL.createObjectURL(file) };
}

const MAX_MB = 10;
const IMAGE = /\.(png|jpe?g|webp)$/i;
const VIDEO = /\.(mp4|mov|m4v|webm)$/i;

export function NewFlow() {
  const router = useRouter();
  const [meta, setMeta] = useState<FlowMeta>({ app: "", category: "", platform: "android", version: "", captured_at: new Date().toISOString().slice(0, 10), device: "", flow_type: "", title: "" });
  const [files, setFiles] = useState<Picked[]>([]);
  const [notes, setNotes] = useState<string[]>([]);
  const [problems, setProblems] = useState<string[]>([]);
  const [progress, setProgress] = useState("");
  const [over, setOver] = useState(false);
  const [video, setVideo] = useState<File | null>(null);
  const [forms, setForms] = useState<Record<string, FormFactor>>({});
  // Hidden areas per recording, applied to every frame taken from it (now and later).
  const [masks, setMasks] = useState<Record<string, Box[]>>({});
  const masksRef = useRef(masks);
  masksRef.current = masks;
  const [editing, setEditing] = useState<{ index: number; src: string } | null>(null);
  const [saving, setSaving] = useState(false);

  // Frames from a video arrive while other state changes; read the current list, not a stale closure.
  const current = useRef(files);
  current.current = files;

  // Object URLs are revoked on remove and when the page closes, not on every change of the list.
  useEffect(() => () => current.current.forEach((f) => URL.revokeObjectURL(f.preview)), []);

  const set = (k: keyof FlowMeta) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setMeta({ ...meta, [k]: e.target.value });

  async function addImages(list: File[], sortByName: boolean, source?: string) {
    const added: Picked[] = [];
    const skipped: string[] = [];
    const known = new Set(current.current.map((f) => f.hash));
    // A frame's name carries its time in the recording, so finding screens again skips ones already added.
    const taken = new Set(current.current.filter((f) => f.source && f.source === source).map((f) => f.original.name));
    for (const file of list) {
      if (source && taken.has(file.name)) { skipped.push(`${file.name}: already added from this recording`); continue; }
      if (file.size > MAX_MB * 1024 * 1024) { skipped.push(`${file.name}: larger than ${MAX_MB} MB`); continue; }
      const hash = await sha256Hex(await file.arrayBuffer());
      if (known.has(hash)) { skipped.push(`${file.name}: same image as one already added`); continue; }
      known.add(hash);
      const picked: Picked = { file, hash, preview: URL.createObjectURL(file), original: file, boxes: [], source };
      const mask = source ? masksRef.current[source] ?? [] : [];
      added.push(mask.length ? await cover(picked, mask, false) : picked);
    }
    // Files picked together are ordered by name (01.png, 02.png, ...), as in a flow folder.
    if (sortByName) added.sort((a, b) => a.file.name.localeCompare(b.file.name, undefined, { numeric: true }));
    setFiles((prev) => [...prev, ...added]);
    return skipped;
  }

  async function add(list: FileList | null) {
    if (!list) return;
    const all = Array.from(list);
    const videos = all.filter((f) => VIDEO.test(f.name));
    const skipped = all.filter((f) => !IMAGE.test(f.name) && !VIDEO.test(f.name)).map((f) => `${f.name}: not an image or a screen recording`);
    skipped.push(...videos.slice(1).map((f) => `${f.name}: one recording at a time; add it after this one`));
    if (videos[0]) setVideo(videos[0]);
    skipped.push(...(await addImages(all.filter((f) => IMAGE.test(f.name)), true)));
    setNotes(skipped);
    setProblems([]);
  }

  async function addFrames(frames: File[], source: string) {
    setNotes(await addImages(frames, false, source));
    setProblems([]);
  }

  // ── Hiding personal data: per picked file, or once per recording for all its frames ──
  const openEditor = (index: number) => setEditing({ index, src: URL.createObjectURL(current.current[index].original) });
  const closeEditor = () => { if (editing) URL.revokeObjectURL(editing.src); setEditing(null); };

  async function saveAreas(boxes: Box[]) {
    if (!editing) return;
    setSaving(true);
    const before = current.current[editing.index];
    const after = await cover(before, boxes, true);
    URL.revokeObjectURL(before.preview);
    setFiles((all) => all.map((f) => (f === before ? after : f)));
    setSaving(false);
    setProblems([]);
    closeEditor();
  }

  async function saveRecordingAreas(source: string, boxes: Box[]) {
    setMasks((m) => ({ ...m, [source]: boxes }));
    masksRef.current = { ...masksRef.current, [source]: boxes };
    const updated = await Promise.all(current.current.map((f) => (f.source === source && !f.own ? cover(f, boxes, false) : f)));
    current.current.forEach((f, i) => { if (updated[i] !== f) URL.revokeObjectURL(f.preview); });
    setFiles(updated);
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
        <Field label="App" htmlFor="app"><input id="app" value={meta.app} onChange={set("app")} placeholder="e.g. Gojek" className={inputClass} /></Field>
        <Field label="Category" htmlFor="category" hint="The kind of product, as in docs/taxonomy.md."><input id="category" value={meta.category} onChange={set("category")} placeholder="e.g. ewallet" className={inputClass} /></Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Platform" htmlFor="platform">
            <Select id="platform" value={meta.platform} onChange={set("platform")}>
              <option value="android">Android</option>
              <option value="ios">iOS</option>
              <option value="web">Web</option>
            </Select>
          </Field>
          <Field label="App version" htmlFor="version"><input id="version" value={meta.version} onChange={set("version")} placeholder="e.g. 5.80.0" className={inputClass} /></Field>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Captured on" htmlFor="captured_at"><input id="captured_at" type="date" value={meta.captured_at} onChange={set("captured_at")} className={inputClass} /></Field>
          <Field label="Device" htmlFor="device"><input id="device" value={meta.device} onChange={set("device")} placeholder="e.g. iPhone 15 Pro" className={inputClass} /></Field>
        </div>
        <Field label="Flow type" htmlFor="flow_type" hint="For example payment, onboarding, checkout."><input id="flow_type" value={meta.flow_type} onChange={set("flow_type")} placeholder="e.g. payment" className={inputClass} /></Field>
        <Field label="Title" htmlFor="title"><input id="title" value={meta.title} onChange={set("title")} placeholder="e.g. Pay a QRIS code with GoPay" className={inputClass} /></Field>
      </fieldset>

      <div className="flex flex-col gap-4">
        <label htmlFor="screens" data-over={over}
          onDragOver={(e) => { e.preventDefault(); if (!progress) setOver(true); }}
          onDragLeave={() => setOver(false)}
          onDrop={(e) => { e.preventDefault(); setOver(false); if (!progress) add(e.dataTransfer.files); }}
          className={`ed-drop ed-chip flex cursor-pointer flex-col items-center justify-center gap-1 rounded-2xl border border-dashed bg-paper-2 p-8 text-center focus-within:outline-2 focus-within:outline-accent ${over ? "border-accent bg-accent/5" : "border-hair hover:border-accent/60"}`}>
          <UploadIllustration className="h-16 w-auto" />
          <span className="text-sm text-ink">{over ? "Drop to add" : "Drop screenshots or a screen recording here, or choose them"}</span>
          <span className="text-xs text-muted">Screenshots: PNG, JPEG, or WebP, up to {MAX_MB} MB each. Recordings: MP4, MOV, or WebM; their screens are captured for you. Hide personal data before uploading.</span>
          <input id="screens" type="file" accept="image/png,image/jpeg,image/webp,video/mp4,video/quicktime,video/webm,.m4v" multiple className="sr-only" disabled={!!progress} onChange={(e) => { add(e.target.files); e.target.value = ""; }} />
        </label>
        {video && <VideoFrames file={video} disabled={!!progress} masks={masks[video.name] ?? []}
          onMasks={(boxes) => saveRecordingAreas(video.name, boxes)} onFrames={(frames) => addFrames(frames, video.name)} onClose={() => setVideo(null)} />}
        <Problems title="Not added" items={notes} />

        {files.length > 0 && (
          <ol className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
            {files.map((f, i) => (
              <li key={`${f.original.name}-${f.original.size}-${f.original.lastModified}`} className={`ed-enter flex flex-col gap-2 p-2 ${cardClass}`}>
                <div className="relative aspect-[9/16] overflow-hidden rounded-lg bg-panel">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={f.preview} alt={`Screen ${i + 1}: ${f.file.name}`} className="h-full w-full object-contain"
                    onLoad={(e) => { const { naturalWidth: w, naturalHeight: h } = e.currentTarget; setForms((m) => ({ ...m, [f.hash]: formFactorOf(w, h) })); }} />
                  <FormFactorBadge value={forms[f.hash] ?? null} className="absolute bottom-1.5 left-1.5 shadow-sm" />
                  <span className="absolute left-1.5 top-1.5 rounded bg-paper/90 px-1.5 font-mono text-xs text-ink">{i + 1}</span>
                </div>
                <p className="truncate font-mono text-xs text-muted" title={f.file.name}>{f.file.name}</p>
                <Button type="button" size="sm" disabled={!!progress} onClick={() => openEditor(i)} aria-label={`Hide areas on screen ${i + 1}`}>
                  <Icon name="hide" />{f.boxes.length ? `${f.boxes.length} hidden · edit` : "Hide areas"}
                </Button>
                <div className="flex items-center gap-0.5">
                  <Button type="button" kind="quiet" size="sm" disabled={i === 0 || !!progress} onClick={() => move(i, -1)} aria-label={`Move screen ${i + 1} earlier`}><Icon name="earlier" /></Button>
                  <Button type="button" kind="quiet" size="sm" disabled={i === files.length - 1 || !!progress} onClick={() => move(i, 1)} aria-label={`Move screen ${i + 1} later`}><Icon name="later" /></Button>
                  <Button type="button" kind="quiet" size="sm" className="ml-auto" disabled={!!progress} onClick={() => remove(i)} aria-label={`Remove screen ${i + 1}`}>Remove</Button>
                </div>
              </li>
            ))}
          </ol>
        )}

        <Problems title="Can't upload yet" items={problems} />
        {editing && files[editing.index] && (
          <Redactor src={editing.src} boxes={files[editing.index].boxes} saving={saving} onSave={saveAreas} onCancel={closeEditor}
            title={`Hide personal data on screen ${editing.index + 1}`}
            extra={files[editing.index].source && <p className="text-xs text-muted">This frame is from {files[editing.index].source}. To hide the same areas on every frame, use “Hide areas on every frame” in the video panel.</p>} />
        )}
        <div className="flex items-center gap-3">
          <Button kind="primary" type="submit" disabled={!!progress}><Icon name="upload" />{progress ? "Uploading…" : `Upload ${files.length || ""} ${files.length === 1 ? "screen" : "screens"}`.replace("  ", " ")}</Button>
          <p aria-live="polite" className="text-sm text-ink-2">{progress}</p>
        </div>
      </div>
    </form>
  );
}
