// @ts-nocheck: these functions run inside the page (Playwright serializes them), where the DOM exists;
// the package compiles for Node without DOM types.
// The rendered checks have one implementation, ryux-core's (crates/ryux-core/src/probe.rs), called through
// ../engine.ts. In the page these scripts only read: `probeExtract` returns what the checks need as compact JSON
// (every element with its box and the computed styles they read, the text, hit tests on the first screen and with
// every scroller at its end), and `probeAnswer` does the two things ryux-core can only ask for: a hit test with a
// text scrolled into view, and a textarea filled with 8 lines for a moment. Same idea as figma-audit.ts for Figma.

/** One finding of the rendered checks, as ryux-core returns it. */
export interface ProbeFinding {
  rule: string;
  level: "fail" | "warn";
  selector: string;
  message: string;
  /** A key for a finding reported once per page, not once per width (a visual tell does not change with the viewport). */
  once?: string;
}

export interface ProbeResult {
  findings: ProbeFinding[];
  /** Regions marked data-ryux-ignore, by selector; their contents were not measured. */
  ignored: string[];
}

/** What ryux-core asks the page to do before it can judge: texts (by index in `texts`) to hit-test in view, and
 *  textareas (by element index) to fill. */
export interface ProbeAsk {
  under: number[];
  grow: number[];
}

/** The page as JSON, at the current viewport. Elements are in document order: 0 is <html>, 1 is <body>, then every
 *  element in <body>; each has its parent (p), tag (t), style (s, an index into `styles`), and box (r: x, y, width,
 *  height). Styles keep only values that differ from STYLE_DEFAULTS. */
