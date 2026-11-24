// @ts-nocheck: `figmaAudit` runs inside Figma (the agent sends it through the Figma MCP's use_figma), where
// the Plugin API exists; the package compiles for Node without its types. It only reads the file.
// Measures one page of screens and returns counts, findings, and one gate line, so the Delivery Gate
// carries numbers from the canvas instead of the agent's own claims. Same idea as page-probe.ts for code.
// Checks: content images (RX-UI-21), contrast (RX-A11Y-01), targets and text links (RX-A11Y-02), text cut by a bar or
// clipped (RX-QA-03), an overlay with no elevation (RX-UI-15), a busy screen whose button keeps its idle
// label (RX-IX-02), tokens (RX-DS-03), annotations by category (RX-AS-03), construction (RX-DS-12), and the visual
// tells an owner review found in a flow that passed every other check: empty bands (RX-UI-05), small uppercase
// labels and section cards (RX-UI-01), text under 12 px (RX-A11Y-02), and uneven buttons in a row (RX-UI-15).

export interface AuditFinding {
  rule: string;
  level: "fail" | "warn";
  frame: string;
  node: string;
  message: string;
}

export async function figmaAudit(figma, pageName) {
  const page = pageName ? figma.root.children.find((p) => p.name === pageName) : figma.currentPage;
  if (!page) return { error: `no page named "${pageName}"; pages: ${figma.root.children.map((p) => p.name).join(", ")}` };
  if (page !== figma.currentPage) await figma.setCurrentPageAsync(page);

  const MIXED = (v) => typeof v === "symbol";
  const visiblePaints = (ps) => (Array.isArray(ps) ? ps.filter((p) => p.visible !== false) : []);
  const box = (n) => n.absoluteBoundingBox || { x: n.x, y: n.y, width: n.width, height: n.height };
  const contains = (b, x, y) => x >= b.x && x <= b.x + b.width && y >= b.y && y <= b.y + b.height;
  const overlap = (a, b) => Math.max(0, Math.min(a.x + a.width, b.x + b.width) - Math.max(a.x, b.x)) * Math.max(0, Math.min(a.y + a.height, b.y + b.height) - Math.max(a.y, b.y));
  const short = (s, n = 40) => (s.length > n ? `${s.slice(0, n - 1)}…` : s);
  // A component sheet: more than half of its direct children are components; a screen holding one main component stays a screen.
  const hasComponents = (f) => { const k = Array.isArray(f.children) ? f.children : []; const c = k.filter((n) => n.type === "COMPONENT" || n.type === "COMPONENT_SET").length; return c > 0 && c * 2 > k.length; };
  // the page's layers, with sections (and sections in sections) opened
  const opened = (ns) => ns.flatMap((n) => (n.type === "SECTION" ? opened(n.children) : [n]));
  // the descendants on screen: a hidden layer and all it holds are left out
  const findShown = (n, fn) => { const out = []; const go = (m) => { for (const k of m.children || []) { if (k.visible === false) continue; if (fn(k)) out.push(k); go(k); } }; go(n); return out; };
  const screens = opened(page.children).filter((n) => n.type === "FRAME" && n.visible !== false && !hasComponents(n));

  const findings = [];
  const add = (rule, level, frame, node, message) => findings.push({ rule, level, frame: frame.name, node: node ? node.name : "", message });
  const c = { screens: screens.length, imageFills: 0, distinctImages: 0, reusedImages: 0, contrastFails: 0, contrastUnknown: 0, targetsUnder24: 0, targetsUnder44: 0, cutText: 0, clippedText: 0, flatOverlays: 0, idleBusyButtons: 0, unstyledText: 0, unboundFills: 0, unboundSpacing: 0, layoutScreens: 0, looseLayers: 0, strayLayers: 0, rawEffects: 0, emptyBands: 0, capsLabels: 0, cards: 0, smallText: 0, texts: 0, closeSizes: 0, unevenRows: 0, flowBreaks: 0, listCounts: 0 };
  const images = new Map();

  // WCAG relative luminance and contrast, on 0-1 channels.
  const lin = (v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4);
  const lum = (k) => 0.2126 * lin(k.r) + 0.7152 * lin(k.g) + 0.0722 * lin(k.b);
  const ratio = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05); };
  const over = (top, a, under) => ({ r: top.r * a + under.r * (1 - a), g: top.g * a + under.g * (1 - a), b: top.b * a + under.b * (1 - a) });

  const BUSY = /\b(processing|paying|confirming|loading|sending|saving|booking|submitting|verifying|memproses|membayar|memuat|menyimpan|mengirim|memverifikasi)\b/i;
  const QUIET = /^(cancel|batal|back|kembali|close|tutup|done|selesai)$/i;
  const OVERLAY = /\b(sheet|dialog|modal|toast|snackbar|popover|alert|popup|pop-up|tooltip|menu)\b/i;
  const BAR = /\b(bar|footer|toolbar|tabbar|header|sticky)\b/i;
  const TARGET = /\b(button|btn|cta|chip|tab|toggle|switch|checkbox|radio|seat|link|stepper|icon ?button|back|close)\b/i;

  for (const frame of screens) {
    // Paint order: a pre-order walk is bottom to top; hidden subtrees are skipped, opacity is multiplied down.
    const nodes = [];
    const walk = (n, alpha, inInstance, ancestors) => {
      if (n.visible === false) return;
      const a = alpha * (typeof n.opacity === "number" ? n.opacity : 1);
      nodes.push({ n, a, inInstance, ancestors });
      if ("children" in n) for (const ch of n.children) walk(ch, a, inInstance || n.type === "INSTANCE", [...ancestors, n]);
    };
    walk(frame, 1, false, []);
    const order = new Map(nodes.map((e, i) => [e.n, i]));
    // An instance is also known by its component: seats named "A1" are instances of "Local/Seat".
    const names = new Map();
    for (const e of nodes) {
      if (e.n.type !== "INSTANCE" || typeof e.n.getMainComponentAsync !== "function") continue;
      const mc = await e.n.getMainComponentAsync().catch(() => null);
      if (mc) names.set(e.n, `${e.n.name} ${mc.parent && mc.parent.type === "COMPONENT_SET" ? mc.parent.name : mc.name}`);
    }
    const nm = (n) => names.get(n) || n.name;

    // Construction: a screen is built from auto layout (RX-DS-12). A layer placed by x and y in a frame or group
    // without auto layout is loose, unless it is pinned on purpose (a bar, sheet, toast, scrim, status bar, home
    // indicator, keyboard) or is the screen's background. Inside a pinned sheet or bar the layers are checked too;
    // inside an instance or system chrome they are not.
    const PINNED = /\b(bar|footer|toolbar|tabbar|header|sticky|sheet|dialog|modal|toast|snackbar|popover|scrim|backdrop|dim|keyboard|status ?bar|home ?indicator|background|bg)\b/i;
    const CHROME = /\b(keyboard|status ?bar|home ?indicator)\b/i; // system chrome: its insides are not checked
    const fbox = box(frame);
    const loose = nodes.filter((e) => {
      if (e.n === frame || e.inInstance) return false;
      const parent = e.ancestors[e.ancestors.length - 1];
      const free = parent && (parent.type === "GROUP" || (("layoutMode" in parent) && (!parent.layoutMode || parent.layoutMode === "NONE")));
      if (!free || PINNED.test(nm(e.n)) || e.ancestors.some((a) => a !== frame && CHROME.test(nm(a)))) return false;
      if (e.n.layoutMode && e.n.layoutMode !== "NONE") return false; // an auto layout section placed on the screen
      const b = box(e.n);
      return !(b.width >= fbox.width * 0.9 && b.height >= fbox.height * 0.9);
    });
    c.looseLayers += loose.length;
    if (loose.length <= 2) c.layoutScreens++;
    else add("RX-DS-12", loose.length > 5 ? "fail" : "warn", frame, loose[0].n, `${loose.length} layers placed by x and y outside auto layout (e.g. "${short(loose[0].n.name, 30)}"); build the screen from auto layout sections`);
    for (const e of nodes) if (e.n !== frame && !e.inInstance && Array.isArray(e.n.effects) && e.n.effects.some((x) => x.visible !== false) && !e.n.effectStyleId) c.rawEffects++;
    const text = (n) => ("findAll" in n ? findShown(n, (t) => t.type === "TEXT" && t.visible !== false).map((t) => t.characters).join(" ") : n.characters || "").trim();
    const opaque = (e) => { const ps = visiblePaints(e.n.fills); return e.a >= 0.9 && ps.some((p) => p.type !== "SOLID" || (p.opacity ?? 1) >= 0.9); };

    for (const e of nodes) {
      const n = e.n;
      for (const p of visiblePaints(n.fills)) if (p.type === "IMAGE" && p.imageHash) {
        c.imageFills++;
        if (!images.has(p.imageHash)) images.set(p.imageHash, new Set());
        images.get(p.imageHash).add(frame.name);
      }
      if (!e.inInstance && n !== frame) {
        if (n.type === "TEXT" && n.textStyleId === "") c.unstyledText++;
        if (visiblePaints(n.fills).some((p) => p.type === "SOLID" && !(p.boundVariables && p.boundVariables.color))) c.unboundFills++;
        if (n.layoutMode && n.layoutMode !== "NONE" && (n.itemSpacing > 0 || n.paddingLeft > 0 || n.paddingTop > 0)) {
          const bv = n.boundVariables || {};
          if (!bv.itemSpacing && !bv.paddingLeft && !bv.paddingTop) c.unboundSpacing++;
        }
      }
    }

    // Contrast: composite every solid fill under the text's centre, bottom to top, starting from white.
    for (const e of nodes) {
      const t = e.n;
      if (t.type !== "TEXT" || !t.characters.trim() || MIXED(t.fills) || MIXED(t.fontSize)) continue;
      const solid = visiblePaints(t.fills).filter((p) => p.type === "SOLID");
      if (!solid.length) continue;
      const b = box(t), cx = b.x + b.width / 2, cy = b.y + b.height / 2;
      let bg = { r: 1, g: 1, b: 1 }, unknown = false;
      for (const u of nodes.slice(0, order.get(t))) {
        if (u.n.type === "TEXT" || !contains(box(u.n), cx, cy)) continue;
        for (const p of visiblePaints(u.n.fills)) {
          const a = (p.opacity ?? 1) * u.a;
          if (p.type === "SOLID") { bg = over(p.color, a, bg); if (a >= 0.99) unknown = false; }
          else if (a >= 0.5) unknown = true;
        }
      }
      if (unknown) { c.contrastUnknown++; continue; }
      // the fills bottom to top, so the top one shows; the layer's opacity fades them together
      const fg = solid.length === 1 ? over(solid[0].color, (solid[0].opacity ?? 1) * e.a, bg) : over(solid.reduce((k, p) => over(p.color, p.opacity ?? 1, k), bg), e.a, bg);
      const style = MIXED(t.fontName) ? "" : t.fontName.style;
      const large = t.fontSize >= 24 || (t.fontSize >= 18.66 && /bold|black|heavy|semi/i.test(style));
      const r = ratio(fg, bg), need = large ? 3 : 4.5;
      if (r < need) { c.contrastFails++; add("RX-A11Y-01", "fail", frame, t, `"${short(t.characters)}" ${Number(r.toFixed(2)) >= need ? (Math.floor(r * 100) / 100).toFixed(2) : r.toFixed(2)}:1, needs ${need}:1`); }
    }

    // Text cut by an opaque bar painted above it, and text partly outside a clipping container.
    const bars = nodes.filter((e) => e.n !== frame && e.n.type !== "TEXT" && BAR.test(nm(e.n)) && opaque(e));
    // A screen-wide scrim painted above a text puts it behind a modal: covered on purpose, not cut.
    const fbx = box(frame);
    const backdrop = nodes.filter((e) => e.n !== frame && /\b(scrim|backdrop|dim)\b/i.test(nm(e.n)) && box(e.n).width >= fbx.width * 0.9 && box(e.n).height >= fbx.height * 0.9).map((e) => order.get(e.n));
    for (const e of nodes) {
      const t = e.n;
      if (t.type !== "TEXT" || !t.characters.trim() || backdrop.some((s) => s > order.get(t))) continue;
      const b = box(t), area = b.width * b.height || 1;
      for (const bar of bars) {
        if (order.get(bar.n) <= order.get(t) || e.ancestors.includes(bar.n)) continue;
        const f = overlap(b, box(bar.n)) / area;
        if (f > 0.02 && f < 0.98) { c.cutText++; add("RX-QA-03", "fail", frame, t, `"${short(t.characters)}" is cut by "${bar.n.name}" (${Math.round(f * 100)}% covered)`); break; }
      }
      const clip = e.ancestors.slice(1).reverse().find((a) => a.clipsContent);
      if (clip) {
        const f = overlap(b, box(clip)) / area;
        if (f > 0.02 && f < 0.98) { c.clippedText++; add("RX-QA-03", "warn", frame, t, `"${short(t.characters)}" is clipped by "${clip.name}"`); }
      }
    }

    // Overlays and targets: the outermost node whose name says what it is.
    const outermost = (re) => nodes.filter((e) => e.n !== frame && e.n.type !== "TEXT" && re.test(nm(e.n)) && !e.ancestors.some((a) => a !== frame && re.test(nm(a))));
    // An overlay is named as one, or is painted right after a scrim that covers the screen.
    const fb = box(frame);
    const scrims = nodes.filter((e) => e.n !== frame && /\b(scrim|backdrop|dim)\b/i.test(nm(e.n)) && box(e.n).width >= fb.width * 0.9 && box(e.n).height >= fb.height * 0.9);
    const afterScrim = scrims.flatMap((sc) => {
      const parent = sc.ancestors[sc.ancestors.length - 1];
      const sibs = parent && "children" in parent ? parent.children : [];
      return sibs.slice(sibs.indexOf(sc.n) + 1).map((n) => nodes.find((x) => x.n === n)).filter(Boolean);
    });
    const overlays = [...new Set([...outermost(OVERLAY), ...afterScrim])].filter((e) => e.n.type !== "TEXT" && !scrims.includes(e));
    for (const e of overlays) {
      const n = e.n, b = box(n);
      if (b.width >= box(frame).width * 0.98 && b.height >= box(frame).height * 0.95) continue;
      const lifted = (m) => (Array.isArray(m.effects) && m.effects.some((x) => x.type === "DROP_SHADOW" && x.visible !== false)) || visiblePaints(m.strokes).length > 0;
      const first = "children" in n ? n.children[0] : null;
      if (!lifted(n) && !(first && first.type === "RECTANGLE" && lifted(first))) { c.flatOverlays++; add("RX-UI-15", "warn", frame, n, `overlay "${n.name}" has no shadow or border to lift it from what is under it`); }
    }
    // Targets: the outermost node named as one ("Radio dot" inside "Radio" is one target). A row or option of
    // 44 px or more that holds exactly one target is the real hit area, so a 20 px radio in a 56 px row passes.
    const ROW = /\b(row|item|option|cell|card|method|list ?item)\b/i;
    const isTarget = (m) => TARGET.test(nm(m)) && !ROW.test(nm(m)); // "Seat row" is a row of targets, not one
    const inside = (a, b) => a.x >= b.x && a.y >= b.y && a.x + a.width <= b.x + b.width && a.y + a.height <= b.y + b.height;
    // A node that holds two or more targets ("Seat map", "Tabs") is a group of them, not one target.
    const candidates = nodes.filter((e) => e.n !== frame && e.n.type !== "TEXT" && isTarget(e.n));
    const group = (n) => candidates.filter((k) => k.ancestors.includes(n)).length >= 2;
    const isOne = (n) => isTarget(n) && !group(n);
    const named = candidates.filter((e) => !group(e.n) && !e.ancestors.some((a) => a !== frame && isOne(a)));
    // A dot drawn on top of its radio (a sibling inside the radio's box) is the same target.
    const targets = named.filter((e) => !named.some((o) => o !== e && inside(box(e.n), box(o.n)) && !inside(box(o.n), box(e.n))));
    const heldByRow = (e) => e.ancestors.some((a) => a !== frame && ROW.test(nm(a)) && Math.min(box(a).width, box(a).height) >= 44 && targets.filter((t) => t.ancestors.includes(a)).length === 1);
    // A text link ("Remove", "Ubah") is a target too: its hit area is the text, or the wrapper that holds only it.
    // One inside a named target was measured above; a row does not count, since tapping the row does something else.
    const LINK = /^(remove|change|edit|delete|cancel|see all|view all|view bag|hapus|ubah|ganti|batal|lihat semua)$/i;
    const links = nodes.filter((e) => e.n.type === "TEXT" && LINK.test(String(e.n.characters || "").trim()) && !e.ancestors.some((a) => a !== frame && isTarget(a))).map((e) => {
      let i = e.ancestors.length - 1, hit = e.n;
      while (i >= 0 && e.ancestors[i] !== frame && "children" in e.ancestors[i] && e.ancestors[i].children.length === 1) hit = e.ancestors[i--];
      return { ...e, n: hit };
    });
    // One finding per screen, kind, and size: a seat map is "A1 and 39 more", not 40 findings.
    const small = new Map();
    for (const e of [...targets.filter((t) => !heldByRow(t)), ...links]) {
      const b = box(e.n), m = Math.min(b.width, b.height);
      if (m >= 44) continue;
      if (m < 24) c.targetsUnder24++; else c.targetsUnder44++;
      const kind = names.has(e.n) ? nm(e.n).slice(e.n.name.length + 1) : e.n.name;
      // the size as it is, to a tenth (23.6 is under 24, not "24"), and grouped by the limit it misses
      const size = `${Math.round(b.width * 10) / 10}x${Math.round(b.height * 10) / 10}`;
      const key = `${kind}|${m < 24 ? 24 : 44}|${size}`;
      if (!small.has(key)) small.set(key, { e, size, m, n: 0, kind });
      small.get(key).n++;
    }
    for (const g of small.values()) {
      const who = g.n > 1 ? `"${g.e.n.name}" and ${g.n - 1} more (${g.kind})` : `"${g.e.n.name}"`;
      add("RX-A11Y-02", g.m < 24 ? "fail" : "warn", frame, g.e.n, `${who} ${g.size}, under ${g.m < 24 ? 24 : 44}x${g.m < 24 ? 24 : 44}`);
    }

    // Visual tells: what made a flow read as generated in owner review, measured so "0 fail" cannot hide it.
    const own = nodes.filter((e) => e.n !== frame && !e.inInstance);
    const texts = own.filter((e) => e.n.type === "TEXT" && e.n.characters.trim() && !MIXED(e.n.fontSize));
    // Small uppercase labels above blocks (RX-UI-01): more than three on one screen is a template, not a hierarchy.
    const caps = texts.filter((e) => { const s = e.n.characters.trim(); return e.n.fontSize <= 13 && s.length <= 32 && /\p{L}{2}/u.test(s) && (e.n.textCase === "UPPER" || s === s.toUpperCase()); });
    c.capsLabels += caps.length;
    if (caps.length > 3) add("RX-UI-01", "warn", frame, caps[0].n, `${caps.length} small uppercase labels (${caps.slice(0, 3).map((e) => `"${short(e.n.characters.trim(), 16)}"`).join(", ")}…); label a section only when its content does not say what it is`);
    // A bordered or shadowed rounded box around a section (RX-UI-01): more than three on one screen makes every section equal.
    const raised = (n) => visiblePaints(n.strokes).length > 0 || (Array.isArray(n.effects) && n.effects.some((x) => x.type === "DROP_SHADOW" && x.visible !== false));
    const cards = own.filter((e) => { const n = e.n, b = box(n); return n.type !== "TEXT" && "cornerRadius" in n && !MIXED(n.cornerRadius) && n.cornerRadius > 0 && raised(n) && b.width >= fbox.width * 0.6 && b.height >= 40 && !PINNED.test(nm(n)) && !TARGET.test(nm(n)) && !OVERLAY.test(nm(n)) && !/\b(option|method|choice|radio|input|field|search)\b/i.test(nm(n)); });
    c.cards += cards.length;
    if (cards.length > 3) add("RX-UI-01", "warn", frame, cards[0].n, `${cards.length} sections in a bordered or shadowed card ("${short(cards[0].n.name, 24)}" and ${cards.length - 1} more); group with space, a heading, or one divider first`);
    // Text under 12 px (RX-A11Y-02), outside system chrome.
    const tiny = texts.filter((e) => e.n.fontSize < 12);
    c.smallText += tiny.length; c.texts += texts.length;
    if (tiny.length) add("RX-A11Y-02", "warn", frame, tiny[0].n, `${tiny.length} of ${texts.length} text layers under 12 px (e.g. "${short(tiny[0].n.characters.trim(), 24)}" ${tiny[0].n.fontSize} px)`);
    // A type scale with steps (RX-UI-03): three or more sizes, 11 to 40 px, each with another 1 px above it.
    const sizes = [...new Set(texts.map((e) => Math.round(e.n.fontSize)).filter((v) => v >= 11 && v <= 40))].sort((a, b) => a - b);
    const close = sizes.filter((v) => sizes.includes(v + 1)).length;
    if (close >= 3) { c.closeSizes += 1; add("RX-UI-03", "warn", frame, frame, `text in ${sizes.length} sizes (${sizes.join(", ")} px), ${close} of them 1 px from the next: steps that close read as mistakes, not levels; give each role one step of a scale and one text style`); }
    // A count over a list that the list does not bear out (RX-AS-03): "8 terapis" over a list of 2 cards that ends
    // with room for the next, or over more cards than it says.
    {
      const COUNT = /^\s*(\d{1,3})\s+(\p{L}+)/iu;
      const UNIT = /^(menit|jam|hari|minggu|bulan|tahun|detik|km|m|kg|gr?|langkah|step|steps|min|mins|hours?|days?|weeks?|months?|years?|x|kali|persen|bintang|ulasan|reviews?)$/i;
      const PARTIAL = /\d+\s*(?:dari|of|\/)\s*\d+|\d\+|(?:lebih dari|more than|over|hingga|up to)\s*\d|menampilkan|showing/i;
      for (const { n } of texts) {
        const m = n.characters.match(COUNT);
        if (!m) continue;
        const said = Number(m[1]);
        if (said < 2 || UNIT.test(m[2]) || PARTIAL.test(n.characters)) continue;
        const tb = box(n);
        let best = null;
        for (const e of nodes) {
          if (!("children" in e.n)) continue;
          const rows = e.n.children.filter((k) => { const b = box(k); return k.visible !== false && k.type !== "TEXT" && b.width >= fbox.width * 0.6 && b.height >= 48 && b.height <= fbox.height * 0.4 && b.y >= tb.y + tb.height - 2; });
          const same = rows.filter((k) => Math.abs(box(k).width - box(rows[0]).width) <= 2);
          if (same.length < 2 || box(same[0]).y - (tb.y + tb.height) > 80) continue;
          if (!best || box(same[0]).y < box(best[0]).y) best = same;
        }
        if (!best) continue;
        const shown = best.length;
        const last = best.map(box).reduce((a, b) => (b.y + b.height > a.y + a.height ? b : a));
        const gap = shown >= 2 ? Math.max(0, box(best[1]).y - (box(best[0]).y + box(best[0]).height)) : 12;
        const bottom = nodes.map((e) => box(e.n)).filter((b) => b.width >= fbox.width * 0.9 && b.y + b.height >= fbox.y + fbox.height - 4 && b.y > last.y && b.y < fbox.y + fbox.height).reduce((v, b) => Math.min(v, b.y), fbox.y + fbox.height);
        const room = last.y + last.height + gap + Math.min(last.height * 0.3, 40) < bottom;
        if (shown > said || (shown < said && room)) {
          c.listCounts++;
          const why = shown > said ? `the list under it shows ${shown}` : `the list under it shows ${shown} and ends with room for the next`;
          add("RX-AS-03", "warn", frame, n, `"${short(n.characters.trim(), 30)}" counts ${said}, but ${why}: show what the count says, or count what is shown`);
        }
      }
    }
    // An empty band (RX-UI-05): the tallest vertical gap between painted blocks, from the first block to the last.
    const painted = nodes.filter((e) => {
      const n = e.n, b = box(n);
      if (n === frame || e.ancestors.some((a) => a.type === "INSTANCE")) return false;
      if (b.width >= fbox.width * 0.9 && b.height >= fbox.height * 0.9) return false;
      return n.type === "TEXT" || n.type === "INSTANCE" || visiblePaints(n.fills).length > 0 || visiblePaints(n.strokes).length > 0;
    }).map((e) => [box(e.n).y - fbox.y, box(e.n).y - fbox.y + box(e.n).height]).filter(([a, b]) => b > 0 && a < fbox.height).sort((p, q) => p[0] - q[0]);
    let reach = painted.length ? painted[0][1] : 0, band = { h: 0, at: 0 };
    for (const [a, b] of painted.slice(1)) { if (a - reach > band.h) band = { h: a - reach, at: reach }; reach = Math.max(reach, b); }
    if (band.h >= 96) { c.emptyBands++; add("RX-UI-05", "warn", frame, null, `an empty band ${Math.round(band.h)} pt tall from y ${Math.round(band.at)}; move the blocks together, give the space a job, or let the content fill it`); }
    // Buttons that share a row (RX-UI-15): one height, labels on one line, an icon in each or in none.
    const rows = new Map();
    for (const e of outermost(/\b(button|btn|cta)\b/i)) { const parent = e.ancestors[e.ancestors.length - 1]; if (!rows.has(parent)) rows.set(parent, []); rows.get(parent).push(e.n); }
    const cy = (n) => box(n).y + box(n).height / 2;
    const label = (n) => ("findAll" in n ? findShown(n, (t) => t.type === "TEXT" && t.visible !== false && t.characters.trim())[0] : null);
    const icon = (n) => "findAll" in n && findShown(n, (t) => t.visible !== false && (t.type === "VECTOR" || t.type === "BOOLEAN_OPERATION" || /\bicon\b/i.test(t.name))).length > 0;
    for (const row of rows.values()) {
      const line = row.filter((n) => row.some((o) => o !== n && Math.abs(cy(o) - cy(n)) < 8));
      if (line.length < 2) continue;
      const hs = line.map((n) => box(n).height), ms = line.map(label).filter(Boolean).map(cy), is = line.map(icon);
      const spread = (xs) => Math.max(...xs) - Math.min(...xs);
      const why = [spread(hs) > 2 && "heights differ", ms.length > 1 && spread(ms) > 2 && `labels ${Math.round(spread(ms))} px apart`, is.some(Boolean) && !is.every(Boolean) && "an icon in some, not all"].filter(Boolean);
      if (why.length) { c.unevenRows++; add("RX-UI-15", "warn", frame, line[0], `buttons in one row (${line.map((n) => `"${short(label(n) ? label(n).characters.trim() : n.name, 14)}"`).join(", ")}): ${why.join(", ")}`); }
    }

    // A busy screen (a visible "Paying…" or "Processing") whose button still shows its idle label.
    const busy = nodes.some((e) => e.n.type === "TEXT" && BUSY.test(e.n.characters) && !e.ancestors.some((a) => /button|btn|cta/i.test(nm(a))));
    if (busy) for (const e of outermost(/\b(button|btn|cta)\b/i)) {
      const label = text(e.n);
      if (label && !QUIET.test(label) && !BUSY.test(label) && !/(…|\.\.\.)$/.test(label)) { c.idleBusyButtons++; add("RX-IX-02", "warn", frame, e.n, `the screen says it is busy but "${short(label)}" keeps its idle label`); }
    }
  }

  // Across the screens of a flow: what one screen says, the next must agree with (owner request 2026-11-23, after
  // a three-screen FigCraft benchmark where a dark band opened only the last screen, the main button changed colour,
  // "Kembali ke beranda" led to a tab the bar did not have, and a list card promised an hour the profile did not offer).
  if (screens.length >= 2) {
    const FCHROME = /\b(keyboard|status ?bar|home ?indicator)\b/i;
    const NAVBAR = /tab ?bar|bottom ?nav|nav ?bar|navigation|navigasi/i;
    const BUTTON = /\b(button|btn|cta)\b/i;
    const BACK = /^\s*(?:kembali ke|back to|ke)\s+(.{2,30}?)\s*$/i;
    const TIME = /(?:^|[^\d.:])((?:[01]?\d|2[0-3])[.:][0-5]\d)(?:$|[^\d])/g;
    const ONLY_TIME = /^\s*(?:[01]?\d|2[0-3])[.:][0-5]\d\s*$/;
    const white = { r: 1, g: 1, b: 1 };
    const solid = (n) => {
      const ps = visiblePaints(n.fills);
      const p = ps.find((q) => q.type === "SOLID");
      if (!p) return null;
      const a = (typeof p.opacity === "number" ? p.opacity : 1) * (typeof n.opacity === "number" ? n.opacity : 1);
      if (a < 0.9 || ps.some((q) => q.type !== "SOLID")) return null;
      return { r: p.color.r, g: p.color.g, b: p.color.b };
    };
    const hex = (k) => "#" + [k.r, k.g, k.b].map((v) => Math.round(Math.min(1, Math.max(0, v)) * 255).toString(16).padStart(2, "0")).join("");
    const labels = (n) => ("children" in n ? findShown(n, (k) => k.type === "TEXT" && k.characters.trim()) : []);
    const info = screens.map((f) => {
      const fb = box(f);
      const bg = solid(f) || white;
      const layers = [];
      const go = (n, anc) => { if (n.visible === false) return; layers.push({ n, anc }); if ("children" in n) for (const k of n.children) go(k, [...anc, n]); };
      for (const k of f.children || []) go(k, [f]);
      const bandNode = layers.map((e) => e.n).find((n) => { const b = box(n); const k = solid(n); return n.type !== "TEXT" && b.x <= fb.x + 2 && b.width >= fb.width * 0.9 && b.y <= fb.y + 60 && b.height >= 140 && b.height <= fb.height * 0.8 && !!k && ratio(k, bg) >= 2; });
      let best = null;
      for (const { n, anc } of layers) {
        const b = box(n);
        if (n.type === "TEXT" || b.height < 40 || b.height > 64 || b.width < fb.width * 0.35 || b.y < fb.y + 60) continue;
        if ([n, ...anc].some((a) => a !== f && (FCHROME.test(a.name) || OVERLAY.test(a.name)))) continue;
        const l = labels(n)[0];
        const label = l ? l.characters : "";
        if (BUSY.test(label) || /(…|\.\.\.)$/.test(label.trim())) continue;
        const k = solid(n);
        if (!k || !l || ratio(k, bg) < 3 || !(BUTTON.test(n.name) || b.width >= fb.width * 0.4)) continue;
        if (!best || b.width > best.w + 0.5) best = { n, w: b.width, label, k };
      }
      return { f, fb, layers, band: bandNode ? { name: bandNode.name, k: solid(bandNode) } : null, primary: best ? { label: best.label, k: best.k } : null };
    });

    const banded = info.filter((s) => s.band);
    if (info.length >= 3 && banded.length === 1) {
      const s = banded[0];
      c.flowBreaks++;
      add("RX-DS-02", "warn", s.f, { name: s.band.name }, `only "${s.f.name}" opens with a full-width ${hex(s.band.k)} band ("${short(s.band.name, 30)}"); the other ${info.length - 1} screens start on the page colour: carry the treatment to every screen of the flow, or drop it`);
    }

    const filled = info.filter((s) => s.primary);
    const differs = (a, b) => Math.max(Math.abs(a.r - b.r), Math.abs(a.g - b.g), Math.abs(a.b - b.b)) > 0.08;
    const odd = filled.find((s) => differs(s.primary.k, filled[0].primary.k));
    if (filled.length >= 2 && odd) {
      c.flowBreaks++;
      add("RX-DS-02", "warn", odd.f, { name: odd.primary.label }, `the main button changes colour between screens (${filled.map((s) => `${s.f.name} "${short(s.primary.label.trim(), 24)}" ${hex(s.primary.k)}`).join("; ")}): one action colour for the main action on every screen`);
    }

    let tabs = [];
    let haveBar = false;
    for (const s of info) for (const { n, anc } of s.layers) if (n.type === "TEXT" && anc.some((a) => NAVBAR.test(a.name))) { haveBar = true; tabs.push(n.characters.trim().toLowerCase()); }
    tabs = [...new Set(tabs.sort())];
    const frames = info.map((s) => s.f.name.toLowerCase().replace(/^[\d\s._-]+/, ""));
    if (haveBar) for (const s of info) for (const { n } of s.layers) {
      if (n.type !== "TEXT") continue;
      const m = BACK.exec(n.characters);
      if (!m) continue;
      const to = m[1].toLowerCase();
      // a place is a short name; "Ke Jl. Dipatiukur No. 35" is an address, not a way back (Rawat r4 D3)
      if (/\d/.test(to) || to.split(/\s+/).filter(Boolean).length > 3) continue;
      const known = (x) => !!x && (x.includes(to) || to.includes(x));
      if (!tabs.some(known) && !frames.some(known)) {
        c.flowBreaks++;
        add("RX-CD-12", "warn", s.f, n, `"${short(n.characters.trim(), 40)}" leads to a place the flow does not have: the tab bar holds ${tabs.filter((x) => x).join(", ")}; name the tab or screen it opens`);
      }
    }

    const pad = (h) => (h.length === 4 ? `0${h}` : h);
    info.forEach((a, i) => {
      for (const { n, anc } of a.layers) {
        const name = n.type === "TEXT" ? n.characters.trim() : "";
        if (n.type !== "TEXT" || [...name].length < 6 || !name.includes(" ") || !/^\p{Lu}/u.test(name) || new RegExp(TIME.source).test(name)) continue;
        // a name is said once on its screen: "STR terverifikasi KKI" on every card is a badge, not a person (Rawat r4 D3)
        if (a.layers.filter((e) => e.n.type === "TEXT" && e.n.characters.trim() === name).length > 1) continue;
        const card = [...anc].reverse().find((k) => k !== a.f && box(k).height <= a.fb.height * 0.4 && box(k).width >= a.fb.width * 0.6 && !FCHROME.test(k.name));
        if (!card) continue;
        const promised = findShown(card, (k) => k.type === "TEXT").flatMap((k) => [...k.characters.matchAll(TIME)].map((m) => m[1].replace(":", ".")));
        if (!promised.length) continue;
        info.forEach((b, j) => {
          if (j === i) return;
          if (!b.layers.some((e) => e.n.type === "TEXT" && e.n.characters.trim() === name)) return;
          const raw = b.layers.filter((e) => e.n.type === "TEXT" && ONLY_TIME.test(e.n.characters) && !e.anc.some((x) => FCHROME.test(x.name))).map((e) => e.n.characters.trim().replace(":", "."));
          const hours = raw.filter((h, k) => k === 0 || raw[k - 1] !== h).map(pad);
          if (hours.length < 3) return;
          for (const p of promised) if (!hours.includes(pad(p))) {
            c.flowBreaks++;
            add("RX-AS-03", "warn", a.f, card, `"${short(name, 30)}": ${a.f.name} promises ${pad(p)}, but ${b.f.name} offers ${hours.slice(0, 6).join(", ")}: sample data must agree across screens`);
          }
        });
      }
    });

    // A list card that says "today" (or "tomorrow") while the person's own screen opens its date row on a later day
    // (RX-AS-03): today is the earliest date a row can offer, tomorrow the first or second. Owner blind rating
    // 2026-11-23: the list said "Tersedia hari ini" and the profile opened on the next day in three no-skill runs.
    const DAY = /\b(sen|sel|rab|kam|jum|sab|min|mon|tue|wed|thu|fri|sat|sun)[a-z]*\b|hari ini|besok|today|tomorrow/i;
    const PICKED = /dipilih|terpilih|selected|aktif|active|current/i;
    info.forEach((a, i) => {
      const seen = new Set();
      for (const { n, anc } of a.layers) {
        const name = n.type === "TEXT" ? n.characters.trim() : "";
        if (n.type !== "TEXT" || [...name].length < 6 || !name.includes(" ") || !/^\p{Lu}/u.test(name) || seen.has(name)) continue;
        // a name is said once on its screen: "STR terverifikasi KKI" on every card is a badge, not a person (Rawat r4 D3)
        if (a.layers.filter((e) => e.n.type === "TEXT" && e.n.characters.trim() === name).length > 1) continue;
        const card = [...anc].reverse().find((k) => k !== a.f && box(k).height <= a.fb.height * 0.4 && box(k).width >= a.fb.width * 0.6 && !FCHROME.test(k.name));
        if (!card) continue;
        const words = findShown(card, (k) => k.type === "TEXT").map((k) => k.characters).join(" · ");
        const today = /hari ini|today/i.test(words), tomorrow = /besok|tomorrow/i.test(words);
        if (today === tomorrow) continue;
        const said = words.split(" · ").find((w) => (today ? /hari ini|today/i : /besok|tomorrow/i).test(w)).trim();
        info.forEach((b, j) => {
          if (j === i || !b.layers.some((e) => e.n.type === "TEXT" && e.n.characters.trim() === name)) return;
          for (const { n: row } of b.layers) {
            const chips = "children" in row ? row.children.filter((k) => k.visible !== false && k.type !== "TEXT") : [];
            const label = (k) => findShown(k, (x) => x.type === "TEXT").map((x) => x.characters.trim()).join(" ");
            if (chips.length < 4 || !chips.every((k) => DAY.test(label(k)) && /\d/.test(label(k)))) continue;
            const picked = chips.filter((k) => PICKED.test(k.name));
            if (picked.length !== 1) continue;
            const at = chips.indexOf(picked[0]);
            if (at > (today ? 0 : 1)) {
              seen.add(name);
              c.flowBreaks++;
              add("RX-AS-03", "warn", a.f, card, `"${short(name, 30)}": ${a.f.name} says "${short(said, 30)}", but ${b.f.name} opens on ${label(picked[0])}, date ${at + 1} of the row: open on the day the list promised, or say that day in the list`);
            }
            break;
          }
        });
      }
    });

    // A cost first shown after the commitment (RX-UX-15): on the flow's last screen, an amount labelled as a fee (its
    // own words, or the text beside it on its row) that no earlier screen shows.
    const MONEY = /Rp\s?(\d{1,3}(?:\.\d{3})+|\d{4,})/gi;
    const FEE = /biaya|ongkos|ongkir|transport|admin|\bfee|layanan|kunjungan|pajak|ppn|asuransi|service|delivery|\btax|surcharge|penanganan|platform/i;
    const TOTAL = /total|jumlah|subtotal|tagihan|grand/i;
    const order = info.map((_, k) => k).sort((a, b) => { const p = box(screens[a]), q = box(screens[b]); return p.x - q.x || p.y - q.y; });
    const amounts = (s) => s.layers.filter((e) => e.n.type === "TEXT").flatMap((e) => [...e.n.characters.matchAll(MONEY)].map((m) => ({ n: e.n, value: Number(m[1].replace(/\./g, "")), shown: m[0] })));
    const last = info[order[order.length - 1]];
    const earlier = order.slice(0, -1).flatMap((k) => amounts(info[k]).map((a) => a.value));
    const flagged = [];
    for (const { n, value, shown } of amounts(last)) {
      if (earlier.includes(value) || flagged.includes(value)) continue;
      const own = n.characters.replace(MONEY, "").trim();
      let label = "";
      if ([...own].filter((ch) => /\p{L}/u.test(ch)).length >= 3) label = own;
      else {
        const b = box(n), cy = b.y + b.height / 2;
        let best = null;
        for (const e of last.layers) {
          const m = e.n;
          if (m === n || m.type !== "TEXT" || new RegExp(MONEY.source, "i").test(m.characters)) continue;
          const k = box(m);
          if (Math.abs(k.y + k.height / 2 - cy) <= Math.max(k.height, b.height) / 2 && k.x + k.width <= b.x + 2 && (!best || k.x + k.width >= box(best).x + box(best).width)) best = m;
        }
        label = best ? best.characters.trim() : "";
      }
      if (FEE.test(label) && !TOTAL.test(label)) {
        flagged.push(value);
        c.flowBreaks++;
        add("RX-UX-15", "warn", last.f, n, `"${short(label, 30)}" ${shown} first shows on "${last.f.name}": no earlier screen shows it, so the person meets the cost after committing; show every cost with the price before the action`);
      }
    }

    // The chosen hour missing from the bar that commits (RX-IX-17): three or more hour chips, one named as picked, and a
    // full-width bar pinned to the bottom that holds the price or the button but not that hour (owner rating 2026-11-24).
    const STARTS_TIME = /^\s*(?:[01]?\d|2[0-3])[.:][0-5]\d\b/;
    const HAS_MONEY = new RegExp(MONEY.source, "i");
    const shownText = (k) => findShown(k, (x) => x.type === "TEXT").map((x) => x.characters.trim()).filter((x) => x);
    const padH = (h) => (h.length === 4 ? `0${h}` : h);
    info.forEach((a) => {
      const chips = a.layers.map((e) => e.n).filter((n) => {
        if (n.type === "TEXT" || box(n).width > a.fb.width * 0.5 || FCHROME.test(n.name)) return false;
        const words = shownText(n);
        return words.length >= 1 && words.length <= 3 && STARTS_TIME.test(words[0]);
      });
      const picked = chips.filter((k) => PICKED.test(k.name));
      if (chips.length < 3 || picked.length !== 1) return;
      const hm = [...` ${shownText(picked[0])[0]}`.matchAll(TIME)][0];
      if (!hm) return;
      const hour = hm[1].replace(":", ".");
      const bar = a.layers.map((e) => e.n).find((n) => {
        const b = box(n);
        return n.type !== "TEXT" && n !== a.f && b.width >= a.fb.width * 0.9 && Math.abs(b.y + b.height - (a.fb.y + a.fb.height)) <= 40 && b.height <= 220 && !NAVBAR.test(n.name)
          && (shownText(n).some((x) => HAS_MONEY.test(x)) || findShown(n, (x) => BUTTON.test(x.name)).length > 0);
      });
      if (!bar) return;
      const held = shownText(bar).some((x) => [...` ${x} `.matchAll(TIME)].some((m) => padH(m[1].replace(":", ".")) === padH(hour)));
      if (!held) {
        c.flowBreaks++;
        add("RX-IX-17", "warn", a.f, bar, `"${short(bar.name, 30)}" holds the action but not the chosen hour ${padH(hour)}: put the date and hour with the price and the button, so the person sees what they book as they commit`);
      }
    });

    // A confirmation that never says how the person pays (RX-IX-05): the flow shows a price, and its last screen confirms
    // the order but names no payment method (owner rating 2026-11-24).
    const PAY = /gopay|\bovo\b|\bdana\b|shopeepay|qris|virtual account|\bva\b|transfer|kartu (?:kredit|debit)|tunai|\bcash\b|paylater|metode (?:bayar|pembayaran)|payment method|bayar\b.{0,40}\b(?:setelah|di tempat|saat|nanti|langsung|via|ke terapis)|pay (?:after|on|at|later)/i;
    const CONFIRMED = /terkonfirmasi|dikonfirmasi|berhasil|sukses|lunas|terjadwal|dipesan|confirmed|success|booked|order placed/i;
    const texts = (s) => s.layers.filter((e) => e.n.type === "TEXT").map((e) => e.n.characters);
    const priced = info.some((s) => texts(s).some((x) => HAS_MONEY.test(x)));
    const lastTexts = texts(last);
    if (priced && (CONFIRMED.test(last.f.name) || lastTexts.some((x) => CONFIRMED.test(x))) && !lastTexts.some((x) => PAY.test(x))) {
      c.flowBreaks++;
      add("RX-IX-05", "warn", last.f, last.f, `"${last.f.name}" confirms the order but never says how it is paid: name the method with the total ("Bayar ke terapis setelah sesi"); if the business has not chosen one, show a neutral sample method with the file's sample-data marker`);
    }

    // Two words for one state across the flow (RX-CD-05): a taken slot called "Penuh" on one chip and "Terisi" on another.
    const TAKEN = /\b(penuh|terisi|habis|sold out|full|booked)\b/i;
    const words = [];
    for (const k of order) for (const { n, anc } of info[k].layers) {
      if (n.type !== "TEXT" || [...n.characters.trim()].length > 25 || anc.some((x) => FCHROME.test(x.name))) continue;
      const m = TAKEN.exec(n.characters);
      if (m && !words.some((w) => w.w === m[1].toLowerCase())) words.push({ w: m[1].toLowerCase(), s: info[k], n });
    }
    if (words.length >= 2) {
      c.flowBreaks++;
      add("RX-CD-05", "warn", words[1].s.f, words[1].n, `"${words[0].w}" and "${words[1].w}" name the same state: pick one word for a taken slot and use it on every screen`);
    }
  }

  // Nothing on the page outside the screens but components and the frames or sections that hold them.
  for (const n of opened(page.children)) {
    if (screens.includes(n) || n.type === "COMPONENT" || n.type === "COMPONENT_SET" || hasComponents(n) || n.visible === false) continue;
    c.strayLayers++;
    add("RX-DS-12", "warn", { name: page.name }, n, `"${short(n.name, 30)}" sits on the page outside the screens; delete it or move it into the parts frame`);
  }
  c.distinctImages = images.size;
  c.reusedImages = [...images.values()].filter((s) => s.size > 1).length;

  const annotations = {};
  try {
    const cats = new Map((await figma.annotations.getAnnotationCategoriesAsync()).map((k) => [k.id, k.label]));
    for (const f of screens) for (const n of [f, ...("findAll" in f ? f.findAll(() => true) : [])]) {
      for (const a of n.annotations || []) { const k = cats.get(a.categoryId) || "uncategorised"; annotations[k] = (annotations[k] || 0) + 1; }
    }
  } catch (err) { annotations.unreadable = 1; }

  const fails = findings.filter((f) => f.level === "fail").length;
  const gate = `figma audit (${page.name}): screens ${c.screens} · images ${c.distinctImages} distinct, ${c.imageFills} fills, ${c.reusedImages} reused across screens · contrast fails ${c.contrastFails} (${c.contrastUnknown} over images, not measured) · text cut ${c.cutText}, clipped ${c.clippedText} · targets under 24 ${c.targetsUnder24}, under 44 ${c.targetsUnder44} · overlays with no lift ${c.flatOverlays} · busy buttons with idle label ${c.idleBusyButtons} · unstyled text ${c.unstyledText}, unbound fills ${c.unboundFills}, unbound spacing ${c.unboundSpacing} · built in auto layout ${c.layoutScreens}/${c.screens} screens, loose layers ${c.looseLayers}, layers outside the screens ${c.strayLayers}, effects without a style ${c.rawEffects} · empty bands ${c.emptyBands}, small uppercase labels ${c.capsLabels}, section cards ${c.cards}, text under 12 px ${c.smallText}/${c.texts}, screens with text sizes 1 px apart ${c.closeSizes}, uneven button rows ${c.unevenRows}, list counts that disagree ${c.listCounts} · breaks across screens ${c.flowBreaks} · annotations ${Object.entries(annotations).map(([k, v]) => `${k} ${v}`).join(", ") || "none"} · ${fails} fail, ${findings.length - fails} warn`;
  return { page: page.name, screens: screens.map((s) => s.name), counts: c, images: [...images.entries()].map(([h, s]) => ({ image: h.slice(0, 8), screens: [...s] })), annotations, findings: findings.slice(0, 80), more: Math.max(0, findings.length - 80), gate };
}

