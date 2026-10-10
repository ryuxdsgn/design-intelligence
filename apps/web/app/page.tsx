import Image from "next/image";
import Link from "next/link";
import { CopyCommand } from "@/components/copy-command";
import { Reveal } from "@/components/reveal";
import { Cases as CaseStudies } from "@/components/cases";
import { Dim, Pin, PinAt, Ring, type Tone } from "@/components/markup";
import { ScrubStrip, SectionSpy, Tilt } from "@/components/motion";
import { Scoreboard } from "@/components/scoreboard";
import { WaitlistForm } from "@/components/waitlist-form";
import { Arrow, DOCS, Eyebrow, GUTTER, REPO, SiteFooter, SiteHeader } from "@/components/site";

/* The hero shows a real run as people would see it, as two whole phones: an orders list for a store's
   admin app, made without RYUX (one screen, with counts, deadlines and a pickup time nobody gave) and
   with RYUX from the same prompt (the default list, one of nine screens). x and y are % of each image. */
const WITHOUT = [
  { x: 4, y: 23.5, ring: [16.3, 23.5, 14, 3.4], tag: "Invented", body: "Order counts, 248, 12 and 3, for a store that does not exist." },
  { x: 65, y: 27.9, ring: [83.4, 27.9, 30, 3], tag: "Invented", body: "Ship-by deadlines and an Overdue group: a rule nobody gave." },
  { x: 58, y: 47.5, ring: [79.6, 47.5, 36, 3], tag: "Invented", body: "A 5 PM carrier pickup nobody mentioned." },
] as const;
const WITH = [
  { x: 3.5, y: 11.3, tag: "Find", body: "Search by order number or customer, and filter by status." },
  { x: 52, y: 24.5, ring: [23, 24.5, 40, 3.2], tag: "Status", body: "Every order says in words whether it is paid and whether it has shipped." },
  { x: 22, y: 96.8, ring: [50, 96.8, 46, 2.6], tag: "States", body: "Loading more, plus empty, no matches, couldn't load and offline screens." },
] as const;

/* Measurements shown when a hero phone is inspected, in pt at 390 wide, measured from the exported PNGs
   (pixel bounds divided by the export scale, rounded): search field height, and the distance from one
   order's name to the next. left/top/height are % of the full image. */
type Measure = { label: string; left: number; top: number; width?: number; height?: number; vertical?: boolean };
const INSPECT: Record<"with" | "without", Measure[]> = {
  without: [
    { label: "44", left: 3.2, top: 14.9, height: 4.9, vertical: true },
    { label: "70", left: 98.6, top: 32.1, height: 7.7, vertical: true },
  ],
  with: [
    { label: "44", left: 2.3, top: 9.3, height: 4.0, vertical: true },
    { label: "95", left: 98.4, top: 19.5, height: 8.6, vertical: true },
  ],
};

/* The second phone arrives at this point (ms); its markup follows it. */
const SECOND = 1900;

/* The six screens RYUX designed in the same benchmark run, cut from its exported board. 320 is the
   narrow-width check the board names; the others are 390 wide. */
const STATES = [
  { src: "/proof/states/1-completed.png", w: 502, h: 1239, name: "Completed", caption: "The full breakdown, a receipt to share, and a way to report a problem." },
  { src: "/proof/states/2-processing.png", w: 503, h: 1315, name: "Processing", caption: "Says the payment is on its way and asks people not to pay again." },
  { src: "/proof/states/3-failed.png", w: 503, h: 1287, name: "Failed", caption: "Says it didn't go through, and what to do if money left the account." },
  { src: "/proof/states/4-loading.png", w: 502, h: 1090, name: "Loading", caption: "Holds the layout while the details load, so nothing jumps." },
  { src: "/proof/states/5-couldnt-load.png", w: 503, h: 1090, name: "Couldn't load", caption: "Offers Try again, and says reloading doesn't change the payment." },
  { src: "/proof/states/6-narrow.png", w: 413, h: 1413, name: "320 wide", narrow: true, caption: "The narrowest phone, with a long merchant name and a large amount." },
];

/* A review RYUX ran on a real product: Plausible's public demo dashboard, 9 Oct 2026. Before/after values
   were measured in the browser (Playwright, DOM and accessibility tree). */
