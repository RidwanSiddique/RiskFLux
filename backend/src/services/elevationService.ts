import axios from "axios";
import { env } from "../config/env";

interface ElevationResult {
    elevation: number;
    accuracy: number;
}

/**
 * Get elevation for a location using Open-Meteo API (free, no API key needed)
 * Fallback to Google Elevation API if key is provided (more accurate)
 */
export async function getElevation(latitude: number, longitude: number): Promise<ElevationResult | null> {
    // Try Google API first if key is available
    if (env.GOOGLE_API_KEY) {
        try {
            return await getElevationFromGoogle(latitude, longitude);
        } catch (error) {
            console.warn("Google Elevation API failed, falling back to Open-Meteo:", error);
        }
    }

    // Fallback to Open-Meteo (free)
    try {
        return await getElevationFromOpenMeteo(latitude, longitude);
    } catch (error) {
        console.error("Elevation service error:", error);
        return null;
    }
}

/**
 * Get elevation from Open-Meteo API (free)
 */
async function getElevationFromOpenMeteo(latitude: number, longitude: number): Promise<ElevationResult> {
    const response = await axios.get(`${env.OPEN_METEO_API}/elevation`, {
        params: {
            latitude,
            longitude,
        },
        timeout: 10000,
    });

    if (!response.data.elevation || response.data.elevation.length === 0) {
        throw new Error("No elevation data returned");
    }

    return {
        elevation: response.data.elevation[0],
        accuracy: 30, // Open-Meteo typical accuracy in meters
    };
}

/**
 * Get elevation from Google Elevation API (requires API key)
 */
async function getElevationFromGoogle(latitude: number, longitude: number): Promise<ElevationResult> {
    const response = await axios.get(env.GOOGLE_ELEVATION_API, {
        params: {
            locations: `${latitude},${longitude}`,
            key: env.GOOGLE_API_KEY,
        },
        timeout: 10000,
    });

    if (!response.data.results || response.data.results.length === 0) {
        throw new Error("No elevation data from Google API");
    }

    return {
        elevation: response.data.results[0].elevation,
        accuracy: response.data.results[0].resolution,
    };
}
