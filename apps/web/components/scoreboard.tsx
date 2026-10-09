/* Transaction detail benchmark, English, RYUX 2.3.3: one entry per pair (P1, P2, P3), counted from the outputs. */
type Row = { label: string; without: number[]; with: number[] };

const EVENTS: Row[] = [
  { label: "Asked questions before designing", without: [0, 0, 0], with: [1, 1, 1] },
  { label: "Assumed a currency", without: [1, 1, 1], with: [0, 0, 0] },
  { label: "Made up a business rule", without: [1, 1, 0], with: [0, 0, 0] },
  { label: "Added features nobody asked for", without: [1, 1, 1], with: [0, 0, 0] },
];

const SCREENS = { without: 1, with: 6 };

function Dots({ runs, night, tone }: { runs: number[]; night: boolean; tone: "mark" | "accent" }) {
  const on = tone === "mark" ? (night ? "bg-mark-night" : "bg-mark") : night ? "bg-accent-night" : "bg-accent";
  const off = night ? "border-night-sub/60" : "border-muted/50";
  return (
    <span aria-hidden className="tally flex gap-1.5">
      {runs.map((r, i) => (
        <span
          key={i}
          style={{ transitionDelay: `${i * 90}ms` }}
          className={`size-3 rounded-full ${r ? on : `border-[1.5px] ${off}`}`}
        />
      ))}
    </span>
  );
}

function Screens({ count, night, tone }: { count: number; night: boolean; tone: "mark" | "accent" }) {
  const on = tone === "mark" ? (night ? "border-mark-night" : "border-mark") : night ? "border-accent-night" : "border-accent";
  return (
    <span aria-hidden className="tally flex gap-1">
      {Array.from({ length: count }, (_, i) => (
        <span key={i} style={{ transitionDelay: `${i * 70}ms` }} className={`h-[18px] w-[10px] rounded-[3px] border-[1.5px] ${on}`} />
      ))}
    </span>
  );
}

const of3 = (runs: number[]) => `${runs.reduce((a, b) => a + b, 0)} of 3`;

/** The benchmark as a tally: one dot per paired run, filled when it happened. Text carries every number too. */
export function Scoreboard({ night = false }: { night?: boolean }) {
  const sub = night ? "text-night-sub" : "text-muted";
  const hair = night ? "border-night-hair" : "border-hair";
  return (
    <table className="w-full text-left">
      <caption className="sr-only">Three paired runs, without and with RYUX</caption>
      <thead>
        <tr className={`border-b ${hair} text-[14px] ${sub}`}>
          <th scope="col" className="py-3 pr-3 font-normal"><span className="sr-only">Measure</span></th>
          <th scope="col" className="py-3 pr-3 font-normal">Without RYUX</th>
          <th scope="col" className="py-3 font-normal">With RYUX</th>
        </tr>
      </thead>
      <tbody className="text-[15px] sm:text-[16px]">
        {EVENTS.map((r) => (
          <tr key={r.label} className={`border-b ${hair}`}>
            <th scope="row" className={`py-4 pr-3 font-normal ${sub}`}>{r.label}</th>
            <td className="py-4 pr-3">
              <span className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
                <Dots runs={r.without} night={night} tone="mark" />
                <span className="whitespace-nowrap">{of3(r.without)}</span>
              </span>
            </td>
            <td className="py-4 font-semibold">
              <span className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
                <Dots runs={r.with} night={night} tone="accent" />
                <span className="whitespace-nowrap">{of3(r.with)}</span>
              </span>
            </td>
          </tr>
        ))}
        <tr className={`border-b ${hair}`}>
          <th scope="row" className={`py-4 pr-3 font-normal ${sub}`}>States and widths covered, each run</th>
          <td className="py-4 pr-3">
            <span className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
              <Screens count={SCREENS.without} night={night} tone="mark" />
              <span>{SCREENS.without}</span>
            </span>
          </td>
          <td className="py-4 font-semibold">
            <span className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
              <Screens count={SCREENS.with} night={night} tone="accent" />
              <span>{SCREENS.with}</span>
            </span>
          </td>
        </tr>
      </tbody>
    </table>
  );
}
