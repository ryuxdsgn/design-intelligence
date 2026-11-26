# Interaction design

Designs what happens when people act: feedback, confirmation, undo, navigation, gestures, states, and local payments such as QRIS and virtual accounts.

> Group UX · Delivery Gate area UX · RYUX 2.24.6. Levels are defined in `SKILL.md`.

Define every meaningful action in four parts before implementing it:

| Phase | Question |
| --- | --- |
| Before | What tells the user this action exists, what it will do, and what it costs? |
| During | What do they see while it runs (pressed state, loading, progress)? |
| Result | How do they know it worked, and what changed? |
| Recovery | If it fails or was a mistake, how do they undo, retry, or get help? |

**Picking from a limited set** (seats, time slots, rooms). The legend shows every state a place
can have: available, selected, sold, and accessible when the venue has it. Selecting starts a hold
with a visible timer and says what happens when it runs out. Offer a best-available pick for people
who do not care where they sit, and state the most per order. Ask the hold length, the most per
order, and how accessible places are allocated; never invent them.

**Confirm or undo?** Reason about it; do not apply it mechanically.
1. Is it reversible? Then prefer an undo after the fact over a confirmation before.
2. Is it irreversible **and** high-impact (money, sending, deleting shared data)? Then confirm with
   the specifics: amount, recipient, item.
3. Is recovery easy and the impact small? Then skip confirmation; it only adds friction.
4. Would a confirmation appear so often that people dismiss it by habit? Then it protects
   nothing; use undo.

States to define for interactive elements: default, hover (pointer), focus, active or pressed,
disabled (with a reason, or keep it enabled and explain on use), loading, success, error. Keyboard:
every action is reachable; Enter submits; Escape closes. For repeat or expert use, add shortcuts
(recent items, quick amounts) without crowding the novice path.

**Navigation.** How a screen arrives tells people where back goes (RX-IX-13, RX-IX-14):

| Transition | Means | Back |
| --- | --- | --- |
| Push | one level deeper in the same task | returns to the screen before |
| Replace | a new stage; the old one is finished | does not return to the finished stage |
| Modal | a self-contained task, finished or cancelled | closes the task |
| Sheet | a short interruption over the current screen | dismisses the sheet |

After a completed payment, submission, or onboarding, the result replaces the flow (a one-way door).
Back is blocked only while a request is in flight or work is unsaved, and the screen says why.
Follow the platform's back gesture and button; on the web, the browser's back follows the same map.

Does not cover: form-specific behavior (see `knowledge/forms.md`).

## Evidence from RYUX Knowledge

How local apps handle the same action and its states, and local payment patterns: `search_screens`, `get_local_pattern` (qris, virtual-account, paylater). Without the ryux MCP, say the evidence comes from the design and standards alone.

> Hard Gates always apply, whichever skills are loaded: no invented numbers, people, urgency, business
> rules, or terms; no placeholder shipped as final; no missing critical states. Labeled sample data is
> not an invented number; an unconfirmed capability is never presented as confirmed. See `SKILL.md`.

## Rules

### RX-IX-01 [Required] [Hard Gate] Before, during, result, recovery

- Do: For each meaningful action, decide what the user sees before acting, while it runs, when it finishes, and how they recover if it fails. Make the result the clearest moment of the flow: what happened, the detail the user will check, and the next step.
- Do not: Ship an action whose in-progress, result, or failure behavior is undefined.
- Why: Undefined behavior becomes inconsistent behavior once it is implemented. (Nielsen heuristics 1 and 9; peak-end rule (Kahneman et al. 1993): people judge an experience largely by its most intense moment and its end; ryux interaction model)
- Not when: trivial actions with no wait and no failure mode (toggling a local view)
- Trade-off: more states to design, build, and test
- Check: for each async action, point to its before, during, result, and recovery states in the render or the design file; fails on any that is missing

### RX-IX-02 [Required] Feedback that matches the wait

- Do: Give an immediate pressed state; past about 1 second show a loading indicator; past about 10 seconds show progress with an estimate or let the user leave and come back. A loading skeleton has the shape of the layout it stands in for: the same blocks in the same places, so nothing jumps when the content arrives.
  - When an action changes a value outside the element that was touched (a total in a bottom bar, a cart count, a badge), mark the change where it lands: a short highlight or a number transition, or keep the value next to the control.
  - The in-progress label ("Booking…") stays on the button until the result replaces the screen: keep the button's width and fade the label in place, rather than morphing the button into a spinner that cuts its label, and never show the idle label again on the way out.
  - Say the wait to assistive technology too, not only with a spinner hidden by aria-hidden: aria-busy on the region that is loading, or the in-progress label read by a polite live region.
  - A toast confirms on the screen where the action happened and then leaves; the next screen does not repeat it as a fixed banner.
