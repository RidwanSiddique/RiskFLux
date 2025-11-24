import axios from "axios";

interface WaterFeature {
    type: "river" | "lake" | "ocean" | "canal" | "stream";
    distance: number;
    name?: string;
}

interface DistanceResult {
    nearestDistance: number;
    nearestType: string;
    features: WaterFeature[];
}

const OVERPASS_API = "https://overpass-api.de/api/interpreter";

/**
 * Calculate distance to nearest water body using Overpass API
 * Searches for rivers, lakes, oceans, streams, and canals
 */
export async function getDistanceToWater(latitude: number, longitude: number): Promise<DistanceResult | null> {
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

        const response = await axios.post(OVERPASS_API, `data=${encodeURIComponent(query)}`, {
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
        const features: WaterFeature[] = [];

        for (const element of response.data.elements) {
            if (element.center) {
                const distance = haversineDistance(latitude, longitude, element.center.lat, element.center.lon);

                let type: WaterFeature["type"] = "river";
                if (element.tags?.waterway) {
                    const wayType = element.tags.waterway;
                    if (["river", "stream", "canal"].includes(wayType)) {
                        type = wayType as WaterFeature["type"];
                    }
                } else if (element.tags?.natural === "water" || element.tags?.natural === "coastline") {
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
    } catch (error) {
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
function haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Earth's radius in km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}
