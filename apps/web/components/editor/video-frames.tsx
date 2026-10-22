"use client";

import { useEffect, useRef, useState } from "react";
import { Icon } from "./icons";
import { Button, Problems, Progress, cardClass } from "./ui";

// Suggested frames: sample the recording every STEP seconds on a tiny grayscale copy. A frame is kept
// when the picture has stopped moving (mean change from the last sample <= STILL) and differs from the
// last kept frame (> CHANGE). Values are on 0-255 and tuned by eye; the editor removes extras.
const STEP = 0.5;
const STILL = 2;
const CHANGE = 10;

function once(el: HTMLVideoElement, type: "loadeddata" | "seeked") {
  return new Promise<void>((resolve, reject) => {
    el.addEventListener(type, () => resolve(), { once: true });
    el.addEventListener("error", () => reject(new Error("the browser can't play this video")), { once: true });
  });
}

function frameFile(v: HTMLVideoElement, base: string): Promise<File> {
  const canvas = document.createElement("canvas");
  canvas.width = v.videoWidth;
  canvas.height = v.videoHeight;
  canvas.getContext("2d")!.drawImage(v, 0, 0);
  // Seconds in the name keep frames of one recording in time order when names are sorted.
  const name = `${base}-${v.currentTime.toFixed(1).padStart(6, "0")}s.png`;
  return new Promise((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(new File([b], name, { type: "image/png" })) : reject(new Error("could not read the frame"))), "image/png"));
}

function signature(v: HTMLVideoElement, ctx: CanvasRenderingContext2D) {
  const { width, height } = ctx.canvas;
  ctx.drawImage(v, 0, 0, width, height);
  const px = ctx.getImageData(0, 0, width, height).data;
  const gray = new Uint8ClampedArray(width * height);
  for (let i = 0; i < gray.length; i++) gray[i] = (px[i * 4] * 3 + px[i * 4 + 1] * 6 + px[i * 4 + 2]) / 10;
  return gray;
}

const change = (a: Uint8ClampedArray, b: Uint8ClampedArray) => {
  let sum = 0;
  for (let i = 0; i < a.length; i++) sum += Math.abs(a[i] - b[i]);
  return sum / a.length;
};

/** A screen recording that never leaves this computer: the editor adds frames from it as screens. */
export function VideoFrames({ file, disabled, onFrames, onClose }: { file: File; disabled: boolean; onFrames: (frames: File[]) => Promise<void>; onClose: () => void }) {
  const ref = useRef<HTMLVideoElement>(null);
  const stop = useRef(false);
  const [url, setUrl] = useState("");
  const [error, setError] = useState("");
  const [scan, setScan] = useState<{ done: number; total: number } | null>(null);
  const [result, setResult] = useState("");
  const base = file.name.replace(/\.[^.]+$/, "");

  useEffect(() => {
    const u = URL.createObjectURL(file);
    setUrl(u);
    setError("");
    setResult("");
    return () => { stop.current = true; URL.revokeObjectURL(u); };
  }, [file]);

  async function addCurrent() {
    const v = ref.current;
    if (!v || !v.videoWidth) return;
    v.pause();
    await onFrames([await frameFile(v, base)]);
    setResult(`Added the frame at ${v.currentTime.toFixed(1)} s.`);
  }

  async function suggest() {
    stop.current = false;
    setResult("");
    const v = document.createElement("video");
    v.muted = true;
    v.preload = "auto";
    v.src = url;
    try {
      await once(v, "loadeddata");
      // Recordings made in a browser (WebM) can report no duration until the end has been seeked.
      if (!Number.isFinite(v.duration)) { v.currentTime = Number.MAX_SAFE_INTEGER; await once(v, "seeked"); }
      const ctx = document.createElement("canvas").getContext("2d", { willReadFrequently: true })!;
      ctx.canvas.width = 24;
      ctx.canvas.height = Math.max(1, Math.round((24 * v.videoHeight) / v.videoWidth));
      const total = Math.floor(v.duration / STEP) + 1;
      const frames: File[] = [];
      let prev: Uint8ClampedArray | null = null;
      let kept: Uint8ClampedArray | null = null;
      for (let i = 0; i < total && !stop.current; i++) {
        v.currentTime = Math.min(i * STEP, Math.max(0, v.duration - 0.05));
        await once(v, "seeked");
        const sig = signature(v, ctx);
        const still = !prev || change(prev, sig) <= STILL;
        if (still && (!kept || change(kept, sig) > CHANGE)) {
          frames.push(await frameFile(v, base));
          kept = sig;
        }
        prev = sig;
        setScan({ done: i + 1, total });
      }
      if (stop.current) { setResult("Stopped. Nothing was added."); return; }
      if (frames.length) await onFrames(frames);
      setResult(frames.length
        ? `Added ${frames.length} suggested ${frames.length === 1 ? "frame" : "frames"}. Remove any that repeat a screen.`
        : "No still screens found. Pause on a screen and add it by hand.");
    } catch (err) {
      setError(`${file.name}: ${err instanceof Error ? err.message : String(err)}. Try an MP4 (H.264) recording.`);
    } finally {
      setScan(null);
      v.removeAttribute("src");
      v.load();
    }
  }

  const busy = disabled || !!scan;
  return (
    <section aria-labelledby="video-title" className={`ed-enter flex flex-col gap-3 p-3 ${cardClass}`}>
      <div className="flex items-baseline gap-3">
        <h2 id="video-title" className="min-w-0 truncate text-sm font-medium text-ink" title={file.name}>Frames from {file.name}</h2>
        <Button type="button" kind="quiet" size="sm" className="ml-auto" disabled={!!scan} onClick={onClose}><Icon name="close" />Close video</Button>
      </div>
      <p className="text-xs text-muted">The video stays on this computer. Only the frames you add are uploaded, as screens.</p>
      {error ? (
        <Problems title="Can't read this video" items={[error]} />
      ) : (
        <video ref={ref} src={url || undefined} controls muted playsInline className="max-h-[60vh] w-full rounded bg-panel object-contain"
          onError={() => setError(`${file.name}: the browser can't play this video. Try an MP4 (H.264) recording.`)} />
      )}
      {!error && (
        <div className="flex flex-wrap items-center gap-2">
          <Button type="button" kind="primary" disabled={busy} onClick={addCurrent}><Icon name="capture" />Add this frame</Button>
          <Button type="button" disabled={busy} onClick={suggest}><Icon name="frames" />Suggest frames</Button>
          {scan && <Button type="button" kind="quiet" onClick={() => { stop.current = true; }}><Icon name="stop" />Stop</Button>}
        </div>
      )}
      {scan && <Progress label="Looking for still screens" done={scan.done} total={scan.total} />}
      <p aria-live="polite" className="text-sm text-ink-2">{scan ? `Looking for still screens… ${Math.round((scan.done / scan.total) * 100)}%` : result}</p>
    </section>
  );
}
