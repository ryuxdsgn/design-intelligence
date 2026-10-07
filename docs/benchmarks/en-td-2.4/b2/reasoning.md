# EN-24-B2 · Transaction detail: design reasoning

Frame: `QQ3rC` ("EN-24-B2 · Transaction detail") in `ryux.pen`, placed at x 74742, to the right of all existing content (overlap check: 0).
Export: `QQ3rC.png` in this folder.
Process: RYUX Design entry point. Modules read: product, interaction, content, edge-cases (checkout/payment row), ux, ui, responsive, accessibility, anti-slop (mobile UI row). I skipped `forms.md` because this screen has no input fields.
Evidence: the ryux MCP was not connected, so there are no reference screen_ids. Every pattern choice below is rated **Evidence None** and rests on the brief, the RYUX rules, and standards (WCAG 2.2). I have not claimed that "apps usually do X" anywhere.

## Context (from the brief)

- **Product:** a digital wallet that pays merchants by card and by bank transfer. It is a global product in English.
- **User:** adults aged 22 to 40 in large cities, on mobile, who have just paid.
- **Job:** confirm the payment's status and amount, keep proof of it (share), and act if something is wrong.
- **Data available:** merchant name, amount, fee, payment method, time, transaction ID. Statuses: Completed, Processing, Failed.
- **Actions available:** Share receipt, Report a problem, Back to home.
- **Not decided:** currency, locale, brand, design system.

**Design intent.** In under a second, the user should know whether the money went through, how much, and to whom. Then they should be able to leave (Back to home) or keep proof (Share receipt). It works if nobody pays twice because the status was unclear, and if problem reports always come with the transaction ID.

## What's on the board (one frame, six screens)

1. Completed, paid by card, 390 wide (the main state).
2. Processing, paid by bank transfer, 390 wide.
3. Failed, 390 wide.
4. Loading, as a skeleton.
5. Couldn't load details (network or server failure while fetching the page).
6. Completed at 320 wide, with stress content: a long merchant name, a five-digit amount, and the "Transaction ID copied" feedback.

## UX direction

- **Hierarchy:** (1) the status, shown as an icon and a word, never colour alone; (2) the amount, the one piece of large display type; (3) the merchant; (4) the breakdown (Amount, Fee, Total); (5) the reference details (method, date and time, transaction ID with a copy button).
- **One primary action:** "Back to home" is the only filled button, at the bottom where the thumb reaches. "Share receipt" is an outlined secondary button. "Report a problem" is a tertiary link under the details, because most completed payments don't need it.
- **No back arrow to the pay form.** Going back from a completed payment risks a double payment, so the only way out is "Back to home". The screen title "Payment details" orients the user (RX-UX-02).
- **Copy transaction ID:** an icon button with a 44×44 target. The toast "Transaction ID copied" confirms the copy (screen 6). Support asks for this ID, and the Failed message tells the user to include it.

### Decision receipts

**1. Hero shows the total, with a breakdown below**
- Options: A) the hero shows the total (amount plus fee) and a breakdown follows; B) the hero shows the amount, and the fee appears only in the list.
- Evidence: None. Confidence: Medium.
- Why: the total is what left the user's account, and RX-IX-05 asks for full cost transparency.
- Trade-off: the total appears twice (hero and breakdown row).
- Assumption: the "amount" field is the merchant amount and the fee is added on top. If the fee is included in the amount, the breakdown needs relabelling.

**2. Which actions show in each state**
- Completed: Share receipt (secondary), Back to home (primary), Report a problem (link).
- Processing: Back to home only, plus the Report link. Share is hidden because there is no final receipt yet.
- Failed: Report a problem moves up to a secondary button (the most likely need), plus Back to home.
- Evidence: None. Confidence: Low.
- Why: keep actions that are meaningful in each state, with one primary per screen.
- Assumption: receipts can only be shared once a payment is completed. This needs product confirmation.
- I did **not** add "Try again" to the Failed state, because retrying a payment isn't one of the given actions (RX-PR-02). It's an open question below.

**3. Toned status block plus plain cards, no brand colour**
- Options: brand-coloured header, full-bleed status colour, or neutral surface with a status tone.
- Evidence: None. Confidence: Medium.
- Why: there is no brand yet, so colour is spent only on meaning (green, amber, and red status tones). The primary button is near-black ink. When a brand exists, it swaps in for the ink.

## UI direction

