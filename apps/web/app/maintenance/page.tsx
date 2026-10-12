import type { Metadata } from "next";
import { GUTTER, Mark, REPO } from "@/components/site";

/* Shown for every page while middleware.ts has MAINTENANCE on. Kept out of search results. */
export const metadata: Metadata = {
  title: "RYUX",
  description: "ryux.design is being reworked.",
  robots: { index: false, follow: false },
};

export default function Maintenance() {
  return (
    <main className={`${GUTTER} flex min-h-svh flex-col justify-center gap-8 py-16`}>
      <p><Mark size={32} /><span className="sr-only">RYUX</span></p>
      <div className="flex max-w-[560px] flex-col gap-4">
        <h1 className="text-[min(40px,10vw)] leading-[1.05] sm:text-[48px]">We&apos;re reworking this site.</h1>
        <p className="text-[17px] leading-[1.55] text-ink-2">
          ryux.design is offline while its design and content are redone. RYUX itself is open source and still works.
        </p>
      </div>
      <a href={REPO} className="inline-flex min-h-11 items-center gap-2 self-start text-[16px] font-medium underline underline-offset-4">
        RYUX on GitHub
      </a>
    </main>
  );
}
