# RYUX

Design intelligence for AI agents and designers. RYUX is one skill, `ryux`, with five entry points:

- **Analyze** an existing interface before changing it
- **Design** UI and UX without code, in Figma, pen.dev, or mockups
- **Build** in your own stack
- **Critique** a Figma link, pen.dev design, website URL, or screenshot, and find what to change first
- **QA** a build against the design

Say what you are doing and RYUX reads only the knowledge that task needs: product, UX, interaction,
forms, edge cases, content, UI, imagery, illustration, design system, accessibility, responsive,
frontend, and anti-slop. Every task ends with a delivery gate that checks the work before it is called
done.

## Install

In Claude Code:

```text
/plugin install ryux --marketplace ryuxdsgn/design-intelligence
```

## What this plugin contains

Markdown only: the skill, its five capability files, and its knowledge modules. No hooks, no MCP
servers, no scripts, and nothing runs when you install it. The plugin sends no data anywhere.

## What the skill may ask Claude to run

Some steps suggest local commands. Claude asks before running them, as with any shell command:

- `npx playwright screenshot ...` to capture a page you name, for Analyze, Critique, and QA
- `npx @ryuxdsgn/design-intelligence scan ...` to check changed files or a page you name for
  measurable issues such as contrast and sideways scrolling, for Build and QA

Both download a package from npm and read only the files or URLs you give them. If you connected Figma
or pen.dev tools to Claude yourself, the skill can read designs through them.

## More

Source, benchmarks, and other ways to install: https://github.com/ryuxdsgn/design-intelligence

MIT licensed.
