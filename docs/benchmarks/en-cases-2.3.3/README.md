# Experiment EN-CASES-2.3.3 · Dashboard and orders list

Raw outputs of the two single-pair runs in the [showcase](../../showcase.md#case-02--two-more-prompts).
Everything in the run folders is the agents' own output. The only edit: absolute local file paths
were replaced with `[local path]` or a bare file name.

## Experiment card

| | |
| --- | --- |
| Date | 2026-10-07 |
| Protocol | written and locked before the first run: one pair per case, shown whatever the result, labeled "one run" |
| Agent | A Claude Code subagent, a fresh one for every run, the same model for every run (the model name was not recorded) |
| Tool | pen.dev, one shared canvas, runs one after another |
| Changed variable | RYUX 2.3.3 (the repo's `skills/ryux/`), copied into the B run folders only |
| ryux MCP | off: evidence None for every decision |
| Questions | answered from each case's fact sheet; runs that asked nothing never received it |
| Counted by | the operator, from the outputs |

### Case DB · Dashboard, first run

Prompt: "Design the home dashboard of a project management web app, shown the first time a new user
logs in. Make it in pen.dev."

Fact sheet: a project management web app for small teams; team leads and members at small companies,
on desktop; a global product in English, market not decided; desktop web, 1440 wide; the user just
signed up and created a new workspace, with no projects, tasks, or teammates yet; data that exists: the
user's name and the workspace name; actions: Create a project, Invite teammates, Import from a CSV
file; core objects, features, integrations, brand, design system, metrics, anything else: not decided.

### Case OR · Orders list, mobile

Prompt: "Design the orders list for an online store's admin app, on mobile. Make it in pen.dev."

Fact sheet: an admin app for the owner of a small online store; owners managing orders on their
phone; a global product in English, market and currency not decided; mobile, 390 wide; order data:
order number, customer name, date, total, item count, payment status (Paid, Pending, Refunded),
fulfillment status (Unfulfilled, Shipped, Delivered); actions: open an order, search by order number
or customer name, filter by status; anywhere from zero to several hundred orders; main job of the
screen, brand, design system, anything else: not decided.

## Runs

| Run | Output | Reasoning | Questions |
| --- | --- | --- | --- |
| DB-A1 (without) | [output.png](db-a1/output.png) | [reasoning.md](db-a1/reasoning.md) | none asked |
| DB-B1 (with) | [output.png](db-b1/output.png) | [reasoning.md](db-b1/reasoning.md) | [questions.md](db-b1/questions.md) |
| OR-A1 (without) | [output.png](or-a1/output.png) | [reasoning.md](or-a1/reasoning.md) | none asked |
| OR-B1 (with) | [output.png](or-b1/output.png) | [reasoning.md](or-b1/reasoning.md) | [questions.md](or-b1/questions.md) |

## Counts

| Measure | DB-A1 | DB-B1 | OR-A1 | OR-B1 |
| --- | --- | --- | --- | --- |
| Questions asked | 0 | 3 | 0 | 3 |
| Screens or states | 1 | 4 (1440, 390, loading, error) | 1 | 9 (list, filter sheet, filters applied, 320, first load, no orders, no matches, couldn't load, offline) |
| Facts shown as real that nobody gave | "Free · 1 member"; "18 starter tasks"; "1 of 4 done" | none; "Dana" and "Harbor Studio" labeled as sample values; `[Product name]` | store "Northwind Goods"; counts 248, 12, 3, 1; "Carrier pickup 5 PM"; "Was due Oct 6" | none; names and totals labeled as sample data |
| Features not in the fact sheet | Trello, Asana, and Jira import; templates; My tasks; Inbox; Search; notifications; checklist; week strip | none | ship-by grouping; carrier pickup; partial shipments; Returns tab; sort; bottom navigation | none |
| Currency | none shown | none shown | USD, assumed | "$" as a labeled stand-in |
| Examples from one market in the questions | (no questions) | no | (no questions) | yes (COD, virtual account, Rupiah) |

## Evidence status

- **Observed:** the outputs, reasoning files and question lists above are raw and public.
- **Inferred:** our reading. The visible difference is fewer invented facts and more states, not
  polish. Without RYUX, both screens looked fuller and more finished.
- **Not tested:** anything beyond one pair per case, visual quality, other models, and real users.

## What we saw go wrong with RYUX

- DB-B1: the outlined button's border is about 2:1 against white, below the 3:1 that controls need.
  The run reported this itself. Next to DB-A1 the page looks plain.
- OR-B1: "$" stands in for the undecided currency. It is labeled, but `[CUR]` would have been
  clearer. Its questions again offered examples from one market.

## Harness note (added 2026-10-07)

These runs were made by subagents working inside the RYUX repo. The repo's project instructions
describe the Indonesian market (Rupiah, QRIS, virtual accounts), and that context reached every run,
with and without RYUX, although each agent was told to ignore it. It most likely inflated the
one-market examples in RYUX's questions. A follow-up in a clean environment (an empty folder, no
project instructions) still showed some tilt from RYUX's own wording, which RYUX 2.4 makes neutral.
Later runs use the clean harness. The other counts compare A and B under the same context.
