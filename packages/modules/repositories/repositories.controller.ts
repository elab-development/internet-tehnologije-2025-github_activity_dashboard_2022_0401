import { Request, Response } from "express";
import { RepositoriesService } from "./repositories.service";

const service = new RepositoriesService();

/**
 * Follow repository
 */

/**
 * @swagger
 * /repositories:
 *   get:
 *     summary: Get user repositories
 *     tags: [Repositories]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of repositories
 *       401:
 *         description: Unauthorized - JWT missing or invalid
 *       403:
 *         description: Forbidden - insufficient permissions
 */
export const followRepository = async (req: any, res: Response) => {
  try {
    const userId = Number(req.user.userId);
    const repoData = req.body;

    const result = await service.followRepository(userId, repoData);

    res.json(result);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * Get followed repositories
 */
export const getFollowedRepositories = async (
  req: any,
  res: Response
) => {
  try {
    const userId = Number(req.user.userId);

    const repos = await service.getFollowedRepositories(userId);

    res.json(repos);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * Unfollow repository
 */
export const unfollowRepository = async (
  req: Request,
  res: Response
) => {
  try {
    const id = Number(req.params.id);

    const result = await service.unfollow(id);

    res.json(result);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};