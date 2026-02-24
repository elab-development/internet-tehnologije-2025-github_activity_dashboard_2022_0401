import { Request, Response } from "express";

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