- **Personality:** calm, precise, receipt-like. This is task UI, so convention beats novelty (RX-UI-12 doesn't apply).
- **Type:** Inter only. Amount 40/700, title 17/600, values 15/500, labels 14, buttons 16/600. The transaction ID uses JetBrains Mono so characters like 0 and O stay distinct when someone reads it out to support.
- **Spacing:** a 4/8 scale. 20 px screen padding, 24 px between groups, 14 px row padding, 52 px button height.
- **Containers:** two cards only. Breakdown (the money) and Details (the reference) are separated because they answer different questions. No shadows or gradients.
- **Colour roles:**
  - Background #F5F5F2, surface #FFFFFF, line #E3E3DE.
  - Text #16181D, secondary text #5A606B (about 6:1 on white).
  - Success #146C3F on #E3F2E9, processing #855400 on #FCF0D6, failed #B3261E on #FBE7E5. Each pairing is estimated at or above 4.5:1 for text. These were judged from known values; I didn't run a contrast tool.
- **Icons:** one set, Lucide.

## States and edge cases

| Case | Design |
| --- | --- |
| Completed | screen 1 |
| Processing | screen 2: amber tone and a note saying the page will show Completed or Failed once the bank confirms |
| Failed | screen 3: red tone, a plain-language note, and a **Reason** row shown as a visible placeholder `[REAL DATA: failure reason from payment provider]`, because the brief has no failure-reason field |
| Loading | screen 4: a skeleton that matches the final layout, a visible "Loading payment details…" label (also for screen readers), and Back to home stays available |
| Network or server failure | screen 5: what happened and how to recover ("Try again" reloads the page; it doesn't retry the payment), plus a way out |
| Long merchant name, large amount, 320 width | screen 6: text wraps and is never truncated. The ID row was changed to two lines on every screen after the 320 render showed the ID wrapping mid-string. |
| Copy feedback | screen 6 toast. It's shown in flow for illustration; in the build it overlays above the action bar. |

Not designed: the Report a problem flow, the system share sheet, dark mode, a zero-fee case (the fee row would show 0.00 in the chosen currency format; whether to hide it is a product decision), and session expiry.

## Interaction (before, during, result, recovery)

| Action | During | Result | Recovery |
| --- | --- | --- | --- |
| Copy ID | instant | toast "Transaction ID copied" | none needed |
| Share receipt | instant | the OS share sheet opens | cancel the sheet |
| Report a problem | — | opens the report flow, carrying the transaction ID | flow not designed |
| Back to home | — | goes home; the payment is not affected | — |
| Try again (load error) | the loading skeleton appears | the details load | the error screen again, with Back to home |

Motion: L1 press feedback only. The status icon may fade or scale in once when the screen opens, and with reduced motion it simply appears. There's no confetti, because celebration motion doesn't fit a money receipt and would delay reading the status.

## Responsive

Designed at 390 and at 320 (the smallest supported width).
- At 320, padding stays the same and text keeps its size.
- Values wrap right-aligned. The merchant name wraps centred.
- The ID row is two lines at every width, so the component behaves the same everywhere (RX-RD-06).
- There is no horizontal scroll.
- The action bar stays pinned to the bottom with 34 px safe-area padding.

## Assumptions and open questions

- **Currency and locale (not decided).** All values are sample data in a "$42.85" and "7 Oct 2026, 14:32" format, and the board says so. The formats must follow the market once it's chosen.
- **Merchant name, card digits, transaction IDs, amounts:** all sample data, labelled at board level.
- **Fee is added on top of the amount** (Decision 1).
- **Share is only available for Completed** (Decision 2).
- **Failure reason:** does the API return one? It's a placeholder for now.
- **Retry on Failed:** should a failed payment offer "Try again" or "Pay another way"? It's not in the given actions, so I didn't add it.
- **Status updates:** does Processing update live, or only when the page is reopened? The note's wording ("will show") assumes live updates.

## Delivery Gate

```
PRODUCT        PASS · user, job, data and actions taken from the brief; unknowns kept as visible assumptions · evidence None
UX             PASS · one primary action per state, way out on every screen, before/during/result/recovery defined
UI             PASS · clear hierarchy (status → amount → merchant), one type and spacing scale, colour roles · point of view: task UI
DESIGN SYSTEM  N/A  · no system exists; tokens defined on the board, button/row/card built consistently, no duplicates
ACCESSIBILITY  PASS · status shown with icon and text (not colour alone), text 14px or larger, 44px targets, contrast judged by eye from known values (no automated audit)
RESPONSIVE     PASS · 390 and 320 rendered; no overflow; ID row fixed after the 320 render
EDGE CASES     PASS · completed, processing, failed, loading, load error, long content, copy feedback; report flow not designed (out of scope)
CODE QUALITY   N/A  · design only, no code
VISUAL QA      PASS · every screen rendered with pen.dev TakeScreenshot and inspected; fixes re-rendered
ANTI-SLOP      PASS · no invented metrics, people or urgency; sample data labelled; failure reason a visible placeholder; no decorative gradients, shadows or confetti
FINAL          PASS
```
