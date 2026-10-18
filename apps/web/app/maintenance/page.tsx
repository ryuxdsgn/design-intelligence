import type { Metadata } from "next";
import { GUTTER, REPO } from "@/components/site";
import { ReworkCanvas } from "@/components/rework-canvas";

/* Shown for every page while middleware.ts has MAINTENANCE on. Kept out of search results. */
export const metadata: Metadata = {
  title: "RYUX",
  description: "ryux.design is being reworked.",
  robots: { index: false, follow: false },
};

export default function Maintenance() {
  return (
    <main className={`${GUTTER} grid min-h-svh content-center items-center gap-12 overflow-x-clip py-16 lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] lg:gap-20`}>
      <div className="flex flex-col gap-8">
        <div className="flex max-w-[560px] flex-col gap-4">
          <h1 className="rise text-[min(40px,10vw)] leading-[1.05] sm:text-[48px]">We&apos;re reworking this site.</h1>
          <p className="rise text-[17px] leading-[1.55] text-ink-2 [--d:120ms]">
            ryux.design is offline while its design and content are redone. RYUX itself is open source and still works.
          </p>
        </div>
        <a href={REPO} className="rise inline-flex min-h-11 items-center gap-2 self-start text-[16px] font-medium underline underline-offset-4 [--d:240ms]">
          RYUX on GitHub
        </a>
      </div>
      <div className="rise relative [--d:200ms]">
        <div aria-hidden className="absolute -inset-[12%] -z-10 rounded-full bg-[radial-gradient(closest-side,rgb(60_196_183/0.14),transparent)] blur-2xl" />
        <ReworkCanvas />
      </div>
    </main>
  );
}
