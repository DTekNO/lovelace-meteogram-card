import {version} from "../package.json";


export interface ForecastData {
    pressure: (number | null)[];
    time: Date[];
    temperature: (number | null)[];
    rain: (number | null)[];
    rainMin: (number | null)[];
    rainMax: (number | null)[];
    cloudCover: (number | null)[];
    windSpeed: (number | null)[];
    windGust: (number | null)[];
    windDirection: (number | null)[];
    symbolCode: string[];
    fetchTimestamp?: string;
    units?: {
        temperature?: string;
        pressure?: string;
        windSpeed?: string;
        precipitation?: string;
        cloudCover?: string;
        [key: string]: string | undefined;
    };
}

/**
 * Escape a value for the error report.
 *
 * The report is handed to the card as `.innerHTML`, so anything interpolated into it
 * is markup until it is escaped. That is not theoretical: a 502 from met.no's CDN
 * returns a styled HTML error page, and pasting its body in unescaped renders the
 * page *inside the card*, pushing our own diagnostics off the bottom. Reported by
 * Jeremy 04.11.2026 after exactly that, on a client whose cache had been cleared so
 * there was no stale forecast to fall back on.
 */
export function escapeHtml(value: unknown): string {
    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;");
}

/**
 * Reduce a server error body to one readable line.
 *
 * Gateways answer with HTML, upstreams with JSON or plain text, and all of it is
 * noise next to the status code. Keep enough to recognise which hop failed —
 * "nginx", "cloudflare", a request id — and discard the rest.
 */
export function summariseBody(text: string, limit = 160): string {
    if (!text) return "";
    const flat = text
        .replace(/<\s*(script|style)\b[^>]*>[\s\S]*?<\s*\/\s*\1\s*>/gi, " ")
        .replace(/<[^>]*>/g, " ")
        .replace(/&nbsp;/gi, " ")
        .replace(/\s+/g, " ")
        .trim();
    if (!flat) return "";
    return flat.length > limit ? `${flat.slice(0, limit - 1).trimEnd()}…` : flat;
}

/** "41 min ago" / "3 h ago" — the form that answers "is this current?" at a glance. */
export function agoText(then: number, now: number = Date.now()): string {
    const mins = Math.round((now - then) / 60000);
    if (!Number.isFinite(mins)) return "";
    const back = mins >= 0;
    const n = Math.abs(mins);
    if (n < 1) return "just now";
    if (n < 120) return `${n} min ${back ? "ago" : "from now"}`;
    return `${Math.round(n / 60)} h ${back ? "ago" : "from now"}`;
}

export class WeatherAPI {
    static METEOGRAM_CARD_API_CALL_COUNT = 0;
    static METEOGRAM_CARD_API_SUCCESS_COUNT = 0;

    lastError: unknown = null;
    lastStatusCode: number | null = null;
    lat: number;
    lon: number;
    altitude?: number; // Optional altitude in meters
    private _forecastData: ForecastData | null = null;
    private _expiresAt: number | null = null;
    private _fetchPromise: Promise<void> | null = null;
    private _lastFetchTime: number | null = null; // Track last fetch timestamp
    /**
     * Set when met.no answers 429, and deliberately not cleared by the failure path.
     *
     * `_lastFetchTime` is reset on any fetch failure so a dropped connection can be
     * retried promptly. A 429 is the opposite situation — the server is asking for less
     * traffic — so the back-off it asks for is kept separately, where that reset cannot
     * reach it.
     */
    private _throttledUntil = 0;
    private debug: boolean;

    constructor(lat: number, lon: number, altitude?: number, debug: boolean = false) {
        this.lat = lat;
        this.lon = lon;
        this.debug = debug;
        if (Number.isFinite(altitude)) {
            this.altitude = altitude;
        }
    }

    private _debugLog(...args: any[]) {
        if (this.debug) {
            console.debug(...args);
        }
    }

