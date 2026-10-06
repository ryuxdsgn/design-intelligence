"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Fades its children up once, the first time they scroll into view. Purely presentational:
 * content is only hidden once JavaScript runs, so it stays readable without it; reduced motion turns it off.
 */
export function Reveal({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState<boolean | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    setShown(false);
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShown(true);
          io.disconnect();
        }
      },
      { rootMargin: "0px 0px -10% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={ref} data-shown={shown === null ? undefined : String(shown)} className={`reveal ${className}`}>
      {children}
    </div>
  );
}
