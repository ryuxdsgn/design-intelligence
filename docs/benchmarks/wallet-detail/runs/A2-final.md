I've built the prototype as one file: `index.html`. It covers a payment, a transfer to a friend and a top-up, each in a normal, waiting and failed or refunded state.

**How I checked it:** the script passes a syntax check, and I looked at headless Chrome screenshots of several screens on phone and desktop widths. They render properly. I did not click through the interactive flows in a browser, so retry, reporting, sharing and cancelling are reviewed in code only. Please tap through those first.

**The 9 scenarios**

| | Normal | Waiting | Something went wrong |
|---|---|---|---|
| **Payment** | Coffee shop paid with a promo; shows points earned | — | Not enough balance, so the customer wasn't charged · Partial refund (one item out of stock) |
| **Transfer** | Sent instantly to a friend, with their note | Bank transfer slower than usual; option to get notified when it arrives | Bank rejected it (closed account) and the money came back |
| **Top-up** | Added to balance | Waiting for payment to a bank account number, with copy buttons, a live countdown and steps | Bank charged the customer but the top-up failed; refund in progress |

**How each screen is laid out**
- **Summary at the top:** who the money went to or came from, the amount, a status badge and the date. The badge uses an icon and text as well as colour. A failed amount is greyed out and says "You weren't charged" or "Money returned to your balance".
- **"Your money" box on every problem screen:** it says where the money is now, by when anything will be fixed, and whether the customer needs to do anything. This is the main thing someone wants to know when a payment goes wrong.
- **Status timeline** for anything with several steps, such as bank accepted, bank rejected, refunded.
- **Details** with copy buttons for transaction, refund and bank reference IDs.
- **Main button that fits the situation:** for example "Top up Rp 136.500 & pay", "I've transferred", "Send again" or "Top up another way". It stays pinned to the bottom of the screen.

**What you can click**
- **Retry a failed payment:** a confirm step, then a PIN pad (any 6 digits work), then processing. The screen then switches to a completed payment and keeps the failed first attempt in its history.
- **Report a problem:** pick an issue, add details, then get a case number. A "We're looking into it" card then stays on the transaction. Choosing "I didn't make this" also offers to lock the account.
- **Waiting top-up:** "I've transferred" turns it into a completed top-up. "Cancel" warns the customer not to send money to the old account number afterwards.
- **Also:** sharing a receipt (shows only safe details; uses the phone's share menu or copies the text), contacting support with the transaction attached, and an Activity list reached with the back arrow.

On a phone it fills the screen. On desktop it shows a phone frame with a scenario list beside it and a reset button. Each scenario has its own link, such as `#/tx/topup-failed`. It works with a keyboard and screen readers, and animations stop if the device is set to reduce motion.

**Things to know**
- I made up a brand called "Pocket" and used Indonesian rupiah and banks (BCA, Mandiri, BRI), based on wallets like GoPay, OVO and DANA. Tell me if you want another currency or market.
- Buttons that lead outside this screen, like "Send again" or "Split bill", show a "Prototype:" message instead of opening anything.
