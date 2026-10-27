## First turn: questions

Before I build, I need three answers. They decide which states and actions the screen has, and the right currency. The visual and motion direction already comes from `DESIGN.md` (dark "night-ink" background, one lime "volt" accent, cream receipt sheet, the motion specs), so I won't ask about that.

**1. Market and currency.** Nothing names one yet.
1. **No specific market (recommended):** English copy, a neutral currency like USD ($), and a note that the locale is easy to swap
2. Indonesia: Rp, id-ID formatting, local rails like bank transfer and VA top-ups
3. Another market (tell me which)

**2. What happens to the money when something fails?** This is a product rule, and I don't want to invent it.
1. **Show only what the system reports (recommended):** a failed payment says "not charged" or "being returned", a pending one says "pending", with no promised timeframes. Any refund timing stays a labelled sample until you confirm it
2. Use specific rules you give me (for example "failed transfers return to your balance within X", "top-ups that fail are reversed by the card issuer")
3. Make it a mix: give me the rules you know and I'll label the rest as unconfirmed

**3. Which actions can the customer take on a transaction?**
1. **A minimal, safe set (recommended):** share or download the receipt, "Try again" on a failure, and "Get help with this transaction". No disputes, cancellations, or fees unless you confirm they exist
2. Add your own: cancel a pending transfer, dispute a payment, repeat a transfer, fees shown on the receipt
3. Something else (describe it)

You can answer with numbers, for example "1, 1, 1". Once you do, I'll build one HTML file with an activity list and a detail screen covering:

- a completed, pending, and failed payment
- a transfer to a friend, including one that is being returned
- a top-up that succeeded and one that failed

It will also have loading, empty, and offline states, all following the motion specs, with reduced-motion fades.

## Final message

I've built the prototype as one file, `index.html`. It has an activity list that opens the transaction detail screen, a working action for every state, and the motion from `DESIGN.md`. I opened it in a headless browser (Playwright) at 320, 390 and 1280 px wide, ran the flows and checked the screenshots. The browser logged no script errors.

**What the customer sees:**
- **Top of the screen (dark):** who the money went to or came from, the amount in the large display font, and a status label.
- **Money path:** a three-point line from where the money came from to where it was going, marking where it is "Now". A failed payment stops at "Stopped" with the money "Still here". A returning transfer curves back toward your balance.
- **Cream receipt sheet:** a plain sentence on what this means for your money, why it happened and what to do next, then the timeline, the details, and the transaction ID (tap to copy).
- **One main button per state:**
  - **Completed:** Share receipt.
  - **Processing:** Check status. It changes to Completed in place, and a completed payment plays the success ring once.
  - **Returning:** Check status. It changes to Returned, then the button becomes "Send $150.00 again", which asks you to confirm first.
  - **Failed top-up:** Try top-up again, where you can change the amount and the account.
  - **Failed payment:** Get help with this payment.
  - Every other state also has a "Get help with this transaction" link.
- **States you can switch to:** the list loading, empty on first use (with Add money), server error, and offline showing saved data. A transaction can also load slowly, fail to load, or show offline saved details. Any request can be set to fail, and reduced motion can be forced. The **Prototype states** panel sits beside the phone on wide screens and behind a button on phones; it isn't part of the product.

**What I decided for you (please confirm or change):**
- **No product name or logo.** The money is just "your balance".
- **Copy only says what the system reports.** No fees, limits, refund times or transfer times are shown, because none are decided.
- **Get help sends an in-app report** and returns a reference number. The real support channel is not decided.
- **"Processing" covers a payment the merchant hasn't confirmed yet.** "Returning" is a transfer that left your balance, couldn't reach the friend, and is coming back. I wrote these rules for the prototype.
- **All names, amounts, card and bank numbers, reasons and IDs are sample data.** No real brands or card networks appear.
- **I added one colour,** `#7A7499`, for form field borders. The existing divider colour was too faint to show where a field is.

**What was not checked:**
- **The RYUX scan tool was not run.** Permissions blocked it because it downloads outside code. Approve it if you want contrast and tap-target size measured automatically; I checked contrast by hand from the colour values.
- **There are no unit tests,** because there is no test setup; a script drove the flows in the browser instead.
- **Motion was checked only partly.** I watched the reduced-motion version (fades only) and the settled end frames, but not frame by frame. I didn't test closing a sheet halfway through opening.
- **Not tested with users** or with a real screen reader.

```
PRODUCT        PASS · each state says what happened to the money and offers one next step; rules not yet decided are labelled assumptions · evidence Thin (brief + DESIGN.md only)
UX             PASS · one primary action per state; money actions confirm with amount and recipient; failures keep you on the form with what you entered
CONTENT        PASS · plain "you" voice, no cheer on failures, one name per thing (Processing, Returning, Get help…), en-US dates and USD
UI             PASS · point of view: night-ink with cream receipt, signature: perforated paper sheet + volt money path · illustration style: none
DESIGN SYSTEM  PASS · DESIGN.md colours, type, radii and spacing; one colour added (field border, reason above); a few small radii off scale (12px icon-button press, 10px skeleton bars, 32px desktop frame)
ACCESSIBILITY  NOT VERIFIED · colour contrast checked by hand from values; focus moves and returns, Esc closes, Tab stays inside dialogs, status shown in words not colour alone; no automated tool or screen reader run
RESPONSIVE     PASS · Playwright at 320/390/1280, no sideways scroll; large amounts shrink to fit ($12,500.00 at 320)
EDGE CASES     PASS · matrix below
CODE QUALITY   NOT VERIFIED · flow script passed, 0 console errors; no unit tests; RYUX scan blocked
VISUAL QA      PASS · Playwright Chromium, 320/390/1280, all 8 transactions plus list, dialog and error states inspected; 4 defects found and fixed
ANTI-SLOP      PASS · counts: 1 accent (volt) + 3 status colours, 1 icon set, 1 display size per screen, 0 emoji, 0 invented logos; swap test: the receipt sheet and money path are specific to this product
FINAL          NOT VERIFIED · accessibility and code checks need the scan or a test setup
```

| View or action | Loading | Empty | Error | Success |
|---|---|---|---|---|
| Activity list | skeleton rows | first use + Add money | server error + Try again; offline shows saved list | loaded list |
| Transaction detail | skeleton in the same layout | can't be empty: it opens from a row | load failed + Try again / Back; offline saved details | 8 sample transactions |
| Check status | "Checking…" | n/a | message; button comes back | status changes in place |
| Send again / top-up | "Sending…" / "Adding…" | amount check ("Enter an amount to add.") | inline error (server vs offline) | new transaction opens |
| Help report | "Sending…" | issue preselected | inline error, text kept | reference shown |

**How to test this with users:** give five people the phone and ask "Did your $150 reach Fernanda, and where is it now?" It works if they say it's coming back to their balance, without scrolling past the sentence under "What this means for your money". If they read the money path as a progress bar for the send itself, the path's labels need rework.
