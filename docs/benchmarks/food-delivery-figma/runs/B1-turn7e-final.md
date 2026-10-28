I fixed all six items on Alt C at 360 (`387:5549`) and 390 (`383:942`), and rendered and measured both. Upcoming outlines are now 5.42:1, and every marker sits exactly on the centre of its title's first line. Nothing else on the page changed, and no wording or content beyond the order line was added.

| # | What changed | Measured |
|---|---|---|
| 1 | **Timeline:** a 2 pt rail now runs between markers, behind them.<br>• **Rail:** accent from Placed to Preparing, light neutral (`border/subtle`) after that.<br>• **Done steps:** filled accent dots, 12 pt.<br>• **Current step:** a 20 pt accent ring around a filled 10 pt dot.<br>• **Upcoming steps:** 12 pt outlined circles. | Rendered at both widths: the rail meets every marker centre. |
| 2 | **Upcoming outlines:** a 2 pt stroke in `text/secondary` (#6B5F55), filled with the card colour so the rail doesn't show inside. | **5.42:1** against the card, from the token values and from rendered pixels at both widths (was 1.29:1). |
| 3 | **Marker alignment:** each marker sits in a 20 × 24 box that matches the 24 pt first line of its title, and is centred in it. | **Off by 0.0 pt** on all 6 steps at both widths (was about 5 pt high). |
| 4 | **Card:** I kept it and gave it the courier card's fill, `surface/sunken` (#F5EFE8). The padding is unchanged. | Card against page is 1.11:1. It reads as a tinted panel, the same as the other cards; edge contrast is still low, as with them. |
| 5 | **"4 items · $42.75"** sits under the photos with an 8 pt gap, in the same style as Alt A/B (`B1F/small`, `text/secondary`). The empty spacer above the button absorbed the extra height, so the button doesn't move. | Rendered at both widths. |
| 6 | **"Picked up" hint at 360:** it now breaks as "The map appears once / a courier has your order", with no word alone on a line and the wording unchanged. At 390 it fits on one line and stays unbroken. | Rendered at both widths. |

**Trade-offs:**
- The rails are drawn at fixed positions between the markers. If a step's text changes length later, they need redrawing.
- The 360 break is a manual line break in the text, so it needs reviewing if the wording changes.

```
UX             PASS · reads as a timeline: rail, distinct current step, done vs upcoming shown by fill and outline
ACCESSIBILITY  PASS · upcoming outline 5.42:1 against the card (≥3:1); state also carried by text colour and weight
UI             PASS · markers centred on the first line (offset 0.0 pt); card uses the shared tinted card fill
CONTENT        PASS · wording unchanged; items line matches Alt A/B
VISUAL QA      PASS · get_screenshot of both frames at 360 and 390, measured from nodes and pixels
FINAL          PASS · not tested with users
```
