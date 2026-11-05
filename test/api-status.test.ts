import { describe, expect, it } from "vitest";
import {
  API_RETRY_BACKOFF_MS,
  attributionStatus,
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
