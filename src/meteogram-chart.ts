import { trnslt } from "./translations";
import { mapHaConditionToMetnoSymbol } from "./weather-entity";
import { convertWindSpeed } from "./conversions";
// meteogram-chart.ts
// Handles all SVG/D3 chart rendering for MeteogramCard

// Make the mapping function available globally for chart rendering
if (typeof window !== "undefined") {
  window.mapHaConditionToMetnoSymbol = mapHaConditionToMetnoSymbol;
}

export class MeteogramChart {
    /**
     * Draw weather icons at each time step
     */
    public drawWeatherIcons(
        chart: any,
        symbolCode: string[],
        temperatureConverted: (number|null)[],
        x: any,
        yTemp: any,
        data: any,
        N: number
    ) {
        // If denseWeatherIcons is true, show all icons (interval 1)
        // Otherwise, space icons so they don't overlap (e.g., 44px per icon)
        const minIconSpacing = 44; // px, icon is 40px wide
        const chartWidth = this.card._chartWidth || 400;
        const maxIcons = Math.floor(chartWidth / minIconSpacing);
        const iconInterval = this.card.denseWeatherIcons
            ? 1
            : Math.max(1, Math.ceil(N / maxIcons));

        chart.selectAll(".weather-icon")
            .data(symbolCode)
            .enter()
            .append("foreignObject")
            .attr("class", "weather-icon")
            .attr("x", (_: string, i: number) => x(i) - 20)
            .attr("y", (_: string, i: number) => {
                const temp = temperatureConverted[i];
                return temp !== null ? yTemp(temp) - 40 : -999;
            })
            .attr("width", 40)
            .attr("height", 40)
            .attr("opacity", (_: string, i: number) =>
                (temperatureConverted[i] !== null && i % iconInterval === 0) ? 1 : 0)
            .each((d: string, i: number, nodes: any) => {
                if (i % iconInterval !== 0) return;
                const node = nodes[i];
                if (!d) return;
                let iconName = d;
                if (this.card.entityId && this.card.entityId !== 'none' && this.card._weatherEntityApiInstance) {
                    const forecastTime = data.time[i];
                    const isDay = this.card.isDaytimeAt(forecastTime);
                    iconName = window.mapHaConditionToMetnoSymbol
                        ? window.mapHaConditionToMetnoSymbol(d, forecastTime, isDay)
                        : d;
                }
                iconName = iconName
                    .replace(/^lightssleet/, 'lightsleet')
                    .replace(/^lightssnow/, 'lightsnow')
                    .replace(/^lightrainshowers$/, 'lightrainshowersday')
                    .replace(/^rainshowers$/, 'rainshowersday')
                    .replace(/^heavyrainshowers$/, 'heavyrainshowersday');
                if (this.card.getIconSVG) {
                    this.card.getIconSVG(iconName).then((svgContent: string) => {
                        if (svgContent) {
                            const div = document.createElement('div');
                            div.style.width = '40px';
                            div.style.height = '40px';
                            div.innerHTML = svgContent;
                            node.appendChild(div);
                        }
                    });
                }
            });
    }
    private card: any;
    constructor(cardInstance: any) {
        this.card = cardInstance;
    }

    /**
     * Ensures D3.js is loaded globally (window.d3). Returns a promise that resolves when D3 is available.
     */
    async ensureD3Loaded(): Promise<void> {
        if (window.d3) return;
        // Check if a script is already loading
        if ((window as any)._meteogramD3LoadingPromise) {
            await (window as any)._meteogramD3LoadingPromise;
            return;
        }
        // Otherwise, load D3 dynamically
        (window as any)._meteogramD3LoadingPromise = new Promise<void>((resolve, reject) => {
            const script = document.createElement('script');
            script.src = 'https://d3js.org/d3.v7.min.js';
            script.async = true;
            script.onload = () => {
                resolve();
            };
            script.onerror = () => {
                reject(new Error('Failed to load D3.js library'));
            };
            document.head.appendChild(script);
        });
        await (window as any)._meteogramD3LoadingPromise;
    }

    drawGridOutline(chart: any) {
        chart.append("line")
            .attr("class", "line")
            .attr("x1", 0).attr("x2", this.card._chartWidth)
            .attr("y1", 0).attr("y2", 0)
            .attr("stroke", "var(--meteogram-grid-color, #e0e0e0)")
            .attr("stroke-width", 3);

        chart.append("line")
            .attr("class", "line")
            .attr("x1", 0).attr("x2", this.card._chartWidth)
            .attr("y1", this.card._chartHeight).attr("y2", this.card._chartHeight)
            .attr("stroke", "var(--meteogram-grid-color, #e0e0e0)");

        chart.append("line")
            .attr("class", "line")
            .attr("x1", this.card._chartWidth).attr("x2", this.card._chartWidth)
            .attr("y1", 0).attr("y2", this.card._chartHeight)
            .attr("stroke", "var(--meteogram-grid-color, #e0e0e0)")
            .attr("stroke-width", 3);

        chart.append("line")
            .attr("class", "line")
            .attr("x1", 0).attr("x2", 0)
            .attr("y1", 0).attr("y2" , this.card._chartHeight)
            .attr("stroke", "var(--meteogram-grid-color, #e0e0e0)")
            .attr("stroke-width", 3);
    }

