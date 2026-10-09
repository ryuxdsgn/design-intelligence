import Image from "next/image";
import Link from "next/link";
import { CopyCommand } from "@/components/copy-command";
import { Reveal } from "@/components/reveal";
import { Cases as CaseStudies } from "@/components/cases";
import { Pin, PinAt, Ring, type Tone } from "@/components/markup";
import { Scoreboard } from "@/components/scoreboard";
import { WaitlistForm } from "@/components/waitlist-form";
import { Arrow, DOCS, Eyebrow, GUTTER, REPO, SiteFooter, SiteHeader } from "@/components/site";

/* The hero replays the benchmark as people would see it: the screen made without RYUX (only the
   success state, with a rule and a button nobody asked for), then the screen made with RYUX from the
   same prompt (the processing state and what it tells people). x and y are percentages of each full
   image; the stage shows the bottom of the first and the top of the second. */
const WITHOUT_TOP = 54.3; // % of the first image hidden above the stage
const WITHOUT = [
  { x: 64, y: 69.4, ring: [79, 69.4, 24, 3.4], tag: "Missing", body: "Only the success screen. Nothing for a payment that is still processing or fails." },
  { x: 5, y: 79.3, ring: [48, 79.3, 70, 3.6], tag: "Invented", body: "A 30-day reporting rule nobody decided." },
  { x: 95, y: 84.6, ring: [75.5, 87.4, 44, 5.4], tag: "Invented", body: "A Save PDF button nobody asked for." },
] as const;
const WITH = [
  { x: 69, y: 20.7, ring: [49, 20.7, 26, 3], tag: "Status", body: "Shows the payment is still processing." },
  { x: 89, y: 35.5, tag: "Guidance", body: "Tells people not to pay again while they wait." },
] as const;
const WITH_AFTER = "One of six screens it designed: completed, processing, failed, loading, a load error, and a narrow width.";
/* Swap from the first screen to the second at this point (ms); markup on each follows it. */
const SWAP = 3400;

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

const MARKS = [
  { mark: "Observed", meaning: "Seen in the design or read from its values.", example: "Body text is 16/24, read from the CSS." },
  { mark: "Inferred", meaning: "A reasonable guess, labeled as one.", example: "Probably an 8px spacing scale." },
  { mark: "Knowledge", meaning: "A known pattern or standard, cited.", example: "WCAG 1.4.3: text contrast at least 4.5:1." },
  { mark: "Unknown", meaning: "Something nobody said. It stays visible.", example: "[CUR] 49.00, currency not decided" },
];

const INSTALL = [
  { label: "Any agent, through skills.sh", commands: ["npx skills add ryuxdsgn/design-intelligence"], inClaude: false },
  { label: "The RYUX CLI, which also writes DESIGN.md", commands: ["npx @ryuxdsgn/ryux init --agent claude"], inClaude: false },
  {
    label: "As a Claude Code plugin, inside Claude Code",
    commands: ["/plugin marketplace add ryuxdsgn/design-intelligence", "/plugin install ryux@design-intelligence"],
    inClaude: true,
  },
];

const AGENTS = "Claude Code, Codex, Cursor, Gemini CLI, OpenCode, Cline, GitHub Copilot, Amp, Kimi Code, and Antigravity";

