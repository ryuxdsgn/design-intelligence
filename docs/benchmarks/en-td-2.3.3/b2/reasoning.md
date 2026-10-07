# Transaction detail: design reasoning (EN-TD-B2)

Made with RYUX 2.3.3, Design capability. I read capabilities/design.md and qa.md, plus these knowledge modules: product, edge-cases, content, ux, interaction, ui, responsive, accessibility, anti-slop, design-system and the start of forms. The canvas is pen.dev frame `K1Dcc` in ryux.pen.

## Context (RX-PR-01)

- **Who:** adults aged 22–40 in large cities, using the app on their phone right after paying a merchant by card or bank transfer.
- **Task:** confirm that the payment worked and how much it cost, and keep proof of it.
- **Information they need:** the status, the total, the merchant, the payment method, the time, the transaction ID and the fee.
- **Primary action:** Back to home, which ends the task. Share receipt and Report a problem are secondary.
- **Success:** the user can tell in about a second whether the payment went through, and can say what happened without calling support.
- **Constraints given:** English, mobile at 390 wide, statuses Completed / Processing / Failed, and three actions only.

I asked three questions first (market, transaction type, brand and actions). The answers settled the transaction type, platform, statuses, data and actions. The market, currency and brand are still not decided.

## Evidence

The ryux MCP was not connected in this session, so I had no reference screens. Every pattern decision below has **Evidence: None**: it is a judgment call based on the knowledge modules and standards (WCAG 2.2, Nielsen). I don't claim that "apps do X".

## What is on the frame

The board `EN-TD-B2 · Transaction detail` holds six screens:

1. Completed at 390 (the default state)
2. Processing
3. Failed
4. Loading (skeleton)
5. Details couldn't load (a network error, with Try again)
6. Completed at 320, the smallest width, with long values and a 7-digit amount

A header note on the board says what is sample data and how each action behaves.

## Decision receipts

**Information hierarchy**
- **Chosen order:** status icon + status word → total amount → "Paid to [merchant]" → details card → secondary actions → primary action at the bottom.
- **Options compared:** (A) status-first summary with a details card; (B) a receipt-style list with no summary; (C) a merchant-first header with a logo.
- **Evidence:** None. **Confidence:** Medium.
- **Why:** the first question after paying is "did it work, and how much?". C needs merchant logos, which we don't have, and we must not draw them ourselves.
- **Trade-off:** the summary repeats the total that also appears in the card.
- **Assumption:** users arrive here straight from paying.

**Primary action**
- **Chosen:** Back to home is the filled primary button in a bottom action bar (within thumb reach, RX-RD-03). Share receipt is an outlined secondary. Report a problem is a quiet link below the card.
- **Options compared:** (A) Back to home as primary; (B) Share receipt as primary; (C) two equal buttons, which fails the RX-PR-03 Hard Gate.
- **Evidence:** None. **Confidence:** Medium.
- **Why:** most users finish here; sharing is occasional.
- **Trade-off:** sharing costs one more visual step.
- **Failed state:** Report a problem moves up to the secondary button, because a failure is when people need help most.

**Actions per status**
- **Chosen:** Share receipt appears only on Completed.
- **Evidence:** None. **Confidence:** Low.
- **Why:** a "receipt" for an unconfirmed or failed payment could be passed off as proof of payment.
- **Assumption:** the product agrees with this. **[CONFIRM]**

**Fee presentation**
- **Chosen:** Amount + Fee = Total paid, shown in the card.
- **Evidence:** None. **Confidence:** Low.
- **Assumption [CONFIRM]:** the fee is charged on top of the amount. If the fee is taken out of the amount instead, the rows change.
- **Failed state:** shows only the attempted Amount, with no fee or total, because whether a fee applies to a failed payment is not decided.

**Smallest width (320)**
- **Chosen:** keep the text size and let it wrap (RX-RD-02). The Transaction ID row stacks the label above the value at 320 so the ID never breaks across lines.
- **Trade-off:** the 320 screen is longer.
- **Note:** an ID breaking mid-string is a misread risk; long merchant names and amounts may wrap.

## Content decisions

