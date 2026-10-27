## First turn: questions

Quick update: I've read the project's DESIGN.md. It sets the visual direction, the motion and the voice, so I won't ask about those. It doesn't cover three product rules, and each one changes which states and actions the screen has. Please answer these before I build:

**1. Market and currency.** Nothing in the project names one.
1. **No specific market (recommended):** a generic currency format, labelled as sample data.
2. Indonesia: Rp, id-ID, with banks and e-wallet top-ups.
3. US / USD.
4. Something else (tell me).

**2. Fees.** These change the receipt breakdown and the "what it means for the money" line.
1. **Show no fees anywhere (recommended):** no fee rules get invented, and there's no fee row.
2. Show a fee row with clearly marked sample values (for example, top-up by card).
3. You give me the real fee rules.

**3. What happens to the money when something fails.** This decides which failure states and actions exist.
1. **Generic, no promised timings (recommended):**
   - A failed payment or transfer says the money "is being returned to your balance" (a pending state), then "returned".
   - A failed top-up says "your card was not charged" or "any hold will be released by your bank".
   - Actions: *Try again* and *Get help*.
   - No refund timelines are stated.
2. The same, plus specific refund times that you give me.
3. Failures never take money (instant reversal), so there's only a "failed, nothing moved" state.

You can reply with three numbers, for example "1, 1, 1". Once I have them I'll build the single HTML prototype. It will have a scenario switcher covering:
- Payment: completed, pending, failed
- Transfer: completed, failed, money returned
- Top-up: completed, failed
- Loading and couldn't-load states

## Final message

I've built the transaction detail screen as one file: **`index.html`** in the project root. You open it from an activity list with seven sample transactions:

| Type | Status |
|---|---|
| Payment | completed, pending, failed |
| Transfer to a friend | completed, returning (moves to returned when you check status) |
| Top-up | completed, failed (declined by the bank) |

I checked it in headless Chromium: 35 scripted checks of the logic, every status, both widths and the flows all passed, with no console errors. I also looked at screenshots at 320 and 390 wide. It hasn't been tested with real users.

**What's on the screen**
- **Top (dark):** who the money went to or came from, a large amount, and a status label.
- **"Where the money is":** a line from where the money came from to where it was going, marking where it is now. A failed payment shows the line breaking. A returning transfer shows an amber curve heading back to your balance.
- **Receipt (cream, perforated edge):** a plain sentence saying what happened to the money and what to do next, then a timeline, the details, and buttons to copy the transaction ID, share the receipt, and get help.
- **One main button**, shown only when there's something to do: **Try again** on failures, **Check status** on pending and returning. Each one shows a spinner while it runs, then either success or an inline note saying it failed again.
- **Get help** opens a short report form. It handles a missing choice, a failed send, and a successful send, and adds a line to the timeline.
- **Other states:** a loading skeleton, a "Couldn't load this transaction" screen with a retry, and an empty activity list.
- **Prototype controls** sit at the bottom of the list, clearly marked as not part of the app. They let you force slow loading, a load failure, the next action failing, an empty list, and reduced motion.

**Where I departed from DESIGN.md**
- **The main button sits in a bar at the bottom, not on the receipt.** The lime button on cream paper has almost no visible edge, and the bottom bar is easier to reach with a thumb.
- **The amount's digits slide into place instead of counting up**, so you never see a wrong number on the way. This plays once, when the screen opens.

**Assumptions I made, since none of these are decided** (also marked `ASSUMPTION:` in the code)
- There are no fees anywhere, and no timings are promised for refunds or replies.
- A failed payment or top-up means no money left. A failed transfer is returned to your balance.
- A pending payment has already left your balance.
- **Try again** re-sends the same amount with the same method.
- A help report is saved on the transaction's timeline.
- All names, cards and IDs are sample data in USD, and "today" is fixed to Oct 27, 2026 so the date groups read correctly.
- I left out "Send again" because there's no send flow for it to open.

**Before you rely on it**
- The design scan that RYUX asks for (`npx @ryuxdsgn/design-intelligence scan index.html`) didn't run: auto mode blocked downloading the package. You can run it yourself or allow it.
- Contrast was checked against the DESIGN.md colours, not with an automated accessibility tool. Keyboard order, focus, Escape and the browser back button were checked with scripts.
- At 320 wide, long subtitles get cut short, for example "Trans…" for "Transfer".
- The fonts load from Google Fonts. Offline, it falls back to system fonts.

```
PRODUCT        PASS · every state says what happened to the money and what to do next; policies are labelled assumptions · evidence Thin (brief + DESIGN.md, no reference screens)
UX             PASS · list → detail → back; one main button per state; no dead ends (all flows scripted)
CONTENT        PASS · plain "you" copy; errors say what, why and what to do next; one label per action
UI             PASS · point of view: the money path, signature: perforated cream receipt · illustration style: none
DESIGN SYSTEM  PASS · DESIGN.md tokens; one added token (--ink-press) for the row press state
ACCESSIBILITY  PASS · text alternatives for amount and path, live status updates, focus trapped in the dialog, 44px+ targets; checked with scripts, no automated audit
RESPONSIVE     PASS · checked at 320, 390 and 1280; no horizontal overflow
EDGE CASES     PASS · Detail: loading=skeleton, error=couldn't load+retry, success=7 states, empty=cannot happen (opened from a row) · List: empty="No activity yet"
               · Try again / Check status / Send report: before, during (spinner), success, failure (inline note) · Copy / Share: success + failure message
CODE QUALITY   NOT VERIFIED · logic checks and flow tests pass; the RYUX scan was blocked
VISUAL QA      PASS · Chromium (Playwright) at 320/390/1280: all 7 states, loading, load error, help error and sent, empty list, reduced motion
ANTI-SLOP      PASS · 1 accent (lime), 1 grey family, 1 icon set, 1 display size per screen, no emoji, logos or fake metrics
FINAL          NOT VERIFIED · only because the RYUX scan didn't run
```

**Quick user test:** ask 5 people "Where is your $120 right now, and do you need to do anything?" on the returning transfer, and the same on the failed top-up. If 4 of 5 answer correctly without scrolling, the money path and the "What this means" text are working. If they read the curve back to your balance as "sent", the path needs rethinking.
