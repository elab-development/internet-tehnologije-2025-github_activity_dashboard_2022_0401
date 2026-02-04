"use client";

import { useRouter } from "next/navigation";

import { Button } from "@/src/components/ui/Button";
import { Card } from "@/src/components/ui/Card";

import { clearToken } from "../lib/api";
import Container from "../components/Container";

export default function DashboardPage() {
  const router = useRouter();

  return (
  <main className="min-h-screen p-6">
    <Container>
      <h1 className="text-3xl font-semibold mb-2">
        Dashboard
      </h1>

      <p className="text-zinc-600 mb-6">
        Pregled vaših repozitorijuma i aktivnosti
      </p>

      {/* ostatak dashboard sadržaja */}
      <div className="grid gap-4">
        {/* kartice, liste, repo info */}
      </div>
    </Container>
  </main>
);
}
