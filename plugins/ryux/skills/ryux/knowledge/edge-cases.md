# Edge cases

Designs beyond the happy path: empty, loading, error, offline, permission, and long-content states.

> Group UX · Delivery Gate area EDGE CASES · RYUX 2.24.4. Levels are defined in `SKILL.md`.

The happy path is not enough. Walk this list for the screen you built:

| Area | Cases |
| --- | --- |
| Data | empty, one item, many items, long content, missing fields, duplicates |
| Forms | invalid, partial, failed, loading, unsaved, expired |
| Network | slow, timeout, offline, server failure, retry |
| Permissions | read-only, restricted, different roles (only roles that exist) |
| System | session expired, unauthorized, unexpected error |
| Misuse | the person who would abuse it (RX-EC-09): fake accounts for promos, a stolen phone, a scam payment, a shared account |

For first use and zero data, explain what will appear and give one action to start. For each case
that can happen, decide what the user sees and what they can do next. Cases that
cannot happen in this product do not need a design; say so in the Delivery Gate.

**Local money and identity flows.** Each common Indonesian flow has options and states its users
expect. Treat this list as the floor. Reference screens (`get_local_pattern`, `search_screens`) and
designer notes, when connected, come first. A value in the last column is asked, or shown in its place as a
labelled sample and listed as open; never dropped from the screen, never presented as fact (RX-PR-02):

| Flow | Before the user commits | After, and when it goes wrong | Ask, never invent |
| --- | --- | --- | --- |
| Electricity token | prepaid or postpaid chosen; meter or customer number checked, the customer's name shown; wrong or unknown number | token grouped in fours, the largest thing on screen, copied in one tap and found again in history; token not issued yet, with what happens next | admin fee, the amounts offered, the power class (kWh only as an estimate) |
| Virtual account | the amount, or plainly "you set it at the bank" for a VA without one | number grouped, copied in one tap; deadline when it has one; steps per channel; balance arrives by itself, with no confirm button; expired | fee, expiry, minimum and maximum top-up, balance cap; a sample number's bank prefix is a sample |
| Paylater | not preselected; limit, tenors, total with fees, a due date for each instalment | limit too low or account not active, with another method; declined | provider, fees, tenors, credit limit, who is eligible |
| Phone credit and data | the number from contacts or the user's own; the operator read from the prefix before the amounts | the number confirmed before paying (a wrong number is hard to undo); pending, failed | products, prices, what a package holds, admin fee |
| ID photo (e-KYC) | why the ID is needed and how it is protected, in plain words; camera permission refused; whether a gallery upload is allowed | live framing guidance or auto-capture; a quality check with retake (blur, glare, a corner cut off); under review | verification time, security or regulator claims |

Does not cover: how errors are worded (see `knowledge/content.md`).

## Evidence from RYUX Knowledge

How reference apps show empty, error, offline, and loading states for this flow: `search_screens` with the state in the query. Without the ryux MCP, say the evidence comes from the design and standards alone.

> Hard Gates always apply, whichever skills are loaded: no invented numbers, people, urgency, business
> rules, or terms; no placeholder shipped as final; no missing critical states. Labeled sample data is
> not an invented number; an unconfirmed capability is never presented as confirmed. See `SKILL.md`.

## Rules

### RX-EC-01 [Required] [Hard Gate] Critical states exist

- Do: Design the loading, empty, error, and success states of each data view and action that can be slow, empty, or fail.
- Do not: Ship only the filled, happy-path screen.
- Why: Users meet the other states often, and they are where trust is lost. (Nielsen heuristics 1 and 9)
- Check: write a matrix in the Delivery Gate: each data view or action × loading / empty / error / success → frame name, or "cannot happen: reason"; a blank cell is a FAIL; audit_ui when the ryux MCP is connected

### RX-EC-02 [Required] Errors with a way forward

- Do: When something fails, say what happened, why if it helps, and the next action (retry, another method, contact).
- Do not: End on an error with only an "OK" button.
- Why: A recoverable error keeps the task alive. (Nielsen heuristic 9 (1994))
- Check: heuristic_eval H-09

### RX-EC-03 [Preferred] Data volume, shape, and length

- Do: Check one item, many items, duplicates, missing fields, long names and long Indonesian words, and large amounts such as Rp1.250.000.000; paginate or virtualize long lists, and wrap or truncate with access to the full value. A field that holds a sentence or more (a title, a method, a note) grows with its text instead of hiding the rest past its edge; one that must stay one line keeps line breaks out.
- Do not: Design only around a tidy sample of five short items, or put text that runs to sentences in a one-line field.
- Why: Real data is uneven and longer than sample data, and layouts break at the extremes. (Localization practice; ryux review practice; ryux editor, research review, 2026-11-13: a one-line field hid the report's stated limitation past its edge, at 1440 and 400 px)
- Check: visual QA

### RX-EC-06 [Contextual] Slow, timeout, offline, server failure

- When: the screen depends on network data
- Do: Keep user input, show cached data with its age, offer retry, and say plainly when the server failed versus the connection.
- Do not: Show an endless spinner, an empty screen, or lose input when the request fails.
- Why: Connection quality varies a lot between places and moments. (ryux review practice)
- Check: review

### RX-EC-07 [Contextual] Roles, access, and sessions

- When: the product has roles, permissions, read-only modes, or sessions
- Do: Design read-only and restricted states (say why an action is unavailable and who can do it, using roles that exist), and on session expiry keep the user's work and return them to the same place after signing in.
- Do not: Invent roles, show actions that fail only after the user tries them, or dump users on a login screen and lose their progress.
- Why: Users need to know whether to ask someone, and re-authentication should cost seconds, not the task. (ryux review practice)
- Check: review

### RX-EC-09 [Contextual] Design for the person who would misuse it

- When: money moves, an account holds value (balance, points, promos, credit), identity is checked, or one person's action reaches another
- Do: Name the antipersona before the flow: the one person most likely to abuse it here (a promo hunter with many fake accounts, a thief with an unlocked phone, a scammer asking for a QRIS payment or an OTP, a family sharing one account) and what they would try.
  - Design the step that stops them where the honest user barely notices it: a confirmation that shows the recipient's name before paying, a PIN or biometric before a transfer or a paylater limit change, a cooling-off period for a new device, one promo per verified identity.
  - Say plainly what never happens: the app never asks for the OTP or PIN by chat or phone, and a refund never needs the user to pay first.
  - Give the victim a way back: report, freeze, or sign out every device, reachable from the transaction itself.
- Do not: Add friction to every step for everyone, show a recipient's full name or number to anyone who types a guess, or leave the scam path (pay first to receive) looking like a normal flow.
- Why: Fraud on payments, promos, and accounts is a daily cost of local money flows; a control the honest user barely sees is cheap, and a missing one is paid by the victim. (NNGroup UX deliverables glossary (antipersona: a user group that could misuse the product and harm target users or the business); written for RYUX)
- Check: review
