// What RYUX's deterministic checks look for, as data. The checks themselves run in ryux-core
// (crates/ryux-core, as WebAssembly through engine.ts); this catalogue is what `ryux scan --list-rules`
// prints and what the rule text says a machine checks. SOURCE_CHECKS and SYNTAX_CHECKS list ryux-core's
// detectors in its order, with its levels: test/golden.test.mjs holds the lists equal.

export type ScanLevel = "fail" | "warn";

export interface Check {
  rule: string;
  level: ScanLevel;
  /** What the check looks for, for --list-rules and the rule text. */
  looksFor: string;
  /** Only meaningful over a whole folder (skipped when single files are scanned). */
  folder?: boolean;
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

/** The measurable part of the direction in DESIGN.md (scan --design), as ryux-core reads it. */
export interface Direction {
  /** Six-digit lowercase hex. */
  colours: string[];
  fonts: string[];
  radius: number[] | null;
  durations: number[] | null;
  /** Parts of the contract the block does not have in a form a machine can read. */
  unread: string[];
}

/** Every extension `ryux scan` reads. Markdown is left out: docs quote wrong examples on purpose. */
export const SCAN_EXTS: readonly string[] = ["html", "htm", "jsx", "tsx", "vue", "svelte", "astro", "css", "scss", "sass", "less", "js", "mjs", "cjs", "ts", "svg"];

/** What ryux-core's source detectors look for (crates/ryux-core/src/scan.rs), in its order. */
export const SOURCE_CHECKS: Check[] = [
  { rule: "RX-DS-03", level: "warn", looksFor: "with --design: a colour, font family, corner radius, or CSS duration the DESIGN.md direction does not have (design drift)" },
  { rule: "RX-CD-02", level: "fail", looksFor: "Rupiah written as Rp 1.000, Rp. 1.000, Rp1,000, Rp1.000,00, Rp1000, IDR 1000, or Rp followed by a space before a value" },
  { rule: "RX-FE-12", level: "warn", looksFor: "Intl currency style with IDR, which prints Rp 1.250.000,00 (a space, and decimals unless set to 0)" },
  { rule: "RX-CD-09", level: "warn", looksFor: "dates as 10/02/2026 and times as 2:30 PM in Indonesian copy (lang id, id-ID, Rupiah, or Indonesian words in the folder); test files are skipped" },
  { rule: "RX-CD-12", level: "warn", looksFor: "a link or button whose whole text is generic (Selengkapnya, Klik di sini, Learn more, Read more, Click here, Submit), with no information scent" },
  { rule: "RX-CD-12", level: "warn", looksFor: "a heading that opens with a stock phrase (Selamat datang di, Yuk, Ayo, Welcome to, Introducing), so its first two words carry no meaning" },
  { rule: "RX-CD-18", level: "warn", looksFor: "filler phrases in visible text (memungkinkan Anda, kami memahami bahwa, perlu diketahui bahwa, allows you to, enables you to, we understand that)" },
  { rule: "RX-CD-19", level: "warn", looksFor: "superlative claims in visible text (terbaik, tercepat, termurah, nomor 1, #1, the best, fastest, cheapest, world-class)" },
  { rule: "RX-AS-03", level: "fail", looksFor: "lorem ipsum filler" },
  { rule: "RX-AS-03", level: "warn", looksFor: "placeholder content: John Doe, Jane Doe, [DATA], [TBD], XXXX" },
  { rule: "RX-AS-04", level: "warn", looksFor: "urgency copy (only 2 left, hurry, offer ends tonight, hanya tersisa 2, buruan, stok terbatas)" },
  { rule: "RX-A11Y-02", level: "fail", looksFor: "zoom turned off: user-scalable=no, maximum-scale=1, userScalable: false, maximumScale: 1" },
  { rule: "RX-A11Y-02", level: "warn", looksFor: "text set below 12px (CSS font-size, Tailwind text-[Npx], fontSize in style objects)" },
  { rule: "RX-A11Y-03", level: "fail", looksFor: "a positive tabindex, which takes the element out of the visual focus order" },
  { rule: "RX-A11Y-03", level: "warn", looksFor: "focus outlines removed on a control (a button, link, input, or :focus rule) with no focus-visible replacement" },
  { rule: "RX-A11Y-03", level: "warn", looksFor: "in .jsx, .tsx, and .html: a modal dialog (role=\"dialog\" or \"alertdialog\" with aria-modal, or with a scrim around it or just before it; an inline alertdialog is not modal) whose file, with the scripts an HTML page loads from the project, shows no Esc key check or no Tab kept inside (a Tab key check, a focus trap, inert); showModal() or a dialog or focus-trap library gives both; once per file, and not when a page loads a script the scan cannot read" },
  { rule: "RX-A11Y-03", level: "warn", looksFor: "in .jsx, .tsx, and .html: an inline confirmation (role=\"alertdialog\" that is not modal) with no autofocus on it or inside it, in a file that, with the scripts an HTML page loads from the project, calls no .focus(); once per file, and not when a page loads a script the scan cannot read" },
  { rule: "RX-FM-01", level: "warn", looksFor: "in .jsx, .tsx, and .html: a field (input, select, textarea; not type hidden, submit, button, reset, or image) on screen (not hidden, display none, a hidden or invisible class with no variant that shows it again, or aria-hidden with tabindex -1 or disabled) with no label tied to it: not inside a <label>, and no <label> or wrapper component with htmlFor equal to its id, no aria-label, aria-labelledby, or title; a placeholder is not a label; not with spread props or an id the parser cannot read; once per field" },
  { rule: "RX-IX-12", level: "warn", looksFor: "in .jsx, .tsx, and .html: a link to \"#\", \"\", or javascript: with no click handler, or an empty click handler (onClick={() => {}}); not with spread props, not in a directions preview (directions.html), and in HTML only on a page with no script; once per file" },
  { rule: "RX-FM-05", level: "warn", looksFor: "in .jsx, .tsx, and .html: a phone, OTP, or amount field by its name, id, or autocomplete (phone, tel, hp, whatsapp, otp, nominal, amount, one-time-code) with type text or none and no inputmode; once per file" },
  { rule: "RX-A11Y-07", level: "warn", looksFor: "in .jsx, .tsx, and .html: a field marked aria-invalid (not \"false\") with no aria-describedby or aria-errormessage; once per file" },
  { rule: "RX-A11Y-04", level: "warn", looksFor: "in .jsx, .tsx, and .html: two or more radio buttons with the same literal name, none inside a <fieldset>, a role=\"radiogroup\" or \"group\" with aria-label or aria-labelledby, a form with one, or a landmark with one that holds no other field; once per file, saying how many groups" },
  { rule: "RX-A11Y-04", level: "warn", looksFor: "in .jsx, .tsx, and .html: an <a> with a click handler and no href or tabindex, which Tab does not reach; not with spread props; once per file" },
  { rule: "RX-FM-05", level: "warn", looksFor: "in .jsx, .tsx, and .html: autocomplete=\"off\" on a field whose name, id, or type names the person's email, phone, name, or address, unless the field or its form is named for someone else (invite, recipient, member, contact); once per file" },
  { rule: "RX-A11Y-04", level: "warn", looksFor: "in .jsx, .tsx, and .html: two or more checkboxes with the same literal name, grouped as for radio buttons; once per file, saying how many groups" },
  { rule: "RX-A11Y-04", level: "warn", looksFor: "in .jsx, .tsx, and .html: a radio button whose literal name no other radio button has, not inside a JSX expression that may render it more than once, and in HTML only on a page with no script; once per file" },
  { rule: "RX-A11Y-04", level: "warn", looksFor: "in .jsx, .tsx, and .html: an <html> with no lang (in JSX, not with spread props); not in a folder named assets-src" },
  { rule: "RX-IX-12", level: "warn", looksFor: "in .jsx, .tsx, and .html: a <button> with a bare disabled (not an expression) and no title or aria-describedby saying why; not with spread props, and in HTML only on a page with no script; once per file" },
  { rule: "RX-A11Y-04", level: "fail", looksFor: "<img> with no alt attribute" },
  { rule: "RX-A11Y-04", level: "warn", looksFor: "a clickable <div> or <span> with no role (a scrim whose first child is a role=\"dialog\" is skipped)" },
  { rule: "RX-A11Y-04", level: "warn", looksFor: "an icon-only <button> with no accessible name (an empty child a script fills, by id or data-bind, counts as its name)" },
  { rule: "RX-A11Y-04", level: "warn", looksFor: "a heading that skips a level (h2 straight to h4)" },
  { rule: "RX-A11Y-04", level: "warn", looksFor: "in .jsx, .tsx, and .html: a <button> with no type inside a <form>, which submits it (not one with a type or spread props; the last typeless button with no click handler counts as the submit when the form has no explicit one; a method=\"dialog\" form is skipped)" },
  { rule: "RX-IX-02", level: "warn", looksFor: "in .jsx, .tsx, and .html: a loading indicator (a spinner, loader, loading, or skeleton class; a component by such a name defined in the file, taken from an icon set, or imported from a project module whose own markup announces nothing; or \"Loading…\", \"Memuat…\", \"Memproses…\" text) in a file, with the scripts an HTML page loads, that has no aria-busy, aria-live, role=\"status\", \"progressbar\", or \"alert\", <output>, or <progress>; once per file, and not when a page loads a script the scan cannot read" },
  { rule: "RX-FM-05", level: "warn", folder: true, looksFor: "a textarea in a folder where nothing makes a textarea grow with its text" },
  { rule: "RX-A11Y-08", level: "warn", folder: true, looksFor: "animation in a folder where nothing handles prefers-reduced-motion" },
  { rule: "RX-A11Y-08", level: "warn", looksFor: "an animation that repeats forever and is not a loading indicator, with no way to pause it" },
  { rule: "RX-UI-11", level: "warn", looksFor: "a transition on all properties or on layout properties (width, height, top, left, margin, padding)" },
  { rule: "RX-UI-11", level: "warn", looksFor: "a UI transition longer than 500 ms" },
  { rule: "RX-UI-35", level: "warn", folder: true, looksFor: "a backdrop blur in a folder where nothing handles prefers-reduced-transparency or prefers-contrast" },
  { rule: "RX-DS-03", level: "warn", looksFor: "three or more one-off hex colors in a file that is not a token or theme file" },
  { rule: "RX-UI-19", level: "fail", looksFor: "an .svg file whose root has no viewBox, so it cannot scale" },
  { rule: "RX-UI-19", level: "warn", looksFor: "an .svg file with a fixed width or height on the root, an embedded raster, <text> inside the art, or editor metadata" },
];

/** What `ryux scan <url>` measures on the rendered page, for --list-rules and the rule text: ryux-core judges what
 *  the in-page extract read (crates/ryux-core/src/probe.rs, cli/page-probe.ts), in this order; the CLI reports
 *  RX-QA-08 itself. test/golden.test.mjs holds the other rows equal to ryux-core's. */
export const RENDER_CHECKS: Check[] = [
  { rule: "RX-RD-01", level: "fail", looksFor: "a page that scrolls sideways at a scanned width, naming the widest elements" },
  { rule: "RX-A11Y-01", level: "fail", looksFor: "text under 4.5:1 contrast (3:1 when large) on a solid background; text over images or gradients is skipped" },
  { rule: "RX-A11Y-02", level: "fail", looksFor: "controls under 24x24px that are crowded by neighbours (warn when spaced as WCAG 2.5.8 allows); rendered text under 12px (warn)" },
  { rule: "RX-QA-03", level: "warn", looksFor: "text boxes of unrelated elements that overlap" },
  { rule: "RX-QA-03", level: "fail", looksFor: "text a fixed or sticky bar cuts on the first screen while the bar repeats it, and text a bottom bar still covers with every scroller at its end" },
  { rule: "RX-AS-05", level: "warn", looksFor: "visual tells, once per page: three or more glowing elements (a coloured shadow around them), three or more blurred glass layers, or a pill above the main heading with no status in it" },
  { rule: "RX-UI-10", level: "warn", looksFor: "visual tells, once per page: a blue-to-purple gradient behind a large area, prose set in monospace, or an italic serif word inside a display heading" },
  { rule: "RX-UI-26", level: "warn", looksFor: "a near-black page whose action colour is a saturated neon, with glow: the default look of an AI product" },
  { rule: "RX-UI-01", level: "warn", looksFor: "a bordered or shadowed, rounded box that holds another one (cards inside cards)" },
  { rule: "RX-UX-15", level: "warn", looksFor: "at 1024px and wider, the page's only choice (one radio group) starts below the first screen while a button that carries an amount (\"Bayar Rp1.424.000\") is on it" },
  { rule: "RX-FM-05", level: "warn", looksFor: "a shown textarea that, filled with 8 lines for a moment, keeps its height and hides the text past its edge" },
  { rule: "RX-QA-08", level: "warn", looksFor: "script errors thrown while the page loads" },
];

/** What ryux-core reads in .jsx and .tsx as a syntax tree (crates/ryux-core/src/jsx.rs), for --list-rules and the
 *  rule text. engine.ts runs them through syntaxScan. */
export const SYNTAX_CHECKS: Check[] = [
  { rule: "RX-A11Y-03", level: "warn", looksFor: "in .jsx and .tsx: an element that starts a drag (onPointerDown, onMouseDown, onTouchStart, onDragStart) with no keyboard way (no onKeyDown, onKeyUp, tabIndex, or role), not a native control and with no spread props" },
];
