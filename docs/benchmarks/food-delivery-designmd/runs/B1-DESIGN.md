# DESIGN.md

<!-- ryux-context:start -->
- **Product**: Food and grocery delivery app, order tracking experience (working web prototype)
- **Users**: Customers who have placed a food or grocery delivery order
- **Market**: Not set (open question 1)
- **Product docs**: None; the brief in this file is the only source
- **UI direction**: Not set (open question 2)
- **Motion direction**: Not set (open question 2)
- **Voice and tone**: Not set
<!-- ryux-context:end -->

## Brief

> "Build an order tracking experience for a food and grocery delivery app as a working web prototype, mobile
> first: the order status from placed to delivered, what the customer sees when the order is running late, and
> what happens when an item is unavailable. Flow inspiration: delivery and ride-hailing apps."

Sources read: this brief only. The project has no product docs, no existing screens, and no design system yet.
The ryux MCP (reference screens) is not connected, so no claim below cites a captured screen.

## Users and needs

| Who / need | Source |
| --- | --- |
| A customer who has already paid and placed an order, for food, groceries, or both | Observed: brief |
| On a phone, most likely, so layout starts at mobile width | Observed: brief ("mobile first") |
| They check back in short glances while doing something else (cooking, working, waiting at the door), not in one long session | Inferred: how people use tracking; to be tested |
| First they need to know **when it arrives**, then **where it is now**, then **whether they have to do anything** | Inferred: comes from the brief's three topics; to be tested |
| When the order is late: a new, honest arrival time and the reason, if the system knows it, without having to ask support | Observed: brief names the late state; what the customer needs then is Inferred |
| When an item is unavailable: to decide quickly what happens to that item and the price, before the order moves on without them | Observed: brief names the state; the decision options depend on open question 3 |
| Grocery orders have many line items, so an unavailable item is likelier there than in a single restaurant meal | Inferred |

Proto-persona, labeled as assumptions (no research exists): a customer who orders dinner or a weekly grocery
top-up, opens tracking several times per order, and contacts support only when the screen fails to explain
something. Questions for real users are in How we evaluate.

## Jobs to be done

- **Primary job**: "When I've placed an order, I want to know when it will arrive and that it's on track, so I can
  plan around it without watching the screen."
- **Related jobs**
  - "When something goes wrong (late, missing item), tell me what changed and what I can do, so I'm not
    surprised at the door."
  - "When an item can't be supplied, let me choose what happens to it before the order is packed."
  - "When the courier is close, help me be ready and reach them if I need to."
- **Done, for the user**: the order is in their hands, what they received matches what they agreed to
  (including any changes), and they know what they paid for it.

## Order lifecycle (states the prototype must show)

The brief fixes the endpoints, "placed" and "delivered". The steps in between are a proposed model taken from
how delivery apps usually stage an order. They are design assumptions until the real order states are confirmed
(open question 4).

| # | State | Food | Grocery | What the customer sees first |
| --- | --- | --- | --- | --- |
| 1 | Placed | Order sent to restaurant | Order sent to store | Arrival window, "Waiting for the restaurant/store to confirm" |
| 2 | Confirmed | Restaurant accepted | Store accepted | Arrival window |
| 3 | Preparing | Cooking | Picking items | Arrival window; for grocery, items picked out of the total (count from the order) |
| 4 | Courier on the way to store | Courier assigned | Courier assigned | Courier first name, vehicle, and where they are |
| 5 | Picked up / on the way | Live map, courier moving toward customer | same | Arrival time, map |
| 6 | Arriving | Courier nearby | same | "Your courier is nearby", contact action |
| 7 | Delivered | Order handed over | same | Delivered at time, receipt summary with any changes |

**Exception states (from the brief)**

- **Running late**: overlays any state from 1 to 6. The arrival time moves; the old time is shown struck
  through or named ("was 19:20") so the change is visible, not silent.
- **Item unavailable**: happens during 2 or 3 (most often grocery picking). The order needs a decision from the
  customer; the tracking screen promotes it to the first thing seen.

**Exception states not in the brief** (not designed unless confirmed, open question 5): order cancelled by the
store, courier reassigned, failed delivery attempt, whole order unavailable.

## Evidence

