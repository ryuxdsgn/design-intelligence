# RYUX Design: verify and deliver

Stage 6 of capabilities/design.md. Read it when the screens are built, not before: read earlier, it rides along in
every later step. Stages 1 to 5 are in capabilities/design.md.

6. **Verify and deliver.**
   - Facts: check every product fact on the canvas (tool and command names, integrations,
     platforms, pages, numbers) against the brief or the repo (RX-PR-02).
   - Open-rule sweep (RX-PR-02): list every rule and number nobody decided (a fee, a minimum, a
     time limit, a deadline). Start from Business rules in DESIGN.md: its Not decided list gives the
     RULES entries, its Decided list gives label: null; then add what the Assumptions, the open
     questions, and the canvas show that it does not list. When the project has a DESIGN.md, add each
     new open rule under Not decided (a context change, listed in the final message). Search the text
     of every screen for each one; in Figma, read every text node of the page. Each one shown gets its
     label on that same screen or leaves the screen; a read-me board, a notes frame, or the final
     message does not count. On the canvas the label is a Figma annotation on that node or its row
     ("Prototype rule, not decided yet: the fee"), not a chip inside the UI, which competes with the
     content; in code it is visible text beside the value. On a marketing surface (a landing page, a
     store listing, an ad), nothing on the design says sample, example, or placeholder either (RX-AS-03).
     Set the frame widths in the listing. Report it in the gate's CONTENT line.
   - Count it, do not recall it: the CONTENT numbers come from a listing of the canvas, not from
     memory, and the listing decides "labelled", not you. Every amount on a screen is a rule to place:
     an open rule (a fee, a price, a deadline), a fact the brief sets, or sample data that is not a rule;
     a fee the brief does not set (delivery, service, admin) is an open rule even when it reads like
     cart data. In Figma, write RULES in this read-only listing, one entry per open rule: words that find
     it in a row ("ongkos kirim") and a word its label must contain ("kirim"); facts and sample data get
     label: null. A rule on a screen counts as labelled only when a label beside it (in its card or row,
     or within NEAR px) contains that word (or an annotation on the text or its row whose label contains it); a
     label naming another rule does not count. The unit is one
     rule on one screen: <tagged>/<shown> is the listing's count, so a repeated value needs its label on
     each screen. Fix every unlabelled pair and every amount without a rule, then run it again: the
     listing is the last use_figma call before the gate, and any later edit means running it again.
     Elsewhere, list the same from the rendered text.

