## First turn: questions

Quick update: I've read DESIGN.md and RYUX's Build rules. The visual and motion direction is already set, so I won't ask about it. RYUX has me ask up to three questions that change what gets built, then wait for answers before writing code. Here they are:

**1. Market and currency.** Nothing in the brief or DESIGN.md names a market.
1. **No specific market (recommended).** English copy and a neutral number format. Amounts are clearly labelled as sample data.
2. Indonesia: Rp and id-ID formatting, Indonesian banks and e-wallets as top-up sources.
3. UK or EU: £ or € with local formatting.
4. Something else (tell me which).

**2. What happens to the money when something fails.** This decides which states and actions the screen has.
1. **Two failure states (recommended).** "Failed, money never left your balance" offers *Try again*. "Failed after the money left, it's being returned" uses the amber "returning" state. I won't show a return time or promise one; it will say "We'll tell you when it's back" unless you give me a real time frame.
2. Failure always means the money never left, so there's only one failure state with *Try again*.
3. Your own rule, for example "refunds take 3–5 business days" or "a transfer can be cancelled while it's pending".

**3. Fees and support actions.**
1. **Show only what the data has (recommended).** A fee row appears only when the transaction carries a fee, and the sample data uses no fees. The "Report a problem" and "Get help" actions open a confirmation sheet in the prototype and don't name any real channel.
2. You give me real fee rules (for example a top-up fee) and the real support channels (chat, phone, in-app ticket).

You can reply with numbers, like "1, 1, 1". Once I have your answers I'll build one HTML file with these pieces:
- An activity list and a detail screen for the payment, the transfer to a friend and the top-up.
- Every state: completed, pending, failed, returning, loading and couldn't load.
- The money path, the cream receipt sheet and the motion specified in DESIGN.md.

## Final message

I've built the transaction detail screen as one file, `index.html` in the project folder; open it in a browser. At phone widths it fills the screen. On a wide screen it sits in a 390-wide frame with a prototype panel beside it.

I rendered it in Playwright Chromium at 390, 320 and 1280 wide, plus a reduced-motion run, and clicked through every flow. There were no script errors. I couldn't run the RYUX scan (`npx @ryuxdsgn/design-intelligence scan`): auto mode blocked it because it downloads a package from npm. If you want it, allow it and I'll run it.

## What's in it
**Activity list**, rows grouped by day, opening the detail screen. All 7 transactions are labelled sample data in USD:

