"use client";

import { useEffect, useMemo, useState } from "react";
import { Chart } from "react-google-charts";
import { Card } from "@/src/components/ui/Card";
import { Button } from "@/src/components/ui/Button";
import { InputField } from "@/src/components/ui/InputField";
import { apiFetch } from "@/app/lib/api";

type GhEvent = {
  id: string;
  type: string;
  created_at: string;
  repo?: { name: string };
  actor?: { login: string; avatar_url: string };
};

type RepoSummary = {
  repo: {
    fullName: string;
    description: string | null;
    htmlUrl: string;
    stars: number;
    forks: number;
    openIssues: number;
    watchers: number;
    language: string | null;
  };
  kpis: {
    commitsLastNDays: number;
    issuesLastNDays: number;
    prsLastNDays: number;
    days: number;
  };
  contributors: Array<{
    login: string;
    avatarUrl: string;
    contributions: number;
    htmlUrl: string;
  }>;
  commitsPerDay: Array<{ date: string; count: number }>;
  since: string;
};

const EVENT_LABELS: Record<string, string> = {
  PushEvent: "Pushed commits",
  PullRequestEvent: "Pull request activity",
  IssuesEvent: "Issues activity",
  IssueCommentEvent: "Commented on issue",
  CreateEvent: "Created something",
  DeleteEvent: "Deleted something",
  WatchEvent: "Starred repository",
  ForkEvent: "Forked repository",
  ReleaseEvent: "Release activity",
};

function shortRepo(name?: string) {
  if (!name) return "—";
  return name.split("/")[1] || name;
}

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const min = Math.floor(diff / 60000);
  if (min < 1) return "just now";
  if (min < 60) return `${min}m ago`;
  const h = Math.floor(min / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
}

