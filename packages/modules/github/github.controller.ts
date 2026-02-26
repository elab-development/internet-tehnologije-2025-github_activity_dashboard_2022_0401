import { Request, Response } from "express";
import {
  getRepoLanguages,
  getRepoSummary,
  listOpenIssues,
  listOpenPulls,
  listPublicEventsForUser,
  searchRepositories,
} from "./github.service";

function parseNumber(v: any, fallback: number) {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
}

function handleGithubError(err: any, res: Response) {
  if (err?.status === 404) return res.status(404).json({ message: "Not found" });
  if (err?.status === 401) return res.status(401).json({ message: "GitHub Bad credentials" });
  if (err?.status === 403) {
    return res.status(403).json({
      message: "GitHub rate limit / forbidden",
      error: err?.message ?? "Forbidden",
    });
  }

  return res.status(500).json({
    message: "GitHub API error",
    error: err?.message ?? "Unknown error",
  });
}

export async function getUserPublicEvents(req: Request, res: Response) {
  try {
    const username = req.params.username;
    const perPage = req.query.perPage ? parseNumber(req.query.perPage, 30) : undefined;
    const page = req.query.page ? parseNumber(req.query.page, 1) : undefined;

    if (!username || !username.trim()) {
      return res.status(400).json({ message: "username is required" });
    }

    const data = await listPublicEventsForUser({ username, perPage, page });
    return res.status(200).json(data);
  } catch (err: any) {
    return handleGithubError(err, res);
  }
}

export async function searchRepos(req: Request, res: Response) {
  try {
    const q = String(req.query.q || "").trim();
    const perPage = req.query.perPage ? parseNumber(req.query.perPage, 10) : undefined;
    const page = req.query.page ? parseNumber(req.query.page, 1) : undefined;

    if (!q) return res.status(400).json({ message: "q is required" });

    const data = await searchRepositories({ q, perPage, page });
    return res.status(200).json({
      total: data.total_count,
      items: data.items.map((r: any) => ({
        fullName: r.full_name,
        description: r.description,
        stars: r.stargazers_count,
        forks: r.forks_count,
        language: r.language,
        htmlUrl: r.html_url,
        owner: r.owner?.login,
        name: r.name,
      })),
    });
  } catch (err: any) {
    return handleGithubError(err, res);
  }
}

export async function repoSummary(req: Request, res: Response) {
  try {
    const owner = req.params.owner;
    const repo = req.params.repo;
    const days = req.query.days ? parseNumber(req.query.days, 7) : undefined;

    if (!owner || !repo) {
      return res.status(400).json({ message: "owner and repo are required" });
    }

    const data = await getRepoSummary({ owner, repo, days });
    return res.status(200).json(data);
  } catch (err: any) {
    return handleGithubError(err, res);
  }
}

export async function repoLanguages(req: Request, res: Response) {
  try {
    const owner = req.params.owner;
    const repo = req.params.repo;

    const data = await getRepoLanguages({ owner, repo });
    return res.status(200).json(data);
  } catch (err: any) {
    return handleGithubError(err, res);
  }
}

export async function openPulls(req: Request, res: Response) {
  try {
    const owner = req.params.owner;
    const repo = req.params.repo;
    const perPage = req.query.perPage ? parseNumber(req.query.perPage, 5) : 5;

    const data = await listOpenPulls({ owner, repo, perPage });

    return res.status(200).json(
      data.map((p: any) => ({
        id: p.id,
        number: p.number,
        title: p.title,
        htmlUrl: p.html_url,
        user: { login: p.user?.login, avatarUrl: p.user?.avatar_url },
        updatedAt: p.updated_at,
      }))
    );
  } catch (err: any) {
    return handleGithubError(err, res);
  }
}

export async function openIssues(req: Request, res: Response) {
  try {
    const owner = req.params.owner;
    const repo = req.params.repo;
    const perPage = req.query.perPage ? parseNumber(req.query.perPage, 5) : 5;

    const data = await listOpenIssues({ owner, repo, perPage });

    return res.status(200).json(
      data.map((i: any) => ({
        id: i.id,
        number: i.number,
        title: i.title,
        htmlUrl: i.html_url,
        user: { login: i.user?.login, avatarUrl: i.user?.avatar_url },
        updatedAt: i.updated_at,
      }))
    );
  } catch (err: any) {
    return handleGithubError(err, res);
  }
}