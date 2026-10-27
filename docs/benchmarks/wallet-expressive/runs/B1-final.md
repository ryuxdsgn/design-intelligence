## First turn: questions

I've read the RYUX build workflow and your DESIGN.md. DESIGN.md already settles the look, the motion and the voice, so I won't ask about those. Three things it doesn't settle would change what goes on the screen. Before I build anything, could you answer these? A number for each is enough.

**1. Market and currency.** Nothing in the brief or DESIGN.md names one.
1. **No specific market (recommended):** neutral English copy, with amounts in one currency marked as sample data. Tell me which currency, or I'll use USD.
2. Indonesia: Rp, id-ID formatting, and local payment types like QRIS and bank virtual accounts.
3. Another market: tell me which.

**2. What happens to the money when something fails.** This decides which states and buttons the failure screens get.
1. **Pending, then auto-reversal (recommended):** a failed payment or top-up shows the money as held, then returned to the wallet automatically. The screen shows each step but no promised time. The actions are "Try again" and "Contact support".
2. Same as 1, but with a stated refund window. Give me the real number; I won't make one up.
3. Failures never take money: the screen just says nothing was charged and offers to try again.

**3. Fees and refunds.**
1. **Show a fee row only where your product charges one, and leave out customer-requested refunds (recommended).** Tell me which of payment, transfer or top-up has a fee and how it's worked out. If you don't know, I'll show "No fee" as labelled sample data.
2. Include a "Request a refund" / dispute flow on completed payments. I'll build how it behaves (in progress, submitted, rejected) but set no policy terms.
3. No fees and no refunds at all.

Once you answer, I'll build the one-file prototype covering:
- the three transaction types;
- the states each can be in: completed, pending, failed and reversed, plus loading, offline and not found;
- a state switcher, so you can walk through every case.

## Final message

I've built the transaction detail prototype as one file, `index.html`. Open it in a browser. At 390px wide it fills the screen like a phone; on a desktop it sits in a phone frame with a panel of test controls beside it. It opens on an Activity list, and tapping a row slides the detail in.

**How it works**
- **The screen leads with what happened.** The dark top area shows who the money went to or came from, the amount in the display typeface, and a status label with an icon. The cream sheet below shows a box in the status colour saying what it means for the money, a short timeline of what happened, the details, and actions.
- **Brand signature: "where the money is now".** A line runs from where the money came from to where it went, with a short caption ("On its way", "Still in your balance", "Coming back to your balance"). The purple accent is used only for moving money and the main button.
- **Five states for each of payment, transfer and top-up:** Paid/Sent/Added, Processing, Failed (nothing taken), Returning money, and Returned. When the status changes, the screen animates from the old state to the new one, and a finished payment gets one short success moment.
- **At most one main button.** "Try again" on failures and "Send again" on a sent transfer both open a confirm sheet showing the amount and who it goes to. Three outcomes are built: it goes through (Processing, then done), it fails again, or the connection drops. The last one says the money may still go through and to check Activity before retrying, so you don't pay twice.
- **Also built:**
  - "Share receipt" (uses the phone's share sheet, or copies the text);
  - a copy button for the transaction ID;
  - "Report a problem", with a check that a reason is chosen, a sending state, a failure that keeps your answers, and a sent state;
  - a loading placeholder, a server error with retry, and an offline banner showing when the details were saved. While offline, the main button is disabled with the reason underneath.

**Assumptions (no policies were given, so the copy promises no times, fees or support channels)**
- A pending payment's money is set aside from the balance.
- When money has already left and the transaction fails, it is returned automatically.
- There is no fee row. The screen has a slot for one if your data includes a fee.
- Merchant logos would come from your data; a generic shopping-bag icon stands in.
- There is no brand name or logo, so neither appears anywhere.
- All names, amounts, card digits and IDs are made-up sample data, on a fixed sample date of Tue, Oct 27, 2026.
- The typeface (Bricolage Grotesque) loads from Google Fonts and falls back to a system font when offline.

**Not built:** two other directions I'd consider are a timeline-first layout and a plain receipt layout. Disputes and refunds you ask for are left out because no policy exists for them.

**Checks I ran**
- **Logic tests:** 7 of 7 pass, covering every type and status combination, the amount signs, and the one-main-button rule.
- **Visual check:** I rendered every sample transaction and flow at 390 wide, plus 320 and 1280, and found no sideways scrolling and no console errors.
- **Animation checks:**
  - closing the sheet halfway through opening turns it back from where it is;
  - focus returns to the button that opened it;
  - with reduced motion, everything only fades.
- **Contrast:** every text pair I calculated is at least 4.66:1.

I fixed what these checks found: the report form's error message never cleared, a shadow showed at the screen edge, and the reason text appeared twice. The RYUX scanner isn't installed, and I didn't download it without asking.

```
PRODUCT        PASS · three types × five states plus load states; no invented policies · evidence Thin (brief and DESIGN.md only; ryux MCP not connected)
UX             PASS · status and money first; at most one main button; every action has in-progress, result and failure behaviour
CONTENT        PASS · says what happened, what it means for the money, what to do next; one label per status; no cheer on failure
UI             PASS · point of view: money that moves, signature: "where the money is now" line · illustration style: none
DESIGN SYSTEM  PASS · one set of colour, spacing, radius and motion values; one bottom-sheet component for confirm and report
ACCESSIBILITY  PASS · contrast ≥4.66:1; touch targets ≥44px; status shown with text and icon; focus and Escape checked by hand; no automated audit tool was run
RESPONSIVE     PASS · checked at 320, 390 and 1280; long names wrap in the detail and truncate in the list
EDGE CASES     PASS · see matrix below
CODE QUALITY   PASS · 7/7 logic tests, no runtime errors; RYUX scan not run (package not installed)
VISUAL QA      PASS · Playwright Chromium at 320/390/1280, every sample state, sheets, and the retry and report flows
ANTI-SLOP      PASS · 1 accent colour, 1 grey family, 1 icon set, 1 display size per screen, 3 text sizes, 0 invented logos, 0 emoji in the interface
FINAL          NOT VERIFIED · RYUX scan not run; not tested with users
```

| | Loading | Empty | Error | Success |
|---|---|---|---|---|
| Detail view | placeholder (Slow connection) | can't happen: the detail always opens from an existing transaction | server error with retry; offline banner showing when the details were saved | all 5 statuses for each type |
| Try again / Send again | button spinner, sheet locked | n/a | fails again; connection drops | Processing, then completed |
| Report a problem | "Sending…" | no reason chosen: inline error | server error or offline, answers kept | "Report sent" plus reference |
| Activity list | out of scope: it's only there to open the detail | out of scope | out of scope | sample list |

**What to test with users:** whether people read the money line correctly when a payment fails ("Still in your balance" versus "Coming back to your balance"). The quickest test is five people from the target group, shown the failed and returning screens, each asked "Where is your $63.17 right now?". If more than one of the five gets it wrong, the line's wording or shape needs rethinking.

The test scripts are in `/tmp/wallet-qa`, outside the project.
