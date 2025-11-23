"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const hazardScoreController_1 = require("../controllers/hazardScoreController");
const router = (0, express_1.Router)();
router.post("/", hazardScoreController_1.createHazardScoreHandler);
router.get("/:id", hazardScoreController_1.getHazardScoreHandler);
exports.default = router;
