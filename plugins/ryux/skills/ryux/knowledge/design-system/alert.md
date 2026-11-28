# Alert (inline message)

Part of `knowledge/design-system.md` (component catalog). Usually looks like: a tinted box with a border, often an icon and one or two lines (bg-red-50, bg-amber-50, bg-green-50).

**Job**: tell the person about a state that affects what they are doing on this page: an error, a warning, a
success, or information. A message that comes and goes after an action is a Toast; one that blocks is a Dialog.

**Anatomy**: icon, title or first sentence (what happened), optional detail (why, what to do), optional action,
optional dismiss.

**Variants**: error, warning, success, info. The tone is carried by icon and words as well as colour (RX-A11Y-06).

**States**: shown, dismissed (stays dismissed for that session if it can be dismissed).

**Behaviour**: an error says what happened, why, and how to recover (RX-CD-04, RX-EC-02); it sits next to what it is
about, not at the top of a long page.

**Accessibility**: an error that appears after an action is announced (`role="alert"`); a status that is already on
the page when it loads needs no live region; text contrast 4.5:1 on the tint (RX-A11Y-01).

**Common mistakes**: a red box copied into each form with different reds; colour as the only signal; "Something went
wrong" with no way forward.
