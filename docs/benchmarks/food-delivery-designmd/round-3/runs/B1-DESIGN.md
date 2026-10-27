# DESIGN.md

<!-- ryux-context:start -->
- **Product**: A food and grocery delivery app; this work is the customer's order tracking after checkout; working web prototype, mobile first
- **Scope**: Order status from placed to delivered; the late-order state; the unavailable-item flow
- **Users**: Adults in large cities, on mobile, often on the move and using one hand
- **Market**: Not decided; a global product in English; USD as sample data
- **Width**: Mobile first, 390 wide
- **Brand, name, design system**: Not decided; proposals in this file are labelled proposed
- **Policies**: Delays, refunds, substitutions, fees, and contacting the courier are not decided
- **UI direction**: Warm and airy; the food itself is the hero; rounded cards; friendly type; playful illustration; small delightful motion (direction from Airbnb's app, not its brand). The dishes and groceries in the order are visible and appetising. Illustrated, with a courier character of our own and illustrations for the states
- **Motion direction**: The flow and motion of the ride-hailing motion study in ref/ (shared elements, pin drop, same-sheet state changes, rolling digits, route progress), taking the direction, not the brand, screens, or characters
- **Voice and tone**: unset (proposal below, awaiting confirmation)
- **Product docs paths**: none; the brief and the team's answers (2026-10-28) in this file are the only product sources
- **References**: ref/frame-*.png (7 frames, one ride-hailing app), ref/motion.md
<!-- ryux-context:end -->

> Status: second draft, 2026-10-28, with the team's answers. Everything under "proposed" is a design choice waiting for the team's
> confirmation, not a decision the team made. Facts come only from the brief and the references; every gap
> is listed under Open questions.

**The brief (verbatim):** "Build an order tracking experience for a food and grocery delivery app as a working
web prototype, mobile first: the order status from placed to delivered, what the customer sees when the order
is running late, and what happens when an item is unavailable. Flow inspiration: delivery and ride-hailing apps."

---

## Users and needs

| Who and context | Need | Source |
| --- | --- | --- |
| Adults in large cities who have just checked out a food or grocery order | Know the order went through and what happens next | Observed: brief ("placed to delivered"); team answer 2026-10-28 (users, after checkout) |
| The same customer while waiting, on a phone, often on the move and using one hand | Glance and learn two things: when it arrives and whether it is on track; reach every action with the thumb | Observed: team answer 2026-10-28 (mobile, on the move, one hand) |
| Opens the screen many times per order, briefly, between other things | Get the answer in one look without re-reading the whole screen | Inferred; not researched |
| Seeing what they ordered | Recognise their dishes and groceries at a glance; the food looks appetising | Observed: team answer 2026-10-28 ("the dishes and groceries in the order should be visible and appetising") |
| A customer whose order is running late | Know the new time, and why if there is a reason, without having to contact anyone | Observed: brief ("running late"); the need itself is inferred |
| A customer whose item is unavailable | Decide quickly what happens instead, and know what it costs | Observed: brief ("item unavailable"); the decision options are unknown (Open questions 1) |
| At the door | Recognise the courier and the handoff | Inferred from the reference's arrival moment (ref/motion.md: "the thing to match at the kerb") |

No research, analytics, or support data was given. No personas are written here on purpose.

**One-handed use (from the team's answer):** primary actions sit in the bottom third of the screen, within thumb
reach at 390 wide; nothing the customer must tap lives only at the top; the sheet drags from anywhere on its
header, not only from a small handle.

## Jobs to be done

**Primary job.** "When I have ordered food or groceries, I want to know when it will arrive and whether I need
to do anything, so I can get on with my day and be there when it comes."

**Related jobs**
1. When an item I ordered is not available, help me choose what happens instead before the order moves on.
2. When my order is late, tell me honestly how late and what I can do.
3. When the courier arrives, help me find them and confirm I got everything.

**What done looks like for the user:** the order is in their hands; they were never surprised by the time, the
contents, or the price; any decision they had to make was asked once, clearly, with its cost.

---

## Evidence

| Decision or claim | Source | Strength |
| --- | --- | --- |
| The three flows to design: status placed → delivered, running late, item unavailable | Observed: brief | Strong (stated requirement) |
| Mobile-first web prototype, working (interactive, not static frames) | Observed: brief | Strong (stated requirement) |
| Map on top, one bottom sheet that changes state; the unchanged card stays still while the title, subtitle, and button label change | Observed: ref/frame-13.5, 17.2, 20.5; ref/motion.md ("Same sheet, new state") | Thin (one app, ride-hailing, not delivery) |
| Live courier on a route that shortens behind them; arrival pulse; a handoff detail to match at the door | Observed: ref/frame-17.2, 20.5; ref/motion.md ("On the way") | Thin (one app) |
| A progress bar against a promised time | Observed: ref/frame-13.5, 17.2 (a timer bar tied to a voucher rule) | Thin; the voucher rule is that app's business rule, not ours |
| Pin drop with shadow, bounces, ripples, label springing out | Observed: ref/motion.md ("Pin drop") | Thin (one app) |
| Changing numbers roll only the changed digits | Observed: ref/motion.md ("Numbers") | Thin (one app) |
| Snappy, critically damped springs for sheets and pushes; a little bounce only for playful moments | Observed: ref/motion.md ("Springs") | Thin (one app) |
| Warm, airy, food as the hero, rounded cards, friendly type, playful illustration | Observed: user direction naming Airbnb's app; the app itself was not viewed in this session | Direction, not evidence of user need |
| Order items shown as appetising photos; a courier character of our own; illustrations for the states | Observed: team answer 2026-10-28 | Strong (stated requirement) |
| Users are city adults on the move, one-handed, on mobile; 390 wide first | Observed: team answer 2026-10-28 | Strong (stated by the team; not researched) |
| English, USD sample prices | Observed: team answer 2026-10-28 (market not decided) | Strong for the prototype; the real market is still open |
| Every policy (delays, refunds, substitutions, fees, contact) | Not decided (team answer 2026-10-28) | None: prototype assumptions only, see Assumptions |
| Errors say what happened and the next action | Knowledge: Nielsen heuristic 9; RX-EC-02 | Strong (standard) |
| Every async action has before, during, result, recovery | Knowledge: RX-IX-01 | Strong (standard) |
| Reduced motion turns movement into fades or cuts | Knowledge: WCAG 2.3.3; RX-A11Y-08 | Strong (standard) |
| Customers reliably see a substitution request in time | None: assumption, see How we evaluate | None |

The reference frames show another company's brand, colours, mascot rider, and copy. We take the motion and
flow principles only (listed above). Nothing from its visual identity, characters, timer-voucher rule, or copy
is carried over.

---

## Interaction patterns

### Flow (proposed stages)

The stage names below are a proposal; the real stages depend on how orders are fulfilled (Open questions 4).

```
Placed → Confirmed by the store → Being prepared (food) / Being picked (grocery) → Courier on the way → Arriving → Delivered
                                         │                                              │
                                         └── Item unavailable (interrupts, needs a decision)
                                                                                        └── Running late (overlays any stage after Confirmed)
```

| Pattern | Why it fits | Evidence |
| --- | --- | --- |
| **One tracking screen: map above, one bottom sheet below.** The sheet holds the stage, the arrival time, and the next action. Before a courier exists, the map shows the store and the delivery address; after, the courier on the route. | The customer returns many times to one question; one place answers it. | Thin (ref frames 13.5 to 20.5) |
| **Same sheet, new state.** When the stage changes, the card that did not change stays still; only the title, subtitle, time, and button label change. | Spatial stability: the eye returns to the same spot for the answer. | Thin (ref/motion.md) |
| **The arrival time is the one display number on the screen**, shown as a time ("Arrives 7:40 to 7:50 pm") or a countdown in minutes; which one is open (Open questions 5; prototype: A5). | It is the answer to the primary job. | None (judgment; test it) |
| **The order is shown, not only described.** The sheet carries a horizontal strip of the order's item photos (dishes and groceries) under the time; in the Preparing or Picking stage the strip grows into the largest image on the screen. Tapping it opens the full item list with photos, quantities, and prices. | The team asked for the food to be visible and appetising; the customer recognises their order by sight. | Observed: team answer |
| **A compact stage list** (the steps above) under the time, current stage marked by shape and weight, not colour alone. Done stages collapse. | Shows where the order is and what comes next, without a second screen. | Knowledge: RX-A11Y-06 (not colour alone) |
| **Item unavailable is a sheet over the tracking screen**, raised with the item's photo, the store's suggestion if there is one, and the choices the business allows (Open questions 1). Each choice shows its price difference before the customer confirms. One primary button. | A short interruption that keeps the order in view (sheet semantics, RX-IX-13); cost before commitment (RX-IX-05). | Knowledge |
| **Running late is a state of the same sheet**, not a modal or a banner on top: the time rolls to the new value, the subtitle says how late and why when a reason is known, and the sheet offers only actions the business supports (Open questions 2). | The late order is still the same order; the customer needs the new answer where the old one was. | None (judgment) |
| **Delivered replaces the tracking flow** (a one-way door): a summary of what arrived, including substitutions and refunds, and a way out to the order list. Back does not return to the live map. | RX-IX-14 one-way doors; the order is finished. | Knowledge |
| **Opening the screen again shows the current state at once**; the stage animations play only when a stage changes while the screen is open. | The screen is opened many times per order; an entrance people sit through each time is noise (RX-UI-11 frequency). | Knowledge |
| **Live data honesty.** When location updates stop, the courier marker stays where it last was and the sheet says how old it is ("Location updated 2 min ago"); reconnecting retries on its own. | RX-EC-06; a frozen marker that looks live misleads. | Knowledge |
| **Finding a courier** shows a search around the store, then the assigned courier. It does not show other couriers popping up unless the data is real. | The reference's "nearby drivers pop up" would be invented data in a prototype (RX-AS-01). | Knowledge |

### States the data can be in (each needs a design)

| View or action | Loading | Empty / none | Error | Success | Other |
| --- | --- | --- | --- | --- | --- |
| Tracking screen | skeleton in the sheet's shape; map tiles fade in | n/a (an order always exists here) | order failed to load: retry, cached last state with its age | each stage | offline; stale location; order cancelled (by whom is open, Open questions 6) |
| Arrival time | "Calculating…" before the first estimate | no estimate yet (before confirmation) | estimate unavailable: say so, keep the stage | on time | late (once, twice), earlier than expected |
| Courier on map | marker hidden until first location | no courier assigned yet | location lost: last position + age | moving, arrived | — |
| Unavailable-item sheet | confirming choice (button busy) | store gave no suggestion | choice failed to send: keep the choice, retry | choice confirmed, sheet closes, order list updates | several items unavailable at once; customer does not answer (rule open) |
| Contact courier or store | — | — | — | — | capability undecided; prototype placeholder sheet (A9) |
| Delivered summary | — | no changes to the order | — | all items as ordered | items substituted or refunded, shown with amounts |

---

## Visual and motion language

### Character and concept

- **Character (from the user's direction):** warm, airy, friendly, playful, with the food as the hero.
- **Translated:** light warm surfaces with lots of space; photos of the customer's own items as the largest
  images; soft rounded containers; a friendly, rounded sans; illustration only at moments that carry meaning;
  motion that is quick on routine changes and playful only at good moments.
- **Concept (proposed): "The bag's journey."** The order is one illustrated paper bag. Items drop into it while
  the store prepares or picks; it folds shut and gets a sticker seal when packed; it rides with the courier as
  the map marker; it lands at the door on delivery. Every stage is the same object in a new place, which is
  what the customer is actually waiting for. It comes from the product's own domain (food and groceries in a
  bag), not from the reference's rider mascot.
- **Signature:** the bag, as the one illustrated object that travels from the item list into the map and to the
  door (shared element). Everything else stays quiet so it reads.
- **Delight, placed by the user's state:** bag sealing, courier picking up the bag, delivered landing. **No
  delight** in the late state or the unavailable-item sheet: there the delight is a fast, calm, clear way out
  (RX-UI-16).

### Avoid

- The reference's brand: its green, its rider mascot, its badge styles, its timer-voucher mechanic, its copy.
- Airbnb's brand: its coral-pink, its type family, its logo, its icons, its 3D house illustrations.
- Fake activity: couriers popping up that do not exist, invented ratings, "X people ordered this", countdowns
  without a real deadline.
- Generic delivery clichés as decoration: a rocket, speed lines everywhere, a cartoon courier giving thumbs-up.
- Confetti or bounces in a late or unavailable state.
- Dark map UI by default: the direction is warm and airy (the reference is dark; we do not take that).

### Tokens (all proposed, awaiting confirmation)

**Colour roles**

| Token | Value | Reason |
| --- | --- | --- |
| `surface.page` | `#FFF8F1` | Warm, airy off-white; the "warm" in the direction without tinting the food photos |
| `surface.card` | `#FFFFFF` | Cards lift off the warm page by value, not by heavy shadow |
| `surface.sunken` | `#F3EBE4` | Map-free areas, skeletons, chips; same warm grey family |
| `text.primary` | `#2B211C` | Warm near-black; 14.9:1 on page |
| `text.secondary` | `#6E5E54` | Warm grey from the same family; 5.9:1 on page, 6.2:1 on card (passes AA for body text) |
| `accent` | `#B93A1A` | A paprika red-orange: appetite-warm, clearly not the reference's green or Airbnb's coral; for the primary action only. White text on it 5.7:1 |
| `status.ontrack` | `#2F7A3E` on `#EAF6EC` | Delivered and on-track marks; always paired with an icon and words |
| `status.late` | `#8A4B00` on `#FFF4E0` | Running late; amber that reads as "attention", not "error"; 6.2:1 |
| `status.error` | to be set with the error states | Failures (network, choice not sent); kept apart from `accent` so the action colour never means "broken" |
| `map.*` | light warm map style, roads `#FFFFFF`, blocks `#F3EBE4`, parks soft green, water soft blue | The map is context, not the focus; low contrast so the route and the bag lead |
| `route.active` | `accent` | The remaining route is the one thing on the map that moves toward the user |

**Type**

| Token | Value | Reason |
| --- | --- | --- |
| Family | Figtree (OFL), fallback system-ui | Friendly, rounded geometric sans with open forms; free to use; one family carries all hierarchy |
| Weights | 400, 600, 800 | Three at most: body, labels, the one display number and titles |
| `type.display` | 40/44, 800, tabular figures | The arrival time only (one display size per screen) |
| `type.title` | 22/28, 800 | Sheet title ("Your order is on the way") |
| `type.body` | 16/24, 400 | Subtitles, item names; never below 16 for body on mobile |
| `type.label` | 13/18, 600, +0.02em | Stage names, timestamps, prices in lists |
| Figures | `font-variant-numeric: tabular-nums` on times, prices, counts | Digits that change or are compared must not shift; verify Figtree's tnum in the build and use fixed-width digit slots for the roller either way |

**Space and shape**

| Token | Value | Reason |
| --- | --- | --- |
| Spacing scale | 4, 8, 12, 16, 24, 32, 48 | 4-based; 8 to 12 inside a group, 24 between groups; airy by default |
| Screen padding | 20 | Room at the edges for the "airy" feel on 360 to 430 widths |
| Shape lock | buttons and chips pill; cards 20; item photos 14; bottom sheet 28 (top corners); inputs 12 | Rounded everywhere the direction asks for it, one radius per role |
| Elevation | `shadow.sheet` 0 -8 24 rgba(43,33,28,.10); `shadow.card` 0 2 8 rgba(43,33,28,.06) | Two shadows only, both warm-tinted |
| Touch targets | at least 44 x 44 | RX-A11Y-02 |

**Icons:** one outline set at 1.75 px stroke with rounded caps and joins (Phosphor Regular or Tabler, to be
chosen once), sized to the label's line height, always with a text label except back and close.

### Illustration style (written before any drawing; proposed)

- **Line:** no outline; shapes defined by fill. A single 1.75 px rounded line is allowed only for small details
  (bag fold, handle), matching the icon stroke.
- **Shape:** soft geometric, generous radii (about 30 percent of the shape's short side), slightly chunky
  proportions; no sharp corners.
- **Colour:** four tokens: kraft `#E9C9A3`, kraft shade `#D2A97C`, `accent` for the seal sticker, `text.primary`
  at low opacity for the one shadow tone. Food peeking out of the bag uses simple flat shapes in two tones
  each, taken from a small set (greens, tomato, bread).
- **Depth and detail:** flat with one shadow tone and one soft ground shadow; low detail, readable at 48 px.
- **Subject:** objects from the order: the bag, items, the store front, the door, a scooter. People appear
  only as the courier.
- **Characters (proposed, our own courier):** one courier character, "the courier", in the same soft
  geometric style: a rounded helmet in `accent` with a kraft-coloured visor band, a short rounded body, mitten
  hands, a simple face (two dot eyes, a small curved mouth, no nose), head about one third of the height.
  Rides a small rounded scooter with the kraft bag in a front basket. The character stands for "your courier",
  never for the real person delivering: the sheet shows the real courier's details as text, never the
  illustration as their portrait. Skin tone is varied across the prototype's sample orders from a set of five
  tokens; nothing else about the person changes. Poses and expressions: waiting at the store (calm), picking up
  the bag (glad), riding (focused), stuck in traffic (patient, not sad), arriving and waving (glad), handing over
  the bag at the door (warm smile). Not the reference's rider: different silhouette, colours, vehicle, and no
  thumbs-up or speech-bubble catchphrase.
- **Production:** SVG coloured from CSS variables, no text inside the art, decorative art `aria-hidden`, art
  that carries the stage gets alt text that says the meaning ("Your order is packed").
- **Set (one illustration per state, made together and compared side by side):**

  | State | Illustration | Mood |
  | --- | --- | --- |
  | Placed | the open bag with a check-mark seal waiting on the store counter | calm, glad |
  | Preparing (food) / Picking (grocery) | items dropping into the bag; for groceries, a shelf behind | busy, warm |
  | Finding a courier | the sealed bag on the counter, a soft sweep around the store | patient |
  | Picked up | the courier lifting the bag into the scooter basket | glad |
  | On the way | the courier riding (this is also the map marker, small) | focused |
  | Arriving | the courier parked, waving | glad |
  | Delivered | the bag at the door, the courier waving goodbye | warm, light celebration |
  | Running late | the courier waiting at a red light, bag safe in the basket | patient, not sad, no joke |
  | Item unavailable | an empty spot on a shelf beside the item's neighbours | neutral |
  | Connection lost | the map pin with a faded signal arc | neutral |

  No illustration for errors that block the task (choice not sent): text and a retry are faster.

### Food imagery (the hero)

- **Role:** item photos let the customer recognise their order at a glance and make the unavailable-item
  decision by sight.
- **Source:** the product's own catalogue photos when they exist. For the prototype: licensed photos with
  the licence named per image (for example the Unsplash licence), each item labelled as sample data in the
  code. No generated food passed off as a real store's product.
- **Style:** top-down or 3/4, natural warm light, real texture visible (steam, gloss, crumb), on a light or
  neutral background; cropped to a 1:1 rounded tile (radius 14) in lists, and larger (full sheet width, 4:3,
  radius 20) as the hero of the Preparing and Picking stages and the unavailable-item sheet.
- **Where food appears:** the item strip in the tracking sheet; the hero in Preparing or Picking; the item and
  its substitute side by side in the unavailable-item sheet; the delivered summary. Illustrations never stand
  in for the food photos, and food photos never stand in for illustrations.
- **Sample orders (prototype):** one restaurant order (dishes) and one grocery order (produce and packaged
  items), with USD sample prices marked as sample data in the code.
- **Missing photo state:** a warm `surface.sunken` tile with the item's category icon, never an empty box.

### Motion (proposed)

**Personality:** playful-snappy. Routine changes are fast and critically damped; bounce is spent only on good
moments. Taken from ref/motion.md ("Springs"), adjusted to our moments.

| Token | Value | Use |
| --- | --- | --- |
| `spring.snappy` | stiffness 520, damping 46, mass 1 (critically damped, about 320 ms settle) | Sheet state changes, pushes, sheets opening |
| `spring.playful` | stiffness 380, damping 22, mass 1 (one small overshoot) | Bag seal, pin landing, delivered |
| `duration.press` | 100 ms, scale to 0.97 | L1 touch feedback on buttons and cards; list rows change background only |
| `duration.digit` | 260 ms per changed digit, `ease.out` | Rolling digits |
| `ease.out` | `cubic-bezier(0.23, 1, 0.32, 1)` | Anything that is not a spring; no ease-in on anything that enters |
| `duration.exit` | about 70 percent of the entrance | Exits are faster along the same path |

Only `transform` and `opacity` animate. Everything that opens and closes can reverse halfway.

| Moment | Purpose | Lifecycle | Level | Spring |
| --- | --- | --- | --- | --- |
| Press on any button or card | feedback | finger down → scale 0.97 → release → back | L1 | `duration.press` |
| Order card → tracking screen | spatial: this is the same order | tap card → card grows into the sheet; the bag illustration leaves the card and settles in the sheet header | L3 | `spring.snappy` |
| Delivery address pin | orientation: here is where it is going | screen opens on a new order → pin drops in, shadow sharpens, two small bounces, one ripple, label springs out | L2 | `spring.playful` (once per order, not on every open) |
| Stage change | state change | stage updates while open → unchanged card stays still; title and subtitle push up from below; stage list advances; button fill animates and only its label swaps | L2 | `spring.snappy` |
| Courier character changes pose | state change, character | stage changes → the sheet's illustration cross-fades and the courier settles into the new pose with a small squash | L2 | `spring.playful` on good stages, `spring.snappy` on late |
| Courier picked up | spatial, delight | courier assigned and has the bag → the small marker on the map lifts and lands in the sheet header as the full illustration (our own move, not the reference's leap and thumbs-up) | L4 | `spring.playful`, once per order |
| Item drops into the bag | progress (preparing or picking) | each item ready → its photo shrinks into the bag | L4 (light) | `spring.snappy` |
| Bag seals | progress, delight | packed → bag folds, seal sticker stamps on | L4 | `spring.playful` |
| Finding a courier | progress during a wait | soft sweep around the store; when assigned, the camera eases to fit store, courier, and address | L2 | `ease.out` |
| Courier on the way | progress | courier marker (bag on scooter) rides the route; the route shortens behind it | L2 | continuous, linear along the path |
| Arrival time changes | state change | new estimate → only the changed digits roll | L1 | `duration.digit` |
| Running late | state change, serious | estimate moves later → digits roll, the sheet's status chip changes to `status.late`; no bounce | L2 | `spring.snappy` |
| Item unavailable | interruption | event → sheet rises over the tracking screen, item photo slides in from the order list position | L2 | `spring.snappy` |
| Confirm choice (in flight) | progress on the button | tap → label swaps to "Sending…", a small bag slides across the button; result → sheet closes, the item in the list swaps to the substitute | L1 | `spring.snappy` |
| Arriving | attention at the door | courier near → address pin pulses twice; the handoff detail (order code or courier vehicle, Open questions 7) flashes once | L2 | `spring.playful` |
| Delivered | result, delight | delivered → bag lands at the door with one small bounce; summary replaces the map | L4 | `spring.playful` |
| Sheet drag | direct manipulation | drag → follows the finger 1:1, keeps release velocity, rubber-bands at the ends, can be caught mid-motion | L1 | `spring.snappy` |

**Reduced motion:** springs become 150 ms opacity fades; the shared element becomes a cross-fade; the courier
marker jumps between updates instead of gliding; digits change in place; the pin appears without a drop;
no pulses. All information stays the same.

### Liveliness (proposed)

- **Energy 2 (balanced):** waiting is a mild-worry task; good moments get play, bad moments get calm.
- **Rhythm 2 (steady with variation):** one sheet structure across all stages; the bag and the time vary.
- **Motion L1 to L4,** with L4 only at bag seal and delivered, each once per order.

### Responsive

| Width | Layout |
| --- | --- |
| 390 (primary, designed first) | Full-bleed map top 45 to 55 percent; sheet below, draggable between peek and full; primary action in the bottom third |
| 360 to 430 | Same as 390; checked at 360 for wrapping of item names and prices |
| 431 to 767 | Same, sheet capped at 480 wide and centred |
| 768 and up | Map fills the page; the sheet becomes a 400 wide panel on the left; the unavailable-item sheet becomes a centred dialog over the panel |
| Short screens (height under 640) | Map shrinks to 35 percent; the time and stage stay above the fold |

---

## Voice and tone (proposed, not confirmed)

- **Voice:** warm, plain, brief. Talks to the customer as "you"; the app speaks as "we" only for what the app
  itself does.
- **Profile:** casual over formal, serious over funny when anything is wrong, respectful, matter-of-fact with a
  little warmth.
- **By moment:**
  - On track: short and light ("Your order is on the way").
  - Packed or delivered: one line of warmth is fine ("Enjoy your meal").
  - Late: serious, specific, no jokes, no blame on the courier: "Running about 15 min late. New arrival 7:55 pm."
    A reason only when the system has one.
  - Unavailable item: neutral and quick: what is missing, the choices, the cost of each.
  - Errors: what happened, what we kept, what to do next.
- **Avoid:** cute filler ("Hang tight!", "Yummy incoming!"), apologies without information, exclamation marks
  in late or error states.

---

## How we evaluate

**Success criteria (from the brief)**

1. On any stage, a first-time viewer can say when the order arrives and what stage it is in within one look
   (about 3 seconds).
2. In the late state, the viewer can say the new arrival time and whether they need to do anything, without
   opening another screen.
3. In the unavailable-item flow, the viewer can make a choice in one sheet and can state its price difference
   before confirming.
4. Every stage change is animated by the same spring set; the unchanged card does not move; reduced motion
   keeps all information.
5. The screens read as warm, airy, food-led, and playful, and fail the swap test with the reference's brand
   (nothing of its identity remains).

**Machine checks**

- `ryux scan` when available; until then, the states matrix above with every cell pointing to a prototype state.
- Contrast check on every text and icon token pair (current proposal passes 4.5:1, computed 2026-10-28).
- Build and typecheck pass; logic tests for the order state machine (stage order, late overlay, substitution
  outcomes, stale location).
- Render at 360, 390, 430, 768, and 1280; reduced-motion render; keyboard pass on every control.
- A prototype control panel (for testing only, labelled as such) that jumps to every state, so reviewers can
  reach each one without waiting.

**Riskiest assumption:** customers see and answer an unavailable-item request in time while they are not
looking at the app.
- **Cheapest test:** a five-person prototype session; interrupt each participant with a simulated
  notification while they do another task, then observe whether and how fast they decide.
- **Signal it works:** four of five decide without help and can state the cost of their choice.
- **What would change the plan:** if most miss it or decide by guessing, move the choice earlier (substitution
  preferences at checkout) and treat the live request as the fallback.

Invite the team to watch the sessions.

---

## Assumptions for the prototype

The team said these are not decided and asked for them to be decided and stated. Each is an assumption for the
prototype, not a product rule.

**Rule:** any line in the prototype that depends on an undecided policy carries a small "Proposed rule" tag in
the prototype. The tag is a prototype marker that a production build would drop, so an assumption never reads
on screen as a confirmed promise.

| # | Area | Prototype assumption | Shown on screen as |
| --- | --- | --- | --- |
| A1 | Brand | Working name **Tote** (proposed), set in plain Figtree 800 text; no logo, no app icon. Colours, type, and shape are the proposed tokens above | the name as text |
| A2 | Market | English, USD, US time format (7:40 PM), dates as "Oct 28"; addresses as one street line plus city | sample data |
| A3 | Fulfilment | One store per order. Store staff prepare food and pick groceries. Mixed food and grocery orders from two stores are out of scope | stage names |
| A4 | Stages | Placed → Store confirmed → Preparing (food) or Picking (grocery) → Finding a courier → Picked up → On the way → Arriving → Delivered | stage list |
| A5 | Arrival time | A clock-time window ("7:40 to 7:50 PM"), with minutes left as the secondary line once the courier is on the way | display number |
| A6 | Running late | "Late" means the new estimate ends after the window first shown. The sheet shows the new window and how much later it is; a reason only when the sample data has one (store busy, heavy traffic). No compensation, no cancel option, no fees | new time is fact; any reason or offer is tagged Proposed rule |
| A7 | Item unavailable | The store reports it during Preparing or Picking. Choices: take the store's suggested replacement (price difference shown), choose another item from a short list, or remove the item (it is not charged). No auto-decision and no countdown: the order waits in "Waiting for your choice" until the customer answers. Several unavailable items are handled one sheet per item, in order | choices are UI; "not charged" and "price difference" are tagged Proposed rule |
| A8 | Refunds and charges | No refund method or timing is shown; the delivered summary lists the removed item with "Not charged" and the replacement with its price, tagged Proposed rule | tagged |
| A9 | Contact | One "Message courier" action once a courier is assigned, and "Get help" in the sheet's menu; both open a labelled prototype placeholder sheet, since the capability is not decided. No phone call | tagged Proposed rule |
| A10 | Handoff | A 4-digit sample handoff code shown on arrival (the "thing to match at the kerb") | tagged Proposed rule |
| A11 | Cancellation | Not offered in the prototype | absent |
| A12 | Notifications | Simulated as an in-app banner at the top of the prototype (for example "Tomatoes are out. Choose a replacement"), so the riskiest assumption can be tested; whether push exists is open | labelled simulated |
| A13 | Map | An illustrated SVG city map in the proposed map tokens, with a scripted route; no map provider | n/a |
| A14 | Courier details | Sample courier first name and vehicle description as text, marked as sample data; the illustration is never their portrait; no ratings | sample data |
| A15 | Prototype controls | A panel, labelled "Prototype controls", that jumps to every stage and triggers late, unavailable item, connection lost, and reduced motion, so every state is reachable without waiting | testing only |
| A16 | Food photos | Licensed stock photos for the sample orders (licence named per image in the code), labelled sample | sample data |

## Open questions

| # | Question | Why it matters | Who can answer | Prototype assumption |
| --- | --- | --- | --- | --- |
| 1 | **Unavailable item rules:** which choices, who suggests the replacement, what happens without an answer and after how long, how refunds are paid | The sheet's choices, any real deadline, the delivered summary | Product / operations | A7, A8 |
| 2 | **Late order rules:** the threshold for "late", compensation, cancel, support contact, which reasons we can know | What the late state may offer and say | Product / operations / support | A6 |
| 3 | **Market:** the launch country, its currency, language, time and address formats, payment and refund methods | Copy, prices, formats | Product owner | A2 (global, English, USD sample) |
| 4 | **Fulfilment model:** store staff or shoppers for groceries; mixed orders and multiple couriers | Stages, one bag or two | Product / operations | A3, A4 |
| 5 | **Arrival time format and estimate precision** | The one display number | Product / data | A5 |
| 6 | **Cancellation** by the customer or the store, and until when | A state and an action | Product / operations | A11 |
| 7 | **Contact and handoff:** chat or call, handoff code, proof of delivery | Arrival and contact actions | Product | A9, A10 |
| 8 | **Brand:** name, logo, colours, type, design system | All tokens are proposals | Brand owner | A1 |
| 9 | **Notifications:** push or not | The riskiest assumption depends on reaching people outside the app | Product | A12 |
| 10 | **Map provider and live location data** | Build and motion of the map | Engineering | A13 |
