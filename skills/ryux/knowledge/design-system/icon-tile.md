# Icon tile

Part of `knowledge/design-system.md` (component catalog). Usually looks like: one icon inside a tinted square or circle (p-2 or p-3, bg-blue-100, rounded-lg or rounded-full).

**Job**: give a stat, a feature, or a list item a small visual anchor. It is decoration that helps scanning; the
words beside it carry the meaning.

**Anatomy**: container, icon.

**Variants**: size (one or two), shape (one per product), tone by meaning (the same tone for the same kind of item),
never a new colour for each tile only to make a grid look varied.

**States**: none; when the tile is clickable, the item it sits in is the control.

**Behaviour**: icons in a set share stroke, size, and style (RX-UI-18, RX-UI-20).

**Accessibility**: decorative: `aria-hidden="true"` on the icon, since the label beside it names the item; tint and
icon colour reach 3:1 against each other for a meaningful icon.

**Common mistakes**: a rainbow of tints with no meaning; each tile written out with its own padding; mixed icon
sets.
