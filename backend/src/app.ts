import express from "express";
import cors from "cors";
import morgan from "morgan";
import swaggerUi from "swagger-ui-express";
import hazardScoreRoutes from "./routes/hazardScoreRoutes";
import { errorHandler } from "./middlewares/errorHandler";
import { swaggerSpec } from "./docs/swagger";

export const app = express();

app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

// Swagger UI setup
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use("/api/v1/hazard-score", hazardScoreRoutes);

app.use(errorHandler);
