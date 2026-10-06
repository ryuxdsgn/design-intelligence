import type { Metadata } from "next";
import Image from "next/image";
import { Eyebrow, GUTTER, REPO, SiteFooter, SiteHeader } from "@/components/site";

export const metadata: Metadata = {
  title: "Benchmarks · RYUX",
  description:
    "Same prompt, same agent, one with RYUX. What changed, what RYUX got wrong, and what we learned, from repeated paired runs.",
};

const METHOD = [
  "A fresh agent per run, the same model, pen.dev. RYUX 2.3.3 is the only difference.",
  "No RYUX MCP, so no reference screens: every decision in every run is evidence None.",
  "Three pairs per task. Questions answered from one fixed fact sheet for both sides.",
  "Counts are ours, from the outputs. A small benchmark, not a study.",
];

const TD_ROWS: [string, ...string[]][] = [
  ["Questions asked", "6", "3", "4", "3", "5", "3"],
  ["Screens designed", "1", "4", "1", "6", "3", "6"],
  ["Unknowns marked", "no", "yes", "no", "yes", "no", "yes"],
  ["Invented business rules", "1 (notes)", "0", "0", "0", "2 (on screen)", "0"],
  ["Design intent written", "no", "yes", "no", "yes", "no", "yes"],
  ["Decision Receipts", "none", "yes", "none", "yes", "none", "yes"],
];

const WALLET_ROWS = [
  { pair: "1", without: "3.25", with: "4.00", diff: "+0.75" },
  { pair: "2", without: "4.38", with: "3.13", diff: "−1.25" },
  { pair: "3", without: "3.38", with: "4.00", diff: "+0.63" },
  { pair: "Mean", without: "3.67", with: "3.71", diff: "+0.04" },
];

function Block({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid [&>*]:min-w-0 gap-3 border-t border-hair pt-6 lg:grid-cols-[220px_1fr] lg:gap-10">
      <h3 className="font-mono text-[13px] font-semibold tracking-[0.1em] text-mark uppercase">{label}</h3>
      <div className="flex max-w-[760px] flex-col gap-3 text-[17px] leading-[1.55] text-ink-2">{children}</div>
    </div>
  );
}

function Prompt({ children }: { children: React.ReactNode }) {
  return <p className="border-l border-hair pl-5 text-[19px] leading-[1.45] text-ink">{children}</p>;
}

