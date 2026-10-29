# RYUX showcase

> The [README](../README.md) shows the latest result. This page looks closely at one moment of it. Every other run is
> in [`benchmarks/`](benchmarks/README.md).

## Food delivery, designed in Figma (RYUX 2.19.4, one run per side)

The same brief went to a fresh agent with no skill, and to one with RYUX. The brief asks for order tracking with a
late order and an unavailable item, and sets no policy. No DESIGN.md was given; RYUX wrote one from the brief and two
references, asked its questions, then designed. Brief, method, and costs:
[`benchmarks/food-delivery-figma/`](benchmarks/food-delivery-figma/).

### One moment: an item is out of stock

**No skill.** Screens 03 and 04 decide the policy for the customer: a 2:41 reply timer, after which the shopper
picks the best match; the price difference "goes back to your wallet automatically"; "Don't replace, refund it"
pays out instantly. Screen 06 adds a Rp10.000 late voucher and a full refund for orders 30+ minutes late. The brief
said none of this, and the agent asked nothing.

<a href="https://github.com/ryuxdsgn/design-intelligence/releases/download/media/benchmarks--food-delivery-figma--runs--A2-page.jpg"><img src="https://github.com/ryuxdsgn/design-intelligence/releases/download/media/benchmarks--food-delivery-figma--runs--A2-page.jpg" alt="No skill: eight order-tracking screens; the item-unavailable sheet has a reply timer, an automatic refund to the wallet, and a pre-selected replacement; the late screen adds a voucher" width="100%"></a>

**With RYUX.** The order waits for the customer's choice. Sending shows progress and cannot be tapped twice; a failed
send says what happened and keeps the choice; dismissing the sheet decides nothing and pins it above the tracker.
What happens if nobody answers, and how a removed item is refunded, are tagged on screen as "Prototype rule, not
decided yet".

<a href="https://github.com/ryuxdsgn/design-intelligence/releases/download/media/benchmarks--food-delivery-figma--runs--B1-4-late-and-unavailable.jpg"><img src="https://github.com/ryuxdsgn/design-intelligence/releases/download/media/benchmarks--food-delivery-figma--runs--B1-4-late-and-unavailable.jpg" alt="With RYUX: running late, then the out-of-stock sheet in four states (decide, sending, failed with the choice kept, replaced with the new total) and the dismissed sheet pinned above the tracker; undecided rules carry a dashed prototype-rule tag" width="100%"></a>

### What RYUX missed

- "Contact courier" was on screen with no tag and no sheet behind it.
- A total of $48.95 against $42.75 of items implied fees with no line for them.
- The run cost $9.46 against $2.16, and took 24 minutes against 8.

The first two were fixed afterwards, in owner-requested rounds on a copy; the images above are the run as it left them.

## How far this goes

One run per side: what these runs did, not a rate. Counted by us from the runs' own renders, on one model. Not yet
rated by designers. With three runs per side in code, the same gap held: policies shown as fact, never given, 25
without a skill and 2 with RYUX in [order tracking](benchmarks/order-tracking/); 25 and 3 in
[wallet transaction detail](benchmarks/wallet-detail/).

Earlier showcases (Lumo transaction detail, the five-step case study, the designer rating rounds for RYUX 2.5–2.9)
are in [this page's history](https://github.com/ryuxdsgn/design-intelligence/blob/74674a8/docs/showcase.md).
