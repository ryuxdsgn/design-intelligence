"use client";

import { motion, useMotionValue, useMotionValueEvent, useScroll, useTransform, type MotionValue } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { usePinned } from "@/components/reasoning-stage";

/* How it works: RYUX's six stages, drawn by its pencil (the logo's implied pencil: a cut angle and a teal
   graphite point). Where the six sit in one row (1280 wide), the pencil travels the row as it scrolls
   through and draws each stage's sketch in turn, its point on the line being drawn. Narrower, each sketch
   draws as it comes into view; with reduced motion, or before scripts run, they are simply there.
   The sketches illustrate what a stage does; they are not the output of a run, so they carry no data. */

type Tone = "ink" | "accent" | "mark";
type Stroke = { d: string; tone: Tone };
type Stage = { name: string; body: string; sketch: Stroke[] };

/* Sketches in a 120 × 72 box: ink for what is drawn, teal for what RYUX keeps or confirms, red for
   what it marks as wrong or unchecked. Each stroke is drawn in the order listed. */
const thumb = (x: number) => `M${x + 4} 10h24a4 4 0 0 1 4 4v44a4 4 0 0 1-4 4H${x + 4}a4 4 0 0 1-4-4V14a4 4 0 0 1 4-4z`;
const STAGES: Stage[] = [
  {
    name: "Understand",
    body: "Reads the brief, the product, and what already exists, and writes down what it is only guessing.",
    sketch: [
      { d: "M14 6h40a6 6 0 0 1 6 6v48a6 6 0 0 1-6 6H14a6 6 0 0 1-6-6V12a6 6 0 0 1 6-6z", tone: "ink" },
      { d: "M18 20h26M18 32h34M18 44h20", tone: "ink" },
      { d: "M14 32a21 7 0 1 0 42 0a21 7 0 1 0-42 0", tone: "accent" },
      { d: "M80 24a8 8 0 1 1 10 7.7c-2.6.8-4 2.6-4 5.3M86 46v.5", tone: "mark" },
    ],
  },
  {
    name: "Frame",
    body: "Names the main task and what success looks like, before anything is drawn.",
    sketch: [
      { d: "M8 20V8h12M48 8h12v12M60 52v12H48M20 64H8V52", tone: "ink" },
      { d: "M20 24h24M20 50h28", tone: "ink" },
      { d: "M72 17l3 3 5-6M72 35l3 3 5-6M72 53l3 3 5-6", tone: "accent" },
      { d: "M88 17h24M88 35h20M88 53h16", tone: "ink" },
    ],
  },
  {
    name: "Explore",
    body: "Sketches two or three directions that differ in structure, not just in colour.",
    sketch: [
      { d: `${thumb(4)}M10 22h20M10 32h20M10 42h20`, tone: "ink" },
      { d: `${thumb(44)}M50 18h8v8h-8zM64 18h8v8h-8zM50 32h8v8h-8zM64 32h8v8h-8z`, tone: "ink" },
      { d: `${thumb(84)}M90 18h20v18H90zM90 46h14`, tone: "ink" },
    ],
  },
  {
    name: "Evaluate and select",
    body: "Rates them against those success criteria. You choose, and the choice is written down.",
    sketch: [
      { d: `${thumb(4)}${thumb(44)}${thumb(84)}`, tone: "ink" },
      { d: "M6 58L34 14M86 58l28-44", tone: "mark" },
      { d: "M38 36a22 32 0 1 0 44 0a22 32 0 1 0-44 0", tone: "accent" },
    ],
  },
  {
    name: "Build and critique",
    body: "Designs or codes the choice, renders it, finds what is wrong, and fixes it.",
    sketch: [
      { d: "M14 6h40a6 6 0 0 1 6 6v48a6 6 0 0 1-6 6H14a6 6 0 0 1-6-6V12a6 6 0 0 1 6-6z", tone: "ink" },
      { d: "M18 18h30M18 28h22M18 52h32", tone: "ink" },
      { d: "M78 28a8 8 0 1 0 16 0a8 8 0 1 0-16 0M66 28h12", tone: "mark" },
      { d: "M80 52l4 4 8-9", tone: "accent" },
    ],
  },
  {
    name: "Verify and deliver",
    body: "Checks the gates, says what it could not check, and how to test it with real users.",
    sketch: [
      { d: "M8 12l4 4 7-8M8 28l4 4 7-8M8 44l4 4 7-8", tone: "accent" },
      { d: "M28 12h44M28 28h36M28 44h40M28 60h30", tone: "ink" },
      { d: "M22 60a27 7 0 1 0 54 0a27 7 0 1 0-54 0", tone: "mark" },
    ],
  },
];

