// What RYUX's deterministic checks look for, as data. The checks themselves run in ryux-core
// (crates/ryux-core, as WebAssembly through engine.ts); this catalogue is what `ryux scan --list-rules`
// prints and what the rule text says a machine checks. SOURCE_CHECKS and SYNTAX_CHECKS list ryux-core's
// detectors in its order, with its levels: test/golden.test.mjs holds the lists equal.

/** "note" is not a fault: a motion opportunity the agent reports at the end and offers to build (RX-UI-11). */
export type ScanLevel = "fail" | "warn" | "note";

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
  { rule: "RX-CD-21", level: "warn", looksFor: "a sentence in visible text longer than 20 words (NN/g ceiling 15 to 20)" },
  { rule: "RX-CD-18", level: "warn", looksFor: "filler phrases in visible text (memungkinkan Anda, kami memahami bahwa, perlu diketahui bahwa, allows you to, enables you to, we understand that)" },
  { rule: "RX-CD-19", level: "warn", looksFor: "superlative claims in visible text (terbaik, tercepat, termurah, nomor 1, #1, the best, fastest, cheapest, world-class)" },
  { rule: "RX-AS-03", level: "fail", looksFor: "lorem ipsum filler" },
  { rule: "RX-AS-03", level: "warn", looksFor: "placeholder content: John Doe, Jane Doe, [DATA], [TBD], XXXX; a stand-in asset set as text ([QR], [FOTO], [icon]); a logo slot ([LOGO]) standing alone, with no brand name in plain text beside it" },
  { rule: "RX-AS-04", level: "warn", looksFor: "urgency copy (only 2 left, hurry, offer ends tonight, hanya tersisa 2, buruan, stok terbatas); a low stock count (stok tinggal 3, sisa 2 pcs, 5 seats left); other shoppers as pressure (12 orang sedang melihat); a promotion counting down (flash sale berakhir dalam, sale ends in), unless the file labels its data as sample" },
  { rule: "RX-AS-02", level: "warn", looksFor: "people who need a source: a testimonial section (Testimoni, Apa kata mereka, What our customers say, a testimonial class), a row of customers (Dipercaya oleh, Trusted by), or a face from a generator (pravatar, randomuser, dicebear); once per file for each, not when every quote or logo is left as a stand-in ([Kutipan asli], CUSTOMER LOGO), in a test file, or in a file that labels its data as sample where the visitor sees it" },
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
  { rule: "RX-UI-11", level: "warn", looksFor: "elements that wait over 500 ms before they move, or a stagger step of 100 ms or more, once per file (tooltips, loaders, loops, and success moments aside)" },
  { rule: "RX-UI-35", level: "warn", folder: true, looksFor: "a backdrop blur in a folder where nothing handles prefers-reduced-transparency or prefers-contrast" },
  { rule: "RX-DS-03", level: "warn", looksFor: "three or more one-off hex colors in a file that is not a token or theme file" },
  { rule: "RX-UI-19", level: "fail", looksFor: "an .svg file whose root has no viewBox, so it cannot scale" },
  { rule: "RX-UI-19", level: "warn", looksFor: "an .svg file with a fixed width or height on the root, an embedded raster, <text> inside the art, or editor metadata" },
  { rule: "RX-UI-11", level: "note", looksFor: "motion note, L2: in JSX, a part shown and hidden by a flag (open, show, visible, expanded) in a file with no motion; a component counts only when its own file is scanned and has no motion" },
];

/** What `ryux scan <url>` measures on the rendered page, for --list-rules and the rule text: ryux-core judges what
 *  the in-page extract read (crates/ryux-core/src/probe.rs, cli/page-probe.ts), in this order; the CLI reports
 *  RX-QA-08 itself. test/golden.test.mjs holds the other rows equal to ryux-core's. */
