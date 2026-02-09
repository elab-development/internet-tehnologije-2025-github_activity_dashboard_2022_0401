"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getRole, getToken } from "../lib/api";
import { Card } from "@/src/components/ui/Card";

export default function AdminPage() {
  const router = useRouter();

  useEffect(() => {
    const token = getToken();
    const role = getRole();

    if (!token) {
      router.push("/login");
      return;
    }

    if (role !== "admin") {
      router.push("/dashboard");
      return;
    }
  }, [router]);

  return (
    <main className="min-h-screen p-6">
      <div className="max-w-5xl mx-auto">
        <Card>
          <h1 className="text-3xl font-semibold mb-2">Admin</h1>
          <p className="text-zinc-600">
            Ova stranica je dostupna samo korisnicima sa rolom <b>admin</b>.
          </p>

          <div className="mt-4 text-sm text-zinc-700">
            <ul className="list-disc pl-5 space-y-1">
              <li>Role-based UI (Navbar prikazuje Admin link samo adminu)</li>
              <li>Route guard: redirect ako korisnik nije admin</li>
              <li>JWT payload se koristi za čitanje role</li>
            </ul>
          </div>
        </Card>
      </div>
    </main>
  );
}
