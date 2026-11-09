# Frontend implementation

Implements designs faithfully in the repo's own stack: semantic elements, existing components, and no invented logic.

> Group Engineering · Delivery Gate area CODE QUALITY · RYUX 2.22.8. Levels are defined in `SKILL.md`.

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
6. **Dependencies** only when they clearly earn their weight; a visual library (motion, 3D, shaders,
   animated illustration) is offered as a choice, the lightest first, with its fallback (RX-FE-17);
   a hard job (accessible components, forms, server data, tables, dates, charts, tests) uses the
   platform, then the repo's library, then a proven one offered as a choice and checked on the
   registry before it is installed (RX-FE-18).
7. **Performance**: sized and lazy-loaded media; no heavy libraries for small effects.
8. **Tests**: unit tests for pure logic with its edge cases, integration tests for critical flows,
   in the repo's own runner. Run them before claiming the work is done.

Does not cover: visual decisions (see `knowledge/ui.md`) or component reuse decisions (see `knowledge/design-system.md`).

## Evidence from RYUX Knowledge

The repo itself is the main evidence (stack, components, tokens); reference screens inform behavior, not code. Without the ryux MCP, say the evidence comes from the design and standards alone.

> Hard Gates always apply, whichever skills are loaded: no invented numbers, people, urgency, business
> rules, or terms; no placeholder shipped as final; no missing critical states. Labeled sample data is
> not an invented number; an unconfirmed capability is never presented as confirmed. See `SKILL.md`.

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
- Check: list each rule the UI code computes (fees, limits, eligibility, rounding, dates) and its source (API, spec, brief); fails on any computed from a guess

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
- Machine check: `ryux scan` flags Intl currency style with IDR, which prints Rp 1.250.000,00 (a space, and decimals unless set to 0) (warn)

### RX-FE-13 [Required] One home for each piece of logic

- Do: Put logic in the layer the repo already uses: components render, hooks or stores hold state, pure modules hold calculations, formatting, and validation, and one data-access layer talks to the API. Before writing a function, search for an existing one and reuse or extend it.
- Do not: Copy logic between components, add a near-duplicate helper, mix API calls or business logic into render code, or add a layer, abstraction, or pattern the repo does not use.
- Why: Logic with one home is changed once and tested once; copies drift apart and ship different behavior. (Clean-code practice; owner review 2026-10-06)
- Check: review

### RX-FE-14 [Required] Test logic and critical flows

- Do: Write the tests, then run them:
  - unit tests for every new or changed pure function (calculations, formatting, validation, state transitions), including edge cases such as zero, empty, maximum, and invalid input
  - integration tests for critical flows (checkout, payment, form submit, sign-in), covering the success and failure paths
  - the repo's test runner and conventions; with none, propose one as an assumption and ask before adding the dependency
  - while iterating, run the tests the change touches; run the whole suite once before handing off, with quiet output (a summary or dot reporter, failures in full)
- Do not: Ship changed logic without tests, write snapshot-only tests or tests that mock the code under test, or claim tested without running the tests.
- Why: Tests catch the regressions review misses, before users find them in production. (Testing practice; owner review 2026-10-06; ryux run: food-delivery round 2 (2026-10-27) ran the full suite 21 times in one build, about a quarter of its steps)
- Check: run the project's tests

### RX-FE-15 [Required] Change the source, not the output

- Do: Make UI changes in the source files that own them (components, styles, tokens), so the next build and the next person see the same code.
- Do not: Build a feature with a script that rewrites CSS or source by string replacement, or patch generated files.
- Why: Patched output is overwritten by the next build and hides where the behavior lives. (pattern also in anti-slop (MIT) R-33; written for RYUX)
- Check: review the diff

### RX-FE-16 [Required] [Hard Gate] The build passes

- Do: Before handoff, run the checks the repo already has (build, typecheck, lint, tests) and fix what fails. Report each one you ran and its result; a check you could not run is named, and the work is not called done.
- Do not: Hand off code that does not build or typecheck, silence an error to make it pass (a type cast, a disabled rule, a skipped test), or call it done without running the checks.
- Why: A build that fails cannot be reviewed, rendered, or shipped; every other check in the Delivery Gate depends on it. (Continuous integration practice; owner review 2026-10-25: build failure belongs with the checks that cannot be argued)
- Not when: design-only work with no code; then CODE QUALITY is N/A
- Check: run the repo's build, typecheck, lint, and tests; fails on any error

### RX-FE-17 [Preferred] A visual library is offered as a choice, the lightest first

