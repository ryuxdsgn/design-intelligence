# The report

Build, Critique, and QA end with this report, in the language of the reply. It is what the person reads: what changed
or is wrong, why, what they decide, and what to do next. The Delivery Gate still runs in full; its block goes under
Detail, at the end.

1. **Read**: two or three sentences. Does the result fit the chosen direction and this user, judged rather than
   checked? Name at least one thing that is still weak, or the evidence that nothing is. Approval is earned.
2. **Findings**: one table, at most 7 rows, ordered by impact on the user's goal.

   | # | Where | Now | Change | Why |
   |---|---|---|---|---|
   | 1 | `index.html:42`, hero | Two download buttons, equal weight | One primary button for the visitor's phone; the other store as an outline button | One primary action per goal (RX-PR-03): two equal buttons split attention at the moment of choice (Hick's law). Cost: the second store is one glance further. |

   - **Where**: `file:line` and the element, or a frame name.
   - **Now** and **Change**: exact values (copy, colours, sizes, tokens), never "improve the spacing". On a new
     page, **Now** is "new".
   - **Why**: the rationale (RX-PR-14) in one line: a UX or UI principle named and applied to this screen (Hick's
     law, Fitts's law, recognition over recall, progressive disclosure, Jakob's law, one primary action per goal,
     visibility of system status), the rule ID, the cost when there is one, and what would change the choice (would change if). A rule ID alone or "better UX" is
     not a why. Keep evidence labels (Observed, Inferred, Knowledge) where a claim needs one. When the Why compresses it, the
     full rationale lines (RX-PR-14), with the alternative that lost, go under Detail.
3. **Decisions for you**: one line each, only where more than one answer is right and the answer is the person's (a
   business rule, copy they own, a trade-off), with your recommendation and why. Assumptions, every DESIGN.md
   change as old → new, and a new component's name go here. Omit when empty.
4. **Left alone on purpose**: up to 5 things you considered and did not change, each with the reason; leave the
   section out when there were none.
5. **Gate**: one line, such as `Gate: 9 PASS · 2 NOT VERIFIED (scan not run: no copy in the project) · detail
   below`. A FAIL is named in the gate line and its fix is a row; it is never only under Detail.
6. **Next**: one line with the reply that moves on, offered in the reply's language and accepted in either: `kerjakan semua` or `kerjakan 1, 3` (`fix all`, `fix 1, 3`)
   applies those rows, re-checks, and reports again with only the rows that changed; `cek <page>` runs this report on
   the next page or state, named from the project when there is one. After Critique or QA, a fix runs as Build.
7. **Detail**: under one heading at the end of the same reply: the full Delivery Gate block, the view × state matrix
   (RX-EC-01), the full rationale lines (RX-PR-14) when the Why compressed them, the user test plan (RX-UX-12), the scan output with a reason for each warn, and the alternatives not
   built. Nothing is written into the person's project for this.

Scale it: a small change (a copy fix, one component) gives one or two rows. For a small change: the rows, the gate line, and Next; the Read is one sentence, and
a section with nothing in it is left out. Without table support (a plain-text agent), write the same columns as a numbered list, one item
per row.