| Decision or claim | Source | Strength |
| --- | --- | --- |
| Arrival time is the hero; status steps support it | Knowledge: category convention in delivery and ride-hailing apps named by the brief; no screens captured | None (judgment call, to be checked against references) |
| Live map with courier appears only once a courier exists (state 4 onward); before that, a status-first view | Knowledge: ride-hailing pattern (map when there is something moving to show) | None |
| Bottom sheet over a map, sheet carries status and actions | Knowledge: ride-hailing convention | None |
| Late state shows the new time, the old time, and a reason when one is known | Knowledge: RX-EC-02 (what happened, why, what next); RX-AS-04 forbids fake precision | None for the layout; Strong for the principle |
| Unavailable item is a blocking card with one primary decision | Knowledge: RX-PR-03, RX-IX-05 (full cost before commitment), RX-IX-17 (choice that changes price sits with the price) | None for the layout |
| Status never carried by colour alone | Knowledge: WCAG 1.4.1, RX-A11Y-06 | Strong (standard) |
| Mobile first, smallest width 320 | Observed: brief; Knowledge: RX-RD-01 | Strong |

Every layout claim is rated None because no reference screens were available. Before the build, check them
against two or three real delivery and ride-hailing apps (open question 6).

## Interaction patterns

| Pattern | Why | Evidence |
| --- | --- | --- |
| **One tracking screen, many states.** The order is one place the customer returns to. It changes with the state instead of moving them through separate pages | The customer glances in, they don't navigate; one place means one thing to recognise (RX-UX-08) | None |
| **Arrival time first, always.** A large time or window at the top, then a one-line status sentence, then the step indicator | Answers the first need in one glance | Inferred need; None for layout |
| **Step indicator with labels**, current step named in text, completed steps checked, future steps muted but legible | Shows where the order is and what's left (RX-UX-02); text plus icon, not colour alone | Strong (standard) |
| **Map appears with the courier** (state 4+), in a bottom-sheet layout: map above, sheet with time, status, courier, actions. The sheet expands to show order details | Ride-hailing convention; the map is only useful when something is moving | None |
| **Live updates without user action.** Status and arrival time update in place; a change is announced to assistive tech (polite live region) and briefly highlighted | Glance use; RX-IX-02 (feedback that matches the wait) | Knowledge |
| **Late: state, not alarm.** A banner in the sheet: new time, the earlier time, a reason if the system gives one, and a next step (contact support, or wait). No red full-screen takeover | RX-EC-02; the order is still coming | Knowledge |
| **Unavailable item: a decision card that leads.** Shows the item, the proposed option(s), the price effect, and one primary action. Options and defaults depend on open question 3 | RX-IX-05, RX-IX-17; the decision is time-bound because picking continues | Knowledge |
| **No-response path for the unavailable item.** What happens if the customer doesn't answer is shown on the card, in plain words, before they decide | Leaving it out would make the outcome undefined (RX-IX-01) | Knowledge; the rule itself is open question 3 |
| **Changes carried to the end.** The delivered state and receipt list every change (removed, replaced, price difference) | "Done" means what they received matches what they agreed to | Inferred need |
| **Contact courier / support** as secondary actions; the only primary action on screen is the decision card when one exists | RX-PR-03 | Knowledge; capabilities are unconfirmed (open question 5) |
| **Stale data is visible.** If updates stop (offline, server), show "Last updated 2 min ago" and a retry, keep the last known state on screen | RX-EC-06 | Knowledge |
| **Prototype scenario control.** A clearly marked demo panel to jump between states and trigger "late" and "item unavailable" | It's a working prototype; reviewers need to reach every state. Not part of the product UI | Design assumption |

**States the data can be in** (each needs a frame, RX-EC-01): loading the order; normal per lifecycle step; late;
item unavailable awaiting decision; decision submitting, saved, failed; map loading, map failed (status still
works without it); courier location unavailable; offline / stale; delivered; order not found.

## Visual and motion language

**Character and brand colour/type are not set**; the team chooses them (open question 2). Until then, these
are only the functional decisions that hold whatever the brand turns out to be, marked **proposed**.

- **Concept (proposed)**: *the arrival time is the product*. Everything else supports one number the customer
  can trust.
- **Signature (proposed, to choose with the direction)**: the route line from store to door, also used as the
  step indicator. One thing from the domain, reused, not decoration.
- **Avoid**: celebratory confetti on routine steps; a countdown that implies precision the system doesn't have;
  red for "late" when nothing has gone wrong for the customer yet; stock courier photos; invented ratings or
  "X orders delivered today" type numbers (RX-AS-01, RX-AS-04).
- **Liveliness (proposed)**: energy 1 to 2, calm with one lively moment (courier arriving / delivered);
  rhythm 2; motion as feedback and state change only.

**Proposed tokens** (functional only; brand palette and typeface pending)

