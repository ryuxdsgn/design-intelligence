/**
 * A fake backend for local development. Every request waits a little, like a network call.
 * Add ?scenario=<name> to the URL to see other cases, for example ?scenario=error.
 */
export function scenario(): string {
  return new URLSearchParams(window.location.search).get("scenario") ?? "default";
}

export class ApiError extends Error {}

export async function request<T>(data: () => T): Promise<T> {
  const s = scenario();
  await new Promise((r) => setTimeout(r, s === "slow" ? 3000 : 400));
  if (s === "error") throw new ApiError("The server did not respond.");
  return data();
}
