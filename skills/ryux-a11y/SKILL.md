---
name: ryux-a11y
description: ryux-rules: Accessibility. contrast, text size, touch targets, focus, states. Load when working on Accessibility.
---

# ryux-a11y: Accessibility

> ryux.design design rules, version 0.4.0, MIT licensed.
> Apply to Accessibility work before considering it done. [Required] rules are a hard gate; the rest
> may be broken only with a written reason.

- **RX-H-11** [Required] WCAG AA contrast: normal text >= 4.5:1, large text >= 3:1.
- **RX-H-12** [Required] Body text >= 12px; touch targets >= 44x44px.
- **RX-H-13** Keyboard focus is visible; focus order is logical.
- **RX-H-14** [Required] Complete states (loading/empty/error/success); respect safe areas; no overflow: text is never clipped or covered (floating cards and mockups overlap only empty space) and nav items never collide. Size for the stated viewport and render it to check when a browser is available.
