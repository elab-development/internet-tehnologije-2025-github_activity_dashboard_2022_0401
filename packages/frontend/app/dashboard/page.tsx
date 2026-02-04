"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/src/components/ui/Card";
import { Button } from "@/src/components/ui/Button";
import { getToken, clearToken } from "../lib/api";




export default function DashboardPage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const token = getToken();
    if (!token) {
      router.push("/login");
    } else {
      setReady(true);
    }
  }, [router]);

  if (!ready) return null;

  return (
    <main className="min-h-screen p-6 flex justify-center">
      <Card>
        <h1 className="text-2xl font-semibold mb-4">Dashboard</h1>
        <p className="mb-4">Zaštićena ruta – vidi se samo ako si ulogovan.</p>
        <Button
          variant="secondary"
          onClick={() => {
            clearToken();
            router.push("/login");
          }}
        >
          Logout
        </Button>
      </Card>
    </main>
  );
}
