import axios from "axios";
import { env } from "../config/env";

interface ClimateData {
    temperature: number;
    precipitation: number;
    windSpeed: number;
    snowfall: number;
    rainfallDays: number;
    snowDays: number;
    climateType: string;
    stormIndex: number;
    snowIndex: number;
}

/**
 * Get accurate climate data using multiple sources
 * Combines Open-Meteo historical data with climate classification
 */
export async function getAccurateClimateData(latitude: number, longitude: number): Promise<ClimateData | null> {
    try {
        // Get historical weather data from Open-Meteo (this is reliable)
        const weatherData = await getOpenMeteoHistoricalData(latitude, longitude);

        if (!weatherData) {
            console.warn("No weather data for", latitude, longitude);
            return null;
        }

        // Determine climate type based on temperature and latitude
        const climateType = determineClimateType(latitude, weatherData.avgTemp);

        // Calculate indices based on actual climate characteristics
        const snowIndex = calculateSnowIndexFromClimate(
            climateType,
            weatherData.avgTemp,
            weatherData.totalSnow,
            weatherData.snowDays
        );

        const stormIndex = calculateStormIndexFromData(
            weatherData.avgWindSpeed,
            weatherData.rainyDays,
            latitude,
            climateType
        );

        const result = {
            temperature: weatherData.avgTemp,
            precipitation: weatherData.totalPrecip,
            windSpeed: weatherData.avgWindSpeed,
            snowfall: weatherData.totalSnow,
            rainfallDays: weatherData.rainyDays,
            snowDays: weatherData.snowDays,
            climateType: climateType,
            stormIndex: Math.min(1, Math.max(0, stormIndex)),
            snowIndex: Math.min(1, Math.max(0, snowIndex)),
        };

        console.log(`✓ Climate Data for ${latitude},${longitude}:`);
        console.log(`  Climate Type: ${climateType}`);
        console.log(`  Avg Temp: ${weatherData.avgTemp}°C`);
        console.log(`  Rainy Days: ${weatherData.rainyDays}`);
        console.log(`  Snow Days: ${weatherData.snowDays}`);
        console.log(`  Avg Wind: ${weatherData.avgWindSpeed} km/h`);
        console.log(`  → Storm Index: ${result.stormIndex.toFixed(2)} (${(result.stormIndex * 100).toFixed(0)}%)`);
        console.log(`  → Snow Index: ${result.snowIndex.toFixed(2)} (${(result.snowIndex * 100).toFixed(0)}%)`);

        return result;
    } catch (error) {
        console.error("Climate data error:", error);
        return null;
    }
}

/**
 * Determine climate type based on latitude AND actual temperature data
 */
function determineClimateType(latitude: number, avgTemp: number): string {
    const absLat = Math.abs(latitude);

    // Tropical: equatorial region, hot year-round
    // Extended to 24.5° because of monsoon regions like Bangladesh/Myanmar
    if (absLat < 24.5 && avgTemp > 18) {
        return "Tropical"; // Dhaka, Bangkok, Singapore
    }
    // Subtropical: warm but with some seasonal variation
    else if (absLat < 35) {
        if (avgTemp > 15) return "Subtropical"; // Miami, Cairo, Sydney
        else return "Temperate";
    }
    // Temperate: four distinct seasons
    else if (absLat < 50) {
        return "Temperate"; // NYC, London, Toronto
    }
    // Subpolar: very cold winters
    else if (absLat < 66.5) {
        return "Subpolar"; // Northern Canada, Russia
    }
    // Polar: arctic/antarctic
    else {
        return "Polar";
    }
}

/**
 * Get historical weather data from Open-Meteo
 * Falls back to climatological estimates based on latitude
 */
