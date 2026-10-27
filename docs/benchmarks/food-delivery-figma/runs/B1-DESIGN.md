# DESIGN.md

<!-- ryux-context:start -->
- **Product**: Food and grocery delivery app; this work is the customer's order tracking after checkout, from placed to delivered, including running late and an item being unavailable
- **Users**: Adults in large cities, on mobile, often on the move and using one hand
- **Market**: Not decided; a global product in English. USD for sample data
- **Platform**: Mobile first, designed at 390 wide
- **Brand**: Not decided (name, logo, colour, type, design system); proposals in this file are labelled as such
- **UI direction**: The visual direction of the Airbnb reference: warm and airy, rounded cards, friendly type, playful illustration, small delightful motion. Show the food: the dishes and groceries in the order are visible and appetising. Illustrated, with a courier character of our own and illustrations for the states. Take the direction, not Airbnb's brand, screens, or characters
- **Motion direction**: The flow and motion of the ride-hailing study in ref/ (seven frames plus ref/motion.md), at that level of interactive motion. Take the principles, not that app's brand, screens, or characters
- **References**: ref/frame-1.png to ref/frame-20.5.png, ref/motion.md
<!-- ryux-context:end -->

Status: second draft, after the team's answers on product, users, market, brand, policies, width, and look and
motion. There are still no product docs, research, analytics, or existing screens. Every value under "Visual and
motion language" is **proposed** until the team confirms it. Undecided policies are under Open questions and are
never shown on a screen as fact; where a prototype has to behave by one, it says so on that screen.

Sources read: the brief, the team's answers (second round), ref/motion.md, and ref/frame-1.png, 3.7, 5.9, 9,
13.5, 17.2 and 20.5. The ryux reference-screen library was not available, so no screen IDs are cited.

---

## Users and needs

| Who and what they need | Source |
| --- | --- |
| Adults in large cities who have placed a food or grocery order and are waiting for it | Observed: team answers |
| On mobile, often on the move, often using one hand | Observed: team answers |
| They want to see where the order is, from placed to delivered | Observed: brief |
| They need to understand what's happening when the order runs late | Observed: brief |
| They need to deal with an item that turns out to be unavailable | Observed: brief |
| They glance rather than study, and come back to the tracker several times per order | Inferred from "on the move"; not researched |
| They keep asking when it will arrive, whether anything needs them, and how they'll recognise the courier | Inferred: a proto-persona, not research. Ask real customers (see How we evaluate) |
| Food and grocery orders wait differently: food is cooked, groceries are picked and may get substitutions | Inferred; the picking stage is an assumption (see Assumptions) |

No personas, segments, or behaviour data have been provided. Don't add any until there is a source.

## Jobs to be done

**Primary job.** "Tell me when my order will get here, and only bother me when something needs me."

**Related jobs.**
1. Follow progress at a glance, one-handed, while walking: which stage it's at, and what comes next.
2. When it's late: know it's late, how late, and what I can do, before I have to ask.
3. When an item is unavailable: decide quickly what happens instead, and know what that does to my bill.
4. At the door: recognise the courier and get the order.

**What done looks like for the customer.** They have their order, they were never surprised by a change they
could have been told about, every decision they were asked to make took one screen and one thumb, and they know
what they paid for what they got.

## Evidence

