I've added the Billing page at `#/billing` and linked it in the nav. Typecheck, tests (10 passing, 5 of them new) and the build all pass. I checked it through tests only and haven't looked at it in a browser, so the layout hasn't been checked by eye against the wireframe.

**Layout (follows `docs/billing-wireframe.png`):**
- **Alert area:** shows only when something needs attention.
  - **Billing can't load:** a red banner with a **Try again** button, and the cards are hidden.
  - **Last payment failed:** a red banner with the amount, the reason (e.g. "Your card was declined.") and the date it was tried. The card also gets a "Payment failed" badge, and the invoice shows as Failed.
  - **Over a limit:** a yellow banner naming which usage is over.
- **Plan and Payment method side by side:** the plan shows its name, $96.00 per month, seats × price per seat, and the current billing period. The payment method shows the card's last four digits, holder and expiry, with an "Expired" badge if the date has passed. If there's no card it says "No payment method". The two cards stack on narrow screens.
- **Usage this period:** a bar for each item, e.g. "7,300 of 10,000 runs". The bar turns yellow at 90% of the limit or more, and red with a "30 GB over" badge when over.
- **Invoices:** a table of number, date, amount and a status badge, or "No invoices yet" if there are none.
- **While loading:** placeholder cards in the same layout.

**New pieces:**
- `src/pages/Billing.tsx` and its tests
- a `Meter` component for the usage bars, in `src/components/`
- a `formatNumber` helper with a test
- a few layout classes in `base.css` (all using existing tokens)

You can see each case with `?scenario=error`, `slow`, `payment-failed`, `over-limit` or `empty`.

**Decisions for you:**
- **Missing buttons:** the wireframe has a button in the Plan card and one in the Payment method card, but `src/api/billing.ts` has nothing to change a plan or update a card. I left them out rather than add buttons that do nothing. When those endpoints exist, they'd go in each card, plus an "Update payment method" button on the failed-payment banner.
- **Thresholds:** 90% for the yellow warning is my choice; it's the `NEAR_LIMIT` setting in `Billing.tsx`. Usage at 82% (today's storage) stays the normal colour.
- **Dates:** they're shown in the viewer's local time zone, like elsewhere in the app. For example, a period ending Oct 31 at 23:59 UTC can show as Nov 1 for some users.