    drawBottomHourLabels(svg: any, time: Date[], margin: any, x: any, windBandHeight: number, _width: number) {
        const hourLabelY = margin.top + this.card._chartHeight + windBandHeight + 15;
        
        // Detect transition from hourly to 6-hourly data
        let transitionIdx = time.length;
        for (let i = 1; i < time.length - 1; i++) {
            const interval1 = (time[i].getTime() - time[i - 1].getTime()) / (1000 * 60 * 60);
            const interval2 = (time[i + 1].getTime() - time[i].getTime()) / (1000 * 60 * 60);
            
            if (interval1 <= 1.5 && interval2 > 3) {
                transitionIdx = i + 1;
                break;
            }
        }
        
        // Create a temporary text element to measure label widths
        const tempText = svg.append("text")
            .attr("class", "bottom-hour-label")
            .style("visibility", "hidden");
        
        // Format all hour strings and measure their widths
        const labelData = time.map((d: Date, i: number) => {
            const hourStr = d.getHours().toString();
            tempText.text(hourStr);
            const bbox = (tempText.node() as SVGTextElement).getBBox();
            
            return {
                index: i,
                hour: d.getHours(),
                hourStr: hourStr,
                xPos: margin.left + x(i),
                width: bbox.width,
                isHighRes: i < transitionIdx
            };
        });
        
        tempText.remove();
        
        const avgLabelWidth = labelData.reduce((sum, d) => sum + d.width, 0) / labelData.length;
        const minSpacing = avgLabelWidth + 8;
        
        // Separate high-res and low-res sections
        const highResLabels = labelData.filter(d => d.isHighRes);
        const lowResLabels = labelData.filter(d => !d.isHighRes);
        
        const labelsToShow: number[] = [];
        
        // Strategy: Start from low-res section (establish pattern at day boundaries),
        // then work backwards into high-res section with compatible interval
        
        let patternHours: number[] = [];
        
        // Low-res section: establish pattern based on day boundaries
        if (lowResLabels.length > 0) {
            // Find labels at or near day boundaries (hour 0 or close to it)
            const dayBoundaries = lowResLabels.filter(d => {
                const distToMidnight = Math.min(Math.abs(d.hour - 0), Math.abs(d.hour - 24));
                return distToMidnight <= 6; // Within 6 hours of midnight
            });
            
            if (dayBoundaries.length > 0) {
                // Use hour from first day boundary as anchor
                const anchorHour = dayBoundaries[0].hour;
                
                // Show every 12 hours in low-res (every 2nd 6-hour point)
                const lowResPattern = lowResLabels.filter((d) => {
                    // Check if this hour matches the pattern: anchor + 0h or anchor + 12h
                    const hourDiff = (d.hour - anchorHour + 24) % 24;
                    return hourDiff === 0 || hourDiff === 12;
                });
                
                // Verify spacing
                let spacingOk = true;
                if (lowResPattern.length >= 2) {
                    for (let i = 1; i < lowResPattern.length; i++) {
                        const spacing = lowResPattern[i].xPos - lowResPattern[i - 1].xPos;
                        if (spacing < minSpacing) {
                            spacingOk = false;
                            break;
                        }
                    }
                }
                
                if (spacingOk && lowResPattern.length > 0) {
                    lowResPattern.forEach(d => labelsToShow.push(d.index));
                    // Establish the hour pattern for high-res section
                    patternHours = [anchorHour, (anchorHour + 12) % 24];
                } else {
                    // Fallback: show only at day boundaries
                    dayBoundaries.forEach(d => labelsToShow.push(d.index));
                    patternHours = [dayBoundaries[0].hour];
                }
            } else {
                // No clear day boundaries, use every other low-res point
                for (let i = 0; i < lowResLabels.length; i += 2) {
                    labelsToShow.push(lowResLabels[i].index);
                }
                if (lowResLabels.length > 0) {
                    patternHours = [lowResLabels[0].hour];
                }
            }
        }
        
        // High-res section: match the pattern established in low-res
        if (highResLabels.length > 0 && patternHours.length > 0) {
            // Try 2-hour intervals that align with the low-res pattern
            const anchorHour = patternHours[0];
            
            // Test different intervals (2h, 3h, 4h) that maintain alignment
            const intervals = [2, 3, 4];
            let selectedHighRes: typeof highResLabels = [];
            
            for (const interval of intervals) {
                // Filter to hours that match: anchorHour + N * interval (mod 24)
                const candidates = highResLabels.filter(d => {
                    const hourDiff = (d.hour - anchorHour + 24) % 24;
                    return hourDiff % interval === 0;
                });
                
                if (candidates.length < 2) continue;
                
                // Check spacing
                let hasEnoughSpace = true;
                for (let i = 1; i < candidates.length; i++) {
                    const spacing = candidates[i].xPos - candidates[i - 1].xPos;
                    if (spacing < minSpacing) {
                        hasEnoughSpace = false;
                        break;
                    }
                }
                
                if (hasEnoughSpace) {
                    selectedHighRes = candidates;
                    break;
                }
            }
            
            if (selectedHighRes.length > 0) {
                selectedHighRes.forEach(d => labelsToShow.push(d.index));
            } else {
                // Fallback: show first and last high-res labels
                labelsToShow.push(highResLabels[0].index);
                if (highResLabels.length > 1) {
                    labelsToShow.push(highResLabels[highResLabels.length - 1].index);
                }
            }
        }
        
        // Draw labels
        svg.selectAll(".bottom-hour-label")
            .data(labelData)
            .enter()
            .append("text")
            .attr("class", "bottom-hour-label")
            .attr("x", (d: any) => d.xPos)
            .attr("y", hourLabelY)
            .attr("text-anchor", "middle")
            .attr("opacity", (d: any) => labelsToShow.includes(d.index) ? 1 : 0)
            .text((d: any) => d.hourStr);
    }

