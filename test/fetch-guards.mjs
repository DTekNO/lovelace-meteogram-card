// The failure paths around fetching, which all used to push the same way: more calls.
//
// The forecast cache is not an optimisation. It exists so the card only calls met.no at
// the cadence met.no dictates, because they ban clients that poll harder than their terms
// allow — and a ban lands on every user of the card at once. So the interesting bugs here
// are the ones where something going wrong quietly removes a rate limit.
import { chromium } from "playwright";
import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { extname, join, resolve } from "node:path";

const ROOT = resolve(import.meta.dirname, "..");
const MIME = { ".html": "text/html", ".js": "text/javascript", ".mjs": "text/javascript",
  ".json": "application/json", ".map": "application/json", ".css": "text/css" };
const server = await new Promise((ok) => {
  const sv = createServer(async (q, res) => {
    try {
      const p = join(ROOT, decodeURIComponent(q.url.split("?")[0]));
      const b = await readFile(p);
      res.writeHead(200, { "content-type": MIME[extname(p)] ?? "application/octet-stream" });
      res.end(b);
    } catch { res.writeHead(404).end(); }
  });
  sv.listen(0, "127.0.0.1", () => ok(sv));
});
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1000, height: 700 } });
const errors = []; page.on("pageerror", (e) => errors.push(String(e)));
let failed = false;
const check = (ok, label, extra = "") => {
  console.log(`  ${ok ? "ok  " : "FAIL"}  ${label}${extra ? "  (" + extra + ")" : ""}`);
  if (!ok) failed = true;
};

await page.goto(`http://127.0.0.1:${server.address().port}/dev.html`, { waitUntil: "load" });
await page.waitForFunction(() => {
  const s = document.querySelector("meteogram-card")?.shadowRoot?.querySelector("#chart svg");
  return s && s.querySelectorAll("*").length > 50;
}, null, { timeout: 60000 });

// ── a full localStorage must not read as a fetch failure ─────────────────────
// setItem throws QuotaExceededError when the origin is full. The call sits inside the
// fetch's try block, so the throw was caught as if the fetch had failed — clearing
// _lastFetchTime and with it the 60-second throttle, while caching nothing. The next draw
// fetched again. A full disk became a polling loop.
const quota = await page.evaluate(async () => {
  const api = document.querySelector("meteogram-card")._weatherApiInstance;
  const realSet = localStorage.setItem.bind(localStorage);
  let attempts = 0;
  localStorage.setItem = (k, v) => {
    if (k === "metno-weather-cache") {
      attempts++;
      const e = new Error("QuotaExceededError"); e.name = "QuotaExceededError"; throw e;
    }
    return realSet(k, v);
  };
  api._expiresAt = Date.now() - 1000;          // force it past the cache check
  api._lastFetchTime = null;                    // and past the throttle
  let threw = null, data = null;
  try { data = await api.getForecastData(); } catch (e) { threw = String(e.message ?? e); }
  const out = { threw, gotData: !!data?.time?.length, attempts,
    throttleIntact: api._lastFetchTime !== null };
  localStorage.setItem = realSet;
  return out;
});

check(quota.threw === null, "a storage failure is not raised as a fetch error",
  quota.threw ?? "no error");
check(quota.gotData, "the forecast is still served, from memory");
check(quota.throttleIntact,
  "and the 60-second throttle survives — this is the polling loop that used to start",
  `_lastFetchTime ${quota.throttleIntact ? "kept" : "CLEARED"}`);
check(quota.attempts >= 2, "one attempt is made to free room before giving up",
  `${quota.attempts} setItem attempts`);

// ── a 304 must keep the forecast, not raise ──────────────────────────────────
// If-Modified-Since is sent on every refresh once a forecast is held, so this is now
// the common path rather than an edge case. The branch handling it used to throw
// unconditionally — it was unreachable while nothing sent the header, and would have
// turned every unchanged forecast into an error card the moment one did.
const notModified = await page.evaluate(async () => {
  const api = document.querySelector("meteogram-card")._weatherApiInstance;
  const realFetch = window.fetch;
  let sentHeader = null;
  const nextExpiry = new Date(Date.now() + 30 * 60 * 1000);
  const lastMod = new Date(Date.now() - 10 * 60 * 1000).toUTCString();
  window.fetch = async (input, init) => {
    const url = typeof input === "string" ? input : input?.url ?? "";
    if (url.includes("met.no")) {
      sentHeader = (init?.headers ?? {})["If-Modified-Since"] ?? null;
      return new Response(null, { status: 304,
        headers: { expires: nextExpiry.toUTCString(), "last-modified": lastMod } });
    }
    return realFetch(input, init);
  };
  const held = api._forecastData;
  api._lastModified = lastMod;
  api._expiresAt = Date.now() - 1000;      // expired, so a fetch is due
  api._lastFetchTime = null;
  api._throttledUntil = 0;
  let error = null, served = null;
  try { served = await api.getForecastData(); } catch (e) { error = String(e.message ?? e); }
  const out = {
    sentHeader,
    error,
    servedSame: served === held && !!served?.time?.length,
    expiryMovedForward: api._expiresAt > Date.now(),
  };
  window.fetch = realFetch;
  return out;
});

