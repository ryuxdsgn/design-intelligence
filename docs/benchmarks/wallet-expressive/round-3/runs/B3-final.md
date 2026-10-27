## First turn: questions

Before building, RYUX's Build step asks me to settle the open product questions. These three change what the screen shows, and the brief and DESIGN.md don't answer them:

1. **Market and currency.** Which market is this for? That sets the language, currency format, and dates (e.g. Indonesia with Rp45.000, "27 Okt 2026, 14.30 WIB" and Bahasa copy, or English with another currency). There's no default, so I need you to pick.

2. **Fees.** Should payments, transfers, or top-ups show a fee line? If you don't have real fee rules, my suggestion is to show "Fee: Rp0 / free" as labeled sample data, or leave the fee row out completely so I don't make up a pricing policy.

3. **What happens to the money when something fails.** This decides what the failure screens can promise. My suggested defaults, all marked as assumptions in the prototype:
   - **Failed payment:** the money never left the balance, and the customer can try again.
   - **Transfer stuck "in progress":** it shows as pending, and the customer can contact support. No made-up refund timeline.
   - **Top-up that was charged but not credited:** this one shows only "We're checking with your bank" plus a contact action, with no promised refund date unless you give me one.

If you reply **"go with defaults"**, I'll use Indonesia/Rupiah, leave the fee row out, and use the failure rules above. I'll then build the single-file prototype with all three transaction types and their success, pending, and failed states.

## Final message

I built the prototype as one file: `index.html`. Every flow I clicked through worked at 390 px and 320 px, with no script errors and no sideways scrolling. The one check I couldn't run is the RYUX scanner (`npx @ryuxdsgn/design-intelligence scan`), because running a downloaded package was blocked here. You can run it yourself if you want that check.

**What's in it**
- **Activity list → transaction detail.** The list opens the detail screen, and the browser's back button works the same as the app's back button. The list has 10 sample transactions covering a payment, a transfer, and a top-up, each as completed, in progress, and failed. One has a long shop name and a large amount ($1,250.00) to test long content.
- **The signature element: a "money pebble".** It sits on a curved line between who the money came from and who it went to, and shows where the money is right now:
  - **Completed:** it travels to the far end, squashes softly, sends out one ring, and a check appears. This is the one moment of delight.
  - **In progress:** it stops halfway and bobs gently. This is the only thing that loops.
  - **Failed:** it hits a break in the line and rolls back home. No celebration.
  - It plays once per transaction per session and again when the status changes. The amount never moves.
- **Each detail screen** shows the status, the amount, one plain sentence about where the money is, the details with a copy button for the transaction ID, and a progress timeline.
  - **Failed** screens add "What happened" and "What you can do" with one **Try again** button. Tapping it opens a confirmation showing the amount and who it goes to, then "Paying…" while it runs (back is blocked during this, with a note saying why), then the result.
  - **Completed** screens have **Share receipt**, which copies the receipt as text.
  - **Every** screen has **Get help with this …**: a message box that tells you if it's empty, keeps your text if you're offline, and confirms when it's sent.
- **Other states:** a loading skeleton, "We couldn't load this transaction" for a server error, and "You're offline", each with a way to try again.
- **Prototype controls** (shown on top on a phone, in a side panel on desktop): slow loading, server error, offline, whether a retry succeeds or fails, finishing an in-progress transaction, a reduced-motion preview, and a reset.

**Decisions I made that you should confirm** (also listed at the top of the script)
1. **In progress** means the money has left your balance but hasn't arrived. **Failed** means it never left, or came back. A **failed top-up** means nothing was taken from the bank.
2. **Retrying** counts as a new attempt, so it always asks for confirmation first.
3. **No fees, arrival times, or refund timelines** are shown, because those policies aren't decided.
4. **Support** is an in-app message only; I didn't name any other channel. **Share receipt** copies text; there's no PDF.
5. **Brand:** I left out a product name and logo. The look is my proposal: a warm paper background, persimmon as the one brand colour, and the Nunito font (loaded from Google Fonts, with a system font as fallback). All people, shops, the bank, amounts, and IDs are made-up sample data.

**Delivery Gate**
```
PRODUCT        PASS · every failure says where the money is; policies left out rather than invented · evidence None (brief + DESIGN.md + standards; no reference screens available)
UX             PASS · one primary action at most per state; retry confirms amount and recipient; back blocked only while a retry or help message is sending
CONTENT        PASS · statuses are Completed / In progress / Failed everywhere; errors say what happened, where the money is, and what to do; fixed a bug where a shop's first word was used as a name
UI             PASS · point of view: each transaction is a short story; signature: the money pebble · illustration style: inline-SVG icons, one stroke set; people are circles, places are rounded squares
DESIGN SYSTEM  PASS · tokens for colour, type, spacing, radius, and motion; one reusable sheet for confirm, receipt, and help
ACCESSIBILITY  PASS · contrast measured: all text 5.3–15.3:1, pebble 3.5:1, field border fixed from 2.3 to 4.1:1; buttons at least 44 px (copy-ID 36 px); focus moves to the new screen and returns after a sheet closes; status never shown by colour alone · no screen reader test
RESPONSIVE     PASS · 390, 320, and 1280 rendered; no sideways scroll; long names wrap or are cut off with the full name shown in details
EDGE CASES     PASS · see the table below
CODE QUALITY   NOT VERIFIED · flows run in a scripted browser with no errors; the RYUX scanner was blocked; no test runner in the project, and I didn't add one
VISUAL QA      PASS · Playwright Chromium at 390/320/1280; all 10 transactions plus confirm, in-flight, offline retry, help sent, skeleton, load error, and receipt · reduced motion not rendered
ANTI-SLOP      PASS · counts: 1 accent colour + 3 status colours, 1 warm grey family, 3 radii, 1 display size, 1 icon set, 0 emoji, 0 logos, no invented numbers
FINAL          NOT VERIFIED · scanner not run; reduced motion and screen readers not tested; not tested with users
```

| | Loading | Empty | Error | Success |
|---|---|---|---|---|
| Opening a transaction | skeleton | can't happen (a detail always has data) | server error / offline, both with Try again | the detail screen |
| Try again | "Paying…" with back blocked | — | offline (stays in the confirmation); fails again (shown on the screen) | changes to Completed and the pebble lands |
| Help message | "Sending…" | empty field shows an error | offline, text kept | "Message sent" |
| Copy ID / receipt | instant | — | "Couldn't copy" message | "Copied" message |

**To test with users:** the riskiest assumption is that people read the pebble as where their money is. Give five people the failed transfer and ask "Where is your $15 right now?" If fewer than four answer "in my balance" without reading the sentence, the pebble is decoration rather than explanation, and it needs a label or a rethink.
