"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.computeHazardScores = computeHazardScores;
function computeHazardScores(factors, config) {
    const { weights } = config;
    const floodScoreRaw = weights.distance_to_water_km *
        normalizeInverseDistance(factors.distance_to_water_km) +
        weights.elevation_m * normalizeInverseElevation(factors.elevation_m);
    const stormScoreRaw = weights.storm_index * normalize0to1(factors.storm_index) * 100;
    const snowScoreRaw = weights.snow_index * normalize0to1(factors.snow_index) * 100;
    const floodScore = clampScore(floodScoreRaw);
    const stormScore = clampScore(stormScoreRaw);
    const snowScore = clampScore(snowScoreRaw);
    const overallScore = clampScore((floodScore + stormScore + snowScore) / 3);
    const contributions = [
        {
            factorName: "distance_to_water_km",
            factorValue: factors.distance_to_water_km,
            weight: weights.distance_to_water_km,
            contribution: floodScore * weights.distance_to_water_km,
        },
        {
            factorName: "elevation_m",
            factorValue: factors.elevation_m,
            weight: weights.elevation_m,
            contribution: floodScore * weights.elevation_m,
        },
        {
            factorName: "storm_index",
            factorValue: factors.storm_index,
            weight: weights.storm_index,
            contribution: stormScore * weights.storm_index,
        },
        {
            factorName: "snow_index",
            factorValue: factors.snow_index,
            weight: weights.snow_index,
            contribution: snowScore * weights.snow_index,
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
function normalizeInverseDistance(km) {
    const v = 1 / (1 + km); // closer water -> higher
    return v * 100;
}
function normalizeInverseElevation(elev) {
    if (elev <= 400)
        return 100;
    if (elev >= 600)
        return 20;
    const t = (elev - 400) / 200;
    return 100 - t * 80;
}
