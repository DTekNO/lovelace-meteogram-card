import { LitElement, css, html, PropertyValues } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import {
  MeteogramCardConfig,
  MeteogramCardEditorElement,
  DayRange,
} from "./types";
import { version } from "../package.json";
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
import { MeteogramChart } from "./meteogram-chart";

type MeteogramStyleModes = {
  dark?: Record<string, string>;
  [mode: string]: Record<string, string> | undefined;
};

export type MeteogramStyleConfig = Record<string, string> & {
  modes?: MeteogramStyleModes;
};

@customElement("meteogram-card")
export class MeteogramCard extends LitElement {
  private _chartRenderer: MeteogramChart | null = null;
  // Getter for precipitation display (replaces showRain)
  get showPrecipitation() {
    // Prefer config property if present, else default to true
    return (this as any).show_precipitation !== undefined
      ? (this as any).show_precipitation
      : true;
  }
  // Store missing keys for diagnostics/info panel
  private _missingForecastKeys: string[] = [];
  private _availableHours: number | string = "unknown";
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
    this.denseWeatherIcons = true;
    this.meteogramHours = "48h";
    this.styles = {};
    this.diagnostics = DIAGNOSTICS_DEFAULT;
    this.debug = false;
    // Initialize state properties
    this.chartLoaded = false;
    this.meteogramError = "";
    this.errorCount = 0;
    this.lastErrorTime = 0;
    this._statusExpiresAt = "";
    this._statusLastRender = "";
    this._statusLastFetch = "";
    this._statusApiSuccess = null;
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
  @property({ type: Boolean }) denseWeatherIcons = true; // NEW: icon density config
  @property({ type: String }) meteogramHours: string = "48h"; // Default is now 48h
  @property({ type: Object }) styles: MeteogramStyleConfig = {}; // NEW: styles override
  @property({ type: Boolean }) diagnostics: boolean = DIAGNOSTICS_DEFAULT; // Initialize here
  @property({ type: Boolean }) debug: boolean = false; // Debug logging (undocumented)
  @property({ type: String }) entityId?: string; // NEW: entity_id for weather integration
  @property({ type: Boolean }) focussed = false; // NEW: Focussed mode
  @property({ type: String }) displayMode: "full" | "core" | "focussed" =
    "full";
  @property({ type: String }) aspectRatio: string = "16:9"; // NEW: aspect ratio config, default 16:9
  @property({ type: Number }) altitude?: number; // Optional altitude for WeatherAPI
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
      usingDirectAPI: !!(this.latitude && this.longitude),
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
  private _redrawScheduled = false;
  private _lastDrawScheduleTime = 0;
  private _drawThrottleMs = 200;
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

  static lastD3RetryTime = 0;
  static meteogramCardVersion: string = version;

