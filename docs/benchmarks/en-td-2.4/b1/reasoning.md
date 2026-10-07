# Design Direction: Transaction detail (after paying)

Frame: `IQvqw` "EN-24-B1 · Transaction detail" in ryux.pen
Export: IQvqw.png

Process: RYUX Design entry point. Knowledge read for the "Checkout or payment" and "Mobile UI" task rows: product, interaction, forms, content, edge-cases, ux, ui, responsive, accessibility, anti-slop. I asked three questions first because market, payment type, and available actions would each change a major decision. The ryux MCP was not connected, so **no reference screens were used**. All evidence here comes from the brief, standards (WCAG 2.2, Nielsen heuristics), and judgment, and it is rated that way below.

## Context (from the brief)
- Product: a digital wallet that pays merchants by card and by bank transfer. Global, English.
- Users: adults aged 22–40 in large cities, on mobile. Platform: 390 wide.
- Statuses: Completed, Processing, Failed.
- Data: merchant name, amount, payment method, time, transaction ID, fee.
- Actions: Share receipt, Report a problem, Back to home.
- Not decided: market, currency, brand, design system, which state to show.

## Design intent
Right after paying, the user needs to know three things: **did it work, how much, and who it went to**. Then they want **proof they can come back to** (method, time, ID, breakdown). Then they **leave or share**. It has worked if the user can tell the status and total in about a second without scrolling, and can find the transaction ID when support asks for it.

## UX direction
- Hierarchy: (1) status icon and status label, then the total and merchant; (2) "Payment details" (Paid to, Payment method, Date and time, Transaction ID with copy); (3) "Amount" (Amount, Fee, Total); (4) Report a problem; (5) actions.
- One primary action per state (RX-PR-03). Buttons are stacked full width, never two equal buttons side by side.
  - Completed: primary **Back to home**, secondary **Share receipt**, and "Report a problem" as a quiet link.
  - Processing: **Back to home** only, plus the Report link. Share is hidden because there is no final receipt yet.
  - Failed: primary **Back to home**, secondary **Report a problem** (promoted, because it is the only way forward). Share is hidden.
- States designed: Completed, Processing, Failed, Loading (skeleton after about 1 s, RX-IX-02), Details failed to load (Try again reloads the page; Back to home). Report a problem and Share open flows that are outside this frame.
- Interaction (RX-IX-01): Copy transaction ID gives a "Copied" confirmation (not drawn). The Processing page updates itself when the status changes. Try again shows a pressed state, then the loading skeleton. Back to home is always available, including while loading.

## UI direction
- Task UI, so convention over expression: no gradients, illustration, or brand moment (RX-UI-12 does not apply).
- Color by role only: neutral surface #F6F6F4, white cards that group the details and the breakdown, ink #141414 for text and the primary button, secondary text #55565B. Status colors are the only accents: green #14713B, amber #8A5300, red #B42318, each on a pale tint and always paired with an icon and a text label (RX-A11Y-06). Contrast was estimated from the hex values (all text is about 5:1 or higher on its background), not measured with a tool.
- Brand is undecided, so the primary button is neutral ink instead of an invented brand color.
- Type: Inter. 44/600 total (the single focal point), 16–17 for the status and title, 15 for rows, 13 for section labels. The transaction ID is set in JetBrains Mono so characters like 0/O and 1/I can be told apart when read to support.
- Spacing: a 4-based scale. 24 between groups, 8 between a section label and its card, 14 vertical padding in each row. Rows have hairline dividers. Touch targets are 44 tall for the copy button and the Report link, and 52 for buttons.
- Icons: Lucide only.

## Responsive
At 390 (stated) and 320 (smallest, RX-RD-01): the order stays the same and side padding drops from 20 to 16. Long values (the 320 frame uses a long merchant name on purpose) wrap right-aligned under their row instead of truncating. Buttons stay full width and within thumb reach. Nothing scrolls sideways.

## Decision receipts
1. **Information hierarchy: status and total first, record second**
   Options: A) receipt-style list from the top; B) status summary, then grouped detail cards; C) full-screen success animation with details behind a tap.
   Evidence: None (no ryux MCP). Based on the stated user need right after paying. Confidence: Medium.
   Trade-off: the merchant appears twice (summary and the "Paid to" row). I accepted this so the record is complete if someone screenshots only the cards.
2. **Primary action = Back to home; Share is secondary**
   Options: Share primary / Home primary / both equal.
   Evidence: None. Judgment: most payments end here, and sharing is the less common need. Confidence: Medium. This should be checked with analytics once they exist.
3. **Failed state without a retry**
   The brief lists no retry or pay-again action, so I did not invent one (RX-PR-02). The way forward is the provider's reason plus Report a problem. **Open question:** should Failed offer "Try payment again"? I would recommend adding it if the product supports it.
4. **Total = amount + fee, shown as "Total paid"**
   This is an **assumption**: the brief gives a fee but not who pays it. If the merchant absorbs the fee, the Fee row should be removed or relabelled and the hero should show the amount.

## Assumptions (visible)
- The currency is undecided, so all amounts use a `[CUR]` slot (ISO code style) and a "48.20" decimal format. Both must follow the final locale.
- The date format "7 Oct 2026, 14:32" (24-hour) is used because it is unambiguous; the final locale decides.
- Merchant names, amounts, card and account digits, IDs, and times are **sample data**, labelled as such on the board. They are not real.
- The failure reason is a visible placeholder, `[Reason from payment provider]`. The real copy should come from provider codes mapped to plain-language messages (RX-CD-04).
- The Processing copy ("wait for the final status before paying this merchant again") assumes the status can still resolve to Completed. It is advice, not a promise about timing or refunds.
- "Card •••• 4821" and "Bank transfer •••• 0193" assume masked last four digits are available.

## Not designed
Dark mode, tablet, the Share sheet, the Report a problem flow, the "Copied" toast, a refunded or reversed status (not in the brief), and screen-reader annotations beyond naming (for example, the copy button is named "Copy transaction ID").

## Delivery Gate
```
PRODUCT        PASS · status, total, merchant first; only the brief's data and actions used · evidence None (no ryux MCP)
UX             PASS · one primary action per state; recovery via Report a problem and Try again; no invented retry
UI             PASS · neutral roles, status color plus icon plus label, one type and spacing scale · point of view: task UI
DESIGN SYSTEM  N/A  · no system exists; patterns are repeated consistently across six screens (same row, card, and button)
ACCESSIBILITY  PASS · contrast estimated from hex (about 5:1 or higher), 44–52 px targets, status not by color alone; no automated audit was run
RESPONSIVE     PASS · 390 and 320 rendered; long merchant name wraps; no horizontal scroll
EDGE CASES     PASS · completed, processing, failed, loading, load error, long name; refund and reversal not in the brief
CODE QUALITY   N/A  · no code
VISUAL QA      PASS · rendered with pen.dev TakeScreenshot and inspected; fixed a missing icon (clock → hourglass) and a redundant time line
ANTI-SLOP      PASS · no fake metrics or people; sample data and placeholders labelled; no decorative gradients or illustration
FINAL          PASS
```
