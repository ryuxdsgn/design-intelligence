// A FigCraft document (the JSON `figcraft-cli convert file.figcraft file.json` writes) seen through the slice
// of the Figma Plugin API that figma-audit.ts reads, so one audit measures both canvases. Read-only.
// Shape: { pages: [ids], current_page, nodes: { id: { type, name, parent, children, transform, width, height,
// fills, strokes, effects, corners, layout, child_layout, clip, bound, styles, style, characters, annotations,
// source } }, annotation_categories }.

const MIXED = Symbol("mixed");

const TYPES: Record<string, string> = {
  page: "PAGE", frame: "FRAME", group: "GROUP", section: "SECTION", text: "TEXT", rectangle: "RECTANGLE",
  ellipse: "ELLIPSE", polygon: "POLYGON", star: "STAR", line: "LINE", arrow: "LINE", vector: "VECTOR",
  boolean: "BOOLEAN_OPERATION", component: "COMPONENT", componentSet: "COMPONENT_SET", component_set: "COMPONENT_SET",
  instance: "INSTANCE", slice: "SLICE",
};
const EFFECTS: Record<string, string> = { dropShadow: "DROP_SHADOW", innerShadow: "INNER_SHADOW", layerBlur: "LAYER_BLUR", backgroundBlur: "BACKGROUND_BLUR" };

// eslint-disable-next-line @typescript-eslint/no-explicit-any -- FigCraft's document JSON, mapped field by field below
type Raw = Record<string, any>;
type Matrix = [number, number, number, number, number, number];

const multiply = (p: Matrix, c: Matrix): Matrix => [
  p[0] * c[0] + p[2] * c[1], p[1] * c[0] + p[3] * c[1],
  p[0] * c[2] + p[2] * c[3], p[1] * c[2] + p[3] * c[3],
  p[0] * c[4] + p[2] * c[5] + p[4], p[1] * c[4] + p[3] * c[5] + p[5],
];

function paint(p: Raw, bound: unknown): Raw {
  const visible = p.visible !== false;
  const type = String(p.type || "");
  if (type === "solid") {
    const c = p.color || { r: 0, g: 0, b: 0, a: 1 };
    return { type: "SOLID", visible, color: { r: c.r, g: c.g, b: c.b }, opacity: (p.opacity ?? 1) * (c.a ?? 1), ...(bound ? { boundVariables: { color: { id: bound } } } : {}) };
  }
  if (/image/i.test(type)) return { type: "IMAGE", visible, opacity: p.opacity ?? 1, imageHash: String(p.image ?? p.hash ?? p.ref ?? p.id ?? "image") };
  return { type: type.replace(/([a-z])([A-Z])/g, "$1_$2").toUpperCase(), visible, opacity: p.opacity ?? 1 };
}