| Token | Value | Reason |
| --- | --- | --- |
| `space` scale | 4, 8, 12, 16, 24, 32, 48 | One rhythm for dense sheet content and roomy hero time |
| `type.eta` | 32/36, semibold, tabular figures | Arrival time readable at a glance; tabular so the number doesn't jitter on update |
| `type.title` / `body` / `meta` | 20/26, 16/24, 14/20 | Body at 16 for mobile legibility; meta no smaller than 14 (RX-A11Y-02) |
| `radius.sheet` / `card` / `control` | 20 top only / 12 / 10 | Shape lock: sheet reads as a layer over the map; cards and controls stay distinct |
| `color.status.ontrack` | brand-dependent; pending | Normal progress uses the brand colour, not a separate green |
| `color.status.attention` | amber family, text at ≥ 4.5:1 | "Late" and "needs your decision": attention without alarm |
| `color.status.problem` | red family, text at ≥ 4.5:1 | Only for failures (decision failed to save, order cancelled) |
| `target.min` | 44 × 44 px | Touch targets (RX-A11Y-02) |
| `motion.state` | 200 ms, ease-out | Step change, banner in |
| `motion.sheet` | 280 ms, spring-like ease | Sheet expand/collapse follows the finger |
| `motion.courier` | interpolate between location updates | Marker glides instead of jumping; reduced motion → jumps to new position |

Reduced motion: no marker interpolation, no highlight pulse; changes are shown by text and position only
(RX-A11Y-08).

**Illustration**: none planned. Map, icons, and product photos (if the item data has them) carry the visuals.

## Voice and tone

Not set; it'll be inferred and confirmed once the market and language are known (open question 1). Working
assumptions for the prototype, not brand rules:

- Plain, calm, specific. Times and facts before feelings.
- Late: say it first, give the new time, say why if known, no excessive apology, no blame on the courier.
- Unavailable item: name the item, say what we propose and what it costs, make the choice obvious.
- Delivered: brief. The check mark already says it worked.

## Responsive

- **320–430 (primary)**: single column; map top, bottom sheet; sheet collapsed shows time, status sentence,
  step indicator, and any decision card. Smallest width tested: 320.
- **431–1023**: same model, sheet becomes a wider card; map gains height.
- **1024+**: two columns, status and details panel on the left, map on the right; the decision card stays in
  the panel, never in a modal over the map.
- What never moves: arrival time first, the decision card above everything else when present.

## How we evaluate

**Success criteria** (fixed before any alternative exists)

1. From any state, a customer can tell when the order arrives and what stage it is at within one glance
   (about 3 seconds, tested, not assumed).
2. When the order is late, the customer can say the new time and whether they need to do anything, without
   opening support.
3. When an item is unavailable, the customer can make the decision, understands its price effect, and knows
   what happens if they don't respond.
4. Every state, including late, unavailable, offline, and map failure, is reachable in the prototype and has
   a defined result and recovery (no dead ends).
5. Works and reads correctly at 320 px, with keyboard and screen reader, and without colour.

**Machine checks**: every state frame exists in the view × state matrix; contrast checked on all status
colours; typecheck and build pass; the prototype's scenario control reaches every state.

**Riskiest assumption**: customers trust and act on the unavailable-item card inside the tracking screen
rather than missing it while the order keeps moving.
**Cheapest test**: a five-person moderated test on the prototype at phone size, with the scenario "You ordered
groceries for tonight; check how it's going" and the unavailable event triggered mid-session.
**Signal that changes the plan**: two or more of five miss the card or decide without seeing the price effect,
then the decision moves to an interruptive pattern (push notification + full sheet) and gets retested.

**Test plan outline** (RX-UX-12): five participants per order type (food, grocery); tasks phrased without UI
labels; success measured against criteria 1–3; at least two rounds of test and fix. Team members should watch
the sessions. After launch, watch support contacts about late orders and missing items, and how many
unavailable-item decisions go unanswered; measure the baseline before release.

## Open questions

| # | Question | Who can answer |
| --- | --- | --- |
| 1 | Which market and language (sets currency, time format, address, copy language, voice) | Product owner |
| 2 | UI and motion direction: character words, brand colour, typeface | Product owner / brand |
| 3 | Item unavailable: which options exist (replace with suggested item, choose a replacement, remove and refund, cancel order), who proposes the replacement (store, picker, system), is there a time limit, and what happens if the customer doesn't respond | Product owner / operations |
| 4 | The real order states and their names; are food and grocery staged differently | Engineering / product |
| 5 | Capabilities: contact courier (call, chat), contact support, cancel order, tip, live courier location, push notifications, store cancellation, failed delivery handling | Product / engineering |
| 6 | Which specific delivery and ride-hailing apps are the references, so the None-rated layout decisions can be checked | Product owner / design |
| 7 | Late orders: is there a lateness threshold, is a reason available from the system, is there any compensation policy (none will be shown unless confirmed) | Operations |
| 8 | Refunds and price differences: when and how a price change from a replacement or removal is charged or refunded | Finance / product |
