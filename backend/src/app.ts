import express from "express";
import cors from "cors";
import morgan from "morgan";
import swaggerUi from "swagger-ui-express";
import hazardScoreRoutes from "./routes/hazardScoreRoutes";
import authRoutes from "./routes/authRoutes";
import { authMiddleware } from "./middlewares/authMiddleware";
import { errorHandler } from "./middlewares/errorHandler";
import { swaggerSpec } from "./docs/swagger";

export const app = express();

app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

// Swagger UI setup
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Auth routes (public)
app.use("/api/v1/auth", authRoutes);

// Protected routes
app.use("/api/v1/hazard-score", authMiddleware, hazardScoreRoutes);

app.use(errorHandler);