/** The Figma-like `figma` object figmaAudit takes, built from a FigCraft document. */
export function figcraftCanvas(doc: Raw) {
  const raw: Record<string, Raw> = doc.nodes || {};
  const made = new Map<string, Raw>();
  const absolute = new Map<string, Matrix>();

  const matrix = (id: string): Matrix => {
    const hit = absolute.get(id);
    if (hit) return hit;
    const n = raw[id];
    const own = (Array.isArray(n?.transform) && n.transform.length === 6 ? n.transform : [1, 0, 0, 1, 0, 0]) as Matrix;
    const parent = n && n.parent != null && raw[String(n.parent)] && raw[String(n.parent)].type !== "page" ? matrix(String(n.parent)) : null;
    const m = parent ? multiply(parent, own) : own;
    absolute.set(id, m);
    return m;
  };

  const build = (id: string): Raw | null => {
    if (made.has(id)) return made.get(id)!;
    const n = raw[id];
    if (!n) return null;
    const type = TYPES[n.type] || String(n.type || "").toUpperCase();
    const w = Number(n.width) || 0, h = Number(n.height) || 0;
    const own = (Array.isArray(n.transform) && n.transform.length === 6 ? n.transform : [1, 0, 0, 1, 0, 0]) as Matrix;
    const node: Raw = { id, type, name: String(n.name ?? ""), visible: n.visible !== false, opacity: n.opacity ?? 1, x: own[4], y: own[5], width: w, height: h };
    made.set(id, node);
    if (type !== "PAGE") {
      const m = matrix(id);
      const xs = [0, w].flatMap((x) => [0, h].map((y) => m[0] * x + m[2] * y + m[4]));
      const ys = [0, w].flatMap((x) => [0, h].map((y) => m[1] * x + m[3] * y + m[5]));
      node.absoluteBoundingBox = { x: Math.min(...xs), y: Math.min(...ys), width: Math.max(...xs) - Math.min(...xs), height: Math.max(...ys) - Math.min(...ys) };
    }
    const bound = n.bound || {};
    node.fills = (n.fills || []).map((p: Raw, i: number) => paint(p, i === 0 ? bound.fill ?? bound["fills/0/color"] : bound[`fills/${i}/color`]));
    node.strokes = (n.strokes || []).map((p: Raw, i: number) => paint(p, i === 0 ? bound.stroke ?? bound["strokes/0/color"] : bound[`strokes/${i}/color`]));
    node.effects = (n.effects || []).map((e: Raw) => ({ type: EFFECTS[e.type] || String(e.type || "").toUpperCase(), visible: e.visible !== false }));
    const styles = n.styles || {};
    node.effectStyleId = styles.effect || "";
    node.fillStyleId = styles.fill || "";
    const radii: number[] = n.corners && Array.isArray(n.corners.radii) ? n.corners.radii : [];
    node.cornerRadius = radii.length && radii.some((r) => r !== radii[0]) ? MIXED : radii[0] || 0;
    node.clipsContent = !!n.clip;
    const mode = n.layout && n.layout.mode;
    node.layoutMode = mode === "vertical" ? "VERTICAL" : mode === "horizontal" ? "HORIZONTAL" : mode === "grid" ? "GRID" : "NONE";
    if (node.layoutMode !== "NONE") {
      const pad = Array.isArray(n.layout.padding) ? n.layout.padding : [0, 0, 0, 0];
      Object.assign(node, { itemSpacing: n.layout.gap || 0, paddingTop: pad[0], paddingRight: pad[1], paddingBottom: pad[2], paddingLeft: pad[3] });
      const bv: Raw = {};
      for (const k of ["gap", "itemSpacing"]) if (bound[k]) bv.itemSpacing = { id: bound[k] };
      for (const k of ["padding", "paddingTop", "paddingLeft"]) if (bound[k]) { bv.paddingTop = { id: bound[k] }; bv.paddingLeft = { id: bound[k] }; }
      node.boundVariables = bv;
    }
    if (n.child_layout && n.child_layout.absolute) node.layoutPositioning = "ABSOLUTE";
    if (type === "TEXT") {
      const st = n.style || {};
      node.characters = String(n.characters ?? "");
      node.fontSize = typeof st.font_size === "number" ? st.font_size : MIXED;
      node.fontName = { family: st.font_family || "", style: st.font_style || "" };
      node.textCase = st.case === "upper" ? "UPPER" : st.case === "lower" ? "LOWER" : st.case === "title" ? "TITLE" : "ORIGINAL";
      node.textStyleId = styles.text || st.style_id || "";
    }
    node.annotations = (n.annotations || []).map((a: Raw) => ({ label: a.label, categoryId: a.category }));
    if (type === "INSTANCE") {
      const src = n.component ?? n.source;
      node.getMainComponentAsync = async () => (src != null ? build(String(src)) : null);
    }
    if (n.parent != null && raw[String(n.parent)]) Object.defineProperty(node, "parent", { get: () => build(String(n.parent)), enumerable: false });
    if (Array.isArray(n.children)) {
      node.children = n.children.map((c: unknown) => build(String(c))).filter(Boolean);
      node.findAll = (fn: (x: Raw) => boolean) => { const out: Raw[] = []; const go = (m: Raw) => { for (const c of m.children || []) { if (fn(c)) out.push(c); go(c); } }; go(node); return out; };
      node.findOne = (fn: (x: Raw) => boolean) => node.findAll(fn)[0] || null;
    }
    return node;
  };

  const pages = (doc.pages || Object.keys(raw).filter((k) => raw[k].type === "page")).map((p: unknown) => build(String(p))).filter(Boolean) as Raw[];
  const current = pages.find((p) => p.id === String(doc.current_page)) || pages[0] || { name: "", children: [] };
  const cats = (doc.annotation_categories || []).map((k: Raw) => ({ id: k.id, label: k.name ?? k.label }));
  const figma: Raw = {
    root: { children: pages },
    currentPage: current,
    setCurrentPageAsync: async (p: Raw) => { figma.currentPage = p; },
    annotations: { getAnnotationCategoriesAsync: async () => cats },
  };
  return figma;
}
