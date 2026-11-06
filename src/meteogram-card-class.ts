import { LitElement, css, html, svg, PropertyValues } from "lit";
import {
  attributionStatus,
  jitteredRetryDelayMs,
  refreshDelayAfterExpiryMs,
} from "./api-status";
import * as d3 from 'd3';
import { customElement, property, state } from "lit/decorators.js";
import {
  MeteogramCardConfig,
} from "./types";
import { version } from "../package.json";
import { BUILD_VERSION } from "./build-version.generated";
import { getClientName } from "./diagnostics";
import { WeatherAPI, ForecastData } from "./weather-api";
import {
  WeatherEntityAPI,
  mapHaConditionToMetnoSymbol,
} from "./weather-entity";
import { trnslt } from "./translations";
import {
  CARD_NAME,
  METEOGRAM_CARD_STARTUP_TIME,
  DIAGNOSTICS_DEFAULT,
} from "./constants";
import {
  convertTemperature,
  convertPressure,
  convertWindSpeed,
  convertPrecipitation,
  convertDistance,
} from "./conversions";
import { meteogramCardStyles } from "./meteogram-card-styles";
import { MeteogramChart, ANIMATION_MS } from "./meteogram-chart";
import { isDaylightAt } from "./solar";
import { chartLayout } from "./layout";
import { WEATHER_ICONS } from "./weather-icons.generated";

/** How long to stop fetching remote icons after the host throttles us. */
const ICON_COOLDOWN_MS = 5 * 60 * 1000;

/** Height of the day/night strip itself. Thin on purpose: it annotates the time axis,
 *  it is not a data series. */
const SUN_STRIP_HEIGHT = 10;
/** Vertical space it reserves: itself plus clear air *above* only, because it sits
 *  directly on the plot's top border. Nothing separates it from the chart, and the
 *  clearance above keeps a taller date-label row — another language, a user font — from
 *  ever reaching it. */
const SUN_STRIP_BAND = SUN_STRIP_HEIGHT + 5;

type MeteogramStyleModes = {
  dark?: Record<string, string>;
  [mode: string]: Record<string, string> | undefined;
};

export type MeteogramStyleConfig = Record<string, string> & {
  modes?: MeteogramStyleModes;
};

// Below this a container is a transient layout state, not somewhere to draw. Shared by
// the draw itself and by the size watch that decides when the first draw may go ahead, so
// that "too small to draw" means one thing in both places.
const MIN_DRAWABLE_WIDTH = 120;
const MIN_DRAWABLE_HEIGHT = 40;

// Floor on the wait before a scheduled forecast refresh.
//
// Defensive, not a fix for anything observed — worth saying plainly, because the
// investigation that produced it went wrong twice.
//
// The refresh is armed for a minute after the forecast expires, and re-armed by every
// draw. Without a floor an expiry already in the past gives a delay of zero: the timer
// fires at once, forces a redraw, and that draw arms another zero-delay timer on its way
// out. It would stop only when a fetch moved apiExpiresAt forward. A self-re-arming
// timer that can compute a zero delay is worth closing off on its own merits.
//
// What it does *not* explain: three forecast-refresh draws landing in one second in a
// reported log. That was the reason this was looked at, the spin was offered as the
// mechanism, and the evidence does not support it — a foregrounded idle card made no
// refresh draws and no met.no requests over 100 seconds. Those three draws remain
// unexplained.
//
// Nor is met.no's Expires header ever in the past, which was the other wrong turn.
// Measured directly: expires sits about 31 minutes ahead of date. The past expiry that
// prompted all this is dev.html stubbing the header to Date.now() - 1000 on purpose, so
// that a forced redraw in the harness refetches instead of reusing the fixture.
//
// A minute is far below the half-hour cadence a real forecast gives, so a healthy card
// never reaches this floor.
const MIN_REFRESH_DELAY_MS = 60000;

// What has to fit to the right of the plot. Measured from the render rather than
// reasoned about, because the three cases differ by more than they look.
//
// A weather icon is 40px wide and the last one is centred on the final hour, so half of
// it — 20px — hangs past the plot edge. That happens in every mode and is deliberate:
// the icons are allowed to overhang. Hour labels reach nothing, being inset.
const RIGHT_ICON_OVERHANG = 24;
// The pressure axis starts at the plot edge and its four-digit labels reach 31.7px.
// Kept at 40 rather than trimmed to the measurement: the width depends on the theme's
// font, and 8px of slack is what absorbs a larger one.
const RIGHT_PRESSURE_AXIS = 40;
// Plus the rotated caption, which reaches 63px and is drawn in full mode only.
const RIGHT_PRESSURE_CAPTION = 70;

// How far the chart may be scaled from the size it was actually drawn at before a real
// redraw is required. Four percent covers what the dashboard editor's chrome costs a card
// — measured at 1.5% of width and 1.6% of height in a panel — while staying well inside
// the range where scaled type is indistinguishable from type set at the target size.
const MAX_SCALE_ONLY_DRIFT = 0.04;

@customElement("meteogram-card")
export class MeteogramCard extends LitElement {
  private _chartRenderer: MeteogramChart | null = null;
  // Store missing keys for diagnostics/info panel
  private _missingForecastKeys: string[] = [];
  private _availableHours: number | string = "unknown";
  /** Epoch ms until which remote icon fetching is paused after a throttle response. */
  private _iconCooldownUntil = 0;
  /** Values the chart is drawn from, to detect a config change in updated(). */
  private _renderSignature = "";
  /** Vertical stack for the current render; see src/layout.ts. */
  private _layout: ReturnType<typeof chartLayout> | null = null;
  constructor() {
    super();

    // Clean up old cache entries on card initialization (run once per page load)
    this.schedulePeriodicCacheCleanup();

    this.title = "";
    this.latitude = undefined;
    this.longitude = undefined;
    this.showCloudCover = true;
    this.showPressure = true;
    this.showWeatherIcons = true;
    this.showWind = true;
    this.showSun = true;
    this.denseWeatherIcons = true;
    this.meteogramHours = "48h";
  }

  /**
   * Parse meteogram_hours config to get desired hours
   * Supports both legacy string format ("48h") and new numeric format (120)
   * Returns the target hours value (not data points)
   */
  private parseHoursConfig(config: string | number | undefined): number | "max" {
    const value = config || "48h";
    
    // Handle numeric format (new)
    if (typeof value === 'number') {
      return Math.max(1, value);
    }
    
    // Handle string format (legacy)
    if (value === "max") {
      return "max";
    }
    
    // Parse legacy "XXh" format or plain numbers as strings
    const match = value.match(/^(\d+)h?$/);
    if (match) {
      return parseInt(match[1], 10);
    }
    
    // Fallback
    this._debugLog('⚠️ Invalid meteogram_hours value, using default 48h');
    return 48;
  }

  /**
   * Calculate how many data points are needed to cover the requested hours
   * Handles mixed-resolution data (hourly then 6-hourly)
   * Rounds up to include the timeslot containing the target end time
   */
  private getDataPointsForHours(targetHours: number | "max", timeArray: Date[]): number {
    if (targetHours === "max" || timeArray.length === 0) {
      return timeArray.length;
    }
    
    const startTime = timeArray[0].getTime();
    const targetEndTime = startTime + (targetHours * 60 * 60 * 1000);
    
    // Find the first data point that reaches or exceeds the target hours
    // This ensures we include the complete timeslot containing the end point
    for (let i = 0; i < timeArray.length; i++) {
      if (timeArray[i].getTime() >= targetEndTime) {
        return i + 1; // Include this timeslot
      }
    }
    
    // If target hours exceeds available data, return all points
    return timeArray.length;
  }

  @property({ type: String }) title = "";
  @property({ type: Number }) latitude?: number;
  @property({ type: Number }) longitude?: number;
  @property({ attribute: false }) hass!: any; // Changed from HomeAssistant to any

  // Add new configuration properties with default values
  @property({ type: Boolean }) showCloudCover = true;
  @property({ type: Boolean }) showPressure = true;
  @property({ type: Boolean }) showWeatherIcons = true;
  @property({ type: Boolean }) showWind = true;
  @property({ type: Boolean }) showSun = true;
  @property({ type: Boolean }) showPrecipitation = true;
  /** Animate changes rather than redrawing them cold. Config key: `animate`. */
  @property({ type: Boolean }) animateChanges = true;
  @property({ type: Boolean }) denseWeatherIcons = true; // NEW: icon density config
  @property({ type: String }) meteogramHours: string | number = "48h"; // Default is now 48h
  @property({ type: Object }) styles: MeteogramStyleConfig = {}; // NEW: styles override
  @property({ type: Boolean }) diagnostics: boolean = DIAGNOSTICS_DEFAULT; // Initialize here
  @property({ type: Boolean }) debug: boolean = false; // Debug logging (undocumented)
  @property({ type: String }) entityId?: string; // NEW: entity_id for weather integration
  @property({ type: Boolean }) focussed = false; // NEW: Focussed mode
  @property({ type: String }) displayMode: "full" | "core" | "focussed" =
    "full";
  @property({ type: String }) aspectRatio: string = "16:9"; // NEW: aspect ratio config, default 16:9
  @property({ type: Number }) altitude?: number; // Optional altitude for WeatherAPI
  /** Whether `altitude` was inherited from Home Assistant rather than configured. */
  private _altitudeFromHome = false;
  @property({ type: String }) layoutMode:
    | "sections"
    | "panel"
    | "grid"
    | undefined = undefined;

  @state() private chartLoaded = false;
  @state() private meteogramError = "";
  @state() private errorCount = 0;
  @state() private lastErrorTime = 0;
  private _drawCallIndex = 0;
  private _weatherRetryTimeout: number | null = 0;
  private _weatherRefreshTimeout: number | null = 0;
  private _chartRenderInProgress = false;
  private _pendingRender = false;
  private _lastApiSuccess = false;
  // Consecutive failed fetches, 0 while healthy. Drives both the retry cadence and the
  // attribution icon, so the two can never disagree about whether the card is working.
  private _apiFailures = 0;
  private _margin = { top: 32, right: 48, bottom: 32, left: 48 };
  private _chartWidth = 0;
  private _chartHeight = 0;
  private iconCache = new Map<string, string>();
  private iconBasePath =
    "https://raw.githubusercontent.com/metno/weathericons/refs/heads/main/weather/svg/";

  // Keep reference to the D3 selection to clean it up properly
  private svg: any = null;

  // Track element size for resize detection
  private _resizeObserver: ResizeObserver | null = null;
  private _lastWidth = 0;
  private _lastHeight = 0;
  private _lastResizeTime = 0; // <-- Add this missing property
  private _resizeEndTimer: number | null = null; // Timer for detecting end of resize
  private _lastRenderedWidth: number = 0; // Track last rendered chart width
  private _lastRenderedHeight: number = 0; // Track last rendered chart height

  // Intersection observer for visibility detection
  private _intersectionObserver: IntersectionObserver | null = null;

  // Mutation observer for detecting DOM changes
  private _mutationObserver: MutationObserver | null = null;

  // Keep track of update cycles
  private _isInitialized = false;

  // Keep track of last rendered data to avoid unnecessary redraws
  private _lastRenderedData: string | null = null;

  // Change these from static to instance properties
  private apiExpiresAt: number | null = null;
  private apiLastModified: string | null = null;
  private weatherDataPromise: Promise<ForecastData> | null = null;
  // Add WeatherAPI instance as a class variable
  private _weatherApiInstance: WeatherAPI | null = null;

  // Add WeatherEntityAPI instance as a class variable
  private _weatherEntityApiInstance: WeatherEntityAPI | null = null;

  // Public getter for console debugging access
  get weatherEntityAPI(): WeatherEntityAPI | null {
    return this._weatherEntityApiInstance;
  }

  // Debug helper method for console access
  debugMeteogram(): any {
    console.log("=== METEOGRAM CARD DEBUG ===");
    console.log("Entity ID:", this.entityId);
    console.log(
      "Weather Entity API Instance:",
      !!this._weatherEntityApiInstance
    );
    console.log("Weather API Instance:", !!this._weatherApiInstance);
    console.log("Card Configuration:", {
      entityId: this.entityId,
      latitude: this.latitude,
      longitude: this.longitude,
      diagnostics: this.diagnostics,
      usingEntity: !!this.entityId && this.entityId !== "none",
      usingDirectAPI: MeteogramCard._hasCoord(this.latitude)
        && MeteogramCard._hasCoord(this.longitude),
    });

    if (this._weatherEntityApiInstance) {
      console.log(
        "Weather Entity API available - use: card.weatherEntityAPI.getFreshnessSummary()"
      );
      return this._weatherEntityApiInstance.getFreshnessSummary();
    } else if (this._weatherApiInstance) {
      console.log("Using Met.no API directly - Entity API not available");
      console.log("API Instance:", this._weatherApiInstance);
      return "Using Met.no API directly - no entity debugging available";
    } else {
      console.log(
        "No weather instances available - card may not be initialized"
      );
      return "Card not fully initialized";
    }
  }

  // Debug helper method for conditional logging
  private _debugLog(...args: any[]): void {
    if (this.debug) {
      console.debug(...args);
    }
  }

  // Add these properties for throttling
  /** Pending coalesced redraw, if any. */
  private _drawTimer: ReturnType<typeof setTimeout> | null = null;
  /** When the oldest un-served redraw request arrived, for the maxWait bound. */
  private _drawWantedSince = 0;
  /** Quiet period a burst must settle for before drawing. */
  /** How long a redraw waits after a reconnect, for the rebuild that usually follows. */
  // Long enough to cover the rebuild, which is the whole point of waiting for it.
  // Measured twice in one session: a rebuild one second after a reconnect, and five
  // seconds after a re-attach. Two samples is not a distribution, so this is set above
  // both rather than at their mean — and the cost of overshooting is only a refresh
  // arriving late on a card that survived, where the chart on screen is already correct.
  // A rebuild cancels the wait for free, because the element stops existing.
  private static readonly _RECONNECT_HOLD_MS = 6000;
  /**
   * How long a re-attached card waits before drawing, when it has a chart to show.
   *
   * Home Assistant re-attaches the live element and then replaces it about a second
   * later, repeatedly — observed three times in half an hour on a panel dashboard, at
   * 09:55, 10:03 and 10:21. Each cycle the re-attached element built a complete chart
   * and was discarded a second after finishing it, so half of every draw the card made
   * was thrown away.
   *
   * Shorter than the reconnect hold because the gap is measured rather than guessed: the
   * replacement arrives about a second later, every time. The cost of overshooting is
   * different here too — a card that survives the hold sits on its predecessor's chart
   * until it draws, and if the forecast moved in between, that is a stale chart on
   * screen. Six seconds of that is worse than two and a half.
   */
  private static readonly _REATTACH_HOLD_MS = 2500;
  /** `hass.connected` as last seen, so the false\u2192true edge can be noticed. */
  private _lastConnected: boolean | undefined = undefined;
  /**
   * While in the future, redraws are deferred to it.
   *
   * Set by two things, for one reason: the element may be about to be discarded, and a
   * redraw spent on it is work nobody will see. A websocket reconnect is one warning; a
   * re-attachment is the other, and turns out to be the common one.
   */
  private _holdDrawsUntil = 0;
  /** Set once the element has been in the DOM, so a re-attach can be told from a mount. */
  private _hasBeenConnected = false;
  /** Set on re-attachment, so the draw that restores the chart does not animate. */
  private _reattachDraw = false;
  /** True while this element is showing a chart inherited from its predecessor. */
  private _adoptedSvg = false;
  /** That inherited chart, held on screen until the replacement has finished drawing. */
  private _handoverNode: SVGElement | null = null;

  /**
   * The last chart each configuration drew, so a replacement element can show it at once.
   *
   * Keyed on the render signature, which carries the location and every display option —
   * so two cards showing different places can never be handed each other's chart. Two
   * configured identically do share an entry, which is harmless: the chart they would
   * each draw is the same one. Module scope makes it per page, which is the right scope:
   * a fresh page load has nothing to hand over and correctly starts empty.
   */
  private static _chartCache = new Map<string, { markup: string; w: number; h: number }>();
  private static readonly _CHART_CACHE_MAX = 8;

  /** Pending settled-snapshot capture, so a new draw can cancel the last one. */
  private _settleSnapshot: ReturnType<typeof setTimeout> | null = null;

  private static _rememberChart(sig: string, markup: string, w: number, h: number): void {
    const c = MeteogramCard._chartCache;
    c.delete(sig);                                  // re-insert so it counts as newest
    c.set(sig, { markup, w, h });
    while (c.size > MeteogramCard._CHART_CACHE_MAX) {
      const oldest = c.keys().next().value;
      if (oldest === undefined) break;
      c.delete(oldest);
    }
  }

  /** Consecutive equal measurements before a first draw is allowed to proceed. */
  private static readonly _STABLE_FRAMES = 2;
  /** Set while the first draw is waiting for the container size to stop moving. */
  private _sizeWatch: number | null = null;

  private _drawCoalesceMs = 60;
  /** Longest a redraw may be postponed by a continuing trickle of requests. */
  private _drawMaxWaitMs = 400;
  /**
   * Longer settle for the very first draw.
   *
   * On a cold load the card is asked to draw before the layout has settled, and the
   * resize observer then reports the real size a moment later — far enough after the
   * 60ms window to count as a second, separate draw. Waiting a little longer the first
   * time lets the initial size land in the same window, so a load draws once.
   */
  private _firstDrawSettleMs = 180;
  private _hasDrawnOnce = false;
  /** Config signature and size the chart currently on screen was drawn from. */
  private _lastDrawnKey = "";
  /**
   * The draw key without its size, so a redraw can tell "only the size changed" from
   * "the forecast or a setting changed". Only the first is eligible to be scaled rather
   * than redrawn; see the scale shortcut in _renderChart.
   */
  private _lastDrawnDataKey = "";
  /** True while redrawing after a size change — see _renderChart. */
  _chartResized = false;
  /** True while this element draws for the first time on a page that has already drawn.
   *
   * The opening animation is a page-load flourish: it earns its keep once, when the
   * dashboard appears. Home Assistant replaces a card element without the page
   * reloading, though, and every replacement is a first draw for that element — so
   * restoring a window left minimised produced a blank card, then a full animated build
   * of a forecast that had not changed and had not even been re-fetched. Conspicuous
   * motion drawing the eye to nothing at all.
   */
  _remountDraw = false;
  /** Whether anything on this page has drawn yet. Static: it dates the page, not the card. */
  private static _pageHasDrawn = false;
  /** When this element came into existence, for the diagnostics header. */
  private _createdAt = Date.now();
  /** How long this element showed nothing before its first chart appeared. */
  private _firstPaintMs: number | null = null;
  /**
   * When a handed-over chart went up, as an age of this element — or null if none did.
   *
   * "blank" was measuring element creation to first completed draw, which stopped being
   * the same thing as an empty card once a replacement could inherit its predecessor's
   * chart. A card reporting `blank 46ms` beside a log full of `rebuilt (held)` was not
   * blank for 46ms; it was blank until the placeholder went up and showing a chart for
   * the rest. Splitting the two makes "was anything visibly missing" answerable from a
   * pasted report, rather than from whether someone happened to be watching.
   */
  private _heldFromMs: number | null = null;
  /**
   * The last few draws, for the diagnostics panel.
   *
   * A card that grows without limit is diagnosed from a handful of numbers — the
   * container it measured and the size it chose, over successive draws. Those were only
   * ever in the browser console, which asks a reporter for F12, the Verbose level, a
   * reproduction and a copy: four places to lose someone who has said plainly they are
   * not comfortable with it. Here they can be screenshotted, which people already do.
   */
  /** The redraw log, shared by every card element on the page.
   *
   * Per-element, it died with the element — and Home Assistant rebuilds a card without
   * the page reloading whenever it re-emits the Lovelace config, which a websocket
   * reconnect does. Observed 2026-08-21: three elements in eighty minutes on one page,
   * and the log of the element that was on screen when the fault appeared went with it.
   * A log that is wiped by the very event being investigated is no log.
   *
   * Static, so the timeline spans the page rather than the element. Each element opens
   * its section with its ancestry and a "new element" row, so handovers are visible. On
   * a page with two meteogram cards the two timelines interleave; the sizes and the
   * ancestry lines tell them apart, and a shared timeline is still worth more than two
   * that vanish.
   */
  private static _recentDraws: string[] = [];
  // Entries discarded between the preserved head and the live tail, so the gap can be
  // stated rather than left as a silent jump in the timestamps.
  private static _droppedDraws = 0;
  /** Set briefly after a copy, so the button can say it worked. */
  @state() private _copiedAt = false;
  // Deliberately generous. Nobody knows what someone will try before they think to look
  // — dragging a pane wider, then narrower, switching modes, rotating a tablet — and a
  // short buffer throws away the beginning of exactly the sequence that explains it. The
  // tooltip scrolls, so length costs nothing but a taller screenshot.
  private static readonly _RECENT_DRAWS = 20;
  // How many of the earliest entries survive no matter how long the incident runs.
  //
  // A plain ring loses its head, and the head is where the card's starting size is
  // recorded. Someone reproducing a fault resizes hard — sixty events in three seconds
  // is an ordinary drag — so a twenty-entry ring holds about seven seconds and the load
  // has long since scrolled out by the time they press Copy. Keeping the first few means
  // the log still answers "what size did it start at", which is the comparison every
  // growth report turns on.
  private static readonly _RECENT_KEEP_FIRST = 5;

  /**
   * The chain of elements the card is nested in, outermost last.
   *
   * Crosses shadow boundaries deliberately — a card lives inside several of them, and
   * stopping at the first would report nothing useful. Six levels is enough to reach the
   * view, and tag names alone carry no configuration or personal detail, which matters
   * for something meant to be pasted into a public issue.
   */
  /** The configured ratio as a CSS aspect-ratio value: "16:9" and "1.6" both work. */
  private static _ratioValue(ratio: string | undefined): string {
    if (typeof ratio === "string" && ratio.includes(":")) {
      const [w, h] = ratio.split(":").map(Number);
      if (w > 0 && h > 0) return `${w}/${h}`;
    }
    const n = Number(ratio);
    return n > 0 ? `${n}` : "16/9";
  }
  /** A clock time and an age together: "16:05:33 (6m ago)".
   *
   * The age alone is relative to whenever Copy was pressed, which makes it useless for
   * lining up against the redraw list — and the redraw list is stamped with clock times.
   * Both, so the two halves of the report can be read against each other.
   */
  private _stamp(then: Date): string {
    const at = then.toLocaleTimeString(this.getHaLocale(), {
      hour: "2-digit", minute: "2-digit", second: "2-digit",
    });
    return `${at} (${MeteogramCard._since(then)} ago)`;
  }

  /** Rough age of a timestamp, for a diagnostics line: "3s", "12m", "4h". */
  private static _since(then: Date): string {
    const secs = Math.max(0, Math.round((Date.now() - then.getTime()) / 1000));
    if (secs < 90) return `${secs}s`;
    const mins = Math.round(secs / 60);
    return mins < 90 ? `${mins}m` : `${Math.round(mins / 60)}h`;
  }

  /** A timestamp as local wall-clock time, for the status panel.
   *
   * The panel used to print Expires At through toLocaleString() and Last Render as a
   * UTC ISO string, side by side and neither labelled — so the only way to know which
   * was which was to read the source, which is what someone reading a status panel is
   * trying to avoid. Local throughout: the panel is read by a person next to the spa,
   * not by a log parser, and the zone is named so there is nothing left to infer.
   */
  private static _localTime(value: string | number | Date | null | undefined): string {
    if (value === null || value === undefined || value === "") return "not available";
    const d = value instanceof Date ? value : new Date(value);
    return Number.isNaN(d.getTime()) ? String(value) : d.toLocaleString();
  }

  private static _ancestry(el: Element): string {
    const names: string[] = [];
    let node: any = el;
    for (let i = 0; i < 6 && node; i++) {
      node = node.parentElement ?? node.getRootNode?.()?.host;
      if (!node || !node.tagName) break;
      const tag = String(node.tagName).toLowerCase();
      if (names[names.length - 1] !== tag) names.push(tag);
    }
    return names.join(" \u2039 ");
  }

