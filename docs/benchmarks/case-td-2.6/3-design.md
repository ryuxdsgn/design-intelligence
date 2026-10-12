I've redesigned the screen in pen.dev (`[local path]/PenDEV/bench.pen`): an improved success screen plus pending, failed and loading versions, each fitting on one 390 × 844 pt phone screen. Below them is a notes panel describing what each button does and listing the open questions.

## The screens

| Screen | What it shows |
|---|---|
| **Success** | The green "Payment successful" pill, $24.50 and "to Blue Bottle Coffee · Hayes Valley". The card has 4 rows: Paid with (with "Balance after payment: $175.50"), Total paid (with "No fee"), Date, and Transaction ID. Below the card is the help row. The footer has "Share receipt" (outlined) and "Done" (filled). |
| **Pending** | An amber "Payment processing" pill and the line "We'll update this screen when it's confirmed. It's safe to close it." The Share button is hidden and "Done" is the only action. |
| **Failed** | A red "Payment failed" pill and "Your payment didn't go through. Your wallet wasn't charged." The footer has "Done" (outlined) and "Try again" (filled), and the help row says "Contact support about this payment". |
| **Loading** | Grey placeholder blocks for the amount and the card rows, for when the screen is opened from transaction history. |

## What changed from the original
- **Amount shown once in the headline**, plus one "Total paid · No fee" row. Before, there was the headline plus three rows. **(C-03)**
- **Merchant name shown once**, with the location joined to it in the headline. The "Paid to" row is gone. **(C-03)**
- **No "Status" row on success**, because the pill already says it. All four versions show status in the pill. **(C-03)**
- **"Balance left" is now "Balance after payment"**, so it stays accurate if someone views the receipt later. **(C-06)**
- **"Share receipt" and "Save PDF" are now one button** that opens the phone's share sheet, which already offers saving and printing to PDF. "Done" stays the only filled button. **(C-04)**
- **The ✕ in the header is removed**, so "Done" is the one way out. The title is now "Receipt". **(C-11)**
- **The whole Transaction ID row copies the ID**, a 44 pt tall tap area instead of a 15 pt icon. **(C-08)**
- **The "within 30 days" promise is removed** from the help row, since nothing confirms it. **(C-05)**
- **What each button does** (copying, generating the PDF, failures, the help row, Done) is written in the notes panel. **(C-02)**

## Needs your confirmation
These are on the canvas and still to be confirmed. I wrote some of them into the new screens myself:
- **"Your wallet wasn't charged"** on the failed screen. This must be true for every failed payment before it ships.
- **"Try again".** I assumed the app supports retrying a payment. If it doesn't, make "Done" the main button.
- **The dispute period.** Put a specific number of days back only if the payments or legal team confirms it.
- **A failure reason row.** I left it out because I don't know what the payment provider returns.
- **Example data.** Merchant, amounts, balance, transaction ID and date are copied from the original screen.

## How I checked it
- I took screenshots of all four screens and looked at them. Nothing is cut off and the footer fits on the screen.
- pen.dev's automatic layout check reported most elements as "clipped". Its position numbers don't match the screenshots (for example, it puts the footer below the screen, but the screenshots show it in place), so I went with the screenshots. If you see clipping in the app, tell me.
- The only colours I added are amber for pending and red for failed. I haven't measured their contrast yet.

```
PRODUCT        NOT VERIFIED · open questions above (failed-state wording, retry, dispute period) · evidence None
UX             PASS         · one clear goal per version; Done is the only main action, "Try again" on failed
UI             PASS         · amount is the focus; colour only for status · point of view: task UI (receipt)
DESIGN SYSTEM  PASS         · colours and fonts saved as reusable variables; screens built from a shared helper, not reusable components
ACCESSIBILITY  NOT VERIFIED · grey text 5.2:1+ and green pill text 6.8:1 measured on the original; amber and red not measured; screen reader and large text not checked
RESPONSIVE     NOT VERIFIED · designed at 390 pt only; smaller phones and the largest text size not drawn
EDGE CASES     PASS         · success, pending, failed and loading designed; "Copied" message and PDF error described in notes, not drawn
CODE QUALITY   N/A          · design only
VISUAL QA      PASS         · rendered with pen.dev screenshots; its layout checker gave unreliable results
ANTI-SLOP      PASS         · no fake numbers or urgency; example data and my own guesses labelled on the canvas
FINAL          NOT VERIFIED
```

Next steps that would move this toward PASS: answer the questions above, and let me add a dark mode version and a large-text check on a 375 pt wide screen.
