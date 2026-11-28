# Dialog (modal)

Part of `knowledge/design-system.md` (component catalog). Usually looks like: a fixed inset-0 overlay (bg-black/50) holding a centred panel; on mobile often a bottom sheet.

**Job**: ask for a decision or short input that must happen before the person goes on: confirm a delete, pick
an option, sign in. Not for long content or a whole flow (use a page), and not for a passing message (Toast).

**Anatomy**: overlay, panel, title, body, actions (one primary, one way out), close button.

**Variants**: confirm, form, alert dialog (destructive or irreversible), full-screen or bottom sheet on mobile.

**States**: closed, opening, open, submitting (the primary shows progress, the dialog stays), error (shown inside,
input kept), closing.

**Behaviour**: opens from a control, closes with Esc, the close button, and the cancel action; the overlay click
closes only when nothing would be lost. A destructive confirm names what will be lost (RX-IX-04, RX-IX-14).

**Accessibility**: `role="dialog"` (`alertdialog` for a destructive confirm), `aria-modal="true"`, labelled by its
title; focus moves inside on open, stays inside, and returns to the opener on close (RX-A11Y-03); the page behind
does not scroll.

**Common mistakes**: no way to close on mobile; focus left on the page behind; a second dialog on top of the first;
each screen building its own overlay and panel.
