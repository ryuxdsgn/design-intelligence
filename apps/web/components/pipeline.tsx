"use client";

import Image from "next/image";
import { motion, useMotionValue, useMotionValueEvent, useScroll, useTransform, type MotionValue } from "motion/react";
import { type ReactNode, useEffect, useRef, useState } from "react";
import { Dim, Pin } from "@/components/markup";
import { HEADER, scrollToProgress, usePinned } from "@/components/reasoning-stage";

/* One screen through RYUX's five steps, in one session: the transaction detail screen an agent designed
   WITHOUT RYUX (EN-TD-2.3.3, run A2), analyzed, critiqued, redesigned, built, and QA'd by RYUX 2.6.2.
   Case TD-2.6 (docs/benchmarks/case-td-2.6/). Every word and number below is quoted or counted from
   that run's outputs (1-analyze.md … 5-qa.md); the redline values in QA were also measured by us in the
   final receipt.html (Chromium, 390 × 844): ID row 72, Done 52.
   One phone stays in view and each step adds its own layer. Pinned where there is room (1280 × 640);
   elsewhere, and with reduced motion, each step is shown still, in order. */

const IMG = { before: "/proof/en-td-without.png", after: "/cases/td-case/build-390.png", design: "/cases/td-case/design-1-success.png" };
const DESIGN_STATES = [
  { src: "/cases/td-case/design-2-pending.png", name: "Pending" },
  { src: "/cases/td-case/design-3-failed.png", name: "Failed" },
  { src: "/cases/td-case/design-4-loading.png", name: "Loading" },
];
const SIZES = [
  { src: "/cases/td-case/build-390.png", w: 780, h: 1688, name: "390" },
  { src: "/cases/td-case/build-375.png", w: 750, h: 1334, name: "375" },
  { src: "/cases/td-case/build-320.png", w: 640, h: 1136, name: "320" },
];

/* Scroll windows: step k runs from WINDOW[k] to WINDOW[k + 1]. */
const WINDOW = [0, 0.2, 0.4, 0.6, 0.8];
const stepAt = (v: number) => WINDOW.reduce((s, start, i) => (v >= start ? i : s), 0);
/* A still step shows the moment its layer is complete. */
const STILL = [0.17, 0.37, 0.57, 0.77, 0.97];
const useRange = (p: MotionValue<number>, a: number, b: number) => useTransform(p, [a, b], [0, 1], { clamp: true });
/** A step's layer: fades in at its start, holds, and hands over at the next step (`keep` holds to the end). */
const useLayer = (p: MotionValue<number>, k: number, keep = false) =>
  useTransform(
    p,
    keep ? [WINDOW[k] + 0.01, WINDOW[k] + 0.04] : [WINDOW[k] + 0.01, WINDOW[k] + 0.04, (WINDOW[k + 1] ?? 1) - 0.01, (WINDOW[k + 1] ?? 1) + 0.02],
    keep ? [0, 1] : [0, 1, 1, 0],
    { clamp: true },
  );

/* 1 · Analyze, sorted the way the run labeled them (1-analyze.md). */
const SORTED: { kind: "Observed" | "Inferred" | "Unknown"; items: string[] }[] = [
  { kind: "Observed", items: ["A close ✕, no back arrow", "$24.50 appears 3 times", "The fee row shows $0.00", "Total paid is the only bold row"] },
  { kind: "Inferred", items: ["A 390 × 963 frame at @2x", "Probably Inter", "Example data: the time matches the status bar"] },
  { kind: "Unknown", items: ["What Done and ✕ do", "Where the 30-day rule comes from", "The pending and failed versions"] },
];
/* Measured by the run in Analyze ("about"), in percent of the 780 × 1926 input. */
const ANALYZE_DIMS = [
  { label: "≈52", x: 84, top: 91.07, bottom: 96.47 },
  { label: "≈48", x: 50, top: 85.05, bottom: 90.03 },
];