    drawTemperatureLine(chart: any, temperature: (number|null)[], x: any, yTemp: any, legendX?: number, legendY?: number) {
        const d3 = window.d3;

        // Create a gradient that transitions from blue (cold/below freezing) to red (warm/above freezing)
        // Use userSpaceOnUse so we can position gradient stops at exact Y coordinates
        const gradientId = `temp-gradient-${Math.random().toString(36).substr(2, 9)}`;
        this.card._debugLog(`🎨 Creating temperature gradient with ID: ${gradientId}`);
        
        const defs = chart.append("defs");
        
        // Get the temperature domain and calculate actual Y positions
        const tempDomain = yTemp.domain(); // [min, max] in temperature units
        const minTemp = tempDomain[0];
        const maxTemp = tempDomain[1];
        const minTempY = yTemp(minTemp); // Bottom of temperature range
        const maxTempY = yTemp(maxTemp); // Top of temperature range
        
        this.card._debugLog(`🎨 Temperature domain: [${minTemp.toFixed(1)}°, ${maxTemp.toFixed(1)}°]`);
        this.card._debugLog(`🎨 Temperature Y positions: max temp ${maxTemp.toFixed(1)}° at Y=${maxTempY.toFixed(1)}px, min temp ${minTemp.toFixed(1)}° at Y=${minTempY.toFixed(1)}px`);
        
        const gradient = defs.append("linearGradient")
            .attr("id", gradientId)
            .attr("gradientUnits", "userSpaceOnUse")  // Use absolute SVG coordinates
            .attr("x1", 0)
            .attr("y1", maxTempY)    // Y position of warmest temperature
            .attr("x2", 0)
            .attr("y2", minTempY);   // Y position of coldest temperature

        // Calculate the Y position of 0°C
        const freezingPoint = 0;
        const freezingYPos = yTemp(freezingPoint);
        const gradientRange = minTempY - maxTempY; // Total Y distance of gradient
        
        this.card._debugLog(`🎨 Freezing point (0°C) Y position: ${freezingYPos.toFixed(1)}px, gradient range: ${gradientRange.toFixed(1)}px`);

        // Helper function to calculate offset percentage within the gradient
        const calcOffset = (yPos: number): number => {
            return ((yPos - maxTempY) / gradientRange) * 100;
        };

        // Create gradient stops
        const gradientStops: Array<{temp: number, offset: number, color: string}> = [];
        
        // If freezing point is below the visible range (all temps above freezing)
        if (minTemp > freezingPoint) {
            this.card._debugLog(`🎨 All temperatures above freezing (min: ${minTemp.toFixed(1)}°C) - using warm colors only`);
            // Warm colors: orange at coolest (still above 0°C) to deep red at warmest
            gradientStops.push({temp: maxTemp, offset: 0, color: maxTemp >= 20 ? "#cc0000" : "#ff3300"});
            gradient.append("stop")
                .attr("offset", "0%")
                .attr("stop-color", maxTemp >= 20 ? "#cc0000" : "#ff3300");
            
            // Add 20°C transition if in range
            if (maxTemp > 20 && minTemp < 20) {
                const temp20Y = yTemp(20);
                const offset20 = calcOffset(temp20Y);
                gradientStops.push({temp: 20, offset: offset20, color: "#cc0000"});
                gradient.append("stop")
                    .attr("offset", `${offset20.toFixed(1)}%`)
                    .attr("stop-color", "#cc0000");
            }
            
            gradientStops.push({temp: minTemp, offset: 100, color: "#ff9933"});
            gradient.append("stop")
                .attr("offset", "100%")
                .attr("stop-color", "#ff9933");
        }
        // If freezing point is above the visible range (all temps below freezing)
        else if (maxTemp < freezingPoint) {
            this.card._debugLog(`🎨 All temperatures below freezing (max: ${maxTemp.toFixed(1)}°C) - using cold colors only`);
            // Cold colors: light blue at warmest (still below 0°C) to deep blue at coldest
            gradientStops.push({temp: maxTemp, offset: 0, color: "#66b3ff"});
            gradient.append("stop")
                .attr("offset", "0%")
                .attr("stop-color", "#66b3ff");
            
            // Add -5°C transition if in range
            if (maxTemp > -5 && minTemp < -5) {
                const tempMinus5Y = yTemp(-5);
                const offsetMinus5 = calcOffset(tempMinus5Y);
                gradientStops.push({temp: -5, offset: offsetMinus5, color: "#0066cc"});
                gradient.append("stop")
                    .attr("offset", `${offsetMinus5.toFixed(1)}%`)
                    .attr("stop-color", "#0066cc");
            }
            
            gradientStops.push({temp: minTemp, offset: 100, color: minTemp <= -5 ? "#003d7a" : "#0066cc"});
            gradient.append("stop")
                .attr("offset", "100%")
                .attr("stop-color", minTemp <= -5 ? "#003d7a" : "#0066cc");
        }
        // Freezing point is within the visible range - transition AT 0°C
        else {
            this.card._debugLog(`🎨 Freezing point within range - transition at 0°C (Y=${freezingYPos.toFixed(1)}px)`);
            
            const freezingOffset = calcOffset(freezingYPos);
            
            // Warmest temperature - check if >= 20°C for deep red
            const warmestColor = maxTemp >= 20 ? "#cc0000" : "#ff3300";
            gradientStops.push({temp: maxTemp, offset: 0, color: warmestColor});
            gradient.append("stop")
                .attr("offset", "0%")
                .attr("stop-color", warmestColor);

            // Add 20°C deep red transition if in range
            if (maxTemp > 20 && 20 > freezingPoint) {
                const temp20Y = yTemp(20);
                const offset20 = calcOffset(temp20Y);
                gradientStops.push({temp: 20, offset: offset20, color: "#cc0000"});
                gradient.append("stop")
                    .attr("offset", `${offset20.toFixed(1)}%`)
                    .attr("stop-color", "#cc0000");
                this.card._debugLog(`🎨 Deep red transition at 20°C (${offset20.toFixed(1)}%)`);
            }

            // Add 10°C orange-red transition if in range
            if (maxTemp > 10 && minTemp < 10 && 10 > freezingPoint) {
                const temp10Y = yTemp(10);
                const offset10 = calcOffset(temp10Y);
                gradientStops.push({temp: 10, offset: offset10, color: "#ff6600"});
                gradient.append("stop")
                    .attr("offset", `${offset10.toFixed(1)}%`)
                    .attr("stop-color", "#ff6600");
                this.card._debugLog(`🎨 Orange-red transition at 10°C (${offset10.toFixed(1)}%)`);
            }

            // At freezing point from above: light orange (warm side of transition)
            gradientStops.push({temp: freezingPoint, offset: freezingOffset, color: "#ff9933"});
            gradient.append("stop")
                .attr("offset", `${freezingOffset.toFixed(1)}%`)
                .attr("stop-color", "#ff9933");
            this.card._debugLog(`🎨 Freezing point (warm side) at 0°C: light orange at ${freezingOffset.toFixed(1)}%`);
            
            // At freezing point from below: light blue (cold side of transition)
            gradientStops.push({temp: freezingPoint, offset: freezingOffset, color: "#66b3ff"});
            gradient.append("stop")
                .attr("offset", `${freezingOffset.toFixed(1)}%`)
                .attr("stop-color", "#66b3ff");
            this.card._debugLog(`🎨 Freezing point (cold side) at 0°C: light blue at ${freezingOffset.toFixed(1)}%`);

            // Add -5°C deep blue transition if in range
            if (minTemp < -5 && maxTemp > -5 && -5 < freezingPoint) {
                const tempMinus5Y = yTemp(-5);
                const offsetMinus5 = calcOffset(tempMinus5Y);
                gradientStops.push({temp: -5, offset: offsetMinus5, color: "#0066cc"});
                gradient.append("stop")
                    .attr("offset", `${offsetMinus5.toFixed(1)}%`)
                    .attr("stop-color", "#0066cc");
                this.card._debugLog(`🎨 Deep blue transition at -5°C (${offsetMinus5.toFixed(1)}%)`);
            }

            // Coldest temperature - check if <= -5°C for very deep blue
            const coldestColor = minTemp <= -5 ? "#003d7a" : "#0066cc";
            gradientStops.push({temp: minTemp, offset: 100, color: coldestColor});
            gradient.append("stop")
                .attr("offset", "100%")
                .attr("stop-color", coldestColor);
        }

        this.card._debugLog(`🎨 Gradient stops created (${gradientStops.length} stops):`, gradientStops);

        const line = d3.line()
            .defined((d: number | null) => d !== null)
            .x((_: number | null, i: number) => x(i))
            .y((_: number | null, i: number) => temperature[i] !== null ? yTemp(temperature[i]) : 0)
            .curve(d3.curveMonotoneX);

        this.card._debugLog(`🎨 Applying gradient to temperature line with stroke: url(#${gradientId})`);
        
        // Check if user has set a custom color that would override the gradient
        const tempLineColorVar = getComputedStyle(this.card).getPropertyValue('--meteogram-temp-line-color');
        const hasCustomColor = tempLineColorVar && tempLineColorVar.trim();
        
        if (hasCustomColor) {
            this.card._debugLog(`⚠️ CSS variable --meteogram-temp-line-color is set to "${tempLineColorVar.trim()}" - using custom color instead of gradient`);
        } else {
            this.card._debugLog(`✅ No custom --meteogram-temp-line-color set, using gradient`);
        }
        
        const tempPath = chart.append("path")
            .datum(temperature)
            .attr("class", "temp-line")
            .attr("d", line);
        
        // Apply either custom color or gradient
        if (hasCustomColor) {
            tempPath.style("stroke", tempLineColorVar.trim());
        } else {
            tempPath.attr("stroke", `url(#${gradientId})`);
        }

        // Verify the gradient was added to the DOM
        const gradientElement = chart.select(`#${gradientId}`);
        if (gradientElement.empty()) {
            this.card._debugLog(`⚠️ WARNING: Gradient element #${gradientId} not found in DOM!`);
        } else {
            this.card._debugLog(`✅ Gradient element #${gradientId} successfully added to DOM`);
            const stops = gradientElement.selectAll('stop');
            this.card._debugLog(`✅ Gradient has ${stops.size()} stops`);
        }

            // Always draw axis label (if not in focussed mode)
            if (!this.card.focussed && this.card.displayMode !== "core") {
                chart.append("text")
                    .attr("class", "axis-label")
                    .attr("text-anchor", "middle")
                    .attr("transform", `translate(${-this.card._margin.left + 20},${yTemp.range()[0] / 2}) rotate(-90)`)
                    .text(trnslt(this.card.hass, "ui.card.meteogram.attributes.temperature", "Temperature") + " (" + this.card._tempUnit + ")");
            }

            // Draw colored top legend if coordinates are provided
            if (legendX !== undefined && legendY !== undefined) {
                chart.append("text")
                    .attr("class", "legend legend-temp")
                    .attr("x", legendX)
                    .attr("y", legendY)
                    .attr("text-anchor", "start")
                    .text(trnslt(this.card.hass, "ui.card.meteogram.attributes.temperature", "Temperature") + " (" + this.card._tempUnit + ")");
            }
            

    }

