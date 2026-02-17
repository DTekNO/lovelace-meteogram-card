import { LitElement, html, css } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { MeteogramCardConfig, MeteogramCardEditorElement, ConfigurableHTMLElement } from "./types";
import { trnslt } from "./translations";
import { DIAGNOSTICS_DEFAULT } from "./constants";
import { version } from "../package.json";


@customElement('meteogram-card-editor')
export class MeteogramCardEditor extends LitElement implements MeteogramCardEditorElement {
    @property({ type: Object }) _config: MeteogramCardConfig = {};
    @property({ type: Object }) hass: any;
    @state() private _initialized = false;
    private _elements: Map<string, ConfigurableHTMLElement> = new Map();




  setConfig(config: MeteogramCardConfig): void {
    this._config = config || {};
    if (this._initialized) {
      this._updateValues();
    } else {
      this._initialize();
    }
    // Only emit minimal config if this is the initial setup (empty config)
    if (Object.keys(this._config).length === 0 || Object.keys(config).length === 0) {
      this._emitMinimalConfig();
    } else {
      // For subsequent loads/edits, emit the full config as-is
      this.dispatchEvent(new CustomEvent('config-changed', {
        detail: { config: { ...this._config } }
      }));
    }
  }

  private _emitMinimalConfig() {
    const defaultConfig = {
      title: '',
      latitude: undefined,
      longitude: undefined,
      altitude: undefined,
      show_cloud_cover: true,
      show_pressure: true,
      show_precipitation: true, // treat true as default for minimalization
      show_weather_icons: true,
      show_wind: true,
      dense_weather_icons: true,
      meteogram_hours: '48h',
      styles: undefined,
      diagnostics: false,
      entity_id: undefined,
      focussed: false,
      display_mode: 'full',
      aspect_ratio: '16:9',
      layout_mode: 'sections',
    };
    const minimalConfig: any = {};
    Object.keys(this._config).forEach((key) => {
      const value = (this._config as any)[key];
      const def = (defaultConfig as any)[key];
      if (typeof def === 'undefined') {
        if (typeof value !== 'undefined') minimalConfig[key] = value;
      } else if (value !== def) {
        minimalConfig[key] = value;
      }
    });
    this.dispatchEvent(new CustomEvent('config-changed', {
      detail: { config: minimalConfig }
    }));
  }

    get config() {
        return this._config;
    }

    connectedCallback() {
        if (!this._initialized) {
            this._initialize();
        }
    }

    private _initialize() {
        this.render();
        this._initialized = true;
        setTimeout(() => this._updateValues(), 0); // Wait for DOM to be ready
    }

    // Update only the values, not the entire DOM
    private _updateValues() {
        if (!this._initialized) return;

        // Helper to update only if value changed
        const setValue = (el: ConfigurableHTMLElement | undefined, value: any, prop: 'value' | 'checked' = 'value') => {
            if (!el) return;
            if (el[prop] !== value) el[prop] = value;
        };

        setValue(this._elements.get('title'), this._config.title || '');
        setValue(this._elements.get('latitude'), this._config.latitude !== undefined
            ? String(this._config.latitude)
            : (this.hass?.config?.latitude !== undefined ? String(this.hass.config.latitude) : ''));
        setValue(this._elements.get('longitude'), this._config.longitude !== undefined
            ? String(this._config.longitude)
            : (this.hass?.config?.longitude !== undefined ? String(this.hass.config.longitude) : ''));
        setValue(this._elements.get('altitude'), this._config.altitude !== undefined
            ? String(this._config.altitude)
            : (this.hass?.config?.altitude !== undefined ? String(this.hass.config.altitude) : ''), 'value');

        setValue(this._elements.get('show_cloud_cover'), this._config.show_cloud_cover !== undefined ? this._config.show_cloud_cover : true, 'checked');
        setValue(this._elements.get('show_pressure'), this._config.show_pressure !== undefined ? this._config.show_pressure : true, 'checked');
  setValue(this._elements.get('show_precipitation'), this._config.show_precipitation !== undefined ? this._config.show_precipitation : true, 'checked');
        setValue(this._elements.get('show_weather_icons'), this._config.show_weather_icons !== undefined ? this._config.show_weather_icons : true, 'checked');
        setValue(this._elements.get('show_wind'), this._config.show_wind !== undefined ? this._config.show_wind : true, 'checked');
        setValue(this._elements.get('dense_weather_icons'), this._config.dense_weather_icons !== undefined ? this._config.dense_weather_icons : true, 'checked');
        setValue(this._elements.get('meteogram_hours'), this._config.meteogram_hours || '48h');
        setValue(this._elements.get('diagnostics'), this._config.diagnostics !== undefined ? this._config.diagnostics : false, 'checked');
        setValue(this._elements.get('entity_id'), this._config.entity_id || '');
        setValue(this._elements.get('focussed'), this._config.focussed !== undefined ? this._config.focussed : false, 'checked');
        setValue(this._elements.get('display_mode'), this._config.display_mode || 'full');
        setValue(this._elements.get('aspect_ratio'), this._config.aspect_ratio || '16:9');
    }

