I designed the transaction detail screen in `bench.pen`, plus one version for each of the other two statuses. All three are 390 wide and use Plus Jakarta Sans and teal #0F766E. I checked each one with a screenshot, and the layout fits with nothing cut off or overlapping.

**Main screen: Completed, card payment**
- **Top bar:** back button, the title "Transaction details", and a share button.
- **Top section:** a teal check mark, a "Completed" label, **Rp48.000** in large type, then "Paid to Kopi Kenangan Sudirman" and "6 Oct 2026 · 14:32".
- **Breakdown card:** Amount Rp48.000, then "Card fee Rp1.000" on its own line, then **Total paid Rp49.000**.
- **Details card:** payment method "Card •••• 4821", date and time, and transaction ID TX-8F3K29QD with a copy icon.
- **Report a problem:** "Something not right? Report a problem until 5 Nov 2026" (30 days after the payment), shown as a tappable row.
- **Buttons at the bottom:** "Save receipt" and a teal "Done" button, both within easy reach of the thumb.

**The other two versions** sit to the right of the main screen and keep the same layout:
- **Processing, paid by QRIS:** amber colours and a loading icon. The fee line reads "QRIS fee: Free", so the total is Rp48.000.
- **Failed, paid by bank transfer:** red colours and an X icon. The amount is greyed out, the fee line reads "Transfer fee: Free", there's no "Save receipt" button, and the main button says "Try again".

**Assumptions to check:**
- I read "Rp48.000 paid" as the amount that went to the shop, so the card fee brings the total to **Rp49.000**. If Rp48.000 should already include the fee, the breakdown would be Rp47.000 + Rp1.000.
- I made up some text for the other two versions: "Paying…", "Couldn't pay…", "Taking longer than expected?", the bank "BCA •••• 7710", and "Try again". The status bar time also reads 9:41, not 14:32.
- The help icon on the "Report a problem" row is from a different icon set, because the first two help icons I tried weren't found in the main set. At small size it can look a bit like a clock, so it's worth checking.
