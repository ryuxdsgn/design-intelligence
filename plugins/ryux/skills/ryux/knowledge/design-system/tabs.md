# Tabs (and segmented control)

Part of `knowledge/design-system.md` (component catalog). Usually looks like: a row of buttons or links in a strip (flex, gap-1, p-1, a tinted track) with one marked as current.

**Job**: switch between views of the same thing on one page. Going to another page is navigation (links), and
filtering a list is a segmented control or filter chips.

**Anatomy**: a list of tabs, a current-tab indicator, the panels.

**Variants**: underline, contained (segmented). Scrolling when the tabs do not fit on a narrow screen (RX-RD-01).

**States**: per tab: default, hover, focus-visible, selected, disabled.

**Behaviour**: one tab selected at all times; switching keeps each panel's scroll and input; the selected tab looks
chosen, not pressable (RX-UI-36).

**Accessibility**: `role="tablist"`, `tab` with `aria-selected` and `aria-controls`, `tabpanel`; arrow keys move
between tabs and Tab moves into the panel; a link-based nav uses `aria-current="page"` instead.

**Common mistakes**: tabs that are really page links; the indicator drawn in colour only; tabs that do not fit at
320 px.
