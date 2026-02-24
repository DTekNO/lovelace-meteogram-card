// Define the configuration interface for the card
export interface MeteogramCardConfig {
    title?: string;
    latitude?: number;
    longitude?: number;
    altitude?: number; // Add altitude option
    show_cloud_cover?: boolean;
    show_pressure?: boolean;
    show_rain?: boolean;
    show_precipitation?: boolean; // NEW: Show precipitation (rain & snow)
    show_weather_icons?: boolean;
    show_wind?: boolean;
    dense_weather_icons?: boolean; // Add this line
    meteogram_hours?: string | number; // "8h", "12h", "24h", "48h", "54h", "max" | numeric (e.g., 120)
    styles?: MeteogramStyleConfig; // <-- Updated for mode support
    diagnostics?: boolean; // Add this line
    debug?: boolean; // Add this line for debug logging (undocumented)
    entity_id?: string; // Add this line for weather entity selection
    focussed?: boolean; // Add this line for Focussed mode
    display_mode?: "full" | "core" | "focussed"; // Add this line for display mode
    aspect_ratio?: string; // Add this line for aspect ratio support
    layout_mode?: "sections" | "panel" | "grid"; // Add this line for layout mode support
}

export interface MeteogramData {
  time: Date[];
  temperature: (number | null)[];
  rain: (number | null)[];
  rainMin: (number | null)[]; // Add min precipitation array
  rainMax: (number | null)[]; // Add max precipitation array
  cloudCover: (number | null)[];
  windSpeed: (number | null)[];
  windDirection: (number | null)[];
  windGust: (number | null)[];
  symbolCode: string[];
  pressure: (number | null)[];
  fetchTimestamp?: string; // Add this property
}

export interface WeatherDataPoint {
  time: string;
  data: {
    instant: {
      details: {
        air_temperature?: number;
        cloud_area_fraction?: number;
        wind_speed?: number;
        wind_from_direction?: number;
        air_pressure_at_sea_level?: number;
      }
    };
    next_1_hours?: {
      details?: {
        precipitation_amount?: number;
        precipitation_amount_min?: number; // Add min precipitation
        precipitation_amount_max?: number; // Add max precipitation
      };
      summary?: {
        symbol_code?: string;
      };
    };
    next_6_hours?: {
      details?: {
        precipitation_amount?: number;
      };
      summary?: {
        symbol_code?: string;
      };
    };
  };
}

// For day boundary shading
export interface DayRange {
  start: number;
  end: number;
}

// Define a custom type for inputs that need configValue property
export interface ConfigurableHTMLElement extends HTMLElement {
  configValue?: string;
  value?: string | number;
  checked?: boolean; // Add the checked property for switches
  disabled?: boolean; // Add the disabled property for textfields/selects
}

// // Define editor interface with required methods
export interface MeteogramCardEditorElement extends HTMLElement {
  setConfig(config: MeteogramCardConfig): void;
  hass?: any;
  config?: MeteogramCardConfig;
}

// Extend styles to support modes (e.g., dark)
export type MeteogramStyleModes = {
  dark?: Record<string, string>;
  [mode: string]: Record<string, string> | undefined;
};

export type MeteogramStyleConfig = Record<string, string> & {
  modes?: MeteogramStyleModes;
};

// Extend the Window interface to include mapHaConditionToMetnoSymbol
declare global {
  interface Window {
    mapHaConditionToMetnoSymbol?: (symbol: string, forecastTime: Date, isDay: boolean) => string;
  }
}
