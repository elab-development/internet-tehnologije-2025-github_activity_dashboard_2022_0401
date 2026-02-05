"use client";

import { useMemo, useState } from "react";
import { Card } from "@/src/components/ui/Card";
import { Button } from "@/src/components/ui/Button";
import { InputField } from "@/src/components/ui/InputField";

type GhEvent = {
  id: string;
  type: string;
  created_at: string;
  repo?: { name: string };
  actor?: { login: string; avatar_url: string };
  payload?: any;
};

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleString();
}

export default function GithubActivity() {
  const [username, setUsername] = useState("");
  const [events, setEvents] = useState<GhEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState("");

  const filtered = useMemo(() => {
    const f = filter.trim().toLowerCase();
    if (!f) return events;
    return events.filter((e) => {
      const repo = e.repo?.name?.toLowerCase() || "";
      const type = e.type?.toLowerCase() || "";
      return repo.includes(f) || type.includes(f);
    });
  }, [events, filter]);

  const load = async () => {
    if (!username.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`https://api.github.com/users/${username}/events/public`);
      if (!res.ok) {
        if (res.status === 404) throw new Error("GitHub user not found");
        throw new Error(`GitHub error (${res.status})`);
      }
      const data = (await res.json()) as GhEvent[];
      setEvents(data);
    } catch (e: any) {
      setError(e.message || "Failed to load activity");
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-6 flex flex-col gap-4">
      <Card>
        <h2 className="text-xl font-semibold mb-3">GitHub Activity</h2>

        <div className="flex flex-col gap-3">
          <InputField
            label="GitHub username"
            value={username}
            onChange={setUsername}
            placeholder="npr. vercel"
          />

          <div className="flex gap-2 items-center">
            <Button onClick={load} disabled={loading}>
              {loading ? "Loading..." : "Load activity"}
            </Button>
            <span className="text-sm text-zinc-600">
              prikaz prvih ~30 public eventova
            </span>
          </div>

          {events.length > 0 && (
            <InputField
              label="Filter (repo ili type)"
              value={filter}
              onChange={setFilter}
              placeholder="npr. PushEvent ili openjs-foundation/..."
            />
          )}

          {error && <p className="text-red-600 text-sm">{error}</p>}
        </div>
      </Card>

      {filtered.length > 0 && (
        <div className="grid gap-3">
          {filtered.slice(0, 15).map((e) => (
            <Card key={e.id}>
              <div className="flex justify-between gap-4">
                <div>
                  <div className="font-semibold">{e.type}</div>
                  <div className="text-sm text-zinc-600">
                    {e.repo?.name || "Unknown repo"}
                  </div>
                </div>
                <div className="text-sm text-zinc-600">{formatDate(e.created_at)}</div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {!loading && !error && events.length === 0 && (
        <p className="text-sm text-zinc-600">
          Unesi GitHub username i učitaj aktivnost.
        </p>
      )}
    </div>
  );
}
