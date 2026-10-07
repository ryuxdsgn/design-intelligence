# EN-TD-A3 · Transaction detail: design reasoning

Frame: `O9fVgy` in ryux.pen (x 60414, y 0, 390 wide, mobile).

## Assumptions (no questions asked)
- Consumer mobile fintech app, English UI, USD. The example is a card or account payment to a merchant.
- The screen opens straight after a successful payment. It also works as the detail view reached later from history.
- No brand was given, so the style is neutral: warm off-white background, white surfaces, near-black ink, and one green used only for success.

## What the screen has to answer, in order
1. **Did it work?** A "Paid" pill with a check icon, so the status is shown by text and not only by color.
2. **How much, and to whom?** A large amount ($84.20), then "to Northside Grocers" and a relative timestamp ("Today, Oct 6 · 2:32 PM").
3. **Can I trust the details?** One white card holds the facts:
   - Paid to, with the statement descriptor ("Shows on statement as NTHSD GROCERS 0412"). The name on a bank statement often differs from the merchant name, and that mismatch causes many "I don't recognise this charge" support contacts.
   - Paid from, with the masked account and the balance after payment. This answers the usual "how much do I have left?" question right away.
   - Fee is shown as "No fee", stated outright rather than left out.
   - The exact date and time, with seconds, for disputes.
   - The reference in monospace with a copy icon, because people read it out to support or paste it.
4. **What next?** Low-weight follow-ups: change the category, download the receipt (PDF), split the bill, pay again. A quiet "Something wrong with this payment? Report a problem" link sits at the bottom. A single dark "Done" button is placed low, within thumb reach.

## Decisions and trade-offs
- **No celebration screen.** I left out confetti and the big animated check. After paying, people want confirmation and a record. The status pill and amount give confirmation; the rest is the record.
- **Amount, Fee and Total rows were cut down.** When the fee is zero, the amount and total rows only repeated the hero number, so I kept just "Fee: No fee". If a fee or FX applies, add Amount, Fee and Total rows, with Total in bold.
- **Labels on the left, values on the right.** This layout is easy to scan and matches how receipts read. Secondary text sits right-aligned under each value.
- **Category is its own row**, because it is editable and the rest of the details are not. "Change" is the only colored text action.
- **Share sits in the top bar**, the usual spot, so the content area stays focused. Close (X) and not Back, because the screen comes at the end of a modal payment flow.
- **Contrast.** Muted text #5C6068 on white and on #F4F3EF passes AA for body text. The green #13703F on #DDF1E4 passes AA. The Done button is white on #14161A.

## States not drawn (should be designed next)
- Pending or processing: amber "Processing" pill with expected completion time; hide "Pay again".
- Failed or reversed: red status, reason in plain words, "Try again" as primary, and a note that no money was taken (or when it will be returned).
- Refunded or partially refunded: original amount struck through or a refund row, with a link to the refund.
- Cross-currency: rate, original currency amount, FX fee.
- Long merchant names: wrap within the value column, never truncate the amount.
