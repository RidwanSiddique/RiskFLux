import { Router } from "express";
import {
    createHazardScoreHandler,
    getHazardScoreHandler,
} from "../controllers/hazardScoreController";

const router = Router();

router.post("/", createHazardScoreHandler);
router.get("/:id", getHazardScoreHandler);

export default router;
