I've designed the transaction detail screen in `[local path]/bench.pen`, along with the other states it needs. I exported the screens at 1.5× and checked them visually.

**One thing to confirm:** the brief says "Rp48.000 paid … with a card", and card payments have a Rp1.000 fee. I read Rp48.000 as the amount the merchant received and added the fee on top. So the large amount says Rp48.000, the breakdown shows Amount Rp48.000 + Fee Rp1.000, and **Total paid is Rp49.000**. If Rp48.000 is meant to already include the fee, the amount line becomes Rp47.000 and the total Rp48.000. That's a two-number edit.

**What's on the canvas**
- **Completed, card (main screen, 390):** status icon, Rp48.000, "Paid to Kopi Kenangan Sudirman", and a "Completed" status label. Below that, the payment breakdown (Payment method Card •••• 4821, Amount, Fee, Total paid) and the transaction details (date, TX-8F3K29QD with a copy button). Then a "Report a problem" row that says "You can report it until 5 Nov 2026, 30 days after the payment". One main button, **Done**, sits at the bottom within thumb reach.
- **Processing, QRIS:** Fee shows "Free", plus an amber note saying the status on the page will change to Completed or Failed.
- **Failed, bank transfer:** a red note ("This payment didn't go through"), **Try again** as the main button and "Back to home" as a text link.
- **Loading:** grey placeholder blocks shaped like the final layout.
- **The same main screen at 320 wide:** nothing is clipped or scrolls sideways.
- **Interaction states:** the report row after the 30 days have passed, a "Transaction ID copied" message, and an error state for when the screen can't load.
- **Reusable components:** status bar, app bar, detail row, status label, main button.

**Decisions**
- **Plain layout following common wallet conventions.** This is a screen people check, not a brand showpiece, so the amount and status lead and the teal is used only for the main button, status and links. No reference screens were available, so this is my judgement.
- **Same layout for every status.** Only the color, icon, note and main button change, so the fee and total are always in the same place.

**Assumptions**
- **Things I added that the brief didn't mention:** a **Share receipt** button in the header (only on Completed) and the **copy transaction ID** button. Remove either if Lumo doesn't support it.
- **Sample data:** the IDs on the Processing and Failed screens (TX-2M7Q8LXA, TX-5R1N4WEC), reusing the same merchant and date on those screens, and "9:41" in the status bar.
- **Wording:** the copy is in English, but money is written Rp48.000. I kept the time as the brief wrote it (14:32) and didn't add a time zone. The Failed copy doesn't say whether money was deducted, because the brief doesn't say.

**Quality check**
```
PRODUCT        PASS  · fee, statuses, 30-day window from the brief; nothing invented · evidence None (no reference screens)
UX             PASS  · one main button per screen; recovery defined for Failed and the load error
UI             PASS  · plain, conventional screen; teal only for action/status
DESIGN SYSTEM  PASS  · 5 shared components, color and font tokens, no near-duplicates
ACCESSIBILITY  NOT VERIFIED · contrast estimated (~5:1+), not measured; tap targets 44px; no focus/screen-reader check in a mockup
RESPONSIVE     PASS  · 390 and 320 rendered, no clipping
EDGE CASES     PASS  · completed/processing/failed/loading/load error/report closed/copied; very long merchant names wrap but weren't tested
CODE QUALITY   N/A   · design only
VISUAL QA      PASS  · rendered with pen.dev TakeScreenshot + PNG export
ANTI-SLOP      PASS  · no made-up stats, people, urgency; no logo drawn (store logos not used)
FINAL          NOT VERIFIED · contrast was estimated, not measured
```

Not designed: a dark theme, the report-a-problem flow itself, and the receipt share sheet. Long screens scroll, and the Done/Try again button bar should stay fixed at the bottom.
