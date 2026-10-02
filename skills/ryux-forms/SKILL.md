---
name: ryux-forms
description: "Ryux Forms: labels, layout, validation, input preservation, autofill, submission, unsaved work, OTP, address, e-KYC. Load when building or reviewing any form."
---

# ryux-forms: Forms

> Group UX · Delivery Gate area UX · RX-2.0. Levels are defined in `ryux-core`.

A form is a conversation. Design it field by field, then as a whole.

- **Grouping**: related fields together, with a group label when there are more than a few.
- **Labels**: visible and tied to the field; placeholders are examples, not labels.
- **Layout**: one column for sequential input is the default; put short related fields side by
  side when people read them as one unit. Decide by relationship, not by filling width.
- **Required and optional**: mark whichever is less common.
- **Validation timing**: validate a field after the user leaves it or when the format is clear;
  never erase what they typed.
- **Defaults and autofill**: prefill what you know; set autocomplete and inputmode.
- **Multi-step**: show the step, allow going back without losing data.
- **Unsaved changes**: autosave with a visible status, or warn before discarding.
- **Submission**: prevent double submits, show progress, then success with what happens next, or
  failure with input kept and a retry.

Does not cover: general interaction states (see ryux-interaction) or error copy wording (see
ryux-content).

## Evidence from Ryux Knowledge

Real Indonesian forms for the same data (address, OTP, e-KYC): `search_screens`, `get_local_pattern` (otp, address, e-kyc). Without the ryux MCP, say the evidence comes from the design and standards alone.

> Hard Gates always apply, whichever skills are loaded: no invented numbers, people, urgency, business
> rules, or terms; no placeholder shipped as final; no missing critical states. See `ryux-core`.

## Rules

### RX-FM-01 [Required] Visible labels tied to fields

- Do: Give each field a label tied to it, visible unless the context already names it (a lone search box beside a labeled button).
- Do not: Use placeholder text as the only label.
- Why: Placeholder labels vanish while typing and are often not announced. (NNGroup form-design research; WCAG 2.2 SC 1.3.1 and 3.3.2)
- Not when: a lone search field beside a labeled button, where context names it; still give it an accessible name
- Trade-off: labels above fields make the form taller
- Check: review

### RX-FM-02 [Preferred] Layout by relationship

- Do: Default to one column for sequential input, and place short related fields together (date parts, city and postal code) when that matches how people read them.
- Do not: Spread unrelated fields across columns to fill width.
- Why: Reading order should match filling order; related fields read as one unit. (NNGroup form-design research)
- Not when: short related fields people read as one unit (date parts, city and postal code)
- Trade-off: one column makes longer pages
- Check: review

### RX-FM-03 [Required] Validate near the field, keep the input

- Do: Validate close to the field when it helps, and keep everything the user typed when something fails.
- Do not: Clear the form or only report errors after a full submit.
- Why: Re-entering data is the most frustrating part of a failed form. (NNGroup inline-validation research)
- Not when: while the user is still typing; validate after they leave the field or the format is complete
- Trade-off: early validation can nag; late validation can surprise
- Check: review

### RX-FM-04 [Preferred] Fewest fields

- Do: Ask only for what the task needs, mark the less common case (optional or required), and prefill sensible defaults.
- Do not: Ask for data the task does not use, or mark every field required by default.
- Why: Each extra field adds effort and a chance to quit. (NNGroup form-design research)
- Not when: regulation or the business genuinely needs the data (e-KYC); explain why it is asked
- Trade-off: fewer fields up front can mean asking later
- Check: review

### RX-FM-05 [Preferred] The right keyboard and autofill

- Do: Match the keyboard to the input (numeric for amounts, phone numbers, and OTP) and support autofill and paste.
- Do not: Show a text keyboard for numbers or block pasting codes.
- Why: The right keyboard removes taps and typos on phones. (HTML inputmode and autocomplete (one-time-code); platform input guidance)
- Not when: free-text fields where a restricted keyboard blocks valid input (names with punctuation)
- Trade-off: inputmode varies across browsers; test on real devices
- Check: review

### RX-FM-06 [Required] Submission states

- Do: On submit, prevent double submission, show progress, then show success with what happens next, or failure with the input kept and a retry.
- Do not: Leave the submit button live during a request or end on a blank screen.
- Why: Submission is where users lose work and trust. (Nielsen heuristics 1 and 9)
- Not when: instant local saves with no network round trip
- Trade-off: more states to build and test
- Check: review

### RX-FM-07 [Contextual] Protect unsaved work

- When: a form holds work the user can lose by navigating away or timing out
- Do: Autosave with a visible status, or warn before discarding changes.
- Do not: Discard edits silently.
- Why: Lost work is the most expensive form failure. (NNGroup guidance on data loss)
- Not when: the form autosaves reliably and shows it; a leave warning would be redundant
- Trade-off: autosave needs conflict handling; warnings can annoy if overused
- Check: review

### RX-FM-08 [Contextual] OTP: channel choice and paste

- When: the flow sends a one-time code
- Do: Offer SMS or WhatsApp, allow paste and autofill, and allow a resend after a short countdown.
- Do not: Lock users to one channel with a long, punishing countdown.
- Why: SMS delivery is unreliable for some users; WhatsApp is often the faster channel. (ryux reference screens)
- Not when: the channel is fixed by the provider or by regulation
- Trade-off: more channels mean more delivery paths to maintain
- Check: search_screens otp

### RX-FM-09 [Contextual] Addresses with landmarks

- When: the form collects a delivery address
- Do: Support landmarks, block or RT/RW, and courier notes alongside the map pin.
- Do not: Rely on a map pin alone.
- Why: Many Indonesian addresses are found by landmark rather than by street number. (ryux reference screens)
- Not when: delivery uses precise coordinates only (a pickup locker)
- Trade-off: more fields to fill
- Check: review

### RX-FM-10 [Contextual] e-KYC: reason and guidance first

- When: the flow asks for an ID card or selfie
- Do: Explain why the data is needed and show framing guidance before opening the camera.
- Do not: Open the camera with no reason and no guidance.
- Why: People share identity data more willingly, and with fewer retakes, when they know why and how. (UU PDP No. 27/2022 (transparency); ryux reference screens)
- Not when: a returning user who has already been verified
- Trade-off: an extra screen before the camera
- Check: review
