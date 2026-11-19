// A Figma-like canvas (the Plugin API, or figcraftCanvas) as plain JSON, the form ryux-core's audit reads
// and fixtures/checks/audit.json records: no functions, an instance keeps its main component as data, and
// figma.mixed is {"$mixed": true}.

const plain = (v: unknown): unknown => JSON.parse(JSON.stringify(v ?? null));

type Node = Record<string, unknown> & { children?: Node[]; getMainComponentAsync?: () => Promise<Node | null> };

async function neutral(n: Node): Promise<Record<string, unknown>> {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(n)) {
    if (typeof v === "function" || k === "parent") continue;
    if (typeof v === "symbol") out[k] = { $mixed: true };
    else if (k === "children") out[k] = await Promise.all((v as Node[]).map(neutral));
    else out[k] = plain(v);
  }
  if (typeof n.getMainComponentAsync === "function") {
    const mc = await n.getMainComponentAsync().catch(() => null);
    const parent = mc?.parent as Node | undefined;
    out.mainComponent = mc ? { name: mc.name, parent: parent ? { type: parent.type, name: parent.name } : null } : null;
  }
  return out;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Canvas = any;

/** The canvas as { pages, current, page, annotationCategories }. */
export async function neutralCanvas(figma: Canvas, pageName?: string): Promise<Record<string, unknown>> {
  return {
    pages: await Promise.all(figma.root.children.map(async (p: Node) => ({ name: p.name, children: await Promise.all((p.children || []).map(neutral)) }))),
    current: figma.currentPage.name,
    page: pageName || "",
    annotationCategories: plain(await figma.annotations.getAnnotationCategoriesAsync()),
  };
}
