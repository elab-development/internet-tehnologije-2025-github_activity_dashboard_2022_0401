"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/src/components/ui/Card";
import { Button } from "@/src/components/ui/Button";
import RequireRole from "@/app/components/RequireRole";
import { clearToken, getToken } from "@/app/lib/api";
import GithubActivity from "./GithubActivity";

function safeParseArray(raw: string | null): string[] {
  try {
    const arr = raw ? JSON.parse(raw) : [];
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

// base64url -> json
function decodeJwtPayload(token: string): any | null {
  try {
    const part = token.split(".")[1];
    if (!part) return null;

    const base64 = part.replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64 + "=".repeat((4 - (base64.length % 4)) % 4);

    const json = atob(padded);
    return JSON.parse(json);
  } catch {
    return null;
  }
}

function buildUserStorageKey(): string {
  const token = getToken();
  if (!token) return "ghad_tracked_repos_guest";

  const payload = decodeJwtPayload(token);

  const id =
    payload?.id ??
    payload?.userId ??
    payload?.sub ??
    payload?.user?.id ??
    null;

  const email = payload?.email ?? payload?.user?.email ?? null;
  const username = payload?.username ?? payload?.user?.username ?? null;

  // najstabilnije: id -> email -> username -> fallback na deo tokena
  if (id) return `ghad_tracked_repos_user_${String(id)}`;
  if (email) return `ghad_tracked_repos_email_${String(email).toLowerCase()}`;
  if (username) return `ghad_tracked_repos_username_${String(username).toLowerCase()}`;

  // poslednji fallback: stabilan hash iz tokena (prvih 12 char)
  return `ghad_tracked_repos_tok_${token.slice(0, 12)}`;
}

export default function DashboardPage() {
  const router = useRouter();

  const [storageKey, setStorageKey] = useState<string>("");

  const [tracked, setTracked] = useState<string[]>([]);
  const [selectedRepo, setSelectedRepo] = useState<string>("");
  const [currentInputRepo, setCurrentInputRepo] = useState<string>("");

  useEffect(() => {
    const key = buildUserStorageKey();
    setStorageKey(key);

    const t = safeParseArray(localStorage.getItem(key));
    setTracked(t);
    setSelectedRepo(t[0] || "");
  }, []);

  const normalizedCurrent = useMemo(() => currentInputRepo.trim(), [currentInputRepo]);

  const persist = (repos: string[]) => {
    if (!storageKey) return;
    localStorage.setItem(storageKey, JSON.stringify(repos));
  };

  const addCurrentRepo = () => {
    if (!storageKey) return;
    if (!normalizedCurrent || !normalizedCurrent.includes("/")) return;

    const exists = tracked.some((r) => r.toLowerCase() === normalizedCurrent.toLowerCase());
    if (exists) return;

    const next = [normalizedCurrent, ...tracked].slice(0, 30);
    setTracked(next);
    persist(next);
  };

  const removeRepo = (repo: string) => {
    if (!storageKey) return;
    const next = tracked.filter((r) => r !== repo);
    setTracked(next);
    persist(next);
    if (selectedRepo === repo) setSelectedRepo(next[0] || "");
  };

  const clearMyTracked = () => {
    if (!storageKey) return;
    setTracked([]);
    setSelectedRepo("");
    persist([]);
  };

  return (
    <RequireRole allow={["user", "admin"]} redirectTo="/login">
      <main className="min-h-screen px-4 md:px-8 py-6">
        <div className="w-full">
          <div className="rounded-3xl p-5 md:p-8 bg-gradient-to-br from-white via-zinc-50 to-zinc-100 border border-zinc-200 shadow-sm">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-6">
              <div>
                <h1 className="text-3xl font-semibold">Dashboard</h1>
                <p className="text-zinc-600">
                  Privatni deo: tracked repo-i su vezani za korisnika (po JWT tokenu).
                </p>
                {storageKey && (
                  <p className="text-xs text-zinc-500 mt-1">
                    storage key: <span className="font-mono">{storageKey}</span>
                  </p>
                )}
              </div>

              <div className="flex items-center gap-2">
                <Button variant="secondary" onClick={clearMyTracked} disabled={!storageKey}>
                  Clear my repos
                </Button>
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

            <div className="grid gap-4 lg:grid-cols-12">
              <div className="lg:col-span-3">
                <Card>
                  <div className="flex items-center justify-between mb-3">
                    <div className="font-semibold">My tracked repos</div>
                    <div className="text-xs text-zinc-600">{tracked.length}/30</div>
                  </div>

                  <div className="text-sm text-zinc-600 mb-3">
                    Ovo se više ne deli između različitih naloga.
                  </div>

                  <Button
                    onClick={addCurrentRepo}
                    disabled={!storageKey || !normalizedCurrent.includes("/")}
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
                            <button className="text-left flex-1" onClick={() => setSelectedRepo(r)}>
                              <div className="font-semibold text-sm">{r}</div>
                              <div className="text-xs text-zinc-600">Click to load</div>
                            </button>

                            <button
                              className="text-xs text-red-600 hover:underline"
                              onClick={() => removeRepo(r)}
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