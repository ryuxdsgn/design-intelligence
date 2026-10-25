// @ts-nocheck: this function runs inside the page (Playwright serializes it), where the DOM exists;
// the package compiles for Node without DOM types.
// Measures a rendered page at the current viewport: horizontal scroll, text contrast, text size,
// target size, and text that collides. Returns plain findings; the caller adds the width and URL.

export interface ProbeFinding {
  rule: string;
  level: "fail" | "warn";
  selector: string;
  message: string;
}

export function probe(): ProbeFinding[] {
  const out = [];
  const vw = document.documentElement.clientWidth;

  const selector = (el) => {
    const parts = [];
    for (let e = el; e && e !== document.body && parts.length < 3; e = e.parentElement) {
      let s = e.tagName.toLowerCase();
      if (e.id) {
        parts.unshift(`${s}#${e.id}`);
        break;
      }
      const cls = typeof e.className === "string" ? e.className.trim().split(/\s+/)[0] : "";
      if (cls) s += `.${cls}`;
      parts.unshift(s);
    }
    return parts.join(" > ");
  };
  const style = (el) => getComputedStyle(el);
  const shown = (el) => {
    for (let e = el; e; e = e.parentElement) {
      const cs = style(e);
      if (cs.display === "none" || cs.visibility === "hidden" || cs.opacity === "0") return false;
      // Visually hidden (the sr-only pattern): clipped, or inside a box of 1px or less that hides overflow.
      if ((cs.clip && cs.clip !== "auto") || /inset\(50%\)/.test(cs.clipPath)) return false;
      const box = e.getBoundingClientRect();
      if (cs.overflow !== "visible" && (box.width <= 1 || box.height <= 1)) return false;
    }
    const r = el.getBoundingClientRect();
    return r.width > 1 && r.height > 1;
  };
  const disabled = (el) => Boolean(el.closest("[disabled],[aria-disabled='true'],[inert]"));
  const quote = (s) => (s.length > 40 ? `"${s.slice(0, 37)}..."` : `"${s}"`);

  // Horizontal scroll (RX-RD-01): name the outermost elements that reach past the viewport.
  if (document.documentElement.scrollWidth > vw + 1) {
    const culprits = [...document.body.querySelectorAll("*")].filter((el) => {
      const r = el.getBoundingClientRect();
      const p = el.parentElement?.getBoundingClientRect();
      return r.right > vw + 1 && r.width > 0 && (!p || p.right <= vw + 1) && shown(el);
    });
    const names = culprits.slice(0, 3).map((el) => `${selector(el)} (to ${Math.round(el.getBoundingClientRect().right)}px)`);
    out.push({
      rule: "RX-RD-01",
      level: "fail",
      selector: culprits[0] ? selector(culprits[0]) : "html",
      message: `the page scrolls sideways: ${document.documentElement.scrollWidth}px of content in ${vw}px${names.length ? `; widest: ${names.join(", ")}` : ""}`,
    });
  }

  // Text: every visible element with its own text.
  const texts = [];
  for (const el of document.body.querySelectorAll("*")) {
    if (/^(SCRIPT|STYLE|NOSCRIPT|TEMPLATE|OPTION)$/.test(el.tagName) || el.closest("svg")) continue;
    const nodes = [...el.childNodes].filter((n) => n.nodeType === 3 && n.textContent.trim());
    if (!nodes.length || !shown(el)) continue;
    texts.push({ el, nodes, text: nodes.map((n) => n.textContent).join(" ").replace(/\s+/g, " ").trim() });
  }

  const rgba = (c) => {
    const m = c.match(/rgba?\(([^)]+)\)/);
    if (!m) return null;
    const [r, g, b, a = 1] = m[1].split(/[\s,/]+/).filter(Boolean).map(Number);
    return [r, g, b, a];
  };
  const over = (top, bottom) => {
    const a = top[3];
    return [0, 1, 2].map((i) => top[i] * a + bottom[i] * (1 - a)).concat(1);
  };
  // The solid color behind an element, or null when an image, gradient, or blend makes it unknown.
  const background = (el) => {
    const layers = [];
    for (let e = el; e; e = e.parentElement) {
      const cs = style(e);
      if (cs.backgroundImage !== "none" || cs.mixBlendMode !== "normal" || (cs.filter && cs.filter !== "none")) return null;
      const c = rgba(cs.backgroundColor);
      if (c && c[3] > 0) {
        layers.push(c);
        if (c[3] >= 1) break;
      }
    }
    let color = [255, 255, 255, 1];
    for (const layer of layers.reverse()) color = over(layer, color);
    return color;
  };
  const luminance = ([r, g, b]) =>
    [r, g, b]
      .map((v) => v / 255)
      .map((v) => (v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4))
      .reduce((sum, v, i) => sum + v * [0.2126, 0.7152, 0.0722][i], 0);
  // True when something other than the element's own ancestors sits under its text (an image or a
  // positioned sibling), so the ancestor background is not what the reader sees.
  const coveredBy = (t) => {
    t.el.scrollIntoView({ block: "center" });
    const range = document.createRange();
    range.setStartBefore(t.nodes[0]);
    range.setEndAfter(t.nodes[t.nodes.length - 1]);
    const r = range.getBoundingClientRect();
    const stack = document.elementsFromPoint(r.left + r.width / 2, r.top + r.height / 2);
    const below = stack.find((e) => !t.el.contains(e));
    return Boolean(below && !below.contains(t.el));
  };
  const hex = (c) => `#${c.slice(0, 3).map((v) => Math.round(v).toString(16).padStart(2, "0")).join("")}`;

  // Contrast (RX-A11Y-01) and size (RX-A11Y-02), grouped so one style used 40 times is one finding.
  const contrast = new Map();
  const small = new Map();
  for (const t of texts) {
    const cs = style(t.el);
    const size = Number.parseFloat(cs.fontSize);
    if (size < 12) {
      const g = small.get(size) ?? { t, count: 0 };
      g.count++;
      small.set(size, g);
    }
    if (disabled(t.el) || cs.webkitTextFillColor === "rgba(0, 0, 0, 0)") continue;
    const bg = background(t.el);
    const fgRaw = rgba(cs.color);
    if (!bg || !fgRaw) continue;
    const fg = fgRaw[3] < 1 ? over(fgRaw, bg) : fgRaw;
    const [hi, lo] = [luminance(fg), luminance(bg)].sort((a, b) => b - a);
    const ratio = (hi + 0.05) / (lo + 0.05);
    const large = size >= 24 || (size >= 18.66 && Number(cs.fontWeight) >= 700);
    const need = large ? 3 : 4.5;
    if (ratio >= need || coveredBy(t)) continue;
    const key = `${hex(fg)}|${hex(bg)}|${need}`;
    const g = contrast.get(key) ?? { t, ratio, fg, bg, need, count: 0 };
    g.count++;
    contrast.set(key, g);
  }
  for (const g of contrast.values()) {
    out.push({
      rule: "RX-A11Y-01",
      level: "fail",
      selector: selector(g.t.el),
      message: `${quote(g.t.text)}: contrast ${g.ratio.toFixed(2)}:1 (${hex(g.fg)} on ${hex(g.bg)}), needs ${g.need}:1${g.count > 1 ? `; ${g.count - 1} more with the same colors` : ""}`,
    });
  }
  for (const [size, g] of small) {
    out.push({
      rule: "RX-A11Y-02",
      level: "warn",
      selector: selector(g.t.el),
      message: `${quote(g.t.text)}: ${size}px text${g.count > 1 ? ` (${g.count} elements)` : ""}; body text is 14 to 16px on mobile, below 12px is hard to read`,
    });
  }

  window.scrollTo(0, 0);

  // Target size (RX-A11Y-02): under 24px fails unless spaced as WCAG 2.5.8 allows; inline links in a
  // sentence are exempt.
  const controls = [
    ...document.body.querySelectorAll(
      "a[href],button,input:not([type=hidden]),select,textarea,summary,[role=button],[role=link],[role=checkbox],[role=radio],[role=switch],[role=tab],[role=menuitem]",
    ),
  ].filter((el) => shown(el) && !disabled(el));
  const rects = controls.map((el) => el.getBoundingClientRect());
  const inSentence = (el) => {
    if (el.tagName !== "A" || style(el).display !== "inline") return false;
    const block = el.parentElement;
    return Boolean(block && block.textContent.replace(el.textContent, "").trim().length > 0);
  };
  const center = (r) => [r.left + r.width / 2, r.top + r.height / 2];
  const undersized = controls.map((el, i) => (rects[i].width < 24 || rects[i].height < 24) && !inSentence(el));
  controls.forEach((el, i) => {
    if (!undersized[i]) return;
    const [cx, cy] = center(rects[i]);
    const crowded = rects.some((r, j) => {
      if (j === i || el.contains(controls[j]) || controls[j].contains(el)) return false;
      if (undersized[j]) {
        const [x, y] = center(r);
        return Math.hypot(cx - x, cy - y) < 24;
      }
      const dx = Math.max(r.left - cx, 0, cx - r.right);
      const dy = Math.max(r.top - cy, 0, cy - r.bottom);
      return Math.hypot(dx, dy) < 12;
    });
    const size = `${Math.round(rects[i].width)}x${Math.round(rects[i].height)}px`;
    const name = quote((el.getAttribute("aria-label") || el.textContent || el.tagName.toLowerCase()).trim().replace(/\s+/g, " "));
    out.push(
      crowded
        ? { rule: "RX-A11Y-02", level: "fail", selector: selector(el), message: `${name}: target ${size}, under 24x24 and crowded by its neighbours; 44x44 is the preferred hit area` }
        : { rule: "RX-A11Y-02", level: "warn", selector: selector(el), message: `${name}: target ${size}, under 24x24 (spaced enough to pass WCAG 2.5.8); 44x44 is the preferred hit area` },
    );
  });

  // Colliding text (RX-QA-03): the text boxes of two unrelated elements overlap.
  const boxes = texts.slice(0, 1500).map((t) => {
    const range = document.createRange();
    range.setStartBefore(t.nodes[0]);
    range.setEndAfter(t.nodes[t.nodes.length - 1]);
    return { t, r: range.getBoundingClientRect() };
  });
  // Content that scrolls under a fixed or sticky bar is not a collision.
  const pinned = (el) => {
    for (let e = el; e; e = e.parentElement) if (/^(fixed|sticky)$/.test(style(e).position)) return true;
    return false;
  };
  const seen = new Set();
  for (let i = 0; i < boxes.length; i++) {
    for (let j = i + 1; j < boxes.length; j++) {
      const a = boxes[i];
      const b = boxes[j];
      if (a.t.el.contains(b.t.el) || b.t.el.contains(a.t.el) || pinned(a.t.el) !== pinned(b.t.el)) continue;
      const w = Math.min(a.r.right, b.r.right) - Math.max(a.r.left, b.r.left);
      const h = Math.min(a.r.bottom, b.r.bottom) - Math.max(a.r.top, b.r.top);
      if (w <= 2 || h <= 2) continue;
      const smaller = Math.min(a.r.width * a.r.height, b.r.width * b.r.height);
      if (w * h < 0.3 * smaller || seen.has(a.t.el) || seen.has(b.t.el)) continue;
      seen.add(a.t.el);
      seen.add(b.t.el);
      out.push({ rule: "RX-QA-03", level: "warn", selector: selector(a.t.el), message: `${quote(a.t.text)} overlaps ${quote(b.t.text)} (${selector(b.t.el)})` });
    }
  }
  return out;
}
