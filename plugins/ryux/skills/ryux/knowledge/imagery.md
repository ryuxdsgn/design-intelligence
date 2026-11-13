# Imagery and motion

Directs what a screen shows beyond its system: art direction, composition, expressive surfaces, motion, asset sourcing, and delight.

> Group UI · Delivery Gate area UI · RYUX 2.22.12. Levels are defined in `SKILL.md`.

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
system, in one world (RX-UI-32):
1. **Concept**: two or three alternatives first (capabilities/design.md, stage 3), then one. The idea
   comes from the product's world, not the category: its mechanic, the audience's objects and rituals,
   or their culture and place (RX-UI-26); it can be an object, an atmosphere, a material, or a
   movement. The category default (a terminal panel, a dashboard screenshot) is never the signature.
2. **Inventory** (RX-UI-27): the concept in one sentence ("this page is a boarding pass") and the parts
   the real thing has (a tear line, a barcode, a seat block, a gate time, a stub). The visitor's
   questions set the sections (RX-UX-13); the inventory gives each its form, down to the dividers.
3. **The hero does the job**: the concept object performs the core job with sample data (a boarding
   pass that turns a booking into a seat and a gate time).
4. **Signature and devices** (RX-UI-27): one element people remember, and two or three devices that do
   a job where they appear. The system repeats, the subject does not: a pattern, ground, or divider
   returns, and each section's focal visual has its own subject, two sections at most per subject.
   Devices are more than lines: data chips around the product (confirmed
   features, labeled sample data), annotations with leader lines, a stamp, shapes cut from the concept,
   a pattern, light and grain. Write their style like any illustration (RX-UI-17).
5. **Weight carrier** (RX-UI-29): make its asset first, read it alone (RX-UI-30), and build around it;
   one decisive type move and one dominant colour field from the concept. Cream or white with ink is
   a choice that needs a reason, never the fallback.
6. **Copy in the concept's language**: "Your seat is waiting at gate 4", not "Book your next trip
   today". Unknown facts go to the handoff notes, never a section of "to confirm" chips (RX-AS-03).
7. **System**: everything else stays consistent so the concept reads. Restraint means every element
   has a job, not that there are few: wide empty bands, small grey text, and no visual is unfinished.
The Liveliness you set (Design Direction) turns into these levers: one focal point per screen,
contrast in size and weight, whitespace that groups, one deliberate accent, and a motif the signature
repeats. Then three tests on the render. **Swap** (RX-AS-09): with a competitor's name and logo, would
anything need to change? **Skeleton**: without colour, type, and devices, is it the template order or
a stack of alternating splits (more than two same-skeleton sections in a row, or fewer than two
composition moves)? **Thumbnail**: shrunk to icon size, is the shape still recognisable? A strong
idea never needs invented numbers, people, or logos.

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

**Making images.** Use the first tool that can make the asset well, and say which:
1. the design tool: vector paths (in Figma, SVG through createNodeFromSvg), image fills with their
   filters, blend modes, and masks, and its image generation when it has credits
2. a local render, free: Blender from the command line for objects in light (metal, glass, packaging);
   Three.js in a headless browser for simple objects, gradients, and particles; export PNG at 2x and upload
3. an image API whose key the user gives (an environment variable, never in the repo): for photo-real
   scenes and heavy retouching; say the count and ask before paid generation
4. a licensed photo or the user's own, retouched
Recipes:
- **3D render**: subject with its defining parts; material (gold: high metallic, low roughness, warm
  reflections); one key light, a fill, and a rim; a camera at a named lens and angle; a background in the
  palette's colour, so the render sits on the page; a set shares light and camera.
- **Retouched photo**: cut out the subject (a background-removal model, or a mask); grade it to the
  palette (duotone, tint, or temperature, then contrast); add grain or the material's texture so it
  matches the page; never change what the product is, and label it retouched.
- **UI composite**: the product's screen with labeled sample data, large, at an angle or overlapped,
  with depth from the material (a soft shadow or glow), never invented features.
- **Photo and vector**: a real or licensed photo, cut out and graded to the palette, with drawn vector
  in one line weight and colour that touches it: a line that wraps the subject, a shape behind it, an
  annotation that points into it. The same pairing in every section.
