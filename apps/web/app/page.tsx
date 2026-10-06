import Image from "next/image";
import Link from "next/link";
import { CopyCommand } from "@/components/copy-command";
import { Reveal } from "@/components/reveal";
import { BeforeAfter } from "@/components/before-after";
import { WaitlistForm } from "@/components/waitlist-form";
import { Arrow, DOCS, Eyebrow, GUTTER, REPO, SiteFooter, SiteHeader } from "@/components/site";

/* Pins sit on the real benchmark screen; x and y are percentages of the image. */
const HERO_NOTES = [
  { x: 69, y: 20.7, tag: "State", body: "Processing is one of six screens RYUX designed, not only Completed." },
  { x: 72, y: 35.6, tag: "Assumption", body: "Live updates are not confirmed, so RYUX lists this line as an assumption to check." },
  { x: 58, y: 75.4, tag: "Unknown", body: "Nobody chose a currency, so it stays [CUR] instead of a made-up dollar sign." },
];

const SUMMARY = [
  { measure: "Screens designed, per run", without: "1, 1, 1", with: "6, 6, 6" },
  { measure: "Currency", without: "Dollars, 3 of 3", with: "Left open, 3 of 3" },
  { measure: "Made-up business rules", without: "2 of 3 runs", with: "0 of 3 runs" },
  { measure: "Features nobody asked for", without: "3 of 3 runs", with: "0 of 3 runs" },
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

function Pin({ n }: { n: number }) {
  return (
    <span className="flex size-6 shrink-0 items-center justify-center rounded-full border-[1.5px] border-mark bg-white font-mono text-[11px] font-semibold text-mark">
      {n}
    </span>
  );
}

function Hero() {
  return (
    <section aria-labelledby="hero-title" className={`${GUTTER} grid items-center gap-16 py-16 [&>*]:min-w-0 lg:grid-cols-[1fr_auto] lg:gap-20 lg:py-24`}>
      <div className="flex flex-col gap-7">
        <Eyebrow>Design intelligence for AI agents</Eyebrow>
        <h1 id="hero-title" className="text-[52px] leading-[1] font-semibold tracking-[-0.035em] sm:text-[76px] xl:text-[92px]">
          {"Understand before you design.".split(" ").map((w, i) => (
            <span key={w} className="word-in inline-block" style={{ animationDelay: `${i * 90}ms` }}>
              {w}&nbsp;
            </span>
          ))}
        </h1>
        <p className="max-w-[580px] text-[19px] leading-[1.55] text-ink-2">
          RYUX is a skill you add to your AI agent. Before it designs, it writes down what it observed, what it is guessing,
          and what nobody told it, and it keeps those unknowns on the screen instead of filling them in.
        </p>
        <div className="flex flex-wrap items-center gap-x-7 gap-y-4 pt-1">
          <a href="#try" className="inline-flex min-h-12 items-center gap-2.5 rounded-lg bg-accent px-6 text-[17px] font-semibold text-white hover:opacity-90">
            Install RYUX <Arrow />
          </a>
          <a href="#proof" className="inline-flex min-h-12 items-center gap-1.5 text-[17px] font-medium underline underline-offset-4">
            See the benchmark <Arrow down />
          </a>
        </div>
      </div>

      <figure className="mx-auto w-full max-w-[300px] lg:mx-0 lg:mr-[280px] lg:w-[300px]">
        <div className="relative">
          <Image
            src="/proof/en-td-with.png"
            alt="A processing payment screen designed with RYUX: the status Processing, the amount shown as [CUR] 49.00 because no currency was chosen, a note asking the user not to pay again, and the transaction details"
            width={789}
            height={2050}
            priority
            className="w-full rounded-[22px] border border-hair"
          />
          {HERO_NOTES.map((note, i) => (
            <div key={note.tag} className="absolute" style={{ left: `${note.x}%`, top: `${note.y}%` }}>
              <div className="-translate-x-1/2 -translate-y-1/2">
                <div className="pin-in" style={{ animationDelay: `${500 + i * 450}ms` }}>
                  <Pin n={i + 1} />
                </div>
              </div>
              <span
                aria-hidden
                className="draw-x absolute top-0 hidden h-px bg-mark lg:block"
                style={{ left: 12, width: `calc(${(300 * (100 - note.x)) / 100}px + 28px)`, animationDelay: `${650 + i * 450}ms` }}
              />
              <div className="note-in absolute -top-3 hidden w-[220px] lg:block" style={{ left: `calc(${(300 * (100 - note.x)) / 100}px + 48px)`, animationDelay: `${900 + i * 450}ms` }}>
                <p className="text-[13px] font-semibold text-mark">{note.tag}</p>
                <p className="mt-1 text-[15px] leading-[1.45] text-ink-2">{note.body}</p>
              </div>
            </div>
          ))}
        </div>
        <ol className="mt-6 flex flex-col gap-4 lg:hidden">
          {HERO_NOTES.map((note, i) => (
            <li key={note.tag} className="flex gap-3">
              <Pin n={i + 1} />
              <p className="text-[15px] leading-[1.45] text-ink-2">
                <span className="font-semibold text-mark">{note.tag}.</span> {note.body}
              </p>
            </li>
          ))}
        </ol>
              </figure>
    </section>
  );
}

function Proof() {
  const screens = [
    {
      label: "Without RYUX",
      src: "/proof/en-td-without.png",
      w: 780,
      h: 1926,
      tag: "Made up",
      body: "“Report it within 30 days.” A dollar currency, a 30-day window, and a Save PDF button that nobody asked for.",
      alt: "The completed payment screen designed without RYUX: $24.50 paid to a coffee shop, the wallet balance, a promise to look into problems reported within 30 days, and Save PDF and Share receipt buttons",
    },
    {
      label: "With RYUX",
      src: "/proof/en-td-with-completed.png",
      w: 791,
      h: 1931,
      tag: "Left open",
      body: "“[CUR] 49.00.” The currency stays open, and five more screens: processing, failed, loading, a load error, and a narrow width.",
      alt: "The completed payment screen designed with RYUX: [CUR] 49.00 paid to [Merchant name], with the fee and total shown and only the actions that were asked for",
    },
  ];
  return (
    <section id="proof" aria-labelledby="proof-title" className="bg-night text-night-text">
      <Reveal className={`${GUTTER} flex flex-col gap-14 py-20 lg:py-28`}>
        <div className="grid gap-10 [&>*]:min-w-0 lg:grid-cols-[1fr_420px] lg:items-end lg:gap-20">
          <div className="flex flex-col gap-5">
            <Eyebrow night>Benchmark · same prompt, same agent, one with RYUX</Eyebrow>
            <h2 id="proof-title" className="text-[38px] leading-[1.08] font-semibold tracking-[-0.03em] sm:text-[52px]">
              Six screens. Unknowns left open.
            </h2>
            <p className="max-w-[620px] text-[18px] leading-[1.55] text-night-sub">
              With RYUX the agent asked first, designed every state around the payment, and left the currency open instead
              of picking one.
            </p>
          </div>
          <div className="flex flex-col gap-2.5 border-l border-night-hair pl-5">
            <p className="text-[14px] text-night-sub">The prompt, identical for both</p>
            <p className="text-[18px] leading-[1.45]">
              “Design a transaction detail page for a fintech app, shown after the user pays. Make it in pen.dev.”
            </p>
          </div>
        </div>

        <div className="grid gap-12 [&>*]:min-w-0 xl:grid-cols-[300px_300px_1fr]">
          <div className="grid max-w-[680px] grid-cols-2 gap-5 [&>*]:min-w-0 sm:gap-8 xl:contents">
            {screens.map((s) => (
              <figure key={s.label} className="flex flex-col gap-4">
                <figcaption className="text-[15px] font-semibold">{s.label}</figcaption>
                <Image src={s.src} alt={s.alt} width={s.w} height={s.h} className="w-full rounded-[20px]" />
                <div>
                  <p className="text-[14px] font-semibold text-mark-night">{s.tag}</p>
                  <p className="mt-1.5 text-[15px] leading-[1.5] text-night-sub sm:text-[16px]">{s.body}</p>
                </div>
              </figure>
            ))}
          </div>

          <div className="flex flex-col gap-7 xl:pt-10 xl:pl-6">
            <p className="text-[21px] font-medium">Repeated three times, counted from the outputs.</p>
            <table className="w-full text-left">
              <caption className="sr-only">Three paired runs, without and with RYUX</caption>
              <thead>
                <tr className="border-b border-night-hair text-[14px] text-night-sub">
                  <th scope="col" className="py-3 pr-3 font-normal"><span className="sr-only">Measure</span></th>
                  <th scope="col" className="py-3 pr-3 font-normal">Without RYUX</th>
                  <th scope="col" className="py-3 font-normal">With RYUX</th>
                </tr>
              </thead>
              <tbody className="stagger text-[16px] sm:text-[17px]">
                {SUMMARY.map((r) => (
                  <tr key={r.measure} className="border-b border-night-hair">
                    <th scope="row" className="py-3.5 pr-3 font-normal text-night-sub">{r.measure}</th>
                    <td className="py-3.5 pr-3 sm:whitespace-nowrap">{r.without}</td>
                    <td className="py-3.5 font-semibold sm:whitespace-nowrap">{r.with}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="text-[16px] leading-[1.55] text-night-sub">
              Without RYUX the agent asked nothing and filled every gap itself. With RYUX it asked three questions and kept
              what was still undecided visible.
            </p>
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
          <Eyebrow>Before and after</Eyebrow>
          <h2 id="cases-title" className="text-[38px] leading-[1.08] font-semibold tracking-[-0.03em] sm:text-[52px]">
            Same brief. Drag to see what changes.
          </h2>
          <p className="text-[18px] leading-[1.55] text-ink-2">
            Each pair is one brief given to the same agent twice, once without RYUX and once with it, on an earlier release
            with sample data. The screen text was translated into English from the original runs.
          </p>
        </div>
        <BeforeAfter />
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
          <p className="text-[17px] leading-[1.55] text-ink-2">
            RYUX keeps what it saw apart from what it is guessing, and leaves what nobody told it in plain sight. These are
            the labels it uses.
          </p>
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
