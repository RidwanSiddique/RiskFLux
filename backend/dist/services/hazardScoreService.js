"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createHazardScore = createHazardScore;
const prismaClient_1 = require("../db/prismaClient");
const modelConfig_1 = require("../config/modelConfig");
const scoringUtils_1 = require("../utils/scoringUtils");
async function createHazardScore(input) {
    const { address, latitude, longitude } = input;
    const distance_to_water_km = fakeDistanceToWater(latitude, longitude);
    const elevation_m = fakeElevation(latitude, longitude);
    const storm_index = fakeStormIndex(latitude, longitude);
    const snow_index = fakeSnowIndex(latitude, longitude);
    const factors = {
        distance_to_water_km,
        elevation_m,
        storm_index,
        snow_index,
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
        data: { address, latitude, longitude },
    });
    const hazardScore = await prismaClient_1.prisma.hazardScore.create({
        data: {
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
function fakeDistanceToWater(lat, lon) {
    return Math.random() * 5;
}
function fakeElevation(lat, lon) {
    return 450 + Math.random() * 100;
}
function fakeStormIndex(lat, lon) {
    const base = Math.abs(lat) > 35 && Math.abs(lat) < 60
        ? 0.7
        : 0.3;
    const noise = (Math.random() - 0.5) * 0.2;
    return Math.max(0, Math.min(1, base + noise));
}
function fakeSnowIndex(lat, lon) {
    const normalizedLat = Math.min(1, Math.max(0, (Math.abs(lat) - 30) / 30));
    const noise = (Math.random() - 0.5) * 0.1;
    return Math.max(0, Math.min(1, normalizedLat + noise));
}
