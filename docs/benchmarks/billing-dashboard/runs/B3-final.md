The Billing page is built and linked in the nav at `#/billing`. Typecheck, build, and all 16 tests pass (10 of them new).

## What's on the page
It follows the wireframe: an alert area at the top, Plan and Payment method side by side, then Usage this period, then Invoices. On narrow screens the cards stack.

- **Plan:** plan name, "$96.00 per month · 8 seats × $12.00", and the current period dates.
- **Payment method:** "Card ending 4242", the holder's name and the expiry date. If there's no card it says "No payment method on file".
- **Usage:** a bar for each item, labelled like "412 of 500 GB". When usage goes over the limit, the bar turns red, the label reads "530 of 500 GB · 30 GB over", and a warning appears in the alert area.
- **Invoices:** a table with Paid, Open and Failed labels. With no invoices it says "No invoices yet".
- **Failed payment:** a red alert that says "We couldn't charge $96.00 to the card ending 4242 on Oct 1, 2026. The card was declined." That invoice is also marked Failed in the table.
- **Billing can't load:** an alert with a "Try again" button that reloads the data.
- **Loading:** grey placeholder lines inside each card.

## Decisions for you
1. **I left out the two buttons in the wireframe** (on the Plan and Payment method cards). `billing.ts` has no way to change a plan or update a card, and the app has no page for either, so the buttons would do nothing. Tell me what they should do and I'll add them.
2. **The failed-payment alert doesn't tell people what to do next.** It says what happened and why, but the only fix it could point to is updating the card, which doesn't exist yet. This and point 1 have the same answer.
3. **Billing dates are shown in UTC.** The API's billing periods start and end at midnight UTC. In US time zones, local dates would show the period as starting Sep 30, and invoices as issued a day early.
4. **I didn't add a "near the limit" warning.** The API gives no threshold, so only usage over the limit is flagged.

## Changes outside the page
- The Button component no longer wraps its text. "Try again" was breaking onto two lines, and the Members page had the same problem.
- Tables use less side padding below 480px wide, so all four invoice columns fit on a phone. This also applies to the Members table, but I didn't re-check that page.

## Checks
- **Rendered in Chrome:** every state at 1280px and at a real 375px width, with no horizontal scrolling. Loading was checked at 1280 and with the server set to slow.
- **Not run:** the RYUX scan (`npx @ryuxdsgn/design-intelligence scan`), because it downloads an outside package and the permission was denied. I checked by hand that the new CSS only uses existing design tokens. If you allow it, I'll run the scan.
- **Not checked:** keyboard navigation or screen readers, and nothing has been tested with users.

```
PRODUCT        PASS · all figures come from billing.ts; nothing invented; the missing actions are flagged as questions · evidence Thin
UX             PASS · problems show first; every state says what happened; retry works
CONTENT        PASS · plain and specific, as DESIGN.md asks; no blame
UI             PASS · follows the wireframe; task UI, no signature
DESIGN SYSTEM  PASS · existing components and tokens reused; one new component (Meter) for usage bars
ACCESSIBILITY  NOT VERIFIED · numbers are written out next to each bar, alerts are announced, the table has a caption; no automated or screen-reader check
RESPONSIVE     PASS · 1280 and 375 rendered, no horizontal overflow
EDGE CASES     PASS · every view: loading, empty, error and loaded rendered; failed payment and over-limit rendered too
CODE QUALITY   PASS · typecheck, 16 tests and build pass; RYUX scan not run (permission denied)
VISUAL QA      PASS · headless Chrome at 1280 and 375, all states
ANTI-SLOP      PASS · no invented numbers, no fake urgency, no decorative extras
FINAL          NOT VERIFIED · keyboard/screen-reader check and the RYUX scan still to do
```

**To test with users:** give an owner the failed-payment page and ask, "What happened, and what would you do now?" Five people is enough. If most can't say what to do next, the update-payment action needs to come first.

Nothing is committed.
