# Ryux skills

Browsable copies of the Ryux skills (RX-2.0), one folder per skill (each holds a `SKILL.md`). An
agent loads `ryux-core` for any UI, UX, copy, or frontend task, then only the skills the task needs.

| Group | Skill | Covers |
| --- | --- | --- |
| core | `ryux-core` | Workflow, levels, which skills to load, Delivery Gate, honest claims. Always installed. |
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
| quality | `ryux-visual-qa` | Render, inspect, critique, fix, render again (RX-QA) |
| quality | `ryux-anti-slop` | Hard Gates, Purpose Gates, Quality Locks, honest claims (RX-AS) |
| review | `ryux-critique` | Design Read (nine dimensions) plus `heuristic_eval` findings with evidence |

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
