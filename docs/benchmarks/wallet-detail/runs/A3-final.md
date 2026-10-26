I've built the prototype as a single file: `index.html`. Open it in any browser. On a phone it fills the screen. On a desktop it shows inside a phone frame, with a scenario list on the left to jump to any case.

I scripted all the main flows in headless Chrome and they ran with no JavaScript errors: retrying the failed payment, reminding and cancelling, correcting the bank name, choosing another top-up method, the over-balance error, reporting a problem, freezing the wallet, splitting a bill, the receipt and the "Needs attention" filter. I looked at screenshots in dark mode only, and nothing was tested on a real phone.

**How it flows:** You start on Activity, which shows your balance, filter chips (including "Needs attention" with a count) and transactions grouped by day. Tap one to open its detail screen. Every detail screen has the same layout:
- the merchant, friend or bank, with a status badge
- the amount, with a line underneath saying what happened to your money ("You weren't charged", "Set aside from your balance", "Returned to your wallet")
- a message explaining the problem, if there is one
- buttons to fix it
- a status timeline
- the details (copyable reference, editable category)
- "Problem with this payment?"

**The nine scenarios:**

| | Normal | Something went wrong |
|---|---|---|
| **Payment** | Paid, with cashback and an itemised order. Split bill, receipt. | **Failed, not enough balance:** "Add $17.70 and pay" or pay by card. **Refund in progress:** driver cancelled, refund timeline. |
| **Transfer** | Sent to Maya: send again, request, receipt. | **Pending:** Sam hasn't claimed it yet, with Remind and Cancel (asks you to confirm). **Returned by bank:** name didn't match, money back, fix the name and retry. |
| **Top-up** | Added from a debit card. | **Delayed:** bank charged you but the money hasn't arrived; explains the automatic refund deadline. **Card declined:** choose another method (instant or 1–3 days). |

**Design choices worth knowing:**
- **Your money comes first.** Every problem message says plainly where the money is and whether you need to do anything.
- **Retries make a new transaction.** The failed one stays in your history with a link to the new one, as real banks and wallets do.
- **Reporting adapts to the problem.** The reasons depend on the transaction type, and failed transactions add "I was charged even though it failed".
  - "I didn't make this" suggests freezing your wallet first. While frozen, every action that moves money is blocked.
  - "Sent to the wrong person" suggests asking them to send it back.
  - A delayed top-up explains that it's already being tracked.
  - Sending a report opens a case, which then shows on the detail screen.
- **Errors explain how to fix them.** Sending more than your balance offers "Add $X first" and then brings you back to the send screen. Re-entering the bank name that was rejected is blocked with a hint.
- **Also included:** dark mode, reduced motion, keyboard focus kept inside open sheets (Esc closes them), labels for screen readers, and the browser Back button works.

Everything is invented (brands, money, dates; "today" is set to Oct 26, 2026). Data lives only in the page, and "Reset prototype data" restores it. One small thing: the blocking "wallet is frozen" message uses the same checkmark icon as success messages.
