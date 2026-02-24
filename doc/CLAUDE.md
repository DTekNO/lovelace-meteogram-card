# Development Context for Claude AI

This document provides technical context about the Meteogram Card codebase for AI-assisted development. It captures key architectural decisions, implementation patterns, and debugging insights.

## Project Overview

**Meteogram Card** is a custom Home Assistant Lovelace card that displays weather forecasts as an interactive meteogram chart. It supports both Home Assistant weather entities and the Met.no API as data sources.

**Tech Stack:**
- TypeScript + Lit Element (Web Components)
- D3.js for SVG chart rendering
- Home Assistant Custom Card API
- localStorage for caching

## Architecture Patterns

### Data Sources

The card supports two data sources with different retrieval patterns:

#### 1. Weather Entity API (Modern HA 2023.9+)
**Subscription-Based Architecture:**
```typescript
// Primary: Real-time subscription updates
hass.connection.subscribeMessage(
  (msg) => this._handleForecastUpdate(msg),
  { type: 'weather/subscribe_forecast', entity_id, forecast_type: 'hourly' }
);

// Fallback: localStorage cache for offline/stale scenarios
// NO entity.attributes.forecast - this was removed in modern HA!
```

**Key Implementation Details:**
- **Subscription lifecycle**: Automatic pause when hidden, resume with freshness check
- **Data freshness**: Compares `entity.last_updated` vs cached timestamp on resume
- **Service calls**: Uses `weather.get_forecasts` for manual refresh when entity state is newer
- **Cache format**: `meteogram-card-entity-weather-cache` with per-entity timestamps

#### 2. Met.no API
**HTTP-Based with Caching:**
```typescript
// Direct API calls with extensive caching
const response = await fetch(apiUrl, {
  headers: { 'User-Agent': 'HomeAssistant/lovelace-meteogram-card github.com/...' }
});

// Cache format: metno-weather-cache with expiresAt timestamps
```

### Subscription Management

**Intelligent Pause/Resume System:**
```typescript
// Tab visibility changes
document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    this._pauseWeatherSubscription('tab hidden');
  } else {
    this._resumeWeatherSubscription('tab visible');
  }
});

// Element visibility (IntersectionObserver)
// Pauses when scrolled out of view, resumes with freshness check
```

**Benefits:**
- Reduces CPU/battery usage for hidden tabs
- Ensures data is current when tab becomes visible
- Handles multiple cards efficiently

### Cache Management

**Two-Tier Cache System:**

#### Entity Cache
```typescript
// Storage key: 'meteogram-card-entity-weather-cache'
{
  [entityId: string]: {
    timestamp: number,      // Unix timestamp
    data: ForecastData      // Processed forecast arrays
  }
}
```

#### Met.no Cache
```typescript
// Storage key: 'metno-weather-cache'
{
  "forecast-data": {
    [locationKey: string]: {
      expiresAt: number,    // Unix timestamp
      data: ForecastData
    }
  }
}
```

**Cache Cleanup Strategy:**
- **Age-based**: Removes entries older than 24h
- **Validation**: Checks for required arrays on load/save
- **Corruption recovery**: Clears entire cache on JSON parse errors
- **Format migration**: Automatically converts old format entries
- **Startup cleanup**: Once-per-session comprehensive cleanup

**Required ForecastData Arrays:**
```typescript
['time', 'temperature', 'rain', 'rainMin', 'rainMax', 'snow', 
 'cloudCover', 'windSpeed', 'windGust', 'windDirection', 'symbolCode', 'pressure']
```

## Chart Rendering

### Temperature Gradient Feature

**Dynamic Color Gradient:**
```typescript
// Creates SVG linear gradient from blue (cold) to red (warm)
const gradient = defs.append("linearGradient")
  .attr("id", gradientId)
  .attr("y1", "100%")  // Bottom = cold
  .attr("y2", "0%");   // Top = warm

// Calculate freezing point position
const freezingPercent = ((0 - tempMin) / (tempMax - tempMin)) * 100;

// Gradient stops: blue → light blue → neutral → orange → red
```

**Backwards Compatibility:**
```typescript
// Check if user has custom color set
const customColor = getComputedStyle(card).getPropertyValue('--meteogram-temp-line-color');
if (customColor?.trim()) {
  tempPath.style("stroke", customColor);  // Use custom color
} else {
  tempPath.attr("stroke", `url(#${gradientId})`);  // Use gradient
}
```

### CSS Variable System

**New Format (v3.2.0+):**
```yaml
styles:
  meteogram-grid-color: "#1976d2"
  modes:
    dark:
      meteogram-grid-color: "#444"