  /** Trigger names as something a person can read, rather than method names. */
  private static _triggerLabel(caller: string): string {
    const raw = (caller || "draw").replace(/#\d+$/, "");
    const map: Record<string, string> = {
      "_onResize-significant": "resize",
      "_onResize-fallback": "resize",
      "_onResizeEnd-final": "resize ended",
      loadD3AndDraw: "first load",
      connectedCallback: "card added",
      _handleVisibilityChange: "tab shown",
      orientationchange: "rotated",
      updated: "setting changed",
      "updated-forced": "setting changed",
      "scheduled-refresh-after-expiresAt": "forecast refresh",
    };
    return map[raw] ?? raw;
  }
  /** Caller that triggered the draw currently being rendered. */
  private _lastDrawCaller = "";
  /** Ancestry as last recorded, so a move between containers is noticed. */
  private _lastAncestry = "";
  /** Start of the current run of resize-driven redraws, for the runaway fuse. */
  private _resizeStormSince = 0;
  private _resizeStormCount = 0;
  /** Set when a redraw was requested with force, consumed by the next draw. */
  private _forceNextDraw = false;
  /**
   * Debug switched on from the console, which outranks the config.
   *
   * Without this, the next setConfig re-read `debug` from the config and switched
   * logging straight back off — so turning it on to investigate something and then
   * touching the card in the editor silently stopped the logging mid-investigation.
   */
  _debugOverride: boolean | null = null;
  private _lastWeatherData: any = null;

  // Store the current units for each parameter
  private _currentUnits: ForecastData["units"] = {};

  // Track data availability for forecast elements
  private _dataAvailability: {
    wind: boolean;
    pressure: boolean;
    cloudCover: boolean;
    precipitation: boolean;
    precipitationMinMax: boolean;
    temperature: boolean;
    windGust: boolean;
  } = {
    wind: false,
    pressure: false,
    cloudCover: false,
    precipitation: false,
    precipitationMinMax: false,
    temperature: false,
    windGust: false,
  };

  // Add unit system class variables
  private _tempUnit: "°C" | "°F" = "°C";
  private _pressureUnit: "hPa" | "inHg" = "hPa";
  private _windSpeedUnit: "m/s" | "km/h" | "mph" | "kt" = "m/s";
  private _precipUnit: "mm" | "in" = "mm";

  // The build, not the package version: those differ for every prerelease, and the
  // card is what someone is asked to read when confirming which one they have.
  static meteogramCardVersion: string = BUILD_VERSION || version;

  // Add a method to fetch icons
  private async getIconSVG(iconName: string): Promise<string> {
    // Return from cache if available
    if (this.iconCache.has(iconName)) {
      return this.iconCache.get(iconName)!;
    }

    // Bundled first. The whole met.no set ships with the card, so the normal path
    // touches no network at all: no rate limit, no corporate proxy, works offline.
    const bundled = WEATHER_ICONS[iconName];
    if (bundled) {
      this.iconCache.set(iconName, bundled);
      return bundled;
    }

    // Only reachable for a name absent from the bundled set, which would mean met.no
    // has added an icon since this build. Back off if the host has already said no.
    if (Date.now() < this._iconCooldownUntil) {
      return "";
    }

    try {
      // Add a console log to debug the URL
      const iconUrl = `${this.iconBasePath}${iconName}.svg`;

      // Fetch from GitHub
      const response = await fetch(iconUrl);

      // 429 and 5xx mean "not now", not "not here". The day/night fallback below used
      // to fire on any failure, so a throttled render made two requests per icon rather
      // than one — the worst possible answer to being asked to slow down.
      if (response.status === 429 || response.status >= 500) {
        this._iconCooldownUntil = Date.now() + ICON_COOLDOWN_MS;
        console.warn(
          `[${CARD_NAME}] Weather icon fetch throttled (HTTP ${response.status}); ` +
            `pausing for ${Math.round(ICON_COOLDOWN_MS / 60000)} minutes.`
        );
        return "";
      }

      if (!response.ok) {
        // Fallback only for a genuinely absent variant: some conditions have no
        // _day/_night form, and 404 is how that shows up.
        if (
          response.status === 404 &&
          (iconName.endsWith("_day") || iconName.endsWith("_night"))
        ) {
          const baseIcon = iconName.replace(/_(day|night)$/, "");
          const fallbackUrl = `${this.iconBasePath}${baseIcon}.svg`;
          const fallbackResponse = await fetch(fallbackUrl);
          if (fallbackResponse.ok) {
            const svgText = await fallbackResponse.text();
            if (svgText.includes("<svg") && svgText.length > 20) {
              this.iconCache.set(baseIcon, svgText);
              return svgText;
            }
          }
        }
        console.warn(
          `Failed to load icon: ${iconName}, status: ${response.status}`
        );
        return "";
      }

      const svgText = await response.text();

      // Basic validation that we got SVG content
      if (!svgText.includes("<svg") || svgText.length < 20) {
        console.warn(`Invalid SVG content for ${iconName}`);
        return "";
      }

      // Store in cache
      this.iconCache.set(iconName, svgText);
      return svgText;
    } catch (error: unknown) {
      console.error(`Error loading icon ${iconName}:`, error);
      return ""; // Return empty SVG on error
    }
  }

  // Helper to schedule a meteogram draw if not already scheduled
  /**
   * Ask for a redraw. Requests within a short window collapse into one.
   *
   * This used to throttle by *dropping* requests: if one arrived while another was
   * pending, or within 200ms of the last, it returned without drawing and without
   * recording that anything was still wanted. Two consequences, and the second is the
   * serious one:
   *
   *   - leaving the editor fires connectedCallback, a resize, a visibility change and
   *     an update in close succession, each far enough apart to survive the throttle,
   *     so the chart was drawn several times over;
   *   - updated() assigns _renderSignature *before* scheduling, so a dropped request
   *     left the signature saying the chart was current when it had never been drawn.
   *     Nothing would redraw it until an unrelated change came along. The card simply
   *     kept showing the old chart.
   *
   * Coalescing instead of dropping fixes both: the timer is reset by each new request
   * so a burst produces exactly one draw, and no request is ever discarded. maxWait
   * bounds the delay so a steady trickle cannot postpone the draw indefinitely.
   */
  private _scheduleDrawMeteogram(
    source: string = "unknown",
    force: boolean = false
  ) {
    // The resize observer reports one last time as the element leaves the DOM — the
    // container going to 0x0 — and that callback is already queued when
    // disconnectedCallback runs, so cancelling timers there does not catch it. It
    // arrived as "tiny  too small  0×0" in the log of a card that no longer existed.
    if (!this.isConnected) return;

    const now = Date.now();
    this._drawCallIndex++;
    const callerId = `${source}#${this._drawCallIndex}`;
    this._debugLog(
      `[${CARD_NAME}] _scheduleDrawMeteogram called from: ${callerId}`
    );

    if (force) this._forceNextDraw = true;
    if (!this._drawWantedSince) this._drawWantedSince = now;

    // Before the first draw the deadline is fixed, not restarted.
    //
    // Coalescing by resetting the timer is right for a burst of *changes*: the last one
    // is the one worth drawing, and each new request postponing the draw is the point.
    // Mounting is not that. Four requests arrive on the way up — the load path, the
    // visibility observer, the load path again, and the resize observer's opening
    // callback — spread over about 110ms, and each reset pushed the first paint a
    // further settle into the future. Measured: 293ms to start drawing, of which 21ms
    // was drawing. The card was blank for a quarter of a second having decided nothing.
    //
    // A deadline from the *first* request absorbs the same burst, because they all land
    // inside one settle window, but bounds the wait instead of letting it accumulate.
    // Afterwards the reset behaviour returns, where it earns its keep.
    const firstDrawPending = !this._hasDrawnOnce && this._drawTimer !== null;
    if (this._drawTimer !== null && !firstDrawPending) clearTimeout(this._drawTimer);
    if (firstDrawPending) {
      // The pending timer already covers this request. Record the force flag and go.
      this._debugLog(
        `[${CARD_NAME}] _scheduleDrawMeteogram: first draw already pending, not deferring it`
      );
      return;
    }

    const waited = now - this._drawWantedSince;
    const settle = this._hasDrawnOnce ? this._drawCoalesceMs : this._firstDrawSettleMs;
    let delay = force
      ? 0
      : Math.max(0, Math.min(settle, this._drawMaxWaitMs - waited));
    // A reconnect is usually followed by Home Assistant replacing this element, so a
    // redraw started now is work done for a card that will not be on screen to show it.
    // Waiting the hold out costs nothing if the rebuild comes, and a couple of seconds
    // if it does not. A forced draw still goes first: those come from a setting the
    // user just changed, and making them wait would be worse than a wasted redraw.
    if (!force) {
      delay = Math.max(delay, this._holdDrawsUntil - now);
    }

    const first = !this._hasDrawnOnce;
    this._drawTimer = setTimeout(() => {
      this._drawTimer = null;
      this._drawWantedSince = 0;
      this._hasDrawnOnce = true;
      this._lastDrawCaller = callerId;
      if (first) this._drawWhenSizeSettles(callerId);
      else this._drawMeteogram(callerId);
      // A first draw waits for the size to settle rather than for a fixed delay, so its
      // timer only has to carry the reconnect hold. Dropping it to zero outright was
      // wrong: a re-attach makes the next draw a first draw, which is exactly when the
      // hold matters most, and the card drew straight through it.
    }, first ? Math.max(0, this._holdDrawsUntil - now) : delay);
  }

  // Status panel properties
  @state() private _statusExpiresAt: string = "";
  @state() private _statusLastRender: string = "";
  @state() private _statusLastFetch: string = "";
  @state() private _statusApiSuccess: boolean | null = null;

  // Tooltip open state
  @state() private attributionTooltipOpen = false;
  // Store entity attribution if using weather entity
  @state() private entityAttribution: string | null = null;

  // --- Add missing _onAttributionIconClick and _onDocumentClick handlers ---
  private _onAttributionIconClick = (e: Event) => {
    e.stopPropagation();
    this.attributionTooltipOpen = !this.attributionTooltipOpen;
  };
  private _onDocumentClick = (e: Event) => {
    if (!this.attributionTooltipOpen) return;
    const path = e.composedPath ? e.composedPath() : (e as any).path || [];
    const icon = this.shadowRoot?.querySelector(".attribution-icon");
    if (icon && path.includes(icon)) return;
    this.attributionTooltipOpen = false;
  };

  static styles = meteogramCardStyles;

  // Required for Home Assistant
  setConfig(config: MeteogramCardConfig): void {
    // --- MIGRATION LOGIC FOR FOCUSSED/DISPLAYMODE ---
    let migratedDisplayMode: "full" | "core" | "focussed" = "full";
    // Change to use config.display_mode instead of config.displayMode
    if (typeof config.display_mode === "string") {
      migratedDisplayMode = config.display_mode as any;
    } else if (typeof config.focussed === "boolean") {
      migratedDisplayMode = config.focussed ? "focussed" : "full";
    }

    // Truncate to 4 decimals for comparison
    const configLat =
      config.latitude !== undefined
        ? parseFloat(Number(config.latitude).toFixed(4))
        : undefined;
    const configLon =
      config.longitude !== undefined
        ? parseFloat(Number(config.longitude).toFixed(4))
        : undefined;
    const currentLat =
      this.latitude !== undefined
        ? parseFloat(Number(this.latitude).toFixed(4))
        : undefined;
    const currentLon =
      this.longitude !== undefined
        ? parseFloat(Number(this.longitude).toFixed(4))
        : undefined;

    const latChanged = configLat !== undefined && configLat !== currentLat;
    const lonChanged = configLon !== undefined && configLon !== currentLon;

    // Assign whatever was given, including an empty string. Guarding on truthiness
    // meant a title could be set but never cleared: blanking it in the editor left
    // the previous one in place, header and all.
    this.title = config.title ?? "";
    if (config.latitude !== undefined) this.latitude = configLat;
    if (config.longitude !== undefined) this.longitude = configLon;
    this._altitudeFromHome = false;
    if (Number.isFinite(config.altitude)) {
      this.altitude = config.altitude;
    } else {
      this.altitude = undefined;
    }

    this.showCloudCover =
      config.show_cloud_cover !== undefined ? config.show_cloud_cover : true;
    this.showPressure =
      config.show_pressure !== undefined ? config.show_pressure : true;
    this.showWeatherIcons =
      config.show_weather_icons !== undefined
        ? config.show_weather_icons
        : true;
    this.showWind = config.show_wind !== undefined ? config.show_wind : true;
    this.showSun = config.show_sun !== undefined ? config.show_sun : true;
    // Assigned here for the first time. The getter this replaces read
    // `this.show_precipitation`, a property setConfig never set, so it was always
    // undefined and precipitation was on for everyone regardless of the toggle.
    this.showPrecipitation =
      config.show_precipitation !== undefined ? config.show_precipitation : true;
    this.animateChanges = config.animate !== undefined ? config.animate : true;
    this.denseWeatherIcons =
      config.dense_weather_icons !== undefined
        ? config.dense_weather_icons
        : true;
    this.meteogramHours = config.meteogram_hours || "48h";
    this.styles = config.styles || {};
    // Add diagnostics option
    this.diagnostics =
      config.diagnostics !== undefined
        ? config.diagnostics
        : DIAGNOSTICS_DEFAULT;
    // Add debug option (undocumented)
    this.debug =
      this._debugOverride ?? (config.debug !== undefined ? config.debug : false);
    // Set entityId from config
    this.entityId = config.entity_id || undefined;
    // Ensure boolean for focussed mode
    this.focussed = migratedDisplayMode === "focussed";
    // Set displayMode from config (now migrated from display_mode)
    this.displayMode = migratedDisplayMode;
    this.aspectRatio = config.aspect_ratio || "16:9";
    // Add support for layoutMode
    this.layoutMode = config.layout_mode ?? "sections";

    // Initialize units whenever hass config changes
    if (this.hass) {
      this._initializeUnits();
    }

    // Track previous entityId
    const prevEntityId = this.entityId;
    const newEntityId = config.entity_id || undefined;
    const entityIdChanged = prevEntityId !== newEntityId;

    // Update entityId
    this.entityId = newEntityId;

    // Handle WeatherEntityAPI lifecycle based on entityId changes
    if (entityIdChanged) {
      if (prevEntityId != null) {
        // Was set, now changed: destroy old
        if (this._weatherEntityApiInstance) {
          this._weatherEntityApiInstance.destroy("entityId changed");
          this._weatherEntityApiInstance = null;
        }
      }
      if (newEntityId) {
        // now set: construct new API
        if (this.hass) {
          this._debugLog(
            `[${CARD_NAME}] setConfig Initializing WeatherEntityAPI for entity: ${this.entityId}`,
            this.hass
          );
          this._weatherEntityApiInstance = new WeatherEntityAPI(
            this.hass,
            newEntityId as string,
            this,
            "setConfig",
            this.debug
          );
        }
      } // else remains null
    }
  }

  /**
   * Whether a coordinate is actually set.
   *
   * Not a truthiness test: 0 is a real latitude and a real longitude, and the equator
   * and the prime meridian both run through inhabited places. Testing `!lat` rejected
   * every location on either line — 0,0 most visibly — and reported it as "location
   * not available".
   */
  /**
   * Every card currently in the document, so meteogramDebug() below can find them.
   * Cards live deep inside Home Assistant's shadow DOM and cannot be reached from the
   * console by querySelector.
   */
  private static _live = new Set<MeteogramCard>();
  /**
   * Which card element wrote each log entry.
   *
   * `_recentDraws` is static — one list for the page, shared by every card on it and
   * surviving the replacement of any of them. That is deliberate and worth keeping: a
   * rebuild would otherwise wipe the history of what happened before it. But it means a
   * run of identical lines is ambiguous in a way nothing on the line resolves. Three
   * `forecast refresh` draws inside one second, reported 2026-08-25, could be one
   * element drawing three times or three live elements drawing once each, and those
   * have completely different causes.
   *
   * Numbered per page and written on every line, which costs three characters and no
   * buffer slots. The ancestry line cannot do this job: it is per-element state, so an
   * element that has drawn before stays silent, which is exactly the case in question.
   *
   * The numbers climbing is itself worth seeing — it is how often Home Assistant is
   * replacing the card, which no other part of the panel reports.
   */
  private static _elementSeq = 0;
  private readonly _elementNo = ++MeteogramCard._elementSeq;

  /**
   * How many draws each trigger has caused since the page loaded.
   *
   * The redraw list holds twenty entries. Over the eighteen hours of a wall panel's day
   * that is a keyhole, and the entries worth having are the unusual ones — which are
   * also the first evicted, because everything routine arrives after them. Three
   * `forecast refresh` draws inside one second were reported on 2026-08-25 and were gone
   * from the buffer within the hour, so the question "did that happen again" had no
   * answer at all.
   *
   * Widening the buffer does not fix that; a keyhole twice the size is still a keyhole.
   * A tally does: it is bounded by the number of triggers, it cannot be evicted, and it
   * answers the question the list cannot — what has been redrawing this card, and how
   * often. It would have answered the 1086-entries question in one line too.
   */
  private static _drawTally = new Map<string, number>();

  /**
   * A stable <g> for one drawer, cleared and handed back.
   *
   * Stage 2 of animating updates. Every drawer used to append straight into the shared
   * svg, which therefore had to be wiped wholesale between draws — so no element could
   * outlive a redraw and nothing could be transitioned. Each drawer owns a named group
   * now: the group persists, only its contents are replaced, and a drawer can be
   * converted to a keyed join one at a time without disturbing the others.
   *
   * Direct-child selector: a descendant match would find a nested group of the same
   * name inside another layer.
   */
  /**
   * Sit the information icon on the same line as the date labels.
   *
   * Measured from the rendered label rather than computed from the layout. The layout's
   * dateLabelY is an SVG coordinate, and the svg is stretched to its container with
   * preserveAspectRatio="none" — so an SVG unit is not a CSS pixel, and by how much
   * depends on the height of the card. A constant offset is therefore wrong everywhere
   * except the size it was measured at.
   *
   * It used to be pinned a fixed distance from the top of the card, which could not
   * track a layout that moves at all: the labels sit below the legend row, and the top
   * of the plot rises when the sun strip is off, crowding the temperature axis where a
   * tick label wants the room.
   */
  private _alignAttributionIcon(): void {
    const root = this.shadowRoot;
    const label = root?.querySelector(".top-date-label") as SVGGraphicsElement | null;
    const wrapper = root?.querySelector(".attribution-icon-wrapper") as HTMLElement | null;
    if (!label || !wrapper) return;
    const parent = wrapper.offsetParent as HTMLElement | null;
    if (!parent) return;
    const l = label.getBoundingClientRect();
    const p = parent.getBoundingClientRect();
    if (!l.height) return;
    const centre = l.top + l.height / 2 - p.top;
    this.style.setProperty(
      "--meteogram-attribution-top",
      `${Math.round(centre - wrapper.offsetHeight / 2)}px`
    );
  }

  /**
   * Put everything needed to diagnose this card on the clipboard.
   *
   * The tooltip shows the same material, but a screenshot of it has to be readable,
   * cropped and attached; this pastes straight into an issue as text that can be
   * searched and quoted. Deliberately plain — no markdown — so it survives whatever it
   * is pasted into.
   *
   * Clipboard access needs a user gesture and a secure context. A button click is a
   * gesture, and Home Assistant is served over https, but some embedded webviews still
   * refuse, so there is a fallback through a detached textarea. If both fail the button
   * says so rather than pretending.
   */
  private _copyDiagnostics = async (ev: Event): Promise<void> => {
    ev.stopPropagation();
    const strip = (html: string) =>
      html.replace(/<br\s*\/?>/gi, "\n").replace(/<[^>]+>/g, "").trim();
    const lines = [
      `Meteogram Card ${MeteogramCard.meteogramCardVersion}`,
      strip(this._setupHtml()),
      this.entityId && this.entityId !== "none"
        ? `Source: entity ${this.entityId}`
        : `Source: met.no direct ${this.latitude}, ${this.longitude}` +
          // Altitude is part of the met.no request and therefore part of the cache key,
          // so two cards on one dashboard that differ only in altitude quietly run out
          // of two different caches with two different expiry times. That is how the
          // missing altitude was found, and the source line said nothing about it.
          (this.altitude === undefined
            ? " (no altitude)"
            : ` at ${this.altitude}m${this._altitudeFromHome ? " (from HA)" : ""}`),
      this._missingForecastKeys?.length
        ? `Not provided: ${this._missingForecastKeys.join(", ")}`
        : "Not provided: nothing",
      `Hours available: ${this.getAvailableHours()}`,
      this.meteogramError ? `Error: ${strip(this.meteogramError)}` : null,
      "",
      "Recent redraws (container -> drawn)",
      ...(MeteogramCard._recentDraws.length
        ? this._recentDrawLines().map((l) => `  ${l}`)
        : ["  (none)"]),
    ].filter((l) => l !== null);
    const text = lines.join("\n");

    let ok = false;
    try {
      await navigator.clipboard.writeText(text);
      ok = true;
    } catch {
      try {
        const ta = document.createElement("textarea");
        ta.value = text;
        ta.style.position = "fixed";
        ta.style.opacity = "0";
        this.shadowRoot?.appendChild(ta);
        ta.select();
        ok = document.execCommand("copy");
        ta.remove();
      } catch {
        ok = false;
      }
    }
    if (ok) {
      this._copiedAt = true;
      setTimeout(() => { this._copiedAt = false; }, 2500);
    } else {
      // Better to hand it over in a form they can select than to claim success.
      console.log(text);
      this._debugLog(`[${CARD_NAME}] diagnostics could not be copied; printed above`);
    }
  };

  /**
   * The card's setup, in one line.
   *
   * Everything here decides which sizing branch runs, and without it a screenshot of the
   * redraw list still needs a round of questions — which layout mode, which ratio, how
   * big is the screen — before it can be read. The point of the panel is that one
   * screenshot is enough.
   */
  private _setupHtml(): string {
    if (!this.diagnostics) return "";
    const bits = [
      `layout ${this.layoutMode}`,
      `mode ${this.displayMode}`,
      this.layoutMode !== "sections" ? `ratio ${this.aspectRatio}` : null,
      `span ${this.meteogramHours}`,
      this.animateChanges ? "animated" : "not animated",
    ].filter(Boolean);
    const ha = this.hass?.config?.version ? `HA ${this.hass.config.version}` : null;
    // What the card is sitting inside, which is the fact a layout report turns on and
    // the one nobody thinks to mention. The dashboard editor wraps a card in preview
    // elements whose sizing differs from the live view, so "only in design mode" shows
    // up here as a different chain rather than as something the reporter has to notice
    // and describe.
    const nest = MeteogramCard._ancestry(this);
    const screen =
      typeof window !== "undefined"
        ? `window ${window.innerWidth}\u00D7${window.innerHeight}`
        : null;
    // How long this page has been loaded, which separates two very different causes of
    // "the card redrew on its own".
    //
    // The constant is evaluated once when the module is first parsed, so it dates the
    // page, not the card. A card whose log holds a single "first draw" is a new element
    // either way — but if the page is new too, the browser discarded the tab and reloaded
    // everything, which is nothing to do with this card; and if the page is old, the
    // element was replaced underneath a page that kept running, which is. Without this
    // the two are indistinguishable from a paste, and they lead opposite ways.
    const pageAge = this._stamp(METEOGRAM_CARD_STARTUP_TIME);
    // The element's own age and how long it showed nothing before its chart arrived.
    //
    // Asked for directly: "next time I perceive a blank, I want to be able to see it".
    // A blank is a duration, and nothing in the panel measured one — the redraw list
    // gives the moment a draw happened but not how long the card had been empty waiting
    // for it, which is the whole of what is perceived.
    const cardAge =
      `card created ${this._stamp(new Date(this._createdAt))}` +
      (this._firstPaintMs === null
        ? ", not yet drawn"
        : this._heldFromMs === null
          ? `, blank ${this._firstPaintMs}ms`
          // Two numbers because they answer different questions: the first is how long
          // the card showed nothing, the second how long it showed the outgoing chart
          // before its own replaced it. Only the first is a defect.
          : `, blank ${this._heldFromMs}ms then held ` +
            `${Math.max(0, this._firstPaintMs - this._heldFromMs)}ms`);
    // Ordered by count: what is redrawing this card most is the first question anyone
    // asks of it, and the answer should not have to be counted by eye off the list.
    const tally = [...MeteogramCard._drawTally.entries()]
      .sort((a, b) => b[1] - a[1])
      .map(([k, n]) => `${k} ${n}`)
      .join(", ");
    const tail = [
      ha, screen, `page loaded ${pageAge}`, cardAge,
      // "on this page", because it is: the tally is static, like the list below it, so
      // with two cards on a dashboard each panel reports both. That is the useful
      // scope — the question is what is redrawing, not which element did it, and the
      // element numbers on the lines answer the latter — but the label has to say so or
      // the numbers read as this card's alone.
      tally ? `draws on this page since load: ${tally}` : null,
    ]
      .filter(Boolean)
      .join(" \u00B7 ");
    return (
      `<div style='margin-top:8px;color:var(--secondary-text-color);font-size:0.9em;'>` +
      `<b>Setup:</b> ${bits.join(" \u00B7 ")}` +
      (tail ? `<br>${tail}` : "") +
      (nest ? `<br>In: ${nest}` : "") +
      `</div>`
    );
  }

  /**
   * The recent-draws block for the diagnostics panel.
   *
   * Reads as a list because that is how the fault reads: a card that grows shows the
   * container climbing line after line, while a healthy one repeats the same numbers.
   * Anyone can photograph it, which is the point — the alternative asks for the browser
   * console.
   */
  /** The buffer with the elision marker in place, or [] when there is nothing to show. */
  private _recentDrawLines(): string[] {
    if (!MeteogramCard._recentDraws.length) return [];
    if (!MeteogramCard._droppedDraws) return [...MeteogramCard._recentDraws];
    const keep = MeteogramCard._RECENT_KEEP_FIRST;
    return [
      ...MeteogramCard._recentDraws.slice(0, keep),
      `\u2026 ${MeteogramCard._droppedDraws} further redraw${MeteogramCard._droppedDraws === 1 ? "" : "s"}` +
        ` not listed`,
      ...MeteogramCard._recentDraws.slice(keep),
    ];
  }

  private _recentDrawsHtml(): string {
    // Shown only with diagnostics on, which is also the only time the buffer is kept
    // fresh — see _noteDraw. Rendering it otherwise would offer numbers that stopped
    // updating at the last render, which is worse than offering none.
    if (!this.diagnostics || !MeteogramCard._recentDraws.length) return "";
    const rows = this._recentDrawLines()
      .map((l) => `<div>${l}</div>`)
      .join("");
    return (
      `<div style='margin-top:8px;color:var(--secondary-text-color);font-size:0.9em;'>` +
      `<b>Recent redraws</b> (container \u2192 drawn)` +
      `<div style='font-family:monospace;font-size:0.95em;line-height:1.4;margin-top:4px;` +
      // Each row stays on one line and the block scrolls sideways if it must: a wrapped
      // row splits the two sizes across lines, which is the one comparison being made.
      `white-space:nowrap;overflow-x:auto;'>` +
      rows +
      `</div></div>`
    );
  }

  /**
   * Add one line to the recent-draws ring, newest last.
   *
   * `kind` says what became of the request, because a list of draws alone cannot answer
   * the question this exists for. If the fuse holds off a runaway but the card keeps
   * growing for some other reason, a draws-only list falls silent and reads as fixed
   * while the card is still climbing on screen.
   *
   * `replaceLast` lets a run of held-off resizes stay one line that updates, so twenty
   * suppressed events do not flush everything else out of a six-line buffer — and so the
   * size it shows is the latest one, which is what says whether it is still growing.
   */
  private _note(kind: string, line: string, replaceLast = false): void {
    const at = new Date().toLocaleTimeString(this.getHaLocale(), {
      hour: "2-digit", minute: "2-digit", second: "2-digit",
    });
    // Inline rather than a line of its own. A separate marker would be clearer to read
    // but it spends a slot in a buffer that is already the scarce thing here — the
    // entries worth having are the unusual ones, and they are the first to be evicted by
    // anything routine. It also silently broke test/remount.mjs, which counts draws by
    // differencing the buffer before and after: extra entries evicted older `drew` lines
    // inside the measurement window, so a draw that happened was not counted.
    const entry = `${at} #${this._elementNo}  ${kind.padEnd(4)}  ${line}`;
    const last = MeteogramCard._recentDraws[MeteogramCard._recentDraws.length - 1];
    if (replaceLast && last && last.includes(`  ${kind.padEnd(4)}  `)) {
      MeteogramCard._recentDraws[MeteogramCard._recentDraws.length - 1] = entry;
    } else {
      MeteogramCard._recentDraws.push(entry);
    }
    if (MeteogramCard._recentDraws.length > MeteogramCard._RECENT_DRAWS) {
      // Drop from just after the preserved head, not from the front.
      MeteogramCard._recentDraws.splice(MeteogramCard._RECENT_KEEP_FIRST, 1);
      MeteogramCard._droppedDraws++;
    }
    // The panel's markup is built during render, and this is a plain field, so without a
    // nudge the block shows whatever the buffer held at the last render — in Home
    // Assistant that is masked by frequent hass updates, which is exactly the kind of
    // accident that leaves someone screenshotting stale numbers. Only when the panel is
    // actually on: rendering has a cost and this is diagnostics.
    //
    // It cannot recurse: a render only schedules a draw when the render signature has
    // changed, and nothing here changes it.
    if (this.diagnostics) this.requestUpdate();
  }

  /**
   * Add a detail to the newest entry of `kind`, if it is still the newest entry.
   *
   * A draw is logged when it starts, because a draw that never finishes is exactly the
   * kind that needs recording — but some of what is worth knowing is only decided part
   * way through. Amending is safe here because a draw in progress blocks any other, so
   * nothing can slip in between; and the guard means that if that ever stops being true
   * the detail is dropped rather than attached to the wrong line.
   */
  private _amendLastNote(kind: string, extra: string): void {
    const i = MeteogramCard._recentDraws.length - 1;
    if (i < 0) return;
    const marker = `  ${kind.padEnd(4)}  `;
    if (!MeteogramCard._recentDraws[i].includes(marker)) return;
    MeteogramCard._recentDraws[i] = `${MeteogramCard._recentDraws[i]}  ${extra}`;
    if (this.diagnostics) this.requestUpdate();
  }

  /**
   * Draw as soon as the container has told us the same size twice, or the deadline.
   *
   * The first draw used to wait a flat 180ms for layout to settle, and that is most of
   * what anyone sees as the card being slow to appear: measured end to end, about 200ms
   * of blank card of which roughly 20ms is the drawing. Beside an entity card — which
   * renders straight from hass with nothing to measure and so appears instantly — the
   * difference is obvious and looks like the card being sluggish.
   *
   * The wait exists for a real reason: an svg is drawn to measured dimensions, so
   * drawing before layout settles produces a chart at the wrong size and a correction
   * straight after. But 180ms was a fixed guess, and the container turns out to report
   * its final size one millisecond after Lit's first render and hold it unchanged for
   * the next four hundred. Two matching frames is evidence that layout has settled;
   * a fixed delay is only a hope that it has.
   *
   * The deadline is kept as the fallback, so a container that is genuinely still moving
   * — or is zero-sized because it has not been laid out at all — waits exactly as long
   * as it used to and no longer.
   *
   * Drawing early is safe against a later resize: the draw key includes the measured
   * size, so a resize callback arriving afterwards with the same numbers is skipped as
   * "nothing changed", and one arriving with different numbers is a real resize that
   * should redraw anyway.
   */
  private _drawWhenSizeSettles(callerId: string): void {
    const deadline = Date.now() + this._firstDrawSettleMs;
    let last = "";
    let stable = 0;
    // The signature is part of what has to have settled, not just the size.
    //
    // updated() resolves latitude and longitude out of hass, and both are in the
    // signature — so a draw that goes ahead before that has happened is drawing from a
    // configuration that is about to change, and the change schedules a second draw.
    // That is the double draw the comment on updated() describes, and drawing earlier
    // brought it straight back: every page load drew twice, both from loadD3AndDraw.
    // Waiting for two frames of the *same configuration at the same size* is what makes
    // the early draw safe rather than merely fast.
    const measure = (): string => {
      const chartDiv = this.shadowRoot?.querySelector("#chart");
      const parent = chartDiv?.parentElement;
      if (!parent) return "";
      const w = parent.clientWidth;
      const h = parent.clientHeight;
      if (w < MIN_DRAWABLE_WIDTH || h < MIN_DRAWABLE_HEIGHT) return "";
      return `${this._renderSignature}|${w}x${h}`;
    };
    let firstLook = true;
    const tick = () => {
      this._sizeWatch = null;
      if (!this.isConnected) return;          // removed while waiting; nothing to draw into
      const now = measure();
      // A plausible synchronous measurement is evidence, not a first data point: layout
      // has run and this is what it produced. Waiting for a second frame to agree only
      // guards against a size that changes immediately afterwards, and the draw key
      // already covers that — it carries the measured size, so a genuine change redraws
      // and an identical one is skipped as "nothing changed".
      if (firstLook && now) stable = MeteogramCard._STABLE_FRAMES;
      else if (now && now === last) stable++;
      else stable = now ? 1 : 0;
      firstLook = false;
      last = now;
      if (stable >= MeteogramCard._STABLE_FRAMES || Date.now() >= deadline) {
        this._debugLog(
          `[${CARD_NAME}] first draw after ${stable >= MeteogramCard._STABLE_FRAMES
            ? `${stable} matching measurements` : "the settle deadline"} (${now || "no size"})`
        );
        this._drawMeteogram(callerId);
        return;
      }
      this._sizeWatch = requestAnimationFrame(tick);
    };
    // Measure now, not on the next frame.
    //
    // Reading clientWidth forces the browser to compute layout, so the answer here is
    // the truth at this instant rather than a guess about it — and it is available:
    // probed across a rebuild, the container reports its final size 0.6ms after the
    // first render and holds it unchanged for the next five hundred milliseconds.
    //
    // Starting the loop on a frame instead cost the whole wait. Under the load of a
    // rebuild the frames are far apart, and two of them put the first draw 28ms out on
    // a 60ms blank — more than the drawing itself took. If the first synchronous
    // measurement is already plausible there is nothing left to wait for; if it is not,
    // the frame loop below runs exactly as it did.
    tick();
  }

  private _layer(parent: any, name: string, clear: boolean = true): any {
    let g = parent.select(`:scope > g.layer-${name}`);
    if (g.empty()) {
      g = parent.append("g").attr("class", `layer layer-${name}`);
    }
    // A drawer that has been converted to keyed joins passes clear=false: its elements
    // have to survive the redraw for the join to match them, which is the entire point.
    if (clear) g.selectAll("*").remove();
    return g;
  }

  private static _hasCoord(v: unknown): v is number {
    return typeof v === "number" && Number.isFinite(v);
  }

  // The visual editor: ha-form driven by the schema in config-form.ts. Not the static
  // getConfigForm, which cannot show this card's defaults — see meteogram-card-editor.ts.
  public static getConfigElement(): HTMLElement {
    return document.createElement("meteogram-card-editor");
  }

  // Define card configuration type
  public static getStubConfig(): object {
    return {
      title: "Weather Forecast",
      show_cloud_cover: true,
      show_pressure: true,
      show_precipitation: true, // Use new option
      show_weather_icons: true,
      show_wind: true,
      dense_weather_icons: true,
      meteogram_hours: "48h",
      diagnostics: DIAGNOSTICS_DEFAULT, // Default to DIAGNOSTICS_DEFAULT
      debug: false, // Debug logging (undocumented)
      altitude: undefined, // Optional altitude for WeatherAPI
      // Coordinates will be fetched from HA configuration
    };
  }

  // According to the boilerplate, add getCardSize for panel mode
  public getCardSize(): number {
    return 9; // Returns a height in units of 50 pixels
  }

  // The rules for sizing your card in the grid in sections view
  getGridOptions() {
    return {
      rows: 8,
      columns: "full",
      min_rows: 4,
      max_rows: 8,
    };
  }

  // Handle initial setup - now properly setup resize observer
  connectedCallback() {
    super.connectedCallback();
    MeteogramCard._live.add(this);

    // Coming back into the DOM is not the same as arriving in it.
    //
    // Home Assistant detaches the whole dashboard panel after five minutes hidden
    // (partial-panel-resolver._onHidden) and re-appends the same elements when you
    // return, so connectedCallback runs again on a card that has been drawing happily
    // for an hour. Two things went wrong there, both visible in one recorded session:
    //
    //   11:42:02  drew  first load  865x973 -> 865x487  rebuilt
    //   11:42:02  drew  resize      865x973 -> 865x487  reused    <- animated
    //   11:42:07  drew  new element 865x973 -> 865x487  rebuilt   <- replaced anyway
    //
    // First, two draws in the same second: the load path and the resize observer's
    // opening callback arrive more than the 60ms coalesce window apart, so the burst
    // that a fresh mount absorbs into one draw was split into two here. Restoring
    // _hasDrawnOnce to false puts re-attachment back on the first-draw deadline, which
    // is measured from the first request and absorbs the whole burst.
    //
    // Second, the draw that survived was animating, which is what made the sequence
    // look like churn. It is marked instead, so it draws straight in.
    //
    // Holding it back was tried and was worse. The hold exists to avoid spending a draw
    // on an element about to be discarded, and that is a good trade only while the card
    // still has something on screen to spend it against. Re-attachment is not that
    // case: Lit re-renders on the way back in, which replaces the chart div, so the svg
    // is already gone — measured at zero nodes from the moment of detachment. Holding
    // therefore bought nothing and cost the full six seconds as blank card, every time.
    //
    // Going in or out of edit mode re-parents the card through hui-card-options, which
    // is a re-attach with no rebuild behind it, so the hold always ran to its deadline:
    //
    //   14:16:24  held  re-attached — waiting to see if the card is rebuilt
    //   14:16:30  drew  first load  917x860 -> 917x516  rebuilt
    //
    // Six seconds, three times over, for a card that could have drawn in twenty-five
    // milliseconds. The hold stays where it was right — a reconnect, where the element
    // keeps its chart and waiting is free.
    if (this._hasBeenConnected) {
      this._hasDrawnOnce = false;
      this._reattachDraw = true;
    }
    this._hasBeenConnected = true;
    
    // Initialize internal state variables (NOT config properties)
    this.chartLoaded = false;
    this.meteogramError = "";
    this.errorCount = 0;
    this.lastErrorTime = 0;
    this._statusExpiresAt = "";
    this._statusLastRender = "";
    this._statusLastFetch = "";
    this._statusApiSuccess = null;
    this._isInitialized = false;

    // Wait for DOM to be ready before setting up observers
    this.updateComplete.then(() => {
      this._setupResizeObserver();
      this._setupVisibilityObserver();
      this._setupMutationObserver();

      // No .bind() on any of these three. They are arrow-function class fields, so the
      // reference is already stable and per-element — and bind() returns a NEW function
      // every call, so the pair "add bind(x)" / "remove bind(x)" adds one object and then
      // asks to remove a different one that was never registered. Home Assistant detaches
      // and re-attaches the same element on every edit-mode round trip, so each trip left
      // two more live listeners behind: measured 1 before, 11 after five trips, and all
      // eleven still firing after the card had been removed from the document.
      document.addEventListener("visibilitychange", this._onVisibilityChange);

      // Handle page/panel navigation events
      window.addEventListener("location-changed", this._onLocationChanged);

      // Handle orientation changes (screen rotation)
      window.addEventListener("orientationchange", this._onOrientationChange);

      // Handle re-entry into DOM after being removed temporarily
      if (this.isConnected) {
        if (!this.chartLoaded) {
          this.loadD3AndDraw();
        } else {
          this._scheduleDrawMeteogram("connectedCallback");
        }
      }
    });
    document.addEventListener("click", this._onDocumentClick, true);
  }

  // Clean up all event listeners
  disconnectedCallback() {
    MeteogramCard._live.delete(this);

    // A card that has left the DOM has nothing to draw into.
    //
    // The pending draw used to outlive the element. Recorded 2026-08-21: a re-attach
    // started the six-second hold at 13:45:08, Home Assistant replaced the card at
    // 13:45:11, and the deferred draw fired at 13:45:14 on the element that had been
    // removed — measuring its container at 0x0 and logging "tiny  too small  0×0" three
    // seconds after its replacement had already drawn.
    //
    // The zero-size guard caught it, so nothing was drawn and nothing broke, but the
    // line is misleading in a log read by someone diagnosing a sizing fault, and a timer
    // holding a reference to a discarded card is worth not having either. The draw is
    // cancelled here instead. Re-attachment schedules a fresh one, so nothing is lost.
    if (this._drawTimer !== null) {
      clearTimeout(this._drawTimer);
      this._drawTimer = null;
      this._drawWantedSince = 0;
    }
    if (this._sizeWatch !== null) {
      cancelAnimationFrame(this._sizeWatch);
      this._sizeWatch = null;
    }
    this._handoverNode = null;
    this._adoptedSvg = false;

    this._teardownResizeObserver(); // <-- Implemented teardown for resize observer
    this._teardownVisibilityObserver();
    this._teardownMutationObserver();
    if (this._weatherEntityApiInstance) {
      this._weatherEntityApiInstance.destroy("disconnectedCallback");
      this._weatherEntityApiInstance = null;
    }

    document.removeEventListener("visibilitychange", this._onVisibilityChange);
    window.removeEventListener("location-changed", this._onLocationChanged);
    window.removeEventListener("orientationchange", this._onOrientationChange);
    document.removeEventListener("click", this._onDocumentClick, true);

    this.cleanupChart();
    // Clear retry timer if present
    if (this._weatherRetryTimeout) {
      clearTimeout(this._weatherRetryTimeout);
      this._weatherRetryTimeout = null;
    }
    // Clear refresh timer if present
    if (this._weatherRefreshTimeout) {
      clearTimeout(this._weatherRefreshTimeout);
      this._weatherRefreshTimeout = null;
    }
    super.disconnectedCallback();
  }

  // Helper method to check if element is currently visible
  private _isElementVisible(): boolean {
    if (!this.isConnected || !this.shadowRoot) return false;

    // Check if document is visible at all
    if (document.hidden) return false;

    const element = this.shadowRoot.host as HTMLElement;
    if (!element) return false;

    // Check if element has dimensions
    if (element.offsetWidth === 0 && element.offsetHeight === 0) return false;

    // Check computed style
    const computedStyle = window.getComputedStyle(element);
    if (computedStyle.display === "none") return false;
    if (computedStyle.visibility === "hidden") return false;

    // Check if element is in viewport with getBoundingClientRect
    const rect = element.getBoundingClientRect();
    if (
      rect.top + rect.height <= 0 ||
      rect.left + rect.width <= 0 ||
      rect.bottom >= window.innerHeight ||
      rect.right >= window.innerWidth
    ) {
      return false;
    }

    return true;
  }

  // Set up visibility observer to detect when card becomes visible
  private _setupVisibilityObserver() {
    if (!this._intersectionObserver) {
      this._intersectionObserver = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (entry.isIntersecting) {
              this._handleVisibilityChange();
              break;
            }
          }
        },
        {
          threshold: [0.1], // Trigger when 10% of the card is visible
        }
      );

