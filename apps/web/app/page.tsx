import Image from "next/image";
import Link from "next/link";
import { CopyCommand } from "@/components/copy-command";
import { WaitlistForm } from "@/components/waitlist-form";
import { Arrow, DOCS, Eyebrow, GUTTER, REPO, SiteFooter, SiteHeader } from "@/components/site";

/* Pins sit on the real benchmark screen; x and y are percentages of the image. */
const HERO_NOTES = [
  { x: 41, y: 16.5, tag: "State", body: "Diproses is one of six screens RYUX designed, not only Berhasil." },
  { x: 86, y: 43.8, tag: "Unknown", body: "Nobody gave a processing time, so it stays [REAL DATA] instead of a promise." },
  { x: 88, y: 93.7, tag: "Assumption", body: "No “Bagikan bukti” until the payment settles, written down as an assumption." },
];

const PAIRS = [
  { pair: "1", screens: "1 → 4", unknowns: "no → yes", invented: "1 → 0" },
  { pair: "2", screens: "1 → 6", unknowns: "no → yes", invented: "0 → 0" },
  { pair: "3 · shown", screens: "3 → 6", unknowns: "no → yes", invented: "1 → 0" },
];

const CAPABILITIES = [
  { name: "Analyze", body: "Understand what is already there: observed, inferred, unknown." },
  { name: "Design", body: "Turn context and evidence into decisions, each with a receipt." },
  { name: "Build", body: "Implement the decisions in your stack, without inventing rules or data." },
  { name: "Critique", body: "Challenge the design against UX and UI principles, with a fix for each finding." },
  { name: "QA", body: "Verify the build against the intent, at every width and state." },
];

const EVIDENCE_TERMS = [
  { term: "Screenshot", gloss: "" },
  { term: "+ Observation", gloss: "what it visibly does" },
  { term: "+ Pattern", gloss: "seen in N screens across M apps" },
  { term: "+ Context", gloss: "market, category, flow" },
  { term: "+ Designer note", gloss: "written by a person, never generated" },
];

const MARKS = [
  { mark: "Observed", meaning: "What we actually see.", example: "Body text is 16/24, read from the CSS." },
  { mark: "Inferred", meaning: "What we reasonably conclude, and say it is a guess.", example: "Probably an 8px spacing scale." },
  { mark: "Knowledge", meaning: "A known pattern or standard, cited.", example: "WCAG 1.4.3: text contrast at least 4.5:1." },
  { mark: "Unknown", meaning: "What nobody told us. It stays visible.", example: "[REAL DATA: perkiraan lama proses]" },
];

const CHAIN = ["Context", "Evidence", "Design reasoning", "Decision", "Interface", "Critique", "QA"];

/* Quoted from a real run (transaction detail, pair 2). */
const RECEIPT = [
  { key: "Decision", value: "“Kembali ke beranda” is primary; “Bagikan bukti” is secondary, stacked above it" },
  { key: "Options", value: "Share as primary · Home as primary · Both side by side, rejected under RX-PR-03" },
  { key: "Evidence", value: "None" },
  { key: "Confidence", value: "Medium" },
  { key: "Why", value: "Every user who arrives here has to leave. Only some need to share." },
  { key: "Trade-off", value: "Users who always share, to show the cashier, must look at the second button." },
  { key: "Assumption", value: "Most people leave rather than share. Check this with analytics." },
];

const BRIEFS = [
  {
    title: "Visual brief",
    fields: [
      ["Role", "What job does this visual do?"],
      ["Concept", "The visual thesis, in one sentence."],
      ["Subject", "The product's own idea, not a generic device."],
      ["Composition", "Where it sits, and the space kept for the copy."],
      ["Avoid", "The category clichés."],
    ],
  },
  {
    title: "Motion",
    fields: [
      ["Purpose", "What does the motion communicate?"],
      ["Trigger", "What causes it?"],
      ["Behavior", "What changes, and from where?"],
      ["Timing", "How fast, from one motion personality."],
      ["Reduced motion", "What happens when motion is off?"],
    ],
  },
];

