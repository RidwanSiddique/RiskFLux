"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authService = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const prismaClient_1 = require("../db/prismaClient");
const env_1 = require("../config/env");
exports.authService = {
    // Register new user
    async register(email, password, name) {
        try {
            // Check if user already exists
            const existingUser = await prismaClient_1.prisma.user.findUnique({
                where: { email },
            });
            if (existingUser) {
                return {
                    success: false,
                    message: "Email already registered",
                };
            }
            // Hash password
            const hashedPassword = await bcryptjs_1.default.hash(password, 10);
            // Create user
            const user = await prismaClient_1.prisma.user.create({
                data: {
                    email,
                    password: hashedPassword,
                    name,
                },
            });
            // Generate JWT token
            const token = jsonwebtoken_1.default.sign({ userId: user.id, email: user.email }, env_1.env.JWT_SECRET, { expiresIn: "7d" });
            return {
                success: true,
                message: "Registration successful",
                token,
                user: {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                },
            };
        }
        catch (error) {
            const err = error;
            return {
                success: false,
                message: err?.message || "Registration failed",
            };
        }
    },
    // Login user
    async login(email, password) {
        try {
            // Find user
            const user = await prismaClient_1.prisma.user.findUnique({
                where: { email },
            });
            if (!user) {
                return {
                    success: false,
                    message: "Invalid email or password",
                };
            }
            // Verify password
            const passwordMatch = await bcryptjs_1.default.compare(password, user.password);
            if (!passwordMatch) {
                return {
                    success: false,
                    message: "Invalid email or password",
                };
            }
            // Generate JWT token
            const token = jsonwebtoken_1.default.sign({ userId: user.id, email: user.email }, env_1.env.JWT_SECRET, { expiresIn: "7d" });
            return {
                success: true,
                message: "Login successful",
                token,
                user: {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                },
            };
        }
        catch (error) {
            const err = error;
            return {
                success: false,
                message: err?.message || "Login failed",
            };
        }
    },
    // Verify JWT token
    async verifyToken(token) {
        try {
            const decoded = jsonwebtoken_1.default.verify(token, env_1.env.JWT_SECRET);
            return decoded;
        }
        catch (error) {
            return null;
        }
    },
    // Get user by ID
    async getUserById(userId) {
        try {
            const user = await prismaClient_1.prisma.user.findUnique({
                where: { id: userId },
                select: {
                    id: true,
                    email: true,
                    name: true,
                    createdAt: true,
                },
            });
            return user;
        }
        catch (error) {
            return null;
        }
    },
};
