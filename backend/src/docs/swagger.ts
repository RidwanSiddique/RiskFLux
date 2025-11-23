export const swaggerSpec = {
  openapi: "3.0.0",
  info: {
    title: "RiskFlux API",
    description:
      "Natural hazard risk assessment API. Calculate flood, storm, and snow risk scores based on geographic and environmental factors.",
    version: "1.0.0",
    contact: {
      name: "RiskFlux Support",
      url: "https://github.com/your-org/riskflux",
    },
  },
  servers: [
    {
      url: "http://localhost:4000",
      description: "Local development server",
    },
    {
      url: "https://api.riskflux.example.com",
      description: "Production server",
    },
  ],
  paths: {
    "/api/v1/hazard-score": {
      post: {
        tags: ["Hazard Scores"],
        summary: "Calculate hazard risk score",
        description:
          "Calculate comprehensive natural hazard risk score for a given location including flood, storm, and snow components.",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["latitude", "longitude"],
                properties: {
                  latitude: {
                    type: "number",
                    format: "double",
                    example: 40.7128,
                    description: "Geographic latitude (-90 to 90)",
                  },
                  longitude: {
                    type: "number",
                    format: "double",
                    example: -74.006,
                    description: "Geographic longitude (-180 to 180)",
                  },
                  address: {
                    type: "string",
                    example: "123 Main St, New York, NY 10001",
                    description: "Optional human-readable address",
                  },
                },
              },
              examples: {
                tropicalCoastal: {
                  summary: "Tropical coastal location",
                  value: {
                    latitude: 21.3099,
                    longitude: -157.8581,
                    address: "Honolulu, Hawaii",
                  },
                },
                mountainTown: {
                  summary: "High-altitude mountain town",
                  value: {
                    latitude: 39.7392,
                    longitude: -104.9903,
                    address: "Denver, Colorado",
                  },
                },
                riverValley: {
                  summary: "Low-lying river valley",
                  value: {
                    latitude: 29.7604,
                    longitude: -95.3698,
                    address: "Houston, Texas",
                  },
                },
              },
            },
          },
        },
        responses: {
          "201": {
            description: "Hazard score successfully calculated",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/HazardScoreResponse",
                },
                example: {
                  id: "clq123abc456def789ghi012jkl",
                  location: {
                    id: "loc_001",
                    latitude: 40.7128,
                    longitude: -74.006,
                    address: "New York City",
                    createdAt: "2025-11-22T12:00:00Z",
                  },
                  floodScore: 45,
                  stormScore: 25,
                  snowScore: 15,
                  overallScore: 28,
                  factors: [
                    {
                      id: "factor_001",
                      hazardScoreId: "clq123abc456def789ghi012jkl",
                      factorName: "distance_to_water_km",
                      rawValue: 2.5,
                      normalizedValue: 28.6,
                      contribution: 11.44,
                    },
                    {
                      id: "factor_002",
                      hazardScoreId: "clq123abc456def789ghi012jkl",
                      factorName: "elevation_m",
                      rawValue: 10,
                      normalizedValue: 99.2,
                      contribution: -29.76,
                    },
                    {
                      id: "factor_003",
                      hazardScoreId: "clq123abc456def789ghi012jkl",
                      factorName: "storm_index",
                      rawValue: 0.6,
                      normalizedValue: 60,
                      contribution: 12,
                    },
                    {
                      id: "factor_004",
                      hazardScoreId: "clq123abc456def789ghi012jkl",
                      factorName: "snow_index",
                      rawValue: 0.2,
                      normalizedValue: 20,
                      contribution: 2,
                    },
                  ],
                  modelVersion: {
                    id: "model_v1",
                    versionName: "v1.0-natural-hazards",
                    description:
                      "Baseline natural hazard model using water proximity, elevation, storm exposure, and snow severity.",
                    weights: {
                      distance_to_water_km: 0.4,
                      elevation_m: -0.3,
                      storm_index: 0.2,
                      snow_index: 0.1,
                    },
                  },
                  calculatedAt: "2025-11-22T12:00:00Z",
                },
              },
            },
          },
          "400": {
            description: "Invalid input parameters",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/Error",
                },
                examples: {
                  missingCoordinates: {
                    summary: "Missing required fields",
                    value: {
                      error: "latitude and longitude must be numbers",
                    },
                  },
                  invalidCoordinates: {
                    summary: "Invalid coordinate range",
                    value: {
                      error: "Latitude must be between -90 and 90",
                    },
                  },
                },
              },
            },
          },
          "500": {
            description: "Internal server error",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/Error",
                },
              },
            },
          },
        },
      },
    },
    "/api/v1/hazard-score/{id}": {
      get: {
        tags: ["Hazard Scores"],
        summary: "Get hazard score by ID",
        description: "Retrieve a previously calculated hazard score and all its details",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            description: "The unique identifier of the hazard score",
            schema: {
              type: "string",
              example: "clq123abc456def789ghi012jkl",
            },
          },
        ],
        responses: {
          "200": {
            description: "Hazard score found and returned",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/HazardScoreResponse",
                },
              },
            },
          },
          "404": {
            description: "Hazard score not found",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/Error",
                },
                example: {
                  error: "HazardScore not found",
                },
              },
            },
          },
          "500": {
            description: "Internal server error",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/Error",
                },
              },
            },
          },
        },
      },
    },
  },
  components: {
    schemas: {
      Location: {
        type: "object",
        description: "Geographic location information",
        properties: {
          id: {
            type: "string",
            description: "Unique identifier for the location",
          },
          latitude: {
            type: "number",
            format: "double",
            description: "Geographic latitude",
          },
          longitude: {
            type: "number",
            format: "double",
            description: "Geographic longitude",
          },
          address: {
            type: "string",
            description: "Human-readable address if provided",
            nullable: true,
          },
          createdAt: {
            type: "string",
            format: "date-time",
            description: "Timestamp when location was created",
          },
        },
        required: ["id", "latitude", "longitude", "createdAt"],
      },
      FactorContribution: {
        type: "object",
        description: "Individual factor contribution to the hazard score",
        properties: {
          id: {
            type: "string",
            description: "Unique identifier for this factor contribution",
          },
          hazardScoreId: {
            type: "string",
            description: "Reference to the parent hazard score",
          },
          factorName: {
            type: "string",
            enum: ["distance_to_water_km", "elevation_m", "storm_index", "snow_index"],
            description: "Name of the environmental factor",
          },
          rawValue: {
            type: "number",
            description: "Raw input value for this factor",
          },
          normalizedValue: {
            type: "number",
            description: "Normalized value (0-100 scale)",
          },
          contribution: {
            type: "number",
            description: "Weighted contribution to overall score",
          },
        },
        required: [
          "id",
          "hazardScoreId",
          "factorName",
          "rawValue",
          "normalizedValue",
          "contribution",
        ],
      },
      ModelVersion: {
        type: "object",
        description: "Risk model version and configuration",
        properties: {
          id: {
            type: "string",
            description: "Unique identifier for the model version",
          },
          versionName: {
            type: "string",
            example: "v1.0-natural-hazards",
            description: "Semantic version name of the model",
          },
          description: {
            type: "string",
            description: "Description of what this model version calculates",
          },
          weights: {
            type: "object",
            description: "Factor weights used in calculations",
            properties: {
              distance_to_water_km: {
                type: "number",
                example: 0.4,
                description: "Weight for water proximity factor",
              },
              elevation_m: {
                type: "number",
                example: -0.3,
                description: "Weight for elevation factor",
              },
              storm_index: {
                type: "number",
                example: 0.2,
                description: "Weight for storm exposure factor",
              },
              snow_index: {
                type: "number",
                example: 0.1,
                description: "Weight for snow severity factor",
              },
            },
            required: [
              "distance_to_water_km",
              "elevation_m",
              "storm_index",
              "snow_index",
            ],
          },
        },
        required: ["id", "versionName", "description", "weights"],
      },
      HazardScoreResponse: {
        type: "object",
        description: "Complete hazard score calculation with all components",
        properties: {
          id: {
            type: "string",
            description: "Unique identifier for this hazard score",
          },
          location: {
            $ref: "#/components/schemas/Location",
          },
          floodScore: {
            type: "number",
            minimum: 0,
            maximum: 100,
            description: "Flood risk score (0-100)",
          },
          stormScore: {
            type: "number",
            minimum: 0,
            maximum: 100,
            description: "Storm risk score (0-100)",
          },
          snowScore: {
            type: "number",
            minimum: 0,
            maximum: 100,
            description: "Snow risk score (0-100)",
          },
          overallScore: {
            type: "number",
            minimum: 0,
            maximum: 100,
            description: "Overall risk score (average of three components)",
          },
          factors: {
            type: "array",
            description: "Detailed breakdown of each factor contribution",
            items: {
              $ref: "#/components/schemas/FactorContribution",
            },
          },
          modelVersion: {
            $ref: "#/components/schemas/ModelVersion",
          },
          calculatedAt: {
            type: "string",
            format: "date-time",
            description: "Timestamp when score was calculated",
          },
        },
        required: [
          "id",
          "location",
          "floodScore",
          "stormScore",
          "snowScore",
          "overallScore",
          "factors",
          "modelVersion",
          "calculatedAt",
        ],
      },
      Error: {
        type: "object",
        description: "Standard error response",
        properties: {
          error: {
            type: "string",
            description: "Error message describing what went wrong",
          },
        },
        required: ["error"],
      },
    },
  },
  tags: [
    {
      name: "Hazard Scores",
      description: "Operations related to hazard score calculations and retrieval",
    },
  ],
};