const N = STAGES.length;
/* A stage's share of the row's scroll: it draws in the first 75%, and the pencil moves on in the rest. */
const DRAW = 0.75;
const TONE: Record<Tone, string> = { ink: "stroke-ink-2", accent: "stroke-accent", mark: "stroke-mark" };
/* Motion interpolates colour values, not CSS variables: muted and accent from the theme. */
const MUTED = "#a7b0bb";
const ACCENT = "#3cc4b7";

type Register = (k: number, j: number, el: SVGPathElement | null) => void;

function Sketch({ k, t, register }: { k: number; t: MotionValue<number>; register?: Register }) {
  const strokes = STAGES[k].sketch;
  return (
    <svg aria-hidden viewBox="0 0 120 72" className="h-auto w-full max-w-[120px] overflow-visible" fill="none" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round">
      {strokes.map((s, j) => <Line key={j} s={s} t={t} from={j / strokes.length} to={(j + 1) / strokes.length} el={register && ((el) => register(k, j, el))} />)}
    </svg>
  );
}

function Line({ s, t, from, to, el }: { s: Stroke; t: MotionValue<number>; from: number; to: number; el?: (el: SVGPathElement | null) => void }) {
  const pathLength = useTransform(t, [from, to], [0, 1], { clamp: true });
  const opacity = useTransform(pathLength, [0, 0.001], [0, 1]);
  return <motion.path ref={el} d={s.d} className={TONE[s.tone]} style={{ pathLength, opacity }} />;
}

function Text({ k, num }: { k: number; num?: MotionValue<string> }) {
  return (
    <>
      <motion.span style={num && { color: num }} className={`font-mono text-[12px] text-muted ${num ? "" : "step-num"}`}>{k + 1}</motion.span>
      <h3 className="text-[22px] leading-[1.15] font-semibold tracking-[-0.02em]">{STAGES[k].name}</h3>
      <p className="text-[15px] leading-[1.5] text-ink-2">{STAGES[k].body}</p>
    </>
  );
}

const cell = (k: number) => `step flex flex-col gap-2 border-b border-hair pt-5 pb-6 xl:border-b-0 xl:pr-6 ${k ? "xl:border-l xl:pl-6" : ""}`;

/** Narrow, or still: each stage on its own, its sketch drawn as it comes into view (`still`: already drawn). */
function StageCell({ k, still }: { k: number; still: boolean }) {
  const ref = useRef<HTMLLIElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 92%", "start 55%"] });
  const done = useMotionValue(1);
  return (
    <li ref={ref} className={cell(k)}>
      <div className="pb-3"><Sketch k={k} t={still ? done : scrollYProgress} /></div>
      <Text k={k} />
    </li>
  );
}

function RowCell({ k, p, register }: { k: number; p: MotionValue<number>; register: Register }) {
  const t = useTransform(p, [k / N, (k + DRAW) / N], [0, 1], { clamp: true });
  const num = useTransform(p, [k / N, k / N + 0.02], [MUTED, ACCENT]);
  return (
    <li className={cell(k)}>
      <div className="pb-3"><Sketch k={k} t={t} register={register} /></div>
      <Text k={k} num={num} />
    </li>
  );
}

