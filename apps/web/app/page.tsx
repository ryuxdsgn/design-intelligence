import Image from "next/image";
import Link from "next/link";
import { CopyCommand } from "@/components/copy-command";
import { Reveal } from "@/components/reveal";
import { Ring } from "@/components/markup";
import { Cases } from "@/components/cases";
import { SectionSpy } from "@/components/motion";
import { ReasoningStage } from "@/components/reasoning-stage";
import { Scoreboard } from "@/components/scoreboard";
import { WaitlistForm } from "@/components/waitlist-form";
import { Arrow, DOCS, Eyebrow, GUTTER, REPO, SiteFooter, SiteHeader } from "@/components/site";

/* Show the behaviour, not the pixels: a beginner can read a conversation with an agent and everyday
   situations in plain words, not a screenshot with pins. Everything quoted is from the transaction-detail
   benchmark, pair 2 (docs/benchmarks/en-td-2.3.3, archived at tag archive/docs-2.7.0): a2/reasoning.md for the agent alone, b2/questions.md
   and b2/reasoning.md for the agent with RYUX. Quotes are shortened, not reworded. */

const PROMPT = "Design a transaction detail page for a fintech app.";

/* b2/questions.md, shortened. */
const QUESTIONS = ["Which market and language?", "What did the person pay for?", "Which actions does the product really have?"];

/* The six screens RYUX designed in that run, cut from its exported board. 320 is the narrow-width check
   the board names; the others are 390 wide. */
const STATES = [
  { src: "/proof/states/1-completed.png", w: 502, h: 1239, name: "Paid", caption: "The full breakdown, a receipt to share, and a way to report a problem." },
  { src: "/proof/states/2-processing.png", w: 503, h: 1315, name: "Still processing", caption: "Says the payment is on its way and asks people not to pay again." },
  { src: "/proof/states/3-failed.png", w: 503, h: 1287, name: "Failed", caption: "Says it didn't go through, and what to do if money left the account." },
  { src: "/proof/states/4-loading.png", w: 502, h: 1090, name: "Loading", caption: "Holds the layout while the details load, so nothing jumps." },
  { src: "/proof/states/5-couldnt-load.png", w: 503, h: 1090, name: "Couldn't load", caption: "Offers Try again, and says reloading doesn't change the payment." },
  { src: "/proof/states/6-narrow.png", w: 413, h: 1413, pt: 320, name: "Small phone", caption: "The narrowest phone, 320 wide, with a long merchant name and a large amount." },
];
const WITHOUT_SCREEN = { src: "/proof/en-td-without.png", w: 780, h: 1926 };

