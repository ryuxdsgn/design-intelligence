## First turn: questions

I've loaded RYUX in Build mode and read DESIGN.md. It already sets the UI direction, motion, and voice: deep ink base, one vivid accent for moving money, a display face for amounts, plain and exact copy. RYUX asks me to settle a few product rules before building, because the answers change which states and actions the screen has. Three questions; reply with numbers (for example "1a 2a 3b") or your own answer.

**1. Market: language and currency**
- **a. No specific market (recommended).** English copy, with amounts in US dollars as labelled sample data (for example $1,250.00). Swapping the locale later is a format change, not a redesign.
- b. Indonesia: Bahasa Indonesia, Rp1.250.000, 14.30 WIB.
- c. UK or EU: £ or €, 24-hour times.
- d. Somewhere else (tell me).

**2. What happens to the money when something fails**
- **a. Not decided yet (recommended).** I'll build two failed states: "Not taken, your balance didn't change" and "Taken, then being returned". The return time will show as an open item marked to confirm, not as a promise.
- b. It always goes back to the wallet balance automatically, within ___ (give the time).
- c. It goes back to the original source (card or bank), within ___.
- d. Failures never take money; only the "not taken" state exists.

**3. Fees, and what the customer can do after a failure**
- **a. A fee line appears only when the transaction has one (recommended).** The sample card top-up shows a $0.00 fee row. After a failure the customer can "Try again" and "Get help". "Get help" opens a sheet saying it's a prototype stub, not a real support channel.
- b. No fees anywhere. Same failure actions as a.
- c. Give me the real fee rules and the support options that exist (chat, phone, dispute form).

Once you answer, I'll build one HTML file covering:
- the three transaction types: payment, transfer to a friend, top-up
- their states: success, pending, failed (both kinds), and reversed
- loading and offline states
- the motion from DESIGN.md

Then I'll render it at 320, 390, and 768 px and close with the Delivery Gate.

## Final message

I've built the transaction detail screen as `index.html`, a single file with no build step. It opens from a small activity list with eight sample transactions that cover a payment, a transfer to a friend and a top-up, including the failure cases. All 13 tests in `tests/prototype.test.mjs` pass and I checked screenshots at 320, 390 and 1280. Two checks didn't run: the RYUX design scan, and a full test of reversing the animations halfway.

**How it works**
- **What you see first:** status, amount and a one-line summary of what it means for your money ("This payment didn't go through… Your balance didn't change."). Status always has an icon and a word, never colour alone. Amounts carry a − or + sign only while the money is actually gone or added, so a failed or returned amount shows no sign.
- **"Where your money went":** a short timeline showing where the money went and where it stopped. This is the screen's signature element. The violet accent marks only money that moved: it fills the line when money moved and stays off it when nothing did.
- **States covered:** paid, sent, added, pending, failed with nothing taken, money on its way back, money returned, loading, offline (a saved copy with its time), and "couldn't load" with Reload and Back.
- **Recovery:**
  - "Try again" opens a sheet that restates the amount, recipient and source before you confirm.
  - While it processes, back is blocked and the screen says why.
  - A second failure explains itself and lets you try again or cancel.
  - Success updates the status, adds the earlier failed attempt to the timeline, and plays one short success moment.
  - There's no "Try again" while money is still on its way back, so it can't be spent twice.
- **Motion:** follows DESIGN.md (rows press down, the detail slides in over 240 ms, the amount settles with a spring, sheets slide up from below). With reduced motion on, everything becomes a fade.
- **Prototype panel:** a sheet on phones, beside the phone at 960 px and wider. It switches how a transaction loads and whether a retry works, triggers live status changes, and lists the open policy questions.

**What I assumed (no policies were decided)**
- The screen never promises fees, how long a return takes, dispute routes or support channels. "Get help" gives you the reference to copy and a clearly marked note that support options aren't decided.
- Money that fails after leaving the balance comes back to the balance. That's the sample data for this prototype, not a confirmed policy.
- US English and USD, matching the sample data. All people, merchants, cards and references are made up; the card shows only "Debit card ••4417", with no card network.
- No brand name or logo appears anywhere. The look is my proposal: a warm plum-black base, one violet accent, and the Archivo typeface (loaded from Google Fonts) with a wider setting for amounts.
- I built one direction. The alternatives I didn't build were a receipt-style layout and a timeline-first layout.

**Delivery Gate**
```
PRODUCT        PASS · task: confirm what happened to the money and what to do next; no invented policy · evidence None (no reference screens; brief and standards only)
UX             PASS · every action defined before / during / result / recovery; back blocked only while processing; finished retry can't be reopened
CONTENT        PASS · "you", says what happened + what it means for money + next step; one word per status; no cheer on failure
UI             PASS · point of view: "money trail", signature: timeline where the accent marks only money that moved · illustration style: none
DESIGN SYSTEM  PASS · one sheet component reused for help, retry and the prototype panel; tokens for colour, spacing, radius, motion
ACCESSIBILITY  PASS · contrast measured 4.8–16.7:1 (border fixed from 2.4); real buttons and headings; focus returns to the trigger; Escape closes sheets; status changes announced to screen readers · no automated audit tool run
RESPONSIVE     PASS · no sideways scroll at 320/390/768/1280 in all 8 transactions (tested)
EDGE CASES     PASS · see matrix
CODE QUALITY   NOT VERIFIED · 13/13 tests pass (pure logic + browser flows); RYUX scan not run (needs permission to download it)
VISUAL QA      PASS · Playwright/Chromium screenshots at 390 and 320 of every transaction and state, plus 1280
ANTI-SLOP      PASS · counts: 1 accent hue, 1 grey family, radii from the shape scale, 1 display size per screen, 1 icon set (Lucide), 0 emoji, 0 invented logos, 0 gradients; swap test: brand layer is specific
FINAL          NOT VERIFIED · scan not run; motion checked for reduced motion, not for reversing halfway; not tested with users
```

| View / action | Loading | Empty | Error | Success |
|---|---|---|---|---|
| Transaction detail | skeleton in the same layout | can't happen: it opens from an existing row | load error + offline saved copy | 8 sample transactions |
| Try again | spinner, back blocked | — | fails again, explained, can retry | updates to Paid with success moment |
| Copy / share | instant | — | clipboard failure message | confirmation message |

**Riskiest assumption to test with people:** that customers read "Returning" and the timeline as "my money is coming back" without being told how long it takes. A test with 5 recent wallet users would: show the returning transfer, ask "where is your $120 now?", then show the failed-not-taken payment and ask "did you lose money?". If more than 1 in 5 answer wrong, the timing policy needs deciding before this ships.

**To decide:** to run the RYUX scan, allow `npx @ryuxdsgn/design-intelligence` in your permission settings or run it yourself on `index.html`. Before the "Get help" sheet can be finished, the open policies need deciding: fees, pending and return timing, disputes, support channels, and retry or amount limits.

To run the tests: `NODE_PATH=$(npm root -g) node --test tests/prototype.test.mjs`
