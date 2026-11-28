// Component catalog: one short file per common component, read only when a task makes, refactors, or checks that
// component (from `ryux components --inventory`, a scan message, or the index in knowledge/design-system.md).
// Written for RYUX; keyboard behaviour follows the WAI-ARIA Authoring Practices patterns, described in our own words.

export interface CatalogEntry {
  id: string;
  name: string;
  /** How a copy of it usually looks in code, so an agent can tell it from a plain box. */
  looksLike: string;
  body: string;
}

export const COMPONENT_CATALOG: CatalogEntry[] = [
  {
    id: "button",
    name: "Button",
    looksLike: "a <button> (or a link styled as one) with a fill or border, a radius, and padding",
    body: `**Job**: start an action on this page. Going to another page is a link, even when it looks like a button.
Not for: a choice between options (a segmented control or radio), or a tag (Badge).

**Anatomy**: label (a verb that says what happens, RX-CD-12), optional leading icon, optional loading indicator.

**Variants**: one primary per view (RX-PR-03), secondary, quiet (ghost), destructive. Sizes as variants of one
component, never a copy per size. One corner radius across all of them (RX-DS-02).

**States**: default, hover, focus-visible, pressed, disabled, loading. Loading keeps the width and the label's
place and blocks a second press; disabled says why nearby, or the button stays enabled and the press explains.

**Behaviour**: \`type="button"\` unless it submits a form; Enter and Space press it. An action that takes time shows
progress and then its result or its failure (RX-IX-01). It never does nothing (RX-QA-08).

**Accessibility**: a native <button>; an icon-only button has an accessible name; target at least 24×24 px, 44×44 on
touch (RX-A11Y-02); a focus ring that shows against both the fill and the page (RX-A11Y-03).

**Common mistakes**: a <div onClick>; two filled buttons side by side; a copy per screen with its own padding;
\`disabled\` passed but never styled; no focus style.`,
  },
  {
    id: "field",
    name: "Field (Input, Select, Textarea)",
    looksLike: "an <input>, <select>, or <textarea> with a border, a radius, and padding, usually with a label above",
    body: `**Job**: take one value from the person. The component is the field, not the bare control: label, control,
hint, and error travel together.

**Anatomy**: visible label tied to the control (RX-FM-01), the control, optional hint, error message, optional
prefix or suffix (Rp, a unit, a show-password toggle).

**Variants**: text, email, tel, number-like (amounts, codes), password, select, multi-line. Sizes as variants.

**States**: default, hover, focus-visible, filled, disabled, read-only, invalid (with the message), loading for a
value checked on the server.

**Behaviour**: the right \`type\`, \`inputmode\`, and \`autocomplete\` (RX-FM-05); validate near the field and keep what
was typed (RX-FM-03); amounts show Rp and dot thousands while typing (RX-CD-02, RX-FE-12).

**Accessibility**: \`<label for>\` or a wrapping label, never a placeholder as the only label; the error is tied with
\`aria-describedby\` and \`aria-invalid\` and announced (RX-A11Y-07); invalid is not shown by colour alone (RX-A11Y-06).

**Common mistakes**: each form styles its own inputs; \`type\` lost when copies are merged (check with
\`ryux components --verify\`); no focus style; error text in red only.`,
  },
  {
    id: "card",
    name: "Card or panel",
    looksLike: "a box with a background or border, a radius, padding, and several children (title, text, actions)",
    body: `**Job**: group the content of one thing (an order, a product, a stat) so it reads as one unit. A panel groups a
section of a page. Not every box is a card: a box with no shared content shape is layout, not a component.

**Anatomy**: optional media, title, supporting text or values, optional meta (date, status Badge), optional
actions. Decide the slots once; each use fills them.

**Variants**: plain, outlined, raised; interactive (the whole card opens the thing) or static. Density as a variant.

**States**: for an interactive card: hover, focus-visible, pressed, selected. For its data: loading (Skeleton in the
same shape), empty, error (RX-EC-01).

**Behaviour**: an interactive card has one primary target (the title link stretched over the card), and any other
action inside stays its own control. Long titles wrap or clamp; numbers and names of any length fit (RX-EC-03).

**Accessibility**: a real heading for the title; a list of cards is a list; a whole-card link does not swallow the
buttons inside it.

**Common mistakes**: the same card written again in each page with its own padding and shadow; a card inside a card
for no reason; a card with two equal actions.`,
  },
  {
    id: "alert",
    name: "Alert (inline message)",
    looksLike: "a tinted box with a border, often an icon and one or two lines (bg-red-50, bg-amber-50, bg-green-50)",
    body: `**Job**: tell the person about a state that affects what they are doing on this page: an error, a warning, a
success, or information. A message that comes and goes after an action is a Toast; one that blocks is a Dialog.

**Anatomy**: icon, title or first sentence (what happened), optional detail (why, what to do), optional action,
optional dismiss.

**Variants**: error, warning, success, info. The tone is carried by icon and words as well as colour (RX-A11Y-06).

**States**: shown, dismissed (stays dismissed for that session if it can be dismissed).

**Behaviour**: an error says what happened, why, and how to recover (RX-CD-04, RX-EC-02); it sits next to what it is
about, not at the top of a long page.

**Accessibility**: an error that appears after an action is announced (\`role="alert"\`); a status that is already on
the page when it loads needs no live region; text contrast 4.5:1 on the tint (RX-A11Y-01).

**Common mistakes**: a red box copied into each form with different reds; colour as the only signal; "Something went
wrong" with no way forward.`,
  },
  {
    id: "badge",
    name: "Badge (tag, status chip)",
    looksLike: "a small <span> with text-xs, small horizontal padding, a tint, and a full or small radius",
    body: `**Job**: label a thing with a short status or category (Lunas, Menunggu pembayaran, Baru). Not for an
action: a chip that filters is a toggle button. Not an eyebrow above a heading unless it has a real job.

**Anatomy**: text, optional dot or icon, optional count.

**Variants**: by meaning (neutral, success, warning, danger, info), not by page. One size, maybe two.

**States**: none of its own. A removable tag is a Badge with a remove button inside, and that button has states.

**Behaviour**: one or two words; the same status always has the same word and colour across the product (RX-CD-05).

**Accessibility**: the meaning is in the word, not only the colour; contrast on the tint 4.5:1; a count badge on an
icon has a name that includes the count.

**Common mistakes**: a new colour per page for the same status; a status written as a sentence; a badge used as a
button.`,
  },
  {
    id: "tabs",
    name: "Tabs (and segmented control)",
    looksLike: "a row of buttons or links in a strip (flex, gap-1, p-1, a tinted track) with one marked as current",
    body: `**Job**: switch between views of the same thing on one page. Going to another page is navigation (links), and
filtering a list is a segmented control or filter chips.

**Anatomy**: a list of tabs, a current-tab indicator, the panels.

**Variants**: underline, contained (segmented). Scrolling when the tabs do not fit on a narrow screen (RX-RD-01).

**States**: per tab: default, hover, focus-visible, selected, disabled.

**Behaviour**: one tab selected at all times; switching keeps each panel's scroll and input; the selected tab looks
chosen, not pressable (RX-UI-36).

**Accessibility**: \`role="tablist"\`, \`tab\` with \`aria-selected\` and \`aria-controls\`, \`tabpanel\`; arrow keys move
between tabs and Tab moves into the panel; a link-based nav uses \`aria-current="page"\` instead.

**Common mistakes**: tabs that are really page links; the indicator drawn in colour only; tabs that do not fit at
320 px.`,
  },
  {
    id: "dialog",
    name: "Dialog (modal)",
    looksLike: "a fixed inset-0 overlay (bg-black/50) holding a centred panel; on mobile often a bottom sheet",
    body: `**Job**: ask for a decision or short input that must happen before the person goes on: confirm a delete, pick
an option, sign in. Not for long content or a whole flow (use a page), and not for a passing message (Toast).

**Anatomy**: overlay, panel, title, body, actions (one primary, one way out), close button.

**Variants**: confirm, form, alert dialog (destructive or irreversible), full-screen or bottom sheet on mobile.

**States**: closed, opening, open, submitting (the primary shows progress, the dialog stays), error (shown inside,
input kept), closing.

**Behaviour**: opens from a control, closes with Esc, the close button, and the cancel action; the overlay click
closes only when nothing would be lost. A destructive confirm names what will be lost (RX-IX-04, RX-IX-14).

**Accessibility**: \`role="dialog"\` (\`alertdialog\` for a destructive confirm), \`aria-modal="true"\`, labelled by its
title; focus moves inside on open, stays inside, and returns to the opener on close (RX-A11Y-03); the page behind
does not scroll.

**Common mistakes**: no way to close on mobile; focus left on the page behind; a second dialog on top of the first;
each screen building its own overlay and panel.`,
  },
  {
    id: "empty-state",
    name: "Empty state",
    looksLike: "a centred block (text-center, large vertical padding) with an icon or picture, a line, and a button",
    body: `**Job**: show what belongs here when there is nothing yet, and lead to the action that fills it (RX-CD-13).
It is a state of a list, table, or page, not a page of its own.

**Anatomy**: optional picture or icon, a line that says what will appear here, optional reason, one action.

**Variants**: first use (nothing yet), no results (a search or filter found nothing: offer to clear it), cleared
(done, like an empty inbox), no access (RX-EC-07). Each says something different.

**States**: none of its own; it replaces the list's content, and loading and error are other states of the same list.

**Behaviour**: the action does the thing (create, import, clear filters), not a link to help. No results keeps the
query visible.

**Accessibility**: the line is text, not inside the picture; a decorative picture has empty alt.

**Common mistakes**: the same "No data" line for first use and no results; a big illustration with no action; an
empty state shown while the data is still loading.`,
  },
  {
    id: "icon-tile",
    name: "Icon tile",
    looksLike: "one icon inside a tinted square or circle (p-2 or p-3, bg-blue-100, rounded-lg or rounded-full)",
    body: `**Job**: give a stat, a feature, or a list item a small visual anchor. It is decoration that helps scanning; the
words beside it carry the meaning.

**Anatomy**: container, icon.

**Variants**: size (one or two), shape (one per product), tone by meaning (the same tone for the same kind of item),
never a new colour for each tile only to make a grid look varied.

**States**: none; when the tile is clickable, the item it sits in is the control.

**Behaviour**: icons in a set share stroke, size, and style (RX-UI-18, RX-UI-20).

**Accessibility**: decorative: \`aria-hidden="true"\` on the icon, since the label beside it names the item; tint and
icon colour reach 3:1 against each other for a meaningful icon.

**Common mistakes**: a rainbow of tints with no meaning; each tile written out with its own padding; mixed icon
sets.`,
  },
  {
    id: "code-block",
    name: "Code block",
    looksLike: "a dark box with font-mono and padding, holding a <pre> or <code>",
    body: `**Job**: show code, a command, or a key the person will copy. Inline code in a sentence is a different, smaller
component.

**Anatomy**: optional label (file name or language), the code, a copy button.

**Variants**: block, single command (one line with a copy button), with line numbers for long code.

**States**: copy button: default, focus-visible, copied (says so for a moment), failed.

**Behaviour**: long lines scroll inside the block, never the page (RX-RD-01); copy copies exactly the code, without
prompts or line numbers; a secret is masked until revealed.

**Accessibility**: \`<pre><code>\`; the scrolling block is reachable by keyboard; the copy button has a name and its
result is announced; contrast of syntax colours on the dark background 4.5:1.

**Common mistakes**: each docs page styling its own dark box; copy that includes the \`$\` prompt; a long command
that pushes the page sideways at 320 px.`,
  },
];

/** The index line block written into knowledge/design-system.md. */
export function catalogIndex(): string {
  const rows = COMPONENT_CATALOG.map((c) => `| ${c.name} | ${c.looksLike} | \`knowledge/design-system/${c.id}.md\` |`);
  return `## Component catalog

Before making, merging, or checking one of these components, read its file (about 1 KB each): its job, anatomy,
variants, states, behaviour, accessibility, and the mistakes copies usually carry. Read only the ones the task
touches. \`ryux components --inventory\` names the file for each group of copies it finds.

| Component | How a hand-written copy usually looks | Read |
| --- | --- | --- |
${rows.join("\n")}`;
}

export function catalogFile(c: CatalogEntry): string {
  return `# ${c.name}

Part of \`knowledge/design-system.md\` (component catalog). Usually looks like: ${c.looksLike}.

${c.body}
`;
}
