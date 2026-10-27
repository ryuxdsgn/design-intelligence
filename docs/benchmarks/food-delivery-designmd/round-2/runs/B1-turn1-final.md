I've written `DESIGN.md` as a draft. Nothing is built yet. Every colour, font, spacing and motion value in it is marked *proposed* until you confirm it.

**What's in it**
- **Direction:** your two references are recorded in the RYUX context block, with a note that we take their direction but not their brand, screens or characters. The motion study isn't copied directly: each moment is turned into a food-delivery version of it.
- **Main idea (proposed): "the order travels as the food."** Photos of the ordered items form a small stack on the order card. When the courier picks up, that stack moves into the courier's bag on the map, and on delivery it lands at the door. This is the one memorable brand moment, and it appears at just three stage changes.
- **Late order:** handled inside the same tracking panel, not as a pop-up. The arrival time rolls to the new time, a calm "running late" status appears in amber with text, and there is one way to get help. It has no bounce and no jokes.
- **Unavailable item:** a panel over the tracking screen, one item at a time. The options are "Use this replacement", "Pick something else" or "Remove item", and the change to the total shows before you confirm. You can undo after choosing.
- **Look (proposed):** warm cream background, a single paprika-orange accent (deliberately far from both references' brand colours), the Figtree font, rounded shapes, and the illustration style written down before anything is drawn. I measured the text contrast: every text colour pair passes WCAG AA.
- **Motion:** a table of 12 moments covering what moves, why, and the fallback when someone has reduced motion turned on.
- **Also included:** a table of the loading, empty, error and success states, three layout options to compare before we build, success criteria, the riskiest assumption with a five-person test for it, and 10 open questions.

**Things I deliberately left out:** the reference app pays a voucher when a pickup runs late. That's their policy, so I didn't adopt it. I also didn't make up what counts as "late", what happens when a replacement isn't answered, or whether there are refunds. Those are open questions, not facts in the file.

The first three questions change which screens and states the prototype needs:

1. **When an item is unavailable, who proposes the replacement, and what if the customer doesn't answer?**
   1. *(Recommended)* The store or shopper proposes one. If there's no answer within a set time, the item is removed and refunded. You tell me the time limit.
   2. The order waits until the customer chooses.
   3. The shopper picks the closest match.
   4. Something else.
2. **When an order is late, what does the customer get?**
   1. *(Recommended)* Just the new time, a reason when the system knows one, and help. No compensation.
   2. A refund or credit, and you give me the rule.
   3. Something else.
3. **Market (language, currency, date format)?**
   1. *(Recommended)* None yet: English copy, prices shown as clearly labelled sample data.
   2. A specific country you name.

I'll wait for your answers. After that, the next step is drawing the three layout options (food first, map first, timeline first) with the same sample order, for you to pick from.

```
PRODUCT        PASS  · users, jobs and unknowns are sourced from the brief and refs; no invented rules · evidence Thin (one ref flow, no MCP)
UX             PASS  · patterns, states matrix and navigation defined; layout model left to Explore
CONTENT        PASS  · voice proposed, not confirmed; locale open
UI             N/A   · no screens yet (point of view proposed: "the order travels as the food")
DESIGN SYSTEM  N/A   · tokens proposed only
ACCESSIBILITY  N/A   · contrast of proposed pairs measured; nothing rendered
RESPONSIVE     N/A   · widths proposed only
EDGE CASES     N/A   · matrix written; no screens to check
CODE QUALITY   N/A   · no code
VISUAL QA      N/A   · no render
ANTI-SLOP      N/A   · applies once screens exist
FINAL          PASS  · document only; not tested with users
```
