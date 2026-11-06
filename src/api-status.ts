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

/**
 * How long after a forecast expires to ask for the next one.
 *
 * Spread, not a constant, and this is the one that matters most in normal running.
 * met.no's edge serves one stored response to every client in a coordinate cell, and
 * that response carries one absolute `Expires` — so a fixed offset makes every device
 * sharing the cell fire at the same instant, and the next response re-syncs them. It is
 * self-sustaining rather than transient. Their terms ask for exactly this: "Don't
 * schedule many requests at the same moment. Add a random offset so traffic is spread
 * evenly."
 *
 * One-sided deliberately. The spread is *after* the expiry and never before it, because
 * "Never repeat a request before the time in the Expires header" is also their rule, and
 * a symmetric jitter would breach it half the time. Four minutes of spread across a
 * ~32-minute cycle de-synchronises a cell without meaningfully ageing the forecast.
 */
export const REFRESH_SPREAD_MS = { min: 60_000, max: 300_000 } as const;

export function refreshDelayAfterExpiryMs(
  rand: () => number = Math.random
): number {
  const { min, max } = REFRESH_SPREAD_MS;
  return min + rand() * (max - min);
}

/**
 * Spread a retry so a fleet recovering from one outage does not arrive together.
 *
 * The backoff above is identical on every card, and an outage is the one event that
 * synchronises all of them — they fail at the same moment and would otherwise retry at
 * the same moment, repeatedly, for as long as it lasted. Symmetric here, unlike the
 * refresh: there is no Expires left to respect once the forecast is stale, so keeping
 * the mean on the nominal delay is the better property.
 *
 * Worth being plain about the limit: jitter removes the spike, not the volume. A fleet
 * large enough to exceed met.no's 20 requests per second when all of it needs data at
 * once still exceeds it, just spread over minutes instead of seconds.
 */
export const RETRY_JITTER = 0.4;

export function jitteredRetryDelayMs(
  failures: number,
  rand: () => number = Math.random
): number {
  const base = retryDelayMs(failures);
  return base * (1 + (rand() * 2 - 1) * RETRY_JITTER);
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