- Do not: Let a payment or save run with no visible status, or change a total away from where the user is looking with no sign that it changed.
- Why: Silence during a wait reads as failure and invites double taps. (Nielsen response-time limits (0.1 / 1 / 10 s); Nielsen heuristic 1; Doherty threshold (Doherty and Thadani 1982): responses under about 400 ms keep people engaged; skeleton shape: pattern also in appllama-app-design-skill (MIT); written for RYUX; flow (Csikszentmihalyi 1990): a task without interruptions or unexplained waits keeps people absorbed in it; change blindness (NNGroup psychology study guide): people miss changes outside their focus; owner review 2026-11-20 of the dialog check sheet (inline alertdialog confirmations in an editor): an inline confirmation is not modal, and the open question is whether focus moves into it; owner blind review 2026-11-09 of the motion head-to-head (docs/benchmarks/motion): in both runs the confirm button's label overlapped or flipped back to the idle label during the transition, and one cut it in a spinner morph; owner blind review 2026-11-18 of three Rak flows (secondhand books, Yogyakarta): "added to your bag" shown again as a fixed banner on the bag screen; owner review 2026-11-18 of the markup detector sheet (scan findings in 5 projects, parser candidates in 5 React projects): pay buttons whose spinner and check were aria-hidden with nothing announced)
- Not when: instant actions under about 0.1 s; a spinner that flashes is noise
- Trade-off: progress indicators need real progress data; a fake bar misleads
- Check: heuristic_eval H-01
- Machine check: `ryux scan` flags in .jsx, .tsx, and .html: a loading indicator (a spinner, loader, loading, or skeleton class; a component by such a name defined in the file, taken from an icon set, or imported from a project module whose own markup announces nothing; or "Loading…", "Memuat…", "Memproses…" text) in a file, with the scripts an HTML page loads, that has no aria-busy, aria-live, role="status", "progressbar", or "alert", <output>, or <progress>; once per file, and not when a page loads a script the scan cannot read (warn)

### RX-IX-03 [Required] Cancel, back, and undo

- Do: Let users cancel, go back, or undo without losing their work; where a step is genuinely irreversible, say so before it. A finished flow is the exception: back leaves it instead of reopening it (RX-IX-14).
- Do not: Trap users in a flow with no exit.
- Why: Freedom to back out makes people willing to explore. (Nielsen heuristic 3 (1994))
- Not when: the step is genuinely irreversible once confirmed (a sent transfer); say so up front instead
- Trade-off: undo needs soft-delete or delayed execution in the backend
- Check: heuristic_eval H-03

### RX-IX-04 [Required] Protect high-impact actions by reasoning

- Do: Weigh each destructive or costly action: is it reversible, how big is the impact, how easy is recovery? Prefer undo for reversible actions; confirm with the specifics (amount, recipient, item) when it is irreversible and costly; skip confirmation when it only adds friction.
  - A confirmation restates the request and its effect ("Hapus 3 foto dari album Liburan? Foto tidak bisa dikembalikan."), and its buttons name the outcomes ("Hapus foto" and "Batal"), never Ya/Tidak or OK.
  - While a confirmation is open it is the only control for that action: the button that opened it steps aside, and the confirming button repeats the trigger's label ("Publish changes", not "Publish now").
  - Give a destructive confirmation no default button; ask for typing a word only for the rarest, most dangerous actions.
  - A destructive action is never the screen's primary button. When an item is gone (sold, expired, removed by someone else), the primary action leads on (similar items, back to browsing), removing it is secondary, and counts and badges already show the change.
- Do not: Confirm every action by reflex, use a bare "Are you sure?" before a payment, or leave the trigger beside its confirmation under another name.
- Why: Confirmation that appears everywhere gets dismissed by habit; specifics and undo catch real mistakes. Two buttons for one action, under two names, make people wonder whether they differ. (Nielsen heuristic 5; NNGroup confirmation-dialog guidance; owner review of the RYUX editor, 2026-10-29: editing a published flow showed "Publish changes" and "Publish now" at once; owner blind review 2026-11-18 of three Rak flows (secondhand books, Yogyakarta): a sold book left the bag badge at 1 and made "Remove from bag" the primary button)
- Not when: reversible, low-impact actions where undo is enough
- Trade-off: one extra step versus irreversible loss
- Check: heuristic_eval H-05

### RX-IX-05 [Required] Full cost before commitment

- Do: Show items, shipping, admin fees, and tax as a breakdown and total before the user commits.
  - From the step where the user first holds a choice (a seat held, an item in the bag), the price shown includes its fees, or names the fee as a line to confirm; the pay step only repeats it.
  - The confirmation repeats the total and says how it is paid, so the person knows whether it is settled or what to have ready ("Bayar ke terapis setelah sesi"). When the brief does not set the method, show a neutral, likely one as sample data instead of leaving the line out (a gap ships; a marked sample gets decided): no brand the brief did not name, and the same sample marker the file uses for every other sample value (one component or style, findable before release), as RX-PR-05 does for payment methods the brief does not name.
- Do not: Reveal fees for the first time on the final step, show a held choice's price without its fees until the pay step, or confirm an order without saying how it is paid.
- Why: Unexpected extra costs are among the most reported reasons for abandoning checkout. (Baymard checkout usability research; NNGroup e-commerce research; owner review 2026-11-15 of a concert-ticket flow (Panggung, RYUX 2.22.12, OpenCode with DeepSeek, one run; a DeepSeek review, not blind, checked by hand against the exports): the service fee first appeared on the pay step; owner blind rating 2026-11-24 (Rawat r4, FigCraft three-screen booking bench): confirmations with no payment method marked down, "Bayar setelah sesi" and "Lunas via GoPay" praised; owner chose sample data over leaving the method out)
- Not when: prices are not known until a later choice (shipping before an address); show an estimate and say when it is final
- Trade-off: a full breakdown adds lines to a small screen
- Check: review

### RX-IX-09 [Contextual] QRIS: amount and merchant first

- When: the flow takes a QRIS payment
- Do: Show the amount and the merchant name before the user scans or confirms, and the paid status afterwards. A payment called QRIS shows the QR code; "approve it in your banking app" with no code is a push or virtual-account flow, not QRIS.
  - When the user pays on the same phone that shows the code, the QR stays on screen with a way to save or share it, and the apps that can pay it are named; a deep link to one app is an addition, not the payment.
- Do not: Show a QR code without the amount or the merchant, or send a same-phone QRIS payment to "open your banking app" with no QR to scan or save.
- Why: Users check who they are paying and how much before they pay. (QRIS standard (Bank Indonesia); ryux reference screens; owner review 2026-11-16 of a secondhand-book flow (Rak, RYUX with #78, OpenCode with DeepSeek, one run): the paying screen said "Open banking app" and showed no QR; owner blind review 2026-11-18 of three Rak flows (secondhand books, Yogyakarta): one flow chose QRIS and then asked the user to approve in a banking app, with no QR shown)
- Not when: a static QRIS printed for any amount, where the user types the amount; show the merchant name
- Trade-off: an extra confirmation step before the code
- Check: search_screens qris

### RX-IX-10 [Contextual] Virtual account: copy, deadline, steps

- When: the flow pays by virtual account
- Do: Give a copy button for the VA number, the payment deadline, and per-bank steps.
- Do not: Show a VA number with no copy button or no deadline.
- Why: Users switch to their banking app and need the number and steps at hand. (ryux reference screens)
- Not when: the app pays the VA itself in one step (auto-debit)
- Trade-off: per-bank steps make the screen longer
- Check: search_screens virtual-account

### RX-IX-11 [Contextual] Paylater and installments in full

- When: the flow offers paylater or installments
- Do: Show the limit, the tenor options, and the total cost including interest and fees before commitment.
- Do not: Show only the monthly amount.
- Why: Credit decisions need the full cost to be informed ones. (OJK consumer-protection disclosure expectations)
- Not when: a single full payment with no credit involved
- Trade-off: the full cost can discourage a purchase; that is the point of disclosure
- Check: review

### RX-IX-12 [Required] Every control leads somewhere real

- Do: Give every link, button, tab, menu item, and form a destination or an effect that exists: a page or section that is there, an action that runs. A control whose target is not built yet is removed, or shown disabled with the reason.
  - An option that promises what comes next ("Isi data kartu di halaman ini") shows it in place when chosen.
- Do not: Ship navigation to sections that do not exist, buttons that do nothing, or forms that pretend to submit.
- Why: A dead control breaks trust the moment someone tries it, and it hides what the product really does. (pattern also in anti-slop (MIT) R-24, R-26; NNGroup progressive disclosure (the secondary part appears when asked for); owner blind rating 2026-11-21: a card option promised a form that never appeared; written for RYUX)
- Check: click every control in the render, and pick every option that promises a next step; review
- Machine check: `ryux scan` flags in .jsx, .tsx, and .html: a link to "#", "", or javascript: with no click handler, or an empty click handler (onClick={() => {}}); not with spread props, not in a directions preview (directions.html), and in HTML only on a page with no script; once per file (warn); in .jsx, .tsx, and .html: a <button> with a bare disabled (not an expression) and no title or aria-describedby saying why; not with spread props, and in HTML only on a page with no script; once per file (warn)

### RX-IX-13 [Required] Each transition means one thing

- Do: Choose how a screen arrives by what it means, and keep that meaning across the product:
  - push to go one level deeper (back returns)
  - replace to move to a new stage (back does not return to the old one)
  - a modal for a self-contained task the user finishes or cancels
  - a sheet for a short interruption that keeps the screen behind it in view
  - Follow the platform's back gesture and button.
- Do not: Open the same kind of screen as a push in one place and a modal in another, push a step the user can never usefully go back to, or put a long multi-step task in a sheet.
- Why: People predict where back goes from how a screen arrived; a mixed model makes every exit a guess. (Apple HIG and Material navigation; pattern also in appllama-app-design-skill (MIT), navigation semantics; written for RYUX)
- Check: review the flow map; click back on every screen in the render

### RX-IX-14 [Required] One-way doors

- Do: Once a payment, submission, or onboarding is complete, the result screen replaces the flow: back goes to where the user started, never into the finished steps. Block back only in two cases, while a request is in flight and while there is unsaved work, and say why on the screen ("Processing payment, please wait", or a discard confirmation).
- Do not: Let back reopen a paid checkout or a submitted form, or block back for any other reason.
- Why: Going back into a finished payment invites a double charge or a confused resubmission; blocking back without a reason feels like a trap. (Nielsen heuristic 3; pattern also in appllama-app-design-skill (MIT), one-way doors; written for RYUX)
- Not when: a draft the user can reopen and edit on purpose
- Check: walk the flow and press back on each step, including after completion

### RX-IX-15 [Contextual] Gestures follow the finger

- When: the design uses direct manipulation: drag, swipe, pull to refresh, a draggable sheet or card
- Do: Track the finger from where the element is, keep the release velocity when the user lets go, let the user catch it again mid-animation, resist with a rubber band at the edges, and use one set of spring values across the product.
- Do not: Jump to a fixed start point when the gesture begins, ignore how fast the user flicked, or lock the element until its animation ends.
- Why: A gesture that keeps up with the hand feels like moving a real object; one that lags or snaps feels broken. (Apple HIG gestures; pattern also in appllama-app-design-skill (MIT), gestures; written for RYUX)
- Check: record the gesture and step through the frames (capabilities/qa.md)

### RX-IX-16 [Contextual] Haptics as punctuation

- When: the product runs as a native mobile app with haptic feedback
- Do: Use at most one haptic per action, at the same moment as its visual change, for meaningful moments (a payment confirmed, a toggle set, an error), and follow the system setting.
- Do not: Make haptics the only feedback, fire them while scrolling or on repeated events, or stack several for one action.
- Why: Haptics confirm what the eye already sees; used constantly they become noise and drain attention. (Apple HIG playing haptics; pattern also in appllama-app-design-skill (MIT); written for RYUX)
- Check: review the interaction spec

### RX-IX-17 [Preferred] Choices that change the price sit with the price

- When: a screen shows a total that the user's choices change: payment method, insurance, delivery or service tier, add-ons
- Do: Show each price-changing choice with its current value and its cost inline on the screen that shows the total, so the user sees what they pay for before they confirm.
  - Each choice is made once: the next step shows the chosen value with a way to change it, and does not ask again (a payment method picked at checkout is not offered again in the pay sheet).
  - The screen where the total is confirmed shows every choice behind it, including one made earlier (the courier chosen in the bag is a line at checkout).
  - When the brief sets no cost for an option the market usually charges for (a virtual account fee, cash on delivery, a faster courier), do not leave it out: an option with no cost reads as free. Ask when the answer changes the flow; in a prototype, show the cost with a sample label beside it ("Biaya contoh") and the summary row it adds (RX-PR-02).
- Do not: Hide a choice that changes the price behind a list row or a later screen, show the total without the choices that make it up, or ask for the same choice on two steps in a row.
- Why: People check a total against the choices behind it; a cost they cannot see next to the total reads as a surprise fee. (ryux run: blind review of a delivery checkout 2026-10-20; NNGroup visual hierarchy; owner review 2026-11-16 of a secondhand-book flow (Rak, RYUX with #78, OpenCode with DeepSeek, one run): the payment method was chosen at checkout and offered again in the pay sheet, and the courier chosen in the bag was not shown at checkout; owner blind rating 2026-11-20 of the front-end build bench (Next.js checkout, three runs per arm): all three RYUX runs left the virtual account fee out because the brief set none, and the owner read the missing fee as a gap, where the no-skill runs showed it (unlabelled); written for RYUX)
- Not when: a single fixed price with no choices on the screen
- Trade-off: a longer checkout screen; group the choices so the total stays visible
- Check: review the checkout render: every price-changing choice visible next to the total; every option the market charges for shows its cost, sourced or labelled sample beside it
