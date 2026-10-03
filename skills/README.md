# The RYUX skill

RYUX ships as **one skill**, [`ryux/`](./ryux). It is design intelligence for AI agents and
designers. The agent reads the router, picks one of five entry points, then reads only the
knowledge modules the task needs.

```
ryux/
  SKILL.md            the router: entry points, how RYUX works, levels, Hard Gates, task table, Delivery Gate
  capabilities/       analyze.md, design.md, build.md, critique.md, qa.md
  knowledge/          product, ux, interaction, forms, edge-cases, content, ui, design-system,
                      accessibility, responsive, frontend, anti-slop
```

| Entry point | File | Use it to |
| --- | --- | --- |
| Analyze | `capabilities/analyze.md` | understand an existing interface; every item is labeled Measured, Observed, or Inferred |
| Design | `capabilities/design.md` | create or improve UI and UX without code (Figma, pen.dev, mockups) |
| Build | `capabilities/build.md` | implement the interface in the repo's own stack |
| Critique | `capabilities/critique.md` | run a Design Read, then report findings with severity, evidence, impact, a fix, and the source |
| QA | `capabilities/qa.md` | compare the build with the intended design, fix, and render again |

Each knowledge module is a short framework followed by its rules. Rules are **[Required]**
(exceptions need a written reason), **[Preferred]** (the default), or **[Contextual]** (only when
their situation applies). **[Hard Gate]** rules have no exceptions; **[Quality Lock]** rules keep
the product consistent. Every module names the evidence to pull from RYUX Knowledge.

These files are generated from [`packages/cli/src`](../packages/cli/src) (`content.ts`,
`guides.ts`, `analyze.ts`, `critique.ts`), so don't edit them by hand. Regenerate with:

```bash
pnpm sync:skills
```

To install RYUX into your agent, run `npx skills add ryuxdsgn/design-intelligence` or
`npx @ryuxdsgn/ryux` (see the [README](../README.md#install)).
