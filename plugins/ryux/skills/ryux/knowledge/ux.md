# UX architecture

Structures screens and flows so people find their way: information architecture, navigation, grouping, and progressive disclosure.

> Group UX · Delivery Gate area UX · RYUX 2.22.12. Levels are defined in `SKILL.md`.

Choose structure from the user's goal, not from a template.

- **Information architecture**: what objects and tasks exist, how users name them, and how they
  look for them (browse, search, or follow a notification).
- **Navigation**: the minimum set of destinations, named in the user's words. Where am I, and how
  do I get back?
- **Flows**: list the steps; remove steps that only serve the system. Multi-step flows show
  progress and a reviewable summary.
- **Grouping**: by meaning (task, time, status), with labels.
- **Progressive disclosure**: what the current decision needs first; rare options behind a
  clearly labeled control.
- **Search, filter, sort**: only when the content is long enough to need them, matching how
  users hunt.
- **Recovery paths**: every flow has a way back and a way out.

**Laws of UX, measured.** Critique and QA run these on every screen; a law is checked by what can
be counted or measured on the render, and a fail is a finding with the measured value as its evidence.
Miller's limit is about holding things in memory, not a cap on menu items.

| Law | Measure | Passes when | Rule |
| --- | --- | --- | --- |
| Fitts | the primary action's size, and its distance from what it acts on | 44 by 44 pt or more (48 dp on Android), every target 24 px or more; next to its content; on a phone, in thumb reach or a sticky bar | RX-A11Y-02, RX-RD-03 |
| Hick, choice overload | options in one decision, visible at once | one primary action; seven or fewer peer options, or grouped under labels | RX-PR-03 |
| Explicit differences | the attributes of peer options (services, plans, methods) | the attributes that differ come first, in the same order on every option; shared details in one line above | RX-UX-14 |
| Von Restorff | elements wearing the action colour or the strongest contrast | only the primary action, one per view | RX-UI-01, RX-UI-04 |
| Serial position | where the primary action and the key fact sit | on the first screen, and again at the end of a long page or list | RX-UX-13 |
| Proximity, common region, uniform connectedness | the gap inside a group against the gap between groups | the inside gap half the outside gap or less; a label closer to its own field than to the next | RX-UX-01, RX-FM-01 |
| Miller, chunking, working memory | long strings, and what the user must carry between screens | numbers grouped in threes or fours (a virtual account, a phone number); nothing carried in memory from one screen to the next | RX-UX-08 |
| Change blindness | values that change outside the element touched (a total, a count, a badge) | each one is next to its control, or marked where it lands (a short highlight or a number transition) | RX-IX-02 |
| Doherty, flow | time to visible feedback; interruptions | feedback under 400 ms, progress after about 1 s; no dialog interrupting a task that does not need it | RX-IX-02 |
| Information scent | the words on each link and button | each names where it leads or what it does; no "Selengkapnya", "Learn more", "Klik di sini", or a bare "Lanjut" when a specific action exists | RX-CD-12 |
| Jakob | where the logo, navigation, search, cart, and back sit | where the platform and the category put them, or a written reason | RX-DS-02 |
| Goal-gradient, Zeigarnik | progress in a multi-step task | steps done and steps left are shown | RX-UX-02 |
| Peak-end | the success and the failure ends | both designed: what happened and what to do next | RX-IX-01, RX-EC-01 |
| Tesler, Occam | the removal test on each element | removing it loses information or an action | RX-AS-05, RX-AS-06 |
| Postel, Parkinson | input formats accepted; fields the product could fill | spaces, dashes, and +62 or 0 accepted and normalised; known values filled | RX-FM-05 |
| Selective attention | how the key message is styled | not like an ad or a banner, not only in a rotating carousel | RX-AS-05 |
| Paradox of the active user | where help sits | inline at the point of need; no tutorial blocking first use | RX-CD-16 |
| Prägnanz | icons and marks at their smallest size | recognisable at 16 to 24 px | RX-UI-20 |
| Visual hierarchy, squint test | the render blurred (about 8 px) or seen at a quarter of its size | the three things that still stand out are Frame's "seen first", in that order | RX-UI-01 |
| Similarity | elements that share a colour, a shape, or a style | one meaning per shared colour or shape: a group's colour is not reused for something unrelated, and a picture wears the colour of the text it belongs to | RX-UI-04 |
| Natural mapping | each control's layout against what it changes | minus left of plus, earlier left of later, a slider or stepper moving the way its value grows, each control beside the thing it changes | RX-DS-02 |
| Cognitive bias | defaults, anchors, scarcity | no pre-ticked add-on, no invented anchor price, no invented scarcity | RX-AS-04 |
| Aesthetic-usability, Pareto | the test plan | judged on task success and time, not on liking the look; the top tasks tested first | RX-UX-12 |

