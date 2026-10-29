# Imagery and motion

Directs what a screen shows beyond its system: art direction, composition, expressive surfaces, motion, asset sourcing, and delight.

> Group UI · Delivery Gate area UI · RYUX 2.20.0. Levels are defined in `SKILL.md`.

**What a screen shows beyond its system.** Read this with `knowledge/ui.md` when the work has photos,
illustration, 3D, motion, or an expressive surface (hero, landing, onboarding, empty state, brand
moment). It works in three layers.

**1. Art direction.** Each visual has a job (RX-UI-07), its composition leaves room for the
content (RX-UI-09), and the visual language is chosen, not defaulted (RX-UI-10). Name the visual
language in a few words (editorial, product-centric, human, technical, playful, premium,
institutional) and its form (shape language, geometric or organic, flat or with depth).

**Composition exploration.** For an expressive surface, sketch three compositions of the chosen
direction (subject left, subject right, centered or full-bleed) as quick frames, then choose by
focal point, hierarchy, negative space, relation to the copy, and balance (RX-UI-09).

**Expressive surfaces** (hero, landing, onboarding, empty states, brand moments). Restraint keeps
task UI usable; on expressive surfaces it is only the floor. Work concept, then signature, then
system:
1. **Concept**: explore two or three alternatives first (name, concept, signature; capabilities/design.md, stage 3), then choose one. The idea
   comes from the product itself, not from the category: a tool about evidence might use receipts,
   citations, and marks of proof; a calm finance app might use the ledger. The category default
   (a terminal panel for developer tools, a dashboard screenshot for SaaS) is never the signature.
2. **Signature**: one element that carries the concept and that people would remember. Choose the
   lever: type (scale contrast, a distinctive face), composition (a broken grid, an unexpected
   crop, a large number), art direction, color temperature, motion personality, or copy voice.
3. **System**: everything else stays quiet and consistent so the signature reads.
The Liveliness you set (Design Direction) turns into these levers: one focal point per screen,
contrast in size and weight that builds the hierarchy, whitespace that groups, one deliberate
accent, and a motif the signature repeats. Low energy uses the same levers, quietly.
Then run the swap test (RX-AS-09): with a competitor's name and logo, would anything need to change?
If not, the surface has no point of view yet. Stay honest while being bold: a strong idea never
needs invented numbers, people, or logos.

**2. Motion.** Start from purpose: what the motion communicates; with no purpose, no motion.
Then ask how often someone will see it. The more often, the shorter and quieter it is, not absent:
what people open many times a day (a menu, a dropdown, tabs, list selection) gets a short transition
they can interrupt, about 150 to 250 ms of opacity with a small scale or a few pixels of movement
from its trigger; only a command palette or shortcut opened from the keyboard appears at once.
When a control changes what is shown (tabs, a segmented control, a filter), move the content with
it, not only the control: the indicator slides by transform, the old panel fades out while the new
one fades in and travels a few pixels in the same direction, together, in one easing. A tab whose
indicator moves while the panel snaps feels unfinished.
Expression is kept for occasional or first-time moments, and a rare moment such as a completed
payment may celebrate once: brief, never repeated, never moving the amount, a fade under reduced motion.
Every motion follows one lifecycle: before, trigger, transition, new state, feedback.
The states themselves (waiting, result, recovery) are defined in `knowledge/interaction.md` (RX-IX-01,
RX-IX-02); motion only makes them visible, and it never compensates for weak UX. Decide the trigger,
duration, easing, distance, opacity or scale, and how several elements are choreographed. Define
duration and easing once as motion tokens, and animate transform and opacity rather than layout
properties (width, height, top, margin), which cause jank. What opens and closes should be able to
reverse halfway: use transitions, not an open-only keyframe animation.