/* 2 · Critique: the 11 findings (2-critique.md), with a point on the input where one exists. */
type Finding = { n: number; sev: 1 | 2 | 3; text: string; at?: { x: number; y: number; side: "left" | "right" } };
const FINDINGS: Finding[] = [
  { n: 1, sev: 3, text: "Only the successful version exists.", at: { x: 28.2, y: 15.5, side: "left" } },
  { n: 2, sev: 2, text: "Copy, Share, Save PDF and Help have no defined behaviour." },
  { n: 3, sev: 2, text: "$24.50 appears 3 times; a $0 fee takes 3 rows.", at: { x: 78.5, y: 50.2, side: "right" } },
  { n: 4, sev: 2, text: "Two rarely used buttons take the prime spot.", at: { x: 94.9, y: 87.5, side: "right" } },
  { n: 5, sev: 2, text: "“Within 30 days” is a rule with no source.", at: { x: 17.6, y: 79, side: "left" } },
  { n: 6, sev: 2, text: "“Balance left” reads as the current balance.", at: { x: 90.5, y: 45.5, side: "right" } },
  { n: 7, sev: 2, text: "Whether the page scrolls with a pinned footer is unknown." },
  { n: 8, sev: 2, text: "The copy icon is about 15 pt, with no label.", at: { x: 88.7, y: 64.6, side: "right" } },
  { n: 9, sev: 1, text: "Outlined borders are about 1.16:1.", at: { x: 94.9, y: 76.3, side: "right" } },
  { n: 10, sev: 1, text: "Day-month date next to US dollars.", at: { x: 30.4, y: 29.6, side: "left" } },
  { n: 11, sev: 1, text: "✕ and Done both seem to close the screen.", at: { x: 8.7, y: 9.1, side: "left" } },
];

/* 5 · QA (5-qa.md): counts that tick up to the run's own figures. */
const QA_COUNTS = [
  { to: 6, label: "differences found and fixed" },
  { to: 12, label: "state and width checks passed" },
  { to: 4, label: "px, the largest gap left to the design" },
];

type Hot = { hot: number | null; setHot: (n: number | null) => void };

function Layer({ o, children }: { o: MotionValue<number>; children: ReactNode }) {
  return <motion.div aria-hidden style={{ opacity: o }} className="pointer-events-none absolute inset-0">{children}</motion.div>;
}

/** A note in the margin beside the phone, with a leader to its point on the screen (x, y in percent).
    `bare` (no margin to write in, on small screens) keeps only the point. */
function Callout({ x, y, side, hot, bare, children }: { x: number; y: number; side: "left" | "right"; hot: boolean; bare: boolean; children: ReactNode }) {
  const dot = `absolute size-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-mark transition-transform duration-[var(--dur-2)] ${hot ? "scale-150" : ""}`;
  if (bare) return <span className={dot} style={{ left: `${x}%`, top: `${y}%` }} />;
  return (
    <div className="absolute inset-x-0" style={{ top: `${y}%` }}>
      <span
        className={`absolute bg-mark transition-[height,opacity] duration-[var(--dur-2)] ${hot ? "h-[2px]" : "h-px opacity-70"}`}
        style={side === "left" ? { left: -14, width: `calc(${x}% + 14px)` } : { right: -14, width: `calc(${100 - x}% + 14px)` }}
      />
      <span className={dot} style={{ left: `${x}%` }} />
      <div className={`absolute flex -translate-y-1/2 items-center ${side === "left" ? "right-[calc(100%+18px)]" : "left-[calc(100%+18px)]"}`}>{children}</div>
    </div>
  );
}

/** One finding's pin, landing in turn during Critique. Hovering it lights its line in the list. */
function FindingPin({ p, i, f, hot, setHot, bare }: Hot & { p: MotionValue<number>; i: number; f: Finding; bare: boolean }) {
  const s = useRange(p, WINDOW[1] + 0.02 + i * 0.012, WINDOW[1] + 0.04 + i * 0.012);
  const scale = useTransform(s, [0, 1], [0.4, 1]);
  if (!f.at) return null;
  return (
    <motion.div style={{ opacity: s }} className="absolute inset-0">
      <Callout x={f.at.x} y={f.at.y} side={f.at.side} hot={hot === f.n} bare={bare}>
        <motion.span
          style={{ scale }}
          onPointerEnter={() => setHot(f.n)}
          onPointerLeave={() => setHot(null)}
          className={`block rounded-full transition-shadow duration-[var(--dur-2)] ${hot === f.n ? "shadow-[0_0_0_4px_rgb(255_138_115/0.3)]" : ""}`}
        >
          <Pin n={f.n} tone="mark" />
        </motion.span>
      </Callout>
    </motion.div>
  );
}

