"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/src/components/ui/Card";
import { Button } from "@/src/components/ui/Button";
import RequireRole from "@/app/components/RequireRole";
import { clearToken } from "@/app/lib/api";
import GithubActivity from "./GithubActivity";

const STORAGE_KEY = "ghad_tracked_repos";

function loadTracked(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const arr = raw ? JSON.parse(raw) : [];
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

function saveTracked(repos: string[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(repos));
}

export default function DashboardPage() {
  const router = useRouter();

  const [tracked, setTracked] = useState<string[]>([]);
  const [selectedRepo, setSelectedRepo] = useState<string>("");
  const [currentInputRepo, setCurrentInputRepo] = useState<string>("");

  useEffect(() => {
    const t = loadTracked();
    setTracked(t);
    setSelectedRepo(t[0] || "");
  }, []);

  const normalizedCurrent = useMemo(() => currentInputRepo.trim(), [currentInputRepo]);

  const addCurrentRepo = () => {
    if (!normalizedCurrent || !normalizedCurrent.includes("/")) return;

    const exists = tracked.some((r) => r.toLowerCase() === normalizedCurrent.toLowerCase());
    if (exists) return;

    const next = [normalizedCurrent, ...tracked].slice(0, 30);
    setTracked(next);
    saveTracked(next);
  };

  const removeRepo = (repo: string) => {
    const next = tracked.filter((r) => r !== repo);
    setTracked(next);
    saveTracked(next);
    if (selectedRepo === repo) setSelectedRepo(next[0] || "");
  };

  return (
    <RequireRole allow={["user", "admin"]} redirectTo="/login">
      <main className="min-h-screen px-4 md:px-8 py-6">
        {/* FULL-WIDTH wrapper */}
        <div className="w-full">
          <div className="rounded-3xl p-5 md:p-8 bg-gradient-to-br from-white via-zinc-50 to-zinc-100 border border-zinc-200 shadow-sm">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-6">
              <div>
                <h1 className="text-3xl font-semibold">Dashboard</h1>
                <p className="text-zinc-600">
                  Privatni deo aplikacije: čuvaš repo-e i brzo se prebacuješ između njih.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="secondary"
                  onClick={() => {
                    clearToken();
                    router.push("/login");
                  }}
                >
                  Logout
                </Button>
              </div>
            </div>

            {/* Content grid (wider) */}
            <div className="grid gap-4 lg:grid-cols-12">
              {/* Left sidebar */}
              <div className="lg:col-span-3">
                <Card>
                  <div className="flex items-center justify-between mb-3">
                    <div className="font-semibold">My tracked repos</div>
                    <div className="text-xs text-zinc-600">{tracked.length}/30</div>
                  </div>

                  <div className="text-sm text-zinc-600 mb-3">
                    U Explore možeš samo da gledaš. Ovde možeš da sačuvaš repo-e.
                  </div>

                  <Button
                    onClick={addCurrentRepo}
                    disabled={!normalizedCurrent.includes("/")}
                    className="w-full"
                  >
                    Save current repo
                  </Button>

                  <div className="mt-4 grid gap-2">
                    {tracked.length === 0 ? (
                      <div className="text-sm text-zinc-600">
                        Nema sačuvanih repo-a. Učitaj repo desno pa klikni “Save current repo”.
                      </div>
                    ) : (
                      tracked.map((r) => {
                        const active = r === selectedRepo;
                        return (
                          <div
                            key={r}
                            className={`rounded-xl border px-3 py-2 flex items-center justify-between gap-2 transition ${
                              active
                                ? "bg-white border-zinc-300 shadow-sm"
                                : "bg-white/60 border-zinc-200 hover:bg-white"
                            }`}
                          >
                            <button
                              className="text-left flex-1"
                              onClick={() => setSelectedRepo(r)}
                              title="Select"
                            >
                              <div className="font-semibold text-sm">{r}</div>
                              <div className="text-xs text-zinc-600">Click to load</div>
                            </button>

                            <button
                              className="text-xs text-red-600 hover:underline"
                              onClick={() => removeRepo(r)}
                              title="Remove"
                            >
                              Remove
                            </button>
                          </div>
                        );
                      })
                    )}
                  </div>
                </Card>
              </div>

              {/* Main dashboard */}
              <div className="lg:col-span-9">
                <GithubActivity
                  initialRepo={selectedRepo}
                  onRepoChange={(v) => setCurrentInputRepo(v)}
                />
              </div>
            </div>
          </div>
        </div>
      </main>
    </RequireRole>
  );
}