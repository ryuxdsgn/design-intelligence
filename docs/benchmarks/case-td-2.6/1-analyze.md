# Analysis: transaction details screen (after payment)

## Context
- **Source:** `screen.png`, a single 780 × 1926 px image. I read the image and sampled a few pixel colours with PIL.
- **Viewport:** I'm assuming it's a 390 × 963 pt frame at @2x (Inferred). All pt values below divide the pixels by 2.
- **Not visible:** pressed, focus, disabled and loading states; scroll and sticky behaviour; pending and failed versions of the screen; dark mode; larger text sizes; any other screen width.
- **No reference screens:** the ryux MCP isn't connected, so every pattern here comes from this one screen.

## Layout (top to bottom)
1. **Status bar** (9:41) (Observed)
2. **Header:** a close "✕" on the left and the centred title "Transaction details". It has no back arrow. (Observed)
3. **Hero section, centred:**
   - a "Payment successful" pill with a check icon
   - **$24.50** in very large heavy type, about 48 pt
   - "paid to Blue Bottle Coffee"
   - "Tue, 6 Oct 2026 · 9:41 AM" (Observed)
4. **Detail card:** a white card with about 12 pt corner radius. It has 7 rows, each with a label on the left and the value right-aligned, separated by thin dividers. (Observed)
   - **Paid to:** Blue Bottle Coffee, with "Hayes Valley, San Francisco" underneath
   - **Paid with:** Wallet balance, with "Balance left: $175.50" underneath
   - **Amount:** $24.50
   - **Fee:** $0.00
   - **Total paid:** $24.50. This is the only row where both the label and the value are bold.
   - **Transaction ID:** `TX-8F3K-29QD-7140` in monospace, with a copy icon
   - **Status:** a green dot and "Completed"
5. **Help row:** an outlined card with a lifebuoy icon, "Problem with this payment?", "Report it within 30 days and we'll look into it." and a chevron. (Observed)
6. **Footer:** a hairline divider sits above it. (Observed)
   - Two outlined buttons of equal width, about 48 pt tall: "Share receipt" and "Save PDF"
   - A full-width filled "Done" button, about 52 pt tall
- **Spacing:** about 20 pt side margins and about 16 pt padding inside the card (Inferred). The rows sit about 46 pt apart; the two rows with a second line are taller. (Observed)

## Typography
- **Sans-serif family:** probably Inter or something very close to it (Inferred).
- **Monospace:** used only for the transaction ID (Observed).
- **Size order:** hero amount, then the header title (about 17 pt), then row values and button labels (about 15–16 pt), then the secondary lines under values (about 13 pt) (Observed).
- **Weights:** row labels are regular weight in grey; row values are medium weight in near-black (Observed).

## Colour

These come from single sampled pixels, so they're close but not exact.

| Role | Value |
|---|---|
| Page background | `#F5F3EE` (warm off-white) |
| Card and button surface | `#FFFFFF` |
| Success (check icon, status dot, pill text) | `#0B7A4B` |
| Success pill background | `#DDF0E5` |
| Primary button | `#14161A` (near-black) |

Outlined elements use a light grey border, and there are no shadows (Observed).

## Components
- **Status pill:** the only one seen is the success version.
- **Hero amount block.**
- **Card with label/value rows:** there are 3 kinds of row:
  - one line
  - a value with a second line underneath
  - a value with a trailing action (the copy icon)
- **Status indicator:** a dot plus a word.
- **Help row:** works like a link, with an icon, a title, help text and a chevron.
- **Buttons:** filled primary and outlined secondary, each with an icon on the left.
- **States seen:** default only.

## Content and wording
- **Money:** US dollars, written as `$24.50`, with the fee shown even though it's `$0.00`.
- **Dates and times:** the date is day-month ("6 Oct 2026") but the time is 12-hour ("9:41 AM"). The time in the status bar matches the transaction time, which is a common mockup habit, so this is probably example data (Inferred).
- **Tone:** plain and friendly ("we'll look into it").
- **Repetition, recorded here, not judged:**
  - The merchant name appears 2 times: the hero line and the "Paid to" row.
  - $24.50 appears 3 times: hero, Amount and Total paid.
  - Success appears 2 times: the pill and the Status row.
- **Local patterns:** none apply, since the screen shows US content.

## Overall visual style
- **Calm, like a receipt:** a warm neutral background, a white card, thin dividers and no shadows.
- **Focused on the amount:** the hero number is by far the largest thing on the screen.
- **Green only means status:** the only colour used is green, and only for success. The main action is black.
- **Built from flat rows:** each line is one label and one value, and both the card and the help row use that structure.

## Patterns found (in this screen only)
- A success screen built around the amount: status, amount and merchant first, then a breakdown.
- An itemised breakdown with a bold total row.
- An ID you can copy.
- A help or dispute entry point below the details.
- Two equal secondary actions with one full-width main action under them.

## Unknown

These matter for the next design or build decision:
- **What "Done" and "✕" do:** whether they go to the same place, and whether this screen is also opened from transaction history. The generic title suggests it might be reused.
- **Scrolling:** the 963 pt frame is taller than a typical 844 pt phone. I don't know whether the content scrolls or whether the footer stays pinned.
- **Pending and failed versions:** how the pill, Status row and help row change, and whether a non-zero Fee row changes the layout.
- **Copy, Share receipt and Save PDF:** what happens while each one runs, when it succeeds and when it fails.
- **The help flow:** where the help row goes, and where the 30-day rule comes from.
- **"Balance left":** whether it's the balance right after this payment or the live balance.
- **Data:** whether the values are real or example data, and what happens to long merchant names or addresses.
- **Accessibility and other widths:** text-size scaling, dark mode, contrast of the grey labels (I didn't measure it), and anything wider than one phone width.

## Delivery Gate
```
PRODUCT        NOT VERIFIED · no brief or product data; one screen only · evidence None
UX             N/A · Analyze does not judge; hand off to Critique
UI             N/A · described, not judged · point of view: task UI (receipt)
DESIGN SYSTEM  NOT VERIFIED · no tokens or library; values come from the screenshot only
ACCESSIBILITY  NOT VERIFIED · grey-label contrast and text scaling not measured
RESPONSIVE     NOT VERIFIED · only one width captured
EDGE CASES     NOT VERIFIED · only the success state shown
CODE QUALITY   N/A · no code
VISUAL QA      N/A · nothing was built; only the source image was read
ANTI-SLOP      PASS · no invented facts; inferred values are marked as inferred
FINAL          NOT VERIFIED
```

A good next step would be a **Critique** of this screen, for example of the repeated amount and merchant, and the two equal secondary buttons above the main action. Another would be drawing the pending and failed versions of the screen.