    render() {
        const hass = this.hass;
        const config = this._config;

        // Wait for both hass and config to be set before rendering
        if (!hass || !config) {
            this.innerHTML = '<ha-card><div style="padding:16px;">Loading Home Assistant context...</div></ha-card>';
            setTimeout(() => this.render(), 300); // Retry every 300ms until both are set
            return;
        }

        // Get default coordinates from Home Assistant config if available
        const defaultLat = hass?.config?.latitude ?? '';
        const defaultLon = hass?.config?.longitude ?? '';
        const defaultAlt = hass?.config?.altitude ?? '';

        // Get current toggle values or default to true
        const showCloudCover = this._config.show_cloud_cover !== undefined ? this._config.show_cloud_cover : true;
        const showPressure = this._config.show_pressure !== undefined ? this._config.show_pressure : true;
        const showWeatherIcons = this._config.show_weather_icons !== undefined ? this._config.show_weather_icons : true;
        const showWind = this._config.show_wind !== undefined ? this._config.show_wind : true;
        const denseWeatherIcons = this._config.dense_weather_icons !== undefined ? this._config.dense_weather_icons : true;
        const meteogramHours = this._config.meteogram_hours || "48h";
        const diagnostics = this._config.diagnostics !== undefined ? this._config.diagnostics : false;
        const focussed = this._config.focussed !== undefined ? this._config.focussed : false;
        const displayMode = this._config.display_mode || 'full';
        const aspectRatio = this._config.aspect_ratio || "16:9";
        const div = document.createElement('div');
        const layoutMode = this._config.layout_mode || "sections";

        // Get all weather entities from hass
        const weatherEntities: string[] = hass && hass.states
            ? Object.keys(hass.states).filter(eid => eid.startsWith('weather.'))
            : [];
        // Add "none" option at the top
        // If entity_id is not set, default to 'none' (not first weather entity)
        const selectedEntity = this._config.entity_id ?? 'none';
        const isWeatherEntitySelected = !!(selectedEntity && selectedEntity !== 'none');

        div.innerHTML = `
  <style>
    ha-card {
      padding: 16px;
    }
    .values {
      padding-left: 16px;
      margin: 8px 0;
    }
    .row {
      display: flex;
      margin-bottom: 12px;
      align-items: center;
    }
    ha-textfield {
      width: 100%;
    }
    .side-by-side {
      display: flex;
      gap: 12px;
    }
    .side-by-side > * {
      flex: 1;
    }
    h3 {
      font-size: 18px;
      color: var(--primary-text-color);
      font-weight: 500;
      margin-bottom: 12px;
      margin-top: 0;
    }
    .help-text {
      color: var(--secondary-text-color);
      font-size: 0.875rem;
      margin-top: 4px;
    }
    .info-text {
      color: var(--primary-text-color);
      opacity: 0.8;
      font-size: 0.9rem;
      font-style: italic;
      margin: 4px 0 16px 0;
    }
    .toggle-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 8px;
    }
    .toggle-label {
      flex-grow: 1;
    }
    .toggle-section {
      margin-top: 16px;
      border-top: 1px solid var(--divider-color);
      padding-top: 16px;
    }
  </style>
  <ha-card>
    <h3>${hass?.localize ? hass.localize("ui.editor.meteogram.title") : "Meteogram Card Settings"}</h3>
    <div class="values">
      <div class="row">
        <ha-textfield
          label="${hass?.localize ? hass.localize("ui.editor.meteogram.title_label") : "Title"}"
          id="title-input"
          .value="${this._config.title || ''}"
        ></ha-textfield>
      </div>
      <p class="help-text">${trnslt(hass, "ui.editor.meteogram.title_description", "Card title (optional, shown at the top of the card)")}</p>

      <div class="row">
        <label for="weather-entity-select" style="margin-right:8px;">${trnslt(hass, "ui.editor.meteogram.weather_entity", "Weather Entity")}</label>
        <select id="weather-entity-select">
          <option value="none" ${!isWeatherEntitySelected ? "selected" : ""}>None</option>
          ${weatherEntities.map(eid =>
            `<option value="${eid}" ${selectedEntity === eid ? "selected" : ""}>${eid}</option>`
          ).join('')}
        </select>
      </div>
      <p class="help-text">${trnslt(hass, "ui.editor.meteogram.choose_weather_entity", "Choose a weather entity for Home Assistant integration, or select 'None' to use coordinates.")}</p>

      <div class="info-text">
        ${hass?.localize ? hass.localize("ui.editor.meteogram.location_info") : "Location coordinates will be used to fetch weather data directly from Met.no API."}
        ${defaultLat ? trnslt(hass, "ui.editor.meteogram.using_ha_location", "Using Home Assistant's location by default.") : ""}
      </div>

      <div class="side-by-side">
        <ha-textfield
          label="${trnslt(hass, "ui.editor.meteogram.latitude", "Latitude")}"
          id="latitude-input"
          type="number"
          step="any"
          .value="${this._config.latitude !== undefined ? this._config.latitude : defaultLat}"
          placeholder="${defaultLat ? `${trnslt(hass, "ui.editor.meteogram.default", "Default")}: ${defaultLat}` : ""}"
          ${isWeatherEntitySelected ? "disabled" : ""}
        ></ha-textfield>

        <ha-textfield
          label="${trnslt(hass, "ui.editor.meteogram.longitude", "Longitude")}"
          id="longitude-input"
          type="number"
          step="any"
          .value="${this._config.longitude !== undefined ? this._config.longitude : defaultLon}"
          placeholder="${defaultLon ? `${trnslt(hass, "ui.editor.meteogram.default", "Default")}: ${defaultLon}` : ""}"
          ${isWeatherEntitySelected ? "disabled" : ""}
        ></ha-textfield>

        <ha-textfield
          label="${trnslt(hass, "ui.editor.meteogram.altitude", "Altitude")}"
          id="altitude-input"
          type="number"
          step="any"
          .value="${this._config.altitude !== undefined ? this._config.altitude : defaultAlt}"
          placeholder="${defaultAlt ? `${trnslt(hass, "ui.editor.meteogram.default", "Default")}: ${defaultAlt}` : trnslt(hass, "ui.editor.meteogram.optional", "Optional")}" 
          ${isWeatherEntitySelected ? "disabled" : ""}
        ></ha-textfield>
      </div>
      <p class="help-text">${trnslt(hass, "ui.editor.meteogram.leave_empty", "Leave empty to use Home Assistant's configured location")}</p>

      <div class="toggle-section">
        <h3>${trnslt(hass, "ui.editor.meteogram.display_options", "Display Options")}</h3>

        <div class="toggle-row">
          <div class="toggle-label">${trnslt(hass, "ui.editor.meteogram.attributes.cloud_coverage", "Show Cloud Cover")}</div>
          <ha-switch
            id="show-cloud-cover"
            .checked="${showCloudCover}"
          ></ha-switch>
        </div>

        <div class="toggle-row">
          <div class="toggle-label">${trnslt(hass, "ui.editor.meteogram.attributes.air_pressure", "Show Pressure")}</div>
          <ha-switch
            id="show-pressure"
            .checked="${showPressure}"
          ></ha-switch>
        </div>

        <div class="toggle-row">
          <div class="toggle-label">${trnslt(hass, "ui.editor.meteogram.attributes.precipitation", "Show Precipitation (Rain & Snow)")}</div>
          <ha-switch
            id="show-precipitation"
            .checked="${this._config.show_precipitation !== undefined ? this._config.show_precipitation : true}"
          ></ha-switch>
        </div>

        <div class="toggle-row">
          <div class="toggle-label">${trnslt(hass, "ui.editor.meteogram.attributes.weather_icons", "Show Weather Icons")}</div>
          <ha-switch
            id="show-weather-icons"
            .checked="${showWeatherIcons}"
          ></ha-switch>
        </div>

        <div class="toggle-row">
          <div class="toggle-label">${trnslt(hass, "ui.editor.meteogram.attributes.wind", "Show Wind")}</div>
          <ha-switch
            id="show-wind"
            .checked="${showWind}"
          ></ha-switch>
        </div>

        <div class="toggle-row">
          <div class="toggle-label">${trnslt(hass, "ui.editor.meteogram.attributes.dense_icons", "Dense Weather Icons (every hour)")}</div>
          <ha-switch
            id="dense-weather-icons"
            .checked="${denseWeatherIcons}"
          ></ha-switch>
        </div>
      
        <div class="toggle-row">
          <div class="toggle-label">${trnslt(hass, "ui.editor.meteogram.display_mode", "Display Mode")}</div>
          <select id="display-mode-select">
            <option value="full" ${displayMode === "full" ? "selected" : ""}>Full (all features)</option>
            <option value="core" ${displayMode === "core" ? "selected" : ""}>Core (dates & numbers only)</option>
            <option value="focussed" ${displayMode === "focussed" ? "selected" : ""}>Focussed (minimal)</option>
          </select>
        </div>
      </div>

      <div class="row">
        <label for="meteogram-hours-select" style="margin-right:8px;">${trnslt(hass, "ui.editor.meteogram.meteogram_length", "Meteogram Length")}</label>
        <select id="meteogram-hours-select">
          <option value="8h" ${meteogramHours === "8h" ? "selected" : ""}>${trnslt(hass, "ui.editor.meteogram.hours_8", "8 hours")}</option>
          <option value="12h" ${meteogramHours === "12h" ? "selected" : ""}>${trnslt(hass, "ui.editor.meteogram.hours_12", "12 hours")}</option>
          <option value="24h" ${meteogramHours === "24h" ? "selected" : ""}>${trnslt(hass, "ui.editor.meteogram.hours_24", "24 hours")}</option>
          <option value="48h" ${meteogramHours === "48h" ? "selected" : ""}>${trnslt(hass, "ui.editor.meteogram.hours_48", "48 hours")}</option>
          <option value="54h" ${meteogramHours === "54h" ? "selected" : ""}>${trnslt(hass, "ui.editor.meteogram.hours_54", "54 hours")}</option>
          <option value="max" ${meteogramHours === "max" ? "selected" : ""}>${trnslt(hass, "ui.editor.meteogram.hours_max", "Max available")}</option>
        </select>
      </div>
      <p class="help-text">${trnslt(hass, "ui.editor.meteogram.choose_hours", "Choose how many hours to show in the meteogram")}</p>

      ${["panel", "grid"].includes(layoutMode) ? `
      <div class="row">
        <label for="aspect-ratio-select" style="margin-right:8px;">Aspect Ratio</label>
        <select id="aspect-ratio-select">
          <option value="16:9" ${aspectRatio === "16:9" ? "selected" : ""}>16:9 (Widescreen)</option>
          <option value="4:3" ${aspectRatio === "4:3" ? "selected" : ""}>4:3 (Classic)</option>
          <option value="1:1" ${aspectRatio === "1:1" ? "selected" : ""}>1:1 (Square)</option>
          <option value="21:9" ${aspectRatio === "21:9" ? "selected" : ""}>21:9 (Ultra-wide)</option>
          <option value="3:2" ${aspectRatio === "3:2" ? "selected" : ""}>3:2</option>
          <option value="custom" ${!["16:9","4:3","1:1","21:9","3:2"].includes(aspectRatio) ? "selected" : ""}>Custom</option>
        </select>
        <input id="aspect-ratio-custom" type="text" placeholder="e.g. 1.6 or 5:3" style="margin-left:8px; width:90px;" value="${!["16:9","4:3","1:1","21:9","3:2"].includes(aspectRatio) ? aspectRatio : ''}" ${!["16:9","4:3","1:1","21:9","3:2"].includes(aspectRatio) ? '' : 'disabled'}>
      </div>
      <p class="help-text">Set the aspect ratio for the chart area. Use a ratio like 16:9, 4:3, 1:1, or a custom value (e.g. 1.6 or 5:3).</p>
      ` : ""}

      ${version.includes("beta") ? `
      <div class="toggle-section"></div>
        <div class="toggle-row">
          <div class="toggle-label">Diagnostics (debug logging)</div>
          <ha-switch
            id="diagnostics"
            .checked="${diagnostics}"
          ></ha-switch>
        </div>
      ` : ""}
      </div>
    </div>
  </ha-card>
`;

        // Clear previous content
        this.innerHTML = '';
        // Append new content
        this.appendChild(div);

        // Set up event listeners after DOM is updated
        setTimeout(() => {
            // Get and store references to all input elements with proper type casting
            const titleInput = this.querySelector('#title-input') as ConfigurableHTMLElement;
            if (titleInput) {
                titleInput.configValue = 'title';
                titleInput.addEventListener('input', this._valueChanged.bind(this));
                this._elements.set('title', titleInput);
            }

            const latInput = this.querySelector('#latitude-input') as ConfigurableHTMLElement;
            if (latInput) {
                latInput.configValue = 'latitude';
                latInput.addEventListener('input', this._valueChanged.bind(this));
                this._elements.set('latitude', latInput);
            }

            const lonInput = this.querySelector('#longitude-input') as ConfigurableHTMLElement;
            if (lonInput) {
                lonInput.configValue = 'longitude';
                lonInput.addEventListener('input', this._valueChanged.bind(this));
                this._elements.set('longitude', lonInput);
            }

            const altitudeInput = this.querySelector('#altitude-input') as ConfigurableHTMLElement;
            if (altitudeInput) {
                altitudeInput.configValue = 'altitude';
                altitudeInput.addEventListener('input', this._valueChanged.bind(this));
                this._elements.set('altitude', altitudeInput);
            }

            // Set up toggle switches
            const cloudCoverSwitch = this.querySelector('#show-cloud-cover') as ConfigurableHTMLElement;
            if (cloudCoverSwitch) {
                cloudCoverSwitch.configValue = 'show_cloud_cover';
                cloudCoverSwitch.addEventListener('change', this._valueChanged.bind(this));
                this._elements.set('show_cloud_cover', cloudCoverSwitch);
            }

            const pressureSwitch = this.querySelector('#show-pressure') as ConfigurableHTMLElement;
            if (pressureSwitch) {
                pressureSwitch.configValue = 'show_pressure';
                pressureSwitch.addEventListener('change', this._valueChanged.bind(this));
                this._elements.set('show_pressure', pressureSwitch);
            }

            const rainSwitch = this.querySelector('#show-precipitation') as ConfigurableHTMLElement;
            if (rainSwitch) {
                rainSwitch.configValue = 'show_precipitation';
                rainSwitch.addEventListener('change', this._valueChanged.bind(this));
                this._elements.set('show_precipitation', rainSwitch);
            }

            const weatherIconsSwitch = this.querySelector('#show-weather-icons') as ConfigurableHTMLElement;
            if (weatherIconsSwitch) {
                weatherIconsSwitch.configValue = 'show_weather_icons';
                weatherIconsSwitch.addEventListener('change', this._valueChanged.bind(this));
                this._elements.set('show_weather_icons', weatherIconsSwitch);
            }

            const windSwitch = this.querySelector('#show-wind') as ConfigurableHTMLElement;
            if (windSwitch) {
                windSwitch.configValue = 'show_wind';
                windSwitch.addEventListener('change', this._valueChanged.bind(this));
                this._elements.set('show_wind', windSwitch);
            }

            const denseWeatherIconsSwitch = this.querySelector('#dense-weather-icons') as ConfigurableHTMLElement;
            if (denseWeatherIconsSwitch) {
                denseWeatherIconsSwitch.configValue = 'dense_weather_icons';
                denseWeatherIconsSwitch.addEventListener('change', this._valueChanged.bind(this));
                this._elements.set('dense_weather_icons', denseWeatherIconsSwitch);
            }

            const meteogramHoursSelect = this.querySelector('#meteogram-hours-select') as ConfigurableHTMLElement;
            if (meteogramHoursSelect) {
                meteogramHoursSelect.configValue = 'meteogram_hours';
                meteogramHoursSelect.addEventListener('change', this._valueChanged.bind(this));
                this._elements.set('meteogram_hours', meteogramHoursSelect);
            }

            const diagnosticsSwitch = this.querySelector('#diagnostics') as ConfigurableHTMLElement;
            if (diagnosticsSwitch) {
                diagnosticsSwitch.configValue = 'diagnostics';
                diagnosticsSwitch.addEventListener('change', this._valueChanged.bind(this));
                this._elements.set('diagnostics', diagnosticsSwitch);
            }

            const weatherEntitySelect = this.querySelector('#weather-entity-select') as ConfigurableHTMLElement;
            if (weatherEntitySelect) {
                weatherEntitySelect.configValue = 'entity_id';
                weatherEntitySelect.addEventListener('change', this._valueChanged.bind(this));
                this._elements.set('entity_id', weatherEntitySelect);
            }

            const displayModeSelect = this.querySelector('#display-mode-select') as ConfigurableHTMLElement;
            if (displayModeSelect) {
                displayModeSelect.configValue = 'display_mode';
                displayModeSelect.addEventListener('change', this._valueChanged.bind(this));
                this._elements.set('display_mode', displayModeSelect);
            }

            const aspectRatioSelect = this.querySelector('#aspect-ratio-select') as ConfigurableHTMLElement;
            const aspectRatioCustom = this.querySelector('#aspect-ratio-custom') as ConfigurableHTMLElement;
            if (aspectRatioSelect) {
                aspectRatioSelect.configValue = 'aspect_ratio';
                aspectRatioSelect.addEventListener('change', () => {
                    if (aspectRatioSelect.value === 'custom') {
                        aspectRatioCustom.disabled = false;
                        aspectRatioCustom.focus();
                    } else {
                        aspectRatioCustom.disabled = true;
                        this._config = { ...this._config, aspect_ratio: String(aspectRatioSelect.value) };
                        this.dispatchEvent(new CustomEvent('config-changed', { detail: { config: this._config } }));
                    }
                });
                this._elements.set('aspect_ratio', aspectRatioSelect);
            }
            if (aspectRatioCustom) {
                aspectRatioCustom.configValue = 'aspect_ratio';
                aspectRatioCustom.addEventListener('input', () => {
                    if (aspectRatioSelect.value === 'custom') {
                        this._config = { ...this._config, aspect_ratio: String(aspectRatioCustom.value) };
                        this.dispatchEvent(new CustomEvent('config-changed', { detail: { config: this._config } }));
                    }
                });
                this._elements.set('aspect_ratio_custom', aspectRatioCustom);
            }
            // Disable/enable lat/lon/altitude fields based on weather entity selection
            if (latInput) latInput.disabled = isWeatherEntitySelected;
            if (lonInput) lonInput.disabled = isWeatherEntitySelected;
            if (altitudeInput) altitudeInput.disabled = isWeatherEntitySelected;

            // Update values after setting up elements and listeners
            this._updateValues();
        }, 0);
    }

