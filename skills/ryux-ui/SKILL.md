---
name: ryux-ui
description: ryux-rules: UI and visual. generic patterns, palette, spacing, consistency, states. Load when working on UI and visual.
---

# ryux-ui: UI and visual

> ryux.design design rules, version 0.4.0, MIT licensed.
> Apply to UI and visual work before considering it done. [Required] rules are a hard gate; the rest
> may be broken only with a written reason.

- **RX-C-02** Avoid generic template layouts without a contextual reason.
- **RX-C-07** Limited color palette: 2 to 3 core colors plus 1 accent.
- **RX-C-08** Consistent spacing and type scale (e.g. multiples of 4 or 8).
- **RX-H-04** [Required] Consistency and standards: follow platform conventions and internal patterns.
- **RX-H-08** Aesthetic and minimalist: every element has a reason, lead with the relevant info.
- **RX-H-14** [Required] Complete states (loading/empty/error/success); respect safe areas; no overflow: text is never clipped or covered (floating cards and mockups overlap only empty space) and nav items never collide. Size for the stated viewport and render it to check when a browser is available.
- **RX-N-12** Wayfinding: a clear 'where am I' title, a back/cancel button always available.