/** A small screen that slides out of the phone into the margin, with its name. */
function Satellite({ p, a, src, w, h, name, width }: { p: MotionValue<number>; a: number; src: string; w: number; h: number; name: string; width: number }) {
  const t = useRange(p, a, a + 0.04);
  const x = useTransform(t, [0, 1], [60, 0]);
  return (
    <motion.figure style={{ opacity: t, x }} className="flex flex-col gap-1.5">
      <Image src={src} alt="" width={w} height={h} sizes="80px" className="rounded-[6px] ring-1 ring-hair" style={{ width, height: "auto" }} />
      <figcaption className="font-mono text-[11px] text-ink-2">{name}</figcaption>
    </motion.figure>
  );
}

/** The phone: the input screen, and each step's layer over it. `p` is the scroll, or a still value. */
function Phone({ p, hot, setHot, margin = true }: Hot & { p: MotionValue<number>; margin?: boolean }) {
  const analyze = useLayer(p, 0);
  const critique = useLayer(p, 1);
  const design = useLayer(p, 2, true);
  const designMarks = useLayer(p, 2);
  const build = useLayer(p, 3);
  const qa = useLayer(p, 4, true);

  // Analyze: an inspection pass sweeps down the screen, then the run's measurements are drawn.
  const sweep = useRange(p, 0.02, 0.1);
  const sweepTop = useTransform(sweep, (v) => `${v * 100}%`);
  const sweepO = useTransform(sweep, [0, 0.03, 0.97, 1], [0, 1, 1, 0]);
  const dimA = useRange(p, 0.09, 0.14);
  // Build: the built page is drawn over the design, top to bottom, behind a scan line.
  const wipe = useRange(p, WINDOW[3] + 0.02, WINDOW[3] + 0.12);
  const clip = useTransform(wipe, (v) => `inset(0 0 ${(1 - v) * 100}% 0)`);
  const scanTop = useTransform(wipe, (v) => `${v * 100}%`);
  const scanO = useTransform(wipe, [0, 0.03, 0.97, 1], [0, 1, 1, 0]);
  const dimQ = useRange(p, WINDOW[4] + 0.04, WINDOW[4] + 0.09);

  return (
    /* The frame is a phone, 390 × 844: the design and the build fill it. The input was drawn 390 × 963,
       taller than the phone (the run's C-07), so it is shown whole, scaled to the phone's height. */
    <div className="relative aspect-[390/844] h-full max-h-[760px] max-w-full">
      <div className="absolute inset-0 overflow-hidden rounded-[28px] bg-[#f5f3ee] ring-1 ring-hair shadow-[0_40px_80px_-40px_rgb(0_0_0/0.8)]">
        <div className="absolute inset-y-0 left-1/2 aspect-[390/963] -translate-x-1/2">
          <Image src={IMG.before} alt="" width={780} height={1926} sizes="360px" className="h-full w-full" />
          <Layer o={analyze}>
            <motion.div style={{ top: sweepTop, opacity: sweepO }} className="absolute inset-x-0 h-16 -translate-y-full bg-gradient-to-b from-transparent to-[rgb(60_196_183/0.22)]">
              <span className="absolute inset-x-0 bottom-0 h-px bg-[#14756f]" />
            </motion.div>
            <motion.div style={{ ["--dim" as string]: dimA }} className="absolute inset-0">
              {ANALYZE_DIMS.map((d) => (
                <Dim key={d.label} label={d.label} vertical scrub className="-translate-x-1/2" style={{ left: `${d.x}%`, top: `${d.top}%`, height: `${d.bottom - d.top}%` }} />
              ))}
            </motion.div>
          </Layer>
        </div>
        {/* Design: the pen.dev frame, 390 × 844, as drawn (with its status bar). */}
        <motion.div style={{ opacity: design }} className="absolute inset-0 bg-[#f3f1ec]">
          <Image src={IMG.design} alt="" width={780} height={1688} sizes="360px" className="h-full w-full" />
        </motion.div>
        {/* Build: the final receipt.html rendered at 390 × 844 (a web page has no status bar). */}
        <motion.div style={{ clipPath: clip }} className="absolute inset-0">
          <Image src={IMG.after} alt="" width={780} height={1688} sizes="360px" className="h-full w-full" />
        </motion.div>
        <motion.div aria-hidden style={{ top: scanTop, opacity: scanO }} className="absolute inset-x-0 h-[2px] bg-[#14756f] shadow-[0_0_16px_2px_rgb(20_117_111/0.6)]" />

        <Layer o={designMarks}>
          <span className="absolute top-[1.4%] left-1/2 -translate-x-1/2 rounded-[4px] bg-[#14756f] px-1.5 py-1 font-mono text-[10px] leading-none text-white">pen.dev · 390 × 844</span>
        </Layer>
        <Layer o={qa}>
          <motion.div style={{ ["--dim" as string]: dimQ }} className="absolute inset-0">
            {/* Measured in the final receipt.html at 390 × 844: the ID row is 72 tall, Done is 52. */}
            <Dim label="72" vertical scrub className="-translate-x-1/2" style={{ left: "95%", top: "50.09%", height: "8.53%" }} />
            <Dim label="52" vertical scrub className="-translate-x-1/2" style={{ left: "90%", top: "91.47%", height: "6.16%" }} />
          </motion.div>
        </Layer>
      </div>

      {/* Margin notes, outside the screen, so they never cover what they point at. */}
      <motion.div style={{ opacity: critique }} className="absolute inset-y-0 left-1/2 aspect-[390/963] -translate-x-1/2">
        {FINDINGS.map((f, i) => <FindingPin key={f.n} p={p} i={i} f={f} hot={hot} setHot={setHot} bare={!margin} />)}
      </motion.div>
      {margin && (
        <>
          <motion.div aria-hidden style={{ opacity: designMarks }} className="absolute right-[calc(100%+24px)] bottom-0 flex items-end gap-3">
            {DESIGN_STATES.map((d, i) => <Satellite key={d.name} p={p} a={WINDOW[2] + 0.04 + i * 0.03} src={d.src} w={780} h={1688} name={d.name} width={64} />)}
          </motion.div>
          <motion.div aria-hidden style={{ opacity: build }} className="absolute right-[calc(100%+24px)] bottom-0 flex items-end gap-3">
            {SIZES.map((s, i) => <Satellite key={s.name} p={p} a={WINDOW[3] + 0.06 + i * 0.03} src={s.src} w={s.w} h={s.h} name={`${s.name} wide`} width={Math.round((64 * s.w) / 780)} />)}
          </motion.div>
        </>
      )}
    </div>
  );
}

