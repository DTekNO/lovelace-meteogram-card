# Meteogram Card 2026.11.1
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

### Added

- **Redraw log identifies the card:** Each line carries the card element's number, and the
  panel counts draws per trigger for the whole page.

### Changed

- **Fewer and lighter requests to met.no:** Repeated requests send `If-Modified-Since`, so an
  unchanged forecast comes back as an empty `304`. The refresh and retry timers are jittered,
  so cards no longer fire in lockstep.
- **Altitude is recommended, not optional:** The editor says why it matters, that it comes from
  your Home Assistant location by default, and to set it when you configure a custom location.

### Fixed

- **Duplicate code removed and improved:** The request builder is rewritten to avoid duplicated code and comply with met.no truncating requirement only one place.
- **Recovers after a weather service outage:** A failed fetch schedules its own retry, backing
  off 5, 10, 20, 40 then 60 minutes, and redraws when the forecast returns. Before this a card
  could freeze until reloaded, or retry every 60 seconds for the length of the outage.
- **Information icon shows the real state:** Green when the forecast is current, amber when a
  cached one is on screen, red when there is nothing to draw — with the reason and the next
  retry in the tooltip.
- **API errors no longer hide the diagnostics:** The failed response is summarised to one line
  instead of being rendered into the card, and the report says what failed, when the last good
  forecast arrived and how stale the chart is.
- **A wrong device clock no longer refetches on every redraw:** Cache validity is stored as a
  duration rather than an absolute time.
- **Two failure paths no longer removed the rate limit:** A full browser storage quota is no
  longer treated as a fetch failure, and a 429 is honoured for as long as met.no asks.
- **No wasted chart draw before a replacement:** A re-attached card waits a moment before
  drawing, so one Home Assistant is about to replace costs nothing.
- **An expired forecast cannot schedule a zero-delay refresh:** The refresh timer is floored at
  one minute.

**Full Changelog**: https://github.com/DTekNO/lovelace-meteogram-card/compare/v2026.8.3...v2026.11.1

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