/* The fields `ryux init` writes into DESIGN.md. */
const DESIGN_MD = [
  ["Product", "what it does, in one sentence"],
  ["Audience", ""],
  ["Market and locale", "for example Indonesia, id-ID, Rupiah"],
  ["Constraints", "platforms, accessibility target, what must not change"],
  ["Design intent", "what users should understand, feel, and do"],
  ["UX direction", ""],
  ["UI direction", "character, for example calm, trustworthy, restrained"],
  ["Motion direction", "feel, what motion communicates, what to avoid"],
];

/* Quoted from the same run's Delivery Gate. */
const GATE = [
  ["PRODUCT", "PASS", "open facts kept as [REAL DATA] … · evidence None"],
  ["EDGE CASES", "PASS", "Berhasil, Diproses, Gagal, loading, load error …"],
  ["ACCESSIBILITY", "PASS", "checked by eye, no automated audit"],
  ["CODE QUALITY", "N/A", "design only, no code"],
  ["FINAL", "PASS", "design stage only"],
];

const INSTALL = [
  { label: "Any agent, via skills.sh", commands: ["npx skills add ryuxdsgn/design-intelligence"], inClaude: false },
  { label: "The RYUX CLI, with DESIGN.md", commands: ["npx @ryuxdsgn/ryux init --agent claude"], inClaude: false },
  {
    label: "Claude Code plugin, inside Claude Code",
    commands: ["/plugin marketplace add ryuxdsgn/design-intelligence", "/plugin install ryux@design-intelligence"],
    inClaude: true,
  },
];

const AGENTS = "Claude Code, Codex, Cursor, Gemini CLI, OpenCode, Cline, GitHub Copilot, Amp, Kimi Code, Antigravity";

function Pin({ n }: { n: number }) {
  return (
    <span className="flex size-6 shrink-0 items-center justify-center rounded-full border-[1.5px] border-mark bg-paper font-mono text-[11px] font-semibold text-mark">
      {n}
    </span>
  );
}

function Hero() {
  return (
    <section aria-labelledby="hero-title" className={`${GUTTER} grid [&>*]:min-w-0 items-center gap-16 py-16 lg:grid-cols-[1fr_auto] lg:gap-20 lg:py-24`}>
      <div className="flex flex-col gap-7">
        <Eyebrow>RYUX — DESIGN INTELLIGENCE FOR AI</Eyebrow>
        <h1 id="hero-title" className="font-display text-[64px] leading-[0.95] tracking-[-0.02em] sm:text-[88px] xl:text-[112px] xl:leading-[0.92]">
          Understand before you design.
        </h1>
        <p className="max-w-[560px] text-[19px] leading-[1.5] text-ink-2 sm:text-[21px]">
          AI can generate an interface in seconds. RYUX makes it reason first: what it observed, what it inferred, and
          what it still doesn't know.
        </p>
        <div className="flex flex-wrap items-center gap-x-7 gap-y-4 pt-2">
          <a href="#try" className="inline-flex min-h-12 items-center gap-2.5 rounded-md bg-ink px-6 text-[17px] font-semibold text-paper hover:opacity-90">
            Try RYUX <Arrow />
          </a>
          <a href="#proof" className="inline-flex min-h-12 items-center gap-1.5 text-[17px] font-medium underline underline-offset-4">
            See the proof <Arrow down />
          </a>
        </div>
        <div className="max-w-[480px]">
          <CopyCommand command="npx skills add ryuxdsgn/design-intelligence" />
        </div>
      </div>

      <figure className="mx-auto w-full max-w-[300px] lg:mx-0 lg:mr-[280px] lg:w-[300px]">
        <div className="relative">
          <Image
            src="/proof/td-with.png"
            alt="A pending payment screen designed with RYUX: status Diproses, Rp252.500, a note telling the user not to pay again, and the processing time left as [REAL DATA: perkiraan lama proses]"
            width={786}
            height={1780}
            priority
            className="w-full rounded-[22px] border border-hair"
          />
          {HERO_NOTES.map((note, i) => (
            <div key={note.tag} className="absolute" style={{ left: `${note.x}%`, top: `${note.y}%` }}>
              <div className="-translate-x-1/2 -translate-y-1/2">
                <Pin n={i + 1} />
              </div>
              <span
                aria-hidden
                className="absolute top-0 hidden h-px bg-mark lg:block"
                style={{ left: 12, width: `calc(${(300 * (100 - note.x)) / 100}px + 28px)` }}
              />
              <div className="absolute -top-3 hidden w-[220px] lg:block" style={{ left: `calc(${(300 * (100 - note.x)) / 100}px + 48px)` }}>
                <p className="font-mono text-[12px] font-semibold tracking-[0.1em] text-mark uppercase">{note.tag}</p>
                <p className="mt-1.5 text-[15px] leading-[1.4] text-ink-2">{note.body}</p>
              </div>
            </div>
          ))}
        </div>
        <ol className="mt-6 flex flex-col gap-4 lg:hidden">
          {HERO_NOTES.map((note, i) => (
            <li key={note.tag} className="flex gap-3">
              <Pin n={i + 1} />
              <p className="text-[15px] leading-[1.45] text-ink-2">
                <span className="font-mono text-[12px] font-semibold tracking-[0.1em] text-mark uppercase">{note.tag}</span>
                <br />
                {note.body}
              </p>
            </li>
          ))}
        </ol>
        <figcaption className="mt-5 font-mono text-[12px] text-muted">
          Real output from a RYUX 2.3.3 benchmark run. Sample data.
        </figcaption>
      </figure>
    </section>
  );
}

