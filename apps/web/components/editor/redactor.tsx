"use client";

import { sampleValue, type PiiKind } from "@ryux/core/knowledge";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { Icon } from "./icons";
import { Button, Select } from "./ui";

/* Personal data, replaced before a screen is shared. Each area is either a solid block (never a blur:
   blurred text can sometimes be read back) or a sample value from a hand-written list, drawn on the
   area's own background colour at a size that fits it. The result replaces the original, so the
   original is not kept. Boxes are fractions of the image, so one set fits every frame of a recording.
   The AI can mark areas; a person checks every one. */

export type AreaKind = "block" | PiiKind;
export type Box = { x: number; y: number; w: number; h: number; kind?: AreaKind };

const KINDS: { value: AreaKind; label: string }[] = [
  { value: "block", label: "Solid block" },
  { value: "name", label: "Name" },
  { value: "phone", label: "Phone number" },
  { value: "email", label: "Email" },
  { value: "amount", label: "Balance or amount" },
  { value: "address", label: "Address" },
  { value: "account", label: "Account or card number" },
  { value: "face", label: "Face or photo (block)" },
  { value: "other", label: "Other identifying text" },
];
const labelOf = (k: AreaKind | undefined) => KINDS.find((x) => x.value === (k ?? "block"))!.label;

const FILL = "#1b1e22"; // the editor's ink, on screen and in the saved image
const MIN = 0.01;
const clamp = (v: number) => Math.min(1, Math.max(0, v));
const isBlock = (k?: AreaKind) => !k || k === "block" || k === "face";

/** The sample for each text box: the nth box of a kind gets the nth sample, the same on every frame. */
function samples(boxes: Box[]) {
  const seen: Record<string, number> = {};
  return boxes.map((b) => (isBlock(b.kind) ? null : sampleValue(b.kind as Exclude<PiiKind, "face">, (seen[b.kind!] = (seen[b.kind!] ?? -1) + 1))));
}

const luminance = (r: number, g: number, b: number) => 0.2126 * r + 0.7152 * g + 0.0722 * b;

/** Paints `text` over a box: the background from the pixels just around it, the text colour from the
    pixel inside that stands out most from that background, sized to the box's height and width. */
function paintSample(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, text: string) {
  const W = ctx.canvas.width, H = ctx.canvas.height;
  const ring: number[][] = [];
  const read = (px: number, py: number) => { const d = ctx.getImageData(Math.min(W - 1, Math.max(0, px)), Math.min(H - 1, Math.max(0, py)), 1, 1).data; return [d[0], d[1], d[2]]; };
  for (let i = 0; i <= 12; i++) {
    const fx = x + (w * i) / 12, fy = y + (h * i) / 12;
    ring.push(read(fx, y - 2), read(fx, y + h + 1), read(x - 2, fy), read(x + w + 1, fy));
  }
  const bg = [0, 1, 2].map((c) => Math.round(ring.reduce((s, p) => s + p[c], 0) / ring.length));
  const inside = ctx.getImageData(x, y, Math.max(1, w), Math.max(1, h)).data;
  const bgL = luminance(bg[0], bg[1], bg[2]);
  let fg = bgL > 128 ? [27, 30, 34] : [255, 255, 255], best = 0;
  for (let i = 0; i < inside.length; i += 16) {
    const d = Math.abs(luminance(inside[i], inside[i + 1], inside[i + 2]) - bgL);
    if (d > best) { best = d; fg = [inside[i], inside[i + 1], inside[i + 2]]; }
  }
  if (best < 60) fg = bgL > 128 ? [27, 30, 34] : [255, 255, 255]; // too faint to read: plain dark or light
  ctx.fillStyle = `rgb(${bg.join(",")})`;
  ctx.fillRect(x, y, w, h);
  const family = getComputedStyle(document.body).fontFamily || "system-ui, sans-serif";
  let size = h * 0.68;
  ctx.font = `500 ${size}px ${family}`;
  while (size > 6 && ctx.measureText(text).width > w * 0.96) { size *= 0.92; ctx.font = `500 ${size}px ${family}`; }
  ctx.fillStyle = `rgb(${fg.join(",")})`;
  ctx.textBaseline = "middle";
  ctx.fillText(text, x + Math.min(h * 0.08, w * 0.02), y + h / 2);
}

/** The image with every box replaced (block or sample), encoded as `type` (the original's format). */
export async function applyBoxes(source: Blob, boxes: Box[], type: string): Promise<Blob> {
  const bitmap = await createImageBitmap(source);
  const canvas = document.createElement("canvas");
  canvas.width = bitmap.width;
  canvas.height = bitmap.height;
  const ctx = canvas.getContext("2d", { willReadFrequently: true })!;
  ctx.drawImage(bitmap, 0, 0);
  bitmap.close();
  const texts = samples(boxes);
  boxes.forEach((b, i) => {
    const x = Math.floor(b.x * canvas.width), y = Math.floor(b.y * canvas.height), w = Math.ceil(b.w * canvas.width), h = Math.ceil(b.h * canvas.height);
    if (texts[i]) paintSample(ctx, x, y, w, h, texts[i]!);
    else { ctx.fillStyle = FILL; ctx.fillRect(x, y, w, h); }
  });
  return new Promise((resolve, reject) => canvas.toBlob((out) => (out ? resolve(out) : reject(new Error("could not encode the image"))), type, 0.95));
}

