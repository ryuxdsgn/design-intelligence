# DESIGN.md

<!-- ryux-context:start -->
- **Product**: Transaction detail for a digital wallet app (benchmark; no real brand)
- **Audience**: Adults checking a payment, a transfer, or a top-up on their phone, often right after it happened
- **UI direction**: Bold, warm, premium. A night-ink app with one electric accent for money that moves, big characterful amounts, and a cream receipt sheet you could almost tear off. Status colours stay unmistakable. Not a bank template
- **Motion direction**: Expressive, part of the brand, and it explains what happens to the money. Specs below. Nothing loops except loading. Reduced motion gets fades
- **Voice and tone**: Plain and exact, "you"; say what happened, what it means for the money, and what to do next; no cheer when something failed
<!-- ryux-context:end -->

## Visual language

The team's direction for this product. Use these values; add a token only when none fits, and say why.

**Colour roles**

| Role | Value | Use |
| --- | --- | --- |
| `ink` | #110F1C | app background, the top of every screen |
| `ink-raised` | #1C1930 | cards and rows on ink |
| `ink-line` | #2E2A47 | dividers on ink |
| `paper` | #F7F1E5 | the receipt sheet |
| `paper-line` | #E4DACA | dividers and the perforation on paper |
| `text-on-ink` | #F5F3FF, muted #A9A3C7 | |
| `text-on-paper` | #1B1726, muted #6B6478 | |
| `volt` | #D4FF3A | the accent: money that moved, the money path, the one primary button. Text on volt is `ink`. Never for status |
| `ok` | #3BE08F on ink, #0B7A4B on paper | completed |
| `wait` | #FFC145 on ink, #8A5600 on paper | pending, returning |
| `fail` | #FF6E6E on ink, #B42318 on paper | failed |
| category tints | #3A2F5E, #21405A, #4A2F3A, #2F4A3A, #4A432A, #33334F | counterparty tiles, picked by category, never by person |

**Type**

- Display: **Unbounded** (Google Fonts), 600-700, for amounts and the screen title only. Detail amount 44/48,
  list amounts 17/22, tabular figures. The currency sign at 60% size, raised.
- Text: **Inter** (Google Fonts), 400-600. 15/22 body, 13/18 meta, 11/14 caps labels with 0.08em tracking.
- One display size per screen.

**Shape and depth**

- Radius: 28 sheets, 20 cards, 14 tiles and buttons, full for pills.
- On ink, depth is light, not shadow: a 1px top highlight `rgba(255,255,255,.07)` on raised surfaces and a soft
  glow behind the amount in the status colour at 18% opacity.
- On paper, one shadow: `0 -12px 32px rgba(17,15,28,.35)` where the sheet meets the ink.
- The receipt sheet has a perforated top edge (a row of small half-circle notches in `ink`) and a faint paper
  grain (SVG noise, 4% opacity). This is the signature; nothing else gets texture.

**Layout**

- Detail: ink top third with the counterparty tile, the amount, and the status pill; the money path below it
  (where the money came from, where it is now, where it is going, as a line in `volt` with nodes); then the
  paper receipt sheet with what it means for the money, the timeline, the details, and the actions.
- Activity list on ink: rows on `ink-raised`, 64px tall, tile 40px, amount right-aligned in the display face.
- Counterparty tiles: initials or a category glyph on a category tint. No logos.
- Icons: one outline set, 1.75px stroke, 20px.
- Spacing on a 4px scale: 4, 8, 12, 16, 20, 24, 32, 40.

**Motion specs**

| Event | Spec |
| --- | --- |
| Row press | scale 0.98 and `ink-raised` lightens, 90 ms ease-out; releases 140 ms |
| Detail push | slides in from the right with the list shifting 30% left, 240 ms `cubic-bezier(.2,.8,.2,1)` |
| Amount | digits roll up into place, then settle with a spring (stiffness 260, damping 22), starting 120 ms after the push |
| Money path | the `volt` line draws from source to where the money is now, 420 ms ease-in-out; a failed path stops at the break and the node turns `fail` |
| Receipt sheet | rises from below 32px with a fade, 280 ms ease-out, no bounce; the perforation stays put |
| Status change | the pill cross-fades colour and label, 200 ms; the path redraws to the new position |
| Success | once, on a completed payment: the end node fills `volt` and a single ring expands and fades, 600 ms |
| Banners and sheets | rise from below, 240 ms ease-out, no bounce |
| Loading | a skeleton in the same layout, shimmer 1.2 s; the only loop |
| Reduced motion | every event becomes a 150 ms fade; the path is drawn at once |
