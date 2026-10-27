I've updated `DESIGN.md` with your answers. All colours, type and motion values are still marked **proposed**, and the policies you said aren't decided stay under Open questions.

**What changed and why**
- **Project summary at the top:** now includes the users, the market (global, English, USD as sample data), the 390 width, that the brand isn't decided, and your fuller visual direction (show the food, our own courier, illustrations for each state).
- **Users and needs:** "adults in large cities, on the move, one hand" is now recorded as your answer instead of my guess.
- **One-handed use (new section):** everything the customer taps sits in the bottom half of the screen, and the main button is full-width at the bottom. The bottom panel has two heights; it follows the thumb when dragged, and tapping its handle also works. Touch targets are at least 44 pt.
- **Showing the food:**
  - The order's photos are visible at every stage.
  - Once the order is picked up, the food rides on the map in the courier's marker.
  - The food photography section covers lighting, crop and source. Mockup photos are labelled as sample images.
- **Courier character:** our own courier rides a cargo e-bike, and the food sits in its front basket. It's deliberately different from the reference's helmeted scooter rider (no thumbs-up, no speech bubble). It comes in a few skin-tone and hair versions and stands for the service, not the real courier.
- **State illustrations:** there's now one for every state, including late, item unavailable, cancelled and offline. Those use calm poses rather than jokes; the playful poses are kept for the milestones.
- **Policies:** substitutions, delays, refunds, fees and contacting the courier are still undecided. Any prototype that needs one shows "Prototype rule, not decided yet" on that screen, so nothing reads as a promise.
- **Assumptions (new section):** native iOS and Android, one active order at a time, the list of order stages, grocery orders having a picking stage, the arrival time shown as a window, US English formats (`$12.40`, `7:40 PM`), and `[LOGO]` wherever the logo would go.
- **Open questions:** cut from 11 to 8, keeping only the undecided policies, the order data we need from engineering, the brand, and the voice.

```
PRODUCT        PASS · every answer recorded with its source; undecided policies stay open and are labelled on screen · evidence Thin (one ride-hailing reference, no research)
UX             PASS · one-handed reach, the order stages, late, unavailable item, and what happens before, during, after and on failure are all defined
CONTENT        PASS · voice proposed for global English; one word for the courier; button labels start with a verb
UI             N/A · no screens yet · concept: "Your order, on its way to you", signature: the courier's basket and the food bubble on the map · illustration style: DESIGN.md › Illustration style
DESIGN SYSTEM  N/A · tokens proposed only
ACCESSIBILITY  N/A · no screens yet; text colour pairs calculated at 5.2:1 or better, not checked on a render
RESPONSIVE     N/A · 390 is the main width; 375 / 360 and 200% text rules written down
EDGE CASES     N/A · states listed; the per-screen state checklist comes with the screens
CODE QUALITY   N/A · no code
VISUAL QA      N/A · nothing rendered
ANTI-SLOP      PASS · no made-up figures, policies, urgency or logo; the reference brands' characters excluded
FINAL          PASS (for the document; not tested with users)
```

The next step is to draw the three layout options side by side at 390, using the same sample order, so you can pick one:
- **A. Map first:** the map is always on top, as in the reference.
- **B. Food first, then map:** the food fills the top until pickup, then the map takes over. This is the one I recommend testing first.
- **C. Timeline first:** a list of stages is the screen and the map is a card.

I'll wait for your go-ahead before drawing them.