- **Undecided values are visible placeholders** (RX-AS-03, RX-PR-02): `[CUR]`, `[Merchant name]`, `[4821]`, `[Bank name]`, `[TX-…]` and `[Failure reason from the payment provider]`. The numbers are sample values and they add up (RX-QA-04).
- **Number and date format.** I used "1,250,000.00" and "6 Oct 2026, 14:32" as neutral English, with no slash dates. The real locale formats depend on the market, which is not decided (RX-PR-05).
- **Processing copy:** "Please don't pay again. This page updates when the status changes." This prevents double payment. **[CONFIRM]** that live updating will be built.
- **Failed copy:** says what happened, gives the provider's reason (placeholder), and the next step: report it with the transaction ID (RX-CD-04, RX-EC-02). I did not claim "no money was taken", because that is not known.
- **Load-error copy:** "Check your connection and try again. Loading this page doesn't change your payment." Try again reloads the page. It does not retry the payment.
- **One name per thing** (RX-CD-05): "Transaction details", "Transaction ID", and the exact action names Share receipt, Report a problem and Back to home.

## Visual direction (task UI, so convention and restraint)

- **Character:** calm and precise. It is a confirmation of money, not a celebration, so there is no confetti or illustration.
- **Colour:** a neutral warm surface (#F5F4F1), white details card, ink primary (#16181D). No brand accent is used because the brand is undecided; the ink button stands in until there is one. Colour carries meaning only in the three status pairs (green / amber / red, each a tinted background with dark text). Status is always given by an icon (check / clock / x) and a word as well as colour (RX-A11Y-06).
- **Type:** Inter. The amount is 40 (32 at 320), the title 17, values 15–16, labels 14. The transaction ID is in JetBrains Mono so 0/O and 1/l are easy to tell apart when it is read out to support.
- **Spacing:** 4/8-based. 24 between groups, 13px row padding inside the card, 20 side gutters (16 at 320).
- **Containers:** one card that groups the transaction record, and one tinted note for the Processing and Failed explanations. Nothing else is boxed (anti-slop purpose gates).
- **Tokens:** colours are defined as `tdb2-*` variables.

## Interaction (RX-IX-01)

- **Copy ID:** a 40×40 target with the accessible name "Copy transaction ID". After tapping, a short "Transaction ID copied" confirmation appears.
- **Share receipt:** opens the system share sheet. The receipt's format is not decided.
- **Processing:** updates in place to Completed or Failed. The status change is announced to screen readers.
- **Report a problem:** opens the report flow with this transaction attached. That flow was not designed.
- **Loading:** a skeleton that matches the final layout, plus the text "Loading transaction details…" for screen readers. Back to home stays available while it loads.
- **Load error:** Try again (primary) or Back to home.
- **Motion (not drawn):** L1 press feedback only, plus a short fade when Processing changes to its final status, replaced by a cut when reduced motion is on.

## Open questions (not invented, not designed)

- Market, currency and locale formats.
- Whether the fee is added to or included in the amount, and whether a fee applies to failed payments.
- Whether Share receipt should exist for non-completed payments.
- A **"Try again" for the payment itself on Failed** is strongly recommended but wasn't in the given action list, so I left it out.
- How long Processing usually lasts. No time estimate is shown because none was given.
- Brand colour and logo, and merchant logos.
- Dark mode, tablet widths, the Report-a-problem flow, the receipt content, and the "copied" confirmation itself.

## Delivery Gate

```
PRODUCT        PASS · context, primary action, assumptions written; nothing invented beyond [CONFIRM] items · evidence None
UX             PASS · status → amount → details → actions; every state has a next step; one exit
UI             PASS · hierarchy from status and total; one scale and palette with roles · point of view: task UI
DESIGN SYSTEM  PASS · no system existed; smallest token set (tdb2-*) defined and reused across all six screens
ACCESSIBILITY  PASS · contrast checked by hand against the hex values (all text ≥ 4.5:1, roughly 5.6–6.3:1 on the status tints); targets ≥ 40px, buttons 52px; status never shown by colour alone; no automated audit was run
RESPONSIVE     PASS · 390 and 320 drawn; ID row stacks at 320; text wraps, no horizontal overflow
EDGE CASES     PASS · completed, processing, failed, loading, load error, long values and large amounts drawn; offline is covered by the load error
CODE QUALITY   N/A · no code changed
VISUAL QA      PASS · rendered with pen.dev TakeScreenshot and a PNG export, inspected; fixed the ID wrapping at 320 and the short loading/error screens
ANTI-SLOP      PASS · no fake numbers, people or urgency; placeholders bracketed; no decorative cards, gradients or illustration
FINAL          PASS
```

Not designed: dark mode, tablet, the copied confirmation, and the Report-a-problem and receipt flows.