const PLAUSIBLE_RESULTS = [
  { what: "Tab height on a phone", before: "16px", after: "44px" },
  { what: "Controls with no name for screen readers", before: "1", after: "0" },
  { what: "Headings for the dashboard panels", before: "0", after: "6" },
  { what: "Words split in the middle at 390", before: "2", after: "0" },
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
        <h1 id="hero-title" className="text-[38px] leading-[1.02] font-semibold tracking-[-0.03em] sm:text-[56px] lg:text-[48px] xl:text-[56px]">
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
          list that is still loading, a search with no matches, or a page that fails to load, and nothing nobody asked for.
        </p>
        <div className="flex flex-wrap items-center gap-x-7 gap-y-3">
          <a href="#try" className="tactile inline-flex min-h-12 items-center gap-2.5 rounded-lg bg-accent px-6 text-[17px] font-semibold text-white">
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

/* Two whole phones. The first is marked first; the second slides in after it, then its marks and the
   390 redline draw. With reduced motion both are shown at rest, already marked. */
function HeroProof() {
  const phones = [
    {
      key: "without", label: "Without RYUX", count: "1 screen", src: "/cases/or-without.png", w: 780, h: 1812, tone: "mark" as const,
      marks: WITHOUT, start: 0,
      caption: "One screen, with order counts, deadlines and a 5 PM pickup nobody gave.",
    },
    {
      key: "with", label: "With RYUX", count: "1 of 9 screens", src: "/proof/orders-with.png", w: 340, h: 964, tone: "accent" as const,
      marks: WITH, start: SECOND,
      caption: "Find an order fast, and see what is paid and what still needs to ship.",
    },
  ];
  return (
    <figure className="flex flex-col gap-4">
      <p className="sr-only">
        The same prompt run twice: the orders list of a store&apos;s admin app, on mobile. Without RYUX the agent designed one
        screen with order counts, ship-by deadlines and a 5 PM pickup that nobody gave. With RYUX it designed nine screens; the
        default list lets people search and filter, and says in words whether each order is paid and shipped.
      </p>
      <Tilt className="grid grid-cols-2 items-start gap-4 sm:gap-6 lg:w-[404px]">
        {phones.map((ph) => (
          <div key={ph.key} className="phone-in flex min-w-0 flex-col gap-3" style={{ animationDelay: `${ph.start}ms` }}>
            <p aria-hidden className="flex flex-col gap-0.5 font-mono text-[12px] sm:flex-row sm:items-baseline sm:justify-between sm:gap-2">
              <span className={ph.tone === "mark" ? "text-mark" : "text-accent"}>{ph.label}</span>
              <span className="text-muted">{ph.count}</span>
            </p>
            <div
              tabIndex={0}
              aria-label={`${ph.label}: inspect the measurements of this screen`}
              className="inspect rounded-[30px] bg-ink p-[6px] shadow-[0_30px_60px_-30px_rgba(11,22,43,0.45)]"
            >
              <div aria-hidden className="relative overflow-hidden rounded-[24px] bg-white">
                <Image src={ph.src} alt="" width={ph.w} height={ph.h} priority className="w-full" />
                <div className="marks">
                  {ph.marks.map((m, i) => "ring" in m && (
                    <Ring key={m.body} x={m.ring[0]} y={m.ring[1]} w={m.ring[2]} h={m.ring[3]} tone={ph.tone} delay={ph.start + 600 + i * 450} />
                  ))}
                </div>
              </div>
              <div aria-hidden className="inspect-layer" style={{ inset: 6 }}>
                {INSPECT[ph.key as "with" | "without"].map((d) => (
                  <Dim
                    key={d.label}
                    label={d.label}
                    vertical={d.vertical}
                    style={d.vertical
                      ? { left: `${d.left}%`, top: `${d.top}%`, height: `${d.height}%`, transform: "translateX(-50%)" }
                      : { left: `${d.left}%`, top: `${d.top}%`, width: `${d.width}%`, transform: "translateY(-50%)" }}
                  />
                ))}
              </div>
              {ph.marks.map((m, i) => (
                <div key={m.body} className="pin-hit group/pin absolute z-10 -translate-x-1/2 -translate-y-1/2" style={{ left: `calc(6px + (100% - 12px) * ${m.x / 100})`, top: `calc(6px + (100% - 12px) * ${m.y / 100})` }}>
                  <div className="pin-in" style={{ animationDelay: `${ph.start + 500 + i * 450}ms` }}>
                    <Pin n={i + 1} tone={ph.tone} />
                  </div>
                  <span
                    role="tooltip"
                    className={`pointer-events-none absolute bottom-full mb-2 hidden w-[190px] rounded-md bg-ink px-2.5 py-2 text-[12px] leading-[1.4] text-white shadow-lg group-hover/pin:block ${m.x > 50 ? "right-0" : "left-0"}`}
                  >
                    <b className="font-semibold">{m.tag}.</b> {m.body}
                  </span>
                </div>
              ))}
            </div>
            {ph.key === "with" && (
              <div aria-hidden className="relative h-4">
                <Dim label="390" delay={SECOND + 1500} className="inset-x-0 top-0" />
              </div>
            )}
            <p className={`text-[13px] leading-[1.45] text-ink-2 ${ph.key === "without" ? "sm:pb-7" : ""}`}>{ph.caption}</p>
          </div>
        ))}
      </Tilt>
      <p aria-hidden className="font-mono text-[12px] text-muted">
        <span className="hint-pointer">Hover a screen to inspect it</span>
        <span className="hint-touch">Tap a screen to inspect it</span>
      </p>
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

        <div className="frames grid gap-12 [&>*]:min-w-0 xl:grid-cols-[260px_minmax(0,1fr)] xl:gap-14">
          {screens.map((sc) => (
            <figure key={sc.label} className="flex max-w-[260px] flex-col gap-4 sm:max-w-[300px]">
              <figcaption className="flex items-baseline justify-between gap-3 font-mono text-[13px]">
                <span className="text-mark-night">{sc.label}</span>
                <span className="text-night-sub">1 screen</span>
              </figcaption>
              <div className="relative">
                <Image src={sc.src} alt={sc.alt} width={sc.w} height={sc.h} className="w-full rounded-[18px]" />
                {sc.marks.map((m, i) => (
                  <div key={m.note}>
                    {m.ring && <Ring x={m.ring[0]} y={m.ring[1]} w={m.ring[2]} h={m.ring[3]} tone={sc.tone} delay={300 + i * 350} />}
                    <PinAt n={i + 1} x={m.x} y={m.y} tone={sc.tone} delay={200 + i * 350} />
                  </div>
                ))}
              </div>
              <ol className="flex flex-col gap-3">
                {sc.marks.map((m, i) => (
                  <li key={m.note} className="flex gap-2.5">
                    <Pin n={i + 1} tone={sc.tone} />
                    <p className="text-[14px] leading-[1.5] text-night-sub sm:text-[15px]">{m.note}</p>
                  </li>
                ))}
              </ol>
            </figure>
          ))}

          <div className="flex flex-col gap-16" style={{ ["--i" as string]: 1 } as React.CSSProperties}>
          <figure className="flex flex-col gap-4">
            <figcaption className="flex items-baseline justify-between gap-3 font-mono text-[13px]">
              <span className="text-accent-night">With RYUX</span>
              <span className="text-night-sub">6 screens</span>
            </figcaption>
            <ScrubStrip steps={STATES.map((st) => ({ name: st.name, caption: st.caption }))}>
              <ol className="frames flex w-max items-start gap-4">
                {STATES.map((st, i) => (
                  <li
                    key={st.name}
                    className="state-item flex shrink-0 flex-col gap-3"
                    style={{ ["--w" as string]: `${st.narrow ? 123 : 150}px`, ["--ar" as string]: (st.w / st.h).toFixed(3), ["--i" as string]: i + 2 } as React.CSSProperties}
                  >
                    <Image
                      src={st.src}
                      alt={`Screen ${i + 1} of 6, ${st.name}, designed with RYUX`}
                      width={st.w}
                      height={st.h}
                      className="w-full rounded-[12px]"
                    />
                    {(i === 0 || st.narrow) && (
                      <div className="relative h-4">
                        <Dim label={st.narrow ? "320" : "390"} night delay={500 + i * 110} className="inset-x-0 top-0" />
                      </div>
                    )}
                    <p className="font-mono text-[12px] leading-[1.4] text-night-sub">
                      <span className="text-night-text">{i + 1}</span> {st.name}
                    </p>
                  </li>
                ))}
              </ol>
            </ScrubStrip>
            <p className="max-w-[640px] text-[15px] leading-[1.55] text-night-sub">
              Processing tells people not to pay again. Failed says what to do next. Couldn&apos;t load offers Try again. The
              last one checks the narrowest phone, with long values.
            </p>
          </figure>

          <div className="grid gap-10 [&>*]:min-w-0 lg:grid-cols-[minmax(0,1fr)_minmax(0,300px)] lg:gap-14">
          <div className="flex flex-col gap-7">
            <p className="text-[21px] font-medium">Repeated three times. One dot per run.</p>
            <Scoreboard night />
          </div>
          <div className="flex flex-col gap-6 lg:pt-12">
            <p className="text-[16px] leading-[1.55]">
              <span className="font-semibold text-mark-night">What it did not change:</span> how good the screens look. In a
              blind visual test of a wallet home screen, RYUX scored 3.71 against 3.67 out of 5.
            </p>
            <Link href="/benchmarks" className="inline-flex min-h-11 items-center gap-2 self-start text-[17px] font-medium underline underline-offset-4">
              Read both benchmarks <Arrow />
            </Link>
          </div>
        </div>
          </div>
        </div>

        <p className="text-[14px] leading-[1.6] text-night-sub">
          How it was run: a fresh agent each time, the same model, no reference screens on either side, and sample data in
          every screen. The screens above are from the second pair, unedited; only the marks and measurements are ours. Three pairs is a small benchmark, not a study.
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
      <div className="max-w-[760px]">
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

      <RealProduct />

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

/* Analyze, Critique, Design and QA on a product that already exists. Values are measured, not estimated. */
function RealProduct() {
  return (
    <div className="grid gap-12 border-t border-hair pt-14 [&>*]:min-w-0 lg:grid-cols-[minmax(0,1fr)_minmax(0,620px)] lg:gap-20">
      <div className="flex flex-col gap-6">
        <p className="font-mono text-[13px] text-muted">On a real product</p>
        <h3 className="text-[28px] leading-[1.15] font-semibold tracking-[-0.02em] sm:text-[34px]">
          A review of a dashboard people already use.
        </h3>
        <p className="text-[17px] leading-[1.55] text-ink-2">
          RYUX analyzed and critiqued Plausible&apos;s public demo dashboard at 1440 and 390 wide, designed fixes for what it
          found, and checked them in the browser. The original is strong, so the fixes are small and most of it stays.
        </p>
        <dl className="frames border-t border-ink">
          {PLAUSIBLE_RESULTS.map((r, i) => (
            <div key={r.what} className="grid grid-cols-[1fr_auto] items-center gap-4 border-b border-hair py-3.5" style={{ ["--i" as string]: i } as React.CSSProperties}>
              <dt className="text-[15px] leading-[1.4] text-ink-2">{r.what}</dt>
              <dd className="flex items-center gap-2 font-mono text-[14px] tabular-nums">
                <span className="strike text-muted">{r.before}</span>
                <span aria-hidden className="text-muted">→</span>
                <span className="sr-only">changed to</span>
                <span className="after-in font-semibold text-ink">{r.after}</span>
              </dd>
            </div>
          ))}
        </dl>
        <p className="text-[13px] leading-[1.55] text-muted">
          Not affiliated with Plausible. Unsolicited study; the fixes are a prototype, not their product.
        </p>
      </div>

      <figure className="flex flex-col gap-4">
        <div className="frames grid gap-6 sm:grid-cols-2">
          <div className="flex flex-col gap-3">
            <p className="font-mono text-[12px] text-muted">Before · live, 9 Oct 2026</p>
            <div className="relative">
              <Image
                src="/cases/plausible/before-390.png"
                alt="Plausible's demo dashboard at 390 wide: the live visitor count shows only the number 202, with no label, and the key figures show percentage changes without saying what they compare with"
                width={390}
                height={338}
                className="w-full rounded-[10px] border border-hair"
              />
              <Ring x={21} y={6.8} w={20} h={9} tone="mark" delay={300} />
            </div>
          </div>
          <div className="flex flex-col gap-3" style={{ ["--i" as string]: 1 } as React.CSSProperties}>
            <p className="font-mono text-[12px] text-accent">After · RYUX prototype</p>
            <div className="relative">
              <Image
                src="/cases/plausible/after-390.png"
                alt="The same dashboard redesigned at 390 wide: the live count reads 201 current visitors, and a line above the key figures says the changes are versus the previous 28 days"
                width={390}
                height={378}
                className="w-full rounded-[10px] border border-hair"
              />
              <Ring x={79} y={5.6} w={40} h={8} tone="accent" delay={700} />
              <Ring x={28} y={31.2} w={46} h={6} tone="accent" delay={900} />
            </div>
            <div className="relative h-4">
              <Dim label="390" delay={1100} className="inset-x-0 top-0" />
            </div>
          </div>
        </div>
        <figcaption className="text-[14px] leading-[1.55] text-muted">
          At 390 the live count lost its label, and the percentage changes never said what they compare with. Both are
          back. The live counts differ because the two captures were taken at different times on the same day.
        </figcaption>
      </figure>
    </div>
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
      <SectionSpy ids={["proof", "how"]} />
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