check(notModified.sentHeader !== null,
  "If-Modified-Since is sent once a forecast is held",
  `header ${notModified.sentHeader ? "sent" : "MISSING"}`);
check(notModified.error === null,
  "a 304 is not an error", notModified.error ?? "no error");
check(notModified.servedSame,
  "the forecast already held is served unchanged");
check(notModified.expiryMovedForward,
  "and the expiry is re-armed, so the card does not refetch immediately");

// ── a 429 must hold the card off, not release it ─────────────────────────────
const rate = await page.evaluate(async () => {
  let check1 = false;
  const api = document.querySelector("meteogram-card")._weatherApiInstance;
  const realFetch = window.fetch;
  let calls = 0;
  const retryAt = new Date(Date.now() + 12 * 60 * 1000);
  window.fetch = async (input, init) => {
    const url = typeof input === "string" ? input : input?.url ?? "";
    if (url.includes("met.no")) {
      calls++;
      return new Response("slow down", { status: 429,
        headers: { expires: retryAt.toUTCString() } });
    }
    return realFetch(input, init);
  };
  // Empty in memory and in storage: getForecastData reloads from localStorage before it
  // considers fetching, and the harness stores a valid half-hour entry, so a stale
  // in-memory value alone would not reach the network.
  const held = api._forecastData;               // kept for the second case below
  localStorage.removeItem("metno-weather-cache");
  api._expiresAt = Date.now() - 1000;
  api._lastFetchTime = null;
  api._throttledUntil = 0;
  api._forecastData = null;                     // nothing to fall back on: the hard case
  let first = null;
  try { await api.getForecastData(); } catch (e) { first = String(e.message ?? e); }
  const afterOne = { calls, throttledFor: Math.round((api._throttledUntil - Date.now()) / 1000),
    lastFetchCleared: api._lastFetchTime === null };
  check1 = /too many requests/i.test(first ?? "");

  // With nothing held, an error is all there is to give.
  const bare = first;

  // With a forecast in hand, the back-off should serve it rather than error — and still
  // not reach the network. This is the case a real card is almost always in.
  api._forecastData = held;
  api._lastFetchTime = null;
  let second = null, secondData = null;
  try { secondData = await api.getForecastData(); }
  catch (e) { second = String(e.message ?? e); }
  const out = { ...afterOne, callsAfterTwo: calls, first, second,
    secondServed: !!secondData?.time?.length, bare };
  window.fetch = realFetch;
  return out;
});

check(rate.calls === 1, "the 429 came from one call", `${rate.calls} call(s)`);
check(rate.throttledFor > 600 && rate.throttledFor <= 3600,
  "the card holds off for as long as met.no asked, within bounds",
  `${rate.throttledFor}s (asked ~720s)`);
check(rate.lastFetchCleared,
  "the ordinary failure reset still happens — the back-off is kept elsewhere on purpose",
  `_lastFetchTime cleared: ${rate.lastFetchCleared}`);
check(rate.callsAfterTwo === 1,
  "so a second attempt does NOT reach met.no, which is the whole point",
  `${rate.callsAfterTwo} call(s) after two attempts`);
// Serving the forecast it already has beats both fetching and erroring: the data is a
// little old, which is a far smaller problem than the traffic that fetching it again
// would add to a server that has just asked for less.
check(rate.secondServed && rate.second === null,
  "meanwhile the reader still gets a forecast, from what is already held",
  rate.second ?? "served from cache");
check(/too many requests/i.test(rate.bare ?? ""),
  "with nothing held at all, the reason is surfaced instead of silence",
  rate.bare ?? "no error");

check(errors.length === 0, "no page errors", errors[0] ?? "");
await browser.close(); server.close();
console.log(failed ? "fetch-guards: FAILED" : "fetch-guards: ok");
process.exit(failed ? 1 : 0);