  // Add a method to fetch icons
  private async getIconSVG(iconName: string): Promise<string> {
    // Return from cache if available
    if (this.iconCache.has(iconName)) {
      return this.iconCache.get(iconName)!;
    }

    try {
      // Add a console log to debug the URL
      const iconUrl = `${this.iconBasePath}${iconName}.svg`;

      // Fetch from GitHub
      const response = await fetch(iconUrl);

      if (!response.ok) {
        // Fallback: if iconName ends with _day or _night, try base icon
        if (iconName.endsWith("_day") || iconName.endsWith("_night")) {
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
  private _scheduleDrawMeteogram(
    source: string = "unknown",
    force: boolean = false
  ) {
    const now = Date.now();
    this._drawCallIndex++;
    const callerId = `${source}#${this._drawCallIndex}`;
    this._debugLog(
      `[${CARD_NAME}] _scheduleDrawMeteogram called from: ${callerId}`
    );

    // Only skip if not forced
    if (
      !force &&
      (this._redrawScheduled ||
        now - this._lastDrawScheduleTime < this._drawThrottleMs)
    ) {
      this._debugLog(
        `[${CARD_NAME}] _scheduleDrawMeteogram: redraw already scheduled or throttled, skipping.`
      );
      return;
    }
    this._redrawScheduled = true;
    this._lastDrawScheduleTime = now;

    setTimeout(() => {
      this._redrawScheduled = false;
      this._lastDrawScheduleTime = Date.now();
      this._drawMeteogram(callerId);
    }, 50);
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

    if (config.title) this.title = config.title;
    if (config.latitude !== undefined) this.latitude = configLat;
    if (config.longitude !== undefined) this.longitude = configLon;
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
    this.debug = config.debug !== undefined ? config.debug : false;
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

  // Required for HA visual editor support
  public static getConfigElement() {
    // Pre-initialize the editor component for faster display
    const editor = document.createElement(
      "meteogram-card-editor"
    ) as MeteogramCardEditorElement;
    // Create a basic config to start with
    editor.setConfig({
      show_cloud_cover: true,
      show_pressure: true,
      show_precipitation: true, // Use new option
      show_weather_icons: true,
      show_wind: true,
      dense_weather_icons: true,
      meteogram_hours: "48h",
      diagnostics: DIAGNOSTICS_DEFAULT, // Default to DIAGNOSTICS_DEFAULT
      debug: false, // Debug logging (undocumented)
    });
    return editor;
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
    this._isInitialized = false;

    // Wait for DOM to be ready before setting up observers
    this.updateComplete.then(() => {
      this._setupResizeObserver();
      this._setupVisibilityObserver();
      this._setupMutationObserver();

      // Also handle browser tab visibility changes
      document.addEventListener(
        "visibilitychange",
        this._onVisibilityChange.bind(this)
      );

      // Handle page/panel navigation events
      window.addEventListener(
        "location-changed",
        this._onLocationChanged.bind(this)
      );

      // Handle orientation changes (screen rotation)
      window.addEventListener(
        "orientationchange",
        this._onOrientationChange.bind(this)
      );

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
    this._teardownResizeObserver(); // <-- Implemented teardown for resize observer
    this._teardownVisibilityObserver();
    this._teardownMutationObserver();
    if (this._weatherEntityApiInstance) {
      this._weatherEntityApiInstance.destroy("disconnectedCallback");
      this._weatherEntityApiInstance = null;
    }

    document.removeEventListener(
      "visibilitychange",
      this._onVisibilityChange.bind(this)
    );
    window.removeEventListener(
      "location-changed",
      this._onLocationChanged.bind(this)
    );
    window.removeEventListener(
      "orientationchange",
      this._onOrientationChange.bind(this)
    );
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
    }

    // Only redraw if coordinates, hass, or relevant config options change, or it's the first render
    const needsRedraw =
      changedProps.has("latitude") ||
      changedProps.has("longitude") ||
      // changedProps.has('hass') ||
      changedProps.has("showCloudCover") ||
      changedProps.has("showPressure") ||
      changedProps.has("show_precipitation") ||
      changedProps.has("showWeatherIcons") ||
      changedProps.has("showWind") ||
      changedProps.has("denseWeatherIcons") ||
      changedProps.has("meteogramHours");

    if (needsRedraw) {
    }

    if (!needsRedraw) {
      this._debugLog(
        `[${CARD_NAME}] updated(): no redraw needed or chart render in progress, skipping.`
      );
      return;
    } else {
      this._debugLog(
        `[${CARD_NAME}] updated(): scheduling redraw, chartLoaded=${this.chartLoaded}`
      );
    }

    if (this.chartLoaded && needsRedraw) {
      // Guard: If chart is already rendered and visible, skip scheduling
      const chartDiv = this.shadowRoot?.querySelector("#chart");
      const svgExists = chartDiv?.querySelector("svg");
      const chartIsVisible =
        chartDiv &&
        (chartDiv as HTMLElement).offsetWidth > 0 &&
        (chartDiv as HTMLElement).offsetHeight > 0;
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
  private _saveDefaultLocationToStorage(latitude: number, longitude: number) {
    try {
      const locationObj = {
        latitude: parseFloat(latitude.toFixed(4)),
        longitude: parseFloat(longitude.toFixed(4)),
      };
      localStorage.setItem(
        "meteogram-card-default-location",
        JSON.stringify(locationObj)
      );
    } catch (e) {
      this._debugLog(
        `[${CARD_NAME}] Failed to save default location to localStorage:`,
        e
      );
    }
  }

  // Load location from localStorage under "meteogram-card-default-location"
  private _loadDefaultLocationFromStorage(): {
    latitude: number;
    longitude: number;
  } | null {
    try {
      const locationStr = localStorage.getItem(
        "meteogram-card-default-location"
      );
      if (locationStr) {
        try {
          const locationObj = JSON.parse(locationStr);
          const latitude = parseFloat(Number(locationObj.latitude).toFixed(4));
          const longitude = parseFloat(
            Number(locationObj.longitude).toFixed(4)
          );
          if (!isNaN(latitude) && !isNaN(longitude)) {
            return { latitude, longitude };
          }
        } catch {
          // Ignore parse errors
        }
      }
      return null;
    } catch (e) {
      this._debugLog(
        `[${CARD_NAME}] Failed to load default location from localStorage:`,
        e
      );
      return null;
    }
  }

  // Check if we need to get location from HA
  private _checkAndUpdateLocation() {
    // Try to get location from config first
    if (this.latitude !== undefined && this.longitude !== undefined) {
      this.latitude = parseFloat(Number(this.latitude).toFixed(4));
      this.longitude = parseFloat(Number(this.longitude).toFixed(4));
      // Initialize WeatherAPI instance if not already set or if lat/lon/altitude changed
      if (
        !this._weatherApiInstance ||
        this._weatherApiInstance.lat !== this.latitude ||
        this._weatherApiInstance.lon !== this.longitude ||
        this._weatherApiInstance.altitude !== this.altitude
      ) {
        this._weatherApiInstance = new WeatherAPI(
          this.latitude,
          this.longitude,
          this.altitude,
          this.debug
        );
      }
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
        // Only update default-location if it is different from cached value
        const cachedDefault = this._loadDefaultLocationFromStorage();
        if (
          !cachedDefault ||
          cachedDefault.latitude !== haLat ||
          cachedDefault.longitude !== haLon
        ) {
          this._saveDefaultLocationToStorage(haLat, haLon);
        }
        this.latitude = haLat;
        this.longitude = haLon;
        // Initialize WeatherAPI instance if not already set or if lat/lon changed
        if (
          !this._weatherApiInstance ||
          this._weatherApiInstance.lat !== this.latitude ||
          this._weatherApiInstance.lon !== this.longitude ||
          this._weatherApiInstance.altitude !== this.altitude
        ) {
          this._weatherApiInstance = new WeatherAPI(
            this.latitude,
            this.longitude,
            this.altitude,
            this.debug
          );
        }
        this._debugLog(
          `[${CARD_NAME}] Using HA location: ${this.latitude}, ${this.longitude}`
        );
        return;
      }
    }

    // If we still don't have location, try to load from localStorage default-location
    if (this.latitude === undefined || this.longitude === undefined) {
      const cachedLocation = this._loadDefaultLocationFromStorage();
      if (cachedLocation) {
        this.latitude = cachedLocation.latitude;
        this.longitude = cachedLocation.longitude;
        if (
          !this._weatherApiInstance ||
          this._weatherApiInstance.lat !== this.latitude ||
          this._weatherApiInstance.lon !== this.longitude ||
          this._weatherApiInstance.altitude !== this.altitude
        ) {
          this._weatherApiInstance = new WeatherAPI(
            this.latitude,
            this.longitude,
            this.altitude,
            this.debug
          );
        }
        this._debugLog(
          `[${CARD_NAME}] Using cached default-location: ${this.latitude}, ${this.longitude}`
        );
      } else {
        this.latitude = 51.5074;
        this.longitude = -0.1278;
        if (
          !this._weatherApiInstance ||
          this._weatherApiInstance.lat !== this.latitude ||
          this._weatherApiInstance.lon !== this.longitude ||
          this._weatherApiInstance.altitude !== this.altitude
        ) {
          this._weatherApiInstance = new WeatherAPI(
            this.latitude,
            this.longitude,
            this.altitude,
            this.debug
          );
        }
        this._debugLog(
          `[${CARD_NAME}] Using default location: ${this.latitude}, ${this.longitude}`
        );
      }
    }
  }

  // Modularized: Use chartRenderer to ensure D3 is loaded, then schedule draw
  async loadD3AndDraw(): Promise<void> {
    if (!this._chartRenderer) {
      this._chartRenderer = new MeteogramChart(this);
    }
    try {
      await this._chartRenderer.ensureD3Loaded();
      this.chartLoaded = true;
      this._scheduleDrawMeteogram("loadD3AndDraw");
    } catch (error) {
      console.error("Error loading D3.js:", error);
      this.setError(
        "Failed to load D3.js visualization library. Please refresh the page."
      );
    }
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
    if (!lat || !lon) {
      this._checkAndUpdateLocation(); // Try harder to get location

      const checkedLat =
        this.latitude !== undefined
          ? parseFloat(Number(this.latitude).toFixed(4))
          : undefined;
      const checkedLon =
        this.longitude !== undefined
          ? parseFloat(Number(this.longitude).toFixed(4))
          : undefined;

      if (!checkedLat || !checkedLon) {
        throw new Error(
          "Could not determine location. Please check your card configuration or Home Assistant settings."
        );
      }
    }

    // Ensure WeatherAPI instance is initialized
    if (
      !this._weatherApiInstance ||
      this._weatherApiInstance.lat !== lat ||
      this._weatherApiInstance.lon !== lon ||
      this._weatherApiInstance.altitude !== this.altitude
    ) {
      this._weatherApiInstance = new WeatherAPI(
        lat!,
        lon!,
        this.altitude,
        this.debug
      );
    }
    const weatherApi = this._weatherApiInstance;

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
        // Store units from API
        this._currentUnits = result && result.units ? result.units : {};
        // Filter result by meteogramHours
        let hours = 48;
        if (this.meteogramHours === "8h") hours = 8;
        else if (this.meteogramHours === "12h") hours = 12;
        else if (this.meteogramHours === "24h") hours = 24;
        else if (this.meteogramHours === "48h") hours = 48;
        else if (this.meteogramHours === "54h") hours = 54;
        else if (this.meteogramHours === "max") hours = result.time.length;

        // Only keep the first N hours
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
        arrayKeys.forEach((key) => {
          if (Array.isArray((result as any)[key])) {
            (result as any)[key] = (result as any)[key].slice(0, hours);
          }
        });
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
        let diag = weatherApi.getDiagnosticText();
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
        throw new Error(
          `<br>Failed to get weather data: ${
            (error as Error).message
          }\n<br>Check your network connection, browser console, and API accessibility.\n\n${diag}`
        );
      } finally {
        // Do NOT clear weatherDataPromise here, so repeated calls use the same promise
        // Only clear it after chart draw is complete
      }
    })();
    return this.weatherDataPromise;
  }

  // Keep the cleanupChart method as is
  cleanupChart(): void {
    try {
      // Check if we have an active D3 selection
      if (this.svg && typeof this.svg.remove === "function") {
        // Use D3's remove method to clean up properly
        this.svg.remove();
        this.svg = null;
      }

      // Also clear any chart content directly from the DOM
      if (this.shadowRoot) {
        const chartDiv = this.shadowRoot.querySelector("#chart");
        if (chartDiv) {
          chartDiv.innerHTML = "";
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
      data.windSpeed.some((val) => val !== null && typeof val === "number");

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

    // Make sure we have a location before proceeding
    this._checkAndUpdateLocation();

    if (!this.latitude || !this.longitude) {
      this.setError(
        "Location not available. Please check your card configuration or Home Assistant settings."
      );
      return;
    }

    // Wait for the render cycle to complete before accessing the DOM
    await this.updateComplete;

    // Use the _logDomState method to log diagnostic info
    this._logDomState();

    // Add a static property to limit D3 retry frequency
    const D3_RETRY_INTERVAL = 10000; // 10 seconds
    if (!MeteogramCard.lastD3RetryTime) {
      MeteogramCard.lastD3RetryTime = 0;
    }

    // Always attempt to load D3 if not present
    if (!window.d3) {
      try {
        await this.loadD3AndDraw();
        return; // loadD3AndDraw will call drawMeteogram when ready
      } catch (error) {
        // Only throttle error messages if repeated failures
        const now = Date.now();
        if (now - MeteogramCard.lastD3RetryTime < D3_RETRY_INTERVAL) {
          // Too soon to retry loading D3, skip this attempt
          return;
        }
        MeteogramCard.lastD3RetryTime = now;
        this.setError(
          "D3.js library could not be loaded. Please refresh the page."
        );
        return;
      }
    }

    // Clean up any existing chart before proceeding
    this.cleanupChart();

    // Ensure we have a clean update cycle before accessing the DOM again
    await new Promise((resolve) => setTimeout(resolve, 10));

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
              cardContent.innerHTML = '<div id="chart"></div>';
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
    let availableWidth = parent
      ? parent.clientWidth
      : (chartDiv as HTMLElement).offsetWidth || 350;
    let availableHeight = parent
      ? parent.clientHeight
      : (chartDiv as HTMLElement).offsetHeight || 180;

    // --- Aspect Ratio Logic ---
    let width: number, height: number;
    // Use aspectRatio only if not in sections layout
    let useAspectRatio = this.aspectRatio && this.layoutMode !== "sections";
    if (useAspectRatio && typeof this.aspectRatio === "string") {
      // Parse aspect ratio string, e.g. "16:9"
      const [w, h] = this.aspectRatio.split(":").map(Number);
      if (w > 0 && h > 0) {
        width = availableWidth;
        height = Math.round(width * (h / w));
        // Optionally, limit height to availableHeight
        if (height > availableHeight) {
          height = availableHeight;
          width = Math.round(height * (w / h));
        }
      } else {
        width =
          (chartDiv as HTMLElement).offsetWidth > 0
            ? (chartDiv as HTMLElement).offsetWidth
            : availableWidth;
        height =
          (chartDiv as HTMLElement).offsetHeight > 0
            ? (chartDiv as HTMLElement).offsetHeight
            : availableHeight;
      }
    } else {
      // Default: fill container
      width =
        (chartDiv as HTMLElement).offsetWidth > 0
          ? (chartDiv as HTMLElement).offsetWidth
          : availableWidth;
      height =
        (chartDiv as HTMLElement).offsetHeight > 0
          ? (chartDiv as HTMLElement).offsetHeight
          : availableHeight;
    }

    // Clean up previous chart
    chartDiv.innerHTML = "";
    // Fetch weather data and render
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

        this.svg = window.d3
          .select(chartDiv)
          .append("svg")
          .attr("width", width)
          .attr("height", height)
          .attr("viewBox", `0 0 ${width} ${height}`)
          .attr(
            "preserveAspectRatio",
            useAspectRatio ? "xMidYMid meet" : "none"
          ); // Fill container, no aspect ratio

        let hours = 48;
        if (this.meteogramHours === "8h") hours = 8;
        else if (this.meteogramHours === "12h") hours = 12;
        else if (this.meteogramHours === "24h") hours = 24;
        else if (this.meteogramHours === "48h") hours = 48;
        else if (this.meteogramHours === "54h") hours = 54;
        else if (this.meteogramHours === "max") hours = data.time.length;

        const sliceData = <T>(arr: T[] | undefined): T[] => {
          if (!arr || !Array.isArray(arr)) {
            console.warn(
              `[${CARD_NAME}] sliceData: received undefined/null array, returning empty array`
            );
            return [];
          }
          return arr.slice(0, Math.min(hours, arr.length) + 1);
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

        // --- SCHEDULE REFRESH 60s AFTER expiresAt ---
        if (this.apiExpiresAt) {
          const now = Date.now();
          const delay = Math.max(this.apiExpiresAt + 60000 - now, 0);
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
          // If a diagnostic error is already present, append the retry message
          if (
            this.meteogramError &&
            this.meteogramError.includes("API Error")
          ) {
            this.meteogramError += `<br><span style='color:#b71c1c;'>Weather data not available, retrying in 60 seconds</span>`;
          } else {
            this.setError("Weather data not available, retrying in 60 seconds");
          }
          if (this._weatherRetryTimeout)
            clearTimeout(this._weatherRetryTimeout);
          this._weatherRetryTimeout = window.setTimeout(() => {
            this.meteogramError = "";
            this._drawMeteogram("retry-after-error");
          }, 60000);
        }
      })
      .finally(() => {
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
    let lastRenderInfo = this._statusLastRender || "unknown";

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
            >${new Date(this.apiExpiresAt).toLocaleString()}${status}</span
          >`;
        }
        lastFetchInfo = this._statusLastFetch
          ? this._statusLastFetch.includes("T")
            ? new Date(this._statusLastFetch).toLocaleString()
            : this._statusLastFetch
          : "not available";

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
    // 1. Try weather entity attributes
    if (
      this.entityId &&
      this.hass &&
      this.hass.states &&
      this.hass.states[this.entityId]
    ) {
      const attrs = this.hass.states[this.entityId].attributes || {};
      if (attrs.sunrise && attrs.sunset) {
        const sunrise = new Date(attrs.sunrise);
        const sunset = new Date(attrs.sunset);
        if (date >= sunrise && date < sunset) return true;
        return false;
      }
    }
    // 2. Try sun.sun entity
    if (this.hass && this.hass.states && this.hass.states["sun.sun"]) {
      const sunAttrs = this.hass.states["sun.sun"].attributes || {};
      if (typeof sunAttrs.elevation === "number") {
        return sunAttrs.elevation > 0;
      }
    }
    // 3. Fallback: 6:00-18:00 is day
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
    const d3 = window.d3;
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
    if (this.displayMode === "core") {
      this._margin = {
        top: 50,
        right: 40,
        bottom: hourLabelBand + 10,
        left: 40,
      };
    } else if (this.focussed) {
      this._margin = {
        top: 10,
        right: 40,
        bottom: hourLabelBand + 10,
        left: 40,
      };
    } else if (!pressureAvailable) {
      this._margin = {
        top: 70,
        right: 40,
        bottom: hourLabelBand + 10,
        left: 70,
      };
    } else {
      this._margin = {
        top: 70,
        right: 70,
        bottom: hourLabelBand + 10,
        left: 70,
      };
    }
    const margin = this._margin;

    this._chartHeight = this.focussed
      ? height - windBandHeight - hourLabelBand - 10
      : height - windBandHeight - hourLabelBand - 50 - 10; // Extra space for legends in non-focussed mode
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

    // Find day boundaries for shaded backgrounds
    const dateLabelY = margin.top - 30;
    const dayStarts: number[] = [];
    for (let i = 0; i < N; i++) {
      if (i === 0 || time[i].getDate() !== time[i - 1].getDate()) {
        dayStarts.push(i);
      }
    }

    const dayRanges: DayRange[] = [];
    for (let i = 0; i < dayStarts.length; ++i) {
      const startIdx = dayStarts[i];
      const endIdx = i + 1 < dayStarts.length ? dayStarts[i + 1] : N;
      dayRanges.push({ start: startIdx, end: endIdx });
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

    const chart = svg
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

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
        Math.floor(d3.min(tempValues) - 2),
        Math.ceil(d3.max(tempValues) + 2),
      ])
      .range([this._chartHeight, 0]);

    // Precipitation Y scale
    const yPrecip = d3
      .scaleLinear()
      .domain([0, Math.max(2, d3.max([...nonNullRainMax, ...nonNullRain]) + 1)])
      .range([this._chartHeight, 0]); // <-- FIXED: range goes from this._chartHeight (bottom) to 0 (top)

    // Pressure Y scale - we'll use the right side of the chart
    // Only create if pressure is shown and data is available
    let yPressure;
    const hasPressure = this.showPressure && this._dataAvailability.pressure;
    if (hasPressure) {
      const validPressures = pressure.filter(
        (p): p is number => p !== null && typeof p === "number" && !isNaN(p)
      );
      const pressureRange = d3.extent(validPressures);
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
    const numLegends = this.displayMode === "core" ? 0 : enabledLegends.length;
    const legendPositions =
      this.displayMode === "core"
        ? []
        : enabledLegends.map((_: LegendInfo, i: number) => {
            const slotWidth = this._chartWidth / numLegends;
            return {
              x: i * slotWidth + 2,
              y: -45,
            };
          });

    // Alternate shaded background for days
    svg
      .selectAll(".day-bg")
      .data(dayRanges)
      .enter()
      .append("rect")
      .attr("class", "day-bg")
      .attr("x", (d: DayRange) => margin.left + x(d.start))
      .attr("y", margin.top - 42)
      // Limit width to only main chart area (do not extend to right axis)
      .attr("width", (d: DayRange) => {
        // Defensive: ensure width is never negative
        const rawWidth = x(Math.max(d.end - 1, d.start)) - x(d.start) + dx;
        const maxWidth = this._chartWidth - x(d.start);
        const safeWidth = Math.max(0, Math.min(rawWidth, maxWidth));
        return safeWidth;
      })
      // Limit height to only main chart area (do not extend to lower x axis)
      .attr("height", this._chartHeight + 42)
      .attr("opacity", (_: DayRange, i: number) => (i % 2 === 0 ? 0.16 : 0));

    // Draw chart grid background
    if (!this._chartRenderer) {
      this._chartRenderer = new MeteogramChart(this);
    }
    this._chartRenderer.drawChartGrid(
      svg,
      chart,
      d3,
      x,
      yTemp,
      N,
      margin,
      dayStarts
    );
    this._chartRenderer.drawGridOutline(chart);

    // Draw date labels at top
    if (
      this._chartRenderer &&
      typeof this._chartRenderer.drawDateLabels === "function"
    ) {
      this._chartRenderer.drawDateLabels(
        svg,
        time,
        dayStarts,
        margin,
        x,
        this._chartWidth,
        dateLabelY
      );
    }

    // Draw bottom hour labels using helper
    this._chartRenderer.drawBottomHourLabels(
      svg,
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
          chart,
          cloudCover,
          N,
          x,
          legendPos.x,
          legendPos.y
        );
      } else {
        this._chartRenderer.drawCloudBand(chart, cloudCover, N, x);
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
          chart,
          rainConverted,
          rainMaxConverted,
          N,
          x,
          yPrecip,
          dx,
          legendPos.x,
          legendPos.y
        );
      } else {
        this._chartRenderer.drawRainBars(
          chart,
          rainConverted,
          rainMaxConverted,
          N,
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
          chart,
          pressure,
          x,
          yPressure,
          legendPos.x,
          legendPos.y
        );
      } else {
        this._chartRenderer.drawPressureLine(chart, pressure, x, yPressure);
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
        svg,
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
        chart,
        temperatureConverted,
        x,
        yTemp,
        legendPos.x,
        legendPos.y
      );
    } else {
      this._chartRenderer.drawTemperatureLine(
        chart,
        temperatureConverted,
        x,
        yTemp
      );
    }

    // Draw weather icons
    if (this.showWeatherIcons) {
      this._chartRenderer.drawWeatherIcons(
        chart,
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
    let mergedStylesRaw = { ...(this.styles || {}) };
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
    } (${successRate}%) since ${METEOGRAM_CARD_STARTUP_TIME.toISOString()}`;

    // Calculate aspect ratio style
    // let aspectRatioStyle = "aspect-ratio: 16/9;";
    // if (this.aspectRatio && this.aspectRatio.includes(":")) {
    //     const [w, h] = this.aspectRatio.split(":").map(Number);
    //     if (w > 0 && h > 0) aspectRatioStyle = `aspect-ratio: ${w}/${h};`;
    // } else if (this.aspectRatio && !isNaN(Number(this.aspectRatio))) {
    //     aspectRatioStyle = `aspect-ratio: ${Number(this.aspectRatio)}/1;`;
    // }
    // Instead, always use width:100%;height:100% for the chart container
    const chartContainerStyle = "width:100%;height:100%;";

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
              : html`<div style="${chartContainerStyle}">
                  <div id="chart" style="width:100%;height:100%"></div>
                </div>`}
          </div>
        </ha-card>
      `;
    }
    // Only show attribution if available (Met.no or entity)
    const showAttribution =
      (this.entityId && this.entityId !== "none" && this.entityAttribution) ||
      !(this.entityId && this.entityId !== "none");
    // Attribution icon color logic
    let attributionColor = "#1976d2"; // default blue
    let statusSymbol = "ℹ️";
    if (this._lastApiSuccess) {
      attributionColor = "#388e3c"; // green
    } else if (this._statusApiSuccess === null) {
      attributionColor = "#fbc02d"; // orange
    } else if (this._statusApiSuccess === false) {
      attributionColor = "#b71c1c"; // red
      statusSymbol = "⚠️"; // Alert icon when there's an error
    }
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
                        ? `<div style='margin-top:8px;color:#b71c1c;font-size:0.97em;'><b>Missing data:</b> ${this._missingForecastKeys.join(
                            ", "
                          )}
                    <br>Some supported features cannot be plotted because the required data is not provided.</div>`
                        : ""
                    }
                    ${this.generateDiagnosticInfo().tooltip}
                    <div style='margin-top:8px;color:#1976d2;font-size:0.97em;'><b>Hours available in data source:</b> <b>${this.getAvailableHours()}</b></div>
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
                        ? `<div style='margin-top:8px;color:#b71c1c;font-size:0.97em;'><b>Missing data:</b> ${this._missingForecastKeys.join(
                            ", "
                          )}</div>`
                        : ""
                    }
                    ${this.generateDiagnosticInfo().tooltip}
                    <div style='margin-top:8px;color:#1976d2;font-size:0.97em;'><b>Hours available in data source:</b> <b>${this.getAvailableHours()}</b></div>
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
                    aria-label="Show attribution"
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
                <div style="${chartContainerStyle}">
                  <div id="chart" style="width:100%;height:100%"></div>
                </div>
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