Reason like a senior designer: a principle, where it applies, where it does not, and what it costs.

```
Rule:       Recognition over recall (RX-UX-08)
Context:    a complex enterprise form filled many times a day
Decision:   show previously selected values and recent entries
Trade-off:  higher visual density
Reason:     less memory burden in a repeated workflow
```

**Research methods, by question** (NNGroup). RYUX plans research; people run it. Pick the method from
the question, not from habit: what people do (behavioral) over what they say (attitudinal) for
usability; qualitative for why and how to fix, quantitative for how many and how much.

| Question | Phase | Method |
| --- | --- | --- |
| What problem do people have, in their own setting? | discover | field study, contextual inquiry, diary study, user interview |
| What does the business need, and what limits it? | discover | stakeholder interview, requirements and constraints |
| Is the core idea worth building? | discover | concept test |
| How do people group and name this content? | design | card sort (open: they name the groups; closed: yours) |
| Can people find things in this structure? | design | tree test (text-only hierarchy: success, directness, time) |
| Can people do the task with this design, and why do they fail? | design | qualitative usability test, moderated or unmoderated (RX-UX-12) |
| Which look fits the brand words? | design | desirability study (pick attributes for each alternative) |
| How good is it, against before or a competitor? | assess | usability benchmark (time, success, errors) |
| Which variant performs better in real use? | assess | A/B test, analytics, clickstream |
| How do many people feel about it? | assess | survey, customer feedback |

Most projects need more than one method. A single method, or none, is a choice to write down.

Does not cover: per-action behavior (see `knowledge/interaction.md`), forms (see `knowledge/forms.md`), or states
(see `knowledge/edge-cases.md`).

## Evidence from RYUX Knowledge

How Indonesian apps sequence and structure this flow: `get_flow` for a reference flow, `compare_apps` to compare steps across apps. Without the ryux MCP, say the evidence comes from the design and standards alone.

> Hard Gates always apply, whichever skills are loaded: no invented numbers, people, urgency, business
> rules, or terms; no placeholder shipped as final; no missing critical states. Labeled sample data is
> not an invented number; an unconfirmed capability is never presented as confirmed. See `SKILL.md`.

## Rules

### RX-UX-01 [Required] Structure from the user's goal

- Do: Choose the information architecture and pattern from what users come to do and how they look for it. Keep together what the user checks together, and show each fact once.
- Do not: Apply a stock SaaS layout (sidebar, KPI cards, table) because it is familiar, or show the same fact twice on one screen (the merchant or the amount in the summary and again in a row, the balance in the header and in a card).
- Why: The right structure depends on the task; a template answers a different question. A repeated fact costs reading time and leaves the user to wonder which one is right. (NNGroup information architecture research; Gestalt proximity and common region (Palmer 1992): items close together or in one container read as one group; ryux four-problems blind rating, rater 1 (product designer), 2026-10-16: repeated facts were a reason not to ship; Pareto principle (Juran, after Pareto): a few tasks carry most of the use, so they get the structure first; uniform connectedness (Palmer and Rock 1994): elements joined by a line or a shared fill read as related)
- Not when: the product already has an established structure users rely on; change it only with evidence
- Trade-off: a less familiar layout can cost users a moment of learning
- Check: review

### RX-UX-02 [Preferred] Where am I, what's left, how do I leave

- Do: Give each screen a clear title and keep a back or cancel path visible; in multi-step flows show the current step ("Langkah 2 dari 3") and a summary the user can review before committing. Show how close the goal is, and let an interrupted task resume where it stopped instead of starting over.
- Do not: Leave screens without a title or a way out, or run a multi-step flow with no sense of progress or review.
- Why: Orientation, progress, and an exit lower anxiety and abandonment. (NNGroup wayfinding and progress-indicator research; Nielsen heuristic 3; goal-gradient effect (Hull 1932; Kivetz, Urminsky and Zheng 2006): people speed up as the goal comes into view; Zeigarnik effect (Zeigarnik 1927): unfinished tasks stay on the mind, so a resumable task is less likely to be abandoned)
- Not when: a focused full-screen step such as payment in progress, where leaving would lose state; say how to cancel instead
- Trade-off: a persistent title and back path take vertical space on small screens
- Check: heuristic_eval H-03