```

**Old Format (deprecated):**
```yaml
styles:
  --meteogram-grid-color: "#1976d2"
  --meteogram-grid-color-dark: "#444"
```

**Implementation Note:** CSS only sets `stroke-width` and `fill` for `.temp-line`. The stroke color is applied conditionally in JavaScript to allow gradient to work.

### Wind Barb Rendering

**Mixed-Resolution Data Handling:**

Met.no forecasts transition from hourly data (0-48h) to 6-hourly data (48h+), requiring adaptive rendering:

```typescript
// Detect transition by checking time intervals
const intervals: number[] = [];
for (let i = 1; i < N; i++) {
  const intervalHours = (time[i].getTime() - time[i-1].getTime()) / (1000 * 60 * 60);
  intervals.push(intervalHours);
}

// Find where interval jumps from ~1h to 6h
let transitionIdx = N;
for (let i = 1; i < intervals.length; i++) {
  if (intervals[i-1] < 3 && intervals[i] >= 4) {
    transitionIdx = i;
    break;
  }
}
```

**Rendering Strategy:**

1. **High-resolution section (hourly data):**
   - Find even-hour indices: `time[i].getHours() % 2 === 0`
   - Place wind barbs between consecutive even hours
   - Results in barbs every 2 hours

2. **Low-resolution section (6-hourly data):**
   - Use every other data point: `i % 2 === 0`
   - Place wind barbs directly at data points
   - Results in barbs every 12 hours
   - **Timezone-agnostic**: Index-based, not time-based

**Data Availability Check:**
```typescript
// CRITICAL: Check BOTH speed AND direction
this._dataAvailability.wind =
  Array.isArray(data.windSpeed) &&
  data.windSpeed.some((val) => val !== null && typeof val === "number") &&
  Array.isArray(data.windDirection) &&
  data.windDirection.some((val) => val !== null && typeof val === "number");
```

**Why This Matters:**
- Wind barbs require both speed and direction to render
- Previously only checked `windSpeed`, causing barbs to disappear when `windDirection` was present but `windGust` was null
- The rendering code at line 759 of meteogram-chart.ts skips if either is missing:
  ```typescript
  if (typeof speed !== 'number' || typeof dir !== 'number' || isNaN(speed) || isNaN(dir)) continue;
  ```

**Responsive Behavior:**
- Normal screens: Show all calculated positions
- Narrow screens (`width < 400`):
  - Hourly section: Skip odd indices (every 4 hours)
  - 6-hourly section: Show every 4th point (every 24 hours)

**Wind Speed Conversions:**
- All speeds converted to knots for barb calculation (meteorological standard)
- Barb length scales with speed using `d3.scaleLinear()`
- Domain: `[0, max(15, maxWindSpeed)]`
- Range: `[18-23, 30-38]` pixels based on screen width

**Gust Handling:**
- Gusts drawn as orange feathers on left side of barb
- Only shown when `gust > sustainedSpeed`
- Gracefully handles null gusts (common after 48h):
  ```typescript
  const gustInKnots = typeof gust === 'number' && !isNaN(gust) 
    ? convertWindSpeed(gust, windSpeedUnit, "kt") 
    : null;
  ```

## Debug Logging System

**Three-Tier Approach:**

### 1. Instance Methods
```typescript
class MeteogramCard {
  debug: boolean;  // From config
  
  private _debugLog(...args: any[]): void {
    if (this.debug) {
      console.debug(...args);
    }
  }
}
```

### 2. Static Methods
```typescript
static cleanup(): void {
  if (localStorage.getItem('meteogram-debug') === 'true') {
    console.debug('Cleanup triggered');
  }
}
```

### 3. Startup Functions
```typescript
function initialize() {
  if (localStorage.getItem('meteogram-debug') === 'true') {
    console.debug('Initializing card');
  }
}
```

**Activation:**
- Config option: `debug: true` (instance methods)
- localStorage: Set `meteogram-debug` = `'true'` (static/startup)
- Beta versions: Diagnostics panel visible when version contains "beta"

## Common Pitfalls

### 1. Modern HA Entity Attributes
❌ **Never do this:**
```typescript
const forecast = entity.attributes.forecast;  // Doesn't exist in HA 2023.9+
```

✅ **Do this instead:**
```typescript
// Use subscription for real-time data
connection.subscribeMessage(handler, { type: 'weather/subscribe_forecast' });

