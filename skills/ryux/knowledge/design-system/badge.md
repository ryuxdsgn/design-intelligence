# Badge (tag, status chip)

Part of `knowledge/design-system.md` (component catalog). This file says what the component must do, not how it
looks: its appearance comes from DESIGN.md and the project's system. In code, a hand-written copy usually looks like:
a small <span> with text-xs, small horizontal padding, a tint, and a full or small radius.

**Job**: label a thing with a short status or category (Lunas, Menunggu pembayaran, Baru). Not for an
action: a chip that filters is a toggle button. Not an eyebrow above a heading unless it has a real job.

**Anatomy**: text, optional dot or icon, optional count.

**Variants**: by meaning (neutral, success, warning, danger, info), not by page. One size, maybe two.

**States**: none of its own. A removable tag is a Badge with a remove button inside, and that button has states.

**Behaviour**: one or two words; the same status always has the same word and colour across the product (RX-CD-05).

**Accessibility**: the meaning is in the word, not only the colour; contrast on the tint 4.5:1; a count badge on an
icon has a name that includes the count.

**Common mistakes**: a new colour per page for the same status; a status written as a sentence; a badge used as a
button.
