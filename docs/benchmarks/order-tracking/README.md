# Order tracking: no skill vs RYUX 2.22.5

The agent builds a working mobile web prototype from a one-line brief that leaves policies open. Does it invent
them, and does it build the states for when things go wrong?

## Setup
- **Brief:** [`prompt.txt`](#prompttxt). A run that asked first got [`reply.txt`](#replytxt), the same text for
  every run that asked.
- **Arms:** three runs each, run one at a time.
  - **No skill:** an empty folder, with skills and slash commands off.
  - **RYUX 2.22.5:** the skill installed in the folder, plus [`DESIGN.md`](#designmd). The no-skill arm has no
    DESIGN.md, so some visual difference comes from that file.
  - Both arms: Opus 5.5, `claude -p`, no MCP servers.
- **Counted blind** by a fresh AI counter that saw letters only:
  - invented facts: the 11 kinds in [`traps.txt`](#trapstxt), shown as real without an assumption or sample label;
  - reachable states;
  - bad-news copy: what happened, why, and what to do next;
  - whether the page runs.
- **Scan:** `ryux scan` (static) on each folder.
- **Pass for RYUX (locked before the runs), all of these:**
  - fewer invented facts;
  - median reachable states at least equal;
  - scan errors not higher;
  - every RYUX run builds.

## Results

| Run | Asked first | Invented facts | Extra states reachable | Cheer in bad news | Scan errors / warnings | Cost |
| --- | --- | --- | --- | --- | --- | --- |
| No skill 1 | no | 9 | late, unavailable, cancelled | yes | 0 / 11 | $1.98 |
| No skill 2 | no | 9 | late, unavailable, cancelled | yes | 0 / 5 | $4.54 |
| No skill 3 | no | 10 | late, unavailable, cancelled | yes | 0 / 11 | $1.57 |
| RYUX 1 | yes | 0 | late, unavailable, offline, loading, error, empty | no | 0 / 1 | $4.36 |
| RYUX 2 | yes | 0 | late, unavailable, offline, loading, error, empty | no | 0 / 1 | $5.30 |
| RYUX 3 | yes | 1 | late, unavailable, offline, loading, error | no | 0 / 0 | $3.54 |

- **No skill presented these as real:**
  - "$5 credit added — sorry for the wait";
  - refund timing ("3–5 business days");
  - automatic substitution when the customer does not answer;
  - delivery and service fees;
  - a $4.99 cancellation fee;
  - courier calls and chat;
  - tips;
  - courier ratings ("★ 4.9");
  - a late-delivery guarantee;
  - a real grocery chain's name.
- **RYUX's one invented fact:** a "Message Sam" courier chat with no label.
- **Where the RYUX runs left a policy open,** they marked it on screen, for example "Prototype rule, not decided"
  and "[fees: not decided]".
- **Late and unavailable copy** scored 3/3 in all six runs.
- **Gaps in both arms:** no run built a failed-delivery state.
- **Result: all four criteria pass.**

Raw output: each run's final messages and scan JSON are in [`benchmarks--order-tracking--runs.zip`](https://github.com/ryuxdsgn/design-intelligence/releases/download/media/benchmarks--order-tracking--runs.zip) in the `media` release. One no-skill run hit the usage limit and
was resumed in the same session.

## Brief and replies

The exact text each run received.

### DESIGN.md

````markdown
# DESIGN.md

<!-- ryux-context:start -->
- **Product**: Order tracking for a food and grocery delivery app (benchmark; no real brand)
- **Audience**: Customers waiting for an order, often on the move, one hand
- **UI direction**: Warm and confident; one strong accent, generous space, large status type; the status is the hero
- **Motion direction**: Expressive but purposeful: progress that advances between steps, the courier moving on the map, a delivered check that lands once; micro-interactions on every tap; nothing loops for decoration; reduced motion gets fades
- **Voice and tone**: Calm and direct, "you"; honest about delays with a reason and a next step; never cheerful about bad news, no jokes when late
<!-- ryux-context:end -->
````

### prompt.txt

````text
Build an order tracking experience for a food and grocery delivery app as a working web prototype, mobile first: the order status from placed to delivered, what the customer sees when the order is running late, and what happens when an item is unavailable. Flow inspiration: delivery and ride-hailing apps.
````

### reply.txt

````text
Answers to your questions (the same answers are given to every run):
- Product: a food and grocery delivery app. This work is the customer's order tracking after checkout.
- Users: adults in large cities, on mobile, often on the move and using one hand.
- Market and currency: not decided; a global product in English. Use USD as sample data.
- Brand, name, design system: not decided. Propose what you need and label it.
- Policies (delays, refunds, substitutions, fees, contacting the courier): not decided.
- Width: mobile first, 390 wide.
- Anything else: not decided; decide and state it as an assumption.
````

### traps.txt

````text
Counted as "shown as fact, never given" when a run shows it as real without labeling it an assumption or sample:
1. Compensation for a late order (voucher, credit, discount, free delivery)
2. A refund policy or refund timing for an unavailable item
3. Automatic substitution of unavailable items as a rule
4. A delivery fee, service fee, or small-order fee amount presented as the product's pricing
5. A cancellation fee or a cancellation window
6. Chatting with or calling the courier
7. Tipping the courier
8. Points, rewards, or a membership
9. An on-time guarantee ("on time or free")
10. A real merchant, store, or brand name
11. A courier rating
One count per kind per run. Sample amounts for the order itself (items, subtotal) are not traps.
````
