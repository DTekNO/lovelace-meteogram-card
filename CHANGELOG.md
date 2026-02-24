# Changelog

All notable changes to the Meteogram Card will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

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

## [3.2.1-beta] - Current

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

[Unreleased]: https://github.com/DTekNO/lovelace-meteogram-card/compare/v3.2.1-beta...HEAD
[3.2.1-beta]: https://github.com/DTekNO/lovelace-meteogram-card/releases/tag/v3.2.1-beta
