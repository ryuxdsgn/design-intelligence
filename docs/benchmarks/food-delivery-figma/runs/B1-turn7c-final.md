I switched the 12 photo-hero frames at 360 to a white status bar. **Three of them still fail the contrast check: Picking, Replacement accepted and Decision dismissed.** The other nine pass. The scrim you asked me to keep isn't dark enough over the light grocery photos, so fixing those three means changing it, which I haven't done.

## What changed

- **`StatusBar/Android` now has two appearances**, on the copy's components board:
  - **Dark** is the existing bar, unchanged. It stays on the light-background frames (maps, Delivered, Cancelled, Loading, Map couldn't load).
  - **Light** is new: plain white time and icons, the same white as the 390 iOS bars. The camera cutout stays black.
- **12 frames at 360 now use Light**, with their times kept:
  - section 6: Preparing, Item unavailable;
  - section 7: Placed, Preparing, Finding a courier, Picking, Item unavailable 1–3, Replacement accepted, Decision dismissed, and Alt B.
- **Layer order, on Item unavailable 1–3 and the section 6 Item-unavailable frame:** the decision sheet's full-screen dim layer was drawn over the status bar and greyed the white text (2.2:1). On Android the system draws the status bar above app content, so I moved the bar to the top. The dim layer, the sheet and the scrim are unchanged. This is the one change beyond the bar's colour.
- **A fix made during the check:** the first Light render showed hollow wifi and signal icons, because each icon kept a dark inner fill from the Dark bar. They're solid white now.
- Nothing else changed: no scrims, photos or 390 frames. "Pilot B1" wasn't touched.

## Contrast check

I rendered each frame with the bar hidden to get the background, then with the bar shown to get the glyph colour. Each figure is the worst case: the lightest background pixel behind the time or the icons.

| Frame (360) | Time (needs 4.5:1) | Icons (needs 3:1) |
| --- | --- | --- |
| Placed, Preparing ×2, Finding a courier, Alt B | 4.71–4.77 ✅ | 4.61 ✅ |
| Item unavailable 1–3, and the section 6 Item-unavailable frame | 5.42 ✅ | 5.42 ✅ |
| **Picking** | **3.40 ❌** | 3.40 ✅ |
| **Replacement accepted** | **2.70 ❌** | **2.70 ❌** |
| **Decision dismissed** | **2.70 ❌** | **2.70 ❌** |

On the failing frames the bar sits over the bright avocado and the white backdrop of the strawberry photo, and the scrim's 45–55% top is too light there. Going back to the dark bar would be worse; on the same frames it measured 1.3–1.5:1.

**Decision for you:** on the three grocery frames, darken the status-bar scrim's top to about 75% (my estimate, not measured), or let me add a short dark protection band inside the Light bar. I'd darken the scrim. The 390 versions of these frames likely have the same problem, but I didn't measure them.

## Gate

```
ACCESSIBILITY  FAIL · 9 of 12 frames pass; Picking (time 3.4:1), Replacement accepted and Decision dismissed (2.7:1) fail
UI             PASS · light bar on photo heroes, dark bar on light backgrounds
DESIGN SYSTEM  PASS · one StatusBar/Android component with Dark and Light appearances; no near-duplicate
VISUAL QA      PASS · get_screenshot renders of sections 6 and 7 at 360; bars cropped and inspected on all 12 frames plus 2 dark-bar frames as a check
FINAL          FAIL · fixing the three grocery frames needs a scrim change, which was out of scope
```