export const RENDER_CHECKS: Check[] = [
  { rule: "RX-RD-01", level: "fail", looksFor: "a page that scrolls sideways at a scanned width, naming the widest elements" },
  { rule: "RX-A11Y-01", level: "fail", looksFor: "text under 4.5:1 contrast (3:1 when large); over an image or a gradient, measured on the pixels behind it (its weakest tenth), up to 40 texts per width; a text greyed by a filter is told how to leave out a logotype (data-ryux-ignore)" },
  { rule: "RX-A11Y-01", level: "warn", looksFor: "texts whose contrast was not measured, once per page: under a blend mode or a filter other than a colour one (blur, url), over a picture the page could not photograph (out of view, or redrawn by the page), or past the 40 measured" },
  { rule: "RX-A11Y-01", level: "fail", looksFor: "parts that are not text under 3:1 (WCAG 1.4.11): a field's edge (its border, ring, or fill) against what is around it, judged by the box around a field with no edge of its own, and the icon of an icon-only control against the control; a native checkbox or radio, and what sits on a picture, are left out" },
  { rule: "RX-A11Y-03", level: "fail", looksFor: "focus, up to 80 controls per width, each focused from a script: a control that shows nothing (no outline, ring, border, fill, or underline on it or its parent), and a focus indicator under 3:1 against what is around it" },
  { rule: "RX-A11Y-02", level: "fail", looksFor: "controls under 24x24px that are crowded by neighbours (warn when spaced as WCAG 2.5.8 allows); rendered text under 12px (warn)" },
  { rule: "RX-QA-03", level: "warn", looksFor: "text boxes of unrelated elements that overlap" },
  { rule: "RX-QA-03", level: "fail", looksFor: "text a fixed or sticky bar cuts on the first screen while the bar repeats it, and text a bottom bar still covers with every scroller at its end" },
  { rule: "RX-AS-05", level: "warn", looksFor: "visual tells, once per page: three or more glowing elements (a coloured shadow around them), three or more blurred glass layers, or a pill above the main heading with no status in it" },
  { rule: "RX-UI-10", level: "warn", looksFor: "visual tells, once per page: a blue-to-purple gradient behind a large area, prose set in monospace, or an italic serif word inside a display heading" },
  { rule: "RX-AS-10", level: "warn", looksFor: "the counts before handoff, once per page: emoji in a control, a tab, a menu, or navigation; gradients with colour that is not among the page's colour tokens (CSS custom properties), leaving out gradients that draw a thing (an illustration, a device mock, a small shape with no text)" },
  { rule: "RX-AS-03", level: "warn", looksFor: "a stand-in box, once per page: a dashed or dotted box whose words name what belongs in it (\"Logo Kelasku\", \"QR\", \"Foto\"); a logo slot with the brand name in plain text beside it is left alone" },
  { rule: "RX-AS-11", level: "warn", looksFor: "a letter in a tile as the logo, once per page: one or two letters in a filled or bordered box of 16 to 72 px inside an element whose class names a logo or brand; or an App Store or Google Play badge drawn by hand (an icon of its own, or the badge's two lines stacked in text, \"Unduh di\" over \"App Store\", or the store's name in a filled or bordered button) instead of the store's badge image, or a store badge image that did not load; one line of text with no box is a plain link and is left alone" },
  { rule: "RX-UI-26", level: "warn", looksFor: "a near-black page whose action colour is a saturated neon, with glow: the default look of an AI product; or a cream page (light, warm, a little coloured), the paper look generated pages fall back to" },
  { rule: "RX-UI-36", level: "warn", looksFor: "a row that looks like a picker and is not one: three or more boxes side by side, one filled as if chosen, and no control in any of them" },
  { rule: "RX-DS-02", level: "warn", looksFor: "buttons out of one component: the two store links in two forms (one badge image, one text button), or one button colour in two corner shapes (a pill and a rounded box), or the two store badges at two heights" },
  { rule: "RX-UI-01", level: "warn", looksFor: "a bordered or shadowed, rounded box that holds another one (cards inside cards)" },
  { rule: "RX-UI-03", level: "warn", looksFor: "text in sizes 1 px apart (three or more sizes with a neighbour 1 px above, 11 to 40 px): no type scale" },
  { rule: "RX-UX-15", level: "warn", looksFor: "at 1024px and wider, the page's only choice (one radio group) starts below the first screen while a button that carries an amount (\"Bayar Rp1.424.000\") is on it" },
  { rule: "RX-FM-05", level: "warn", looksFor: "a shown textarea that, filled with 8 lines for a moment, keeps its height and hides the text past its edge" },
  { rule: "RX-UI-29", level: "warn", looksFor: "at 1024 px or wider, the product's proof in a small card beside the hero heading: one filled or bordered box right of the main heading, narrower than half the page, with text and no large image; a centred hero, a split with a visual at half the width or more, or the proof as the hero are left alone" },
  { rule: "RX-A11Y-01", level: "warn", looksFor: "text that passes WCAG 2 contrast and still reads weak by APCA for its size, the three weakest colour pairs: under Lc 75 below 16 px (14 px bold), Lc 60 at body sizes, Lc 45 at 24 px and up (APCA's minimums; a quality floor, not a standard)" },
  { rule: "RX-QA-08", level: "warn", looksFor: "script errors thrown while the page loads" },
];

/** What ryux-core reads in .jsx and .tsx as a syntax tree (crates/ryux-core/src/jsx.rs), for --list-rules and the
 *  rule text. engine.ts runs them through syntaxScan. */
export const SYNTAX_CHECKS: Check[] = [
  { rule: "RX-A11Y-03", level: "warn", looksFor: "in .jsx and .tsx: an element that starts a drag (onPointerDown, onMouseDown, onTouchStart, onDragStart) with no keyboard way (no onKeyDown, onKeyUp, tabIndex, or role), not a native control and with no spread props" },
  { rule: "RX-FE-05", level: "warn", looksFor: "in scripts and components: an empty catch block with no comment saying why the error can be ignored" },
  { rule: "RX-FE-07", level: "warn", looksFor: "in scripts and components: any in TypeScript (once per file, with the count), console.log, debug, info, dir, or table left in a .jsx or .tsx component, and an eslint-disable with no reason after -- or a @ts-ignore, @ts-expect-error, or @ts-nocheck with no reason" },
  { rule: "RX-FE-13", level: "warn", looksFor: "in scripts and components: a useEffect with dependencies whose only work is calling a state setter with a value (setTotal(a + b)), with no fetch, timer, storage, window, document, await, or function in it" },
];
