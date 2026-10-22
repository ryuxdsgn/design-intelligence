/* Editor illustrations, one family. Style, written before drawing (RX-UI-17):
   line 1.5 px, round caps; geometric, screen frames with 6 px corners like the components;
   colour from tokens only: lines ink-2, frames panel, one accent element per drawing;
   flat, no shadow, two or three lines per frame; subject: product objects (screens, arrow, check),
   no people, no text inside. Each one explains a state next to text that says the same thing, so
   they are decorative to assistive technology (aria-hidden). */

const line = { stroke: "var(--color-ink-2)", strokeWidth: 1.5, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, fill: "none" };
const frame = { ...line, fill: "var(--color-panel)" };
const accent = { ...line, stroke: "var(--color-accent)" };

function Screen({ x, y, w = 34, h = 58 }: { x: number; y: number; w?: number; h?: number }) {
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx={6} {...frame} />
      <path d={`M${x + 8} ${y + 14}h${w - 16}M${x + 8} ${y + 22}h${w - 22}M${x + 8} ${y + h - 12}h${w - 16}`} {...line} opacity={0.6} />
    </g>
  );
}

/** A flow: screens in order, the last one reviewed. For the empty flow list. */
export function FlowIllustration({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 160 90" className={className} aria-hidden="true">
      <Screen x={10} y={16} />
      <path d="M48 45h12" {...line} strokeDasharray="2 4" />
      <Screen x={63} y={16} />
      <path d="M101 45h12" {...line} strokeDasharray="2 4" />
      <Screen x={116} y={16} />
      <circle cx={133} cy={45} r={9} {...accent} fill="var(--color-paper)" />
      <path d="M129 45.5l2.8 2.8 5.2-5.6" {...accent} />
    </svg>
  );
}

/** A screenshot going up. For the drop zone; the arrow lifts while a file is dragged over (.ed-arrow). */
export function UploadIllustration({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 160 90" className={className} aria-hidden="true">
      <Screen x={63} y={22} />
      <g className="ed-arrow">
        <path d="M80 18V4M73 11l7-7 7 7" {...accent} />
      </g>
    </svg>
  );
}

/** A reviewed screen shared outward. For the published state. */
export function PublishedIllustration({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 160 90" className={className} aria-hidden="true">
      <Screen x={40} y={16} />
      <circle cx={57} cy={45} r={9} {...accent} fill="var(--color-paper)" />
      <path d="M53 45.5l2.8 2.8 5.2-5.6" {...accent} />
      <path d="M80 33h22M80 45h30M80 57h22" {...line} strokeDasharray="2 4" />
      <circle cx={108} cy={33} r={3} {...line} />
      <circle cx={116} cy={45} r={3} {...line} />
      <circle cx={108} cy={57} r={3} {...line} />
    </svg>
  );
}
