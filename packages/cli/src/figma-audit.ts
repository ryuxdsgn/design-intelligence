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
  const hasComponents = (f) => "findOne" in f && !!f.findOne((n) => n.type === "COMPONENT" || n.type === "COMPONENT_SET");
  const screens = page.children.flatMap((n) => (n.type === "SECTION" ? n.children : [n])).filter((n) => n.type === "FRAME" && n.visible !== false && !hasComponents(n));

  const findings = [];
  const add = (rule, level, frame, node, message) => findings.push({ rule, level, frame: frame.name, node: node ? node.name : "", message });
  const c = { screens: screens.length, imageFills: 0, distinctImages: 0, reusedImages: 0, contrastFails: 0, contrastUnknown: 0, targetsUnder24: 0, targetsUnder44: 0, cutText: 0, clippedText: 0, flatOverlays: 0, idleBusyButtons: 0, unstyledText: 0, unboundFills: 0, unboundSpacing: 0, layoutScreens: 0, looseLayers: 0, strayLayers: 0, rawEffects: 0, emptyBands: 0, capsLabels: 0, cards: 0, smallText: 0, texts: 0, unevenRows: 0 };
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
    const text = (n) => ("findAll" in n ? n.findAll((t) => t.type === "TEXT" && t.visible !== false).map((t) => t.characters).join(" ") : n.characters || "").trim();
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
      const tp = visiblePaints(t.fills).find((p) => p.type === "SOLID");
      if (!tp) continue;
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
      const fg = over(tp.color, (tp.opacity ?? 1) * e.a, bg);
      const style = MIXED(t.fontName) ? "" : t.fontName.style;
      const large = t.fontSize >= 24 || (t.fontSize >= 18.66 && /bold|black|heavy|semi/i.test(style));
      const r = ratio(fg, bg), need = large ? 3 : 4.5;
      if (r < need) { c.contrastFails++; add("RX-A11Y-01", "fail", frame, t, `"${short(t.characters)}" ${r.toFixed(2)}:1, needs ${need}:1`); }
    }

    // Text cut by an opaque bar painted above it, and text partly outside a clipping container.
    const bars = nodes.filter((e) => e.n !== frame && e.n.type !== "TEXT" && BAR.test(nm(e.n)) && opaque(e));
    for (const e of nodes) {
      const t = e.n;
      if (t.type !== "TEXT" || !t.characters.trim()) continue;
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
      const key = `${kind}|${Math.round(b.width)}x${Math.round(b.height)}`;
      if (!small.has(key)) small.set(key, { e, size: key.split("|")[1], m, n: 0, kind });
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
    const label = (n) => ("findAll" in n ? n.findAll((t) => t.type === "TEXT" && t.visible !== false && t.characters.trim())[0] : null);
    const icon = (n) => "findAll" in n && n.findAll((t) => t.visible !== false && (t.type === "VECTOR" || t.type === "BOOLEAN_OPERATION" || /\bicon\b/i.test(t.name))).length > 0;
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

  // Nothing on the page outside the screens but components and the frames or sections that hold them.
  for (const n of page.children.flatMap((m) => (m.type === "SECTION" ? m.children : [m]))) {
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
  const gate = `figma audit (${page.name}): screens ${c.screens} · images ${c.distinctImages} distinct, ${c.imageFills} fills, ${c.reusedImages} reused across screens · contrast fails ${c.contrastFails} (${c.contrastUnknown} over images, not measured) · text cut ${c.cutText}, clipped ${c.clippedText} · targets under 24 ${c.targetsUnder24}, under 44 ${c.targetsUnder44} · overlays with no lift ${c.flatOverlays} · busy buttons with idle label ${c.idleBusyButtons} · unstyled text ${c.unstyledText}, unbound fills ${c.unboundFills}, unbound spacing ${c.unboundSpacing} · built in auto layout ${c.layoutScreens}/${c.screens} screens, loose layers ${c.looseLayers}, layers outside the screens ${c.strayLayers}, effects without a style ${c.rawEffects} · empty bands ${c.emptyBands}, small uppercase labels ${c.capsLabels}, section cards ${c.cards}, text under 12 px ${c.smallText}/${c.texts}, uneven button rows ${c.unevenRows} · annotations ${Object.entries(annotations).map(([k, v]) => `${k} ${v}`).join(", ") || "none"} · ${fails} fail, ${findings.length - fails} warn`;
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
