The white status-bar time and icons now pass at the worst pixel on all 13 grocery photo frames, at 360 and 390. The scrim's top is darker and still fades smoothly into the photo, with no visible band.

## What changed

- **Scrim gradient** on all 13 grocery photo frames (Picking, Item unavailable 1–3, Replacement accepted and Decision dismissed at both widths, plus the section 6 Item-unavailable frame at 360):
  - **Before:** a straight fade from 55% at the top on Picking, 45% on the others, to 0.
  - **After:** 78% at the top, easing to 60% at 40% of its height, then fading to 0 at the bottom. Its colour, height (110) and direction are unchanged.
- **One change beyond the scrim, on U1–U3 at 390:** I moved the iOS status bar above the decision sheet's dim layer, as I did at 360 last round.
  - The dim layer greys the white glyphs, and even a scrim at 90% left the time at 4.4:1.
  - The sheet starts at y 120, so nothing else moves.
  - If you'd rather keep that layer order, those three frames fail.
- Nothing else changed. "Pilot B1" is untouched, and every bar I hid to measure is visible again (0 left hidden).

**A margin to know about:** the method takes the median of the rendered glyph pixels, and anti-aliasing makes thin 14 pt text read as light grey. That's why the first attempt (70% at the top) still failed on the time, although the background already passed against pure white at 5.15–5.31:1. I darkened until it passed the same method as before. Picking and Decision dismissed at 360 now pass by a narrow margin (4.53 and 4.56).

## Contrast at the worst pixel

Measured as before: a render with the bar hidden for the background, then one with it shown for the glyph colour.

| Frame | Width | Time (needs 4.5:1) | Icons (needs 3:1) |
|---|---|---|---|
| Picking | 390 | 5.11 ✅ | 5.13 ✅ |
| Item unavailable 1 | 390 | 7.63 ✅ | 8.45 ✅ |
| Sending the choice | 390 | 7.63 ✅ | 8.45 ✅ |
| Sending failed | 390 | 7.63 ✅ | 8.45 ✅ |
| Replacement accepted | 390 | 5.11 ✅ | 5.13 ✅ |
| Decision dismissed | 390 | 5.11 ✅ | 5.13 ✅ |
| Picking | 360 | 4.53 ✅ | 5.76 ✅ |
| Item unavailable 1 | 360 | 7.10 ✅ | 9.01 ✅ |
| Sending the choice | 360 | 7.15 ✅ | 9.01 ✅ |
| Sending failed | 360 | 7.16 ✅ | 9.01 ✅ |
| Replacement accepted | 360 | 4.83 ✅ | 5.76 ✅ |
| Decision dismissed | 360 | 4.56 ✅ | 5.76 ✅ |
| Item unavailable (section 6) | 360 | 7.09 ✅ | 9.01 ✅ |

## Gate

```
ACCESSIBILITY  PASS · white time ≥4.53:1 and icons ≥5.13:1 at the worst pixel on all 13 grocery frames, 360 and 390
UI             PASS · scrim stays a gradient (78% → 60% → 0) that fades into the photo; no band
VISUAL QA      PASS · get_screenshot of sections 2, 4, 6, 7, measured with the bar hidden and shown; tops inspected at both widths
SCOPE          one change beyond the scrim: on 390 U1–U3 the status bar now sits above the decision sheet's dim layer, as at 360
FINAL          PASS · not tested on a device or with users
```
