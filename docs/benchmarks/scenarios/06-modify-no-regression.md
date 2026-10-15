# 6. Change an interface without breaking the rest

**Status**: specified, not runnable yet. Uses the scenario 5 fixture repo with a working settings
page (profile form, notification toggles, a danger zone) and tests covering it.

**Prompt**

> On the settings page, move the notification toggles into their own tab and add a "Save changes"
> bar that appears when something changed.

**Expected**
- The change works: tabs, a dirty-state save bar, save in progress, saved, save failed.
- Nothing else changes: the profile form and the danger zone behave as before; existing tests pass;
  no unrelated refactor or restyle.
- Unsaved changes are not lost silently when switching tabs (warn or keep them).
- States and keyboard access for the new tabs (arrow keys or tab order, visible focus).

**Critical failures**: a broken existing behavior or failing existing test; unrelated files
reformatted or refactored; a save bar that shows "Saved" without the save finishing.

**Gates**: UX, INTERACTION via EDGE CASES, CODE QUALITY, ACCESSIBILITY, VISUAL QA.

**Verify**: run the existing tests before and after; `git diff --stat`; Playwright through each tab
and the save paths; screenshots of the untouched sections before and after.

**Evidence to count the run**: test output before and after, the diff, the Playwright log.
