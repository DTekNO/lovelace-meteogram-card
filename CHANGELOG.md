# Changelog

All notable changes to the Meteogram Card will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2026.11.0] - 2026.11.06

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


## [2026.8.3] - 2026.08.24

### Added
- **Diagnostics** - A "Copy diagnostics" button in the status panel, when `diagnostics: true`. The information panel reports the card's setup, lists recent redraws and which build it is running. This is useful if you encounter a problem and need to communicate rich information to the author.

### Changed
- **A small change of size no longer redraws the chart.** Opening the dashboard editor takes about ten pixels of width and a hundred of height from a card — around one and a half percent — and redrawing for that replaces every element in one frame, which reads as a jump to correct a difference too small to see. Changes within four percent of the size the chart was last drawn at are absorbed by scaling what is already on screen.
- **The information panel no longer calls optional forecast fields "missing".** It says they are not provided by your source, and no longer prints them in error red. Most weather sources supply only some of the optional fields — met.no publishes the precipitation range only inside the Nordic area, for instance — so seeing a few listed is the normal case, not a fault.

### Fixed
- **The information icon stays level with the date labels** instead of drifting as the card is resized.
- **Turning off the pressure curve now widens the chart**, rather than leaving the space its scale used.
- **A card using your Home Assistant location now uses your Home Assistant elevation too**, which is what the documentation has always described. met.no recommends supplying an altitude; without one it falls back to a coarse global elevation model.
- **Editing a dashboard no longer leaves the card redrawing itself afterwards.** Every trip in and out of edit mode left another set of event listeners behind, which also kept the discarded card in memory.
- **A card that Home Assistant rebuilds no longer flashes empty.** 
- **The card appears about five times faster.** 
- **Returning to a backgrounded tab no longer shows two redraws in a row.** 
- **The card appears about a third faster after Home Assistant rebuilds it.**
- **The card could grow until it filled the screen, in a panel dashboard.** ([#46](https://github.com/DTekNO/lovelace-meteogram-card/issues/46))
- **A card left running on an always-on panel could show a stale forecast after the screen woke.** 
- **Very short cards could fail to draw parts of the chart.** 
- **The opening animation no longer replays when Home Assistant replaces the card.**
- **The status panel no longer mixes time zones.**
  
### Documentation
- **The forecast fields the card uses are documented**
  
## [2026.8.2] - 2026.08.20

**New animation feature.** When the forecast advances an hour, the whole meteogram travels
with it: the temperature, pressure and cloud lines flow to their new shapes, rain bars
grow and shrink where they stand, and wind barbs and weather icons slide along.

The way the card draws is completely overhauled. Until now the chart was thrown away and
reconstructed from nothing on every redraw; it is no longer wiped for every update, but
updated on the fly. This also means there is no more annoying blinking when it redraws.

The visual editor has been rebuilt to use the Home Assistant schema. It looks better, and
it matches the settings editors on other cards.

### Added
- **Animated updates.** On by default; turn it off with `animate: false` or from the visual editor.
  - Resizing the card is not animated — elements sliding about while you drag would be noise rather than information.
- **The sunrise and sunset times are printed on the strip** wherever there is room for them, so the card needs no interaction to be read. Where the forecast is too compressed they fall back to a marker alone, and the times stay available on hover or tap.
- **Sunrise and sunset are marked with MDI icons** rather than a sun and a moon, coloured to match the band each one leads into.
- `layout_mode` is now available in the visual editor instead of YAML only.

### Changed
- **The rebuilt editor changes three things you will notice:**
  - **Latitude and longitude are always editable.** They used to grey out whenever a weather entity was selected. That became wrong when the sun strip arrived: sunrise and sunset are computed from these coordinates no matter what supplies the forecast, so a weather entity for another location drew the wrong sun times with no way to correct them.
  - **The forecast length and aspect ratio are each a single field** that accepts a listed value or one you type, replacing the old dropdown plus separate "custom" box.
  - **Invalid settings are rejected rather than quietly ignored** — coordinates out of range, for instance.
- **A card with no coordinates now says so** instead of silently drawing the weather for London. The card falls back to Home Assistant's location as before; only the hardcoded last resort is gone.

### Fixed
- **The chart no longer blinks when it redraws.** Four distinct causes, all fixed: redraw requests were discarded rather than queued, which could lose a change outright; the chart was emptied before the data arrived rather than swapped once its replacement was ready; it was drawn while its container still measured nothing; and every load drew it twice over.
- **The information icon overlapped the last date label.** It sits in the left-hand margin now.
- **The `show_precipitation` option never worked.** The card read it from a property that was never set, so precipitation was drawn for everyone whatever the setting said, and had been since the option was introduced. It is honoured now. **If you switched precipitation off, saw no change and left it off, it will now actually be hidden** — switch it back on if you want it.
- Coordinates of exactly 0 were treated as no location at all, so anywhere on the equator or the prime meridian failed to load.
- Turning on debug logging also forced the diagnostics panel open, which changed the layout you were trying to inspect. The two are independent now.

## [2026.8.1] - 2026.08.18

### Added
- **Sunrise/sunset strip**: a day/night band above the chart, amber for daylight and blue-grey for night, with a marker at each sunrise and sunset and a tick at local midnight. Hover any segment for its times. Enabled with `show_sun` (on by default) and available in the visual editor.
  - Sun times are computed from the card's coordinates, so they are correct for the whole forecast rather than just today, and polar day and night are handled properly.
  - Tooltips follow Home Assistant's language and its 12/24-hour setting, and are translated into all supported languages.
- **Weather icons are now bundled with the card** rather than fetched from GitHub on every render. The card no longer needs network access for icons, works offline, and cannot be affected by rate limiting.

### Fixed
- **The Title, Latitude, Longitude and Altitude fields were missing from the visual editor.** They were drawn with a Home Assistant form component that is no longer registered on the card-editor page, so they were present in the page but rendered nothing at all, while the help text beside them showed normally. They are ordinary text fields now and no longer depend on that component. Setting any of these options in YAML was never affected.
- Widening `meteogram_hours` did nothing — the forecast cache was being truncated in place, so the extra hours were no longer available to show.
- Switching `display_mode` did not redraw the chart, so `core` could keep showing `full`'s legends, and after `focussed` the legends never came back.
- Weather icons could silently disappear when GitHub rate-limited the request, and the card then retried twice per icon, making it worse.
- The diagnostics panel appeared for everyone on a beta build instead of only when asked for.
- Day/night weather icons were chosen from the sun's position *at page load*, so every hour beyond today could be wrong.

## [2026.6.2] - 2026.06.19


### Added
- Danish translations
- Minor additions to the card

## [2026.6.1] - 2026.06.16

### Added
- Swedish translations

## [2026.5.1] - 2026.05.27

> Versioning moved from `3.x` semantic versions to calendar versions (`YYYY.M.patch`)
> with this release.

### Changed
- Chart rendering rebuilt on D3.js

## [3.2.7] - 2026.04.24

### Added
- Ukrainian translations

## [3.2.6] - 2026.03.02

### Fixed
- **Time axis labels now display correctly for all data resolutions**: Fixed issue where time labels disappeared completely when forecast data contains only hourly intervals (no 6-hourly data)
  - Added robust fallback logic that establishes time label patterns from any available data resolution
  - Supports weather services with varying intervals: 1h, 6h, 12h, 24h, or any combination
  - Tries progressive intervals (2h, 3h, 4h, 6h, 12h) to find optimal label spacing
  - Always ensures at least some time labels are displayed, even with unusual data patterns
  - For long forecasts (240+ hours), automatically selects appropriate label intervals to prevent overlap
  - Low-resolution section now uses consistent data point intervals (every 2nd or 4th point) rather than hour-of-day filtering, ensuring uniform spacing across entire forecast
  - Prevents overlapping labels at the transition between high-resolution and low-resolution data sections
  - Hour labels now display with leading zeros (e.g., "01", "09") for better readability and consistent label width

## [3.2.5] - 2026.02.28

### Added
- **Custom hours display**: The `meteogram_hours` configuration option now accepts arbitrary numeric values (e.g., `120` for 120 hours) in addition to the previous string format (e.g., `"48h"`)
- Enhanced editor UI with dropdown presets (8h, 12h, 24h, 48h, 72h, 96h, 120h, max) and a custom hours input option for any value
- Full backward compatibility with existing configurations using string format (`"8h"`, `"48h"`, etc.)
- Time-based calculation for mixed-resolution data: the parser now correctly calculates data points based on actual hours of coverage rather than data point count

### Fixed
- **Meteogram hours calculation with mixed-resolution data**: Fixed issue where numeric `meteogram_hours` values (e.g., `90`) were treated as data point counts instead of hours, causing incorrect behavior when forecast data transitions from hourly to 6-hourly intervals
  - The parser now walks the time array to calculate how many data points are needed to cover the requested hours
  - Properly handles mixed-resolution data (e.g., 90 hours correctly shows ~59 data points instead of capping at 88)
  - Always includes the complete timeslot containing the target end time (ceil behavior)
- **Improved label spacing for longer time ranges**: Fixed overlapping time labels along the bottom axis and rain labels, particularly noticeable in locales with longer time strings (e.g., German "14 Uhr")
  - Time labels now use `.getHours()` method directly for locale-independent hour values (always 0-23, no formatting issues)
  - Implemented dynamic label spacing based on measured text width instead of fixed intervals
  - Rain labels are now intelligently filtered to prevent overlap, prioritizing higher precipitation values
  - All label spacing adapts automatically to available space
- **Wind barbs now display correctly across entire forecast period**: Fixed issue where wind barbs disappeared after 48 hours when forecast data transitions from hourly to 6-hourly intervals
- Wind availability check now correctly validates both wind speed and wind direction data (previously only checked wind speed)
- Wind barb rendering now adapts to mixed-resolution data: uses 2-hour intervals for hourly data and 12-hour intervals for 6-hourly data
- Wind barb spacing is now timezone-agnostic and based on data index offsets rather than absolute time values

### Changed
- **Improved resilience during API outages**: When the Met.no API is temporarily unavailable, the card now continues to display the last cached forecast data instead of showing a full-screen error message
- The card leverages existing localStorage cache to maintain functionality during temporary API failures
- Error messages during API failures are now shown in the info tooltip (ℹ️) instead of covering the entire card
- The info icon changes to an alert icon (⚠️) with red color when displaying cached data due to an API error
- The tooltip displays a clear warning box when showing cached data, indicating the API is unavailable but the forecast is still visible

### Technical Details
- Enhanced error handling in `fetchWeatherData()` to return cached data from localStorage when API calls fail
- Modified render logic to only show full error display when no cached data is available
- Improved user experience during temporary network issues or Met.no API maintenance windows
- Wind barb rendering now detects data resolution transition points and adjusts visualization strategy accordingly

## [3.2.4] - 2026.02.14

### Added
- Czech translation

## [3.2.3] - 2026.02.14

### Added
- Dutch (NL) translation
- Polish (PL) translation

## [3.2.2] - 2026.01.08

### Fixed
- Temperature gradient wasn't transitioning through freezing point correctly

## [3.2.1] - 2025.12.04

### Fixed
- Temperature gradient wasn't transitioning through freezing point correctly

## [3.2.0] - 2025.11.24

### Added
- **Temperature Gradient Line**: The temperature line now features a color gradient that transitions from blue (cold/below freezing) to red/orange (warm/above freezing)
  - The gradient automatically calculates the freezing point position based on your temperature range
  - Fully backwards compatible: If you have set a custom `--meteogram-temp-line-color` CSS variable, your custom color will be used instead of the gradient
  - The gradient provides better visual differentiation of temperature ranges at a glance

### Notes
- No breaking changes in this release
- The temperature gradient is enabled by default. To use a solid color instead, set the `--meteogram-temp-line-color` CSS variable in your theme or card styles

## [3.1.3] - 2025.10.11

### Changed
- **BREAKING CHANGE**: The `styles:` config for the card now uses variable names without the `--` prefix (e.g., `meteogram-grid-color` instead of `--meteogram-grid-color`)
- You can now also specify dark mode overrides directly in your card config using a `modes: dark:` section inside `styles:` (just like in Home Assistant themes)
- The old `-dark` variable names are no longer supported in the config
- Much of the code is reorganized to facilitate easier extension and addition of new features later
- Improvements have been made to updating so that if you are running an "always on" wall panel, the meteogram will update and hopefully not continue to show you stale data

## [3.0.3] - 2025.09.25

### Fixed
- **Wind Barb Direction Correction**: Wind barbs now correctly point in the direction the wind is blowing from (meteorological standard), rather than the direction the wind is blowing to
  - This change aligns with standard meteorological conventions and improves the accuracy of wind representation in the chart
  - For example, a wind barb pointing to the right indicates wind coming from the east (i.e., an easterly wind)
  - This change only affects the visual representation; the underlying wind direction data remains unchanged

## [3.0.2] - 2025.09.19

### Added
- **Optional Altitude for Met.no API**: You can now specify an `altitude` parameter in the card configuration. This is passed to the Met.no API for more accurate weather forecasts, especially in mountainous regions

### Changed
- **Improved Scaling for Legacy Dashboards (Experimental)**: The card now scales and sizes more reliably on dashboards that do not use Home Assistant's new sections layout
  - Note: This improved scaling is experimental and is not likely to be further developed or improved in the future

## [3.0.1] - 2025.09.15

### Added
- **New Display Mode Feature**: The card now supports three display modes: `full` (all features and legends), `core` (minimal, no legend), and `minimal` (ultra-minimal, no title or attribution)
  - Select your preferred mode with the `display_mode` config option
  - The legacy `focussed` option is now fully replaced by `display_mode`
  - Migration from old configs is automatic—if you previously used `focussed: true`, it will be converted to `display_mode: minimal`

### Fixed
- **Fahrenheit Double Conversion Bug**: Fixed an issue where weather entities using Fahrenheit as the main unit would sometimes display temperatures incorrectly due to double conversion
- **iOS API Connectivity**: Previous issues retrieving data from the Met.no API on iOS devices now appear to be resolved

### Changed
- **Sizing Improvements for Section View**: Chart sizing and layout have been improved for Home Assistant's section view, ensuring better fit and appearance in dashboards

## [3.0.0] - 2025.09.12

### Added
- **Weather Entity Support**: You can now use any Home Assistant weather entity as the data source for the meteogram
  - Set `entity_id` in your card config
  - See README.md for details and limitations
- **Entity Caching**: Forecasts from weather entities are cached in localStorage keyed by entity ID
  - Multiple entities can be cached and retrieved independently
- **Focus Mode**: New `focussed` option for a minimal chart display
  - When enabled, the card hides the title and attribution, showing only the chart—ideal for dashboards and kiosk views

### Changed
- **Met.no API remains supported**: If no `entity_id` is specified, the card uses the Met.no API as before
- **Automatic sizing**: The card now automatically sizes to its container (no more fillContainer option)
- **Chart Sizing & Margin Fixes**: The chart now fills the card correctly in all configurations, especially when pressure is not shown
- **Responsive Rendering**: Improved logic for chart width and margins ensures the meteogram adapts smoothly to all container sizes and modes

### Fixed
- Fixed chart layout issues when pressure is not displayed
- Improved handling of edge cases for chart rendering and data availability

## [2.1.0] - 2025.08.26

### Added
- **Multi-Language Support**: The card now automatically adapts labels, tooltips, and chart text to your Home Assistant language setting
  - Supported languages: English, French, German, Spanish, Norwegian, and Italian

### Changed
- **API Migration**: All weather data is now fetched from the Met.no API subdomain dedicated to Home Assistant, ensuring continued service and compliance with Met.no requirements
- **Improved Error Handling**: Enhanced diagnostics for API errors, including localized error messages

### Notes
- Some iOS users report intermittent issues retrieving data from the Met.no API. This appears to be related to iOS network or browser restrictions and is outside the control of the card

## [2.0.0] - 2025.08.19

### Added
- **Fully Themeable Chart with Light & Dark Mode Support**: Every chart element is now fully themeable using CSS variables, with dedicated support for both light and dark mode
  - All chart elements use CSS variables for color and style
  - Each variable has a dark mode counterpart (e.g. `--meteogram-temp-line-color-dark`)
  - Snow bars are now themeable (`--meteogram-snow-bar-color`, `--meteogram-snow-bar-color-dark`)
  - No more repeated fallback colors—everything is centralized and easy to override
  - See STYLES.md for the full list of variables

### Notes
- Some defaults for colours or fonts may have changed in this release and the appearance may be slightly different from previous versions

## [1.0.9] - 2025.08.18

### Added
- **Temperature Unit Respect**: The card now uses the system temperature unit from Home Assistant (`°C` or `°F`) for all temperature displays
  - Temperatures are converted from Celsius to Fahrenheit as needed
- **API Success Indicator**: The API success flag now has three states:
  - Not Called / Cached: Green X (❎) with tooltip "cached"
  - Success: Green tick (✅) with tooltip "success"
  - Failed: Red X (❌) with tooltip "failed"
- **API Success Icon in Attribution**: The API success icon (with tooltip) is now shown next to the met.no attribution at the top right of the card
- Tooltips added to all API success indicators for clarity

### Changed
- **Dark Mode Improvements**: The card now better adapts to Home Assistant's dark mode, ensuring good contrast and readability

### Fixed
- Minor improvements to chart rendering and error handling
- Fixed bug in cloud cover shading where it would not display correctly

## [1.0.8] - 2025.08.18

### Added
- Added custom CSS variables for all chart elements improved theming and customization

### Fixed
- Ensured all grid lines consistently use the correct color variable in dark mode

### Changed
- Improved style variable naming conventions for better maintainability and conflict avoidance

## [1.0.7] - 2025.08.15

### Changed
- Now included in HACS
- Updated documentation
- Added preview in card-picker

## [1.0.6] - 2025.08.15

### Added
- **Improved Caching Strategy**: Weather data is now cached per location, reducing API calls and improving performance
  - This update enhances compliance with Met.no API Terms of Service by minimizing unnecessary requests
- **Dark Mode Support**: The card automatically adapts to Home Assistant's dark mode, providing better visual comfort and contrast
- **Multiple Locations**: You can now specify custom coordinates, enabling support for multiple weather locations beyond the default Home Assistant setting
- **Alternative Time Periods**: The meteogram can display various time spans (12h, 24h, 48h, 54h, or max available), offering more flexibility in forecast visualization
- Improved API Compliance: The caching and request strategy have been refined to better align with Met.no API Terms of Service

## [1.0.5] - 2025.08.14

### Added
- Improved Caching Strategy: Weather data is now cached per location, reducing API calls and improving performance
- Dark Mode Support: The card automatically adapts to Home Assistant's dark mode
- Multiple Locations: You can now specify custom coordinates, enabling support for multiple weather locations
- Alternative Time Periods: The meteogram can display various time spans (12h, 24h, 48h, 54h, or max available)
- Improved API Compliance with Met.no API Terms of Service

## [1.0.4] - 2025.08.13

### Added
- **Pressure Line**: Added optional pressure (hPa) line and right-side axis. Toggle with `show_pressure` config
- **Cloud Cover Band**: Optional cloud cover shading and legend. Toggle with `show_cloud_cover` config
- **Wind Barbs**: Wind barbs now appear in a dedicated band below the chart. Toggle with `show_wind` config
- **Weather Icons Density**: Choose between dense (every hour) or sparse (every 2 hours) weather icons with `dense_weather_icons`
- **Visual Editor**: Full Home Assistant visual editor support for all options

### Changed
- **Improved Caching**: Caching is now per-location, using 4 decimal places for latitude/longitude
  - Expired cache entries are cleaned up automatically
  - Handles API 304/429 responses and uses cache when possible
- **Improved Location Handling**: Card uses configured coordinates, Home Assistant location, or falls back to last-used or default (London)
  - All lat/lon values are consistently truncated to 4 decimals
- **Improved Responsive Design**: Chart resizes automatically with card/container
  - Improved layout for wide and narrow screens
- **Improved Error Handling**: User-friendly error messages for network, CORS, and API issues
  - Rate-limited error reporting to avoid log spam
- **Improved Dark Mode**: Better color contrast and support for Home Assistant dark mode
- **Improved Logging**: Debug logging enabled for beta versions
  - More detailed logs for cache, fetch, and rendering

### Fixed
- Rain/snow bars and labels now always align with correct hours
- Weather icons are loaded reliably and cached
- Chart no longer redraws unnecessarily or gets stuck on tab switches
- Handles missing or malformed cache gracefully

### Breaking Changes
- Caching is now per-location (4 decimal places)
- Some config options renamed for clarity (`show_cloud_cover`, `show_pressure`, etc.)

## [1.0.3] - 2025.08.12

### Fixed
- Corrected User-agent to refer to correct repository
- Improved logic reducing unnecessary calls to api

## [1.0.2] - 2025.08.11

### Added
- Enhanced error logging for weather data fetch failures, including response status and body for easier troubleshooting

### Changed
- **User-Agent Header Correction**: Updated the User-Agent header for Met.no API requests to reference the GitHub repository, ensuring API compliance and reducing fetch errors
- **Dark Mode Compliance**: Implemented automatic dark mode detection and styling. The card now adapts its appearance based on Home Assistant's theme or page CSS classes for better visual integration

### Fixed
- Minor fixes and code improvements for reliability and maintainability

### Previous Features
- Custom theme support with dark mode variants
- Configurable display modes (full, core, focussed)
- Support for both Met.no API and Home Assistant weather entities
- Diagnostic panel for troubleshooting
- localStorage caching with automatic cleanup of old entries
- Responsive design with aspect ratio support
- Weather icons from Met.no
- Wind barbs, cloud cover, precipitation, and pressure visualization
- Hourly forecast display (8h, 12h, 24h, 48h, 54h, or max)

---

[Unreleased]: https://github.com/DTekNO/lovelace-meteogram-card/compare/v3.2.6...HEAD
[3.2.6]: https://github.com/DTekNO/lovelace-meteogram-card/compare/v3.2.5...v3.2.6
[3.2.5]: https://github.com/DTekNO/lovelace-meteogram-card/compare/v3.2.4...v3.2.5
[3.2.4]: https://github.com/DTekNO/lovelace-meteogram-card/compare/v3.2.3...v3.2.4
[3.2.3]: https://github.com/DTekNO/lovelace-meteogram-card/compare/v3.2.2...v3.2.3
[3.2.2]: https://github.com/DTekNO/lovelace-meteogram-card/compare/v3.2.1...v3.2.2
[3.2.1]: https://github.com/DTekNO/lovelace-meteogram-card/compare/v3.2.0...v3.2.1
[3.2.0]: https://github.com/DTekNO/lovelace-meteogram-card/compare/v3.1.3...v3.2.0
[3.1.3]: https://github.com/DTekNO/lovelace-meteogram-card/compare/v3.0.3...v3.1.3
[3.0.3]: https://github.com/DTekNO/lovelace-meteogram-card/compare/v3.0.2...v3.0.3
[3.0.2]: https://github.com/DTekNO/lovelace-meteogram-card/compare/v3.0.1...v3.0.2
[3.0.1]: https://github.com/DTekNO/lovelace-meteogram-card/compare/v3.0.0...v3.0.1
[3.0.0]: https://github.com/DTekNO/lovelace-meteogram-card/compare/v2.1.0...v3.0.0
[2.1.0]: https://github.com/DTekNO/lovelace-meteogram-card/compare/v2.0.0...v2.1.0
[2.0.0]: https://github.com/DTekNO/lovelace-meteogram-card/compare/v1.0.9...v2.0.0
[1.0.9]: https://github.com/DTekNO/lovelace-meteogram-card/compare/v1.0.8...v1.0.9
[1.0.8]: https://github.com/DTekNO/lovelace-meteogram-card/compare/v1.0.7...v1.0.8
[1.0.7]: https://github.com/DTekNO/lovelace-meteogram-card/compare/v1.0.6...v1.0.7
[1.0.6]: https://github.com/DTekNO/lovelace-meteogram-card/compare/v1.0.5...v1.0.6
[1.0.5]: https://github.com/DTekNO/lovelace-meteogram-card/compare/v1.0.4...v1.0.5
[1.0.4]: https://github.com/DTekNO/lovelace-meteogram-card/compare/v1.0.3...v1.0.4
[1.0.3]: https://github.com/DTekNO/lovelace-meteogram-card/compare/v1.0.2...v1.0.3
[1.0.2]: https://github.com/DTekNO/lovelace-meteogram-card/releases/tag/v1.0.2