    // Getter for forecastData: checks expiry and refreshes if needed
    async getForecastData(): Promise<ForecastData | null> {
        this._debugLog(`[weather-api] getForecastData called for lat=${this.lat}, lon=${this.lon}`);

        // If no data loaded, try to load from cache first
        if (!this._forecastData) {
            this.loadCacheFromStorage();
        }
        // If cache is valid, return it
        if (this._forecastData && this._expiresAt && Date.now() < this._expiresAt) {
            return this._forecastData;
        }
        // Serve what we have rather than knock on a door that has just been closed.
        if (Date.now() < this._throttledUntil) {
            this._debugLog(
                `[weather-api] backing off after 429 for `
                + `${Math.round((this._throttledUntil - Date.now()) / 1000)}s`
            );
            if (this._forecastData) return this._forecastData;
            throw new Error(
                `Weather API throttling: too many requests. Waiting until `
                + `${new Date(this._throttledUntil).toLocaleTimeString()} before retrying.`
            );
        }
        // Only one fetch at a time, and throttle to 1 per 60 seconds
        const now = Date.now();
        if (
            this._lastFetchTime &&
            now - this._lastFetchTime < 60000
        ) {
            // If there's an active fetch, wait for it
            if (this._fetchPromise) {
                await this._fetchPromise;
                return this._forecastData;
            }
            // If we're in throttle period but no active fetch, return cached data if available
            // This prevents the "retrying in 60 seconds" issue when fetch failed
            if (this._forecastData) {
                this._debugLog('[weather-api] Using expired cached data during throttle period');
                return this._forecastData;
            }
        }
        if (!this._fetchPromise) {
            this._fetchPromise = this._fetchWeatherDataFromAPI();
        }
        try {
            await this._fetchPromise;
        } finally {
            this._fetchPromise = null;
        }
        
        // Final safeguard: if we still don't have data, throw an error
        if (!this._forecastData) {
            throw new Error('Weather data fetch completed but no valid data was obtained');
        }
        
        return this._forecastData;
    }


    /**
     * How long this response stays valid, measured as a duration rather than a moment.
     *
     * The cache's whole protection is `Date.now() < this._expiresAt`, and storing the
     * Expires header's absolute time made that comparison depend on the client's clock
     * being right. It often is not. This card's usual home is a wall panel, and a
     * Raspberry Pi running a browser full-screen has no battery-backed clock: it boots at
     * whatever time it last knew and stays there until NTP catches up. A device an hour
     * fast fails the expiry check on every single draw and refetches every time — and
     * that is precisely the polling the cache exists to prevent, arriving through the one
     * fault nobody would look for.
     *
     * met.no sends `Date` with `Expires`, both from its own clock, so the difference
     * between them is a pure duration that no client clock can distort. Adding it to the
     * local `Date.now()` puts the deadline in the same frame of reference as the
     * comparison that will read it, whatever the frame happens to be.
     *
     * Bounded at both ends, because the header is not ours to trust: a value already
     * past would otherwise expire the entry the moment it was written, and an absurd one
     * would pin stale weather on screen for as long as it pleased. Both bounds sit
     * comfortably around the real cadence — six hours is generous against a model that
     * runs hourly, and a minute is the right answer to "the next run is already due",
     * which is what a response served at the very end of its window is saying.
     *
     * Neither does it need met.no's clock to be *right* — only self-consistent. Both
     * headers come from one response and one clock, so a server an hour out shifts both
     * together and the difference is unchanged.
     *
     * `Expires` here is not a cache hint but a publication time: it is when met.no
     * expects the next forecast to be ready. That is why it holds still while `Date`
     * moves — it names a scheduled event, not a rolling lifetime — and why the duration
     * is the right thing to store rather than a convenience. A moment on met.no's clock
     * cannot be expressed on a device whose clock is three hours out; the wait until it
     * can.
     *
     * And no, `Age` must not be subtracted as well, which looks like an omission until
     * you measure it. met.no's edge rewrites `Date` per response while `Expires` stays
     * fixed, so the difference already shrinks by exactly the age. Three responses two
     * seconds apart on 2026-08-25: date 13:50:37/:39/:41 against a constant expires of
     * 14:21:05, giving 30m28s, 30m26s, 30m24s. It is the remaining lifetime, not the
     * original one. Taking `Age` off as well would discount it twice, and a response
     * served late in its window — which is exactly the case that prompted this — would
     * be treated as already dead.
     *
     * What this cannot fix is a clock that moves *after* a deadline is stored — a written
     * entry is an absolute local time and always will be. A correction forward simply
     * expires it early and costs one fetch; a correction backward leaves it valid longer
     * than intended, bounded by the six-hour ceiling.
     */
    private static readonly MIN_VALIDITY_MS = 60 * 1000;
    private static readonly MAX_VALIDITY_MS = 6 * 60 * 60 * 1000;
    private static readonly DEFAULT_VALIDITY_MS = 30 * 60 * 1000;

