# ryux skills

Browsable copies of the ryux-rules skills, one folder per skill (each holds a `SKILL.md`).

| Skill | What it covers |
| --- | --- |
| `ryux-rules` | Core: evidence + honesty. Always installed. |
| `ryux-ui` | UI and visual: palette, spacing, consistency, states |
| `ryux-copy` | Indonesian copywriting: natural language, Rupiah, error messages, CTAs |
| `ryux-a11y` | Accessibility: contrast, text size, touch targets, focus |
| `ryux-ux` | Interaction heuristics + applied UX (NNGroup): status, control, forms, checkout, trust |
| `ryux-local` | Indonesian patterns: QRIS, virtual account, OTP, fees, paylater, e-KYC |
| `ryux-code` | Clean-code add-on (RX-K): honest comments, meaningful names, no dead code |
| `ryux-critique` | Usability review playbook (runs `heuristic_eval`) |

These files are generated from [`packages/cli/src/content.ts`](../packages/cli/src/content.ts), so
don't edit them by hand. Regenerate with:

```bash
pnpm sync:skills
```

To install them into your agent (Claude Code, Cursor, or AGENTS.md), run `npx ryux-rules` and pick
the concerns you want. Rules marked **[Required]** are a hard gate; the rest may be broken only
with a written reason.
