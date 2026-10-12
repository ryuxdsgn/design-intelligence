# Critique: transaction details screen (after payment)

**Verdict:** The screen does its main job well: you can tell at a glance that the payment worked and where the money went. The biggest risk is what the design doesn't show. Only the success version exists, the actions have no defined behaviour, and the page is longer than it needs to be.

**How I reviewed it**
- **Source:** `screen.png`, 780 × 1926 px, which I'm treating as a 390 × 963 pt screen at @2x. I built on the analysis from the last turn.
- **Measured:** I sampled pixels to check text contrast and the copy icon's size.
- **Not tested:** pressed, focus and loading states; pending or failed payments; scrolling and whether the footer stays put; larger text sizes; dark mode; a screen reader.
- **Evidence:** the ryux MCP isn't connected, so I had no comparison screens. Findings rest on this one design and on standards (WCAG, Nielsen, Apple's guidelines).

## Scores by area
| Area | Rating | Why |
|---|---|---|
| Clarity | Strong | The pill, the amount and "paid to Blue Bottle Coffee" answer "did it work, how much, to whom" within a second. |
| Hierarchy | Strong | The amount is the clear focus, "Done" is the only filled button, and "Total paid" is bold. |
| Coherence | Strong | Spacing, row style, colour use and button styles are consistent throughout. |
| Density | Adequate | Three numbers repeat and there are three rows just to show a $0 fee, which pushes the frame to 963 pt. |
| Confidence | Adequate | Status, fee and total are all shown. But "Balance left" will be ambiguous if someone opens this screen later. |
| Efficiency | Adequate | "Done" is easy to reach, but two rarely used buttons take up the most valuable spot at the bottom. |
| Specificity | Adequate | Well made, but close to a standard receipt; nothing marks it as this particular product. |
| Recoverability | Weak | The help entry exists, but no failed or pending version and no behaviour for any action is designed. |
| Accessibility | Adequate | Text contrast passes, with grey text at 5.2–5.8:1. The copy icon's tap area and the outlined boundaries are the weak spots. |

## Fact check

**Checked:** 6 Oct 2026 really is a Tuesday. Amount + fee = total, which is consistent.

**Not backed by any source:**
- "Blue Bottle Coffee", "Hayes Valley, San Francisco", the dollar amounts, the balance and the transaction ID. These are fine as example data but must come from real data before shipping.
- The **"within 30 days"** reporting window. This is a business rule, and nothing given to me confirms it (see C-05).

## Findings, most severe first

**C-01 · severity 3 · Edge cases · confidence Medium**
- **Finding:** Only the successful, completed version exists. There's no design for a pending payment, a failed or declined one, a refunded or disputed one, or a screen still loading data.
- **Evidence:** One frame, with the green pill and "Completed" status. The screen's own "Status" row implies other statuses exist.
- **Impact:** If a payment is still processing or is reversed later, people may see a screen that says "successful" when it isn't, or a version nobody designed. On a money screen, that's where people stop trusting the app.
- **Recommendation:** Design at least the pending and failed versions. Pending: neutral pill, "Processing", what to expect next. Failed: red pill, the reason, "Try again", and a clear statement of whether money was taken. Add a loading version for when the screen is opened from history.
- **Source:** RX-EC-01 (a must-fix rule), RX-IX-01; Nielsen heuristics 1 and 9.

**C-02 · severity 2 · Interaction · confidence Medium**
- **Finding:** The design doesn't say what happens when someone taps Copy, Share receipt, Save PDF or the help row: no loading, no confirmation, no failure.
- **Evidence:** The frame shows default states only.
- **Impact:**
  - Copying with no "Copied" message leaves people unsure it worked.
  - Making a PDF can take a moment; with no indicator, people tap again.
  - Neither PDF nor sharing has a defined failure behaviour.
- **Recommendation:**
  - Copy: show a short "Transaction ID copied" message and a haptic tap.
  - Save PDF: show a spinner on the button while it generates, then hand off to the system save or share sheet, and say clearly if it fails.
  - Help row: decide which screen it opens.
- **Source:** RX-IX-01, RX-IX-02, RX-IX-12.

**C-03 · severity 2 · Content · confidence High**
- **Finding:** The screen repeats itself:
  - $24.50 appears 3 times (headline, Amount, Total paid).
  - The merchant appears 2 times (subtitle and "Paid to").
  - Success appears 2 times (pill and Status).
  - A $0.00 fee takes three rows to explain.
- **Evidence:** Seen in the frame.
- **Impact:** The page grows to 963 pt, taller than a typical 844 pt phone screen, so the help row and buttons may need scrolling. The repetition also weakens the key numbers.
- **Recommendation:** When the fee is zero, collapse Amount/Fee/Total into one row: "Total paid $24.50 · No fee". Drop the "paid to…" subtitle under the amount, or the "Paid to" row's name, but not both. Keep the Status row only when this screen is opened from history.
- **Source:** RX-UI-01, RX-CD-03. My call, no comparison screens.

**C-04 · severity 2 · Product · confidence Medium**
- **Finding:** Two rarely used actions, "Share receipt" and "Save PDF", get equal-width buttons in the prime spot at the bottom. Together with "Done" they fill about 150 pt.
- **Evidence:** Footer layout as seen.
- **Impact:** "Done" is still clearly the main button, so the one-main-action rule holds. But after a coffee payment, most people only want to leave. The footer takes space from the content and may push the help row off screen.
- **Recommendation:** Merge them into one "Share or save receipt" action that opens the system share sheet. On iOS, that sheet already includes saving to Files and printing to PDF. Or move it to an icon in the header.
- **Source:** RX-PR-03, RX-AS-06. My call; no evidence for which option is better, so worth testing.

