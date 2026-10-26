I've built the transaction detail screen as a single file, `index.html`. It opens on an activity list, and tapping any row opens its detail screen. The 13 sample transactions cover a payment, a transfer (sent and received) and a top-up, in every state: completed, processing, failed, returned and refunded. I drove all of them in headless Chromium at 390 and 320px with no console errors and no sideways scrolling. It hasn't been tested with real users.

**How the screen works**
- **Top of the screen:** who it was with, the amount, a status label with an icon, and the date.
- **"Where your money is" line:** one sentence under the amount in every state, such as "−$24.60 from your balance", "Nothing was taken from your balance", "$80.00 back in your balance" or "Not in your balance yet". This is the screen's distinctive element.
- **Status box:** shown only when something isn't finished or went wrong. It says what happened, why if known, and what to do next, with at most one filled button:
  - Processing: "Refresh status". The pending transfer to Maya Chen completes on refresh, so you can see the status change; the other pending items say "Still processing. Checked at…".
  - Failed or returned transfer: "Send again".
  - Failed top-up: "Top up again", with a choice of another card or the bank account.
  - Failed payment: tells you to pay again at the shop, since there's nothing to retry from the wallet.
- **Below that:** a progress timeline when there's more than one step, the details (reference with a copy button), then "Share receipt", "Send again" and "Report a problem".
- **Working flows:** the confirm sheet for sending or topping up again (the new transaction replaces this screen, and back goes to Activity), the report form (it checks a reason was chosen and keeps your text if sending fails), and the receipt sheet.
- **Other states:** a skeleton while loading, a load error with "Try again", and an offline banner. Actions taken offline fail with the message "nothing was sent" and keep your input.
- **Prototype controls:** at the bottom of Activity, marked as not part of the app. They switch on offline, slow loading (3 seconds), and "next transaction fails to load".

**Assumptions**
- **Policies aren't on screen.** Since none were decided, the screen never mentions fees, refund times, transfer times or support channels. What it says about your balance comes from a per-transaction field a real backend would send, so it never promises anything. There's no fee row; one appears only if the data includes a fee.
- **Not confirmed as product features:** sharing a receipt, reporting a problem (what happens after a report is undecided, so the screen only says it was received), sending or topping up again (same amount; editing it is out of scope), and refreshing the status.
- **Visual style is my proposal:** warm off-white background, one blue for actions and focus, red/amber/green only for status, the phone's system font, corner radii of 8 and 16, and icons drawn for this prototype.
- **Everything shown is sample data:** names, merchants, amounts, card numbers, reference IDs and failure reasons.
- **I left out:** dark mode, a separate tablet layout (wider screens get a centred 440px column), and a real live update while a transaction is processing (in the prototype you refresh).

**Delivery Gate**
```
PRODUCT        PASS · user, task, first thing seen, primary action from your answers; no business rule stated as fact · evidence None (ryux MCP not connected; judgment + DESIGN.md)
UX             PASS · status → money → next step → proof; one-way door after send/top up again; back restores focus
CONTENT        PASS · plain "you" voice, no cheer on failure; one label per action; sign shown only when the balance moved
UI             PASS · point of view: "where your money is", signature: the one-line money line under the amount · illustration style: none
DESIGN SYSTEM  PASS · proposed tokens; one shared sheet for send/top up again; one detail-row and one action-list pattern
ACCESSIBILITY  PASS · text contrast 5.0–8.5:1 measured; button border raised to 8.5:1; status = icon + text; native dialogs; keyboard order and focus return checked by hand; no automated audit or screen reader run
RESPONSIVE     PASS · 390 and 320 rendered, no horizontal overflow, longest name wraps, $12,480.00 fits at 320
EDGE CASES     PASS · matrix below
CODE QUALITY   NOT VERIFIED · flow script passed with 0 console errors; no unit tests (single-file prototype, no test runner); RYUX scan not run (permission denied)
VISUAL QA      PASS · Playwright/Chromium, 390 + 320, all 13 transactions, skeleton, load error, offline, 3 sheets, refresh busy/done
ANTI-SLOP      PASS · counts: 1 accent, 1 grey family, radii 8/16/full, 1 display size + 3 text sizes, 1 icon set, 0 emoji, 0 gradients, 0 invented logos
FINAL          NOT VERIFIED (CODE QUALITY)
```

| View / action | Loading | Empty | Error | Success |
|---|---|---|---|---|
| Transaction detail | skeleton | missing note or fee → row hidden | load error + try again; offline → cached with banner | 13 sample transactions |
| Refresh status | "Checking…" | n/a | offline message | completed or "still processing" |
| Send / top up again | "Sending…", sheet stays open | n/a | offline, "nothing was sent" | new processing transaction |
| Report a problem | "Sending…" | reason missing → error on the field | offline, text kept | "Report sent" |
| Copy reference / receipt | instant | n/a | "Couldn't copy" message | message confirms the copy |

**Not run:** `npx @ryuxdsgn/design-intelligence scan index.html` was blocked by the permission check because it downloads outside code. Run it yourself if you want that check; it's what moves CODE QUALITY off NOT VERIFIED.

**User test plan:** five people who use a wallet app open a failed transfer and a pending top-up. For each, they say whether money left their balance and what they'd do next. It works if at least 4 of 5 answer both correctly. If people misread the money line on failures, rethink the screen layout itself rather than reword the copy.
