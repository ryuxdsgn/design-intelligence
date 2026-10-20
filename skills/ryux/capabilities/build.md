# RYUX Build

> Implement or change the interface in code, faithfully and in the repo's own stack.

Build runs Understand (steps 1-3), Build and critique (4-6), and Verify and deliver (7) of the core
workflow (SKILL.md); Frame, Explore, and Evaluate happen in Design.

1. **Read the repo first**: the stack, components, tokens, conventions, the architecture already
   used (where components, state, pure logic, and data access live), and the test runner
   (knowledge/frontend.md, knowledge/design-system.md). Reuse before creating.
2. **Find the design source**: the Design Direction, a Figma or pen.dev design, a DESIGN.md, or an
   approved mockup; it is the spec. If there is none, run Design's Frame, Explore, and Evaluate
   first (capabilities/design.md, steps 2-4) instead of inventing one in code.
3. **Read the modules the task needs** from the task table: for example accessibility, responsive,
   and edge-cases for any UI, and forms and content for a form. When the build adds motion or
   transitions, read knowledge/ui.md (RX-UI-11) before writing any: how often the surface is seen
   decides how much it moves.
4. **Implement faithfully.** Use semantic elements, existing components, and real data paths.
   Build must not invent business rules, prices, or limits; API behavior or response shapes; or
   data presented as real (RX-FE-02, RX-PR-02). It must not silently change a design decision: a
   change goes back to Design as a new Decision Receipt, and when the code shows the chosen design
   cannot work (data, platform, performance), say so and send it back to Reconsider. Mark every assumption in the code. Give
   each piece of logic one home in the repo's existing layers, never a copy (RX-FE-13).
5. **Test what can break.** Unit tests for new or changed pure logic, edge cases included;
   integration tests for critical flows such as checkout, payment, and form submit. Use the
   repo's runner; with none, propose one and ask before adding it (RX-FE-14).
6. **Render and verify.** Run it and the tests, check every width and state, and fix deviations
   from the design (capabilities/qa.md). When changing an existing screen, also check that what
   you did not mean to change still works: neighbouring screens, shared components, and the flow
   around the change.
   When anything animates, run the motion passes in capabilities/qa.md as well. Run the counts of
   RX-AS-10 on the render and report them in the gate.
7. **Close with the Delivery Gate.** CODE QUALITY and VISUAL QA need real checks (typecheck,
   tests, render), or say what was not run.
