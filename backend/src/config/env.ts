import dotenv from "dotenv";
dotenv.config();

export const env = {
    PORT: process.env.PORT || "4000",
    DATABASE_URL: process.env.DATABASE_URL!,
    JWT_SECRET: process.env.JWT_SECRET || "your-secret-key-change-in-production",
    JWT_EXPIRY: process.env.JWT_EXPIRY || "7d",
};