function Hero() {
  return (
    <section aria-labelledby="hero-title" className={`${GUTTER} grid items-center gap-10 py-8 [&>*]:min-w-0 lg:grid-cols-[minmax(0,1fr)_auto] lg:gap-12 lg:py-10`}>
      <div className="flex flex-col gap-5 lg:gap-6">
        <Eyebrow>Design intelligence for AI agents</Eyebrow>
        <h1 id="hero-title" className="text-[42px] leading-[1] font-semibold tracking-[-0.035em] sm:text-[64px] xl:text-[76px]">
          {"Understand before you design.".split(" ").map((w, i) => (
            <span key={w} className="word-in inline-block" style={{ animationDelay: `${i * 90}ms` }}>
              {w === "design." ? (
                <span className="relative inline-block">
                  design
                  <svg aria-hidden className="absolute -bottom-[0.2em] left-0 h-[0.14em] w-full overflow-visible" viewBox="0 0 100 10" preserveAspectRatio="none">
                    <path d="M1 7 C 25 2, 60 2, 99 5" pathLength={1} fill="none" strokeWidth="3" strokeLinecap="round" className="ring-draw stroke-mark" style={{ animationDelay: "700ms" }} />
                  </svg>
                </span>
              ) : (
                w
              )}
              {w === "design." ? "." : null}&nbsp;
            </span>
          ))}
        </h1>
        <p className="max-w-[560px] text-[17px] leading-[1.55] text-ink-2 sm:text-[19px]">
          RYUX is a skill you add to your AI agent. It has the agent design the screens people actually go through, like a
          payment that is still processing or a page that fails to load, and nothing nobody asked for.
        </p>
        <div className="flex flex-wrap items-center gap-x-7 gap-y-3">
          <a href="#try" className="inline-flex min-h-12 items-center gap-2.5 rounded-lg bg-accent px-6 text-[17px] font-semibold text-white hover:opacity-90">
            Install RYUX <Arrow />
          </a>
          <a href="#proof" className="inline-flex min-h-12 items-center gap-1.5 text-[17px] font-medium underline underline-offset-4">
            See the benchmark <Arrow down />
          </a>
        </div>
      </div>
      <HeroProof />
    </section>
  );
}

/* Two layers in one frame. The first (without RYUX) fades out at SWAP; the second (with RYUX) fades in.
   With reduced motion only the second shows, already marked. */
function HeroProof() {
  return (
    <figure className="flex flex-col gap-5 xl:flex-row xl:items-start xl:gap-8">
      <p className="sr-only">
        The same prompt run twice. Without RYUX the agent designed only the success screen and added a 30-day reporting rule
        and a Save PDF button nobody asked for. With RYUX it designed six screens, including a processing screen that tells
        people not to pay again while they wait.
      </p>
      <div aria-hidden className="canvas-grid relative mx-auto w-full max-w-[400px] shrink-0 rounded-[24px] border border-hair p-4 pt-11 sm:p-5 sm:pt-12 lg:w-[360px] xl:mx-0">
        <div className="absolute top-4 right-5 left-5 flex items-center justify-between gap-3 font-mono text-[12px]">
          <span className="relative">
            <span className="swap-out font-semibold text-mark" style={{ animationDelay: `${SWAP}ms` }}>Without RYUX</span>
            <span className="swap-in absolute top-0 left-0 font-semibold whitespace-nowrap text-accent motion-reduce:static" style={{ animationDelay: `${SWAP}ms` }}>With RYUX</span>
          </span>
          <span className="text-muted">Real run, same prompt</span>
        </div>
        <div className="relative aspect-[780/880] overflow-hidden rounded-[18px] border border-hair bg-[#f4f3ef] shadow-[0_30px_60px_-30px_rgba(11,22,43,0.35)]">
          <div className="swap-out absolute inset-x-0 top-0" style={{ animationDelay: `${SWAP}ms`, transform: `translateY(-${WITHOUT_TOP}%)` }}>
            <Image src="/proof/en-td-without.png" alt="" width={780} height={1926} priority className="w-full" />
            {WITHOUT.map((m, i) => (
              <div key={m.body}>
                <Ring x={m.ring[0]} y={m.ring[1]} w={m.ring[2]} h={m.ring[3]} tone="mark" delay={500 + i * 700} />
                <PinAt n={i + 1} x={m.x} y={m.y} tone="mark" delay={400 + i * 700} />
              </div>
            ))}
          </div>
          <div className="swap-in absolute inset-x-0 top-0" style={{ animationDelay: `${SWAP}ms` }}>
            <Image src="/proof/en-td-with.png" alt="" width={789} height={2050} priority className="w-full" />
            {WITH.map((m, i) => (
              <div key={m.tag}>
                {"ring" in m && <Ring x={m.ring[0]} y={m.ring[1]} w={m.ring[2]} h={m.ring[3]} tone="accent" delay={SWAP + 500 + i * 450} />}
                <PinAt n={i + 1} x={m.x} y={m.y} tone="accent" delay={SWAP + 400 + i * 450} />
              </div>
            ))}
          </div>
        </div>
      </div>
      <div aria-hidden className="relative mx-auto w-full max-w-[400px] xl:mx-0 xl:w-[230px] xl:pt-14">
        <ol className="swap-out flex flex-col gap-4" style={{ animationDelay: `${SWAP}ms` }}>
          {WITHOUT.map((m, i) => (
            <li key={m.body} className="note-in flex gap-3" style={{ animationDelay: `${700 + i * 700}ms` }}>
              <Pin n={i + 1} />
              <p className="text-[15px] leading-[1.45] text-ink-2">
                <span className="font-semibold text-mark">{m.tag}.</span> {m.body}
              </p>
            </li>
          ))}
        </ol>
        <ol className="swap-in absolute inset-x-0 top-0 flex flex-col gap-4 motion-reduce:static xl:top-14" style={{ animationDelay: `${SWAP}ms` }}>
          {WITH.map((m, i) => (
            <li key={m.tag} className="note-in flex gap-3" style={{ animationDelay: `${SWAP + 600 + i * 450}ms` }}>
              <Pin n={i + 1} tone="accent" />
              <p className="text-[15px] leading-[1.45] text-ink-2">
                <span className="font-semibold text-accent">{m.tag}.</span> {m.body}
              </p>
            </li>
          ))}
          <li className="note-in text-[15px] leading-[1.45] text-ink-2" style={{ animationDelay: `${SWAP + 600 + WITH.length * 450}ms` }}>
            {WITH_AFTER}
          </li>
        </ol>
      </div>
    </figure>
  );
}