| Transaction | State | Primary action |
|---|---|---|
| Payment, Bluebird Coffee | Completed | Share receipt |
| Transfer to Maya | Pending | none (nothing for you to do) |
| Payment, Metro Transit | Failed, money never left | Try payment again |
| Top-up from bank | Completed | Share receipt |
| Transfer to Sam | Returning (left, couldn't be delivered, coming back) | none |
| Top-up from debit card | Declined by the bank | Try top-up again |
| Payment, long merchant name, $1,284.56 | Completed | Share receipt |

**Each detail screen** follows DESIGN.md:
- **Top section (dark):** the amount with rolling digits, then a status pill with an icon and a word, never colour alone.
- **Money path:** a line from source to destination with a marker for where the money is now. A failure shows a break, and a return shows a dashed line heading back.
- **Receipt sheet (cream):** a perforated top, then "what this means" in plain words, the action, a timeline, the details with a copyable reference, and "Report a problem".

**Flows that run end to end:**
- **Try again:** confirm with the amount and recipient, then an in-progress state, then a success or a failure. A failed retry keeps you in the sheet with a way to try again. A success replaces the screen with the new payment, and back goes to the activity list. The failed payment stays in your activity.
- **Report a problem:** pick a reason (required), add optional text. Sending can fail and keeps what you wrote. Once sent, it appears in the timeline and the button changes to "Problem reported".
- **Share receipt:** uses the phone's share sheet, or copies the receipt as text.
- **Copy reference:** copies the reference ID.
- **Browser back and Escape:** both work, and a link straight to one transaction opens it.

**Prototype panel** (marked "not part of the app"):
- The activity list can show as loading, empty, or couldn't load.
- Opening a transaction can be slow (skeleton) or fail (with retry).
- The next request can succeed or fail.
- Two live updates: Maya's transfer completes, and Sam's money is back.
- A reduce-motion switch, and a reset.

## Assumptions (none of these is a confirmed policy)
- A pending transfer has already left your balance.
- **Failed** means the money never left. **Returning** means it left and is coming back.
- No arrival or return times are promised. The copy says "This page updates when it arrives" instead.
- No fees are shown. A fee row would appear only if a transaction carried one, and none do.
- No support channel or reply time is named.
- Tile icons and colours follow category, never the person.
- The success ring plays once, only on a payment that completes while you're watching.

## Problems found while rendering, and fixed
- A long merchant name pushed the list sideways. That also caused the overflow at 320 wide.
- The shopping icon was missing because its name didn't match the category.
- With reduced motion on, the mobile prototype panel was stuck on screen.
- The strikethrough on failed amounts didn't cross the digits, so "$2.90" read as "2-90".
- At 320 wide the merchant name stacked five lines under the money path. It now says "Received", since the name already appears at the end of the path.

## Delivery Gate
```
PRODUCT        PASS · covers payment, transfer and top-up in every state given; policies are listed as assumptions, none invented · evidence Thin (brief + DESIGN.md; no reference screens, RYUX's screen library isn't connected)
UX             PASS · status and where the money is come first; one primary action per state, or none when there's nothing to do; back returns to the row you opened; after a retry, back goes to the list
CONTENT        PASS · says what happened, what it means for the money, what to do next; no cheer on failure; no times, fees or channels promised
UI             PASS · point of view: a receipt you could tear off, with a money path · signature: perforated cream sheet + volt money path · illustration style: none
DESIGN SYSTEM  PASS · only DESIGN.md tokens; one button style; a fee row exists in code but shows only when the data has a fee
ACCESSIBILITY  PASS · contrast meets AA (calculated from the hex values; no automated audit run); keyboard and focus checked by hand; dialogs trap focus and close with Esc; status changes are announced to screen readers
RESPONSIVE     PASS · 320, 390 and 1280 rendered; long name and large amount checked (the amount shrinks to fit at 320)
EDGE CASES     PASS · matrix below
CODE QUALITY   NOT VERIFIED · flows run in Playwright with no script errors; no unit tests (single-file prototype, no test runner); the RYUX scan was blocked
VISUAL QA      PASS · Playwright Chromium at 390 / 320 / 1280; all 7 details, sheets, skeleton, errors, empty, live updates and reduced motion inspected
ANTI-SLOP      PASS · accent hues 1 (volt; status colours excluded); neutral families 2 (ink and paper, both in DESIGN.md); 1 icon set; 0 emoji; 0 logos; gradients 2, both in DESIGN.md's specs (amount glow, loading shimmer); "Try payment again" opens the sheet and "Try again" repeats after a failure
FINAL          NOT VERIFIED · because of CODE QUALITY; not tested with users
```

| View or action | Loading | Empty | Error | Success |
|---|---|---|---|---|
| Activity list | skeleton | "No activity yet" | couldn't load, with retry | rows |
| Transaction detail | skeleton (slow) | can't happen: only opened from a row | couldn't load, with retry | 7 transactions |
| Try again | "Paying…", sheet locked | n/a | inline error, retry | new transaction replaces the screen |
| Report a problem | "Sending…" | reason required | failure keeps your text | "Report sent" + timeline entry |
| Share or copy | instant | n/a | "Couldn't copy" message | share sheet or "copied" message |

## Usability test plan
**Riskiest assumption:** that people can tell "failed, money never left" apart from "returning" without being told how long the return takes.

**Test:** give 5 people the Sam and Metro Transit screens and ask: "Where is your money right now, and do you need to do anything?"

**Signal it works:** at least 4 of 5 answer correctly without opening the details.

**What would change it:** if people still ask when the money comes back, the product needs a return-time policy to show on this screen.
