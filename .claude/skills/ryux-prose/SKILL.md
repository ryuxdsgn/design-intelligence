---
name: ryux-prose
description: Writing or revising this repo's public-facing text — the README, PR titles and bodies, benchmark docs, release notes, the GitHub description, replies on issues and discussions. Load before drafting or editing any of them. Carries the voice, the narrative arc, and the hard rules (claim scope, rater wording, no version labels) that public ryux text must keep.
---

# ryux-prose — how this repo speaks in public

This skill governs text people read on GitHub. It does not change the product skill
(`skills/ryux`), code, or internal docs.

## Voice

English, plain, specific. One mental model per surface; if a paragraph introduces a second
way to think about RYUX, cut one. Short sentences carry claims; long sentences carry
reasoning, never both at once. Translate jargon the first time it appears ("Delivery Gate —
the checklist a run must pass before it ships"), then use the term. Prefer the concrete
noun to the category: "a cashier tapping QRIS forty times a day", not "high-frequency users".

## The arc

Public text that reports work (a benchmark, a release note, a README section) tells one
story, in this order:

1. **The task someone faced.** Open in the scene, not the abstraction: what a designer or
   developer was trying to do, and what made it hard.
2. **What we did or tested.** The setup, blind where it was blind, with enough detail that
   a skeptic could rerun it.
3. **What happened, measured.** Numbers with their meaning attached: "3.97 vs 3.00, rated
   blind on visual craft" — never a bare score. A failure is reported as plainly as a win.
4. **What it means, and what is still open.** The honest ending: scope the conclusion to
   the evidence, name the next unknown.

A reader who stops after the first paragraph should leave with the true conclusion.

## Hard rules

These override style. Breaking one is a defect, not a choice.

- **Claims scope to evidence.** One screen never becomes "apps do X". One run never becomes
  "RYUX always". Count the evidence in the sentence that leans on it.
- **Rater wording.** In the README, ratings are "blind ratings by a senior designer"; the
  benchmark docs keep the fuller disclosure that the rater is the project owner and not
  independent — do not strip it. Never a plural raters claim until more than one human has
  rated.
- **No version labels in the README** or its images; versions live in docs/benchmarks and
  release notes only.
- **Never name a client's file, brand, or product.** "A client design file" is the ceiling.
- **No invented numbers, quotes, users, or urgency.** Sample data is labelled sample.
- **Failures ship.** A benchmark arm that lost, a criterion that failed, a feature that is
  untested — written in the same register as the wins.

## Structure survives the storytelling

Narrative replaces filler, not format. Tables stay tables; command listings stay code
blocks; a benchmark's criteria stay a list. Convert a list to prose only when it hides a
sequence of cause and effect — then the prose must keep every item. Never pad: if the
honest content is three sentences, the section is three sentences.

## PR titles and bodies

The title says what changed, in the imperative register the log already uses. The body
leads with the outcome ("## What" says what a reviewer will find, first sentence = the
change), then the reason, then "## Tested" with real results — counts, passes, and what
was *not* tested. No suspense, no journey, no "excited to".

## Words to strike on sight

Hype adjectives (revolutionary, blazingly, powerful, seamless), "simply" and "just" before
an instruction, exclamation marks outside quoted copy, emoji outside established page
names, "very" doing the work an exact number should do, and any sentence that praises RYUX
instead of showing a result.