export default function GithubActivity() {
  // --- User public activity ---
  const [username, setUsername] = useState("");
  const [events, setEvents] = useState<GhEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [filter, setFilter] = useState("");
  const [visibleCount, setVisibleCount] = useState(10);

  useEffect(() => setVisibleCount(10), [filter]);

  const stats = useMemo(() => {
    if (!events.length) return null;

    const repoCount: Record<string, number> = {};
    const typeCount: Record<string, number> = {};

    for (const e of events) {
      if (e.repo?.name) repoCount[e.repo.name] = (repoCount[e.repo.name] || 0) + 1;
      typeCount[e.type] = (typeCount[e.type] || 0) + 1;
    }

    const topRepo = Object.entries(repoCount).sort((a, b) => b[1] - a[1])[0]?.[0] || "—";
    const topType = Object.entries(typeCount).sort((a, b) => b[1] - a[1])[0]?.[0] || "—";

    return { total: events.length, topRepo, topType };
  }, [events]);

  const filtered = useMemo(() => {
    const f = filter.trim().toLowerCase();
    if (!f) return events;

    return events.filter((e) => {
      const repo = e.repo?.name?.toLowerCase() || "";
      const type = (EVENT_LABELS[e.type] || e.type).toLowerCase();
      return repo.includes(f) || type.includes(f) || e.type.toLowerCase().includes(f);
    });
  }, [events, filter]);

  const shown = filtered.slice(0, visibleCount);
  const canLoadMore = visibleCount < filtered.length;

  const loadUserActivity = async () => {
    if (!username.trim()) return;

    setLoading(true);
    setError(null);
    setVisibleCount(10);

    try {
      const data = await apiFetch<GhEvent[]>(
        `/github/users/${username.trim()}/events/public?perPage=50&page=1`
      );
      setEvents(data);
    } catch (err: any) {
      if (err?.status === 404) setError("GitHub user not found");
      else setError(err?.message || "Failed to load GitHub activity");
    } finally {
      setLoading(false);
    }
  };

  // --- Repo summary + chart ---
  const [repoFull, setRepoFull] = useState(""); // "owner/repo"
  const [days, setDays] = useState("7");
  const [summary, setSummary] = useState<RepoSummary | null>(null);
  const [sumLoading, setSumLoading] = useState(false);
  const [sumError, setSumError] = useState<string | null>(null);

  const loadRepoSummary = async () => {
    const val = repoFull.trim();
    if (!val.includes("/")) {
      setSumError("Unesi repo kao owner/repo (npr. facebook/react)");
      return;
    }

    const [owner, repo] = val.split("/");
    const d = Number(days);
    const safeDays = Number.isFinite(d) ? Math.min(Math.max(d, 1), 30) : 7;

    setSumLoading(true);
    setSumError(null);

    try {
      const data = await apiFetch<RepoSummary>(`/github/repos/${owner}/${repo}/summary?days=${safeDays}`);
      setSummary(data);
    } catch (err: any) {
      setSumError(err?.message || "Failed to load repo summary");
      setSummary(null);
    } finally {
      setSumLoading(false);
    }
  };

  const chartData = useMemo(() => {
    if (!summary) return null;

    // Google Charts format: [["Date","Commits"], ["2026-02-21", 3], ...]
    const rows = summary.commitsPerDay.map((p) => [p.date, p.count]);
    return [["Date", "Commits"], ...rows];
  }, [summary]);

  return (
    <section className="mt-6 flex flex-col gap-4">
      {/* Repo summary (profi deo) */}
      <Card>
        <h2 className="text-xl font-semibold mb-3">Repository Summary</h2>

        <div className="grid gap-3 md:grid-cols-3">
          <InputField
            label="Repository (owner/repo)"
            value={repoFull}
            onChange={setRepoFull}
            placeholder="npr. facebook/react"
          />
          <InputField
            label="Days (1–30)"
            value={days}
            onChange={setDays}
            placeholder="7"
          />
          <div className="flex items-end">
            <Button onClick={loadRepoSummary} disabled={sumLoading} className="w-full">
              {sumLoading ? "Loading..." : "Load repo summary"}
            </Button>
          </div>
        </div>

        {sumError && <p className="text-red-600 text-sm mt-3">{sumError}</p>}

        {summary && (
          <div className="mt-4 grid gap-3">
            {/* KPI */}
            <div className="grid gap-3 md:grid-cols-3">
              <Card>
                <div className="text-sm text-zinc-600">Commits (last {summary.kpis.days}d)</div>
                <div className="text-2xl font-semibold">{summary.kpis.commitsLastNDays}</div>
              </Card>
              <Card>
                <div className="text-sm text-zinc-600">PRs (last {summary.kpis.days}d)</div>
                <div className="text-2xl font-semibold">{summary.kpis.prsLastNDays}</div>
              </Card>
              <Card>
                <div className="text-sm text-zinc-600">Issues (last {summary.kpis.days}d)</div>
                <div className="text-2xl font-semibold">{summary.kpis.issuesLastNDays}</div>
              </Card>
            </div>

            {/* Repo meta */}
            <div className="grid gap-3 md:grid-cols-3">
              <Card>
                <div className="text-sm text-zinc-600">Stars</div>
                <div className="text-2xl font-semibold">{summary.repo.stars}</div>
              </Card>
              <Card>
                <div className="text-sm text-zinc-600">Forks</div>
                <div className="text-2xl font-semibold">{summary.repo.forks}</div>
              </Card>
              <Card>
                <div className="text-sm text-zinc-600">Language</div>
                <div className="text-2xl font-semibold">{summary.repo.language || "—"}</div>
              </Card>
            </div>

            {/* Chart */}
            {chartData && chartData.length > 1 && (
              <Card>
                <div className="flex items-center justify-between gap-3 mb-2">
                  <div>
                    <div className="font-semibold">Commits per day</div>
                    <div className="text-sm text-zinc-600">
                      Since {new Date(summary.since).toLocaleDateString()}
                    </div>
                  </div>
                </div>

                <Chart
                  chartType="ColumnChart"
                  width="100%"
                  height="320px"
                  data={chartData}
                  options={{
                    legend: { position: "none" },
                    hAxis: { title: "Date" },
                    vAxis: { title: "Commits" },
                    chartArea: { width: "85%", height: "70%" },
                  }}
                />
              </Card>
            )}

            {/* Contributors */}
            <Card>
              <div className="font-semibold mb-2">Top contributors</div>
              {summary.contributors.length === 0 ? (
                <div className="text-sm text-zinc-600">No contributors found.</div>
              ) : (
                <div className="grid gap-2 md:grid-cols-2">
                  {summary.contributors.map((c) => (
                    <div key={c.login} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <img
                          src={c.avatarUrl}
                          alt={c.login}
                          className="h-8 w-8 rounded-full"
                        />
                        <div className="font-semibold">{c.login}</div>
                      </div>
                      <div className="text-sm text-zinc-600">{c.contributions}</div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>
        )}
      </Card>

      {/* User activity (public feed) */}
      <Card>
        <h2 className="text-xl font-semibold mb-3">GitHub Activity (User)</h2>

        <div className="flex flex-col gap-3">
          <InputField
            label="GitHub username"
            value={username}
            onChange={setUsername}
            placeholder="npr. vercel"
          />

          <div className="flex items-center gap-2">
            <Button onClick={loadUserActivity} disabled={loading}>
              {loading ? "Loading..." : "Load activity"}
            </Button>
            <span className="text-sm text-zinc-600">public events feed</span>
          </div>

          {events.length > 0 && (
            <InputField
              label="Filter (repo / type)"
              value={filter}
              onChange={setFilter}
              placeholder="npr. pushed, pull request, nodejs..."
            />
          )}

          {error && <p className="text-red-600 text-sm">{error}</p>}
        </div>
      </Card>

      {stats && (
        <div className="grid gap-3 md:grid-cols-3">
          <Card>
            <div className="text-sm text-zinc-600">Total events</div>
            <div className="text-2xl font-semibold">{stats.total}</div>
          </Card>

          <Card>
            <div className="text-sm text-zinc-600">Top repo</div>
            <div className="text-lg font-semibold">{shortRepo(stats.topRepo)}</div>
            <div className="text-sm text-zinc-500">{stats.topRepo}</div>
          </Card>

          <Card>
            <div className="text-sm text-zinc-600">Most activity</div>
            <div className="text-lg font-semibold">
              {EVENT_LABELS[stats.topType] || stats.topType}
            </div>
          </Card>
        </div>
      )}

      {shown.length > 0 && (
        <div className="grid gap-3">
          {shown.map((e) => (
            <Card key={e.id}>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="font-semibold">{EVENT_LABELS[e.type] || e.type}</div>
                  <div className="text-sm text-zinc-600">{e.repo?.name || "Unknown repo"}</div>
                </div>
                <div className="text-sm text-zinc-600">{timeAgo(e.created_at)}</div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {events.length > 0 && canLoadMore && (
        <div className="flex justify-center">
          <Button variant="secondary" onClick={() => setVisibleCount((c) => c + 10)}>
            Load more
          </Button>
        </div>
      )}

      {!loading && !error && events.length === 0 && (
        <p className="text-sm text-zinc-600">Unesi GitHub username i klikni “Load activity”.</p>
      )}
    </section>
  );
}