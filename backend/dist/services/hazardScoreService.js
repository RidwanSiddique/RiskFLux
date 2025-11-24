"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createHazardScore = createHazardScore;
const prismaClient_1 = require("../db/prismaClient");
const modelConfig_1 = require("../config/modelConfig");
const scoringUtils_1 = require("../utils/scoringUtils");
const elevationService_1 = require("./elevationService");
const waterDistanceService_1 = require("./waterDistanceService");
const climateDataService_1 = require("./climateDataService");
const floodRiskService_1 = require("./floodRiskService");
const geocodingService_1 = require("./geocodingService");
const cacheService_1 = require("./cacheService");
async function createHazardScore(input) {
    const { address, latitude, longitude, userId } = input;
    // Try to get cached data first
    let cachedElevation = cacheService_1.locationCache.get(latitude, longitude, "elevation");
    let cachedWaterDist = cacheService_1.locationCache.get(latitude, longitude, "water_distance");
    let cachedWeather = cacheService_1.locationCache.get(latitude, longitude, "weather");
    let cachedFlood = cacheService_1.locationCache.get(latitude, longitude, "flood_index");
    // Fetch missing data from APIs
    if (!cachedElevation) {
        const elevData = await (0, elevationService_1.getElevation)(latitude, longitude);
        cachedElevation = elevData?.elevation ?? 400;
        cacheService_1.locationCache.set(latitude, longitude, "elevation", cachedElevation);
    }
    if (!cachedWaterDist) {
        const waterData = await (0, waterDistanceService_1.getDistanceToWater)(latitude, longitude);
        cachedWaterDist = waterData?.nearestDistance ?? 5;
        cacheService_1.locationCache.set(latitude, longitude, "water_distance", cachedWaterDist);
    }
    if (!cachedWeather) {
        const climateData = await (0, climateDataService_1.getAccurateClimateData)(latitude, longitude);
        cachedWeather = {
            storm_index: climateData?.stormIndex ?? 0.5,
            snow_index: climateData?.snowIndex ?? 0.3,
        };
        cacheService_1.locationCache.set(latitude, longitude, "weather", cachedWeather);
    }
    if (!cachedFlood) {
        const floodData = await (0, floodRiskService_1.calculateFloodRiskIndex)(latitude, longitude);
        cachedFlood = floodData?.floodIndex ?? 0.2;
        cacheService_1.locationCache.set(latitude, longitude, "flood_index", cachedFlood);
    }
    // Get reverse geocoded address if not provided
    let finalAddress = address;
    if (!finalAddress) {
        const geoData = await (0, geocodingService_1.reverseGeocode)(latitude, longitude);
        finalAddress = geoData?.address || `${latitude}, ${longitude}`;
    }
    const distance_to_water_km = cachedWaterDist;
    const elevation_m = cachedElevation;
    const storm_index = cachedWeather.storm_index;
    const snow_index = cachedWeather.snow_index;
    const flood_index = cachedFlood;
    // Log the factors being used
    console.log("=== HAZARD SCORE CALCULATION ===");
    console.log(`Location: ${latitude}, ${longitude}`);
    console.log(`Elevation: ${elevation_m}m`);
    console.log(`Distance to Water: ${distance_to_water_km}km`);
    console.log(`Flood Index: ${flood_index.toFixed(2)} (0-1 scale)`);
    console.log(`Storm Index: ${storm_index} (0-1 scale)`);
    console.log(`Snow Index: ${snow_index} (0-1 scale)`);
    console.log("================================");
    const factors = {
        distance_to_water_km,
        elevation_m,
        storm_index,
        snow_index,
        flood_index,
    };
    const { floodScore, stormScore, snowScore, overallScore, contributions, } = (0, scoringUtils_1.computeHazardScores)(factors, modelConfig_1.baselineModelConfig);
    let modelVersion = await prismaClient_1.prisma.modelVersion.findUnique({
        where: { name: modelConfig_1.baselineModelConfig.versionName },
    });
    if (!modelVersion) {
        modelVersion = await prismaClient_1.prisma.modelVersion.create({
            data: {
                name: modelConfig_1.baselineModelConfig.versionName,
                description: modelConfig_1.baselineModelConfig.description,
                configJson: modelConfig_1.baselineModelConfig,
            },
        });
    }
    const location = await prismaClient_1.prisma.location.create({
        data: { address: finalAddress, latitude, longitude },
    });
    const hazardScore = await prismaClient_1.prisma.hazardScore.create({
        data: {
            userId,
            locationId: location.id,
            modelVersionId: modelVersion.id,
            overallScore,
            floodScore,
            stormScore,
            snowScore,
            factors: {
                create: contributions.map((c) => ({
                    factorName: c.factorName,
                    factorValue: c.factorValue,
                    weight: c.weight,
                    contribution: c.contribution,
                })),
            },
        },
        include: {
            factors: true,
            location: true,
            modelVersion: true,
        },
    });
    return hazardScore;
}
