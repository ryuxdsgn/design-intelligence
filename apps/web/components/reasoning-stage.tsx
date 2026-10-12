"use client";

import Image from "next/image";
import { motion, useMotionValueEvent, useReducedMotion, useScroll, useTransform, type MotionValue } from "motion/react";
import { Fragment, type ReactNode, useEffect, useRef, useState } from "react";
import { Ring } from "@/components/markup";

/** A screen export. `pt` is the width it was designed at (390 unless said), so screens share one scale. */
export type Shot = { src: string; w: number; h: number; name: string; pt?: number };
const ptH = (s: Shot) => (s.h * (s.pt ?? 390)) / s.w;
type Row = { key: string; value: string };

/* The page's one storytelling motion (RX-UI-11 L4): not how many screens RYUX made, but how it got there.
   Four beats, in the order RYUX works: it asks first, leaves what it doesn't know open, covers every
   moment, and writes the decision down. The screens are scrubbed by scroll; the beat's words switch in
   whole, so whatever is on screen can be read. Pinned only where there is room (1024 wide, 640 tall);
   elsewhere, and with reduced motion, the four beats are a still list next to the finished board.
   Everything shown is from the transaction-detail benchmark, pair 2 (see app/page.tsx). */

/* Pinned where there is room; the board then shrinks to the window's height (see the figure). */
export const PIN = "(min-width: 1024px) and (min-height: 720px)";
export const HEADER = 69; // the sticky header's height at 1024 and wider
const GAP = 16; // the board's column gap, in px (gap-4)

const BEATS = ["Asks first", "Leaves unknowns open", "Covers every moment", "Writes the decision down"];
/* Where each beat starts, as a share of the pinned scroll. */
const BEAT_AT = [0, 0.18, 0.38, 0.8];

/* Each RYUX screen's flight: the paid screen lands in beat 2 (so its [CUR] can be circled), the other
   five are dealt in beat 3. */
const flight = (i: number) => (i === 0 ? ([0.19, 0.27] as const) : ([0.38 + (i - 1) * 0.07, 0.38 + (i - 1) * 0.07 + 0.12] as const));
const landed = (i: number, v: number) => v >= (flight(i)[0] + flight(i)[1]) / 2;
const beatAt = (v: number) => BEAT_AT.reduce((b, start, i) => (v >= start ? i : b), 0);

/* Measured on the exported screens, as percentages of each image: the guessed "$24.50" on the screen
   made without RYUX, and the "[CUR]" RYUX left open on its paid screen. */
const GUESS = { left: 30, right: 70.3, y: 22.4 };
const KEPT_OPEN = { x: 34.5, y: 27.3, w: 34, h: 6.5 };

/** True when a pinned, scroll-driven stage has room (`query`) and motion is welcome. */
/** Scrolls so that a pinned stage `track` (offset: start at the header, end at the bottom) sits at
    progress `p`. Instant when reduced motion is asked for. */
export function scrollToProgress(track: HTMLElement | null, p: number) {
  if (!track) return;
  const r = track.getBoundingClientRect();
  const top = r.top + window.scrollY - HEADER;
  const span = r.height - window.innerHeight + HEADER;
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  window.scrollTo({ top: top + p * span, behavior: reduce ? "auto" : "smooth" });
}

export function usePinned(query = PIN) {
  const reduce = useReducedMotion();
  const [fits, setFits] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia(query);
    const on = () => setFits(mq.matches);
    on();
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, [query]);
  return fits && !reduce;
}

/** A whole screen, never cropped: drawn at the board's one scale (a 390-wide screen fills the slot's width,
    the 320 one is narrower), top-aligned. `children` are marks placed in percentages of the image. */
function Screen({ shot, children }: { shot: Shot; children?: ReactNode }) {
  return (
    <div
      className="on-screen relative mx-auto overflow-hidden rounded-[6px] bg-white ring-1 ring-hair"
      style={{ width: `${((shot.pt ?? 390) / 390) * 100}%`, aspectRatio: `${shot.w} / ${shot.h}` }}
    >
      <Image src={shot.src} alt="" width={shot.w} height={shot.h} sizes="(min-width: 1024px) 180px, 30vw" className="h-full w-full" />
      {children}
    </div>
  );
}

/** One RYUX screen, flying from the first column (the screen made without RYUX) to its own slot `i + 1`. */
function Dealt({ i, progress, children }: { i: number; progress: MotionValue<number>; children: ReactNode }) {
  const [a, b] = flight(i);
  const t = useTransform(progress, [a, b], [0, 1], { clamp: true });
  const cols = i + 1;
  const x = useTransform(t, (v) => `calc(${-(1 - v) * cols * 100}% - ${(1 - v) * cols * GAP}px)`);
  const y = useTransform(t, (v) => -Math.sin(v * Math.PI) * 14);
  const rotate = useTransform(t, [0, 1], [-5, 0]);
  const scale = useTransform(t, [0, 0.5, 1], [0.9, 1.04, 1]);
  const opacity = useTransform(t, [0, 0.12], [0, 1]);
  return (
    <motion.div style={{ x, y, rotate, scale, opacity, zIndex: 10 + i }} className="dealt absolute inset-0">
      {children}
    </motion.div>
  );
}

