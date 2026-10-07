# EN-24-A1 · Transaction detail — design reasoning

Frame: `uGNvf` in `ryux.pen`, at x=71104, y=0 (390 × 998, mobile). It sits to the right of all existing content.
Export: `uGNvf.png` (2x).

## Assumptions (I asked no questions)
- Mobile app (iOS-style, 390 wide), English UI, USD. The brief didn't name a brand, market, or payment rail, so I used a neutral palette and a card payment to a merchant.
- The screen shows right after a **successful** payment. Failed and pending states need their own variants. The status pill and hero color are where those variants would change.

## What the user needs at this moment, in order
1. **Did it work?** A green check, "Payment sent" in green text, and a "Completed" pill. Color is never the only signal: the icon and the words say it too.
2. **How much, to whom, when.** The amount is the biggest thing on the page (44px bold, tight tracking). Merchant and timestamp sit directly under it, so a glance at the top third answers the main question.
3. **Proof and details.** These are grouped into three sheets by what the user would do with them:
   - *Details*: status, funding source (card brand chip + last 4), and category. Category is tappable because users often recategorize right after paying.
   - *Breakdown*: amount + fee = total paid. Showing the fee openly builds trust and heads off "why is it $1.50 more?" support tickets.
   - *Reference*: transaction ID in monospace with a copy button (it gets pasted into support chats and disputes), plus a timestamp down to the second.
4. **What next.** Actions sit in a fixed bottom area within thumb reach:
   - **Done** is the one primary action (dark, full width). It ends the flow.
   - **Save PDF** and **Pay again** are secondary, outlined, and equal in weight. Share is in the top-right, the usual place for it.
   - A quiet "Something wrong with this payment? Get help" line gives an escape route without causing alarm.

## Decisions and trade-offs
- I removed the "Recipient" row because the hero already shows the merchant.
- I used grouped list rows with hairline dividers, not a card per item. Labels are muted and left-aligned, values are ink and right-aligned, so the eye can scan down either column.
- Restrained palette: off-white background, white sheets, near-black ink. Green appears only for success, so it keeps its meaning.
- "Receipt" is the nav title because it describes what the page is for after payment. The close (X) icon, not a back arrow, tells the user the payment flow has ended.
- Contrast: muted text #5B6660 on white is about 6:1, and green #0B7A45 on its tint passes AA for the 13–15px semibold text. All tap targets are 44px or larger.

## Open questions for a real project
- Brand tokens, currency/locale, and the payment methods to support (cards, wallets, bank transfer/VA).
- Pending, failed, and refunded variants, and whether to show a status timeline for slower payment rails.
- Whether cashback/rewards or a "split bill" action belongs here.
