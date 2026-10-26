import { request, scenario } from "./client";

/** All amounts are in cents. Dates are ISO strings. */
export type Billing = {
  plan: {
    name: string;
    pricePerSeat: number;
    seats: number;
    interval: "month";
    currentPeriodStart: string;
    currentPeriodEnd: string;
  };
  usage: { label: string; used: number; limit: number; unit: string }[];
  paymentMethod: { kind: "card"; last4: string; expMonth: number; expYear: number; holder: string } | null;
  lastPayment: { status: "succeeded" | "failed"; amount: number; attemptedAt: string; failureReason?: "card_declined" | "insufficient_funds" | "expired_card" };
  invoices: { id: string; number: string; issuedAt: string; amount: number; status: "paid" | "open" | "failed" }[];
};

const BASE: Billing = {
  plan: { name: "Team", pricePerSeat: 1200, seats: 8, interval: "month", currentPeriodStart: "2026-10-01T00:00:00Z", currentPeriodEnd: "2026-10-31T23:59:59Z" },
  usage: [
    { label: "Storage", used: 412, limit: 500, unit: "GB" },
    { label: "Automation runs", used: 7300, limit: 10000, unit: "runs" },
  ],
  paymentMethod: { kind: "card", last4: "4242", expMonth: 8, expYear: 2027, holder: "Ana Ruiz" },
  lastPayment: { status: "succeeded", amount: 9600, attemptedAt: "2026-10-01T06:00:00Z" },
  invoices: [
    { id: "in_6", number: "INV-0006", issuedAt: "2026-10-01T06:00:00Z", amount: 9600, status: "paid" },
    { id: "in_5", number: "INV-0005", issuedAt: "2026-09-01T06:00:00Z", amount: 9600, status: "paid" },
    { id: "in_4", number: "INV-0004", issuedAt: "2026-08-01T06:00:00Z", amount: 8400, status: "paid" },
    { id: "in_3", number: "INV-0003", issuedAt: "2026-07-01T06:00:00Z", amount: 8400, status: "paid" },
    { id: "in_2", number: "INV-0002", issuedAt: "2026-06-01T06:00:00Z", amount: 7200, status: "paid" },
    { id: "in_1", number: "INV-0001", issuedAt: "2026-05-01T06:00:00Z", amount: 7200, status: "paid" },
  ],
};

function forScenario(s: string): Billing {
  switch (s) {
    case "payment-failed":
      return {
        ...BASE,
        lastPayment: { status: "failed", amount: 9600, attemptedAt: "2026-10-01T06:00:00Z", failureReason: "card_declined" },
        invoices: [{ ...BASE.invoices[0], status: "failed" }, ...BASE.invoices.slice(1)],
      };
    case "over-limit":
      return { ...BASE, usage: [{ label: "Storage", used: 530, limit: 500, unit: "GB" }, BASE.usage[1]] };
    case "empty":
      return { ...BASE, paymentMethod: null, invoices: [] };
    default:
      return BASE;
  }
}

export function getBilling(): Promise<Billing> {
  return request(() => forScenario(scenario()));
}
