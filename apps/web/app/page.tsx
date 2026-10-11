import Image from "next/image";
import Link from "next/link";
import { CopyCommand } from "@/components/copy-command";
import { Reveal } from "@/components/reveal";
import { Cases } from "@/components/cases";
import { Pin, PinAt, Ring, type Tone } from "@/components/markup";
import { SectionSpy } from "@/components/motion";
import { Scoreboard } from "@/components/scoreboard";
import { WaitlistForm } from "@/components/waitlist-form";
import { Arrow, DOCS, Eyebrow, GUTTER, REPO, SiteFooter, SiteHeader } from "@/components/site";

/* Review canvas: the page is a design tool's board. Real screens sit on it like frames, RYUX's findings
   are comments pinned to them, and the selected frame is the one being read. Only the marks move. */

type Mark = { x: number; y: number; ring?: [number, number, number, number]; tag: string; body: string };

/* The orders-list run, as people would see it: made without RYUX (one screen, with counts, deadlines and
   a pickup time nobody gave) and with RYUX from the same prompt (the default list, one of nine screens).
   x and y are % of each image. */
const WITHOUT: Mark[] = [
  { x: 4, y: 23.5, ring: [16.3, 23.5, 14, 3.4], tag: "Invented", body: "Order counts, 248, 12 and 3, for a store that does not exist." },
  { x: 65, y: 27.9, ring: [83.4, 27.9, 30, 3], tag: "Invented", body: "Ship-by deadlines and an Overdue group: a rule nobody gave." },
  { x: 58, y: 47.5, ring: [79.6, 47.5, 36, 3], tag: "Invented", body: "A 5 PM carrier pickup nobody mentioned." },
];
const WITH: Mark[] = [
  { x: 3.5, y: 11.3, tag: "Find", body: "Search by order number or customer, and filter by status." },
  { x: 52, y: 24.5, ring: [23, 24.5, 40, 3.2], tag: "Status", body: "Every order says in words whether it is paid and whether it has shipped." },
  { x: 22, y: 96.8, ring: [50, 96.8, 46, 2.6], tag: "States", body: "Loading more, plus empty, no matches, couldn't load and offline screens." },
];

/* The transaction-detail benchmark, pair 2: the screen made without RYUX and the six RYUX designed,
   cut from its exported board. 320 is the narrow-width check the board names; the others are 390 wide. */
const TD_WITHOUT: Mark[] = [
  { x: 62, y: 69.4, ring: [79, 69.4, 24, 3.4], tag: "Missing", body: "Only Completed: no screen for a payment still processing or one that fails." },
  { x: 5, y: 79.3, ring: [48, 79.3, 70, 3.6], tag: "Invented", body: "“Report it within 30 days”: a rule nobody decided." },
  { x: 95, y: 84.6, ring: [75.5, 87.4, 44, 5.4], tag: "Invented", body: "Save PDF, which nobody asked for." },
];
const STATES = [
  { src: "/proof/states/1-completed.png", w: 502, h: 1239, name: "Completed", caption: "The full breakdown, a receipt to share, and a way to report a problem." },
  { src: "/proof/states/2-processing.png", w: 503, h: 1315, name: "Processing", caption: "Says the payment is on its way and asks people not to pay again." },
  { src: "/proof/states/3-failed.png", w: 503, h: 1287, name: "Failed", caption: "Says it didn't go through, and what to do if money left the account." },
  { src: "/proof/states/4-loading.png", w: 502, h: 1090, name: "Loading", caption: "Holds the layout while the details load, so nothing jumps." },
  { src: "/proof/states/5-couldnt-load.png", w: 503, h: 1090, name: "Couldn't load", caption: "Offers Try again, and says reloading doesn't change the payment." },
  { src: "/proof/states/6-narrow.png", w: 413, h: 1413, name: "320 wide", narrow: true, caption: "The narrowest phone, with a long merchant name and a large amount." },
];

const CAPABILITIES = [
  { name: "Analyze", body: "Reads the screen you already have and separates what it sees from what it is guessing." },
  { name: "Design", body: "Proposes the screen and writes down why: the options it compared and how sure it is." },
  { name: "Build", body: "Implements it in your stack without making up prices, limits, or API behavior." },
  { name: "Critique", body: "Lists what to change first, worst first, each with the reason and a fix." },
  { name: "QA", body: "Checks the build against the design at each width and state, and says what it could not check." },
];