type Mark = { x: number; y: number; ring?: [number, number, number, number]; note: string };

function Proof() {
  const screens: {
    label: string; src: string; w: number; h: number; alt: string; tone: Tone; marks: Mark[]; after?: string;
  }[] = [
    {
      label: "Without RYUX",
      src: "/proof/en-td-without.png",
      w: 780,
      h: 1926,
      tone: "mark-night",
      alt: "The completed payment screen designed without RYUX: $24.50 paid to a coffee shop, the wallet balance, a promise to look into problems reported within 30 days, and Save PDF and Share receipt buttons",
      marks: [
        { x: 62, y: 69.4, ring: [79, 69.4, 24, 3.4], note: "Only Completed: no screen for a payment still processing or one that fails." },
        { x: 5, y: 79.3, ring: [48, 79.3, 70, 3.6], note: "“Report it within 30 days”: a rule nobody decided." },
        { x: 95, y: 84.6, ring: [75.5, 87.4, 44, 5.4], note: "Save PDF, which nobody asked for." },
      ],
    },
    {
      label: "With RYUX",
      src: "/proof/en-td-with-completed.png",
      w: 791,
      h: 1931,
      tone: "accent-night",
      alt: "The completed payment screen designed with RYUX: [CUR] 49.00 paid to [Merchant name], with the fee and total shown and only the actions that were asked for",
      marks: [
        { x: 9, y: 77.4, ring: [50, 77.4, 76, 3.6], note: "A way to report a problem, without a deadline nobody set." },
        { x: 5, y: 87.2, note: "Two actions instead of three: share the receipt or go home." },
      ],
      after: "Plus the screens a payment goes through: processing, failed, loading, a load error, and a narrow width.",
    },
  ];
  return (
    <section id="proof" aria-labelledby="proof-title" className="canvas-grid-night bg-night text-night-text">
      <Reveal className={`${GUTTER} flex flex-col gap-14 py-20 lg:py-28`}>
        <div className="grid gap-10 [&>*]:min-w-0 lg:grid-cols-[1fr_420px] lg:items-end lg:gap-20">
          <div className="flex flex-col gap-5">
            <Eyebrow night>Benchmark · same prompt, same agent, one with RYUX</Eyebrow>
            <h2 id="proof-title" className="text-[38px] leading-[1.08] font-semibold tracking-[-0.03em] sm:text-[52px]">
              One screen became six.
            </h2>
            <p className="max-w-[620px] text-[18px] leading-[1.55] text-night-sub">
              Without RYUX the agent designed only the success screen, and added a rule and a button nobody asked for. With
              RYUX it designed every screen a payment goes through, so people can tell what happened to their money.
            </p>
          </div>
          <div className="flex flex-col gap-2.5 border-l border-night-hair pl-5">
            <p className="text-[14px] text-night-sub">The prompt, identical for both</p>
            <p className="text-[18px] leading-[1.45]">
              “Design a transaction detail page for a fintech app, shown after the user pays. Make it in pen.dev.”
            </p>
          </div>
        </div>

        <div className="grid gap-14 [&>*]:min-w-0 xl:grid-cols-[300px_300px_1fr] xl:gap-12">
          <div className="grid max-w-[680px] grid-cols-2 gap-5 [&>*]:min-w-0 sm:gap-8 xl:contents">
            {screens.map((s) => (
              <figure key={s.label} className="flex flex-col gap-4">
                <figcaption className={`text-[15px] font-semibold ${s.tone === "mark-night" ? "text-mark-night" : "text-accent-night"}`}>{s.label}</figcaption>
                <div className="relative">
                  <Image src={s.src} alt={s.alt} width={s.w} height={s.h} className="w-full rounded-[20px]" />
                  {s.marks.map((m, i) => (
                    <div key={m.note}>
                      {m.ring && <Ring x={m.ring[0]} y={m.ring[1]} w={m.ring[2]} h={m.ring[3]} tone={s.tone} delay={300 + i * 350} />}
                      <PinAt n={i + 1} x={m.x} y={m.y} tone={s.tone} delay={200 + i * 350} />
                    </div>
                  ))}
                </div>
                <ol className="flex flex-col gap-3">
                  {s.marks.map((m, i) => (
                    <li key={m.note} className="flex gap-2.5">
                      <Pin n={i + 1} tone={s.tone} />
                      <p className="text-[14px] leading-[1.5] text-night-sub sm:text-[15px]">{m.note}</p>
                    </li>
                  ))}
                  {s.after && <li className="text-[14px] leading-[1.5] text-night-text sm:text-[15px]">{s.after}</li>}
                </ol>
              </figure>
            ))}
          </div>

          <div className="flex flex-col gap-7 xl:pt-10 xl:pl-6">
            <p className="text-[21px] font-medium">Repeated three times. One dot per run.</p>
            <Scoreboard night />
            <p className="text-[16px] leading-[1.55]">
              <span className="font-semibold text-mark-night">What it did not change:</span> how good the screens look. In a
              blind visual test of a wallet home screen, RYUX scored 3.71 against 3.67 out of 5.
            </p>
            <Link href="/benchmarks" className="inline-flex min-h-11 items-center gap-2 self-start text-[17px] font-medium underline underline-offset-4">
              Read both benchmarks <Arrow />
            </Link>
          </div>
        </div>

        <p className="text-[14px] leading-[1.6] text-night-sub">
          How it was run: a fresh agent each time, the same model, no reference screens on either side, and sample data in
          every screen. The screens above are from the second pair. Three pairs is a small benchmark, not a study.
        </p>
      </Reveal>
    </section>
  );
}

