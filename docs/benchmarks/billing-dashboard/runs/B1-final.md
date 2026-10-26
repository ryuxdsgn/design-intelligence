I've added the Billing page at `#/billing`, in the nav after Members. Typecheck, all 15 tests and the production build pass. One gap remains: when a payment fails, there's no way to fix it in the app, because `src/api/billing.ts` has no endpoint for updating the card or changing the plan.

**What's on the page** (`src/pages/Billing.tsx`, laid out as in the wireframe):
- **Alerts at the top, only when something needs attention:**
  - A red alert for a failed payment, giving the amount, date and reason, e.g. "Your payment of $96.00 on Oct 1, 2026 failed. The card was declined. Check the card ending in 4242 with its issuer, or add a different card."
  - An amber alert when usage goes over a plan limit.
- **Plan:** name, price per seat, number of seats and the current period.
- **Payment method:** last four digits, cardholder and expiry, or "No payment method on file".
- **Usage this period:** a bar for each item with "412 of 500 GB" in text. Over the limit, the bar turns red and reads "over limit".
- **Invoices:** number, date, amount and a Paid / Open / Failed label, or "No invoices yet".
- **Loading and errors:** placeholder cards while loading. If billing can't load, a message with a "Try again" button.

**Where you need to decide:**
1. **No buttons for changing the plan or the card.** The wireframe shows them, but nothing exists for them to call, so I left them out rather than add buttons that do nothing. As a result the failed-payment alert tells people to "add a different card" with no way to do it here. Point me at an endpoint or page and I'll wire them up.
2. **Billing dates are shown in UTC.** The billing period ends at `23:59:59Z`, and in your local time it showed as "Oct 1 – Nov 1". I'm assuming billing runs on UTC days; this is marked in the code.
3. **No monthly total and no "close to limit" warning.** The API doesn't say whether the bill is simply price × seats (tax and proration are unknown) or at what point usage counts as close to the limit, so I didn't guess at either.

**Changes outside the page, which also affect Members:**
- **Mobile layout bug:** with a third nav link, every page overflowed sideways on phones. I fixed this in `base.css`.
- **No line breaks in tables and buttons:** table cells and buttons now stay on one line. On narrow screens, tables scroll sideways inside their card.
- **Keyboard access to tables:** the scrolling area around tables can now be reached with the keyboard.
- **New pieces:** a shared `Meter` bar, a `formatNumber` helper, and `src/lib/billing.ts` with tests.

**How I checked it:** I took headless Chrome screenshots of every scenario (normal, slow, error, empty, payment-failed, over-limit) at 1280px, and at 320, 375 and 768px for a selection. None of the pages scrolled sideways at those widths. I didn't run the RYUX scan because it would have meant downloading its npm package; I can run it if you'd like. Nothing has been tested with users.

```
PRODUCT        PASS · nothing added beyond what the API returns; update/change actions left out (no endpoint) · evidence Thin (wireframe + DESIGN.md)
UX             FAIL · failed payment has no in-app way to fix it until an update-card action exists
CONTENT        PASS · plain wording: says what happened and what to do next
UI             PASS · task UI, signature: none; follows the wireframe and existing tokens · illustration style: none
DESIGN SYSTEM  PASS · existing components reused; Meter added to shared components, using tokens only
ACCESSIBILITY  PASS · status shown as text, not only colour; scroll area keyboard-reachable; failed-payment alert announced. Checked by reading the code; no automated test run
RESPONSIVE     PASS · 320/375/768/1280 rendered, no sideways overflow
EDGE CASES     PASS · matrix below
CODE QUALITY   PASS · typecheck, 15 tests, build pass; RYUX scan not run
VISUAL QA      PASS · headless Chrome over DevTools; all six scenarios at 1280; payment-failed and error at 320, over-limit and empty at 375, default at 768
ANTI-SLOP      PASS · no invented numbers, urgency or people
FINAL          FAIL · only because of the missing payment-fix action (decision 1)
```

| View | Loading | Empty | Error | Success |
|---|---|---|---|---|
| Whole page | placeholder cards | n/a | message + Try again | all cards |
| Payment method | placeholder | "No payment method on file" | page error | card details |
| Usage | placeholder | "No usage to show" | page error | bars; red when over limit |
| Invoices | placeholder | "No invoices yet" | page error | table; Failed label shown |
| Last payment | — | — | red alert at top | no alert |
