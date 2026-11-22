# Accessibility

Makes the interface work for everyone: semantics, keyboard, focus, contrast, target size, and reduced motion, checked against WCAG 2.2.

> Group UI · Delivery Gate area ACCESSIBILITY · RYUX 2.23.8. Levels are defined in `SKILL.md`.

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
  - Over a photo, illustration, or gradient (a status bar on a full-bleed hero, a caption on an image), measure against the worst pixel behind the text or icon, not the average; fix it with a scrim or the bar's light or dark appearance.
- Do not: Put light grey text on white or white text on a pale accent.
- Why: Low contrast fails outdoors, on cheap screens, and for low vision. (WCAG 2.2 SC 1.4.3 and 1.4.11; ryux Figma pilot critique 2026-10-28: a dark status bar over a dark food photo (1.3:1), then a white one over a light grocery photo (2.7:1) until the scrim was darkened)
- Check: audit_ui
- Measured: `ryux scan <url>` flags text under 4.5:1 contrast (3:1 when large); over an image or a gradient, measured on the pixels behind it (its weakest tenth), up to 40 texts per width (fail); texts whose contrast was not measured, once per page: under a blend mode or a filter other than a colour one (blur, url), over a picture the page could not photograph (out of view, or redrawn by the page), or past the 40 measured (warn)

### RX-A11Y-02 [Required] [Hard Gate] Readable text, reachable targets

