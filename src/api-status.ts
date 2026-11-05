/**
 * When to ask met.no again after a failed fetch, and what the attribution icon says
 * while it is failing.
 *
 * Both were latent bugs rather than missing features, and they are here together
 * because they are two views of one fact — whether the last fetch worked.
 */

/**
 * Wait before retrying, by consecutive failure count; the last entry is the standing
 * cadence for as long as it keeps failing.
 *
 * There was no retry schedule at all, which is the bug this closes. The card's periodic
 * refresh is armed only `if (this.apiExpiresAt)`, and `apiExpiresAt` is assigned only on
 * the success path — while a failure that still has cached data to draw *resolves*
 * rather than throwing, so the draw chain's `.catch` never runs either. A card first
 * loaded during an outage therefore arms nothing: it draws the cached forecast once and
 * sits there, never retrying and never redrawing, so the chart stops sliding as the
 * hours pass. Reported from an iPad on 05.11.2026 during a met.no outage, with "Last
 * Data Fetch: not yet fetched" in the diagnostics — the tell that no fetch had ever
 * succeeded in that card's lifetime.
 *
 * The same gap has an opposite failure mode. Where a fetch *had* succeeded earlier,
 * `apiExpiresAt` is set but stale, the delay floors at MIN_REFRESH_DELAY_MS, and the
 * card asks met.no again every sixty seconds for the length of the outage. That is
 * exactly the "a failure path quietly removes a rate limit" shape the fetch guards exist
 * to prevent, and a ban lands on every user of the card at once.
 *
 * Hence escalation rather than a single interval. Five minutes recovers a brief blip at
 * the cost of one request; the cap means a long outage costs one request an hour.
 */
export const API_RETRY_BACKOFF_MS: readonly number[] =
  [5, 10, 20, 40, 60].map((m) => m * 60_000);

/** Delay before attempt number `failures + 1`. Clamped at both ends. */
export function retryDelayMs(failures: number): number {
  const i = Math.min(
    Math.max(Math.floor(failures) - 1, 0),
    API_RETRY_BACKOFF_MS.length - 1
  );
  return API_RETRY_BACKOFF_MS[i];
}

export type ApiStatusKind = "idle" | "ok" | "stale" | "down";

export interface ApiStatus {
  kind: ApiStatusKind;
  /** Hex, applied as `currentColor` to the icon. */
  color: string;
  /** Plain sentence for the title and the accessible name. */
  message: string;
}

/**
 * What the attribution icon should show.
 *
 * Ordered newest-fact-first. The card used to ask `_lastApiSuccess` first, and that flag
 * was set on the first success and never cleared, so a card that had ever worked stayed
 * green through every later failure — the opposite of what the icon is for.
 *
 * `hasData` separates the two kinds of outage: a cached forecast still on screen is
 * degraded, a blank card is broken, and calling both the same thing loses the
 * distinction that actually matters to someone looking at it.
 */
export function attributionStatus(
  statusApiSuccess: boolean | null,
  failures: number,
  hasData: boolean
): ApiStatus {
  if (statusApiSuccess === null) {
    return { kind: "idle", color: "#1976d2", message: "No forecast fetched yet" };
  }
  if (failures <= 0) {
    return { kind: "ok", color: "#388e3c", message: "Forecast up to date" };
  }
  const mins = Math.round(retryDelayMs(failures) / 60_000);
  const retry = `retrying in ${mins} min`;
  return hasData
    ? {
        kind: "stale",
        color: "#f57c00",
        message: `Weather service unavailable — showing cached data, ${retry}`,
      }
    : {
        kind: "down",
        color: "#b71c1c",
        message: `Weather service unavailable — ${retry}`,
      };
}
