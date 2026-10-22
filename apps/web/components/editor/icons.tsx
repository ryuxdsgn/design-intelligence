/* Editor icons, one custom set. Style, written before drawing (RX-UI-17, RX-UI-20):
   grid 24, live area 20; line 1.75 with round caps and joins, the same family as the illustrations;
   geometric and soft, corners 2 to 3 like the rounded components; colour: the line is currentColor,
   and every icon carries one soft accent dot behind it, a highlighter mark offset down and right
   (the set's signature, and what makes it playful); flat, no other fill.
   Motion: on hover of its control, each icon does one small move that says what it does (arrows
   nudge their way, plus turns, the plane takes off, the dot grows). None with reduced motion.
   One icon, one meaning: back leaves the page, chevrons move between screens, carets reorder;
   mobile and desktop name a screen's form factor.
   Icons sit next to a label; icon-only controls carry an accessible name. Decorative: aria-hidden. */

const PATHS = {
  back: ["M19 12H5", "M11 18l-6-6 6-6"],
  prev: ["M15 6l-6 6 6 6"],
  next: ["M9 6l6 6-6 6"],
  earlier: ["M15 6.5v11L8.5 12z"],
  later: ["M9 6.5v11l6.5-5.5z"],
  add: ["M12 5v14", "M5 12h14"],
  ai: ["M11 3.5c.6 3.9 2.6 5.9 6.5 6.5-3.9.6-5.9 2.6-6.5 6.5-.6-3.9-2.6-5.9-6.5-6.5 3.9-.6 5.9-2.6 6.5-6.5z", "M18.5 15.5v4", "M16.5 17.5h4"],
  publish: ["M20.5 3.5L10 14", "M20.5 3.5l-6.5 17-4-6.5-6.5-4z"],
  upload: ["M12 15V4.5", "M7.5 9L12 4.5 16.5 9", "M4.5 15v2.5a2 2 0 002 2h11a2 2 0 002-2V15"],
  capture: ["M4 8.5V6.5a2.5 2.5 0 012.5-2.5h2", "M15.5 4h2a2.5 2.5 0 012.5 2.5v2", "M20 15.5v2a2.5 2.5 0 01-2.5 2.5h-2", "M8.5 20h-2A2.5 2.5 0 014 17.5v-2", "M12 9v6", "M9 12h6"],
  frames: ["M6.5 4h11A2.5 2.5 0 0120 6.5v11a2.5 2.5 0 01-2.5 2.5h-11A2.5 2.5 0 014 17.5v-11A2.5 2.5 0 016.5 4z", "M8.5 4v16", "M15.5 4v16", "M4 9.5h4.5", "M4 14.5h4.5", "M15.5 9.5H20", "M15.5 14.5H20"],
  stop: ["M8.5 6h7A2.5 2.5 0 0118 8.5v7a2.5 2.5 0 01-2.5 2.5h-7A2.5 2.5 0 016 15.5v-7A2.5 2.5 0 018.5 6z"],
  close: ["M6.5 6.5l11 11", "M17.5 6.5l-11 11"],
  check: ["M5 12.5l4.5 4.5L19 7.5"],
  alert: ["M10.3 4.9a2 2 0 013.4 0l7 12.1a2 2 0 01-1.7 3H5a2 2 0 01-1.7-3z", "M12 10v3.5", "M12 16.8v.01"],
  disclose: ["M9.5 6.5L15 12l-5.5 5.5"],
  signOut: ["M14 4h3a2 2 0 012 2v12a2 2 0 01-2 2h-3", "M10 8l-4 4 4 4", "M6 12h9.5"],
  mobile: ["M9 3.5h6A2.5 2.5 0 0117.5 6v12a2.5 2.5 0 01-2.5 2.5H9A2.5 2.5 0 016.5 18V6A2.5 2.5 0 019 3.5z", "M11 17.5h2"],
  desktop: ["M5.5 4.5h13A2.5 2.5 0 0121 7v7a2.5 2.5 0 01-2.5 2.5h-13A2.5 2.5 0 013 14V7a2.5 2.5 0 012.5-2.5z", "M12 16.5V20", "M8.5 20h7"],
} as const;

export type IconName = keyof typeof PATHS;

// Where the highlighter dot sits: near the icon's weight, down and right.
const DOT: Partial<Record<IconName, [number, number, number]>> = {
  back: [10, 15, 6], prev: [12, 14.5, 5.5], next: [13.5, 14.5, 5.5], earlier: [12.5, 14, 5], later: [12.5, 14, 5],
  ai: [12.5, 13.5, 6], publish: [11, 15.5, 6], stop: [14, 14, 6], check: [12, 15, 6], disclose: [13.5, 14, 5],
};

export function Icon({ name, size = "size-[1.15em]", className = "" }: { name: IconName; size?: string; className?: string }) {
  const [cx, cy, r] = DOT[name] ?? [14, 14, 6.5];
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" data-icon={name} className={`ed-ic shrink-0 ${size} ${className}`}
      fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round">
      <circle className="ed-ic-dot" cx={cx} cy={cy} r={r} stroke="none" />
      <g className="ed-ic-line">{PATHS[name].map((d) => <path key={d} d={d} />)}</g>
    </svg>
  );
}
