# Design Direction: Transaction detail (after payment)

Frame: `EEWQD` "EN-24-B3 · Transaction detail" in ryux.pen, at x 77620 / y 0 (2670 × 1820), to the right of all existing content (the furthest frame ended at x 77420). Export: `EEWQD.png`.

Method: RYUX Design entry point (capabilities/design.md) with the knowledge modules the task table names for checkout/payment and mobile UI: product, interaction, forms, content, edge-cases, ux, ui, responsive, accessibility and anti-slop, plus qa for rendering. The ryux MCP was not connected, so I had no reference screens. Every pattern choice below has evidence **None**: it rests on standards and judgment, not on observed screens.

## Context (from the brief and the user's answers)

| | |
|---|---|
| Product | A digital wallet app that pays merchants by card and by bank transfer (Observed: user answer) |
| Users | Adults aged 22–40 in large cities, on mobile (Observed) |
| Market | Global, in English. The market and currency are not decided (Observed: unknown) |
| Platform | Mobile, 390 wide (Observed). I also checked 320 as the smallest width (RX-RD-01) |
| Statuses | Completed, Processing, Failed (Observed) |
| Data | Merchant name, amount, payment method, time, transaction ID, fee (Observed) |
| Actions | Share receipt, Report a problem, Back to home (Observed) |
| Brand / DS | Not decided. The canvas holds only unrelated audit and experiment frames, so I reused no system |

**Design intent.** Right after paying, the user should know at a glance whether the money went through, how much, and to whom. They should also be able to prove it (share the receipt or copy the ID) or get help (report a problem), then leave. The page works if someone can tell the status and the amount within about 2 s, without reading the details.

**Information hierarchy.** First: the status (icon, coloured title). Second: the amount and the merchant. Third: the details (merchant, method, date and time, transaction ID, fee). Then the Report a problem path. The actions sit at the bottom, within thumb reach.

## Decisions (receipts)

**1. Primary action**
- Options: A, Share receipt as the primary. B, Back to home as the primary with Share as the secondary. C, two equal buttons.
- Evidence: None (judgment, RX-PR-03).
- Confidence: Medium.
- Choice: B. Leaving is the action every state has. Share exists only when Completed, so making it the primary would change the primary from state to state. C breaks the one-primary hard gate.
- Trade-off: sharing is one level less prominent.
- Assumption: most users leave instead of sharing.

**2. Where Report a problem goes**
- Options: A, a third button. B, a row under the details. C, an overflow menu.
- Evidence: None.
- Confidence: Medium.
- Choice: B. It sits next to the data it is about, it is visible in every loaded state without competing with the buttons, and a menu would hide it from people who need help after a failure.
- Trade-off: it scrolls below the fold on long content at 320.

**3. Status communication**
- Choice: the status icon in a tinted circle, a coloured title, and in Processing and Failed a message box saying what it means and what to do. Each state has a different icon (check, hourglass, cross), so colour is never the only signal (RX-A11Y-06).
- Evidence: None (WCAG 1.4.1).
- Confidence: High.

**4. Share receipt only when Completed**
- Choice: no receipt for a payment that isn't confirmed or that failed, so a receipt can't be mistaken for proof of payment.
- Evidence: None.
- Confidence: Medium.
- Assumption: the product does not issue receipts for pending payments. This is listed as an open question.

**5. Fee shown as its own row, no total**
- Choice: the brief gives "amount" and "fee" but not whether the fee is included in the amount. Adding a "Total charged" would invent a business rule (RX-PR-02), so it stays an open question.

**6. Currency and locale**
- Choice: the market isn't decided, so amounts show a visible `[CUR]` placeholder (RX-AS-03). I used English month-name dates ("7 Oct 2026, 14:32") because a month name is unambiguous across locales. Final formats depend on the market (RX-PR-05).

**7. Visual language: task UI, not an expressive surface**
- Choice: a neutral palette with roles (white surface, near-black ink and primary button, grey secondary text at 6.3:1, and green, amber and red status pairs that all pass 4.5:1), Inter, a 4/8-based spacing scale, and one bordered container that groups the details. No gradients, illustration or decorative shadows. With no brand, a neutral stand-in is more honest than inventing one (RX-UI-10 "Not when", RX-UI-04).
- Point of view: task UI.

## States designed (RX-EC-01)

1. **Completed.** The default after paying. Share receipt and Back to home.
2. **Processing.** A bank transfer still being confirmed, with the message "We're still confirming this payment. Please don't pay again. This page updates on its own when the status changes." No Share.
3. **Failed.** The reason and any money-held info are `[REAL DATA]` placeholders from the provider. Report a problem and Back to home are the ways forward. "Try again" is not in the brief, so it isn't shown; it is listed as a question.
4. **Loading.** A skeleton in the final layout, with Back to home available.
5. **Couldn't load.** A page-loading error (network or server), kept apart from a payment failure. Try again is the primary, Back to home the secondary.
6. **320 wide with long data.** A long merchant name, a large amount (12,480.00) and a long bank-transfer method all wrap without truncation. Labels align to the top. The transaction ID moves under its label so the code stays on one line (prioritize, then reorganize, RX-RD-02).

The before, during, result and recovery behaviour of each action (copy ID, share, report, back) is written on the board (RX-IX-01).

## Assumptions (visible)
- The page is shown right after payment and can also be reached from history. Back to home needs no confirmation.
- In Processing, the page updates live (push or polling) and the user should not pay again. Both need confirming.
- Report a problem opens an existing flow with the transaction ID filled in. That flow is not designed here.
- Share uses the phone's share sheet. The receipt format (image or PDF) is not decided.

## Sample data (labeled on the board)
"Harbor Street Coffee", "The Riverside Neighbourhood Bakery & Coffee Roasters", 24.50, 12,480.00, fee 0.00 and 1.25, card •••• 4821, "TX-8F2K-41QD-7720" and the 7 Oct 2026 time are all illustrative sample data. They are not product facts. "[Bank name]" is a placeholder.

## Not designed
- Dark mode
- Tablet and desktop
- The Report a problem flow
- The share sheet and receipt artwork
- Toasts, drawn as frames (they are described in the notes)
- Pressed and focus states, drawn as frames (they are described in the notes)

## Delivery Gate

```
PRODUCT        PASS · user, task, statuses, data and actions come from the brief; unknowns (currency, fee rule, failure reasons, retry) kept as visible questions · evidence None (ryux MCP not connected)
UX             PASS · one primary action per state; hierarchy status → amount → details; before, during, result and recovery written for each action
UI             PASS · one type scale and spacing scale, colour by role, a single grouping container · point of view: task UI
DESIGN SYSTEM  N/A  · no system exists; neutral stand-in tokens, with no duplicate components
ACCESSIBILITY  PASS · contrast checked by value (text ≥ 4.5:1, worst is secondary grey at about 6.3:1), status not by colour alone, targets 40–52 px, body text 14–16 px; checked by hand, no automated audit
RESPONSIVE     PASS · rendered at 390 and 320, no horizontal overflow, ID row reorganized at 320
EDGE CASES     PASS · Completed, Processing, Failed, Loading, Couldn't load, long data and large amount
CODE QUALITY   N/A  · no code
VISUAL QA      PASS · rendered with pen.dev TakeScreenshot; fixed overflow in Processing and Failed at 844, ID wrapping at 320 and label alignment on wrapped rows, then rendered again
ANTI-SLOP      PASS · no invented metrics, people or urgency; sample data and [CUR] / [REAL DATA] placeholders are labeled
FINAL          PASS (as a design proposal; the open questions must be answered before it ships)
```