    drawChartGrid(svg: any, chart: any, d3: any, x: any, yTemp: any, N: number, margin: any, dayStarts: number[]) {
        // Day boundary ticks (top short ticks)
        const tickLength = 12; // Short tick length above the top line
        svg.selectAll(".day-tic")
            .data(dayStarts)
            .enter()
            .append("line")
            .attr("class", "day-tic")
            .attr("x1", (d: number) => margin.left + x(d))
            .attr("x2", (d: number) => margin.left + x(d))
            .attr("y1", margin.top - tickLength)
            .attr("y2", this.card._chartHeight + margin.top)
            .attr("stroke", "#1a237e")
            .attr("stroke-width", 3)
            .attr("opacity", 0.6);

        // Always add temperature Y axis (left side)
        chart.append("g")
            .attr("class", "temperature-axis")
            .call(window.d3.axisLeft(yTemp)
                .tickFormat((d: any) => `${d}`));

        // Add temperature Y axis for horizontal grid lines (no numbers)
        chart.append("g")
            .attr("class", "grid")
            .call(window.d3.axisLeft(yTemp)
                .tickSize(-this.card._chartWidth)
                .tickFormat(() => ""));

        // Add vertical gridlines
        chart.append("g")
            .attr("class", "xgrid")
            .selectAll("line")
            .data(d3.range(N))
            .enter().append("line")
            .attr("x1", (i: number) => x(i))
            .attr("x2", (i: number) => x(i))
            .attr("y1", 0)
            .attr("y2", this.card._chartHeight)
            .attr("stroke", "currentColor")
            .attr("stroke-width", 1);
    }

