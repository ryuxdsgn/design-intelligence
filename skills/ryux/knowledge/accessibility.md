# Accessibility

Makes the interface work for everyone: semantics, keyboard, focus, contrast, target size, and reduced motion, checked against WCAG 2.2.

> Group UI · Delivery Gate area ACCESSIBILITY · RYUX 2.4.1. Levels are defined in `SKILL.md`.

Accessibility is product quality, not an enhancement. Check:

- **Semantics**: real headings, landmarks, lists, buttons, links, labels.
- **Keyboard**: everything reachable and operable; focus order follows the visual order.
- **Focus**: visible on every interactive element; never removed without a replacement.
- **Contrast**: 4.5:1 for text, 3:1 for large text and component boundaries.
- **Targets**: at least 24×24px, preferably 44×44px on touch.
- **Names**: icon-only buttons and meaningful images have accessible names.
- **Forms**: labels tied to fields; errors tied to fields and announced.
- **Color**: never the only signal.
- **Motion**: honor reduced-motion settings.
- **ARIA**: only when native semantics cannot express it.

Report what was checked and how. Do not claim full conformance without an audit.

## Evidence from RYUX Knowledge

Standards are the main evidence (WCAG 2.2 success criteria); reference screens show local patterns that meet them: `search_screens`. Without the ryux MCP, say the evidence comes from the design and standards alone.

> Hard Gates always apply, whichever skills are loaded: no invented numbers, people, urgency, business
> rules, or terms; no placeholder shipped as final; no missing critical states. See `SKILL.md`.

## Rules

### RX-A11Y-01 [Required] [Hard Gate] Readable contrast

- Do: Keep text contrast at least 4.5:1, and at least 3:1 for large text and component boundaries.
- Do not: Put light grey text on white or white text on a pale accent.
- Why: Low contrast fails outdoors, on cheap screens, and for low vision. (WCAG 2.2 SC 1.4.3 and 1.4.11)
- Check: audit_ui

### RX-A11Y-02 [Required] [Hard Gate] Readable text, reachable targets

- Do: Keep body text around 14 to 16px on mobile, and touch targets at least 24×24px, preferably 44×44px.
- Do not: Shrink body text or crowd small targets together.
- Why: Small text and targets cause misreads and mis-taps. (WCAG 2.2 SC 2.5.8 (24px minimum); Apple HIG 44pt; Material 48dp)
- Check: audit_ui

### RX-A11Y-03 [Required] [Hard Gate] Keyboard and visible focus

- Do: Make actions operable from the keyboard (path-based input such as drawing excepted), show a visible focus indicator, and keep focus order the same as the visual order.
- Do not: Build pointer-only actions, or remove focus outlines without an accessible replacement.
- Why: Keyboard and switch users navigate and act by focus. (WCAG 2.2 SC 2.1.1, 2.4.3, and 2.4.7)
- Check: review

### RX-A11Y-04 [Required] [Hard Gate] Semantic structure, native controls, and names

- Do: Use real headings, landmarks, lists, buttons, links, and the right input types before custom elements, and give icon-only buttons and meaningful images an accessible name or alt text.
- Do not: Build structure or controls from styled divs, or ship unlabeled icon buttons.
- Why: Assistive technology navigates by semantics and announces unlabeled buttons as just "button"; native controls bring keyboard and platform behavior for free. (WCAG 2.2 SC 1.1.1, 1.3.1, and 4.1.2)
- Check: review

### RX-A11Y-06 [Required] Not color alone

- Do: Pair color with text or an icon when it carries meaning (errors, status, selection).
- Do not: Signal an error or a selected state with color only.
- Why: Color-blind users and grayscale screens miss color-only signals. (WCAG 2.2 SC 1.4.1)
- Check: review

### RX-A11Y-07 [Required] Errors announced and tied to fields

- Do: Link error messages to their fields and announce them to assistive technology.
- Do not: Show errors only as red borders or as text that is not associated with the field.
- Why: An error the user cannot perceive cannot be fixed. (WCAG 2.2 SC 3.3.1 and 4.1.3)
- Check: review

### RX-A11Y-08 [Required] Respect reduced motion

- Do: When reduced motion is requested, replace large movement with a fade or a cut.
- Do not: Ignore the system reduced-motion setting.
- Why: Large motion can cause discomfort for people with vestibular disorders. (WCAG 2.2 SC 2.3.3; prefers-reduced-motion; Apple HIG)
- Check: review