### RX-UX-06 [Contextual] Search, filter, and sort that match the hunt

- When: a list or catalog is longer than a screen or two
- Do: Offer search, filters, or sorting that match how users look for items, show active filters, and give a one-step way to clear them.
- Do not: Add every possible filter, or hide which filters are applied.
- Why: Users narrow by the attributes they care about; invisible filters cause "missing" items. (NNGroup filtering and faceted search research)
- Not when: the list fits in a screen or two; filters slow down scanning
- Trade-off: each filter is UI to maintain and can hide items users expect to see
- Check: review

### RX-UX-07 [Contextual] Ask for sign-in when it is needed

- When: a flow asks for an account (checkout, saving, history)
- Do: Let users browse and build a cart first, then offer fast sign-in (OTP, WhatsApp, Google) or a guest path at the point it is needed.
- Do not: Force account creation before the user can see or try anything.
- Why: Early forced registration is a well-documented cause of abandonment. (NNGroup and Baymard checkout research)
- Not when: the core value requires an identity from the start (banking, a personal ledger)
- Trade-off: late sign-in can lose a cart or draft if it is not carried over
- Check: review

### RX-UX-08 [Preferred] Recognition over recall; the product carries the load

- Do: Show options and context (recent items, saved addresses, visible choices) instead of asking users to remember them.
  - Take over what users would otherwise read, remember, or decide: a smart default from the last choice, information they entered shown again where they need it, a picture where it is faster than text, and familiar patterns that need no learning.
  - Cut extraneous load (decoration, redundant links, meaningless type flourishes, a new pattern for a solved problem) and keep the intrinsic load, the content and decisions that are the task itself.
- Do not: Make users retype or recall information the app already has, or cut content the task needs to make the screen look lighter.
- Why: Working memory is small; every task the product takes over leaves more of it for the decisions that matter. (Nielsen heuristic 6 (1994); limited working memory (Miller 1956; Cowan 2001); NNGroup minimize cognitive load (intrinsic and extraneous load; avoid clutter, build on mental models, offload tasks))
- Not when: a one-time task, where showing history or saved values adds clutter
- Trade-off: higher visual density; more on screen to scan
- Check: heuristic_eval H-06

### RX-UX-10 [Required] Change what is broken, keep what works

