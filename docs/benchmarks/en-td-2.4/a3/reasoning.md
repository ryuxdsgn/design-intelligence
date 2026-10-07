# EN-24-A3 · Transaction detail — design reasoning

Frame: `sklea` in ryux.pen (x 3128, y 0, 390 × ~940, placed to the right of all existing content).
Export: `sklea.png` in this folder.

## The user's situation
They just tapped Pay. They're anxious and usually in a hurry, often standing at a counter. In order, they want to know:
1. Did it go through? (status)
2. How much, and to whom? (amount, recipient)
3. Is everything right? (source account, fees, total)
4. Can I prove it / find it later? (ID, receipt, share)
5. What if it's wrong? (a route to help)

The page is laid out top to bottom in that order.

## Decisions
- **Status first, in words and color.** A soft green check mark plus the text "Payment sent". The status doesn't rely on color alone, and it reads as calm. I left out confetti and big celebratory animation because paying is a routine task, not an achievement.
- **The amount is the hero.** 48px bold with tight tracking is the largest element, and "to Blue Bottle Coffee" sits directly below it. That answers "how much, to whom" in a single glance.
- **One details card, label left and value right.** Rows are grouped by meaning and separated by dividers: *who* (Paid to, Paid from), *money* (Amount, Fee, Total charged), and *record* (Date, Category, Transaction ID).
  - Showing "Fee $0.00" explicitly builds trust. People worry about hidden charges.
  - "Total charged" is bold because it's what the bank statement will show.
  - "Paid from" includes the account nickname, so a user with several cards can confirm the right one was used.
  - The Transaction ID is set in a monospace font so ambiguous characters (0/O, 1/l) are easier to tell apart when read to support. It has a copy icon.
  - The timestamp appears only once, in the Date row. The hero copy had a duplicate, which I removed to keep the hero focused.
- **Proof actions are secondary.** "Share receipt" and "Download PDF" are equal-weight outlined buttons. They matter (for expense reports and splitting with friends) but aren't the main intent. I also removed a top-right share icon that duplicated "Share receipt".
- **Help is visible but quiet.** "Something wrong? Report a problem" sits below the actions. It's discoverable without making the user feel the payment might fail.
- **One primary action: Done.** A full-width dark button in a bottom footer, within thumb reach. The X in the top bar gives the same exit for people who look up there.
- **Visual language.** Warm neutral background (#F3F4F1) with a white card, ink #121417, and muted #5B616B (about 6:1 contrast on white, AA). Green is used only for success. Inter for the UI and JetBrains Mono for the ID. No gradients and minimal shadows, so it feels sober and trustworthy, which suits money.
- **Touch targets.** Icon buttons are 44 × 44, secondary buttons are 48 tall, and Done is 54 tall.

## Assumptions (not asked, so stated)
- iOS-sized mobile app (390pt), English, USD, card payment to a merchant.
- This is the immediate post-payment screen (opened from checkout, so it closes with X / Done rather than going Back). The same layout could serve as the detail view from history by swapping "Payment sent" for a "Completed" status label and X for a back arrow.

## States not drawn (would design next)
- Pending/processing (amber status, "We'll notify you"), failed (error message, retry, money not taken), and refunded.
- Long merchant names (wrap the value; the label column stays fixed) and foreign currency (show the exchange rate and the original amount).
- Copy-ID confirmation toast.
