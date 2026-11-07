# ryux-2: final message of each turn

## turn1

I've loaded RYUX and I'm in **Build**. DESIGN.md already sets the look, motion and voice, so I won't ask about those. Three things are still open, and each one changes which screens and actions the prototype has. RYUX has me ask before building rather than make them up.

**1. Market (currency, address and time format)**: none is named.
1. **No specific market (recommended):** neutral English copy, a generic currency symbol, 12-hour times. The data is clearly sample data.
2. United States: USD, miles, 12-hour times.
3. Indonesia: Rp, km, 24-hour times. The UI copy stays in English.
4. Other: tell me which.

**2. What happens when an item is unavailable?**
1. **The customer chooses for each item (recommended):** the shopper suggests a replacement, and the customer can accept it, pick a different one, or remove the item and get a refund. The shopper waits for a short window, then follows the customer's default preference. This is common in grocery delivery.
2. The item is removed and refunded automatically. The customer is only told.
3. The shopper picks a replacement automatically. The customer can undo it afterwards for a refund.
4. Other.

**3. What does the customer get when the order is late?**
1. **Information only (recommended):** a new arrival time, the reason, and a way to contact the courier or support. No compensation is promised, since I don't know your policy and won't make one up.
2. Information plus a "Cancel order" option once the order is past a lateness threshold you define.
3. Information plus a credit you define (amount and rule).
4. Other.

You can reply with three numbers, for example "1, 1, 1". Anything you leave out gets the recommended option, and I'll list it as an assumption. Once I have your answers, I'll build a single-file mobile-first web prototype. It will have a status timeline from placed to delivered with a moving courier on the map, the late state, and the unavailable-item flow. It will also include demo controls so you can step through every state, and a closing Delivery Gate report.

## turn2

I built the order tracking prototype at `prototype/`. Run `npm start` there and open http://localhost:4173/ (the server is already running from my session). On a phone-width screen, the **Prototype controls** button on the map moves the sample order through every state. On desktop the controls sit beside the phone.

**What it covers**
- **Placed to delivered:** five steps, each with a large status line and a progress bar that fills as it advances. Before pickup the arrival is a window ("12:44 – 12:52 PM"); once the courier leaves it becomes one time with minutes away, and it ends with a check mark that animates once. The map shows streets, the route and the courier moving along it.
- **Running late:** an amber "Running late" label, the new time next to "Was 12:48 PM", the reason, and "You don't need to do anything." If the delay is on the road, that stretch of street shows as slow. If it started at the store, the reason is in the past tense once the order is on the way. The courier never moves backwards on the map.
- **Item unavailable:** a "Needs your choice" label and a card at the top. Choosing replacements opens a sheet where, for each item, you pick the suggested replacement, a different item, or remove it, with the price difference shown. It covers missing choices, sending, a failed send that keeps your choices, and changing them later. The order lines and total update afterwards. There's also a path for when the customer doesn't reply. Both a grocery order and a restaurant order are included.
- **Also included:** messaging the courier (with sent and failed messages), offline (shows the last status and its time), a loading skeleton, and a "couldn't load your order" screen with Try again.

**Undecided policies.** None of your policies are decided, so each rule the prototype has to follow is labeled on the screen where it applies ("Prototype rule, not decided: …"):
- What happens if the customer doesn't reply (the items are removed).
- How replacements and removed items are priced.
- How long you can change your choices.
- Whether messaging the courier exists at all.

There's no compensation or cancel option for late orders, because that would be inventing a policy. Every name, price and time is sample data and labeled as such. No brand name or logo is shown.

**Checks run**
- 19 unit tests pass and the strict typecheck passes.
- I looked at Playwright screenshots of every state at 390px, plus 320px and a 1280px desktop: no sideways scroll and no console errors.
- All text contrast pairs measure at least 4.5:1. I darkened the button and option outlines to 3.5:1 after they measured below 3:1.
- Motion checks pass on the sheets (reversing mid-opening, rapid toggling, reduced motion leaves fades only).
- Keyboard and focus were checked: Tab order, Escape, and focus returning where it should. That last one was broken after sending choices, and I fixed it.
- No touch target is under 44×44.
- The RYUX scan shows 0 fail and 0 warn on the files and the live page.

It has not been tested with users. No screen-reader pass was done and Safari wasn't checked. The main design decision has no reference screens behind it, because the RYUX reference service isn't available yet. The README records it with the alternatives and a five-task usability test plan.

**Delivery Gate**
```
PRODUCT        PASS  · undecided rules labeled on the screen where they apply; no invented policy · evidence Thin (brief + DESIGN.md, no reference screens) · rationale 1 decision record, annotations 4 on-screen rule notes
UX             PASS  · every action has before, during, result and recovery; one primary action per state
CONTENT        PASS  · calm, direct, "you"; late copy has a reason and a next step; one term per thing
UI             PASS  · point of view: the status is the hero, signature: styled street map + 5-step progress bar · type sizes 32/20/16, 1 accent hue, 1 grey family, 1 icon set · illustration: none
DESIGN SYSTEM  PASS  · tokens for color roles, type, spacing, shape and motion; no duplicate components; scan clean
ACCESSIBILITY  PASS  · contrast measured, 44px targets, keyboard and focus checked by hand, reduced motion; no screen-reader or automated accessibility audit
RESPONSIVE     PASS  · 390 and 320 checked with no sideways scroll; desktop shows the phone beside the controls
EDGE CASES     PASS  · matrix below
CODE QUALITY   PASS  · 19 unit tests, strict typecheck, RYUX scan 0/0; UI flows checked by Playwright scripts, not a unit-tested suite
VISUAL QA      PASS  · Playwright Chromium at 390/320/1280, all states below inspected, motion checks run
ANTI-SLOP      PASS  · no fake numbers, people or urgency; sample data labeled; map has streets and names
FINAL          PASS  · checked criteria met; not tested with users
```

**Edge-case matrix**

| | Loading | Empty | Error | Success |
|---|---|---|---|---|
| Order status | skeleton | can't happen (an order always has a status) | load error with Try again; offline banner | 5 steps, plus late |
| Choosing replacements | "Sending…" | no choice made → shown next to the item | send failed, choices kept, retry | lines and total update, confirmation message |
| Courier messages | "Sending…" | "Messages you send appear here" | "Not sent. Try again" | "Sent" |
| No reply in time | — | — | — | items removed, with the reason on each line |

The README explains how to run everything and lists every assumption. The screenshots are in `qa/shots/`.
