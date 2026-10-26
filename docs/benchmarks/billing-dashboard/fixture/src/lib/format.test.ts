import { formatDate, formatMoney } from "./format";

test("formats cents as dollars", () => {
  expect(formatMoney(9600)).toBe("$96.00");
  expect(formatMoney(123456)).toBe("$1,234.56");
});

test("formats an ISO date", () => {
  expect(formatDate("2026-10-01T00:00:00Z")).toMatch(/Oct 1, 2026|Sep 30, 2026/);
});