    drawRainBars(
        chart: any,
        rain: (number|null)[],
        rainMax: (number|null)[],
        N: number,
        x: any,
        yPrecip: any,
        dx: number,
        legendX?: number,
        legendY?: number
    ) {
        const barWidth = dx * 0.8;
        
        // Only draw rainMax bars if precipitation min/max data is available
        if (this.card._dataAvailability.precipitationMinMax) {
            // Draw the max rain range bars first (only for non-null values)
            const rainMaxData = rainMax.slice(0, N - 1).map((d, i) => ({ value: d, index: i })).filter(d => d.value !== null && d.value > 0);
            
            chart.selectAll(".rain-max-bar")
                .data(rainMaxData)
                .enter()
                .append("rect")
                .attr("class", "rain-max-bar")
                .attr("x", (d: any) => x(d.index) + dx / 2 - barWidth / 2)
                .attr("y", (d: any) => {
                    const h = this.card._chartHeight - yPrecip(d.value);
                    const scaledH = h < 2 && d.value > 0 ? 2 : h * 0.7; // Minimum height of 2px for visibility
                    return yPrecip(0) - scaledH;
                })
                .attr("width", barWidth)
                .attr("height", (d: any) => {
                    const h = this.card._chartHeight - yPrecip(d.value);
                    return h < 2 && d.value > 0 ? 2 : h * 0.7;
                })
                .attr("fill", "currentColor");
        }

        // Draw main rain bars (foreground, deeper blue) - filter out null values
        const rainBarData = rain.slice(0, N - 1).map((d, i) => ({ value: d, index: i })).filter(d => d.value !== null && d.value > 0);
        
        chart.selectAll(".rain-bar")
            .data(rainBarData)
            .enter().append("rect")
            .attr("class", "rain-bar")
            .attr("x", (d: any) => x(d.index) + dx / 2 - barWidth / 2)
            .attr("y", (d: any) => {
                const h = this.card._chartHeight - yPrecip(d.value);
                const scaledH = h < 2 && d.value > 0 ? 2 : h * 0.7;
                return yPrecip(0) - scaledH;
            })
            .attr("width", barWidth)
            .attr("height", (d: any) => {
                const h = this.card._chartHeight - yPrecip(d.value);
                return h < 2 && d.value > 0 ? 2 : h * 0.7;
            })
            .attr("fill", "currentColor");

        // Add main rain labels (show if rain > 0) - filter out null values
        const rainLabelData = rain.slice(0, N - 1).map((d, i) => ({ value: d, index: i })).filter(d => d.value !== null && d.value > 0);
        
        // Measure label widths and determine which to show
        const tempRainText = chart.append("text")
            .attr("class", "rain-label")
            .style("visibility", "hidden");
        
        const rainLabelsWithWidth = rainLabelData.map((d: any) => {
            const labelText = d.value < 1 ? d.value.toFixed(1) : d.value.toFixed(0);
            tempRainText.text(labelText);
            const bbox = (tempRainText.node() as SVGTextElement).getBBox();
            return {
                ...d,
                labelText,
                xPos: x(d.index) + dx / 2,
                width: bbox.width
            };
        });
        
        tempRainText.remove();
        
        // Sort by value (descending) to prioritize showing higher values
        const sortedRainLabels = [...rainLabelsWithWidth].sort((a, b) => b.value - a.value);
        
        // Determine which labels to show (avoid overlaps)
        const minGap = 4; // Minimum pixels between rain labels
        const rainLabelsToShow = new Set<number>();
        const occupiedRanges: Array<{start: number, end: number}> = [];
        
        for (const label of sortedRainLabels) {
            const labelStart = label.xPos - label.width / 2;
            const labelEnd = label.xPos + label.width / 2;
            
            // Check if this label overlaps with any already shown label
            const overlaps = occupiedRanges.some(range => 
                (labelStart - minGap < range.end) && (labelEnd + minGap > range.start)
            );
            
            if (!overlaps) {
                rainLabelsToShow.add(label.index);
                occupiedRanges.push({start: labelStart, end: labelEnd});
            }
        }
        
        chart.selectAll(".rain-label")
            .data(rainLabelsWithWidth)
            .enter()
            .append("text")
            .attr("class", "rain-label")
            .attr("x", (d: any) => d.xPos)
            .attr("y", (d: any) => {
                const h = this.card._chartHeight - yPrecip(d.value);
                const scaledH = h < 2 && d.value > 0 ? 2 : h * 0.7;
                return yPrecip(0) - scaledH - 4; // 4px above the top of the bar
            })
            .attr("text-anchor", "middle")
            .text((d: any) => d.labelText)
            .attr("opacity", (d: any) => rainLabelsToShow.has(d.index) ? 1 : 0);

        // Add max rain labels (only if precipitation min/max data is available)
        if (this.card._dataAvailability.precipitationMinMax) {
            const rainMaxLabelData = rainMax.slice(0, N - 1).map((d, i) => ({ value: d, index: i })).filter(d => d.value !== null);
            
            // Measure label widths and determine which to show
            const tempMaxText = chart.append("text")
                .attr("class", "rain-max-label")
                .style("visibility", "hidden");
            
            const rainMaxLabelsWithWidth = rainMaxLabelData.map((d: any) => {
                const rainValue = rain?.[d.index] ?? 0;
                const labelText = d.value < 1 ? d.value.toFixed(1) : d.value.toFixed(0);
                tempMaxText.text(labelText);
                const bbox = (tempMaxText.node() as SVGTextElement).getBBox();
                return {
                    ...d,
                    rainValue,
                    labelText,
                    xPos: x(d.index) + dx / 2,
                    width: bbox.width,
                    shouldShow: d.value > rainValue
                };
            }).filter((d: any) => d.shouldShow);
            
            tempMaxText.remove();
            
            // Sort by value (descending) to prioritize showing higher max values
            const sortedMaxLabels = [...rainMaxLabelsWithWidth].sort((a, b) => b.value - a.value);
            
            // Determine which labels to show (avoid overlaps)
            const minGap = 4;
            const rainMaxLabelsToShow = new Set<number>();
            const maxOccupiedRanges: Array<{start: number, end: number}> = [];
            
            for (const label of sortedMaxLabels) {
                const labelStart = label.xPos - label.width / 2;
                const labelEnd = label.xPos + label.width / 2;
                
                const overlaps = maxOccupiedRanges.some(range => 
                    (labelStart - minGap < range.end) && (labelEnd + minGap > range.start)
                );
                
                if (!overlaps) {
                    rainMaxLabelsToShow.add(label.index);
                    maxOccupiedRanges.push({start: labelStart, end: labelEnd});
                }
            }
            
            chart.selectAll(".rain-max-label")
                .data(rainMaxLabelsWithWidth)
                .enter()
                .append("text")
                .attr("class", "rain-max-label")
                .attr("x", (d: any) => d.xPos)
                .attr("y", (d: any) => {
                    const h = this.card._chartHeight - yPrecip(d.value);
                    const scaledH = h < 2 && d.value > 0 ? 2 : h * 0.7;
                    return yPrecip(0) - scaledH - 18; // 18px above the top of the max bar
                })
                .attr("text-anchor", "middle")
                .text((d: any) => d.labelText)
                .attr("opacity", (d: any) => rainMaxLabelsToShow.has(d.index) ? 1 : 0);
        }

        // Add precipitation legend if coordinates are provided
        if (legendX !== undefined && legendY !== undefined) {
            const precipUnit = this.card.getSystemPrecipitationUnit();
                chart.append("text")
                    .attr("class", "legend legend-rain")
                    .attr("x", legendX)
                    .attr("y", legendY)
                    .attr("text-anchor", "start")
                    .text(trnslt(this.card.hass, "ui.card.meteogram.attributes.precipitation", "Precipitation") + ` (${precipUnit})`);
        }
    }