/** A moment's slot: dashed and marked "No screen" until a screen lands in it. */
/** `box` (pinned only) gives every slot the tallest screen's height, so a flight is a straight move across
    columns; still, a slot is just its screen, with the name right under it. */
function Slot({ name, filled, box, className = "", children }: { name: string; filled: boolean; box?: number; className?: string; children?: ReactNode }) {
  return (
    <li className={`flex min-w-0 flex-col gap-2 ${className}`}>
      <div className={`relative rounded-[8px] border border-dashed transition-colors duration-[var(--dur-2)] ${filled ? "border-transparent" : "border-hair"}`} style={box ? { aspectRatio: `390 / ${box}` } : undefined}>
        <span className={`absolute inset-0 grid place-items-center px-2 text-center font-mono text-[11px] text-muted transition-opacity duration-[var(--dur-2)] ${filled ? "opacity-0" : ""}`}>
          No screen
        </span>
        {children}
      </div>
      <p className={`text-[13px] leading-[1.3] transition-colors duration-[var(--dur-2)] ${filled ? "text-ink" : "text-muted"}`}>{name}</p>
    </li>
  );
}

/** What each beat says. Short, and quoted from the run where it quotes. */
function BeatBody({ i, questions, receipt, count }: { i: number; questions: string[]; receipt: Row[]; count: number }) {
  if (i === 0)
    return (
      <>
        <p className="text-ink-2">Before drawing anything, three questions:</p>
        <ol className="beat-list mt-2 list-decimal pl-5 text-ink">
          {questions.map((q, k) => <li key={q} style={{ ["--k" as string]: k } as React.CSSProperties}>{q}</li>)}
        </ol>
      </>
    );
  if (i === 1)
    return (
      <p className="text-ink-2">
        Nobody said which currency. Without RYUX the amount became <span className="morph-old text-mark">$24.50</span>;
        with RYUX it reads <span className="morph-new font-mono text-accent">[CUR]</span> until someone decides.
      </p>
    );
  if (i === 2)
    return (
      <p className="text-ink-2">
        Every moment after someone pays gets its own screen: <span className="font-semibold text-ink tabular-nums">{count} of 6</span>, against 1
        without RYUX.
      </p>
    );
  return (
    <dl className="beat-list grid grid-cols-[96px_1fr] gap-x-4 gap-y-1.5">
      {receipt.map((r, k) => (
        <Fragment key={r.key}>
          <dt className="text-muted" style={{ ["--k" as string]: k } as React.CSSProperties}>{r.key}</dt>
          <dd className={r.key === "Evidence" ? "text-mark" : "text-ink"} style={{ ["--k" as string]: k } as React.CSSProperties}>{r.value}</dd>
        </Fragment>
      ))}
    </dl>
  );
}

