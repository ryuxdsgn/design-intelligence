/* Review markup drawn over real screens: numbered pins and pen rings, in the proof-correction red
   (or indigo for what RYUX kept open). Positions are percentages of the image they sit on. */

export type Tone = "mark" | "accent" | "mark-night" | "accent-night";

const PIN_TONE: Record<Tone, string> = {
  mark: "border-mark text-mark bg-white",
  accent: "border-accent text-accent bg-white",
  "mark-night": "border-mark-night text-mark-night bg-night",
  "accent-night": "border-accent-night text-accent-night bg-night",
};

export function Pin({ n, tone = "mark" }: { n: number; tone?: Tone }) {
  return (
    <span className={`flex size-6 shrink-0 items-center justify-center rounded-full border-[1.5px] font-mono text-[11px] font-semibold ${PIN_TONE[tone]}`}>
      {n}
    </span>
  );
}

const RING_TONE: Record<Tone, string> = { mark: "stroke-mark", accent: "stroke-accent", "mark-night": "stroke-mark-night", "accent-night": "stroke-accent-night" };

/** A pen ring drawn around a value on a real screen. x, y (centre), w, h are percentages of the image.
    The stroke scales with the ring: pathLength with a non-scaling stroke drew only part of the ellipse. */
export function Ring({ x, y, w, h, tone, delay = 0 }: { x: number; y: number; w: number; h: number; tone: Tone; delay?: number }) {
  return (
    <svg
      aria-hidden
      className="pointer-events-none absolute overflow-visible"
      style={{ left: `${x - w / 2}%`, top: `${y - h / 2}%`, width: `${w}%`, height: `${h}%`, transform: "rotate(-2deg)" }}
      viewBox="0 0 100 40"
      preserveAspectRatio="none"
    >
      <ellipse
        cx="50"
        cy="20"
        rx="49"
        ry="19"
        pathLength={1}
        fill="none"
        strokeWidth="1.2"
        className={`ring-draw ${RING_TONE[tone]}`}
        style={{ animationDelay: `${delay}ms` }}
      />
    </svg>
  );
}

/** A redline: a dimension line with end ticks and a measurement label. Place it with `className`/`style`
    (absolute, inside a relative parent). Labels carry only real, measured or stated values. */
export function Dim({ label, vertical = false, night = false, delay = 0, className = "", style }: {
  label: string; vertical?: boolean; night?: boolean; delay?: number; className?: string; style?: React.CSSProperties;
}) {
  return (
    <span aria-hidden className={`dim ${vertical ? "dim-v" : "dim-h"} ${night ? "night" : ""} ${className}`} style={{ ...style, ["--d" as string]: `${delay}ms` }}>
      <span className="dim-line" />
      <span className="dim-label">{label}</span>
    </span>
  );
}

/** A numbered pin placed on a real screen; x and y are percentages of the image. */
export function PinAt({ n, x, y, tone, delay = 0 }: { n: number; x: number; y: number; tone: Tone; delay?: number }) {
  return (
    <div className="absolute -translate-x-1/2 -translate-y-1/2" style={{ left: `${x}%`, top: `${y}%` }}>
      <div className="pin-in" style={{ animationDelay: `${delay}ms` }}>
        <Pin n={n} tone={tone} />
      </div>
    </div>
  );
}

