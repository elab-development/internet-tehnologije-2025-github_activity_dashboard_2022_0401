"use client";

import { useEffect, useState } from "react";
import Container from "@/app/components/Container";
import { Card } from "@/src/components/ui/Card";
import RequireRole from "@/app/components/RequireRole";
import { apiFetch, getRole } from "@/app/lib/api";

export default function AdminPage() {
  const [health, setHealth] = useState<any>(null);
  const [me, setMe] = useState<any>(null);

  useEffect(() => {
    (async () => {
      try {
        const h = await apiFetch("/health");
        setHealth(h);
      } catch {
        setHealth({ status: "error" });
      }

      try {
        const m = await apiFetch("/auth/me", { auth: true });
        setMe(m);
      } catch {
        setMe(null);
      }
    })();
  }, []);

  return (
    <RequireRole allow={["admin"]} redirectTo="/dashboard">
      <main className="min-h-screen p-6">
        <Container>
          <Card>
            <h1 className="text-3xl font-semibold mb-2">Admin Panel</h1>
            <p className="text-zinc-600 mb-6">
              Admin-only: sistemski pregled + provera autentifikacije (JWT role).
            </p>

            <div className="grid gap-3 md:grid-cols-3">
              <Card>
                <div className="text-sm text-zinc-600">Current role</div>
                <div className="text-2xl font-semibold">{getRole() ?? "—"}</div>
              </Card>

              <Card>
                <div className="text-sm text-zinc-600">Backend health</div>
                <div className="text-2xl font-semibold">
                  {health?.status ?? "unknown"}
                </div>
              </Card>

              <Card>
                <div className="text-sm text-zinc-600">Authenticated user</div>
                <div className="text-2xl font-semibold">
                  {me?.user?.email ?? me?.user?.username ?? "—"}
                </div>
              </Card>
            </div>

            <div className="mt-6 text-sm text-zinc-700">
              <ul className="list-disc pl-5 space-y-1">
                <li>Admin ruta je zaključana (redirect ako nije admin).</li>
                <li>Navbar prikazuje Admin link samo adminu.</li>
                <li>Admin vidi sistemske statuse i auth payload (/auth/me).</li>
              </ul>
            </div>
          </Card>
        </Container>
      </main>
    </RequireRole>
  );
}