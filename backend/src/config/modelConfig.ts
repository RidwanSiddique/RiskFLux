export type HazardModelConfig = {
    versionName: string;
    description: string;
    weights: {
        distance_to_water_km: number;
        elevation_m: number;
        storm_index: number;
        snow_index: number;
    };
};

export const baselineModelConfig: HazardModelConfig = {
    versionName: "v1.0-natural-hazards",
    description:
        "Baseline natural hazard model using water proximity, elevation, storm exposure, and snow severity.",
    weights: {
        distance_to_water_km: 0.5,
        elevation_m: 0.3,
        storm_index: 0.15,
        snow_index: 0.05,
    },
};
