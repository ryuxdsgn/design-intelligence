I fixed all eight findings on "Pilot B1 fixed", in the source components and in both the 390 and 360 frames. I rendered every changed screen at both widths and checked it.

"Pilot B1" itself is unchanged: its clocks still read 7:31, its map labels haven't moved, and none of the new layers exist there. Several shared pieces (status bar, NavButton, markers, base map) are main components that live on "Pilot B1", so I never edited them. Every fix goes through components that belong to the copy, or through overrides.

## What changed, per item

1. **Stage labels.** Centring the labels wasn't enough: at 360 "On the way" and "Delivered" would still be only about 4.5 pt apart. The indicator now names only the current stage, under its own segment, at every width, so 390 and 360 match.
   - Labels sit at the start of their segment for stages 1–2, centred for 3, and at the end for 4–5.
   - The accessible name, "Stage n of 5, <stage>", is in the component description.
   - **Trade-off:** you no longer see the names of upcoming stages, only the filled segments.
2. **Close button.** The 24 × 44 frame is now the round 44 × 44 NavButton from the screens, with its icon swapped to close. Done at 390 and 360.
3. **One timeline.** Every frame's status-bar clock now fits its stage and every time shown on it. The full table is in DESIGN.md.

   | Order | Frame | Clock |
   | --- | --- | --- |
   | Food | Placed | 7:03 |
   | Food | Cancelled by the store | 7:10 |
   | Food | Preparing, Loading, Alts A–C (accepted 7:04 is on screen) | 7:12 |
   | Food | Finding a courier | 7:20 |
   | Food | Picked up | 7:28 |
   | Food | On the way | 7:33 |
   | Food | Map couldn't load | 7:34 |
   | Food | Contact courier | 7:35 |
   | Food | Running late | 7:36 |
   | Food | Offline (last update 7:38 is on screen) | 7:41 |
   | Food | Arriving ("Arriving now, 7:46 PM") | 7:46 |
   | Food | Delivered (delivered 7:47) | 7:48 |
   | Grocery | Picking and the item-unavailable frames (window 6:15–6:30) | 5:52 to 5:58 |
4. **Offline.** The "Last seen 7:38 PM" chip now sits above the courier marker with a pointer to it. The marker and the "Juniper Park" label stay visible.
5. **Titles.** "Your order was cancelled" now uses the same display style as "Enjoy your meal"; at 32 pt it wraps to two lines. The Contact courier sheet title also uses display, the largest of the three sizes.
   - **Trade-off:** this bends the "one display size per screen" rule. Under the sheet's scrim, the arrival time behind it is also display size. I recorded the exception in DESIGN.md.
6. **Map.** These changes are in the copy's own Map variants, where I detached the base map so the labels could move.
   - Harbor St, Pine St and Linden Way moved along their streets, away from the markers and the route.
   - Maple Ave moved below Pine St, where no route runs.
   - On Arriving, the courier stands beside the home pin, and the pin is drawn on top so it's never hidden.
7. **Running late.** The chip still says "Running late". The stage title now says "On the way", the stage, and the body ends "Maya is bringing your order now." so "on the way" isn't repeated.
8. **Android bars and the photo row.**
   - I added `StatusBar/Android` (time, camera cutout, status icons) and `NavBar/Android gesture` to the copy's components board. They're on all 25 frames at 360: the 22 in section 7 and the 3 in section 6. 390 keeps the iOS bars.
   - **I changed the frames, not DESIGN.md.** The 360 grocery rows now show three photos plus "+3" in all 7 frames, matching the rule. The two captions under the rows now say "3 more" to match.

DESIGN.md is updated with all of the above. The previous version is saved at `/tmp/b1crit/DESIGN.before-critique.md`.

## Delivery Gate

```
PRODUCT        PASS · no new features or policies; prototype-rule tags untouched · evidence None (fixes from the critique)
UX             PASS · one stage label at a time, chip points at the marker, courier and home both visible on Arriving
CONTENT        PASS · "Running late" once; status-bar clocks agree with every time shown, food and grocery separately
UI             PASS · display titles on terminal states and the sheet · point of view: "Your order, on its way to you", signature: the basket · illustration style: DESIGN.md › Illustration style
DESIGN SYSTEM  PASS · reused NavButton, Map and StageIndicator; Android bars are new platform components, not near-duplicates; text styles B1F/*
ACCESSIBILITY  NOT VERIFIED · close target 44 × 44 and stage accessible name noted; no contrast check run on the status bars over photos
RESPONSIVE     PASS · checked in Figma renders: 3 map frames at 390, 25 frames at 360, all 25 with Android bars
EDGE CASES     PASS · offline, late, cancelled, map failure and item-unavailable states all updated at both widths
CODE QUALITY   N/A · design file only
VISUAL QA      PASS · get_screenshot renders of sections 2–5 (390) and sections 6–7 (360); map variants, stage indicator and offline chip checked zoomed
ANTI-SLOP      PASS · sample times form one consistent story; nothing invented
FINAL          NOT VERIFIED · accessibility contrast over photo heroes not measured
```

**Risk to look at.** On the photo-hero screens (Placed, Preparing, Picking and the grocery decision frames), the dark status-bar time and icons sit on busy photos. The Android icons almost disappear over the dark ramen photo at 360. The 390 frames have the same issue to a lesser degree, and both widths already have the existing "status bar scrim". I didn't change it because it wasn't in the critique, but it needs a contrast pass. None of this has been tested with users.
