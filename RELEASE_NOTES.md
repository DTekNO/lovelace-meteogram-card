# Meteogram Card 2026.11.2
<!--
Release-notes recipe (kept here so each release reads the same):
  1. Copy the newest section of CHANGELOG.md below this heading, verbatim.
     Entries are headlines: a bold lead-in, then a sentence or two on what changed.
     The reasoning belongs in the commit message, not here.
  2. Update the compare link.
  3. Keep the "About" pitch short and current — add a bullet only when a release
     adds a capability users would choose the card for. The README stays the
     reference; this is the shop window.
Paste the whole file (minus this comment) as the GitHub release body.
-->

### Fixed

- **The card could not reach met.no at all after 2026.11.1:** `If-Modified-Since`, added in
  that release, is not a CORS-safelisted header, so it preflighted every request — and
  met.no does not support preflight. The browser refused to send the request and the card
  showed "Failed to fetch" with no status. It only bit once a forecast was cached, so the
  first fetch after installing worked and every one after it failed. The header is no
  longer sent, and a guard now strips anything that would preflight.

> Supersedes **2026.11.1**, which could not fetch from met.no at all once a
> forecast had been cached. If you are on 2026.11.1, update.

**Full Changelog**: https://github.com/DTekNO/lovelace-meteogram-card/compare/v2026.11.1...v2026.11.2

---

### About Meteogram Card

A Lovelace card that draws a **meteogram** — the forecast as one chart rather than a row of
icons. Temperature, precipitation, cloud cover, pressure and wind share a single time axis,
so you read the shape of the coming weather instead of assembling it from tiles.

Data comes from the **Norwegian Meteorological Institute (MET Norway)**, or from any Home Assistant `weather` entity you
already have.

**What the card does**

- **One chart, five variables** — temperature curve, precipitation bars with their
  uncertainty range, a cloud-cover band, a pressure line and wind barbs, on a shared axis
  of up to ten days.
- **Day and night** — a sunrise/sunset strip computed from your own coordinates, so the
  chart shows when the weather arrives relative to daylight.
- **Two data sources** — met.no directly, or a `weather` entity. The entity route reuses the
  forecast Home Assistant already holds, which is the lighter choice when several devices
  show the same card.
- **Altitude aware** — met.no place the forecast vertically from the altitude you give them;
  supplying one materially improves the result in hilly ground.
- **Survives an outage** — the forecast is cached, and the cached chart keeps being drawn
  while the weather service is unreachable, rather than the card going blank.
- **Built to be diagnosed** — an information icon that shows at a glance whether the data is
  current, stale or unavailable, and a status panel (`diagnostics: true`) reporting what was
  fetched, when, and what failed.
- **Layouts** — sections, panel and grid, with a configurable aspect ratio and a `focussed`
  display mode for a chart-only view.
