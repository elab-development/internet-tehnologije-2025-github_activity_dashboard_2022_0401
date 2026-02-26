import { Router } from "express";
import {
  getUserPublicEvents,
  openIssues,
  openPulls,
  repoLanguages,
  repoSummary,
  searchRepos,
} from "./github.controller";

const router = Router();

// guest-friendly
router.get("/users/:username/events/public", getUserPublicEvents);
router.get("/search/repositories", searchRepos);

// repo analytics
router.get("/repos/:owner/:repo/summary", repoSummary);
router.get("/repos/:owner/:repo/languages", repoLanguages);
router.get("/repos/:owner/:repo/pulls/open", openPulls);
router.get("/repos/:owner/:repo/issues/open", openIssues);

export default router;