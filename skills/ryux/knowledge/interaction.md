# Interaction design

Designs what happens when people act: feedback, confirmation, undo, states, and local payments such as QRIS and virtual accounts.

> Group UX · Delivery Gate area UX · RYUX 2.3.2. Levels are defined in `SKILL.md`.

Define every meaningful action in four parts before implementing it:

| Phase | Question |
| --- | --- |
| Before | What tells the user this action exists, what it will do, and what it costs? |
| During | What do they see while it runs (pressed state, loading, progress)? |
| Result | How do they know it worked, and what changed? |
| Recovery | If it fails or was a mistake, how do they undo, retry, or get help? |

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

Does not cover: form-specific behavior (see `knowledge/forms.md`).

## Evidence from RYUX Knowledge

How local apps handle the same action and its states, and local payment patterns: `search_screens`, `get_local_pattern` (qris, virtual-account, paylater). Without the ryux MCP, say the evidence comes from the design and standards alone.

> Hard Gates always apply, whichever skills are loaded: no invented numbers, people, urgency, business
> rules, or terms; no placeholder shipped as final; no missing critical states. See `SKILL.md`.

## Rules

### RX-IX-01 [Required] [Hard Gate] Before, during, result, recovery

- Do: For each meaningful action, decide what the user sees before acting, while it runs, when it finishes, and how they recover if it fails.
- Do not: Ship an action whose in-progress, result, or failure behavior is undefined.
- Why: Undefined behavior becomes inconsistent behavior once it is implemented. (Nielsen heuristics 1 and 9; ryux interaction model)
- Not when: trivial actions with no wait and no failure mode (toggling a local view)
- Trade-off: more states to design, build, and test
- Check: review

### RX-IX-02 [Required] Feedback that matches the wait

- Do: Give an immediate pressed state; past about 1 second show a loading indicator; past about 10 seconds show progress with an estimate or let the user leave and come back.
- Do not: Let a payment or save run with no visible status.
- Why: Silence during a wait reads as failure and invites double taps. (Nielsen response-time limits (0.1 / 1 / 10 s); Nielsen heuristic 1)
- Not when: instant actions under about 0.1 s; a spinner that flashes is noise
- Trade-off: progress indicators need real progress data; a fake bar misleads
- Check: heuristic_eval H-01

### RX-IX-03 [Required] Cancel, back, and undo

- Do: Let users cancel, go back, or undo without losing their work; where a step is genuinely irreversible, say so before it.
- Do not: Trap users in a flow with no exit.
- Why: Freedom to back out makes people willing to explore. (Nielsen heuristic 3 (1994))
- Not when: the step is genuinely irreversible once confirmed (a sent transfer); say so up front instead
- Trade-off: undo needs soft-delete or delayed execution in the backend
- Check: heuristic_eval H-03

### RX-IX-04 [Required] Protect high-impact actions by reasoning

- Do: Weigh each destructive or costly action: is it reversible, how big is the impact, how easy is recovery? Prefer undo for reversible actions; confirm with the specifics (amount, recipient, item) when it is irreversible and costly; skip confirmation when it only adds friction.
- Do not: Confirm every action by reflex, or use a bare "Are you sure?" before a payment.
- Why: Confirmation that appears everywhere gets dismissed by habit; specifics and undo catch real mistakes. (Nielsen heuristic 5; NNGroup confirmation-dialog guidance)
- Not when: reversible, low-impact actions where undo is enough
- Trade-off: one extra step versus irreversible loss
- Check: heuristic_eval H-05

### RX-IX-05 [Required] Full cost before commitment

- Do: Show items, shipping, admin fees, and tax as a breakdown and total before the user commits.
- Do not: Reveal fees for the first time on the final step.
- Why: Unexpected extra costs are among the most reported reasons for abandoning checkout. (Baymard checkout usability research; NNGroup e-commerce research)
- Not when: prices are not known until a later choice (shipping before an address); show an estimate and say when it is final
- Trade-off: a full breakdown adds lines to a small screen
- Check: review

### RX-IX-09 [Contextual] QRIS: amount and merchant first

- When: the flow takes a QRIS payment
- Do: Show the amount and the merchant name before the user scans or confirms, and the paid status afterwards.
- Do not: Show a QR code without the amount or the merchant.
- Why: Users check who they are paying and how much before they pay. (QRIS standard (Bank Indonesia); ryux reference screens)
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