     /**
     * Draw date labels at the top of the chart
     */
    public drawDateLabels(
        svg: any,
        time: Date[],
        dayStarts: number[],
        margin: { top: number; right: number; bottom: number; left: number },
        x: any,
        chartWidth: number,
        dateLabelY: number
    ) {
    if (!this.card.focussed) {
            svg.selectAll(".top-date-label")
                .data(dayStarts)
                .enter()
                .append("text")
                .attr("class", "top-date-label")
                .attr("x", (d: number, i: number) => {
                    // Ensure last label does not go outside chart area
                    const rawX = margin.left + x(d);
                    if (i === dayStarts.length - 1) {
                        // Cap to chart right edge minus a small margin
                        return Math.min(rawX, margin.left + chartWidth - 80);
                    }
                    return rawX;
                })
                .attr("y", dateLabelY)
                .attr("text-anchor", "start")
                .attr("opacity", (d: number, i: number) => {
                    // Check if there's enough space for this label
                    if (i === dayStarts.length - 1) return 1; // Always show the last day

                    const thisLabelPos = margin.left + x(d);
                    const nextLabelPos = margin.left + x(dayStarts[i + 1]);
                    const minSpaceNeeded = 100; // Minimum pixels needed between labels

                    // If not enough space between this and next label, hide this one
                    return nextLabelPos - thisLabelPos < minSpaceNeeded ? 0 : 1;
                })
                .text((d: number) => {
                    const dt = time[d];
                    // Use HA locale for date formatting
                    const haLocale = this.card.getHaLocale();
                    return dt.toLocaleDateString(haLocale, {weekday: "short", day: "2-digit", month: "short"});
                });
        }
    }
    public drawCloudBand(chart: any, cloudCover: (number|null)[], N: number, x: any, legendX?: number, legendY?: number) {
        const d3 = window.d3;
        // Filter out nulls for cloudCover array
        const cloudFiltered = cloudCover.map(c => c ?? 0);
        const bandTop = this.card._chartHeight * 0.01;
        const bandHeight = this.card._chartHeight * 0.20;
        const cloudBandPoints: [number, number][] = [];
        for (let i = 0; i < N; i++) {
            cloudBandPoints.push([x(i), bandTop + (bandHeight / 2) * (1 - cloudFiltered[i] / 100)]);
        }
        for (let i = N - 1; i >= 0; i--) {
            cloudBandPoints.push([x(i), bandTop + (bandHeight / 2) * (1 + cloudFiltered[i] / 100)]);
        }
        chart.append("path")
            .attr("class", "cloud-area")
            .attr("d", d3.line()
                .x((d: [number, number]) => d[0])
                .y((d: [number, number]) => d[1])
                .curve(d3.curveLinearClosed)(cloudBandPoints));
        // Render legend if legendX and legendY are provided
        if (legendX !== undefined && legendY !== undefined) {
            chart.append("text")
                .attr("class", "legend legend-cloud")
                .attr("x", legendX)
                .attr("y", legendY)
                .attr("text-anchor", "start")
                .text(trnslt(this.card.hass, "ui.card.meteogram.attributes.cloud_coverage", "Cloud Cover") + ` (%)`);
        }
    }
    public drawPressureLine(chart: any, pressure: (number|null)[], x: any, yPressure: any, legendX?: number, legendY?: number) {
        const d3 = window.d3;
    //
        const pressureLine = d3.line()
            .defined((d: number | null) => d !== null && typeof d === "number" && !isNaN(d))
            .x((_: number, i: number) => x(i))
            .y((d: number | null) => yPressure(d as number));

        chart.append("path")
            .datum(pressure)
            .attr("class", "pressure-line")
            .attr("d", pressureLine)
            .attr("fill", "none"); // Ensure no area fill, let CSS handle stroke

        // Draw right-side pressure axis
        const pressureDomain = yPressure.domain();
        const minPressure = Math.ceil(pressureDomain[0] / 10) * 10; // Round to nearest 10
        const maxPressure = Math.floor(pressureDomain[1] / 10) * 10; // Round to nearest 10
        const pressureTicks = [];
        for (let p = minPressure; p <= maxPressure; p += 10) { // Increment by 10 instead of 1
            pressureTicks.push(p);
        }
        chart.append("g")
            .attr("class", "pressure-axis")
            .attr("transform", `translate(${this.card._chartWidth}, 0)`)
            .call(d3.axisRight(yPressure)
                .tickValues(pressureTicks)
                .tickFormat(d3.format('d')));

        // Always draw axis label (if not in focussed mode)
        if (!this.card.focussed && this.card.displayMode !== "core") {
            chart.append("text")
                .attr("class", "axis-label")
                .attr("text-anchor", "middle")
                .attr("transform", `translate(${this.card._chartWidth + this.card._margin.right-20},${yPressure.range()[0] / 2}) rotate(90)`)
                .text(trnslt(this.card.hass, "ui.card.meteogram.attributes.air_pressure", "Pressure") + " (" + this.card._pressureUnit + ")");
        }

        // Draw colored top legend if coordinates are provided
        if (legendX !== undefined && legendY !== undefined) {
            chart.append("text")
                .attr("class", "legend legend-pressure")
                .attr("x", legendX)
                .attr("y", legendY)
                .attr("text-anchor", "start")
                .text(trnslt(this.card.hass, "ui.card.meteogram.attributes.air_pressure", "Pressure") + " (" + this.card._pressureUnit + ")");
        }
    }

