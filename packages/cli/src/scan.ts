// Deterministic detectors for RYUX rules a machine can check in source code. Pure: takes file
// contents, returns findings, no LLM and no network. Each detector names the RX rule it checks; the
// rule text stays in intelligence/content.ts. "fail" is for a pattern that is wrong wherever it
// appears; "warn" is for a signal a person or agent should look at.

export type ScanLevel = "fail" | "warn";

export interface Source {
  /** Path as shown in findings. */
  path: string;
  /** File extension, lowercase, without the dot. */
  ext: string;
  raw: string;
  /** The raw text with comments blanked out (same length and line breaks), so offsets still match. */
  text: string;
}

export interface ScanContext {
  /** Some scanned file handles reduced motion. Undefined when single files were scanned, so
   *  folder-level detectors stay quiet instead of guessing. */
  reducedMotion?: boolean;
  /** Some scanned file is Indonesian (lang id, id-ID, Rupiah, or common Indonesian words). Undefined
   *  when single files were scanned; locale detectors then read the file itself. */
  indonesian?: boolean;
}

const INDONESIAN = /\blang=["']id\b|\bid-ID\b|\blocale\s*[:=]\s*["'`]id\b|\bRp\.?\s?\d|\b(?:yang|untuk|tidak|silakan|pesanan|belum)\b/;
const TEST_FILE = /(?:^|\/)(?:tests?|__tests__)\/|\.(?:test|spec)\.[cm]?[jt]sx?$/;

interface Hit {
  index: number;
  length: number;
  message: string;
}

export interface Detector {
  rule: string;
  level: ScanLevel;
  /** What the detector looks for, for --list-rules. */
  looksFor: string;
  exts: readonly string[];
  /** Only meaningful over a whole folder (skipped when single files are scanned). */
  folder?: boolean;
  find(src: Source, ctx: ScanContext): Hit[];
}

export interface ScanFinding {
  level: ScanLevel;
  rule: string;
  file: string;
  line: number;
  column: number;
  message: string;
  /** Rendered checks only: the viewport width and the element. */
  width?: number;
  selector?: string;
}

/** What `ryux scan <url>` measures on the rendered page (cli/page-probe.ts), for --list-rules and the
 *  rule text. */
export const RENDER_CHECKS: Pick<Detector, "rule" | "level" | "looksFor">[] = [
  { rule: "RX-RD-01", level: "fail", looksFor: "a page that scrolls sideways at a scanned width, naming the widest elements" },
  { rule: "RX-A11Y-01", level: "fail", looksFor: "text under 4.5:1 contrast (3:1 when large) on a solid background; text over images or gradients is skipped" },
  { rule: "RX-A11Y-02", level: "fail", looksFor: "controls under 24x24px that are crowded by neighbours (warn when spaced as WCAG 2.5.8 allows); rendered text under 12px (warn)" },
  { rule: "RX-QA-03", level: "warn", looksFor: "text boxes of unrelated elements that overlap" },
  { rule: "RX-QA-08", level: "warn", looksFor: "script errors thrown while the page loads" },
];

const MARKUP = ["html", "htm", "jsx", "tsx", "vue", "svelte", "astro"] as const;
const STYLE = ["css", "scss", "sass", "less"] as const;
const SCRIPT = ["js", "mjs", "cjs", "ts"] as const;
const CODE = [...MARKUP, ...SCRIPT] as const;
/** Every extension `ryux scan` reads. Markdown is left out: docs quote wrong examples on purpose. */
export const SCAN_EXTS: readonly string[] = [...MARKUP, ...STYLE, ...SCRIPT, "svg"];

const short = (s: string): string => {
  const t = s.replace(/\s+/g, " ").trim();
  return t.length > 48 ? `${t.slice(0, 45)}...` : t;
};

/** Every match of each pattern, as hits with the message built from the matched text. */
function matches(text: string, patterns: [RegExp, (m: RegExpExecArray) => string | null][]): Hit[] {
  const hits: Hit[] = [];
  for (const [re, message] of patterns) {
    for (const m of text.matchAll(new RegExp(re.source, re.flags.includes("g") ? re.flags : `${re.flags}g`))) {
      const msg = message(m as RegExpExecArray);
      if (msg) hits.push({ index: m.index!, length: m[0].length, message: msg });
    }
  }
  return hits;
}

/** The end of the tag that opens at `start` (index of "<"), skipping ">" inside quotes and {...}. */
function tagEnd(text: string, start: number): number {
  let quote = "";
  let depth = 0;
  for (let i = start + 1; i < text.length; i++) {
    const c = text[i];
    if (quote) {
      if (c === quote) quote = "";
    } else if (c === '"' || c === "'" || c === "`") quote = c;
    else if (c === "{") depth++;
    else if (c === "}") depth = Math.max(0, depth - 1);
    else if (c === ">" && depth === 0) return i;
  }
  return -1;
}

/** Each opening tag of the given names, with its attribute text. */
function tags(text: string, names: string): { index: number; length: number; name: string; attrs: string }[] {
  const out = [];
  for (const m of text.matchAll(new RegExp(`<(${names})(?=[\\s/>])`, "g"))) {
    const end = tagEnd(text, m.index!);
    if (end < 0) continue;
    out.push({ index: m.index!, length: end - m.index! + 1, name: m[1], attrs: text.slice(m.index! + m[0].length, end) });
  }
  return out;
}

const RUPIAH_FIX = "write Rp1.250.000 (Rp right before the number, dots for thousands, no decimals)";
const px = (v: string): number => Number.parseFloat(v);

export const DETECTORS: Detector[] = [
  {
    rule: "RX-CD-02",
    level: "fail",
    looksFor: "Rupiah written as Rp 1.000, Rp. 1.000, Rp1,000, Rp1.000,00, Rp1000, IDR 1000, or Rp followed by a space before a value",
    exts: SCAN_EXTS,
    find: ({ text }) =>
      matches(text, [
        [/\bRp\.?[ \u00a0]*\d[\d.,]*/, (m) => (/^Rp\d{1,3}(?:(?:\.\d{3})*|,\d{1,2})$/.test(m[0].replace(/[.,]$/, "")) && !/,00$/.test(m[0]) ? null : `"${short(m[0])}": ${RUPIAH_FIX}`)],
        [/\bRp[ \u00a0]+(?:\{|\$\{)/, (m) => `"${short(m[0])}...": Rupiah with a space before the value; ${RUPIAH_FIX}`],
        [/["'`]Rp\.?[ \u00a0]["'`]/, (m) => `${short(m[0])}: a Rupiah prefix with a space; ${RUPIAH_FIX}`],
        [/\bIDR[ \u00a0]?\d[\d.,]*/, (m) => `"${short(m[0])}": ${RUPIAH_FIX}`],
      ]),
  },
  {
    rule: "RX-FE-12",
    level: "warn",
    looksFor: "Intl currency style with IDR, which prints Rp 1.250.000,00 (a space, and decimals unless set to 0)",
    exts: CODE,
    find: ({ text }) =>
      matches(text, [
        [/currency\s*:\s*["'`]IDR["'`]/, () => "Intl currency style writes a space after Rp (and ,00 unless maximumFractionDigits is 0): format with id-ID grouping and prepend Rp"],
      ]),
  },
  {
    rule: "RX-CD-09",
    level: "warn",
    looksFor: "dates as 10/02/2026 and times as 2:30 PM in Indonesian copy (lang id, id-ID, Rupiah, or Indonesian words in the folder); test files are skipped",
    exts: CODE,
    find: ({ path, text }, ctx) =>
      TEST_FILE.test(path) || !(ctx.indonesian ?? INDONESIAN.test(text)) ? [] : matches(text, [
        [/(?<![\d/])\d{1,2}\/\d{1,2}\/\d{4}(?![\d/])/, (m) => `"${m[0]}": in Indonesian copy write 2 Okt 2026 (other markets follow their locale)`],
        [/\b\d{1,2}[:.]\d{2}\s?(?:AM|PM|am|pm)\b/, (m) => `"${m[0]}": in Indonesian copy write 14.30 in 24-hour form (other markets follow their locale)`],
      ]),
  },
  {
    rule: "RX-AS-03",
    level: "fail",
    looksFor: "lorem ipsum filler",
    exts: CODE,
    find: ({ text }) => matches(text, [[/\blorem ipsum\b/i, () => "lorem ipsum: use realistic sample content from the brief, labeled as sample data"]]),
  },
  {
    rule: "RX-AS-03",
    level: "warn",
    looksFor: "placeholder content: John Doe, Jane Doe, [DATA], [TBD], XXXX",
    exts: CODE,
    find: ({ text }) =>
      matches(text, [
        [/\b(?:John|Jane) Doe\b/, (m) => `"${m[0]}": a placeholder person; use realistic sample data and label it, or the real name`],
        [/\[(?:REAL DATA|DATA|TBD|TODO|PLACEHOLDER)\]/i, (m) => `"${m[0]}": a placeholder where sample data would do; keep a visible placeholder only for an asset that does not exist yet`],
        [/(?<![A-Za-z])X{4,}(?![A-Za-z])/, (m) => `"${m[0]}": placeholder characters; use realistic sample data, labeled`],
      ]),
  },
  {
    rule: "RX-AS-04",
    level: "warn",
    looksFor: "urgency copy (only 2 left, hurry, offer ends tonight, hanya tersisa 2, buruan, stok terbatas)",
    exts: CODE,
    find: ({ text }) =>
      matches(text, [
        [
          /\bonly \d+ (?:left|remaining)\b|\b(?:offer|sale|deal|promo) ends (?:tonight|today|soon)\b|\bhurry\b|\blimited time only\b|\bdon'?t miss out\b|\bhanya tersisa \d+|\btinggal \d+ lagi\b|\bburuan\b|\b(?:promo|diskon|penawaran) berakhir (?:malam ini|hari ini|segera)\b|\bjangan sampai kehabisan\b|\bstok terbatas\b/i,
          (m) => `"${m[0]}": urgency copy; keep it only when the deadline or quota is real, stated as a plain fact`,
        ],
      ]),
  },
  {
    rule: "RX-A11Y-02",
    level: "fail",
    looksFor: "zoom turned off: user-scalable=no, maximum-scale=1, userScalable: false, maximumScale: 1",
    exts: CODE,
    find: ({ text }) =>
      matches(text, [
        [/user-scalable\s*=\s*["']?(?:no|0)\b|maximum-scale\s*=\s*["']?1(?:\.0+)?(?![\d.])|userScalable\s*:\s*false|maximumScale\s*:\s*1(?![\d.])/i, (m) => `"${m[0]}": people must be able to zoom; remove it`],
      ]),
  },
  {
    rule: "RX-A11Y-02",
    level: "warn",
    looksFor: "text set below 12px (CSS font-size, Tailwind text-[Npx], fontSize in style objects)",
    exts: [...MARKUP, ...STYLE, ...SCRIPT],
    find: ({ text }) =>
      matches(text, [
        [/font-size\s*:\s*(\d+(?:\.\d+)?)px|\btext-\[(\d+(?:\.\d+)?)px\]|fontSize\s*:\s*["'`]?(\d+(?:\.\d+)?)(?:px)?["'`]?(?=\s*[,}])/, (m) => {
          const v = px(m[1] ?? m[2] ?? m[3]);
          return v < 12 ? `${v}px text: body text is 14 to 16px on mobile; below 12px is hard to read` : null;
        }],
      ]),
  },
  {
    rule: "RX-A11Y-03",
    level: "fail",
    looksFor: "a positive tabindex, which takes the element out of the visual focus order",
    exts: MARKUP,
    find: ({ text }) =>
      matches(text, [[/\btab[iI]ndex\s*=\s*(?:["']|\{\s*)?([1-9]\d*)/, (m) => `tabindex ${m[1]}: keep focus order the same as the visual order; use 0 or the DOM order`]]),
  },
  {
    rule: "RX-A11Y-03",
    level: "warn",
    looksFor: "focus outlines removed on a control (a button, link, input, or :focus rule) with no focus-visible replacement",
    exts: [...MARKUP, ...STYLE],
    find: ({ ext, text }) => {
      const removed = /outline\s*:\s*["']?(?:none|0)\b|\boutline-none\b/;
      const replaced = /focus-visible|focus:(?:ring|border|shadow|bg|underline|outline-(?!none))/;
      const message = "focus outline removed on a control with no focus-visible style: show a visible focus indicator";
      if ((STYLE as readonly string[]).includes(ext)) {
        if (replaced.test(text)) return [];
        const hits: Hit[] = [];
        for (const m of text.matchAll(/([^{}]+)\{([^}]*)\}/g)) {
          const target = /(?:^|[\s,>+~])(?:button|a|input|select|textarea|summary)\b|:focus(?!-visible|-within)|\[role|\.btn|\*/.test(m[1]);
          const r = removed.exec(m[2]);
          if (target && r) hits.push({ index: m.index! + m[1].length + 1 + r.index, length: r[0].length, message });
        }
        return hits;
      }
      return tags(text, "button|a|input|select|textarea|summary|div|span|li")
        .filter((t) => {
          if (!removed.test(t.attrs) || replaced.test(t.attrs) || /\btab[iI]ndex\s*=\s*(?:["']|\{\s*)?-1/.test(t.attrs)) return false;
          return !/^(?:div|span|li)$/.test(t.name) || /\brole\s*=\s*["']?(?:button|link|tab|menuitem|option|checkbox|switch)|(?:^|\s)(?:onClick|onclick|@click|on:click)\s*=/.test(t.attrs);
        })
        .map((t) => ({ index: t.index, length: t.length, message }));
    },
  },
  {
    rule: "RX-A11Y-04",
    level: "fail",
    looksFor: "<img> with no alt attribute",
    exts: MARKUP,
    find: ({ text }) =>
      tags(text, "img")
        .filter((t) => !/\balt\s*=/.test(t.attrs) && !/\{\s*\.\.\./.test(t.attrs))
        .map((t) => ({ index: t.index, length: t.length, message: 'an <img> with no alt: describe meaningful images, use alt="" for decorative ones' })),
  },
  {
    rule: "RX-A11Y-04",
    level: "warn",
    looksFor: "a clickable <div> or <span> with no role",
    exts: MARKUP,
    find: ({ text }) =>
      tags(text, "div|span")
        .filter((t) => /(?:^|\s)(?:onClick|onclick|@click|v-on:click|on:click)\s*=/.test(t.attrs) && !/\brole\s*=/.test(t.attrs))
        .map((t) => ({ index: t.index, length: t.length, message: `a clickable <${t.name}>: use a <button> or <a> so it works from the keyboard and has a role` })),
  },
  {
    rule: "RX-A11Y-04",
    level: "warn",
    looksFor: "an icon-only <button> with no accessible name",
    exts: MARKUP,
    find: ({ text }) =>
      tags(text, "button").flatMap((t) => {
        if (/\baria-label(?:ledby)?\s*=|\btitle\s*=|\{\s*\.\.\./.test(t.attrs)) return [];
        const close = text.indexOf("</button>", t.index + t.length);
        if (close < 0) return [];
        const inner = text.slice(t.index + t.length, close);
        const icon = /<svg\b|<i\b|<[A-Z]\w*/.test(inner);
        const named = /\balt\s*=\s*["'][^"']+["']|\baria-label\s*=/.test(inner);
        const words = inner.replace(/<[^>]*>/g, "").trim();
        return icon && !named && !words ? [{ index: t.index, length: t.length, message: "an icon-only <button> with no name: add aria-label or visually hidden text" }] : [];
      }),
  },
  {
    rule: "RX-A11Y-04",
    level: "warn",
    looksFor: "a heading that skips a level (h2 straight to h4)",
    exts: MARKUP,
    find: ({ text }) => {
      const hits: Hit[] = [];
      let prev = 0;
      for (const m of text.matchAll(/<h([1-6])(?=[\s>])/g)) {
        const level = Number(m[1]);
        if (prev && level > prev + 1) hits.push({ index: m.index!, length: m[0].length, message: `h${prev} then h${level}: headings skip a level; use h${prev + 1}` });
        prev = level;
      }
      return hits;
    },
  },
  {
    rule: "RX-A11Y-08",
    level: "warn",
    looksFor: "animation in a folder where nothing handles prefers-reduced-motion",
    exts: [...MARKUP, ...STYLE, ...SCRIPT],
    folder: true,
    find: ({ text }, ctx) => {
      if (ctx.reducedMotion !== false) return [];
      const m = /@keyframes\b|\banimation\s*:|\banimate-[a-z]|<motion\.\w+/.exec(text);
      return m ? [{ index: m.index, length: m[0].length, message: `"${m[0]}" and nothing in the scanned folder handles prefers-reduced-motion: replace large movement with a fade or a cut when it is set` }] : [];
    },
  },
  {
    rule: "RX-DS-03",
    level: "warn",
    looksFor: "three or more one-off hex colors in a file that is not a token or theme file",
    exts: [...MARKUP, ...STYLE, ...SCRIPT],
    find: ({ path, text }) => {
      if (/token|theme|colou?r|palette|tailwind\.config/i.test(path)) return [];
      const lines = text.split("\n");
      let offset = 0;
      const found: { index: number; value: string }[] = [];
      for (const line of lines) {
        if (!/--[\w-]+\s*:/.test(line)) {
          for (const m of line.matchAll(/(?<=[:(,[]\s*|["'`])(?<!(?:fill|stroke|stop-color)=["'])#(?:[0-9a-fA-F]{8}|[0-9a-fA-F]{6}|[0-9a-fA-F]{3,4})\b/g)) {
            found.push({ index: offset + m.index!, value: m[0].toLowerCase() });
          }
        }
        offset += line.length + 1;
      }
      const distinct = [...new Set(found.map((f) => f.value))];
      if (distinct.length < 3) return [];
      return [{ index: found[0].index, length: found[0].value.length, message: `${distinct.length} one-off colors (${distinct.slice(0, 3).join(", ")}${distinct.length > 3 ? ", ..." : ""}): use the color tokens, or define them by role` }];
    },
  },
  {
    rule: "RX-UI-19",
    level: "fail",
    looksFor: "an .svg file whose root has no viewBox, so it cannot scale",
    exts: ["svg"],
    find: ({ text }) => {
      const root = tags(text, "svg")[0];
      if (!root || /\bviewBox\s*=/.test(root.attrs)) return [];
      return [{ index: root.index, length: 4, message: "<svg> with no viewBox: add one (viewBox=\"0 0 w h\") so the art scales with its container" }];
    },
  },
  {
    rule: "RX-UI-19",
    level: "warn",
    looksFor: "an .svg file with a fixed width or height on the root, an embedded raster, <text> inside the art, or editor metadata",
    exts: ["svg"],
    find: ({ text }) => {
      const root = tags(text, "svg")[0];
      if (!root) return [];
      const fixed = [...root.attrs.matchAll(/(?<![\w:-])(width|height)\s*=\s*["']([^"']+)["']/g)].filter((m) => !/%$/.test(m[2].trim()));
      return [
        ...(fixed.length ? [{ index: root.index, length: 4, message: `fixed ${fixed.map((m) => `${m[1]}="${m[2]}"`).join(" ")} on the root: leave the size to CSS so the art fits its container` }] : []),
        // One finding per kind: an editor export repeats its metadata on every element.
        ...([
          [/<(?:image|feImage)\b|data:image\/(?:png|jpe?g|gif|webp)/, "an embedded raster inside the SVG: draw it as vector, or ship the raster on its own at 2x"],
          [/<text\b/, "<text> inside the art: keep words in the HTML so they can be translated, read, and zoomed"],
          [/\b(?:sodipodi|inkscape):|xmlns:sketch|data-figma|<metadata\b/, "editor metadata: export without it"],
        ] as const).flatMap(([re, message]) => {
          const m = re.exec(text);
          return m ? [{ index: m.index, length: m[0].length, message }] : [];
        }),
      ];
    },
  },
];

/** Blank out comments (keeping length and line breaks) so commented-out code is not scanned. */
export function stripComments(raw: string, ext: string): string {
  const blank = (s: string): string => s.replace(/[^\n]/g, " ");
  let text = raw.replace(/\/\*[\s\S]*?\*\//g, blank).replace(/<!--[\s\S]*?-->/g, blank);
  if (ext !== "css") {
    text = text.replace(/(^|[^:\\"'`])(\/\/[^\n]*)/g, (_, pre: string, c: string) => pre + blank(c));
  }
  return text;
}

export function toSource(path: string, raw: string): Source {
  const ext = path.slice(path.lastIndexOf(".") + 1).toLowerCase();
  return { path, ext, raw, text: stripComments(raw, ext) };
}

/** Rules switched off by `ryux-ignore RX-..` (this line and the next) or `ryux-ignore-file RX-..`.
 *  With no IDs, every rule is switched off there. */
function ignores(raw: string): { file: Set<string>; lines: Map<number, Set<string>> } {
  const file = new Set<string>();
  const lines = new Map<number, Set<string>>();
  raw.split("\n").forEach((line, i) => {
    const m = /ryux-ignore(-file)?((?:[\s,]+RX-[A-Z0-9]+-\d+)*)/.exec(line);
    if (!m) return;
    const ids = m[2].match(/RX-[A-Z0-9]+-\d+/g) ?? ["*"];
    if (m[1]) ids.forEach((id) => file.add(id));
    else for (const n of [i + 1, i + 2]) lines.set(n, new Set([...(lines.get(n) ?? []), ...ids]));
  });
  return { file, lines };
}

function lineCol(raw: string, index: number): { line: number; column: number } {
  const before = raw.slice(0, index);
  const line = before.split("\n").length;
  return { line, column: index - before.lastIndexOf("\n") };
}

export interface ScanOptions {
  /** True when a folder was scanned, so folder-level detectors can run. */
  folder: boolean;
  /** Rule IDs to skip. */
  skip?: Set<string>;
}

/** Run every detector over the sources. Findings are ordered by file, then line. */
export function scanSources(sources: Source[], opts: ScanOptions): ScanFinding[] {
  const ctx: ScanContext = opts.folder
    ? {
        reducedMotion: sources.some((s) => /prefers-reduced-motion|motion-(?:reduce|safe):|useReducedMotion|reducedMotion/.test(s.text)),
        indonesian: sources.some((s) => !TEST_FILE.test(s.path) && INDONESIAN.test(s.text)),
      }
    : {};
  const findings: ScanFinding[] = [];
  for (const src of sources) {
    const ign = ignores(src.raw);
    for (const d of DETECTORS) {
      if (!d.exts.includes(src.ext) || opts.skip?.has(d.rule) || ign.file.has(d.rule) || ign.file.has("*")) continue;
      if (d.folder && !opts.folder) continue;
      const seen = new Set<number>();
      for (const hit of d.find(src, ctx)) {
        const { line, column } = lineCol(src.raw, hit.index);
        const off = ign.lines.get(line);
        if (seen.has(hit.index) || off?.has(d.rule) || off?.has("*")) continue;
        seen.add(hit.index);
        findings.push({ level: d.level, rule: d.rule, file: src.path, line, column, message: hit.message });
      }
    }
  }
  return findings.sort((a, b) => a.file.localeCompare(b.file) || a.line - b.line || a.column - b.column);
}