function Cases() {
  return (
    <section id="cases" aria-labelledby="cases-title" className="overflow-hidden bg-paper-2">
      <Reveal className={`${GUTTER} flex flex-col gap-14 py-20 lg:py-28`}>
        <div className="flex max-w-[760px] flex-col gap-5">
          <Eyebrow>Two more runs</Eyebrow>
          <h2 id="cases-title" className="text-[38px] leading-[1.08] font-semibold tracking-[-0.03em] sm:text-[52px]">
            Looking finished is not the same as being right.
          </h2>
          <p className="text-[18px] leading-[1.55] text-ink-2">
            Two more prompts, run the same way as the benchmark: a fresh agent, the same model, sample data. One run each,
            so read them as examples, not proof. The screens are the agents&apos; own exports; the rings are ours.
          </p>
        </div>
        <CaseStudies />
      </Reveal>
    </section>
  );
}

function HowItWorks() {
  return (
    <section id="how" aria-labelledby="how-title" className={`${GUTTER} py-20 lg:py-28`}>
      <Reveal className="flex flex-col gap-16">
      <div className="grid gap-10 [&>*]:min-w-0 lg:grid-cols-[minmax(0,560px)_1fr] lg:gap-20">
        <div className="flex flex-col gap-6">
          <Eyebrow>How it works</Eyebrow>
          <h2 id="how-title" className="text-[38px] leading-[1.08] font-semibold tracking-[-0.03em] sm:text-[52px]">
            Looks first, then decides.
          </h2>
          <p className="text-[18px] leading-[1.55] text-ink-2">
            Tell your agent what you are doing. RYUX picks the step, reads only the design knowledge that step needs, and
            before it calls the work done, lists what it checked and what it could not.
          </p>
        </div>
        <figure className="flex flex-col gap-3">
          <Image
            src="/illustration/review-desk.png"
            alt="A designer's hands marking up printed phone screens with a red pencil, with sticky notes and a pencil flow sketch on the desk"
            width={1600}
            height={1067}
            className="w-full"
          />
        </figure>
      </div>

      <ol className="stagger grid border-t border-ink [&>*]:min-w-0 sm:grid-cols-2 lg:grid-cols-5">
        {CAPABILITIES.map((c, i) => (
          <li key={c.name} className={`flex flex-col gap-3 border-b border-hair pt-6 pb-8 lg:border-b-0 lg:pr-6 ${i ? "lg:border-l lg:pl-6" : ""}`}>
            <span className="font-mono text-[13px] text-muted">{i + 1}</span>
            <h3 className="text-[26px] font-semibold tracking-[-0.02em]">{c.name}</h3>
            <p className="text-[16px] leading-[1.5] text-ink-2">{c.body}</p>
          </li>
        ))}
      </ol>

      <div className="grid gap-12 [&>*]:min-w-0 lg:grid-cols-[1fr_560px] lg:items-start lg:gap-20">
        <div className="flex flex-col gap-5">
          <h3 className="text-[28px] leading-[1.15] font-semibold tracking-[-0.02em]">Every big decision is written down.</h3>
          <p className="text-[17px] leading-[1.55] text-ink-2">
            For each major choice RYUX writes a short receipt: what it chose, what it compared, the evidence, and how sure it
            is. When there is no evidence it says so, so a guess never passes for research.
          </p>
          <h3 className="pt-6 text-[28px] leading-[1.15] font-semibold tracking-[-0.02em]">Tell it about your product once.</h3>
          <p className="text-[17px] leading-[1.55] text-ink-2">
            The RYUX CLI adds a short DESIGN.md to your project: the product, the audience, the market, the constraints, and
            the direction you want. RYUX reads it before it designs and asks only when a missing answer would change a major
            decision.
          </p>
          <div className="max-w-[480px]">
            <CopyCommand command="npx @ryuxdsgn/ryux init --agent claude" />
          </div>
        </div>
        <figure className="rounded-xl border border-hair bg-white px-6 py-6 sm:px-7">
          <div className="flex items-center justify-between border-b border-ink pb-4">
            <p className="text-[15px] font-semibold">Decision receipt</p>
            <p className="text-[14px] text-muted">From a real run</p>
          </div>
          <dl>
            {RECEIPT.map((r) => (
              <div key={r.key} className="grid grid-cols-[96px_1fr] gap-4 border-b border-hair py-3 sm:grid-cols-[108px_1fr]">
                <dt className="text-[14px] text-muted">{r.key}</dt>
                <dd className={`text-[15px] leading-[1.45] ${r.key === "Evidence" ? "text-mark" : ""}`}>{r.value}</dd>
              </div>
            ))}
          </dl>
          <figcaption className="pt-4 text-[14px] leading-[1.5] text-muted">
            Quoted from a real run, shortened. Low confidence and a [CONFIRM] tag: the guess is visible instead of being
            built in quietly.
          </figcaption>
        </figure>
      </div>
      </Reveal>
    </section>
  );
}

