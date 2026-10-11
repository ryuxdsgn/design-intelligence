"use client";

import { useEffect } from "react";

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
