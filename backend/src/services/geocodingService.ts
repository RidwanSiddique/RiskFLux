import axios from "axios";
import { env } from "../config/env";

interface GeocodingResult {
    latitude: number;
    longitude: number;
    address: string;
    country: string;
    region: string;
}

interface ReverseGeocodingResult {
    address: string;
    country: string;
    region: string;
    city: string;
}

/**
 * Convert address to coordinates using OpenStreetMap Nominatim API
 */
export async function geocodeAddress(address: string): Promise<GeocodingResult | null> {
    try {
        const response = await axios.get(`${env.OPENSTREETMAP_API}/search`, {
            params: {
                q: address,
                format: "json",
                limit: 1,
            },
            timeout: 10000,
        });

        if (!response.data || response.data.length === 0) {
            return null;
        }

        const result = response.data[0];
        return {
            latitude: parseFloat(result.lat),
            longitude: parseFloat(result.lon),
            address: result.display_name,
            country: result.address?.country || "",
            region: result.address?.state || result.address?.province || "",
        };
    } catch (error) {
        console.error("Geocoding error:", error);
        return null;
    }
}

/**
 * Convert coordinates to address using OpenStreetMap Nominatim API
 */
export async function reverseGeocode(latitude: number, longitude: number): Promise<ReverseGeocodingResult | null> {
    try {
        const response = await axios.get(`${env.OPENSTREETMAP_API}/reverse`, {
            params: {
                lat: latitude,
                lon: longitude,
                format: "json",
            },
            timeout: 10000,
        });

        if (!response.data) {
            return null;
        }

        const result = response.data.address;
        return {
            address: response.data.display_name,
            country: result?.country || "",
            region: result?.state || result?.province || "",
            city: result?.city || result?.town || result?.village || "",
        };
    } catch (error) {
        console.error("Reverse geocoding error:", error);
        return null;
    }
}