function Proof() {
  const screens = [
    {
      label: "Without RYUX",
      src: "/proof/td-without.png",
      w: 788,
      h: 1768,
      tag: "Invented",
      body: "“Biasanya selesai dalam beberapa menit.” A processing time, and an auto-update, nobody gave it.",
      alt: "The pending screen designed without RYUX, promising that the payment usually completes within a few minutes and that the status updates by itself",
    },
    {
      label: "With RYUX",
      src: "/proof/td-with.png",
      w: 786,
      h: 1780,
      tag: "Kept unknown",
      body: "“[REAL DATA: perkiraan lama proses]”. It also designed loading, failed to load, and a narrow screen.",
      alt: "The pending screen designed with RYUX, with the processing time left as a [REAL DATA] marker",
    },
  ];
  return (
    <section id="proof" aria-labelledby="proof-title" className="bg-night text-night-text">
      <div className={`${GUTTER} flex flex-col gap-14 py-20 lg:py-30`}>
        <div className="grid [&>*]:min-w-0 gap-10 lg:grid-cols-[1fr_420px] lg:items-end lg:gap-20">
          <div className="flex flex-col gap-5">
            <Eyebrow night>THE PROOF · SAME PROMPT, SAME AGENT, ONE HAS RYUX</Eyebrow>
            <h2 id="proof-title" className="font-display text-[44px] leading-none sm:text-[68px]">
              RYUX makes AI reason about states, not just the happy path.
            </h2>
          </div>
          <div className="flex flex-col gap-2.5 border-l border-night-hair pl-5">
            <p className="font-mono text-[12px] tracking-[0.1em] text-night-sub">PROMPT, IDENTICAL FOR BOTH</p>
            <p className="text-[18px] leading-[1.45]">
              “Design a transaction detail page for a fintech app, shown after the user pays. Make it in pen.dev.”
            </p>
          </div>
        </div>

        <div className="grid [&>*]:min-w-0 gap-12 lg:grid-cols-[300px_300px_1fr] lg:gap-12">
          <div className="grid [&>*]:min-w-0 grid-cols-2 gap-5 sm:gap-8 lg:contents">
            {screens.map((s) => (
              <figure key={s.label} className="flex flex-col gap-4 sm:gap-5">
                <figcaption className="font-mono text-[13px] font-semibold tracking-[0.1em] uppercase">{s.label}</figcaption>
                <Image src={s.src} alt={s.alt} width={s.w} height={s.h} className="w-full rounded-[20px]" />
                <div>
                  <p className="font-mono text-[12px] font-semibold tracking-[0.1em] text-mark-night uppercase">{s.tag}</p>
                  <p className="mt-2 text-[15px] leading-[1.45] text-night-sub sm:text-[16px]">{s.body}</p>
                </div>
              </figure>
            ))}
          </div>

          <div className="flex flex-col gap-7 lg:pt-11 lg:pl-6">
            <p className="text-[22px] font-medium">Three pairs. Counted from the outputs.</p>
            <table className="w-full text-left">
              <caption className="sr-only">Without RYUX compared with RYUX, per pair</caption>
              <thead>
                <tr className="border-b border-night-hair font-mono text-[12px] tracking-[0.1em] text-night-sub uppercase">
                  <th scope="col" className="py-3.5 pr-3 font-normal">Pair</th>
                  <th scope="col" className="py-3.5 pr-3 font-normal">Screens</th>
                  <th scope="col" className="py-3.5 pr-3 font-normal">Unknowns marked</th>
                  <th scope="col" className="py-3.5 font-normal">Invented rules</th>
                </tr>
              </thead>
              <tbody className="text-[16px] sm:text-[17px]">
                {PAIRS.map((p) => (
                  <tr key={p.pair} className="border-b border-night-hair">
                    <th scope="row" className="py-3.5 pr-3 font-normal">{p.pair}</th>
                    <td className="py-3.5 pr-3">{p.screens}</td>
                    <td className="py-3.5 pr-3">{p.unknowns}</td>
                    <td className="py-3.5">{p.invented}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="text-[17px] leading-[1.5] text-night-sub">
              Without RYUX → with RYUX. In 3 of 3 pairs RYUX designed more states and marked what it did not know.
              Without it, the agent invented a business rule in 2 of 3.
            </p>
            <div className="flex flex-col gap-2.5 rounded-lg border border-night-hair p-5">
              <p className="font-mono text-[12px] font-semibold tracking-[0.1em] text-mark-night uppercase">What RYUX did not do</p>
              <p className="text-[16px] leading-[1.45]">
                Make screens prettier. In a blind visual test across three pairs it scored 3.71 against 3.67, and was never
                more restrained.
              </p>
            </div>
            <Link href="/benchmarks" className="inline-flex min-h-11 items-center gap-2 self-start text-[17px] font-medium underline underline-offset-4">
              Read the benchmarks <Arrow />
            </Link>
          </div>
        </div>

        <p className="font-mono text-[12px] leading-[1.6] text-night-sub">
          No RYUX MCP in any run, so no reference screens: every decision is evidence None. Same model, fresh agent per run.
          A small benchmark, not a study.
        </p>
      </div>
    </section>
  );
}

function WhatRyuxDoes() {
  return (
    <section id="what" aria-labelledby="what-title" className={`${GUTTER} flex flex-col gap-14 py-20 lg:py-30`}>
      <div className="grid [&>*]:min-w-0 gap-8 lg:grid-cols-[1fr_420px] lg:items-end lg:gap-20">
        <div className="flex flex-col gap-5">
          <Eyebrow>WHAT RYUX DOES</Eyebrow>
          <h2 id="what-title" className="font-display text-[44px] leading-[1.02] sm:text-[60px]">
            One skill. Five capabilities, in the order a designer works.
          </h2>
        </div>
        <p className="text-[18px] leading-[1.5] text-ink-2">
          Tell RYUX what you are doing. It reads only the design knowledge the task needs, and ends every task at a
          quality gate.
        </p>
      </div>
      <ol className="grid [&>*]:min-w-0 border-t border-ink sm:grid-cols-2 lg:grid-cols-5">
        {CAPABILITIES.map((c, i) => (
          <li key={c.name} className={`flex flex-col gap-3.5 border-hair pt-7 pb-8 lg:pr-6 ${i ? "lg:border-l lg:pl-6" : ""} border-b lg:border-b-0`}>
            <span className="font-mono text-[13px] text-mark">{String(i + 1).padStart(2, "0")}</span>
            <h3 className="font-display text-[40px] leading-none">{c.name}</h3>
            <p className="text-[16px] leading-[1.5] text-ink-2">{c.body}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}

function Evidence() {
  return (
    <section id="evidence" aria-labelledby="evidence-title" className="bg-paper-2">
      <div className={`${GUTTER} grid [&>*]:min-w-0 gap-16 py-20 lg:grid-cols-[520px_1fr] lg:gap-24 lg:py-30`}>
        <div className="flex flex-col gap-7">
          <Eyebrow>EVIDENCE</Eyebrow>
          <h2 id="evidence-title" className="font-display text-[44px] leading-[1.02] sm:text-[56px]">
            AI shouldn't design from imagination when evidence is available.
          </h2>
          <dl className="flex flex-col gap-1.5 py-2">
            {EVIDENCE_TERMS.map((t) => (
              <div key={t.term} className="flex flex-wrap items-baseline gap-x-3">
                <dt className="text-[19px] font-medium">{t.term}</dt>
                {t.gloss && <dd className="font-mono text-[12px] text-muted">{t.gloss}</dd>}
              </div>
            ))}
            <div className="mt-2.5 border-t border-ink pt-2.5">
              <dt className="font-display text-[34px]">= Evidence</dt>
            </div>
          </dl>
          <p className="text-[15px] leading-[1.5] text-muted">
            RYUX Knowledge is in pilot: the capture and review pipeline works, the library is still small, and the hosted
            MCP is not live yet. Until then RYUX says the evidence is None instead of inventing a reference.
          </p>
        </div>
        <div className="lg:pt-14">
          <h3 className="text-[22px] font-medium">Every claim carries its mark.</h3>
          <dl className="mt-2">
            {MARKS.map((m) => (
              <div key={m.mark} className="grid [&>*]:min-w-0 gap-2 border-b border-hair py-6 sm:grid-cols-[140px_1fr_280px] sm:gap-8">
                <dt className="font-mono text-[13px] font-semibold tracking-[0.1em] text-mark uppercase">{m.mark}</dt>
                <dd className="text-[18px] leading-[1.4]">{m.meaning}</dd>
                <dd className="font-mono text-[13px] leading-[1.5] text-ink-2">{m.example}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
}

function DesignIntelligence() {
  return (
    <section id="how" aria-labelledby="how-title" className={`${GUTTER} grid [&>*]:min-w-0 items-center gap-16 py-20 lg:grid-cols-[1fr_520px] lg:gap-24 lg:py-30`}>
      <div className="flex flex-col gap-7">
        <Eyebrow>DESIGN INTELLIGENCE</Eyebrow>
        <h2 id="how-title" className="font-display text-[44px] leading-[1.02] sm:text-[56px]">
          AI can generate interfaces. RYUX helps it reason about them.
        </h2>
        <ol>
          {CHAIN.map((s, i) => (
            <li key={s} className="flex items-center gap-4 border-b border-hair py-3">
              <span className="font-mono text-[12px] text-muted">{String(i + 1).padStart(2, "0")}</span>
              <span className={`text-[19px] ${s === "Decision" ? "font-semibold" : ""}`}>{s}</span>
            </li>
          ))}
        </ol>
      </div>
      <figure className="rounded-[4px] border border-hair bg-[#fbf9f4] px-6 py-7 shadow-[0_12px_32px_rgba(22,20,15,0.08)] sm:px-8">
        <div className="flex items-center justify-between border-b border-ink pb-4.5">
          <p className="font-mono text-[13px] font-semibold tracking-[0.12em]">DECISION RECEIPT</p>
          <p className="font-mono text-[12px] text-muted">real run · pair 2</p>
        </div>
        <dl>
          {RECEIPT.map((r) => (
            <div key={r.key} className="grid [&>*]:min-w-0 grid-cols-[96px_1fr] gap-5 border-b border-hair py-3.5 sm:grid-cols-[110px_1fr]">
              <dt className="font-mono text-[13px] text-muted">{r.key}</dt>
              <dd className={`text-[16px] leading-[1.4] ${r.key === "Evidence" ? "text-mark" : ""}`}>{r.value}</dd>
            </div>
          ))}
        </dl>
        <figcaption className="pt-4 font-mono text-[12px] leading-[1.5] text-muted">
          Quoted from a real run. Evidence None, and it says so: a judgment call stays a judgment call.
        </figcaption>
      </figure>
    </section>
  );
}

function CreativeDirection() {
  return (
    <section aria-labelledby="creative-title" className="bg-night text-night-text">
      <div className={`${GUTTER} flex flex-col gap-14 py-20 lg:py-30`}>
        <div className="grid [&>*]:min-w-0 gap-8 lg:grid-cols-[1fr_420px] lg:items-end lg:gap-20">
          <div className="flex flex-col gap-5">
            <Eyebrow night>CREATIVE DIRECTION</Eyebrow>
            <h2 id="creative-title" className="font-display text-[44px] leading-none sm:text-[64px]">
              Don't make it look less AI. Make it look more intentional.
            </h2>
          </div>
          <p className="text-[18px] leading-[1.5] text-night-sub">
            Illustration, ornament, and motion start from a purpose and a brief, then go to the generator. RYUX directs; it
            is not the generator.
          </p>
        </div>
        <div className="grid [&>*]:min-w-0 gap-12 lg:grid-cols-2">
          {BRIEFS.map((b) => (
            <div key={b.title} className="border-t border-night-hair pt-5">
              <h3 className="font-mono text-[13px] tracking-[0.12em] text-mark-night uppercase">{b.title}</h3>
              <dl className="mt-4">
                {b.fields.map(([k, v]) => (
                  <div key={k} className="grid [&>*]:min-w-0 grid-cols-[130px_1fr] gap-5 border-b border-night-hair py-3 sm:grid-cols-[150px_1fr]">
                    <dt className="text-[16px] font-medium">{k}</dt>
                    <dd className="text-[16px] leading-[1.4] text-night-sub">{v}</dd>
                  </div>
                ))}
              </dl>
            </div>
          ))}
        </div>
        <p className="font-mono text-[12px] leading-[1.6] text-night-sub">
          A method, not a guarantee: in our visual benchmark RYUX did not make screens consistently better.{" "}
          <Link href="/benchmarks#wallet-home" className="underline underline-offset-4 hover:text-night-text">
            See benchmark 02
          </Link>
          .
        </p>
      </div>
    </section>
  );
}

function DesignMd() {
  return (
    <section aria-labelledby="designmd-title" className={`${GUTTER} grid [&>*]:min-w-0 items-center gap-16 py-20 lg:grid-cols-[1fr_560px] lg:gap-24 lg:py-30`}>
      <div className="flex flex-col gap-7">
        <Eyebrow>DESIGN.MD</Eyebrow>
        <h2 id="designmd-title" className="font-display text-[44px] leading-[1.02] sm:text-[56px]">
          Give RYUX the world it is designing in.
        </h2>
        <p className="max-w-[520px] text-[18px] leading-[1.5] text-ink-2">
          DESIGN.md tells RYUX what world it is designing in. RYUX decides what to do in that world. Anything left blank
          stays unknown; RYUX asks only when the answer would change a major decision.
        </p>
        <div className="max-w-[480px]">
          <CopyCommand command="npx @ryuxdsgn/ryux init --agent claude" />
        </div>
      </div>
      <figure className="overflow-hidden rounded-md border border-hair bg-[#fbf9f4]">
        <div className="flex items-center justify-between border-b border-hair px-5 py-3 font-mono text-[12px] text-muted">
          <span>DESIGN.md</span>
          <span>written by ryux init</span>
        </div>
        <pre className="overflow-x-auto px-5 py-5 font-mono text-[13px] leading-[1.9] whitespace-pre-wrap">
          <span className="text-muted">## RYUX project context{"\n\n"}</span>
          {DESIGN_MD.map(([k, hint]) => (
            <span key={k}>
              - **{k}**:{hint && <span className="text-muted"> ({hint})</span>}
              {"\n"}
            </span>
          ))}
        </pre>
      </figure>
    </section>
  );
}

function QualityGates() {
  return (
    <section aria-labelledby="gates-title" className="bg-paper-2">
      <div className={`${GUTTER} grid [&>*]:min-w-0 gap-16 py-20 lg:grid-cols-[1fr_640px] lg:gap-24 lg:py-30`}>
        <div className="flex flex-col gap-7">
          <Eyebrow>QUALITY GATES</Eyebrow>
          <h2 id="gates-title" className="font-display text-[44px] leading-[1.02] sm:text-[56px]">
            Good design isn't just generated. It is challenged before delivery.
          </h2>
          <p className="font-mono text-[15px] text-ink-2">Design → Critique → Anti-Slop → QA</p>
          <p className="max-w-[520px] text-[18px] leading-[1.5] text-ink-2">
            Anti-slop runs last, as a gate, not as the design process. The Delivery Gate reports PASS, FAIL, or N/A for ten
            areas, and claims only what was checked.
          </p>
        </div>
        <figure>
          <pre className="overflow-x-auto rounded-md bg-night px-5 py-6 font-mono text-[13px] leading-[1.9] text-night-text">
            {GATE.map(([area, result, note]) => (
              <span key={area}>
                <span className="text-night-sub">{area.padEnd(15)}</span>
                <span className={result === "N/A" ? "text-night-sub" : ""}>{result.padEnd(6)}</span>
                <span className="text-night-sub">· {note}</span>
                {"\n"}
              </span>
            ))}
          </pre>
          <figcaption className="mt-4 font-mono text-[12px] leading-[1.5] text-muted">
            Five of ten areas, quoted from the same benchmark run; “…” marks a cut. FINAL PASS meant design stage only, and it said so.
          </figcaption>
        </figure>
      </div>
    </section>
  );
}

function TryRyux() {
  return (
    <section id="try" aria-labelledby="try-title" className="bg-night text-night-text">
      <div className={`${GUTTER} grid [&>*]:min-w-0 gap-16 py-20 lg:grid-cols-[1fr_560px] lg:gap-24 lg:py-30`}>
        <div className="flex flex-col gap-7">
          <Eyebrow night>TRY RYUX</Eyebrow>
          <h2 id="try-title" className="font-display text-[56px] leading-none sm:text-[88px]">
            Try RYUX.
          </h2>
          <p className="max-w-[520px] text-[18px] leading-[1.5] text-night-sub">
            One skill, installed into the agent you already use: {AGENTS}.
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
              <p className="font-mono text-[12px] tracking-[0.1em] text-night-sub uppercase">{label}</p>
              {commands.map((cmd) => (
                <CopyCommand key={cmd} command={cmd} night prompt={inClaude ? "" : "$"} />
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Waitlist() {
  return (
    <section id="waitlist" aria-labelledby="waitlist-title" className={`${GUTTER} grid [&>*]:min-w-0 gap-10 py-20 lg:grid-cols-[1fr_520px] lg:gap-24`}>
      <div className="flex flex-col gap-4">
        <h2 id="waitlist-title" className="font-display text-[40px] leading-[1.05]">
          The reference library is coming.
        </h2>
        <p className="max-w-[520px] text-[17px] leading-[1.5] text-ink-2">
          The skill is free and works today. The hosted MCP with reviewed screens and designer notes is not live yet. Leave
          your email to hear when it opens.
        </p>
      </div>
      <WaitlistForm />
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
        <WhatRyuxDoes />
        <Evidence />
        <DesignIntelligence />
        <CreativeDirection />
        <DesignMd />
        <QualityGates />
        <TryRyux />
        <Waitlist />
      </main>
      <SiteFooter />
    </>
  );
}
