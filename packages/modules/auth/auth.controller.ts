import { Request, Response } from "express";
import { loginUser, registerUser } from "./auth.service";

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
    return res.status(400).json({
      message: error.message || "Registration failed",
    });
  }
};

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

