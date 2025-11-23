import { Request, Response, NextFunction } from "express";
import { createHazardScore } from "../services/hazardScoreService";
import { prisma } from "../db/prismaClient";

export async function createHazardScoreHandler(
    req: Request,
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

    const result = await createHazardScore({ latitude, longitude, address });
    res.status(201).json(result);
    } catch (err) {
        next(err);
    }
}

export async function getHazardScoreHandler(
    req: Request,
    res: Response,
    next: NextFunction
) {
    try {
    const { id } = req.params;
    const score = await prisma.hazardScore.findUnique({
        where: { id },
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
