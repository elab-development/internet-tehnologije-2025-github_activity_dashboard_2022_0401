import { Router } from "express";
import {
  followRepository,
  getFollowedRepositories,
  unfollowRepository,
} from "./repositories.controller";
import { authMiddleware } from "../../middlewares/auth.middleware";

const router = Router();

router.post("/follow", authMiddleware, followRepository);
router.get("/followed", authMiddleware, getFollowedRepositories);
router.delete("/unfollow/:id", authMiddleware, unfollowRepository);

export default router;

