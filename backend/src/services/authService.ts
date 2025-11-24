import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "../db/prismaClient";
import { env } from "../config/env";

export interface AuthPayload {
    userId: string;
    email: string;
}

export interface AuthResponse {
    success: boolean;
    message: string;
    token?: string;
    user?: {
        id: string;
        email: string;
        name: string;
    };
}

export const authService = {
    // Register new user
    async register(email: string, password: string, name: string): Promise<AuthResponse> {
        try {
            // Check if user already exists
            const existingUser = await prisma.user.findUnique({
                where: { email },
            });

            if (existingUser) {
                return {
                    success: false,
                    message: "Email already registered",
                };
            }

            // Hash password
            const hashedPassword = await bcrypt.hash(password, 10);

            // Create user
            const user = await prisma.user.create({
                data: {
                    email,
                    password: hashedPassword,
                    name,
                },
            });

            // Generate JWT token
            const token = jwt.sign(
                { userId: user.id, email: user.email } as AuthPayload,
                env.JWT_SECRET,
                { expiresIn: "7d" }
            );

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
        } catch (error: unknown) {
            const err = error as Error;
            return {
                success: false,
                message: err?.message || "Registration failed",
            };
        }
    },

    // Login user
    async login(email: string, password: string): Promise<AuthResponse> {
        try {
            // Find user
            const user = await prisma.user.findUnique({
                where: { email },
            });

            if (!user) {
                return {
                    success: false,
                    message: "Invalid email or password",
                };
            }

            // Verify password
            const passwordMatch = await bcrypt.compare(password, user.password);

            if (!passwordMatch) {
                return {
                    success: false,
                    message: "Invalid email or password",
                };
            }

            // Generate JWT token
            const token = jwt.sign(
                { userId: user.id, email: user.email } as AuthPayload,
                env.JWT_SECRET,
                { expiresIn: "7d" }
            );

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
        } catch (error: unknown) {
            const err = error as Error;
            return {
                success: false,
                message: err?.message || "Login failed",
            };
        }
    },

    // Verify JWT token
    async verifyToken(token: string): Promise<AuthPayload | null> {
        try {
            const decoded = jwt.verify(token, env.JWT_SECRET) as AuthPayload;
            return decoded;
        } catch (error) {
            return null;
        }
    },

    // Get user by ID
    async getUserById(userId: string) {
        try {
            const user = await prisma.user.findUnique({
                where: { id: userId },
                select: {
                    id: true,
                    email: true,
                    name: true,
                    createdAt: true,
                },
            });
            return user;
        } catch (error) {
            return null;
        }
    },
};
