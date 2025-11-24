import { prisma } from "../db/prismaClient";
import { baselineModelConfig } from "../config/modelConfig";
import { computeHazardScores } from "../utils/scoringUtils";
import { getElevation } from "./elevationService";
import { getDistanceToWater } from "./waterDistanceService";
import { getAccurateClimateData } from "./climateDataService";
import { calculateFloodRiskIndex } from "./floodRiskService";
import { reverseGeocode } from "./geocodingService";
import { locationCache } from "./cacheService";

type HazardScoreInput = {
    address?: string;
    latitude: number;
    longitude: number;
    userId: string;
};

export async function createHazardScore(input: HazardScoreInput) {
    const { address, latitude, longitude, userId } = input;

    // Try to get cached data first
    let cachedElevation = locationCache.get<number>(latitude, longitude, "elevation");
    let cachedWaterDist = locationCache.get<number>(latitude, longitude, "water_distance");
    let cachedWeather = locationCache.get<{ storm_index: number; snow_index: number }>(latitude, longitude, "weather");
    let cachedFlood = locationCache.get<number>(latitude, longitude, "flood_index");

    // Fetch missing data from APIs
    if (!cachedElevation) {
        const elevData = await getElevation(latitude, longitude);
        cachedElevation = elevData?.elevation ?? 400;
        locationCache.set(latitude, longitude, "elevation", cachedElevation);
    }

    if (!cachedWaterDist) {
        const waterData = await getDistanceToWater(latitude, longitude);
        cachedWaterDist = waterData?.nearestDistance ?? 5;
        locationCache.set(latitude, longitude, "water_distance", cachedWaterDist);
    }

    if (!cachedWeather) {
        const climateData = await getAccurateClimateData(latitude, longitude);
        cachedWeather = {
            storm_index: climateData?.stormIndex ?? 0.5,
            snow_index: climateData?.snowIndex ?? 0.3,
        };
        locationCache.set(latitude, longitude, "weather", cachedWeather);
    }

    if (!cachedFlood) {
        const floodData = await calculateFloodRiskIndex(latitude, longitude);
        cachedFlood = floodData?.floodIndex ?? 0.2;
        locationCache.set(latitude, longitude, "flood_index", cachedFlood);
    }

    // Get reverse geocoded address if not provided
    let finalAddress = address;
    if (!finalAddress) {
        const geoData = await reverseGeocode(latitude, longitude);
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

    const {
        floodScore,
        stormScore,
        snowScore,
        overallScore,
        contributions,
    } = computeHazardScores(factors, baselineModelConfig);

    let modelVersion = await prisma.modelVersion.findUnique({
        where: { name: baselineModelConfig.versionName },
    });

    if (!modelVersion) {
        modelVersion = await prisma.modelVersion.create({
            data: {
                name: baselineModelConfig.versionName,
                description: baselineModelConfig.description,
                configJson: baselineModelConfig,
            },
        });
    }

    const location = await prisma.location.create({
        data: { address: finalAddress, latitude, longitude },
    });

    const hazardScore = await prisma.hazardScore.create({
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
