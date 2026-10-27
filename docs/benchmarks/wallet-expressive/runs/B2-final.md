I built the prototype as one file, **`index.html`**. Open it in a browser. It starts on an Activity list, and tapping a row slides in that transaction's detail screen. Next to the phone on desktop, or behind the **PROTOTYPE** button on mobile, is a dashed panel of controls that sit outside the app. They switch the system states: slow, server error, offline, empty list, whether actions succeed or fail, completing or failing a pending transaction, USD or IDR, and long names with large amounts.

I didn't stop to ask your product questions first, though the RYUX guidance says to. Where an answer was needed I used neutral sample copy and listed the questions at the end.

## What the customer sees

- **Payment**: paid, processing, failed, or refunded.
- **Transfer**: sent, sending, or failed with the money returned; transfers received from friends are covered too.
- **Top-up**: added, waiting for the bank, or declined by the bank.

**Every detail screen shows, in order:**
1. Who the money went to or came from.
2. The amount in a large display font. Failed amounts are crossed out with no + or − sign.
3. One line on what this means for the money ("Not charged", "Returned to your balance", "Not in your balance yet").
4. A status label, a banner saying what happened and what to do next, the steps so far with times, and the details. The reference number copies when tapped.

**Signature element:** a "Money path" card. A dot shows where the money is: it reaches the recipient when the payment completes, keeps moving while pending, and stops at a red ✕ when it fails. Orange is used only for money that moved and for the main button.

**Actions, each with an in-progress, done and failed state:**
- **Try again** on failures and **Send again** on sent transfers open a confirmation sheet showing the amount and recipient. A successful retry creates a new transaction; the failed one stays in your activity as "moved no money". Failed top-ups let you pick another card or account.
- **Get help** opens a sheet that already includes the reference number. It asks you to pick what went wrong, keeps your message if sending fails, and confirms when it's sent.
- **Share receipt** uses the phone's share sheet, or copies the receipt text where sharing isn't available.
- Pushing a pending transaction to complete or fail animates it to its new state, adds the new step and announces the change to screen readers.

**Motion** follows `DESIGN.md`: rows press down, the detail slides in over 240 ms, the amount settles in with a spring, sheets rise without bouncing, and a completed transaction gets one ring of motion. Only loading indicators loop. With reduced motion turned on, everything fades instead.

## Delivery Gate
```
PRODUCT        NOT VERIFIED · built from the brief and DESIGN.md; the product rules below are unconfirmed · evidence None (judgment)
UX             PASS · one main action at most per screen; every failure says what happened to the money and the next step
CONTENT        PASS · plain "you" voice, no cheerful tone on failures; all names and amounts are labelled sample data
UI             PASS · point of view: money path, signature: the moving dot plus orange only for money that moved · illustration: none
DESIGN SYSTEM  PASS · colour, spacing, corner and motion values defined once; one card, button, sheet and banner reused everywhere
ACCESSIBILITY  NOT VERIFIED · labelled controls, focus kept inside sheets, Escape closes, screen-reader announcements, 44px touch targets; no automated audit or screen-reader test was run
RESPONSIVE     PASS · rendered at 320, 390 and 1280 (Playwright Chromium); no sideways overflow; long amounts step down a size instead of breaking
EDGE CASES     PASS · see matrix
CODE QUALITY   PASS · 7 logic tests pass (node --test tests/logic.test.mjs); no console errors across the scripted run
VISUAL QA      PASS · Playwright at 390, 320 (IDR plus long names) and 1280, with reduced motion; every type × status, sheets, offline, slow loading and server error inspected
ANTI-SLOP      PASS · 1 accent, 1 grey family, 1 icon set, 2 fonts, 3 text sizes in the main content, no emoji, no invented logos (tiles use initials or icons)
FINAL          NOT VERIFIED · because of PRODUCT and ACCESSIBILITY; not tested with users
```
| View / action | Loading | Empty | Error | Success |
|---|---|---|---|---|
| Activity list | skeleton | "No activity yet" | retry | list |
| Transaction detail | skeleton in the same layout | can't happen (you always open an existing transaction) | server error with retry, or offline with the saved copy and its age | detail |
| Try again / Send again | spinner, buttons locked | n/a | stays in the sheet, inline message | new transaction with a success moment |
| Get help | spinner | must pick a topic first | inline, message kept | "Request sent" |
| Pending update | shown as "in progress" | n/a | animates to failed | animates to completed |

The RYUX `scan` command wasn't run because it would download an unreviewed npm package.

## Questions for you
1. **Fees and limits:** none are shown, including on the confirmation sheets. Are there top-up or transfer fees?
2. **Pending and failed money:** I assumed a pending payment or transfer is already taken from your balance, and that a failed transfer is returned automatically. Is that right, and can a failed merchant payment be retried from the detail screen?
3. **Market:** no market was named, so USD and IDR are both available through the controls. Which one is real? Also, can a sent transfer be cancelled? If not, the confirmation sheet should say so.

**Usability test to run:** 5 participants. Show them the failed top-up and the pending transfer and ask "Where is your money right now?" The design works if at least 4 answer correctly within 10 seconds. If people misread the crossed-out amount as "charged", that styling needs to change.