```js
const PAGE = "Page name", TAG = "Open-rule label component name", WIDTHS = [390, 360], NEAR = 48, SKIP = /^(caption|notes?)\b/i;
// One entry per open rule: words that find it in a row's text, and a word its label must contain.
// A fact the brief sets, or sample data that is not a rule, gets label: null.
const RULES = [
  { rule: "delivery fee", find: ["delivery fee", "shipping"], label: "delivery" },
  { rule: "payment deadline", find: ["pay before", "expires"], label: "deadline" },
  { rule: "sample amounts", find: ["subtotal", "total"], label: null },
];
const MONEY = /(Rp|IDR|US\$|\$|€|£|¥)\s?\d|\d\s?(%|IDR|USD|EUR)\b/i;
const page = figma.root.children.find((p) => p.name === PAGE); await page.loadAsync();
const tagIds = new Set(); // findAll, not findAllWithCriteria: that one skips instances nested in instances
for (const n of page.findAll((x) => x.type === "INSTANCE")) {
  const mc = await n.getMainComponentAsync();
  if ((mc?.parent?.type === "COMPONENT_SET" ? mc.parent.name : mc?.name) === TAG) tagIds.add(n.id);
}
const up = (n, f) => { for (let p = n; p && p.type !== "PAGE"; p = p.parent) if (f(p)) return true; return false; };
const gap = (a, b) => Math.hypot(Math.max(0, a.x - b.x - b.width, b.x - a.x - a.width), Math.max(0, a.y - b.y - b.height, b.y - a.y - a.height));
const texts = (n) => n.findAll((t) => t.type === "TEXT");
const isScreen = (n) => n.type === "FRAME" && WIDTHS.includes(Math.round(n.width)) && n.height >= 100 && !SKIP.test(n.name);
const screens = page.findAll((n) => isScreen(n) && !up(n.parent, isScreen));
const pairs = new Map(), noRule = [];
for (const s of screens) {
  const tags = s.findAll((n) => tagIds.has(n.id) && !up(n, (p) => p.visible === false));
  for (const t of texts(s)) {
    if (up(t, (p) => p.visible === false || tagIds.has(p.id))) continue;
    const sib = t.parent && t.parent !== s ? texts(t.parent) : [];
    const row = (sib.length && sib.length <= 4 ? sib.map((x) => x.characters).join(" ") : t.characters).toLowerCase();
    const hit = RULES.filter((r) => r.find.some((w) => row.includes(w.toLowerCase())));
    if (!hit.length) { if (MONEY.test(t.characters)) noRule.push(s.name + " | " + t.characters.slice(0, 40)); continue; }
    // Labels beside it: in the smallest group around it that holds a label, or within NEAR px.
    let group = null;
    for (let p = t.parent; p && p !== s; p = p.parent) if (tags.some((g) => up(g, (q) => q === p))) { group = p; break; }
    const beside = tags.filter((g) => (group && up(g, (q) => q === group)) || gap(t.absoluteBoundingBox, g.absoluteBoundingBox) <= NEAR)
      .map((g) => texts(g).map((x) => x.characters).join(" ").toLowerCase());
    // An annotation on the text or a parent inside the screen labels it.
    const notes = [];
    for (let p = t; p && p !== s; p = p.parent) for (const a of p.annotations || []) notes.push(((a.label || "") + " " + (a.labelMarkdown || "")).toLowerCase());
    for (const r of hit) {
      if (r.label === null) continue;
      const key = s.name + " | " + r.rule, ok = beside.some((b) => b.includes(r.label.toLowerCase())) || notes.some((b) => b.includes(r.label.toLowerCase()));
      const p = pairs.get(key) || { ok: false, seen: [] };
      p.ok = p.ok || ok; if (!ok && p.seen.length < 2) p.seen.push(t.characters.slice(0, 40) + " ← " + (beside.join(" / ").slice(0, 60) || "no label beside"));
      pairs.set(key, p);
    }
  }
}
// Unit: one rule on one screen. Labelled when a label naming it sits beside it there.
const all = [...pairs], ok = all.filter(([, p]) => p.ok).length;
return { screens: screens.length, count: ok + "/" + all.length, unlabelled: all.filter(([, p]) => !p.ok).map(([k, p]) => k + " · " + p.seen.join(" · ")), amountsWithoutRule: noRule };
```
   - Library listing (RX-DS-01): in Figma, count from the canvas, not from memory, what the screen takes from the library:
     instances of library components, instances of local ones, the `Local/` components created in this run and whether each
     carries its mark, and frames drawn by hand under the name of a component the inventory has (a redraw). Fill KNOWN from
     the inventory. Fix: replace each redraw with an instance, mark each unmarked local component, then run it again.
     Report the numbers in the DESIGN SYSTEM line; redrawn is 0, or each one is explained there.