      // Start observing the card element itself
      if (this.shadowRoot?.host) {
        this._intersectionObserver.observe(this.shadowRoot.host);
      }
    }
  }

  // Clean up visibility observer
  private _teardownVisibilityObserver() {
    if (this._intersectionObserver) {
      this._intersectionObserver.disconnect();
      this._intersectionObserver = null;
    }
  }

  // Detect DOM changes that may affect visibility (like tab switching in HA)
  private _setupMutationObserver() {
    if (!this._mutationObserver) {
      this._mutationObserver = new MutationObserver((mutations) => {
        // Check if we need to handle display/visibility changes
        let needsVisibilityCheck = false;

        for (const mutation of mutations) {
          // Look specifically for the ha-tabs mutations that happen when switching tabs
          if (
            mutation.target instanceof HTMLElement &&
            (mutation.target.tagName === "HA-TAB" ||
              mutation.target.tagName === "HA-TABS" ||
              mutation.target.classList.contains("content") ||
              mutation.target.hasAttribute("active"))
          ) {
            needsVisibilityCheck = true;
            break;
          }

          // Check for display/visibility style changes
          if (
            mutation.type === "attributes" &&
            (mutation.attributeName === "style" ||
              mutation.attributeName === "class" ||
              mutation.attributeName === "hidden" ||
              mutation.attributeName === "active")
          ) {
            needsVisibilityCheck = true;
            break;
          }
        }
      });

      // Specifically observe HA-TABS elements for tab switching
      document
        .querySelectorAll("ha-tabs, ha-tab, ha-tab-container")
        .forEach((tabs) => {
          if (tabs) {
            this._mutationObserver!.observe(tabs, {
              attributes: true,
              childList: true,
              subtree: true,
            });
          }
        });

      // Also observe the parent elements to detect when they become visible
      // Use shadowRoot.host instead of this to get the actual HTMLElement
      const element = this.shadowRoot?.host || null;
      if (element instanceof HTMLElement) {
        let current: HTMLElement | null = element;
        while (current && current.parentElement) {
          this._mutationObserver.observe(current.parentElement, {
            attributes: true,
            attributeFilter: ["style", "class", "hidden", "active"],
            childList: false,
            subtree: false,
          });
          current = current.parentElement;
        }
      }

      // Observe the entire dashboard for broader changes
      const dashboardEl = document.querySelector(
        "home-assistant, ha-panel-lovelace"
      );
      if (dashboardEl) {
        this._mutationObserver.observe(dashboardEl, {
          childList: true,
          subtree: true,
        });
      }
    }
  }

  // Clean up mutation observer
  private _teardownMutationObserver() {
    if (this._mutationObserver) {
      this._mutationObserver.disconnect();
      this._mutationObserver = null;
    }
  }

  // Handle document visibility changes (browser tab switching)
  /**
   * Notice a websocket reconnect, because a card rebuild follows it.
   *
   * Home Assistant sets `hass.connected` false when the socket drops and true when it
   * comes back, and the reconnect handler then refetches config — which lands as a new
   * config object, and `hui-view` compares those by reference, so every card in the
   * view is replaced. Returning to a backgrounded tab therefore produces two visible
   * events in about a second: this card notices the tab is visible, finds the forecast
   * expired, fetches and animates the new window into place — and is then thrown away
   * and rebuilt from scratch by Home Assistant.
   *
   * The card cannot stop the rebuild, but it can decline to spend a redraw on an
   * element that is about to be discarded. `connected` flips before the config arrives,
   * which is the whole of the warning needed: hold the redraw briefly, and either the
   * element is gone by the time the hold expires — costing nothing — or it survived and
   * the redraw happens a couple of seconds later than it would have, which nobody sees.
   */
  private _watchReconnect(): void {
    const now = this.hass?.connected;
    if (now === undefined) return;
    if (this._lastConnected === false && now === true) {
      this._holdDrawsUntil = Date.now() + MeteogramCard._RECONNECT_HOLD_MS;
      this._note("held", "reconnected \u2014 waiting to see if the card is rebuilt", true);
      this._debugLog(
        `[${CARD_NAME}] websocket reconnected; holding redraws for `
          + `${MeteogramCard._RECONNECT_HOLD_MS}ms in case Home Assistant rebuilds the card.`
      );
    }
    this._lastConnected = now;
  }

  private _onVisibilityChange = () => {
    if (document.hidden) {
      // Tab became hidden - pause subscription to save resources
      this._pauseWeatherSubscription("tab hidden");
    } else if (this.isConnected) {
      // Tab became visible - resume subscription and check for fresh data
      this._resumeWeatherSubscription("tab visible").then(() => {
        this._handleVisibilityChange();
      });
    }
  };

  // Handle Home Assistant location/page changes
  private _onLocationChanged = () => {
    // Small delay to let the DOM update
    setTimeout(() => {
      if (this.isConnected && this._isElementVisible()) {
        this._handleVisibilityChange();
      }
    }, 100);
  };

  // Add orientation change handler
  private _onOrientationChange = () => {
    // Always schedule a redraw on orientation change
    this._scheduleDrawMeteogram("orientationchange", true);
  };

  // Central handler for visibility changes
  private _handleVisibilityChange() {
    const isVisible = this._isElementVisible();

    if (isVisible) {
      // Element became visible - ensure subscription is active
      if (
        this._weatherEntityApiInstance &&
        !this._weatherEntityApiInstance.isSubscriptionActive()
      ) {
        this._debugLog(
          `[${CARD_NAME}] Element became visible, resuming subscription`
        );
        this._resumeWeatherSubscription("element visible");
      }

      const chartDiv = this.shadowRoot?.querySelector("#chart");
      const svgExists = chartDiv?.querySelector("svg");
      const chartIsVisible =
        chartDiv &&
        (chartDiv as HTMLElement).offsetWidth > 0 &&
        (chartDiv as HTMLElement).offsetHeight > 0;
      const needsRedraw =
        !this.svg ||
        !chartDiv ||
        chartDiv.innerHTML === "" ||
        chartDiv.clientWidth === 0 ||
        !svgExists;
      // Guard: If chart is already rendered and visible, skip scheduling
      if (!needsRedraw && svgExists && chartIsVisible) {
        this._debugLog(
          `[${CARD_NAME}] _handleVisibilityChange: chart already rendered and visible, skipping redraw.`
        );
        return;
      }
      if (needsRedraw && this.chartLoaded) {
        this.cleanupChart();
        this.requestUpdate();
        this.updateComplete.then(() =>
          this._scheduleDrawMeteogram("_handleVisibilityChange")
        );
      }
    } else {
      // Element became invisible - pause subscription to save resources
      this._pauseWeatherSubscription("element hidden");
    }
  }

  // Set up resize observer to detect size changes
  private _setupResizeObserver() {
    if (!this._resizeObserver) {
      this._resizeObserver = new ResizeObserver(this._onResize.bind(this));
    }

    // We need to wait for the element to be in the DOM
    setTimeout(() => {
      const chartDiv = this.shadowRoot?.querySelector("#chart");
      if (chartDiv && this._resizeObserver) {
        this._resizeObserver.observe(chartDiv);
      }
    }, 100);
  }

  // Clean up resize observer
  private _teardownResizeObserver() {
    if (this._resizeObserver) {
      this._resizeObserver.disconnect();
      this._resizeObserver = null;
    }
  }

  // Handle resize
  private _onResize(entries: ResizeObserverEntry[]) {
    if (entries.length === 0) return;
    const entry = entries[0];
    const now = Date.now();
    // Track last resize time for debounce/throttle
    if (!this._lastResizeTime) this._lastResizeTime = 0;
    // Calculate size change
    const widthChanged =
      Math.abs(entry.contentRect.width - this._lastWidth) > 2;
    const heightChanged =
      Math.abs(entry.contentRect.height - this._lastHeight) > 2;
    const significantChange = widthChanged || heightChanged;
    // Use a longer debounce interval (350ms)
    const DEBOUNCE_INTERVAL = 350;
    // If a resize occurs during rendering, queue a redraw
    if (significantChange && this._chartRenderInProgress) {
      this._pendingRender = true;
      this._debugLog(
        `[${CARD_NAME}] _onResize: chart render in progress, queuing redraw after render.`
      );
      // Schedule final redraw after resize ends
      this._scheduleResizeEndTimer();
      return;
    }
    // Always redraw if significant change and at least DEBOUNCE_INTERVAL since last redraw
    if (significantChange && now - this._lastResizeTime > DEBOUNCE_INTERVAL) {
      // A fuse against drawing ourselves bigger, over and over.
      //
      // Where the card's height comes from its own content — a panel dashboard — a
      // redraw can change the size that triggered it, and the resize observer reports
      // that as another significant change. The debounce only paces such a loop; it
      // cannot end it, and issue #46 is a card growing until it fills the screen.
      //
      // Six resize-driven redraws inside three seconds is not a user dragging a window;
      // it is the card chasing itself. Stop honouring them until things go quiet. A
      // config change or the forecast refresh still draws, because they do not come
      // through here.
      if (now - this._resizeStormSince > 3000) {
        this._resizeStormSince = now;
        this._resizeStormCount = 0;
      }
      if (++this._resizeStormCount > 6) {
        // The panel line is rewritten on every held resize, not just the first. It is one
        // line either way, but it carries the newest size — which is the only thing that
        // says whether the card is still growing while the fuse holds it off. A line
        // frozen at the moment the fuse engaged would read as "caught" whether or not it
        // was.
        this._note(
          "held",
          `resize \u00D7${this._resizeStormCount} in ${now - this._resizeStormSince}ms  ` +
            `${Math.round(entry.contentRect.width)}\u00D7${Math.round(entry.contentRect.height)}`,
          true
        );
        // The console line stays once per run: a resize per frame saying the same thing
        // twenty times buries everything else.
        if (this._resizeStormCount === 7) {
          this._debugLog(
            `[${CARD_NAME}] _onResize: ${this._resizeStormCount} resize-driven redraws in ` +
              `${now - this._resizeStormSince}ms at ` +
              `${Math.round(entry.contentRect.width)}x${Math.round(entry.contentRect.height)} — ` +
              `holding off until this settles.`
          );
        }
        return;
      }
      this._lastWidth = entry.contentRect.width;
      this._lastHeight = entry.contentRect.height;
      this._lastResizeTime = now;
      this._scheduleDrawMeteogram("_onResize-significant");
      // Schedule final redraw after resize ends
      this._scheduleResizeEndTimer();
      return;
    }
    // Fallback: schedule redraw if not visible or if chart is missing
    const chartDiv = this.shadowRoot?.querySelector("#chart");
    if (!chartDiv || !chartDiv.querySelector("svg")) {
      this._scheduleDrawMeteogram("_onResize-fallback");
    }
    // Always schedule a final redraw after resize ends
    this._scheduleResizeEndTimer();
  }

  // Helper to schedule a timer for end-of-resize detection
  private _scheduleResizeEndTimer() {
    if (this._resizeEndTimer) {
      clearTimeout(this._resizeEndTimer);
    }
    // Fire after 400ms of no further resize events
    this._resizeEndTimer = window.setTimeout(() => {
      this._onResizeEnd();
    }, 400);
  }

  // Called after resize has stopped for 400ms
  private _onResizeEnd() {
    this._resizeEndTimer = null;
    const chartDiv = this.shadowRoot?.querySelector("#chart");
    if (!chartDiv) return;
    const currentWidth = (chartDiv as HTMLElement).offsetWidth;
    const currentHeight = (chartDiv as HTMLElement).offsetHeight;
    // Only redraw if the chart container size has changed since last render
    if (
      Math.abs(currentWidth - this._lastRenderedWidth) > 2 ||
      Math.abs(currentHeight - this._lastRenderedHeight) > 2
    ) {
      this._debugLog(
        `[${CARD_NAME}] _onResizeEnd: detected final size change, scheduling redraw.`
      );
      this._scheduleDrawMeteogram("_onResizeEnd-final");
    } else {
      this._debugLog(
        `[${CARD_NAME}] _onResizeEnd: no significant size change since last render, skipping redraw.`
      );
    }
  }

  // Pause weather entity subscription when tab becomes hidden
  private _pauseWeatherSubscription(from: string): void {
    if (
      this._weatherEntityApiInstance &&
      this._weatherEntityApiInstance.isSubscriptionActive()
    ) {
      this._debugLog(
        `[${CARD_NAME}] Pausing weather subscription from: ${from}`
      );
      this._weatherEntityApiInstance.pause(from);
    }
  }

  // Resume weather entity subscription when tab becomes visible
  private async _resumeWeatherSubscription(from: string): Promise<void> {
    if (
      this._weatherEntityApiInstance &&
      !this._weatherEntityApiInstance.isSubscriptionActive()
    ) {
      this._debugLog(
        `[${CARD_NAME}] Resuming weather subscription from: ${from}`
      );
      try {
        await this._weatherEntityApiInstance.resume(from);
        this._debugLog(
          `[${CARD_NAME}] Weather subscription resumed successfully from: ${from}`
        );
      } catch (error) {
        console.error(
          `[${CARD_NAME}] Failed to resume weather subscription from: ${from}:`,
          error
        );
      }
    }
  }

  // Life cycle hooks
  /**
   * The size the chart is drawn at inside a container of the given size.
   *
   * Extracted because the handover placeholder has to match what the draw will produce,
   * and a second copy of this arithmetic drifted immediately: the placeholder was given
   * the container's size instead, so in a panel — where the container is far taller than
   * the 16:9 chart — it was stretched to full height for the moment it was on screen,
   * and the card appeared to resize itself before settling.
   */
  private _drawnSize(availW: number, availH: number): { w: number; h: number } {
    if (this.aspectRatio && this.layoutMode !== "sections") {
      const [aw, ah] = String(this.aspectRatio).split(":").map(Number);
      if (aw > 0 && ah > 0) {
        let w = availW;
        let h = Math.round(w * (ah / aw));
        if (h > availH) { h = availH; w = Math.round(h * (aw / ah)); }
        return { w, h };
      }
    }
    return { w: availW, h: availH };
  }

  /** Show the predecessor's chart while this element gets ready to draw its own. */
  private _adoptChartIfAvailable(): void {
    if (this._adoptedSvg) return;
    const chartDiv = this.shadowRoot?.querySelector("#chart") as HTMLElement | null;
    const parent = chartDiv?.parentElement;
    if (!chartDiv || !parent || chartDiv.querySelector("svg")) return;
    const w = parent.clientWidth;
    const h = parent.clientHeight;
    if (w < MIN_DRAWABLE_WIDTH || h < MIN_DRAWABLE_HEIGHT) return;

    const held = MeteogramCard._chartCache.get(this._renderSignature);
    if (!held) return;
    chartDiv.innerHTML = held.markup;
    const node = chartDiv.querySelector("svg") as SVGElement | null;
    if (!node) return;
    // Out of flow from the outset. As an ordinary flex child it would contribute to the
    // container's size, and the container is what the draw measures — so the placeholder
    // would size the card, the draw would use that size, and removing the placeholder
    // would shrink the container back and trigger a second draw. It would manufacture
    // the very redraw it exists to hide.
    node.style.position = "absolute";
    node.style.top = "0";
    node.style.left = "0";
    node.style.pointerEvents = "none";
    // Sized to what the draw will produce, not to the container. A real chart renders at
    // its own width and height even though #chart is a stretch flex container — measured
    // 880x495 inside an 880x957 box — so a placeholder filling the container would be
    // visibly taller than the chart replacing it.
    const drawn = this._drawnSize(w, h);
    node.setAttribute("width", String(drawn.w));
    node.setAttribute("height", String(drawn.h));
    this._adoptedSvg = true;
    this._handoverNode = node;
    if (this._heldFromMs === null) {
      this._heldFromMs = Date.now() - this._createdAt;
    }
    // A re-attached element usually has moments to live, so hold its draw — but only
    // now, with a chart on screen to hold behind.
    //
    // Re-attachment used to draw immediately on purpose. That was decided when a
    // re-attach meant an empty card, where waiting only lengthened the blank: it added
    // six seconds to every trip in and out of the dashboard editor. The handover landed
    // afterwards and removed the blank, and the decision was never revisited. Every one
    // of the wasted draws is logged `rebuilt (held)`, which is the evidence that there
    // was something on screen throughout.
    //
    // Gated on adoption having succeeded, which is the whole safety of it. With nothing
    // inherited there is nothing to wait behind, and holding would restore exactly the
    // blank that made this a bad idea the first time.
    if (this._reattachDraw) {
      this._holdDrawsUntil = Math.max(
        this._holdDrawsUntil,
        Date.now() + MeteogramCard._REATTACH_HOLD_MS
      );
      this._note("held", "re-attached \u2014 waiting to see if the card is replaced", true);
    }
    this._debugLog(`[${CARD_NAME}] adopted previous chart (drawn ${held.w}x${held.h})`);
  }

  protected firstUpdated(_: PropertyValues) {
    // Ensure styles are present in the shadow root and light DOM (host) for all environments
    const cssText =
      (this.constructor as typeof MeteogramCard).styles?.cssText || "";
    // Shadow root
    const root = this.shadowRoot;
    if (root && !root.querySelector("style[data-meteogram-card]")) {
      const style = document.createElement("style");
      style.setAttribute("data-meteogram-card", "");
      style.textContent = cssText;
      root.prepend(style);
    }
    // Light DOM (host)
    if (!this.querySelector("style[data-meteogram-card]")) {
      const style = document.createElement("style");
      style.setAttribute("data-meteogram-card", "");
      style.textContent = cssText;
      this.prepend(style);
    }

    // Make sure DOM is ready before initial drawing
    setTimeout(() => {
      this.loadD3AndDraw();
    }, 50);

    this._updateDarkMode(); // Ensure dark mode is set on first update

    // Call sampleFetchWeatherEntityForecast to log weather entity data
    // if (entityId && entityId !== 'none') {
    //     MeteogramCard.sampleFetchWeatherEntityForecast(this.hass, entityId as string);
    // }
  }

  updated(changedProps: PropertyValues) {
    // Initialize units when hass property changes
    if (changedProps.has("hass") && this.hass) {
      this._initializeUnits();
      this._watchReconnect();
    }

    // Resolve the location before the signature is taken, not during the draw.
    //
    // _drawMeteogram used to do this, and latitude and longitude are reactive
    // properties inside the signature — so the draw's own act of filling them in from
    // Home Assistant changed the signature and scheduled a second draw. Every load drew
    // the chart twice: once to discover where it is, once to use it. The debug log
    // showed the pair plainly, the second always attributed to "updated".
    //
    // Resolving here means the values are settled before anything is compared, so the
    // draw no longer writes to what triggers it.
    this._checkAndUpdateLocation();

    // Redraw when anything the chart is drawn from has changed.
    //
    // This used to be a hand-written list of changedProps.has("...") names, and the list
    // had drifted badly:
    //
    //   - display_mode was missing, so switching full/core/focussed never redrew. The
    //     chart kept whatever it drew first, which is why core showed full's legends and
    //     why they never came back after a visit to focussed;
    //   - focussed, aspect_ratio, layout_mode, altitude and entity_id were missing too;
    //   - it watched "show_precipitation", which is not a property at all — it is a
    //     getter over an undeclared field, so that entry could never fire.
    //
    // Comparing a signature of the actual values cannot drift the same way: a new option
    // is one entry here, and a renamed one is a compile error rather than silence.
    const signature = JSON.stringify([
      this.latitude, this.longitude, this.altitude, this.entityId,
      this.displayMode, this.focussed, this.aspectRatio, this.layoutMode,
      this.showCloudCover, this.showPressure, this.showPrecipitation,
      this.showWeatherIcons, this.showWind, this.showSun,
      this.denseWeatherIcons, this.meteogramHours, this.animateChanges,
      // Not hass itself — that changes constantly — but the two parts of it the chart
      // renders from. Both change rarely, and without them a user switching Home
      // Assistant to another language or to a 24-hour clock would keep the old labels
      // until something unrelated forced a redraw.
      this.hass?.language, this.hass?.locale?.time_format,
    ]);
    const configChanged = signature !== this._renderSignature;
    this._renderSignature = signature;

    // Here rather than firstUpdated: the signature is the cache key, and Lit runs
    // firstUpdated before this assignment, so a lookup there would be filed under an
    // empty signature and never match.
    //
    // Not restricted to the first draw. Home Assistant detaches the dashboard panel
    // after a few minutes hidden and re-appends the same elements on return; Lit
    // re-renders on the way back in and replaces the chart div, so a card that has been
    // drawing for an hour comes back just as empty as a brand-new one. Gating adoption
    // on "has never drawn" left that case blank for the whole of its redraw — the
    // "first load" line that precedes the rebuild in a wake-up log. The real condition
    // is that there is nothing on screen, which _adoptChartIfAvailable already checks.
    this._adoptChartIfAvailable();

    // hass is deliberately excluded: it updates constantly and would redraw the chart on
    // every state change in the house.
    const needsRedraw = configChanged;

    if (!needsRedraw) {
      return;
    } else {
      this._debugLog(
        `[${CARD_NAME}] updated(): scheduling redraw, chartLoaded=${this.chartLoaded}`
      );
    }

    if (this.chartLoaded && needsRedraw) {
      // Guard: If chart is already rendered and visible, skip scheduling
      this._scheduleDrawMeteogram("updated");
    }

    // Track component state for better lifecycle management
    if (!this._isInitialized && this.shadowRoot) {
      this._isInitialized = true;

      // Force a redraw when added back to the DOM after being in the editor
      if (this.chartLoaded) {
        const chartDiv = this.shadowRoot?.querySelector("#chart");
        if (chartDiv && chartDiv.innerHTML === "") {
          this._scheduleDrawMeteogram("updated-forced");
        }
      }
    }
    this._updateDarkMode(); // Always check dark mode after update
  }

  // Helper to encode cache key as base64 of str(lat)+str(lon)
  private static encodeCacheKey(lat: number, lon: number): string {
    const keyStr = String(lat) + String(lon);
    // btoa works for ASCII; for full Unicode use a more robust encoder if needed
    return btoa(keyStr);
  }

  // Helper to get a truncated location key for caching (now uses base64)
  private getLocationKey(lat: number, lon: number): string {
    // Always use 4 decimals for both lat and lon
    return MeteogramCard.encodeCacheKey(
      Number(lat.toFixed(4)),
      Number(lon.toFixed(4))
    );
  }

  // Save HA location to localStorage under "meteogram-card-default-location"

  // Load location from localStorage under "meteogram-card-default-location"

  /**
   * The WeatherAPI for the current location, rebuilt only when the location moves.
   *
   * One place, because there were three — in the config branch, in the Home Assistant
   * fallback, and again in fetchWeatherData — each repeating the same four-part "has it
   * moved" test and its own copy of the coordinate truncation. They were identical, but
   * only by inspection: checking that every one of them truncated took reading all
   * three, and a fourth added later would silently have sent met.no full-precision
   * coordinates, which is a 403 under their terms.
   *
   * Truncation itself now lives in the WeatherAPI constructor, so comparing the stored
   * lat/lon against freshly truncated values is like for like, and a caller that passes
   * raw coordinates cannot cause a rebuild on every call.
   */
  private _ensureWeatherApi(lat: number, lon: number): WeatherAPI {
    const rLat = parseFloat(Number(lat).toFixed(4));
    const rLon = parseFloat(Number(lon).toFixed(4));
    if (
      !this._weatherApiInstance ||
      this._weatherApiInstance.lat !== rLat ||
      this._weatherApiInstance.lon !== rLon ||
      this._weatherApiInstance.altitude !== this.altitude
    ) {
      this._weatherApiInstance = new WeatherAPI(
        rLat,
        rLon,
        this.altitude,
        this.debug
      );
    }
    return this._weatherApiInstance;
  }

  // Check if we need to get location from HA
  private _checkAndUpdateLocation() {
    // Try to get location from config first
    if (this.latitude !== undefined && this.longitude !== undefined) {
      this.latitude = parseFloat(Number(this.latitude).toFixed(4));
      this.longitude = parseFloat(Number(this.longitude).toFixed(4));
      this._ensureWeatherApi(this.latitude, this.longitude);
      return;
    }

    // Try to get location from HA
    if (
      this.hass &&
      (this.latitude === undefined || this.longitude === undefined)
    ) {
      const hassConfig = this.hass.config || {};
      const hassLocation =
        hassConfig.latitude !== undefined && hassConfig.longitude !== undefined;

      if (hassLocation) {
        // Truncate to 4 decimals before using
        const haLat = parseFloat(Number(hassConfig.latitude).toFixed(4));
        const haLon = parseFloat(Number(hassConfig.longitude).toFixed(4));
        this.latitude = haLat;
        this.longitude = haLon;
        // The elevation comes with the coordinates, and only with them.
        //
        // met.no asks for an altitude and, without one, resolves the point against a
        // coarse global elevation model — which in anything but flat country can be out
        // by enough to shift the temperature curve. Home Assistant already holds the
        // figure the owner entered for their own home, so a card that has fallen back to
        // the home coordinates should use the home elevation too rather than leaving
        // met.no to guess at a location it has already been told.
        //
        // Only when the coordinates were inherited. A card pointed at explicit
        // latitude/longitude is describing somewhere else, and the home's elevation
        // would then be a confident wrong answer for it.
        //
        // Only when nothing was configured: an explicit altitude in the card config
        // always wins. Number.isFinite rather than a truthiness test, because sea level
        // is a real elevation and 0 is a legitimate value.
        if (this.altitude === undefined && Number.isFinite(hassConfig.elevation)) {
          this.altitude = Math.round(Number(hassConfig.elevation));
          this._altitudeFromHome = true;
        }
        // After the elevation above, not before: altitude is part of the identity this
        // compares on, so adopting HA's has to happen first or the instance is rebuilt
        // on the very next call.
        this._ensureWeatherApi(this.latitude, this.longitude);
        this._debugLog(
          `[${CARD_NAME}] Using HA location: ${this.latitude}, ${this.longitude}` +
            (this._altitudeFromHome ? ` at ${this.altitude}m (from HA)` : "")
        );
        return;
      }
    }

    // No coordinates from the config and none from Home Assistant. Previously this
    // fell back to a cached value from localStorage and then to hardcoded London
    // coordinates, which drew a plausible-looking forecast for the wrong continent
    // with nothing on screen to say so. The sun strip made that worse: sunrise and
    // sunset are computed from these coordinates, so the whole card was quietly wrong.
    // Say so instead.
    if (this.latitude === undefined || this.longitude === undefined) {
      this.meteogramError = trnslt(
        this.hass,
        "ui.card.meteogram.no_location",
        "No location. Set latitude and longitude on the card, or set Home Assistant's "
          + "location in Settings."
      );
      this._weatherApiInstance = null;
    }
  }

  // Modularized: Use chartRenderer to ensure D3 is loaded, then schedule draw
  async loadD3AndDraw(): Promise<void> {
    if (!this._chartRenderer) {
      this._chartRenderer = new MeteogramChart(this);
    }
    this.chartLoaded = true;
    this._scheduleDrawMeteogram("loadD3AndDraw");
  }

  async fetchWeatherData(): Promise<ForecastData> {
    this.logMethodEntry("fetchWeatherData", {
      entityId: this.entityId,
      lat: this.latitude,
      lon: this.longitude,
    });
    if (
      this.entityId &&
      this.entityId !== "none" &&
      !this._weatherEntityApiInstance
    ) {
      if (this.hass) {
        this._debugLog(
          `[${CARD_NAME}] Initializing WeatherEntityAPI for entity: ${this.entityId}`,
          this._weatherEntityApiInstance
        );
        this._weatherEntityApiInstance = new WeatherEntityAPI(
          this.hass,
          this.entityId as string,
          this,
          "fetchWeatherData",
          this.debug
        );
      }
    } else {
      if (
        this.entityId &&
        this.entityId == "none" &&
        this._weatherEntityApiInstance
      ) {
        this._weatherEntityApiInstance.destroy("fetchWeatherData");
        this._weatherEntityApiInstance = null;
      }
    }

    // If weather entity is set and not "none", use WeatherEntityAPI
    if (
      this.entityId &&
      this.entityId !== "none" &&
      this._weatherEntityApiInstance
    ) {
      // Always fetch fresh data from the entity, not from any cache
      const entityData = this._weatherEntityApiInstance.getForecastData();

      // Update status fields for entity data (similar to API data)
      const diag = this._weatherEntityApiInstance.getDiagnosticInfo();
      if (diag.inMemoryData.lastFetchFormatted !== "not yet fetched") {
        // Use pre-formatted version to avoid double formatting
        this._statusLastFetch = diag.inMemoryData.lastFetchFormatted;
      }
      if (diag.inMemoryData.expiresAt) {
        this._statusExpiresAt = new Date(
          diag.inMemoryData.expiresAt
        ).toISOString();
        this.apiExpiresAt = diag.inMemoryData.expiresAt; // Update main apiExpiresAt field
      }

      // Retrieve attribution from entity if available
      let entityAttribution: string | null = null;
      if (
        this.hass &&
        this.entityId &&
        this.hass.states &&
        this.hass.states[this.entityId]
      ) {
        entityAttribution =
          this.hass.states[this.entityId].attributes?.attribution || null;
      }
      this.entityAttribution = entityAttribution;
      // Detect if entity is unavailable (null or empty time array)
      // console.debug(`[${CARD_NAME}] fetchWeatherData from entity ${this.entityId}:`, entityData);
      if (!entityData || !entityData.time || entityData.time.length === 0) {
        throw new Error(
          `Weather entity ${this.entityId} is unavailable. Waiting for it to become available...`
        );
      }
      this._currentUnits =
        entityData && entityData.units ? entityData.units : {};
      this.updateDataAvailability(entityData);
      this.checkMissingForecastKeys(entityData);
      return entityData;
    }

    // Always truncate to 4 decimals before using
    const lat =
      this.latitude !== undefined
        ? parseFloat(Number(this.latitude).toFixed(4))
        : undefined;
    const lon =
      this.longitude !== undefined
        ? parseFloat(Number(this.longitude).toFixed(4))
        : undefined;
    this._debugLog(
      `[${CARD_NAME}] fetchWeatherData called with lat=${lat}, lon=${lon}`
    );

    // Enhanced location check with better error message
    if (!MeteogramCard._hasCoord(lat) || !MeteogramCard._hasCoord(lon)) {
      this._checkAndUpdateLocation(); // Try harder to get location

      const checkedLat =
        this.latitude !== undefined
          ? parseFloat(Number(this.latitude).toFixed(4))
          : undefined;
      const checkedLon =
        this.longitude !== undefined
          ? parseFloat(Number(this.longitude).toFixed(4))
          : undefined;

      if (!MeteogramCard._hasCoord(checkedLat) || !MeteogramCard._hasCoord(checkedLon)) {
        throw new Error(
          "Could not determine location. Please check your card configuration or Home Assistant settings."
        );
      }
    }

    // Ensure WeatherAPI instance is initialized. Taking the return value rather than
    // re-reading the field is what keeps it non-null for the rest of this method — the
    // old inline `if (!this._weatherApiInstance || …)` block was doing that narrowing
    // as a side effect.
    const weatherApi = this._ensureWeatherApi(lat!, lon!);

    // If a fetch is already in progress, return the same promise
    if (this.weatherDataPromise) {
      // Update _statusLastFetch with weatherApi._lastFetchTime if available
      if (
        this._weatherApiInstance &&
        (this._weatherApiInstance as any)._lastFetchTime
      ) {
        const lastFetch = (this._weatherApiInstance as any)._lastFetchTime;
        if (lastFetch) {
          this._statusLastFetch = new Date(lastFetch).toISOString();
        }
      }
      this._debugLog(
        `[${CARD_NAME}] fetchWeatherData: returning existing in-progress promise.`
      );
      return this.weatherDataPromise;
    }
    // Cache the promise so repeated calls during chart draw use the same one
    this.weatherDataPromise = (async () => {
      let result: ForecastData = null as any;
      try {
        // Use the new getForecastData method
        const resultMaybe = await weatherApi.getForecastData();
        if (!resultMaybe) {
          throw new Error("No forecast data available from WeatherAPI.");
        }
        result = resultMaybe;
        this.updateDataAvailability(result);
        this.checkMissingForecastKeys(result);
        this.apiExpiresAt = weatherApi.expiresAt;
        this._statusApiSuccess = true;
        this._lastApiSuccess = true;
        this._apiFailures = 0;
        // Store units from API
        this._currentUnits = result && result.units ? result.units : {};
        // Filter result by meteogramHours
        const targetHours = this.parseHoursConfig(this.meteogramHours);
        const dataPoints = this.getDataPointsForHours(targetHours, result.time);

        // Only keep the first N data points
        // Only slice array properties, not units or fetchTimestamp
        const arrayKeys = [
          "pressure",
          "time",
          "temperature",
          "rain",
          "rainMin",
          "rainMax",
          "cloudCover",
          "windSpeed",
          "windDirection",
          "symbolCode",
        ];
        // Copy, do not mutate. `getForecastData()` hands back `this._forecastData` by
        // reference, so slicing these arrays in place permanently truncated the weather
        // API's own cache to whatever meteogram_hours happened to be set at the first
        // render. Two visible consequences: widening the span did nothing, because the
        // cache no longer held the data; and availableHours collapsed — 237 on first
        // load, then 49 (48 sliced hours + 1) on every render after.
        const sliced: any = { ...result };
        arrayKeys.forEach((key) => {
          if (Array.isArray((result as any)[key])) {
            sliced[key] = (result as any)[key].slice(0, dataPoints);
          }
        });
        result = sliced as ForecastData;
        // this._scheduleDrawMeteogram();

        // Update _statusLastFetch with weatherApi._lastFetchTime if available
        if (weatherApi && (weatherApi as any)._lastFetchTime) {
          const lastFetch = (weatherApi as any)._lastFetchTime;
          if (lastFetch) {
            this._statusLastFetch = new Date(lastFetch).toISOString();
          }
        }

        return result;
      } catch (error: unknown) {
        console.error(`[${CARD_NAME}] ERROR in fetchWeatherData:`, {
          error: error,
          errorMessage: (error as Error)?.message,
          errorStack: (error as Error)?.stack,
          weatherApiLastError: weatherApi.lastError,
          weatherApiStatusCode: weatherApi.lastStatusCode,
          weatherApiExpiresAt: weatherApi.expiresAt,
        });
        this._statusApiSuccess = false;
        // Cleared here as well as counted. `_lastApiSuccess` was set true on the first
        // success and never reset, and it is tested *before* `_statusApiSuccess` when
        // colouring the attribution icon — so a card that had ever worked stayed green
        // through every subsequent failure, which is the opposite of what the icon is
        // for.
        this._lastApiSuccess = false;
        this._apiFailures += 1;
        const diag = weatherApi.getDiagnosticText();
        this._debugLog(`[${CARD_NAME}] WeatherAPI diagnostic:`, diag);
        
        // Check if WeatherAPI has cached data from localStorage that we can use
        // The WeatherAPI loads cache in getForecastData(), so check its internal _forecastData
        const cachedData = (weatherApi as any)._forecastData;
        if (cachedData) {
          console.warn(`[${CARD_NAME}] API error, but using cached forecast data from localStorage to keep chart visible`);
          // Store error message but return cached data
          this.setError(diag);
          return cachedData;
        }
        
        // No cached data available - fail normally
        this.setError(diag);
        this.logErrorContext("fetchWeatherData", error);
        // `diag` already opens with the status and the message, so repeating them here
        // only gave the failure two chances to be unreadable.
        throw new Error(diag, { cause: error });
      } finally {
        // Do NOT clear weatherDataPromise here, so repeated calls use the same promise
        // Only clear it after chart draw is complete
      }
    })();
    return this.weatherDataPromise;
  }

  /**
   * Tear down this element's own chart, without touching an inherited placeholder.
   *
   * The exception matters more than it looks. A handed-over chart arrives through
   * innerHTML rather than d3, so `this.svg` is null while it is on screen — and
   * `_handleVisibilityChange` reads a null `svg` as "there is no chart here", cleans up,
   * and schedules a redraw. The redraw is right; the cleanup threw away the very thing
   * put there to cover it, which is what emptied the card two frames after adopting.
   *
   * The placeholder is dropped in the draw's own finally(), once there is a real chart
   * to replace it with. Nothing else should remove it.
   */
  cleanupChart(): void {
    try {
      if (this.svg && typeof this.svg.remove === "function") {
        this.svg.remove();
        this.svg = null;
      }
      if (this.shadowRoot) {
        const chartDiv = this.shadowRoot.querySelector("#chart");
        if (chartDiv) {
          const keep = this._handoverNode;
          if (keep && keep.parentNode === chartDiv) {
            for (const child of Array.from(chartDiv.childNodes)) {
              if (child !== keep) chartDiv.removeChild(child);
            }
          } else {
            chartDiv.innerHTML = "";
          }
        }
      }
    } catch (error) {
      console.warn("Error cleaning up chart:", error);
    }
  }

  /**
   * Analyzes forecast data availability and updates _dataAvailability dictionary
   */
  private updateDataAvailability(data: ForecastData) {
    // Check if arrays exist and have valid (non-null) data
    this._dataAvailability.temperature =
      Array.isArray(data.temperature) &&
      data.temperature.some((val) => val !== null && typeof val === "number");

    this._dataAvailability.wind =
      Array.isArray(data.windSpeed) &&
      data.windSpeed.some((val) => val !== null && typeof val === "number") &&
      Array.isArray(data.windDirection) &&
      data.windDirection.some((val) => val !== null && typeof val === "number");

    this._dataAvailability.pressure =
      Array.isArray(data.pressure) &&
      data.pressure.some((val) => val !== null && typeof val === "number");

    this._dataAvailability.cloudCover =
      Array.isArray(data.cloudCover) &&
      data.cloudCover.some((val) => val !== null && typeof val === "number");

    this._dataAvailability.precipitation =
      Array.isArray(data.rain) &&
      data.rain.some((val) => val !== null && typeof val === "number");

    this._dataAvailability.precipitationMinMax =
      (Array.isArray(data.rainMin) &&
        data.rainMin.some((val) => val !== null && typeof val === "number")) ||
      (Array.isArray(data.rainMax) &&
        data.rainMax.some((val) => val !== null && typeof val === "number"));

    this._dataAvailability.windGust =
      Array.isArray(data.windGust) &&
      data.windGust.some((val) => val !== null && typeof val === "number");
  }

  /**
   * Checks which forecast keys are missing from the provided data and updates _missingForecastKeys.
   */
  private checkMissingForecastKeys(data: any) {
    // List of all possible keys the card can use
    const requiredKeys = [
      "time",
      "temperature",
      "rain",
      "rainMin",
      "rainMax",
      "cloudCover",
      "windSpeed",
      "windDirection",
      "windGust",
      "symbolCode",
      "pressure",
    ];
    if (!data || typeof data !== "object") {
      this._missingForecastKeys = requiredKeys;
      this._availableHours = "unknown";
      return;
    }
    const missing = requiredKeys.filter(
      (key) =>
        !(key in data) ||
        !Array.isArray(data[key]) ||
        data[key].length === 0 ||
        // Check if array contains only null/undefined values
        data[key].every((value: any) => value === null || value === undefined)
    );
    this._missingForecastKeys = missing;
    // Calculate available hours from raw time array
    if (Array.isArray(data.time) && data.time.length > 1) {
      const arr = data.time;
      const first = arr[0];
      const last = arr[arr.length - 1];
      if (first instanceof Date && last instanceof Date) {
        const ms = last.getTime() - first.getTime();
        this._availableHours = Math.round(ms / (1000 * 60 * 60)) + 1;
      } else if (typeof first === "string" && typeof last === "string") {
        const ms = new Date(last).getTime() - new Date(first).getTime();
        this._availableHours = Math.round(ms / (1000 * 60 * 60)) + 1;
      } else {
        this._availableHours = arr.length;
      }
    } else {
      this._availableHours = "unknown";
    }
  }

  async _drawMeteogram(caller: string = "unknown") {
    this.logMethodEntry("_drawMeteogram", { caller });
    this._debugLog(`[${CARD_NAME}] _drawMeteogram called from: ${caller}`);
    // Limit excessive error messages
    const now = Date.now();
    if (this.meteogramError && now - this.lastErrorTime < 60000) {
      // Don't try to redraw for at least 1 minute after an error
      this.errorCount++;
      return;
    }

    this.meteogramError = "";

    // Location is resolved in updated(), before the render signature is taken — doing
    // it here made the draw change the properties that trigger drawing.

    if (!MeteogramCard._hasCoord(this.latitude)
        || !MeteogramCard._hasCoord(this.longitude)) {
      this.setError(
        "Location not available. Please check your card configuration or Home Assistant settings."
      );
      return;
    }

    // Wait for the render cycle to complete before accessing the DOM
    await this.updateComplete;

    // Use the _logDomState method to log diagnostic info
    this._logDomState();

    // The old chart is deliberately left alone here. Clearing it at this point emptied
    // the card and then waited — 10ms, then a whole fetch — before anything replaced
    // it, so every redraw flashed blank. It is replaced at the moment the new one is
    // built instead, further down.

    // No sleep here.
    //
    // This was ten milliseconds of "ensure we have a clean update cycle before accessing
    // the DOM again", but `await this.updateComplete` two lines above is that guarantee,
    // and the branch immediately below is the real safety net: if the chart div is
    // missing it re-renders, awaits, waits fifty milliseconds and looks again. The sleep
    // covered nothing the retry does not, and it was paid on every draw — ten of the
    // thirty-five milliseconds before a rebuilt card showed anything.
    const chartDiv = this.shadowRoot?.querySelector("#chart");
    if (!chartDiv) {
      console.error("Chart container not found in DOM");
      if (this.isConnected) {
        this.requestUpdate();
        await this.updateComplete;
        await new Promise((resolve) => setTimeout(resolve, 50));
        const retryChartDiv = this.shadowRoot?.querySelector("#chart");

        if (!retryChartDiv) {
          console.error("Chart container still not found after retry");
          if (this.shadowRoot) {
            const cardContent = this.shadowRoot.querySelector(".card-content");
            if (cardContent && this.isConnected) {
              cardContent.innerHTML =
                '<div class="chart-wrap"><div id="chart"></div></div>';
              const finalAttemptChartDiv =
                this.shadowRoot.querySelector("#chart");
              if (finalAttemptChartDiv) {
                this._renderChart(
                  finalAttemptChartDiv,
                  "_drawMeteogram-finalAttempt"
                );
                return;
              }
            }
          }
          return;
        }
        this._renderChart(retryChartDiv, "_drawMeteogram-retry");
      }
      return;
    }

    // Pass only chartDiv to _renderChart (remove data argument)
    this._renderChart(chartDiv, "_drawMeteogram");
  }

  private _renderChart(chartDiv: Element, source: string = "unknown") {
    this.logMethodEntry("_renderChart", { source });
    this._debugLog(`[${CARD_NAME}] _renderChart called from: ${source}`);

    // Queue logic: If already rendering, do not start another
    if (this._chartRenderInProgress) {
      return;
    }
    this._chartRenderInProgress = true;

    // Responsive sizing based on parent
    const parent = chartDiv.parentElement;
    const availableWidth = parent
      ? parent.clientWidth
      : (chartDiv as HTMLElement).offsetWidth || 350;
    const availableHeight = parent
      ? parent.clientHeight
      : (chartDiv as HTMLElement).offsetHeight || 180;

    // A container measuring (almost) nothing is a transient layout state — the card
    // being attached, revealed, or resized as the editor opens — not something to draw.
    //
    // Drawing anyway set the chart width to availableWidth minus the margins, so a
    // zero-width container gave -80, and every bar and band derived from it inherited a
    // negative width. The browser rejects those outright: hundreds of "<rect> attribute
    // width: A negative value is not valid" per resize. The visible symptom was the
    // blink, because this pass cleared the chart and drew a broken one before a later
    // pass with a real size drew it properly.
    //
    // Returning early leaves the good chart on screen. The resize observer calls back
    // once the container has a real size.
    // Nothing has changed since the last draw: same config, same size, chart still on
    // screen. Entering and leaving the editor fires connectedCallback, a visibility
    // change and a resize, each far enough apart to survive coalescing, and each drew
    // an identical chart. A forced redraw — the scheduled refresh after the forecast
    // expires — always goes through, so new data is never skipped.
    // The data belongs in the key as much as the config does.
    //
    // Without it the key says only "same settings, same size", so a redraw carrying a
    // fresh forecast is skipped — and on an always-on wall panel, where nothing about
    // the card ever changes, the display would then depend entirely on the refresh timer
    // surviving. That is issue #16, fixed in v3.0.0, and this guard would have quietly
    // reopened it: the redraws that used to save it (a visibility change, a resize) are
    // exactly the ones being skipped.
    const dataStamp =
      (this._weatherApiInstance as any)?._lastFetchTime ?? this.apiExpiresAt ?? 0;
    let drawKey =
      `${this._renderSignature}|${availableWidth}x${availableHeight}|${dataStamp}`;
    if (
      !this._forceNextDraw &&
      drawKey === this._lastDrawnKey &&
      chartDiv.querySelector("svg") &&
      // An inherited chart does not count as one that has been drawn.
      //
      // The clause above asks "is there something on screen", as a guard against
      // skipping a draw that would leave the card empty. A handed-over chart satisfies
      // it while being only a serialised copy — no d3 data bound to it — so skipping
      // here left the element holding a placeholder it could never update, and no real
      // draw ever ran. Adopting has to be a reason to draw, not a reason not to.
      !this._adoptedSvg
    ) {
      this._note("same", `nothing changed  ${availableWidth}\u00D7${availableHeight}`, true);
      this._debugLog(
        `[${CARD_NAME}] _renderChart: nothing changed since the last draw, skipping.`
      );
      this._chartRenderInProgress = false;
      return;
    }
    const wasForced = this._forceNextDraw;
    this._forceNextDraw = false;

    if (availableWidth < MIN_DRAWABLE_WIDTH || availableHeight < MIN_DRAWABLE_HEIGHT) {
      this._note("tiny", `too small  ${availableWidth}\u00D7${availableHeight}`, true);
      this._debugLog(
        `[${CARD_NAME}] _renderChart: container is ${availableWidth}x${availableHeight}, `
          + `too small to draw — keeping the current chart until it has a real size.`
      );
      this._chartRenderInProgress = false;
      return;
    }

    // --- Aspect Ratio Logic ---
    let width: number, height: number;
    // Use aspectRatio only if not in sections layout
    const useAspectRatio = this.aspectRatio && this.layoutMode !== "sections";
    if (useAspectRatio && typeof this.aspectRatio === "string") {
      // Parse aspect ratio string, e.g. "16:9"
      const [w, h] = this.aspectRatio.split(":").map(Number);
      if (w > 0 && h > 0) {
        // One definition, shared with the handover placeholder. See _drawnSize.
        ({ w: width, h: height } = this._drawnSize(availableWidth, availableHeight));
      } else {
        // Measured from the container, not from our own output.
        //
        // The chart div is styled height:100%, so where the card has no externally fixed
        // height — a panel dashboard, most obviously — its height is decided by whatever is
        // inside it. Reading offsetHeight there and sizing the svg from it closes a loop: svg
        // height from div height from svg height, growing on each pass until the card
        // overflows the panel.
        //
        // This did not bite before only because the old code emptied the div before measuring,
        // so offsetHeight was always 0 and it always fell through to the container. Keeping the
        // previous chart on screen during a redraw removed that accident. Restored on purpose
        // now. See issue #46.
        width = availableWidth > 0
          ? availableWidth : (chartDiv as HTMLElement).offsetWidth;
        height = availableHeight > 0
          ? availableHeight : (chartDiv as HTMLElement).offsetHeight;
      }
    } else {
      // Default: fill container
      // Measured from the container, not from our own output.
      //
      // The chart div is styled height:100%, so where the card has no externally fixed
      // height — a panel dashboard, most obviously — its height is decided by whatever is
      // inside it. Reading offsetHeight there and sizing the svg from it closes a loop: svg
      // height from div height from svg height, growing on each pass until the card
      // overflows the panel.
      //
      // This did not bite before only because the old code emptied the div before measuring,
      // so offsetHeight was always 0 and it always fell through to the container. Keeping the
      // previous chart on screen during a redraw removed that accident. Restored on purpose
      // now. See issue #46.
      width = availableWidth > 0
        ? availableWidth : (chartDiv as HTMLElement).offsetWidth;
      height = availableHeight > 0
        ? availableHeight : (chartDiv as HTMLElement).offsetHeight;
    }

    // A small size change is scaled, not redrawn.
    //
    // Entering the dashboard editor wraps the card in hui-card-options, which costs it
    // about ten pixels of width and a hundred of height. In a panel that measured
    // 675x952 -> 665x839 of container, so the chart went 675x380 -> 665x374: 1.5% narrower
    // and 1.6% shorter. Rebuilding for that replaces every element in the chart in a
    // single frame, which is visible as a pop — a redraw's worth of disruption to correct
    // a difference too small to see.
    //
    // The svg is written with a viewBox equal to the size it was drawn at, so the browser
    // will do this for nothing: change width and height, leave the viewBox alone, and the
    // existing chart scales. One attribute pair, no DOM replacement, no animation.
    //
    // The viewBox is also why no new state is needed to bound the drift. It records the
    // last size actually rendered, so measuring the tolerance against it — rather than
    // against the last scaled size — means repeated small changes can never accumulate:
    // every one of them is judged against the same true render, and anything beyond the
    // tolerance falls through to a real draw. Returning to the drawn size, which is what
    // leaving the editor does, lands back on the viewBox exactly and is pixel-perfect
    // again.
    //
    // Deliberately not applied when the chart is an adopted placeholder (it carries no
    // bound data and must be replaced by a real draw), when the draw was forced, or when
    // anything other than the size has changed.
    const scaleOnly = (() => {
      if (wasForced || this._adoptedSvg) return false;
      const dataKey = `${this._renderSignature}|${dataStamp}`;
      if (dataKey !== this._lastDrawnDataKey) return false;
      const node = chartDiv.querySelector("svg") as SVGSVGElement | null;
      if (!node) return false;
      const box = (node.getAttribute("viewBox") ?? "").split(/\s+/).map(Number);
      if (box.length !== 4 || !(box[2] > 0) || !(box[3] > 0)) return false;
      const dw = Math.abs(width - box[2]) / box[2];
      const dh = Math.abs(height - box[3]) / box[3];
      if (dw > MAX_SCALE_ONLY_DRIFT || dh > MAX_SCALE_ONLY_DRIFT) return false;
      node.setAttribute("width", String(width));
      node.setAttribute("height", String(height));
      return true;
    })();
    if (scaleOnly) {
      this._lastDrawnKey = drawKey;
      this._note(
        "drew",
        `${MeteogramCard._triggerLabel(this._lastDrawCaller)}  ` +
          `${availableWidth}\u00D7${availableHeight} \u2192 ${width}\u00D7${height}`
      );
      // Scaling stretches the svg, so the label the icon is measured against has moved
      // even though nothing was redrawn.
      this._alignAttributionIcon();
      this._amendLastNote("drew", "scaled");
      this._debugLog(
        `[${CARD_NAME}] _renderChart: scaled the existing chart to ${width}x${height} ` +
          `instead of redrawing it.`
      );
      this._chartRenderInProgress = false;
      return;
    }

    // Same numbers as the debug line below, kept for the diagnostics panel so they can
    // be screenshotted rather than fetched from the console.
    // A move between containers goes in the list, not just in the setup line.
    //
    // The setup line reports where the card is when Copy is pressed, which is the wrong
    // moment: a card that misbehaves only in the dashboard editor may well have been
    // dragged back to the live view before anyone reaches the button, and the evidence
    // would read as though it never happened. Recorded here, the log shows which draws
    // happened in which container.
    const nest = MeteogramCard._ancestry(this);
    if (nest && nest !== this._lastAncestry) {
      this._lastAncestry = nest;
      this._note("in", nest);
    }

    // An element's very first draw is reported as the element being new, whatever
    // triggered it.
    //
    // It says "new element" rather than "first draw" because the shorter phrasing was
    // read, reasonably, as a claim about the card on screen — and that card may well
    // have been visible for some time. It is the *element* that is new; the one drawn
    // before it is gone, which is why none of its history is in this list.
    //
    // Which caller gets there first is a race — a ResizeObserver fires its initial
    // callback as soon as it starts observing, so it often beats the load path — and the
    // winner's label is then actively misleading: a card rebuilt by Home Assistant after
    // a websocket reconnect reported "resize", which reads as the card resizing itself
    // when nothing of the sort happened. A first draw is not something the card chose to
    // do, and the log should not imply it was.
    //
    // The buffer is per-element and never cleared, so a lone "first draw" at the top of a
    // list is itself the evidence that the element is new and its history went with the
    // old one.
    const firstDraw = this._lastDrawnKey === "";
    // A re-attached card is putting back a chart that was on screen a moment ago, so
    // there is nothing for an animation to show — the same reason a new element's first
    // draw does not animate.
    this._remountDraw =
      (firstDraw && MeteogramCard._pageHasDrawn) || this._reattachDraw;
    const trigger = firstDraw
      ? "new element"
      : MeteogramCard._triggerLabel(this._lastDrawCaller);
    MeteogramCard._drawTally.set(
      trigger,
      (MeteogramCard._drawTally.get(trigger) ?? 0) + 1
    );
    this._note(
      "drew",
      `${trigger}  ` +
        `${availableWidth}\u00D7${availableHeight} \u2192 ${width}\u00D7${height}`
    );

    // The measured container and the size chosen from it, on every draw.
    //
    // Without this the log says nothing about size unless a draw is skipped, which is the
    // one thing needed to diagnose a card that grows: issue #46 is a container whose
    // height comes from its content, so the numbers to watch are these climbing together
    // on successive draws. Cheap, and only when debug is on.
    this._debugLog(
      `[${CARD_NAME}] _renderChart: container ${availableWidth}x${availableHeight}` +
        ` \u2192 drawing ${width}x${height}` +
        ` (chartDiv ${(chartDiv as HTMLElement).offsetWidth}x${(chartDiv as HTMLElement).offsetHeight},` +
        ` mode ${this.layoutMode}${useAspectRatio ? `, ratio ${this.aspectRatio}` : ""})`
    );

    // Fetch weather data and render. The previous chart stays up while this runs and is
    // swapped out only once there is something to put in its place.
    this.fetchWeatherData()
      .then((data: ForecastData) => {
        this._lastWeatherData = data;
        // If using weather entity and it's unavailable, do not render
        if (
          this.entityId &&
          this.entityId !== "none" &&
          this._weatherEntityApiInstance
        ) {
          const entityData = this._weatherEntityApiInstance.getForecastData();
          if (!entityData) {
            this.setError(
              `Weather entity ${this.entityId} is unavailable. Waiting for it to become available...`
            );
            return;
          }
        }

        // Determine if wind data is available
        const windAvailable = this.showWind && this._dataAvailability.wind;

        // Set windBand based on wind availability
        const windBandHeight = windAvailable ? 45 : 0;
        const hourLabelBand = 30;

        // --- ADJUST: Remove this._chartHeight cap and use full height ---

        // Store dimensions for resize detection
        this._lastWidth = availableWidth;
        this._lastHeight = availableHeight;
        // --- Track last rendered chart size for final resize logic ---
        this._lastRenderedWidth = availableWidth;
        this._lastRenderedHeight = availableHeight;
        // Re-taken after the fetch, not before it.
        //
        // The key includes a stamp for the forecast, and the first draw of a new element
        // computes it before any forecast exists — so the very fetch that draw performs
        // changes the stamp, and the next request no longer matches a key describing the
        // same chart. A second, identical draw followed. Recording the key as it stands
        // once the data is in hand makes "nothing changed" true when nothing has.
        {
          const stamp =
            (this._weatherApiInstance as any)?._lastFetchTime ?? this.apiExpiresAt ?? 0;
          drawKey = `${this._renderSignature}|${availableWidth}x${availableHeight}|${stamp}`;
          // The same post-fetch stamp, for the same reason. Built from the stale one the
          // top of this method computed, the size-independent key never matched on the
          // draw after a fetch, and the scale shortcut could not fire at all.
          this._lastDrawnDataKey = `${this._renderSignature}|${stamp}`;
        }
        this._lastDrawnKey = drawKey;
        this._reattachDraw = false;
        MeteogramCard._pageHasDrawn = true;

        // Stage 1 of animating updates: the <svg> element itself survives a redraw.
        //
        // It used to be thrown away and rebuilt every time, which is why nothing could
        // ever animate — there was no previous element for a new one to move from. Its
        // contents are still cleared and rebuilt below; replacing that with keyed joins
        // is the next stage, and it needs this one first.
        //
        // Reused only when the geometry matches. A different size means every scale has
        // changed, so there is nothing to preserve and a clean start is cheaper.
        const existing = d3.select(chartDiv).select<SVGSVGElement>("svg");
        const preserve = useAspectRatio ? "xMidYMid meet" : "none";
        const reusable =
          !this._adoptedSvg &&
          !existing.empty() &&
          existing.attr("width") === String(width) &&
          existing.attr("height") === String(height) &&
          existing.attr("preserveAspectRatio") === preserve;

        // A resize must not animate: elements sliding to new positions while the card is
        // still being dragged is noise, not information.
        //
        // The first draw is a different case and does animate — bars rise out of the
        // baseline as the chart appears. It was briefly lumped in with resizes here,
        // both being "a fresh svg", which made the animation almost impossible to
        // observe: a forecast changes hourly and opening the editor rebuilds the card,
        // so first paint is the only trigger anyone can reach on demand.
        // An adopted chart is a placeholder, not a resize: replacing it is expected and
        // must not be reported as the card having changed size.
        this._chartResized = !existing.empty() && !reusable && !this._adoptedSvg;
        const wasAdopted = this._adoptedSvg;
        this._adoptedSvg = false;
        // Whether the chart the eye was looking at survived this draw.
        //
        // A rebuild replaces every element in one frame — no animation is possible and
        // the change is abrupt — where a reuse transitions the existing shapes. That is
        // the difference between a draw that is perceived and one that is not, and it
        // was nowhere in the log: someone reporting a flash could only say it looked
        // like the chart "did something", with no way to tell which kind of draw it was.
        //
        // "held" is the third case and the one that matters most in a blink report: the
        // chart was rebuilt, but a placeholder stood in its place while that happened, so
        // nothing was ever blank. Without it the two cases that look completely different
        // to the eye — a rebuild behind a held chart and a rebuild from an empty div —
        // both print "rebuilt", and a log showing an edit-mode round trip gives no way to
        // tell whether the handoff fired. It was in _debugLog only, which is the console,
        // which is exactly where a diagnostics report cannot reach.
        this._amendLastNote(
          "drew",
          reusable ? "reused" : wasAdopted ? "rebuilt (held)" : "rebuilt"
        );
        if (reusable) {
          // Not cleared. Every drawer owns a named layer and clears only its own, so
          // the groups survive the redraw — which is the whole point: an element that
          // outlives a draw is an element that can be transitioned into its new shape.
          this.svg = existing;
        } else {
          if (wasAdopted && this._handoverNode) {
            // Keep the handover on screen; the replacement is drawn hidden beside it and
            // the two are swapped in finally(), once the last drawer has run.
          } else {
            // Replace the old chart here, one statement before the new one exists, so the
            // card is never left empty across an await.
            if (this.svg && typeof this.svg.remove === "function") this.svg.remove();
            chartDiv.innerHTML = "";
          }
          this.svg = d3
            .select(chartDiv)
            .append("svg")
            .attr("width", width)
            .attr("height", height)
            .attr("viewBox", `0 0 ${width} ${height}`)
            .attr("preserveAspectRatio", preserve); // Fill container, no aspect ratio
          // visibility, not display: the drawers measure text, and a box with no layout
          // reports every dimension as zero.
          if (wasAdopted && this._handoverNode) this.svg.style("visibility", "hidden");
        }

        const targetHours = this.parseHoursConfig(this.meteogramHours);
        const dataPoints = this.getDataPointsForHours(targetHours, data.time);

        const sliceData = <T>(arr: T[] | undefined): T[] => {
          if (!arr || !Array.isArray(arr)) {
            console.warn(
              `[${CARD_NAME}] sliceData: received undefined/null array, returning empty array`
            );
            return [];
          }
          return arr.slice(0, Math.min(dataPoints, arr.length) + 1);
        };
        // Debug: Check which properties might be undefined
        const dataProperties = [
          "time",
          "temperature",
          "rain",
          "rainMin",
          "rainMax",
          "cloudCover",
          "windSpeed",
          "windGust",
          "windDirection",
          "symbolCode",
          "pressure",
        ];
        const undefinedProps = dataProperties.filter(
          (prop) => !(data as any)[prop] || !Array.isArray((data as any)[prop])
        );
        if (undefinedProps.length > 0) {
          console.warn(
            `[${CARD_NAME}] ForecastData has undefined/non-array properties:`,
            undefinedProps
          );
        }

        const slicedData: ForecastData = {
          time: sliceData(data.time),
          temperature: sliceData(data.temperature),
          rain: sliceData(data.rain),
          rainMin: sliceData(data.rainMin),
          rainMax: sliceData(data.rainMax),
          cloudCover: sliceData(data.cloudCover),
          windSpeed: sliceData(data.windSpeed),
          windGust: sliceData(data.windGust),
          windDirection: sliceData(data.windDirection),
          symbolCode: sliceData(data.symbolCode),
          pressure: sliceData(data.pressure),
          units: data.units, // Preserve units from original data
        };

        this.renderMeteogram(
          this.svg,
          slicedData,
          width,
          height,
          windBandHeight,
          hourLabelBand,
          windAvailable
        );
        // Reset error tracking on success
        this.errorCount = 0;
        // Clear retry timer if successful
        if (this._weatherRetryTimeout) {
          clearTimeout(this._weatherRetryTimeout);
          this._weatherRetryTimeout = null;
        }
        this._setupResizeObserver();
        this._setupVisibilityObserver();
        this._setupMutationObserver();

        // --- RETRY AFTER A FAILED FETCH ---
        // Armed here rather than in the `.catch` below, because a failure that still
        // has cached data to draw resolves instead of throwing — the chart is fine, only
        // the data is stale, and the catch never sees it. Without this the card never
        // asks again. See API_RETRY_BACKOFF_MS.
        if (this._apiFailures > 0) {
          const delay = jitteredRetryDelayMs(this._apiFailures);
          if (this._weatherRefreshTimeout)
            clearTimeout(this._weatherRefreshTimeout);
          this._debugLog(
            `[${CARD_NAME}] API failed ${this._apiFailures}x; retrying in ${Math.round(
              delay / 60000
            )} min`
          );
          this._weatherRefreshTimeout = window.setTimeout(() => {
            this._scheduleDrawMeteogram("retry-after-api-failure", true);
          }, delay);
        }
        // --- SCHEDULE REFRESH A SPREAD INTERVAL AFTER expiresAt ---
        else if (this.apiExpiresAt) {
          const now = Date.now();
          // The offset is drawn fresh each time rather than fixed at 60 s, because
          // met.no's edge hands every client in a coordinate cell the same absolute
          // Expires — so a constant offset fires them all together and the next
          // response locks them there. See refreshDelayAfterExpiryMs.
          //
          // Floored, not clamped to zero: see MIN_REFRESH_DELAY_MS. A forecast that
          // has already expired must still wait before the next attempt, or the
          // re-arming below turns into a spin.
          const delay = Math.max(
            this.apiExpiresAt + refreshDelayAfterExpiryMs() - now,
            MIN_REFRESH_DELAY_MS
          );
          if (this._weatherRefreshTimeout)
            clearTimeout(this._weatherRefreshTimeout);
          this._debugLog(
            `[${CARD_NAME}] Setting scheduled-refresh-after-expiresAt in ${Math.round(
              delay / 1000
            )}s (at ${new Date(this.apiExpiresAt + 60000).toISOString()})`
          );
          this._weatherRefreshTimeout = window.setTimeout(() => {
            // Just force a redraw, which will trigger a fetch and then a draw

            this._scheduleDrawMeteogram(
              "scheduled-refresh-after-expiresAt",
              true
            );
          }, delay);
        }
      })
      .catch((err: Error) => {
        console.error(`[${CARD_NAME}] ERROR caught in _drawMeteogram:`, {
          error: err,
          message: err?.message,
          stack: err?.stack,
          name: err?.name,
        });
        // If error is due to unavailable entity, show waiting message
        if (
          err.message &&
          err.message.includes(
            "is unavailable. Waiting for it to become available"
          )
        ) {
          this.setError(
            `Weather entity ${this.entityId} is unavailable. Waiting for it to become available...`
          );
          // Optionally, schedule a retry after a short delay
          if (this._weatherRetryTimeout)
            clearTimeout(this._weatherRetryTimeout);
          this._weatherRetryTimeout = window.setTimeout(() => {
            this.meteogramError = "";
            this._drawMeteogram("retry-entity-unavailable");
          }, 500); // Retry every 0.5 seconds
        } else {
          console.error(
            `[${CARD_NAME}] Triggering 60-second retry due to error:`,
            {
              errorMessage: err?.message,
              hasExistingMeteogramError: !!this.meteogramError,
              existingError: this.meteogramError,
              containsApiError: this.meteogramError?.includes("API Error"),
            }
          );
          // A failed *fetch* backs off; anything else here is a local draw fault, where
          // a minute is right and met.no is not involved. Retrying a met.no outage every
          // sixty seconds is the ban risk the fetch guards exist to prevent, and this
          // path reaches it whenever there is no cached forecast to fall back on — the
          // blank-card case, which is also the one a user is most likely to leave open
          // and staring at them.
          const retryMs =
            this._apiFailures > 0
              ? jitteredRetryDelayMs(this._apiFailures)
              : 60000;
          const retryText =
            retryMs >= 60000 * 2
              ? `retrying in ${Math.round(retryMs / 60000)} minutes`
              : "retrying in 60 seconds";
          if (
            this.meteogramError &&
            this.meteogramError.includes("API Error")
          ) {
            this.meteogramError += `<br><span style='color:#b71c1c;'>Weather data not available, ${retryText}</span>`;
          } else {
            this.setError(`Weather data not available, ${retryText}`);
          }
          if (this._weatherRetryTimeout)
            clearTimeout(this._weatherRetryTimeout);
          this._weatherRetryTimeout = window.setTimeout(() => {
            this.meteogramError = "";
            this._drawMeteogram("retry-after-error");
          }, retryMs);
        }
      })
      .finally(() => {
        // Show the replacement and drop the handover, in that order, so no frame exists
        // with neither of them visible.
        if (this._handoverNode) {
          try {
            this.svg?.style("visibility", null);
            this._handoverNode.remove();
          } catch {
            /* the swap is cosmetic; a failure here must not sink the draw */
          }
          this._handoverNode = null;
        }
        // Hand this chart on to whatever element replaces this one.
        //
        // Taken twice, because at this moment the chart is not yet what it will look
        // like. Bars enter at height 0 and grow into place over ANIMATION_MS, so
        // serialising here stores every entering bar flat, while labels — set directly,
        // with no transition — store at full opacity. The handover then paints rain
        // figures with no rain under them, which is what a panel view shows for the
        // length of the re-attach hold after a tab switch.
        //
        // The immediate capture stays, so something exists to hand over during the
        // animation; the deferred one overwrites it once the transitions have ended.
        // Only the first draw of a page animates, so in practice this corrects exactly
        // one entry — but that is the entry every later re-attach inherits.
        const capture = () => {
          try {
            const node = (chartDiv as HTMLElement).querySelector("svg");
            const w = Number(node?.getAttribute("width"));
            const h = Number(node?.getAttribute("height"));
            if (node && w > 0 && h > 0 && !this.meteogramError) {
              MeteogramCard._rememberChart(this._renderSignature, node.outerHTML, w, h);
            }
          } catch {
            /* nothing to hand over is not a failure */
          }
        };
        capture();
        if (this._settleSnapshot) clearTimeout(this._settleSnapshot);
        this._settleSnapshot = setTimeout(() => {
          this._settleSnapshot = null;
          capture();
        }, ANIMATION_MS + 60);
        // How long the card showed nothing, recorded where the chart actually exists.
        //
        // This used to be taken beside _lastDrawnKey, which is set before a single
        // drawer has run — so it reported the moment drawing *began* while claiming to
        // report the moment something appeared. It read 3ms against a real gap of about
        // 23ms, which is the wrong direction for a number whose only job is to tell
        // someone whether a blink they think they saw was real.
        // After the drawers, because it measures one of their outputs.
        //
        // It used to run beside _lastDrawnKey, some eight hundred lines before
        // drawDateLabels — so it measured the *previous* draw's label, or nothing at all
        // on a first draw, and fell back to a fixed 24px from the top. Wrong by a little
        // whenever the layout shifted, and wrong by a lot on a narrow card, where the
        // icon ended up level with the middle of the temperature axis rather than with
        // the date it is supposed to sit beside.
        this._alignAttributionIcon();
        if (this._firstPaintMs === null) {
          this._firstPaintMs = Date.now() - this._createdAt;
        }
        this._chartRenderInProgress = false;
        // --- RESET weatherDataPromise after chart draw completes ---
        this.weatherDataPromise = null;
        // Assign _statusLastRender with a date string when rendering completes
        this._statusLastRender = new Date().toISOString();
        // If a render was queued, run it now
        if (this._pendingRender) {
          this._pendingRender = false;
          this._drawMeteogram("pending-after-render");
        }
      });
  }
  // Add a helper to get the HA locale string for date formatting
  /**
   * Time formatting that respects Home Assistant's own 12/24-hour setting.
   *
   * The locale alone is not enough: a Norwegian user running Home Assistant in English
   * gets `en`, which formats as AM/PM, while their HA is set to 24-hour. That setting
   * lives in hass.locale.time_format and was never consulted.
   */
  private getTimeFormatOptions(): Intl.DateTimeFormatOptions {
    const base: Intl.DateTimeFormatOptions = { hour: "2-digit", minute: "2-digit" };
    const pref = this.hass?.locale?.time_format;
    if (pref === "24") return { ...base, hour12: false };
    if (pref === "12") return { ...base, hour12: true };
    // "language" and "system" both mean: let the locale decide, which is the default.
    return base;
  }

  private getHaLocale(): string {
    // Use hass.language if available, fallback to "en"
    return this.hass && this.hass.language ? this.hass.language : "en";
  }

  // Helper to calculate forecast data age
  private getForecastDataAge(): string {
    if (
      !this._lastWeatherData ||
      !this._lastWeatherData.time ||
      this._lastWeatherData.time.length === 0
    ) {
      return "no data";
    }

    const earliestTime = this._lastWeatherData.time[0];
    const now = new Date();
    const earliestDate =
      earliestTime instanceof Date ? earliestTime : new Date(earliestTime);

    if (isNaN(earliestDate.getTime())) {
      return "invalid data";
    }

    const diffMs = now.getTime() - earliestDate.getTime();
    const absDiffMs = Math.abs(diffMs);
    const diffMinutes = Math.floor(absDiffMs / (1000 * 60));
    const diffHours = Math.floor(diffMinutes / 60);

    // Handle future dates (forecast data is typically from current time forward)
    const isInFuture = diffMs < 0;
    const prefix = isInFuture ? "in " : "";

    if (diffMinutes < 60) {
      return `${prefix}${diffMinutes} min`;
    } else if (diffHours < 24) {
      return `${prefix}${diffHours}h ${diffMinutes % 60}m`;
    } else {
      const diffDays = Math.floor(diffHours / 24);
      return `${prefix}${diffDays}d ${diffHours % 24}h`;
    }
  }

  // Centralized method to generate diagnostic information
  private generateDiagnosticInfo(): {
    tooltip: string;
    panel: any;
    expires: any;
    lastFetch: string;
    lastRender: string;
  } {
    let debugInfo = "";
    let panelInfo = null;
    let expiresInfo: any = "not available";
    let lastFetchInfo = "not available";
    const lastRenderInfo = this._statusLastRender
      ? MeteogramCard._localTime(this._statusLastRender)
      : "unknown";

    // Calculate forecast data age for both entity and API modes
    const forecastDataAge = this.getForecastDataAge();

    // Show Entity API debug info when using entity
    if (
      this.entityId &&
      this.entityId !== "none" &&
      this._weatherEntityApiInstance
    ) {
      const diag = this._weatherEntityApiInstance.getDiagnosticInfo();
      const expiryColor = diag.inMemoryData.isExpired ? "#f44336" : "#4caf50";

      // Set expires and lastFetch info for main panel
      if (diag.inMemoryData.expiresAtFormatted !== "not set") {
        expiresInfo = html`<span style="color:${expiryColor}"
          >${diag.inMemoryData.expiresAtFormatted}${diag.inMemoryData.isExpired
            ? " (EXPIRED)"
            : ""}</span
        >`;
      } else {
        expiresInfo = "not set";
      }
      lastFetchInfo = diag.inMemoryData.lastFetchFormatted;

      // For tooltip - include the Last forecast fetched info you want to see
      debugInfo = `<div style='margin-top:8px;color:#ff9800;font-size:0.85em;line-height:1.4;'>
        <b>📱 Entity API:</b> ${diag.entityExists ? "✅" : "❌"} ${
        diag.entityState || "unknown"
      } | <b>Last Updated:</b> ${
        diag.entityLastUpdated
          ? new Date(diag.entityLastUpdated).toLocaleString()
          : "unknown"
      }<br>
        <b>Subscription:</b> ${
          diag.hasSubscription ? "✅" : "❌"
        } | <b>Connection:</b> ${diag.hasConnection ? "✅" : "❌"}<br>
        <b>Last Data Fetch:</b> ${
          diag.inMemoryData.lastFetchFormatted
        } | <b>Age:</b> ${diag.inMemoryData.dataAgeMinutes} min<br>
        <b>Last Forecast Fetched:</b> ${diag.lastForecastFetch || "never"} ${
        diag.lastForecastFetchAge ? `(${diag.lastForecastFetchAge})` : ""
      }<br>
        <b>Earliest Forecast:</b> ${forecastDataAge} ago<br>
        <b>Data Expires:</b> <span style="color:${expiryColor}">${
        diag.inMemoryData.expiresAtFormatted
      } ${diag.inMemoryData.isExpired ? "(EXPIRED)" : ""}</span><br>
        <b>Hourly Data:</b> ${diag.hourlyForecastData.status}
      </div>`;

      // For diagnostic panel - remove the detailed info that was getting cut off
      // Keep this null to remove the extra panel section
      panelInfo = null;
    }
    // Show Weather API debug info when NOT using entity (coordinates mode)
    else if (this._weatherApiInstance) {
      try {
        const apiDiag = this._weatherApiInstance.getDiagnosticInfo();
        const apiExpiryColor = apiDiag.isExpired ? "#f44336" : "#4caf50";

        // Set expires and lastFetch info for main panel
        if (this.apiExpiresAt) {
          const isExpired = Date.now() > this.apiExpiresAt;
          const color = isExpired ? "#f44336" : "#4caf50";
          const status = isExpired ? " (EXPIRED)" : "";
          expiresInfo = html`<span style="color:${color}"
            >${MeteogramCard._localTime(this.apiExpiresAt)}${status}</span
          >`;
        }
        // "none this session" rather than "not available", because the empty case is the
        // good one and the old wording read as a fault. `_lastFetchTime` is set only by a
        // real network fetch and is deliberately not restored from localStorage, so an
        // empty value means the cache served everything since this page loaded — which is
        // exactly what the cache is for.
        lastFetchInfo = this._statusLastFetch
          ? this._statusLastFetch.includes("T")
            ? MeteogramCard._localTime(this._statusLastFetch)
            : this._statusLastFetch
          : "none this session (served from cache)";

        debugInfo = `<div style='margin-top:8px;color:#ff9800;font-size:0.85em;line-height:1.4;'>
          <b>🌤️ ${apiDiag.apiType}:</b> ${
          apiDiag.hasData ? "✅" : "❌"
        } Data | <b>Location:</b> ${apiDiag.location.lat.toFixed(
          2
        )}, ${apiDiag.location.lon.toFixed(2)}<br>
          <b>Last Data Fetch:</b> ${apiDiag.lastFetchFormatted} | <b>Age:</b> ${
          apiDiag.dataAgeMinutes
        } min<br>
          <b>Earliest Forecast:</b> ${forecastDataAge} ago<br>
          <b>Data Expires:</b> <span style="color:${apiExpiryColor}">${
          apiDiag.expiresAtFormatted
        } ${apiDiag.isExpired ? "(EXPIRED)" : ""}</span><br>
          <b>Hourly Data:</b> ${apiDiag.dataTimeLength} entries
        </div>`;
      } catch (error) {
        console.error(
          "[MeteogramCard] Error getting Weather API diagnostic info:",
          error
        );
        debugInfo = `<div style='margin-top:8px;color:#ff9800;font-size:0.85em;'>Weather API diagnostic error: ${error}</div>`;
      }
    } else {
      debugInfo = `<div style='margin-top:8px;color:#ff9800;font-size:0.85em;'>No diagnostic info available</div>`;
    }

    return {
      tooltip: debugInfo,
      panel: panelInfo,
      expires: expiresInfo,
      lastFetch: lastFetchInfo,
      lastRender: lastRenderInfo,
    };
  }
  // Add a helper to determine if day or night based on time and location
  private isDaytimeAt(date: Date): boolean {
    // Computed from coordinates, because the question is asked for every hour of a
    // forecast that runs to ten days and none of the previous sources could answer it:
    //
    //   - a weather entity's sunrise/sunset attributes describe today only;
    //   - sun.sun exposes `elevation` *now*, so asking about Wednesday returned whether
    //     the sun happens to be up at this moment — every icon past today was decided
    //     by the time of day the page was loaded;
    //   - the 06:00-18:00 fallback is wrong by hours at northern latitudes, where this
    //     card is most used. Bergen in August runs roughly 05:00 to 21:30.
    //
    // The altitude is evaluated at the instant asked about, so there is no "which day"
    // question to get wrong around midnight, and polar day and night need no special
    // case: the sun is simply above or below the horizon.
    if (typeof this.latitude === "number" && typeof this.longitude === "number") {
      return isDaylightAt(date, this.latitude, this.longitude);
    }
    // Coordinates are resolved from config, then Home Assistant's home location, then a
    // cached default, so reaching this is close to impossible. Keep the old crude rule
    // rather than guessing, and keep it visible.
    this._debugLog(
      `[${CARD_NAME}] isDaytimeAt: no coordinates available, falling back to 06:00-18:00`
    );
    const hour = date.getHours();
    return hour >= 6 && hour < 18;
  }

  // Update renderMeteogram to add windBarbBand and hourLabelBand as arguments
  renderMeteogram(
    svg: any,
    data: ForecastData,
    width: number,
    height: number,
    windBandHeight: number = 0,
    hourLabelBand: number = 24,
    windAvailable: boolean = false
  ): void {
    const {
      time,
      temperature,
      rain,
      rainMin,
      rainMax,
      cloudCover,
      windSpeed,
      windGust,
      windDirection,
      symbolCode,
      pressure,
    } = data;

    const N = time.length;
    const tempUnit = this.getSystemTemperatureUnit();
    const pressureUnit = this.getSystemPressureUnit();
    const windSpeedUnit = this.getSystemWindSpeedUnit();
    const precipUnit = this.getSystemPrecipitationUnit();
    // Only convert values if using WeatherAPI (entityId is not set or is 'none')
    let temperatureConverted: (number | null)[];
    let pressureConverted: (number | null)[];
    let windSpeedConverted: (number | null)[];
    let rainConverted: (number | null)[];
    let rainMinConverted: (number | null)[];
    let rainMaxConverted: (number | null)[];
    let windGustConverted: (number | null)[];
    windDirection.some((d) => d !== null);
    if (!this.entityId || this.entityId === "none") {
      temperatureConverted = temperature.map((t) => this.convertTemperature(t));
      pressureConverted = pressure.map((p) => this.convertPressure(p));
      windSpeedConverted = windSpeed.map((w) => this.convertWindSpeed(w));
      windGustConverted = windGust.map((w) => this.convertWindSpeed(w));
      rainConverted = rain.map((r) =>
        r !== null ? this.convertPrecipitation(r) : null
      );
      rainMinConverted = rainMin.map((r) =>
        r !== null ? this.convertPrecipitation(r) : null
      );
      rainMaxConverted = rainMax.map((r) =>
        r !== null ? this.convertPrecipitation(r) : null
      );
    } else {
      temperatureConverted = temperature;
      pressureConverted = pressure;
      windSpeedConverted = windSpeed;
      windGustConverted = windGust;
      rainConverted = rain;
      rainMinConverted = rainMin;
      rainMaxConverted = rainMax;
    }
    // Safely handle null values in arrays for calculations
    const nonNullRain = rainConverted.filter((r): r is number => r !== null);
    const nonNullRainMax = rainMaxConverted.filter(
      (r): r is number => r !== null
    );

    const pressureAvailable =
      this.showPressure && this._dataAvailability.pressure;
    // windAvailable is now passed as an argument from _renderChart
    const cloudAvailable =
      this.showCloudCover && this._dataAvailability.cloudCover;
    // Define enabledLegends array based on which chart elements are enabled
    type LegendInfo = { class: string; label: string };
    const enabledLegends: LegendInfo[] = [];
    if (cloudAvailable) {
      enabledLegends.push({ class: "legend-cloud", label: "Cloud Cover" });
    }
    if (this.showPrecipitation && this._dataAvailability.precipitation) {
      enabledLegends.push({ class: "legend-rain", label: "Precipitation" });
    }
    if (pressureAvailable) {
      enabledLegends.push({ class: "legend-pressure", label: "Pressure" });
    }
    if (this._dataAvailability.temperature) {
      enabledLegends.push({ class: "legend-temp", label: "Temperature" });
    }
    // SVG and chart parameters
    // In focussed mode, remove top margin for legends

    // Adjust margins based on focussed mode, pressure axis, and displayMode
    // The right margin follows what is actually drawn there, not the display mode.
    //
    // It used to be a constant per mode, and the two were only accidentally related:
    // core and focussed reserved 40 whether or not a pressure axis existed, so switching
    // show_pressure off in those modes gave nothing back — the space looked empty but
    // was never the axis's to return. Full reserved 40 without the axis and 70 with it,
    // which was right by coincidence of having the case split at all.
    //
    // Deciding it from the content makes the no-axis saving apply everywhere: 40px for
    // an overhang that measures 20.
    //
    // The caption condition mirrors drawPressureAxis exactly. Two copies of one rule is
    // how the margin and the drawing drifted apart in the first place, so if a third
    // reader appears it should become a shared predicate rather than a third copy.
    const pressureCaption =
      pressureAvailable && !this.focussed && this.displayMode !== "core";
    const rightMargin = pressureCaption
      ? RIGHT_PRESSURE_CAPTION
      : pressureAvailable
        ? RIGHT_PRESSURE_AXIS
        : RIGHT_ICON_OVERHANG;

    if (this.displayMode === "core") {
      this._margin = {
        top: 50,
        right: rightMargin,
        bottom: hourLabelBand + 10,
        left: 40,
      };
    } else if (this.focussed) {
      this._margin = {
        top: 10,
        right: rightMargin,
        bottom: hourLabelBand + 10,
        left: 40,
      };
    } else {
      this._margin = {
        top: 70,
        right: rightMargin,
        bottom: hourLabelBand + 10,
        left: 70,
      };
    }
    // One place decides the vertical stack, in absolute coordinates. See src/layout.ts
    // for why: the positions used to be computed in four places in two different frames
    // of reference, and adding a band meant compensating in each of them.
    const hasLegends = this.displayMode !== "core" && !this.focussed;
    // Coordinates are always resolved, but guard anyway: sun times for the wrong place
    // fail quietly, unlike a wrong forecast.
    const sunStripEnabled =
      this.showSun &&
      typeof this.latitude === "number" &&
      typeof this.longitude === "number";
    const layout = chartLayout({
      height,
      hasLegends,
      hasDateLabels: !this.focussed,   // drawDateLabels guards on the same condition
      windBand: windBandHeight,
      hourLabelBand,
      focussed: this.focussed,
      // The entire integration. Adding a band used to mean compensating the date
      // labels, then the legends, then the plot height in three separate places.
      sunBand: sunStripEnabled ? SUN_STRIP_BAND : 0,
    });
    this._margin.top = layout.marginTop;
    const margin = this._margin;
    this._layout = layout;


    this._chartHeight = layout.plotHeight;
    // Cap the chart width to only what's needed for the data
    const maxHourSpacing = 90;
    const baseWidth = Math.min(width, Math.max(300, maxHourSpacing * (N - 1)));
    this._chartWidth = width - margin.left - margin.right;

    // Adjust dx for wider charts - ensure elements don't get too stretched or squished
    let dx = this._chartWidth / (N - 1);
    // If the chart is very wide, adjust spacing so elements don't get too stretched
    const hourSpacing = Math.min(dx, maxHourSpacing); // Cap the hour spacing at 45px

    // X scale - for wider charts, maintain reasonable hour spacing
    const x = d3
      .scaleLinear()
      .domain([0, N - 1])
      .range([0, this._chartWidth]);

    // Adjust the actual dx to what's being used by the scale
    dx = x(1) - x(0);

    // Index of the first sample of each calendar day, used by the grid and the date
    // labels.  It no longer drives any background shading — see below.
    const dateLabelY = layout.dateLabelY ?? 0;
    const dayStarts: number[] = [];
    for (let i = 0; i < N; i++) {
      if (i === 0 || time[i].getDate() !== time[i - 1].getDate()) {
        dayStarts.push(i);
      }
    }

    // Defensive: Check if svg is a D3 selection
    if (
      !svg ||
      typeof svg.selectAll !== "function" ||
      typeof svg.append !== "function"
    ) {
      console.error("[MeteogramCard] svg is not a D3 selection:", svg);
      throw new Error(
        "SVG is not a D3 selection. D3 may not be loaded or svg was not created correctly."
      );
    }

    // Stable too, and deliberately not cleared: its children are the layers below,
    // each of which clears itself.
    let chart = svg.select(":scope > g.chart-root");
    if (chart.empty()) {
      chart = svg.append("g").attr("class", "chart-root");
    }
    chart.attr("transform", `translate(${margin.left},${margin.top})`);

    // Defensive: Check if chart is a D3 selection
    if (
      !chart ||
      typeof chart.selectAll !== "function" ||
      typeof chart.append !== "function"
    ) {
      console.error("[MeteogramCard] chart is not a D3 selection:", chart);
      throw new Error(
        "Chart is not a D3 selection. D3 may not be loaded or chart was not created correctly."
      );
    }

    const tempValues = temperatureConverted.filter(
      (t): t is number => t !== null
    );
    const yTemp = d3
      .scaleLinear()
      .domain([
        Math.floor(d3.min(tempValues)! - 2),
        Math.ceil(d3.max(tempValues)! + 2),
      ])
      .range([this._chartHeight, 0]);

    // Precipitation Y scale
    const yPrecip = d3
      .scaleLinear()
      .domain([0, Math.max(2, (d3.max([...nonNullRainMax, ...nonNullRain]) ?? 0) + 1)])
      .range([this._chartHeight, 0]); // <-- FIXED: range goes from this._chartHeight (bottom) to 0 (top)

    // Pressure Y scale - we'll use the right side of the chart
    // Only create if pressure is shown and data is available
    let yPressure;
    const hasPressure = this.showPressure && this._dataAvailability.pressure;
    if (hasPressure) {
      const validPressures = pressure.filter(
        (p): p is number => p !== null && typeof p === "number" && !isNaN(p)
      );
      const pressureRange = d3.extent(validPressures) as [number, number];
      const pressurePadding = (pressureRange[1] - pressureRange[0]) * 0.1;
      yPressure = d3
        .scaleLinear()
        .domain([
          Math.floor((pressureRange[0] - pressurePadding) / 100) * 100,
          Math.ceil((pressureRange[1] + pressurePadding) / 100) * 100,
        ])
        .range([this._chartHeight, 0]);
    }

    // Calculate legend positions
    // Only allocate slots for enabled legends, so they fill left-to-right
    // Skip legends entirely in "core" display mode
    const numLegends = hasLegends ? enabledLegends.length : 0;
    const legendPositions = !hasLegends
      ? []
      : enabledLegends.map((_: LegendInfo, i: number) => {
          const slotWidth = this._chartWidth / numLegends;
          return {
            x: i * slotWidth + 2,
            // The legends are appended inside the group translated by margin.top, so the
            // layout's absolute y is converted here — the single place that conversion
            // happens, rather than a bare -45 that silently tracks the plot.
            y: (layout.legendY as number) - layout.marginTop,
          };
        });

    // The alternating day background used to be drawn here, one rect per calendar day
    // at opacity 0.16.  It has been invisible for a long time: the stylesheet carried
    // `.day-bg { fill: transparent !important; opacity: 0 }`, so every render built
    // rects that could not paint.  Removed rather than revived — day/night is the more
    // useful thing to show in that space, and it is coming as its own layer.

    // Draw chart grid background
    if (!this._chartRenderer) {
      this._chartRenderer = new MeteogramChart(this);
    }
    this._chartRenderer.drawChartGrid(
      this._layer(svg, "grid-axis"),
      this._layer(chart, "grid"),
      d3,
      x,
      yTemp,
      N,
      margin,
      dayStarts,
      // With the strip on, midnight is marked inside it; a tick poking up as well is
      // two marks for one instant, and they would sit on top of each other.
      sunStripEnabled ? 0 : 12
    );
    this._chartRenderer.drawGridOutline(this._layer(chart, "outline"));

    // Draw date labels at top
    if (
      this._chartRenderer &&
      typeof this._chartRenderer.drawDateLabels === "function"
    ) {
      this._chartRenderer.drawDateLabels(
        this._layer(svg, "date-labels"),
        time,
        dayStarts,
        margin,
        x,
        this._chartWidth,
        dateLabelY
      );
    }

    // Sun strip, in the lane the layout reserved for it between the date labels and
    // the plot border.
    if (
      sunStripEnabled &&
      layout.sunStripY !== null &&
      typeof this._chartRenderer.drawSunStrip === "function"
    ) {
      this._chartRenderer.drawSunStrip(
        this._layer(svg, "sun"),
        time,
        x,
        margin,
        this._chartWidth,
        this.latitude as number,
        this.longitude as number,
        SUN_STRIP_HEIGHT,
        layout.sunStripY,
        this.getHaLocale(),
        this.getTimeFormatOptions()
      );
    }

    // Draw bottom hour labels using helper
    this._chartRenderer.drawBottomHourLabels(
      this._layer(svg, "hour-labels"),
      data.time,
      margin,
      x,
      windBandHeight,
      width
    );

    // Draw all chart elements in order of background to foreground
    // 1. Cloud band (if enabled)
    // 2. Rain bars (if enabled)
    // 3. Pressure line (if enabled)
    // 4. Wind band (if enabled)
    // 5. Temperature line
    // 6. Weather icons

    // Draw cloud cover band with legend
    // Cloud cover band - only if enabled
    if (cloudAvailable) {
      const cloudLegendIndex =
        this.displayMode === "core"
          ? -1
          : enabledLegends.findIndex((l: LegendInfo) =>
              l.class.includes("legend-cloud")
            );
      if (cloudLegendIndex >= 0 && legendPositions.length > 0) {
        const legendPos = legendPositions[cloudLegendIndex];
        this._chartRenderer.drawCloudBand(
          this._layer(chart, "cloud", false),
          cloudCover,
          N,
          x,
          legendPos.x,
          legendPos.y
        );
      } else {
        this._chartRenderer.drawCloudBand(this._layer(chart, "cloud", false), cloudCover, N, x);
      }
    }
    // Draw rain bars with legend
    if (this.showPrecipitation && this._dataAvailability.precipitation) {
      const rainLegendIndex =
        this.displayMode === "core"
          ? -1
          : enabledLegends.findIndex((l: LegendInfo) =>
              l.class.includes("legend-rain")
            );
      if (rainLegendIndex >= 0 && legendPositions.length > 0) {
        const legendPos = legendPositions[rainLegendIndex];
        this._chartRenderer.drawRainBars(
          this._layer(chart, "rain", false),
          rainConverted,
          rainMaxConverted,
          N,
          time,
          x,
          yPrecip,
          dx,
          legendPos.x,
          legendPos.y
        );
      } else {
        this._chartRenderer.drawRainBars(
          this._layer(chart, "rain", false),
          rainConverted,
          rainMaxConverted,
          N,
          time,
          x,
          yPrecip,
          dx
        );
      }
    }

    // Draw pressure line with legend
    if (pressureAvailable && yPressure) {
      const pressureLegendIndex =
        this.displayMode === "core"
          ? -1
          : enabledLegends.findIndex((l: LegendInfo) =>
              l.class.includes("legend-pressure")
            );
      if (pressureLegendIndex >= 0 && legendPositions.length > 0) {
        const legendPos = legendPositions[pressureLegendIndex];
        this._chartRenderer.drawPressureLine(
          this._layer(chart, "pressure", false),
          pressure,
          x,
          yPressure,
          legendPos.x,
          legendPos.y
        );
      } else {
        this._chartRenderer.drawPressureLine(this._layer(chart, "pressure", false), pressure, x, yPressure);
      }
    }

    // Wind band grid lines (if wind band is enabled)
    if (windAvailable) {
      // For wind barbs, use the exact units that were stored with the cached weather data
      // This is the authoritative source - it reflects the actual units from when the data was fetched
      let rawWindUnit = data.units?.windSpeed;
      if (!rawWindUnit) {
        // Only use fallbacks if no units were stored (shouldn't happen with proper entity data)
        rawWindUnit =
          !this.entityId || this.entityId === "none"
            ? "m/s"
            : this.getSystemWindSpeedUnit();
      }
      this._chartRenderer.drawWindBand(
        this._layer(svg, "wind", false),
        x,
        windBandHeight,
        margin,
        width,
        N,
        time,
        windSpeed, // Use raw wind speeds for barb calculation
        windGust, // Use raw gust speeds for barb calculation
        windDirection,
        rawWindUnit
      );
    }

    // Draw temperature line with legend
    const tempLegendIndex =
      this.displayMode === "core"
        ? -1
        : enabledLegends.findIndex((l: LegendInfo) =>
            l.class.includes("legend-temp")
          );
    if (tempLegendIndex >= 0 && legendPositions.length > 0) {
      const legendPos = legendPositions[tempLegendIndex];
      this._chartRenderer.drawTemperatureLine(
        this._layer(chart, "temperature", false),
        temperatureConverted,
        x,
        yTemp,
        legendPos.x,
        legendPos.y
      );
    } else {
      this._chartRenderer.drawTemperatureLine(
        this._layer(chart, "temperature", false),
        temperatureConverted,
        x,
        yTemp
      );
    }

    // Draw weather icons
    if (this.showWeatherIcons) {
      this._chartRenderer.drawWeatherIcons(
        this._layer(chart, "icons", false),
        symbolCode,
        temperatureConverted,
        x,
        yTemp,
        data,
        N
      );
    }
  }

  // Add explicit render method to ensure chart container is created properly
  render() {
    this._updateDarkMode(); // Ensure dark mode is set before rendering

    // Build mergedStyles from styles property, supporting styles.modes.dark (and future modes)
    // Accept both '--meteogram-foo' and 'meteogram-foo' as keys in styles
    const mergedStylesRaw = { ...(this.styles || {}) };
    // Normalize keys: add '--' if missing
    let mergedStyles: Record<string, string | any> = {};
    for (const [k, v] of Object.entries(mergedStylesRaw)) {
      if (k === "modes" && typeof v === "object") {
        // Copy modes as-is for dark mode merging
        mergedStyles.modes = v;
      } else if (typeof v === "string" || typeof v === "number") {
        const cssVar = k.startsWith("--") ? k : `--${k}`;
        mergedStyles[cssVar] = String(v);
      }
    }
    // Use Home Assistant's dark mode detection if available
    let isHassDark = false;
    if (
      this.hass &&
      this.hass.themes &&
      typeof this.hass.themes.darkMode === "boolean"
    ) {
      isHassDark = this.hass.themes.darkMode;
    } else {
      // Fallback to prefers-color-scheme
      isHassDark =
        window.matchMedia &&
        window.matchMedia("(prefers-color-scheme: dark)").matches;
    }
    // If modes is present, merge in the correct mode
    if (mergedStyles.modes && typeof mergedStyles.modes === "object") {
      if (isHassDark && mergedStyles.modes.dark) {
        // Only merge if dark mode and dark object exists
        // Also normalize dark mode keys
        const darkModeVars: Record<string, string> = {};
        for (const [k, v] of Object.entries(mergedStyles.modes.dark)) {
          const cssVar = k.startsWith("--") ? k : `--${k}`;
          darkModeVars[cssVar] = String(v);
        }
        mergedStyles = { ...mergedStyles, ...darkModeVars };
      }
      delete mergedStyles.modes;
    }
    // Set CSS variables on the host element (this) and on ha-card for compatibility
    Object.entries(mergedStyles).forEach(([k, v]) => {
      if (k.startsWith("--") && typeof v === "string") {
        this.style.setProperty(k, v);
      }
    });
    // Also set variables on ha-card via style attribute for legacy/light-dom compatibility
    const styleVars = Object.entries(mergedStyles)
      .filter(([k, v]) => k.startsWith("--") && typeof v === "string")
      .map(([k, v]) => `${k}: ${v};`)
      .join(" ");

    const successRate =
      WeatherAPI.METEOGRAM_CARD_API_CALL_COUNT > 0
        ? Math.round(
            (100 * WeatherAPI.METEOGRAM_CARD_API_SUCCESS_COUNT) /
              WeatherAPI.METEOGRAM_CARD_API_CALL_COUNT
          )
        : 0;
    const successTooltip = `API Success Rate: ${
      WeatherAPI.METEOGRAM_CARD_API_SUCCESS_COUNT
    }/${
      WeatherAPI.METEOGRAM_CARD_API_CALL_COUNT
    } (${successRate}%) since ${MeteogramCard._localTime(METEOGRAM_CARD_STARTUP_TIME)}`;

    // Calculate aspect ratio style
    // let aspectRatioStyle = "aspect-ratio: 16/9;";
    // if (this.aspectRatio && this.aspectRatio.includes(":")) {
    //     const [w, h] = this.aspectRatio.split(":").map(Number);
    //     if (w > 0 && h > 0) aspectRatioStyle = `aspect-ratio: ${w}/${h};`;
    // } else if (this.aspectRatio && !isNaN(Number(this.aspectRatio))) {
    //     aspectRatioStyle = `aspect-ratio: ${Number(this.aspectRatio)}/1;`;
    // }
    // The wrapper's height, and where it comes from when the dashboard supplies none.
    //
    // height:100% is right whenever an ancestor has a real height — sections, masonry, a
    // card with a height set on it. In a panel dashboard nothing does, and the percentage
    // resolves to auto; the wrapper would then take its height from its content, which is
    // the chart, which we size from the wrapper. aspect-ratio settles it from the width
    // instead, so the height is known before we draw and does not move when we do.
    //
    // The two never fight: a percentage that resolves leaves the height definite, and
    // aspect-ratio only applies to an auto height. See issue #46.
    const chartContainerStyle =
      "width:100%;height:100%;" +
      (this.layoutMode !== "sections"
        ? `aspect-ratio:${MeteogramCard._ratioValue(this.aspectRatio)};`
        : "");

    // In Focussed mode, hide title and attribution
    if (this.displayMode === "focussed" || this.focussed) {
      // Check if we have cached data in WeatherAPI
      const hasCachedData = this._weatherApiInstance && (this._weatherApiInstance as any)._forecastData;
      return html`
        <ha-card style="${styleVars}">
          <div class="card-content">
            ${this.meteogramError && !hasCachedData
              ? html`<div
                  class="error"
                  style="white-space:normal;"
                  .innerHTML=${this.meteogramError}
                ></div>`
              : html`<div class="chart-wrap" style="${chartContainerStyle}">
                  <div id="chart"></div>
                </div>`}
          </div>
        </ha-card>
      `;
    }
    // Only show attribution if available (Met.no or entity)
    const showAttribution =
      (this.entityId && this.entityId !== "none" && this.entityAttribution) ||
      !(this.entityId && this.entityId !== "none");
    // Whether anything is on screen behind the error — an outage with a cached forecast
    // still drawing is a different situation from an outage with a blank card, and the
    // icon should not call both the same thing.
    const hasDrawableData = !!(
      this._weatherApiInstance &&
      (this._weatherApiInstance as any)._forecastData
    );
    // See api-status.ts for why the order and the two outage kinds matter.
    const apiStatus = attributionStatus(
      this._statusApiSuccess,
      this._apiFailures,
      hasDrawableData
    );
    const attributionColor = apiStatus.color;
    const attributionState = apiStatus.message;

    // The glyphs used to be ℹ️ and ⚠️, and that is why the colour never appeared on
    // screen: those are emoji presentation sequences, drawn by the platform's own colour
    // font, and `color:` does not reach them. Two iPad screenshots of this card, one
    // healthy and one mid-outage, show an identical blue icon. These inherit
    // `currentColor`, so the state is visible — and the shape changes too, because
    // colour alone is not a signal everyone can read.
    const statusSymbol =
      apiStatus.kind === "down"
        ? svg`<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"
                focusable="false" style="vertical-align:middle">
              <path d="M12 2.6 23 21.4H1Z" fill="currentColor"/>
              <rect x="11" y="9" width="2" height="6" rx="1" fill="#fff"/>
              <circle cx="12" cy="18" r="1.2" fill="#fff"/>
            </svg>`
        : svg`<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"
                focusable="false" style="vertical-align:middle">
              <circle cx="12" cy="12" r="10" fill="currentColor"/>
              <rect x="11" y="10.5" width="2" height="7" rx="1" fill="#fff"/>
              <circle cx="12" cy="7" r="1.3" fill="#fff"/>
            </svg>`;
    // Attribution tooltip content
    let attributionTooltip = "";
    if (this.entityId && this.entityId !== "none" && this.entityAttribution) {
      // Extract integration/platform from entityId (e.g., weather.openweathermap)
      let integrationId = "";
      let integrationName = "";
      let integrationDocUrl = "";
      if (this.entityId) {
        const parts = this.entityId.split(".");
        if (parts.length === 2) {
          const domain = parts[0];
          const platform = parts[1];
          integrationId = `${domain}.${platform}`;
          // Map known platforms to friendly names and docs
          const knownIntegrations: Record<
            string,
            { name: string; url: string }
          > = {
            openweathermap: {
              name: "OpenWeatherMap",
              url: "https://www.home-assistant.io/integrations/openweathermap/",
            },
            met: {
              name: "Met.no (Norwegian Meteorological Institute)",
              url: "https://www.home-assistant.io/integrations/met/",
            },
            accuweather: {
              name: "AccuWeather",
              url: "https://www.home-assistant.io/integrations/accuweather/",
            },
            pirateweather: {
              name: "Pirate Weather",
              url: "https://www.home-assistant.io/integrations/pirateweather/",
            },
            tomorrowio: {
              name: "Tomorrow.io",
              url: "https://www.home-assistant.io/integrations/tomorrowio/",
            },
            weatherbit: {
              name: "Weatherbit",
              url: "https://www.home-assistant.io/integrations/weatherbit/",
            },
            forecast_solar: {
              name: "Forecast.Solar",
              url: "https://www.home-assistant.io/integrations/forecast_solar/",
            },
            // Add more as needed
          };
          // Try to match platform (second part of entityId)
          if (knownIntegrations[platform]) {
            integrationName = knownIntegrations[platform].name;
            integrationDocUrl = knownIntegrations[platform].url;
          } else {
            // Fallback: use platform as name
            integrationName = platform
              .replace(/_/g, " ")
              .replace(/\b\w/g, (c) => c.toUpperCase());
            integrationDocUrl = "";
          }
        }
      }
      attributionTooltip = `
                <div style='padding:8px;min-width:300px;max-width:450px;text-align:left;'>
                    <div style='margin-bottom:4px;'>${
                      this.entityAttribution
                    }</div>
                    <div style='margin-top:6px;font-size:0.97em;color:#555;'>
                        Integration: ${
                          integrationDocUrl
                            ? `<a href='${integrationDocUrl}' target='_blank' rel='noopener' style='color:inherit;text-decoration:underline;'>${integrationName}</a>`
                            : integrationName
                        }
                        <span style='color:#888;'>(${this.entityId})</span>
                    </div>
                    ${
                      this.meteogramError && (this._weatherApiInstance && (this._weatherApiInstance as any)._forecastData)
                        ? `<div style='margin-top:8px;padding:8px;background:#ffebee;border-left:4px solid #b71c1c;color:#b71c1c;font-size:0.97em;border-radius:4px;'><b>⚠️ API Error (showing cached data):</b><br><span style='color:#555;'>${this.meteogramError}</span></div>`
                        : ""
                    }
                    ${
                      this._missingForecastKeys &&
                      this._missingForecastKeys.length > 0
                        ? `<div style='margin-top:8px;color:var(--secondary-text-color);font-size:0.97em;'><b>Not provided by your source:</b> ${this._missingForecastKeys.join(
                            ", "
                          )}
                    <br>These are optional, so the features that use them are left out. This is normal for many weather sources — see the README for what each field draws.</div>`
                        : ""
                    }
                    ${this.generateDiagnosticInfo().tooltip}
                    <div style='margin-top:8px;color:#1976d2;font-size:0.97em;'><b>Hours available in data source:</b> <b>${this.getAvailableHours()}</b></div>
                    ${this._setupHtml()}
                    ${this._recentDrawsHtml()}
                    <div style='margin-top:8px;color:#666;font-size:0.9em;'><b>Card version:</b> ${
                      MeteogramCard.meteogramCardVersion
                    }</div>
                </div>
            `;
    } else {
      attributionTooltip = `
                <div style='padding:8px;min-width:300px;max-width:450px;text-align:left;'>
                    <div style='margin-bottom:4px;'>
                        Weather data from <a href='https://www.met.no/en' target='_blank' rel='noopener' style='color:inherit;text-decoration:underline;'>the Norwegian Meteorological Institute (MET Norway)</a>,
                        licensed under <a href='https://creativecommons.org/licenses/by/4.0/' target='_blank' rel='noopener' style='color:inherit;text-decoration:underline;'>CC BY 4.0</a>
                    </div>
                    ${
                      this.meteogramError && (this._weatherApiInstance && (this._weatherApiInstance as any)._forecastData)
                        ? `<div style='margin-top:8px;padding:8px;background:#ffebee;border-left:4px solid #b71c1c;color:#b71c1c;font-size:0.97em;border-radius:4px;'><b>⚠️ API Error (showing cached data):</b><br><span style='color:#555;'>${this.meteogramError}</span></div>`
                        : ""
                    }
                    ${
                      this._missingForecastKeys &&
                      this._missingForecastKeys.length > 0
                        ? `<div style='margin-top:8px;color:var(--secondary-text-color);font-size:0.97em;'><b>Not provided by your source:</b> ${this._missingForecastKeys.join(
                            ", "
                          )}<br>These are optional, so the features that use them are left out. This is normal for many weather sources — see the README for what each field draws.</div>`
                        : ""
                    }
                    ${this.generateDiagnosticInfo().tooltip}
                    <div style='margin-top:8px;color:#1976d2;font-size:0.97em;'><b>Hours available in data source:</b> <b>${this.getAvailableHours()}</b></div>
                    ${this._setupHtml()}
                    ${this._recentDrawsHtml()}
                    <div style='margin-top:8px;color:#666;font-size:0.9em;'><b>Card version:</b> ${
                      MeteogramCard.meteogramCardVersion
                    }</div>
                </div>
            `;
    }
    // Full mode: everything
    return html`
      <ha-card style="${styleVars}">
        ${this.title ? html`<div class="card-header">${this.title}</div>` : ""}
        <div class="card-content">
          ${showAttribution
            ? html`
                <div class="attribution-icon-wrapper">
                  <span
                    class="attribution-icon"
                    style="color:${attributionColor};"
                    tabindex="0"
                    @click=${this._onAttributionIconClick}
                    @keydown=${(e: KeyboardEvent) => {
                      if (e.key === "Enter" || e.key === " ") {
                        this._onAttributionIconClick(e);
                      }
                    }}
                    aria-label="${attributionState}. Show attribution"
                    title="${attributionState}"
                    aria-expanded="${this.attributionTooltipOpen}"
                  >
                    <span style="font-size:1.3em;vertical-align:middle;"
                      >${statusSymbol}</span
                    >
                    <span
                      class="attribution-tooltip${this.attributionTooltipOpen
                        ? " open"
                        : ""}"
                      .innerHTML=${attributionTooltip}
                    ></span>
                  </span>
                </div>
              `
            : ""}
          ${this.meteogramError && !(this._weatherApiInstance && (this._weatherApiInstance as any)._forecastData)
            ? html`<div
                class="error"
                style="white-space:normal;"
                .innerHTML=${this.meteogramError}
              ></div>`
            : html`
                <div class="chart-wrap" style="${chartContainerStyle}">
                  <div id="chart"></div>
                </div>
                <!-- diagnostics only. debug is console logging and used to pull the
                     panel up with it, so turning logging on to investigate something
                     changed the very layout being investigated. -->
                ${this.diagnostics
                  ? (() => {
                      const diagnosticInfo = this.generateDiagnosticInfo();
                      return html`
                        <div
                          id="meteogram-status-panel"
                          style="margin-top:12px; font-size:0.95em; background:#f5f5f5; border-radius:6px; padding:8px; color:#333;"
                          xmlns="http://www.w3.org/1999/html"
                        >
                          <b
                            >${trnslt(
                              this.hass,
                              "ui.card.meteogram.status_panel",
                              "Status Panel"
                            )}</b
                          >
                          <div
                            style="display:grid; grid-template-columns:1fr 1fr; gap:8px; margin-top:6px;"
                          >
                            <div>
                              <span
                                >${trnslt(
                                  this.hass,
                                  "ui.card.meteogram.status.expires_at",
                                  "Expires At"
                                )}
                                : ${diagnosticInfo.expires}</span
                              ><br />
                              <span
                                >${trnslt(
                                  this.hass,
                                  "ui.card.meteogram.status.last_render",
                                  "Last Render"
                                )}
                                : ${diagnosticInfo.lastRender}</span
                              ><br />
                              <span
                                >${trnslt(
                                  this.hass,
                                  "ui.card.meteogram.status.last_data_fetch",
                                  "Last Data Fetch"
                                )}
                                : ${diagnosticInfo.lastFetch}</span
                              >
                            </div>
                            <div>
                              <span
                                title="${this._lastApiSuccess
                                  ? trnslt(
                                      this.hass,
                                      "ui.card.meteogram.status.success",
                                      "success"
                                    ) + ` : ${successTooltip}`
                                  : this._statusApiSuccess === null
                                  ? trnslt(
                                      this.hass,
                                      "ui.card.meteogram.status.cached",
                                      "cached"
                                    ) + ` : ${successTooltip}`
                                  : trnslt(
                                      this.hass,
                                      "ui.card.meteogram.status.failed",
                                      "failed"
                                    ) + ` : ${successTooltip}`}"
                              >
                                ${trnslt(
                                  this.hass,
                                  "ui.card.meteogram.status.api_success",
                                  "API Success"
                                )}
                                :
                                ${this._lastApiSuccess
                                  ? "✅"
                                  : this._statusApiSuccess === null
                                  ? "❎"
                                  : "❌"}
                              </span>
                              <br />
                              <span
                                >Card version:
                                <code
                                  >${MeteogramCard.meteogramCardVersion}</code
                                ></span
                              ><br />
                              <span
                                >Client type:
                                <code>${getClientName()}</code></span
                              ><br />
                              <span>${successTooltip}</span>
                            </div>
                          </div>
                          ${diagnosticInfo.panel || ""}
                          <div style="margin-top:8px;">
                            <button
                              @click=${this._copyDiagnostics}
                              style="font:inherit;padding:4px 10px;border-radius:4px;
                                     border:1px solid var(--divider-color,#bbb);
                                     background:var(--card-background-color,#fff);
                                     color:var(--primary-text-color,#222);cursor:pointer;"
                            >
                              ${this._copiedAt
                                ? trnslt(this.hass, "ui.card.meteogram.copied", "Copied \u2713")
                                : trnslt(this.hass, "ui.card.meteogram.copy_diagnostics", "Copy diagnostics")}
                            </button>
                          </div>
                        </div>
                      `;
                    })()
                  : ""}
              `}
        </div>
      </ha-card>
    `;
  }

  // Add logging method to help debug DOM structure - only used when errors occur
  private _logDomState() {
    if (this.errorCount > 0 && this.debug) {
      this._debugLog("DOM state check:");
      this._debugLog("- shadowRoot exists:", !!this.shadowRoot);
      if (this.shadowRoot) {
        const chartDiv = this.shadowRoot.querySelector("#chart");
        this._debugLog("- chart div exists:", !!chartDiv);
        if (chartDiv) {
          this._debugLog(
            "- chart div size:",
            (chartDiv as HTMLElement).offsetWidth,
            "x",
            (chartDiv as HTMLElement).offsetHeight
          );
        }
      }
      this._debugLog("- Is connected:", this.isConnected);
      this._debugLog("- Chart loaded:", this.chartLoaded);
    }
  }

  // Add a logging helper to log method entry and errors with context
  private logMethodEntry(method: string, context?: any) {
    if (context !== undefined) {
      this._debugLog(`[${CARD_NAME}] ENTER: ${method}`, context);
    } else {
      this._debugLog(`[${CARD_NAME}] ENTER: ${method}`);
    }
  }
  private logErrorContext(context: string, error: any) {
    if (error instanceof Error) {
      console.error(
        `[${CARD_NAME}] ERROR in ${context}:`,
        error.message,
        error.stack
      );
    } else {
      console.error(`[${CARD_NAME}] ERROR in ${context}:`, error);
    }
  }

  // Helper method to set errors with rate limiting
  setError(message: string) {
    this.logMethodEntry("setError", { message });
    const now = Date.now();

    // Always show full error as HTML if diagnostics is enabled
    this.meteogramError = message;
    this.lastErrorTime = now;
    this.errorCount = 1;
    console.error("Meteogram error:", message);

    // If this is a repeat of the same error, just count it
    if (message === this.meteogramError) {
      this.errorCount++;

      // Only update the UI with the error count periodically
      if (now - this.lastErrorTime > 10000) {
        // 10 seconds
        this.meteogramError = `${message} (occurred ${this.errorCount} times)`;
        this.lastErrorTime = now;
      }
    } else {
      // New error, reset counter
      this.errorCount = 1;
      this.meteogramError = message;
      this.lastErrorTime = now;
      console.error("Meteogram error:", message);
    }
  }

  // Add dark mode detection
  private _updateDarkMode() {
    let isDark = false;
    // Home Assistant sets dark mode in hass.themes.darkMode
    if (
      this.hass &&
      this.hass.themes &&
      typeof this.hass.themes.darkMode === "boolean"
    ) {
      isDark = this.hass.themes.darkMode;
    } else {
      // Fallback: check .dark-theme on <html> or <body>
      isDark =
        document.documentElement.classList.contains("dark-theme") ||
        document.body.classList.contains("dark-theme");
    }
    if (isDark) {
      this.setAttribute("dark", "");
    } else {
      this.removeAttribute("dark");
    }
  }

  // Add a helper to convert Celsius to Fahrenheit if needed
  private convertTemperature(tempC: number | null): number | null {
    if (tempC === null || tempC === undefined) return tempC;
    const unit = this.getSystemTemperatureUnit();
    // Use the shared conversion helper
    return convertTemperature(tempC, "°C", unit);
  }

  // Add a helper to convert pressure units
  private convertPressure(pressure: number | null): number | null {
    if (pressure === null || pressure === undefined) return pressure;
    const unit = this.getSystemPressureUnit();
    return convertPressure(pressure, "hPa", unit);
  }

  // Add a helper to convert wind speed units
  private convertWindSpeed(windSpeed: number | null): number | null {
    if (windSpeed === null || windSpeed === undefined) return windSpeed;
    const unit = this.getSystemWindSpeedUnit();
    return convertWindSpeed(windSpeed, "m/s", unit);
  }

  // Add a helper to convert precipitation units
  private convertPrecipitation(precip: number | null): number | null {
    if (precip === null || precip === undefined) return precip;
    const unit = this.getSystemPrecipitationUnit();
    return convertPrecipitation(precip, "mm", unit);
  }

  // Add initialization method for units
  private _initializeUnits(): void {
    // Temperature unit
    if (this.hass?.config?.unit_system?.temperature) {
      const unit = this.hass.config.unit_system.temperature;
      if (unit === "°F" || unit === "°C") this._tempUnit = unit;
      else if (unit === "F") this._tempUnit = "°F";
      else if (unit === "C") this._tempUnit = "°C";
    }

    // Pressure unit
    if (this.hass?.config?.unit_system?.pressure) {
      const unit = this.hass.config.unit_system.pressure;
      if (unit === "hPa" || unit === "inHg") this._pressureUnit = unit;
      else if (unit === "mbar") this._pressureUnit = "hPa";
    }

    // Wind speed unit
    if (this.hass?.config?.unit_system?.wind_speed) {
      const unit = this.hass.config.unit_system.wind_speed;
      if (
        unit === "m/s" ||
        unit === "km/h" ||
        unit === "mph" ||
        unit === "kt" ||
        unit === "kn"
      )
        this._windSpeedUnit = unit === "kn" ? "kt" : unit; // Normalize knots to "kt"
    }

    // Precipitation unit
    if (this.hass?.config?.unit_system?.precipitation) {
      const unit = this.hass.config.unit_system.precipitation;
      if (unit === "mm" || unit === "in") this._precipUnit = unit;
    }
  }

  // Update the existing unit getter methods to use the class variables
  private getSystemTemperatureUnit(): "°C" | "°F" {
    return this._tempUnit;
  }

  private getSystemPressureUnit(): "hPa" | "inHg" {
    return this._pressureUnit;
  }

  private getSystemWindSpeedUnit(): "m/s" | "km/h" | "mph" | "kt" {
    return this._windSpeedUnit;
  }

  private getSystemPrecipitationUnit(): "mm" | "in" {
    return this._precipUnit;
  }

  // Helper to get the number of hours available in the data source
  private getAvailableHours(): number | string {
    // If already calculated, return cached value
    if (this._availableHours !== null) {
      return this._availableHours;
    }
    return "unknown";
  }

  // Schedule periodic cache cleanup (run once per page load)
  private schedulePeriodicCacheCleanup() {
    // Only run cleanup once per browser session to avoid excessive operations
    const sessionKey = "meteogram-card-cleanup-done";
    if (sessionStorage.getItem(sessionKey)) {
      return; // Already cleaned up in this session
    }

    try {
      // Clean up MET.no weather cache
      const cacheStr = localStorage.getItem("metno-weather-cache");
      if (cacheStr) {
        try {
          const cacheObj = JSON.parse(cacheStr);
          if (cacheObj["forecast-data"]) {
            const now = Date.now();
            const twentyFourHours = 24 * 60 * 60 * 1000;
            const requiredArrays = [
              "time",
              "temperature",
              "rain",
              "rainMin",
              "rainMax",
              "cloudCover",
              "windSpeed",
              "windGust",
              "windDirection",
              "symbolCode",
              "pressure",
            ];
            let removedCount = 0;
            let invalidCount = 0;

            for (const [key, entry] of Object.entries(
              cacheObj["forecast-data"]
            )) {
              const entryData = entry as { expiresAt: number; data: any };
              let shouldRemove = false;

              // Remove entries older than 24h past expiry
              if (now - entryData.expiresAt > twentyFourHours) {
                shouldRemove = true;
                removedCount++;
              }
              // Validate data structure
              else if (!entryData.data || typeof entryData.data !== "object") {
                shouldRemove = true;
                invalidCount++;
              }
              // Check for missing required arrays
              else {
                const missingArrays = requiredArrays.filter(
                  (prop) => !Array.isArray(entryData.data[prop])
                );
                if (missingArrays.length > 0) {
                  shouldRemove = true;
                  invalidCount++;
                }
              }

              if (shouldRemove) {
                delete cacheObj["forecast-data"][key];
              }
            }

            if (removedCount > 0 || invalidCount > 0) {
              localStorage.setItem(
                "metno-weather-cache",
                JSON.stringify(cacheObj)
              );
              // Static method - check localStorage for debug flag
              if (localStorage.getItem("meteogram-debug") === "true") {
                console.debug(
                  `[${CARD_NAME}] Startup cleanup: removed ${removedCount} old and ${invalidCount} invalid MET.no cache entries`
                );
              }
            }
          }
        } catch (e) {
          console.warn(
            `[${CARD_NAME}] Corrupted MET.no cache during startup cleanup, clearing:`,
            e
          );
          localStorage.removeItem("metno-weather-cache");
        }
      }

      // Clean up entity cache
      const entityCacheStr = localStorage.getItem(
        "meteogram-card-entity-weather-cache"
      );
      if (entityCacheStr) {
        try {
          const entityCache = JSON.parse(entityCacheStr);
          const now = Date.now();
          const twentyFourHours = 24 * 60 * 60 * 1000;
          const requiredArrays = [
            "time",
            "temperature",
            "rain",
            "rainMin",
            "rainMax",
            "cloudCover",
            "windSpeed",
            "windGust",
            "windDirection",
            "symbolCode",
            "pressure",
          ];
          let removedCount = 0;
          let invalidCount = 0;

          for (const [entityId, entry] of Object.entries(entityCache)) {
            let shouldRemove = false;

            // Handle both old format (direct data) and new format (with timestamp)
            if (entry && typeof entry === "object" && "timestamp" in entry) {
              const entryData = entry as { timestamp: number; data: any };

              // Remove entries older than 24h
              if (now - entryData.timestamp > twentyFourHours) {
                shouldRemove = true;
                removedCount++;
              }
              // Validate data structure
              else if (!entryData.data || typeof entryData.data !== "object") {
                shouldRemove = true;
                invalidCount++;
              }
              // Check for missing required arrays
              else {
                const missingArrays = requiredArrays.filter(
                  (prop) => !Array.isArray(entryData.data[prop])
                );
                if (missingArrays.length > 0) {
                  shouldRemove = true;
                  invalidCount++;
                }
              }
            } else if (entry && typeof entry === "object") {
              // Old format - validate structure
              const missingArrays = requiredArrays.filter(
                (prop) => !Array.isArray((entry as any)[prop])
              );
              if (missingArrays.length > 0) {
                shouldRemove = true;
                invalidCount++;
              }
              // Keep valid old format entries for backward compatibility - they'll be converted on next save
            } else {
              // Corrupted entry - remove it
              shouldRemove = true;
              invalidCount++;
            }

            if (shouldRemove) {
              delete entityCache[entityId];
            }
          }

          if (removedCount > 0 || invalidCount > 0) {
            localStorage.setItem(
              "meteogram-card-entity-weather-cache",
              JSON.stringify(entityCache)
            );
            // Static method - check localStorage for debug flag
            if (localStorage.getItem("meteogram-debug") === "true") {
              console.debug(
                `[${CARD_NAME}] Startup cleanup: removed ${removedCount} old and ${invalidCount} invalid entity cache entries`
              );
            }
          }
        } catch (e) {
          console.warn(
            `[${CARD_NAME}] Corrupted entity cache during startup cleanup, clearing:`,
            e
          );
          localStorage.removeItem("meteogram-card-entity-weather-cache");
        }
      }

      // Mark cleanup as done for this browser session
      sessionStorage.setItem(sessionKey, "true");
    } catch (e) {
      console.warn(
        `[${CARD_NAME}] Failed to perform startup cache cleanup:`,
        e
      );
    }
  }
}

