# EN-TD-A2 · Transaction detail: design reasoning

Frame: `mICKT` in ryux.pen (390 x 963, x 58028, y 0, to the right of all existing content).
Export: mICKT.png

## Assumptions (the brief didn't say, so I didn't ask)
- Mobile wallet app, a single payment to a merchant (QR or tap), paid from the wallet balance.
- USD and English copy. Sample data: $24.50 to Blue Bottle Coffee, no fee.
- The screen opens straight after payment and stays reachable later from history. It's the same screen in both cases, so it is both the confirmation and the record.

## What the user needs, in order
1. **Did it work?** The status pill sits at the top ("Payment successful", a green check plus text, so color isn't the only cue).
2. **How much, to whom, when?** The amount is the largest element (48px). Payee and timestamp sit directly under it, so the top third works on its own as a quick glance.
3. **The record.** One white receipt surface holds the details people check or quote later: payee with location (to tell branches apart), payment source with the remaining balance (answers "what do I have left"), amount, fee, and total. The total gets the heavier weight. Then the transaction ID, set in mono so people can read it aloud to support without confusing characters, with a copy icon, and a "Completed" status.
4. **Recourse.** "Problem with this payment?" is a separate outlined row below the receipt, not a primary action. It's visible without making a successful payment feel suspect. It states the 30-day window so people know the rule up front.
5. **Next step.** The bottom bar holds Share receipt and Save PDF as equal secondary buttons, with Done as the single primary action in the thumb zone.

## Decisions
- **One container only (the receipt).** The summary sits on the page background with no card around it, which keeps the hierarchy flat and stops the screen looking like a stack of boxes.
- **Plain, warm palette.** Off-white background (#F5F3EE), near-black ink, a single green kept for success semantics only. No gradients, confetti, or illustration. Money screens should feel calm and trustworthy rather than celebratory.
- **Removed a duplicate share icon** from the nav bar. "Share receipt" already sits in the action bar, and two share entry points add noise. An invisible 44px slot keeps the title centered.
- **Close (X) rather than back.** After payment there is no meaningful "back" (you can't go back into the payment), so X and Done both end the flow.
- **Type:** Geist for UI, Geist Mono for the ID. Labels are muted grey on the left and values are black and right-aligned, which makes the values easy to scan.
- **Touch targets:** nav buttons 44px, secondary buttons 48px, Done 52px.

## Not covered (would need follow-up screens or states)
- Pending, failed, and refunded states. The status pill and Status row are the slots that would change: amber pending with an expected completion time, red failed with "No money was taken" and a Retry action.
- Payments with a fee, promo or cashback lines, split payments, and P2P transfers (they'd add a note/message row).
- Dark mode, and the history entry point (Done would become back navigation).