| Level | Examples | Needs |
| --- | --- | --- |
| L1 State feedback | button press, checkbox, toggle | starts on touch and lasts 100 to 150 ms; buttons and cards press to about 0.97 scale, list rows change background only |
| L2 Component transition | dropdown, modal, drawer, tooltip | shows where something came from or went: enters from about 0.95 scale with a fade (never from 0), exits faster along the same path, a menu grows from its trigger |
| L3 Page transition | navigation, route change | keeps the user oriented between places |
| L4 Storytelling | onboarding, product introduction, marketing | a message that is clearer moving than still |
| L5 Decorative | background particles, floating elements | a brand reason, and never delaying content or input |

Pick one **motion personality** per product and derive timing and easing from it:

| Trait | Calm (banking) | Energetic (game) |
| --- | --- | --- |
| Character | calm, precise | energetic, playful |
| Speed | moderate | fast |
| Easing | ease-out; default token `cubic-bezier(0.23, 1, 0.32, 1)` | spring |
| Movement | short, controlled | larger, expressive |
| Expression | subtle | high |

When neither the brief nor DESIGN.md sets the motion direction, start from Calm: the easing token
above, interface transitions under 300 ms, and no ease-in on anything that enters. Replace these
defaults as soon as the product sets its own. Data the user is reading (a balance, an amount, a
table value) does not move for effect. With reduced motion requested, large movement becomes a fade
or a cut (RX-A11Y-08).

**3. Visual production.** Decide where each asset comes from before making anything (RX-UI-13):

| Asset | First choice | Then | Never |
| --- | --- | --- | --- |
| Product visuals | real screens, labeled sample data | a rebuilt screen labeled illustrative | a fake dashboard shown as real |
| Photography | the brand's own shoot | a licensed library you can name | a stranger presented as a customer |
| Illustration and 3D | the brand's system | custom or generated from the brief, labeled | a generic character or blob unrelated to the product |
| Icons | the project's set | one set that matches the chosen icon style (for example Tabler, Iconoir, Phosphor, or Material Symbols), or a custom set drawn to that style | mixed sets, or one-off icons outside the style |
| Logos | official files from each owner; the product's own file (RX-AS-11) | a mark designed when the user asks for one (RX-UI-23); else the name in plain text, or [LOGO] | a redrawn, imitated, or invented logo nobody asked for; initials or an emoji as a mark; a generated favicon or app icon |
| Video | real product footage | a screen recording of the real product | stock footage implying use |
| Missing | a placeholder that looks like one (RX-AS-03) | | an invented stand-in |

Label every asset's provenance: observed (from the real product), sourced (licensed, with its
source), illustrative, generated, or inferred (a stand-in). See the evidence model in the router.

RYUX directs the generator; it is not the generator. Work context, goal,
audience, role, art direction, composition, then generate, critique the result against the brief,
and refine. A prompt without a brief is not art direction. Write the brief first:

```
# Visual Brief
Role:           its job (explain, orient, demonstrate, emotion, identity, context, story)
Objective:      what the viewer must understand or feel
Audience:       who sees it, in which context
Emotion:        the feeling, in two or three words
Concept:        the visual thesis, in one sentence
Subject:        what is shown (the product concept, not a generic person or device)
Visual language: editorial / product-centric / technical / ..., and the art direction
Form:           shape language, geometric or organic, depth
Illustration:   when there is any, its written style before the first drawing (RX-UI-17): line,
                shape, colour tokens, depth and detail, subject, characters, texture; and
                each asset's concept line (RX-UI-24)
Method:         SVG / generated raster / 3D / combined, why, and the tool you have (RX-UI-21)
Composition:    where the subject sits, and the space kept for copy
Color, material, lighting: from the product palette; surfaces; direction and softness
Motion:         level (L1 to L5) and personality
Output:         format, background, aspect ratios and sizes
Avoid:          the category clichés (for fintech: coins, money rain, floating dashboards)
Sources:        reference screen_ids or the analysis it came from
```

A generated image is illustrative art; never present it as a real customer or a real product
screen (RX-UI-07).

**Illustration.** Drawing it (each asset's concept, the written style, one family, the method,
the themed SVG, and the render-and-read check) lives in knowledge/illustration.md.

