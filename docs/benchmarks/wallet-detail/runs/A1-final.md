I've built the prototype as a single file, `index.html`; open it in any browser. I checked every flow below in a headless browser at phone size (390px wide), plus the desktop and dark-mode layouts. There were no console errors. One small style fix (the status-badge border in the list) went in after the final browser run.

**How it's laid out**
- **On a phone** it fills the screen and opens on an Activity list with the balance. Tap any transaction to see its detail screen.
- **On a wide screen (900px or more)** the app sits in a phone frame, with a side panel for jumping straight to any of the 10 scenarios and a "Reset demo data" button.
- You can link straight to a scenario with `#/tx/<id>`, for example `#/tx/pay-failed`.

**The detail screen, from top to bottom:** who the money went to or came from, the amount, a status label, and a one-line answer to "where's my money?". Below that comes a coloured box explaining the problem with buttons to fix it, then quick actions (Receipt, Report, Get help), a status timeline, the amount breakdown, the details with a copyable reference number, and, for payments, a category and private note.

| | Normal | When something goes wrong |
|---|---|---|
| **Payment** | Completed (coffee, with tip and cashback) | **Hotel hold:** money reserved but not charged, released by Nov 2 · **Failed for low balance:** "Top up & pay" works out how much is missing · **Partial refund:** shows the original amount, the refund, and what you actually paid |
| **Transfer to a friend** | Completed, with "Send again" | **Friend hasn't claimed it yet:** send a reminder, or cancel and get the money back · **Rejected by the friend's bank:** the money and fee are back; fix the details and resend |
| **Top-up** | Completed from a card | **Bank transfer in progress:** "left your bank, not in your wallet yet, it's safe"; "Check status" · **Card declined:** retry with the same card (declines again) or another card (works) |

**Design choices**
- **Every problem state answers "was I charged, and where is my money now?" first.** Failed and cancelled amounts are crossed out, with a caption like "You weren't charged".
- **Every error offers a way forward.** Each problem has a button that runs a working flow, ending with a confirmation, loading states and a result.
- **The balance stays consistent across flows.** For example, resending to your friend shows that your $41.20 balance can't cover it and offers the linked bank account instead.
- **Reporting a problem is a guided process.** You pick a reason, then see advice for that reason:
  - **"I don't recognize this":** suggests freezing the wallet and cards, which really does freeze the wallet in the prototype.
  - **Top-up still in progress:** explains it may still arrive by itself.
  - **"I didn't get what I paid for":** suggests contacting the merchant first.
  - **"I sent it to the wrong person":** explains the transfer can't be reversed automatically.

  You then get a case number, which you can view or withdraw.
- **Accessibility:**
  - Panels slide up from the bottom; the keyboard stays inside them and Escape closes them.
  - Screen readers hear the timeline steps' states and status messages.
  - Touch targets are at least 44px.
  - Dark mode follows the system setting, and animation is reduced if the user asks for that.

**Simulated parts:** support chat only shows a "would open here" message. Sharing uses the device's share menu where it exists and copies the receipt text otherwise. Dates are fixed around today, Oct 26. Amounts are in US dollars.