    private static _expiryFrom(expires: Date | null, servedHeader: string | null): number {
        const served = servedHeader ? new Date(servedHeader) : null;
        const servedMs = served && !isNaN(served.getTime()) ? served.getTime() : null;
        // Expires minus the served stamp: both met.no's clock, so their difference is a
        // duration ours cannot distort. This is the *full* window the forecast was
        // published for, and it is the fallback rather than the answer.
        const measured = expires && servedMs !== null
            ? expires.getTime() - servedMs
            : null;

        // The full window is not what remains of it. Last-Modified is when the origin
        // generated the forecast, and the response may have sat in met.no's Varnish
        // first — observed at Age 351, nearly six minutes of a thirty-one minute window
        // already spent before it reached us. Age would say so exactly and is not
        // CORS-safelisted, so it cannot be read either.
        //
        // What can be read is our own clock, and the stamp makes it self-checking.
        // `now - servedMs` should be roughly the Age: a small positive number, certainly
        // no larger than the window itself. When it is, our clock agrees with met.no's
        // closely enough to subtract against, and `Expires - now` is the honest remaining
        // validity. When it is negative or larger than the whole window, our clock is the
        // thing in doubt — which is the case this design was built for, a wall-panel Pi
        // with no battery-backed clock booting hours out — and the measured window stands
        // instead. That errs long, which means fetching less often, which is the side to
        // be wrong on when the risk being managed is a ban.
        const skew = servedMs !== null ? Date.now() - servedMs : null;
        const clockAgrees = measured !== null && skew !== null
            && skew >= 0 && skew <= measured;

        const raw = clockAgrees && expires
            ? expires.getTime() - Date.now()
            : measured !== null
                ? measured
                : WeatherAPI.DEFAULT_VALIDITY_MS;
        const ttl = Math.min(
            WeatherAPI.MAX_VALIDITY_MS,
            Math.max(WeatherAPI.MIN_VALIDITY_MS,
                     Number.isFinite(raw) ? raw : WeatherAPI.DEFAULT_VALIDITY_MS)
        );
        return Date.now() + ttl;
    }

    get expiresAt(): number | null {
        return this._expiresAt;
    }

    /**
     * Which hop failed, in one line, for someone reading the card rather than a console.
     *
     * The status code alone does not tell a user whether to wait, reload or file a bug.
     * These four do: a 5xx is met.no's problem and self-healing, a 429 is ours and
     * timed, a 403 is the terms of service, and no response at all is the network in
     * between.
     */
    private _hintFor(status: number | null): string {
        if (status === null) return "No HTTP response — the request never completed. Network, proxy or content blocker.";
        if (status === 429) return "met.no is asking for less traffic. The card is backing off and will retry by itself.";
        if (status === 403) return "met.no refused the request outright — normally the User-Agent or their terms of service.";
        if (status === 404) return "Endpoint or coordinates rejected. Check latitude and longitude.";
        if (status >= 500) return "met.no or its CDN failed, not the card. Usually transient; the next refresh should recover.";
        return "";
    }

