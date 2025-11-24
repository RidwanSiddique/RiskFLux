import axios from "axios";
import { env } from "../config/env";

interface WeatherMetrics {
    temperature: number;
    precipitation: number;
    windSpeed: number;
    snowfall: number;
    rainfallDays: number;
    snowDays: number;
    stormIndex: number; // 0-1 scale
    snowIndex: number; // 0-1 scale
}

/**
 * Get climate and weather metrics for a location using Open-Meteo API
 * Analyzes historical data to determine risk indices
 */
export async function getWeatherMetrics(latitude: number, longitude: number): Promise<WeatherMetrics | null> {
    try {
        // Get historical climate data for the past year
        const endDate = new Date();
        const startDate = new Date(endDate);
        startDate.setFullYear(startDate.getFullYear() - 1);

        const response = await axios.get(`${env.OPEN_METEO_API}/archive`, {
            params: {
                latitude,
                longitude,
                start_date: startDate.toISOString().split("T")[0],
                end_date: endDate.toISOString().split("T")[0],
                daily: ["temperature_2m_mean", "precipitation_sum", "snowfall_sum", "wind_speed_10m_max"].join(","),
                temperature_unit: "celsius",
                wind_speed_unit: "kmh",
                timezone: "auto",
            },
            timeout: 15000,
        });

        if (!response.data.daily) {
            throw new Error("No weather data returned");
        }

        const daily = response.data.daily;
        const temps = daily.temperature_2m_mean || [];
        const precip = daily.precipitation_sum || [];
        const snow = daily.snowfall_sum || [];
        const windSpeeds = daily.wind_speed_10m_max || [];

        // Calculate averages and metrics
        const avgTemp = calculateAverage(temps);
        const totalPrecip = precip.reduce((a: number, b: number) => a + (b || 0), 0);
        const totalSnow = snow.reduce((a: number, b: number) => a + (b || 0), 0);
        const avgWindSpeed = calculateAverage(windSpeeds);

        // Count rainy and snowy days
        const rainyDays = precip.filter((p: number) => p && p > 1).length; // > 1mm
        const snowyDays = snow.filter((s: number) => s && s > 1).length; // > 1cm

        // Calculate risk indices (0-1 scale)
        const stormIndex = calculateStormIndex(avgWindSpeed, rainyDays);
        const snowIndex = calculateSnowIndex(avgTemp, totalSnow, snowyDays);

        return {
            temperature: Math.round(avgTemp * 10) / 10,
            precipitation: Math.round(totalPrecip),
            windSpeed: Math.round(avgWindSpeed * 10) / 10,
            snowfall: Math.round(totalSnow),
            rainfallDays: rainyDays,
            snowDays: snowyDays,
            stormIndex: Math.min(1, Math.max(0, stormIndex)),
            snowIndex: Math.min(1, Math.max(0, snowIndex)),
        };
    } catch (error) {
        console.error("Weather metrics error:", error);
        return null;
    }
}

/**
 * Get current weather conditions
 */
export async function getCurrentWeather(latitude: number, longitude: number) {
    try {
        const response = await axios.get(`${env.OPEN_METEO_API}/forecast`, {
            params: {
                latitude,
                longitude,
                current: ["temperature_2m", "relative_humidity_2m", "precipitation", "weather_code", "wind_speed_10m"].join(","),
                timezone: "auto",
            },
            timeout: 10000,
        });

        return response.data.current;
    } catch (error) {
        console.error("Current weather error:", error);
        return null;
    }
}

/**
 * Calculate storm index based on wind speed and rainfall frequency
 * Higher wind speeds and more rainy days = higher storm risk
 */
function calculateStormIndex(avgWindSpeed: number, rainyDays: number): number {
    // Wind speed component (0-1): normalize to 0-60 kmh range
    const windComponent = Math.min(1, avgWindSpeed / 60) * 0.6;

    // Rainfall frequency component (0-1): normalize to 0-365 days
    const rainfallComponent = (rainyDays / 365) * 0.4;

    return windComponent + rainfallComponent;
}

/**
 * Calculate snow index based on temperature and snowfall
 * Lower temperatures and more snowfall = higher snow risk
 */
function calculateSnowIndex(avgTemp: number, totalSnow: number, snowyDays: number): number {
    // Temperature component: regions below 0°C get higher scores
    let tempComponent = 0;
    if (avgTemp < 0) {
        tempComponent = Math.min(0.7, Math.abs(avgTemp) / 20);
    }

    // Snowfall component (0-1): normalize to 0-500cm per year
    const snowfallComponent = Math.min(0.3, totalSnow / 500);

    // Snow days component (0-1): normalize to 0-365 days
    const snowDaysComponent = Math.min(0.1, snowyDays / 365);

    return tempComponent + snowfallComponent + snowDaysComponent;
}

/**
 * Calculate average of array, filtering out null/undefined values
 */
function calculateAverage(values: (number | null)[]): number {
    const validValues = values.filter((v) => v !== null && v !== undefined) as number[];
    if (validValues.length === 0) return 0;
    return validValues.reduce((a, b) => a + b, 0) / validValues.length;
}