/** The pencil, pointing down and to the left: its graphite point sits at the div's origin. */
function Pencil({ x, y, o }: { x: MotionValue<number>; y: MotionValue<number>; o: MotionValue<number> }) {
  return (
    <motion.div aria-hidden style={{ x, y, opacity: o }} className="pointer-events-none absolute top-0 left-0 z-10">
      <svg width="66" height="16" viewBox="0 0 66 16" className="absolute -top-2 left-0 origin-[0_8px] -rotate-[38deg] drop-shadow-[0_6px_10px_rgb(0_0_0/0.5)]">
        <path d="M0 8l7-2.6v5.2z" className="fill-accent" />
        <path d="M7 5.4L15 2v12l-8-3.4z" className="fill-ink-2" />
        <path d="M15 2h49l-4 12H15z" className="fill-ink" />
        <path d="M15 8h47" className="stroke-paper-2" strokeOpacity={0.25} />
      </svg>
    </motion.div>
  );
}

/** One row: the scroll through it drives the rail, the numbers, the sketches, and the pencil. */
function Row() {
  const ref = useRef<HTMLOListElement>(null);
  const paths = useRef(new Map<string, SVGPathElement>());
  const { scrollYProgress: p } = useScroll({ target: ref, offset: ["start 80%", "start 15%"] });
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const o = useTransform(p, [0, 0.015], [0, 1]);
  const register = useCallback<Register>((k, j, el) => {
    if (el) paths.current.set(`${k}-${j}`, el);
    else paths.current.delete(`${k}-${j}`);
  }, []);

  /* The point at share s of stroke j in stage k, in the row's coordinates. */
  const at = useCallback((k: number, j: number, s: number) => {
    const el = paths.current.get(`${k}-${j}`);
    const ctm = el?.getScreenCTM();
    if (!el || !ctm || !ref.current) return null;
    const pt = el.getPointAtLength(s * el.getTotalLength()).matrixTransform(ctm);
    const box = ref.current.getBoundingClientRect();
    return { x: pt.x - box.left, y: pt.y - box.top };
  }, []);

  const place = useCallback(
    (v: number) => {
      const u = Math.min(Math.max(v, 0), 0.9999) * N;
      const k = Math.floor(u);
      const local = (u - k) / DRAW;
      const n = STAGES[k].sketch.length;
      let pt;
      if (local < 1) {
        const j = Math.min(n - 1, Math.floor(local * n));
        pt = at(k, j, local * n - j);
      } else {
        // Between stages: lift off the last stroke and glide to the next sketch's first stroke; after the
        // last stage, step aside so the finished sketch is not covered.
        const a = at(k, n - 1, 1);
        const b = k + 1 < N ? at(k + 1, 0, 0) : a && { x: a.x + 36, y: a.y - 6 };
        const m = Math.min((local - 1) / ((1 - DRAW) / DRAW), 1);
        pt = a && b && { x: a.x + (b.x - a.x) * m, y: a.y + (b.y - a.y) * m - Math.sin(m * Math.PI) * 18 };
      }
      if (pt) {
        x.set(pt.x);
        y.set(pt.y);
      }
    },
    [at, x, y],
  );
  useMotionValueEvent(p, "change", place);
  useEffect(() => {
    place(p.get());
    const on = () => place(p.get());
    window.addEventListener("resize", on);
    return () => window.removeEventListener("resize", on);
  }, [p, place]);

  return (
    <ol ref={ref} className="relative grid grid-cols-6 border-t border-hair [&>*]:min-w-0">
      <motion.span aria-hidden style={{ scaleX: p }} className="absolute -top-px left-0 h-[2px] w-full origin-left bg-accent" />
      {STAGES.map((s, k) => <RowCell key={s.name} k={k} p={p} register={register} />)}
      <Pencil x={x} y={y} o={o} />
    </ol>
  );
}

export function Stages() {
  const row = usePinned("(min-width: 1280px)");
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const still = !mounted || window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (row) return <Row />;
  return (
    <ol className="grid border-t border-hair [&>*]:min-w-0 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
      {STAGES.map((s, k) => <StageCell key={`${s.name}-${still}`} k={k} still={still} />)}
    </ol>
  );
}
