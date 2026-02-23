# Changelog

All notable changes to the Meteogram Card will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

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