**A set is one family** (RX-UI-18, RX-UI-30): write the asset spec first (medium, camera, light, scale,
staging, crop, grade), make the assets together, and lay them side by side before the page; the
subjects change, the treatment does not. Ornaments, dividers, and icons take the page's medium or
named mix (RX-UI-32).
Generated people never stand for customers (RX-AS-02).

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
  - Time each motion by its size and the distance it travels, then tune it to the motion personality: simple feedback (a toggle, a checkbox) about 100 ms; a component or a modal entering about 200 to 300 ms; 400 ms only for a large move across a large screen; near 500 ms, task UI reads as waiting. What leaves takes a little less than it took to enter. Ease out what enters; ease in or in-out can suit what leaves; linear only for loops and progress.
  - Match the motion to who started the change: a change the user made and is watching moves fast and short; a change they did not ask for (a new message, a background update) arrives slowly with little or no change of position, as a fade; only something they must act on now may move to catch the eye. Never shift text someone is reading.
  - One movement holds attention at a time: no two animations compete on screen. Items that enter together stagger by about 30 to 50 ms, the most important first, and the whole sequence stays within about 500 ms on task UI.
  - Animate a change the user would otherwise miss (a cart count far from the button they pressed), and let direction carry meaning: slide for forward and back in a process, zoom in to go deeper and out to go up a level, a sheet that rises can be pulled down. Motion never stands in for a visible label.
  - Hand motion off as a spec: per element, the trigger, the properties that change, the duration in ms (not frames), the delay, the easing in the platform's form (cubic-bezier for CSS, named curves on iOS and Android), and what reduced motion shows instead; a video supports the spec, it does not replace it.
- Do not: Animate everything, give a surface people open many times a day an entrance longer than about 250 ms or one they must wait for, move a tab indicator while the panel content snaps, freeze it with no transition at all when a short one would show where it came from, repeat a celebration, play an open-only keyframe animation on something people can close or reopen at any moment, use one generic duration and easing (transition: all 0.3s) everywhere, let decorative motion delay content or input, move data the user is reading (a balance, an amount, a table value) for effect, run two animations at once that compete for attention, slide or bounce in a change the user did not ask for, or hand off motion as a video alone.
- Why: Motion directs attention; unearned motion steals it from the task and can make some people unwell. (NNGroup animation and usability guidance; WCAG 2.3.3 animation from interactions; frequency check: pattern also in emilkowalski/skills (MIT) find-animation-opportunities; reversible open and close: pattern also in emilkowalski/skills (MIT) animate; default timing, press state, and still data: pattern also in appllama-app-design-skill (MIT); short transitions on frequent surfaces, content that moves with its control, and one celebration on rare moments: ryux owner blind ratings 2026-10-18 (explore-judge Part C, motion-loosen round 1) and hero-finance follow-up; durations by size and distance, shorter exits, easing, motion matched to who started the change, one movement at a time, change blindness, direction as meaning, and the motion spec in ms: NNGroup Animation Duration and Motion Characteristics (Laubheimer 2020), The Role of Animation and Motion in UX (Laubheimer 2020), and Animation for Attention and Comprehension (Harley 2014; motion captures attention: Pratt et al. 2010); stagger timing: Material motion, pattern also in owl-listener/designer-skills (MIT) motion-system; all written for RYUX)
- Not when: L1 feedback on standard controls that follows the platform defaults
- Trade-off: fewer flourishes on marketing pages
- Check: review; reduced-motion test; for a handoff, the motion spec per element
- Machine check: `ryux scan` flags a transition on all properties or on layout properties (width, height, top, left, margin, padding) (warn); a UI transition longer than 500 ms (warn)

### RX-UI-12 [Contextual] A point of view on expressive surfaces