/* Quoted from a real run (English transaction detail benchmark, pair 2). */
const RECEIPT = [
  { key: "Decision", value: "Amount + Fee = Total paid, shown in the card" },
  { key: "Evidence", value: "None" },
  { key: "Confidence", value: "Low" },
  { key: "Assumption", value: "[CONFIRM] The fee is charged on top of the amount. If the fee is taken out of the amount instead, the rows change." },
];

const INSTALL = [
  { label: "Any agent, through skills.sh", commands: ["npx skills add ryuxdsgn/design-intelligence"], inClaude: false },
  { label: "The RYUX CLI, which also writes DESIGN.md", commands: ["npx @ryuxdsgn/design-intelligence init --agent claude"], inClaude: false },
  {
    label: "As a Claude Code plugin, inside Claude Code",
    commands: ["/plugin marketplace add ryuxdsgn/design-intelligence", "/plugin install ryux@design-intelligence"],
    inClaude: true,
  },
];

const AGENTS = "Claude Code, Codex, Cursor, Gemini CLI, OpenCode, Cline, GitHub Copilot, Amp, Kimi Code, and Antigravity";

/** A frame on the board: a mono title above, like a design tool's frame label. The selected one gets the
    teal selection box with its four handles. */
function Frame({ title, count, tone, selected = false, className = "", children }: {
  title: string; count?: string; tone: "mark" | "accent" | "muted"; selected?: boolean; className?: string; children: React.ReactNode;
}) {
  const color = tone === "mark" ? "text-mark" : tone === "accent" ? "text-accent" : "text-muted";
  return (
    <figure className={`flex min-w-0 flex-col gap-2 ${className}`}>
      <figcaption className="flex items-baseline justify-between gap-2 font-mono text-[11px] sm:text-[12px]">
        <span className={color}>{title}</span>
        {count && <span className="text-muted">{count}</span>}
      </figcaption>
      <div className="relative">
        {children}
        {selected && (
          <span aria-hidden className="pointer-events-none absolute -inset-[3px] rounded-[9px] border-[1.5px] border-accent">
            {["-top-[5px] -left-[5px]", "-top-[5px] -right-[5px]", "-bottom-[5px] -left-[5px]", "-bottom-[5px] -right-[5px]"].map((p) => (
              <span key={p} className={`absolute size-2 border-[1.5px] border-accent bg-ink ${p}`} />
            ))}
          </span>
        )}
      </div>
    </figure>
  );
}

/** A review comment pinned on the board: who flagged it, and what. Glass, because a screen sits behind it. */
function Note({ tag, tone, children, className = "", style }: {
  tag: string; tone: "mark" | "accent"; children: React.ReactNode; className?: string; style?: React.CSSProperties;
}) {
  return (
    <div className={`note-in glass glass-edge w-[230px] rounded-[10px] p-3 ${className}`} style={style}>
      <p className={`flex items-center gap-2 font-mono text-[11px] ${tone === "mark" ? "text-mark" : "text-accent"}`}>
        <span aria-hidden className={`size-2 rounded-full ${tone === "mark" ? "bg-mark" : "bg-accent"}`} />
        RYUX · {tag}
      </p>
      <p className="mt-1.5 text-[13px] leading-[1.45] text-ink">{children}</p>
    </div>
  );
}

function Marks({ marks, tone, start }: { marks: Mark[]; tone: Tone; start: number }) {
  return (
    <>
      {marks.map((m, i) => (
        <div key={m.body}>
          {m.ring && <Ring x={m.ring[0]} y={m.ring[1]} w={m.ring[2]} h={m.ring[3]} tone={tone} delay={start + 100 + i * 280} />}
          <PinAt n={i + 1} x={m.x} y={m.y} tone={tone} delay={start + i * 280} />
        </div>
      ))}
    </>
  );
}

