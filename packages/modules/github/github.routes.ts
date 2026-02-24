import { Router } from "express";
import { getRepoStats } from "./github.controller";

const router = Router();

router.get("/:owner/:repo/stats", getRepoStats);

export default router;