/* Everyday moments after someone pays, and which side had a screen for each. */
const SITUATIONS = [
  { ask: "The payment went through", state: 0, without: true },
  { ask: "The payment is still processing", state: 1 },
  { ask: "The payment failed", state: 2 },
  { ask: "The details are still loading", state: 3 },
  { ask: "The page couldn't load", state: 4 },
  { ask: "Someone opens it on a small phone", state: 5 },
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

/* The short receipt the stage ends on: the first three rows of the one above. */
const STAGE_RECEIPT = RECEIPT.slice(0, 3);

const INSTALL = [
  { label: "Any tool, through skills.sh", commands: ["npx skills add ryuxdsgn/design-intelligence"], inClaude: false },
  { label: "The RYUX CLI, which also writes DESIGN.md", commands: ["npx @ryuxdsgn/design-intelligence init --agent claude"], inClaude: false },
  {
    label: "As a Claude Code plugin, inside Claude Code",
    commands: ["/plugin marketplace add ryuxdsgn/design-intelligence", "/plugin install ryux@design-intelligence"],
    inClaude: true,
  },
];

const AGENTS = "Claude Code, Codex, Cursor, Gemini CLI, OpenCode, Cline, GitHub Copilot, Amp, Kimi Code, and Antigravity";

/** A chat message. An agent reply can be preceded by `typing` ms of "…", so it reads as an answer that
    took a moment, not a block fading in. The bubble holds its space from the start, so nothing shifts. */
function Bubble({ from, delay, typing, children }: { from: "you" | "agent"; delay: number; typing?: number; children: React.ReactNode }) {
  const bubble = (
    <div
      className={`note-in rounded-2xl px-3.5 py-2.5 text-[13px] leading-[1.5] sm:text-[14px] ${
        from === "you" ? "rounded-br-md border border-hair text-ink-2" : "rounded-bl-md bg-panel text-ink"
      }`}
      style={{ animationDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
  return (
    <div className={`relative max-w-[92%] ${from === "you" ? "self-end" : "self-start"}`}>
      {typing && (
        <span aria-hidden className="typing" style={{ ["--s" as string]: `${delay - typing}ms`, ["--e" as string]: `${delay}ms` } as React.CSSProperties}>
          <i /><i /><i />
        </span>
      )}
      {bubble}
    </div>
  );
}

function Thread({ title, tone, children }: { title: string; tone: "mark" | "accent"; children: React.ReactNode }) {
  return (
    <div className="flex min-w-0 flex-col gap-3">
      <p className={`flex items-center gap-2 font-mono text-[12px] ${tone === "mark" ? "text-mark" : "text-accent"}`}>
        <span aria-hidden className={`size-2 rounded-full ${tone === "mark" ? "bg-mark" : "bg-accent"}`} />
        {title}
      </p>
      {children}
    </div>
  );
}

/** A real screen, small and whole (never cropped); the link opens it at full size. */
function Thumb({ src, w, h, label, className = "", delay }: { src: string; w: number; h: number; label: string; className?: string; delay?: number }) {
  return (
    <a href={src} target="_blank" rel="noreferrer" aria-label={`Open the ${label} screen`} style={delay === undefined ? undefined : { animationDelay: `${delay}ms` }} className={`${delay === undefined ? "" : "note-in "}block overflow-hidden rounded-[6px] ring-1 ring-hair transition-transform duration-[var(--dur-2)] hover:-translate-y-0.5 ${className}`}>
      <Image src={src} alt="" width={w} height={h} className="w-full" />
    </a>
  );
}

function Hero() {
  return (
    <section aria-labelledby="hero-title" className={`${GUTTER} grid items-start gap-10 py-10 [&>*]:min-w-0 lg:grid-cols-[minmax(0,1fr)_560px] lg:gap-14 lg:py-12 xl:grid-cols-[minmax(0,1fr)_640px]`}>
      <div className="flex flex-col gap-5 lg:gap-6 lg:pt-2">
        <Eyebrow>RYUX · understand before you design</Eyebrow>
        <h1 id="hero-title" className="text-[min(38px,10.5vw)] leading-[1.04] sm:text-[52px] lg:text-[48px] xl:text-[58px]">
          Design that{" "}
          <span className="relative inline-block">
            asks
            <svg aria-hidden className="absolute -bottom-[0.16em] left-0 h-[0.14em] w-full overflow-visible" viewBox="0 0 100 10" preserveAspectRatio="none">
              <path d="M1 7 C 25 2, 60 2, 99 5" pathLength={1} fill="none" strokeWidth="3" strokeLinecap="round" className="ring-draw stroke-mark" style={{ animationDelay: "400ms" }} />
            </svg>
          </span>{" "}
          before it guesses.
        </h1>
        <p className="max-w-[500px] text-[17px] leading-[1.55] text-ink-2 sm:text-[18px]">
          A free skill for your AI coding tool. It asks what it doesn&apos;t know, designs the loading and failed screens
          too, and invents nothing.
        </p>
        <div className="flex flex-col gap-3">
          <p className="text-[14px] text-muted">Install: paste this in your terminal</p>
          <CopyCommand command="npx skills add ryuxdsgn/design-intelligence" primary />
          <p className="font-mono text-[12px] text-muted">Free · MIT · works in Claude Code, Cursor, Codex and 7 more</p>
          <a href="#proof" className="mt-1 inline-flex min-h-11 items-center gap-1.5 self-start text-[16px] font-medium underline underline-offset-4">
            See the benchmark <Arrow down />
          </a>
        </div>
      </div>
      <HeroBoard />
    </section>
  );
}

/* The same request to two agents, as a chat: the one alone answers with a finished screen and quiet
   guesses; the one with RYUX asks first, then designs every screen the moment needs. */
function HeroBoard() {
  return (
    <figure aria-label="The same request, without and with RYUX" className="hero-exit canvas-grid grid gap-6 rounded-2xl border border-hair p-4 sm:grid-cols-2 sm:p-6">
      <Thread title="Without RYUX" tone="mark">
        <Bubble from="you" delay={100}>{PROMPT}</Bubble>
        <Bubble from="agent" delay={700} typing={400}>
          Done. Here is your screen.
          <Thumb src={WITHOUT_SCREEN.src} w={WITHOUT_SCREEN.w} h={WITHOUT_SCREEN.h} label="made without RYUX" className="mt-2.5 w-[56px]" />
        </Bubble>
        <p className="note-in border-l-2 border-mark pl-3 text-[13px] leading-[1.5] text-ink-2" style={{ animationDelay: "1100ms" }}>
          It guessed US dollars, a 30-day rule and a Save PDF button. Nobody asked.
        </p>
      </Thread>
      <Thread title="With RYUX" tone="accent">
        <Bubble from="you" delay={250}>{PROMPT}</Bubble>
        <Bubble from="agent" delay={1000} typing={550}>
          First, 3 questions:
          <ol className="mt-1 list-decimal pl-4 text-ink-2">
            {QUESTIONS.map((q) => <li key={q}>{q}</li>)}
          </ol>
        </Bubble>
        <Bubble from="agent" delay={1800} typing={500}>
          6 screens, one for each moment:
          <span className="mt-2 grid grid-cols-6 items-start gap-1.5">
            {STATES.map((st, i) => <Thumb key={st.name} src={st.src} w={st.w} h={st.h} label={st.name} delay={1850 + i * 80} />)}
          </span>
        </Bubble>
        <p className="note-in border-l-2 border-accent pl-3 text-[13px] leading-[1.5] text-ink-2" style={{ animationDelay: "2500ms" }}>
          Currency never decided, so it shows [CUR], not a guess.
        </p>
      </Thread>
    </figure>
  );
}

/* The main benchmark as the first run tab, told as everyday situations: for each moment after someone
   pays, did the person get a screen? Thumbnails open the real exports. */
function TransactionPanel() {
  return (
    <Reveal className="flex flex-col gap-10">
      <div className="overflow-hidden rounded-2xl border border-hair">
        <div className="hidden grid-cols-[minmax(0,1fr)_200px_minmax(0,1.2fr)] gap-6 border-b border-hair bg-paper-2 px-5 py-3 font-mono text-[12px] sm:grid">
          <span className="text-muted">After someone pays…</span>
          <span className="text-mark">Without RYUX</span>
          <span className="text-accent">With RYUX</span>
        </div>
        <ol>
          {SITUATIONS.map((sit) => {
            const st = STATES[sit.state];
            return (
              <li key={sit.ask} className="rise grid grid-cols-2 gap-x-4 gap-y-3 border-b border-hair px-5 py-4 last:border-b-0 sm:grid-cols-[minmax(0,1fr)_200px_minmax(0,1.2fr)] sm:items-center sm:gap-6">
                <p className="col-span-2 text-[16px] font-medium sm:col-span-1">{sit.ask}</p>
                <div className="flex items-center gap-3">
                  <span className="font-mono text-[11px] text-mark sm:hidden">Without</span>
                  {sit.without ? (
                    <Thumb src={WITHOUT_SCREEN.src} w={WITHOUT_SCREEN.w} h={WITHOUT_SCREEN.h} label="made without RYUX" className="w-[40px]" />
                  ) : (
                    <span className="text-[14px] text-muted">— No screen</span>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-mono text-[11px] text-accent sm:hidden">RYUX</span>
                  <Thumb src={st.src} w={st.w} h={st.h} label={st.name} className="w-[40px] shrink-0" />
                  <p className="hidden text-[14px] leading-[1.45] text-ink-2 sm:block">{st.caption}</p>
                </div>
                <p className="col-span-2 text-[13px] leading-[1.45] text-ink-2 sm:hidden">{st.caption}</p>
              </li>
            );
          })}
        </ol>
      </div>
      <div className="grid gap-10 [&>*]:min-w-0 lg:grid-cols-[minmax(0,1fr)_minmax(0,340px)] lg:gap-16">
        <div className="flex flex-col gap-6">
          <p className="text-[19px] font-medium">We ran it three times. Every time, without RYUX there was one screen; with RYUX, six.</p>
          <Scoreboard night />
        </div>
        <div className="flex flex-col gap-4 rounded-xl border border-hair p-5 lg:mt-12">
          <p className="font-mono text-[12px] text-mark">What it did not change</p>
          <p className="text-[15px] leading-[1.55]">
            How good the screens look. In a blind visual test of a wallet home screen, RYUX scored 3.71 against 3.67 out of 5.
          </p>
          <Link href="/benchmarks#wallet-home" className="inline-flex min-h-11 items-center gap-2 self-start text-[15px] font-medium underline underline-offset-4">
            Read the visual benchmark <Arrow />
          </Link>
        </div>
      </div>
      <p className="text-[13px] leading-[1.6] text-muted">
        How it was run: a fresh session each time, the same model, no reference screens on either side, and sample data in
        every screen. The screens are from the second pair, unedited. Three pairs is a small benchmark, not a study.
      </p>
    </Reveal>
  );
}

function Proof() {
  return (
    <section id="proof" aria-labelledby="proof-title" className="section-rule overflow-x-clip">
      <div className={`${GUTTER} flex flex-col gap-10 py-20 lg:py-0 lg:pb-24`}>
        <ReasoningStage alone={{ ...WITHOUT_SCREEN, name: "Paid" }} states={STATES} questions={QUESTIONS} receipt={STAGE_RECEIPT}>
          <div className="rise flex max-w-[760px] flex-col gap-4">
            <Eyebrow>Benchmark · same prompt, same model, with and without RYUX</Eyebrow>
            <h2 id="proof-title" className="text-[38px] leading-[1.05] sm:text-[52px]">One screen became six.</h2>
            <p className="text-[17px] leading-[1.55] text-ink-2">
              Without RYUX, the same model designed only the success screen. With RYUX it asked first, left open what
              nobody had decided, and designed every screen a payment goes through.
            </p>
          </div>
        </ReasoningStage>
        <div className="rise flex max-w-[760px] flex-col gap-2 border-l border-hair pl-5">
          <p className="font-mono text-[12px] text-muted">The prompt, identical for both</p>
          <p className="text-[16px] leading-[1.45]">
            “Design a transaction detail page for a fintech app, shown after the user pays. Make it in pen.dev.”
          </p>
        </div>
        <Cases first={{ id: "transaction", tab: "Transaction detail", short: "Transaction", panel: <TransactionPanel /> }} />
      </div>
    </section>
  );
}

function HowItWorks() {
  return (
    <section id="how" aria-labelledby="how-title" className="section-rule bg-paper-2">
      <div className={`${GUTTER} flex flex-col gap-14 py-20 lg:py-24`}>
        <div className="rise flex max-w-[720px] flex-col gap-4">
          <Eyebrow>How it works</Eyebrow>
          <h2 id="how-title" className="text-[38px] leading-[1.05] sm:text-[52px]">Looks first, then decides.</h2>
          <p className="text-[17px] leading-[1.55] text-ink-2">
            Say what you are doing. RYUX picks the step, reads only the design knowledge that step needs, and
            before it calls the work done, lists what it checked and what it could not.
          </p>
        </div>
        {/* The five steps light up in their order as the row scrolls through, along a rail that fills. */}
        <ol className="steps relative grid border-t border-hair [&>*]:min-w-0 sm:grid-cols-2 lg:grid-cols-5">
          <span aria-hidden className="steps-rail absolute -top-px left-0 hidden h-[2px] w-full bg-accent lg:block" />
          {CAPABILITIES.map((c, i) => (
            <li key={c.name} style={{ ["--i" as string]: i } as React.CSSProperties} className={`step flex flex-col gap-2 border-b border-hair pt-5 pb-6 lg:border-b-0 lg:pr-6 ${i ? "lg:border-l lg:pl-6" : ""}`}>
              <span className="step-num font-mono text-[12px] text-muted">{i + 1}</span>
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
                <div key={r.key} className="rise grid grid-cols-[96px_1fr] gap-4 border-b border-hair py-3 last:border-b-0 sm:grid-cols-[108px_1fr]">
                  <dt className="text-[14px] text-muted">{r.key}</dt>
                  <dd className={`text-[15px] leading-[1.45] ${r.key === "Evidence" ? "text-mark" : ""}`}>
                    {r.key === "Evidence" ? (
                      /* Analytical mark: the one honest gap in the receipt gets circled once, as it scrolls in. */
                      <Reveal className="relative inline-block px-1">
                        {r.value}
                        <Ring x={50} y={50} w={150} h={150} tone="mark" delay={300} />
                      </Reveal>
                    ) : r.value}
                  </dd>
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
    <section id="try" aria-labelledby="try-title" className="section-rule">
      <div className={`${GUTTER} grid gap-14 py-20 [&>*]:min-w-0 lg:py-24 xl:grid-cols-[1fr_560px] xl:gap-24`}>
        <div className="rise flex flex-col gap-6">
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
          {INSTALL.map(({ label, commands, inClaude }, n) => (
            <div key={label} className="rise flex flex-col gap-2.5">
              <p className="text-[14px] text-muted">{label}</p>
              {commands.map((cmd) => (
                <CopyCommand key={cmd} command={cmd} prompt={inClaude ? "" : "$"} typeIn={n === 0} />
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
