# Field (Input, Select, Textarea)

Part of `knowledge/design-system.md` (component catalog). Usually looks like: an <input>, <select>, or <textarea> with a border, a radius, and padding, usually with a label above.

**Job**: take one value from the person. The component is the field, not the bare control: label, control,
hint, and error travel together.

**Anatomy**: visible label tied to the control (RX-FM-01), the control, optional hint, error message, optional
prefix or suffix (Rp, a unit, a show-password toggle).

**Variants**: text, email, tel, number-like (amounts, codes), password, select, multi-line. Sizes as variants.

**States**: default, hover, focus-visible, filled, disabled, read-only, invalid (with the message), loading for a
value checked on the server.

**Behaviour**: the right `type`, `inputmode`, and `autocomplete` (RX-FM-05); validate near the field and keep what
was typed (RX-FM-03); amounts show Rp and dot thousands while typing (RX-CD-02, RX-FE-12).

**Accessibility**: `<label for>` or a wrapping label, never a placeholder as the only label; the error is tied with
`aria-describedby` and `aria-invalid` and announced (RX-A11Y-07); invalid is not shown by colour alone (RX-A11Y-06).

**Common mistakes**: each form styles its own inputs; `type` lost when copies are merged (check with
`ryux components --verify`); no focus style; error text in red only.