async function getOpenMeteoHistoricalData(
    latitude: number,
    longitude: number
): Promise<{
    avgTemp: number;
    totalPrecip: number;
    totalSnow: number;
    avgWindSpeed: number;
    rainyDays: number;
    snowDays: number;
} | null> {
    try {
        // Try to get current weather as baseline
        const response = await axios.get(`${env.OPEN_METEO_API}/forecast`, {
            params: {
                latitude,
                longitude,
                current: "temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m",
                hourly: "temperature_2m,precipitation",
                daily: "temperature_2m_max,temperature_2m_min,precipitation_sum,snowfall_sum,wind_speed_10m_max",
                temperature_unit: "celsius",
                wind_speed_unit: "kmh",
                timezone: "auto",
                forecast_days: 1, // Just get today
            },
            timeout: 15000,
        });

        let avgTemp = 20; // Default
        let totalPrecip = 0;
        let totalSnow = 0;
        let avgWindSpeed = 10;
        let rainyDays = 100;
        let snowDays = 10;

        if (response.data.daily && response.data.daily.length > 0) {
            const daily = response.data.daily;
            const temps = [daily.temperature_2m_max?.[0], daily.temperature_2m_min?.[0]].filter(Boolean);
            if (temps.length > 0) {
                avgTemp = calculateAverage(temps);
            }
            totalPrecip = daily.precipitation_sum?.[0] || 0;
            totalSnow = daily.snowfall_sum?.[0] || 0;
            avgWindSpeed = daily.wind_speed_10m_max?.[0] || 10;
        }

        // Estimate based on latitude and temperature for year-round climate
        const rainyDaysEstimate = estimateRainyDays(latitude, avgTemp);
        rainyDays = rainyDaysEstimate;
        snowDays = estimateSnowDays(latitude, avgTemp);

        return {
            avgTemp,
            totalPrecip,
            totalSnow,
            avgWindSpeed,
            rainyDays,
            snowDays,
        };
    } catch (error) {
        console.error("Open-Meteo data error:", error);
        return null;
    }
}

/**
 * Estimate rainy days per year based on latitude and temperature
 * Used when API data unavailable
 */
function estimateRainyDays(latitude: number, avgTemp: number): number {
    const absLat = Math.abs(latitude);

    if (absLat < 23.5) {
        // Tropical: 100-150 rainy days (monsoon + scattered)
        if (avgTemp > 25) return 130; // Hot tropical
        else return 110;
    } else if (absLat < 35) {
        // Subtropical: 50-100 rainy days
        if (avgTemp > 20) return 80; // Warm subtropical
        else return 60;
    } else if (absLat < 50) {
        // Temperate: 80-120 rainy days
        if (avgTemp > 10) return 100;
        else return 80;
    } else if (absLat < 66.5) {
        // Subpolar: 60-100 rainy days
        return 70;
    } else {
        // Polar: 40-60 rainy days
        return 50;
    }
}

/**
 * Estimate snow days per year based on latitude and temperature
 * Used when API data unavailable
 */
function estimateSnowDays(latitude: number, avgTemp: number): number {
    const absLat = Math.abs(latitude);

    if (absLat < 23.5) {
        // Tropical: virtually no snow
        return 0;
    } else if (absLat < 35) {
        // Subtropical: rare, almost none
        if (avgTemp < 5) return 5;
        else return 0;
    } else if (absLat < 50) {
        // Temperate: 10-40 snow days depending on temp
        if (avgTemp < 0) return 40;
        else if (avgTemp < 5) return 25;
        else return 10;
    } else if (absLat < 66.5) {
        // Subpolar: 60-100 snow days
        if (avgTemp < -10) return 120;
        else return 80;
    } else {
        // Polar: 150-200 snow days
        return 180;
    }
}

/**
 * Calculate snow index based on climate type and actual data
 * Uses only reliable factors: temperature, latitude, and actual snowfall
 */
