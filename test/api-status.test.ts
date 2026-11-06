import { describe, expect, it } from "vitest";
import {
  API_RETRY_BACKOFF_MS,
  RETRY_JITTER,
  attributionStatus,
  jitteredRetryDelayMs,
  refreshDelayAfterExpiryMs,
  retryDelayMs,
} from "../src/api-status";

/**
 * Reported 05.11.2026: during a met.no outage the meteogram "stops sliding along and
 * doesn't recover when the service is back". Two iPad screenshots, one healthy and one
 * mid-outage, carried an identical blue ℹ️ — so the card could neither recover nor say
 * that it had not.
 */

const MIN = 60_000;

describe("retryDelayMs", () => {
  it("escalates, so a blip recovers fast and an outage does not hammer met.no", () => {
    expect(retryDelayMs(1)).toBe(5 * MIN);
    expect(retryDelayMs(2)).toBe(10 * MIN);
    expect(retryDelayMs(3)).toBe(20 * MIN);
    expect(retryDelayMs(4)).toBe(40 * MIN);
  });

  it("caps at an hour and stays there however long the outage runs", () => {
    expect(retryDelayMs(5)).toBe(60 * MIN);
    expect(retryDelayMs(50)).toBe(60 * MIN);
    expect(retryDelayMs(5000)).toBe(60 * MIN);
  });

  it("never returns zero, which would spin the re-arming timer", () => {
    for (const n of [-5, 0, 1, 2, 3, 4, 5, 99]) {
      expect(retryDelayMs(n)).toBeGreaterThanOrEqual(5 * MIN);
    }
  });

  it("is monotonic — a further failure never shortens the wait", () => {
    const seq = [1, 2, 3, 4, 5, 6, 7].map(retryDelayMs);
    for (const [a, b] of seq.slice(0, -1).map((v, i) => [v, seq[i + 1]])) {
      expect(b).toBeGreaterThanOrEqual(a);
    }
  });

  it("costs at most a handful of requests in the first hour of an outage", () => {
    let elapsed = 0;
    let calls = 0;
    for (let f = 1; elapsed < 60 * MIN; f++) {
      elapsed += retryDelayMs(f);
      calls++;
    }
    expect(calls).toBeLessThanOrEqual(5);
    expect(API_RETRY_BACKOFF_MS[API_RETRY_BACKOFF_MS.length - 1]).toBe(60 * MIN);
  });
});

describe("refreshDelayAfterExpiryMs", () => {
  /**
   * met.no's edge hands every client in a coordinate cell the same stored response with
   * the same absolute Expires — measured 06.11.2026, two requests 195 s apart returning
   * an identical `expires: 07:25:13`. A fixed offset therefore fires every device in the
   * cell at the same instant, and the next response re-syncs them.
   */
  it("never schedules before the expiry, which their terms forbid", () => {
    for (const r of [0, 0.0001, 0.5, 0.9999, 1]) {
      expect(refreshDelayAfterExpiryMs(() => r)).toBeGreaterThan(0);
    }
  });

  it("spreads over the asked-for 60–300 s", () => {
    expect(refreshDelayAfterExpiryMs(() => 0)).toBe(60_000);
    expect(refreshDelayAfterExpiryMs(() => 1)).toBe(300_000);
    expect(refreshDelayAfterExpiryMs(() => 0.5)).toBe(180_000);
  });

  it("actually varies, so two cards in one cell do not fire together", () => {
    const draws = new Set(
      Array.from({ length: 200 }, () => Math.round(refreshDelayAfterExpiryMs()))
    );
    expect(draws.size).toBeGreaterThan(100);
  });

  it("stays inside the window, so a refresh never slips a whole cycle", () => {
    for (let i = 0; i < 500; i++) {
      expect(refreshDelayAfterExpiryMs()).toBeLessThan(32 * 60_000);
    }
  });
});

describe("jitteredRetryDelayMs", () => {
  it("keeps the mean on the nominal backoff", () => {
    const n = 20_000;
    let total = 0;
    for (let i = 0; i < n; i++) total += jitteredRetryDelayMs(1);
    expect(total / n).toBeCloseTo(retryDelayMs(1), -4);
  });

  it("spreads either side, since a stale forecast has no expiry left to respect", () => {
    expect(jitteredRetryDelayMs(1, () => 0)).toBeCloseTo(5 * MIN * (1 - RETRY_JITTER), 0);
    expect(jitteredRetryDelayMs(1, () => 1)).toBeCloseTo(5 * MIN * (1 + RETRY_JITTER), 0);
  });

  it("never returns zero or negative, which would spin the timer", () => {
    for (const f of [1, 2, 3, 4, 5, 20]) {
      for (const r of [0, 0.5, 1]) {
        expect(jitteredRetryDelayMs(f, () => r)).toBeGreaterThan(0);
      }
    }
  });

  it("breaks up a fleet that failed at the same instant", () => {
    // 1000 cards failing together, first retry. Without jitter every one of them
    // lands in the same millisecond.
    const landings = new Set(
      Array.from({ length: 1000 }, () => Math.round(jitteredRetryDelayMs(1)))
    );
    expect(landings.size).toBeGreaterThan(500);
  });
});

describe("attributionStatus", () => {
  it("is neutral before anything has been tried", () => {
    const s = attributionStatus(null, 0, false);
    expect(s.kind).toBe("idle");
    expect(s.message).toMatch(/no forecast fetched yet/i);
  });

  it("is green when the last fetch worked", () => {
    expect(attributionStatus(true, 0, true).kind).toBe("ok");
    expect(attributionStatus(true, 0, true).color).toBe("#388e3c");
  });

  it("does not stay green once fetching starts failing", () => {
    // The regression. `_lastApiSuccess` was set on the first success and never
    // cleared, and was tested first, so a card that had ever worked showed green
    // through every later failure.
    const s = attributionStatus(false, 1, true);
    expect(s.kind).not.toBe("ok");
    expect(s.color).not.toBe("#388e3c");
  });

  it("distinguishes 'stale but drawing' from 'nothing to draw'", () => {
    expect(attributionStatus(false, 1, true).kind).toBe("stale");
    expect(attributionStatus(false, 1, false).kind).toBe("down");
    expect(attributionStatus(false, 1, true).color).not.toBe(
      attributionStatus(false, 1, false).color
    );
  });

  it("says a cached forecast is cached, so nobody reads it as current", () => {
    expect(attributionStatus(false, 1, true).message).toMatch(/cached/i);
  });

  it("tells the viewer when the next attempt is, and it tracks the backoff", () => {
    expect(attributionStatus(false, 1, true).message).toContain("5 min");
    expect(attributionStatus(false, 3, true).message).toContain("20 min");
    expect(attributionStatus(false, 9, false).message).toContain("60 min");
  });

  it("gives each state its own colour, so the icon is never ambiguous", () => {
    const colors = [
      attributionStatus(null, 0, false),
      attributionStatus(true, 0, true),
      attributionStatus(false, 1, true),
      attributionStatus(false, 1, false),
    ].map((s) => s.color);
    expect(new Set(colors).size).toBe(4);
  });

  it("recovers to green the moment a fetch succeeds again", () => {
    expect(attributionStatus(false, 4, true).kind).toBe("stale");
    expect(attributionStatus(true, 0, true).kind).toBe("ok");
  });
});
