"use client";

import { useEffect, useState } from "react";
import { motion, useMotionValue, useReducedMotion, useSpring, useTransform } from "motion/react";

/* A page being laid out again: wireframe blocks move between three layouts while a selection box and a
   cursor follow the block being worked on. Once a layout settles, the heading fills in and a redline
   measures one gap; the RYUX steps tick along underneath. With a fine pointer the canvas tilts toward it
   and the cursor follows it. Decorative only (aria-hidden); reduced motion shows one still layout. */

type Box = [left: number, top: number, width: number, height: number];
type Block = "nav" | "title" | "line1" | "line2" | "media" | "card1" | "card2" | "card3";

const LAYOUTS: { boxes: Record<Block, Box>; focus: Block }[] = [
  {
    focus: "title",
    boxes: {
      nav: [6, 7, 88, 5], title: [6, 20, 44, 11], line1: [6, 35, 40, 3.5], line2: [6, 41, 30, 3.5],
      media: [56, 20, 38, 40], card1: [6, 68, 27, 24], card2: [36.5, 68, 27, 24], card3: [67, 68, 27, 24],
    },
  },
  {
    focus: "media",
    boxes: {
      nav: [6, 7, 88, 5], title: [18, 18, 64, 11], line1: [24, 33, 52, 3.5], line2: [32, 39, 36, 3.5],
      media: [6, 48, 58, 44], card1: [68, 48, 26, 13], card2: [68, 63.5, 26, 13], card3: [68, 79, 26, 13],
    },
  },
  {
    focus: "card2",
    boxes: {
      nav: [6, 7, 18, 85], title: [30, 7, 46, 11], line1: [30, 22, 56, 3.5], line2: [30, 28, 42, 3.5],
      media: [30, 37, 64, 26], card1: [30, 67, 20, 25], card2: [52, 67, 20, 25], card3: [74, 67, 20, 25],
    },
  },
];

/* One measured gap per layout: [from block, to block, axis]. */
const GAPS: [Block, Block, "x" | "y"][] = [["card1", "card2", "x"], ["title", "line1", "y"], ["line2", "media", "y"]];
const STEPS = ["Analyze", "Design", "Build", "Critique", "QA"];
const TICK = 2800;

const BLOCKS = Object.keys(LAYOUTS[0].boxes) as Block[];
const W = 480; // the canvas width the size label is read against
const H = 360;
const spring = { type: "spring", stiffness: 140, damping: 22, mass: 0.9 } as const;
const pct = ([l, t, w, h]: Box) => ({ left: `${l}%`, top: `${t}%`, width: `${w}%`, height: `${h}%` });

function tone(b: Block, focused: boolean) {
  if (focused) return "bg-accent/25 border-accent/70";
  if (b === "media") return "bg-panel border-hair";
  if (b === "title") return "bg-ink/15 border-transparent";
  if (b === "line1" || b === "line2") return "bg-ink/10 border-transparent";
  return "bg-paper-2 border-hair";
}