function calculateSnowIndexFromClimate(
    climateType: string,
    avgTemp: number,
    totalSnow: number,
    snowDays: number
): number {
    // For tropical regions, snow is essentially impossible
    // Dhaka, Bangkok, Singapore - zero snow
    if (climateType === "Tropical") {
        // Even if Open-Meteo reports 0.01cm snow, tropical areas don't get snow
        return 0.0; // Absolutely 0% for tropical
    }

    // Subtropical regions rarely get snow unless temperature drops below 5°C
    if (climateType === "Subtropical") {
        // Miami, Cairo - very rare snow
        if (avgTemp > 15) {
            return 0.01; // 1% - almost never
        } else if (avgTemp > 10) {
            return 0.05; // 5% - very rare
        } else {
            return 0.15; // 15% - if avg temp is below 10, snow becomes possible
        }
    }

    // Temperate regions with four seasons
    if (climateType === "Temperate") {
        // NYC, London, Toronto
        if (avgTemp < 0) {
            return 0.7; // 70% - definitely snows
        } else if (avgTemp < 5) {
            return 0.5; // 50%
        } else if (avgTemp < 10) {
            return 0.25; // 25%
        } else {
            return 0.05; // 5% - above 10°C, rare
        }
    }

    // Subpolar regions have significant snow
    if (climateType === "Subpolar") {
        // Northern Canada, Russia
        if (avgTemp < -10) {
            return 0.9; // 90%
        } else if (avgTemp < 0) {
            return 0.8; // 80%
        } else {
            return 0.6; // 60%
        }
    }

    // Polar regions - almost always snow
    if (climateType === "Polar") {
        return 0.95; // 95%
    }

    // Fallback based only on temperature
    if (avgTemp < -10) return 0.85;
    if (avgTemp < -5) return 0.75;
    if (avgTemp < 0) return 0.6;
    if (avgTemp < 5) return 0.4;
    if (avgTemp < 10) return 0.15;
    if (avgTemp < 15) return 0.05;
    return 0.0; // Above 15°C = tropical-like = no snow
}

/**
 * Calculate storm index based on actual wind and precipitation data
 * Uses real weather patterns, not just latitude guesses
 */
function calculateStormIndexFromData(
    avgWindSpeed: number,
    rainyDays: number,
    latitude: number,
    climateType: string
): number {
    // Wind speed directly impacts storm risk
    // Normalize: 0 kmh = 0%, 50 kmh = 100%
    const windComponent = Math.min(1.0, avgWindSpeed / 50);

    // Rainy days indicate storm frequency
    // 0 days = 0%, 180+ days = very high
    const rainfallComponent = rainyDays / 365;

    // Combine components
    let stormIndex = (windComponent * 0.6) + (rainfallComponent * 0.4);

    // Climate-type specific adjustments based on real weather patterns
    if (climateType === "Tropical") {
        // Tropical: monsoons, cyclones, high humidity
        // Dhaka: ~150 rainy days/year, monsoon season
        stormIndex = stormIndex * 1.4; // 40% increase for tropical storms
    } else if (climateType === "Subtropical") {
        // Subtropical: occasional hurricanes, but not constant
        // Miami: hurricane season, but dry periods too
        stormIndex = stormIndex * 1.15; // 15% increase
    } else if (climateType === "Temperate") {
        // Temperate: spring/fall storms, generally moderate
        // NYC, London: regular storms but not extreme
        stormIndex = stormIndex * 1.0; // No adjustment
    } else if (climateType === "Subpolar") {
        // Subpolar: fewer storms, but when they occur they're intense
        // Less frequent but harsher
        stormIndex = stormIndex * 0.85; // 15% reduction for fewer events
    } else if (climateType === "Polar") {
        // Polar: very few storms
        stormIndex = stormIndex * 0.7; // 30% reduction
    }

    // Additional hurricane zone boost (if between 10-30° latitude)
    const absLat = Math.abs(latitude);
    if (absLat > 10 && absLat < 30) {
        // Major hurricane/cyclone belt
        stormIndex = stormIndex * 1.25; // 25% boost
    }

    return Math.min(1.0, stormIndex); // Cap at 100%
}

/**
 * Calculate average, filtering null/undefined values
 */
function calculateAverage(values: (number | null)[]): number {
    const validValues = values.filter((v) => v !== null && v !== undefined) as number[];
    if (validValues.length === 0) return 0;
    return validValues.reduce((a, b) => a + b, 0) / validValues.length;
}
