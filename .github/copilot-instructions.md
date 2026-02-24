# GitHub Copilot Instructions for Meteogram Card

## Project Overview

This is a **Home Assistant Lovelace custom card** that displays weather forecasts as interactive meteogram charts using D3.js. The card supports both Home Assistant weather entities and the Met.no API as data sources.

**Tech Stack:**
- TypeScript + Lit Element (Web Components)
- D3.js v7 for SVG chart rendering
- Home Assistant Custom Card API
- localStorage for aggressive caching

## Core Architecture Principles

### 1. Dual Data Source Support

The card implements TWO distinct data retrieval patterns:

#### Weather Entity (Modern HA 2023.9+)
- Uses **subscription-based architecture** via `hass.connection.subscribeMessage`
- Forecast type: `'hourly'`
- **CRITICAL**: `entity.attributes.forecast` does NOT exist in modern HA - never reference it
- Service calls: `weather.get_forecasts` for manual refresh
- Cache: `meteogram-card-entity-weather-cache` (per-entity timestamps)

#### Met.no API
- Direct HTTP calls with User-Agent header required
- Cache: `metno-weather-cache` with `expiresAt` timestamps
- Respects API rate limits and caching headers

### 2. Intelligent Subscription Management

**Pause/Resume System:**
- Pauses subscriptions when tab is hidden or card scrolled out of view (saves CPU/battery)
- Resumes with data freshness check (compares `entity.last_updated` vs cached timestamp)
- Uses `IntersectionObserver` for viewport detection
- Uses `document.visibilitychange` for tab visibility

**When suggesting subscription code:**
- Always include pause/resume logic
- Always validate data freshness on resume
- Use `this._unsubWeather` pattern for cleanup

### 3. Two-Tier Cache Strategy

Both caches require the following arrays to be valid:
```typescript
['time', 'temperature', 'rain', 'rainMin', 'rainMax', 'snow', 
 'cloudCover', 'windSpeed', 'windGust', 'windDirection', 'symbolCode', 'pressure']
```

**Cache Operations:**
- Validate structure before use (arrays present and have length)
- Handle JSON parse errors gracefully
- Clean up entries older than 24h
- Never clear cache just because it's expired (fallback for offline mode)

### 4. Temperature Gradient Rendering

The temperature line uses a dynamic SVG gradient centered on 0°C (freezing point):

**Key Implementation Details:**
- Uses `gradientUnits="userSpaceOnUse"` for absolute SVG coordinate mapping
- Gradient spans from `yTemp(maxTemp)` to `yTemp(minTemp)` (actual temperature range)
- Color stops positioned at exact Y coordinates using `yTemp()` scale function
- Sharp transition AT 0°C: warm colors (red/orange) above, cold colors (blue) below
- Additional transitions at 20°C (deep red), 10°C (orange-red), -5°C (deep blue)

