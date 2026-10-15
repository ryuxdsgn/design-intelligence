The transaction detail screen is built in `bench.pen` at 390 wide: the main card-payment screen, plus a Processing (QRIS) and a Failed (bank transfer) version beside it. I checked all three in screenshots and nothing is cut off or misaligned. pen.dev's own layout check reported 55 clipped elements on the main screen even though everything shows in full in the screenshots. I think that's a false alarm, but I didn't confirm it.

**Main screen (Completed, card ending 4821), top to bottom:**
- **Top bar:** a back button, the title "Transaction details", and a share button.
- **Summary:** a teal check mark, a "Completed" label, **Rp48.000** in large type, then "Paid to Kopi Kenangan Sudirman" and "6 Oct 2026, 14:32".
- **Amount:** Payment Rp48.000, then the card fee of Rp1.000 on its own line, then **Total charged Rp49.000**.
- **Details:** merchant, payment method (card icon and "Card •••• 4821"), date and time, and the transaction ID `TX-8F3K29QD` with a copy icon.
- **Report a problem:** a light-teal panel reading "Something not right? Report a problem with this payment until 5 Nov 2026." The app would show the actual end date (30 days after payment) rather than a countdown.
- **Bottom:** a full-width teal "Done" button within easy thumb reach.

**The two other versions:**
- **Processing (QRIS):** amber clock icon, "Paying Kopi Kenangan Sudirman", "usually done in a minute". The fee shows as "Free".
- **Failed (bank transfer):** red ✕ icon and a greyed-out amount, "Couldn't pay Kopi Kenangan Sudirman", "No money was taken". The fee is "Free", Charged is Rp0, and the button says "Try again".

**Decisions to check:**
- **What Rp48.000 means:** I took it as the price at the merchant and added the Rp1.000 fee on top, so the card is charged Rp49.000. If Rp48.000 is meant to already include the fee, the breakdown should read Rp47.000 + Rp1.000.
- **Report option on failed payments:** I kept it, in case something went wrong anyway (for example, money was taken despite the failure).
- **Colours:** Processing uses amber and Failed uses red, so the statuses are easy to tell apart. Teal stays the colour for the brand and for actions.
- **Saved colours:** the colours and typeface are saved as reusable variables in the file (`$primary`, `$bg`, `$text-secondary`, `$font`, and so on).
