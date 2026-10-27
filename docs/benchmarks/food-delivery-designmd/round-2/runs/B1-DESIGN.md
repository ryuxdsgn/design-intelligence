# DESIGN.md

<!-- ryux-context:start -->
- **Product**: Food and grocery delivery app; this work is the customer's order tracking after checkout
- **Users**: Adults in large cities, on mobile, often on the move and using one hand
- **Surface**: Order tracking, from order placed to delivered, plus the late-order and unavailable-item moments
- **Platform**: Working web prototype, mobile first, designed at 390 px wide
- **Market**: Not decided; a global product in English; USD as sample data
- **Brand**: Not decided (no name, mark, or design system); proposals in this file are labeled proposed
- **Policies**: Not decided (delays, refunds, substitutions, fees, contacting the courier); the prototype's behaviour is stated as assumptions
- **UI direction**: Warm and airy, the food is the hero, rounded cards, friendly type, playful illustration, small delightful motion (direction taken from Airbnb's app; not its brand, screens, or characters). The dishes and groceries in the order are visible and appetising. Illustrated, with a courier character of our own and illustrations for the states
- **Motion direction**: Interactive motion at the level of the ride-hailing motion study in ref/ (ref/motion.md): shared elements, one snappy spring for state changes, rolling digits, a live route; a little bounce only for playful moments (not that app's brand, screens, or characters)
- **Voice and tone**: Unset (proposal under Voice and tone, awaiting confirmation)
- **Product docs paths**: None yet; the brief is the only product source
<!-- ryux-context:end -->

Sources read for this file: the brief (the user's message, 2026-10-27), the user's answers to the first round of
questions (2026-10-27), ref/motion.md, and the seven frames in ref/ (frame-1 to frame-20.5, a ride-hailing booking
flow from another company). There is no PRD, no existing
product, and no codebase yet. The ryux MCP (reference screens) was not available, so no decision here is backed
by reference screens beyond the one motion study.

Status of this file: **draft for review**. Everything marked *proposed* is a choice made for the team to confirm,
not a team decision.

---

## Users and needs

| Who and what they need | Source |
| --- | --- |
| A customer who has just placed a food or grocery order and wants to know when it will arrive | Observed: brief |
| Adults in large cities, on mobile, often on the move and using one hand | Observed: user's answers |
| Because they are on the move and one-handed, they check in short glances, with the thumb only, and often in bright light or while walking | Inferred from the answer; the glance behaviour is an assumption to test |
| They need to know two things at any moment: what stage the order is at and when it will arrive | Inferred from the brief ("order status from placed to delivered") |
| When the order is late they need the new arrival time, what is happening, and a way to get help | Observed: brief names "running late"; what they need there is inferred |
| When an item is unavailable they need to decide what replaces it, or drop it, and see how that changes what they pay | Observed: brief names "item is unavailable"; the decision and price effect are inferred |
| Grocery orders likely have more items, and so more chance of an unavailable item, than restaurant orders | Inferred; no data |
| Repeat vs first-time use, accessibility needs, connection quality | **Unknown** |

## Jobs to be done

- **Primary job:** "Since I ordered, let me know where my food is and when it will get here, without having to work
  it out." Done: the customer can say the stage and the arrival time after one glance, and is at the door when the
  courier arrives.
- **Related job, late:** "If it is going to be late, tell me early and honestly, and tell me what I can do." Done: the
  customer sees the revised time before the old one passes, understands roughly why when a reason is known, and
  can reach help in one tap.
- **Related job, unavailable item:** "If something is out, let me decide quickly what happens instead, so the rest
  of my order isn't held up." Done: the customer resolves it in one sheet without leaving tracking, and sees the
  price change before confirming.
- **Related job, handover:** "Let me recognise the courier and get my order." Done: the customer knows who is coming
  and what to match at the door.

## Evidence

| Decision or claim | Source | Strength |
| --- | --- | --- |
| Stage-based tracking with a bottom sheet over a live map while someone is travelling | Observed: ref frames 13.5, 17.2, 20.5 (one ride-hailing flow) | Thin (one product, another context: rides, not food) |
| One sheet that changes state in place, with unchanged parts holding still | Observed: ref/motion.md ("Same sheet, new state") | Thin |
| Changing times roll only the digits that changed | Observed: ref/motion.md ("Numbers") | Thin |
| A shared element carries the user from one screen into the next | Observed: ref/motion.md ("Shared element") | Thin |
| The person arriving is shown with what to match at the kerb (the ride's plate) | Observed: ref frames 17.2, 20.5 | Thin; the food equivalent is not decided (prototype: P5) |
| A compensation voucher when pickup runs late | Observed in ref frames 13.5, 17.2 as **that company's** policy | Not evidence for this product; **not adopted** (see Open questions) |
| The food itself is the hero: real dish and product photos lead | Observed: brief (visual direction) | Direction, not evidence |
| Each action defines before, during, result, recovery | Knowledge: RYUX RX-IX-01; Nielsen heuristics 1 and 9 | Strong (standard) |
| Visible system status throughout a wait | Knowledge: Nielsen heuristic 1; response-time limits (0.1 / 1 / 10 s) | Strong (standard) |
| Large movement is replaced by a fade or cut with reduced motion | Knowledge: WCAG 2.2 SC 2.3.3; prefers-reduced-motion | Strong (standard) |
| Customers want to choose replacements live rather than set preferences at checkout | None: assumption | None, the riskiest assumption (see How we evaluate) |

## Interaction patterns

Proposed, each with why and evidence strength. The layout model is not settled: it goes to Explore (below) before
any screen is built.

**1. One tracking screen, one sheet that changes state.** The order lives on a single screen; as the stage changes,
the sheet's title, subtitle, and illustration change in place and the parts that did not change (items, address)
hold still. *Why:* the customer never has to navigate to learn something new; the change itself is the news.
*Evidence:* Thin (ref/motion.md).

**2. Stages (proposed set, to confirm with the team):**
Placed → Accepted by store/restaurant → Preparing (food) or Shopping (grocery) → Courier on the way to the store →
Picked up → On the way to you → Arriving → Delivered. The arrival time is shown from Accepted onward; before that
the sheet says the store is confirming. *Why:* the brief asks for placed to delivered; the middle stages are what
delivery products commonly show; which stages a real backend reports is not decided, so the prototype uses this
set (P6). Evidence: None for the exact set.

**3. What is seen first:** the arrival time (or window) and the stage name, together, at the top of the sheet. The
food stays visible below them (photos of the ordered items) as the brand's hero, never above the arrival time.

**4. Map only when it means something.** The map appears when a courier is moving (Courier on the way to the
store and later); in earlier stages the space goes to the food and the stage illustration. *Why:* a map of a
kitchen nobody is leaving says nothing; airy and food-first is the direction. Evidence: None; it is one of the
alternatives to compare in Explore.

**5. Late order: a state of the same sheet, not an alert.** The arrival time rolls to the new time, the stage line
gets a calm "running late" status (colour plus text, never colour alone), one line says what is happening when the
system knows (for example "The restaurant is busier than usual" only if that reason is real data), and one action
gives help. No celebration motion, no illustration gag. *Why:* the customer's state is worry; delight there is a
fast, calm way out (RX-UI-16). Policy is not decided; the prototype follows assumptions P2 and P3 (below).

**6. Unavailable item: a sheet over tracking, one decision per item.** The sheet shows the missing item (photo,
name, quantity) and, when the store proposes one, a suggested replacement (photo, name, price difference), then:
- Primary: "Use this replacement" (or "Choose replacement" when none is proposed)
- Secondary: "Pick something else" (opens a short list of similar items)
- Tertiary: "Remove item" (text button), with the effect on the total shown before confirming
After the choice: the sheet closes, the item list in the tracking sheet updates, and an undo is offered for a few
seconds where the backend allows it. Several unavailable items are handled one after another in the same sheet,
with "2 of 3" progress. *Why:* one primary action per decision (RX-PR-03); price shown with the choice that changes it
(RX-IX-17); reversible changes get undo, not confirmation (RX-IX-04). Policy is not decided; the prototype follows
assumption P1 (below).

**7. Handover.** When the courier is arriving, the sheet shows the courier's first name, their vehicle, and the thing
to match at the door. What that is in production is not decided; the prototype follows assumption P5.

**8. Contact.** One "Message" and one "Call" of equal weight inside the courier block (a pair, not competing
primaries), and "Get help" as a text link. Contacting the courier is not decided as policy; the prototype follows
assumption P4.

**11. One hand, on the move.** Everything the customer acts on sits in the bottom half of the screen, inside the
sheet: the replacement choice, contact, help. Nothing that matters lives in the top corners; the top holds only
back. Touch targets at least 48 × 48 px with 8 px between them. The arrival time is large enough to read at arm's
length while walking (`type.display`). The sheet can be dragged up and down with the thumb, and it snaps to two
heights (peek: stage and time; full: items and courier). *Why:* the users are often moving and using one hand
(user's answers); thumb reach (Knowledge: RX-RD-03, Apple HIG and Material minimum targets). Evidence: Strong for
target sizes (standard); None for the two-height sheet (proposed).

**9. States of the data (every one designed, RX-EC-01):**

| View or action | Loading | Empty | Error | Success |
| --- | --- | --- | --- | --- |
| Tracking screen | Skeleton in the sheet's shape | Cannot happen: there is always an order (reached from an order) | Connection lost: keep the last known stage with its age ("Updated 2 min ago"), retry | Live stage |
| Arrival time | "Confirming time" until Accepted | n/a | Time unavailable: show the stage only, say the time is being updated | Time or window |
| Map and courier position | Map tiles placeholder in the map's shape | No courier yet: map hidden (pattern 4) | Position lost: keep last position, faded, with its age | Live route |
| Unavailable-item choice | Button in progress state while the choice is sent | No replacement proposed: "Pick something else" leads | Choice failed to send: keep the choice, retry, item stays flagged | Item list updated, undo |
| Item photos | Shaped placeholder at the photo's ratio | Item has no photo: a neutral tile with the item's category icon | Photo failed to load: same tile | Photo |
| Delivered | n/a | n/a | n/a | Delivered state with the final item list and total (P7) |
| Cancelled order, failed delivery | Out of scope for this prototype (P8) | | | |

**10. Navigation and back.** Tracking arrives by *replace* after checkout (a one-way door, RX-IX-14): back leaves to
home, never into the paid checkout. Sheets (unavailable item, help) dismiss with a swipe down, the close button, or
Escape, and are not used for multi-step tasks except the item-by-item sequence above.

**Explore before building (stage 3, not done yet):** two or three structure alternatives for the tracking screen,
same sample order in each, rated against the criteria in How we evaluate, for the team to pick:
- **A. Food-first sheet** (recommended to test first): the food and stage illustration fill the top until a courier
  moves, then the map slides in behind the sheet. Hypothesis: early stages feel like the meal being made, not like
  waiting on a map.
- **B. Map-first, ride-hailing style:** the map is always there; the sheet carries everything. Hypothesis: one
  stable layout is easier to glance at than one that changes.
- **C. Timeline-first:** a vertical stage timeline leads, with the map as a card inside the "On the way" step.
  Hypothesis: seeing all the stages answers "how much longer" better than a single time.

## Prototype assumptions

The policies are not decided (user's answers, 2026-10-27). The prototype needs *some* behaviour to be
testable, so these are assumptions made for the prototype, not product rules. Each must be decided by the
team before production, and none appears in the UI as a promise, guarantee, or policy statement. All prices,
times, names, and addresses in the prototype are sample data in USD and en-US formats.

| # | Area | Prototype behaviour (assumption) | Why this one |
| --- | --- | --- | --- |
| P1 | Substitutions | The store proposes a replacement when it has one. The customer answers in the sheet; until they do, the rest of the order keeps moving. If they haven't answered by the time the courier picks up, the item is left out and not charged; the sheet says this as the stated deadline ("If you don't choose by pickup, we'll leave it out"). A replacement is charged at its own price; the difference shows before confirming. | Keeps the order moving without a timer nobody decided; "left out, not charged" is the least surprising default and makes no refund promise |
| P2 | Late | An order is "running late" when the current arrival estimate is later than the first estimate shown at Accepted. The sheet shows the new time and, when the sample data has one, a reason. | Late means "later than what we told you", the customer's own reference point; no threshold invented |
| P3 | Compensation | Nothing is offered. No credit, refund, or voucher appears. | Policy not decided; offering one would be an invented rule |
| P4 | Contact | Message opens a sample chat with the courier, labeled as prototype; Call shows a sheet saying calls are not connected in the prototype. Get help opens a help sheet with "Report a problem with this order", which also says it is a prototype. | Every control leads somewhere real (RX-IX-12) without pretending to connect |
| P5 | Handover | A 4-digit sample order code is shown on arrival as the thing to match at the door. | A code works without a photo of a real person |
| P6 | Stages | The stage set in pattern 2; food orders use Preparing, grocery orders use Shopping. Both kinds are sample orders in the prototype. | Covers both halves of the product with one flow |
| P7 | Fees and total | The item list shows item prices; the total includes sample delivery and service fees as labeled lines. The total changes only through a substitution choice. | Shows the price effect of P1; no fee amount is a real policy |
| P8 | Out of scope | Cancelling an order, failed delivery, rating, tipping, and receipts are not designed in this prototype. | Not in the brief; listed so they are not mistaken for designed |
| P9 | Product name | Working name **"Pantry & Plate"**, set in plain text in the brand type; no logo (none was asked for). Trademark and availability not checked. | A header needs a name; plain text avoids an invented mark (RX-AS-11) |

## Visual and motion language

**Character** (from the brief): warm, airy, generous; the food is the hero; friendly, never childish; playful in
the good moments, steady in the worrying ones.

**Concept (proposed): "the order travels as the food."** The photos of what was ordered gather into a small stack
on the order card; when a courier picks the order up, that stack becomes the bag the courier carries along the
route, and on delivery it lands at the door. The customer always watches *their* food, not a generic pin.

**Signature (proposed):** the food stack, a shared element that moves from the order card into the courier's bag on
the map and back into the card on arrival. One brand moment, used at three stage changes, never as decoration.

**Avoid:** Airbnb's coral-pink, its type face (Cereal), its iconography or illustration characters; the reference
app's green, its helmeted rider, its badges and slogans; grey placeholder maps; a courier character with oversized
limbs; confetti on every stage; cards inside cards; display-size headings on the task screen; a countdown that
implies a promise the product does not make.

### Tokens (all *proposed*)

Colour: one warm grey family, one accent, status colours named apart. Contrast measured (WCAG relative luminance).

| Token | Value | Role and reason |
| --- | --- | --- |
| `color.surface` | `#FFF9F2` | Page background: warm cream instead of white, so photos of food look warm and the page feels airy, not clinical |
| `color.surface.raised` | `#FFFFFF` | Cards and sheets: one step lighter than the page, lifted by a soft shadow |
| `color.ink` | `#2B211C` | Primary text: warm near-black; 15.0:1 on surface |
| `color.ink.muted` | `#6E5F55` | Secondary text: same warm family; 5.9:1 on surface, 6.1:1 on white |
| `color.border` | `#E9DFD4` | Dividers and card edges only (decorative, never the only boundary of a control) |
| `color.accent` | `#C2410C` | Paprika, the one accent, for the primary action and the live route: warm, appetite-related, and far from both references' brand colours. White text on it 5.2:1; as text on surface 4.95:1 |
| `color.status.good` | `#2F6B3A` | Basil, for Delivered and "on time": 6.1:1 on surface |
| `color.status.late.text` / `.surface` | `#7A4E00` / `#FFF3D9` | Honey, for running late: calm, not alarm red; 6.5:1 |
| `color.status.error` | `#B42318` | Errors only (failed to send, connection lost); 6.6:1 on white. Close in hue to the accent, so errors always carry an icon and text, never colour alone |

Type: **Figtree** (open source, SIL OFL), one family, three weights (400, 600, 700). *Reason:* friendly round forms
that stay legible at small sizes, not a decorative "fun" face. *To check before use:* that the shipped files include
tabular figures for times; if not, pick another face rather than mixing families.

| Token | Size / line-height | Use |
| --- | --- | --- |
| `type.display` | 32 / 36, 700, tabular | The arrival time only: the one display size per screen |
| `type.title` | 20 / 26, 700 | Sheet title (the stage) |
| `type.body` | 16 / 24, 400 or 600 | Everything people read |
| `type.caption` | 13 / 18, 400 or 600 | Metadata (updated time, quantities); never for actions |

Spacing: 4-based scale, `4 8 12 16 24 32 48`. 12 inside a group, 24 between groups, 16 page margin at mobile widths.
*Reason:* airy comes from the space between groups, not bigger type.

Shape lock: **buttons and chips pill; cards 20; item photos 16; sheets 28 (top corners); avatars round.** *Reason:*
rounded, soft, and every radius has a role.

Elevation: two shadows only. `shadow.card` soft and warm-tinted for cards; `shadow.sheet` for the sheet over the map.

Icons: one outline set with rounded caps (Phosphor Regular proposed; licence MIT), 24 px, stroke matched to the 600
weight, always with a text label except back and close.

Map: a styled light map in the warm grey family with real street names, the route in `color.accent`. A placeholder
grey map is not acceptable even in the prototype. Prototype assumption: a hand-built SVG map of a sample city
neighbourhood (illustrative, labeled), with sample street names, so it follows the tokens and needs no provider; a
real map provider is a production decision.

### Illustration style (proposed, written before any drawing, RX-UI-17)

- **Line:** no outlines; shapes defined by fill.
- **Shape:** rounded geometric, corners echoing the 16–20 radius; simple silhouettes that read at 64 px.
- **Colour:** `color.accent`, `color.status.good`, `color.ink`, and the cream surface, with one darker shade of each
  for form; nothing outside the palette.
- **Depth and detail:** flat with one shade tone; low detail, so the food photos stay the richest thing on screen.
- **Subject:** the product's own objects: a pot on a stove (preparing), a basket being filled (shopping), the order
  bag, a door, a bicycle or scooter.
- **Characters:** one courier figure for the whole product: natural proportions (head about one sixth of height),
  dot eyes and a simple smile, no brand uniform from either reference, shown in a range of skin tones across sample
  orders. Poses: riding, picking up the bag, waiting at the door, handing over. No thumbs-up (that move belongs to
  the reference). The courier figure is illustrative and never stands in for the real courier's photo.
- **Method:** SVG coloured from tokens, no text inside, alt text that says what it means ("Your order is being
  prepared"), decorative ones hidden from screen readers.

**State illustrations (one set, made together and compared side by side, RX-UI-18):** Placed, Accepted, Preparing
(pot on a stove), Shopping (basket being filled), Courier on the way to the store, Picked up (bag handed over),
On the way, Arriving (at the door), Delivered (bag at the door, courier waving), Running late (the courier waiting
calmly, nothing comic), Item unavailable (an empty spot on a shelf beside a similar item), Connection lost (the
courier and bag paused, a faded route). Same canvas, viewpoint, scale, and detail in all twelve; each sits in the
same slot in the sheet so the swap is a state change, not a layout change.

**Food imagery: the food is visible and appetising at every stage.** The items in the order show as photos in the
sheet from Placed to Delivered: the food stack in the peek height, and the full item list (photo, name, quantity,
price) in the full height. Photo direction: close, warm daylight, the food filling the frame, a 45° or top-down
angle used consistently per kind (dishes top-down, packaged groceries straight-on), no props or hands. Crops:
square at 16 radius for items, one larger 4:3 for the lead dish in the early stages. Real dish and product photos
from the store's catalogue in production (observed). In the prototype, sample photos from a licensed library named
in the asset list with each licence (sourced, labeled sample data), or generated images from a Visual Brief labeled
generated; never a generated dish passed off as a store's. Missing photos use the neutral category tile (pattern 9).
Illustration never replaces a food photo: illustration tells the state, photos show the food.

### Motion (proposed)

Personality: **warm and snappy.** Interface transitions are quick and critically damped; a little bounce only in the
playful moments (pickup, arrival, delivered). The worrying moments (late, unavailable, errors) get no bounce.

| Token | Value | Use |
| --- | --- | --- |
| `motion.press` | 100 ms, scale 0.97 | L1: every button and card answers on touch |
| `motion.spring.snappy` | critically damped, settles in about 300 ms (e.g. stiffness 500, damping 45, mass 1) | L2: sheet state changes, sheet open and close, title push |
| `motion.spring.playful` | slight overshoot, settles in about 500 ms (e.g. stiffness 380, damping 22) | L2/L4: pin landing, bag pickup, delivered |
| `motion.ease.out` | `cubic-bezier(0.23, 1, 0.32, 1)`, 200 ms | Fades and anything not spring-driven; no ease-in on entering elements |
| `motion.digit` | 220 ms per digit, snappy spring | Rolling digits in the arrival time |

Each motion, its purpose, and its reduced-motion behaviour (only transform and opacity animate; everything that
opens can reverse halfway):

| Moment | What moves | Purpose | Level | Reduced motion |
| --- | --- | --- | --- | --- |
| Touch | Pressed element scales to 0.97 | Feedback | L1 | Opacity dim instead |
| Checkout → tracking | The order card from checkout grows into the tracking sheet; the food stack rides along | Continuity: this is the order you just placed | L3 | Cross-fade |
| Stage change | Unchanged blocks hold still; title and subtitle push up from below; illustration swaps; the button's fill animates and only its label changes; one snappy spring | State change | L2 | Cut, then a 150 ms fade on the new text |
| Arrival time changes | Only the changed digits roll | State change you can catch at a glance | L2 | Cut |
| Map arrives | Map fades in behind the sheet; the destination pin drops, its shadow sharpens, lands with a small bounce and one ripple, then its label springs out. Once per order, not on every visit | Spatial: here is where it is coming | L4 | Pin appears in place |
| Pickup | The food stack leaves the order card and settles into the courier's bag on the map | The signature: your food is now moving | L4 | Fade the bag in on the map |
| On the way | Courier moves along the route; the route shortens behind it | Progress | L2 | Position updates without animation |
| Arriving | Door pin pulses twice; the thing to match at the door flashes once | Attention at the moment it matters | L2 | One highlight, no pulse |
| Delivered | The bag lands at the door; a short playful settle; the courier waves | Closure; the peak-end moment | L4 | Static delivered illustration |
| Running late | Time rolls to the new value; the late status fades in. No bounce | State change in a worrying moment | L2 | Cut |
| Unavailable item | Sheet rises with the snappy spring; the replacement photo slides in beside the missing one | A short interruption over tracking | L2 | Fade |
| Scrolling and dragging the sheet | Follows the finger 1:1, keeps momentum, rubber-bands at the ends, can be caught mid-motion | Direct manipulation | L1 | Unchanged (user-driven) |

Frequency rule: the tracking screen is opened many times per order, so nothing replays on reopen; the expressive
moments are tied to stage changes, which happen a handful of times per order.

**Liveliness:** energy 2 (balanced: playful at the good moments, calm elsewhere), rhythm 2 (steady, with the stage
changes as the varied beats), motion up to L4 at three moments only.

### Responsive (proposed)

Designed at 390 px (user's answer); smallest checked width 320 CSS px (web default). Up to 600 px: single column, the sheet over the map. From
768 px: the sheet becomes a fixed side panel (about 400 px) beside the map; the early-stage food layout centres in a
column with a readable width. No horizontal scroll at any width.

## Voice and tone

**Proposed, not confirmed** (no brand voice or existing copy to infer from; the brief's words are the only source).

- **Voice:** warm, plain, brief. Talks like a helpful person at the counter, not a mascot.
- **Address:** second person ("your order"), the courier by first name when the product shares it.
- **Tone by moment:** good news is short and a little warm ("Picked up. On its way to you."); waiting is
  matter-of-fact with the time first; running late is direct and calm, with no jokes and no blaming the courier,
  and it says what happens next; an unavailable item is neutral and practical ("Oat milk 1 L is out of stock. Here's
  a close match."); errors say what happened and what to do; delivered can celebrate briefly.
- **Avoid:** "Oops!", exclamation-mark stacks, hype words, question headings on every step, apologies without a
  next step.
- Language and locale: English for a global product (user's answer). Prototype formats are en-US as an
  assumption: $12.40, 6:42 PM, "Oct 27". Times always show the clock time ("Arriving 6:42 PM") with the minutes
  left beside it ("in 18 min"), because a moving reader can check either.

## How we evaluate

**Success criteria** (fixed before any alternative is drawn):
1. From a single glance at the tracking screen, a participant can say the order's stage and arrival time
   (target: most participants within a few seconds, to be measured, not assumed).
2. In the late state, the participant can say the new arrival time and find a way to get help without searching.
3. With an unavailable item, the participant resolves it without leaving tracking and can say how their total
   changed before they confirm.
4. Every moment in the motion table is implemented with its reduced-motion behaviour, and no motion delays reading
   the arrival time.
5. Swap test: with another delivery brand's name on it, the brand layer (colour, type, illustration, the food-stack
   signature) would have to change; and nothing on screen is borrowed from Airbnb or the reference app.
6. One-handed: every action in the three flows can be reached with the thumb at 390 px, with no control in the top
   third except back.

**Machine checks:** the build and typecheck pass; `ryux scan` at 390 and 320 (no horizontal scroll, reduced motion
handled); the view × state matrix in pattern 9 with no blank cell; contrast of every text and status pair measured
against WCAG 1.4.3; keyboard reach and visible focus on every control, including the sheets.

**Riskiest assumption:** customers want to decide replacements live, during tracking, rather than setting
preferences at checkout or letting the shopper decide. **Cheapest test:** five participants with the prototype, scenario:
"Your groceries are being picked and one of the things you wanted has run out. Sort it out." **Signal that changes
the plan:** if most participants hesitate, ignore the sheet, or say they'd rather have decided in advance, move the
primary path to a checkout-time preference and keep the live sheet for exceptions.

**Test plan (minimum):** two rounds of five participants on the prototype: adults who order delivery in a large
city, holding the phone in one hand, some sessions while walking. Tasks are written without the interface's
labels (glance at status; late order; unavailable item; recognise the courier at the door). Not tested with users yet.

## Open questions

Answered on 2026-10-27: product scope, users, market (global, English, USD sample data), width (390), brand (not
decided; proposals labeled), look and motion. The rest is not decided; the prototype runs on assumptions P1–P9, and
each one needs a real decision before production.

| # | Question | Prototype assumption | Who can answer |
| --- | --- | --- | --- |
| 1 | Substitutions: who proposes a replacement, how long the customer has, what happens with no answer, how money for a removed or cheaper item is returned | P1 | Product owner, ops |
| 2 | Delays: what counts as late, whether a reason is available, whether anything is offered | P2, P3 | Product owner, ops |
| 3 | Contacting the courier and support: chat, call, masked numbers, hours | P4 | Product owner, ops |
| 4 | What the customer matches at the door | P5 | Product owner, ops |
| 5 | Which order stages the backend reports, for food and grocery | P6 | Engineering, product |
| 6 | Fees, and whether the total can change after checkout | P7 | Product owner, finance |
| 7 | Cancelling, failed delivery, rating, tipping, receipts | P8 (out of scope) | Product owner |
| 8 | Brand: name, mark, colours, type (proposed tokens and the working name P9 stand in until then) | P9 | Brand or design lead |
| 9 | Real map provider | SVG sample map | Engineering |
| 10 | Locale formats per market beyond en-US | en-US | Product owner |
| 11 | Repeat vs first-time use, accessibility needs, connection quality of the users | none | Research |
| 12 | Voice and tone (proposal above, not confirmed) | proposal used in the prototype | Brand or design lead |