**Color Scale:**
- ≥20°C: Deep red (#cc0000)
- 10°C: Orange-red (#ff6600)
- 0°C: Light orange (#ff9933) → Light blue (#66b3ff) [sharp transition]
- -5°C: Deep blue (#0066cc)
- ≤-5°C: Very deep blue (#003d7a)

**CSS Compatibility:**
- Check for custom `--meteogram-temp-line-color` CSS variable
- If set, use custom color instead of gradient
- Never set stroke in CSS (breaks gradient) - apply in JavaScript conditionally

### 5. Wind Barb Rendering for Mixed-Resolution Data

Wind barbs display wind speed and direction using meteorological conventions. The card handles **mixed-resolution data** where forecasts transition from hourly (0-48h) to 6-hourly (48h+) intervals.

**Key Implementation Details:**
- **Data availability check**: Validate BOTH `windSpeed` AND `windDirection` arrays have non-null values
  - Previously only checked `windSpeed`, causing barbs to disappear when direction was missing
  - Wind barbs require both speed and direction to render
- **Resolution detection**: Detect transition point by comparing time intervals between data points
  - Hourly data: ~1 hour intervals
  - 6-hourly data: ~6 hour intervals
  - Transition typically occurs around index 52-53 in Met.no forecasts
- **Adaptive rendering**:
  - **Hourly section**: Place wind barbs between even-hour grid lines (every 2 hours)
  - **6-hourly section**: Place wind barbs every other data point (every 12 hours)
- **Timezone-agnostic**: Use index-based filtering (`i % 2 === 0`) rather than absolute time values
  - Ensures consistent spacing regardless of timezone or data start time
  - More robust than checking for specific hours like 00:00, 12:00

**Wind Barb Spacing Strategy:**
```typescript
// High-resolution (hourly): Every 2 hours
const highResIndices = [];
for (let i = 0; i < transitionIdx; i++) {
  if (time[i].getHours() % 2 === 0) highResIndices.push(i);
}

// Low-resolution (6-hourly): Every 12 hours = every other point
for (let i = 0; i < lowResIndices.length; i++) {
  if (i % 2 === 0) {  // Index-based, not time-based
    // Draw barb
  }
}
```

**Responsive Rendering:**
- Normal width: Show all calculated positions
- Narrow screens (`width < 400`): Skip additional barbs to prevent overlap
  - Hourly section: Every 4 hours
  - 6-hourly section: Every 24 hours

**Wind Speed Scaling:**
- Wind barb length scales with wind speed using `d3.scaleLinear()`
- Domain: `[0, max(15, maxWindSpeed)]`
- Range: `[minBarbLen, maxBarbLen]` based on screen width
- Convert all speeds to knots before drawing (meteorological standard)

**Gust Rendering:**
- Gust feathers drawn in orange/yellow on left side of barb
- Only shown when `gust > sustainedSpeed`
- Gracefully handles null gusts (common after 48h in Met.no data)

**Common Issues:**
- ❌ Only checking `windSpeed` availability → barbs disappear when `windDirection` missing
- ❌ Using absolute time checks (e.g., `hour === 12`) → breaks in different timezones
- ❌ Not detecting resolution transitions → inconsistent barb density
- ✅ Check both wind arrays, use index-based filtering, detect transitions dynamically

## Code Style Guidelines

### TypeScript Patterns

**Use strict null checks:**
```typescript
const temp = temperature[i];
return temp !== null ? yTemp(temp) : 0;  // NOT: yTemp(temperature[i] || 0)
```

**Validate arrays before use:**
```typescript
if (!cache?.data?.time?.length || !cache.data.temperature?.length) {
  throw new Error('Invalid cache structure');
}
```

**Private method naming:**
```typescript
private _debugLog(...args: any[]): void { }  // Private methods prefixed with _
public drawTemperatureLine(): void { }        // Public methods no prefix
```

### Debug Logging

Use three-tier logging approach:

```typescript
// Instance methods (require this.debug === true)
this._debugLog('🎨 Creating temperature gradient');

// Static methods (check localStorage)
if (localStorage.getItem('meteogram-debug') === 'true') {
  console.debug('Cleanup triggered');
}

// Beta versions only (diagnostics panel)
if (packageJson.version.includes('beta')) {
  // Show status panel
}
```

**Log Emoji Conventions:**
- 🎨 Chart/rendering operations
- ✅ Success/confirmation
- ⚠️ Warnings
- ❌ Errors
- 🔄 Cache operations
- 📡 API/subscription events

### D3.js Chart Rendering

**Always use window.d3:**
```typescript
const d3 = window.d3;  // D3 loaded globally via CDN
```

**SVG coordinate system:**
- Y=0 is at the top, Y=chartHeight at bottom
- Higher temperatures → lower Y values (closer to top)
- Use `yTemp.domain()` for [minTemp, maxTemp]
- Use `yTemp.range()` for [chartHeight, 0]

**Gradient calculations:**
```typescript
const freezingYPos = yTemp(0);  // Get Y position of 0°C
const offset = ((yPos - maxTempY) / (minTempY - maxTempY)) * 100;  // Calculate %
```

## Common Pitfalls to Avoid

### ❌ NEVER do these:

1. **Access entity.attributes.forecast** (removed in HA 2023.9+)
2. **Set stroke color in CSS for .temp-line** (breaks gradient)
3. **Use gradient with objectBoundingBox** (causes incorrect centering)
4. **Assume cache is valid** without validation
5. **Forget to pause subscriptions** when hidden
6. **Use d3.curveLinear** (use d3.curveMonotoneX for smooth lines)

### ✅ DO these instead:

1. Use subscriptions or `weather.get_forecasts` service
2. Apply stroke conditionally in JavaScript
3. Use `gradientUnits="userSpaceOnUse"` with Y coordinates
4. Wrap cache access in try-catch with validation
5. Implement pause/resume lifecycle
6. Use monotone curves for natural-looking temperature lines

## File Organization

**Key files to understand:**

- `src/meteogram-card-class.ts` - Main card lifecycle, config, rendering coordination
- `src/weather-entity.ts` - Weather entity subscriptions, data processing, cache
- `src/weather-api.ts` - Met.no API client, caching, location handling
- `src/meteogram-chart.ts` - D3.js chart rendering, gradient logic
- `src/meteogram-card-styles.ts` - CSS-in-JS, theme variables, dark mode
- `src/meteogram-card-editor.ts` - Visual editor UI, diagnostics panel
- `src/types.ts` - TypeScript interfaces, HomeAssistant types
- `src/conversions.ts` - Unit conversions (temperature, wind, pressure)
- `src/translations.ts` - Internationalization strings

## Development Workflow

**Build commands:**
```bash
npm run build:dev   # Development with watch mode
npm run build       # Production (minified)
```

**Testing focus areas:**
- Test with both weather entities and Met.no API
- Test tab visibility changes (pause/resume)
- Test cache cleanup and corruption recovery
- Test gradient with various temperature ranges (all above 0, all below 0, spanning 0)
- Test dark mode theme switching
- Verify localStorage cache structure

**Beta mode features:**
- Version with "beta" shows diagnostics panel below chart
- Shows API cache expiry, last render, last fetch timestamps
- Useful for debugging on devices without console access

## Browser Compatibility

**Required APIs:**
- localStorage, IntersectionObserver, document.visibilitychange
- CSS Custom Properties, SVG + linearGradient
- WebSocket (for HA connection)

**Supported:** Chrome/Edge 90+, Firefox 88+, Safari 14+, HA mobile apps

## When Writing New Code

1. **Always validate data structures** before accessing nested properties
2. **Include debug logging** with appropriate emoji prefixes
3. **Handle null/undefined** explicitly in temperature/weather data
4. **Use TypeScript types** from types.ts, avoid `any` when possible
5. **Test gradient edge cases**: all temps above 0, all below 0, spanning 0
6. **Check custom CSS variables** before applying defaults
7. **Implement proper cleanup** in disconnectedCallback
8. **Respect Met.no API** usage policies and caching headers

## Current Development Focus

The temperature gradient feature was recently reimplemented to:
- Fix incorrect centering (was using objectBoundingBox)
- Position gradient from actual temp range (not full chart height)
- Create sharp transition at 0°C (not ±5°C smoothing)
- Add extreme temperature colors (deep red ≥20°C, very deep blue ≤-5°C)

When working on gradient-related code, always test with temperature ranges that span, are above, or are below freezing point.