    /**
     * The error report the card renders.
     *
     * Written to be read on a phone, by someone who wants to know whether the card is
     * broken or the weather service is. So: what failed, what it means, and how stale
     * what is on screen now has become — because when the fallback is showing an old
     * forecast, "how old" is the only question that matters.
     *
     * Everything interpolated is escaped. See escapeHtml.
     */
    getDiagnosticText(): string {
        const status = this.lastStatusCode;
        const lines: string[] = [`<b>Weather API error</b>`];

        lines.push(`Status: <code>${escapeHtml(status ?? "no response")}</code>`);

        const raw = this.lastError instanceof Error ? this.lastError.message
            : this.lastError != null ? String(this.lastError) : "";
        const msg = summariseBody(raw, 300);
        if (msg) lines.push(`Message: <code>${escapeHtml(msg)}</code>`);

        const hint = this._hintFor(status);
        if (hint) lines.push(hint);

        const stamp = this._forecastData?.fetchTimestamp;
        if (stamp) {
            const t = new Date(stamp).getTime();
            lines.push(Number.isFinite(t)
                ? `Last good forecast: <code>${escapeHtml(new Date(t).toLocaleString())}</code> (${escapeHtml(agoText(t))})`
                : `Last good forecast: <code>${escapeHtml(stamp)}</code>`);
        } else {
            lines.push(`Last good forecast: <code>none held</code> — nothing to fall back on, which is why the chart is blank.`);
        }

        if (this._expiresAt) {
            const expired = Date.now() > this._expiresAt;
            const when = escapeHtml(new Date(this._expiresAt).toLocaleTimeString());
            lines.push(expired
                ? `Held forecast expired at <code>${when}</code> (${escapeHtml(agoText(this._expiresAt))}) and is being shown anyway.`
                : `Held forecast valid until <code>${when}</code>.`);
        }

        if (this._throttledUntil && Date.now() < this._throttledUntil) {
            lines.push(`Backing off until <code>${escapeHtml(new Date(this._throttledUntil).toLocaleTimeString())}</code>.`);
        }

        lines.push(`API calls this session: <code>${WeatherAPI.METEOGRAM_CARD_API_CALL_COUNT}</code>, `
            + `succeeded: <code>${WeatherAPI.METEOGRAM_CARD_API_SUCCESS_COUNT}</code>`);
        lines.push(`Card version: <code>${escapeHtml(version || "unknown")}</code>`);
        lines.push(`Client: <code>${escapeHtml(navigator.userAgent)}</code>`);

        return `<br>${lines.join("<br>")}<br>`;
    }

    getDiagnosticInfo(): any {
        return {
            apiType: 'MET.no Weather API',
            hasData: !!this._forecastData,
            dataTimeLength: this._forecastData?.time?.length || 0,
            lastFetchTime: this._lastFetchTime ? new Date(this._lastFetchTime).toISOString() : 'never',
            lastFetchFormatted: this._lastFetchTime ? new Date(this._lastFetchTime).toLocaleString() : 'not yet fetched',
            dataAgeMinutes: this._lastFetchTime ? Math.round((Date.now() - this._lastFetchTime) / (60 * 1000)) : 'n/a',
            expiresAt: this._expiresAt,
            expiresAtFormatted: this._expiresAt ? new Date(this._expiresAt).toLocaleString() : 'not set',
            isExpired: this._expiresAt ? Date.now() > this._expiresAt : false,
            location: {
                lat: this.lat,
                lon: this.lon,
                altitude: this.altitude
            }
        };
    }

    // Helper to encode cache key as base64 of str(lat)+str(lon)+str(altitude)
    private static encodeCacheKey(lat: number, lon: number, altitude?: number): string {
        let keyStr = String(lat) + "," + String(lon);
        if (typeof altitude === 'number' && !isNaN(altitude)) {
            keyStr += "," + String(altitude);
        }
        return btoa(keyStr);
    }

