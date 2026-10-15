# 1. Data-heavy enterprise dashboard

**Prompt**

> Build the home screen of an operations dashboard as one HTML and CSS file, `index.html`. Product:
> a warehouse management tool. Users: shift supervisors at desktops, checking it many times per
> shift. Their task: see which inbound shipments and pick orders are behind, and act on them.
> Data available per order: ID, customer, items, due time, status (On time, At risk, Late,
> Blocked), assigned picker. Actions confirmed: open an order, reassign a picker. Widths: 1280
> and 1024. Anything else: not decided.

**Context given**: the prompt only. No brand, no design system.

**Expected**
- The first thing seen answers "what is behind and needs me": Late and Blocked first, with a count
  and a way in, not a row of decorative KPI tiles.
- A dense, scannable table or list (aligned numbers, sortable or grouped by status); status by text
  and color, not color alone.
- Reassign is reachable from the row; open order leads to a detail (or says it is out of scope).
- States: no orders behind (an empty state that says all is on time), loading, data failed to load,
  a very long customer name.
- Calm visual language: one accent for action, status colors with roles.

**Critical failures**: invented metrics (throughput, SLA %, revenue), invented actions (export,
escalate, chat) presented as working, charts with made-up trends, a landing-page layout.

**Gates**: PRODUCT, UX, UI, DESIGN SYSTEM, ACCESSIBILITY, RESPONSIVE (1280, 1024), EDGE CASES,
VISUAL QA, ANTI-SLOP.

**Verify**: render at 1280 and 1024; list every fact and action on the page against the prompt;
count the states present; check contrast of status text; tab through to Reassign.

**Evidence to count the run**: `index.html`, two screenshots, the fact list, the state count.
