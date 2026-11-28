# Dropdown menu (and picker list)

Part of `knowledge/design-system.md` (component catalog). This file says what the component must do, not how it
looks: its appearance comes from DESIGN.md and the project's system. In code, a hand-written copy usually looks like:
a small floating panel (absolute, shadow, right-0 or mt-2) or a tight column (flex-col, gap-1, p-1) of rows lit on hover and focus.

**Job**: offer a short list of actions or choices from one trigger: a row's actions, an account menu, a picker
that fills a field. Not for page navigation that should stay visible (tabs or a sidebar), or a long list to search
(a combobox with typing).

**Anatomy**: trigger, panel, items (label, optional icon, optional shortcut or check), optional groups and dividers,
optional empty line ("Tidak ada yang cocok").

**Variants**: action menu, single choice (a check on the current one), picker under a text field. The panel keeps
one width rule and one item height.

**States**: closed, open; per item: default, hover, focus-visible (the same look as hover), selected, disabled.

**Behaviour**: opens from the trigger; arrow keys move between items, Enter picks, Esc closes; focus returns to the
trigger after a pick or close; a click outside closes. The panel stays on screen at 320 px (flips up or becomes a
sheet). A destructive item sits last, apart (RX-IX-04).

**Accessibility**: trigger with `aria-haspopup` and `aria-expanded`; `role="menu"` with `menuitem`s, or
`listbox` with `option`s for a picker; one item in the tab order, the rest by arrows (RX-A11Y-03).

**Common mistakes**: each picker writing its own panel and row; rows that are divs with no keyboard way; focus left
in the panel after it closes; a menu cut off at the screen's edge.
