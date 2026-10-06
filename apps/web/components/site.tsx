import Link from "next/link";

export const REPO = "https://github.com/ryuxdsgn/design-intelligence";
export const DOCS = `${REPO}/blob/main/GUIDE.md`;

const NAV = [
  { label: "Proof", href: "/#proof" },
  { label: "Use cases", href: "/#cases" },
  { label: "How it works", href: "/#how" },
  { label: "Evidence", href: "/#evidence" },
  { label: "Benchmarks", href: "/benchmarks" },
  { label: "Docs", href: DOCS },
];

/** Page gutter shared by every section, so edges line up across the site. */
export const GUTTER = "mx-auto w-full max-w-[1440px] px-5 sm:px-10 lg:px-20";

export function GitHubIcon({ className = "" }: { className?: string }) {
  return (
    <svg className={className} width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12 .5a12 12 0 0 0-3.8 23.4c.6.1.8-.3.8-.6v-2.2c-3.3.7-4-1.4-4-1.4-.6-1.4-1.4-1.8-1.4-1.8-1-.7.1-.7.1-.7 1.2.1 1.8 1.2 1.8 1.2 1 1.8 2.8 1.3 3.5 1 .1-.8.4-1.3.7-1.6-2.7-.3-5.5-1.3-5.5-5.9 0-1.3.5-2.4 1.2-3.2-.1-.3-.5-1.5.1-3.2 0 0 1-.3 3.3 1.2a11.5 11.5 0 0 1 6 0C17.3 4.7 18.3 5 18.3 5c.6 1.7.2 2.9.1 3.2.8.8 1.2 1.9 1.2 3.2 0 4.6-2.8 5.6-5.5 5.9.4.4.8 1.1.8 2.2v3.3c0 .3.2.7.8.6A12 12 0 0 0 12 .5Z" />
    </svg>
  );
}

export function Arrow({ down = false }: { down?: boolean }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      {down ? <path d="M12 5v14m-6-6 6 6 6-6" /> : <path d="M5 12h14m-6-6 6 6-6 6" />}
    </svg>
  );
}

/* The RYUX mark from the brand sheet: four strokes that stop short of the center. */
const MARK_STROKES = [
  { x: 0.52, y: 1.115, d: "M0 21.87l22.14-21.87 73.03499 72.9-21.95997 22.00501-73.21502-73.03501z", accent: false },
  { x: 103.66, y: 1.115, d: "M95.44498 21.87l-22.31998-21.87-73.125 72.81001 22.22998 22.095 73.215-73.03501z", accent: true },
  { x: 0.52, y: 107.99, d: "M0 73.17l22.18501 22.095 72.945-72.99002-21.96-22.27498-73.17001 73.17z", accent: false },
  { x: 103.66, y: 107.99, d: "M95.44498 73.17l-22.22998 22.095-73.215-72.99002 22.14-22.27498 73.30498 73.17z", accent: false },
];

export function Mark({ size = 24, night = false }: { size?: number; night?: boolean }) {
  return (
    <svg width={size} height={size} viewBox="0 0 200 204" aria-hidden>
      {MARK_STROKES.map((s) => (
        <path
          key={s.d}
          d={s.d}
          transform={`translate(${s.x} ${s.y})`}
          fill={s.accent ? "#4F42F4" : night ? "#F5F6F8" : "#0B162B"}
        />
      ))}
    </svg>
  );
}

/** Small label that opens a section. Sentence case, set by the caller. */
export function Eyebrow({ children, night = false }: { children: React.ReactNode; night?: boolean }) {
  return <p className={`text-[15px] font-medium ${night ? "text-night-sub" : "text-muted"}`}>{children}</p>;
}

export function SiteHeader() {
  return (
    <header className="border-b border-hair">
      <div className={`${GUTTER} flex items-center justify-between gap-6 py-5`}>
        <Link href="/" className="flex items-center gap-2.5" aria-label="RYUX home">
          <Mark size={26} />
          <span className="text-[21px] font-bold tracking-[-0.01em]">RYUX</span>
        </Link>
        <nav aria-label="Main" className="hidden items-center gap-9 text-[15px] text-ink-2 lg:flex">
          {NAV.map((n) => (
            <a key={n.label} href={n.href} className="hover:text-ink">
              {n.label}
            </a>
          ))}
        </nav>
        <a
          href={REPO}
          className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-hair bg-white px-4 text-[15px] font-medium hover:border-ink"
        >
          <GitHubIcon />
          GitHub
        </a>
      </div>
      <nav aria-label="Sections" className={`${GUTTER} flex gap-6 overflow-x-auto pb-4 text-[15px] text-ink-2 lg:hidden`}>
        {NAV.map((n) => (
          <a key={n.label} href={n.href} className="whitespace-nowrap py-1 hover:text-ink">
            {n.label}
          </a>
        ))}
      </nav>
    </header>
  );
}

const FOOTER = [
  {
    title: "Product",
    links: [
      { label: "Benchmarks", href: "/benchmarks" },
      { label: "Install", href: "/#try" },
      { label: "npm package", href: "https://www.npmjs.com/package/@ryuxdsgn/ryux" },
    ],
  },
  {
    title: "Resources",
    links: [
      { label: "Docs", href: DOCS },
      { label: "Design rules", href: `${REPO}/blob/main/docs/design-rules.md` },
      { label: "Showcase", href: `${REPO}/blob/main/docs/showcase.md` },
    ],
  },
  {
    title: "Project",
    links: [
      { label: "GitHub", href: REPO },
      { label: "Issues", href: `${REPO}/issues` },
      { label: "License (MIT)", href: `${REPO}/blob/main/LICENSE` },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="border-t border-hair">
      <div className={`${GUTTER} grid gap-12 py-14 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr]`}>
        <div className="flex flex-col gap-4">
          <p className="flex items-center gap-2.5 text-[19px] font-bold"><Mark size={22} /> RYUX</p>
          <p className="max-w-[300px] text-[15px] leading-[1.55] text-muted">
            Design intelligence for AI agents and designers. Early access, free.
          </p>
        </div>
        {FOOTER.map((col) => (
          <nav key={col.title} aria-label={col.title} className="flex flex-col gap-3 text-[15px]">
            <p className="font-semibold">{col.title}</p>
            {col.links.map((l) =>
              l.href.startsWith("/") ? (
                <Link key={l.label} href={l.href} className="text-muted hover:text-ink">{l.label}</Link>
              ) : (
                <a key={l.label} href={l.href} className="text-muted hover:text-ink">{l.label}</a>
              ),
            )}
          </nav>
        ))}
      </div>
    </footer>
  );
}
