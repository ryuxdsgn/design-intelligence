"use client";

import Image from "next/image";
import { useLayoutEffect, useRef, useState } from "react";
import { Pin, PinAt, Ring, type Tone } from "@/components/markup";

type Mark = { pin: [number, number]; ring: [number, number, number, number]; note: string };
type Side = { src: string; w: number; h: number; alt: string; marks: Mark[]; extra?: string };
type Case = {
  id: string;
  tab: string;
  prompt: string;
  cols: string;
  without: Side;
  with: Side;
  wrong: string;
};

/* Two English runs, one pair each, RYUX 2.3.3, same harness as the benchmark (en-ba/PROTOCOL.md).
   Screens are the agents' exports, unedited; only the rings and pins are ours. */
const CASES: Case[] = [
  {
    id: "dashboard",
    tab: "Dashboard",
    prompt: "Design the home dashboard of a project management web app, shown the first time a new user logs in.",
    cols: "lg:grid-cols-2",
    without: {
      src: "/cases/db-without.png",
      w: 1440,
      h: 900,
      alt: "Dashboard without RYUX: a sidebar with My tasks, Inbox, and Search, project templates with 18 starter tasks, imports from Trello, Asana, and Jira, a getting-started checklist at 1 of 4 done, and a Free plan with 1 member",
      marks: [
        { pin: [21.4, 58.1], ring: [39.3, 58.1, 34, 5], note: "Imports from Trello, Asana, and Jira, which nobody asked for." },
        { pin: [23.6, 50.3], ring: [30.1, 50.3, 9.5, 4], note: "Templates with “18 starter tasks” that nobody wrote." },
        { pin: [88.6, 24.6], ring: [93.8, 24.6, 8, 4], note: "A checklist “1 of 4 done” for steps nobody defined." },
        { pin: [13.4, 5.3], ring: [7.2, 5.3, 9, 3.6], note: "A Free plan with 1 member. No pricing was given." },
      ],
    },
    with: {
      src: "/cases/db-with.png",
      w: 1440,
      h: 900,
      alt: "Dashboard with RYUX: a getting-started page with one primary action, Create a project, plus Import from a CSV file and Invite teammates, outlined boxes for what the page will show later, and the product name as a [Product name] placeholder",
      marks: [
        { pin: [13.6, 58.2], ring: [21.8, 58.2, 14, 6.4], note: "One clear first step: Create a project." },
        { pin: [11.6, 72.2], ring: [18.9, 72.2, 13, 3.6], note: "Says what the page will show once there is work, instead of fake projects." },
      ],
      extra: "It also drew loading, error, and 390-wide versions, used only the three actions that exist, and asked three questions first.",
    },
    wrong: "The outlined button’s border is about 2:1 against white, below the 3:1 that controls need. And next to the version without RYUX, it looks plain.",
  },
  {
    id: "orders",
    tab: "Orders list",
    prompt: "Design the orders list for an online store’s admin app, on mobile.",
    cols: "lg:grid-cols-[minmax(0,320px)_minmax(0,1fr)]",
    without: {
      src: "/cases/or-without.png",
      w: 780,
      h: 1812,
      alt: "Orders list without RYUX: one screen for a store called Northwind Goods with tabs counting 248, 12, and 3 orders, an Overdue group due Oct 6, a carrier pickup at 5 PM, and a bottom bar with Products and Customers",
      marks: [
        { pin: [4, 23.5], ring: [16.3, 23.5, 14, 3.4], note: "Order counts, 248, 12, and 3, for a store that does not exist." },
        { pin: [65, 27.9], ring: [83.4, 27.9, 30, 3], note: "Ship-by deadlines and an Overdue group: a rule nobody gave." },
        { pin: [58, 47.5], ring: [79.6, 47.5, 36, 3], note: "A 5 PM carrier pickup nobody mentioned." },
      ],
      extra: "One screen: the full list only. No empty, loading, or error state.",
    },
    with: {
      src: "/cases/or-with.png",
      w: 1600,
      h: 1745,
      alt: "Orders list with RYUX: nine screens on one board: the default list, a filter sheet, filters applied, 320 wide, first load, no orders yet, no matches, couldn't load, and offline with the saved list",
      marks: [],
      extra: "Nine screens: the list, a filter sheet, filters applied, 320 wide, first load, no orders yet, no matches, couldn’t load, and offline. It asked three questions first.",
    },
    wrong: "“$” stands in for a currency nobody chose. It is labeled as a stand-in, but [CUR] would have been clearer. Its questions again offered examples from one specific market.",
  },
];

