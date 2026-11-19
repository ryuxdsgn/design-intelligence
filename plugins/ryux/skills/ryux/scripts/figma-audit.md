# RYUX Figma audit script

The canvas audit runs in two steps.

1. Copy the code block below, unchanged, as the `code` of one `use_figma` call. Set `PAGE` to the page to
   audit first ("" reads the page open in Figma). It is read-only: it changes nothing in the file and returns the
   page as JSON, only the properties the audit reads.
2. Save that JSON, exactly as returned, to a file (for example `canvas.json`) and run
   `npx @ryuxdsgn/design-intelligence audit canvas.json`. It prints the findings and the gate line for the
   Delivery Gate; `--json` prints them as JSON. Exit 1 means a fail.

Without a shell to run step 2, the canvas audit was not run: say so and why, and write the gate line as
`figma audit: not measured (<reason>)`. Never write counts the audit did not print. If the output has
`truncated`, the page was larger than the script reads at once; the gate line says the counts are partial.

It is kept in Markdown because the Claude plugin directory accepts no script files from this publisher.

```js
// RYUX Figma audit, step 1 of 2: read-only. Send this whole block as the code of one use_figma call, after setting PAGE.
// It returns the page as JSON. Save that JSON to a file, then run: npx @ryuxdsgn/design-intelligence audit <file>.json
const PAGE = ""; // the page to audit, by name ("" = the page open in Figma)
const figmaExtract = async function figmaExtract(figma, pageName) {
    const page = pageName ? figma.root.children.find((p) => p.name === pageName) : figma.currentPage;
    if (!page)
        return { error: `no page named "${pageName}"; pages: ${figma.root.children.map((p) => p.name).join(", ")}` };
    if (page !== figma.currentPage)
        await figma.setCurrentPageAsync(page);
    const LIMIT = 3000; // nodes read before the extract stops; the audit then says its counts are partial
    let count = 0;
    let cut = false;
    const mixed = (v) => typeof v === "symbol";
    const paints = (ps) => (Array.isArray(ps) ? ps.filter((p) => p.visible !== false) : []);
    const paint = (p) => {
        const o = { type: p.type };
        if (typeof p.opacity === "number" && p.opacity !== 1)
            o.opacity = p.opacity;
        if (p.type === "SOLID") {
            if (p.color)
                o.color = { r: p.color.r, g: p.color.g, b: p.color.b };
            if (p.boundVariables && p.boundVariables.color)
                o.boundVariables = { color: true };
        }
        if (p.type === "IMAGE" && p.imageHash)
            o.imageHash = p.imageHash;
        return o;
    };
    const hasComponents = (n) => "findOne" in n && !!n.findOne((m) => m.type === "COMPONENT" || m.type === "COMPONENT_SET");
    const read = async (n) => {
        count++;
        const o = { type: n.type, name: n.name };
        if (n.visible === false)
            o.visible = false;
        if (typeof n.opacity === "number" && n.opacity !== 1)
            o.opacity = n.opacity;
        const b = n.absoluteBoundingBox || { x: n.x, y: n.y, width: n.width, height: n.height };
        Object.assign(o, { x: b.x, y: b.y, width: b.width, height: b.height });
        if (mixed(n.fills))
            o.fills = { $mixed: true };
        else if (paints(n.fills).length)
            o.fills = paints(n.fills).map(paint);
        if (paints(n.strokes).length)
            o.strokes = paints(n.strokes).map((p) => ({ type: p.type }));
        if (paints(n.effects).length)
            o.effects = paints(n.effects).map((x) => ({ type: x.type }));
        if (n.effectStyleId)
            o.effectStyleId = true;
        const auto = n.layoutMode && n.layoutMode !== "NONE";
        if ("layoutMode" in n && (auto || "children" in n))
            o.layoutMode = n.layoutMode;
        if (auto) {
            for (const k of ["itemSpacing", "paddingLeft", "paddingTop"])
                if (n[k] > 0)
                    o[k] = n[k];
            const bv = {};
            for (const k of ["itemSpacing", "paddingLeft", "paddingTop"])
                if (n.boundVariables && n.boundVariables[k])
                    bv[k] = true;
            if (Object.keys(bv).length)
                o.boundVariables = bv;
        }
        if (n.clipsContent)
            o.clipsContent = true;
        if (typeof n.cornerRadius === "number" && n.cornerRadius > 0)
            o.cornerRadius = n.cornerRadius;
        if (Array.isArray(n.annotations) && n.annotations.length)
            o.annotations = n.annotations.map((a) => ({ categoryId: a.categoryId }));
        if (n.type === "TEXT") {
            o.characters = n.characters;
            o.fontSize = mixed(n.fontSize) ? { $mixed: true } : n.fontSize;
            if (!mixed(n.fontName) && n.fontName && n.fontName.style)
                o.fontName = { style: n.fontName.style };
            if (n.textCase === "UPPER")
                o.textCase = "UPPER";
            if (n.textStyleId === "")
                o.textStyleId = "";
        }
        if (n.type === "INSTANCE" && typeof n.getMainComponentAsync === "function") {
            const mc = await n.getMainComponentAsync().catch(() => null);
            o.mainComponent = mc ? { name: mc.parent && mc.parent.type === "COMPONENT_SET" ? mc.parent.name : mc.name } : null;
        }
        if ("children" in n) {
            o.children = [];
            for (const c of n.children) {
                if (count >= LIMIT) {
                    cut = true;
                    break;
                }
                o.children.push(await read(c));
            }
        }
        return o;
    };
    // At page level only screens are read in full; the audit needs no more than type and name of the rest.
    const top = async (n) => {
        if (n.type === "COMPONENT" || n.type === "COMPONENT_SET")
            return { type: n.type, name: n.name };
        if (n.visible === false)
            return { type: n.type, name: n.name, visible: false };
        if (hasComponents(n))
            return { type: n.type, name: n.name, children: [{ type: "COMPONENT", name: "" }] };
        if (n.type === "FRAME")
            return read(n);
        return { type: n.type, name: n.name };
    };
    const children = [];
    for (const n of page.children) {
        if (n.type !== "SECTION")
            children.push(await top(n));
        else {
            const s = { type: "SECTION", name: n.name, children: [] };
            for (const m of n.children)
                s.children.push(await top(m));
            children.push(s);
        }
    }
    let annotationCategories = null;
    try {
        annotationCategories = (await figma.annotations.getAnnotationCategoriesAsync()).map((k) => ({ id: k.id, label: k.label }));
    }
    catch (err) { }
    const out = { pages: figma.root.children.map((p) => ({ name: p.name, children: p === page ? children : [] })), current: figma.currentPage.name, page: page.name, annotationCategories };
    if (cut)
        out.truncated = { nodes: count, limit: LIMIT };
    return out;
};
return await figmaExtract(figma, PAGE);
```
