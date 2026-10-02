---
name: ryux-accessibility
description: "Ryux Accessibility: semantics, keyboard, focus, contrast, targets, names, errors, reduced motion. Load when building or reviewing any UI."
---

# ryux-accessibility: Accessibility

> Group UI · Delivery Gate area ACCESSIBILITY · RX-2.0. Levels are defined in `ryux-core`.

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

> Hard Gates always apply, whichever skills are loaded: no invented numbers, people, urgency, business
> rules, or terms; no placeholder shipped as final; no missing critical states. See `ryux-core`.

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

### RX-A11Y-03 [Required] [Hard Gate] Visible focus, logical order

- Do: Show a visible focus indicator and keep the focus order the same as the visual order.
- Do not: Remove focus outlines without an accessible replacement.
- Why: Keyboard and switch users navigate by focus. (WCAG 2.2 SC 2.4.3 and 2.4.7)
- Check: review

### RX-A11Y-04 [Required] [Hard Gate] Semantic structure

- Do: Use real headings, landmarks, lists, buttons, and links so the structure exists without the styling.
- Do not: Build structure from styled divs alone.
- Why: Assistive technology navigates by semantics. (WCAG 2.2 SC 1.3.1)
- Check: review

### RX-A11Y-05 [Required] [Hard Gate] Names for controls and images

- Do: Give icon-only buttons and meaningful images an accessible name or alt text.
- Do not: Ship unlabeled icon buttons.
- Why: Screen readers announce unlabeled buttons as just "button". (WCAG 2.2 SC 1.1.1 and 4.1.2)
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

### RX-A11Y-09 [Preferred] ARIA only when native cannot

- Do: Use native elements first, and add ARIA only for semantics HTML cannot express.
- Do not: Add roles and ARIA attributes to elements that already have the right semantics.
- Why: Wrong ARIA is worse than none. (W3C ARIA Authoring Practices (first rule of ARIA))
- Check: review
