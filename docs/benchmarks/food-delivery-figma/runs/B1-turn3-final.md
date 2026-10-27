I've designed the order tracking flow on a new **"Pilot B1"** page in your file, and every screen was checked from a render. One check still fails: the bottom panel uses five text sizes where our rule allows three. That's why the result below is FAIL.

**What's on the page**
- **1 · Explore:** the three layouts side by side on the same Preparing state, each with what it assumes about customers, plus a rating against our success criteria. I built out **B (food first, then the map after pickup)** because you asked me to design it. The layout choice is still yours: switching to A only changes the three screens before pickup.
- **2–3 · Main flow:** Placed, Preparing (food), Picking (grocery), Picked up, On the way, Arriving, and Delivered (which replaces the tracker).
  - The food photos are the hero until pickup.
  - From pickup, the customer's food rides on the map with the courier's head.
- **4 · Running late** and **item unavailable:**
  - Late keeps the same panel. The new time shows with the old one underneath, the courier switches to a calm pose, and a tag shows the late rule isn't decided.
  - Unavailable has five screens: the decision (old and new price side by side), sending, failed (the choice is kept), replacement accepted, and dismissed (a card stays pinned until it's resolved).
- **5 · Edge states:** loading, finding a courier, offline with the last known position, the map failing to load, and cancelled by the store.
- **6 · Width check at 360:** this found the arrival time wrapping ("PM" on its own line). The fix is to shrink the illustration below 375, now written into DESIGN.md.
- **0 · Read me and handoff:** what's sample data, the undecided policies, interaction and truncation rules, component names, and which screens cover which states.
- **Below those:** the components, the token variables and text styles, an asset board with photo credits, and the illustration set of 10 states with our own e-bike courier, colours tied to the tokens.

**Things you should know**
- **Photos:** Figma AI had no credits left (it resets 3 Nov), so no image generation ran. I used openly licensed Wikimedia Commons photos instead (CC0, CC BY and CC BY-SA). They're credited on the asset board and labelled as sample images.
- **Icons:** I drew stand-ins in the proposed Phosphor style. Swap in the real set before build.
- **Undecided policies** appear on screen as dashed "Prototype rule, not decided yet" tags: no answer to a substitution, refunds, when an order counts as late and any credit, and payment after a cancelled order.
- **DESIGN.md** now has the tokens the build added, a fix to `accent/soft` (the courier initial was at 4.39:1, now 4.6:1), the photo sourcing, the icon note, the 360 rule, and a link to the file. Sections are marked where they changed.

```
PRODUCT        PASS · policies stay labelled on screen; the names, times and prices are sample data · evidence Thin (one ride-hailing reference)
UX             PASS · each action shows what happens before, during, after and on failure; back never reopens a finished order; actions in the bottom half
CONTENT        PASS · button labels start with a verb; one word ("courier") throughout; calm tone for late, unavailable and cancelled; stranded single words rewritten
UI             PASS · concept: "Your order, on its way to you", signature: the food bubble riding on the map · illustration style: DESIGN.md › Illustration style
DESIGN SYSTEM  PASS · one variable collection, text and shadow styles, components with variants; icons are stand-ins
ACCESSIBILITY  NOT VERIFIED · contrast calculated for every text pair (all 4.5:1 or better after the accent/soft fix); taps at least 44 pt; 200% text and screen-reader order not drawn or checked
RESPONSIVE     PASS · rendered at 390 and 360; one wrap found and fixed; 375 not drawn separately
EDGE CASES     PASS · state matrix in the Read me; "no orders" can't happen; several active orders out of scope
CODE QUALITY   N/A · no code
VISUAL QA      PASS · Figma renders of all 24 phone screens at 390 and 360, in every state listed
ANTI-SLOP      FAIL · 5 text sizes in the bottom panel (32/20/16/14/12) against a limit of 3; 1 accent colour, 1 warm grey family, 1 icon set, no invented logo
FINAL          FAIL · because of the text-size count; not tested with users
```

**Not drawn:** the "Choose another" picker, Order details, the Help and Contact courier screens, 200% text, dark mode, and tablet.

For the next step I'd fold the 14 and 12 sizes into one secondary size so the panel uses three. Do you want that, or would you rather pick between A and B first?
