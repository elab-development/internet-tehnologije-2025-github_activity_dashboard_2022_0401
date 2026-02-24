"use client";

import { useEffect, useMemo, useState } from "react";
import { Card } from "@/src/components/ui/Card";
import { Button } from "@/src/components/ui/Button";
import { InputField } from "@/src/components/ui/InputField";
import GithubStatsChart from "@/src/components/GithubStatsChart";

type GhEvent = {
  id: string;
  type: string;
  created_at: string;
  repo?: { name: string };
  actor?: { login: string; avatar_url: string };
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
  const [username, setUsername] = useState("");
  const [events, setEvents] = useState<GhEvent[]>([]);
  const [repoStats, setRepoStats] = useState<any>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState("");
  const [visibleCount, setVisibleCount] = useState(10);

  // Reset pagination when filter changes
  useEffect(() => {
    setVisibleCount(10);
  }, [filter]);

  // Calculate stats from events
  const stats = useMemo(() => {
    if (!events.length) return null;

    const repoCount: Record<string, number> = {};
    const typeCount: Record<string, number> = {};

    for (const e of events) {
      if (e.repo?.name) {
        repoCount[e.repo.name] =
          (repoCount[e.repo.name] || 0) + 1;
      }
      typeCount[e.type] = (typeCount[e.type] || 0) + 1;
    }

    const topRepo =
      Object.entries(repoCount).sort((a, b) => b[1] - a[1])[0]?.[0] || null;

    const topType =
      Object.entries(typeCount).sort((a, b) => b[1] - a[1])[0]?.[0] || null;

    return {
      total: events.length,
      topRepo,
      topType,
    };
  }, [events]);

  // 🔥 Automatski učitaj repo stats kad se promeni topRepo
  useEffect(() => {
    if (!stats?.topRepo) return;

    const [owner, repo] = stats.topRepo.split("/");
    loadRepoStats(owner, repo);
  }, [stats]);

  const load = async () => {
    if (!username.trim()) return;

    setLoading(true);
    setError(null);
    setRepoStats(null);
    setVisibleCount(10);

    try {
      const res = await fetch(
        `https://api.github.com/users/${username}/events/public`
      );

      if (!res.ok) {
        if (res.status === 404) throw new Error("GitHub user not found");
        throw new Error(`GitHub error (${res.status})`);
      }

      const data = (await res.json()) as GhEvent[];
      setEvents(data);
    } catch (e: any) {
      setEvents([]);
      setError(e.message || "Failed to load activity");
    } finally {
      setLoading(false);
    }
  };

  const loadRepoStats = async (owner: string, repo: string) => {
    try {
      const res = await fetch(
        `http://localhost:5000/github/${owner}/${repo}/stats`
      );

      if (!res.ok) throw new Error("Failed to load repo stats");

      const data = await res.json();
      setRepoStats(data);
    } catch (err) {
      console.error(err);
    }
  };

  const filtered = useMemo(() => {
    const f = filter.trim().toLowerCase();
    if (!f) return events;

    return events.filter((e) => {
      const repo = e.repo?.name?.toLowerCase() || "";
      const type = (EVENT_LABELS[e.type] || e.type).toLowerCase();
      return (
        repo.includes(f) ||
        type.includes(f) ||
        e.type.toLowerCase().includes(f)
      );
    });
  }, [events, filter]);

  const shown = filtered.slice(0, visibleCount);
  const canLoadMore = visibleCount < filtered.length;

  return (
    <section className="mt-6 flex flex-col gap-4">
      <Card>
        <h2 className="text-xl font-semibold mb-3">
          GitHub Activity
        </h2>

        <div className="flex flex-col gap-3">
          <InputField
            label="GitHub username"
            value={username}
            onChange={setUsername}
            placeholder="npr. vercel"
          />

          <div className="flex items-center gap-2">
            <Button onClick={load} disabled={loading}>
              {loading ? "Loading..." : "Load activity"}
            </Button>
            <span className="text-sm text-zinc-600">
              public events feed
            </span>
          </div>

          {events.length > 0 && (
            <InputField
              label="Filter (repo / type)"
              value={filter}
              onChange={setFilter}
              placeholder="npr. pushed, pull request..."
            />
          )}

          {error && (
            <p className="text-red-600 text-sm">{error}</p>
          )}
        </div>
      </Card>

      {stats && (
        <div className="grid gap-3 md:grid-cols-3">
          <Card>
            <div className="text-sm text-zinc-600">
              Total events
            </div>
            <div className="text-2xl font-semibold">
              {stats.total}
            </div>
          </Card>

          <Card>
            <div className="text-sm text-zinc-600">
              Top repo
            </div>
            <div className="text-lg font-semibold">
              {shortRepo(stats.topRepo || "")}
            </div>
            <div className="text-sm text-zinc-500">
              {stats.topRepo}
            </div>
          </Card>

          <Card>
            <div className="text-sm text-zinc-600">
              Most activity
            </div>
            <div className="text-lg font-semibold">
              {EVENT_LABELS[stats.topType || ""] ||
                stats.topType}
            </div>
          </Card>
        </div>
      )}

      {repoStats && (
        <Card>
          <GithubStatsChart
            stars={repoStats.stargazerCount}
            forks={repoStats.forkCount}
            commits={
              repoStats.defaultBranchRef?.target?.history
                ?.totalCount || 0
            }
          />
        </Card>
      )}

      {shown.length > 0 && (
        <div className="grid gap-3">
          {shown.map((e) => (
            <Card key={e.id}>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="font-semibold">
                    {EVENT_LABELS[e.type] || e.type}
                  </div>
                  <div className="text-sm text-zinc-600">
                    {e.repo?.name || "Unknown repo"}
                  </div>
                </div>
                <div className="text-sm text-zinc-600">
                  {timeAgo(e.created_at)}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {events.length > 0 && canLoadMore && (
        <div className="flex justify-center">
          <Button
            variant="secondary"
            onClick={() =>
              setVisibleCount((c) => c + 10)
            }
          >
            Load more
          </Button>
        </div>
      )}

      {!loading && !error && events.length === 0 && (
        <p className="text-sm text-zinc-600">
          Unesi GitHub username i klikni “Load activity”.
        </p>
      )}
    </section>
  );
}
