import type { Metadata } from "next";
import Image from "next/image";
import { Eyebrow, GUTTER, REPO, SiteFooter, SiteHeader } from "@/components/site";
import { Reveal } from "@/components/reveal";
import { CompareHandle, Pipeline } from "@/components/pipeline";
import { Scoreboard } from "@/components/scoreboard";

export const metadata: Metadata = {
  title: "Benchmarks · RYUX",
  description:
    "One screen through RYUX's five steps in one session, then paired runs with and without RYUX: what changed, what RYUX got wrong, and what we learned.",
};

const MARKS = [
  { mark: "Observed", meaning: "Seen in the design or read from its values.", example: "Body text is 16/24, read from the CSS." },
  { mark: "Inferred", meaning: "A reasonable guess, labeled as one.", example: "Probably an 8px spacing scale." },
  { mark: "Knowledge", meaning: "A known pattern or standard, cited.", example: "WCAG 1.4.3: text contrast at least 4.5:1." },
  { mark: "Unknown", meaning: "Something nobody said. It stays visible.", example: "[CUR] 49.00, currency not decided" },
];

const METHOD = [
  "A fresh session per run, the same model, pen.dev. RYUX 2.3.3 is the only difference.",
  "No RYUX MCP, so no reference screens: every decision in every run is evidence None.",
  "Three pairs per task. Questions answered from one fixed fact sheet for both sides.",
  "Counts are ours, from the outputs. A small benchmark, not a study.",
];

const TD_ROWS: [string, ...string[]][] = [
  ["Screens designed", "1", "6", "1", "6", "1", "6"],
  ["Features nobody asked for", "2", "0", "3", "0", "5", "0"],
  ["Made-up business rules", "1", "0", "1", "0", "0", "0"],
  ["Questions asked", "0", "3", "0", "3", "0", "3"],
  ["Decision receipts", "none", "yes", "none", "yes", "none", "yes"],
  ["Currency", "USD, assumed", "[CUR]", "USD, assumed", "[CUR]", "USD, assumed", "[CUR]"],
];

const WALLET_ROWS = [
  { pair: "1", without: "3.25", with: "4.00", diff: "+0.75" },
  { pair: "2", without: "4.38", with: "3.13", diff: "−1.25" },
  { pair: "3", without: "3.38", with: "4.00", diff: "+0.63" },
  { pair: "Mean", without: "3.67", with: "3.71", diff: "+0.04" },
];

function Block({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="rise grid [&>*]:min-w-0 gap-3 border-t border-hair pt-6 lg:grid-cols-[220px_1fr] lg:gap-10">
      <h3 className="text-[15px] font-semibold text-mark">{label}</h3>
      <div className="flex max-w-[760px] flex-col gap-3 text-[17px] leading-[1.55] text-ink-2">{children}</div>
    </div>
  );
}

function Prompt({ children }: { children: React.ReactNode }) {
  return <p className="border-l border-hair pl-5 text-[19px] leading-[1.45] text-ink">{children}</p>;
}

