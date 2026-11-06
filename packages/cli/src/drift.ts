// Design drift: the measurable part of the direction in DESIGN.md (colours, type families, corner radius,
// motion durations) against the values the code uses. Pure, no LLM. The direction block is written by
// agents and people, so it is read leniently; what cannot be read is reported, never guessed.
//
// The contract, under `## Visual and motion language`, in a `direction:` block:
//   colour:  every hex in the block is a direction colour (usually under colour.roles)
//   type:    each line under type: (display, body, mono, or families: [A, B]) starts with a family name
//   shape:   radius: [8, 16, 999]   (numbers in px; without this key, radius is not checked)
//   motion:  durations: [150, 240]  (numbers in ms), or durations written as 240ms in the motion line

export interface Direction {
  /** Six-digit lowercase hex. */
  colours: string[];
  fonts: string[];
  radius: number[] | null;
  durations: number[] | null;
  /** Parts of the contract the block does not have in a form a machine can read. */
  unread: string[];
}

const HEX = /#(?:[0-9a-f]{8}|[0-9a-f]{6}|[0-9a-f]{3})\b/gi;
const WEIGHT = /^(?:thin|hairline|extralight|ultralight|light|regular|normal|book|medium|semibold|demibold|bold|extrabold|ultrabold|black|heavy|italic|variable)$/i;
const NOT_FONT_KEYS = new Set(["figures", "scale", "max_measure", "measure", "sizes", "size", "tracking", "leading", "notes"]);

/** #abc → #aabbcc; alpha is dropped, since the colour is the same token at another opacity. */
export function normHex(hex: string): string {
  const h = hex.slice(1).toLowerCase();
  return `#${h.length === 3 ? [...h].map((c) => c + c).join("") : h.slice(0, 6)}`;
}

const normFont = (f: string): string => f.toLowerCase().replace(/[\s_-]+/g, "");

