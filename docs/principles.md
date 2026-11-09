# Design principles in RYUX

RYUX rules come from published design research and standards, not taste. Every rule in
[`design-rules.md`](./design-rules.md) ends with a **Why** line that names its source. This page lists those
principles and the rules that use them.

## How the agent uses them

- **In rules.** Each principle is part of a rule the agent reads for the task. For example,
  [RX-UX-08](./design-rules.md#rx-ux-08-preferred-recognition-over-recall-the-product-carries-the-load) is recognition over recall, and [RX-IX-01](./design-rules.md#rx-ix-01-required-hard-gate-before-during-result-recovery) is the peak-end rule.
- **In rationale.** In Design, every rationale line names the principle and how it works on that screen:
  *decision → because → principle → cost → would change if*. A rule ID alone does not count as a principle.
  Here is one annotation from a checkout run, as the agent wrote it (callout 4 in the Direction image of the [README](../README.md#no-skill-vs-ryux)):
  > It stays in the header and never sits behind prices or actions. Aesthetic and minimalist design: the task area stays plain.
- **In review.** Critique and QA check the laws below on the rendered screen. A failed law becomes a
  finding, with the measured value as its evidence.

## Laws of UX, measured

A law counts only when it can be counted or measured on the render.

| Law | Passes when | Rules |
| --- | --- | --- |
| Fitts | the primary action is 44 by 44 pt or more (48 dp on Android) and sits next to its content, in thumb reach on a phone | [RX-A11Y-02](./design-rules.md#rx-a11y-02-required-hard-gate-readable-text-reachable-targets), [RX-RD-03](./design-rules.md#rx-rd-03-required-safe-areas-and-thumb-reach) |
| Hick, choice overload | there is one primary action, and seven or fewer peer options, or they are grouped under labels | [RX-PR-03](./design-rules.md#rx-pr-03-required-hard-gate-one-clear-goal-one-primary-action-when-the-task-has-one) |
| Explicit differences | the attributes that differ come first, in the same order on every option | [RX-UX-14](./design-rules.md#rx-ux-14-preferred-options-show-what-sets-them-apart) |
| Von Restorff | only the primary action wears the action colour, one per view | [RX-UI-01](./design-rules.md#rx-ui-01-required-quality-lock-hierarchy-follows-priority), [RX-UI-04](./design-rules.md#rx-ui-04-preferred-quality-lock-a-palette-with-roles) |
| Serial position | the primary action and the key fact are on the first screen, and again at the end of a long page | [RX-UX-13](./design-rules.md#rx-ux-13-preferred-a-pages-sections-answer-the-visitors-questions-in-their-order) |
| Proximity, common region | the gap inside a group is half the gap between groups or less | [RX-UX-01](./design-rules.md#rx-ux-01-required-structure-from-the-users-goal), [RX-FM-01](./design-rules.md#rx-fm-01-required-visible-labels-tied-to-fields) |
| Miller, chunking | long numbers are grouped in threes or fours; nothing is carried in memory between screens | [RX-UX-08](./design-rules.md#rx-ux-08-preferred-recognition-over-recall-the-product-carries-the-load) |
| Change blindness | a value that changes elsewhere (a total, a badge) sits next to its control or is marked where it lands | [RX-IX-02](./design-rules.md#rx-ix-02-required-feedback-that-matches-the-wait) |
| Doherty | feedback comes in under 400 ms and progress shows after about 1 s | [RX-IX-02](./design-rules.md#rx-ix-02-required-feedback-that-matches-the-wait) |
| Information scent | each link and button names where it leads; no bare "Learn more" | [RX-CD-12](./design-rules.md#rx-cd-12-required-labels-say-what-happens) |
| Jakob | logo, navigation, search, cart, and back sit where the platform and category put them | [RX-DS-02](./design-rules.md#rx-ds-02-required-quality-lock-consistency-conventions-and-states) |
| Goal-gradient, Zeigarnik | a multi-step task shows the steps done and the steps left | [RX-UX-02](./design-rules.md#rx-ux-02-preferred-where-am-i-whats-left-how-do-i-leave) |
| Peak-end | both the success end and the failure end are designed | [RX-IX-01](./design-rules.md#rx-ix-01-required-hard-gate-before-during-result-recovery), [RX-EC-01](./design-rules.md#rx-ec-01-required-hard-gate-critical-states-exist) |
| Tesler, Occam | removing any element would lose information or an action | [RX-AS-05](./design-rules.md#rx-as-05-required-decoration-passes-a-purpose-gate), [RX-AS-06](./design-rules.md#rx-as-06-required-complexity-with-a-reason) |
| Postel | inputs accept spaces, dashes, +62 or 0, and normalise them | [RX-FM-05](./design-rules.md#rx-fm-05-preferred-the-right-keyboard-and-autofill) |
| Paradox of the active user | help appears inline where it is needed; no tutorial blocks first use | [RX-CD-16](./design-rules.md#rx-cd-16-contextual-help-where-the-question-comes-up) |
| Prägnanz | icons stay recognisable at 16 to 24 px | [RX-UI-20](./design-rules.md#rx-ui-20-preferred-an-icon-means-one-thing-and-says-it) |
| Visual hierarchy, squint test | blurred, the three things that still stand out are the ones meant to be seen first | [RX-UI-01](./design-rules.md#rx-ui-01-required-quality-lock-hierarchy-follows-priority) |
| Similarity | each shared colour or shape has one meaning | [RX-UI-04](./design-rules.md#rx-ui-04-preferred-quality-lock-a-palette-with-roles), [RX-UI-36](./design-rules.md#rx-ui-36-preferred-a-selected-option-looks-chosen-not-pressable) |
| Natural mapping | each control is laid out the way its value changes (minus left of plus) and sits beside what it changes | [RX-DS-02](./design-rules.md#rx-ds-02-required-quality-lock-consistency-conventions-and-states) |
| Cognitive bias | no pre-ticked add-on, no invented anchor price, no invented scarcity | [RX-AS-04](./design-rules.md#rx-as-04-required-hard-gate-no-fake-urgency) |
| Aesthetic-usability, Pareto | the test plan judges task success and time, not liking, and tests the top tasks first | [RX-UX-12](./design-rules.md#rx-ux-12-contextual-a-test-plan-travels-with-the-design) |

## Nielsen's 10 usability heuristics

| Heuristic | Rules |
| --- | --- |
| 1. Visibility of system status | [RX-IX-01](./design-rules.md#rx-ix-01-required-hard-gate-before-during-result-recovery), [RX-IX-02](./design-rules.md#rx-ix-02-required-feedback-that-matches-the-wait), [RX-EC-01](./design-rules.md#rx-ec-01-required-hard-gate-critical-states-exist), [RX-FM-06](./design-rules.md#rx-fm-06-required-submission-states), [RX-UX-15](./design-rules.md#rx-ux-15-preferred-a-running-total-sits-with-the-action-it-pays-for), [RX-UI-37](./design-rules.md#rx-ui-37-preferred-the-step-indicator-stays-quiet) |
| 2. Match between the system and the real world | [RX-CD-15](./design-rules.md#rx-cd-15-required-the-users-words-and-order) |
| 3. User control and freedom | [RX-IX-03](./design-rules.md#rx-ix-03-required-cancel-back-and-undo), [RX-IX-14](./design-rules.md#rx-ix-14-required-one-way-doors), [RX-UX-02](./design-rules.md#rx-ux-02-preferred-where-am-i-whats-left-how-do-i-leave) |
| 4. Consistency and standards | [RX-DS-02](./design-rules.md#rx-ds-02-required-quality-lock-consistency-conventions-and-states), [RX-UI-20](./design-rules.md#rx-ui-20-preferred-an-icon-means-one-thing-and-says-it), [RX-UI-36](./design-rules.md#rx-ui-36-preferred-a-selected-option-looks-chosen-not-pressable), [RX-CD-05](./design-rules.md#rx-cd-05-required-quality-lock-one-name-per-thing), [RX-RD-06](./design-rules.md#rx-rd-06-preferred-quality-lock-consistent-responsive-behavior) |
| 5. Error prevention | [RX-IX-04](./design-rules.md#rx-ix-04-required-protect-high-impact-actions-by-reasoning) |
| 6. Recognition rather than recall | [RX-UX-08](./design-rules.md#rx-ux-08-preferred-recognition-over-recall-the-product-carries-the-load) |
| 7. Flexibility and efficiency of use | [RX-UX-11](./design-rules.md#rx-ux-11-contextual-accelerators-for-frequent-users) |
| 8. Aesthetic and minimalist design | [RX-AS-06](./design-rules.md#rx-as-06-required-complexity-with-a-reason), [RX-UI-37](./design-rules.md#rx-ui-37-preferred-the-step-indicator-stays-quiet) |
| 9. Help users recognise, diagnose, and recover from errors | [RX-IX-01](./design-rules.md#rx-ix-01-required-hard-gate-before-during-result-recovery), [RX-EC-01](./design-rules.md#rx-ec-01-required-hard-gate-critical-states-exist), [RX-EC-02](./design-rules.md#rx-ec-02-required-errors-with-a-way-forward), [RX-FM-06](./design-rules.md#rx-fm-06-required-submission-states), [RX-FE-05](./design-rules.md#rx-fe-05-required-actionable-errors) |
| 10. Help and documentation | [RX-CD-16](./design-rules.md#rx-cd-16-contextual-help-where-the-question-comes-up) |

## Visual design

| Principle | Source | Rules |
| --- | --- | --- |
| Hierarchy follows priority | NN/g visual hierarchy; Gestalt proximity; Fitts | [RX-UI-01](./design-rules.md#rx-ui-01-required-quality-lock-hierarchy-follows-priority) |
| One spacing and type scale | NN/g principles of visual design; the Material 8 dp grid | [RX-UI-03](./design-rules.md#rx-ui-03-preferred-quality-lock-one-spacing-and-type-scale) |
| A palette with roles | NN/g (contrast signals a different function); the von Restorff isolation effect | [RX-UI-04](./design-rules.md#rx-ui-04-preferred-quality-lock-a-palette-with-roles), [RX-UI-31](./design-rules.md#rx-ui-31-preferred-a-palette-is-built-from-roles-not-picked) |
| Type that is set, not only sized | Bringhurst (a measure of 45 to 75 characters); WCAG 1.4.12 | [RX-UI-14](./design-rules.md#rx-ui-14-preferred-quality-lock-type-that-is-set-not-only-sized) |
| An icon means one thing | NN/g icon usability; Prägnanz; Apple HIG and Material iconography | [RX-UI-15](./design-rules.md#rx-ui-15-preferred-quality-lock-detail-craft), [RX-UI-20](./design-rules.md#rx-ui-20-preferred-an-icon-means-one-thing-and-says-it) |
| A selected option looks chosen | NN/g signifiers; Gestalt similarity | [RX-UI-36](./design-rules.md#rx-ui-36-preferred-a-selected-option-looks-chosen-not-pressable) |
| Translucent surfaces stay readable | NN/g on glassmorphism; WCAG 1.4.3 and 1.4.11; Apple HIG materials | [RX-UI-35](./design-rules.md#rx-ui-35-contextual-translucent-surfaces-stay-readable) |
| Platform conventions for navigation, gestures, and haptics | Apple HIG; Material | [RX-IX-13](./design-rules.md#rx-ix-13-required-each-transition-means-one-thing), [RX-IX-15](./design-rules.md#rx-ix-15-contextual-gestures-follow-the-finger), [RX-IX-16](./design-rules.md#rx-ix-16-contextual-haptics-as-punctuation) |

## Accessibility (WCAG 2.2)

| Success criterion | Rules |
| --- | --- |
| 1.1.1 Non-text content | [RX-A11Y-04](./design-rules.md#rx-a11y-04-required-hard-gate-semantic-structure-native-controls-and-names), [RX-UI-19](./design-rules.md#rx-ui-19-contextual-illustration-ships-as-a-themed-accessible-asset) |
| 1.3.1 Info and relationships | [RX-FM-01](./design-rules.md#rx-fm-01-required-visible-labels-tied-to-fields) |
| 1.4.1 Use of colour | [RX-A11Y-06](./design-rules.md#rx-a11y-06-required-not-color-alone) |
| 1.4.3 Contrast (minimum) | [RX-A11Y-01](./design-rules.md#rx-a11y-01-required-hard-gate-readable-contrast), [RX-UI-09](./design-rules.md#rx-ui-09-contextual-composition-leaves-room-for-the-content), [RX-UI-35](./design-rules.md#rx-ui-35-contextual-translucent-surfaces-stay-readable) |
| 1.4.10 Reflow | [RX-RD-01](./design-rules.md#rx-rd-01-required-hard-gate-stated-viewport-plus-the-smallest), [RX-RD-02](./design-rules.md#rx-rd-02-required-prioritize-simplify-reorganize) |
| 1.4.12 Text spacing | [RX-UI-14](./design-rules.md#rx-ui-14-preferred-quality-lock-type-that-is-set-not-only-sized) |
| 2.1.1 Keyboard | [RX-A11Y-03](./design-rules.md#rx-a11y-03-required-hard-gate-keyboard-and-visible-focus) |
| 2.3.3 Animation from interactions | [RX-A11Y-08](./design-rules.md#rx-a11y-08-required-respect-reduced-motion), [RX-UI-11](./design-rules.md#rx-ui-11-contextual-quality-lock-motion-earns-its-level), [RX-FE-17](./design-rules.md#rx-fe-17-preferred-a-visual-library-is-offered-as-a-choice-the-lightest-first) |
| 2.5.8 Target size (minimum) | [RX-A11Y-02](./design-rules.md#rx-a11y-02-required-hard-gate-readable-text-reachable-targets) |
| 3.3.1 Error identification | [RX-A11Y-07](./design-rules.md#rx-a11y-07-required-errors-announced-and-tied-to-fields) |

## Indonesian payments

| Pattern | Source | Rules |
| --- | --- | --- |
| QRIS: amount and merchant first | the QRIS standard (Bank Indonesia) | [RX-IX-09](./design-rules.md#rx-ix-09-contextual-qris-amount-and-merchant-first) |
| Virtual account: copy, deadline, steps | observed reference screens | [RX-IX-10](./design-rules.md#rx-ix-10-contextual-virtual-account-copy-deadline-steps) |
| Paylater and instalments shown in full | OJK consumer-protection disclosure | [RX-IX-11](./design-rules.md#rx-ix-11-contextual-paylater-and-installments-in-full) |
| Full cost before commitment | Baymard checkout research; NN/g e-commerce research | [RX-IX-05](./design-rules.md#rx-ix-05-required-full-cost-before-commitment) |

## What principles do not settle

A principle explains why a choice should work. It does not prove that the choice works for these users.
RYUX ends every design with a test plan that judges task success and time ([RX-UX-12](./design-rules.md#rx-ux-12-contextual-a-test-plan-travels-with-the-design)). The agent may not
claim that a design was validated unless it was tested with users.