// Or service call for one-time fetch
hass.callService('weather', 'get_forecasts', { entity_id, type: 'hourly' });
```

### 2. CSS Variable Overrides
❌ **This breaks gradients:**
```css
.temp-line {
  stroke: var(--meteogram-temp-line-color, orange);  /* Fallback always applies! */
}
```

✅ **Do this instead:**
```css
.temp-line {
  stroke-width: 3;
  fill: none;
  /* No stroke - applied in JavaScript conditionally */
}
```

### 3. Cache Corruption
❌ **Don't assume cache is valid:**
```typescript
const cache = JSON.parse(localStorage.getItem('key'));
return cache.data;  // Might be corrupted/incomplete
```

✅ **Always validate:**
```typescript
try {
  const cache = JSON.parse(localStorage.getItem('key'));
  if (!cache?.data?.time?.length) {
    throw new Error('Invalid cache structure');
  }
  return cache.data;
} catch (e) {
  localStorage.removeItem('key');
  return null;
}
```

## Development Workflow

### Build Commands
```bash
npm run build:dev   # Development build with watch mode
npm run build       # Production build (minified)
```

### Testing Checklist
- [ ] Test with weather entity (modern HA 2023.9+)
- [ ] Test with Met.no API (no entity)
- [ ] Test tab visibility pause/resume
- [ ] Test cache cleanup after 24h
- [ ] Test with `debug: true` config
- [ ] Test gradient with/without custom color
- [ ] Test dark mode theme switching
- [ ] Verify localStorage cache format

### Debug Logging Patterns

**Temperature Gradient:**
```
🎨 Creating temperature gradient with ID: temp-gradient-abc123
🎨 Temperature domain: [-5°, 15°]
🎨 Freezing point position (before clamp): 25.0%
🎨 Freezing point position (after clamp): 25.0%
🎨 Gradient stops created: [{offset: "0%", color: "#0066cc"}, ...]
✅ No custom --meteogram-temp-line-color set, using gradient
✅ Gradient element #temp-gradient-abc123 successfully added to DOM
✅ Gradient has 5 stops
```

**Cache Operations:**
```
[WeatherEntityAPI] Cleaned up 2 old and 1 invalid entity cache entries
[WeatherAPI] Cleaned up 3 old and 0 invalid cache entries
[WeatherEntityAPI] Cached data missing required arrays: windGust, symbolCode
[WeatherAPI] Corrupted cache JSON, clearing metno-weather-cache
```

**Subscription Events:**
```
Pausing weather subscription from: tab hidden
Resuming weather subscription from: tab visible
Entity state is newer, requesting fresh forecast
Fresh forecast data retrieved from service
```

## Key Files

- `src/meteogram-card-class.ts` - Main card component, lifecycle management
- `src/weather-entity.ts` - Weather entity subscription & data processing
- `src/weather-api.ts` - Met.no API client with caching
- `src/meteogram-chart.ts` - D3.js chart rendering including gradient
- `src/meteogram-card-styles.ts` - CSS variables and styling
- `src/types.ts` - TypeScript interfaces
- `src/meteogram-card-editor.ts` - Visual editor with beta-only diagnostics

## Browser Compatibility

**Required APIs:**
- `localStorage` - Cache storage
- `IntersectionObserver` - Element visibility detection
- `document.visibilitychange` - Tab visibility detection
- `CSS Custom Properties` - Theme variables
- `SVG` + `linearGradient` - Chart rendering
- `WebSocket` (HA connection) - Weather subscriptions

**Supported Browsers:**
- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Home Assistant iOS/Android apps

## Performance Considerations

**Chart Rendering:**
- Only redraws when data changes or visibility changes
- Uses D3's efficient SVG manipulation
- Gradient IDs are unique to prevent conflicts

**Subscription Management:**
- Pauses when hidden (saves CPU/battery)
- Resumes with freshness check (ensures current data)
- Single subscription per entity (shared if multiple cards)

**Cache Strategy:**
- 24h retention for both cache types
- Proactive cleanup on startup and access
- Graceful degradation on corruption

## Future Development Notes

**Potential Enhancements:**
1. Configurable gradient colors/stops
2. Multiple gradient zones (e.g., frost warning)
3. Gradient for other metrics (pressure, precipitation)
4. Cache compression for large datasets
5. Offline mode improvements
6. Multi-entity forecast comparison

**Known Limitations:**
- Weather entities must support hourly forecasts
- Met.no API limited to Norway and limited international locations
- Cache cleanup requires browser session (not cross-tab)
- Gradient requires SVG support (no IE11)

---

*This document should be updated as architecture patterns evolve. Last updated: November 2025 (v3.2.0)*