/** The family a type line names: the words before a size, a weight, or a bracket. */
function family(value: string): string | null {
  const words: string[] = [];
  for (const w of value.replace(/^["']|["']$/g, "").split(/\s+/)) {
    if (!w || /^[\d(,/]/.test(w) || WEIGHT.test(w.replace(/[,/].*$/, ""))) break;
    words.push(w.replace(/,$/, ""));
    if (/,$/.test(w)) break;
  }
  const name = words.join(" ");
  return /^[A-Z]/.test(name) ? name : null;
}

const numbers = (s: string): number[] => (s.match(/\d+(?:\.\d+)?/g) ?? []).map(Number);

/** The text of the direction block, or null when DESIGN.md has none. */
function directionBlock(md: string): string | null {
  const at = md.search(/^## Visual and motion language\b/m);
  if (at < 0) return null;
  const rest = md.slice(at);
  const next = rest.slice(3).search(/^## /m);
  const section = next < 0 ? rest : rest.slice(0, next + 3);
  const start = section.search(/^\s*direction:\s*$/m);
  if (start < 0) return null;
  const tail = section.slice(start);
  const fence = tail.search(/^```/m);
  return fence < 0 ? tail : tail.slice(0, fence);
}

/** The lines indented under the key at `index` (the key's own line excluded). */
function under(lines: string[], index: number): string[] {
  const indent = lines[index].search(/\S/);
  const out: string[] = [];
  for (let i = index + 1; i < lines.length; i++) {
    if (lines[i].trim() && lines[i].search(/\S/) <= indent) break;
    out.push(lines[i]);
  }
  return out;
}

export function readDirection(md: string): Direction | null {
  const block = directionBlock(md);
  if (block === null) return null;
  const lines = block.split("\n");
  const unread: string[] = [];
  // top-level keys sit at the indent of the first key under direction:, so grammar.motion is not motion
  const top = lines.slice(1).find((l) => l.trim())?.search(/\S/) ?? 2;
  const key = (name: string, empty = false) =>
    lines.findIndex((l) => l.search(/\S/) === top && new RegExp(`^\\s*${name}:${empty ? "\\s*$" : ""}`).test(l));

  const colours = [...new Set((block.match(HEX) ?? []).map(normHex))];
  if (!colours.length) unread.push("colour (no hex values)");

  const fonts: string[] = [];
  const typeAt = key("type", true);
  if (typeAt >= 0) {
    for (const l of under(lines, typeAt)) {
      const m = /^\s*([\w-]+):\s*(.+)$/.exec(l);
      if (!m || NOT_FONT_KEYS.has(m[1])) continue;
      const values = m[1] === "families" ? m[2].replace(/^\[|\]$/g, "").split(",") : [m[2]];
      for (const v of values) {
        const f = family(v.trim());
        if (f && !fonts.includes(f)) fonts.push(f);
      }
    }
  }
  if (!fonts.length) unread.push("type (no family names under type:)");

  const radiusLine = lines.find((l) => /^\s*radius:/.test(l));
  const radius = radiusLine ? numbers(radiusLine.replace(/^\s*radius:/, "")) : null;
  if (!radius) unread.push("shape.radius (add radius: [..] in px to check it)");

  const durLine = lines.find((l) => /^\s*durations:/.test(l));
  let durations: number[] | null = durLine ? numbers(durLine.replace(/^\s*durations:/, "")) : null;
  if (!durations) {
    const motionAt = key("motion");
    const text = motionAt >= 0 ? [lines[motionAt], ...under(lines, motionAt)].join(" ") : "";
    const ms = [...text.matchAll(/(\d+)\s?ms\b/g)].map((m) => Number(m[1]));
    durations = ms.length ? [...new Set(ms)] : null;
  }
  if (!durations) unread.push("motion.durations (add durations: [..] in ms, or write them as 240ms)");

  return { colours, fonts, radius, durations, unread };
}

// Code side. Hits are offsets into the source text, like the other detectors.
export interface DriftHit {
  index: number;
  length: number;
  message: string;
}

const STYLE_EXTS = new Set(["css", "scss", "sass", "less"]);
/** White and black need no token to be on purpose. */
const NEUTRAL = new Set(["#ffffff", "#000000"]);
const GENERIC_FONT = /^(?:serif|sans-serif|monospace|cursive|fantasy|system-ui|ui-\w+|-apple-system|blinkmacsystemfont|emoji|math|inherit|initial|unset|revert|var\(.*)$/i;
const fix = (what: string) => `use the token, or add it to DESIGN.md's direction (${what}) if the direction changed on purpose`;

/** Colour literals the direction does not have. Outside stylesheets, only hex that is a whole string
 *  value or a CSS-like value, and never a link target such as href="#add". */
export function driftColours(text: string, ext: string, dir: Direction): DriftHit[] {
  const known = new Set(dir.colours);
  if (!known.size) return [];
  const out: DriftHit[] = [];
  const check = (hex: string, index: number) => {
    if (![4, 7, 9].includes(hex.length)) return;
    const n = normHex(hex);
    if (known.has(n) || NEUTRAL.has(n)) return;
    out.push({ index, length: hex.length, message: `${hex} is not a direction colour in DESIGN.md: ${fix("colour")}` });
  };
  if (STYLE_EXTS.has(ext)) {
    // declaration values only, so an id selector such as #add is never read as a colour
    for (const d of text.matchAll(/:([^;{}]+)(?=[;}])/g)) {
      for (const m of d[1].matchAll(/(^|[^\w&-])(#[0-9a-f]{3,8})\b/gi)) check(m[2], (d.index ?? 0) + 1 + (m.index ?? 0) + m[1].length);
    }
    return out;
  }
  for (const m of text.matchAll(/(["'`[]|[:(,]\s*)(#[0-9a-f]{3,8})\b(?=\s*["'`;,)\]])/gi)) {
    const before = text.slice(Math.max(0, (m.index ?? 0) - 16), (m.index ?? 0) + m[1].length);
    if (/(?:href|to|id|src|url|path|for|target|key)\s*=\s*["'`]?$/i.test(before)) continue; // a link target, not a colour
    check(m[2], (m.index ?? 0) + m[1].length);
  }
  return out;
}

export function driftFonts(text: string, dir: Direction): DriftHit[] {
  if (!dir.fonts.length) return [];
  const known = dir.fonts.map(normFont);
  const out: DriftHit[] = [];
  for (const m of text.matchAll(/(font-family\s*:\s*|fontFamily\s*:\s*["'`])([^;}\n"'`]+|"[^"\n]+"|'[^'\n]+')/g)) {
    const first = m[2].split(",")[0].trim().replace(/^["']|["']$/g, "");
    if (!first || GENERIC_FONT.test(first) || /^\$|^\{|^@/.test(first)) continue;
    if (known.includes(normFont(first))) continue;
    out.push({ index: (m.index ?? 0) + m[1].length, length: m[2].length, message: `font "${first}" is not in DESIGN.md's type families (${dir.fonts.join(", ")}): ${fix("type")}` });
  }
  return out;
}

export function driftRadius(text: string, dir: Direction): DriftHit[] {
  if (!dir.radius) return [];
  const known = new Set(dir.radius);
  const out: DriftHit[] = [];
  for (const m of text.matchAll(/(border(?:-(?:top|bottom)-(?:left|right))?-radius\s*:\s*|borderRadius\s*:\s*)([^;}\n,]+)/g)) {
    const values = [...m[2].matchAll(/(\d+(?:\.\d+)?)(px)?\b(?!\s*%)/g)].map((v) => Number(v[1]));
    const bad = values.filter((v) => v !== 0 && v < 999 && !known.has(v));
    if (!bad.length) continue;
    out.push({ index: (m.index ?? 0) + m[1].length, length: m[2].trim().length, message: `radius ${bad.join(", ")}px is not in DESIGN.md's shape.radius (${dir.radius.join(", ")}): ${fix("shape.radius")}` });
  }
  return out;
}

/** CSS durations only: in script, a bare number may be seconds (Framer Motion) or ms (Web Animations). */
export function driftDurations(text: string, dir: Direction): DriftHit[] {
  if (!dir.durations) return [];
  const known = new Set(dir.durations);
  const out: DriftHit[] = [];
  for (const m of text.matchAll(/((?:transition|animation)(?:-duration|-delay)?\s*:\s*)([^;}\n]+)/g)) {
    if (/-delay/.test(m[1])) continue;
    const ms = [...m[2].matchAll(/(\d*\.?\d+)(ms|s)\b/g)].map((v) => Math.round(Number(v[1]) * (v[2] === "s" ? 1000 : 1)));
    // in a shorthand, the first time is the duration and a second one is the delay
    const durs = /-duration/.test(m[1]) ? ms : m[2].split(",").map((part) => {
      const t = /(\d*\.?\d+)(ms|s)\b/.exec(part);
      return t ? Math.round(Number(t[1]) * (t[2] === "s" ? 1000 : 1)) : null;
    }).filter((v): v is number => v !== null);
    const bad = durs.filter((v) => v > 0 && !known.has(v));
    if (!bad.length) continue;
    out.push({ index: (m.index ?? 0) + m[1].length, length: m[2].trim().length, message: `duration ${bad.join(", ")}ms is not in DESIGN.md's motion durations (${dir.durations.join(", ")}): ${fix("motion.durations")}` });
  }
  return out;
}

/** Direction values no scanned file uses: a sign of a token that was renamed or dropped. */
export function unusedTokens(texts: string[], dir: Direction): { colours: string[]; fonts: string[] } {
  const all = texts.join("\n");
  const used = new Set((all.match(HEX) ?? []).map(normHex));
  const flat = normFont(all);
  return { colours: dir.colours.filter((c) => !used.has(c)), fonts: dir.fonts.filter((f) => !flat.includes(normFont(f))) };
}
