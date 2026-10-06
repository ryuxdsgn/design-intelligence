# Frontend implementation

Implements designs faithfully in the repo's own stack: semantic elements, existing components, and no invented logic.

> Group Engineering · Delivery Gate area CODE QUALITY · RYUX 2.3.3. Levels are defined in `SKILL.md`.

Connect design decisions to the code that ships them.

1. **Detect the stack first**: read package.json, the router, the styling approach, and two or
   three nearby components. Write in that stack. Do not assume React or Tailwind.
2. **Semantic HTML** and native controls before custom ones.
3. **Architecture**: follow the layers the repo already has. Components render; state lives close
   to where it is used; calculations, formatting, and validation live in pure modules; one layer
   talks to the API. Each piece of logic has one home: search before writing, never copy.
   Derived values instead of duplicated state.
4. **Tokens** instead of magic numbers; no duplicate styles.
5. **No invented logic**: prices, limits, and permissions come from data or are marked as
   assumptions.
6. **Dependencies** only when they clearly earn their weight.
7. **Performance**: sized and lazy-loaded media; no heavy libraries for small effects.
8. **Tests**: unit tests for pure logic with its edge cases, integration tests for critical flows,
   in the repo's own runner. Run them before claiming the work is done.

Does not cover: visual decisions (see `knowledge/ui.md`) or component reuse decisions (see `knowledge/design-system.md`).

## Evidence from RYUX Knowledge

The repo itself is the main evidence (stack, components, tokens); reference screens inform behavior, not code. Without the ryux MCP, say the evidence comes from the design and standards alone.

> Hard Gates always apply, whichever skills are loaded: no invented numbers, people, urgency, business
> rules, or terms; no placeholder shipped as final; no missing critical states. See `SKILL.md`.

## Rules

### RX-FE-01 [Required] Work in the repo's own stack

- Do: Before writing UI code, read package.json and nearby components, and use the framework, styling approach, and patterns already there.
- Do not: Assume React, Tailwind, or a component library the project does not use.
- Why: Code in a foreign stack is a rewrite waiting to happen. (Clean-code practice)
- Check: review

### RX-FE-02 [Required] [Hard Gate] No invented logic in UI code

- Do: Take prices, limits, permissions, and rules from data, config, or the API; mark unknown ones as assumptions.
- Do not: Hard-code business rules or API behavior nobody specified.
- Why: Invented logic ships as real behavior. (ryux product principle (see RX-PR-02))
- Check: review

### RX-FE-05 [Required] Actionable errors

- Do: Handle errors with messages that say what to fix, in the user's language when users see them.
- Do not: Swallow errors silently or show raw developer messages to users.
- Why: Silent failures hide bugs; raw messages leave users stuck. (Clean-code practice; Nielsen heuristic 9)
- Check: review

### RX-FE-06 [Preferred] Comments say why

- Do: Write comments that explain the reason behind the code.
- Do not: Write doc comments that only repeat a field, type, or function name.
- Why: Restating comments add noise and drift out of date. (ryux run 2026-10-02: order-total.ts without ryux)
- Check: review

### RX-FE-07 [Preferred] Fit the codebase

- Do: Follow the formatting, naming, and patterns of the surrounding files; name things by what they hold or do; remove unused code, imports, and commented-out blocks.
- Do not: Introduce a new style, use data, temp, or helper without context, or leave dead code and empty TODOs behind.
- Why: Code that reads like its neighbors is easier to review, and dead code misleads the next reader. (Clean-code practice)
- Check: review

### RX-FE-12 [Contextual] Rupiah formatting in code

- When: the product is built for the Indonesian market and shows Rupiah; elsewhere, use Intl with the user's locale and add no market-specific branches nobody asked for
- Do: Format the number with id-ID grouping and prepend Rp yourself.
- Do not: Rely on Intl currency style alone, which inserts a space after Rp.
- Why: The built-in output does not match the Rp1.250.000 form used in copy. (ryux run 2026-10-02: order-total.ts with and without ryux)
- Check: audit_copy C-07 on rendered strings

### RX-FE-13 [Required] One home for each piece of logic

- Do: Put logic in the layer the repo already uses: components render, hooks or stores hold state, pure modules hold calculations, formatting, and validation, and one data-access layer talks to the API. Before writing a function, search for an existing one and reuse or extend it.
- Do not: Copy logic between components, add a near-duplicate helper, mix API calls or business logic into render code, or add a layer, abstraction, or pattern the repo does not use.
- Why: Logic with one home is changed once and tested once; copies drift apart and ship different behavior. (Clean-code practice; owner review 2026-10-06)
- Check: review

### RX-FE-14 [Required] Test logic and critical flows

- Do: Write unit tests for every new or changed pure function (calculations, formatting, validation, state transitions), including edge cases such as zero, empty, maximum, and invalid input, and integration tests for critical flows (checkout, payment, form submit, sign-in) covering the success and failure paths. Use the repo's test runner and conventions; with none, propose one as an assumption and ask before adding the dependency. Run the tests.
- Do not: Ship changed logic without tests, write snapshot-only tests or tests that mock the code under test, or claim tested without running the tests.
- Why: Tests catch the regressions review misses, before users find them in production. (Testing practice; owner review 2026-10-06)
- Check: run the project's tests