/* What each evidence label means, with an example of each. */
function Evidence() {
  return (
    <section id="evidence" aria-labelledby="evidence-title" className="section-rule">
      <div className={`${GUTTER} grid gap-12 py-20 [&>*]:min-w-0 lg:grid-cols-[minmax(0,420px)_1fr] lg:gap-20 lg:py-24`}>
        <div className="rise flex flex-col gap-5">
          <Eyebrow>04 · How RYUX labels what it says</Eyebrow>
          <h2 id="evidence-title" className="text-[min(44px,11vw)] leading-[1.02] sm:text-[52px]">Known, guessed, or unknown.</h2>
        </div>
        <dl>
          {MARKS.map((m) => (
            <div key={m.mark} className="rise grid gap-2 border-b border-hair py-5 first:border-t sm:grid-cols-[130px_1fr] sm:gap-x-8 xl:grid-cols-[130px_1fr_260px]">
              <dt className={`text-[15px] font-semibold ${m.mark === "Unknown" ? "text-mark" : "text-ink"}`}>{m.mark}</dt>
              <dd className="text-[17px] leading-[1.4]">{m.meaning}</dd>
              <dd className="font-mono text-[13px] leading-[1.55] text-ink-2 sm:col-start-2 xl:col-start-auto">{m.example}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}

export default function Benchmarks() {
  return (
    <>
      <SiteHeader />
      <main>
        <section aria-labelledby="bench-title" className={`${GUTTER} flex flex-col gap-6 pt-16 pb-10 lg:pt-24`}>
          <Eyebrow>Benchmarks</Eyebrow>
          <h1 id="bench-title" className="max-w-[1000px] font-semibold tracking-[-0.03em] text-[min(52px,13vw)] leading-[0.98] sm:text-[80px]">
            One screen, all five steps.
          </h1>
          <p className="max-w-[660px] text-[19px] leading-[1.5] text-ink-2">
            The transaction detail screen made without RYUX, taken through Analyze, Critique, Design, Build, and QA in one RYUX
            session. Then paired runs, the same prompt with and without RYUX, with what did not change.
          </p>
          <p className="text-[13px] leading-[1.55] text-muted">
            One run, 12 Oct 2026, RYUX 2.6.2. A case study, not a benchmark. Every turn is{" "}
            <a href={`${REPO}/tree/main/docs/benchmarks/case-td-2.6`} className="underline underline-offset-2 hover:text-ink">public, raw</a>.
          </p>
        </section>

        <section id="real-product" aria-labelledby="rp-title" className="section-rule">
          <div className={`${GUTTER} flex flex-col pt-14 pb-20 lg:pb-28`}>
            <div className="rise flex flex-col gap-3 pb-6 lg:pb-0">
              <Eyebrow>01 · Case study · one session, five prompts</Eyebrow>
              <h2 id="rp-title" className="text-[min(40px,10vw)] leading-[1.05] sm:text-[48px]">From “Done. Here is your screen.” to a reviewed fix</h2>
            </div>
            <Pipeline />
            <div className="rise mt-16 grid gap-10 [&>*]:min-w-0 lg:grid-cols-[minmax(0,1fr)_300px] lg:items-center lg:gap-20">
              <div className="flex flex-col gap-4">
                <h3 className="text-[26px] leading-[1.15] font-semibold tracking-[-0.02em] sm:text-[30px]">Before and after, side by side.</h3>
                <p className="text-[17px] leading-[1.55] text-ink-2">
                  The same screen before and after its findings were fixed. Drag the handle, or focus it and use the arrow keys.
                  This compares one screen with its own fixes, not RYUX against another tool.
                </p>
                <ul className="flex flex-col gap-2 text-[15px] leading-[1.5] text-ink-2">
                  <li><span className="font-mono text-[12px] text-mark">What went wrong</span> It asked nothing, so the fact sheet never came; it kept the input&apos;s example data, wallet balance and dollars.</li>
                  <li><span className="font-mono text-[12px] text-mark">What went wrong</span> The failed screen shows “Balance: $200.00”, a number it worked out, not one anyone gave.</li>
                </ul>
                <p className="text-[13px] leading-[1.55] text-muted">After: the final receipt.html, rendered by us in Chromium. The before screen&apos;s drawn status bar is cut off, so both start at their title and are the same height (390 × 901).</p>
              </div>
              <div className="mx-auto w-full max-w-[300px]">
                <CompareHandle before="/cases/td-case/compare-before.png" after="/cases/td-case/compare-after.png" w={780} h={1802} label="Before and after: how much of the fixed screen shows" />
              </div>
            </div>
          </div>
        </section>

        <section id="transaction-detail" aria-labelledby="td-title" className="section-rule bg-paper-2">
          <div className={`${GUTTER} flex flex-col gap-10 py-20 lg:py-28`}>
            <div className="rise flex flex-col gap-4">
              <Eyebrow>02 · Paired runs · a proof case</Eyebrow>
              <h2 id="td-title" className="font-semibold tracking-[-0.03em] text-[min(44px,11vw)] leading-[1.02] sm:text-[60px]">Transaction detail</h2>
            </div>
            <Block label="How we ran it">
              <ul>
                {METHOD.map((m) => (
                  <li key={m} className="border-b border-hair py-2.5 last:border-b-0">{m}</li>
                ))}
              </ul>
            </Block>
            <Block label="Prompt">
              <Prompt>“Design a transaction detail page for a fintech app, shown after the user pays. Make it in pen.dev.”</Prompt>
              <p>Answers available to both, for any question: a global product in English, market and currency not decided, card and bank transfer, statuses Completed, Processing, and Failed, the data fields, and three actions. The runs without RYUX asked nothing, so they never received these answers.</p>
            </Block>
            <Block label="Across three pairs">
              <Reveal>
                <Scoreboard />
              </Reveal>
              <p className="text-[15px] text-muted">One dot per paired run, filled when it happened. Every count is in the table below.</p>
            </Block>
            <figure className="flex flex-col gap-3">
              <div className="overflow-x-auto">
              <Image
                src="/proof/en-td-pair-wide.png"
                alt="Pair 2. Without RYUX: one completed screen in dollars with a 30-day reporting window and a Save PDF button nobody asked for. With RYUX: six screens, completed, processing, failed, loading, a load error, and a narrow width, with the currency left as [CUR]"
                width={2459}
                height={3421}
                className="canvas-grid w-full min-w-[720px] rounded-xl border border-hair md:min-w-0"
              />
              </div>
              <figcaption className="text-[14px] text-muted">Scroll sideways on a small screen. Pair 2: every pair had the same screen difference, so the pre-set tie rule picked the strongest run without RYUX. Real output, sample data.</figcaption>
            </figure>
            <Block label="Without vs with RYUX">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[640px] text-left text-[15px]">
                  <caption className="sr-only">Transaction detail, per pair, without and with RYUX</caption>
                  <thead>
                    <tr className="border-b border-ink text-[14px] text-muted">
                      <th scope="col" className="py-3 pr-4 font-normal">Measure</th>
                      {["1", "2", "3"].flatMap((p) => [
                        <th key={p + "a"} scope="col" className="py-3 pr-4 font-normal">P{p} without</th>,
                        <th key={p + "b"} scope="col" className="py-3 pr-4 font-normal">P{p} with</th>,
                      ])}
                    </tr>
                  </thead>
                  <tbody>
                    {TD_ROWS.map(([measure, ...cells]) => (
                      <tr key={measure} className="border-b border-hair">
                        <th scope="row" className="py-3 pr-4 font-normal text-ink">{measure}</th>
                        {cells.map((c, i) => (
                          <td key={i} className={`py-3 pr-4 ${i % 2 ? "text-ink" : "text-muted"}`}>{c}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Block>
            <Block label="What changed">
              <p>In 3 of 3 pairs, RYUX asked three questions first, designed six screens, left the currency open, added no feature that was not asked for, and wrote decision receipts. Without RYUX, the run assumed dollars in 3 of 3, made up a business rule in 2 of 3, and added features nobody asked for in 3 of 3.</p>
            </Block>
            <Block label="What RYUX got wrong">
              <p>All three runs with RYUX put “This page updates when the status changes” on the processing screen. Each flagged it as an assumption to confirm, but the sentence still ships on the screen.</p>
              <p>RYUX asks for a written design intent; only one of the three runs wrote one. Its questions offered examples from one specific market to a generic prompt, a local bias in its knowledge. And its reasoning ran three to five times longer, a risk of over-analysis on a task this small.</p>
            </Block>
            <Block label="What we learned">
              <p>RYUX's clearest effect is on uncertainty: it asks, and what it still does not know stays visible instead of being filled in. That is the claim we make, and only that one.</p>
            </Block>
          </div>
        </section>

        <section id="wallet-home" aria-labelledby="wh-title" className="section-rule">
          <div className={`${GUTTER} flex flex-col gap-10 py-20 lg:py-28`}>
            <div className="rise flex flex-col gap-4">
              <Eyebrow>03 · Paired runs · visual direction · not a proof case</Eyebrow>
              <h2 id="wh-title" className="font-semibold tracking-[-0.03em] text-[min(44px,11vw)] leading-[1.02] sm:text-[60px]">Wallet home</h2>
            </div>
            <Block label="Prompt">
              <Prompt>“Design the home screen of a digital wallet app in pen.dev, mobile 390 wide … The current design feels too utilitarian: give it a visual personality with illustration, UI ornament, and motion where they fit.”</Prompt>
              <p>Scored blind by the owner, 1 to 5 on eight areas: context fit, originality, restraint, visual hierarchy, consistency, production plausibility, AI-slop resistance, intentionality. Labels X and Y were drawn by script and opened after scoring.</p>
            </Block>
            <Block label="Without vs with RYUX">
              <table className="w-full max-w-[560px] text-left text-[16px]">
                <caption className="sr-only">Wallet home, blind visual score per pair</caption>
                <thead>
                  <tr className="border-b border-ink text-[14px] text-muted">
                    <th scope="col" className="py-3 pr-4 font-normal">Pair</th>
                    <th scope="col" className="py-3 pr-4 font-normal">Without</th>
                    <th scope="col" className="py-3 pr-4 font-normal">With</th>
                    <th scope="col" className="py-3 font-normal">Difference</th>
                  </tr>
                </thead>
                <tbody>
                  {WALLET_ROWS.map((r) => (
                    <tr key={r.pair} className={`border-b border-hair ${r.pair === "Mean" ? "font-semibold text-ink" : ""}`}>
                      <th scope="row" className="py-3 pr-4 font-normal">{r.pair}</th>
                      <td className="py-3 pr-4">{r.without}</td>
                      <td className="py-3 pr-4">{r.with}</td>
                      <td className="py-3">{r.diff}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Block>
            <Block label="What changed">
              <p>Little that holds. Originality, production plausibility, and intentionality rose in two of three pairs. No area moved the same way in all three.</p>
            </Block>
            <Block label="What RYUX got wrong">
              <p>In pair 2, RYUX's rule to commit to a point of view (three directions and one signature) produced a bold receipt concept that scored 2 on context fit and 2 on restraint. Restraint was never higher with RYUX.</p>
            </Block>
            <Block label="What we learned">
              <p>RYUX does not reliably make a screen prettier. Both sides often reached the same idea: the city, the commuter train, the morning sun. Motion was written as a spec, so we compared motion reasoning, not motion quality.</p>
            </Block>
          </div>
        </section>

        <Evidence />

        <section id="design-md" aria-labelledby="dm-title" className="section-rule bg-paper-2">
          <div className={`${GUTTER} flex flex-col gap-6 py-20 lg:py-24`}>
            <Eyebrow>05 · Project direction · coming next</Eyebrow>
            <h2 id="dm-title" className="font-semibold tracking-[-0.03em] text-[min(44px,11vw)] leading-[1.02] sm:text-[60px]">DESIGN.md</h2>
            <p className="max-w-[760px] text-[17px] leading-[1.55] text-ink-2">
              Without context versus RYUX with a filled DESIGN.md. One run so far, which is not enough to claim anything. It
              will be repeated before it is published here.
            </p>
            <a href={`${REPO}/blob/main/docs/showcase.md#the-first-transaction-detail-run-indonesian-ryux-233`} className="inline-flex min-h-11 items-center self-start text-[17px] font-medium underline underline-offset-4">
              The earlier Indonesian-language runs and their method, in the showcase
            </a>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
