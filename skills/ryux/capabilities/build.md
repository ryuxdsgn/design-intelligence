# RYUX Build

> Implement or change the interface in code, faithfully and in the repo's own stack.

1. **Read the repo first**: the stack, components, tokens, and conventions (knowledge/frontend.md,
   knowledge/design-system.md). Reuse before creating.
2. **Find the design source**: the Design Direction, a Figma or pen.dev design, a DESIGN.md, or an
   approved mockup; it is the spec. If there is none, run Design first (capabilities/design.md)
   instead of inventing one in code.
3. **Read the modules the task needs** from the task table: for example accessibility, responsive,
   and edge-cases for any UI, and forms and content for a form.
4. **Implement faithfully.** Use semantic elements, existing components, and real data paths.
   Build must not invent business rules, prices, or limits; API behavior or response shapes; or
   data presented as real (RX-FE-02, RX-PR-02). It must not silently change a design decision: a
   change goes back to Design as a new Decision Receipt. Mark every assumption in the code.
5. **Render and verify.** Run it, check every width and state, and fix deviations from the design
   (capabilities/qa.md).
6. **Close with the Delivery Gate.** CODE QUALITY and VISUAL QA need real checks (typecheck,
   render), or say what was not run.
