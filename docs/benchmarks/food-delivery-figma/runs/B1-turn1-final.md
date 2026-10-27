I've written `DESIGN.md` from your brief, all seven frames in `ref/`, and `ref/motion.md`. It's a first draft: the colours, type, spacing and motion values are all marked **proposed**, and anything the brief doesn't settle is listed under Open questions rather than written in as fact.

**What's in it**
- **Context block:** the product, mobile first, and your visual and motion direction, with the note to take the direction and not the other companies' brand, screens or characters.
- **Order status:** proposed stages from placed to delivered. I've only listed stages the order system will actually report; which ones it does is still an open question.
- **Running late:** the arrival time updates in place and the old time stays visible for a moment ("Was 7:40–7:50"). The tone gets calmer, not louder. It only gives a reason for the delay when the system actually knows one.
- **Item unavailable:** a decision card that sits above the tracker until it's answered. It has one main action and shows what the choice does to the total.
- **Concept, "The order travels":** before pickup, photos of the customer's own food are the hero. At pickup, those photos shrink into the courier's marker on the map. That marker is the signature, so the map shows the customer's food, not a generic scooter or rider.
- **Motion:** a table of every moment, from tap feedback to delivered, with how often the customer sees it, timing values, and what happens when reduced motion is on.
- **Illustration style:** written down before anything is drawn. It uses objects (the bag, the pan, the basket, the doorstep), with no mascot or people. Late, unavailable and failure states get no illustration.
- **Three layout options to compare, not chosen yet:** map always on top; food first, then map after pickup (my recommendation to test first); or a timeline with the map as a card.
- **How we'll judge it:** success criteria, a contrast check (I calculated the proposed colour pairs; all pass 4.5:1), and a usability test plan. The riskiest assumption is that customers notice and answer a substitution in time.

**Questions before any screens.** These three change the flow the most. Reply with numbers, e.g. "1b, 2a, 3a":

1. **Market** (currency, language, address format). I haven't assumed one.
   a) You name it
   b) Indonesia (IDR, Bahasa Indonesia)
   c) US (USD, English)
   d) Several markets
2. **Item unavailable: who decides, and what happens if the customer doesn't answer?**
   a) *(Recommended)* The customer decides in the app within a time limit; if they don't answer, the item is removed and refunded. You'd set the limit.
   b) The customer sets a preference at checkout; a shopper applies it and the customer can change it.
   c) The store or shopper decides; the customer is told, and refunded if the item is removed.
3. **Late order: what can the product offer?**
   a) *(Recommended)* A revised arrival time plus contact or help, with no promises.
   b) An automatic credit or compensation rule exists (tell me what it is).
   c) The customer can cancel once the order is late by more than a set amount.

There are eight more questions in the file: platform, chat and calling, refunds, which order events and arrival-time data exist, the grocery picking stage, several active orders, brand assets, and voice.

```
PRODUCT        PASS · all five DESIGN.md questions are answered with a source or listed as open; no invented rules, numbers or people · evidence Thin (one ride-hailing reference, no research)
UX             PASS · patterns, states and recovery are defined for status, late and unavailable; business rules left open, not invented
CONTENT        PASS · voice proposed and marked as inferred, kept out of the context block; tone set for each moment; one name per thing ("courier")
UI             N/A · no screens yet · concept: "The order travels", signature: the food-photo courier marker · illustration style: DESIGN.md › Illustration style
DESIGN SYSTEM  N/A · tokens proposed only
ACCESSIBILITY  N/A · no screens yet; contrast calculated for the proposed colour pairs (all ≥ 5.2:1), not checked on a render
RESPONSIVE     N/A · widths stated (390 / 375 pt iOS, 360 dp Android, 200% text); nothing drawn yet
EDGE CASES     N/A · states listed in the file; the per-screen state checklist comes with the screens
CODE QUALITY   N/A · no code
VISUAL QA      N/A · nothing rendered
ANTI-SLOP      PASS · no made-up figures or urgency; reference brands and characters explicitly excluded
FINAL          PASS (for the document; not tested with users)
```

I'll wait for your answers before designing any screens.