/** Analyze's sorting: each fact comes in from the screen's side and lands in its column. */
function Sorted({ p }: { p: MotionValue<number> }) {
  return (
    <div className="grid grid-cols-3 gap-4">
      {SORTED.map((col, c) => (
        <div key={col.kind} className="flex flex-col gap-2">
          <p className={`font-mono text-[12px] ${col.kind === "Unknown" ? "text-mark" : col.kind === "Observed" ? "text-accent" : "text-ink"}`}>{col.kind}</p>
          <ul className="flex flex-col gap-1.5">
            {col.items.map((it, k) => <SortedItem key={it} p={p} a={0.04 + (c * 4 + k) * 0.009}>{it}</SortedItem>)}
          </ul>
        </div>
      ))}
    </div>
  );
}

function SortedItem({ p, a, children }: { p: MotionValue<number>; a: number; children: ReactNode }) {
  const t = useRange(p, a, a + 0.03);
  const x = useTransform(t, [0, 1], [80, 0]);
  return (
    <motion.li style={{ x, opacity: t }} className="rounded-[6px] border border-hair bg-panel px-2.5 py-1.5 text-[13px] leading-[1.35] text-ink">
      {children}
    </motion.li>
  );
}

/** A count that ticks up to its figure as QA comes in; the final figure is what screen readers get. */
function Count({ p, to, i }: { p: MotionValue<number>; to: number; i: number }) {
  const v = useTransform(p, [WINDOW[4] + 0.03 + i * 0.02, WINDOW[4] + 0.1 + i * 0.02], [0, to], { clamp: true });
  const [n, setN] = useState(() => Math.round(v.get()));
  useMotionValueEvent(v, "change", (x) => setN(Math.round(x)));
  return (
    <>
      <span aria-hidden className="tabular-nums">{n}</span>
      <span className="sr-only">{to}</span>
    </>
  );
}