/** A small copy of the image for the AI (long edge 1568 px, JPEG), so the request stays light. */
async function forDetection(src: string): Promise<string> {
  const bitmap = await createImageBitmap(await (await fetch(src)).blob());
  const scale = Math.min(1, 1568 / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext("2d")!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  return canvas.toDataURL("image/jpeg", 0.85).split(",")[1];
}

export function Redactor({ src, boxes: initial, title, extra, saving = false, onSave, onCancel }: {
  src: string; boxes: Box[]; title: string; extra?: ReactNode; saving?: boolean;
  onSave: (boxes: Box[]) => void; onCancel: () => void;
}) {
  const [boxes, setBoxes] = useState(initial);
  const [draft, setDraft] = useState<Box | null>(null);
  const [selected, setSelected] = useState<number | null>(null);
  const [finding, setFinding] = useState(false);
  const [found, setFound] = useState<{ ok: boolean; text: string } | null>(null);
  const area = useRef<HTMLDivElement>(null);
  const start = useRef<{ x: number; y: number } | null>(null);
  const dialog = useRef<HTMLDivElement>(null);
  const texts = samples(boxes);

  useEffect(() => { dialog.current?.focus(); }, []);

  const at = (e: React.PointerEvent) => {
    const r = area.current!.getBoundingClientRect();
    return { x: clamp((e.clientX - r.left) / r.width), y: clamp((e.clientY - r.top) / r.height) };
  };
  const between = (a: { x: number; y: number }, b: { x: number; y: number }): Box => ({ x: Math.min(a.x, b.x), y: Math.min(a.y, b.y), w: Math.abs(a.x - b.x), h: Math.abs(a.y - b.y), kind: "block" });

  // Keyboard: arrows move the selected box by 1%, Shift+arrows resize it, Delete removes it.
  const nudge = (i: number, e: React.KeyboardEvent) => {
    const step = 0.01;
    const d = { ArrowLeft: [-step, 0], ArrowRight: [step, 0], ArrowUp: [0, -step], ArrowDown: [0, step] }[e.key];
    if (e.key === "Delete" || e.key === "Backspace") { e.preventDefault(); setBoxes((all) => all.filter((_, j) => j !== i)); setSelected(null); return; }
    if (!d) return;
    e.preventDefault();
    setBoxes((all) => all.map((b, j) => j !== i ? b : e.shiftKey
      ? { ...b, w: Math.max(MIN, Math.min(1 - b.x, b.w + d[0])), h: Math.max(MIN, Math.min(1 - b.y, b.h + d[1])) }
      : { ...b, x: clamp(Math.min(1 - b.w, b.x + d[0])), y: clamp(Math.min(1 - b.h, b.y + d[1])) }));
  };

  async function find() {
    setFinding(true);
    setFound(null);
    try {
      const res = await fetch("/api/editor/find-personal-data", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ image: await forDetection(src), mediaType: "image/jpeg" }) });
      const body = (await res.json().catch(() => ({}))) as { areas?: Box[]; error?: string };
      if (!res.ok) throw new Error(body.error ?? `request failed (${res.status})`);
      const areas = body.areas ?? [];
      setBoxes((all) => [...all, ...areas]);
      setFound({ ok: true, text: areas.length
        ? `Found ${areas.length} ${areas.length === 1 ? "area" : "areas"}. Check each one; the AI can miss personal data or mark too much.`
        : "The AI found no personal data. Look over the screen yourself before saving." });
    } catch (err) {
      setFound({ ok: false, text: `Couldn't find personal data: ${err instanceof Error ? err.message : String(err)}` });
    }
    setFinding(false);
  }

  const busy = saving || finding;
  // Rendered on the body: an animated or transformed parent (the video panel) would otherwise trap a fixed
  // overlay. The body is outside the editor's theme, so the overlay carries it (.ed-light).
  return createPortal(
    <div className="ed-light fixed inset-0 z-50 flex items-stretch justify-center bg-black/50 text-ink sm:items-center sm:p-6">
      <div ref={dialog} tabIndex={-1} role="dialog" aria-modal="true" aria-labelledby="redact-title"
        onKeyDown={(e) => { if (e.key === "Escape" && !busy) onCancel(); }}
        className="ed-enter flex w-full max-w-4xl flex-col bg-paper outline-none sm:max-h-[calc(100dvh-3rem)] sm:rounded-2xl sm:shadow-2xl">
        <div className="flex items-start gap-3 border-b border-hair px-5 py-4">
          <div className="min-w-0 flex-1">
            <h2 id="redact-title" className="text-lg">{title}</h2>
            <p className="text-sm text-ink-2">Let the AI find names, phone numbers, balances, faces, and addresses, or drag over them yourself. Each area gets a sample value or a solid block; the original is not kept.</p>
          </div>
          <Button kind="quiet" onClick={onCancel} disabled={busy} aria-label="Close without saving" className="w-11 px-0"><Icon name="close" /></Button>
        </div>

        <div className="flex min-h-0 flex-1 items-center justify-center overflow-auto bg-paper-2 p-4">
          <div ref={area} className="relative touch-none select-none" style={{ cursor: "crosshair" }}
            onPointerDown={(e) => { if (e.target !== e.currentTarget && !(e.target as HTMLElement).dataset.image) return; e.currentTarget.setPointerCapture(e.pointerId); start.current = at(e); setSelected(null); }}
            onPointerMove={(e) => { if (start.current) setDraft(between(start.current, at(e))); }}
            onPointerUp={(e) => {
              if (!start.current) return;
              const box = between(start.current, at(e));
              start.current = null;
              setDraft(null);
              if (box.w > MIN && box.h > MIN) { setBoxes((all) => [...all, box]); setSelected(boxes.length); }
            }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={src} alt="The screen to cover" data-image="1" draggable={false} className="block max-h-[58dvh] w-auto max-w-full rounded-lg" />
            {boxes.map((b, i) => (
              <div key={i} className="absolute" style={{ left: `${b.x * 100}%`, top: `${b.y * 100}%`, width: `${b.w * 100}%`, height: `${b.h * 100}%` }}>
                <button type="button" aria-label={`Area ${i + 1}, ${labelOf(b.kind)}${texts[i] ? `, becomes ${texts[i]}` : ""}. Arrows move it, Shift and arrows resize it, Delete removes it.`}
                  onClick={() => setSelected(i)} onFocus={() => setSelected(i)} onKeyDown={(e) => nudge(i, e)}
                  className={`flex size-full items-center overflow-hidden rounded-[3px] px-1 text-left outline-offset-2 ${selected === i ? "outline-2 outline-accent" : ""} ${texts[i] ? "border-2 border-dashed border-accent bg-paper/90" : ""}`}
                  style={texts[i] ? undefined : { background: FILL }}>
                  {texts[i] && <span className="truncate text-[11px] font-medium leading-none text-ink">{texts[i]}</span>}
                </button>
                <button type="button" aria-label={`Remove area ${i + 1}`} onClick={() => { setBoxes((all) => all.filter((_, j) => j !== i)); setSelected(null); }}
                  className="absolute -right-3 -top-3 grid size-7 place-items-center rounded-full border border-hair bg-paper text-ink shadow-md">
                  <Icon name="close" size="size-3.5" />
                </button>
              </div>
            ))}
            {draft && <div className="pointer-events-none absolute rounded-[3px] opacity-80" style={{ left: `${draft.x * 100}%`, top: `${draft.y * 100}%`, width: `${draft.w * 100}%`, height: `${draft.h * 100}%`, background: FILL }} />}
            {finding && <div className="pointer-events-none absolute inset-0 grid place-items-center rounded-lg bg-paper/60 text-sm font-medium text-ink">Finding personal data…</div>}
          </div>
        </div>

        <div className="flex flex-col gap-3 border-t border-hair px-5 pb-[max(1rem,env(safe-area-inset-bottom))] pt-4">
          {extra}
          {found && <p role={found.ok ? "status" : "alert"} className={`flex items-start gap-1.5 text-sm ${found.ok ? "text-ink-2" : "text-mark"}`}><Icon name={found.ok ? "ai" : "alert"} className="mt-0.5" />{found.text}</p>}
          {selected !== null && boxes[selected] && (
            <div className="flex flex-wrap items-center gap-2">
              <label htmlFor="area-kind" className="text-sm text-ink-2">Area {selected + 1} becomes</label>
              <Select id="area-kind" className="w-60" value={boxes[selected].kind ?? "block"}
                onChange={(e) => { const kind = e.target.value as AreaKind; setBoxes((all) => all.map((b, j) => (j === selected ? { ...b, kind } : b))); }}>
                {KINDS.map((k) => <option key={k.value} value={k.value}>{k.label}</option>)}
              </Select>
              {texts[selected] && <span className="text-sm text-muted">“{texts[selected]}”</span>}
            </div>
          )}
          <div className="flex flex-wrap items-center gap-2">
            <p className="mr-auto text-sm text-ink-2" aria-live="polite">{boxes.length ? `${boxes.length} ${boxes.length === 1 ? "area" : "areas"} to replace` : "Nothing marked yet"}</p>
            <Button onClick={find} disabled={busy}><Icon name="ai" />{finding ? "Finding…" : "Find personal data"}</Button>
            <Button kind="quiet" onClick={() => { setBoxes((all) => [...all, { x: 0.35, y: 0.45, w: 0.3, h: 0.06, kind: "block" }]); setSelected(boxes.length); }} disabled={busy}><Icon name="add" />Add an area</Button>
            {boxes.length > 0 && <Button kind="quiet" onClick={() => { setBoxes([]); setSelected(null); }} disabled={busy}>Clear all</Button>}
            <Button kind="primary" onClick={() => onSave(boxes)} disabled={busy}><Icon name="hide" />{saving ? "Saving…" : "Save"}</Button>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
