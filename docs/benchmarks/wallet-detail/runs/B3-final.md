I've built the transaction detail prototype as one HTML file: **`transaction-detail.html`**. It opens on a small Activity list with one payment, one transfer to a friend and one top-up. Tapping a row opens that transaction's details, and Back (in the app or the browser) returns to the list. All 10 unit tests pass, and I rendered it in Chrome at 320, 390 and 1280 wide. A design-check tool from npm couldn't run because the external package was blocked here.

**What the customer sees**, top to bottom:
- **Summary:** who it was with, the amount at the largest size on the screen, and a status label with an icon and text (Paid, Sent or Added; Processing; Failed). A minus or plus sign appears only while money has actually moved, so a failed charge reads "$100.00 · Not charged".
- **What happened** (only when something isn't finished): what happened, what it means for the money, what to do next, the reason, and a timeline. For example: "Maya didn't receive this transfer, but $40.00 left your balance. It's being returned to your balance."
- **Details:** date, to/from, note, amount, fee, total, and the transaction ID with a Copy button. The bottom edge is perforated like a torn receipt; it's the one visual touch, and it marks the part you can share.
- **Actions:** at most one main button.
  - "Try transfer again" or "Try top-up again" opens a confirmation showing the exact amount and recipient, then a sending state (closing and Back are blocked while it sends), then the result. A success replaces the failed screen, and Back goes to Activity.
  - "Share receipt" on completed transactions.
  - "Report a problem" opens a form with sending, failed (what you typed is kept) and sent states.

**States covered:** each of the three types in five statuses: completed, processing, failed with no money taken, failed with a refund in progress, and failed and refunded. Also loading (slow loading says so after 1.5 s), offline, server error (each with Try again), a status that changes while you're looking at it, very long names with a large amount, and a retry or report that fails.

The **"Prototype controls"** panel at the top (beside the phone on desktop) switches between all of these. It's labeled as not part of the app.

**Assumptions (no policies were decided):**
- All names, amounts, IDs and failure reasons are sample data. The $0.00 fee is a value in the transaction record, not a fee policy.
- No refund times, cancel or dispute options, or support channels are promised. The screen says only what the data says and "this screen updates when…". A test checks the copy for timeframes, fees and support promises.
- Refunds go back to where the money came from: your balance for payments and transfers, your card for top-ups.
- A failed payment to a merchant can't be retried from this screen, since the customer pays again at the merchant. No transaction can be retried while its refund is in progress, to avoid taking the money twice.
- Proposed visual direction, since there's no brand yet: warm off-white background, dark text, one blue for actions, system fonts. There's no logo or product name.
- Direction I built: a summary, then the explanation, then the receipt. Two I didn't build: the status explanation as a banner at the top, and an expandable details section.

```
PRODUCT        PASS · no invented rules; every policy gap kept as a stated assumption · evidence None (brief + standards; ryux MCP not available)
UX             PASS · every action has its before/during/result/recovery; one main button; Back follows push vs replace and is blocked only while sending
CONTENT        PASS · what happened → money → next step; no cheer on failure; one term per thing ("Refund in progress", "Report a problem")
UI             PASS · point of view: the receipt you can share; signature: perforated receipt edge · illustration style: none
DESIGN SYSTEM  PASS · tokens for colour, spacing, radius; one button, row and sheet component each, reused
ACCESSIBILITY  PASS · text ≥6.0:1 measured, input borders 4.0:1; every button ≥44px measured; status never colour alone; native dialog with Escape and focus return; reduced motion → fades. Keyboard checked by script only; no screen-reader test
RESPONSIVE     PASS · 320/390/1280 rendered, no horizontal overflow in any state including long content
EDGE CASES     PASS · matrix below
CODE QUALITY   NOT VERIFIED · 10 unit tests pass and the Playwright flow script ran with no console errors; the design-check tool (npx) was blocked
VISUAL QA      PASS · Playwright Chromium, 320/390/1280, all 15 type×status combinations plus loading, offline, server error, long content, retry and report states
ANTI-SLOP      PASS · counts: 1 accent, 1 grey family, 4 radii as set (pill/16/12/24), 1 display size, 3 text sizes, 1 icon set, 0 emoji, 0 logos
FINAL          NOT VERIFIED · only because the design-check tool couldn't run; not tested with users
```

| View / action | Loading | Empty | Error | Success |
|---|---|---|---|---|
| Detail | skeleton, then "taking longer" note | can't happen: it opens from an existing item | offline / server, with Try again | 15 type×status combinations |
| Retry | "Sending…", can't close | n/a | inline reason, Try again / Close | replaces the screen, toast |
| Report | "Sending…" | reason required, error shown on the field | not sent, text kept | reference shown |
| Copy / Share | instant | n/a | "Couldn't copy" toast | toast / system share sheet |

**Riskiest assumption to test with users:** that "Failed" plus "Being returned" under the amount makes it clear money is coming back. Show 5 people the refund-in-progress screen and ask "Where's your $40 right now?" If more than one answers "gone" or "with Maya," the label needs rethinking.

Files are in 
- transaction-detail.html
- tests/logic.test.mjs
- qa/render.cjs
- qa/shots/ (the screenshots)