function Row({ k, children }: { k: string; children: ReactNode }) {
  return (
    <div className="grid grid-cols-[180px_1fr] gap-4 border-b border-hair py-2 last:border-b-0">
      <dt className="text-muted">{k}</dt>
      <dd>{children}</dd>
    </div>
  );
}

function Findings({ hot, setHot }: Hot) {
  return (
    <ol className="flex flex-col text-[14px] leading-[1.4]">
      {FINDINGS.map((f) => (
        <li key={f.n}>
          {/* Hover or focus a finding to light its pin on the screen. */}
          <button
            type="button"
            onPointerEnter={() => setHot(f.n)}
            onPointerLeave={() => setHot(null)}
            onFocus={() => setHot(f.n)}
            onBlur={() => setHot(null)}
            className={`finding flex w-full items-start gap-2.5 rounded-md px-1.5 py-[3px] text-left transition-colors duration-[var(--dur-1)] ${hot === f.n ? "bg-panel text-ink" : "text-ink-2"}`}
          >
            <Pin n={f.n} tone="mark" />
            <span className="pt-0.5">
              <span className={`mr-1.5 font-mono text-[11px] ${f.sev === 3 ? "text-mark" : "text-muted"}`}>sev {f.sev}</span>
              {f.text}
            </span>
          </button>
        </li>
      ))}
    </ol>
  );
}

type Step = { name: string; title: string; body: (p: MotionValue<number>, h: Hot) => ReactNode };

const STEPS: Step[] = [
  {
    name: "Analyze",
    title: "Reads the screen, and sorts what it sees.",
    body: (p) => (
      <>
        <p>It measured what it could from the pixels and labeled every point. It does not judge yet.</p>
        <Sorted p={p} />
      </>
    ),
  },
  {
    name: "Critique",
    title: "Eleven findings, most severe first.",
    body: (_p, h) => (
      <>
        <Findings {...h} />
        <p className="text-[14px] text-muted">It also kept what works: one clear focal point, green only for status, the fee shown even at $0.</p>
      </>
    ),
  },
  {
    name: "Design",
    title: "Four screens, each change tied to a finding.",
    body: () => (
      <>
        <ul className="flex flex-col gap-1.5">
          <li>Pending, failed, and loading screens next to success <span className="font-mono text-[12px] text-muted">C-01</span></li>
          <li>The amount once, plus one “Total paid · No fee” row <span className="font-mono text-[12px] text-muted">C-03</span></li>
          <li>Share receipt and Save PDF become one button <span className="font-mono text-[12px] text-muted">C-04</span></li>
          <li>“Within 30 days” removed: nothing confirms it <span className="font-mono text-[12px] text-muted">C-05</span></li>
          <li>“Balance left” becomes “Balance after payment” <span className="font-mono text-[12px] text-muted">C-06</span></li>
          <li>The whole ID row copies, 44 pt tall <span className="font-mono text-[12px] text-muted">C-08</span></li>
        </ul>
        <p>
          <span className="font-mono text-[12px] text-mark">Asked nothing</span> It added “Try again” and “Your wallet wasn&apos;t charged” on
          its own. Both are flagged to confirm, and both are on screen.
        </p>
      </>
    ),
  },
  {
    name: "Build",
    title: "One HTML file, four states, three phone sizes.",
    body: () => (
      <>
        <p>
          Copy shows “Transaction ID copied”, and says so if copying fails. Share shows a spinner and ignores extra taps, with its own
          failure message. Dates and money follow the device&apos;s region.
        </p>
        <p>Rendered at 390, 375, and 320 wide: no sideways scroll, the footer stays pinned, every button at least 44 pt.</p>
        <p className="text-muted">Done, Try again, and Help send a signal for the real app; they do not go anywhere yet.</p>
      </>
    ),
  },
  {
    name: "QA",
    title: "Measured against the design, and says what it did not test.",
    body: (p) => (
      <>
        <dl className="grid grid-cols-3 gap-4">
          {QA_COUNTS.map((c, i) => (
            <div key={c.label} className="flex flex-col-reverse gap-1">
              <dt className="text-[13px] leading-[1.35] text-ink-2">{c.label}</dt>
              <dd className="text-[34px] leading-none font-semibold tracking-[-0.02em] text-ink"><Count p={p} to={c.to} i={i} /></dd>
            </div>
          ))}
        </dl>
        <dl className="text-[15px]">
          <Row k="Amount, UK settings">“US$24.50” → “$24.50”</Row>
          <Row k="Transaction ID row">56 → 72, as designed</Row>
          <Row k="Dates, other languages">Mixed languages → the screen&apos;s English</Row>
        </dl>
        <p><span className="font-mono text-[12px] text-mark">Not tested</span> Safari, a real iPhone, dark mode, the largest text sizes.</p>
      </>
    ),
  },
];