export async function probeExtract() {
  const frame = () => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
  const root = document.documentElement;
  const vw = root.clientWidth;
  const vh = window.innerHeight;
  const all = [root, document.body, ...document.body.querySelectorAll("*")];
  const index = new Map(all.map((e, i) => [e, i]));
  const at = (e) => (e && index.has(e) ? index.get(e) : null);
  // Every scroll position as the page opened: the end-of-scroll read below moves them, and they are put back.
  const opened = [document.scrollingElement, ...document.body.querySelectorAll("*")]
    .filter((e) => e && e.scrollHeight > e.clientHeight + 1)
    .map((e) => [e, e.scrollTop]);
  const reopen = () => opened.forEach(([e, top]) => { e.scrollTop = top; });
  const box = (r) => [r.x, r.y, r.width, r.height];
  // A name the checks only quote (cut at 40 characters) is kept to 200, without splitting a character.
  const cap = (s) => (s.length > 200 ? s.slice(0, /[\uD800-\uDBFF]/.test(s[199]) ? 199 : 200) : s);

  const DEFAULTS = {
    display: "block", visibility: "visible", opacity: "1", clip: "auto", clipPath: "none", overflow: "visible", overflowY: "visible",
    position: "static", backgroundColor: "rgba(0, 0, 0, 0)", backgroundImage: "none", mixBlendMode: "normal", filter: "none",
    fontSize: 16, fontWeight: 400, fontStyle: "normal", boxShadow: "none", textShadow: "none", backdropFilter: "none",
    borderTopLeftRadius: 0, borderTopWidth: 0,
  };
  const styles = [];
  const styleIndex = new Map();
  // Chromium serializes lab(), oklch(), color(), and other CSS Color 4 values as written (Tailwind 4 uses them), and
  // the checks read rgb(). Paint each one on a 1x1 canvas and read the pixel back as rgb() or rgba().
  const paint = document.createElement("canvas").getContext("2d", { willReadFrequently: true });
  const rgbCache = new Map();
  const toRgb = (c) => {
    if (!rgbCache.has(c)) {
      paint.clearRect(0, 0, 1, 1);
      paint.fillStyle = "#000";
      paint.fillStyle = c;
      paint.fillRect(0, 0, 1, 1);
      const [r, g, b, a] = paint.getImageData(0, 0, 1, 1).data;
      rgbCache.set(c, a === 255 ? `rgb(${r}, ${g}, ${b})` : a === 0 ? "rgba(0, 0, 0, 0)" : `rgba(${r}, ${g}, ${b}, ${Math.round((a / 255) * 1000) / 1000})`);
    }
    return rgbCache.get(c);
  };
  const MODERN = /\b(?:lab|lch|oklab|oklch|color|hwb|hsla?)\((?:[^()]|\([^()]*\))*\)/g;
  const plain = (v) => (typeof v === "string" && v.includes("(") ? v.replace(MODERN, toRgb) : v);
  const styleOf = (el) => {
    const cs = getComputedStyle(el);
    const s = {};
    for (const k of ["display", "visibility", "opacity", "clip", "clipPath", "overflow", "overflowY", "position", "backgroundColor", "backgroundImage", "mixBlendMode", "filter", "fontStyle", "boxShadow", "textShadow"]) {
      const v = k === "backgroundColor" || k === "boxShadow" || k === "textShadow" ? plain(cs[k]) : cs[k];
      if (v !== DEFAULTS[k]) s[k] = v;
    }
    const backdrop = cs.backdropFilter || cs.webkitBackdropFilter || "";
    if (backdrop !== DEFAULTS.backdropFilter) s.backdropFilter = backdrop;
    const n = { fontSize: Number.parseFloat(cs.fontSize), fontWeight: Number(cs.fontWeight), borderTopLeftRadius: Number.parseFloat(cs.borderTopLeftRadius), borderTopWidth: Number.parseFloat(cs.borderTopWidth) };
    for (const [k, v] of Object.entries(n)) if (!Object.is(v, DEFAULTS[k])) s[k] = v;
    s.color = plain(cs.color);
    if (cs.webkitTextFillColor !== cs.color) s.textFill = plain(cs.webkitTextFillColor);
    if (cs.borderTopColor !== cs.color) s.borderTopColor = plain(cs.borderTopColor);
    s.fontFamily = cs.fontFamily;
    const key = JSON.stringify(s);
    if (!styleIndex.has(key)) {
      styleIndex.set(key, styles.length);
      styles.push(s);
    }
    return styleIndex.get(key);
  };

  const CONTROL = "a[href],button,input:not([type=hidden]),select,textarea,summary,[role=button],[role=link],[role=checkbox],[role=radio],[role=switch],[role=tab],[role=menuitem]";
  const els = all.map((e, i) => {
    const o = { p: i ? at(e.parentElement) : null, t: e.tagName, s: styleOf(e), r: box(e.getBoundingClientRect()) };
    if (e.id) o.id = e.id;
    const cls = typeof e.className === "string" ? e.className.trim().split(/\s+/)[0] : "";
    if (cls) o.c = cls;
    const role = e.getAttribute("role");
    if (role !== null) o.role = role;
    if (e.hasAttribute("data-ryux-ignore")) o.ig = 1;
    if (e.matches("[disabled],[aria-disabled='true'],[inert]")) o.dis = 1;
    if (/code/.test(e.getAttribute("class") || "")) o.cc = 1;
    if (e.scrollHeight > e.clientHeight) Object.assign(o, { sh: e.scrollHeight, ch: e.clientHeight });
    if (i > 1 && e.matches(CONTROL)) {
      o.ctl = 1;
      const pushes = e.tagName === "INPUT" && (e.type === "submit" || e.type === "button");
      if (pushes) o.ty = e.type;
      o.nm = cap((e.getAttribute("aria-label") || (pushes ? e.value : "") || e.textContent || e.tagName.toLowerCase()).trim().replace(/\s+/g, " "));
    }
    // A link set inline: whether its block has text besides the link (a link in a sentence).
    if (e.tagName === "A" && e.parentElement && getComputedStyle(e).display === "inline") o.sib = e.parentElement.textContent.replace(e.textContent, "").trim().length > 0 ? 1 : 0;
    if (e.tagName === "TEXTAREA" && e.readOnly) o.ro = 1;
    // A radio button: its group (the name, or the group element around it) and the group's label.
    if ((e.tagName === "INPUT" && e.type === "radio") || role === "radio") {
      // The group element that holds every radio of the name (a group split into sub-fieldsets is named by the outer one).
      const peers = e.tagName === "INPUT" && e.name ? [...document.querySelectorAll(`input[type=radio][name="${CSS.escape(e.name)}"]`)] : [e];
      let box = e.closest("[role=radiogroup],fieldset");
      while (box && !peers.every((x) => box.contains(x))) box = box.parentElement?.closest("[role=radiogroup],fieldset") ?? null;
      o.rg = e.tagName === "INPUT" && e.name ? `n:${e.name}` : `g:${at(box)}`;
      const ids = box?.getAttribute("aria-labelledby")?.split(/\s+/) ?? [];
      const named = ids.map((id) => document.getElementById(id)?.textContent ?? "").join(" ");
      // The element that names the group on screen: its legend, the element it is labelled by, or else the last heading
      // before its first option within three levels above the element that holds all its options (a card's title).
      let head = box?.querySelector(":scope > legend") ?? (ids[0] ? document.getElementById(ids[0]) : null);
      if (!head && !box?.getAttribute("aria-label")) {
        let hold = box ?? peers[0].parentElement;
        while (hold && !peers.every((x) => hold.contains(x))) hold = hold.parentElement;
        for (let up = 0, a = hold; a && up <= 3 && !head; up++, a = a.parentElement) {
          const before = [...a.querySelectorAll("h1,h2,h3,h4,h5,h6,[role=heading]")].filter((h) => h.compareDocumentPosition(peers[0]) & Node.DOCUMENT_POSITION_FOLLOWING);
          head = before.at(-1) ?? null;
        }
      }
      if (head) o.gh = Math.round(head.getBoundingClientRect().bottom);
      const gl = (box?.querySelector(":scope > legend")?.textContent || box?.getAttribute("aria-label") || named || head?.textContent || "").trim().replace(/\s+/g, " ");
      if (gl) o.gl = cap(gl);
      else o.ol = cap((e.labels?.[0]?.innerText || e.getAttribute("aria-label") || "").trim().replace(/\s+/g, " "));
    }
    return o;
  });
  // Text the visual tells quote: what sits before each H1 and H2, and italic words inside them.
  for (const h of document.body.querySelectorAll("h1, h2")) {
    for (let prev = h.previousElementSibling; prev; prev = prev.previousElementSibling) els[at(prev)].pt = prev.textContent.trim().replace(/\s+/g, " ");
    for (const e of h.querySelectorAll("*")) if (getComputedStyle(e).fontStyle === "italic") els[at(e)].it = cap(e.textContent.trim());
  }

  // Text: every element with its own text, with the box of that text.
  const texts = [];
  const nodesOf = [];
  const rangeBox = (nodes) => {
    const range = document.createRange();
    range.setStartBefore(nodes[0]);
    range.setEndAfter(nodes[nodes.length - 1]);
    return range.getBoundingClientRect();
  };
  for (const el of document.body.querySelectorAll("*")) {
    if (/^(SCRIPT|STYLE|NOSCRIPT|TEMPLATE|OPTION)$/.test(el.tagName) || el.closest("svg")) continue;
    const nodes = [...el.childNodes].filter((n) => n.nodeType === 3 && n.textContent.trim());
    if (!nodes.length) continue;
    texts.push({ e: at(el), x: nodes.map((n) => n.textContent).join(" ").replace(/\s+/g, " ").trim(), r: box(rangeBox(nodes)) });
    nodesOf.push({ el, nodes });
  }

  // Hit tests over each text in the viewport, at 15 points: what is on top there. For a hit outside the text's own
  // element, the boxes, positions, and offset parents of it and its ancestors (up to <body>), and the text of the
  // positioned ones.
  const POINTS = [0.15, 0.5, 0.85].flatMap((fy) => [0.1, 0.3, 0.5, 0.7, 0.9].map((fx) => [fx, fy]));
  const sample = (chain, withText) => (t) => {
    if (!t.nodes.every((n) => n.isConnected)) return null;
    const r = rangeBox(t.nodes);
    if (r.bottom <= 0 || r.top >= vh || r.right <= 0 || r.left >= vw) return null;
    const hits = POINTS.map(([fx, fy]) => {
      const hit = document.elementFromPoint(r.left + r.width * fx, r.top + r.height * fy);
      if (hit && !t.el.contains(hit) && !hit.contains(t.el)) {
        for (let e = hit; e && e !== document.body; e = e.parentElement) {
          const i = at(e);
          if (i === null || chain[i]) continue;
          const cs = getComputedStyle(e);
          const b = e.getBoundingClientRect();
          const c = { position: cs.position, width: b.width, top: b.top };
          if (cs.position === "absolute") c.op = at(e.offsetParent);
          if (withText && /^(fixed|sticky|absolute)$/.test(cs.position)) c.text = e.textContent;
          chain[i] = c;
        }
      }
      return at(hit);
    });
    return { r: box(r), h: hits };
  };
  const chains = { open: {}, end: {} };
  const openSamples = nodesOf.map(sample(chains.open, true));
  // Every scroller at its end.
  [document.scrollingElement, ...document.body.querySelectorAll("*")]
    .filter((e) => e && e.scrollHeight > e.clientHeight + 1 && (e === document.scrollingElement || /(auto|scroll)/.test(getComputedStyle(e).overflowY)))
    .forEach((e) => { e.scrollTop = e.scrollHeight; });
  await frame();
  const endSamples = nodesOf.map(sample(chains.end, false));
  reopen();
  texts.forEach((t, i) => {
    if (openSamples[i]) t.open = openSamples[i].h;
    if (endSamples[i]) t.end = endSamples[i];
  });

  // probeAnswer reads the same elements.
  window.__ryuxProbe = { all, nodesOf };
  // The colour behind a page with no background: white, or the dark canvas under color-scheme: dark.
  const probe = document.createElement("div");
  probe.style.cssText = "position:absolute;width:0;height:0;background-color:Canvas";
  document.documentElement.appendChild(probe);
  const canvas = getComputedStyle(probe).backgroundColor;
  probe.remove();
  return {
    ...(canvas !== "rgb(255, 255, 255)" ? { canvas } : {}),
    vw,
    vh,
    scrollWidth: root.scrollWidth,
    scrollingElement: at(document.scrollingElement),
    // What is on top at the middle of the first line of the screen: the page's own background.
    top: at(document.elementFromPoint(vw / 2, 4)),
    styles,
    els,
    texts,
    chains,
  };
}