function Evidence() {
  return (
    <section id="evidence" aria-labelledby="evidence-title" className="bg-paper-2">
      <Reveal className={`${GUTTER} grid gap-14 py-20 [&>*]:min-w-0 lg:grid-cols-[minmax(0,480px)_1fr] lg:gap-24 lg:py-28`}>
        <div className="flex flex-col gap-6">
          <Eyebrow>Evidence</Eyebrow>
          <h2 id="evidence-title" className="text-[38px] leading-[1.08] font-semibold tracking-[-0.03em] sm:text-[48px]">
            Known, guessed, or unknown.
          </h2>
          <div className="mt-4 flex flex-col gap-4 rounded-xl border border-hair bg-white p-6">
            <h3 className="text-[19px] font-semibold">The reference library is coming</h3>
            <p className="text-[15px] leading-[1.55] text-ink-2">
              RYUX can cite real product screens with designer notes written by people. The capture and review pipeline works,
              the library is still small, and the hosted service is not live yet. Until it is, RYUX says “no evidence” instead
              of inventing a reference.
            </p>
            <WaitlistForm />
          </div>
        </div>
        <dl className="lg:pt-12">
          {MARKS.map((m) => (
            <div key={m.mark} className="grid gap-2 border-b border-hair py-6 first:border-t sm:grid-cols-[130px_1fr] sm:gap-x-8 lg:grid-cols-1 xl:grid-cols-[130px_1fr_260px]">
              <dt className="text-[15px] font-semibold text-mark">{m.mark}</dt>
              <dd className="text-[18px] leading-[1.4]">{m.meaning}</dd>
              <dd className="font-mono text-[13px] leading-[1.55] text-ink-2 sm:col-start-2 lg:col-start-auto">{m.example}</dd>
            </div>
          ))}
        </dl>
      </Reveal>
    </section>
  );
}