function StepText({ i, step, p, h }: { i: number; step: Step; p: MotionValue<number>; h: Hot }) {
  return (
    <div className="flex flex-col gap-3">
      <p className="font-mono text-[12px] text-accent">{i + 1} · {step.name}</p>
      <h3 className="text-[26px] leading-[1.15] font-semibold tracking-[-0.02em] sm:text-[30px]">{step.title}</h3>
      <div className="flex flex-col gap-3 text-[16px] leading-[1.5] text-ink-2">{step.body(p, h)}</div>
    </div>
  );
}

function StillStep({ i, step }: { i: number; step: Step }) {
  const p = useMotionValue(STILL[i]);
  const [hot, setHot] = useState<number | null>(null);
  return (
    <li className="rise grid items-center gap-8 border-t border-hair py-12 [&>*]:min-w-0 md:grid-cols-[minmax(0,1fr)_280px] md:gap-12">
      <StepText i={i} step={step} p={p} h={{ hot, setHot }} />
      <div className="mx-auto w-[78%] max-w-[280px] md:w-full"><Phone p={p} hot={hot} setHot={setHot} margin={false} /></div>
    </li>
  );
}

export function Pipeline() {
  const pinned = usePinned("(min-width: 1280px) and (min-height: 640px)");
  const track = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: track, offset: [`start ${HEADER}px`, "end end"] });
  const [step, setStep] = useState(0);
  const [hot, setHot] = useState<number | null>(null);
  useMotionValueEvent(scrollYProgress, "change", (v) => {
    const s = stepAt(v);
    setStep((cur) => (cur === s ? cur : s));
  });
  useEffect(() => setStep(stepAt(scrollYProgress.get())), [pinned, scrollYProgress]);

  // The track is always rendered, so the scroll it measures exists in both modes.
  if (!pinned)
    return (
      <div ref={track}>
        <ol aria-label="RYUX's five steps on one screen">
          {STEPS.map((s, i) => <StillStep key={s.name} i={i} step={s} />)}
        </ol>
      </div>
    );

  return (
    <div ref={track} className="relative h-[560vh]">
      <div className="sticky grid grid-cols-[minmax(0,1fr)_auto] items-center gap-6 py-8" style={{ top: HEADER, height: `calc(100svh - ${HEADER}px)` }}>
        <div className="flex flex-col gap-7">
          <ol aria-label="RYUX's five steps" className="grid grid-cols-5 gap-2">
            {STEPS.map((s, i) => (
              <li key={s.name}>
                <button
                  type="button"
                  aria-current={i === step ? "step" : undefined}
                  onClick={() => scrollToProgress(track.current, WINDOW[i] + 0.12)}
                  className="step-btn group flex min-h-11 w-full flex-col gap-2 text-left"
                >
                  <span className={`h-[2px] w-full rounded-full transition-colors duration-[var(--dur-2)] ${i <= step ? "bg-accent" : "bg-hair group-hover:bg-muted"}`} />
                  <span className={`font-mono text-[12px] transition-colors duration-[var(--dur-2)] group-hover:text-ink ${i === step ? "text-accent" : i < step ? "text-ink-2" : "text-muted"}`}>
                    {i + 1} · {s.name}
                  </span>
                </button>
              </li>
            ))}
          </ol>
          {/* Every step's words stay in the page for screen readers; only the current one is seen. */}
          <div className="relative min-h-[520px]">
            {STEPS.map((s, i) => (
              <div key={s.name} data-on={i === step} className="beat absolute inset-x-0 top-0">
                <StepText i={i} step={s} p={scrollYProgress} h={{ hot, setHot }} />
              </div>
            ))}
          </div>
        </div>
        <figure aria-label="The transaction detail screen made without RYUX, then RYUX's analysis, findings, design, build, and QA on it" className="h-full max-h-[760px] py-2 pr-24 pl-[260px]">
          <Phone p={scrollYProgress} hot={hot} setHot={setHot} />
        </figure>
      </div>
    </div>
  );
}

