import { Octokit } from "@octokit/rest";

function getOctokit() {
  const token = process.env.GITHUB_TOKEN;
  return new Octokit(token ? { auth: token } : {});
}

/** --- Simple in-memory cache (profi detalj) --- */
type CacheEntry<T> = { expiresAt: number; data: T };
const cache = new Map<string, CacheEntry<any>>();

function getCache<T>(key: string): T | null {
  const hit = cache.get(key);
  if (!hit) return null;
  if (Date.now() > hit.expiresAt) {
    cache.delete(key);
    return null;
  }
  return hit.data as T;
}

function setCache<T>(key: string, data: T, ttlMs: number) {
  cache.set(key, { expiresAt: Date.now() + ttlMs, data });
}

function dayKey(iso: string) {
  return iso.slice(0, 10); // YYYY-MM-DD
}

export async function listPublicEventsForUser(params: {
  username: string;
  perPage?: number;
  page?: number;
}) {
  const octokit = getOctokit();

  const per_page = Math.min(Math.max(params.perPage ?? 30, 1), 100);
  const page = Math.max(params.page ?? 1, 1);

  const cacheKey = `user_events:${params.username}:${per_page}:${page}`;
  const cached = getCache<any[]>(cacheKey);
  if (cached) return cached;

  const res = await octokit.rest.activity.listPublicEventsForUser({
    username: params.username,
    per_page,
    page,
  });

  // cache 30s (da ne udarate rate-limit)
  setCache(cacheKey, res.data, 30_000);
  return res.data;
}

export async function searchRepositories(params: { q: string; perPage?: number; page?: number }) {
  const octokit = getOctokit();
  const per_page = Math.min(Math.max(params.perPage ?? 10, 1), 30);
  const page = Math.max(params.page ?? 1, 1);

  const cacheKey = `repo_search:${params.q}:${per_page}:${page}`;
  const cached = getCache<any>(cacheKey);
  if (cached) return cached;

  const res = await octokit.rest.search.repos({
    q: params.q,
    per_page,
    page,
    sort: "stars",
    order: "desc",
  });

  setCache(cacheKey, res.data, 60_000);
  return res.data;
}

export async function getRepoSummary(params: {
  owner: string;
  repo: string;
  days?: number; // npr 7 ili 30
}) {
  const octokit = getOctokit();
  const days = Math.min(Math.max(params.days ?? 7, 1), 30);

  const cacheKey = `repo_summary:${params.owner}/${params.repo}:${days}`;
  const cached = getCache<any>(cacheKey);
  if (cached) return cached;

  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();

  // 1) Repo info
  const repoRes = await octokit.rest.repos.get({
    owner: params.owner,
    repo: params.repo,
  });

  // 2) Contributors (top 5)
  const contribRes = await octokit.rest.repos.listContributors({
    owner: params.owner,
    repo: params.repo,
    per_page: 5,
  });

  // 3) Commits since X days (chart + KPI)
  const commitsRes = await octokit.rest.repos.listCommits({
    owner: params.owner,
    repo: params.repo,
    since,
    per_page: 100,
  });

  const commitsPerDayMap: Record<string, number> = {};
  for (const c of commitsRes.data) {
    const date = c.commit?.author?.date || c.commit?.committer?.date;
    if (!date) continue;
    const k = dayKey(date);
    commitsPerDayMap[k] = (commitsPerDayMap[k] || 0) + 1;
  }

  const commitsPerDay = Object.entries(commitsPerDayMap)
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([date, count]) => ({ date, count }));

  // 4) Issues since X days (bez PR)
  const issuesRes = await octokit.rest.issues.listForRepo({
    owner: params.owner,
    repo: params.repo,
    state: "all",
    since,
    per_page: 100,
  });

  const issuesCount = issuesRes.data.filter((i) => !i.pull_request).length;
  const prsCount = issuesRes.data.filter((i) => !!i.pull_request).length; // GitHub issues endpoint vraća i PR u istom feed-u

  const summary = {
    repo: {
      fullName: repoRes.data.full_name,
      description: repoRes.data.description,
      htmlUrl: repoRes.data.html_url,
      stars: repoRes.data.stargazers_count,
      forks: repoRes.data.forks_count,
      openIssues: repoRes.data.open_issues_count,
      watchers: repoRes.data.watchers_count,
      language: repoRes.data.language,
    },
    kpis: {
      commitsLastNDays: commitsRes.data.length,
      issuesLastNDays: issuesCount,
      prsLastNDays: prsCount,
      days,
    },
    contributors: contribRes.data.map((c) => ({
      login: c.login,
      avatarUrl: c.avatar_url,
      contributions: c.contributions,
      htmlUrl: c.html_url,
    })),
    commitsPerDay,
    since,
  };

  // cache 60s
  setCache(cacheKey, summary, 60_000);
  return summary;
}