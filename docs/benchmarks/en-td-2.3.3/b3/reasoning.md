# EN-TD-B3 · Transaction detail: design reasoning

Frame: `d3ZSx` in ryux.pen (x 60964, y 0, right of all existing content).
Export: EN-TD-B3-transaction-detail.png
Process: RYUX 2.3.3, Design capability. Knowledge read: product, ux, interaction, forms, content,
edge-cases, ui, responsive, accessibility, anti-slop (the task table rows for "Checkout or payment" and "Mobile UI").

## Context (RX-PR-01)

- **Who:** adults aged 22–40 in large cities, on a phone, right after paying a merchant from a digital wallet (card or bank transfer).
- **Task:** confirm that the payment went through (or didn't), see what was paid and to whom, and then move on.
- **Information given:** merchant name, amount, payment method, time, transaction ID, fee. Statuses: Completed, Processing, Failed.
- **Actions given:** Share receipt, Report a problem, Back to home.
- **Success:** within a second or two, the user can say "it worked, X to Y" (or "it didn't, here's what to do") without reading the detail rows.
- **Not decided:** market, currency, brand, design system, failure reasons, fee rules, retry.

## Evidence

The ryux MCP was not connected in this session, so there are no reference screen_ids. The evidence
comes from the RYUX knowledge rules and standards (WCAG 2.2, Nielsen heuristics) alone. Every
pattern decision below is rated **Evidence None** (a judgment call), and the confidence is stated.

## Design Direction

**Information hierarchy**
1. Status: icon plus a text label ("Payment completed", "Payment processing", "Payment failed"). The status uses colour, icon and words together, never colour alone (RX-A11Y-06).
2. Amount: 40px semibold, the single focal point (RX-UI-01).
3. Merchant: "Paid to Corner Bakery". The verb changes with the status ("Paying", "Payment to").
4. Status note (Processing and Failed only): what is happening and what to do.
5. Detail rows: Payment method, Date and time, Transaction ID (copy button, monospace), Fee.
6. Report a problem: a quiet list row on Completed and Processing.
7. Action bar pinned at the bottom, within thumb reach (RX-RD-03).

**Interaction (RX-IX-01)**
- **Share receipt:** press state, then the OS share sheet (result). If sharing fails, the sheet's own error applies. Shown on Completed only.
- **Copy transaction ID:** 44×44 target. Assumed result: a "Copied" toast (not drawn).
- **Report a problem:** opens the report flow, which is not designed here (its destination was not given).
- **Back to home:** goes to home and ends the post-payment flow.
- **Loading the details:** a skeleton, with "Back to home" still available. If loading fails, the error state offers "Try again" (primary) and "Back to home".

**UI**
- Neutral task UI, with no brand point of view, because the brand is not decided (RX-UI-12 does not apply to task UI).
- Colour roles:
  - Surface #F6F7F5 and card #FFFFFF.
  - Text #121614, with secondary text #5B625E (about 6:1 on the surface).
  - Primary action in ink #121614. A neutral ink was chosen so the design does not invent a brand accent.
  - Status colours: green #1F7A4D, amber #8A5A00, red #B42318, each above 4.5:1 on its own tint.
- Type: Inter throughout. IBM Plex Mono only for the transaction ID, so that 0/O and 1/l stay distinct when someone reads it to support.
- Spacing: a 4/8 scale. 20px gutter (16px at 320). 24px between groups, 14px row padding.
- Containers: one details card that groups the record, and one help row. No decorative gradients, shadows, or illustrations (RX-AS-05).

## States designed (RX-EC-01)

1. Completed · 390
2. Processing · 390, with a status note and no Share receipt
3. Failed · 390, with a failure-reason placeholder, a recovery note, and "Report a problem" promoted to a secondary button
4. Completed · 320, with long content: a long merchant name, a large amount, and a bank-transfer method. The detail rows stack label-over-value at 320 so that IDs don't break mid-word (RX-RD-01, RX-RD-02, RX-EC-03).
5. Loading details · 390 (skeleton)
6. Details couldn't load · 390 (network failure, with retry; RX-EC-06)

**Not designed:**
- the report-a-problem flow, the share sheet, and the copy toast
- dark mode
- the Processing → Completed transition (motion: a cross-fade of the status block, L2, calm, about 200ms ease-out; under reduced motion, a cut)
- widths above 390, because this is a phone-only screen

## Decision Receipts

**1. Primary action**

| | |
| --- | --- |
| Decision | "Back to home" is the filled primary button. "Share receipt" is a secondary (outlined) button, stacked above it. |
| Options | A: Back to home primary. B: Share receipt primary. C: the two side by side at equal weight (fails RX-PR-03). |
| Evidence | None. Confidence: Medium. |
| Why | The user's job after paying is to check the result and leave. Sharing is occasional. |
| Trade-off | Users who always share need one more glance. |
| Assumption | Most payments are not shared. |

**2. Share receipt only on Completed**

| | |
| --- | --- |
| Decision | Hide Share receipt on Processing and Failed. |
| Options | Show it on every status, or only on the final successful status. |
| Evidence | None. Confidence: Low. |
| Why | A shared receipt for a payment that is not final can mislead the person who receives it. |
| Trade-off | Someone who wants proof of a failed attempt can't share one from here. |
| Assumption | The receipt represents a completed payment. Listed as an open question. |

**3. Failed recovery**

| | |
| --- | --- |
| Decision | Show the failure reason (placeholder) first. Advise reporting the problem if the money still appears on the user's statement. "Report a problem" becomes a secondary button. No "Try again" button. |
| Options | Add a retry button, or use only the given actions. |
| Evidence | None. Confidence: Medium. |
| Why | Retry was not among the given actions, and adding it would invent a feature (RX-PR-02, RX-AS-06). Report a problem is the recovery path that exists (RX-EC-02). |
| Trade-off | Retrying means going back through the payment flow. |

**4. Fee placement**

| | |
| --- | --- |
| Decision | The amount is the hero. The fee is a separate row. No "Total" row. |
| Evidence | None. Confidence: Low. |
| Why | Whether the fee is included in the amount or added on top was not given, and a Total row would assert a rule. |
| Trade-off | If the fee is added on top, the user does the sum. Add a Total row once the rule is known. |

**5. Responsive behaviour at 320**

| | |
| --- | --- |
| Decision | Detail rows switch from label-left / value-right to label above value. The amount drops to 32px. The gutter goes to 16px. |
| Evidence | Knowledge: RX-RD-02 and WCAG 1.4.10. Confidence: High. |
| Why | At 320, side-by-side rows broke "[Transaction ID]" mid-word. This was seen in the render and then fixed. |

## Content (RX-CD-*)

- English, sentence case, and specific verbs on buttons.
- One name per thing:
  - "Transaction details" is the screen title.
  - "Transaction ID" names the reference.
  - "payment" is the verb.
- Error copy says what happened and what to do next: "Couldn't load transaction details. Check your connection and try again. This doesn't change the status of your payment."
- The copy makes no promises about refunds, timing, or charges, because none were given.

## Assumptions and placeholders (RX-PR-02, RX-AS-03)

- **Currency:** not decided, so money shows as "[CUR] 48.50" with English number formatting (comma thousands, dot decimals). Swap this for the market's locale once it is decided.
- **Date format:** "6 Oct 2026, 14:32" uses a spelled-out month, so it is not ambiguous, and a 24-hour clock. Both are assumptions until the locale is decided.
- **Sample data:** "Corner Bakery", "Northside Family Pharmacy and Convenience Store", "Card •••• 4821", and the times are labelled as sample data on the board.
- **Placeholders:** [Transaction ID], [Bank name], [Failure reason from payment provider], and [Fee, if charged].
- **Processing note:** it assumes the status updates on the page and that the user can safely leave. This needs confirming with engineering.

## Open questions (also on the canvas)

1. Is the fee added on top of the amount, or included in it?
2. Can a failed payment ever be charged?
3. Does Processing update live?
4. Should Failed offer a retry?
5. Can receipts be shared for statuses other than Completed?

## Delivery Gate

```
PRODUCT        PASS · user, task, given data and actions only; open questions listed · evidence None (no ryux MCP)
UX             PASS · status → amount → merchant → details → actions; one primary action per state; recovery on Failed and load error
UI             PASS · one focal point (amount), colour roles, 4/8 scale · point of view: task UI
DESIGN SYSTEM  N/A  · no design system given; one row, button, and note pattern reused across all 6 screens (no duplicates)
ACCESSIBILITY  PASS · text contrast ≥4.5:1 by colour values (not measured with a tool); status = icon + text; targets ≥44px; body text 15–16px. Focus and screen-reader order not testable in a static design
RESPONSIVE     PASS · 390 and 320 rendered; rows restack at 320; no horizontal overflow
EDGE CASES     PASS · Completed, Processing, Failed, loading, load error, long merchant name, large amount
CODE QUALITY   N/A  · no code
VISUAL QA      PASS · rendered with pen.dev TakeScreenshot and the 2x PNG export, inspected; one wrap bug at 320 found and fixed
ANTI-SLOP      PASS · no invented metrics, people, urgency, or fee rules; placeholders look like placeholders; no decorative effects
FINAL          PASS
```
