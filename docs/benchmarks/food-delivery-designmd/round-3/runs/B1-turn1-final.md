I've written `DESIGN.md` at the project root and stopped there. No screens or code yet.

**What's in it**
- **Context block:** your UI direction and motion direction recorded as given. Market and voice are left unset because nobody has decided them yet.
- **Users and jobs:** the main job is "know when it arrives and whether I need to do anything." I didn't write personas or research, because none were given.
- **Evidence:** each claim says where it came from. The seven frames and `ref/motion.md` all come from one ride-hailing app, so I rated them as thin evidence. They give us the motion and flow ideas, but none of that app's brand, rider mascot, voucher-timer rule or copy.
- **Interaction patterns:**
  - One tracking screen: a map on top and one bottom sheet that changes as the order moves along.
  - Running late is a change to that same sheet, not a pop-up.
  - An unavailable item opens a sheet over the map that shows what each choice costs.
  - Delivered replaces the tracking screen.
  - It also includes a table of loading, empty, error and success states for each part.
- **Visual direction (proposed):** the idea is "the bag's journey." One illustrated paper bag fills up, gets sealed, rides with the courier on the map and lands at your door. Playful moments happen only when things are going well, never when the order is late or an item is missing. The file also has warm colour, type, spacing and shape values; all text colours pass contrast checks, which I calculated. The illustration style is written down before anything is drawn.
- **Motion (proposed):** two spring settings, one quick and one with a little bounce, plus a list of 15 animated moments, how each starts and ends, and what replaces it when the phone is set to reduce motion.
- **How we evaluate:** five success criteria, and the riskiest assumption with the cheapest way to test it.
- **Open questions:** 10 of them. Nothing unanswered is written into the file as if it were decided.

**Delivery Gate (for a document)**
```
PRODUCT   PASS · brief-derived only; 10 unknowns listed, none presented as fact · evidence Thin
UX        PASS · flows, patterns, and a full states matrix; key rules pending (Q1, Q2)
CONTENT   PASS · voice proposed and marked unconfirmed; no invented policy copy
UI, DESIGN SYSTEM, ACCESSIBILITY, RESPONSIVE, EDGE CASES, CODE QUALITY, VISUAL QA, ANTI-SLOP   N/A · no screens or code yet
FINAL     PASS (document only; not validated with users)
```

**Three questions to answer before I design.** These change which screens exist. Reply with numbers:

1. **When an item is unavailable, what can the customer choose?**
   1. *(Recommended)* Accept the store's suggested swap, pick another item, or remove it and get a refund. If they don't answer by a set time, the item is removed and refunded.
   2. The same three choices, but if they don't answer, the store's suggested swap is used.
   3. Remove and refund only, with no swaps.
   4. Something else (please describe).

2. **When the order is late, what can the screen offer?**
   1. *(Recommended)* A new arrival time and a reason when one is known; no compensation or cancel option until you confirm the policy.
   2. The same, plus a "contact support" button.
   3. The same, plus compensation or the option to cancel (tell me the rule).

3. **Which market?**
   1. *(Recommended)* None in particular: English, a neutral currency, sample prices clearly marked as samples.
   2. A specific country: tell me which, and I'll use its language, currency and payment methods.

The other seven open questions can wait, and anything you don't answer stays listed in the file as open. Once you reply, I'll record your answers in `DESIGN.md` and wait for you to tell me to start designing.
