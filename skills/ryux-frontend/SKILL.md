---
name: ryux-frontend
description: "Ryux Frontend implementation: the repo's own stack, semantic elements, components, state, no invented logic. Load when writing or changing frontend code, including formatting, state, and data logic that users see."
---

# ryux-frontend: Frontend implementation

> Group Engineering · Delivery Gate area CODE QUALITY · RX-2.0. Levels are defined in `ryux-core`.

Connect design decisions to the code that ships them.

1. **Detect the stack first**: read package.json, the router, the styling approach, and two or
   three nearby components. Write in that stack. Do not assume React or Tailwind.
2. **Semantic HTML** and native controls before custom ones.
3. **Components** split by responsibility; state close to where it is used; derived values
   instead of duplicated state.
4. **Tokens** instead of magic numbers; no duplicate styles.
5. **No invented logic**: prices, limits, and permissions come from data or are marked as
   assumptions.
6. **Dependencies** only when they clearly earn their weight.
7. **Performance**: sized and lazy-loaded media; no heavy libraries for small effects.

Does not cover: visual decisions (see ryux-ui) or component reuse decisions (see ryux-design-system).

## Evidence from Ryux Knowledge

The repo itself is the main evidence (stack, components, tokens); reference screens inform behavior, not code. Without the ryux MCP, say the evidence comes from the design and standards alone.

> Hard Gates always apply, whichever skills are loaded: no invented numbers, people, urgency, business
> rules, or terms; no placeholder shipped as final; no missing critical states. See `ryux-core`.

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

- When: code formats money for display
- Do: Format the number with id-ID grouping and prepend Rp yourself.
- Do not: Rely on Intl currency style alone, which inserts a space after Rp.
- Why: The built-in output does not match the Rp1.250.000 form used in copy. (ryux run 2026-10-02: order-total.ts with and without ryux)
- Check: audit_copy C-07 on rendered strings
