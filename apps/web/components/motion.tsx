"use client";

import { useEffect, useRef, useState } from "react";

const query = (q: string) => typeof window !== "undefined" && window.matchMedia(q).matches;

/**
 * Leans its children toward the pointer, at most 4 degrees. Only with a fine pointer and no reduced-motion
 * preference; otherwise it renders flat and never listens.
 */
export function Tilt({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || !query("(pointer: fine)") || query("(prefers-reduced-motion: reduce)")) return;
    let frame = 0;
    const move = (e: PointerEvent) => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const r = el.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - 0.5;
        const y = (e.clientY - r.top) / r.height - 0.5;
        el.style.setProperty("--ry", `${(x * 8).toFixed(2)}deg`);
        el.style.setProperty("--rx", `${(-y * 8).toFixed(2)}deg`);
      });
    };
    const leave = () => {
      cancelAnimationFrame(frame);
      el.style.setProperty("--rx", "0deg");
      el.style.setProperty("--ry", "0deg");
    };
    el.addEventListener("pointermove", move);
    el.addEventListener("pointerleave", leave);
    return () => {
      cancelAnimationFrame(frame);
      el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerleave", leave);
    };
  }, []);

  return (
    <div ref={ref} className={`tilt ${className}`}>
      {children}
    </div>
  );
}

/**
 * Marks the main-nav link of the section being read (data-active), so the header shows where you are.
 * Renders nothing; it only reads the page's own sections and links.
 */
export function SectionSpy({ ids }: { ids: string[] }) {
  useEffect(() => {
    const links = new Map(ids.map((id) => [id, document.querySelectorAll<HTMLElement>(`a.nav-link[href$="#${id}"]`)]));
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          links.get(e.target.id)?.forEach((a) => a.setAttribute("data-active", String(e.isIntersecting)));
        }
      },
      { rootMargin: "-45% 0px -50% 0px" },
    );
    for (const id of ids) {
      const el = document.getElementById(id);
      if (el) io.observe(el);
    }
    return () => io.disconnect();
  }, [ids]);
  return null;
}

/**
 * Turns vertical scroll into a horizontal pass over a row of screens: the row sticks while the page scrolls
 * and moves one screen at a time, with a "2 / 6 · Processing" readout. Only at 1024 and wider without a
 * reduced-motion preference; otherwise the row simply scrolls sideways.
 */
export function ScrubStrip({ children, steps }: { children: React.ReactNode; steps: { name: string; caption: string }[] }) {
  const outer = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const [on, setOn] = useState(false);
  const [distance, setDistance] = useState(0);
  const [active, setActive] = useState(0);

  useEffect(() => {
    const decide = () => setOn(query("(min-width: 1024px)") && !query("(prefers-reduced-motion: reduce)"));
    decide();
    window.addEventListener("resize", decide);
    return () => window.removeEventListener("resize", decide);
  }, []);

  useEffect(() => {
    if (!on) return;
    const o = outer.current, t = track.current;
    if (!o || !t) return;
    const measure = () => setDistance(Math.max(0, t.scrollWidth - o.clientWidth));
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(t);
    ro.observe(o);
    let frame = 0;
    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const r = o.getBoundingClientRect();
        const span = o.offsetHeight - window.innerHeight * 0.8; // = 2 x distance: two pixels of scroll per pixel of travel
        const p = Math.min(1, Math.max(0, -r.top / Math.max(1, span)));
        t.style.transform = `translate3d(${-p * Math.max(0, t.scrollWidth - o.clientWidth)}px, 0, 0)`;
        setActive(Math.min(steps.length - 1, Math.round(p * (steps.length - 1))));
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      ro.disconnect();
      window.removeEventListener("scroll", onScroll);
      t.style.transform = "";
    };
  }, [on, steps.length]);

  if (!on) {
    return <div className="-mx-5 overflow-x-auto px-5 pb-3 sm:-mx-10 sm:px-10 lg:mx-0 lg:px-0">{children}</div>;
  }
  return (
    <div ref={outer} data-scrub="on" style={{ height: `calc(80vh + ${distance * 2}px)` }}>
      <div className="sticky top-[max(12vh,104px)] flex flex-col gap-5">
        <div className="overflow-hidden [mask-image:linear-gradient(90deg,transparent,#000_40px,#000_calc(100%-40px),transparent)]">
          <div ref={track} data-active={active} className="will-change-transform">
            {children}
          </div>
        </div>
        <p className="font-mono text-[13px] text-night-sub" aria-live="polite">
          <span className="text-night-text">{active + 1} / {steps.length}</span> · {steps[active].name}
          <span className="ml-3 font-sans text-[15px] text-night-sub">{steps[active].caption}</span>
        </p>
      </div>
    </div>
  );
}