/**
 * Console hook: turn debug logging on without editing the config.
 *
 *   meteogramDebug()        // on for every card on the page
 *   meteogramDebug(false)   // off again
 *
 * `debug: true` in YAML does the same thing, but only from the next reload — and a
 * reload is exactly what destroys the transient behaviour worth logging. This flips it
 * on the live cards, so the next redraw is logged with the reason that caused it.
 */
const meteogramDebug = (on: boolean = true): string => {
  const cards = (MeteogramCard as any)._live as Set<MeteogramCard>;
  cards.forEach((card) => {
    card._debugOverride = on;
    card.debug = on;
  });
  return `meteogram-card: debug ${on ? "on" : "off"} for ${cards.size} card(s) on this page`;
};

/**
 * meteogramDebug.dump() prints the state of each card: entity, coordinates, which API
 * is in use, and the current config.
 *
 * debugMeteogram() has always existed for this, but a card sits deep inside Home
 * Assistant's shadow DOM and cannot be reached from the console by querySelector, so
 * there was no way to call it.
 */
meteogramDebug.dump = (): void => {
  const cards = (MeteogramCard as any)._live as Set<MeteogramCard>;
  if (!cards.size) {
    console.log("meteogram-card: no cards on this page");
    return;
  }
  cards.forEach((card) => card.debugMeteogram());
};

(window as any).meteogramDebug = meteogramDebug;
