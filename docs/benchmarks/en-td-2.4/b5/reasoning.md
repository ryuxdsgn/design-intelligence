# EN-24-B5 · Transaction detail: design reasoning

Frame `cLlQf` in `acc24.pen`, at x 3798, y 0, to the right of all existing content. Export: `cLlQf.png`.
Method: RYUX, Design entry point. Modules read: product, interaction, forms, content, edge-cases (checkout or payment) and ux, ui, responsive, accessibility, anti-slop (mobile UI), plus capabilities/qa.
The ryux MCP was not connected, so there are no reference screen_ids. Evidence comes from the brief, the RYUX knowledge, and standards (WCAG 2.2, Nielsen heuristics). Every pattern decision below is rated on that basis.

## Context (from the brief)
- **Who:** adults aged 22–40 in large cities, on a phone, one-handed, seconds after paying a merchant.
- **What they need to know:** did it go through, how much, to whom. Then the details they may need later: when, how they paid, the transaction ID, and the fee.
- **Data available:** merchant name, amount, payment method (card or bank transfer), time, transaction ID, fee.
- **Statuses:** Completed, Processing, Failed.
- **Actions:** Share receipt, Report a problem, Back to home. No other actions were added; "Try again" appears only in the network-error state, where it reloads the page.
- **Platform:** mobile, 390 wide, also checked at 320.

## Design direction
- **Hierarchy:** status (icon and words) first, then the total amount (the only large type on the page), then the merchant. Below that come "Details" (date and time, payment method, transaction ID with copy) and "Amount" (amount, fee, total).
- **Interaction model:** a scrolling page with the actions pinned to the bottom, separated by a hairline, within thumb reach (RX-RD-03). On the canvas each screen is drawn at full length.
- **One primary action per state** (RX-PR-03):
  - Completed: Back to home is primary; Share receipt is secondary; Report a problem is a quiet row.
  - Processing: Back to home only. A note says not to pay again, which prevents duplicate payments.
  - Failed: Back to home is primary, and Report a problem is promoted to a secondary button, because getting help is this user's main recovery path.
  - Loading: skeleton in the final layout; Back to home stays usable.
  - Couldn't load: Try again is primary; Back to home is secondary.
- **Visual language:** this is task UI, so restraint and convention win (RX-UI-12 does not apply). The only colour that carries meaning is status: green, amber or red, always paired with an icon and words (RX-A11Y-06). Primary buttons use a neutral dark ink because the brand is not decided. Font is Inter; spacing is on a 4/8 scale (12 inside groups, 24 between groups, 20 side padding, 16 at 320).
- **Containers:** there are no cards around groups; rows and hairlines are enough. The only tinted boxes are the Processing and Failed notes, which have a purpose (status).

## Decision receipts
1. **Hero amount = total charged (amount + fee)**
   - Options: (A) show the merchant amount as hero; (B) show the total as hero.
   - Evidence: None (judgment).
   - Confidence: Medium.
   - Why: B, because the user most often checks "what left my money".
   - Trade-off: the merchant's price is one row down.
   - Assumption: **the fee is added on top of the amount.** This is not stated in the brief and must be confirmed. If the fee is included in the amount or paid by the merchant, the breakdown changes.
2. **Share receipt only when Completed**
   - Evidence: None.
   - Confidence: Medium.
   - Why: a receipt for a payment that is pending or failed could be mistaken for proof of payment.
   - Trade-off: users can't share a pending reference.
3. **No retry button on Failed**
   - Why: retrying wasn't in the action list, and how the user retries (at the merchant or in the app) isn't known.
   - Recovery offered instead: the failure reason plus Report a problem (RX-EC-02).
   - Open question for the product owner: should Failed offer "Try again" or "Pay another way"?
4. **The 320 width reorganises; it doesn't squeeze** (RX-RD-02). The Transaction ID row stacks its label above the value below 360 wide, and long merchant names wrap. Checked with "Northside Coffee & Bakery, Harbour Street".

## Honesty and placeholders (Hard Gates)
- All values are sample data, and the board says so.
- The currency is the visible token `[CUR]`. Decimal, date and time formats (shown as "48.70" and "7 Oct 2026 · 14:32") must follow the market's locale once it's chosen (RX-PR-05, RX-CD-09).
- Unknowns are marked `[REAL DATA]` rather than invented:
  - the failure reason from the provider;
  - what the report flow confirms;
  - where transaction history lives;
  - how status updates arrive (push or polling).
- No claim is made about whether money was held after a failed payment. The copy says "If you see a charge for this payment, report a problem" instead.
- Card and bank are shown as "Card •••• 4821" and "Bank transfer •••• 3307". No card network or bank names are invented.

## Interaction (RX-IX-01)
The board's "How each action behaves" row gives before, during, result and recovery for Share receipt, Report a problem, Back to home, Copy transaction ID, and status changes. It also covers screen-reader announcement of a status change, and a single 200 ms fade between states that becomes a cut under reduced motion.

## Delivery Gate
```
PRODUCT        PASS · context from brief; unknowns kept as [CUR]/[REAL DATA]; fee-on-top flagged as assumption · evidence None (no MCP)
UX             PASS · status → amount → merchant → details; one primary action per state; every action has before/during/result/recovery
UI             PASS · one type and spacing scale, colour only for status and primary · point of view: task UI
DESIGN SYSTEM  PASS · no system exists; buttons, rows and groups built from one set of helpers so all six screens share identical patterns
ACCESSIBILITY  PASS · text 14–20px; secondary text #565E6B on white ≈ 6.4:1; status never colour-only; 44px copy target; 52px buttons. Checked by hand, no automated audit
RESPONSIVE     PASS · 390 and 320 rendered; Transaction ID row stacks at 320; long merchant name wraps
EDGE CASES     PASS · Completed, Processing, Failed, Loading, Couldn't load, long content. Not designed: session expired, report flow, share sheet, receipt-preparation error (described only)
CODE QUALITY   N/A · design only, no code
VISUAL QA      PASS · rendered with pen.dev TakeScreenshot and Export; fixed a label/value collision at 320
ANTI-SLOP      PASS · no invented numbers, people or urgency; placeholders look like placeholders; no decorative gradients or cards
FINAL          PASS
```