**C-05 · severity 2 · Product · confidence High**
- **Finding:** "Report it within 30 days and we'll look into it" states a business rule with no source. "We'll look into it" also doesn't say what happens next.
- **Evidence:** Help row text. Nothing in the brief or project backs it.
- **Impact:** If the real window or process is different, the app is making a promise it can't keep, which matters for a disputes process.
- **Recommendation:** Confirm the 30-day rule with the product, legal or ops team, or remove it. Name the outcome, e.g. "We'll reply within X days."
- **Source:** RX-PR-02 (a must-fix rule), RX-CD-03.

**C-06 · severity 2 · Content · confidence Medium**
- **Finding:** "Balance left: $175.50" is a snapshot, but the label reads as if it's current.
- **Evidence:** "Paid with" row.
- **Impact:** If the same screen is reused for transaction history, people opening it next week will see an out-of-date balance and may be misled.
- **Recommendation:** Label it "Balance after payment" or show it only on the confirmation right after paying.
- **Source:** RX-CD-03, RX-IX-05.

**C-07 · severity 2 · Responsive · confidence Low**
- **Finding:** It's unknown whether the page scrolls with the buttons fixed at the bottom. The frame is 963 pt tall.
- **Evidence:** The frame height is taller than an 844 pt screen.
- **Impact:**
  - If the buttons scroll away, "Done" ends up below the fold.
  - If they stay pinned, they cover about 170 pt of content.
  - At larger text sizes, both get worse.
- **Recommendation:** Pin the footer and give the scrolling content enough bottom padding to clear it. Check at 375 × 667 and at the largest accessibility text size.
- **Source:** RX-RD-01, RX-RD-03.

**C-08 · severity 2 · Accessibility · confidence Low**
- **Finding:** The copy icon is about 15 × 15 pt. Its tap area isn't specified, and it has no visible label.
- **Evidence:** I measured the icon at 30 × 30 px.
- **Impact:** If the tap area is only as big as the icon, it's easy to miss. Screen-reader users also need a name for it.
- **Recommendation:** Make the whole Transaction ID row tappable to copy, at least 44 pt tall, with the accessible label "Copy transaction ID". Make sure screen readers read the ID one character at a time.
- **Source:** RX-A11Y-02 (WCAG 2.5.8, Apple 44 pt), RX-A11Y-04.

**C-09 · severity 1 · Accessibility · confidence High**
- **Finding:** The borders on the outlined buttons and the help row are barely visible: #E6E3DC on #F5F3EE is about 1.16:1. The white fill is also very close to the background colour.
- **Evidence:** Pixel sample.
- **Impact:** The labels and chevron still show these are tappable, so this passes in practice. But in sunlight or on a cheap screen, the help row looks like plain text rather than a button.
- **Recommendation:** Darken the borders to at least 3:1, or rely on the fill colour.
- **Source:** RX-A11Y-01 (WCAG 1.4.11).

**C-10 · severity 1 · Content · confidence Medium**
- **Finding:** The date is written day-month ("Tue, 6 Oct 2026") alongside US dollars and "9:41 AM", which mixes conventions.
- **Recommendation:** Format dates and times from the device's locale rather than hard-coding them.
- **Source:** RX-CD-05.

**C-11 · severity 1 · UX · confidence Low**
- **Finding:** The "✕" and "Done" both seem to close the screen, and the title "Transaction details" is generic for a screen shown right after paying.
- **Recommendation:** Make sure both go to the same place. Consider a title that fits the moment.
- **Source:** RX-UX-02.

## What works (keep it)
- One clear focal point: the large amount, with status above it.
- Green is used only for success, and the status always has words next to it, never colour alone (RX-A11Y-06).
- "Total paid" is bold and the fee is shown even at $0, so nothing is hidden about cost.
- The monospaced, copyable transaction ID makes it easy to quote to support.
- The help entry is right next to the receipt.
- Text contrast passes AA everywhere I sampled.

## Fix priorities
1. **C-01:** design the pending, failed and loading versions.
2. **C-02:** define what Copy, Share, PDF and Help do while running, on success and on failure.
3. **C-05:** confirm or remove the 30-day rule.
4. **C-03 + C-04:** remove the repetition and merge the receipt actions so everything fits on one screen.
5. **C-06, C-07, C-08:** fix the balance label, settle the scroll and footer behaviour, and enlarge the copy tap area.

## Delivery Gate
```
PRODUCT        FAIL         · 30-day rule has no source (RX-PR-02) · evidence None
UX             PASS         · clear goal, one main action, way out is clear
UI             PASS         · hierarchy and colour roles hold · point of view: task UI (receipt)
DESIGN SYSTEM  NOT VERIFIED · no library or tokens to compare against
ACCESSIBILITY  NOT VERIFIED · text contrast measured and passes; tap areas, focus, screen reader not checked
RESPONSIVE     NOT VERIFIED · only one width; scroll and footer behaviour unknown
EDGE CASES     FAIL         · only the success version exists (RX-EC-01)
CODE QUALITY   N/A          · no code
VISUAL QA      N/A          · review of the source image; no build to check
ANTI-SLOP      PASS         · no fake urgency or decoration; example data is plausible but must be replaced with real data
FINAL          FAIL
```

The two FAILs (C-01 and C-05) are must-fix issues under this checklist. C-01 may simply be a scope gap: if pending and failed versions exist in another file, send them and I'll re-check.
