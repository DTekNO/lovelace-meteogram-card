import { describe, expect, it } from "vitest";
import { WeatherAPI, agoText, escapeHtml, summariseBody } from "../src/weather-api";

/**
 * The card hands its error text to Lit as `.innerHTML`, so the error report is markup.
 *
 * On 04.11.2026 met.no's CDN answered a forecast request with 502 and a styled HTML
 * error page. The card pasted that body straight into the report, twice — once raw and
 * once inside the diagnostics — and the page rendered *inside the card*, pushing the
 * card's own diagnostics out of sight. The reporter could see that something had
 * failed and nothing about what, which is the opposite of what the diagnostics are for.
 *
 * The body below is the shape of the thing that did it.
 */
const GATEWAY_502 = `<html>
<head><title>502 Bad Gateway</title>
<style>body{font-family:sans-serif;background:#fff}h1{color:#c00}</style></head>
<body><h1>502 Bad Gateway</h1>
<p>The server returned an invalid or incomplete response.</p>
<hr><address>nginx/1.24.0</address>
<script>console.log("telemetry")</script>
</body></html>`;

function apiWithError(status: number | null, message: string): WeatherAPI {
  const api = new WeatherAPI(59.94, 5.48);
  api.lastStatusCode = status;
  api.lastError = new Error(message);
  return api;
}

describe("summariseBody", () => {
  it("keeps the words and drops the markup", () => {
    const out = summariseBody(GATEWAY_502);
    expect(out).toContain("502 Bad Gateway");
    expect(out).toContain("nginx/1.24.0");
    expect(out).not.toContain("<");
    expect(out).not.toContain(">");
  });

  it("discards script and style contents rather than flattening them in", () => {
    const out = summariseBody(GATEWAY_502);
    expect(out).not.toContain("telemetry");
    expect(out).not.toContain("font-family");
  });

  it("collapses whitespace to one line", () => {
    expect(summariseBody(GATEWAY_502)).not.toMatch(/\s\s|\n/);
  });

  it("truncates to the limit and marks that it did", () => {
    const out = summariseBody("x".repeat(500), 40);
    expect(out).toHaveLength(40);
    expect(out.endsWith("…")).toBe(true);
  });

  it("is empty for an empty or markup-only body, so no dangling separator", () => {
    expect(summariseBody("")).toBe("");
    expect(summariseBody("<br><hr>")).toBe("");
  });
});

describe("escapeHtml", () => {
  it("neutralises the characters that make markup", () => {
    expect(escapeHtml(`<a href="x">&</a>`)).toBe("&lt;a href=&quot;x&quot;&gt;&amp;&lt;/a&gt;");
  });

  it("renders null and undefined as nothing rather than as words", () => {
    expect(escapeHtml(null)).toBe("");
    expect(escapeHtml(undefined)).toBe("");
  });
});

describe("agoText", () => {
  const now = Date.UTC(2026, 10, 4, 12, 0, 0);
  it("reads in minutes up to two hours, then in hours", () => {
    expect(agoText(now - 41 * 60_000, now)).toBe("41 min ago");
    expect(agoText(now - 3 * 3600_000, now)).toBe("3 h ago");
  });
  it("handles the present and the future", () => {
    expect(agoText(now, now)).toBe("just now");
    expect(agoText(now + 20 * 60_000, now)).toBe("20 min from now");
  });
});

describe("getDiagnosticText", () => {
  it("does not let a gateway's HTML body into the report", () => {
    const api = apiWithError(502, `met.no returned 502 Bad Gateway — ${summariseBody(GATEWAY_502)}`);
    const out = api.getDiagnosticText();
    expect(out).not.toContain("<html");
    expect(out).not.toContain("<style");
    expect(out).not.toContain("<h1");
    expect(out).not.toContain("<address");
    // The one tag family the report is allowed to emit itself.
    expect(out.replace(/<\/?(br|b|code)>/g, "")).not.toContain("<");
  });

  it("defends itself even if the raw body reaches it unsummarised", () => {
    // The exact shape of the old bug: the thrown message *was* the HTML page, and the
    // report interpolated it unescaped. Both halves are now covered — the fetch path
    // summarises, and this strips and escapes again rather than trusting it to.
    const api = apiWithError(502, `Weather API returned 502: Bad Gateway\n${GATEWAY_502}`);
    const out = api.getDiagnosticText();
    expect(out).not.toContain("<html");
    expect(out).not.toContain("<style");
    expect(out).not.toContain("<h1");
    expect(out).toContain("Card version");
  });

  it("still says what failed, after the body has been stripped", () => {
    const api = apiWithError(502, `met.no returned 502 Bad Gateway — ${summariseBody(GATEWAY_502)}`);
    const out = api.getDiagnosticText();
    expect(out).toContain("502");
    expect(out).toContain("Bad Gateway");
    expect(out).toContain("nginx/1.24.0");
  });

  it("keeps the diagnostics visible, which is what the 502 page buried", () => {
    const api = apiWithError(502, "met.no returned 502 Bad Gateway");
    const out = api.getDiagnosticText();
    expect(out).toContain("Last good forecast");
    expect(out).toContain("API calls this session");
    expect(out).toContain("Card version");
    expect(out).toContain("Client");
  });

  it("reports the message once, not twice", () => {
    const api = apiWithError(502, "met.no returned 502 Bad Gateway");
    const out = api.getDiagnosticText();
    expect(out.match(/Bad Gateway/g)).toHaveLength(1);
  });

  it("says plainly when there is nothing to fall back on", () => {
    const out = apiWithError(502, "boom").getDiagnosticText();
    expect(out).toContain("none held");
    expect(out).toContain("why the chart is blank");
  });

  it("gives the age of the forecast on screen when one is being shown", () => {
    const api = apiWithError(502, "boom");
    const stamp = new Date(Date.now() - 41 * 60_000);
    (api as any)._forecastData = { fetchTimestamp: stamp.toISOString() };
    (api as any)._expiresAt = Date.now() - 11 * 60_000;
    const out = api.getDiagnosticText();
    expect(out).toContain("Last good forecast");
    expect(out).toContain("41 min ago");
    expect(out).toContain("expired at");
    expect(out).toContain("being shown anyway");
  });

  it("says a held forecast is still valid when it has not expired", () => {
    const api = apiWithError(null, "network down");
    (api as any)._expiresAt = Date.now() + 10 * 60_000;
    expect(api.getDiagnosticText()).toContain("valid until");
  });

  describe("the hint names the hop that failed", () => {
    const cases: Array<[number | null, string]> = [
      [502, "met.no or its CDN failed"],
      [503, "met.no or its CDN failed"],
      [429, "asking for less traffic"],
      [403, "terms of service"],
      [404, "Check latitude and longitude"],
      [null, "No HTTP response"],
    ];
    for (const [status, expected] of cases) {
      it(`${status ?? "no response"} → ${expected}`, () => {
        expect(apiWithError(status, "x").getDiagnosticText()).toContain(expected);
      });
    }
  });

  it("surfaces an active back-off, so a 429 does not look like a dead card", () => {
    const api = apiWithError(429, "throttled");
    (api as any)._throttledUntil = Date.now() + 5 * 60_000;
    expect(api.getDiagnosticText()).toContain("Backing off until");
  });
});