- When: the surface is expressive: a hero, landing page, onboarding, empty state, or brand moment, or the brief asks for a new look or more personality; on a new product's task UI, the brand layer only (see Do)
- Do: Run Explore (capabilities/design.md, stage 3) with alternatives that each carry a name, a concept taken from the product's own idea (for a tool about evidence: receipts, citations, marks of proof), and a signature element (type, composition, imagery, or motion); then make the rest of the design serve the chosen signature and put its concept in the Visual Brief.
  - On task UI: the alternatives are structure hypotheses and the conventions that must hold stay fixed. A new product's brand layer must carry one signature from its own domain (a mark, the type voice, a colour temperature, or one brand moment in the flow), never a layout change and never decoration without a job (RX-AS-05). Record it in the Delivery Gate UI line.
  - When the brief names reference products, read each one before it shapes the alternatives: the principle you borrow, what stays theirs (colours, mascot, signature features), and where you use it. Carry the borrowed character at the strength the brief asks for: when it asks for a reference's feel (playful, chunky, gamified), the feel shows on every main screen, in type weight, shape, colour energy, and one brand moment, not only in a button detail. A reference's signature mechanics (a streak, a daily goal, a score) are unconfirmed capabilities: propose them, never show them as facts.
- Do not: Show alternatives that differ only in colour or copy, choose for the user without showing them, or let the signature be the category's default (for developer tools a terminal or agent-session panel; for SaaS a dashboard screenshot; copy on the left and product on the right), or relabel that default as a concept. A product screen can support the signature, not be it. Turn a named reference into adjectives ("calm, white, soft") or copy what belongs to its brand.
- Why: Users remember a product by its idea; a correct but generic surface is forgotten and could belong to any competitor. (brand and art direction practice; RX-UI-05 layout from content; rendered variants on named axes, compared side by side, chosen by the user: pattern also in emilkowalski/skills (MIT) prototype; fit first with craft as tie-break, pairwise with a runner-up: ryux owner blind ratings 2026-10-18 (judge round 1: weighting distinctiveness picked against the designer); written for RYUX; owner review of a no-skill vs RYUX run (2026-10-20): RYUX kept the reference's feel to one button detail; aesthetic-usability effect (Kurosu and Kashimura 1995): people judge a better-looking interface as easier to use, which can also hide its problems in a test)
- Not when: an existing product whose brand system already sets the brand layer, or a small change inside a fixed design system; follow it
- Trade-off: a strong idea takes a decision someone may disagree with; keep it honest and on brand
- Check: the swap test (RX-AS-09); review

### RX-UI-27 [Preferred] On an expressive surface, the concept shapes the page, not one card

- When: an expressive surface (a landing page, onboarding, a brand moment) with a chosen concept
- Do: Sections and their order come from the visitor's questions (RX-UX-13); the concept gives each its form from the concept's inventory (the parts the real thing has), and a generic section form needs a reason (knowledge/imagery.md, Expressive surfaces).
  - The hero's concept object does the product's core job with sample data, not a sample on display.
  - Devices: write three from the inventory, drop the one any product in the category would draw first (for gold: a coin, a bar, a scale, a ruler), and keep two or three, each naming the part of the inventory it comes from (one that names none is cut); each appears in three or more sections where it does a job (shows data, marks structure, leads to the next step); a decorative repeat counts once, and none sits between a message and its action.
  - The system repeats, the subject does not: what returns across sections is a pattern, a ground, a divider with meaning, a data form, or a rhythm, changing its role or form each time; each section's focal visual has its own subject (a scene, a figure, a moment of use), and one subject is the focal visual of two sections at most (a new angle or state of the same object counts as the same subject).
  - One decisive type move and one dominant colour field come from the concept.
  - Compose, do not stack: at most two same-skeleton sections in a row (text one side, a visual the other), and two or more composition moves (knowledge/ui.md, Direction grammar, Layout), each keeping the reading order and the path to the action.
  - Headlines in the concept's language; unknown facts go to the handoff notes, never a section of placeholders.
  - Before the gate, run the skeleton, swap, and thumbnail tests, with fresh eyes when a subagent is available (capabilities/design.md, stage 5).
- Do not: Let the concept add sections or set their order, put the concept in one hero card and build the rest from the template order, leave the page empty and call it restraint, repeat a device as a divider to reach a count, redraw the hero object as the focal visual of section after section, alternate text-left and text-right splits down the page, fill a section with "to confirm" chips or dashed boxes, or let a device or the concept invent a product fact (RX-AS-01, RX-PR-02).
- Why: A concept that lives in one card is decoration: the rest of the page is the same template every generated page uses, and that is what reads as AI-made. (Art direction practice (a concept carried as a system of forms and devices); landing-gold round 3 side-by-side read and owner trials T7 and T8, 2026-10-31: RYUX pages kept the concept in one card over a template order, then repeated one device as a divider and alternated split sections; owner review; landing-gold round 5, 2026-11-01: the same jar or ruler was the focal visual of three or four sections and read as monotonous (owner review), while the peer repeated a pattern or a scene break and changed the subject)
- Not when: task UI, where the structure stays familiar (RX-AS-09); a brand system that already defines the page
- Trade-off: a concept-shaped page takes longer and can overreach; each device still passes the purpose gate (RX-AS-05)
- Check: sections whose form comes from the concept (at least half), devices doing a job in three or more sections (decorative repeats counted once), the category's first-idea device dropped, same-skeleton sections in a row (two at most), composition moves (two or more), focal subjects per section listed (none focal in more than two sections), sections that are mostly placeholders (none), and the skeleton, swap, and thumbnail tests; report them in the Delivery Gate UI line

### RX-UI-29 [Preferred] An expressive page has one weight carrier, made at full strength

- When: an expressive surface (a landing page, onboarding, a brand moment)
- Do: Name what carries the page's visual weight and make it at full strength, its asset first and read alone (RX-UI-30): atmosphere (a colour field or mesh made as an asset), a photo or render (labeled when not real), the product's UI (half the hero width or more, layered, with depth), illustration (a set for this product, in the hero and two more sections), or display type (80px or more on desktop over a colour block).
  - Floor: the hero holds the carrier, not only text and buttons; a full-bleed non-neutral band or a dark and light switch (the base surface counts: coloured bands over a cream page are still a cream page); a named depth system; at most one text-only section; images in one family, each section with its own subject (a new angle of the same object is not a new subject, RX-UI-27).
  - The carrier never costs the task: the primary action visible on the first screen at desktop and at 390 by 844; nothing decorative between a message and its action; on mobile the hero visual pushes the next section at most one screen down; sample-data labels next to their figures; decorative layers hidden from assistive technology.
  - Write the carrier and the depth system into the direction block in DESIGN.md (capabilities/design.md, stage 1); all of it speaks the direction's world (RX-UI-32).
- Do not: Ship a hero of text and buttons with a small card beside it, set every band on one neutral surface, name a carrier and then draw it small or leave it out, or fall back to text because making an image or a vector takes longer.
- Why: A page with no weight carrier has nothing for the eye to land on; the reader sees layout and text, which is the look of every generated page, however correct its rules are. (Art direction practice; published design-language descriptions of five marketing sites (VoltAgent awesome-design-md, MIT): each puts its weight in one medium made at full strength; owner review 2026-10-31 of RYUX trials T1 to T4, all on cream or white with text and small cards, read as plain and AI-made)
- Not when: task UI; a brand system that already sets the page's look
- Trade-off: making the carrier's asset takes time and tool calls before the page, and a strong carrier can crowd the message if its focal point fights the headline
- Check: the primary action on the first screen at 1440 and 390 by 844; no decoration between a message and its action; sample-data labels next to their figures; no image used twice; the carrier named and present in the hero; full-bleed non-neutral bands or a mode switch (count); depth system named; text-only sections (at most one); report the carrier in the Delivery Gate UI line

### RX-UI-32 [Required] One page, one world

- When: an expressive surface built from a chosen direction
- Do: Hold the page to the direction's world:
  - every asset, device, and section shares the direction's material and light; an asset from another direction is reused only when its material matches, and a changed direction rebuilds from its new direction block
  - one medium for the page: flat 2D, 3D render, retouched photo, or UI composite, or one named mix with its binding, chosen with the direction:
    - photo and vector: the photo cut out and graded to the palette; the vector in one line weight and colour that touches, wraps, or annotates the photo, never floating beside it; the same pairing in every section
    - render and UI: the product's screens set into rendered devices as their textures, not flat vector phones beside renders
    - render and flat shapes: flat shapes only as ground and background, every object rendered, the render's light and shadow falling on the flat ground
    - ornaments, dividers, and icons take the page's medium; a mix without a name and a binding is two pages
  - plan the backgrounds as a rhythm before building: two or three surfaces in a repeating pattern, with the transitions designed
  - the concept runs through the page, not only the first and last section, as a system (material, pattern, ground, rhythm) while each section's focal subject changes (RX-UI-27)
  - the counts in RX-UI-27, RX-UI-29, and RX-UI-30 are minimums that serve the concept: an idea that fights unity is translated into the world's material, light, and shapes, and cut only when it cannot be; unity never lowers the carrier or the boldness the user chose
  - Before the gate, fresh eyes list the elements that look as if they came from another page; fix them.
- Do not: Make the page neat by making it timid, tick each rule with a different idea, carry a render from a rejected direction into the chosen one, set photoreal renders beside flat vector devices with nothing binding them, change the background world every section, or add a composition move only to reach a count.
- Why: A page that satisfies every rule with a different idea reads as a collage; people read unity as care and a collage as unfinished, however good each part is. (Art direction practice (unity of one surface); owner review 2026-10-31 of trial T8 (a render from the rejected direction and a new background world every section, read as disconnected) and trial T9 (with a cut-first version of this rule, neat but less creative); owner review 2026-11-02 of trial T11: renders, flat vector phones, and a flat roof-tile edge on one page read as undecided between 3D and 2D; a photo edited and paired with vector is a combination that holds when it is chosen and bound)
- Not when: task UI; a page that is deliberately a collage, where that is the chosen concept
- Trade-off: unity narrows choices and can cut an idea that is good on its own
- Check: the page's medium or named mix, with its binding, in the direction block; fresh-eyes list of elements from another page (none left); every asset's material and light matching the direction block; the background rhythm written before the build

### RX-UI-13 [Contextual] Source assets on purpose

- When: the design needs photos, illustration, 3D, icons, logos, or video
- Do: Pick each asset's source in this order: real product screens or the brand's own assets; standard marks of a confirmed fact, from their official source (RX-UI-28); a licensed library (one icon set, photos whose license you can name); a custom or generated asset made from the Visual Brief (the design tool's image generation when it has one) and labeled illustrative; otherwise a placeholder that looks like one (RX-AS-03). Record where each asset came from.
- Do not: Draw or imitate another company's logo (use its official file, RX-UI-28), invent the product's own mark (RX-AS-11), mix icon sets, use a photo you cannot license, or fill a gap with a generic stock scene.
- Why: Assets carry claims about the product and its users; an unsourced or borrowed asset is a claim nobody can back. (licensing and trademark practice; RX-UI-07; RX-AS-02)
- Not when: a wireframe or internal prototype where placeholders are expected
- Trade-off: real or licensed assets take longer than a stock search
- Check: asset list with sources; review

### RX-UI-28 [Preferred] Standard marks are used as they are, when their fact is confirmed

- When: the design shows where to get the app, how to pay, or who stands behind the product, and the brief, DESIGN.md, or the user confirms the fact, or the design needs real brands nobody has chosen yet (which banks offer a virtual account)
- Do: Use the official mark of a confirmed fact, from its owner, at its guideline size and clear space: store badges (App Store, Google Play) in the page's language; accepted payment marks (QRIS, confirmed banks, e-wallets, cards); a confirmed partner's or regulator's mark, with a handoff note that it needs the owner's permission; real platform chrome on device screens.
  - Ask for the files with the fact questions (RX-PR-13). Get each in this order: the user's file; the owner's brand or media kit page (found by searching, not guessed URLs); the platform's component library; a public archive that names source and license (Wikimedia Commons). Upload it as it is, and list every mark in the handoff: the mark, the file's source URL, its licence or terms, and "needs the brand owner's permission before launch" for a bank, partner, or regulator mark.
  - Brands nobody chose yet (the banks for a virtual account, the e-wallets offered): ask the user whether to show real brands with their logos or made-up names. When you cannot ask, use well-known real brands with their official logos and an open-rule label on the list (RX-AS-03); never a made-up name.
  - When no file works, ask the user before the build; only if they hand it back, a slot with the mark's exact shape, named for the file in its layer name, with a Placeholder annotation (on a marketing surface, the owner's name as plain text in the page's type instead of an empty slot, with the same annotation) and listed in the open tasks with its source. Never a text lookalike or a silent placeholder.
- Do not: Draw a text button in place of a store badge, redraw or recolour an official mark, or show an unconfirmed mark as a fact (a store the app is not on, a bank shown as a partner without an open-rule label): that is an invented claim (RX-PR-02).
- Why: People recognise standard marks faster than any label, and their absence makes a page look unfinished; drawn lookalikes read as fake. (App Store and Google Play badge guidelines; licensing and trademark practice (use the owner's file as provided); owner review 2026-10-31 of RYUX trials T1 and T2: store badges drawn as text pills, then partner logos left as empty slots after guessed URLs failed; owner decision 2026-11-06: QRIS and banks set as plain text in a payment run whose brief named QRIS; use the real logo, or ask the user; owner blind review 2026-11-09 of the PR #39 landing rerun: an empty UBS slot in the hero and a card read as a bug; owner decision: on a marketing page, the name as text with an annotation)
- Not when: a wireframe
- Trade-off: official files take a download and their rules (size, clear space, no recolouring) limit the layout
- Check: review: each mark tied to a confirmed fact and an official source; no drawn lookalikes; every slot left has a source to get it from and was asked for

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

### RX-UI-34 [Contextual] An animated scene tells one story

- When: the design animates a scene: a hero, a banner, an intro, an explainer, or an animated illustration (L4 in RX-UI-11)
- Do: Let the concept choose the motion: write what the scene says in one line, then pick the movement that shows that idea, not a device reused from another piece (something growing, things floating up).
  - Tie cause to effect at one spot: when something lands, the change happens where it landed, so the eye follows one chain instead of parallel events.
  - Use fewer elements than the still version would. Light the actor of each beat and quiet the rest; the actor stands in front, never behind the scenery.
  - Stage it as a story: the action resolves, a beat of stillness, then the message. Text never appears while things still move.
  - Keep the physical world honest: a held object sits in a hand with a pose that holds it, nothing floats; a character faces whoever they deal with and looks at the object in use; a seated figure has the chair back behind them and the desk in front along the way they face; people in conversation face each other.
  - Hold the moment of contact: a handover, a tap, or a catch rests about 0.2 to 0.3 s with the object in both hands before anything moves on, so it can be read.
  - One continuous movement (the sun crossing the sky, a vehicle along a road) is one segment with one easing; split into segments that each ease, it stalls at every joint.
  - A character leaves by an action the scene can show (walks back inside, the door closes), never by fading out in an open doorway.
  - Paths of moving elements stay clear of the controls on the piece (a pause button); place the controls where nothing passes.
  - A loop ends where it starts: the last frame flows into the first (an exit that wraps around, a staggered tidy-up), with no hard cut.
  - Step through the frames, or a recording, before handoff, and fix any floating object, wrong gaze, depth error, stall, collision with a control, or seam.
- Do not: Reuse one motion device across unrelated concepts, run several unrelated movements at once, show the closing line while the scene still moves, leave a held object floating, turn a character away from what they use, hide the beat's actor behind scenery, let a handover pass in a blink, split one continuous movement into eased segments, fade a character out of an open doorway, drive an element across a control, or cut a loop back to its start.
- Why: A scene is read as a story in a few seconds: one chain of cause and effect is followed, parallel motion reads as noise, and one physical error (a floating sheet of paper, a wrong gaze) is what people remember. (owner review 2026-11-02 of the README banner animation (held objects in a hand, gaze on the object, a seamless loop, furniture order in an isometric scene, the beat's actor in front); owner review 2026-11-05 of the Antar banner light test (a handover held about 0.05 s, the sun stalling between two eased segments, the customer fading out in an open doorway, the scooter passing over the pause button); NNGroup Animation for Attention and Comprehension (Harley 2014): motion captures attention, so one movement at a time; concept-led motion, cause at one spot, restraint, and resolve-pause-message: general motion-design and film staging practice, ideas also in iart-ai/generative-illustration-skills (no license given; no text or structure used); written for RYUX)
- Not when: UI transitions and feedback (RX-UI-11); a still illustration (RX-UI-24)
- Trade-off: checking frame by frame takes longer than watching the loop once
- Check: step through the frames or a recording; play the loop twice across the seam
