import express from "express";
import cors from "cors";
import morgan from "morgan";
import hazardScoreRoutes from "./routes/hazardScoreRoutes";
import { errorHandler } from "./middlewares/errorHandler";

export const app = express();

app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

app.use("/api/v1/hazard-score", hazardScoreRoutes);

app.use(errorHandler);
