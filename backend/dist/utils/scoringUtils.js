"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.computeHazardScores = computeHazardScores;
function computeHazardScores(factors, config) {
    const { weights } = config;
    // FLOOD SCORE: Use direct flood index if available, otherwise calculate from distance/elevation
    let floodScore = 0;
    if (factors.flood_index !== undefined) {
        // Use real flood risk data
        floodScore = clampScore(factors.flood_index * 100);
        console.log(`  Flood Score (from flood_index): ${floodScore}`);
    }
    else {
        // Fallback: Based on distance to water and elevation
        const distanceFloodComponent = normalizeFloodDistance(factors.distance_to_water_km) * weights.distance_to_water_km;
        const elevationFloodComponent = normalizeFloodElevation(factors.elevation_m) * weights.elevation_m;
        floodScore = clampScore((distanceFloodComponent + elevationFloodComponent) / (weights.distance_to_water_km + weights.elevation_m) * 80);
        console.log(`  Flood Score (from distance+elevation): ${floodScore}`);
    }
    // STORM SCORE: Based on storm index (wind + rain frequency)
    // 0.0 = no storms, 1.0 = extreme storms
    const stormScoreRaw = factors.storm_index * 100; // Convert 0-1 to 0-100 scale
    const stormScore = clampScore(stormScoreRaw);
    // SNOW SCORE: Based on climate type and snow index
    // For tropical: Should be 0-1, not higher
    // For temperate: Can be 20-60
    // For alpine: Can be 60-95
    const snowScoreRaw = factors.snow_index * 100; // Convert 0-1 to 0-100 scale
    const snowScore = clampScore(snowScoreRaw);
    // OVERALL SCORE: Average of three hazards
    const overallScore = clampScore((floodScore + stormScore + snowScore) / 3);
    const contributions = [
        {
            factorName: "distance_to_water_km",
            factorValue: factors.distance_to_water_km,
            weight: weights.distance_to_water_km,
            contribution: (factors.flood_index ?? 0.2) * weights.distance_to_water_km * 100,
        },
        {
            factorName: "elevation_m",
            factorValue: factors.elevation_m,
            weight: weights.elevation_m,
            contribution: (factors.flood_index ?? 0.2) * weights.elevation_m * 100,
        },
        {
            factorName: "storm_index",
            factorValue: factors.storm_index,
            weight: weights.storm_index,
            contribution: factors.storm_index * weights.storm_index * 100,
        },
        {
            factorName: "snow_index",
            factorValue: factors.snow_index,
            weight: weights.snow_index,
            contribution: factors.snow_index * weights.snow_index * 100,
        },
    ];
    return { floodScore, stormScore, snowScore, overallScore, contributions };
}
function clampScore(x) {
    const v = Math.round(Math.max(0, Math.min(100, x)));
    return isNaN(v) ? 0 : v;
}
function normalize0to1(x) {
    return Math.max(0, Math.min(1, x));
}
/**
 * Normalize distance to water for flood risk
 * Closer to water = higher flood risk
 * 0-1km = 100 (very high risk)
 * 1-5km = 50-100 (high risk)
 * 5-10km = 20-50 (medium risk)
 * 10+km = 0-20 (low risk)
 */
function normalizeFloodDistance(km) {
    if (km <= 0.5)
        return 100;
    if (km <= 1)
        return 90;
    if (km <= 2)
        return 75;
    if (km <= 5)
        return 50;
    if (km <= 10)
        return 25;
    return Math.max(5, 25 - (km - 10) * 1);
}
/**
 * Normalize elevation for flood risk
 * Lower elevation = higher flood risk
 * Sea level/low areas = 100 (very high risk)
 * 100-300m = 50-100 (high risk)
 * 300-500m = 30-50 (medium risk)
 * 500m+ = <30 (low risk)
 */
function normalizeFloodElevation(elevation) {
    if (elevation <= 10)
        return 100; // Sea level/coastal areas
    if (elevation <= 50)
        return 90;
    if (elevation <= 100)
        return 80;
    if (elevation <= 200)
        return 60;
    if (elevation <= 300)
        return 40;
    if (elevation <= 500)
        return 25;
    if (elevation <= 1000)
        return 10;
    return 5; // Very high elevation
}
