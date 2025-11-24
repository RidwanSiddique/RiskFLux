"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.env = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
exports.env = {
    PORT: process.env.PORT || "4000",
    DATABASE_URL: process.env.DATABASE_URL,
    JWT_SECRET: process.env.JWT_SECRET || "your-secret-key-change-in-production",
    JWT_EXPIRY: process.env.JWT_EXPIRY || "7d",
    // External APIs (Open-Meteo is free, no key needed)
    OPEN_METEO_API: "https://api.open-meteo.com/v1",
    OPENSTREETMAP_API: "https://nominatim.openstreetmap.org",
    // Optional: Google Elevation API (requires key for better accuracy)
    GOOGLE_ELEVATION_API: "https://maps.googleapis.com/maps/api/elevation/json",
    GOOGLE_API_KEY: process.env.GOOGLE_API_KEY || "",
    // Optional: WeatherAPI for climate classification (free tier available)
    WEATHERAPI_KEY: process.env.WEATHERAPI_KEY || "",
    // Redis caching (optional, for production)
    REDIS_URL: process.env.REDIS_URL || "",
    REDIS_ENABLED: process.env.REDIS_ENABLED === "true" || false,
    // API rate limiting
    CACHE_DURATION_HOURS: parseInt(process.env.CACHE_DURATION_HOURS || "24"),
};