| Decision or claim | Source | Strength |
| --- | --- | --- |
| Scope: order status from placed to delivered, the late state, the unavailable-item state | observed · brief | Strong (it's the requirement) |
| Mobile, 390 wide, one hand, on the move | observed · team answers | Strong (requirement) |
| Character: warm, airy, rounded cards, friendly type, playful illustration, small delightful motion; the food visible and appetising; our own courier character; illustrations for the states | observed · brief and team answers (Airbnb as the feel reference) | Strong as direction. It's not evidence about users |
| A live trip as a map on top with a bottom sheet that changes state | observed · ref/frame-13.5, 17.2, 20.5 (ride-hailing, one product) | Thin: one product, and ride-hailing rather than delivery |
| The sheet keeps its structure when the state changes; only the title, subtitle, and button change | observed · ref/motion.md "Same sheet, new state" | Thin |
| An illustrated character in the status card, which reacts to the state | observed · ref/frame-17.2, 20.5, ref/motion.md "On the way" | Thin. We borrow the principle; the character is our own |
| Something to recognise at the kerb is prominent on arrival | observed · ref/frame-17.2, 20.5, ref/motion.md | Thin |
| Numbers that change roll only the digits that changed | observed · ref/motion.md "Numbers" | Thin |
| Primary actions within reach of the thumb on a one-handed phone | knowledge · Fitts's law; Apple HIG and Material touch-target guidance (44 pt / 48 dp) | Strong (standard) |
| Every action defines what the user sees before, during, after, and on failure | knowledge · RX-IX-01; Nielsen heuristics 1 and 9 | Strong (standard) |
| Waits longer than about 10 s show progress or let the user leave and come back | knowledge · RX-IX-02; Nielsen response-time limits | Strong (standard) |
| Large movement becomes a fade or a cut when reduced motion is on | knowledge · WCAG 2.2 SC 2.3.3, RX-A11Y-08 | Strong (standard) |
| How customers react to late orders and substitutions, and which outcome they prefer | none | None. No research; hypotheses to test |

## Interaction patterns

"Unconfirmed" means a capability nobody has confirmed: it's proposed, not a requirement. "Prototype rule, not
decided yet" is the on-screen label for any behaviour a prototype needs but the team hasn't decided (RX-PR-02).

### One hand, on the move
- **Everything the customer acts on sits in the bottom half of the screen.** The primary action is a full-width
  pill at the bottom of the sheet. Contact and help sit on the sheet, not in the top bar. The top of the screen is
  for looking at: the food and the map. Evidence: Strong (knowledge, Fitts's law and platform guidance).
- **Touch targets are at least 44 × 44 pt**, with 8 pt or more between neighbouring targets.
- **The sheet has two resting heights**, peek (arrival time, stage, primary action) and full (order details).
  Dragging follows the thumb (RX-IX-15), and a tap on the handle does the same thing, for anyone who can't drag.
- **Glanceable while walking:** the arrival time and the stage are readable in one look, with no reading needed
  below the peek height.

### Navigation model
- **The tracker is one screen that changes state, not a series of pushed screens.** Back leaves to where the
  customer came from (home or orders). Evidence: Thin (ref/motion.md, "Same sheet, new state").
- **Delivered replaces the tracker.** It's a one-way door: back never reopens a live tracker (RX-IX-14).
- **The unavailable-item decision is a sheet over the tracker.** Dismissing it doesn't make the decision; a
  decision card stays pinned at the top of the tracker sheet until it's resolved (RX-IX-13).

### Order status, placed to delivered
- **Stages (a prototype assumption until the real order events are known):** Placed → Accepted by the store →
  Preparing (food) or Picking (grocery) → Picked up → On the way → Arriving → Delivered.
- **What the customer sees first is the arrival time**, shown as a window (an assumption about the ETA data). It's
  the one display-size element per screen. Second is the stage in plain words. Third is what happens next.
- **The progress indicator shows stages, not a fake percentage.**
- **The food is on screen in every stage.** Photos of the dishes or groceries in the order are visible at the
  peek height, as a row of up to four rounded photos plus "+N" (RX-UI-07). Before pickup the order is the hero at
  the top of the screen; after pickup the map takes the top and the food rides along in the courier's marker
  (structure hypothesis B; not chosen yet).
- **The courier card** appears once a courier is assigned: name, vehicle, and the thing to match at the door. Real
  courier details only come from order data; the illustrated character is not the courier (see Illustration).
- **Contact the courier** (unconfirmed, and its policy isn't decided): one secondary action on the courier card,
  annotated as proposed in the design file.
- **Coming back to the tracker** shows the current state straight away; a stage's entrance plays once, not on
  every open (RX-UI-11).
- **Outside the app:** notifications or live activities (unconfirmed). The tracker must work without them.

### Running late
- **Late is a state of the same sheet, not an error screen.** The arrival time rolls to the new window, and the
  previous window stays visible as one line ("Was 7:40–7:50 PM") so the change is honest.
- **The tone gets calmer, not louder.** The "attention" colour role with an icon and words, never colour alone
  (RX-A11Y-06). The courier illustration changes to its calm "waiting" pose (see Illustration). No bounce, no
  celebration.
- **The reason is shown only when the order data supplies one.** Prototypes use one sample reason, labelled as
  sample data.
- **What the customer can do:** contact or help (unconfirmed). Compensation, credits, and cancelling are
  undecided policy, so they don't appear as offers. A prototype that needs a late threshold shows it with "Prototype
  rule, not decided yet".

### Item unavailable
- **The decision comes first.** A sheet rises over the tracker with the unavailable item (photo, name, quantity,
  price), the suggested replacement (photo, name, price), and the difference to the total (RX-IX-17).
- **Options in the prototype** (unconfirmed, because substitution policy isn't decided): accept the replacement
  (primary), choose another, or remove the item. One primary action, the others secondary (RX-PR-03).
- **Before, during, result, recovery** (RX-IX-01): the press gives instant feedback; while sending, the button
  shows progress and can't be tapped twice; afterwards the sheet closes, the order photos update (the swapped
  photo cross-fades in), the total rolls to its new value, and a line in the order summary says what changed. On
  failure the choice is kept, with "Try again".
- **Undecided rules are labelled on the same screen:** the time limit to answer, what happens with no answer, and
  how a removed item is refunded each show "Prototype rule, not decided yet" wherever a prototype displays them.
  Otherwise they're left out of the copy.
- **Food versus grocery:** grocery shows a like-for-like replacement; for food, a prototype assumes "choose
  another dish" or "remove". Both are assumptions.

### States the data can be in
Each one gets a design. A blank cell in the state matrix fails the delivery check (RX-EC-01).
- First load: a skeleton shaped like the sheet and the food row.
- No courier yet, and a courier being reassigned.
- Courier location stale or lost: the last known position with its age; the marker isn't moved by guessing.
- Offline or a server failure: the last state, with its age, and whether the connection or the server failed (RX-EC-06).
- Map failed to load: the sheet still carries everything, and the map's information has a text equivalent.
- An order item photo that's missing: a shaped slot in `surface/sunken` with the item name.
- Order cancelled by the store or the system: what happened and one next action. Money outcomes stay out unless
  the policy exists.
- Delivered: confirmation, what arrived (including replacements and removals), and the final total.
- Long names (stores, items, addresses, couriers) and 200% text.

## Visual and motion language

All values are **proposed** until the team confirms them. Each has a one-line reason.

### Character and concept
- **Character, from the brief:** warm, airy, food-forward, friendly, playful at the right moments.
- **Two kinds of picture, each with one job.** Photos show the customer's food: real, appetising, and theirs.
  Illustration shows the service and the state: the courier character, and how things are going. Photos never
  stand in for the state, and illustration never stands in for the food.
- **Concept (proposed): "Your order, on its way to you."** The customer's own food stays visible from the moment
  it's placed until it's at the door.
- **Signature (proposed): the basket.** Our courier rides a cargo e-bike with a big front basket. In the sheet's
  illustrations the basket is where the order sits, and on the map the courier marker is a small courier head
  beside a bubble showing the order's lead photo. At pickup the food row in the sheet shrinks into that bubble in
  one spring (a shared element, the principle from ref/motion.md "Shared element"). On delivery the bubble lands at
  the door marker.
- **Where the playfulness goes:** placed, picked up, arriving, delivered, and first use. In late, unavailable,
  cancelled, and failure states the illustration stays, but its pose is calm and helpful, never a joke (RX-UI-16).
- **Avoid:** Airbnb's coral, its Cereal typeface, and its illustrations or icons; the reference app's green, its
  helmeted rider on a scooter, the thumbs-up, the speech bubble, and its service names; confetti; a placeholder
  map without streets; fake countdowns or scarcity (RX-AS-04); food photos that are dark, cluttered, or generic
  stock pictures that don't match the item named.

### Structure hypotheses to explore (not chosen yet)
Rendered side by side at 390 with the same sample order; the team picks one.
- **A. Trip-led:** the map is on top in every stage and the sheet holds the status and the food row. This is the
  reference's model. It's familiar, but before pickup the map shows only the store and nothing moves.
- **B. Order-led, then trip-led (recommended to test first):** before pickup the top of the screen is the food,
  as large photos and the courier illustration; from pickup the map takes over. It carries "show the food" most
  strongly, but costs one large layout change in the flow.
- **C. Timeline-led:** a vertical stage timeline is the screen, with the food at the top and the map as a card
  that expands. It's the best for glancing at what's next, but the weakest for the motion direction.
Evidence for choosing between them: None. It's a judgment call until it's tested (RX-PR-10).

### Tokens (proposed)

**Colour roles** (one warm grey family and one accent):

| Token | Value | Reason |
| --- | --- | --- |
| `surface/base` | `#FFFBF7` | A warm off-white, for "airy" without clinical white; it flatters food photos |
| `surface/raised` | `#FFFFFF` | Cards and the sheet stand on the warm base |
| `surface/sunken` | `#F5EFE8` | Image wells and skeletons, from the same warm grey family |
| `text/primary` | `#231C17` | Warm near-black: 14.7:1 on `surface/sunken` (calculated) |
| `text/secondary` | `#6B5F55` | Warm grey: 6.0:1 on `surface/base` and 5.4:1 on `surface/sunken` (calculated) |
| `border/subtle` | `#E9E1D8` | Dividers inside cards, same family |
| `accent/primary` | `#C2410C` | Paprika: warm and appetising, distinct from both references' brand colours. White on it is 5.2:1 (calculated) |
| `status/attention` | `#8A5A00` on `#FFF3D6` | Late and needs-attention: amber reads as "watch this", not "failed". 5.4:1 (calculated). Always with an icon and words |
| `status/error` | `#B42318` | Failures and destructive actions only: 6.4:1 on `surface/base` (calculated). It sits near the accent, so it always comes with an icon and a label |
| `status/success` | `#1E7A4C` | Delivered and confirmed: 5.2:1 on `surface/base` (calculated). With text and an icon |

Count limit: one accent hue; status colours are named and excluded from the count (RX-AS-10).

Added while building the Figma file (proposed, same family):

| Token | Value | Reason |
| --- | --- | --- |
| `accent/soft` | `#FDF0E8` | Courier avatar background; the accent initial on it is 4.6:1 (calculated) |
| `accent/on` | `#FFFFFF` | Text and icons on the accent and on dark photos |
| `status/error-bg` / `status/success-bg` | `#FDECEA` / `#E6F4EC` | Inline error and success banners; text on them uses the matching status colour |
| `map/ground`, `map/block`, `map/park`, `map/water`, `map/road`, `map/route` | `#F3EDE4`, `#E8DFD3`, `#DCE8D2`, `#D5E6EE`, `#FFFFFF`, `#C2410C` | A warm map style from the same grey family, so the map doesn't fight the food |
| `illo/highlight`, `illo/green`, `illo/cream`, `illo/skin-1` | `#F2B544`, `#2F5D50`, `#F7E7CE`, `#C68863` | Illustration only, never UI (skin variants b and c are in the illustration set) |
| `scrim` | `#231C17` at 40% | Behind the decision sheet |

**Type** (one family, three weights at most):

| Token | Size / line height | Use |
| --- | --- | --- |
| `type/display` | 32/36, semibold, tabular figures | The arrival window: the one display size per screen |
| `type/title` | 20/26, semibold | The stage title in the sheet |
| `type/body` | 16/24, regular | Body text and list rows |
| `type/label` | 14/20, medium | Buttons, chips, secondary lines |
| `type/caption` | 12/16, medium | Timestamps and the age of stale data. Never the only carrier of important information |

Family (proposed): **Figtree** (open licence). Its rounded, open shapes give friendly type without copying
Airbnb's face. Confirm it has tabular figures before adopting it; if not, use SF Pro or Roboto for numbers. All
sizes scale with Dynamic Type and Android font scaling.

**Spacing:** a 4 pt base, with 4, 8, 12, 16, 24, 32, and 48 as the steps. 8–12 within a group, 24 between
groups, 16 for screen margins at 390.

**Shape lock:** buttons and chips are pills; cards are 20; food photos are 16; the sheet's top corners are 28;
map markers are circles; inline banners and the prototype-rule tag are 12.

**Elevation:** two shadows only, one for the sheet and one for floating map controls. Cards don't sit inside cards.

**Icons:** one rounded outline set at 1.75 px stroke (Phosphor Regular proposed). Every icon has a text label
except back and help in the top corners. In the Figma file the icons are drawn to that style as stand-ins;
swap in the chosen set before build.

**Money and time (sample data):** USD as `$12.40`; 12-hour times with AM/PM (`7:40–7:50 PM`). Both are
assumptions for a global English product.

### Food photography (asset direction)
- **Purpose:** show the customer what they ordered, so it's recognisable and makes them look forward to it.
- **Source:** in the product, the store's menu and catalogue photos. In mockups, licensed stock photos with a
  named source, or generated images labelled **illustrative sample data**; never presented as a real store's product.
  The Figma file uses openly licensed Wikimedia Commons photos (CC0, CC BY, CC BY-SA; credits on its asset board),
  because Figma AI image generation had no credits left.
- **Style:** natural daylight from one side, soft shadows, true colour. Dishes shot at about 45° in their
  container; groceries as single products on a plain light surface. Light, uncluttered backgrounds that sit well on
  `surface/base`.
- **Crop:** square 1:1 in the food row and the decision sheet, 4:3 for the hero in hypothesis B. The food fills
  about 70% of the frame.
- **Consistency:** one lighting direction and one background tone across a mockup's set; compare the set side by
  side before handoff.
- **Avoid:** dark moody shots, heavy filters, hands or people, brand packaging with readable logos, and a photo that
  doesn't match the item named.

### Illustration style (written before the first drawing; proposed, RX-UI-17)
- **Line:** no outlines; shapes only.
- **Shape:** soft geometry with 6–8 pt corner rounding, echoing the shape lock; chunky and friendly.
- **Colour:** `accent/primary`, `surface/sunken`, `text/primary`, a food-warm highlight `#F2B544`, and one deep
  green `#2F5D50` for plants and the bike frame (both illustration-only, never UI). At most four per drawing.
- **Depth and detail:** flat with one shadow tone, low detail. It must read at 96 pt in the sheet.
- **Subject:** our courier character, and objects from the product (the basket, the bag, the store counter, the
  shelf, the door, the receipt).
- **Character system, the courier:**
  - Proportions: about three heads tall, rounded body, simple hands, riding a cargo e-bike with a front basket.
  - Face: dot eyes and a simple line mouth; expressions come from the brows, mouth, and posture.
  - Outfit: a paprika jacket, a cream rounded helmet, and an insulated bag that fits the basket. No logo (the brand
    has none yet; RX-AS-11).
  - Range: the character is a mascot for the service, not a depiction of the real courier. Skin tone and hair
    come in a small set of variants so no single look stands for every courier; one variant per order, kept the
    same throughout.
  - Distinct from the reference: a bicycle, not a scooter; no full-face helmet; no thumbs-up; no speech bubble.
- **State poses (one set, made together; RX-UI-18):**

| State | Pose | Tone |
| --- | --- | --- |
| Placed | courier ticks off a receipt, with the basket empty | playful |
| Preparing (food) | a pan with steam at the store counter, the courier waiting with the bag open | warm |
| Picking (grocery) | the courier reaches a shelf, the basket half full | warm |
| Picked up / on the way | riding, basket full | playful; used inside the map marker as the head only |
| Arriving | stopped at the door, looking for the number | friendly |
| Delivered | handing the bag over at the door, the basket empty | playful, played once |
| Running late | waiting calmly at a busy counter, or riding steadily through traffic | calm, no humour |
| Item unavailable | at a shelf with a gap, holding up a possible replacement | neutral, helpful |
| Cancelled or error | sitting on the parked bike, with the empty basket | calm, never sad-faced for a joke |
| Offline | the bike parked under a street light with no signal waves | calm |

- **Delivery:** SVG coloured from tokens, with no text inside. Alt text says what the state means ("Your order is
  being prepared"); purely decorative uses are hidden from screen readers (RX-UI-19).
- **Decision:** the style comes from the brief's character, the team's request for our own courier, and the tokens.
  Evidence: None (a judgment call). Confidence: Medium. Test it as a side-by-side set before any screen is final.

### Motion (proposed)
**Personality:** snappy and friendly. Pushes, sheets, and state changes use one snappy spring with no bounce; a
small bounce is reserved for playful moments (ref/motion.md, "Springs").

| Token | Value | Use |
| --- | --- | --- |
| `motion/press` | 100 ms, scale to 0.97 (cards and buttons); list rows change background only | L1: every tap answers at once |
| `motion/spring-snappy` | critically damped; response about 0.35 s | Sheet states, pushes, and the sheet following the drag |
| `motion/spring-playful` | slightly underdamped, with one small overshoot; response about 0.5 s | Placed, picked up, delivered, the marker landing |
| `motion/fade-quick` | 150 ms ease-out `cubic-bezier(0.23, 1, 0.32, 1)` | Content swaps and every reduced-motion replacement |
| `motion/digit-roll` | 250 ms per changed digit, `spring-snappy` | Arrival time and totals; only the changed digits move |

The spring values are starting points to tune on a device. Animate transform and opacity only; anything that
opens and closes can reverse halfway (RX-UI-11).

| Moment | What it communicates | Level | Frequency | Behaviour |
| --- | --- | --- | --- | --- |
| Tap anything | it received the touch | L1 | constant | `motion/press` |
| Order placed | it's real, and it started | L4 | once per order | The food photos gather into the row with `spring-playful`; the courier ticks the receipt once |
| Stage changes | something moved forward | L2 | a few times per order | The same sheet in a new state: unchanged cards stay still, the title and subtitle push up from below, the stage indicator fills, and the illustration cross-fades to the new pose |
| Arrival time changes | a new estimate | L1 | often | `digit-roll` on the changed digits only |
| Pickup (the signature) | your food is on its way | L3 | once per order | The food row shrinks into the marker's bubble as the map expands, in one spring; the courier hops onto the bike in the sheet |
| On the way | where it is now | L2 | continuous | The marker moves along the route as real location data arrives, and the route shortens behind it; no movement is guessed between data points |
| Arriving | get ready at the door | L2 | once | The door marker pulses twice; the courier card's "match at the door" detail highlights once |
| Delivered | done | L4 | once | The bubble lands at the door with `spring-playful`; the handover illustration plays once; one success haptic |
| Running late | the plan changed | L1 | rare | `digit-roll`, the colour role changes, and the illustration cross-fades to its calm pose. No bounce |
| Item unavailable | you need to decide | L2 | rare | The decision sheet rises with `spring-snappy`, with one notification haptic; the tracker behind stays still |
| Replacement accepted | your order changed | L2 | rare | The swapped photo cross-fades in the food row and the total rolls |
| Map and sheet gestures | direct manipulation | L1 | constant | Follow the thumb 1:1, keep the velocity on release, rubber-band at the ends, and can be caught mid-animation (RX-IX-15) |

**Frequency rule:** reopening the tracker shows the current state at once; only an unseen stage change replays.

**Reduced motion:** the shared-element pickup, the landing, and the sheet pushes become `fade-quick`; the digit
roll becomes an instant swap; pulses become a static highlight; illustrations show their end pose (RX-A11Y-08).

**Haptics** (native, an assumption): at most one per moment, and only for placed, needs-decision, and delivered.
They follow the system setting.

### Liveliness (proposed)
- **Energy 2 (balanced):** playful at milestones, calm while waiting, sober when something goes wrong.
- **Rhythm 2:** steady with variation; the milestones are the peaks.
- **Motion:** L1–L3 for everyday changes, L4 only for placed and delivered, no L5.

### Responsive
- Designed at 390 pt. Checked at 375 pt (the smallest iOS width) and 360 dp (Android), and at 200% text. The
  arrival window, the stage, and the primary action never truncate; at large text the sheet's peek height grows
  and the map or food hero shrinks. The food row drops from four photos to three plus "+N" at 360.
- Below 375 the illustration in the sheet header scales to 88 × 66, so the arrival window stays on one line
  (found in the 360 check: "PM" wrapped on its own line).
- Landscape, tablet, and web are out of scope for now (an assumption).

## Voice and tone

**Proposed** (there's no existing copy and the team hasn't set a voice). English, for a global product.
- **Voice:** warm, plain, brief. It speaks to the customer as "you" and talks about their food, not the system.
- **Tone by moment:**
  - Progress: light and short ("Your order's on its way").
  - Late: matter-of-fact: what changed, the new time, and what you can do. No jokes, no "Oops".
  - Unavailable: direct and neutral: the item, the options, and what each does to the total.
  - Failure: what happened, why if we know, and the next step (RX-CD-04).
  - Delivered: short and warm.
- **Labels start with a verb** ("Accept replacement", "Remove item", "Contact courier"). One name per thing:
  "courier" everywhere, never "driver" or "rider" (RX-CD-05).
- **Plain, global English:** no idioms that don't travel, and no slang.

## Assumptions

Decided by us so the work can continue; each one can be overturned.
- **Design assumptions:** a native iOS and Android app; one active order in this scope; the stage list above;
  grocery orders have a picking stage; the arrival time is a window; US English formats for sample data
  (`$12.40`, `7:40 PM`); landscape, tablet, and web out of scope.
- **Unconfirmed capabilities** (proposed, not requirements): contacting the courier; notifications and live
  activities; replacement options (accept, choose another, remove); a checkout preference for unavailable items;
  rating or tipping after delivery.
- **Sample data:** all names, items, prices, times, addresses, and delay reasons in mockups are sample data in
  USD, labelled as such in the design file. Food photos in mockups are licensed or generated and labelled
  illustrative.
- **Brand:** no name or logo; mark slots show `[LOGO]`. The palette, type, and courier character are proposals.

## How we evaluate

**Success criteria** (fixed before any alternative is drawn):
1. At a glance, one-handed, a customer can say when the order will arrive and whether it needs anything from them.
2. When the order is late, the customer can say the new time and one thing they could do, without contacting support.
3. When an item is unavailable, the customer decides on one screen with their thumb and can say what it did to
   their total.
4. The food in the order is visible and appetising in every stage, and the warm, playful character shows at the
   milestones, staying calm in late, unavailable, and failure states.
5. No state the order can actually be in leads to a dead end or an endless spinner.

**Machine and structured checks:**
- `ryux scan` on the build, once there is one.
- The view × state matrix (loading, empty, error, and success per view and action) with no blank cells.
- Contrast for every text/surface pair: at least 4.5:1 for text, 3:1 for large text and icons.
- Counts: one accent, one grey family, radii only from the shape lock, one display size per screen, one icon set,
  one illustration family.
- Touch targets at least 44 pt, and every primary action within the bottom half at 390.
- Reduced motion tested on a device; a typecheck and tests once there's code.

**Riskiest assumption:** that customers on the move notice and answer an unavailable-item decision in time.
- **Cheapest test:** an interactive prototype test with 5 participants per group (food and grocery). Interrupt
  them with a substitution while they're walking or busy in another app. Measure whether they notice it, how long
  they take to decide, and whether they can state the effect on the total.
- **Signal that changes the plan:** most miss it, or can't state the effect. Then move the decision earlier, as
  a checkout preference, and make the tracking-time decision the exception.

**Second risk:** that a food-led screen before pickup (hypothesis B) helps more than a map does. Test A and B with
the same scenarios, and watch whether participants look for a map before pickup.

**Task scenarios** (they don't use interface labels):
- "You ordered dinner and you're about to step into the shower. Decide whether you have time."
- "Your groceries are on their way and something you ordered isn't in stock. Make sure you still get what you need
  for tonight."
- "Your food was due ten minutes ago. Find out what's going on."

No user testing has been done. Watch the sessions together, so what users show becomes shared knowledge.

## Design file

Figma: [Ujicoba › Pilot B1](https://www.figma.com/design/Vbgd7hohZiudPJNf4Pt9ay/Ujicoba). The three layouts are
side by side; layout B is built out but **not chosen yet**. Tokens are in the variable collection "Pilot B1", with
text styles `B1/*` and effects `B1/elevation/*`.

## Open questions

Policies the team has said are not decided. Prototypes label them on screen; they never appear as fact.

| # | Question | Why it matters | Who can answer |
| --- | --- | --- | --- |
| 1 | Substitutions: who decides, which options, the time limit to answer, and what happens with no answer | The decision screen's options and copy | Product owner and Ops |
| 2 | Delays: when an order counts as late, whether the customer is told proactively, and any compensation, credit, or cancelling | The late state's trigger and its actions | Product owner and Ops |
| 3 | Refunds for removed or missing items: the method and the timing | The decision and delivered screens | Payments and Finance |
| 4 | Fees: does a replacement or a change ever change fees? | The total shown in the decision | Product owner and Finance |
| 5 | Contacting the courier: chat, call, masked numbers, or none | The courier card's secondary action | Product owner and Legal |
| 6 | Which order events and ETA data exist (stages, location rate, window or single time, delay reasons) | Stages and progress must come from real data | Engineering |
| 7 | Brand: name, logo, colour, type, and whether the courier character becomes part of the brand | All visual tokens are proposals; mark slots show `[LOGO]` | Brand or Design lead |
| 8 | Voice and tone: confirm or replace the proposed profile | Every string | Product owner or Content |
