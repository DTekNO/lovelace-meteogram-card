# Meteogram Card 2026.11.0
<!--
Release-notes recipe (kept here so each release reads the same):
  1. Copy the newest section of CHANGELOG.md below this heading, verbatim.
  2. Update the compare link.
  3. Keep the "About" pitch short and current — add a bullet only when a release
     adds a capability users would choose the card for. The README stays the
     reference; this is the shop window.
Paste the whole file (minus this comment) as the GitHub release body.
-->

### Changed

- **The card asks met.no for less.** Two of their requirements were not being met. Repeated
  requests now carry `If-Modified-Since`, so an unchanged forecast comes back as a bodyless
  `304` instead of a fresh download; the card already read the `Last-Modified` it needs for
  this and was discarding it. And the two timers that decide when to ask no longer fire on
  constants — met.no's edge hands every client in a coordinate cell the same absolute
  expiry, so a fixed offset made every device sharing a cell fire in the same instant and
  stay locked there. The refresh is now spread over a minute to five minutes past expiry,
  never earlier, and the retry after a failure is spread either side of its nominal delay.
- **Altitude is described as recommended rather than optional.** met.no place the forecast
  vertically using it, and without one fall back to a coarse global elevation model, which
  in anything but flat country is enough to shift the whole temperature curve. The editor
  now says so, says that the altitude comes from your Home Assistant location by default,
  and says to set it when you configure a custom location — which is the case where there
  is no elevation to inherit.

### Added
- **The redraw log says which card element wrote each line, and the panel counts draws made on the page by what triggered them.** The log is shared by every card on the page and survives any of them being replaced, which is deliberate — a rebuild would otherwise erase the history of what came before it — but it meant a run of identical lines could not be attributed. Each line now carries the element's number, so one card redrawing repeatedly is distinguishable from several cards each redrawing once, and the numbers climbing shows how often Home Assistant is replacing the card. The panel also reports a running count of draws per trigger since the page loaded — for the page rather than the one card, matching the list beneath it, which is what the label says. Twenty log entries cover very little of a wall panel's day and the unusual ones are the first to be evicted; a count cannot be evicted, and answers what is redrawing a card without anyone having to catch it in the act.

### Fixed
- **Coordinates are truncated where the met.no URL is built.** The four-decimal limit their
  terms set — 5 or more returns a 403 on newer products, and full precision also defeats
  their edge cache by giving every installation a unique URL — was written out at five
  separate places, while the one piece of code that actually composes the URL trusted
  whatever it was handed. It is enforced at that point now, and the three places that built
  the request object have become one.

- **The card recovers on its own after a weather service outage.** It did not. The periodic refresh is armed only once a forecast has been fetched successfully, and a failure that still has cached data to draw completes normally rather than raising — so the retry that handles a raised error never ran either. A card first opened while met.no was down therefore armed nothing at all: it drew the cached forecast once and sat there, never asking again and never redrawing, so the chart stopped advancing as the hours passed and stayed that way after the service came back. The same gap had an opposite mode, where a card that *had* fetched successfully went back to met.no every sixty seconds for the length of the outage — the polling the forecast cache exists to prevent, and a ban would land on every user of the card at once. A failed fetch now schedules its own retry, waiting five minutes, then ten, twenty, forty, and an hour thereafter: a brief outage costs one request and clears in five minutes, a long one costs one request an hour, and either way the chart redraws when the forecast returns.

- **The information icon shows whether the card is actually working.** Two things stopped it. The icon was coloured from a flag set by the first successful fetch and never cleared, and that flag was tested first — so a card that had ever worked stayed green through every later failure. And the glyphs were emoji, drawn by the platform's own colour font, which ignores the colour the card sets: side-by-side screenshots of a healthy card and a broken one were indistinguishable. The icon is now drawn as a shape that takes the colour, and reports four states — blue before anything has been tried, green when the forecast is current, amber when the service is unreachable but a cached forecast is still on screen, and red when there is nothing to show. Amber and red differ in shape as well as colour, and the icon's tooltip gives the state in words along with when the next attempt is due.

- **A weather API error no longer hides the card's own diagnostics.** The card renders its error text as HTML, and the body of the failed response was pasted into it unescaped — twice, once raw and once inside the diagnostics. When met.no's CDN answers with a styled HTML error page, that page renders *inside the card*, pushing the version, the client and the rest of the diagnostics off the bottom where nobody can reach them. The response body is now reduced to a single readable line that keeps the part worth having, such as which gateway failed, and the report says what the status means, when the last good forecast arrived and how stale the one on screen has become. Reported from an iPad during a met.no outage, where the card could show that something had failed and nothing about what.

- **A device with the wrong clock no longer refetches the forecast on every redraw.** How long a cached forecast stays good was stored as the absolute time met.no gave, and compared against the browser's clock — so a device running an hour fast considered every forecast expired the instant it arrived, and fetched again on every single draw. That is exactly the polling the cache exists to prevent, and it is a real configuration: a Raspberry Pi driving a wall panel has no battery-backed clock and starts at whatever time it last knew until the network corrects it. The card now stores how *long* a forecast is good for, taken from the difference between two headers in the same response, so it no longer matters whether either clock is right — only that met.no's is consistent with itself. The window is also bounded at both ends, so neither a malformed header nor an absent one can strand a card on stale weather or send it back immediately.
- **Two failure paths could turn into repeated calls to met.no.** The forecast cache exists so the card only calls the weather API at the cadence met.no dictates, and both of these quietly removed that limit. Storing the forecast can fail when the browser's storage for your Home Assistant is full, and because that happens at the end of a fetch it was treated as the *fetch* having failed — which clears the card's own one-minute rate limit and caches nothing, so the next redraw fetched again. Storing is now best-effort: the forecast serves the session from memory, and only the sharing of it with other browser tabs is lost until room appears. Separately, when met.no answers "too many requests" the card cleared that same rate limit, which is the opposite of what is being asked for; it now waits as long as met.no's response says to, and shows you the forecast it already has in the meantime.
- **A card Home Assistant is about to replace no longer draws a chart first.** On a panel dashboard Home Assistant re-attaches the live card and then replaces it about a second later, over and over — three times in half an hour in one recorded session. Each cycle the re-attached card built a complete chart and was thrown away a second after finishing it, so half of every draw it made was wasted. It now waits a couple of seconds before drawing, and either it has been replaced by then, costing nothing, or it survives and draws slightly later. It waits only while showing the chart it inherited from the card it replaced: with nothing on screen it still draws at once, because there a wait would be a blank card and nothing else.
- **A forecast whose expiry has already passed can no longer schedule an immediate refresh.** The refresh timer is armed a minute after the forecast expires and re-armed by every draw, so an expiry in the past computed a delay of zero — firing at once, forcing a redraw, and arming another zero-delay timer. Defensive: no card has been observed doing this, and a healthy forecast gives about half an hour.

**Full Changelog**: https://github.com/DTekNO/lovelace-meteogram-card/compare/v2026.8.3...v2026.11.0

---

### About Meteogram Card

A Lovelace card that draws a **meteogram** — the forecast as one chart rather than a row of
icons. Temperature, precipitation, cloud cover, pressure and wind share a single time axis,
so you read the shape of the coming weather instead of assembling it from tiles.

Data comes from the **Norwegian Meteorological Institute (MET Norway)**, either straight
from their API using your coordinates, or from any Home Assistant `weather` entity you
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