    // Clean up old cache entries (older than 24h) and validate data structures
    private static cleanupOldCacheEntries() {
        try {
            const cacheStr = localStorage.getItem('metno-weather-cache');
            if (!cacheStr) return;
            
            const cacheObj = JSON.parse(cacheStr);
            if (!cacheObj["forecast-data"]) return;
            
            const now = Date.now();
            const twentyFourHours = 24 * 60 * 60 * 1000;
            const requiredArrays = ['time', 'temperature', 'rain', 'rainMin', 'rainMax', 'cloudCover', 'windSpeed', 'windGust', 'windDirection', 'symbolCode', 'pressure'];
            let removedCount = 0;
            let invalidCount = 0;
            
            // Remove old entries and validate data structures
            for (const [key, entry] of Object.entries(cacheObj["forecast-data"])) {
                const entryData = entry as { expiresAt: number; data: ForecastData };
                let shouldRemove = false;
                
                // Remove entries older than 24h past expiry
                if (now - entryData.expiresAt > twentyFourHours) {
                    shouldRemove = true;
                    removedCount++;
                }
                // Validate data structure
                else if (!entryData.data || typeof entryData.data !== 'object') {
                    shouldRemove = true;
                    invalidCount++;
                }
                // Check for missing required arrays
                else {
                    const missingArrays = requiredArrays.filter(prop => !Array.isArray(entryData.data[prop as keyof ForecastData]));
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
                localStorage.setItem('metno-weather-cache', JSON.stringify(cacheObj));
                // Note: This is a static method so we can't use instance _debugLog
                if (console.debug) console.debug(`[WeatherAPI] Cleaned up ${removedCount} old and ${invalidCount} invalid cache entries from metno-weather-cache`);
            }
        } catch (e) {
            console.warn(`[WeatherAPI] Failed to cleanup cache entries, clearing entire cache:`, e);
            // Clear corrupted cache entirely
            try {
                localStorage.removeItem('metno-weather-cache');
                // Note: This is a static method so we can't use instance _debugLog
                if (console.debug) console.debug(`[WeatherAPI] Cleared corrupted metno-weather-cache`);
            } catch (clearError) {
                console.error(`[WeatherAPI] Failed to clear corrupted cache:`, clearError);
            }
        }
    }

    // Save forecast data to localStorage
    saveCacheToStorage() {
        if (!this._forecastData || !this._expiresAt) return;
        
        // Clean up old entries before saving new ones
        WeatherAPI.cleanupOldCacheEntries();
        
        const key = WeatherAPI.encodeCacheKey(Number(this.lat.toFixed(4)), Number(this.lon.toFixed(4)), this.altitude !== undefined ? Number(this.altitude.toFixed(2)) : undefined);
        let cacheObj: {
            ["forecast-data"]?: Record<string, {
                expiresAt: number,
                data: ForecastData
            }>
        } = {};
        const cacheStr = localStorage.getItem('metno-weather-cache');
        if (cacheStr) {
            try {
                cacheObj = JSON.parse(cacheStr);
            } catch {
                cacheObj = {};
            }
        }
        if (!cacheObj["forecast-data"]) cacheObj["forecast-data"] = {};
        cacheObj["forecast-data"][key] = {
            expiresAt: this._expiresAt,
            data: this._forecastData
        };
        // Storing is best-effort, and must never be reported as a fetch failure.
        //
        // setItem throws QuotaExceededError when the origin's storage is full, and a
        // ten-day forecast is a large object on an origin shared with everything else
        // Home Assistant keeps there. This call sits inside the fetch's try block, so the
        // throw used to be caught as if the *fetch* had failed — which clears
        // _lastFetchTime and so the 60-second throttle, while leaving nothing cached. The
        // next draw then fetched again, and again: a full disk turned into a polling
        // loop, which is the one behaviour the cache exists to prevent.
        //
        // Dropping the write instead is the right failure: the forecast is already in
        // memory and serves this session normally, and only the sharing with other tabs
        // is lost until room appears.
        try {
            localStorage.setItem('metno-weather-cache', JSON.stringify(cacheObj));
        } catch (e) {
            console.warn(
                `[WeatherAPI] Could not store the forecast (storage full?); `
                + `continuing with it in memory only:`, e
            );
            // One attempt to make room. Entries for other locations, and anything more
            // than a day past its expiry, are worth less than the forecast in hand.
            try {
                WeatherAPI.cleanupOldCacheEntries();
                localStorage.setItem('metno-weather-cache', JSON.stringify(cacheObj));
            } catch { /* still no room: in-memory only, which is not an error */ }
        }
    }

    // Load forecast data from localStorage
    loadCacheFromStorage() {
        const key = WeatherAPI.encodeCacheKey(Number(this.lat.toFixed(4)), Number(this.lon.toFixed(4)), this.altitude !== undefined ? Number(this.altitude.toFixed(2)) : undefined);
        let shouldCleanupCache = false;
        
        try {
            const cacheStr = localStorage.getItem('metno-weather-cache');
            if (cacheStr) {
                let cacheObj: {
                    ["forecast-data"]?: Record<string, {
                        expiresAt: number,
                        data: ForecastData
                    }>
                } = {};
                try {
                    cacheObj = JSON.parse(cacheStr);
                } catch {
                    console.warn(`[WeatherAPI] Corrupted cache JSON, clearing metno-weather-cache`);
                    localStorage.removeItem('metno-weather-cache');
                    this._expiresAt = null;
                    this._forecastData = null;
                    return;
                }
                
                const entry = cacheObj["forecast-data"]?.[key];
                if (entry && entry.expiresAt && entry.data) {
                    // Check if cache entry is expired (older than 24h past expiresAt)
                    const twentyFourHours = 24 * 60 * 60 * 1000;
                    const now = Date.now();
                    if (now - entry.expiresAt > twentyFourHours) {
                        this._debugLog(`[WeatherAPI] Cached data for ${key} is too old (${Math.round((now - entry.expiresAt) / (60 * 60 * 1000))}h past expiry), removing from cache`);
                        if (!cacheObj["forecast-data"]) cacheObj["forecast-data"] = {};
                        delete cacheObj["forecast-data"][key];
                        shouldCleanupCache = true;
                        this._expiresAt = null;
                        this._forecastData = null;
                    } else {
                        // Validate that cached data has all required array properties
                        const requiredArrays = ['time', 'temperature', 'rain', 'rainMin', 'rainMax', 'cloudCover', 'windSpeed', 'windGust', 'windDirection', 'symbolCode', 'pressure'];
                        const missingArrays = requiredArrays.filter(prop => !Array.isArray(entry.data[prop as keyof ForecastData]));
                        
                        if (missingArrays.length > 0) {
                            console.warn(`[WeatherAPI] Cached data for ${key} is missing required arrays: ${missingArrays.join(', ')}, removing from cache`);
                            if (!cacheObj["forecast-data"]) cacheObj["forecast-data"] = {};
                            delete cacheObj["forecast-data"][key];
                            shouldCleanupCache = true;
                            this._expiresAt = null;
                            this._forecastData = null;
                        } else {
                            this._expiresAt = entry.expiresAt;
                            // Restore Date objects in time array
                            if (Array.isArray(entry.data.time)) {
                                entry.data.time = entry.data.time.map((t: string | Date) =>
                                    typeof t === "string" ? new Date(t) : t
                                );
                            }
                            this._forecastData = entry.data;
                        }
                    }
                    
                    // Save cleaned cache back to localStorage if changes were made
                    if (shouldCleanupCache) {
                        localStorage.setItem('metno-weather-cache', JSON.stringify(cacheObj));
                        this._debugLog(`[WeatherAPI] Updated cache structure for ${key}`);
                    }
                } else {
                    this._expiresAt = null;
                    this._forecastData = null;
                }
            } else {
                this._expiresAt = null;
                this._forecastData = null;
            }
        } catch (e) {
            console.warn(`[WeatherAPI] Failed to load cache:`, e);
            // Clear corrupted cache entirely
            try {
                localStorage.removeItem('metno-weather-cache');
                console.warn(`[WeatherAPI] Cleared corrupted metno-weather-cache due to error`);
            } catch (cleanupError) {
                console.error(`[WeatherAPI] Failed to clear corrupted cache:`, cleanupError);
            }
            this._expiresAt = null;
            this._forecastData = null;
        }
    }

    // Make fetchWeatherDataFromAPI private and update usages
    private async _fetchWeatherDataFromAPI(): Promise<void> {
        // Throttle: if last fetch was less than 60s ago, skip fetch
        const now = Date.now();
        if (this._lastFetchTime && now - this._lastFetchTime < 60000) {
            // Already fetched recently, skip
            return;
        }
        // Checked here too: getForecastData is not the only way in, and a back-off that
        // one caller honours and another does not is no back-off at all.
        if (now < this._throttledUntil) {
            this._debugLog(`[weather-api] fetch suppressed: backing off after 429`);
            return;
        }
        this._lastFetchTime = now;

        const lat = this.lat;
        const lon = this.lon;
        let url = `https://aa015h6buqvih86i1.api.met.no/weatherapi/locationforecast/2.0/complete?lat=${lat}&lon=${lon}`;
        if (Number.isFinite(this.altitude)) {
            url += `&altitude=${this.altitude}`;
        }
        const dedicatedForecastUrl = url;
        const urlToUse = dedicatedForecastUrl;
        let headers: Record<string, string> = {};
        this.lastStatusCode = null;
        this.lastError = null;

        try {
            headers = {
                'Origin': window.location.origin,
                'Accept': 'application/json'
            };

            // Always use dedicated forecast URL
            // log impending call to fetch
            this._debugLog(`[weather-api] Fetching weather data from ${urlToUse} with Origin ${headers['Origin']}`);
            WeatherAPI.METEOGRAM_CARD_API_CALL_COUNT++;
            const response = await fetch(urlToUse, {
                headers,
                mode: 'cors',
                method: 'GET'
            });

            this.lastStatusCode = response.status;

            const expiresHeader = response.headers.get("Expires");
            // Read alongside Expires so the cache can be timed by a duration rather than
            // by an absolute moment. See _expiryFrom.
            //
            // Last-Modified rather than Date, and the difference is the whole thing.
            // met.no returns no Access-Control-Expose-Headers, so a browser hands
            // JavaScript only the CORS-safelisted response headers: Cache-Control,
            // Content-Language, Content-Length, Content-Type, Expires, Last-Modified,
            // Pragma. Date is not among them, so `headers.get("Date")` was null on every
            // cross-origin fetch and the expiry silently fell back to the 30-minute
            // default every time — the measured branch was dead code.
            //
            // Last-Modified is safelisted and, on this endpoint, identical to Date:
            //   date:          Thu, 27 Aug 2026 12:09:03 GMT
            //   last-modified: Thu, 27 Aug 2026 12:09:03 GMT
            //   expires:       Thu, 27 Aug 2026 12:40:58 GMT
            // so the property that mattered is preserved — both stamps come from met.no's
            // clock, and their difference is independent of ours.
            //
            // Date is still read as a second choice, for a same-origin proxy or if met.no
            // ever exposes it.
            const servedHeader = response.headers.get("Last-Modified")
                ?? response.headers.get("Date");
            // --- SPOOF: Always set expires to now + 3 minutes for testing ---
            // const spoofedExpires = new Date(Date.now() + 1 * 60 * 1000);
            // let expires: Date | null = spoofedExpires;
            // // If you want to log the spoof:
            // console.debug(`[weather-api] Spoofing expiresHeader to ${spoofedExpires.toISOString()}`);
            // --- END SPOOF ---

            // If you want to keep the original logic for reference, comment it out:
            let expires: Date | null = null;
            if (expiresHeader) {
                const expiresDate = new Date(expiresHeader);
                if (!isNaN(expiresDate.getTime())) {
                    expires = expiresDate;
                }
            }

            if (this.lastStatusCode === 429) {
                // Being told to slow down is the one case where the throttle must hold.
                //
                // The catch below clears _lastFetchTime so a failed fetch can be retried
                // sooner, which is right for a dropped connection and exactly wrong here:
                // met.no returns 429 when a client is already polling too hard, and the
                // response was to delete our own rate limit so the next attempt went
                // straight through. Rate limiting answered by removing rate limiting is
                // how a soft throttle becomes a ban.
                //
                // met.no says when to come back in the Expires header, and that was read
                // only to put a time in the message. It is now honoured: hold off until
                // then, bounded so a malformed or absent header cannot hold the card off
                // for ever or let it straight back in.
                const MIN_BACKOFF_MS = 60 * 1000;
                const MAX_BACKOFF_MS = 60 * 60 * 1000;
                const asked = expires ? expires.getTime() - Date.now() : MIN_BACKOFF_MS;
                const backoff = Math.min(
                    MAX_BACKOFF_MS,
                    Math.max(MIN_BACKOFF_MS, Number.isFinite(asked) ? asked : MIN_BACKOFF_MS)
                );
                this._throttledUntil = Date.now() + backoff;
                const nextTry = expires ? expires.toLocaleTimeString() : "later";
                throw new Error(`Weather API throttling: Too many requests. Please wait until ${nextTry} before retrying.`);
            }

            if (this.lastStatusCode === 304) {
                throw new Error("API returned 304 but no cached data is available.");
            }

            if (!response.ok) {
                // Summarised, never pasted. The body is markup often enough that
                // carrying it verbatim into an innerHTML report hides the report.
                const body = summariseBody(await response.text());
                const status = `${response.status}${response.statusText ? ` ${response.statusText}` : ""}`;
                throw new Error(`met.no returned ${status}${body ? ` — ${body}` : ""}`);
            }

            const jsonData = await response.json();
            WeatherAPI.METEOGRAM_CARD_API_SUCCESS_COUNT++;
            // Parse and store forecast data
            this.assignMeteogramDataFromRaw(jsonData);
            this._expiresAt = WeatherAPI._expiryFrom(expires, servedHeader);
            this.saveCacheToStorage();
        } catch (error: unknown) {
            this.lastError = error;
            // Reset throttling on fetch failure to allow retry sooner
            this._lastFetchTime = null;
            // The message is already the first thing getDiagnosticText reports, so it is
            // not repeated here. It used to appear twice, once raw and once inside the
            // diagnostics, which is how a 502's HTML body got into the card twice over.
            const diag = this.getDiagnosticText() +
                `API URL: <code>${escapeHtml(urlToUse)}</code><br>` +
                `Origin header: <code>${escapeHtml(headers['Origin'])}</code><br>`;
            throw new Error(diag, { cause: error });
        }
    }

    // assignMeteogramDataFromRaw now only sets _forecastData
    assignMeteogramDataFromRaw(rawData: any): void {
        try {
            if (!rawData || !rawData.properties || !Array.isArray(rawData.properties.timeseries)) {
                throw new Error("Invalid raw data format from weather API");
            }
            const timeseries = rawData.properties.timeseries;
            const filtered = timeseries.filter((item: any) => {
                const time = new Date(item.time);
                return time.getMinutes() === 0;
            });

            const result: ForecastData = {
                time: [],
                temperature: [],
                rain: [],
                rainMin: [],
                rainMax: [],
                cloudCover: [],
                windSpeed: [],
                windGust: [],
                windDirection: [],
                symbolCode: [],
                pressure: [],
                units: undefined
            };
            result.fetchTimestamp = new Date().toISOString();

            filtered.forEach((item: any) => {
                const time = new Date(item.time);
                const instant = item.data.instant.details;
                const next1h = item.data.next_1_hours?.details;
                const next6h = item.data.next_6_hours?.details;
                const next6hSummary = item.data.next_6_hours?.summary;

                result.time.push(time);
                result.temperature.push(instant.air_temperature ?? null);
                result.cloudCover.push(instant.cloud_area_fraction ?? null);
                result.windSpeed.push(instant.wind_speed ?? null);
                result.windGust.push(instant.wind_speed_of_gust ?? null);
                result.windDirection.push(instant.wind_from_direction ?? null);
                result.pressure.push(instant.air_pressure_at_sea_level ?? null);

                if (next1h) {
                    // Only use actual min/max values if they exist, otherwise set to null
                    const rainAmountMax = next1h.precipitation_amount_max !== undefined ?
                        next1h.precipitation_amount_max : null;

                    const rainAmountMin = next1h.precipitation_amount_min !== undefined ?
                        next1h.precipitation_amount_min : null;

                    result.rainMin.push(rainAmountMin);
                    result.rainMax.push(rainAmountMax);
                    result.rain.push(next1h.precipitation_amount ?? null);

                    if (item.data.next_1_hours?.summary?.symbol_code) {
                        result.symbolCode.push(item.data.next_1_hours.summary.symbol_code);
                    } else {
                        result.symbolCode.push('');
                    }
                } else if (next6h) {
                    // Use next_6_hours data if next_1_hours is missing
                    // Distribute 6h precipitation over 6 hours (average per hour)
                    const rain6h = next6h.precipitation_amount;
                    const rainPerHour = rain6h !== undefined ? rain6h / 6 : null;
                    result.rain.push(rainPerHour);
                    // 6h data doesn't have min/max ranges, so set to null
                    result.rainMin.push(null);
                    result.rainMax.push(null);

                    if (next6hSummary?.symbol_code) {
                        result.symbolCode.push(next6hSummary.symbol_code);
                    } else {
                        result.symbolCode.push('');
                    }
                } else {
                    // No precipitation data available
                    result.rain.push(null);
                    result.rainMin.push(null);
                    result.rainMax.push(null);
                    result.symbolCode.push('');
                }
            });
            // Extract units from meta.units if available
            if (rawData.properties && rawData.properties.meta && rawData.properties.meta.units) {
                const metaUnits = rawData.properties.meta.units;
                result.units = {
                    temperature: metaUnits.air_temperature,
                    pressure: metaUnits.air_pressure_at_sea_level,
                    windSpeed: metaUnits.wind_speed,
                    precipitation: metaUnits.precipitation_amount,
                    cloudCover: metaUnits.cloud_area_fraction
                };
            }

            this._forecastData = result;
        } catch (err) {
            throw new Error("Failed to parse weather data: " + (err instanceof Error ? err.message : String(err)));
        }
    }
}
