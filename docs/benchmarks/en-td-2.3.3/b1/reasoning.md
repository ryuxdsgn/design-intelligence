# Design Direction: Transaction detail, after paying a merchant

Frame: `bpcPy` "EN-TD-B1 · Transaction detail" in ryux.pen (x 55190, y 0, to the right of all existing content).
Process: RYUX Design capability. Knowledge read: product, interaction, content, edge-cases, ux, ui, responsive, accessibility, anti-slop.
Evidence: the ryux MCP was not connected, so no reference screens were used. Every decision below rests on the brief, the standards cited and my own judgment, and the evidence is rated **None** unless stated otherwise.

## Context (from the user's answers)
- Product: a digital wallet that pays merchants by card and by bank transfer. The market is global and the copy is in English. Market and currency are not decided.
- Users: adults aged 22–40 in large cities, on mobile, 390 wide.
- Statuses: Completed, Processing, Failed.
- Data: merchant name, amount, payment method, time, transaction ID, fee.
- Actions: Share receipt, Report a problem, Back to home.
- Brand, design system and which state to show are not decided.

## Design intent
Right after paying, the user must see within about a second whether the money went (the status), how much it was, and to whom. Second, they can verify the details or keep proof (Share receipt). Third, they can get help (Report a problem). Then they leave (Back to home). The page works if the user doesn't pay twice, doesn't contact support just to ask "did it go through?", and can find the transaction ID when they do need support.

## UX direction
- Hierarchy: status pill (icon + word), then the amount (40px, the focal point), then a merchant sentence ("Paid to …" / "Paying …" / "Payment to … didn't go through"), then the Details card, the help link, and the bottom action.
- One primary action: **Back to home**. It is the only filled button and stays in a bottom bar within thumb reach (RX-PR-03, RX-RD-03).
- **Share receipt** is a text button in the Details card header, so it sits next to the receipt it shares, and it appears only on Completed. Processing has no final receipt yet, and Failed has nothing to prove (assumption).
- **Report a problem** is a quiet link below the details on every status. On Failed the prompt changes to "Need help with this payment?"
- Transaction ID uses a monospace face with a 44×44 copy button. Users read it to support; copying shows a "Transaction ID copied" toast (behavior defined, toast not drawn).
- States designed: Completed, Processing, Failed, Loading (skeleton), Couldn't load (network), and Completed at 320 with a long merchant name.
- Interaction (RX-IX-01):
  - Processing says the page updates when the status changes. This is an assumption about the backend (push or polling).
  - Failed shows a slot `[Failure reason from the payment provider]`. I don't claim "you weren't charged", because that business rule is unknown (RX-PR-02).
  - Couldn't load offers "Try again", which reloads the page and does not repay. It states that the error only affects showing the details.
- No "Pay again" or "Try payment again" action, because it isn't in the action list (RX-AS-06). It is an open question for Failed.

## UI direction
- Task UI: convention and restraint, no expressive signature (RX-UI-12 does not apply). The design language is calm and precise, like a bank statement.
- Type: Inter, one scale: 40/700 amount, 17 merchant line and title, 15–16 values and buttons, 14 labels. Roboto Mono for the transaction ID.
- Spacing on a 4/8 scale: 20 side padding, 24 between groups, 12 inside the summary, 14 row padding.
- Color roles:
  - Neutral surfaces (#F5F6F8 page, #FFFFFF card).
  - Text #12161C, and #4A5361 for labels (about 7:1 on white).
  - The primary button uses neutral ink #12161C because the brand is undecided. Swap it for the brand accent later.
  - Status: green #0B7A4B on #E3F3EA, amber #8A5300 on #FFF1D6, red #B42318 on #FDE9E7. All are at least 4.5:1, and each comes with an icon and a word, so color is never the only signal (RX-A11Y-06).
- Containers: one card, which groups the verifiable details. The summary sits on the page with no container. The only other tinted box is the failure reason (an error needs emphasis).
- Icons: Lucide only (circle-check, hourglass, circle-x, circle-alert, share, copy, wifi-off, rotate-cw).

## Responsive
- 390: the stated viewport.
- 320: the smallest width checked. The merchant name wraps in both the summary and the row; values align right and wrap.
- The Transaction ID row **stacks** (label above the ID and copy button) below about 360, where label, ID and copy button no longer fit on one line. This was found in the render: they collided at 320.
- Long content scrolls. The bottom action bar is sticky; in the long renders it is drawn after the content.

## Assumptions (visible)
- `[CUR]` is a currency slot: currency, decimals and symbol position are not decided.
- Date format "6 Oct 2026, 14:32" is locale-neutral for now. The real format follows the market locale once it is decided.
- All values are sample data for layout: amount 48.50, fee 0.50, "Northside Coffee", card •••• 4821, bank transfer •••• 0193, the ID.
- I don't show a "Total" row because it's unknown whether the fee is added to the amount charged (RX-IX-05 applies only before commitment; this is after). Decide this and add the row if needed.
- Share receipt opens the OS share sheet.
- Processing updates live.
- Failure reasons come from the provider.

## Decision Receipts
1. **Primary action = Back to home; Share receipt in the card header.** Options: A) two stacked bottom buttons (Share primary, Home secondary); B) Home primary with Share in the card header; C) Share as a header icon. Evidence: None. Confidence: Medium. Why: after paying, most users want to leave, and sharing is optional proof that belongs next to the receipt. Trade-off: Share is less prominent for users who always share.
2. **Status before amount.** Options: A) a large success illustration; B) a compact pill above the amount. Evidence: None (WCAG 1.4.1 for icon + word). Confidence: Medium. Why: three statuses need the same slot, and a pill keeps the amount as the focal point. Trade-off: less celebration on success.
3. **No container for the summary; one card for details.** Evidence: None (anti-slop purpose gate). Why: the card groups the verifiable facts that can be shared or copied.

## Not designed
- Dark mode.
- Tablet and desktop widths.
- The toast after copying.
- The share sheet and the Report a problem flow.
- The pressed and focus states, which are specified only in words: the focus ring is 2px ink with an offset, and the pressed state darkens 8%.

## Delivery Gate
```
PRODUCT        PASS · user, task, statuses and actions from the brief; unknowns kept as visible slots · evidence None
UX             PASS · one primary action; status → amount → merchant → details; recovery on every status
UI             PASS · one type and spacing scale, color roles, a single card · point of view: task UI
DESIGN SYSTEM  PASS · none exists; one row pattern reused across states, no near-duplicates
ACCESSIBILITY  PASS · text contrast ≥4.5:1 checked by value; status = icon + word; targets ≥44px; no automated audit available
RESPONSIVE     PASS · 390 and 320 rendered; ID row stacks at narrow width; no horizontal scroll
EDGE CASES     PASS · completed, processing, failed, loading, load error, long merchant name
CODE QUALITY   N/A  · no code
VISUAL QA      PASS · rendered with pen.dev TakeScreenshot and PNG export; fixed the ID row collision at 320 and the overflow on Processing
ANTI-SLOP      PASS · no invented numbers, people or urgency; sample data labeled; [CUR] and the failure reason are clear placeholders
FINAL          PASS
```
Note: the link underlines (Share receipt, Report a problem) did not show in the pen.dev render, so in the export the links rely on weight and position. Build them with underlines.
