I've designed the Lumo transaction detail screen in `bench.pen`. It's 390 wide, uses teal #0F766E and Plus Jakarta Sans throughout, and stretches to about 940 tall to fit everything. I also added a Processing and a Failed version beside it, so all three statuses are covered.

**Main screen (Completed, card payment):**
- **Top bar:** close button, the title "Transaction details", and share.
- **Summary:** coffee icon, "Kopi Kenangan Sudirman", **Rp48.000** in large type, a teal "Completed" pill and the line "Payment received by the merchant."
- **Details:** payment method "Card •••• 4821", "6 Oct 2026, 14:32", and transaction ID TX-8F3K29QD with a copy button.
- **Breakdown:** Amount Rp48.000, then "Card fee Rp1.000" on its own line, then **Total charged Rp49.000**.
- **Help row:** "Something not right? Report a problem until 5 Nov 2026." That's 30 days after the payment, written as an actual date rather than "30 days."
- **Actions:** a "Done" button near the bottom where it's easy to reach, and a "Save receipt" text button under it.

**Other statuses (copies of the same layout):**
- **Processing:** a bank transfer to Gramedia for Rp250.000, with an amber pill and "Your bank is confirming the transfer. This usually takes a few minutes." The fee line reads "Free" in teal, and the second button is "Check status later."
- **Failed:** a QRIS payment for Rp32.500, with a red pill and "No money was taken from your balance." The amount is greyed out, Total charged shows Rp0, and the buttons are "Try again" and "Back to home." The report option stays available.

**Decisions for you:**
- **Where the fee goes:** I read "Rp48.000 paid at" as the amount the merchant gets, with the Rp1.000 card fee added on top, so the card is charged Rp49.000. If Rp48.000 should already include the fee, the rows become Rp47.000 + Rp1.000 = Rp48.000 – a quick text change.
- **Placeholder details:** the merchants, amounts and IDs in the Processing and Failed versions are made up, and so are "BCA" and "Lumo balance" as the money sources. Swap in real ones if you have them.

I checked each screen with screenshots and didn't see anything cut off or overlapping. The tool's automatic layout check did flag clipping on the main screen, but its numbers didn't add up and the screenshot looks clean, so I treated those flags as false alarms.