function Hero() {
  return (
    <section aria-labelledby="hero-title" className={`${GUTTER} grid items-center gap-10 py-10 [&>*]:min-w-0 lg:grid-cols-[minmax(0,1fr)_520px] lg:gap-14 lg:py-12 xl:grid-cols-[minmax(0,1fr)_560px]`}>
      <div className="flex flex-col gap-6">
        <Eyebrow>Design intelligence for AI agents</Eyebrow>
        <h1 id="hero-title" className="text-[min(44px,12vw)] leading-[1.02] sm:text-[60px] xl:text-[68px]">
          Understand before you{" "}
          <span className="whitespace-nowrap">
          <span className="relative inline-block">
            design
            <svg aria-hidden className="absolute -bottom-[0.16em] left-0 h-[0.14em] w-full overflow-visible" viewBox="0 0 100 10" preserveAspectRatio="none">
              <path d="M1 7 C 25 2, 60 2, 99 5" pathLength={1} fill="none" strokeWidth="3" strokeLinecap="round" className="ring-draw stroke-mark" style={{ animationDelay: "400ms" }} />
            </svg>
          </span>
          .
          </span>
        </h1>
        <p className="max-w-[500px] text-[17px] leading-[1.55] text-ink-2 sm:text-[18px]">
          RYUX is a skill you add to your AI agent. It has the agent design the screens people actually go through, like a
          list that is still loading or a page that fails to load, and nothing nobody asked for.
        </p>
        <div className="flex flex-col gap-4">
          <CopyCommand command="npx skills add ryuxdsgn/design-intelligence" primary />
          <a href="#proof" className="inline-flex min-h-11 items-center gap-1.5 self-start text-[16px] font-medium underline underline-offset-4">
            See the benchmark <Arrow down />
          </a>
        </div>
      </div>
      <HeroBoard />
    </section>
  );
}

/* The orders-list pair on the board, the RYUX frame selected, three of the findings pinned as comments. */
function HeroBoard() {
  const notes = [
    { m: WITHOUT[0], tone: "mark" as const, style: { left: "16%", top: "26%" }, delay: 500 },
    { m: WITHOUT[2], tone: "mark" as const, style: { left: "12%", top: "58%" }, delay: 1000 },
    { m: WITH[1], tone: "accent" as const, style: { left: "58%", top: "36%" }, delay: 1500 },
  ];
  return (
    <figure aria-label="The same prompt run twice: an orders list made without RYUX and with RYUX" className="mx-auto flex w-full max-w-[560px] flex-col gap-4">
      <div className="canvas-grid relative rounded-2xl border border-hair p-5 sm:p-7">
        <div className="grid grid-cols-2 items-start gap-5 sm:gap-8">
          <Frame title="Without RYUX" count="1 screen" tone="mark">
            <Image src="/cases/or-without.png" alt="Orders list made without RYUX: one screen with order counts, ship-by deadlines and a 5 PM carrier pickup" width={780} height={1812} priority className="w-full rounded-md" />
            <Marks marks={WITHOUT} tone="mark" start={300} />
          </Frame>
          <Frame title="With RYUX" count="1 of 9" tone="accent" selected>
            <Image src="/proof/orders-with.png" alt="Orders list made with RYUX: search, each order's payment and shipping status in words, and a loading row" width={340} height={964} priority className="w-full rounded-md" />
            <Marks marks={WITH} tone="accent" start={800} />
          </Frame>
        </div>
        {notes.map((n) => (
          <Note key={n.m.body} tag={n.m.tag} tone={n.tone} className="absolute hidden lg:block" style={{ ...n.style, animationDelay: `${n.delay}ms` }}>
            {n.m.body}
          </Note>
        ))}
      </div>
      <ol className="flex flex-col gap-2.5 lg:hidden">
        {notes.map((n) => (
          <li key={n.m.body} className="flex gap-2.5">
            <Pin n={(n.tone === "mark" ? WITHOUT : WITH).indexOf(n.m) + 1} tone={n.tone} />
            <p className="text-[14px] leading-[1.5] text-ink-2">
              <span className={n.tone === "mark" ? "text-mark" : "text-accent"}>{n.tone === "mark" ? "Without" : "With"}:</span> {n.m.body}
            </p>
          </li>
        ))}
      </ol>
    </figure>
  );
}

/* The main benchmark as the first run tab: the screen made without RYUX, the six RYUX designed, and the
   tally from three repeats. */
