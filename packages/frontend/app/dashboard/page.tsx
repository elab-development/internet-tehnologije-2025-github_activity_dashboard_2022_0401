"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { Button } from "@/src/components/ui/Button";
import { Card } from "@/src/components/ui/Card";

import { clearToken, getToken } from "../lib/api";
import Container from "../components/Container";

export default function DashboardPage() {
  const router = useRouter();

  // ✅ Redirect if not logged in
  useEffect(() => {
    if (!getToken()) {
      router.push("/login");
    }
  }, [router]);

  return (
    <main className="min-h-screen p-6">
      <Container>
        <Card>
          <h1 className="text-3xl font-semibold mb-2">Dashboard</h1>

          <p className="text-zinc-600 mb-6">
            Zaštićena ruta – vidi se samo ako si ulogovan.
          </p>

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
      </Container>
    </main>
  );
}
