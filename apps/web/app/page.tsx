import { WaitlistForm } from "@/components/waitlist-form";

const REPO = "https://github.com/ryuxdsgn/design-intelligence";

function SearchIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden>
      <circle cx="11" cy="11" r="7" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  );
}

function QrIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="3" height="3" rx="1" />
      <rect x="18" y="18" width="3" height="3" rx="1" />
      <rect x="14" y="18" width="3" height="3" rx="1" />
      <rect x="18" y="14" width="3" height="3" rx="1" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg className="text-ok" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <circle cx="12" cy="12" r="9" />
      <path d="m8.5 12.5 2.5 2.5 4.5-5" />
    </svg>
  );
}

function Compare({
  title,
  note,
  before,
  after,
  beforeAlt,
  afterAlt,
}: {
  title: string;
  note: string;
  before: string;
  after: string;
  beforeAlt: string;
  afterAlt: string;
}) {
  return (
    <figure className="m-0">
      <figcaption className="mb-4 flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <span className="font-semibold text-ink">{title}</span>
        <span className="text-sm text-sub">{note}</span>
      </figcaption>
      <div className="grid grid-cols-2 gap-4">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={before} alt={beforeAlt} loading="lazy" className="w-full self-start rounded-xl border border-hair" />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={after} alt={afterAlt} loading="lazy" className="w-full self-start rounded-xl border border-hair" />
      </div>
      <div className="mt-3 grid grid-cols-2 gap-4 text-[13px] text-sub">
        <span>Before (no ryux)</span>
        <span>After (ryux)</span>
      </div>
    </figure>
  );
}

const INSIDE = [
  {
    title: "Nine MCP tools",
    body: "Research (search_screens, get_flow, compare_apps…), audit (audit_ui, audit_copy, heuristic_eval, delivery_gate), and a design bridge. Every result carries a screen_id, app, version, and capture date.",
  },
  {
    title: "Ryux, a designer's reasoning",
    body: "107 rules in 14 modular skills, from product thinking to visual QA. Hard Gates, purpose gates instead of style bans, and a 10-area Delivery Gate before you ship.",
  },
  {
    title: "Install by group",
    body: "npx ryux-rules drops the skills into Claude Code, Cursor, or AGENTS.md. Pick the groups you need (foundation, ux, ui, engineering, quality), and agents load only what a task needs.",
  },
];