Does not cover: the visual system, hierarchy, type, and icons (see `knowledge/ui.md`), drawing illustration
(see knowledge/illustration.md), or component reuse and tokens (see `knowledge/design-system.md`).

## Evidence from RYUX Knowledge

How comparable products use imagery and motion: `search_screens` by pattern, `extract_design_direction` with the screen_ids behind it. Without the ryux MCP, say the evidence comes from the design and standards alone.

> Hard Gates always apply, whichever skills are loaded: no invented numbers, people, urgency, business
> rules, or terms; no placeholder shipped as final; no missing critical states. Labeled sample data is
> not an invented number; an unconfirmed capability is never presented as confirmed. See `SKILL.md`.

## Rules

### RX-UI-07 [Contextual] Imagery has a job and is what it claims

- When: the design uses photos, illustration, or 3D
- Do: Name each visual's job in one line: explain, orient, demonstrate, set the emotion, carry the identity, give context, or tell the story. Use real product screens or clearly illustrative art.
- Do not: Add a visual because the hero looks empty, or present a stock photo of a stranger, or a generated image, as a real customer or product screen.
- Why: A visual without a job competes with the content; borrowed faces and fake screens imply things that do not exist. (ryux run 2026-10-02: pen.dev landing without ryux; RX-AS-05 purpose gate)
- Not when: pure illustration that clearly is not a photo of a customer
- Trade-off: real product screenshots age quickly and need updating
- Check: review

### RX-UI-09 [Contextual] Composition leaves room for the content

- When: a visual sits next to or behind text or actions
- Do: Place the visual's focal point away from the headline and the primary action, keep text contrast over the image, and check the crop at every target width. On expressive surfaces, try three compositions first (subject left, subject right, centered or full-bleed) and choose by focal point, hierarchy, negative space, relation to the copy, and balance.
- Do not: Put the subject's focal point behind the headline, or let a crop cut the subject or the text at narrow widths.
- Why: The eye goes to the strongest focal point first; when it fights the headline, neither is read. (visual hierarchy (RX-UI-01); WCAG 1.4.3 contrast (RX-A11Y-01))
- Not when: a full-bleed visual with no text over it
- Trade-off: less freedom to place the subject
- Check: render at each width; review

### RX-UI-11 [Contextual] [Quality Lock] Motion earns its level

- When: the design adds motion or transitions
- Do: Classify each motion: L1 state feedback, L2 component transition, L3 page transition, L4 storytelling, L5 decorative; the higher the level, the stronger the reason it needs.
  - Weigh how often people see it: a surface opened many times a day (menu, dropdown, tabs, list selection) gets a short transition that can be interrupted, about 150 to 250 ms of opacity with a small scale or a few pixels of movement from its trigger, and only a keyboard-opened command palette or shortcut appears at once; standard transitions belong to occasional surfaces (modal, drawer, toast), and expression to rare or first-time moments, where a completed payment or a first success may celebrate once without moving the amount.
  - When a control changes what is shown (tabs, segmented control, filter), the content moves with it: the indicator slides by transform and the panels cross-fade with a few pixels of travel in the same direction, together.
  - Take timing and easing from one motion personality, define them once as motion tokens, animate transform and opacity rather than layout properties, and honor reduced motion (RX-A11Y-08).
  - Anything that opens and closes (menu, popover, dialog, drawer) uses transitions that can reverse halfway, so a close or reopen mid-animation turns back from where it is, and it closes no slower than it opened.
