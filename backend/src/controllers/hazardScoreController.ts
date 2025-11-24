import { Response, NextFunction } from "express";
import { createHazardScore } from "../services/hazardScoreService";
import { prisma } from "../db/prismaClient";
import { AuthRequest } from "../middlewares/authMiddleware";

export async function createHazardScoreHandler(
    req: AuthRequest,
    res: Response,
    next: NextFunction
) {
    try {
    const { latitude, longitude, address } = req.body;

    if (typeof latitude !== "number" || typeof longitude !== "number") {
        return res
        .status(400)
        .json({ error: "latitude and longitude must be numbers" });
    }

    if (!req.userId) {
        return res.status(401).json({ error: "Unauthorized" });
    }

    const result = await createHazardScore({ latitude, longitude, address, userId: req.userId });
    res.status(201).json(result);
    } catch (err) {
        next(err);
    }
}

export async function getHazardScoreHandler(
    req: AuthRequest,
    res: Response,
    next: NextFunction
) {
    try {
    const { id } = req.params;
    
    if (!req.userId) {
        return res.status(401).json({ error: "Unauthorized" });
    }

    const score = await prisma.hazardScore.findUnique({
        where: { id, userId: req.userId },
        include: { factors: true, location: true, modelVersion: true },
    });

    if (!score) {
        return res.status(404).json({ error: "HazardScore not found" });
    }

    res.json(score);
    } catch (err) {
    next(err);
    }
}
