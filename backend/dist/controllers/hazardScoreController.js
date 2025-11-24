"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createHazardScoreHandler = createHazardScoreHandler;
exports.getHazardScoreHandler = getHazardScoreHandler;
const hazardScoreService_1 = require("../services/hazardScoreService");
const prismaClient_1 = require("../db/prismaClient");
async function createHazardScoreHandler(req, res, next) {
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
        const result = await (0, hazardScoreService_1.createHazardScore)({ latitude, longitude, address, userId: req.userId });
        res.status(201).json(result);
    }
    catch (err) {
        next(err);
    }
}
async function getHazardScoreHandler(req, res, next) {
    try {
        const { id } = req.params;
        if (!req.userId) {
            return res.status(401).json({ error: "Unauthorized" });
        }
        const score = await prismaClient_1.prisma.hazardScore.findUnique({
            where: { id, userId: req.userId },
            include: { factors: true, location: true, modelVersion: true },
        });
        if (!score) {
            return res.status(404).json({ error: "HazardScore not found" });
        }
        res.json(score);
    }
    catch (err) {
        next(err);
    }
}
