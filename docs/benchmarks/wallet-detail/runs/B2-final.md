I've built the transaction detail screen as one file, `index.html`. It covers a payment, a transfer to a friend and a top-up, each in its completed, processing and failed states, plus loading and load-error screens. The logic tests and browser flow tests pass; it has not been tested with users.

**How to use it.** Open `index.html` in a browser. You start on an Activity list of seven sample transactions; tap one to open its detail screen. A "Prototype controls" panel (collapsed at the top on a phone, beside the phone on a wide screen) lets you switch the connection to slow, offline or server not responding. It also sets whether the next action succeeds or fails, and turns on long names and large amounts.

**The screen, top to bottom:**
- **Summary:** the name, the amount at display size, a status pill (Completed, Processing or Failed, always with an icon and text, never colour alone), and one line on what it meant for the money ("Paid from your balance", "You weren't charged"). Failed amounts have no sign, because nothing moved.
- **Notice (processing and failed only):** what happened, what it means for the money, and one next action. A failed payment offers Top up balance, a failed transfer or top-up offers Try again, and a processing transfer offers Check status.
- **"Where the money went":** this is the visual signature. It runs From → To, and the line between them is solid when the money arrived, dashed while it's processing, and broken when it failed.
- **Details:** date, note, transaction ID with a copy button, and a "Retry of" link back to the failed original. Below that: Send again, Share receipt and Get help.

**Every action has an in-progress state, a result and a way to recover:**
- **Try again / Send again:** a confirmation sheet that restates the amount and recipient. It can succeed, fail again, fail offline ("nothing was sent"), or get no response from the server. The no-response case says "we can't confirm whether this went through, check Activity first", since a timeout can't promise either way.
- **Top-up sheet:** amount validation with errors linked to the field, and a card choice.
- **Check status:** finishes with one short fade, or shows "Still processing" or "Couldn't check".
- **Offline or server error while loading:** shows what was saved on the phone, with Try again.

**Assumptions, since none of these were decided:**
- **Brand:** no name or logo. I proposed a warm grey, one ink-blue accent, the system font, and corner radii of 12 (buttons), 16 (cards) and 24 (sheets).
- **Sample data:** amounts in USD; all people, merchants, cards and IDs are made up.
- **Policies:** no fees, refund timing, reversals, limits or transfer durations appear anywhere. A processing transfer can't fail from Check status, because what happens to the money then depends on an undecided reversal policy. Top-up has no maximum amount.
- **Support:** channels aren't decided, so "Get help" has a dashed prototype note and copies the details for support.
- **Not included:** a refunded state, disputes and dark mode, all because the policies or brand aren't set.

**Directions I didn't build:** a timeline-first layout (the progress steps lead) and a paper-receipt look.

**Checks run:**
- **Logic tests:** 6 groups passed, covering money and date formatting, amount validation and receipt text (`checks/logic.test.mjs`).
- **Browser tests:** in Chromium at 390 and 320 px, every transaction and its long-content version, the action and load paths, focus moving to the heading and back to the item that opened it, no sideways scrolling and no console errors. A 1280 px layout and a reduced-motion run were captured but only checked for console errors. Screenshots are in `checks/shots/`.
- **What the screenshots caught:**
  - "AM" breaking onto its own line at 320 px.
  - The unselected card choice losing its padding.
  - Input and button borders at 1.74:1 contrast, below the 3:1 minimum (now 3.6:1).
  - The offline view's heading not matching the loaded view.
- **Contrast:** all text is 5.7:1 or higher.
- **Not run:** the RYUX `design-intelligence scan`. Auto mode blocked downloading the package, so to run it, allow that `npx` call in your settings.

**Delivery Gate**
```
PRODUCT        PASS · no fees, policies or people presented as real; undecided items labeled · evidence None (no reference screens; brief and standards only)
UX             PASS · status and amount first, one next action per state, returns to Activity
CONTENT        PASS · says what happened, what it means for the money, and what to do next; no cheer on failure
UI             PASS · point of view: task UI, signature: "Where the money went" path · illustration style: none
DESIGN SYSTEM  PASS · one sheet, button, card and pill each, used everywhere; tokens for colour, spacing, radius, type, motion
ACCESSIBILITY  PASS · text ≥5.7:1, boundaries 3.6:1, 44px targets, native dialog, focus checked in tests; no screen reader pass
RESPONSIVE     PASS · 390 and 320 checked, no sideways scroll; 1280 frame captured, not asserted
EDGE CASES     PASS · matrix below
CODE QUALITY   PASS · logic and browser tests pass; no typecheck (plain JS); RYUX scan not run (blocked)
VISUAL QA      PASS · Chromium via Playwright at 390 and 320, all states plus sheets, offline and loading inspected
ANTI-SLOP      PASS · 1 accent, 1 grey family, 3 type sizes, radii from the scale only, no invented numbers
FINAL          PASS · design not validated with users
```

**State matrix**

| View or action | Loading | Empty | Error | Success |
|---|---|---|---|---|
| Detail screen | skeleton (slow) | can't happen: opened from an existing item | offline / server, with saved summary | 7 type × status screens |
| Check status | "Checking…" | n/a | offline / couldn't check / still processing | changes to Completed |
| Try again / Send again | "Sending…" | n/a | failed again / offline / no response | new transaction, linked back |
| Top-up sheet | "Topping up…" | field error | invalid amount / declined / offline / no response | new top-up |
| Copy / Share | instant | n/a | "Couldn't copy" fallback | toast |

**Riskiest assumption to test:** that people read the money-path line and the effect line correctly, especially that "You weren't charged" on a failed transfer reassures them. A quick test: five people, three tasks, using wording that doesn't echo the screen's labels:
1. "Did your coffee go through?"
2. "Your friend says they never got your $40. What would you do?"
3. "Your rent share didn't send. Fix it."

If people go to Get help, or ask where the money is on a failed item, the effect line needs to be stronger.

Files are in ``:
- index.html
- checks/logic.test.mjs
- checks/flows.test.mjs
- checks/shots/
