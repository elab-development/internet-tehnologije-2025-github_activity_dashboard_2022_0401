import { Router } from "express";
import { login, register,logout } from "./auth.controller";
import { authMiddleware } from "../../middlewares/auth.middleware";

const router = Router();

router.get("/me", authMiddleware, (req, res) => {
  res.json({
    message: "You are authenticated",
    user: (req as any).user,
  });
});

router.post("/register", register);

router.post("/login",login)

router.post("/logout", authMiddleware, logout);

export default router;