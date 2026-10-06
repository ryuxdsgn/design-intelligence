"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

type Pair = { id: string; tab: string; before: string[]; after: string[]; alt: [string, string] };

/* Every pair is set on the same 780 by 1121 canvas, top-aligned, so the slider never changes size between tabs. */
const CANVAS = { w: 780, h: 1121 };

/* Pairs from the showcase gallery (docs/showcase.md), one run each on an earlier release, sample data,
   with the screen text translated from Indonesian to English. */
const PAIRS: Pair[] = [
  {
    id: "ux",
    tab: "Sign-up form",
    before: ["Two columns", "Placeholder-only labels", "Every field required", "A vague error banner"],
    after: ["One column, labels above fields", "Inline validation that keeps what you typed", "Fewer fields", "A numeric keypad for the phone number"],
    alt: [
      "Sign-up form without RYUX: cramped two columns, placeholder-only labels, every field required including referral, a vague error banner",
      "Sign-up form with RYUX: one column, labels above fields, an inline password error that keeps what was typed, an optional referral code",
    ],
  },
  {
    id: "a11y",
    tab: "Accessibility",
    before: ["11px text at roughly 2:1 contrast", "Placeholder-only labels", "Small touch targets", "A washed-out button"],
    after: ["16px and up at AA contrast", "Targets of 48px and up", "A visible focus state", "Labels that stay on screen"],
    alt: [
      "Settings screen without RYUX: low-contrast 11px grey text, placeholder-only labels, small targets, a washed-out save button",
      "Settings screen with RYUX: readable text, a labeled field with a visible focus ring, a large toggle, a clear save button",
    ],
  },
  {
    id: "local",
    tab: "Local payment",
    before: ["A global card form", "Dollars", "Foreign payment methods", "No local pattern"],
    after: ["A virtual account with a copy button", "A payment deadline", "A transparent admin fee", "Rupiah throughout"],
    alt: [
      "Payment screen without RYUX: a global card form in dollars with VISA, Mastercard, PayPal and Google Pay",
      "Payment screen with RYUX: a BCA virtual account number with a copy button, a payment deadline, the admin fee, and how to pay with m-BCA",
    ],
  },
];

const prefersReducedMotion = () =>
  typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export function BeforeAfter() {
  const [active, setActive] = useState(0);
  const [pos, setPos] = useState(50);
  const frame = useRef<HTMLDivElement>(null);
  const seen = useRef(false);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  const pair = PAIRS[active];

  /* One sweep from right to middle shows there are two versions. Skipped under reduced motion. */
  function sweep() {
    if (prefersReducedMotion()) {
      setPos(50);
      return;
    }
    const start = performance.now();
    const step = (now: number) => {
      const t = Math.min(1, (now - start) / 900);
      const eased = 1 - Math.pow(1 - t, 3);
      setPos(92 - 42 * eased);
      if (t < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }

  useEffect(() => {
    const el = frame.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting && !seen.current) {
          seen.current = true;
          sweep();
          io.disconnect();
        }
      },
      { threshold: 0.4 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  function select(i: number) {
    setActive(i);
    sweep();
  }

  function onKey(e: React.KeyboardEvent, i: number) {
    const step = e.key === "ArrowDown" || e.key === "ArrowRight" ? 1 : e.key === "ArrowUp" || e.key === "ArrowLeft" ? -1 : 0;
    if (!step) return;
    e.preventDefault();
    const next = (i + step + PAIRS.length) % PAIRS.length;
    select(next);
    tabs.current[next]?.focus();
  }

  return (
    <div className="grid gap-10 [&>*]:min-w-0 lg:grid-cols-[1fr_380px_1fr] lg:items-center lg:gap-14">
      <div role="tablist" aria-label="Examples" aria-orientation="vertical" className="flex flex-wrap gap-2 lg:flex-col lg:gap-1">
        {PAIRS.map((p, i) => (
          <button
            key={p.id}
            ref={(el) => {
              tabs.current[i] = el;
            }}
            role="tab"
            id={`ba-tab-${p.id}`}
            aria-selected={i === active}
            aria-controls="ba-panel"
            tabIndex={i === active ? 0 : -1}
            onClick={() => select(i)}
            onKeyDown={(e) => onKey(e, i)}
            className={`min-h-11 rounded-full border px-5 text-left text-[15px] font-medium transition-colors duration-200 lg:rounded-lg lg:border-0 lg:px-4 lg:py-3 lg:text-[19px] ${
              i === active
                ? "border-ink bg-ink text-white lg:border-l-[3px] lg:border-accent lg:bg-white lg:font-semibold lg:text-ink lg:shadow-[0_1px_2px_rgba(11,22,43,0.08)]"
                : "border-hair bg-white text-ink-2 hover:text-ink lg:border-l-[3px] lg:border-transparent lg:bg-transparent"
            }`}
          >
            {p.tab}
          </button>
        ))}
      </div>

      <div id="ba-panel" role="tabpanel" aria-labelledby={`ba-tab-${pair.id}`} className="mx-auto w-full max-w-[380px]">
        <div aria-hidden className="mb-3 flex justify-between text-[13px] font-semibold">
          <span className="text-mark">← Without RYUX</span>
          <span className="text-accent">With RYUX →</span>
        </div>
        <div
          ref={frame}
          className="relative w-full overflow-hidden rounded-[24px] border border-hair bg-white shadow-[0_24px_60px_-24px_rgba(11,22,43,0.35)] select-none"
          style={{ aspectRatio: `${CANVAS.w} / ${CANVAS.h}` }}
        >
          <Image key={`a-${pair.id}`} src={`/before-after/${pair.id}-after.png`} alt={pair.alt[1]} fill sizes="380px" className="object-cover object-top" />
          <div className="absolute inset-0" style={{ clipPath: `inset(0 ${100 - pos}% 0 0)` }}>
            <Image key={`b-${pair.id}`} src={`/before-after/${pair.id}-before.png`} alt={pair.alt[0]} fill sizes="380px" className="object-cover object-top" />
          </div>
          <div aria-hidden className="pointer-events-none absolute inset-y-0 w-0.5 bg-white shadow-[0_0_0_1px_rgba(11,22,43,0.25)]" style={{ left: `${pos}%` }}>
            <span className="absolute top-1/2 left-1/2 flex size-10 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white text-ink shadow-[0_4px_16px_rgba(11,22,43,0.25)]">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="m9 6-6 6 6 6M15 6l6 6-6 6" />
              </svg>
            </span>
          </div>
          <input
            type="range"
            min={0}
            max={100}
            value={Math.round(pos)}
            onChange={(e) => setPos(Number(e.target.value))}
            aria-label="Drag to compare without and with RYUX"
            className="absolute inset-0 h-full w-full cursor-ew-resize opacity-0"
          />
        </div>
        <p className="mt-3 text-center text-[13px] text-muted">Drag, or use the arrow keys, to compare.</p>
      </div>

      <div key={pair.id} className="case-panel grid gap-8 sm:grid-cols-2 lg:grid-cols-1">
        {(
          [
            ["Without RYUX", pair.before, "text-mark"],
            ["With RYUX", pair.after, "text-accent"],
          ] as const
        ).map(([title, items, tone]) => (
          <div key={title}>
            <p className={`text-[14px] font-semibold ${tone}`}>{title}</p>
            <ul className="mt-3 flex flex-col gap-2">
              {items.map((it) => (
                <li key={it} className="border-b border-hair pb-2 text-[16px] leading-[1.45] text-ink-2">{it}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