```js
const PAGE = "Page name", KNOWN = ["button", "input", "card"], LOCAL = /^Local\//, MARK = /^Not in the library yet/i;
await figma.loadAllPagesAsync();
const page = figma.root.children.find((p) => p.name === PAGE);
const names = new Set(KNOWN.map((k) => k.toLowerCase())), leaf = (n) => n.split("/").pop().trim().toLowerCase();
let lib = 0, local = 0;
for (const n of page.findAll((x) => x.type === "INSTANCE")) {
  const mc = await n.getMainComponentAsync(); if (!mc) continue;
  names.add(leaf(mc.parent?.type === "COMPONENT_SET" ? mc.parent.name : mc.name));
  if (mc.remote) lib++; else local++;
}
const created = figma.root.findAllWithCriteria({ types: ["COMPONENT", "COMPONENT_SET"] }).filter((c) => LOCAL.test(c.name))
  .map((c) => c.name + ((c.annotations ?? []).some((a) => MARK.test(a.label ?? "")) ? "" : " · unmarked"));
const redrawn = page.findAll((x) => x.type === "FRAME" && names.has(leaf(x.name))).map((x) => x.name);
return { libraryInstances: lib, localInstances: local, newLocal: [...created], redrawn };
```
   - Design system listing (RX-UI-15, RX-DS-06): in Figma, the DESIGN SYSTEM numbers also come from a
     read-only listing, not from memory. It measures what a look at the render misses: the stroke an icon
     ends up with after it was scaled (a 24 px icon at 1.75 scaled to 16 px draws 1.17), every icon
     colour, an icon whose colour changes in the same place (a row's icons grey, one ink), a variant that
     changes size with its state (78 against 80 px moves the layout when it is picked), and property
     combinations with no variant. Fix, then run
     it again before the gate: resize icons, never scale them (or draw a master per size); give icons
     colours from variables only; make the variants of one set the same size; draw each missing
     combination or write why it is not needed. Elsewhere, measure the same from the code or the render.

```js
const PAGE = "Page name", ICON = /^icons?[\/ ]/i, STATE = /state|status|selected|checked|active|pressed|disabled/i;
const page = figma.root.children.find((p) => p.name === PAGE); await page.loadAsync();
const hex = (c) => "#" + [c.r, c.g, c.b].map((v) => Math.round(v * 255).toString(16).padStart(2, "0")).join("");
const strokes = {}, colours = {}, unbound = new Set(), byPlace = new Map(), offCenter = new Set();
for (const n of page.findAll((x) => x.type === "INSTANCE")) {
  const mc = await n.getMainComponentAsync();
  const name = mc?.parent?.type === "COMPONENT_SET" ? mc.parent.name : mc?.name;
  if (!name || !ICON.test(name)) continue;
  const own = new Set();
  for (const v of n.findAll((x) => "strokes" in x && x.visible)) {
    if (v.strokes.length && typeof v.strokeWeight === "number") { const w = +v.strokeWeight.toFixed(2); strokes[w] = (strokes[w] || 0) + 1; }
    for (const p of [...v.strokes, ...(v.fills || [])]) if (p.type === "SOLID" && p.visible !== false) {
      const h = hex(p.color); colours[h] = (colours[h] || 0) + 1; own.add(h); if (!p.boundVariables?.color) unbound.add(h);
    }
  }
  // Where the icon sits: the variant of the nearest component around it, and its parent layer.
  let place = n.parent.name;
  for (let p = n.parent; p && p.type !== "PAGE"; p = p.parent) if (p.type === "INSTANCE" || p.type === "COMPONENT") { place = (p.type === "INSTANCE" ? (await p.getMainComponentAsync())?.name : p.name) || place; break; }
  // A hidden icon (no visible paint) has no colour to compare.
  const k = place + " · " + n.parent.name; if (own.size) { if (!byPlace.has(k)) byPlace.set(k, new Set()); byPlace.get(k).add([...own].sort().join("+")); }
  // The glyph inside the icon's box: its visible shapes, centered within half a pixel.
  const box = n.absoluteBoundingBox, shapes = n.findAll((x) => x.visible && x.absoluteBoundingBox && !["FRAME", "GROUP", "INSTANCE", "COMPONENT"].includes(x.type)).map((x) => x.absoluteBoundingBox);
  if (box && shapes.length) {
    const l = Math.min(...shapes.map((r) => r.x)), t = Math.min(...shapes.map((r) => r.y)), r = Math.max(...shapes.map((r) => r.x + r.width)), b = Math.max(...shapes.map((r) => r.y + r.height));
    const dx = (l + r) / 2 - (box.x + box.width / 2), dy = (t + b) / 2 - (box.y + box.height / 2);
    if (Math.abs(dx) > 0.5 || Math.abs(dy) > 0.5) offCenter.add(name + " (" + dx.toFixed(1) + ", " + dy.toFixed(1) + " px)");
  }
}
const mixed = [...byPlace].filter(([, s]) => s.size > 1).map(([k, s]) => k + ": " + [...s].join(" / "));
const uneven = [], missing = [];
for (const set of page.findAll((x) => x.type === "COMPONENT_SET")) {
  const props = Object.entries(set.variantGroupProperties || {});
  const val = (v) => Object.fromEntries(v.name.split(", ").map((kv) => kv.split("=")));
  // A state property: named like one, or true/false. Variants equal in every other property must be the same size.
  for (const [prop] of props.filter(([k, { values }]) => STATE.test(k) || values.every((x) => /^(true|false)$/.test(x)))) {
    const groups = new Map();
    for (const v of set.children) { const o = val(v); delete o[prop]; const g = JSON.stringify(o); if (!groups.has(g)) groups.set(g, []); groups.get(g).push(v); }
    for (const vs of groups.values()) for (const k of ["width", "height"]) { const z = [...new Set(vs.map((v) => Math.round(v[k])))]; if (z.length > 1) uneven.push(set.name + " " + k + " " + z.join("/") + " across " + prop); }
  }
  const have = new Set(set.children.map((v) => v.name.split(", ").sort().join(", ")));
  const combos = props.reduce((acc, [k, { values }]) => acc.flatMap((c) => values.map((v) => [...c, k + "=" + v])), [[]]);
  for (const c of combos) if (!have.has([...c].sort().join(", "))) missing.push(set.name + ": " + c.join(", "));
}
return { iconStrokes: strokes, iconColours: colours, unbound: [...unbound], mixedInOnePlace: mixed, offCenterIcons: [...offCenter], unevenSets: uneven, missingVariants: missing };
```
   - Passes when: one icon stroke (or one per drawn master size, written down), every icon colour on a
     variable and one colour per role (no two greys doing one job), one colour for the icons in one
     place unless the state changes it, no icon whose glyph is off the center of its box, no uneven set, and every missing variant drawn or written off. Report it in the DESIGN SYSTEM line.
   - Canvas copy is for the team, not for RYUX: annotations, state captions, and labels use plain
     language ("Shown while prices load; button disabled"). Rule IDs, gate results, and Decision
     Receipts go in the Design Direction or the final message, never in frames meant for review or
     handoff.
   - Handoff: a handoff frame annotates, in plain language, the interaction behaviour, any motion
     as a spec (RX-UI-11: trigger, properties, duration in ms, easing, what reduced motion shows),
     the truncation rule for each text that can overflow, and each component's code name.
   - Test plan: for a new flow or a consequential change, write the usability test plan (RX-UX-12);
     skip it for a small change or when the user says so. Suggest that the team watch the sessions,
     so what users show becomes shared knowledge rather than one person's report.
   - Rationale (RX-PR-14): five to seven lines, one per shaping decision (direction and concept,
     weight carrier, section order, palette, type, where the primary action sits, what was cut):
     decision → because (user, brief, or evidence, with its strength) → principle → cost → would change
     if. The principle is a UX principle by name and how it works on this screen ("Hick's law: one
     decision per step, so the service comes before the time slot"): a law of UX (the table in
     knowledge/ux.md), a Nielsen heuristic, a Gestalt principle, or the platform's convention;
     say where it stops applying when that matters. A RYUX rule ID, name, or title ("one-way door", "full
     cost before commitment") is not a principle: name the principle behind it (Nielsen's user control
     and freedom, visibility of system status) and put the ID after. The line on what was cut names a principle too (aesthetic and minimalist design, or the design
     principle that ruled it out). A line with a cost trades one value for another (speed against clarity,
     density against calm): name the design principle, from DESIGN.md or the brief, that decided it. A cost
     that a decided fact forced (a price known only after the check) names that fact in place of the
     design principle; the UX principle stays on the line. With neither,
     say so and call it a judgment call (evidence None). It goes in the final message,
     before the gate.
   - Annotations on the canvas: when the design is made in a design tool (Figma, pen.dev, Penpot,
     Framer, or another), annotate three to five of those decisions beside the frames, in plain
     language, one or two sentences each: what was decided, why, and the UX principle behind it by
     name ("The main button sits low, in thumb reach: Fitts's law, a large target close to the thumb
     is quicker to press"), in the language of the design's copy, for the person who opens the file
     without the chat. Use the tool's own annotations, attached to the node each note explains:
     in Figma, native annotations in a "Design rationale" category
     (figma.annotations.addAnnotationCategoryAsync, then node.annotations); in another tool, look
     for its annotation or comment feature first. Only when the tool has none, a "Why it looks like
     this" frame next to the design, outside the frames for review. No rule IDs,
     evidence codes, or gate results in them. The final message says how many annotations there
     are, on which frames, and how to see them (in Figma, native annotations show in Dev Mode,
     Shift+D: select a frame or layer).
   - Placeholders: every stand-in for a real asset (a sample QR code, a map, a product photo, a logo
     slot, a barcode, an avatar) carries a native annotation in a "Placeholder" category, attached to
     that node: what it stands for, what replaces it, and where that comes from ("Sample QR. Replace with
     the code the payment provider returns for this order"). The note lives in the annotation, not as
     text inside the UI; the screen shows the asset as it will look. In another tool, use its annotation
     or comment feature. List the placeholders in the final message.
   - In Figma, audit the page before the gate. When the shell has FIGMA_TOKEN (test it with `[ -n "$FIGMA_TOKEN" ]`; never
     print it), run `npx --no-install @ryuxdsgn/design-intelligence audit "<the file's link>" --page <page>`: it reads the
     page over Figma's REST API and returns only the findings and the gate line. REST has no annotations, so the gate says
     "annotations unreadable"; give the count from the annotations you made. Otherwise send the code block in
     scripts/figma-audit.md from this skill's folder, unchanged, as the code of one use_figma call (set PAGE to the flow's
     page). Both read the canvas and count content images and their reuse,
     contrast, text cut by a bar or clipped, targets, overlays with no lift, a busy screen whose button keeps its idle
     label, unstyled text and unbound values, screens not built in auto layout and layers left outside them, empty bands,
     small uppercase labels, section cards, text under 12 px, text sizes 1 px apart, uneven buttons in a row, and annotations. Fix each fail, fix
     each warn or give the reason it stays, run it once more, and copy its last gate line into VISUAL QA; the gate's numbers
     come from it, not from memory. In FigCraft, save the file and run `npx --no-install @ryuxdsgn/design-intelligence audit <file>
     --page <page>` instead: the same checks on the saved .figcraft (it needs figcraft-cli). When neither this skill's bin/ nor
     the project has a copy of RYUX, or the command is not permitted, do not run it another way; check by hand with inspect_document before
     the gate instead: each text whose absoluteBounds reach past a clipping frame above it or past its screen, each text
     under 12 px, and each text colour against the fill behind it (4.5:1, or 3:1 from 24 px or 18.66 px bold); fix what
     fails. VISUAL QA then says it was checked by hand, that the other audit checks did not run and why, and names
     `ryux install --save-dev` so the user can add the audit.
   - Close with the Delivery Gate, saying what was not designed, such as other widths or states. If
     you wrote DESIGN.md, say so in the final message: which file, and each change as old → new ("(none) → …" for
     an added line).
   - Corrections: a correction the user makes for this product (copy, a pattern, a visual choice) goes
     into DESIGN.md, in the section it touches, with the date and their words, so the next session keeps
     it; it does not change RYUX for other products.

Do not hand off a design as "final" with placeholder or invented content.