function TryRyux() {
  return (
    <section id="try" aria-labelledby="try-title" className="bg-night text-night-text">
      <Reveal className={`${GUTTER} grid gap-14 py-20 [&>*]:min-w-0 xl:grid-cols-[1fr_560px] xl:gap-24 lg:py-28`}>
        <div className="flex flex-col gap-6">
          <h2 id="try-title" className="text-[44px] leading-[1.02] font-semibold tracking-[-0.035em] sm:text-[64px]">
            Install RYUX
          </h2>
          <p className="max-w-[520px] text-[18px] leading-[1.55] text-night-sub">
            Free, MIT licensed, and one skill. It works in {AGENTS}.
          </p>
          <nav aria-label="Next steps" className="flex flex-wrap gap-x-7 gap-y-3 text-[17px] font-medium">
            <a href={REPO} className="inline-flex min-h-11 items-center gap-2 underline underline-offset-4">GitHub <Arrow /></a>
            <a href={DOCS} className="inline-flex min-h-11 items-center gap-2 underline underline-offset-4">Docs <Arrow /></a>
            <Link href="/benchmarks" className="inline-flex min-h-11 items-center gap-2 underline underline-offset-4">Benchmarks <Arrow /></Link>
          </nav>
        </div>
        <div className="flex flex-col gap-6">
          {INSTALL.map(({ label, commands, inClaude }) => (
            <div key={label} className="flex flex-col gap-2.5">
              <p className="text-[14px] text-night-sub">{label}</p>
              {commands.map((cmd) => (
                <CopyCommand key={cmd} command={cmd} night prompt={inClaude ? "" : "$"} />
              ))}
            </div>
          ))}
        </div>
      </Reveal>
    </section>
  );
}

export default function Home() {
  return (
    <>
      <SiteHeader />
      <main>
        <Hero />
        <Proof />
        <Cases />
        <HowItWorks />
        <Evidence />
        <TryRyux />
      </main>
      <SiteFooter />
    </>
  );
}
