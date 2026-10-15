I've designed the Lumo transaction detail screen in `[local path]/bench.pen`, along with its other statuses and states. I rendered every frame and looked at each one; the two below were also exported at 2x to `[local path]/lumo-exports`/`.

**On the canvas**
1. **Completed, card**: the main screen with your sample transaction (390 wide).
2. **Processing, bank transfer**: says Lumo is confirming the payment with the bank and the page will update.
3. **Failed, QRIS**: "Try again" as the main button, with a plain-text "Back to home" under it.
4. **Loading**: grey placeholder blocks shaped like the content.
5. **Couldn't load**: a no-connection message with "Try again".
6. **Completed at 320 wide**: the smallest phone width, with no sideways scrolling.
7. **States & edge cases board**:
   - the "Transaction ID copied" message
   - the report section after the 30 days are up
   - a very long merchant name with Rp1.250.000.000 at 320 wide
8. **Detail Row component**: one reusable row for label and value, used on every screen.

**How the main screen reads, top to bottom:** status → amount → "Paid to Kopi Kenangan Sudirman" and the date → Payment breakdown → Details → Report a problem → Done.
- **Status** is always an icon plus a word, never colour alone: green for Completed, amber for Processing, red for Failed.
- **Fee** has its own line on every screen. It shows Rp1.000 for card and "Free" for QRIS and bank transfer.
- **Report a problem** shows the deadline worked out from your 30-day rule: 5 Nov 2026 for a 6 Oct payment.
- **Transaction ID** can be copied with one tap, and a short message confirms it.
- **Design choices:** Plus Jakarta Sans throughout, teal #0F766E only for buttons and links, no decoration, and one main button per screen.

**Assumptions to confirm**
- **Fee on top of the amount:** I read "Rp48.000 paid" as the price at the merchant, with the card fee added on top, so the card is charged Rp49.000 in total. If the Rp1.000 is already inside Rp48.000, the breakdown needs changing.
- **Features you didn't mention:** "Try again" after a failed payment and copying the transaction ID are my suggestions. Remove them if Lumo doesn't support them.
- **What failed payments say:** the Failed screen gives no reason and doesn't say "you weren't charged", because neither was in the brief.
- **English and time zone:** the copy is in English because your statuses were. I left out a time zone (such as WIB) since none was given.
- **Card details:** I didn't add a card brand like Visa, only "Card •••• 4821".

**Checks**
```
PRODUCT        PASS  · fee, statuses, methods and 30-day rule taken from the brief; open questions listed above · evidence Thin (brief only, no reference screens)
UX             PASS  · one main action per screen; close/back and a way to recover on each state
UI             PASS  · point of view: task UI, calm and restrained
DESIGN SYSTEM  PASS  · colours and font saved as shared settings; one reusable Detail Row
ACCESSIBILITY  NOT VERIFIED · contrast estimated from the colour values, not measured (secondary text about 7.6:1, white on teal about 5.5:1, status chips about 5.4:1 or better); tap areas 44px or more; no screen-reader test run
RESPONSIVE     PASS  · 390 and 320 rendered; long name and large amount wrap without breaking
EDGE CASES     PASS  · loading, couldn't load, processing, failed, report window closed, copied
CODE QUALITY   N/A   · design only, no code
VISUAL QA      PASS  · rendered with pen.dev screenshots and a 2x PNG export
ANTI-SLOP      PASS  · no made-up numbers, people, urgency or logos
FINAL          NOT VERIFIED (contrast not measured)
```

No reference screens from other apps were available, so these decisions rest on your brief and general design standards alone.
