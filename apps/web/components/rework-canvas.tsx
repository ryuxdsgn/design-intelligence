"use client";

import { useEffect, useState } from "react";
import { motion, useMotionValue, useReducedMotion, useSpring, useTransform } from "motion/react";
import { PencilShape } from "@/components/markup";

/* A page being reworked the way RYUX works, by its pencil (the logo's implied pencil: a cut angle and a
   teal graphite point). Six beats on a loop, one per stage: it reads the page as it is (Understand),
   brackets the main task and ticks three criteria (Frame), lays out three alternatives and sketches each
   below the board (Explore), strikes two and rings one (Evaluate and select), builds the chosen one, pins a
   problem and fixes it (Build and critique), then ticks what it checked and rings what it did not (Verify
   and deliver). Each loop chooses a different alternative. With a fine pointer the board tilts toward it.
   Decorative only (aria-hidden); reduced motion shows the finished board, the pencil set down beside it. */

type Box = [left: number, top: number, width: number, height: number];
type Block = "nav" | "title" | "line1" | "line2" | "media" | "card1" | "card2" | "card3";
type Pt = [number, number];

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

/* One measured gap per layout, shown while it is built: [from block, to block, axis]. */
const GAPS: [Block, Block, "x" | "y"][] = [["card1", "card2", "x"], ["title", "line1", "y"], ["line2", "media", "y"]];
const STAGES = ["Understand", "Frame", "Explore", "Evaluate and select", "Build and critique", "Verify and deliver"];
/* A beat is one stage; it is ticked in thirds, so Explore can show its three alternatives in turn. */
const BEAT = 3000;
const THIRD = BEAT / 3;

const BLOCKS = Object.keys(LAYOUTS[0].boxes) as Block[];
/* The drawing space, in px: the 480 × 360 board, then a row of three 148 × 111 sketches below it. */
const W = 480;
const CH = 360;
const TY = 376;
const TW = 148;
const TH = 111;
const H = TY + TH;
const thumbX = (k: number) => k * 166;
const spring = { type: "spring", stiffness: 140, damping: 22, mass: 0.9 } as const;
const pct = ([l, t, w, h]: Box) => ({ left: `${l}%`, top: `${t}%`, width: `${w}%`, height: `${h}%` });
const onBoard = ([l, t, w, h]: Box) => ({ x: (l / 100) * W, y: (t / 100) * CH, w: (w / 100) * W, h: (h / 100) * CH });

/* Pencil strokes, as points: the line is drawn through them and the pencil's point follows them. */
const ring = (cx: number, cy: number, rx: number, ry: number, n = 28): Pt[] =>
  Array.from({ length: n + 1 }, (_, i) => {
    const a = -Math.PI * 0.6 + (i / n) * Math.PI * 2.1; // a little past full, like a ring drawn by hand
    return [cx + rx * Math.cos(a), cy + ry * Math.sin(a)];
  });
const rect = (x: number, y: number, w: number, h: number): Pt[] => [[x, y], [x + w, y], [x + w, y + h], [x, y + h], [x, y]];
const check = (x: number, y: number): Pt[] => [[x, y], [x + 4, y + 4], [x + 11, y - 6]];
const question = (x: number, y: number): Pt[] => [[x - 5, y - 6], [x - 3, y - 10], [x + 2, y - 12], [x + 7, y - 10], [x + 8, y - 5], [x + 5, y - 1], [x + 1, y + 2], [x + 1, y + 6]];

type Tone = "ink" | "accent" | "mark";
/** A stroke drawn in `beat`, from t0 to t1 (shares of the beat), kept on the board until beat `until`.
    A `ghost` stroke only moves the pencil. */
type Stroke = { beat: number; t0: number; t1: number; pts: Pt[]; tone?: Tone; until?: number; ghost?: boolean };
const TONE: Record<Tone, string> = { ink: "stroke-ink-2", accent: "stroke-accent", mark: "stroke-mark" };

