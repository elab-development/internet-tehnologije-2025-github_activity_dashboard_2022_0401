import { Request, Response } from "express";
import { loginUser, registerUser } from "./auth.service";

export const logout = async (req: Request, res: Response) => {
  return res.status(200).json({
    message: "Logged out successfully",
  });
};

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Authentication endpoints
 */

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RegisterInput'
 *     responses:
 *       201:
 *         description: User successfully registered
 *       400:
 *         description: Registration error
 */

export const register = async (req: Request, res: Response) => {
  try {
    const user = await registerUser(req.body);

    return res.status(201).json({
      id: user.id,
      email: user.email,
      username: user.username,
      role: user.role.name,
    });
  } catch (error: any) {
   console.error("REGISTER ERROR:", error);

  return res.status(400).json({
    message: error.message || "Registration failed",
  });
  }
};

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Login user and receive JWT token
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginInput'
 *     responses:
 *       201:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *             example:
 *               email: "test@gmail.com"
 *               token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *       401:
 *         description: Invalid credentials
 */

export const login = async (req: Request, res: Response) => {
  try {
    const loginResponse = await loginUser(req.body);

    return res.status(201).json({
      email: loginResponse.user.email,
      token:loginResponse.token
    });

  } catch (error: any) {
    return res.status(400).json({
      message: error.message || "login failed",
    });
  }
};

