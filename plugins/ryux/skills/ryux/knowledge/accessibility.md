# Accessibility

Makes the interface work for everyone: semantics, keyboard, focus, contrast, target size, and reduced motion, checked against WCAG 2.2.

> Group UI · Delivery Gate area ACCESSIBILITY · RYUX 2.19.4. Levels are defined in `SKILL.md`.

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
> rules, or terms; no placeholder shipped as final; no missing critical states. Labeled sample data is
> not an invented number; an unconfirmed capability is never presented as confirmed. See `SKILL.md`.

## Rules

### RX-A11Y-01 [Required] [Hard Gate] Readable contrast

- Do: Keep text contrast at least 4.5:1, and at least 3:1 for large text and component boundaries.
- Do not: Put light grey text on white or white text on a pale accent.
- Why: Low contrast fails outdoors, on cheap screens, and for low vision. (WCAG 2.2 SC 1.4.3 and 1.4.11)
- Check: audit_ui
- Measured: `ryux scan <url>` flags text under 4.5:1 contrast (3:1 when large) on a solid background; text over images or gradients is skipped (fail)

### RX-A11Y-02 [Required] [Hard Gate] Readable text, reachable targets

- Do: Keep body text around 14 to 16px on mobile, and touch targets at least 24×24px, preferably 44×44px. The target is the hit area, not the glyph: a 20 to 24px icon sits inside a 44×44 button.
- Do not: Shrink body text or crowd small targets together.
- Why: Small text and targets cause misreads and mis-taps. (WCAG 2.2 SC 2.5.8 (24px minimum); Apple HIG 44pt; Material 48dp; Fitts's law (Fitts 1954): bigger and nearer targets are faster to hit)
- Check: audit_ui
- Machine check: `ryux scan` flags zoom turned off: user-scalable=no, maximum-scale=1, userScalable: false, maximumScale: 1 (fail); text set below 12px (CSS font-size, Tailwind text-[Npx], fontSize in style objects) (warn)
- Measured: `ryux scan <url>` flags controls under 24x24px that are crowded by neighbours (warn when spaced as WCAG 2.5.8 allows); rendered text under 12px (warn) (fail)

### RX-A11Y-03 [Required] [Hard Gate] Keyboard and visible focus

- Do: Make actions operable from the keyboard (path-based input such as drawing excepted), show a visible focus indicator, and keep focus order the same as the visual order. When a dialog, menu, or popover closes, put focus back on the element that opened it, or on the nearest sensible element if that one is gone.
- Do not: Build pointer-only actions, or remove focus outlines without an accessible replacement.
- Why: Keyboard and switch users navigate and act by focus. (WCAG 2.2 SC 2.1.1, 2.4.3, and 2.4.7; WAI-ARIA APG dialog pattern)
- Check: tab through the render from the top: every control is reached in reading order and shows a visible focus indicator (3:1 against its background); fails on a skipped control, a focus trap, or an invisible focus
- Machine check: `ryux scan` flags a positive tabindex, which takes the element out of the visual focus order (fail); focus outlines removed on a control (a button, link, input, or :focus rule) with no focus-visible replacement (warn)

### RX-A11Y-04 [Required] [Hard Gate] Semantic structure, native controls, and names

- Do: Use real headings, landmarks, lists, buttons, links, and the right input types before custom elements, and give icon-only buttons and meaningful images an accessible name or alt text. Hide decorative icons and images from assistive technology (aria-hidden, or an empty alt).
- Do not: Build structure or controls from styled divs, or ship unlabeled icon buttons.
- Why: Assistive technology navigates by semantics and announces unlabeled buttons as just "button"; native controls bring keyboard and platform behavior for free. (WCAG 2.2 SC 1.1.1, 1.3.1, and 4.1.2)
- Check: read the accessibility tree (a Playwright accessibility snapshot, or the design file's layer types): every control is a native element or has a role, and every one has a name; headings are in order; fails on an unnamed control or a div acting as a button
- Machine check: `ryux scan` flags <img> with no alt attribute (fail); a clickable <div> or <span> with no role (warn); an icon-only <button> with no accessible name (warn); a heading that skips a level (h2 straight to h4) (warn)

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
- Machine check: `ryux scan` flags animation in a folder where nothing handles prefers-reduced-motion (warn)