function strokes(chosen: number): Stroke[] {
  const A = LAYOUTS[0].boxes;
  const C = LAYOUTS[chosen].boxes;
  const title = onBoard(A.title);
  const card3 = onBoard(A.card3);
  const focus = onBoard(C[LAYOUTS[chosen].focus]);
  const pin: Pt = [Math.min(focus.x + focus.w + 16, W - 12), focus.y + focus.h / 2];
  const out: Stroke[] = [
    // 1 Understand: read the page top to bottom, ring what is clear, mark what is not.
    { beat: 0, t0: 0.02, t1: 0.3, pts: [[462, 30], [462, 330]], ghost: true },
    { beat: 0, t0: 0.36, t1: 0.62, pts: ring(title.x + title.w / 2, title.y + title.h / 2, title.w / 2 + 14, title.h / 2 + 10), tone: "accent" },
    { beat: 0, t0: 0.7, t1: 0.84, pts: question(card3.x + card3.w - 22, card3.y + 34), tone: "mark" },
    { beat: 0, t0: 0.87, t1: 0.9, pts: [[card3.x + card3.w - 21, card3.y + 46], [card3.x + card3.w - 21, card3.y + 46.6]], tone: "mark" },
    // 2 Frame: bracket the main task, then three success criteria.
    { beat: 1, t0: 0.04, t1: 0.13, pts: [[18, 76], [18, 58], [36, 58]], tone: "ink" },
    { beat: 1, t0: 0.16, t1: 0.25, pts: [[244, 58], [262, 58], [262, 76]], tone: "ink" },
    { beat: 1, t0: 0.28, t1: 0.37, pts: [[262, 150], [262, 168], [244, 168]], tone: "ink" },
    { beat: 1, t0: 0.4, t1: 0.49, pts: [[36, 168], [18, 168], [18, 150]], tone: "ink" },
    ...[0, 1, 2].flatMap((i): Stroke[] => [
      { beat: 1, t0: 0.55 + i * 0.14, t1: 0.6 + i * 0.14, pts: check(30, 192 + i * 18), tone: "accent" },
      { beat: 1, t0: 0.61 + i * 0.14, t1: 0.67 + i * 0.14, pts: [[50, 191 + i * 18], [130 - i * 22, 191 + i * 18]], tone: "ink" },
    ]),
    // 3 Explore: each alternative, once laid out on the board, is sketched below it.
    ...[0, 1, 2].map((k): Stroke => ({ beat: 2, t0: k / 3 + 0.06, t1: k / 3 + 0.26, pts: rect(thumbX(k), TY, TW, TH), tone: "ink", until: 5 })),
    // 4 Evaluate and select: strike two, ring the one chosen.
    ...[0, 1, 2].filter((k) => k !== chosen).map((k, i): Stroke => (
      { beat: 3, t0: 0.08 + i * 0.16, t1: 0.2 + i * 0.16, pts: [[thumbX(k) + 14, TY + TH - 12], [thumbX(k) + TW - 14, TY + 12]], tone: "mark", until: 5 }
    )),
    { beat: 3, t0: 0.42, t1: 0.62, pts: ring(thumbX(chosen) + TW / 2, TY + TH / 2, TW / 2 + 10, TH / 2 + 10), tone: "accent", until: 5 },
    // 5 Build and critique: pin what is wrong while it is built, then fix it.
    { beat: 4, t0: 0.1, t1: 0.22, pts: ring(pin[0], pin[1], 9, 9, 20), tone: "mark" },
    { beat: 4, t0: 0.74, t1: 0.84, pts: check(pin[0] - 5.5, pin[1] + 0.5), tone: "accent" },
    // 6 Verify and deliver: tick what was checked, ring what was not, and step aside.
    ...(["title", "media", "card1"] as Block[]).map((b, i): Stroke => {
      const r = onBoard(C[b]);
      return { beat: 5, t0: 0.08 + i * 0.12, t1: 0.16 + i * 0.12, pts: check(r.x + 8, r.y + 14), tone: "accent" };
    }),
  ];
  const last = onBoard(C.card3);
  out.push(
    { beat: 5, t0: 0.5, t1: 0.76, pts: ring(last.x + last.w / 2, last.y + last.h / 2, last.w / 2 + 10, last.h / 2 + 10), tone: "mark" },
    { beat: 5, t0: 0.84, t1: 0.95, pts: [[466, 352]], ghost: true },
  );
  return out;
}

const dist = (a: Pt, b: Pt) => Math.hypot(b[0] - a[0], b[1] - a[1]);

/** The pencil's keyframes for one beat: it glides to each stroke's start, then follows it at an even pace. */
function penPath(beat: Stroke[], from: Pt) {
  const times = [0], xs = [from[0]], ys = [from[1]], ease: ("linear" | "easeInOut")[] = [];
  const push = (t: number, p: Pt, e: "linear" | "easeInOut") => {
    times.push(Math.max(t, times[times.length - 1] + 0.001));
    xs.push(p[0]);
    ys.push(p[1]);
    ease.push(e);
  };
  for (const s of beat) {
    push(s.t0, s.pts[0], "easeInOut");
    const lens = s.pts.slice(1).map((p, i) => dist(s.pts[i], p));
    const total = lens.reduce((a, b) => a + b, 0) || 1;
    let run = 0;
    lens.forEach((l, i) => {
      run += l;
      push(s.t0 + ((s.t1 - s.t0) * run) / total, s.pts[i + 1], "linear");
    });
  }
  push(1, [xs[xs.length - 1], ys[ys.length - 1]], "linear");
  return { times, left: xs.map((x) => `${(x / W) * 100}%`), top: ys.map((y) => `${(y / H) * 100}%`), ease };
}

