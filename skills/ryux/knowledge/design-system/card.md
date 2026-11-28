# Card or panel

Part of `knowledge/design-system.md` (component catalog). This file says what the component must do, not how it
looks: its appearance comes from DESIGN.md and the project's system. In code, a hand-written copy usually looks like:
a box with a background or border, a radius, padding, and several children (title, text, actions).

**Job**: group the content of one thing (an order, a product, a stat) so it reads as one unit. A panel groups a
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
for no reason; a card with two equal actions.