export default function Home() {
  return (
    <>
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
        <a href="/" className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-accent text-sm font-extrabold text-white">
            r
          </span>
          <span className="text-lg font-bold">ryux</span>
        </a>
        <nav className="flex items-center gap-5 text-sm font-medium text-sub sm:gap-6">
          <a href="#proof" className="hidden hover:text-ink sm:inline">
            Proof
          </a>
          <a href="#inside" className="hidden hover:text-ink sm:inline">
            What's inside
          </a>
          <a href={REPO} className="hover:text-ink">
            GitHub
          </a>
          <a href="#waitlist" className="rounded-lg bg-accent px-4 py-2 font-semibold text-white hover:opacity-90">
            Waitlist
          </a>
        </nav>
      </header>

      <main>
        <section className="mx-auto max-w-6xl px-6 pt-12 pb-20 sm:pt-16">
          <div className="grid items-center gap-12 lg:grid-cols-[1fr_400px]">
            <div>
              <div className="flex items-center gap-3">
                <span className="h-[3px] w-7 rounded-full bg-accent" />
                <span className="text-xs font-bold uppercase tracking-[0.12em] text-accent">
                  MCP + design rules for AI agents
                </span>
              </div>
              <h1 className="mt-6 text-4xl font-extrabold leading-[1.05] tracking-tight sm:text-5xl">
                Every design decision,
                <br />
                <span className="text-accent">backed by a real screen.</span>
              </h1>
              <p className="mt-6 max-w-xl text-lg leading-relaxed text-sub">
                ryux serves your AI agent curated screens from real Indonesian apps over MCP, plus an
                anti-slop ruleset. It has to cite what it copies.
              </p>
              <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-4">
                <a href="#waitlist" className="rounded-xl bg-accent px-6 py-3.5 text-[15px] font-bold text-white hover:opacity-90">
                  Join the waitlist
                </a>
                <a href="#proof" className="inline-flex items-center gap-1.5 text-[15px] font-semibold text-ink">
                  See the difference <span aria-hidden>→</span>
                </a>
              </div>
              <p className="mt-6 text-sm text-sub">
                Free in early access · MIT-licensed rules · sample data today, real screens rolling in.
              </p>
            </div>

            <div className="rounded-2xl border border-hair bg-white p-5">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-accent-soft px-3 py-1.5 text-[13px] font-bold text-accent">
                  <SearchIcon /> search_screens
                </span>
                <span className="text-[13px] text-sub">1 result</span>
              </div>
              <div className="mt-4 rounded-xl border border-hair p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-[82px] w-[50px] items-center justify-center rounded-[10px] bg-card text-ink">
                    <QrIcon />
                  </div>
                  <div className="flex-1">
                    <p className="font-bold">Warung Kopi Contoh</p>
                    <p className="text-[13px] text-sub">Checkout · QRIS</p>
                  </div>
                  <CheckIcon />
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {["scr_a3f091", "v4.20.1", "24 Sep 2026"].map((t) => (
                    <span key={t} className="rounded-md border border-hair bg-card px-2 py-1 text-xs text-sub">
                      {t}
                    </span>
                  ))}
                </div>
                <p className="mt-3 text-[13px] leading-relaxed text-sub">
                  Designer note: QRIS on top for small amounts; fees shown before you commit.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section id="proof" className="border-y border-hair bg-white">
          <div className="mx-auto max-w-6xl px-6 py-16">
            <h2 className="text-2xl font-bold sm:text-3xl">See the difference</h2>
            <p className="mt-3 max-w-2xl text-sub">
              Same brief, built in pen.dev. The “after” applies ryux-rules plus ryux data: specific, honest,
              and Indonesian. Reference screens are in Indonesian, on purpose.
            </p>
            <div className="mt-10 grid gap-12 md:grid-cols-2">
              <Compare
                title="ryux-ui"
                note="palette, spacing, consistency, states"
                before="/compare/ui-before.png"
                after="/compare/ui-after.png"
                beforeAlt="Generic payment screen: sparkle logo, made-up user numbers, global methods, dollar pricing, low-contrast text"
                afterAlt="ryux checkout: order summary, transparent fees, QRIS with a verification-time note, Rupiah, screen_id evidence"
              />
              <Compare
                title="ryux-local"
                note="QRIS, virtual account, fees, Rupiah"
                before="/compare/local-before.png"
                after="/compare/local-after.png"
                beforeAlt="Global card payment in dollars with foreign methods and no local pattern"
                afterAlt="BCA Virtual Account: countdown, VA number with copy button, transparent admin fee, Rupiah, numbered steps"
              />
            </div>
          </div>
        </section>

        <section id="inside" className="mx-auto max-w-6xl px-6 py-16">
          <h2 className="text-2xl font-bold sm:text-3xl">What's inside</h2>
          <div className="mt-8 grid gap-5 md:grid-cols-3">
            {INSIDE.map((c) => (
              <div key={c.title} className="rounded-2xl border border-hair bg-card p-6">
                <h3 className="text-lg font-bold">{c.title}</h3>
                <p className="mt-2 text-[15px] leading-relaxed text-sub">{c.body}</p>
              </div>
            ))}
          </div>
        </section>

        <section id="install" className="border-y border-hair bg-white">
          <div className="mx-auto max-w-6xl px-6 py-16">
            <h2 className="text-2xl font-bold sm:text-3xl">Install</h2>
            <p className="mt-3 max-w-2xl text-sub">
              Drop the rules into your agent, then connect it to the reference data over MCP.
            </p>
            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              <div>
                <p className="mb-2 text-sm font-semibold">1. Install ryux-rules</p>
                <pre className="overflow-x-auto rounded-xl bg-ink p-4 text-sm text-white">
                  <code>npx ryux-rules</code>
                </pre>
              </div>
              <div>
                <p className="mb-2 text-sm font-semibold">2. Connect the MCP server</p>
                <pre className="overflow-x-auto rounded-xl bg-ink p-4 text-sm text-white">
                  <code>claude mcp add --transport http ryux https://mcp.ryux.design/mcp</code>
                </pre>
              </div>
            </div>
            <p className="mt-4 text-sm text-sub">
              It's MIT licensed, so you can read the ruleset and run it yourself.{" "}
              <a href={REPO} className="font-semibold text-accent hover:underline">
                Browse the repo
              </a>
              .
            </p>
          </div>
        </section>

        <section id="waitlist" className="mx-auto max-w-6xl px-6 py-20">
          <div className="max-w-2xl">
            <h2 className="text-2xl font-bold sm:text-3xl">Be first when production data opens</h2>
            <p className="mt-3 text-sub">
              Today the data is sample data and the ruleset is free to use. Leave your email and we'll tell you when
              reviewed production screens and paid plans are ready.
            </p>
            <div className="mt-8">
              <WaitlistForm />
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-hair">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-6 py-8 text-sm text-sub sm:flex-row sm:items-center sm:justify-between">
          <p>© 2026 ryux.design · MIT</p>
          <nav className="flex gap-5">
            <a href={REPO} className="hover:text-ink">
              GitHub
            </a>
            <a href={`${REPO}/blob/main/LICENSE`} className="hover:text-ink">
              License
            </a>
            <a href={`${REPO}/blob/main/docs/design-rules.md`} className="hover:text-ink">
              ryux-rules
            </a>
          </nav>
        </div>
      </footer>
    </>
  );
}
