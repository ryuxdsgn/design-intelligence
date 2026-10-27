All four fixes are done on a new page, **"Pilot B1 fixed"**. I checked afterwards that the original "Pilot B1" page is unchanged: same text sizes, still "Paid at checkout $48.95", no new screens.

**What changed**

1. **Contact courier**
   - The courier card has a copy-only component, `CourierCard (B1F)`. "Contact courier" is now a chat icon button in the courier's row, and under it is the tag "How you contact the courier · Prototype rule, not decided yet". I swapped it in on all 7 screens where the card shows: Picked up, On the way, Arriving, Running late, Offline, Map couldn't load, and On the way at 360.
   - I first put the tag under the old full-width button. That made the card 64 pt taller, pushed the sheets up and hid the map's home marker. The icon button keeps the card at its old height. The trade-off is that the visible words "Contact courier" are now the button's screen-reader name, not on-screen text.
   - I also shortened the courier's description to "Green cargo e-bike, bag 24" so "bag 24" no longer wraps onto its own line at 360.
   - **New screen "B · 4c Contact courier (not decided)":** a sheet that says "How you contact your courier isn't decided yet, so this prototype doesn't offer it. Nothing is sent from here: no message and no call." It also has the tag, a close button, and "Back to tracking". In the prototype the On the way card opens this sheet, and Close, the button and the dimmed background go back.

2. **Delivered:** the screen now shows "Items total $42.75", with no amount paid and no fee line. I updated the note beside the screen to match.

3. **Tags:** none of them is cut off now. All 14 tags wrap fully onto two lines at both 390 and 360, and nothing spills outside any screen.

4. **Three text sizes:** new styles `B1F/*` at 32, 16 and 13.
   - The 20 pt titles became 16 pt SemiBold.
   - The 14 pt labels and 12 pt captions became 13 pt.
   - Every phone screen now uses only 32, 16 and 13; the status-bar clock is the device's, so it isn't counted.
   - At 13 pt, "On the way" bumped into "Delivered" in the stage bar at 360. Each stage column now stays at least as wide as its label.

**Widths:** the new section **"7 · Every changed screen at 360"** has all 22 changed screens at 360. I rendered sections 2–5 at 390, all of section 7, and close-ups of Running late, Contact courier and Picked up at 360. The three explore layouts at 390 and the older section 6 at 360 were checked only by script (bounds and overlaps), not by eye.

**DESIGN.md** now records the contact sheet, the items-total rule for Delivered, the three-size type scale, the tag wrapping rule and the new page.

```
PRODUCT        PASS · contacting the courier and fees are labelled on screen, not offered; amounts are sample data · evidence Thin
UX             PASS · contact sheet has a before, during, result and way back (close, back, scrim, swipe); sends nothing
CONTENT        PASS · the sheet says plainly that nothing is sent; no single word stranded on its own line in the screens rendered
UI             PASS · one-page concept kept; card height unchanged; Running late sheet rises 9 pt
DESIGN SYSTEM  PASS · copy-only styles B1F/* and CourierCard (B1F); originals untouched
ACCESSIBILITY  NOT VERIFIED · contrast unchanged and ≥4.5:1 (calculated); icon button is 44 pt with the name "Contact courier"; 200% text and screen-reader order not drawn
RESPONSIVE     PASS · all changed screens at 390 and 360; one stage-label collision found and fixed
EDGE CASES     PASS · same state matrix plus the contact sheet
CODE QUALITY   N/A · no code
VISUAL QA      PASS · rendered sections 2–5 at 390 and section 7 at 360; overflow script clean on all 47 phone screens
ANTI-SLOP      PASS · 3 text sizes (32/16/13), 1 accent colour, 1 icon set
FINAL          PASS · not tested with users
```

**Open decisions:**
- **Contact button:** you may prefer the visible "Contact courier" button back. It would cost about 64 pt of map, and I'd then raise the maps to keep the markers visible.
- **Type:** with titles at 16 pt, headings like "Your order was cancelled" now stand out through weight alone. That's worth a look on a real device.
