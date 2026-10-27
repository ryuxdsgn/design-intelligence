## First turn: questions

RYUX is loaded and I'm in **Build** mode. I read `DESIGN.md`, which sets the direction (playful, warm, calm about money, expressive motion, a warm voice), so I won't ask about style. Before building, RYUX wants me to settle the few product facts that change which screens and states exist and what the copy says. There are three, and I'll wait for your answers before writing the file.

**1. Market and currency.** Neither the brief nor DESIGN.md names one, and it decides the currency, number format and language.
1. **No specific market: English, a neutral currency code (sample amounts), standard number formatting** *(recommended)*
2. Indonesia: Rp, id-ID formatting, English UI
3. US: $, en-US
4. Other (tell me which)

**2. What happens to the money when something fails.** This decides the main message on the failure screens and the next step offered.
1. **Failed means nothing left the balance. If a charge was held, it's released automatically, and the screen says "no money left your wallet" or "held, being returned" without promising a timeframe** *(recommended: no invented refund window)*
2. You have a real rule, such as returned within N business days (give me N)
3. A failed payment opens a support or dispute flow (tell me what it's called)

**3. Which failure and pending states to include.**
1. **Payment declined (not enough balance), transfer pending (friend hasn't accepted or claimed it), transfer failed and returned, top-up processing, top-up failed. Each has one clear next step: retry, top up, cancel transfer, or get help** *(recommended)*
2. The list in option 1 plus partial refund and reversed or disputed payment
3. Only the success, pending and failed versions of each of the three types

You can answer with numbers (for example "1, 1, 1"), or just say "go with the defaults".

## Final message

I've built the transaction detail screen as one file, `transaction-detail.html`. Open it in a browser and tap any row in the activity list. My browser tests of every state and flow passed, but it hasn't been tried with real users.

**What it covers**
- **Nine sample transactions:** a payment, a transfer to a friend and a top-up, each completed, pending and failed. Cancelling the pending transfer gives a tenth state, cancelled.
- **Every failure says what happened to the money and what to do next:**
  - The declined payment shows how much was in the wallet and how much was needed, offers "Top up wallet", and suggests the shortfall ($53.00) as the amount.
  - The failed transfer and failed top-up each have "Try again".
  - The pending transfer can be cancelled.
- **Money only moves after a confirmation sheet.** The sheet shows a spinner while it works, and if it fails, an error appears in the sheet with the money's state ("Nothing left your wallet").
- **The screen itself has a loading state and a "Couldn't load" state** with a retry and a way back.
- **The money path is the signature element.** A coin moves along a track between you and the other side, and where it stops is the status: it lands with one small celebration when done, waits halfway while pending, and comes back to you when something failed. With reduced motion turned on, everything is a fade.
- **A "Prototype controls" panel** lets you make a pending transaction complete or fail live, show the loading and error states, make the next confirmation fail, and simulate reduced motion. It's a "Show" bar at the top on a phone and opens beside the app on wide screens.

**Assumptions, also listed in the panel, since none of these were decided**
- No fee row is shown.
- Failed means nothing left the wallet.
- A pending payment is "on hold in your wallet".
- A pending transfer can be cancelled until it arrives.
- "Get help" sends a report but promises no channel or reply time.
- The brand is my proposal: a tangerine accent, the Nunito typeface (loaded from Google Fonts, with a system fallback) and rounded shapes. There is no app name or logo.
- All names, amounts and reference numbers are sample data in USD.

**Checking**
- Playwright tests (`qa/run.mjs`, `qa/motion.mjs`) checked all 9 transactions and the list at 390 and 320 wide, plus a 1280 desktop view. They found no sideways scrolling and no script errors.
- They also drove every flow: cancel, the failed-confirmation error, try again, declined payment to top-up, live completed and failed changes, Escape closing a sheet, the help report, load error and retry, and copying the reference.
- I confirmed the coin's journey frame by frame. Opening and closing a sheet quickly, and reduced motion, behave correctly.
- Fixed along the way: the coin wasn't showing at all; the cancel sheet focused the destructive button instead of "Keep it"; focus was lost after a status change; interrupted animations threw errors; and the top-up amount wasn't explained.
- **Not re-run:** the RYUX scanner (`npx @ryuxdsgn/design-intelligence scan`). Its first run gave 0 failures and 1 warning about three hard-coded colours. I moved those into named colours, but a second run was blocked as external code, so that fix hasn't been rescanned.

```
PRODUCT        PASS · no fees, policies or support channels invented; assumptions listed · evidence None (no reference screens, judgment calls)
UX             PASS · who, how much, where the money is, what's next, in that order; at most one main button per state
CONTENT        PASS · plain "you" voice; every failure says what happened to the money; one label per status
UI             PASS · point of view: each transaction is a short trip for your money · signature: the money path · illustration style: icons and initials only
DESIGN SYSTEM  PASS · one colour set, 4 text sizes, 3 corner sizes plus pill, one icon set, one sheet reused for every confirmation
ACCESSIBILITY  PASS · all text pairs pass WCAG AA (lowest 4.55:1); status shown by text and icon, not colour alone; changes announced to screen readers; focus handled; no automated audit tool was run
RESPONSIVE     PASS · 320, 390 and 1280 checked; long merchant name wraps or truncates cleanly
EDGE CASES     PASS · each type × completed/pending/failed, plus cancelled, loading, load error, confirmation failing, copy failing
CODE QUALITY   PASS · Playwright flow tests and motion sampling pass; no build step needed; scanner re-run blocked
VISUAL QA      PASS · Playwright Chromium at 320, 390 and 1280: all 9 transactions, list, sheets, error states
ANTI-SLOP      PASS · 1 accent colour, 1 grey family, 1 icon set, 0 emoji, 0 logos, 1 decorative gradient (the loading shimmer)
FINAL          PASS · checks met; not tested with users
```

**To test with users:** five people check three sample transactions right after making them. Ask "Where is your money right now?" for the pending transfer and the declined payment. It works if they answer correctly without reading the timeline. If people misread the halfway coin as "half paid", replace the halfway position with a waiting icon.

Files are in ``:
- transaction-detail.html
- qa/run.mjs
- qa/motion.mjs
