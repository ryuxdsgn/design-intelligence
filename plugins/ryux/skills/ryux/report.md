# The report

Build, Critique, and QA end with this report, in the language of the reply. It is what the person reads: what changed
or is wrong, why, what they decide, and what to do next. The Delivery Gate still runs in full; its block goes under
Detail, at the end.

Headings and column names follow the reply's language. In Indonesian: **Penilaian** (Read), **Temuan** (Findings) with
the columns `# | Di mana | Sekarang | Ubah jadi | Kenapa` for proposals and `# | Di mana | Sebelum | Sesudah | Kenapa`
for changes already made (and **Bobot** for Weight), **Perlu keputusan Anda**,
**Sengaja tidak diubah**, Gate, **Berikutnya** (Next), and **Rincian** (Detail). The English names below are the
same sections.

Write for the person who asked. Use plain words by default: most people reading this are not developers. Keep the
exact place and value (a developer needs `index.html:305`), but put what it means first ("the store buttons in the
hero, `index.html:305`"). Explain a technical term in a few words, or leave it under Detail. When the person writes
like a developer (code, file paths, framework names), be as technical as they are.

1. **Read**: two or three sentences. The biggest failure or open gap is the Read's first sentence (for example "nobody
   can download yet: the store links are empty"), never after the table. Then: does the result fit the chosen
   direction and this user, judged rather than checked? Name at least one thing that is still weak, or the evidence
   that nothing is. Approval is earned.
2. **Findings**: one table, at most 7 rows, ordered by impact on the user's goal.

   | # | Where | Now | Change | Why |
   |---|---|---|---|---|
   | 1 | `index.html:42`, hero | Two download buttons, equal weight | One primary button for the visitor's phone; the other store as an outline button | One primary action per goal: two equal buttons split attention at the moment of choice (Hick's law). Cost: the second store is one glance further. Would change if most visitors come from desktop. |

   - **Where**: `file:line` and the element, or a frame and node. "The script at the bottom of the page" is not a
     Where.
   - **Now** and **Change**: exact values (copy, colours, sizes, tokens), never "improve the spacing". On a new
     page, **Now** is "new". A row must not do what its own Why warns against: read the Change against the Why
     before you write it.
   - **Why**: the rationale (RX-PR-14) in one line: a UX or UI principle named and applied to this screen (Hick's
     law, Fitts's law, recognition over recall, progressive disclosure, Jakob's law, one primary action per goal,
     visibility of system status), the cost when there is one, and what would change the choice (would change if).
     No rule IDs in the Why: the principle carries it, and the IDs go under Detail. A principle's name alone or
     "better UX" is not a why. Keep evidence labels (Observed, Inferred, Knowledge) where a claim needs one. When
     the Why compresses it, the full rationale lines (RX-PR-14), with the alternative that lost, go under Detail.
3. **Decisions for you**: one line each, only where more than one answer is right and the answer is the person's (a
   business rule, copy they own, a trade-off), with your recommendation and why; name the one person who decides
   ("you", or the owner by name, not "Ibu Ratna/you"). Assumptions, every DESIGN.md change as old → new, and a new
   component's name go here. Omit when empty.
4. **Left alone on purpose**: up to 5 things you considered and did not change, each with the reason; leave the
   section out when there were none.
5. **Gate**: one line, such as `Gate: 9 PASS · 2 NOT VERIFIED (scan not run: no copy in the project) · detail
   below`. A FAIL is named in the gate line and its fix is a row; it is never only under Detail. In every language the line
   starts with `Gate:` and gives a number before each status word (PASS, FAIL, NOT VERIFIED, N/A), never "the rest"
   or "lolos", so `ryux report-check` can compare it with the detail. Count the gate
   line from the Detail block after writing it, each area once, so the numbers match; an area with a caveat is NOT
   VERIFIED, not PASS. An area is PASS only when its module was read and the check ran. A promise the business has
   not decided is a FAIL in CONTENT (a delivery time, a price, "free"), not NOT VERIFIED. Say how something was checked as it was: a Playwright render at 390 px is not "on an
   iPhone".
6. **Next**: one line with the reply that moves on, offered in the reply's language and accepted in either: `kerjakan semua` or `kerjakan 1, 3` (`fix all`, `fix 1, 3`)
   applies those rows, re-checks, and reports again with only the rows that changed; `cek <page>` runs this report on
   the next page or state, named from the project when there is one. After Critique or QA, a fix runs as Build.
7. **Detail**: under one heading at the end of the same reply: the full Delivery Gate block, the view × state matrix
   (RX-EC-01), the full rationale lines (RX-PR-14) when the Why compressed them, the rule IDs behind each row, the
   user test plan (RX-UX-12), the scan output with a reason for each warn, and the alternatives not built. Nothing is
   written into the person's project for this. Detail stays short: one line per gate area, the matrix and the test
   plan as small tables, and nothing that repeats a row.

Scale it: a small change (a copy fix, one component) gives one or two rows. For a small change: the rows, the gate line, and Next; the Read is one sentence, and
a section with nothing in it is left out. Without table support (a plain-text agent), write the same columns as a numbered list, one item
per row.