- When: the build needs motion, 3D, a shader, or animated illustration that CSS and SVG cannot carry, and the repo has no library for it
- Do: Offer two or three libraries as choices, the lightest that does the job first, each with its weight, license, the static fallback, and what happens under prefers-reduced-motion:
  - UI and scroll motion: CSS first; Motion for React, GSAP elsewhere or for timelines
  - animated illustration: Lottie (dotLottie) for exported animations, Rive for interactive state
  - 3D: Three.js, React Three Fiber with drei in React, a Spline runtime when the scene is made in Spline
  - gradients and shaders: OGL or a small WebGL shader, with a static image under it
  - 2D canvas and generative: PixiJS, p5.js
  - smooth scrolling (Lenis) only with a reason, never on long reading pages
  - One library per job; record the choice in DESIGN.md with the reason, and load it lazily, after the page is usable.
- Do not: Add a library for an effect CSS or SVG can do, add two libraries for one job, ship a 3D or shader hero with no static fallback, or ignore reduced motion.
- Why: A visual library is a long-term cost in weight, upkeep, and accessibility; the user should choose it knowing what it costs, and the page must work without it. (Web performance and accessibility practice (WCAG 2.3.3 animation from interactions, prefers-reduced-motion); each library's documentation; owner request 2026-10-31 that RYUX offer library options when a direction needs them)
- Not when: the repo already uses a library for this job: use it
- Trade-off: a choice to make before building, and the lightest option may limit the effect
- Check: options offered with weight, license, fallback, and reduced-motion behaviour; one library per job; static fallback renders

### RX-FE-18 [Preferred] A hard job gets a proven library, offered as a choice

- When: the build needs a job that is hard to get right by hand (an accessible dialog, menu, combobox, or tabs; a form with validation; data from a server; a large table or list; dates; a chart; tests), and the platform and the repo do not cover it
- Do: Choose in this order: the platform (<dialog>, <details>, the popover attribute, Intl.NumberFormat for Rupiah, Intl.DateTimeFormat, CSS), then a library the repo already has, then two or three options for the repo's framework, each with its size, license, last release, accessibility support, and framework fit:
  - accessible components: Radix UI, React Aria, or Base UI (React); Reka UI (Vue); Bits UI or Melt UI (Svelte); Kobalte (Solid); Angular CDK (Angular); Ark UI on Zag.js across React, Vue, Solid, and Svelte; shadcn/ui and its Vue and Svelte ports when the team wants to own the component code
  - forms and validation: TanStack Form (most frameworks), React Hook Form (React), VeeValidate (Vue), Superforms (SvelteKit), Angular's reactive forms; a schema in Zod or Valibot shared with the server
  - server data: TanStack Query (React, Vue, Svelte, Solid, Angular), SWR (React)
  - tables and long lists: TanStack Table and TanStack Virtual, across frameworks
  - dates: date-fns or Day.js; money and numbers with Intl, no library
  - charts: ECharts or Chart.js in any framework; Recharts or visx in React
  - icons: Lucide, with a package per framework; toasts: Sonner (React) or its Vue and Svelte ports
  - tests: Vitest, Testing Library for the framework, Playwright, and axe-core
  - Before adding one, check on the npm registry and its documentation that the package exists under that exact name, is maintained, fits the framework version, and has the API you will call; this list is a starting point, not a source of truth.
  - Ask before adding it (a dependency is a long-term choice), one library per job, and record the choice with its reason (RX-PR-14).
- Do not: Hand-roll a focus trap, a combobox, or date arithmetic the platform or a proven library does correctly; add a library the platform covers; add a second library for a job the repo already solves; install a package name from memory without checking it exists; or call an API you have not read in its documentation (RX-FE-02).
- Why: The hard parts of these jobs are keyboard, focus, screen readers, time zones, caching, and edge cases; hand-written versions usually miss them, and an unchecked package name can be one that does not exist or that someone registered to catch exactly that mistake. (W3C WAI-ARIA Authoring Practices (dialog, menu, combobox, and tabs patterns); each library's documentation; software supply chain practice (verify a package before installing it); owner request 2026-11-02 that RYUX recommend frontend libraries across frameworks)
- Not when: the repo already uses a library for the job: use it; a prototype the user says will be thrown away
- Trade-off: a question and a check before the build; a dependency to keep up to date
- Check: review: the platform and the repo checked first; two or three options with size, license, last release, accessibility, and framework fit; each package verified on the registry and its docs before use; one library per job; the choice recorded with its reason
