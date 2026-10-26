The Billing page is at `#/billing` in the nav, built from `src/api/billing.ts` and following the wireframe's layout. Typecheck, all 14 tests and `npm run build` pass. Five of the tests are new page tests, one for each state the fake backend can return.

**What's on the page** (`src/pages/Billing.tsx`)
- **Alert area:** shown only when something needs attention.
  - **Failed payment:** a red banner says the amount, the date, the card's last four digits and the reason. For a declined card it adds "Contact the bank that issued it to find out why."
  - **Over limit:** an amber banner names which usage is over its limit.
- **Plan:** the plan name, "8 seats × $12.00 per seat a month", and the current period.
- **Payment method:** the card ending, the holder, the expiry, and the last payment with a Paid or Failed badge. If there's no card, it says "No payment method on file".
- **Usage this period:** "412 of 500 GB" with a bar for each item. Over the limit, the bar turns red and shows "30 GB over".
- **Invoices:** number, date, amount and status, with an empty state when there are none.
- **Loading and error:** placeholder cards while it loads. If billing can't load, a "Billing couldn't load" banner with a **Try again** button that reloads.

**Shared code I changed**
- **Dates now show in UTC** (`formatDate` in `src/lib/format.ts`). Before, "Oct 1" showed as "Sep 30" for anyone west of UTC, which made billing periods wrong. This assumes the API's dates mean UTC days; it affects every date in the app.
- **New pieces:** `formatNumber` (for "7,300"), `usageLevel` in `src/lib/usage.ts` with tests, and a small `Meter` component, since there was no progress bar.
- **Table and Banner styles:** table cells no longer wrap mid-value ("INV-/0006"), "Try again" no longer wraps inside the banner, and cards have less padding on phones. Members uses the same Table and Banner, so it gets these too.

**Not built, because the API doesn't support it**
- **No buttons on the Plan and Payment method cards.** The wireframe has them, but there's no change-plan or update-card action to connect, and a button that does nothing would be worse. That's why the failed-payment banner gives advice but no button.
- **No invoice download links.** Invoices have no file URL.

**What I checked by hand**
- **Desktop (1280px):** every scenario renders correctly.
- **Narrower widths:** loading, error, empty and payment-failed at 768, 375 and 320px; over-limit at 375. Everything fits from 375px up.
- **At 320px:** the invoice table scrolls sideways and hides the Status column. The failure still shows in the banner and the Payment method card.
- **Navigation at 320px:** the nav's Billing link starts partly off-screen; you have to scroll the nav to reach it.
- **Not checked:** screen readers and keyboard use. Nobody has tested the page with real users.
- **Not run:** the RYUX design scan, because downloading its package was blocked. Approve it if you want it run.

**Decisions for you**
1. Should a failed payment link somewhere the owner can fix it? There's no update-card page today.
2. Do billing dates really mean UTC days? That decides whether the `formatDate` change is right.
3. Should usage warn before it hits the limit, for example at 90%? I didn't add a threshold, because nothing in the brief or the API defines one.
