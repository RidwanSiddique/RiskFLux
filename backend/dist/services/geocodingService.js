"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.geocodeAddress = geocodeAddress;
exports.reverseGeocode = reverseGeocode;
const axios_1 = __importDefault(require("axios"));
const env_1 = require("../config/env");
/**
 * Convert address to coordinates using OpenStreetMap Nominatim API
 */
async function geocodeAddress(address) {
    try {
        const response = await axios_1.default.get(`${env_1.env.OPENSTREETMAP_API}/search`, {
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
    }
    catch (error) {
        console.error("Geocoding error:", error);
        return null;
    }
}
/**
 * Convert coordinates to address using OpenStreetMap Nominatim API
 */
async function reverseGeocode(latitude, longitude) {
    try {
        const response = await axios_1.default.get(`${env_1.env.OPENSTREETMAP_API}/reverse`, {
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
    }
    catch (error) {
        console.error("Reverse geocoding error:", error);
        return null;
    }
}