    // Add the missing _valueChanged method

  private _valueChanged(ev: Event) {
    const target = ev.target as ConfigurableHTMLElement;
    if (!this._config || !target || !target.configValue) return;

    let newValue: string | number | boolean | undefined = target.value;

    // List of boolean config fields
    const boolFields = [
  'show_cloud_cover', 'show_pressure', 'show_precipitation', 'show_weather_icons',
      'show_wind', 'dense_weather_icons', 'diagnostics', 'focussed'
    ];

    // Handle different input types
    if (target.tagName === 'HA-SWITCH') {
      newValue = target.checked;
    } else if ((target as HTMLInputElement).type === 'number') {
      if (newValue === '') {
        newValue = undefined;
      } else {
        const numValue = parseFloat(newValue?.toString() ?? '');
        if (!isNaN(numValue)) {
          newValue = numValue;
        }
      }
    } else if (newValue === '') {
      newValue = undefined;
    }

    if (boolFields.includes(target.configValue)) {
      if (newValue === "") {
        newValue = undefined;
      } else if (typeof newValue !== "boolean" && typeof newValue !== "undefined") {
        newValue = Boolean(newValue);
      }
    }

    // Special handling for weather entity selection
    if (target.configValue === 'entity_id') {
      if (newValue === 'none') {
        newValue = undefined;
      }
      setTimeout(() => {
        const latInput = this.querySelector('#latitude-input') as ConfigurableHTMLElement;
        const lonInput = this.querySelector('#longitude-input') as ConfigurableHTMLElement;
        const altitudeInput = this.querySelector('#altitude-input') as ConfigurableHTMLElement;
        const isWeatherEntitySelected = !!(newValue && newValue !== 'none');
        if (latInput) latInput.disabled = isWeatherEntitySelected;
        if (lonInput) lonInput.disabled = isWeatherEntitySelected;
        if (altitudeInput) altitudeInput.disabled = isWeatherEntitySelected;
      }, 0);
    }

    // In _valueChanged, handle displayMode as a string
    if (target.configValue === 'display_mode') {
      const allowedModes = ['full', 'core', 'focussed'] as const;
      const modeValue = allowedModes.includes(target.value as any) ? target.value as typeof allowedModes[number] : undefined;
      this._config = {
        ...this._config,
        display_mode: modeValue
      };
    } else {
      let configValue: boolean | string | number | undefined;
      if (boolFields.includes(target.configValue)) {
        if (typeof newValue === "undefined") {
          configValue = undefined;
        } else {
          configValue = Boolean(newValue);
        }
      } else {
        configValue = newValue;
      }

      if (target.configValue === 'show_precipitation') {
        // Only set show_precipitation if user has toggled it away from the default (true)
        if (configValue === false) {
          this._config = {
            ...this._config,
            show_precipitation: false
          };
        } else {
          // Remove show_precipitation if true (default)
          const { show_precipitation, ...rest } = this._config;
          this._config = { ...rest };
        }
      } else {
        this._config = {
          ...this._config,
          [target.configValue]: configValue
        };
      }
    }

    // After initial setup, always emit the full config (all user-set options)
    this.dispatchEvent(new CustomEvent('config-changed', {
      detail: { config: { ...this._config } }
    }));
  }

    // Ensure _updateConfig method exists and handles generic property updates:
    private _updateConfig(property: keyof MeteogramCardConfig, value: any) {
        this._config = { ...this._config, [property]: value };
        this.dispatchEvent(new CustomEvent('config-changed', { detail: { config: this._config } }));
    }
}
