I added the Billing page at `#/billing` and linked it in the nav. It follows the wireframe layout: an alert area, then Plan and Payment method side by side (stacked on mobile), then Usage this period, then Invoices. Typecheck, tests (10 passing, 5 of them new for this page) and the build all pass. I didn't open it in a browser, so the layout has only been checked through tests and the build, not by eye.

**What it shows**
- **Plan:** the plan name, the price breakdown ("$12.00 per seat × 8 seats = $96.00 / month") and the current billing period.
- **Payment method:** the last four card digits, the holder's name and the expiry date, with an "Expired" badge if the card has expired. If there's no card on file, it shows an "Add payment method" button instead.
- **Usage:** a bar for each limit. A bar turns amber at 90% of the limit and red once it's over, and the text then reads "530 of 500 GB (30 GB over)".
- **Invoices:** a table with number, date, amount and a status badge. If there are no invoices, it says so instead.

**When something's wrong**
- **Data can't load:** an error message with a "Try again" button.
- **Last payment failed:** a red alert with the amount, the date and the reason ("the card was declined"), plus an "Update payment method" button. The failed invoice is also marked in the table.
- **Other alerts:** an amber warning when there's no payment method, when the card has expired, or when usage is over a limit.
- **While loading:** placeholder lines inside each card.

You can see each case by adding `?scenario=` to the URL with `error`, `payment-failed`, `over-limit`, `empty` or `slow`.

**Other changes**
- **Dates now show in UTC.** Billing periods start at midnight UTC, so in US time zones the October period would have shown as starting "Sep 30". I changed `formatDate` in `src/lib/format.ts`; nothing else used it yet, and I made its test check the exact date. I also added `formatNumber` for the usage figures.
- **New usage bar component:** `Meter` in `src/components/`. I also added a few layout styles to `base.css` (`.grid-2`, `.stack-sm`, `.muted`, `.lead`), all using the existing tokens.

**Decision for you:** the "Change plan", "Update card", "Add payment method" and "Update payment method" buttons don't do anything yet, because `src/api/billing.ts` only loads data and has no way to change it. They're there to match the wireframe. They can be hidden until those actions exist, or connected to them once you add them.
