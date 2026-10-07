# EN-24-B4 · Transaction detail: design reasoning

Frame: `Btcyj` "EN-24-B4 · Transaction detail" in `acc24.pen`, placed at x 1000, to the right of the only existing frame (`bi8Au`, 0–800). No other frame was touched.
Export: `Btcyj.png` (2x).
Method: RYUX 2.3.3, Design entry point. Modules read: product, interaction, forms, content, edge-cases (checkout/payment), ux, ui, responsive, accessibility, anti-slop (mobile UI).
Evidence: the ryux MCP was not connected, so I had **no reference screens**. Every pattern choice below has evidence **None** and is a judgment call based on the brief, the knowledge modules and the standards they cite (WCAG 2.2, Nielsen heuristics).

## Context (RX-PR-01)

| | |
| --- | --- |
| Who | Adults 22–40 in large cities, on mobile, who just paid a merchant from a digital wallet (from the brief) |
| Task | Confirm the payment's outcome (did it go through, how much, to whom) and keep proof of it |
| Business goal | Fewer "did my payment work?" doubts and duplicate payments; a clear way to report a problem (inferred) |
| Information | Status, amount, merchant, then payment method, time, fee and transaction ID (all from the brief's data list) |
| Primary action | Back to home |
| Constraints | 390 wide; statuses Completed / Processing / Failed; actions Share receipt, Report a problem, Back to home only |
| Success | The user can tell the status in one glance and never has to guess whether to pay again (not measured) |

## Design Direction

**Design intent.** The user should understand the outcome in under a second, trust the record, and leave. This is task UI, so convention and restraint come before expression (RX-UI-12 "not when"). Its character is calm, precise and receipt-like.

**Hierarchy.**
1. The status icon and title, which use color, icon *and* words (RX-A11Y-06).
2. The amount at 44px, the only large type on the page.
3. The merchant.
4. The details list: label on the left, value on the right, for scanning.
5. Report a problem.
6. The action bar, pinned to the bottom.

**UI.**
- Type: Inter throughout; JetBrains Mono for the transaction ID, so characters like 0 and O can be told apart when the user reads it out to support.
- Spacing: 4/8 scale. 20px screen padding and 20px between groups; 14px row padding inside the details card.
- Color roles: neutral surface #F6F7F9, white cards and ink #0E1116 for text. One dark ink primary button, because no brand accent exists yet. Three status pairs:
  - Completed: green #157F3D on #E3F4E8
  - Processing: amber #8A5A00 on #FFF1D1
  - Failed: red #B42318 on #FDE8E6
- Containers: only two. The details card groups the record; the Report a problem row is a separate tappable target.

**Design language.** Calm and institutional, with low decoration. People checking money want certainty, not delight. There are no gradients, illustrations or confetti, because none passes the anti-slop purpose gate.

**Motion.**
- L1 press feedback on buttons.
- An L2 cross-fade when the status changes in place, which is also how it behaves under reduced motion (RX-A11Y-08).
- No celebratory animation.

**Assets.** Lucide icons only, one set (RX-UI-13). There are no logos or images; the merchant appears as plain text because there is no logo source.

## Decision Receipts

**1. Primary action**

| | |
| --- | --- |
| Decision | Back to home is primary (dark, bottom, thumb reach); Share receipt is secondary (outline); Report a problem is a tertiary row in the content |
| Options | A: Share receipt primary. B: Back to home primary. C: two equal buttons (rejected: RX-PR-03 Hard Gate) |
| Evidence | None (no reference screens) · Confidence Medium |
| Why | After paying, most users' next step is to leave. Sharing is occasional and needs to be findable, not dominant |
| Trade-off | Users who often share receipts take a slightly less prominent tap |
| Assumption | Sharing is a minority action. Analytics should confirm this |

**2. Share receipt only on Completed**

| | |
| --- | --- |
| Decision | The button is hidden on Processing and Failed |
| Options | Show it always / disable it with a reason / hide it |
| Evidence | None · Confidence Medium |
| Why | A receipt for an unconfirmed or failed payment can be mistaken for proof of payment |
| Trade-off | If the product does issue receipts for pending payments, this must change |
| Assumption | Receipts exist only for completed payments. **Not decided by the product; confirm** |

**3. One page for all three statuses**

| | |
| --- | --- |
| Decision | Same layout for all statuses; only the hero, the note and the actions change |
| Options | Separate success and failure screens / one adaptive detail page |
| Evidence | None · Confidence High |
| Why | Processing becomes Completed or Failed while the user is looking. One stable layout updates in place without a jump and keeps one mental model (RX-CD-05, RX-RD-06) |
| Trade-off | The Completed state is less celebratory than a dedicated success screen |

## States designed (RX-EC-01)

1. **Completed (default)**: the hero, the details, Report a problem, Share receipt and Back to home.
2. **Processing**: an amber note says who is being waited on (the card issuer) and that the page updates on its own. Share receipt is not shown.
3. **Failed**: the note gives what happened, what to do and where to get help (RX-CD-04, RX-EC-02).
   - The reason is a visible placeholder, `[Failure reason from the payment provider]`, because the real reasons were not provided.
   - There is no "Try again" button, because retry is not one of the product's actions. The note tells the user how to pay again instead.
   - This sample uses a bank transfer, to show the second payment method.
4. **Loading**: a skeleton that matches the final layout, plus a visible "Loading transaction details…" label.
5. **Couldn't load**: Try again is primary and Back to home secondary. The copy states that a loading failure doesn't change the payment itself.
6. **Completed at 320px**: the smallest-width check (RX-RD-01). The amount steps down to 38px and the transaction ID row stacks so the ID never breaks mid-string.

**Not designed:**
- The share sheet itself (it is the operating system's).
- The Report a problem flow (its destination is undefined).
- The receipt-preparation error, which is specified in the notes but not drawn.
- Very long merchant names. Rows already wrap, but this was not drawn.
- Dark mode.

## Content

- Sentence case, plain verbs and specific labels.
- Dates are written "7 Oct 2026, 14:32" (day and month name, 24-hour) because it is unambiguous for a global English audience. No locale was decided, so the final format should follow the user's locale.
- One name per thing: "transaction" for the record, "payment" for the act.

## Assumptions and placeholders (RX-PR-02, RX-AS-03)

**Sample data.** "Northside Coffee", 48.20, a 0.50 fee, card •••• 4821, bank transfer •••• 0392, 7 Oct 2026 14:32 and TX-7F3K-92QD-1186 are all illustrative. The board says so in its header.

**Not decided by the product:**
- **Currency and market.** `[CUR]` marks the currency slot visibly instead of guessing a currency.
- **Fees.** Whether the fee is added on top of the amount or included in it. If it is added, add a "Total charged" row. Also whether a fee shows on a failed payment.
- **Where the transaction lives afterwards.** The page doesn't claim a history screen exists.
- **Status updates.** That the Processing state updates live on the page is a design assumption; it needs a backend push or polling.
- **Copy button.** The transaction ID has no copy button, because it isn't in the action list. Add one if support asks users for the ID.

## Delivery Gate

```
PRODUCT        PASS · user, task, data and actions only from the brief; unknowns marked [CUR]/placeholder · evidence None
UX             PASS · one primary action per state; every action has before/during/result/recovery (notes panel)
UI             PASS · one type and spacing scale, color by role, single focal point (status+amount) · point of view: task UI
DESIGN SYSTEM  N/A  · no system exists; one button pattern and one row pattern reused across all six screens, no duplicates
ACCESSIBILITY  PASS · text contrast estimated ≥4.5:1 (secondary #5B6370 on #F6F7F9 ≈5.7:1, status text ≈4.9–6:1), 52px buttons, 56px row target, status never color alone · checked by hand, no automated audit
RESPONSIVE     PASS · 390 and 320 rendered; ID row stacks at 320; no horizontal scroll
EDGE CASES     PASS · completed, processing, failed, loading and load-error designed; long merchant names and receipt-share failure specified, not drawn
CODE QUALITY   N/A  · no code
VISUAL QA      PASS · rendered with pen.dev TakeScreenshot and the PNG export; fixed a mid-ID line break at 320
ANTI-SLOP      PASS · no invented metrics, people or urgency; no decoration without a purpose; sample data labeled
FINAL          PASS
```