- Do: Before changing an existing screen or flow, list what works today (from Analyze, the user, or analytics) and keep it. Every significant change names the problem it fixes and its evidence (a Critique finding, a user report, a metric); a pattern with no named problem stays as it is. Report what was kept as well as what changed.
- Do not: Replace a working layout, component, or interaction for novelty; restyle parts the brief did not ask to change; or treat "more modern" as a problem by itself.
- Why: A redesign that throws away what people already know costs them relearning and can make the product worse while looking newer. (ryux design principle (owner, 2026-10-19); Jakob's law (people expect a product to work like the ones they already know); ryux run: judge and motion benchmarks 2026-10-18; written for RYUX)
- Not when: a new product or screen with nothing to keep, or a brief that asks to replace the whole design
- Trade-off: a redesign can look less new; the gain is in fewer regressions and less relearning
- Check: the change list, each with its problem and evidence; the kept list; review

### RX-UX-11 [Contextual] Accelerators for frequent users

- When: people use the product often (daily payments, ordering, messaging, work tools)
- Do: Give frequent users faster paths that novices can ignore: recent and saved items, repeat order or transfer, defaults from the last choice, search that jumps to an action, and keyboard shortcuts or gestures where the platform has them.
  - Keep every accelerator a second path: the visible, standard path still works and stays the one a new user sees.
- Do not: Make a gesture or shortcut the only way to an action, or fill a first-time screen with power-user controls.
- Why: The same product serves first-time and daily users; accelerators save the daily user time without costing the newcomer clarity. (Nielsen heuristic 7 (flexibility and efficiency of use); NNGroup 10 usability heuristics)
- Not when: a one-off or rarely used flow (a sign-up, a yearly tax form)
- Trade-off: each accelerator is one more thing to design, test, and keep consistent
- Check: heuristic_eval H-07

### RX-UX-12 [Contextual] A test plan travels with the design

- When: the work is a new flow, a consequential change (payment, sign-up, navigation, a core task), or a recommendation on an open brief
- Do: Close the design or build with a usability test plan a person can run; RYUX prepares it, people run it. When the open question is not usability, name the method that answers it instead (a tree test for a navigation change, a concept test for an open idea, a desirability study for a look; knowledge/ux.md, research methods):
  - research questions: the open unknowns, the Frame success criteria, and the heuristic evaluation findings marked as needing a test
  - three to five task scenarios that are realistic, ask the participant to do something rather than describe it, and use none of the interface's labels or steps ("Kamu ingin membayar pesanan makan siang dengan saldo e-wallet", not "Ketuk Bayar lalu pilih GoPay")
  - participants: five per user group for a qualitative test; around forty when the goal is a number
  - a success measure per task, taken from the Frame criteria, and a satisfaction measure: the Single Ease Question after each task, the System Usability Scale for the whole, so releases can be compared
  - after launch: the metrics to watch (task success, time on task, errors, completion, support tickets) and the baseline to measure before release
  - Plan at least two rounds of test and fix; a result that changes the context or the criteria sends the work back to Understand or Frame.
  - Before a full design exists (a proposal or a direction), the Decision Receipt's Test field is the minimum plan: never close a recommendation without it.
- Do not: Claim the design was tested with users, present AI-simulated users as participants, or write tasks that name the buttons to tap.
- Why: Rules and heuristics find likely problems; only people using the design show which ones are real, and a baseline is what makes the after-launch number mean something. (NNGroup when to use which UX research methods (Rohrer 2022) and UX research cheat sheet (Farrell 2017): the method follows the question; NNGroup usability testing 101; NNGroup how many test users (5 per group, about 40 for quantitative); NNGroup Usability 101 (Nielsen): SEQ and SUS as the standard satisfaction measures; NNGroup task scenarios; NNGroup iterative design (at least three versions); NNGroup establishing baselines; NNGroup design thinking (test and implement))
- Not when: a small change (a colour, one label, spacing) or when the user says no test plan
- Trade-off: a plan nobody runs is only a list; say who should run it and when
- Check: review

### RX-UX-13 [Preferred] A page's sections answer the visitor's questions, in their order

- When: a marketing or landing page, onboarding, or any page read top to bottom to reach one decision
- Do: Before the layout, write the questions this visitor has, in the order they have them, from the audience and the page goal (RX-PR-13): for a first-time saver, "what is this?", "is it for someone like me?", "what do I get for a small amount?", "can I trust it?", "how do I start?".
  - Each section answers one question; a question the visitor does not have gets no section, and a section that answers none is cut.
  - The order of the questions is the order of the page; the primary action sits where the visitor is ready for it, and again at the end.
  - The visual concept gives each section its form (RX-UI-27); it never adds a section or changes the order.
  - When the answer that decides is a number nobody confirmed (the minimum buy, a price, a fee), ask for it with the fact questions (RX-PR-13); when no answer can come, answer the question with what is confirmed and no number, and put that number first in the handoff's open questions as what the visitor needs most. Never a made-up number (RX-PR-02).
- Do not: Start from the usual section list (hero, features, how it works, FAQ, call to action) and fill it, or let a visual idea decide which sections exist.
- Why: A page that follows a template answers questions nobody asked and skips the one that decides; the visitor's own questions are what make the structure specific to this product. (Content strategy and conversion practice (a page as the answer to the reader's questions in order); NNGroup inverted pyramid; landing-gold concept-system trial 2026-10-31: a concept carried into every section still sat on the template order, as an independent reviewer and the owner noted; serial position effect (Ebbinghaus 1885; Murdock 1962): people recall the first and last items of a sequence best, so the action sits early and again at the end; owner blind review 2026-11-08 of the Raja Emas landing rerun (RYUX 2.22.5, docs/benchmarks/landing-gold): no run showed a minimum buy (the brief confirmed none), and the owner named it the most important missing fact for small savers in three of four pages)
- Not when: task UI (a list, a form, a dashboard), where the user's task sets the structure (RX-UX-01)
- Trade-off: the order can differ from what the team expects to see; show the question list with the layout
- Check: review: the question list in Frame, and each section mapped to one question

### RX-UX-14 [Preferred] Options show what sets them apart

- When: the user picks between two or more peer options: services, plans, tiers, delivery or payment methods, design directions
- Do: Put the attributes that differ first and make them visible at a glance (price, what is included, time, the one limit); keep what every option shares in one line above the options, not repeated in each.
  - Show the same attributes in the same order on every option, so they compare row by row.
  - Mark a recommended option only when the brief or the evidence names one, and say why.
