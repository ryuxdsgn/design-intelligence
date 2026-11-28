# Empty state

Part of `knowledge/design-system.md` (component catalog). Usually looks like: a centred block (text-center, large vertical padding) with an icon or picture, a line, and a button.

**Job**: show what belongs here when there is nothing yet, and lead to the action that fills it (RX-CD-13).
It is a state of a list, table, or page, not a page of its own.

**Anatomy**: optional picture or icon, a line that says what will appear here, optional reason, one action.

**Variants**: first use (nothing yet), no results (a search or filter found nothing: offer to clear it), cleared
(done, like an empty inbox), no access (RX-EC-07). Each says something different.

**States**: none of its own; it replaces the list's content, and loading and error are other states of the same list.

**Behaviour**: the action does the thing (create, import, clear filters), not a link to help. No results keeps the
query visible.

**Accessibility**: the line is text, not inside the picture; a decorative picture has empty alt.

**Common mistakes**: the same "No data" line for first use and no results; a big illustration with no action; an
empty state shown while the data is still loading.