/** Before and after of the same screen, compared by dragging a handle (or with ← and →). The after
    image is drawn over the before one and cut at the handle. A slider, so it is read and operated as
    one: its value is how much of the after screen shows. */
export function CompareHandle({ before, after, w, h, label }: { before: string; after: string; w: number; h: number; label: string }) {
  const [pos, setPos] = useState(50);
  const box = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);
  const at = (clientX: number) => {
    const r = box.current?.getBoundingClientRect();
    if (r) setPos(Math.min(100, Math.max(0, ((clientX - r.left) / r.width) * 100)));
  };
  return (
    <div
      ref={box}
      className="compare relative touch-pan-y select-none overflow-hidden rounded-[20px] bg-white ring-1 ring-hair"
      style={{ aspectRatio: `${w} / ${h}` }}
      onPointerDown={(e) => { dragging.current = true; e.currentTarget.setPointerCapture(e.pointerId); at(e.clientX); }}
      onPointerMove={(e) => dragging.current && at(e.clientX)}
      onPointerUp={() => { dragging.current = false; }}
      onPointerCancel={() => { dragging.current = false; }}
    >
      <Image src={before} alt="" width={w} height={h} sizes="360px" className="absolute inset-0 h-full w-full" draggable={false} />
      <div className="absolute inset-0" style={{ clipPath: `inset(0 0 0 ${pos}%)` }}>
        <Image src={after} alt="" width={w} height={h} sizes="360px" className="h-full w-full" draggable={false} />
      </div>
      <span aria-hidden className="pointer-events-none absolute top-3 left-3 rounded-[4px] bg-[#16202a] px-1.5 py-1 font-mono text-[11px] leading-none text-white">Before</span>
      <span aria-hidden className="pointer-events-none absolute top-3 right-3 rounded-[4px] bg-[#14756f] px-1.5 py-1 font-mono text-[11px] leading-none text-white">After</span>
      <div
        role="slider"
        tabIndex={0}
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(100 - pos)}
        aria-valuetext={`${Math.round(100 - pos)}% of the after screen shown`}
        onKeyDown={(e) => {
          const step = e.key === "ArrowLeft" ? -10 : e.key === "ArrowRight" ? 10 : e.key === "Home" ? -100 : e.key === "End" ? 100 : 0;
          if (!step) return;
          e.preventDefault();
          setPos((p) => Math.min(100, Math.max(0, p + step)));
        }}
        className="compare-handle absolute inset-y-0 flex w-11 -translate-x-1/2 cursor-ew-resize items-center justify-center"
        style={{ left: `${pos}%` }}
      >
        <span aria-hidden className="absolute inset-y-0 left-1/2 w-[2px] -translate-x-1/2 bg-[#14756f]" />
        <span aria-hidden className="relative flex size-9 items-center justify-center rounded-full bg-[#14756f] text-white shadow-[0_6px_16px_-6px_rgb(0_0_0/0.6)] transition-transform duration-[var(--dur-2)] ease-[var(--ease-spring)]">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 6-6 6 6 6M15 6l6 6-6 6" /></svg>
        </span>
      </div>
    </div>
  );
}
