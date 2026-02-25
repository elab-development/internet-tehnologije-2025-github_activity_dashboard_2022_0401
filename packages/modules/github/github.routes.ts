import { Router } from "express";
import { getUserPublicEvents, repoSummary, searchRepos } from "./github.controller";

const router = Router();

// Guest-friendly (bez auth)
router.get("/users/:username/events/public", getUserPublicEvents);
router.get("/search/repositories", searchRepos);
router.get("/repos/:owner/:repo/summary", repoSummary);

export default router;