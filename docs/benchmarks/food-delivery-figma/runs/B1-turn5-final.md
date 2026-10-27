I redrew the courier illustrations on "Pilot B1 fixed" only. The original "Pilot B1" page still has its 33 old illustration instances and none of the new ones (checked by script).

One thing to know about provenance: I didn't draw these by hand in Figma. I built them as SVG from a script (`/tmp/b1scripts/illo2.py`) and imported them into Figma as editable vectors, with every colour bound to a token variable. They're illustrative and made by us, with no generated images and no copied references.

**DESIGN.md changed first, with reasons recorded**
- **Colours:** the old "at most four colours per drawing" rule is replaced by colours per role. The character and objects use the five illustration colours plus skin. There is one shadow tone (`text/primary` at 14%) and one new food tone, `illo/food` `#D9944A`, for broth, crusts and the avocado pit. Places use surface tokens only. Reason: four colours were what made the food read as flat boxes.
- **Construction:** tapered limbs with elbows and knees, mitten hands with a thumb, shoes with a cream sole, and a three-quarter view throughout.
- **The bike** is now an e-bike: battery on the down tube, hub motor, front light with a soft beam, and an insulated box on the rear rack. This replaces the front basket.
- **The state table** now gives each state a place, a pose and an expression. There is also a new rule for small sizes (below).

**What changed in Figma**
- **One shared head:** `Illo2/Courier head` has 8 expressions: smile, focused, apologetic, shrug, warm, look up, look down, calm. Every scene and the map marker use it. The two other skin tones on the sheet are fill overrides on the same head.
- **11 scenes**, each in a small rounded place made from surface colours:
  - **Preparing:** kitchen pass, ramen steaming under the heat lamp, gyoza beside it; the courier holds the bag open with both hands, focused.
  - **Picking:** the courier reaches up to a shelf with a bag of groceries in the other hand.
  - **On the way:** leaning into the ride, with ramen and gyoza visible in the rear box.
  - **Running late:** stopped at a red light with a foot on the kerb, apologetic and calm.
  - **Item unavailable:** a small shrug with an empty hand open beside the shelf gap, holding up the cherry tomatoes.
  - **Delivered:** at the open door, holding the bag out with both hands, steam over the bowl, warm smile.
  - **Finding a courier:** the courier looks at a phone with a soft signal arc.
  - **Offline:** standing by the parked bike, phone lowered, faded signal arcs above.
  - Placed, Arriving and Cancelled are redrawn the same way.
- **Smaller headers needed a crop.** At 88 pt the full scenes read as noise. Sheet headers now use a crop of each scene showing the courier, the food and part of the place, in a rounded card with a thin edge. Delivered and Cancelled use the full scene.
- **Every screen updated:** all 134 illustration instances on the copy now use the new set. A few screens use a better-matched scene than before:
  - Finding a courier now shows the phone scene.
  - Offline now shows the offline scene.
  - The unresolved item-unavailable screens (decision, sending, failed, pinned, and the 360 version) show the shelf-gap shrug.
- **Illustration sheet:** rebuilt with all 11 scenes, the new Finding a courier scene, the map-marker head, the two skin tones and the expression row. There is also a separate components board.

**Problems I hit and fixed**
- Binding colours to variables quietly removed the shadow tone's transparency in placed copies, so shadows rendered solid black. I moved the transparency onto the layers themselves and re-checked every render.
- Getting there took two failed builds, and I removed both.
- The rebuilt sheet grew taller, so I moved the components board down to stop them overlapping.

**Checked at real size:**
- 390: sections 2–5 in full, and close-ups of Picking and Cancelled.
- 360: the whole 360 section, with close-ups of the Preparing, Running late and Finding a courier headers and the Offline and Delivered screens.

```
PRODUCT        PASS · art shows only states the flow has; the courier stays a mascot, not the real person · evidence None (judgment call)
UX             PASS · each state's picture matches its screen; the unavailable and searching states now have their own scenes
CONTENT        N/A  · no copy changed; alt text is written into each component's description
UI             PASS · concept "Your order, on its way to you", signature: the food riding with the courier · illustration style: DESIGN.md › Illustration style (v2)
DESIGN SYSTEM  PASS · one head component, 11 scenes + 9 header crops, colours bound to tokens, illo/food recorded
ACCESSIBILITY  NOT VERIFIED · art is decorative next to text that says the same; alt text written, screen-reader order not tested
RESPONSIVE     PASS · checked at 120 × 90 (390), 88 × 66 (360), 240 and 280; full scenes failed at 88 pt, so header crops were added
EDGE CASES     PASS · placed, preparing, picking, searching, on the way, late, unavailable, arriving, delivered, cancelled, offline
CODE QUALITY   N/A  · no product code; the SVG generator is a design tool
VISUAL QA      PASS · Figma renders at 390 and 360, close-ups at real size, sheet compared side by side
ANTI-SLOP      PASS · own character and construction, no default flat people, no copied reference art or brand
FINAL          NOT VERIFIED · accessibility not tested; not tested with users
```

**Still to judge:**
- At 88 pt the face changes are small. Posture and props carry most of each state, so the late versus delivered difference is clearest at full size.
- The courier's pose is the same standing build in Placed, Preparing, Arriving and Cancelled. Only the arms, the lean and the props change.
- I added two new choices you may want to review: the header crops, and which scene each screen uses.
