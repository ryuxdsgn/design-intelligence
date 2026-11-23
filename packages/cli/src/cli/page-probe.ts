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

/** What ryux-core asks the page to do before it can judge: texts (by index in `texts`) to hit-test in view,
 *  textareas (by element index) to fill, and texts over an image or a gradient whose pixels it needs (`behind`,
 *  answered by page-scan.ts with probeHide, a screenshot, and probePixels). */
export interface ProbeAsk {
  under: number[];
  grow: number[];
  behind?: number[];
  /** Controls (by element index) whose focus indicator ryux-core judges; answered by probeFocus after the pixels. */
  focus?: number[];
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
    borderTopLeftRadius: 0, borderTopWidth: 0, borderTopStyle: "none",
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
    for (const k of ["display", "visibility", "opacity", "clip", "clipPath", "overflow", "overflowY", "position", "backgroundColor", "backgroundImage", "mixBlendMode", "filter", "fontStyle", "boxShadow", "textShadow", "borderTopStyle"]) {
      const v = k === "backgroundColor" || k === "backgroundImage" || k === "boxShadow" || k === "textShadow" ? plain(cs[k]) : cs[k];
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

  const FIELD = "input:not([type=hidden],[type=submit],[type=button],[type=reset],[type=image],[type=range],[type=color],[type=file]),select,textarea,[role=textbox],[role=searchbox]";
  const SIDES = ["Top", "Right", "Bottom", "Left"];
  const PROTO = /(?:^|[^a-zA-Z])(?:[Pp]roto(?:type|tipe)?|PROTO(?:TYPE)?)(?![a-z])/;
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
      // out of the tab order (a tab in a roving group that is not selected): the keyboard never lands on it
      if (e.tabIndex < 0) o.nt = 1;
      const pushes = e.tagName === "INPUT" && (e.type === "submit" || e.type === "button");
      if (pushes) o.ty = e.type;
      o.nm = cap((e.getAttribute("aria-label") || (pushes ? e.value : "") || e.textContent || e.tagName.toLowerCase()).trim().replace(/\s+/g, " "));
    }
    // A link set inline: whether its block has text besides the link (a link in a sentence).
    if (e.tagName === "A" && e.parentElement && getComputedStyle(e).display === "inline") o.sib = e.parentElement.textContent.replace(e.textContent, "").trim().length > 0 ? 1 : 0;
    if (e.tagName === "TEXTAREA" && e.readOnly) o.ro = 1;
    // A field: the width (0 when the style is none or hidden) and colour of each border, top, right, bottom, left, so
    // ryux-core can judge its edge against what is around it. A native checkbox or radio is drawn by
    // the browser and left out.
    if (i > 1 && e.matches(FIELD)) {
      const cs = getComputedStyle(e);
      const tick = e.tagName === "INPUT" && (e.type === "checkbox" || e.type === "radio");
      if (!tick || cs.appearance === "none") {
        const shown = (k) => (/^(none|hidden)$/.test(cs[`border${k}Style`]) ? 0 : Number.parseFloat(cs[`border${k}Width`]));
        o.fb = [...SIDES.map(shown), ...SIDES.map((k) => plain(cs[`border${k}Color`]))];
      }
    }
    // A form control's name as people read it: its label, else its aria-label, placeholder, or name.
    if (i > 1 && /^(INPUT|SELECT|TEXTAREA)$/.test(e.tagName)) {
      o.fl = cap((e.labels?.[0]?.innerText || e.getAttribute("aria-label") || e.getAttribute("placeholder") || e.getAttribute("name") || e.tagName.toLowerCase()).trim().replace(/\s+/g, " "));
    }
    // A region named as a prototype panel (class, id, aria-label, the text it is labelled by, or a data attribute):
    // reviewer controls the page adds around the product, not the product. "Demo" alone is not enough: a "book a
    // demo" section is product.
    const named = () => [e.id, e.getAttribute("class"), e.getAttribute("aria-label"), ...(e.getAttribute("aria-labelledby")?.split(/\s+/) ?? []).map((id) => document.getElementById(id)?.textContent ?? ""), ...e.getAttributeNames().filter((a) => a.startsWith("data-"))];
    if (i > 1 && !o.ctl && named().some((v) => v && PROTO.test(v))) o.pr = 1;
    // A control with no text that shows an SVG: an icon-only button or link, whose icon carries its meaning.
    if (o.ctl && !e.textContent.trim() && e.querySelector("svg")) o.ico = 1;
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
  // The paint of each shape in an icon-only control: [colour, opacity] for its fill and its stroke (a gradient or
  // pattern paint is left out), so ryux-core can judge the icon against the control it sits on.
  for (const [k, e] of all.entries()) {
    if (!els[k].ico) continue;
    for (const shape of [...e.querySelectorAll("path,circle,rect,line,polyline,polygon,ellipse,use,text")].slice(0, 12)) {
      const cs = getComputedStyle(shape);
      const ip = [];
      for (const [paint, op] of [[cs.fill, Number(cs.fillOpacity)], [cs.stroke, Number.parseFloat(cs.strokeWidth) > 0 ? Number(cs.strokeOpacity) : 0]]) {
        if (paint && paint !== "none" && !paint.includes("url(") && op > 0) ip.push([plain(paint), op]);
      }
      if (ip.length) els[at(shape)].ip = ip;
    }
  }
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
  window.__ryuxProbe = { all, nodesOf, plain };
  // The colour behind a page with no background: white, or the dark canvas under color-scheme: dark.
  const probe = document.createElement("div");
  probe.style.cssText = "position:absolute;width:0;height:0;background-color:Canvas";
  document.documentElement.appendChild(probe);
  const canvas = getComputedStyle(probe).backgroundColor;
  // The page's colour tokens: every CSS custom property its stylesheets declare that holds a colour (as rgb), and the
  // gradients declared as tokens, so ryux-core can tell a gradient drawn from the brand's colours from one typed in.
  const names = new Set();
  const walk = (rules) => {
    for (const rule of rules) {
      if (names.size >= 600) return;
      if (rule.style) for (const k of rule.style) if (k.startsWith("--")) names.add(k);
      try { if (rule.cssRules) walk(rule.cssRules); } catch { /* not readable */ }
    }
  };
  for (const sheet of document.styleSheets) {
    try { walk(sheet.cssRules); } catch { /* a stylesheet from another origin */ }
  }
  const rootStyle = getComputedStyle(document.documentElement);
  const colours = new Set();
  const gradients = new Set();
  for (const k of names) {
    const v = rootStyle.getPropertyValue(k).trim();
    if (!v) continue;
    if (/gradient\(/.test(v)) {
      probe.style.backgroundImage = "";
      probe.style.backgroundImage = v;
      const g = getComputedStyle(probe).backgroundImage;
      if (g && g !== "none") gradients.add(plain(g));
    } else if (CSS.supports("color", v) && colours.size < 300) {
      colours.add(toRgb(v));
    }
  }
  probe.remove();
  const tokens = colours.size || gradients.size ? { tokens: { colours: [...colours], gradients: [...gradients] } } : {};
  return {
    ...(canvas !== "rgb(255, 255, 255)" ? { canvas } : {}),
    ...tokens,
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

/** What focus shows on each control ryux-core asked for (by element index): the control and its parent, before and
 *  with focus from a script (which matches :focus-visible when the page has had no pointer input, as in a scan):
 *  outline, box shadow, borders, background, underline, its box, and whether a ::before or ::after changed. Transitions are
 *  finished first, so the focused state is read as it ends. Only what changed is sent. Focus is taken away after,
 *  and the scroll put back. */
export async function probeFocus(list) {
  const frame = () => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
  const { all, plain } = window.__ryuxProbe;
  const SIDES = ["Top", "Right", "Bottom", "Left"];
  const look = (e) => {
    if (!e || e === document.body || e === document.documentElement) return null;
    for (const a of e.getAnimations?.() ?? []) {
      try { a.finish(); } catch { /* an infinite animation cannot finish */ }
    }
    const cs = getComputedStyle(e);
    const box = e.getBoundingClientRect();
    const pseudo = ["::before", "::after"].map((p) => {
      const ps = getComputedStyle(e, p);
      return ps.content === "none" ? "" : [ps.outline, ps.boxShadow, ps.borderColor, ps.backgroundColor, ps.opacity, ps.transform].join("|");
    }).join("/");
    return {
      o: [cs.outlineStyle, Number.parseFloat(cs.outlineWidth), plain(cs.outlineColor), Number.parseFloat(cs.outlineOffset)],
      bs: plain(cs.boxShadow),
      bw: SIDES.map((k) => (/^(none|hidden)$/.test(cs[`border${k}Style`]) ? 0 : Number.parseFloat(cs[`border${k}Width`]))),
      bc: SIDES.map((k) => plain(cs[`border${k}Color`])),
      bg: plain(cs.backgroundColor),
      bi: cs.backgroundImage,
      td: cs.textDecorationLine,
      ps: pseudo,
      r: [box.x, box.y, box.width, box.height].map(Math.round),
    };
  };
  const x0 = window.scrollX;
  const y0 = window.scrollY;
  const out = {};
  for (const i of list) {
    const e = all[i];
    if (!e?.isConnected || typeof e.focus !== "function") continue;
    const b = look(e);
    const pb = look(e.parentElement);
    e.focus({ preventScroll: true });
    if (document.activeElement !== e) {
      out[i] = { a: 0 };
      continue;
    }
    const f = look(e);
    const pf = look(e.parentElement);
    e.blur();
    // only what focus changed, so a page of many controls stays small
    const diff = (x, y) => {
      if (!x || !y) return null;
      const keys = Object.keys(y).filter((k) => JSON.stringify(x[k]) !== JSON.stringify(y[k]));
      return keys.length ? [Object.fromEntries(keys.map((k) => [k, x[k]])), Object.fromEntries(keys.map((k) => [k, y[k]]))] : null;
    };
    const own = diff(b, f);
    const up = diff(pb, pf);
    out[i] = { a: 1, ...(own ? { b: own[0], f: own[1] } : { b: {}, f: {} }), ...(up ? { pb: up[0], pf: up[1] } : {}) };
  }
  window.scrollTo(x0, y0);
  await frame();
  return out;
}

/** A text over an image or a gradient, made ready for a screenshot of what is behind it: scrolled into view, its
 *  glyphs (and its children's) made transparent. Returns the box to photograph (`clip`, in the viewport) and the
 *  boxes of its lines inside it (`lines`, at most 12), so only what is behind the text's own lines is sampled, not
 *  the rest of a heading it wraps inside; or null when none of it is in view. When the page has redrawn the text
 *  since the extract, it waits until the page is still (500 ms with no change, 3 s at most) and finds the element
 *  again at the same place with the same text, once. probeShow puts it back. */
export async function probeHide(i) {
  const frame = () => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
  const probe = window.__ryuxProbe;
  const own = (el) => [...el.childNodes].filter((n) => n.nodeType === 3 && n.textContent.trim());
  const words = (nodes) => nodes.map((n) => n.textContent).join(" ").replace(/\s+/g, " ").trim();
  const still = () => new Promise((done) => {
    let quiet;
    const end = () => { watch.disconnect(); clearTimeout(quiet); clearTimeout(cap); done(); };
    const watch = new MutationObserver(() => { clearTimeout(quiet); quiet = setTimeout(end, 500); });
    watch.observe(document, { subtree: true, childList: true, characterData: true, attributes: true });
    quiet = setTimeout(end, 500);
    const cap = setTimeout(end, 3000);
  });
  const again = async (t) => {
    await still();
    const at = probe.all.indexOf(t.el);
    const now = [document.documentElement, document.body, ...document.body.querySelectorAll("*")];
    const el = now[at];
    const nodes = el ? own(el) : [];
    return nodes.length && words(nodes) === words(t.nodes) ? { el, nodes } : null;
  };
  let t = probe.nodesOf[i];
  if (!t) return null;
  if (!document.getElementById("ryux-hide")) {
    const style = document.createElement("style");
    style.id = "ryux-hide";
    style.textContent = "[data-ryux-hide],[data-ryux-hide] *{color:transparent!important;-webkit-text-fill-color:transparent!important;text-shadow:none!important;caret-color:transparent!important}";
    document.head.appendChild(style);
  }
  for (let tries = 0; ; tries++) {
    if (!t.nodes.every((n) => n.isConnected)) {
      if (tries > 1) return null;
      t = await again(t);
      if (!t) return null;
      probe.nodesOf[i] = t;
      continue;
    }
    t.el.scrollIntoView({ block: "center" });
    t.el.setAttribute("data-ryux-hide", "");
    await frame();
    if (t.nodes.every((n) => n.isConnected)) break;
  }
  const vw = document.documentElement.clientWidth;
  const vh = window.innerHeight;
  const seen = [];
  for (const n of t.nodes) {
    const range = document.createRange();
    range.selectNodeContents(n);
    for (const r of range.getClientRects()) {
      const x0 = Math.max(0, r.left), y0 = Math.max(0, r.top), x1 = Math.min(vw, r.right), y1 = Math.min(vh, r.bottom);
      if (x1 - x0 >= 1 && y1 - y0 >= 1 && seen.length < 12) seen.push([x0, y0, x1, y1]);
    }
  }
  if (!seen.length) return null;
  const x = Math.floor(Math.min(...seen.map((r) => r[0])));
  const y = Math.floor(Math.min(...seen.map((r) => r[1])));
  const clip = { x, y, width: Math.ceil(Math.max(...seen.map((r) => r[2]))) - x, height: Math.ceil(Math.max(...seen.map((r) => r[3]))) - y };
  return { clip, lines: seen.map(([x0, y0, x1, y1]) => [x0 - x, y0 - y, x1 - x0, y1 - y0]) };
}

/** Undo probeHide: the text shows again, and with `last`, the page is back at the top without the hiding style.
 *  Returns whether the hidden text was still on the page: if the page redrew it before the screenshot, the new
 *  text was not hidden, its glyphs are in the screenshot, and the pixels must not be used. */
export function probeShow(arg) {
  const t = window.__ryuxProbe.nodesOf[arg.i];
  const kept = !!t && t.nodes.every((n) => n.isConnected) && t.el.hasAttribute("data-ryux-hide");
  t?.el.removeAttribute("data-ryux-hide");
  if (arg.last) {
    document.getElementById("ryux-hide")?.remove();
    window.scrollTo(0, 0);
  }
  return kept;
}

/** The colours of a screenshot (`png`, base64) behind each of the text's `lines` ([x, y, width, height] in the
 *  screenshot), on a grid of up to 24 points across each line and 6 rows shared by the lines, row by row, as one
 *  string of rrggbb hex. Decoded in the page, so RYUX needs no image library; the judgement is ryux-core's. */
export async function probePixels(arg) {
  const bytes = Uint8Array.from(atob(arg.png), (c) => c.charCodeAt(0));
  const bitmap = await createImageBitmap(new Blob([bytes], { type: "image/png" }));
  const { width: w, height: h } = bitmap;
  const canvas = new OffscreenCanvas(w, h);
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  ctx.drawImage(bitmap, 0, 0);
  const data = ctx.getImageData(0, 0, w, h).data;
  // the screenshot can be scaled from CSS pixels (a device scale factor)
  const sx = w / Math.max(1, Math.max(...arg.lines.map((l) => l[0] + l[2])));
  const sy = h / Math.max(1, Math.max(...arg.lines.map((l) => l[1] + l[3])));
  const hex = (v) => v.toString(16).padStart(2, "0");
  let px = "";
  const rows = Math.max(1, Math.floor(6 / arg.lines.length));
  for (const [lx, ly, lw, lh] of arg.lines) {
    const cols = Math.max(1, Math.min(24, Math.floor(lw)));
    const rs = Math.max(1, Math.min(rows, Math.floor(lh)));
    for (let r = 0; r < rs; r++) {
      for (let c = 0; c < cols; c++) {
        const x = Math.min(w - 1, Math.floor((lx + ((c + 0.5) * lw) / cols) * sx));
        const y = Math.min(h - 1, Math.floor((ly + ((r + 0.5) * lh) / rs) * sy));
        const o = (y * w + x) * 4;
        px += hex(data[o]) + hex(data[o + 1]) + hex(data[o + 2]);
      }
    }
  }
  return px;
}
