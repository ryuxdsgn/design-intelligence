I've written `DESIGN.md` from your brief and stopped there; no screens or code yet.

There were no product docs or existing screens, so the brief was the only source. The reference-screen library wasn't connected, so every layout decision is rated "no evidence" (a judgment call) until someone checks it against real delivery and ride-hailing apps.

**What's in it:**
- **Order steps:** seven proposed steps from placed to delivered, with how food and grocery orders differ. Only "placed" and "delivered" come from the brief; the steps in between are assumptions. "Running late" and "item unavailable" are handled as states that can appear on top of the normal steps.
- **Patterns:**
  - One tracking screen that changes as the order moves.
  - The arrival time is always the first thing you see.
  - A map with a bottom panel once a courier is assigned.
  - A calm late banner that shows the new time, the old time and a reason when one is known.
  - A decision card for an unavailable item that shows the price effect and what happens if the customer doesn't answer.
  - A visible "last updated" note with retry when updates stop.
- **Prototype control:** a clearly marked demo panel to jump between states, so reviewers can reach "late" and "item unavailable".
- **Visual basics:** spacing, type sizes, status colours, touch-target size and motion timing, all marked "proposed". Brand colour and typeface are left for you.
- **Evaluation:** five success criteria and the riskiest assumption: that customers notice the unavailable-item card while the order keeps moving. A five-person test checks it.
- **Eight open questions**, each with who can answer it.

I didn't invent any fees, refund rules, compensation for late orders, ratings or delivery counts; the open questions cover them.

**Three questions before design starts** (reply with numbers, e.g. "1b, 2a, 3a"):

1. **Market and language**
   a. Tell me the market (recommended, since it sets currency, time format and copy language)
   b. Keep it neutral: English, generic currency
2. **Look and motion**
   a. Calm and trustworthy, motion only for status changes (recommended for a screen people glance at)
   b. Warm and friendly, with a little more life on "arriving" and "delivered"
   c. Your own words, brand colour and typeface
3. **Item unavailable: what can the customer do?**
   a. Accept a suggested replacement, pick another item, or remove it and get a refund; if they don't answer, the item is removed (recommended as a starting point to confirm)
   b. Remove and refund only, no replacements
   c. Tell me the real rule

```
PRODUCT        PASS · users, jobs and order steps come from the brief; gaps are listed as open questions · evidence None
UX             PASS · order steps, both problem states, the no-response path and recovery are all defined
CONTENT        PASS · no invented fees, numbers or policies; voice left unset until the market is known
UI             N/A  · document only; brand direction not set yet · point of view: the arrival time is the product · illustration style: none
DESIGN SYSTEM  N/A  · visual values are proposed, not built
ACCESSIBILITY  N/A  · requirements written (contrast, 44px targets, not colour alone, reduced motion); nothing built to check
RESPONSIVE     N/A  · width plan written (320 smallest); nothing rendered
EDGE CASES     N/A  · state list written; screen-by-state table comes with the design
CODE QUALITY   N/A  · no code
VISUAL QA      N/A  · nothing rendered
ANTI-SLOP      PASS · the one invented visit count was removed; sample data is labeled
FINAL          PASS · document checks only; not tested with users
```

Waiting for your answers. When you send them, I'll write them into the project settings at the top of `DESIGN.md`.