- Do not: Animate everything, give a surface people open many times a day an entrance longer than about 250 ms or one they must wait for, move a tab indicator while the panel content snaps, freeze it with no transition at all when a short one would show where it came from, repeat a celebration, play an open-only keyframe animation on something people can close or reopen at any moment, use one generic duration and easing (transition: all 0.3s) everywhere, let decorative motion delay content or input, or move data the user is reading (a balance, an amount, a table value) for effect.
- Why: Motion directs attention; unearned motion steals it from the task and can make some people unwell. (NNGroup animation and usability guidance; WCAG 2.3.3 animation from interactions; frequency check: pattern also in emilkowalski/skills (MIT) find-animation-opportunities; reversible open and close: pattern also in emilkowalski/skills (MIT) animate; default timing, press state, and still data: pattern also in appllama-app-design-skill (MIT); short transitions on frequent surfaces, content that moves with its control, and one celebration on rare moments: ryux owner blind ratings 2026-10-18 (explore-judge Part C, motion-loosen round 1) and hero-finance follow-up; all written for RYUX)
- Not when: L1 feedback on standard controls that follows the platform defaults
- Trade-off: fewer flourishes on marketing pages
- Check: review; reduced-motion test

### RX-UI-12 [Contextual] A point of view on expressive surfaces

- When: the surface is expressive: a hero, landing page, onboarding, empty state, or brand moment, or the brief asks for a new look or more personality; on a new product's task UI, the brand layer only (see Do)
- Do: Run Explore (capabilities/design.md, stage 3) with alternatives that each carry a name, a concept taken from the product's own idea (for a tool about evidence: receipts, citations, marks of proof), and a signature element (type, composition, imagery, or motion); then make the rest of the design serve the chosen signature and put its concept in the Visual Brief.
  - On task UI: the alternatives are structure hypotheses and the conventions that must hold stay fixed. A new product's brand layer must carry one signature from its own domain (a mark, the type voice, a colour temperature, or one brand moment in the flow), never a layout change and never decoration without a job (RX-AS-05). Record it in the Delivery Gate UI line.
  - When the brief names reference products, read each one before it shapes the alternatives: the principle you borrow, what stays theirs (colours, mascot, signature features), and where you use it. Carry the borrowed character at the strength the brief asks for: when it asks for a reference's feel (playful, chunky, gamified), the feel shows on every main screen, in type weight, shape, colour energy, and one brand moment, not only in a button detail. A reference's signature mechanics (a streak, a daily goal, a score) are unconfirmed capabilities: propose them, never show them as facts.