function TransactionPanel() {
  return (
    <Reveal className="flex flex-col gap-10">
      <div className="canvas-grid relative overflow-x-auto rounded-2xl border border-hair">
        <div className="flex w-max items-start gap-5 p-5 sm:p-8">
          <Frame title="Without RYUX" count="1 screen" tone="mark" className="w-[180px] sm:w-[200px]">
            <Image src="/proof/en-td-without.png" alt="The completed payment screen designed without RYUX: $24.50 paid to a coffee shop, the wallet balance, a promise to look into problems reported within 30 days, and Save PDF and Share receipt buttons" width={780} height={1926} className="w-full rounded-md" />
            <Marks marks={TD_WITHOUT} tone="mark" start={200} />
          </Frame>
          <span aria-hidden className="w-px self-stretch bg-hair" />
          {STATES.map((st, i) => (
            <Frame key={st.name} title={`With · ${i + 1} ${st.name}`} tone="accent" selected={st.name === "Failed"} className={st.narrow ? "w-[118px] sm:w-[124px]" : "w-[140px] sm:w-[148px]"}>
              <Image src={st.src} alt={`Screen ${i + 1} of 6 designed with RYUX, ${st.name}: ${st.caption}`} width={st.w} height={st.h} className="w-full rounded-md" />
            </Frame>
          ))}
        </div>
      </div>
      <ol className="grid gap-x-10 gap-y-3 sm:grid-cols-2 lg:grid-cols-3">
        {TD_WITHOUT.map((m, i) => (
          <li key={m.body} className="flex gap-2.5">
            <Pin n={i + 1} tone="mark" />
            <p className="text-[14px] leading-[1.5] text-ink-2">{m.body}</p>
          </li>
        ))}
      </ol>
      <div className="grid gap-10 [&>*]:min-w-0 lg:grid-cols-[minmax(0,1fr)_minmax(0,340px)] lg:gap-16">
        <div className="flex flex-col gap-6">
          <p className="text-[19px] font-medium">Repeated three times. One dot per run.</p>
          <Scoreboard night />
        </div>
        <div className="flex flex-col gap-4 rounded-xl border border-hair p-5 lg:mt-12">
          <p className="font-mono text-[12px] text-mark">What it did not change</p>
          <p className="text-[15px] leading-[1.55]">
            How good the screens look. In a blind visual test of a wallet home screen, RYUX scored 3.71 against 3.67 out of 5.
          </p>
          <Link href="/benchmarks" className="inline-flex min-h-11 items-center gap-2 self-start text-[15px] font-medium underline underline-offset-4">
            Read both benchmarks <Arrow />
          </Link>
        </div>
      </div>
      <p className="text-[13px] leading-[1.6] text-muted">
        How it was run: a fresh agent each time, the same model, no reference screens on either side, and sample data in
        every screen. The screens are from the second pair, unedited; only the marks are ours. Three pairs is a small
        benchmark, not a study.
      </p>
    </Reveal>
  );
}

function Proof() {
  return (
    <section id="proof" aria-labelledby="proof-title" className="overflow-x-clip border-t border-hair">
      <div className={`${GUTTER} flex flex-col gap-10 py-20 lg:py-24`}>
        <div className="grid gap-8 [&>*]:min-w-0 lg:grid-cols-[1fr_380px] lg:items-end lg:gap-16">
          <div className="flex flex-col gap-4">
            <Eyebrow>Benchmark · same prompt, same agent, one with RYUX</Eyebrow>
            <h2 id="proof-title" className="text-[38px] leading-[1.05] sm:text-[52px]">One screen became six.</h2>
            <p className="max-w-[640px] text-[17px] leading-[1.55] text-ink-2">
              Without RYUX the agent designed only the success screen, and added a rule and a button nobody asked for. With
              RYUX it designed every screen a payment goes through, so people can tell what happened to their money.
            </p>
          </div>
          <div className="flex flex-col gap-2 border-l border-hair pl-5">
            <p className="font-mono text-[12px] text-muted">The prompt, identical for both</p>
            <p className="text-[16px] leading-[1.45]">
              “Design a transaction detail page for a fintech app, shown after the user pays. Make it in pen.dev.”
            </p>
          </div>
        </div>
        <Cases first={{ id: "transaction", tab: "Transaction detail", short: "Transaction", panel: <TransactionPanel /> }} />
      </div>
    </section>
  );
}

