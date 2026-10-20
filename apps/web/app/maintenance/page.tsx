import type { Metadata } from "next";
import { GUTTER, REPO } from "@/components/site";
import { ReworkCanvas } from "@/components/rework-canvas";

/* Shown for every page while middleware.ts has MAINTENANCE on. Kept out of search results. */
export const metadata: Metadata = {
  title: "RYUX",
  description: "ryux.design is being reworked.",
  robots: { index: false, follow: false },
};

/* Centred, and above the fold where the window allows: the board's width follows the window's height,
   so the heading, the link, and the whole board fit in one screen (from about 1280 × 720; on a phone, the board starts in view). */
export default function Maintenance() {
  return (
    <main className={`${GUTTER} flex min-h-svh flex-col items-center justify-center gap-6 overflow-clip py-6 text-center`}>
      <div className="flex max-w-[900px] flex-col items-center gap-3">
        <h1 className="rise text-balance text-[min(40px,10vw)] leading-[1.05] sm:text-[48px]">A new home for RYUX is in the works.</h1>
        <p className="rise max-w-[640px] text-pretty text-[17px] leading-[1.55] text-ink-2 [--d:120ms]">
          ryux.design is currently being built as we refine the design and content. In the meantime, RYUX remains open source and ready to use.
        </p>
        <a href={REPO} className="rise inline-flex min-h-11 items-center gap-2 text-[16px] font-medium underline underline-offset-4 [--d:240ms]">
          RYUX on GitHub
        </a>
      </div>
      <div className="rise relative w-[min(100%,620px,calc((100svh-330px)*0.98))] min-w-[min(100%,340px)] [--d:200ms]">
        <div aria-hidden className="absolute -inset-[12%] -z-10 rounded-full bg-[radial-gradient(closest-side,rgb(60_196_183/0.14),transparent)] blur-2xl" />
        <ReworkCanvas />
      </div>
    </main>
  );
}
