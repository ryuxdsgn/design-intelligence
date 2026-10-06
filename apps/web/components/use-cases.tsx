"use client";

import { useRef, useState } from "react";

type Line = { text: string; note?: string };
type Case = {
  id: string;
  tab: string;
  prompt: string;
  scope: string;
  without: Line[];
  with: Line[];
  takeaway: string;
  mono: boolean;
};

/* Lines in quotation marks are verbatim from real runs (README and docs/showcase.md); the rest summarize those runs. */
const CASES: Case[] = [
  {
    id: "copy",
    tab: "Launch copy",
    prompt:
      "Our product is Tally, an invoicing app for freelancers. Write an in-app announcement and a short email telling existing customers about a new feature: scheduled invoices.",
    scope: "One run on an earlier release",
    mono: false,
    without: [
      { text: "Choose a date and time. We'll send it then, and you can edit or cancel it until it goes out.", note: "Time-of-day sending, not in the brief" },
      { text: "Tally sends it on that date, and you'll get a notification once it's delivered.", note: "A notification nobody specified" },
      { text: "2. Click the arrow next to Send and choose Schedule.", note: "Invented UI" },
      { text: "Questions or feedback? Just reply to this email. We read every one.", note: "A promise nobody made" },
    ],
    with: [
      { text: "Before shipping: replace every [bracketed] placeholder.", note: "Unknowns flagged" },
      { text: "2. Select [Schedule send] instead of Send now.", note: "The unknown label stays a placeholder" },
      { text: "If the user's plan doesn't include scheduling, [hide the announcement / change the button to the upgrade path]. Confirm which.", note: "An open question, not a guess" },
      { text: "You're receiving this because you have a Tally account. [Manage email preferences]", note: "An unsubscribe path" },
    ],
    takeaway: "Both read well. Only one describes a product somebody actually specified.",
  },
  {
    id: "code",
    tab: "Pricing logic",
    prompt:
      "Write a TypeScript module, order-total.ts, that calculates an order total with shipping, a service fee, and sales tax, and formats it as currency for the user's locale.",
    scope: "One run on an earlier release",
    mono: true,
    without: [
      { text: "freeShippingThreshold?: number;", note: "A free-shipping rule nobody asked for" },
      { text: "serviceFeeFixed?: number;", note: "An extra fixed fee nobody asked for" },
      { text: "taxShipping?: boolean;\ntaxServiceFee?: boolean;", note: "Optional, so shipping and fees go untaxed by default" },
    ],
    with: [
      { text: "shipping: number;\nserviceFee: ServiceFee;", note: "Only the charges the brief named" },
      { text: "// Whether shipping and the service fee are taxable differs by jurisdiction,\n// so the caller must decide rather than this module picking a default.", note: "Taxability is the caller's decision" },
      { text: "taxShipping: boolean;\ntaxServiceFee: boolean;", note: "Required, no silent default" },
    ],
    takeaway: "154 lines that add pricing rules nobody asked for, against 124 lines with only the charges that were named.",
  },
  {
    id: "critique",
    tab: "Checkout critique",
    prompt: "Analyze this payment step, then critique it. The input was a checkout designed without RYUX.",
    scope: "One end-to-end run on an earlier release",
    mono: false,
    without: [
      { text: "Only the default, filled state of the payment step.", note: "The design as it was handed over" },
      { text: "“Cicilan 0% hingga 12 bulan” and “diawasi OJK & Bank Indonesia” on the screen.", note: "Claims with no source" },
    ],
    with: [
      { text: "“Only the happy, filled state is provided. Nothing shows the CTA while it runs, what comes after it, or what happens when it fails.”", note: "C-04 · severity 3" },
      { text: "The build then covered seven states: default, processing, result with the VA number, failure, method unavailable, method list failed, and voucher invalid.", note: "Designed and built" },
      { text: "Its second critique, on its own build: tapping the CTA resets the selection, so a buyer who chose COD at Rp432.500 sees BCA VA at Rp406.000.", note: "A bug in its own work, reported at severity 4" },
    ],
    takeaway: "It named the missing states before redesigning, then found a defect in its own work and said so.",
  },
];

export function UseCases() {
  const [active, setActive] = useState(0);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  const c = CASES[active];

  function onKey(e: React.KeyboardEvent, i: number) {
    const step = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
    if (!step) return;
    e.preventDefault();
    const next = (i + step + CASES.length) % CASES.length;
    setActive(next);
    tabs.current[next]?.focus();
  }

  const column = (title: string, lines: Line[], tone: "without" | "with") => (
    <div className="flex flex-col gap-4">
      <p className="text-[15px] font-semibold">{title}</p>
      <ul className="flex flex-col gap-3">
        {lines.map((l) => (
          <li
            key={l.text}
            className={`rounded-lg border-l-2 bg-white px-4 py-3.5 ${tone === "without" ? "border-mark" : "border-accent"}`}
          >
            <p className={`${c.mono ? "font-mono text-[13px] whitespace-pre-wrap" : "text-[15px]"} leading-[1.55] text-ink`}>{l.text}</p>
            {l.note && (
              <p className={`mt-2 text-[13px] font-medium ${tone === "without" ? "text-mark" : "text-accent"}`}>{l.note}</p>
            )}
          </li>
        ))}
      </ul>
    </div>
  );

  return (
    <div className="flex flex-col gap-8">
      <div role="tablist" aria-label="Use cases" className="flex flex-wrap gap-2">
        {CASES.map((x, i) => (
          <button
            key={x.id}
            ref={(el) => {
              tabs.current[i] = el;
            }}
            role="tab"
            id={`tab-${x.id}`}
            aria-selected={i === active}
            aria-controls={`panel-${x.id}`}
            tabIndex={i === active ? 0 : -1}
            onClick={() => setActive(i)}
            onKeyDown={(e) => onKey(e, i)}
            className={`min-h-11 rounded-full border px-5 text-[15px] font-medium transition-colors duration-200 ${
              i === active ? "border-ink bg-ink text-white" : "border-hair bg-white text-ink-2 hover:border-ink"
            }`}
          >
            {x.tab}
          </button>
        ))}
      </div>

      <div key={c.id} role="tabpanel" id={`panel-${c.id}`} aria-labelledby={`tab-${c.id}`} className="case-panel flex flex-col gap-8">
        <div className="grid gap-4 [&>*]:min-w-0 lg:grid-cols-[1fr_auto] lg:items-end lg:gap-10">
          <p className="max-w-[820px] border-l-2 border-hair pl-5 text-[18px] leading-[1.5] text-ink">“{c.prompt}”</p>
          <p className="text-[14px] text-muted">{c.scope}</p>
        </div>
        <div className="grid gap-8 [&>*]:min-w-0 lg:grid-cols-2 lg:gap-10">
          {column("Without RYUX", c.without, "without")}
          {column("With RYUX", c.with, "with")}
        </div>
        <p className="text-[19px] leading-[1.5] font-medium">{c.takeaway}</p>
      </div>
    </div>
  );
}
