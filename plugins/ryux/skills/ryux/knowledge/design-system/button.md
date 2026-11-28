# Button

Part of `knowledge/design-system.md` (component catalog). This file says what the component must do, not how it
looks: its appearance comes from DESIGN.md and the project's system. In code, a hand-written copy usually looks like:
a <button> (or a link styled as one) with a fill or border, a radius, and padding.

**Job**: start an action on this page. Going to another page is a link, even when it looks like a button.
Not for: a choice between options (a segmented control or radio), or a tag (Badge).

**Anatomy**: label (a verb that says what happens, RX-CD-12), optional leading icon, optional loading indicator.

**Variants**: one primary per view (RX-PR-03), secondary, quiet (ghost), destructive. Sizes as variants of one
component, never a copy per size. One corner radius across all of them (RX-DS-02).

**States**: default, hover, focus-visible, pressed, disabled, loading. Loading keeps the width and the label's
place and blocks a second press; disabled says why nearby, or the button stays enabled and the press explains.

**Behaviour**: `type="button"` unless it submits a form; Enter and Space press it. An action that takes time shows
progress and then its result or its failure (RX-IX-01). It never does nothing (RX-QA-08).

**Accessibility**: a native <button>; an icon-only button has an accessible name; target at least 24×24 px, 44×44 on
touch (RX-A11Y-02); a focus ring that shows against both the fill and the page (RX-A11Y-03).

**Common mistakes**: a <div onClick>; two filled buttons side by side; a copy per screen with its own padding;
`disabled` passed but never styled; no focus style.
