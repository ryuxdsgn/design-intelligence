import Link from "next/link";

export const REPO = "https://github.com/ryuxdsgn/design-intelligence";
export const DOCS = `${REPO}/blob/main/GUIDE.md`;

const NAV = [
  { label: "Product", href: "/#what" },
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

/** Small mono label that opens a section. `night` is for dark sections. */
export function Eyebrow({ children, night = false }: { children: React.ReactNode; night?: boolean }) {
  return (
    <p className={`font-mono text-[13px] tracking-[0.12em] ${night ? "text-night-sub" : "text-muted"}`}>{children}</p>
  );
}

export function SiteHeader() {
  return (
    <header className="border-b border-hair">
      <div className={`${GUTTER} flex items-center justify-between gap-6 py-5`}>
        <Link href="/" className="flex items-baseline gap-3" aria-label="RYUX home">
          <span className="text-xl font-bold tracking-[0.15em]">RYUX</span>
          <span className="hidden font-mono text-[13px] text-muted sm:inline">design intelligence</span>
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
          className="inline-flex min-h-11 items-center gap-2 rounded-md border border-ink px-4 text-[15px] font-medium hover:bg-ink hover:text-paper"
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

export function SiteFooter() {
  return (
    <footer className="border-t border-hair">
      <div className={`${GUTTER} flex flex-col gap-3 py-10 text-[15px] text-muted sm:flex-row sm:items-center sm:justify-between`}>
        <p>RYUX · MIT licensed · Early access, free</p>
        <nav aria-label="Footer" className="flex flex-wrap gap-6">
          <a href={REPO} className="hover:text-ink">GitHub</a>
          <a href={DOCS} className="hover:text-ink">Docs</a>
          <Link href="/benchmarks" className="hover:text-ink">Benchmarks</Link>
          <a href={`${REPO}/blob/main/LICENSE`} className="hover:text-ink">License</a>
        </nav>
      </div>
    </footer>
  );
}