    /**
     * Draw wind band (barbs, grid, background, border)
     */
    public drawWindBand(
        svg: any,
        x: any,
        windBandHeight: number,
        margin: any,
        width: number,
        N: number,
        time: Date[],
        windSpeed: (number|null)[],
        windGust: (number|null)[],
        windDirection: (number|null)[],
        windSpeedUnit: string
    ) {
        const d3 = window.d3;
        const windBandYOffset = margin.top + this.card._chartHeight;
        const windBand = svg.append('g')
            .attr('transform', `translate(${margin.left},${windBandYOffset})`);

        // Even hour grid lines
        const twoHourIdx: number[] = [];
        for (let i = 0; i < N; i++) {
            if (time[i].getHours() % 2 === 0) twoHourIdx.push(i);
        }

        windBand.selectAll(".wind-band-grid")
            .data(twoHourIdx)
            .enter()
            .append("line")
            .attr("class", "wind-band-grid")
            .attr("x1", (i: number) => x(i))
            .attr("x2", (i: number) => x(i))
            .attr("y1", 0)
            .attr("y2", windBandHeight)
            .attr("stroke", "currentColor")
            .attr("stroke-width", 1);

        // Wind band border (outline)
        windBand.append("rect")
            .attr("class", "wind-band-outline")
            .attr("x", 0)
            .attr("y", 0)
            .attr("width", this.card._chartWidth)
            .attr("height", windBandHeight)
            .attr("stroke", "currentColor")
            .attr("stroke-width", 2)
            .attr("fill", "none");

        windBand.append("rect")
            .attr("class", "wind-band-bg")
            .attr("x", 0)
            .attr("y", 0)
            .attr("width", this.card._chartWidth)
            .attr("height", windBandHeight);

        // Day change lines in wind band
        const dayChangeIdx = [];
        for (let i = 1; i < N; i++) {
            if (time[i].getDate() !== time[i - 1].getDate()) dayChangeIdx.push(i);
        }
        windBand.selectAll(".twentyfourh-line-wind")
            .data(dayChangeIdx)
            .enter()
            .append("line")
            .attr("class", "twentyfourh-line-wind")
            .attr("x1", (i: number) => x(i))
            .attr("x2", (i: number) => x(i))
            .attr("y1", 0)
            .attr("y2", windBandHeight);

        // Detect where data transitions from hourly to 6-hourly
        // Check intervals throughout the dataset
        const intervals: number[] = [];
        for (let i = 1; i < N; i++) {
            const intervalHours = (time[i].getTime() - time[i-1].getTime()) / (1000 * 60 * 60);
            intervals.push(intervalHours);
        }
        
        // Find where transition happens (interval jumps from ~1h to 6h)
        let transitionIdx = N; // Default: no transition
        for (let i = 1; i < intervals.length; i++) {
            if (intervals[i-1] < 3 && intervals[i] >= 4) {
                transitionIdx = i;
                break;
            }
        }
        
        // Build indices for wind barbs
        const windBarbIndices: number[] = [];
        
        // For hourly section: use even hours, place barbs between them
        const highResIndices: number[] = [];
        for (let i = 0; i < Math.min(transitionIdx, N); i++) {
            if (time[i].getHours() % 2 === 0) highResIndices.push(i);
        }
        
        // For 6-hourly section: use all data points directly
        const lowResIndices: number[] = [];
        for (let i = transitionIdx; i < N; i++) {
            lowResIndices.push(i);
        }
        
        // Create wind length scale once for all barbs
        const minBarbLen = width < 400 ? 18 : 23;
        const maxBarbLen = width < 400 ? 30 : 38;
        const windLenScale = d3.scaleLinear()
            .domain([0, Math.max(15, d3.max(windSpeed.filter(v => typeof v === 'number' && !isNaN(v))) || 20)])
            .range([minBarbLen, maxBarbLen]);
        
        // Now place wind barbs 
        const windBarbY = windBandHeight / 2;
        
        // Draw high-resolution barbs (between even hours)
        for (let idx = 0; idx < highResIndices.length - 1; idx++) {
            const startIdx = highResIndices[idx];
            const endIdx = highResIndices[idx + 1];
            if (width < 400 && idx % 2 !== 0) continue;
            const centerX = (x(startIdx) + x(endIdx)) / 2;
            const dataIdx = Math.floor((startIdx + endIdx) / 2);
            const speed = windSpeed[dataIdx];
            const gust = windGust[dataIdx];
            const dir = windDirection[dataIdx];
            if (typeof speed !== 'number' || typeof dir !== 'number' || isNaN(speed) || isNaN(dir)) continue;
            
            // Convert wind speeds to knots for proper wind barb calculation
            const speedInKnots = convertWindSpeed(speed, windSpeedUnit, "kt");
            const gustInKnots = typeof gust === 'number' && !isNaN(gust) ? convertWindSpeed(gust, windSpeedUnit, "kt") : null;
            
            const barbLen = windLenScale(speed);
            this.drawWindBarb(windBand, centerX, windBarbY, speedInKnots, gustInKnots, dir, barbLen, width < 400 ? 0.7 : 0.8);
        }
        
        // Draw low-resolution barbs (every other point for 6-hourly data = 12-hour intervals)
        for (let i = 0; i < lowResIndices.length; i++) {
            const dataIdx = lowResIndices[i];
            
            // For 6-hourly data, show every other point (12-hour intervals)
            // This is timezone-agnostic and adapts to when the data starts
            if (i % 2 !== 0) continue;
            
            if (width < 400 && i % 4 !== 0) continue; // On narrow screens, show every 24 hours (every 4th 6-hourly point)
            
            const speed = windSpeed[dataIdx];
            const gust = windGust[dataIdx];
            const dir = windDirection[dataIdx];
            
            if (typeof speed !== 'number' || typeof dir !== 'number' || isNaN(speed) || isNaN(dir)) continue;
            
            // Convert wind speeds to knots for proper wind barb calculation
            const speedInKnots = convertWindSpeed(speed, windSpeedUnit, "kt");
            const gustInKnots = typeof gust === 'number' && !isNaN(gust) ? convertWindSpeed(gust, windSpeedUnit, "kt") : null;
            
            const barbLen = windLenScale(speed);
            this.drawWindBarb(windBand, x(dataIdx), windBarbY, speedInKnots, gustInKnots, dir, barbLen, width < 400 ? 0.7 : 0.8);
        }
    }

