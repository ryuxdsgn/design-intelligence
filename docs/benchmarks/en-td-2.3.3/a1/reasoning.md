# EN-TD-A1 · Transaction detail: design reasoning

Frame: `i7EZe` in ryux.pen (390 px mobile, x=54600, y=0, right of all existing content).

## Assumptions (no questions asked)
- Mobile consumer fintech app, English UI, US dollar amounts.
- Scenario: a card or account payment to a merchant ($24.50 to Harbor Coffee Roasters) that has just gone through.
- The screen is the post-payment receipt. Users reach it from the pay flow and come back to it later from history.

## What the user needs, in order
1. **Did it work?** A small "Payment complete" status chip with an icon, in text and in color, so color is not the only cue. I left out the full-screen celebration. A big animated check delays the information people actually want to see.
2. **How much, and to whom?** The amount is the largest element (48 px). Below it are the merchant, with an initials avatar, and the exact date and time.
3. **Can I trust the numbers?** One details card: the funding source (masked account ••4821), the amount, the fee (shown as "Free" in green, never hidden), and the total charged in bold. A fee of zero is still worth showing, because people check for hidden charges. Category is an editable row, marked with a chevron.
4. **Proof for disputes or support.** The transaction ID is set in monospace and grouped in fours so it is easy to read aloud, with a clear Copy button. The note under it says when the payment settles ("may show as pending ... up to 1 business day"). This is the most common worry after a payment.
5. **What next?** Sharing and saving the receipt are secondary, outlined buttons. **Done** is the single primary action, solid and full-width at the bottom where the thumb reaches it. "Problem with this payment? Get help" is a quiet link, not a button competing with Done.

## Visual decisions
- Warm off-white background (#F7F6F2) with one white card. Only the details that belong together are boxed; everything else sits on the page, so the screen does not turn into a stack of cards.
- Near-black ink for the primary action rather than a brand gradient. Green is used only to mean success or free.
- Geist for the UI and Geist Mono for the ID. Muted text is #5C5F68 on light backgrounds, which passes WCAG AA contrast.
- The top bar has a close (X) button and the title "Receipt". I dropped a duplicate share icon so there is only one share entry point. The empty right slot keeps the title centered.
- Touch targets are 44 px or more (close, copy, buttons 48 and 52 px).

## Not covered (would be next)
- Pending, failed, and refunded states of the same screen; the status chip and settlement note are the parts that would change.
- Non-zero fee, FX conversion rate, cashback or rewards rows.
- Dark mode.
