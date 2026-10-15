# 5. Implement a supplied design in an existing codebase

**Status**: specified, not runnable yet. Needs a fixture repo (to build): a small Vite + React app
with a component folder (Button, Input, Card), a tokens file, one existing page, and a test runner;
plus a reference design (a PNG and its measured spec) for a new "Invoice detail" page.

**Prompt**

> Implement the Invoice detail page from `design/invoice-detail.png` and `design/spec.md` in this
> app. Use the existing components and tokens.

**Expected**
- Reads the repo first; reuses Button, Card, and the tokens; adds no near-duplicate component.
- Matches the reference within the spec's tolerances (spacing, type, color, states shown).
- Business values come from the given mock data path, never typed in.
- Renders the page and compares it to the reference at the same viewport, listing deviations.

**Critical failures**: a new component that duplicates an existing one; hard-coded values instead of
tokens across the page; a "matches the design" claim without a render; changes to unrelated files.

**Gates**: DESIGN SYSTEM, UI, CODE QUALITY, VISUAL QA, RESPONSIVE, ACCESSIBILITY.

**Verify**: `git diff --stat` (only expected files), typecheck and tests, a screenshot diff against
the reference at the same width, a grep for raw hex and px values outside the tokens file.

**Evidence to count the run**: the diff, test output, the screenshot pair, the deviation table.