- Do: Keep body text around 14 to 16px on mobile, and touch targets at least 24×24px, preferably 44×44px. The target is the hit area, not the glyph: a 20 to 24px icon sits inside a 44×44 button, and a text link ("Remove", "Change") gets the same padded hit area as a button. Measure it on the element or node; a name or comment that states a size is not a measurement.
- Do not: Shrink body text or crowd small targets together.
- Why: Small text and targets cause misreads and mis-taps. (WCAG 2.2 SC 2.5.8 (24px minimum); Apple HIG 44pt; Material 48dp; Fitts's law (Fitts 1954): bigger and nearer targets are faster to hit; ryux Figma pilot critique 2026-10-28: a layer named "Close (44 pt tap)" measured 24×44; owner review 2026-11-18 (Figma, Rak-8, "agak slop" after the audit said 0 fail): author, shop, address, and order lines set at 11 pt grey across the flow; owner blind review 2026-11-18 of three Rak flows (secondhand books, Yogyakarta): a small "Remove" text link as the only way to remove a bag item)
- Check: audit_ui; in Figma, the audit counts text under 12 px
- Machine check: `ryux scan` flags zoom turned off: user-scalable=no, maximum-scale=1, userScalable: false, maximumScale: 1 (fail); text set below 12px (CSS font-size, Tailwind text-[Npx], fontSize in style objects) (warn)
- Measured: `ryux scan <url>` flags controls under 24x24px that are crowded by neighbours (warn when spaced as WCAG 2.5.8 allows); rendered text under 12px (warn) (fail)

### RX-A11Y-03 [Required] [Hard Gate] Keyboard and visible focus

- Do: Make actions operable from the keyboard, show a visible focus indicator, and keep focus order the same as the visual order. Only input whose path is the content (a signature, freehand drawing) is exempt; a box drawn by dragging, a before-and-after slider, or a sheet dragged open still needs a keyboard way, such as arrow keys to move and resize, or a button to expand. Give every drag a single-pointer alternative too: a tap, or buttons that step the value. Show the focus indicator for keyboard focus (CSS :focus-visible), not after a tap or click; when a screen change moves focus to its heading for screen readers, give the heading tabindex="-1" and no outline on pointer input. When an inline confirmation (role="alertdialog" in a row or bar, not modal) opens, move focus to one of its buttons, since a screen reader announces it only when focus moves inside. While a dialog or sheet is open, Esc closes it and Tab stays inside it; a click on its scrim may close it too, as a mouse shortcut beside its own close control. When a dialog, menu, or popover closes, put focus back on the element that opened it, or on the nearest sensible element if that one is gone.
- Do not: Build pointer-only or drag-only actions, or remove focus outlines without an accessible replacement.
- Why: Keyboard and switch users navigate and act by focus. (WCAG 2.2 SC 2.1.1, 2.4.3, 2.4.7, and 2.5.7; WAI-ARIA APG dialog and slider patterns; CSS Selectors Level 4 :focus-visible; owner review 2026-11-18 of the markup detector sheet (scan findings in 5 projects, parser candidates in 5 React projects): a drag-only comparison slider and a box drawn only by pointer; owner blind review 2026-11-09 of the motion head-to-head (docs/benchmarks/motion): a focus ring on the title after the first tap read as a glitch)
- Check: tab through the render from the top: every control is reached in reading order and shows a visible focus indicator (3:1 against its background); fails on a skipped control, a focus trap, an invisible focus, or a drag with no keyboard way; then open each dialog and press Esc and Tab
- Machine check: `ryux scan` flags a positive tabindex, which takes the element out of the visual focus order (fail); focus outlines removed on a control (a button, link, input, or :focus rule) with no focus-visible replacement (warn); in .jsx, .tsx, and .html: a modal dialog (role="dialog" or "alertdialog" with aria-modal, or with a scrim around it or just before it; an inline alertdialog is not modal) whose file, with the scripts an HTML page loads from the project, shows no Esc key check or no Tab kept inside (a Tab key check, a focus trap, inert); showModal() or a dialog or focus-trap library gives both; once per file, and not when a page loads a script the scan cannot read (warn); in .jsx, .tsx, and .html: an inline confirmation (role="alertdialog" that is not modal) with no autofocus on it or inside it, in a file that, with the scripts an HTML page loads from the project, calls no .focus(); once per file, and not when a page loads a script the scan cannot read (warn); in .jsx and .tsx: an element that starts a drag (onPointerDown, onMouseDown, onTouchStart, onDragStart) with no keyboard way (no onKeyDown, onKeyUp, tabIndex, or role), not a native control and with no spread props (warn)

### RX-A11Y-04 [Required] [Hard Gate] Semantic structure, native controls, and names

- Do: Use real headings, landmarks, lists, buttons, links, and the right input types before custom elements, and give icon-only buttons and meaningful images an accessible name or alt text. Hide decorative icons and images from assistive technology (aria-hidden, or an empty alt), animated ones included: a logo animation beside the wordmark is decoration, so the page names the brand once. A label a script fills in still starts with default text in the markup, so the control has a name if the script fails or is late. A button in a form that does not submit it says type="button". Radio buttons or checkboxes that answer one question sit in a <fieldset> with a <legend>, or a role="radiogroup" or "group" with aria-labelledby, so the question is read with each option; a choice with one option is a checkbox or plain text, not a lone radio button. Set the page language on <html lang> so a screen reader reads it in the right voice.
- Do not: Build structure or controls from styled divs, ship unlabeled icon buttons, or give a decorative graphic the same name as the text beside it.
- Why: Assistive technology navigates by semantics and announces unlabeled buttons as just "button"; native controls bring keyboard and platform behavior for free. (WCAG 2.2 SC 1.1.1, 1.3.1, and 4.1.2; HTML: a button's type defaults to submit; owner review 2026-11-18 of the markup detector sheet (scan findings in 5 projects, parser candidates in 5 React projects): payment buttons whose label span was empty until a script filled it, and a source picker with no type in a form; ryux editor, sign-in, 2026-11-13: an animated mark labelled like the wordmark made the phone accessibility tree name the brand twice)
- Check: read the accessibility tree (a Playwright accessibility snapshot, or the design file's layer types): every control is a native element or has a role, and every one has a name; headings are in order; fails on an unnamed control or a div acting as a button
- Machine check: `ryux scan` flags in .jsx, .tsx, and .html: two or more radio buttons with the same literal name, none inside a <fieldset>, a role="radiogroup" or "group" with aria-label or aria-labelledby, a form with one, or a landmark with one that holds no other field; once per file, saying how many groups (warn); in .jsx, .tsx, and .html: an <a> with a click handler and no href or tabindex, which Tab does not reach; not with spread props; once per file (warn); in .jsx, .tsx, and .html: two or more checkboxes with the same literal name, grouped as for radio buttons; once per file, saying how many groups (warn); in .jsx, .tsx, and .html: a radio button whose literal name no other radio button has, not inside a JSX expression that may render it more than once, and in HTML only on a page with no script; once per file (warn); in .jsx, .tsx, and .html: an <html> with no lang (in JSX, not with spread props); not in a folder named assets-src (warn); <img> with no alt attribute (fail); a clickable <div> or <span> with no role (a scrim whose first child is a role="dialog" is skipped) (warn); an icon-only <button> with no accessible name (an empty child a script fills, by id or data-bind, counts as its name) (warn); a heading that skips a level (h2 straight to h4) (warn); in .jsx, .tsx, and .html: a <button> with no type inside a <form>, which submits it (not one with a type or spread props; the last typeless button with no click handler counts as the submit when the form has no explicit one; a method="dialog" form is skipped) (warn)

### RX-A11Y-06 [Required] Not color alone

- Do: Pair color with text or an icon when it carries meaning (errors, status, selection).
- Do not: Signal an error or a selected state with color only.
- Why: Color-blind users and grayscale screens miss color-only signals. (WCAG 2.2 SC 1.4.1; grayscale check: NNGroup 5 Visual Treatments that Improve Accessibility (Gordon 2022))
- Check: review; render in grayscale and confirm every meaning survives

### RX-A11Y-07 [Required] Errors announced and tied to fields

- Do: Link error messages to their fields and announce them to assistive technology. After a failed submit, move focus to where the fix starts: the first field in error, or for an error on the whole form (a wrong password) the field to retype, with its text selected; a submit button disabled while sending otherwise drops focus to the page.
- Do not: Show errors only as red borders or as text that is not associated with the field, or leave focus on the page after a failed submit.
- Why: An error the user cannot perceive cannot be fixed, and a keyboard or screen reader user who lost focus has to find the field again before trying. (WCAG 2.2 SC 3.3.1, 4.1.3, and 2.4.3; ryux editor, sign-in, 2026-11-13: the submit button, disabled while signing in, dropped focus to the page body after a wrong password (Playwright, phone emulation))
- Check: submit once with a wrong value, keyboard only: the error is announced and focus lands on the field to fix, not the page body
- Machine check: `ryux scan` flags in .jsx, .tsx, and .html: a field marked aria-invalid (not "false") with no aria-describedby or aria-errormessage; once per file (warn)

### RX-A11Y-08 [Required] Respect reduced motion

- Do: When reduced motion is requested, replace large movement with a fade or a cut, and turn off parallax, scroll-jacking, and carousels that advance on their own.
  - Anything that moves, blinks, or scrolls on its own for more than 5 seconds beside other content (a carousel, a ticker, a looping animation) can be paused, stopped, or hidden; a loading indicator is exempt while the wait lasts.
  - A long intro or onboarding animation can be skipped, and nothing repeats to win attention.
  - Nothing flashes more than three times in one second.
- Do not: Ignore the system reduced-motion setting, loop an animation with no way to stop it, or make people sit through an animation to reach the content.
- Why: Large motion can cause discomfort for people with vestibular disorders, motion that never stops pulls attention away from reading, and flashing can trigger seizures. (WCAG 2.2 SC 2.3.3 (animation from interactions), SC 2.2.2 (pause, stop, hide), SC 2.3.1 (three flashes); prefers-reduced-motion; Apple HIG; NNGroup Animation Duration and Motion Characteristics (Laubheimer 2020): parallax, auto-advancing carousels, and scroll-jacking affect people with vestibular disorders; NNGroup Animation for Attention and Comprehension (Harley 2014): repeated animation, and a skip for long ones)
- Check: review
- Machine check: `ryux scan` flags animation in a folder where nothing handles prefers-reduced-motion (warn); an animation that repeats forever and is not a loading indicator, with no way to pause it (warn)
