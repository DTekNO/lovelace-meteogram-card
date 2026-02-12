import { CARD_NAME } from "./constants";
import { version } from "../package.json";
import "./meteogram-card-editor";
import { MeteogramCard } from "./meteogram-card-class";
// import './troubleshoot-message-card';

// Add TypeScript declarations for window extensions
declare global {
  interface Window {
    litElementModules: any;
    customCards?: Array<{ type: string; name: string; description: string }>;
    d3: any; // Add d3 to the Window interface
  }

  // Fix the d3 namespace declaration to remove the BaseType reference
  namespace d3 {
    // Simple interface that avoids referencing non-existent types
    interface Selection {
      node(): Element | null;

      selectAll(selector: string): any;

      remove(): void;
    }
  }
}

// Print version info - based on mushroom cards implementation
const printVersionInfo = () => {
  // Use the blue color from wind barbs and add weather emojis
  console.info(
    `%c☀️ ${CARD_NAME} ${version} ⚡️🌦️`,
    "color: #1976d2; font-weight: bold; background: white"
  );
};

// Clean up expired cached forecasts on startup
const cleanupExpiredForecastCache = () => {
  try {
    // Remove old location keys if present
    localStorage.removeItem("meteogram-card-latitude");
    localStorage.removeItem("meteogram-card-longitude");

    const cacheStr = localStorage.getItem("metno-weather-cache");
    if (!cacheStr) return;
    const cacheObj = JSON.parse(cacheStr);
    let changed = false;
    const now = Date.now();

    // Remove any top-level keys except "default-location" and "forecast-data"
    for (const key of Object.keys(cacheObj)) {
      if (key !== "default-location" && key !== "forecast-data") {
        delete cacheObj[key];
        // Only log if debugging is enabled (check for special debug flag in localStorage)
        if (localStorage.getItem("meteogram-debug") === "true") {
          console.debug(`[${CARD_NAME}] Removed unused cache key: ${key}`);
        }
        changed = true;
      }
    }

    if (cacheObj["forecast-data"]) {
      // Remove expired keys and any not actively used
      for (const key in cacheObj["forecast-data"]) {
        const entry = cacheObj["forecast-data"][key];
        if (
          !entry ||
          typeof entry !== "object" ||
          !("expiresAt" in entry) ||
          !("data" in entry) ||
          (entry.expiresAt && now >= entry.expiresAt)
        ) {
          delete cacheObj["forecast-data"][key];
          changed = true;
        }
      }
    }
    if (changed) {
      // Only log if debugging is enabled (check for special debug flag in localStorage)
      if (localStorage.getItem("meteogram-debug") === "true") {
        console.debug(
          `[${CARD_NAME}] Cleaned up expired forecast cache. cacheObj:`,
          cacheObj
        );
      }
      localStorage.setItem("metno-weather-cache", JSON.stringify(cacheObj));
    }
  } catch (e) {
    // Ignore storage errors
  }
};

// Print version info on startup
printVersionInfo();

// Tell TypeScript that the class is being used
// @ts-ignore: Used by customElement decorator
window.customElements.get("meteogram-card") ||
  customElements.define("meteogram-card", MeteogramCard);

// Home Assistant requires this for custom cards
(window as any).customCards = (window as any).customCards || [];
(window as any).customCards.push({
  type: "meteogram-card",
  name: CARD_NAME,
  description: "A custom card showing a meteogram with wind barbs.",
  version: version,
  preview:
    "https://github.com/DTekNO/lovelace-meteogram-card/blob/main/images/meteogram-card.png",
  documentationURL:
    "https://github.com/DTekNO/lovelace-meteogram-card/blob/main/README.md",
});