export function ReworkCanvas() {
  // Read after mount, so the server HTML and the first client render match.
  const prefersReduced = useReducedMotion();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const reduce = mounted && !!prefersReduced;
  const [tick, setTick] = useState(0);

  useEffect(() => {
    if (reduce) return;
    const id = setInterval(() => setTick((n) => n + 1), TICK);
    return () => clearInterval(id);
  }, [reduce]);

  // Tilt and cursor follow a fine pointer only (not touch).
  const [fine, setFine] = useState(false);
  useEffect(() => setFine(window.matchMedia("(pointer: fine)").matches), []);
  const px = useMotionValue(0.5), py = useMotionValue(0.5);
  const rx = useSpring(useTransform(py, [0, 1], [3, -3]), { stiffness: 120, damping: 18 });
  const ry = useSpring(useTransform(px, [0, 1], [-4, 4]), { stiffness: 120, damping: 18 });
  const [hover, setHover] = useState<[number, number] | null>(null);
  const live = !reduce && fine;
  const onMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!live) return;
    const r = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
    px.set(x); py.set(y); setHover([x * 100, y * 100]);
  };
  const onLeave = () => { px.set(0.5); py.set(0.5); setHover(null); };

  const i = tick % LAYOUTS.length;
  const { boxes, focus } = LAYOUTS[i];
  const [fl, ft, fw, fh] = boxes[focus];
  const t = reduce ? { duration: 0 } : spring;
  const step = reduce ? 0 : tick % STEPS.length;

  // The measured gap for this layout, in canvas units and in px of the 480 × 360 canvas.
  const [ga, gb, axis] = GAPS[i];
  const A = boxes[ga], Bx = boxes[gb];
  const gap = axis === "x"
    ? { left: A[0] + A[2], top: A[1] + A[3] / 2, size: Bx[0] - (A[0] + A[2]), px: Math.round(((Bx[0] - (A[0] + A[2])) / 100) * W) }
    : { left: A[0] + A[2] / 2, top: A[1] + A[3], size: Bx[1] - (A[1] + A[3]), px: Math.round(((Bx[1] - (A[1] + A[3])) / 100) * H) };

  return (
    <div aria-hidden className="[perspective:1200px]">
    <motion.div
      className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl border border-hair bg-paper-2"
      style={live ? { rotateX: rx, rotateY: ry } : undefined}
      onPointerMove={onMove}
      onPointerLeave={onLeave}
    >
      {/* 12-column grid, like a layout tool */}
      <div className="absolute inset-[6%] grid grid-cols-12 gap-[2%] opacity-60">
        {Array.from({ length: 12 }, (_, k) => <div key={k} className="bg-accent/[0.05]" />)}
      </div>

      <p className="absolute left-[6%] top-[1.6%] font-mono text-[10px] tracking-[0.08em] text-muted uppercase sm:text-[11px]">
        ryux.design · rework in progress
        <motion.span className="ml-1 inline-block" animate={reduce ? { opacity: 1 } : { opacity: [1, 0.2, 1] }} transition={reduce ? { duration: 0 } : { duration: 1.4, repeat: Infinity }}>●</motion.span>
      </p>

      {BLOCKS.map((b) => (
        <motion.div
          key={b}
          className={`absolute overflow-hidden rounded-[6px] border transition-colors duration-300 ${tone(b, b === focus)}`}
          initial={false}
          animate={pct(boxes[b])}
          transition={t}
        >
          {/* the heading fills in once the layout settles, then clears for the next one */}
          {b === "title" && (
            <div className="absolute inset-y-[28%] left-[6%] right-[6%] flex items-center gap-[3%]">
              <motion.div
                key={tick}
                className="h-full rounded-[3px] bg-ink/70"
                initial={{ width: reduce ? "62%" : "0%" }}
                animate={reduce ? { width: "62%" } : { width: ["0%", "0%", "62%", "62%", "0%"] }}
                transition={reduce ? { duration: 0 } : { duration: TICK / 1000, times: [0, 0.3, 0.55, 0.88, 1], ease: "easeOut" }}
              />
              {!reduce && (
                <motion.span
                  className="h-[120%] w-[2px] shrink-0 bg-accent"
                  animate={{ opacity: [1, 0, 1] }}
                  transition={{ duration: 0.9, repeat: Infinity }}
                />
              )}
            </div>
          )}
        </motion.div>
      ))}

      {/* redline: one gap measured after the layout settles */}
      {!reduce && (
        <motion.div
          key={`gap-${tick}`}
          className="pointer-events-none absolute"
          style={axis === "x"
            ? { left: `${gap.left}%`, top: `${gap.top}%`, width: `${gap.size}%`, height: 0 }
            : { left: `${gap.left}%`, top: `${gap.top}%`, height: `${gap.size}%`, width: 0 }}
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 0, 1, 1, 0] }}
          transition={{ duration: TICK / 1000, times: [0, 0.34, 0.42, 0.85, 0.95] }}
        >
          <motion.span
            className={`absolute bg-mark ${axis === "x" ? "inset-x-0 top-0 h-px origin-left" : "inset-y-0 left-0 w-px origin-top"}`}
            initial={axis === "x" ? { scaleX: 0 } : { scaleY: 0 }}
            animate={axis === "x" ? { scaleX: [0, 0, 1] } : { scaleY: [0, 0, 1] }}
            transition={{ duration: 1.4, times: [0, 0.62, 1], ease: [0.23, 1, 0.32, 1] }}
          />
          <span className={`absolute ${axis === "x" ? "left-0 -top-[3px] h-[7px] w-px" : "top-0 -left-[3px] w-[7px] h-px"} bg-mark`} />
          <span className={`absolute ${axis === "x" ? "right-0 -top-[3px] h-[7px] w-px" : "bottom-0 -left-[3px] w-[7px] h-px"} bg-mark`} />
          <span className={`absolute whitespace-nowrap rounded-[3px] bg-paper-2 px-1 font-mono text-[10px] text-mark ${axis === "x" ? "left-1/2 -translate-x-1/2 -top-[18px]" : "top-1/2 -translate-y-1/2 left-[7px]"}`}>
            {gap.px}
          </span>
        </motion.div>
      )}

      {/* selection: box, corner handles, and the size of what is selected */}
      <motion.div className="absolute" initial={false} animate={pct([fl - 0.8, ft - 1.1, fw + 1.6, fh + 2.2])} transition={t}>
        <div className="absolute inset-0 rounded-[7px] border-[1.5px] border-mark" />
        {["-left-[4px] -top-[4px]", "-right-[4px] -top-[4px]", "-left-[4px] -bottom-[4px]", "-right-[4px] -bottom-[4px]"].map((p) => (
          <span key={p} className={`absolute ${p} size-[8px] rounded-[2px] border-[1.5px] border-mark bg-paper-2`} />
        ))}
        <span className={`absolute left-1/2 -translate-x-1/2 ${ft + fh > 78 ? "bottom-full mb-2" : "top-full mt-2"} whitespace-nowrap rounded-[4px] bg-mark px-1.5 py-0.5 font-mono text-[10px] font-medium text-paper sm:text-[11px]`}>
          {Math.round((fw / 100) * W)} × {Math.round((fh / 100) * H)}
        </span>
      </motion.div>

      {/* cursor, a beat behind the selection */}
      {(
        <motion.svg
          width="18" height="18" viewBox="0 0 18 18" className={`absolute drop-shadow-[0_2px_6px_rgba(0,0,0,.5)] ${reduce ? "hidden" : ""}`}
          initial={false}
          animate={hover ? { left: `${hover[0]}%`, top: `${hover[1]}%` } : { left: `${fl + fw - 1}%`, top: `${ft + fh - 2}%` }}
          transition={hover ? { type: "spring", stiffness: 500, damping: 40 } : { ...spring, stiffness: 90, damping: 18, delay: 0.12 }}
        >
          <path d="M2 1.5 15.5 8 9.2 9.6 6.6 15.6Z" fill="#eef1f4" stroke="#0f1215" strokeWidth="1.2" strokeLinejoin="round" />
        </motion.svg>
      )}
    </motion.div>

    {/* the RYUX steps, one per beat */}
    <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 font-mono text-[11px] tracking-[0.06em] uppercase">
      {STEPS.map((name, k) => (
        <span key={name} className={`relative flex items-center gap-1.5 transition-colors duration-300 ${k === step ? "text-ink" : "text-muted/70"}`}>
          <span className={`size-[6px] rounded-full transition-colors duration-300 ${k === step ? "bg-accent" : k < step ? "bg-accent/40" : "bg-hair"}`} />
          {name}
          {k === step && !reduce && (
            <motion.span
              key={tick}
              className="absolute -bottom-1.5 left-0 h-px w-full origin-left bg-accent"
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: TICK / 1000, ease: "linear" }}
            />
          )}
        </span>
      ))}
    </div>
    </div>
  );
}
