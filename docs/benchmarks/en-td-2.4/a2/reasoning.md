# EN-24-A2 · Transaction detail — design reasoning

Frame: `bWvR3` in `ryux.pen`, at x=71694, y=0 (to the right of all existing content). Export: `bWvR3.png`.

## Assumptions (I didn't ask questions; I made these calls instead)
- **Platform:** a 390pt-wide mobile screen. Fintech payments happen mostly on phones.
- **Market and product:** the canvas already has Indonesian fintech work (Virtual Account, Rp), so I used Rupiah formatting (`Rp202.500`) and WIB time. The copy is in English, as the brief was.
- **Payment type:** a prepaid electricity (PLN) token paid from wallet balance. I chose it on purpose. It's a common payment, and the user *still needs something* from this screen after paying (the 20-digit token), so it tests whether the screen serves the next step and not just "receipt as decoration". The same structure works for merchant, transfer or bill payments: the token card becomes whatever the user gets (a voucher code, a booking reference) or goes away.
- **No brand was given**, so the palette is neutral (warm off-white, near-black ink) with status colours carrying the meaning. New variables are prefixed `a2-` so they don't collide with existing ones.

## What the user needs, in order
1. **Did it work?** The status badge and label come first, colour-coded, and the label always pairs colour with an icon and words, so it doesn't rely on colour alone.
2. **How much?** The amount is the biggest type on the screen (40px bold). It confirms they paid the amount they expected.
3. **What do I do now?** The token card is the only dark, high-contrast block, so the eye goes there next. The digits are in a monospace font grouped in 4s so they're easy to read and type. "Copy token" is a real button (40px tall). The kWh amount is shown so the user knows what they got.
4. **Proof and details.** These are grouped by meaning, not dumped into one long list:
   - *Who/how:* recipient and meter number, customer name and power class (so they can spot a wrong meter), payment method with the **remaining balance**, which answers "how much do I have left?" without leaving the screen.
   - *Breakdown:* token value + admin fee = total. The fee is shown, not hidden; trust matters more than looking clean.
   - *Reference:* transaction ID (monospace, with a copy icon, for support chats) and a timestamp to the second.
5. **If something's wrong:** a quiet "Problem with this payment? Get help" link, plus a help icon in the top bar. It's always there but never competes with success.

## Actions
- **Done** is the single primary action, in a fixed footer within thumb reach. After paying, most people just want to leave.
- **Share receipt / Download PDF** are secondary outlined buttons. People often send proof to family, a landlord or an employer, so sharing is one tap away but doesn't compete with Done.
- The top bar uses **Close (X)**, not Back, because going "back" into a completed checkout is a classic way to get paid twice.

## States (same layout, status slot swaps)
- **Processing (amber, clock):** the token isn't ready yet. The copy sets an expectation ("usually within 2 minutes", "we'll notify you") and heads off the riskiest thing users do here: *"Don't pay again — you won't be charged twice."* The actions are Done and Check status.
- **Failed (red, X):** the first thing it says is **"No money was taken"**, because that's the user's real worry. It gives the reason in plain language and the unchanged balance (it matches the success screen: 1.550.400 − 202.500 = 1.347.900). The primary action is Try again; the secondary is Contact support.
- The amount and meta line stay in the same place in every state, so the screen reads the same whatever the outcome.

## Visual decisions
- Containers are used only where they group things: the token card, three detail groups, and the footer. The hero sits directly on the background.
- Hairline dividers inside groups, no shadows, no gradients. A receipt should feel calm and official, not celebratory. A small green check is enough; no confetti on a utility bill.
- Inter for the interface, JetBrains Mono only for things people copy or read out (token, transaction ID).
- Contrast: muted text #5B616B on white and #F3F4F1 is above 4.5:1. Token-card text is white or #C9CDD3 on #121417. Status label colours (#11734A, #8A5300, #B42318) all pass AA on the light background.
- Touch targets: buttons are 48–52px tall and top-bar icon buttons are 44×44.

## Not covered or open questions
- Dark mode, smaller screens (360px) and a loading skeleton weren't drawn.
- Real brand, payment types other than the PLN token, and the exact copy for regulatory or legal receipts would need confirming with the team.
