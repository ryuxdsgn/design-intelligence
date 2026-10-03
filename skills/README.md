# RYUX skills

Browsable copies of the RYUX skills (RX-2.0), one folder per skill (each holds a `SKILL.md`). RYUX
is a design intelligence layer for AI and designers. An agent loads `ryux-core`, chooses the
capability (Analyze, Build, Critique, QA), then loads only the skills the task needs.

Roles: **core** (the operating system), **knowledge** (how to reason about one area; rules say when
they apply, when they do not, and the trade-off), **capability** (Analyze, Critique), and **gate**
(Visual QA, anti-slop). Every skill names the evidence to pull from RYUX Knowledge.

| Group | Skill | Covers |
| --- | --- | --- |
| core | `ryux-core` | Choose the capability, levels, which skills to load, Hard Gates, Delivery Gate. Always installed. |
| analyze | `ryux-analyze` | Understand an existing interface; every item labeled Measured, Observed, or Inferred |
| foundation | `ryux-product` | User, task, goal, primary action, constraints, assumptions (RX-PR) |
| ux | `ryux-ux` | Information architecture, navigation, flows, grouping, disclosure, search and filters (RX-UX) |
| ux | `ryux-interaction` | Before, during, result, recovery; feedback, confirm or undo, keyboard, local payments (RX-IX) |
| ux | `ryux-forms` | Labels, layout, validation, input preservation, submission, unsaved work, OTP, address, e-KYC (RX-FM) |
| ux | `ryux-edge-cases` | Data, form, network, permission, and system states (RX-EC) |
| ux | `ryux-content` | Specific copy, error messages, terminology, natural Indonesian, Rupiah (RX-CD) |
| ui | `ryux-ui` | Hierarchy, functional vs decorative, scale, color roles, density, imagery, motion (RX-UI) |
| ui | `ryux-design-system` | Search before create, tokens, component states, consistency (RX-DS) |
| ui | `ryux-accessibility` | Semantics, keyboard, focus, contrast, targets, names, errors, reduced motion (RX-A11Y) |
| ui | `ryux-responsive` | Prioritize, simplify, reorganize; tables, overlays, safe areas (RX-RD) |
| engineering | `ryux-frontend` | The repo's own stack, semantic controls, components, no invented logic (RX-FE) |
| quality | `ryux-visual-qa` | Did the build match the intended design? Deviation list, fix, render again (RX-QA) |
| quality | `ryux-anti-slop` | Hard Gates, Purpose Gates, Quality Locks, honest claims (RX-AS) |
| critique | `ryux-critique` | Orchestrates Analyze and the knowledge skills; Design Read, then findings with ID, severity, category, evidence, impact, recommendation, confidence, and source |

Rules are **[Required]** (exceptions need a written reason), **[Preferred]** (the default),
or **[Contextual]** (only when its situation applies). **[Hard Gate]** rules have no exceptions;
**[Quality Lock]** rules keep the product consistent.

These files are generated from [`packages/cli/src/content.ts`](../packages/cli/src/content.ts) and
[`guides.ts`](../packages/cli/src/guides.ts), so don't edit them by hand. `ryux-critique` is
hand-authored in `.claude/skills/`. Regenerate with:

```bash
pnpm sync:skills
```

To install them into your agent, run `npx skills add ryuxdsgn/design-intelligence` or `npx @ryuxdsgn/ryux`
(see the [README](../README.md#install)).
