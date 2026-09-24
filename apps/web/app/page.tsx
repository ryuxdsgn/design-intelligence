import { WaitlistForm } from "@/components/waitlist-form";

const REPO = "https://github.com/ryuxdsgn/ryux";

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
    title: "ryux-rules, four layers",
    body: "45 rules: anti-slop filter (RX-C), usability and accessibility heuristics (RX-H), applied UX patterns from NNGroup research (RX-N), and Indonesian patterns and copy (RX-L). Plus a PASS/FAIL Delivery Gate.",
  },
  {
    title: "Install per concern",
    body: "npx ryux-rules drops the rules into Claude Code, Cursor, or AGENTS.md. You pick only the concerns you need (ui, copy, a11y, ux, local), the way you'd pick skills.",
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
        <section className="mx-auto max-w-6xl px-6 pt-12 pb-20 sm:pt-20">
          <span className="inline-flex items-center gap-2 rounded-full bg-accent-soft px-3 py-1 text-xs font-semibold text-accent">
            Early access · free
          </span>
          <h1 className="mt-6 max-w-3xl text-4xl font-extrabold leading-[1.08] tracking-tight sm:text-6xl">
            Evidence-based UI references for AI agents.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-sub">
            ryux serves curated screens and flows from real Indonesian apps over MCP, with an open-source
            anti-slop ruleset. Your agent designs from real examples, and it has to cite them.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-4">
            <a href="#waitlist" className="rounded-xl bg-accent px-6 py-3.5 text-[15px] font-bold text-white hover:opacity-90">
              Join the waitlist
            </a>
            <a href="#install" className="text-[15px] font-semibold text-ink">
              Install ryux-rules →
            </a>
          </div>
          <p className="mt-6 max-w-xl text-sm text-sub">
            Free during early access. The data is sample data today. Production screens roll in reviewed by
            hand, never auto-published.
          </p>
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
