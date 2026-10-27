I've updated `DESIGN.md` with your answers. The rest of the file is unchanged, and nothing is built yet.

**What changed**
- **Product, users, market and width:** now recorded as your answers. That's a global product in English with USD sample data, designed at 390 px wide. The users are adults in large cities, often on the move and using one hand.
- **New section, "Prototype assumptions" (P1–P9):** since the policies aren't decided, these set how the prototype behaves, each labelled as an assumption and never shown on screen as a promise:
  - **Unavailable item (P1):** the store suggests a replacement and the rest of the order keeps moving. If the customer hasn't chosen by the time the courier picks up the order, the item is left out and not charged.
  - **Late (P2):** "running late" means later than the first arrival time the customer was shown. There's no made-up threshold.
  - **Compensation (P3):** nothing is offered.
  - **Contact (P4):** Message, Call and Get help all open something real, and each says clearly that it's a prototype.
  - **At the door (P5):** a 4-digit sample code to match.
  - **Fees (P7):** sample fees are shown as labelled lines, and the total only changes through a replacement choice.
  - **Out of scope (P8):** cancelling, failed delivery, rating, tipping and receipts.
  - **Name (P9):** working name "Pantry & Plate", in plain text with no logo. I haven't checked whether the name is trademarked.
- **One-handed use:** everything you act on sits in the bottom half, in a panel you drag with your thumb that snaps to two heights. Tap targets are at least 48 px. There's a matching new success check.
- **Food shown:** item photos are visible at every stage, from placed to delivered. I wrote a photo direction (warm daylight, close crops, a consistent angle), and illustrations never stand in for food photos.
- **Illustrations:** a set of 12 state illustrations, made as one family, alongside our own courier character.
- **Map:** a hand-built map of a sample neighbourhood, drawn in the brand colours and labelled illustrative.
- **Formats:** US formats such as $12.40 and 6:42 PM, with the clock time and the minutes left shown side by side.
- **Open questions:** now 12, each linked to the assumption the prototype uses in its place, plus a list of what's already answered.

The next step is drawing the three layouts for the tracking screen with the same sample order, so you can pick one:
- **A. Food first (recommended):** the food and the stage illustration fill the top until the courier is moving.
- **B. Map first:** the map is always there, like a ride-hailing app.
- **C. Timeline first:** all the stages listed in order, with the map inside the "on the way" step.

I'll wait for your go-ahead.

```
PRODUCT        PASS  · every product fact is from your answers; undecided policies are labelled prototype assumptions · evidence Thin (one ref flow, no MCP)
UX             PASS  · patterns, one-handed reach, states and navigation defined; layout goes to Explore
CONTENT        PASS  · locale set as en-US assumption; voice still proposed
UI … ANTI-SLOP N/A   · document only; nothing rendered or built
FINAL          PASS  · document only; not tested with users
```
