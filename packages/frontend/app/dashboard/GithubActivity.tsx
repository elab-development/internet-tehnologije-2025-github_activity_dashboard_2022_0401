"use client";

import { useEffect, useMemo, useState } from "react";
import { Chart } from "react-google-charts";
import { Card } from "@/src/components/ui/Card";
import { Button } from "@/src/components/ui/Button";
import { InputField } from "@/src/components/ui/InputField";
import { apiFetch } from "@/app/lib/api";

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

type MiniItem = {
  id: number;
  number: number;
  title: string;
  htmlUrl: string;
  user: { login: string; avatarUrl: string };
  updatedAt: string;
};

export default function GithubActivity({
  initialRepo,
  onRepoChange,
}: {
  initialRepo?: string;
  onRepoChange?: (repoFull: string) => void;
}) {
  const [repoFull, setRepoFull] = useState(initialRepo ?? "");
  const [days, setDays] = useState("7");

  const [summary, setSummary] = useState<RepoSummary | null>(null);
  const [languages, setLanguages] = useState<Record<string, number> | null>(null);
  const [pulls, setPulls] = useState<MiniItem[]>([]);
  const [issues, setIssues] = useState<MiniItem[]>([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ako Dashboard promeni selected repo, syncuj input
  useEffect(() => {
    if (typeof initialRepo === "string") setRepoFull(initialRepo);
  }, [initialRepo]);

  const loadRepoDashboard = async () => {
    const val = repoFull.trim();
    if (!val.includes("/")) {
      setError("Unesi repo kao owner/repo (npr. facebook/react)");
      return;
    }

    const [owner, repo] = val.split("/");
    const d = Number(days);
    const safeDays = Number.isFinite(d) ? Math.min(Math.max(d, 1), 30) : 7;

    setLoading(true);
    setError(null);

    try {
      const data = await apiFetch<RepoSummary>(
        `/github/repos/${owner}/${repo}/summary?days=${safeDays}`
      );
      setSummary(data);

      const [langs, openPRs, openIssuesList] = await Promise.all([
        apiFetch<Record<string, number>>(`/github/repos/${owner}/${repo}/languages`),
        apiFetch<MiniItem[]>(`/github/repos/${owner}/${repo}/pulls/open?perPage=5`),
        apiFetch<MiniItem[]>(`/github/repos/${owner}/${repo}/issues/open?perPage=5`),
      ]);

      setLanguages(langs);
      setPulls(openPRs);
      setIssues(openIssuesList);
    } catch (e: any) {
      setSummary(null);
      setLanguages(null);
      setPulls([]);
      setIssues([]);
      setError(e?.message || "Failed to load repo dashboard");
    } finally {
      setLoading(false);
    }
  };

  const commitsChartData = useMemo(() => {
    if (!summary) return null;
    return [["Date", "Commits"], ...summary.commitsPerDay.map((p) => [p.date, p.count])];
  }, [summary]);

  const langChartData = useMemo(() => {
    if (!languages) return null;

    const entries = Object.entries(languages)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6);

    if (entries.length === 0) return null;

    return [["Language", "Bytes"], ...entries.map(([lang, bytes]) => [lang, bytes])];
  }, [languages]);

  return (
    <section className="mt-6">
      <div className="rounded-3xl p-6 md:p-8 bg-gradient-to-br from-zinc-50 to-zinc-100 border border-zinc-200 shadow-sm">
        <div className="flex flex-col gap-2 mb-6">
          <h1 className="text-2xl md:text-3xl font-semibold">Repository Analytics</h1>
          <p className="text-sm text-zinc-600">
            Podaci idu preko našeg backenda (Octokit) + vizualizacija Google Charts.
          </p>
        </div>

        <Card>
          <div className="grid gap-3 md:grid-cols-3">
            <InputField
              label="Repository (owner/repo)"
              value={repoFull}
              onChange={(v) => {
                setRepoFull(v);
                onRepoChange?.(v);
              }}
              placeholder="npr. facebook/react"
            />
            <InputField label="Days (1–30)" value={days} onChange={setDays} placeholder="7" />
            <div className="flex items-end">
              <Button className="w-full" onClick={loadRepoDashboard} disabled={loading}>
                {loading ? "Loading..." : "Load dashboard"}
              </Button>
            </div>
          </div>

          {error && <p className="text-red-600 text-sm mt-3">{error}</p>}

          {!error && !summary && (
            <p className="text-sm text-zinc-600 mt-3">
              Unesi repo i klikni “Load dashboard”.
            </p>
          )}
        </Card>

        {summary && (
          <div className="mt-4 grid gap-4">
            <Card>
              <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                <div>
                  <div className="text-sm text-zinc-600">Repository</div>
                  <div className="text-xl font-semibold">{summary.repo.fullName}</div>
                  {summary.repo.description && (
                    <div className="text-sm text-zinc-600 mt-1">{summary.repo.description}</div>
                  )}
                  <a
                    className="text-sm text-blue-600 hover:underline mt-2 inline-block"
                    href={summary.repo.htmlUrl}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Open on GitHub →
                  </a>
                </div>

                <div className="flex flex-wrap gap-2 mt-3 md:mt-0">
                  <span className="px-3 py-1 rounded-full bg-zinc-100 text-sm border border-zinc-200">
                    Language: {summary.repo.language || "—"}
                  </span>
                  <span className="px-3 py-1 rounded-full bg-zinc-100 text-sm border border-zinc-200">
                    Stars: {summary.repo.stars}
                  </span>
                  <span className="px-3 py-1 rounded-full bg-zinc-100 text-sm border border-zinc-200">
                    Forks: {summary.repo.forks}
                  </span>
                </div>
              </div>
            </Card>

            <div className="grid gap-3 md:grid-cols-3">
              <Card>
                <div className="text-sm text-zinc-600">Commits (last {summary.kpis.days}d)</div>
                <div className="text-3xl font-semibold">{summary.kpis.commitsLastNDays}</div>
              </Card>
              <Card>
                <div className="text-sm text-zinc-600">PRs (last {summary.kpis.days}d)</div>
                <div className="text-3xl font-semibold">{summary.kpis.prsLastNDays}</div>
              </Card>
              <Card>
                <div className="text-sm text-zinc-600">Issues (last {summary.kpis.days}d)</div>
                <div className="text-3xl font-semibold">{summary.kpis.issuesLastNDays}</div>
              </Card>
            </div>

            {commitsChartData && commitsChartData.length > 1 && (
              <Card>
                <div className="font-semibold mb-1">Commits per day</div>
                <div className="text-sm text-zinc-600 mb-2">
                  Since {new Date(summary.since).toLocaleDateString()}
                </div>
                <Chart
                  chartType="ColumnChart"
                  width="100%"
                  height="320px"
                  data={commitsChartData}
                  options={{
                    legend: { position: "none" },
                    hAxis: { title: "Date" },
                    vAxis: { title: "Commits" },
                    chartArea: { width: "85%", height: "70%" },
                    backgroundColor: "transparent",
                  }}
                />
              </Card>
            )}

            {langChartData && (
              <Card>
                <div className="font-semibold mb-2">Language breakdown (top 6)</div>
                <Chart
                  chartType="PieChart"
                  width="100%"
                  height="320px"
                  data={langChartData}
                  options={{
                    pieHole: 0.45,
                    chartArea: { width: "90%", height: "80%" },
                    backgroundColor: "transparent",
                    legend: { position: "right" },
                  }}
                />
              </Card>
            )}

            <div className="grid gap-3 md:grid-cols-2">
              <Card>
                <div className="font-semibold mb-2">Open Pull Requests (top 5)</div>
                {pulls.length === 0 ? (
                  <div className="text-sm text-zinc-600">No open PRs found.</div>
                ) : (
                  <div className="grid gap-2">
                    {pulls.map((p) => (
                      <a
                        key={p.id}
                        href={p.htmlUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="rounded-xl border border-zinc-200 bg-white/70 px-3 py-2 hover:bg-white transition"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div className="font-semibold line-clamp-1">
                            #{p.number} {p.title}
                          </div>
                          <div className="text-xs text-zinc-600">
                            {new Date(p.updatedAt).toLocaleDateString()}
                          </div>
                        </div>
                      </a>
                    ))}
                  </div>
                )}
              </Card>

              <Card>
                <div className="font-semibold mb-2">Open Issues (top 5)</div>
                {issues.length === 0 ? (
                  <div className="text-sm text-zinc-600">No open issues found.</div>
                ) : (
                  <div className="grid gap-2">
                    {issues.map((i) => (
                      <a
                        key={i.id}
                        href={i.htmlUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="rounded-xl border border-zinc-200 bg-white/70 px-3 py-2 hover:bg-white transition"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div className="font-semibold line-clamp-1">
                            #{i.number} {i.title}
                          </div>
                          <div className="text-xs text-zinc-600">
                            {new Date(i.updatedAt).toLocaleDateString()}
                          </div>
                        </div>
                      </a>
                    ))}
                  </div>
                )}
              </Card>
            </div>

            <Card>
              <div className="font-semibold mb-2">Top contributors</div>
              {summary.contributors.length === 0 ? (
                <div className="text-sm text-zinc-600">No contributors found.</div>
              ) : (
                <div className="grid gap-2 md:grid-cols-2">
                  {summary.contributors.map((c) => (
                    <a
                      key={c.login}
                      href={c.htmlUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center justify-between rounded-xl border border-zinc-200 bg-white/70 px-3 py-2 hover:bg-white transition"
                    >
                      <div className="flex items-center gap-2">
                        <img src={c.avatarUrl} alt={c.login} className="h-8 w-8 rounded-full" />
                        <div className="font-semibold">{c.login}</div>
                      </div>
                      <div className="text-sm text-zinc-600">{c.contributions}</div>
                    </a>
                  ))}
                </div>
              )}
            </Card>
          </div>
        )}
      </div>
    </section>
  );
}