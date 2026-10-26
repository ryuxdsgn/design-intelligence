const LOCALE = "en-US";

/** Amounts arrive in cents from the API. */
export function formatMoney(cents: number, currency = "USD"): string {
  return new Intl.NumberFormat(LOCALE, { style: "currency", currency }).format(cents / 100);
}

export function formatDate(iso: string): string {
  return new Intl.DateTimeFormat(LOCALE, { year: "numeric", month: "short", day: "numeric" }).format(new Date(iso));
}
