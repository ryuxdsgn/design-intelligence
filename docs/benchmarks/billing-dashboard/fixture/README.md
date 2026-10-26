# Workspace admin

The admin app for a team workspace: React 18, TypeScript, Vite, Vitest.

```bash
npm install
npm run dev        # http://localhost:5173
npm run typecheck
npm test
npm run build
```

## Where things live

- `src/styles/tokens.css`: colors, spacing, radii, and type. Use a token; add one here before using a new value.
- `src/components/`: shared components (Button, Card, Badge, Table, Banner, EmptyState, Skeleton), exported from
  `src/components/index.ts`, styled in `components.css`.
- `src/pages/`: one file per page, registered in `src/App.tsx`.
- `src/api/`: data access. The backend is faked in `client.ts`; add `?scenario=<name>` to the URL to see other
  cases: `slow`, `error`, `empty`, and for billing `payment-failed` and `over-limit`.
- `src/lib/`: pure helpers such as `formatMoney` and `formatDate`, with tests next to them.

Amounts from the API are in cents. Tests sit next to the file they test.