export function ReasoningStage({ alone, states, questions, receipt, children }: {
  alone: Shot; states: Shot[]; questions: string[]; receipt: Row[]; children: ReactNode;
}) {
  const pinned = usePinned();
  const track = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: track, offset: [`start ${HEADER}px`, "end end"] });
  const [at, setAt] = useState({ beat: BEATS.length - 1, count: states.length });

  // React only hears when the beat or the number of landed screens changes; the flights stay in Motion.
  const sync = (p: number) => {
    const next = { beat: beatAt(p), count: states.filter((_, i) => landed(i, p)).length };
    setAt((cur) => (cur.beat === next.beat && cur.count === next.count ? cur : next));
  };
  useMotionValueEvent(scrollYProgress, "change", (p) => pinned && sync(p));
  useEffect(() => sync(pinned ? scrollYProgress.get() : 1), [pinned, scrollYProgress]); // eslint-disable-line react-hooks/exhaustive-deps

  const { beat, count } = at;
  // Every slot is as tall as the tallest screen at the board's scale, so none is cropped.
  const box = Math.max(ptH(alone), ...states.map(ptH));
  // The strike on the guess, then the ring around what was kept open, drawn by scroll in beat 2.
  const strike = useTransform(scrollYProgress, [0.25, 0.31], [0, 1], { clamp: true });
  const ring = useTransform(scrollYProgress, [0.29, 0.36], [0, 1], { clamp: true });
  const marks = pinned ? { "--strike": strike, "--ring": ring } : { "--strike": 1, "--ring": 1 };

  return (
    <div ref={track} className={pinned ? "relative h-[340vh]" : ""}>
      <div
        className={pinned ? "sticky flex flex-col justify-center gap-8 overflow-hidden py-6" : "flex flex-col gap-10 lg:pt-20"}
        style={pinned ? { top: HEADER, height: `calc(100svh - ${HEADER}px)` } : undefined}
      >
        <div className={`grid gap-8 [&>*]:min-w-0 lg:grid-cols-[minmax(0,1fr)_minmax(0,400px)] lg:gap-12 ${pinned ? "lg:items-end" : "lg:items-start"}`}>
          {children}
          {pinned ? (
            /* A stepper for where you are, then the current beat's words, swapped whole. */
            <div className="flex flex-col gap-4">
              <ol aria-label="How RYUX worked" className="grid grid-cols-4 gap-2">
                {BEATS.map((b, i) => (
                  <li key={b}>
                    {/* A beat can be jumped to: the page scrolls to where that beat starts. */}
                    <button
                      type="button"
                      aria-current={i === beat ? "step" : undefined}
                      onClick={() => scrollToProgress(track.current, BEAT_AT[i] + 0.02)}
                      className="step-btn group flex min-h-11 w-full flex-col gap-1.5 text-left"
                    >
                      <span className={`h-[2px] w-full rounded-full transition-colors duration-[var(--dur-2)] ${i <= beat ? "bg-accent" : "bg-hair group-hover:bg-muted"}`} />
                      <span className={`font-mono text-[12px] leading-[1.3] transition-colors duration-[var(--dur-2)] ${i === beat ? "text-accent" : i < beat ? "text-ink-2" : "text-muted"} group-hover:text-ink`}>
                        {i + 1} · {b}
                      </span>
                    </button>
                  </li>
                ))}
              </ol>
              <div className="relative min-h-[150px] text-[17px] leading-[1.5]">
                {BEATS.map((b, i) => (
                  <div key={b} data-on={i === beat} className="beat absolute inset-x-0 top-0">
                    <BeatBody i={i} questions={questions} receipt={receipt} count={count} />
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <ol aria-label="How RYUX worked" className="flex flex-col gap-5 text-[15px] leading-[1.5]">
              {BEATS.map((b, i) => (
                <li key={b} className="flex flex-col gap-1.5 border-l border-accent/50 pl-4">
                  <p className="font-mono text-[12px] text-accent">{i + 1} · {b}</p>
                  <BeatBody i={i} questions={questions} receipt={receipt} count={count} />
                </li>
              ))}
            </ol>
          )}
        </div>

        <motion.figure aria-label="One screen made without RYUX, six made with RYUX" className="flex flex-col gap-4" style={marks as never}>
          {/* One grid, seven equal columns at 1024+, so a screen's flight is a whole number of columns.
              On phones the screen made without RYUX gets its own row, then RYUX's six in threes. */}
          <ol
            className="grid grid-cols-3 gap-x-4 gap-y-3 lg:grid-cols-7"
            /* Pinned, every whole screen must fit under the heading: the slot height is the column width
               times box/390, so the board is only as wide as the height left over allows (about 440 px go
               to the header, the heading and stepper, the labels, and the names). */
            style={pinned ? { maxWidth: `calc(7 * (100svh - 440px) * 390 / ${box} + 96px)` } : undefined}
          >
            <li aria-hidden className="relative z-30 col-span-3 font-mono text-[12px] text-mark lg:order-1 lg:col-span-1">Without RYUX</li>
            <Slot name="Paid" filled box={pinned ? box : undefined} className="relative z-20 col-span-3 mb-4 w-[calc((100%-32px)/3)] lg:order-3 lg:col-span-1 lg:mb-0 lg:w-auto lg:after:absolute lg:after:inset-y-0 lg:after:-right-2 lg:after:w-px lg:after:bg-hair">
              <div className={pinned ? "absolute inset-0" : ""}>
                <Screen shot={alone}>
                  <span aria-hidden className="strike-scrub absolute h-[2px]" style={{ left: `${GUESS.left - 2}%`, right: `${100 - GUESS.right - 2}%`, top: `${GUESS.y}%` }} />
                </Screen>
              </div>
            </Slot>
            <li aria-hidden className="relative z-30 col-span-3 font-mono text-[12px] text-accent lg:order-2 lg:col-span-6">
              With RYUX · <span className="tabular-nums">{count}</span> of 6
            </li>
            {states.map((s, i) => {
              const shot = (
                <Screen shot={s}>
                  {i === 0 && <Ring x={KEPT_OPEN.x} y={KEPT_OPEN.y} w={KEPT_OPEN.w} h={KEPT_OPEN.h} tone="accent" scrub />}
                </Screen>
              );
              return (
                <Slot key={s.name} name={s.name} filled={i < count} box={pinned ? box : undefined} className="lg:order-4">
                  {pinned ? (
                    <Dealt i={i} progress={scrollYProgress}>{shot}</Dealt>
                  ) : (
                    shot
                  )}
                </Slot>
              );
            })}
          </ol>
          <figcaption className="sr-only">
            Without RYUX: the paid screen only, with the amount in dollars nobody asked for. With RYUX: all six, paid,
            still processing, failed, loading, couldn&apos;t load, and a small phone, with the currency left as [CUR].
          </figcaption>
        </motion.figure>
      </div>
    </div>
  );
}
