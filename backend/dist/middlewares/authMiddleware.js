"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authMiddleware = void 0;
const authService_1 = require("../services/authService");
const authMiddleware = async (req, res, next) => {
    try {
        // Get token from Authorization header
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            res.status(401).json({
                success: false,
                message: "No token provided",
            });
            return;
        }
        const token = authHeader.slice(7); // Remove "Bearer " prefix
        // Verify token
        const payload = await authService_1.authService.verifyToken(token);
        if (!payload) {
            res.status(401).json({
                success: false,
                message: "Invalid or expired token",
            });
            return;
        }
        // Attach user info to request
        req.userId = payload.userId;
        req.userEmail = payload.email;
        next();
    }
    catch (error) {
        res.status(401).json({
            success: false,
            message: "Authentication failed",
        });
    }
};
exports.authMiddleware = authMiddleware;
