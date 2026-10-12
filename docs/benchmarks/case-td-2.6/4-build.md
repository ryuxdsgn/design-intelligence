I've built the redesign as one file, `receipt.html`. It has all four states (success, pending, failed, loading), and it works: I rendered every state in headless Chromium at three phone sizes and all the checks passed.

**How to view it:** open the file in a browser. A small bar at the top switches between the states (or add `?state=pending` to the address). That bar is only there for previewing and isn't part of the screen. When this goes into the real app, it can move a pending receipt to success or failed with `window.receipt.setState('success')`.

**What each control does:**
- **Copy:** tapping anywhere on the Transaction ID row copies the ID and shows "Transaction ID copied" for 2 seconds. If copying fails, it says "Couldn't copy. Press and hold the ID to copy it."
- **Share receipt:** opens the phone's share sheet. Where there isn't one (most desktop browsers), it opens the print dialog, which has "Save as PDF". While it works, the button shows a spinner, says "Preparing…" and ignores extra taps. If it fails, it says "Couldn't share the receipt. Try again."; cancelling stays silent.
- **Done, Try again and the help row:** they don't navigate anywhere yet. Each one sends a signal (`receipt:done`, `receipt:retry`, `receipt:help`) for the real app to act on, because I don't know where those screens are. In this file they only write to the browser console, so tapping them shows nothing.
- **Dates and money:** formatted from the device's language and region settings rather than written in a fixed style. In my test browser that gave "Tue, Oct 6, 2026".

**Checks I ran** (Playwright with Chromium, test script in `/tmp/rx-qa/`):
- I rendered all 4 states at 390 × 844, 375 × 667 and 320 × 568 and looked at the screenshots. Nothing scrolls sideways, and the bottom buttons stay pinned to the bottom of the screen. On 390 × 844 everything fits without scrolling. On smaller screens the page scrolls, and the help row passes underneath the pinned buttons.
- Every button is at least 44 × 44 pt.
- Copying put `TX-8F3K-29QD-7140` on the clipboard and the "copied" message appeared.
- No console errors.
- Pressing Tab moves through the controls in the order you'd expect.
- Text contrast passes the WCAG AA standard everywhere: pending pill 5.55:1, failed pill 5.41:1, grey text 5.22:1, success pill 6.8:1.

**Still to confirm before this ships** (each is marked in the code):
- "Your wallet wasn't charged" on the failed screen must be true for every failed payment.
- "Try again" assumes the app supports retrying a payment.
- All the data (merchant, amounts, balance, ID, date) is example data copied from the original screen.
- The real receipt PDF from the backend isn't connected; sharing sends a text summary instead.

```
PRODUCT        NOT VERIFIED · failed-screen wording, retry and the help destination still need confirming · evidence None
UX             PASS         · one main action per state; you can always leave with Done
UI             PASS         · matches the pen.dev design (layout, colours, fonts) · point of view: task UI (receipt)
DESIGN SYSTEM  PASS         · colours and sizes are CSS variables matching the bench.pen variables
ACCESSIBILITY  NOT VERIFIED · contrast, button sizes, Tab order and labels checked by script; no screen-reader run; text scaling only via the flexible amount size
RESPONSIVE     PASS         · 320, 375 and 390 wide rendered: no sideways scroll, footer stays pinned
EDGE CASES     PASS         · loading, pending, failed and success built; copy and share failures handled; a long merchant name wraps
CODE QUALITY   NOT VERIFIED · checked in a real browser only; no unit tests (no test runner exists here) and no type checking
VISUAL QA      PASS         · screenshots of every state at 3 sizes (Playwright, Chromium 1234), compared with the pen.dev frames
ANTI-SLOP      PASS         · no fake data presented as real; example values and assumptions labelled in the code
FINAL          NOT VERIFIED
```

Not covered: dark mode, Safari and real iOS devices, and the largest system text sizes.
