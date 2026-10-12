import Link from "next/link";

export const REPO = "https://github.com/ryuxdsgn/design-intelligence";
export const DOCS = `${REPO}/blob/main/GUIDE.md`;

const NAV = [
  { label: "Proof", href: "/#proof" },
  { label: "How it works", href: "/#how" },
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
    <svg className="arrow" data-dir={down ? "down" : "right"} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      {down ? <path d="M12 5v14m-6-6 6 6 6-6" /> : <path d="M5 12h14m-6-6 6 6-6 6" />}
    </svg>
  );
}

/* The RYUX mark: an R whose leg runs on as one arm of the X, the other arm in teal. */
const MARK_RX =
  "M102.4 92.16L409.6 389.12L378.88 419.84L250.88 291.84L220.16 322.56L317.44 419.84H261.12L168.96 327.68H143.36V419.84H102.4V92.16ZM143.36 220.16H194.56L235.52 261.12L194.56 302.08H143.36V220.16Z";
const MARK_ARM = "M276.48 230.4L378.88 128L409.6 158.72L307.2 261.12L276.48 230.4Z";

/** `size` is the height in px; the mark is slightly taller than wide. */
export function Mark({ size = 24, night = false }: { size?: number; night?: boolean }) {
  return (
    <svg width={(size * 307.2) / 327.68} height={size} viewBox="102.4 92.16 307.2 327.68" aria-hidden>
      <path d={MARK_RX} fillRule="evenodd" clipRule="evenodd" fill={night ? "#F5F6F8" : "#EEF1F4"} />
      <path d={MARK_ARM} fill="#188B83" />
    </svg>
  );
}

/** Small label that opens a section. Sentence case, set by the caller. */
export function Eyebrow({ children, night = false }: { children: React.ReactNode; night?: boolean }) {
  return <p className={`font-mono text-[13px] ${night ? "text-night-sub" : "text-accent"}`}>{children}</p>;
}

export function SiteHeader() {
  return (
    <header className="site-header glass">
      <div className={`${GUTTER} flex items-center justify-between gap-6 py-3`}>
        <Link href="/" className="flex items-center gap-2.5" aria-label="RYUX home">
          <Mark size={26} />
        </Link>
        <nav aria-label="Main" className="hidden items-center gap-9 text-[15px] text-ink-2 lg:flex">
          {NAV.map((n) => (
            <a key={n.label} href={n.href} className="nav-link hover:text-ink">
              {n.label}
            </a>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <a
            href={REPO}
            className="tactile hidden min-h-11 items-center gap-2 rounded-lg px-3 text-[15px] font-medium text-ink-2 hover:text-ink sm:inline-flex"
          >
            <GitHubIcon />
            GitHub
          </a>
          <a href="/#try" className="tactile inline-flex min-h-11 items-center rounded-lg bg-accent px-4 text-[15px] font-semibold text-paper">
            Install
          </a>
        </div>
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
      { label: "npm package", href: "https://www.npmjs.com/package/@ryuxdsgn/design-intelligence" },
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
          <p><Mark size={22} /><span className="sr-only">RYUX</span></p>
          <p className="max-w-[300px] text-[15px] leading-[1.55] text-muted">
            Design intelligence that asks before it guesses. Early access, free.
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