- Do not: Show alternatives that differ only in colour or copy, choose for the user without showing them, or let the signature be the category's default (for developer tools a terminal or agent-session panel; for SaaS a dashboard screenshot; copy on the left and product on the right), or relabel that default as a concept. A product screen can support the signature, not be it. Turn a named reference into adjectives ("calm, white, soft") or copy what belongs to its brand.
- Why: Users remember a product by its idea; a correct but generic surface is forgotten and could belong to any competitor. (brand and art direction practice; RX-UI-05 layout from content; rendered variants on named axes, compared side by side, chosen by the user: pattern also in emilkowalski/skills (MIT) prototype; fit first with craft as tie-break, pairwise with a runner-up: ryux owner blind ratings 2026-10-18 (judge round 1: weighting distinctiveness picked against the designer); written for RYUX; owner review of a no-skill vs RYUX run (2026-10-20): RYUX kept the reference's feel to one button detail)
- Not when: an existing product whose brand system already sets the brand layer, or a small change inside a fixed design system; follow it
- Trade-off: a strong idea takes a decision someone may disagree with; keep it honest and on brand
- Check: the swap test (RX-AS-09); review

### RX-UI-13 [Contextual] Source assets on purpose

- When: the design needs photos, illustration, 3D, icons, logos, or video
- Do: Pick each asset's source in this order: real product screens or the brand's own assets; a licensed library (one icon set, photos whose license you can name); a custom or generated asset made from the Visual Brief and labeled illustrative; otherwise a placeholder that looks like one (RX-AS-03). Record where each asset came from.
- Do not: Draw or imitate another company's logo, invent the product's own mark (RX-AS-11), mix icon sets, use a photo you cannot license, or fill a gap with a generic stock scene.
- Why: Assets carry claims about the product and its users; an unsourced or borrowed asset is a claim nobody can back. (licensing and trademark practice; RX-UI-07; RX-AS-02)
- Not when: a wireframe or internal prototype where placeholders are expected
- Trade-off: real or licensed assets take longer than a stock search
- Check: asset list with sources; review

### RX-UI-16 [Contextual] Delight stands on three legs

- When: the brief asks for delight, personality, or a memorable experience, or the design adds a moment meant to please (an animation, an illustration, a reward)
- Do: Build delight on all three of Norman's levels, in this order of dependence:
  - behavioral: the task is easier than the user expected; no delight covers a usability problem
  - visceral: the first impression comes from the brand layer (RX-UI-12), not from decoration without a job
  - reflective: the product speaks to the user's values and aims, not only the task ("membangun kebiasaan membaca", not only "target 8 halaman")
  - Read the user's state before adding joy: none in a payment failure, an error, a loss, or a long wait; there the delight is a fast, calm way out.
- Do not: Add confetti, mascots, or jokes to a flow that is still hard to use, or celebrate in a moment of failure or worry.
- Why: Delight on one leg is superficial and people remember the bad more than the good; forced joy at the wrong moment annoys. (NNGroup three pillars of user delight (visceral, behavioral, reflective; Norman, Emotional Design); NNGroup delightful UX video)
- Not when: a utility or internal tool whose brief asks for none; ease of use is its delight
- Trade-off: the reflective layer needs knowledge of what users value, which may need research
- Check: review; Critique Design Read

### RX-UI-23 [Contextual] A mark designed on request

- When: the user asks for a logo, wordmark, lettermark, app icon, or favicon
- Do: Brief first (capabilities/design.md, stage 1, at most three questions): the name, what the product does, the audience, the one idea the mark should carry, where it appears (app icon down to a 16 px favicon, the header, social avatars), and any brand assets or limits that exist.
  - Explore three directions that differ in the kind of mark (wordmark, lettermark or monogram, pictorial or abstract, combination), each with a concept from the product's own domain, not the category's cliché.
  - Build each as vector (SVG, RX-UI-21): geometric construction on a grid with few anchor points; a wordmark is adjusted (spacing, a modified letter), not the name typed in a font, and the typeface's license is named.
  - Keep the concept's character for the audience (warmth, energy, trust) in colour and form; take detail away only where small sizes need it, with a simplified favicon when the full mark breaks down.
  - An app icon is the mark on a full-bleed square tile in the brand colour; the platform applies the mask. One silhouette: no overlapping shapes that merge at 16 px.
  - Before handing off, render every direction's icon at 16, 32, and 256 px and the lockup on light and dark (a browser or an SVG converter), look at the renders, and fix what fails: legibility at 16 and 32 px, a one-colour version, black and reversed, a clear silhouette, the negative space, and square and round masks. Write the clear space and minimum size. A check you could not run is named, and that direction is not called ready.
  - Deliver: SVG in full colour, one colour, and reversed; app icon or favicon sizes when asked; a short usage note (clear space, minimum size, colours as tokens); a Decision Receipt; the user picks the direction.
  - Say plainly that similarity and trademark were not checked and that a trademark search is needed before use; never call a mark unique or safe.
- Do not: Use the default marks (initials in a circle, a swoosh, a globe, a generic leaf, a gradient blob), imitate another brand's mark, hand off a raster from an image model as the final file, show a single direction with no choice, ship an app icon with no tile, or hand off sizes you did not render and look at.
- Why: A generated mark drifts to the category's default and fails at small sizes; a mark nobody checked for similarity can collide with another company's. (Brand identity practice (mark types, small-size and one-colour tests, clear space); RX-AS-11; RX-UI-21; owner review 2026-10-24: request that RYUX design a logo when asked)
- Not when: the product already has a mark; use its file (RX-AS-11)
- Trade-off: three vector directions take longer than one generated image
- Check: the renders at 16, 32, and 256 px, light and dark, in one colour, inspected before handoff; review