export default function Benchmarks() {
  return (
    <>
      <SiteHeader />
      <main>
        <section aria-labelledby="bench-title" className={`${GUTTER} grid [&>*]:min-w-0 gap-12 py-16 lg:grid-cols-[1fr_480px] lg:gap-24 lg:py-24`}>
          <div className="flex flex-col gap-6">
            <Eyebrow>BENCHMARKS</Eyebrow>
            <h1 id="bench-title" className="font-display text-[56px] leading-[0.98] sm:text-[88px]">
              Same prompt. Same agent. One has RYUX.
            </h1>
            <p className="max-w-[600px] text-[19px] leading-[1.5] text-ink-2">
              We are not looking for the benchmark that makes RYUX win. We are looking for the one that shows most honestly
              what RYUX does to an AI's output, including where it does nothing.
            </p>
          </div>
          <div className="lg:pt-12">
            <h2 className="font-mono text-[13px] tracking-[0.12em] text-muted">HOW WE RAN IT</h2>
            <ul className="mt-3">
              {METHOD.map((m) => (
                <li key={m} className="border-b border-hair py-3.5 text-[16px] leading-[1.45] text-ink-2">{m}</li>
              ))}
            </ul>
          </div>
        </section>

        <section id="transaction-detail" aria-labelledby="td-title" className="bg-paper-2">
          <div className={`${GUTTER} flex flex-col gap-10 py-20 lg:py-28`}>
            <div className="flex flex-col gap-4">
              <Eyebrow>01 · UX REASONING · A PROOF CASE</Eyebrow>
              <h2 id="td-title" className="font-display text-[44px] leading-[1.02] sm:text-[60px]">Transaction detail</h2>
            </div>
            <Block label="Prompt">
              <Prompt>“Design a transaction detail page for a fintech app, shown after the user pays. Make it in pen.dev.”</Prompt>
              <p>Facts given to both: an Indonesian wallet paying merchants by QRIS and bank transfer, statuses Berhasil, Diproses, Gagal, the data fields, and three actions. Everything else: not decided.</p>
            </Block>
            <figure className="flex flex-col gap-3">
              <div className="overflow-x-auto">
              <Image
                src="/proof/td-pair.png"
                alt="Pair 3. Without RYUX: three screens, Berhasil, Diproses, and Gagal, with an invented processing time on Diproses. With RYUX: six screens, the same statuses plus loading, failed to load, and a narrow width with long data, and unknowns kept as [REAL DATA] markers"
                width={2400}
                height={2051}
                className="w-full min-w-[880px] rounded-md border border-hair lg:min-w-0"
              />
              </div>
              <figcaption className="font-mono text-[12px] text-muted">Scroll sideways on a small screen. Pair 3, the median pair, chosen before looking at the images. Real output, sample data.</figcaption>
            </figure>
            <Block label="Without vs with RYUX">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[640px] text-left text-[15px]">
                  <caption className="sr-only">Transaction detail, per pair, without and with RYUX</caption>
                  <thead>
                    <tr className="border-b border-ink font-mono text-[12px] tracking-[0.06em] text-muted">
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
              <p>In 3 of 3 pairs, RYUX designed more states, kept unknowns visible, invented no business rules, wrote its intent and receipts, and asked at most three questions. Without RYUX, the agent invented a rule in 2 of 3.</p>
            </Block>
            <Block label="What RYUX got wrong">
              <p>No outright miss here, but the gap is narrower than it first looked: in pair 3 the run without RYUX also designed all three statuses. The steady difference is the states around them and the unknowns, not the happy path alone.</p>
              <p>RYUX always produced more screens and longer reasoning: 103 to 152 lines against 32 to 57 without it. On a task this small that is a risk of over-analysis.</p>
            </Block>
            <Block label="What we learned">
              <p>RYUX's clearest effect is on uncertainty: what to do with what nobody said. That is the claim we make, and only that one.</p>
            </Block>
          </div>
        </section>

        <section id="wallet-home" aria-labelledby="wh-title">
          <div className={`${GUTTER} flex flex-col gap-10 py-20 lg:py-28`}>
            <div className="flex flex-col gap-4">
              <Eyebrow>02 · VISUAL DIRECTION · NOT A PROOF CASE</Eyebrow>
              <h2 id="wh-title" className="font-display text-[44px] leading-[1.02] sm:text-[60px]">Wallet home</h2>
            </div>
            <Block label="Prompt">
              <Prompt>“Design the home screen of a digital wallet app in pen.dev, mobile 390 wide … The current design feels too utilitarian: give it a visual personality with illustration, UI ornament, and motion where they fit.”</Prompt>
              <p>Scored blind by the owner, 1 to 5 on eight areas: context fit, originality, restraint, visual hierarchy, consistency, production plausibility, AI-slop resistance, intentionality. Labels X and Y were drawn by script and opened after scoring.</p>
            </Block>
            <figure className="flex flex-col gap-3">
              <div className="grid [&>*]:min-w-0 grid-cols-2 gap-5 sm:gap-10 lg:max-w-[760px]">
                {[
                  ["Without RYUX · 4.38", "/proof/wallet-without.png", 780, 1800, "Pair 2 without RYUX: a dark teal header with a skyline illustration and a citrus Bayar tile"],
                  ["With RYUX · 3.13", "/proof/wallet-with.png", 780, 2172, "Pair 2 with RYUX: an indigo receipt concept with the balance printed on a paper slip and a torn-edge transaction list"],
                ].map(([label, src, w, h, alt]) => (
                  <div key={src as string} className="flex flex-col gap-3">
                    <p className="font-mono text-[12px] font-semibold tracking-[0.08em] uppercase">{label}</p>
                    <Image src={src as string} alt={alt as string} width={w as number} height={h as number} className="w-full rounded-[18px] border border-hair" />
                  </div>
                ))}
              </div>
              <figcaption className="font-mono text-[12px] text-muted">Pair 2, where RYUX lost. Real output, sample data, home screen only.</figcaption>
            </figure>
            <Block label="Without vs with RYUX">
              <table className="w-full max-w-[560px] text-left text-[16px]">
                <caption className="sr-only">Wallet home, blind visual score per pair</caption>
                <thead>
                  <tr className="border-b border-ink font-mono text-[12px] tracking-[0.06em] text-muted">
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

        <section id="design-md" aria-labelledby="dm-title" className="bg-paper-2">
          <div className={`${GUTTER} flex flex-col gap-6 py-20 lg:py-24`}>
            <Eyebrow>03 · PROJECT DIRECTION · COMING NEXT</Eyebrow>
            <h2 id="dm-title" className="font-display text-[44px] leading-[1.02] sm:text-[60px]">DESIGN.md</h2>
            <p className="max-w-[760px] text-[17px] leading-[1.55] text-ink-2">
              Without context versus RYUX with a filled DESIGN.md. One run so far, which is not enough to claim anything. It
              will be repeated before it is published here.
            </p>
            <a href={`${REPO}/blob/main/docs/showcase.md#repeated-benchmark-ryux-233`} className="inline-flex min-h-11 items-center self-start text-[17px] font-medium underline underline-offset-4">
              Full method and every run in the showcase
            </a>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