const lastPoint = (all: Stroke[], beat: number): Pt => {
  for (let b = beat; b >= 0; b--) {
    const own = all.filter((s) => s.beat === b);
    if (own.length) return own[own.length - 1].pts[own[own.length - 1].pts.length - 1];
  }
  return [466, 352];
};

function Line({ s, live }: { s: Stroke; live: boolean }) {
  const d = s.pts.map((p, i) => `${i ? "L" : "M"}${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join("");
  const at = { delay: (s.t0 * BEAT) / 1000, duration: ((s.t1 - s.t0) * BEAT) / 1000, ease: "linear" } as const;
  return (
    <motion.path
      d={d}
      className={TONE[s.tone ?? "ink"]}
      initial={live ? { pathLength: 0, opacity: 0 } : false}
      animate={{ pathLength: 1, opacity: 1 }}
      transition={live ? { pathLength: at, opacity: { delay: at.delay, duration: 0.01 } } : { duration: 0 }}
    />
  );
}

function tone(b: Block, focused: boolean) {
  if (focused) return "bg-accent/25 border-accent/70";
  if (b === "media") return "bg-panel border-hair";
  if (b === "title") return "bg-ink/15 border-transparent";
  if (b === "line1" || b === "line2") return "bg-ink/10 border-transparent";
  return "bg-paper-2 border-hair";
}

/** A sketch of one alternative below the board: its blocks, small. */
function Thumb({ k, shown, delay }: { k: number; shown: boolean; delay: number }) {
  return (
    <motion.div
      className="absolute"
      style={{ left: `${(thumbX(k) / W) * 100}%`, top: `${(TY / H) * 100}%`, width: `${(TW / W) * 100}%`, height: `${(TH / H) * 100}%` }}
      initial={false}
      animate={{ opacity: shown ? 1 : 0 }}
      transition={{ delay: shown ? delay : 0, duration: shown ? 0.3 : 0.4 }}
    >
      {BLOCKS.map((b) => (
        <div key={b} className={`absolute rounded-[2px] ${b === "media" ? "bg-ink/15" : b === "nav" ? "bg-ink/10" : "bg-ink/20"}`} style={pct(LAYOUTS[k].boxes[b])} />
      ))}
    </motion.div>
  );
}

export function ReworkCanvas() {
  // Read after mount, so the server HTML and the first client render match.
  const prefersReduced = useReducedMotion();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const still = mounted && !!prefersReduced;
  const [tick, setTick] = useState(0);

  useEffect(() => {
    if (still) return;
    const id = setInterval(() => setTick((n) => n + 1), THIRD);
    return () => clearInterval(id);
  }, [still]);

  // The board tilts toward a fine pointer only (not touch).
  const [fine, setFine] = useState(false);
  useEffect(() => setFine(window.matchMedia("(pointer: fine)").matches), []);
  const px = useMotionValue(0.5), py = useMotionValue(0.5);
  const rx = useSpring(useTransform(py, [0, 1], [3, -3]), { stiffness: 120, damping: 18 });
  const ry = useSpring(useTransform(px, [0, 1], [-4, 4]), { stiffness: 120, damping: 18 });
  const live = !still && fine;
  const onMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!live) return;
    const r = e.currentTarget.getBoundingClientRect();
    px.set((e.clientX - r.left) / r.width);
    py.set((e.clientY - r.top) / r.height);
  };
  const onLeave = () => { px.set(0.5); py.set(0.5); };

  // Still: the finished board of the second loop. Otherwise the beat, its third, and the loop.
  const beat = still ? 5 : Math.floor(tick / 3) % 6;
  const third = still ? 2 : tick % 3;
  const loop = still ? 1 : Math.floor(tick / 18);
  const chosen = loop % 3;
  const all = strokes(chosen);

  const layout = beat < 2 ? 0 : beat === 2 ? third : beat === 3 && third < 2 ? 2 : chosen;
  const { boxes, focus } = LAYOUTS[layout];
  const [fl, ft, fw, fh] = boxes[focus];
  const building = beat === 4 && layout === chosen;
  const t = still ? { duration: 0 } : spring;

  // The measured gap while the chosen layout is built, in board units and in px of the 480 × 360 board.
  const [ga, gb, axis] = GAPS[layout];
  const A = boxes[ga], Bx = boxes[gb];
  const gap = axis === "x"
    ? { left: A[0] + A[2], top: A[1] + A[3] / 2, size: Bx[0] - (A[0] + A[2]), px: Math.round(((Bx[0] - (A[0] + A[2])) / 100) * W) }
    : { left: A[0] + A[2] / 2, top: A[1] + A[3], size: Bx[1] - (A[1] + A[3]), px: Math.round(((Bx[1] - (A[1] + A[3])) / 100) * CH) };

  const pen = penPath(all.filter((s) => s.beat === beat), still ? [466, 352] : lastPoint(all, beat === 0 ? 5 : beat - 1));
  const shown = all.filter((s) => !s.ghost && s.beat <= beat && beat <= (s.until ?? s.beat));

  return (
    <div aria-hidden className="[perspective:1200px]">
      <motion.div
        className="relative w-full"
        style={{ aspectRatio: `${W} / ${H}`, ...(live ? { rotateX: rx, rotateY: ry } : {}) }}
        onPointerMove={onMove}
        onPointerLeave={onLeave}
      >
        <div className="absolute inset-x-0 top-0 overflow-hidden rounded-2xl border border-hair bg-paper-2" style={{ height: `${(CH / H) * 100}%` }}>
          {/* 12-column grid, like a layout tool */}
          <div className="absolute inset-[6%] grid grid-cols-12 gap-[2%] opacity-60">
            {Array.from({ length: 12 }, (_, k) => <div key={k} className="bg-accent/[0.05]" />)}
          </div>

          <p className="absolute left-[6%] top-[1.6%] font-mono text-[10px] tracking-[0.08em] text-muted uppercase sm:text-[11px]">
            ryux.design · rework in progress
            <motion.span className="ml-1 inline-block" animate={still ? { opacity: 1 } : { opacity: [1, 0.2, 1] }} transition={still ? { duration: 0 } : { duration: 1.4, repeat: Infinity }}>●</motion.span>
          </p>

          {BLOCKS.map((b) => (
            <motion.div
              key={b}
              className={`absolute overflow-hidden rounded-[6px] border transition-colors duration-300 ${tone(b, building && b === focus)}`}
              initial={false}
              animate={pct(boxes[b])}
              transition={t}
            >
              {/* the heading is written in as the chosen layout is built, and stays */}
              {b === "title" && beat >= 4 && (
                <div className="absolute inset-y-[28%] left-[6%] right-[6%] flex items-center gap-[3%]">
                  <motion.div
                    key={`${loop}-${beat}`}
                    className="h-full rounded-[3px] bg-ink/70"
                    initial={{ width: beat === 4 && !still ? "0%" : "62%" }}
                    animate={{ width: "62%" }}
                    transition={beat === 4 && !still ? { delay: 0.9, duration: 0.7, ease: "easeOut" } : { duration: 0 }}
                  />
                  {building && !still && (
                    <motion.span className="h-[120%] w-[2px] shrink-0 bg-accent" animate={{ opacity: [1, 0, 1] }} transition={{ duration: 0.9, repeat: Infinity }} />
                  )}
                </div>
              )}
            </motion.div>
          ))}

          {/* Understand: a reading pass sweeps down the page */}
          {beat === 0 && !still && (
            <motion.div
              key={`scan-${loop}`}
              className="absolute inset-x-0 h-12 -translate-y-full bg-gradient-to-b from-transparent to-[rgb(60_196_183/0.16)]"
              initial={{ top: "8%", opacity: 0 }}
              animate={{ top: ["8%", "8%", "92%", "92%"], opacity: [0, 1, 1, 0] }}
              transition={{ duration: BEAT / 1000, times: [0, 0.02, 0.3, 0.34], ease: "linear" }}
            >
              <span className="absolute inset-x-0 bottom-0 h-px bg-accent/70" />
            </motion.div>
          )}

          {/* Build: one gap measured once the chosen layout settles */}
          {building && !still && (
            <motion.div
              key={`gap-${loop}`}
              className="pointer-events-none absolute"
              style={axis === "x"
                ? { left: `${gap.left}%`, top: `${gap.top}%`, width: `${gap.size}%`, height: 0 }
                : { left: `${gap.left}%`, top: `${gap.top}%`, height: `${gap.size}%`, width: 0 }}
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 0, 1, 1, 0] }}
              transition={{ duration: BEAT / 1000, times: [0, 0.34, 0.42, 0.85, 0.95] }}
            >
              <span className={`absolute bg-mark ${axis === "x" ? "inset-x-0 top-0 h-px" : "inset-y-0 left-0 w-px"}`} />
              <span className={`absolute ${axis === "x" ? "left-0 -top-[3px] h-[7px] w-px" : "top-0 -left-[3px] w-[7px] h-px"} bg-mark`} />
              <span className={`absolute ${axis === "x" ? "right-0 -top-[3px] h-[7px] w-px" : "bottom-0 -left-[3px] w-[7px] h-px"} bg-mark`} />
              <span className={`absolute whitespace-nowrap rounded-[3px] bg-paper-2 px-1 font-mono text-[10px] text-mark ${axis === "x" ? "left-1/2 -translate-x-1/2 -top-[18px]" : "top-1/2 -translate-y-1/2 left-[7px]"}`}>
                {gap.px}
              </span>
            </motion.div>
          )}

          {/* Build: the selection on the block being worked on, with its size */}
          {building && (
            <motion.div className="absolute" initial={{ opacity: 0 }} animate={{ opacity: 1, ...pct([fl - 0.8, ft - 1.1, fw + 1.6, fh + 2.2]) }} transition={{ ...t, opacity: { duration: 0.2 } }}>
              <div className="absolute inset-0 rounded-[7px] border-[1.5px] border-accent" />
              {["-left-[4px] -top-[4px]", "-right-[4px] -top-[4px]", "-left-[4px] -bottom-[4px]", "-right-[4px] -bottom-[4px]"].map((p) => (
                <span key={p} className={`absolute ${p} size-[8px] rounded-[2px] border-[1.5px] border-accent bg-paper-2`} />
              ))}
              <span className={`absolute left-1/2 -translate-x-1/2 ${ft + fh > 78 ? "bottom-full mb-2" : "top-full mt-2"} whitespace-nowrap rounded-[4px] bg-accent px-1.5 py-0.5 font-mono text-[10px] font-medium text-paper sm:text-[11px]`}>
                {Math.round((fw / 100) * W)} × {Math.round((fh / 100) * CH)}
              </span>
            </motion.div>
          )}
        </div>

        {/* Explore: the three alternatives, sketched below the board, kept until the loop ends */}
        {[0, 1, 2].map((k) => (
          <Thumb key={k} k={k} shown={beat >= 2 && (beat > 2 || third >= k)} delay={beat === 2 && !still ? 0.75 : 0} />
        ))}

        {/* The pencil's strokes, over the board and the sketches */}
        <svg className="pointer-events-none absolute inset-0 h-full w-full overflow-visible" viewBox={`0 0 ${W} ${H}`} fill="none" strokeWidth={2.25} strokeLinecap="round" strokeLinejoin="round">
          {shown.map((s) => <Line key={`${loop}-${s.beat}-${s.t0}`} s={s} live={!still && s.beat === beat} />)}
        </svg>

        {still ? (
          <div className="pointer-events-none absolute z-10" style={{ left: pen.left[0], top: pen.top[0] }}><PencilShape /></div>
        ) : (
          <motion.div
            key={`pen-${loop}-${beat}`}
            className="pointer-events-none absolute z-10"
            initial={{ left: pen.left[0], top: pen.top[0] }}
            animate={{ left: pen.left, top: pen.top }}
            transition={{ duration: BEAT / 1000, times: pen.times, ease: pen.ease }}
          >
            <PencilShape />
          </motion.div>
        )}
      </motion.div>

      {/* the six stages, one per beat */}
      <div className="mt-4 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 font-mono text-[11px] tracking-[0.06em] uppercase">
        {STAGES.map((name, k) => (
          <span key={name} className={`relative flex items-center gap-1.5 transition-colors duration-300 ${k === beat && !still ? "text-ink" : "text-muted/70"}`}>
            <span className={`size-[6px] rounded-full transition-colors duration-300 ${still || k < beat ? "bg-accent/40" : k === beat ? "bg-accent" : "bg-hair"}`} />
            {name}
            {k === beat && !still && (
              <motion.span
                key={`${loop}-${beat}`}
                className="absolute -bottom-1.5 left-0 h-px w-full origin-left bg-accent"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: BEAT / 1000, ease: "linear" }}
              />
            )}
          </span>
        ))}
      </div>
    </div>
  );
}
