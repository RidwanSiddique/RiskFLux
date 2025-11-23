import { prisma } from "../db/prismaClient";
import { baselineModelConfig } from "../config/modelConfig";
import { computeHazardScores } from "../utils/scoringUtils";

type HazardScoreInput = {
    address?: string;
    latitude: number;
    longitude: number;
};

export async function createHazardScore(input: HazardScoreInput) {
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
    data: { address, latitude, longitude },
    });

    const hazardScore = await prisma.hazardScore.create({
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

function fakeDistanceToWater(lat: number, lon: number): number {
  return Math.random() * 5;
}

function fakeElevation(lat: number, lon: number): number {
  return 450 + Math.random() * 100;
}

function fakeStormIndex(lat: number, lon: number): number {
    const base =
        Math.abs(lat) > 35 && Math.abs(lat) < 60
        ? 0.7
        : 0.3;
    const noise = (Math.random() - 0.5) * 0.2;
    return Math.max(0, Math.min(1, base + noise));
}

function fakeSnowIndex(lat: number, lon: number): number {
    const normalizedLat = Math.min(1, Math.max(0, (Math.abs(lat) - 30) / 30));
    const noise = (Math.random() - 0.5) * 0.1;
    return Math.max(0, Math.min(1, normalizedLat + noise));
}
