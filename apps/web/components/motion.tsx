"use client";

import { useEffect, useRef, useState } from "react";

const query = (q: string) => typeof window !== "undefined" && window.matchMedia(q).matches;

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
 * Sets data-tone="night" on the site header while a dark section is under it, so the glass header
 * turns dark instead of greying out over navy. Renders nothing.
 */
export function HeaderTone({ ids }: { ids: string[] }) {
  useEffect(() => {
    const header = document.querySelector<HTMLElement>(".site-header");
    if (!header) return;
    const under = new Set<string>();
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) e.isIntersecting ? under.add(e.target.id) : under.delete(e.target.id);
        header.dataset.tone = under.size ? "night" : "day";
      },
      { rootMargin: "0px 0px -92% 0px" },
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
        const span = o.offsetHeight - window.innerHeight * 0.8; // = distance: one pixel of scroll per pixel of travel
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
    <div ref={outer} data-scrub="on" style={{ height: `calc(80vh + ${distance}px)` }}>
      <div className="sticky top-[max(12vh,104px)] flex flex-col gap-5">
        <div className="relative">
          <div className="overflow-hidden [mask-image:linear-gradient(90deg,transparent,#000_40px,#000_calc(100%-40px),transparent)]">
            <div ref={track} data-active={active} className="will-change-transform">
              {children}
            </div>
          </div>
          <p aria-hidden className="glass-night glass-edge absolute top-3 left-3 z-10 rounded-full px-3.5 py-2 font-mono text-[13px] text-night-sub">
            <span className="text-night-text">{active + 1} / {steps.length}</span> · {steps[active].name}
          </p>
        </div>
        <p className="font-mono text-[13px] text-night-sub" aria-live="polite">
          <span className="sr-only">{active + 1} / {steps.length} · {steps[active].name}. </span>
          <span className="font-sans text-[15px]">{steps[active].caption}</span>
        </p>
      </div>
    </div>
  );
}
