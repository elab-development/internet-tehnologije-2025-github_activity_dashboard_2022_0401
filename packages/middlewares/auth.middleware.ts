import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

interface JwtPayload {
  userId: number;
  role: string;
}

export interface AuthRequest extends Request {
  user?: JwtPayload;
}

export const authMiddleware = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({
      message: "Authorization header missing",
    });
  }

  const [type, token] = authHeader.split(" ");

  if (type !== "Bearer" || !token) {
    return res.status(401).json({
      message: "Invalid authorization format",
    });
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET as string
    ) as JwtPayload;

    req.user = decoded; // ⬅️ OVO JE KLJUČNO
    next();
  } catch (error) {
    return res.status(401).json({
      message: "Invalid or expired token",
    });
  }
};