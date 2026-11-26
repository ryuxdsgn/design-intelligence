// A Figma file read over the REST API, seen through the slice of the Plugin API the audit reads, so
// `ryux audit --figma <url>` judges the page in Rust without the in-Figma script and the model sees only the gate.
// Read-only: GET /v1/files/:key?depth=1 for the pages, then GET /v1/files/:key/nodes?ids=<page> for one page.
// The token comes from FIGMA_TOKEN and is sent only to api.figma.com. REST carries no annotations, so the gate says
// "annotations unreadable"; count them by eye or with the in-Figma script.

// eslint-disable-next-line @typescript-eslint/no-explicit-any -- the REST API's node JSON, mapped field by field below
type Raw = any;

const MIXED = Symbol("mixed");
const API = "https://api.figma.com/v1";

/** The file key and node id in a Figma link, or a bare key. */
export function parseFigmaUrl(input: string): { key: string; node: string | null } | null {
  const m = input.match(/figma\.com\/(?:design|file|proto)\/([A-Za-z0-9]+)(?:\/branch\/([A-Za-z0-9]+))?[^?]*(?:\?(.*))?$/);
  if (m) {
    const params = new URLSearchParams(m[3] || "");
    const node = params.get("node-id");
    return { key: m[2] || m[1], node: node ? node.replace(/-/g, ":") : null };
  }
  return /^[A-Za-z0-9]{15,}$/.test(input) ? { key: input, node: null } : null;
}

function paint(p: Raw): Raw {
  const visible = p.visible !== false;
  const opacity = typeof p.opacity === "number" ? p.opacity : 1;
  if (p.type === "SOLID") {
    const c = p.color || { r: 0, g: 0, b: 0, a: 1 };
    const bound = p.boundVariables && p.boundVariables.color;
    return { type: "SOLID", visible, color: { r: c.r, g: c.g, b: c.b }, opacity: opacity * (c.a ?? 1), ...(bound ? { boundVariables: { color: { id: bound.id } } } : {}) };
  }
  if (p.type === "IMAGE") return { type: "IMAGE", visible, opacity, imageHash: String(p.imageRef ?? p.gifRef ?? "image") };
  return { type: String(p.type || ""), visible, opacity };
}

const alias = (v: Raw): Raw => (Array.isArray(v) ? v.map(alias) : v && typeof v === "object" && v.id ? { id: v.id } : v);

function build(n: Raw, comps: Record<string, Raw>, sets: Record<string, Raw>): Raw {
  const b = n.absoluteBoundingBox;
  const node: Raw = { id: n.id, type: n.type, name: String(n.name ?? ""), visible: n.visible !== false, opacity: typeof n.opacity === "number" ? n.opacity : 1 };
  if (b) Object.assign(node, { x: b.x, y: b.y, width: b.width, height: b.height, absoluteBoundingBox: { x: b.x, y: b.y, width: b.width, height: b.height } });
  node.fills = (Array.isArray(n.fills) ? n.fills : []).map(paint);
  node.strokes = (Array.isArray(n.strokes) ? n.strokes : []).map(paint);
  node.effects = (Array.isArray(n.effects) ? n.effects : []).map((e: Raw) => ({ type: String(e.type || ""), visible: e.visible !== false }));
  const styles = n.styles || {};
  node.effectStyleId = styles.effect || "";
  node.fillStyleId = styles.fill || "";
  const radii: number[] = Array.isArray(n.rectangleCornerRadii) ? n.rectangleCornerRadii : [];
  node.cornerRadius = radii.length && radii.some((r) => r !== radii[0]) ? MIXED : radii[0] ?? n.cornerRadius ?? 0;
  node.clipsContent = !!n.clipsContent;
  node.layoutMode = n.layoutMode || "NONE";
  if (node.layoutMode !== "NONE") {
    Object.assign(node, { itemSpacing: n.itemSpacing || 0, paddingTop: n.paddingTop || 0, paddingRight: n.paddingRight || 0, paddingBottom: n.paddingBottom || 0, paddingLeft: n.paddingLeft || 0 });
  }
  const bv: Raw = {};
  for (const [k, v] of Object.entries(n.boundVariables || {})) bv[k] = alias(v);
  node.boundVariables = bv;
  if (n.layoutPositioning === "ABSOLUTE") node.layoutPositioning = "ABSOLUTE";
  if (n.type === "TEXT") {
    const st = n.style || {};
    // a style override on some characters makes the property mixed, as the Plugin API reports it
    const used = new Set((n.characterStyleOverrides || []).filter((k: number) => k !== 0).map(String));
    const over = Object.entries(n.styleOverrideTable || {}).filter(([k]) => used.has(k)).map(([, v]) => v as Raw);
    const differs = (k: string) => over.some((o) => o[k] !== undefined && o[k] !== st[k]);
    node.characters = String(n.characters ?? "");
    node.fontSize = differs("fontSize") ? MIXED : typeof st.fontSize === "number" ? st.fontSize : MIXED;
    node.fontName = differs("fontFamily") || differs("fontStyle") ? MIXED : { family: st.fontFamily || "", style: st.fontStyle || "" };
    node.textCase = st.textCase || "ORIGINAL";
    node.textStyleId = styles.text || "";
    if (differs("fills")) node.fills = MIXED;
  }
  if (n.type === "INSTANCE") {
    const mc = comps[n.componentId];
    const set = mc && mc.componentSetId ? sets[mc.componentSetId] : null;
    node.mainComponent = mc ? { name: mc.name, parent: set ? { type: "COMPONENT_SET", name: set.name } : null } : null;
  }
  if (Array.isArray(n.children)) node.children = n.children.map((c: Raw) => build(c, comps, sets));
  return node;
}

