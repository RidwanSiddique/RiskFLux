"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authController = void 0;
const authService_1 = require("../services/authService");
exports.authController = {
    // Register
    async register(req, res) {
        try {
            const { email, password, name } = req.body;
            // Validation
            if (!email || !password || !name) {
                res.status(400).json({
                    success: false,
                    message: "Email, password, and name are required",
                });
                return;
            }
            if (password.length < 6) {
                res.status(400).json({
                    success: false,
                    message: "Password must be at least 6 characters",
                });
                return;
            }
            // Validate email format
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                res.status(400).json({
                    success: false,
                    message: "Invalid email format",
                });
                return;
            }
            const result = await authService_1.authService.register(email, password, name);
            if (!result.success) {
                res.status(400).json(result);
                return;
            }
            res.status(201).json(result);
        }
        catch (error) {
            res.status(500).json({
                success: false,
                message: "Registration failed",
                error: error.message,
            });
        }
    },
    // Login
    async login(req, res) {
        try {
            const { email, password } = req.body;
            // Validation
            if (!email || !password) {
                res.status(400).json({
                    success: false,
                    message: "Email and password are required",
                });
                return;
            }
            const result = await authService_1.authService.login(email, password);
            if (!result.success) {
                res.status(401).json(result);
                return;
            }
            res.status(200).json(result);
        }
        catch (error) {
            res.status(500).json({
                success: false,
                message: "Login failed",
                error: error.message,
            });
        }
    },
    // Get current user
    async getCurrentUser(req, res) {
        try {
            if (!req.userId) {
                res.status(401).json({
                    success: false,
                    message: "Unauthorized",
                });
                return;
            }
            const user = await authService_1.authService.getUserById(req.userId);
            if (!user) {
                res.status(404).json({
                    success: false,
                    message: "User not found",
                });
                return;
            }
            res.status(200).json({
                success: true,
                user,
            });
        }
        catch (error) {
            res.status(500).json({
                success: false,
                message: "Failed to fetch user",
                error: error.message,
            });
        }
    },
};
