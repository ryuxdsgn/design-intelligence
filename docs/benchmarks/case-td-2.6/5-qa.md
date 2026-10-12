I compared the build against the four pen.dev frames, both by measuring positions in screenshots and by looking at them side by side. It now matches the design to within 4 px on every screen. Getting there took 6 fixes to `receipt.html`, and a few differences remain that are intentional or that a web page can't fix.

**How I compared:** I exported the pen.dev frames at 2× and rendered the build in Chromium at the same 390 pt width. The pen.dev frames include a drawn phone status bar that a web page doesn't have, so I cropped it off before comparing. I measured the card, rows, help row and footer in both images, then compared the screens side by side.

## Fixed

| Area | Design | Build before | Fix | How bad it was |
|---|---|---|---|---|
| Amount in other regions | "$24.50" | "US$24.50" with UK English settings | Always show the plain "$" symbol | Wrong-looking amount on the main number |
| Dates in other languages | English throughout | German/Indonesian dates next to English labels | Dates and numbers follow the screen's language (English), in the user's US or UK style | Mixed languages (critique C-10) |
| Headline amount size | 52 px | 50.7 px | Sizing rule corrected | Minor |
| Transaction ID row height | 72 px | 56 px | Height and padding corrected | Minor |
| Spacing in rows and help row | Tighter (two-line rows 62–66 px, help row 65 px) | 4–6 px looser | Line spacing matched to the design | Minor |
| Share error message | "Couldn't create the receipt. Try again." | "Couldn't share the receipt. Try again." | Wording matched to the design notes | Minor |

**Re-check after the fixes:** every block is within 0–4 px of the design on all four screens. The 12 combinations of state and screen size (390, 375 and 320 wide) still pass: no sideways scrolling, buttons at least 44 pt, the footer stays at the bottom and no console errors. Copying puts the ID on the clipboard and shows the "copied" message.

## Still different from the design
- **Status bar:** not built. On a phone the system draws it, so this is intentional.
- **Bottom padding:** 34 px in the design, but only 20 px in a desktop browser. It uses the phone's safe area, so it should become 34 px on an iPhone. I haven't checked on a real device.
- **Haptic tap on copy:** iPhone browsers don't support this, so there's no tap feedback there. The "copied" message still appears.
- **Pending updating itself:** the design says the screen updates in place. The build can do this when the real app tells it to (`window.receipt.setState`), but nothing checks the payment status yet, because there's no backend.
- **Done, Try again and the help row:** each sends a signal for the real app to act on, but they don't navigate anywhere yet, so tapping them looks like nothing happens. Where they lead is still unknown.

```
PRODUCT        NOT VERIFIED · failed-screen wording, retry and help destination still unconfirmed · evidence None
UX             PASS         · same flow and actions as the design in all 4 states
UI             PASS         · within 0–4 px of the pen.dev frames after fixes · point of view: task UI (receipt)
DESIGN SYSTEM  PASS         · CSS variables match the bench.pen variables one for one
ACCESSIBILITY  NOT VERIFIED · buttons, Tab order, contrast and labels checked by script; no screen-reader run
RESPONSIVE     PASS         · 320, 375 and 390 wide: no sideways scroll, footer pinned, every button 44 pt or larger
EDGE CASES     PASS         · 4 states match the design; copy and share failures handled; 4 locales checked
CODE QUALITY   NOT VERIFIED · browser checks only; no unit tests (no test runner exists here)
VISUAL QA      PASS         · pen.dev export vs Chromium render (Playwright), measured and compared side by side
ANTI-SLOP      PASS         · no fake data presented as real; assumptions labelled in the code
FINAL          NOT VERIFIED
```

Not tested: Safari or WebKit, a real iPhone (safe area and haptics), dark mode, and the largest text sizes.