- Do not: Repeat the same feature list in every card so the differences hide in the middle, or make options look identical except for a name.
- Why: People weigh every trade-off only when the options are few and the differences are easy to see; when they have to hunt for the difference, they take the first option that seems good enough. (NNGroup psychology study guide: explicit differences, compensatory and noncompensatory decisions, satisficing; Hick's law and choice overload (RX-PR-03); written for RYUX)
- Not when: a single option, or options that differ only in one value the control already shows (a size picker, a time slot)
- Trade-off: shared details move out of the cards; a reader who reads only one card sees less
- Check: review: list each option's attributes; the differing ones come first and in the same order on every option

### RX-UX-15 [Preferred] A running total sits with the action it pays for

- When: a screen sums what the user picks (a cart, a booking, an order with quantities or add-ons) and ends in an action that commits to that sum
- Do: Show the total in the bar that holds the primary action, pinned to the bottom on a phone, and update it as the user picks; the line items and fees stay on the review screen or open from the total.
  - Say what the total covers when part of it is unknown ("+ biaya perbaikan setelah dicek"), next to the figure.
  - A summary above the list may repeat the choice, never the only place the total lives.
- Do not: Put the only total above the list it sums, where it moves as items are added and scrolls away from the button that commits to it.
- Why: People check the price at the moment they commit; a total next to the button is read with it, and one at the top must be remembered or scrolled back to, and loses its context as the list grows. (Gestalt proximity; Nielsen heuristics 1 (visibility of system status) and 6 (recognition rather than recall); Fitts's law (a pinned bar keeps the action in thumb reach, RX-RD-03); written for RYUX)
- Not when: one fixed price with no choices; a long statement or invoice read top to bottom
- Trade-off: a pinned bar takes vertical space on every scroll position
- Check: render at 390 with the most items the brief allows: the total and the primary action are visible together without scrolling

### RX-UX-16 [Preferred] What decides is shown; details open on demand

- When: a screen holds more than most users need at once: price breakdowns, terms, specifications, advanced settings, long explanations
- Do: Show what most users need to decide on the first level: the option's price, the total before commitment (RX-IX-05), and the one limit that changes the choice.
  - Put the rest one tap away behind a control that names what it opens ("Lihat rincian biaya", "Syarat pembatalan"), not "Selengkapnya" (RX-CD-12).
  - Two levels at most; when a third seems needed, simplify the content first.
  - Never hide a fee, a condition, or a cost the user will pay: disclosure postpones detail, it does not hide what decides.
- Do not: List every price, fee, and condition on the first screen of a choice, or hide a cost behind a disclosure until after the user has committed.
- Why: Fewer things on the first level make the important ones easier to see and the task faster; details stay available for the few who want them. (NNGroup Progressive Disclosure (Nielsen 2006): frequent needs first, two levels at most, a control labelled with what it reveals; Hick's law (more options, slower choice); owner review of the Sejuk bland test 2026-11-07 ("terlalu banyak menampilkan harga dari awal"))
- Not when: a review or receipt screen whose job is the full breakdown
- Trade-off: a detail behind a tap is missed by people who needed it; choose the split from what most users need
- Check: per screen: list what is on the first level and what is behind a control; each control names its contents; no third level; nothing the user pays is only behind the control before commitment

### RX-UX-17 [Preferred] The dominant usability quality follows the usage cadence

- Do: Name how often one person repeats this task, and let that pick the usability quality the design optimizes and the criteria test: learnability for a task done once or rarely (onboarding, e-KYC, a mortgage application), efficiency for a tool used daily (a cashier flow, an ops dashboard, an editor), memorability for a task people return to after months (an annual renewal, yearly tax, a report filed each quarter). Write the cadence and the chosen quality into the Frame criteria, and critique with that lens: a daily tool is judged on steps and time for the practiced user, a rare task on whether a first-timer succeeds unaided, a returning task on whether it works without remembering.
- Do not: Optimize every screen for the first-time user, judge a daily ops tool by its friendliness to beginners, or build a returned-to-after-a-year flow that relies on what users remember from last time.
- Why: Which usability quality matters most depends on how often the same person does the task; criteria that ignore the cadence praise the wrong design. (NNGroup Usability 101 (Nielsen): usability's five quality components (learnability, efficiency, memorability, errors, satisfaction) and their relative importance by product type — a yearly tax app leans on learnability, a daily professional tool on efficiency; owner review 2026-11-11; written for RYUX)
- Not when: the cadence is unknown and no evidence sets it: write it as an open question and design for the first use
- Trade-off: efficiency for the practiced user (density, accelerators) can cost the newcomer clarity; RX-UX-11 serves both
- Check: the Frame criteria name the cadence and the dominant quality; Critique weighs its findings with that lens
