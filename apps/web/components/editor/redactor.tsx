"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { Icon } from "./icons";
import { Button } from "./ui";

/* Hide personal data: areas are covered with a solid block, never blurred (blurred text can sometimes be
   read back), and the covered image replaces the original, so the original is not kept. Boxes are stored
   as fractions of the image, so one set fits every frame of a recording. */

export type Box = { x: number; y: number; w: number; h: number };

const FILL = "#1b1e22"; // the editor's ink, on screen and in the saved image
const MIN = 0.01;
const clamp = (v: number) => Math.min(1, Math.max(0, v));

/** The image with every box painted solid, encoded as `type` (the original's format). */
export async function applyBoxes(source: Blob, boxes: Box[], type: string): Promise<Blob> {
  const bitmap = await createImageBitmap(source);
  const canvas = document.createElement("canvas");
  canvas.width = bitmap.width;
  canvas.height = bitmap.height;
  const ctx = canvas.getContext("2d")!;
  ctx.drawImage(bitmap, 0, 0);
  ctx.fillStyle = FILL;
  for (const b of boxes) ctx.fillRect(Math.floor(b.x * canvas.width), Math.floor(b.y * canvas.height), Math.ceil(b.w * canvas.width), Math.ceil(b.h * canvas.height));
  bitmap.close();
  return new Promise((resolve, reject) => canvas.toBlob((out) => (out ? resolve(out) : reject(new Error("could not encode the image"))), type, 0.95));
}

export function Redactor({ src, boxes: initial, title, extra, saving = false, onSave, onCancel }: {
  src: string; boxes: Box[]; title: string; extra?: ReactNode; saving?: boolean;
  onSave: (boxes: Box[]) => void; onCancel: () => void;
}) {
  const [boxes, setBoxes] = useState(initial);
  const [draft, setDraft] = useState<Box | null>(null);
  const [selected, setSelected] = useState<number | null>(null);
  const area = useRef<HTMLDivElement>(null);
  const start = useRef<{ x: number; y: number } | null>(null);
  const dialog = useRef<HTMLDivElement>(null);

  useEffect(() => { dialog.current?.focus(); }, []);

  const at = (e: React.PointerEvent) => {
    const r = area.current!.getBoundingClientRect();
    return { x: clamp((e.clientX - r.left) / r.width), y: clamp((e.clientY - r.top) / r.height) };
  };
  const between = (a: { x: number; y: number }, b: { x: number; y: number }): Box => ({ x: Math.min(a.x, b.x), y: Math.min(a.y, b.y), w: Math.abs(a.x - b.x), h: Math.abs(a.y - b.y) });

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

  // Rendered on the body: an animated or transformed parent (the video panel) would otherwise trap a fixed
  // overlay. The body is outside the editor's theme, so the overlay carries it (.ed-light).
  return createPortal(
    <div className="ed-light fixed inset-0 z-50 flex items-stretch justify-center bg-black/50 text-ink sm:items-center sm:p-6">
      <div ref={dialog} tabIndex={-1} role="dialog" aria-modal="true" aria-labelledby="redact-title"
        onKeyDown={(e) => { if (e.key === "Escape" && !saving) onCancel(); }}
        className="ed-enter flex w-full max-w-4xl flex-col bg-paper outline-none sm:max-h-[calc(100dvh-3rem)] sm:rounded-2xl sm:shadow-2xl">
        <div className="flex items-start gap-3 border-b border-hair px-5 py-4">
          <div className="min-w-0 flex-1">
            <h2 id="redact-title" className="text-lg">{title}</h2>
            <p className="text-sm text-ink-2">Drag over names, phone numbers, balances, faces, or addresses. Each area becomes a solid block; the original is not kept.</p>
          </div>
          <Button kind="quiet" onClick={onCancel} disabled={saving} aria-label="Close without saving" className="w-11 px-0"><Icon name="close" /></Button>
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
            <img src={src} alt="The screen to cover" data-image="1" draggable={false} className="block max-h-[62dvh] w-auto max-w-full rounded-lg" />
            {boxes.map((b, i) => (
              <div key={i} className="absolute" style={{ left: `${b.x * 100}%`, top: `${b.y * 100}%`, width: `${b.w * 100}%`, height: `${b.h * 100}%` }}>
                <button type="button" aria-label={`Hidden area ${i + 1}. Arrows move it, Shift and arrows resize it, Delete removes it.`}
                  onClick={() => setSelected(i)} onFocus={() => setSelected(i)} onKeyDown={(e) => nudge(i, e)}
                  className={`block size-full rounded-[2px] outline-offset-2 ${selected === i ? "outline-2 outline-accent" : ""}`} style={{ background: FILL }} />
                <button type="button" aria-label={`Remove hidden area ${i + 1}`} onClick={() => { setBoxes((all) => all.filter((_, j) => j !== i)); setSelected(null); }}
                  className="absolute -right-3 -top-3 grid size-7 place-items-center rounded-full border border-hair bg-paper text-ink shadow-md">
                  <Icon name="close" size="size-3.5" />
                </button>
              </div>
            ))}
            {draft && <div className="pointer-events-none absolute rounded-[2px] opacity-80" style={{ left: `${draft.x * 100}%`, top: `${draft.y * 100}%`, width: `${draft.w * 100}%`, height: `${draft.h * 100}%`, background: FILL }} />}
          </div>
        </div>

        <div className="flex flex-col gap-3 border-t border-hair px-5 pb-[max(1rem,env(safe-area-inset-bottom))] pt-4">
          {extra}
          <div className="flex flex-wrap items-center gap-2">
            <p className="mr-auto text-sm text-ink-2" aria-live="polite">{boxes.length ? `${boxes.length} ${boxes.length === 1 ? "area" : "areas"} hidden` : "Nothing hidden yet"}</p>
            <Button kind="quiet" onClick={() => { setBoxes((all) => [...all, { x: 0.35, y: 0.45, w: 0.3, h: 0.08 }]); setSelected(boxes.length); }} disabled={saving}><Icon name="add" />Add an area</Button>
            {boxes.length > 0 && <Button kind="quiet" onClick={() => { setBoxes([]); setSelected(null); }} disabled={saving}>Clear all</Button>}
            <Button kind="primary" onClick={() => onSave(boxes)} disabled={saving}><Icon name="hide" />{saving ? "Saving…" : "Save"}</Button>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