function Screen({ side, tone, label }: { side: Side; tone: Tone; label: string }) {
  const labelTone = tone === "mark" ? "text-mark" : "text-accent";
  return (
    <figure className="flex flex-col gap-4">
      <figcaption className={`text-[14px] font-semibold ${labelTone}`}>{label}</figcaption>
      <div className="relative">
        <Image
          src={side.src}
          alt={side.alt}
          width={side.w}
          height={side.h}
          sizes="(min-width: 1024px) 50vw, 100vw"
          className="w-full rounded-xl border border-hair bg-white shadow-[0_24px_50px_-30px_rgba(11,22,43,0.4)]"
        />
        {side.marks.map((m, i) => (
          <div key={m.note}>
            <Ring x={m.ring[0]} y={m.ring[1]} w={m.ring[2]} h={m.ring[3]} tone={tone} delay={250 + i * 300} />
            <PinAt n={i + 1} x={m.pin[0]} y={m.pin[1]} tone={tone} delay={150 + i * 300} />
          </div>
        ))}
      </div>
      <ol className="flex flex-col gap-3">
        {side.marks.map((m, i) => (
          <li key={m.note} className="flex gap-2.5">
            <Pin n={i + 1} tone={tone} />
            <p className="text-[15px] leading-[1.5] text-ink-2">{m.note}</p>
          </li>
        ))}
        {side.extra && <li className="text-[15px] leading-[1.5] text-ink">{side.extra}</li>}
      </ol>
    </figure>
  );
}

/** Two more runs, shown as a review: rings on what each side shows. Tabs switch between the cases. */
export function Cases() {
  const [active, setActive] = useState(0);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  const [pill, setPill] = useState<{ left: number; width: number } | null>(null);
  const c = CASES[active];

  // The dark pill slides to the selected tab, so the change of tab is seen, not only read.
  useLayoutEffect(() => {
    const place = () => {
      const t = tabs.current[active];
      if (t) setPill({ left: t.offsetLeft, width: t.offsetWidth });
    };
    place();
    window.addEventListener("resize", place);
    return () => window.removeEventListener("resize", place);
  }, [active]);

  function onKey(e: React.KeyboardEvent, i: number) {
    const step = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
    if (!step) return;
    e.preventDefault();
    const next = (i + step + CASES.length) % CASES.length;
    setActive(next);
    tabs.current[next]?.focus();
  }

  return (
    <div className="flex flex-col gap-8">
      <div role="tablist" aria-label="Runs" className="relative flex self-start rounded-full border border-hair bg-white p-1">
        {pill && (
          <span
            aria-hidden
            className="absolute inset-y-1 rounded-full bg-ink transition-[left,width] duration-[400ms] ease-[cubic-bezier(0.34,1.4,0.64,1)] motion-reduce:transition-none"
            style={{ left: pill.left, width: pill.width }}
          />
        )}
        {CASES.map((x, i) => (
          <button
            key={x.id}
            ref={(el) => {
              tabs.current[i] = el;
            }}
            role="tab"
            id={`case-tab-${x.id}`}
            aria-selected={i === active}
            aria-controls="case-panel"
            tabIndex={i === active ? 0 : -1}
            onClick={() => setActive(i)}
            onKeyDown={(e) => onKey(e, i)}
            className={`tactile relative min-h-11 rounded-full px-5 text-[15px] font-medium transition-colors duration-300 ${
              i === active ? (pill ? "text-white" : "bg-ink text-white") : "text-ink-2 hover:text-ink"
            }`}
          >
            {x.tab}
          </button>
        ))}
      </div>

      <div id="case-panel" role="tabpanel" aria-labelledby={`case-tab-${c.id}`} key={c.id} className="case-panel canvas-grid flex flex-col gap-10 rounded-[28px] border border-hair px-5 py-8 sm:px-10 lg:py-12">
        <p className="max-w-[760px] border-l border-ink/20 pl-4 text-[17px] leading-[1.45] text-ink">
          <span className="block text-[13px] text-muted">The prompt, identical for both</span>“{c.prompt} Make it in pen.dev.”
        </p>
        <div className={`grid gap-12 [&>*]:min-w-0 lg:gap-14 ${c.cols}`}>
          <Screen side={c.without} tone="mark" label="Without RYUX" />
          <Screen side={c.with} tone="accent" label="With RYUX" />
        </div>
        <p className="max-w-[760px] text-[15px] leading-[1.55] text-ink-2">
          <span className="font-semibold text-mark">What RYUX got wrong: </span>
          {c.wrong}
        </p>
      </div>
    </div>
  );
}
