I've updated `DESIGN.md` with your answers and stopped there. No screens or code yet.

**What changed and why**
- **Project context block:** added the product, users, market, width, brand and policies exactly as you answered them. The look and motion lines now include visible food, our own courier character and an illustration for each state.
- **Users and needs:** now based on your answer about users (city adults on mobile, often on the move, one hand), not my guesses. There's a new one-handed rule: main actions sit in the bottom third of the screen, and the bottom panel can be dragged from anywhere along its top edge.
- **Evidence:** your answers are added as sources. Every policy is marked as not decided.
- **How the screen works:** a strip of item photos sits under the arrival time. While the store prepares or picks the order, the photos become the largest image on the screen.
- **Our courier character:** a rounded helmet in our proposed red-orange, a simple face, and a scooter with the paper bag in a front basket. It has six poses and stands in for "your courier", never as a portrait of the real person. It's built to look nothing like the reference app's rider.
- **State illustrations:** one for each of 10 states, made as one matching set. Late and unavailable-item moments stay calm, with no jokes.
- **Food photos:** natural light and visible texture. The file lists where photos appear, says they're licensed and marked as samples, and covers one restaurant order and one grocery order priced in USD.
- **Motion:** two new moments. The courier changes pose when the order moves to a new stage, and when the bag is picked up the courier lifts off the map and lands in the panel. That second one is our own move, not the reference app's leap and thumbs-up.
- **Screen widths:** 390 is designed first, and 360 is checked for item names and prices that wrap.
- **New "Assumptions for the prototype" section (A1–A16):** this is where I made the calls you left open. The main ones:
  - **Working name:** "Tote" (proposed), shown as plain text with no logo.
  - **Late:** an order counts as late when the new estimate runs past the first window shown. No compensation or cancel option.
  - **Unavailable item:** three choices — the store's replacement, another item, or remove it. There's no countdown and nothing is decided for the customer.
  - **Contact and handoff code:** placeholders only.
  - **Prototype controls:** a clearly labelled panel that jumps to any state, so nobody has to wait for the order to move.
  - **"Proposed rule" tag:** any line that depends on an undecided policy carries this small tag in the prototype, so it never reads as a confirmed promise.
- **Open questions:** all 10 are still open, and each now points to the assumption the prototype uses in the meantime.

The voice and tone section is still a proposal and is left blank in the context block. Tell me if it fits and I'll record it there.

**Delivery Gate (for a document)**
```
PRODUCT   PASS · every fact traced to the brief or your answers; undecided policies kept as tagged assumptions · evidence Thin (one motion reference, no research)
UX        PASS · flows, one-handed placement, states matrix, prototype assumptions for each undecided rule
CONTENT   PASS · voice proposed, not confirmed; policy-dependent copy tagged "Proposed rule"
UI, DESIGN SYSTEM, ACCESSIBILITY, RESPONSIVE, EDGE CASES, CODE QUALITY, VISUAL QA, ANTI-SLOP   N/A · no screens or code yet
FINAL     PASS (document only; not validated with users)
```

I'll wait for you before designing or building anything.