    /**
     * Draw a wind barb at the given position
     */
    public drawWindBarb(
        g: any,
        x: number,
        y: number,
        speed: number,
        gust: number | null,
        dirDeg: number,
        len: number,
        scale = 0.8
    ) {
        const featherLong = 12;
        const featherShort = 6;
        const featherYOffset = 3;

        const barbGroup = g.append("g")
            .attr("transform", `translate(${x},${y}) rotate(${(dirDeg) % 360}) scale(${scale})`);

        const y0 = -len / 2, y1 = +len / 2;

        if (speed < 2) {
            barbGroup.append("circle")
                .attr("class", "wind-barb-calm")
                .attr("cx", 0)
                .attr("cy", 0)
                .attr("r", 4);
            return;
        }

        barbGroup.append("line")
            .attr("class", "wind-barb")
            .attr("x1", 0).attr("y1", y0)
            .attr("x2", 0).attr("y2", y1);

        barbGroup.append("circle")
            .attr("class", "wind-barb-dot")
            .attr("cx", 0)
            .attr("cy", y1)
            .attr("r", 4);

        let v = speed, wy = y0, step = 7;
        
        // Calculate pennants (50 knots each), then full feathers (10 knots), then half feathers (5 knots)
        let n50 = Math.floor(v / 50);
        v -= n50 * 50;
        let n10 = Math.floor(v / 10);
        v -= n10 * 10;
        let n5 = Math.floor(v / 5);
        v -= n5 * 5;

        // Draw pennants (triangles) for 50 knot increments
        for (let i = 0; i < n50; i++, wy += step * 1.5) {
            const pennantHeight = 10;
            const pennantWidth = featherLong;
            barbGroup.append("polygon")
                .attr("class", "wind-barb-pennant")
                .attr("points", `0,${wy} ${pennantWidth},${wy + featherYOffset} 0,${wy + pennantHeight}`)
                .attr("fill", "currentColor")
                .attr("stroke", "currentColor")
                .attr("stroke-width", 1);
        }

        // Draw full feathers for 10 knot increments
        for (let i = 0; i < n10; i++, wy += step) {
            barbGroup.append("line")
                .attr("class", "wind-barb-feather")
                .attr("x1", 0).attr("y1", wy)
                .attr("x2", featherLong).attr("y2", wy + featherYOffset)
                .attr("stroke-width", 2);
        }

        // Draw half feathers for 5 knot increments
        for (let i = 0; i < n5; i++, wy += step) {
            barbGroup.append("line")
                .attr("class", "wind-barb-half")
                .attr("x1", 0).attr("y1", wy)
                .attr("x2", featherShort).attr("y2", wy + featherYOffset / 1.5)
                .attr("stroke-width", 2);
        }

        // Draw gust feathers on the opposite side (left side) in yellow/orange
        // Only show gusts if they are greater than sustained wind speed
        if (typeof gust === 'number' && !isNaN(gust) && gust > speed) {
            let gustWy = y0;
            let gustV = gust; // Show absolute gust speed, not difference
            const gustStep = 7;
            
            // Calculate gust pennants, feathers, and half-feathers (showing absolute gust speed)
            let gustN50 = Math.floor(gustV / 50);
            gustV -= gustN50 * 50;
            let gustN10 = Math.floor(gustV / 10);
            gustV -= gustN10 * 10;
            let gustN5 = Math.floor(gustV / 5);
            
            // Draw gust pennants on the left side for 50 knot increments
            for (let i = 0; i < gustN50; i++, gustWy += gustStep * 1.5) {
                const pennantHeight = 10;
                const pennantWidth = -featherLong; // Negative for left side
                barbGroup.append("polygon")
                    .attr("class", "wind-barb-gust-pennant")
                    .attr("points", `0,${gustWy} ${pennantWidth},${gustWy + featherYOffset} 0,${gustWy + pennantHeight}`)
                    .attr("fill", "#FF8C00")
                    .attr("stroke", "#FF8C00")
                    .attr("stroke-width", 1);
            }
            
            // Draw gust feathers on the left side (negative x values)
            for (let i = 0; i < gustN10; i++, gustWy += gustStep) {
                barbGroup.append("line")
                    .attr("class", "wind-barb-gust-feather")
                    .attr("x1", 0).attr("y1", gustWy)
                    .attr("x2", -featherLong).attr("y2", gustWy + featherYOffset)
                    .attr("stroke", "#FF8C00") // Orange color for gusts
                    .attr("stroke-width", 2);
            }
            
            for (let i = 0; i < gustN5; i++, gustWy += gustStep) {
                barbGroup.append("line")
                    .attr("class", "wind-barb-gust-half")
                    .attr("x1", 0).attr("y1", gustWy)
                    .attr("x2", -featherShort).attr("y2", gustWy + featherYOffset / 1.5)
                    .attr("stroke", "#FFA500") // Slightly lighter orange for half-feathers
                    .attr("stroke-width", 2);
            }
        }
    }
}
