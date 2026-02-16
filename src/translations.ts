import enLocale from "./translations/en.json";
import nbLocale from "./translations/nb.json";
import esLocale from "./translations/es.json";
import itLocale from "./translations/it.json";
import deLocale from "./translations/de.json";
import frLocale from "./translations/fr.json";
import hrLocale from "./translations/hr.json";
import nlLocale from "./translations/nl.json";
import plLocale from "./translations/pl.json";

// Array of supported locales and their language codes
const locales: Array<{ code: string; data: Record<string, string> }> = [
    { code: "en", data: enLocale },
    { code: "nb", data: nbLocale },
    { code: "es", data: esLocale },
    { code: "it", data: itLocale },
    { code: "de", data: deLocale },
    { code: "fr", data: frLocale },
    { code: "hr", data: hrLocale },
    { code: "nl", data: nlLocale },
    { code: "pl", data: plLocale },
];

export function trnslt(hass: any, key: string, fallback?: string): string {
    // Try hass.localize (used by HA frontend)
    if (hass && typeof hass.localize === "function") {
        const result = hass.localize(key);
        if (result && result !== key) return result;
    }

    // Try hass.resources (used by HA backend)
    if (hass && hass.resources && typeof hass.resources === "object") {
        const lang = hass.language || "en";
        const res = hass.resources[lang]?.[key];
        if (res) return res;
    }
    // Try local translation files
    const lang = (hass && hass.language) ? hass.language : "en";
    // Find the best matching locale by prefix
    const localeObj =
        locales.find(l => lang.toLowerCase().startsWith(l.code)) ||
        locales[0]; // Default to English if not found

    const localRes = localeObj.data[key];

    if (localRes) return localRes;
    // Return fallback if provided, otherwise the key
    return fallback !== undefined ? fallback : key;
}
