"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDistanceToWater = getDistanceToWater;
const axios_1 = __importDefault(require("axios"));
const OVERPASS_API = "https://overpass-api.de/api/interpreter";
/**
 * Calculate distance to nearest water body using Overpass API
 * Searches for rivers, lakes, oceans, streams, and canals
 */
async function getDistanceToWater(latitude, longitude) {
    try {
        // Use a reasonable search radius (5km)
        const radiusKm = 5;
        // Query for water features using Overpass QL
        const query = `
            [bbox:${latitude - radiusKm / 111},${longitude - radiusKm / (111 * Math.cos((latitude * Math.PI) / 180))},${latitude + radiusKm / 111},${longitude + radiusKm / (111 * Math.cos((latitude * Math.PI) / 180))}];
            (
                way["water"=*];
                way["waterway"=river];
                way["waterway"=stream];
                way["waterway"=canal];
                way["natural"=water];
                way["natural"=coastline];
                relation["water"=*];
                relation["waterway"=*];
                relation["natural"=water];
            );
            out center;
        `;
        const response = await axios_1.default.post(OVERPASS_API, `data=${encodeURIComponent(query)}`, {
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
            },
            timeout: 15000,
        });
        if (!response.data.elements || response.data.elements.length === 0) {
            // No water bodies found, return a default distance
            return {
                nearestDistance: 10, // 10km default
                nearestType: "unknown",
                features: [],
            };
        }
        // Calculate distances to all found water features
        const features = [];
        for (const element of response.data.elements) {
            if (element.center) {
                const distance = haversineDistance(latitude, longitude, element.center.lat, element.center.lon);
                let type = "river";
                if (element.tags?.waterway) {
                    const wayType = element.tags.waterway;
                    if (["river", "stream", "canal"].includes(wayType)) {
                        type = wayType;
                    }
                }
                else if (element.tags?.natural === "water" || element.tags?.natural === "coastline") {
                    type = "lake";
                }
                features.push({
                    type,
                    distance,
                    name: element.tags?.name,
                });
            }
        }
        if (features.length === 0) {
            return {
                nearestDistance: 10,
                nearestType: "unknown",
                features: [],
            };
        }
        // Sort by distance and get nearest
        features.sort((a, b) => a.distance - b.distance);
        const nearest = features[0];
        return {
            nearestDistance: nearest.distance,
            nearestType: nearest.type,
            features: features.slice(0, 5), // Return top 5 nearest
        };
    }
    catch (error) {
        console.error("Water distance calculation error:", error);
        // Return a safe default on error
        return {
            nearestDistance: 5,
            nearestType: "unknown",
            features: [],
        };
    }
}
/**
 * Calculate distance between two coordinates using Haversine formula
 * Returns distance in kilometers
 */
function haversineDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Earth's radius in km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}