async function get(path: string, token: string): Promise<Raw> {
  const res = await fetch(`${API}${path}`, { headers: { "X-Figma-Token": token } });
  const body: Raw = await res.json().catch(() => ({}));
  if (res.status === 429) throw new Error(`Figma rate limit; try again in ${res.headers.get("retry-after") || "a minute"} s`);
  if (res.status === 403) throw new Error("Figma refused the token (403): check FIGMA_TOKEN and that it can read this file");
  if (res.status === 404) throw new Error("Figma has no such file for this token (404)");
  if (!res.ok) throw new Error(`Figma answered ${res.status}: ${body.err || body.message || "no detail"}`);
  return body;
}

/** The Figma-like `figma` object the audit takes, holding the one page asked for (by name, by a node id in the link,
 *  or the only page), read over REST. */
export async function figmaRestCanvas(input: string, pageName: string, token: string): Promise<{ figma: Raw; page: string }> {
  const ref = parseFigmaUrl(input);
  if (!ref) throw new Error(`not a Figma link or file key: ${input}`);
  const file = await get(`/files/${ref.key}?depth=1`, token);
  const pages: Raw[] = (file.document && file.document.children) || [];
  let page = pageName ? pages.find((p) => p.name === pageName) : ref.node ? pages.find((p) => p.id === ref.node) : pages.length === 1 ? pages[0] : null;
  if (!page && ref.node && !pageName) {
    // a frame's link: find the page that holds it
    const hit = await get(`/files/${ref.key}/nodes?ids=${encodeURIComponent(ref.node)}&depth=1`, token);
    const doc = hit.nodes && hit.nodes[ref.node];
    if (doc) for (const p of pages) {
      const probe = await get(`/files/${ref.key}/nodes?ids=${encodeURIComponent(p.id)}&depth=1`, token);
      const kids: Raw[] = (probe.nodes[p.id] && probe.nodes[p.id].document.children) || [];
      if (kids.some((k) => k.id === ref.node)) { page = p; break; }
    }
  }
  if (!page) throw new Error(`name the page with --page; pages: ${pages.map((p) => p.name).join(", ")}`);
  const res = await get(`/files/${ref.key}/nodes?ids=${encodeURIComponent(page.id)}`, token);
  const entry = res.nodes && res.nodes[page.id];
  if (!entry) throw new Error(`Figma returned no page ${page.name}`);
  const built = build(entry.document, entry.components || {}, entry.componentSets || {});
  const figma: Raw = {
    root: { children: pages.map((p) => (p.id === page.id ? built : { name: p.name, children: [] })) },
    currentPage: built,
    annotations: { getAnnotationCategoriesAsync: async () => null },
  };
  return { figma, page: page.name };
}
