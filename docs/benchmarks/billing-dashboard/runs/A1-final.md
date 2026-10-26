The Billing page is in place at `#/billing` and follows the wireframe layout. Typecheck, the build and all 10 tests pass. I haven't opened it in a browser, so I haven't checked how it looks.

**What it shows** (`src/pages/Billing.tsx`)
- **Alert area**, shown only when something needs attention:
  - **Last payment failed:** a red alert with the amount, the reason (for example "Your card was declined."), the date of the attempt, and a prompt to update the payment method.
  - **Over a limit:** a yellow warning listing each resource that's over its limit, such as "Storage: 530 of 500 GB".
  - **Billing can't load:** an error message with a "Try again" button, the same as the Members page.
- **Plan:** the plan name, monthly total, seats × price per seat, and the current period's dates.
- **Payment method:** the card's last 4 digits, the holder and the expiry date, plus a "Last payment failed" badge when that applies. If there's no card, it says "No payment method" instead.
- **Usage this period:** one bar per resource with "7,300 of 10,000 runs"-style text. A resource over its limit gets a red bar and an "Over limit" badge.
- **Invoices:** a table of invoice number, date, amount and status (Paid, Open or Failed). If there are none, it says "No invoices yet".
- **While loading:** each card shows grey placeholder lines.

**Supporting changes**
- A new shared `Meter` component for the usage bars (`src/components/Meter.tsx`).
- A `formatNumber` helper in `src/lib/format.ts`, with a test.
- A few layout classes in `base.css`. The two-column row stacks into one column on narrow screens.
- **Tests:** `src/pages/Billing.test.tsx` covers the normal case, failed payment, over limit, no card and no invoices, and a load error followed by a successful retry.

**Decision for you:** I left out the "Change plan" and "Update payment method" buttons shown in the wireframe. `src/api/billing.ts` can only fetch billing data, so the buttons would do nothing when clicked. When there are endpoints (or pages) for those actions, they can go in the cards' button slot, and the failed-payment alert can link to the update flow.

Nothing is committed.
