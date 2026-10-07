# Design reasoning · EN-24-B6 · Transaction detail

Frame: `KOZAJ` in `acc24.pen` (x 6596, y 0, 2598 × 1797), placed right of all existing frames.
Export: `KOZAJ.png` in this folder.
Process: RYUX, Design entry point. Modules read: product, interaction, content, edge-cases, ux, ui, responsive, accessibility, anti-slop, plus qa.
Evidence: the ryux MCP was not connected, so I had no reference screens. Every pattern choice below is a judgment call based on the brief, RYUX knowledge and standards (evidence **None** unless a standard is cited).

## Context (from the brief and the answers)

- **User:** adults aged 22–40 in large cities, on a phone, who have just paid a merchant by card or bank transfer.
- **Task:** confirm the payment worked and see what was paid, then move on.
- **Available data:** merchant name, amount, payment method, time, transaction ID, fee.
- **Statuses:** Completed, Processing, Failed.
- **Actions:** Share receipt, Report a problem, Back to home.
- **Not decided:** market, currency, brand, design system.
- **Design intent:** within a second the user knows whether the money went through, how much, and to whom. They can leave confidently or get help.
- **Success:** the user doesn't need support to tell whether the payment succeeded, and reports include the transaction ID.

## What is on the board

1. **Completed, 390.** Status, amount and merchant, then details (method, date and time, fee, transaction ID). Below them, the "Report a problem" link. At the bottom, "Share receipt" (secondary) and "Back to home" (primary).
2. **Processing, 390.** An amber status and the note "final status will show on this page". No Share. Report link and Back to home.
3. **Failed, 390.** A red status and a plain message. "Report a problem" is promoted to a secondary button. Back to home is primary.
4. **Loading, 390.** A skeleton with the same structure as the loaded page, plus the text "Loading transaction details…". Back to home stays available.
5. **Load error, 390.** "Couldn't load this transaction". It explains what happened, says it only affects this page and not the payment, and offers Try again (primary) or Back to home.
6. **Completed, 320 (minimum width).** A long merchant name wraps under the amount. The transaction ID wraps instead of truncating. No horizontal scroll.
7. **Notes panel.** Before, during, result and recovery for every action, the decisions, and the assumptions.

## Decision receipts

**Information hierarchy**
- **Decision:** status, then amount, then merchant, then the details list.
- **Options:**
  - A: amount first, status as a small pill.
  - B: a status hero, then the amount.
  - C: a receipt-style list with no hero.
- **Evidence:** None (no reference screens). RX-UI-01.
- **Confidence:** Medium.
- **Why:** right after paying, the first question is "did it work?". The amount is the 40px focal point, and status is an icon plus text so it never relies on color alone (RX-A11Y-06).
- **Trade-off:** the details sit lower on the screen.

**Primary action**
- **Decision:** "Back to home" is the only filled button in every state.
- **Options:** Share as primary, or Back to home as primary.
- **Evidence:** None. RX-PR-03.
- **Confidence:** Medium.
- **Why:** the task is finished, so leaving is the likely next step. It sits at the bottom within thumb reach (RX-RD-03).
- **Trade-off:** Share is less prominent.
- **Assumption:** most users don't share every payment.

**Actions per status**
- **Decision:**
  - Completed: Share, Report link, Home.
  - Processing: Report link, Home. No Share, because a receipt for an unfinished payment could mislead.
  - Failed: Report button, Home.
- **Evidence:** None.
- **Confidence:** Medium.
- **Trade-off:** the action area isn't identical across states, but its order is: primary always last.

**Visual language**
- **Decision:** neutral task UI.
  - Ink #0F172A for primary text and the button.
  - Slate #475569 for secondary text.
  - Light surface #F5F7FA for the details group.
  - Status colors green #15803D, amber #B45309, red #B91C1C, each with its own tint.
  - Inter for all type.
- **Why:** brand isn't decided. A receipt is task UI, where convention and calm help trust (RX-UI-12 "Not when"). No gradients, illustration or decorative cards. The single details container exists to group the facts.

## Interaction (RX-IX-01)

**Share receipt**
- During: the button shows a spinner and can't be tapped twice.
- Result: the phone's share sheet opens.
- Failure: an inline message says "Couldn't prepare the receipt. Try again."
- Cancelling the share sheet returns here with nothing changed.

**Report a problem**
- Opens the report flow with the transaction ID attached. That flow is not designed here.
- Back returns to this page.

**Back to home**
- Goes straight home, with no confirmation. The payment is already submitted and nothing can be lost (RX-IX-04).

**Try again**
- Shows the loading skeleton, then the result, or the same error again.

## Assumptions and open questions (RX-PR-02)

- **Sample data:** all values are sample data. Northside Coffee, card ending 4821, 7 Oct 2026 · 14:32 and TX-20261007-8F3K29QD are illustrative.
- **Currency:** not decided, so amounts show the `[CUR]` placeholder. Format them by locale once the market is chosen.
- **Fee:** how the fee relates to the amount (added or included) is not decided. So there's no "Total" line, and the amount and fee are not summed.
- **Failed:**
  - There is no failure reason in the data, and we don't know whether the user was charged, so the copy claims neither.
  - Recommendation: show the reason when the provider returns one.
  - "Try again" for the payment is recommended, but it isn't in the brief's action list, so I left it out.
- **Processing:** assumes the page shows the new status when processing finishes. How (live update, refresh, push) isn't decided.
- **Date format:** the month is written out to avoid ambiguous slash dates. 24-hour time and the time zone depend on the market.
- **Try again on the load error:** this is a page reload, not a new product feature. It was added so the page's own error has a way forward (RX-EC-02, RX-EC-06).
- **Not designed:** the report flow, the shared receipt's own layout, dark mode, tablet, and the Share in-progress and failure states (described in the notes but not drawn).

## Delivery Gate

```
PRODUCT        PASS · context, intent and assumptions written; no invented rules (fee total and failure reason left open) · evidence None
UX             PASS · one goal per state, before/during/result/recovery defined for all 4 actions
UI             PASS · clear focal point (status + amount), one 4px-based spacing scale, color roles · point of view: task UI
DESIGN SYSTEM  N/A  · no system exists; buttons and rows built from one helper so they're identical, not separate components
ACCESSIBILITY  PASS · text ≥14px, buttons 52px tall, report link 44px, status never color-only, contrast estimated from hex values (no automated check run)
RESPONSIVE     PASS · 390 and 320 rendered; long merchant and ID wrap; no horizontal scroll
EDGE CASES     PASS · Completed, Processing, Failed, loading, load error, long content; Share failure described in notes, not drawn
CODE QUALITY   N/A  · design only, no code
VISUAL QA      PASS · rendered with pen.dev TakeScreenshot; fixed a details list hidden behind the buttons on Failed, an icon missing from the icon set, and button order on the error state
ANTI-SLOP      PASS · no fake metrics, people or urgency; placeholders look like placeholders ([CUR]); no decoration without a purpose
FINAL          PASS
```

Checked by hand from renders. No automated accessibility or contrast tool was available.
