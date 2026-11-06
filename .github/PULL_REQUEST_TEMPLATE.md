## What this changes

<!-- One or two sentences. What is different for someone using the card? -->

## Why

<!-- The problem being solved. If it fixes a reported fault, link the issue. -->

## How it was checked

<!-- Delete what does not apply. -->

- [ ] `npm test` (unit)
- [ ] `npm run build` **then** `npm run test:browser` — the Playwright tests load `dist/`,
      not `src/`, so an un-rebuilt bundle tests the previous code
- [ ] `npx tsc --noEmit`
- [ ] Loaded in a real dashboard and looked at it

---

## If this touches how the card talks to met.no — read this part

Skip this whole section if your change does not go near `weather-api.ts`,
`api-status.ts`, or the refresh and retry timers. If it does, every box matters.

met.no's terms cap **the whole card** — every installation together, not each user — at
20 requests per second. At roughly 59k downloads the normal steady state already sits
within a factor of two of that ceiling. A mistake here is not one user's problem; it
gets the card banned for everyone at once. The full reasoning, and what each rule is
protecting against, is in [`AGENTS.md`](../AGENTS.md) under
*Rules for talking to met.no*.

- [ ] **Nothing requests before `Expires`.** The cache gate still comes first, and any
      new fallback errs *long* rather than short.
- [ ] **Coordinates are truncated to 4 decimals** in the `WeatherAPI` constructor and
      not re-implemented anywhere else. (5+ decimals is a 403, and full precision
      defeats met.no's edge cache.)
- [ ] **`If-Modified-Since` is still sent** when a forecast is held, and `304` is still
      handled as success — re-arm the expiry, keep the data, never throw.
- [ ] **Every new or changed timer is jittered.** Refresh: expiry + 60–300 s, never
      earlier. Retry: backoff ±40%.
- [ ] **No fixed short retry has been introduced.** Failures escalate 5/10/20/40/60 min
      and reset on success.
- [ ] **No failure path clears a rate limit.** Check this one even if you think it does
      not apply — it has been the same bug three times in this file's history.
- [ ] **A failure still arms the next attempt.** Note that a failure with cached data
      *resolves* rather than throwing, so it never reaches a `catch`; if nothing
      schedules a retry the card freezes silently until reload.
- [ ] **An outage serves the stale chart** rather than fetching harder.
- [ ] **No second path to met.no** was added. Everything goes through
      `getForecastData`, which is where the gates are.
- [ ] **`npm run build && node test/fetch-guards.mjs` passes.** This suite exists
      specifically to protect the rules above.

**If the request cadence changes at all**, show the fleet arithmetic in the PR
description rather than reasoning about a single card: requests/hour per open view ×
concurrently open views. One view is ~1.82 req/h, and 20 req/s is crossed at roughly
39,500 concurrently open views.