/** What ryux-core asked for: each text scrolled into view and hit-tested at its middle (the first element there
 *  outside it), and each textarea filled with 8 lines for a moment (its height before and after, and the text hidden
 *  past its edge). The value is put back after. */
export async function probeAnswer(ask) {
  const frame = () => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
  const { all, nodesOf } = window.__ryuxProbe;
  const at = (e) => { const i = all.indexOf(e); return i < 0 ? null : i; };
  const under = {};
  for (const i of ask.under) {
    const t = nodesOf[i];
    t.el.scrollIntoView({ block: "center" });
    const range = document.createRange();
    range.setStartBefore(t.nodes[0]);
    range.setEndAfter(t.nodes[t.nodes.length - 1]);
    const r = range.getBoundingClientRect();
    const below = document.elementsFromPoint(r.left + r.width / 2, r.top + r.height / 2).find((e) => !t.el.contains(e));
    under[i] = below ? at(below) : null;
  }
  window.scrollTo(0, 0);
  const grow = {};
  for (const i of ask.grow) {
    const ta = all[i];
    const before = ta.value;
    const h0 = ta.getBoundingClientRect().height;
    ta.value = Array.from({ length: 8 }, (_, n) => `Line ${n + 1} of a longer note`).join("\n");
    ta.dispatchEvent(new Event("input", { bubbles: true }));
    await frame();
    const h1 = ta.getBoundingClientRect().height;
    const hidden = ta.scrollHeight - ta.clientHeight;
    ta.value = before;
    ta.dispatchEvent(new Event("input", { bubbles: true }));
    const name = ta.labels?.[0]?.textContent?.trim().replace(/\s+/g, " ") || ta.getAttribute("aria-label") || ta.name || "textarea";
    grow[i] = { before: h0, after: h1, hidden, name };
  }
  await frame();
  return { under, grow };
}
