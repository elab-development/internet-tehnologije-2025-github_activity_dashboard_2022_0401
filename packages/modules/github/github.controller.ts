import { Request, Response } from "express";

/**
 * @swagger
 * tags:
 *   name: GitHub
 *   description: GitHub repository statistics
 */

/**
 * @swagger
 * /github/{owner}/{repo}/stats:
 *   get:
 *     summary: Get repository statistics
 *     tags: [GitHub]
 *     parameters:
 *       - in: path
 *         name: owner
 *         required: true
 *         schema:
 *           type: string
 *         description: Repository owner
 *       - in: path
 *         name: repo
 *         required: true
 *         schema:
 *           type: string
 *         description: Repository name
 *     responses:
 *       200:
 *         description: Repository statistics returned
 *       404:
 *         description: Repository not found
 */

export const getRepoStats = async (req: Request, res: Response) => {
  const { owner, repo } = req.params;

  try {
    const response = await fetch("https://api.github.com/graphql", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
      },
      body: JSON.stringify({
        query: `
        {
          repository(owner: "${owner}", name: "${repo}") {
            stargazerCount
            forkCount
            defaultBranchRef {
              target {
                ... on Commit {
                  history {
                    totalCount
                  }
                }
              }
            }
          }
        }
        `,
      }),
    });

    const data = await response.json();

    res.json(data.data.repository);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};