# Developer Notes for Meteogram Card

## AI Developed

This card is actively developed and maintained with the assistance of AI tools, enabling rapid iteration, bug fixes, and feature enhancements.  
Feedback and contributions are welcome to further improve the card's capabilities.

If you have a feature request, bug report, or improvement suggestion, please open an issue on the GitHub repository, or why not contribute directly with a pull request?

[GitHub Issue Tracker](https://github.com/DTekNO/lovelace-meteogram-card/issues)


## Logging and Status Panel

If the version number in `package.json` contains `"beta"`, the card will Display a status panel in the UI below the chart, showing:
  - API cache expiry (`expiresAt`)
  - Last render time
  - Last data fetch timestamp
  - Last cached data timestamp
  - Whether the last API call was successful. "Unsuccessful" may also mean that it hasn't been called yet

This is useful for debugging and development on devices where the console is not visible.

## Caching Logic

To minimize API requests and adhere to Met.no's usage policies, the card employs an aggressive caching strategy. 
The API is invoked only when absolutely necessary. If valid forecast data exists in the cache, it will be used, 
ensuring the card avoids unnecessary API calls. A new API request is made only when there is no cached data 
for the requested location (including new locations), or when the cache has expired based on the expiry 
information provided by the previous API response.


### Cache Documentation for`meteogram-card-weather-cache` 


**Cache Location:**  
  Stored in `localStorage` under the key `meteogram-card-weather-cache`.


**Cache Structure Summary:**

The value is a JSON string containing:

- `default-location`
  - `latitude`
  - `longitude`
- `forecast-data`
  - `<location-key>` (base64-encoded lat/lon)
    - `expiresAt` cache expiry timestamp (ms)
    - `lastModified`
    - `data`
      - `fetchTimestamp` last fetch timestamp (ms)
      - `forecastData...` (weather data object)



**View the cache in Browser Application Tab:**
1. Open DevTools (`F12` or `Ctrl+Shift+I`)
2. Go to the `Application` tab
3. In the left sidebar, expand `Storage` and select `Local Storage`
4. Click your site's URL to view stored keys
5. Find the cache key (e\.g\. `meteogram-card-weather-cache`) and click it
6. Inspect the value for cached data and timestamps

**On startup:**  
  - The card attempts to load cached weather data for the current location from `localStorage`.
  - Expired cache entries are not cleared; they are used if API fetch fails.

**On every refresh:**  
  - If cached data is still valid (`expiresAt` not passed), it is used.
  - A refresh is scheduled for 1 minute after expiry.
  - When expired, the card tries to fetch new data from the API.
    - If the fetch succeeds, the cache is updated and the chart is redrawn if the data changed.
    - If the fetch fails, the expired cache is used as a fallback.
  - The cache is never cleared just because it is expired.

**Cache keys:**  
  - Cache is indexed by location (latitude/longitude, truncated to 4 decimals and base64 encoded).
  - Each cache entry includes the forecast data, expiry timestamp, and a fetch timestamp for debugging cache misses.

This strategy ensures the card is API-friendly and robust against network issues.

## Development Setup

To set up the development environment for the Meteogram Card, follow these steps:

1. Run `npm install` to install all required dependencies from \`package.json\`.
2. Run `npm run build` to compile the TypeScript/JavaScript source code and generate the production-ready files in the \`dist\` directory.   

## Testing

To test the card, you can use the following steps:
1. **Install the card** in your Home Assistant instance.
2. **Add the card to your dashboard** with the desired configuration.
3. Once you have added the card ensure that you refresh the browser cache to load the latest version of the card.  
   This can be done by pressing `Ctrl + F5` or `Cmd + Shift + R` on Mac.
   This ensures that the latest JavaScript and CSS files are loaded.
3. **Open the browser console** to view logs and status information.
4. **Check the status panel** below the chart for cache expiry and last fetch information.
5. **Force a redraw** by changing the configuration or refreshing the page to see how the
cache behaves and whether the card fetches new data or uses cached data.
7. **Monitor the console** for any errors or warnings related to API calls or data processing
8. **Test with different `meteogram_length` values** to see how the card adapts to different time ranges.
9. **Test with different locations** by changing the latitude and longitude
10. **Check the card's responsiveness** by resizing the browser window or viewing it on different devices to ensure it adapts correctly.
11. **Test error handling** by simulating network issues
12. **Test dark mode** by switching Home Assistant to dark mode and checking the card's appearance and readability.
13. **Test the visual editor** by adding the card through Home Assistant's visual editor and ensuring all options are available and functional.
14. **Test the caching behavior** by observing the status panel for cache expiry and last fetch timestamps, ensuring that the card uses cached data when available and only fetches new data when necessary.
16. **Test the card's compatibility** with different Home Assistant versions and configurations to ensure it works seamlessly across different setups.