/** The script use_figma runs: the function plus the two lines that call it. Shipped inside scripts/figma-audit.md
 *  (figmaAuditMarkdown), because the Claude plugin directory refuses script files from unverified organizations. */
export function figmaAuditScript(): string {
  return `// RYUX Figma audit: read-only. Send this whole block as the code of one use_figma call, after setting PAGE.
// It measures the page's screens and returns counts, findings, and a gate line to copy into the Delivery Gate.
// Fix every "fail" (and each "warn" you agree with), then run it again; the last run's line goes in the gate.
const PAGE = ""; // the page to audit, by name ("" = the first page)
const figmaAudit = ${figmaAudit.toString()};
return await figmaAudit(figma, PAGE);
`;
}

/** scripts/figma-audit.md: the script in one fenced block, longer than any backtick run inside it. */
export function figmaAuditMarkdown(): string {
  const code = figmaAuditScript().replace(/\n$/, "");
  const longest = Math.max(2, ...(code.match(/`+/g) ?? []).map((r) => r.length));
  const fence = "`".repeat(longest + 1);
  return `# RYUX Figma audit script

Read-only. Copy the code block below, unchanged, as the \`code\` of one \`use_figma\` call. Set \`PAGE\` to the
page to audit first ("" audits the first page). It returns counts, findings, and the gate line for the Delivery
Gate. It is kept in Markdown because the Claude plugin directory accepts no script files from this publisher;
the same code ships in the npm package as \`ryux audit\` for FigCraft files.

${fence}js
${code}
${fence}
`;
}