function HowItWorks() {
  return (
    <section id="how" aria-labelledby="how-title" className="border-t border-hair bg-paper-2">
      <div className={`${GUTTER} flex flex-col gap-14 py-20 lg:py-24`}>
        <div className="flex max-w-[720px] flex-col gap-4">
          <Eyebrow>How it works</Eyebrow>
          <h2 id="how-title" className="text-[38px] leading-[1.05] sm:text-[52px]">Looks first, then decides.</h2>
          <p className="text-[17px] leading-[1.55] text-ink-2">
            Tell your agent what you are doing. RYUX picks the step, reads only the design knowledge that step needs, and
            before it calls the work done, lists what it checked and what it could not.
          </p>
        </div>
        <ol className="grid border-t border-hair [&>*]:min-w-0 sm:grid-cols-2 lg:grid-cols-5">
          {CAPABILITIES.map((c, i) => (
            <li key={c.name} className={`flex flex-col gap-2 border-b border-hair pt-5 pb-6 lg:border-b-0 lg:pr-6 ${i ? "lg:border-l lg:pl-6" : ""}`}>
              <span className="font-mono text-[12px] text-muted">{i + 1}</span>
              <h3 className="text-[22px] font-semibold tracking-[-0.02em]">{c.name}</h3>
              <p className="text-[15px] leading-[1.5] text-ink-2">{c.body}</p>
            </li>
          ))}
        </ol>
        <div className="grid gap-10 [&>*]:min-w-0 lg:grid-cols-[1fr_540px] lg:items-start lg:gap-16">
          <div className="flex flex-col gap-4">
            <h3 className="text-[26px] leading-[1.15] font-semibold tracking-[-0.02em]">Every big decision is written down.</h3>
            <p className="text-[16px] leading-[1.55] text-ink-2">
              For each major choice RYUX writes a short receipt: what it chose, what it compared, the evidence, and how sure
              it is. When there is no evidence it says so, so a guess never passes for research.
            </p>
            <p className="pt-2 text-[16px] leading-[1.55] text-ink-2">
              Tell it about your product once: the CLI writes a short DESIGN.md that RYUX reads before it designs.
            </p>
            <div className="max-w-[480px]">
              <CopyCommand command="npx @ryuxdsgn/design-intelligence init --agent claude" />
            </div>
          </div>
          <figure className="rounded-xl border border-hair bg-panel px-6 py-5">
            <div className="flex items-center justify-between border-b border-hair pb-3">
              <p className="text-[15px] font-semibold">Decision receipt</p>
              <p className="font-mono text-[12px] text-muted">From a real run</p>
            </div>
            <dl>
              {RECEIPT.map((r) => (
                <div key={r.key} className="grid grid-cols-[96px_1fr] gap-4 border-b border-hair py-3 last:border-b-0 sm:grid-cols-[108px_1fr]">
                  <dt className="text-[14px] text-muted">{r.key}</dt>
                  <dd className={`text-[15px] leading-[1.45] ${r.key === "Evidence" ? "text-mark" : ""}`}>{r.value}</dd>
                </div>
              ))}
            </dl>
            <figcaption className="pt-2 text-[13px] leading-[1.5] text-muted">
              Quoted from a real run, shortened. The guess is visible instead of being built in quietly.
            </figcaption>
          </figure>
        </div>
      </div>
    </section>
  );
}

function TryRyux() {
  return (
    <section id="try" aria-labelledby="try-title" className="border-t border-hair">
      <div className={`${GUTTER} grid gap-14 py-20 [&>*]:min-w-0 lg:py-24 xl:grid-cols-[1fr_560px] xl:gap-24`}>
        <div className="flex flex-col gap-6">
          <h2 id="try-title" className="text-[44px] leading-[1.02] sm:text-[60px]">Install RYUX</h2>
          <p className="max-w-[520px] text-[17px] leading-[1.55] text-ink-2">Free, MIT licensed, and one skill. It works in {AGENTS}.</p>
          <nav aria-label="Next steps" className="flex flex-wrap gap-x-7 gap-y-1 text-[16px] font-medium">
            <a href={REPO} className="inline-flex min-h-11 items-center gap-2 underline underline-offset-4">GitHub <Arrow /></a>
            <a href={DOCS} className="inline-flex min-h-11 items-center gap-2 underline underline-offset-4">Docs <Arrow /></a>
            <Link href="/benchmarks" className="inline-flex min-h-11 items-center gap-2 underline underline-offset-4">Benchmarks <Arrow /></Link>
          </nav>
          <div className="mt-6 flex max-w-[520px] flex-col gap-3 border-t border-hair pt-6">
            <p className="text-[15px] leading-[1.55] text-ink-2">
              <span className="font-semibold text-ink">The reference library is coming.</span> RYUX will cite real product
              screens with notes written by people. Until the hosted service is live, it says “no evidence” instead of inventing
              a reference.
            </p>
            <WaitlistForm />
          </div>
        </div>
        <div className="flex flex-col gap-6">
          {INSTALL.map(({ label, commands, inClaude }) => (
            <div key={label} className="flex flex-col gap-2.5">
              <p className="text-[14px] text-muted">{label}</p>
              {commands.map((cmd) => (
                <CopyCommand key={cmd} command={cmd} prompt={inClaude ? "" : "$"} />
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default function Home() {
  return (
    <>
      <SiteHeader />
      <SectionSpy ids={["proof", "how"]} />
      <main>
        <Hero />
        <Proof />
        <HowItWorks />
        <TryRyux />
      </main>
      <SiteFooter />
    </>
  );
}
