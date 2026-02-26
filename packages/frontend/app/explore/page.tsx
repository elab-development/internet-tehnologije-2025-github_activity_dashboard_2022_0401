"use client";

import Container from "@/app/components/Container";
import { Card } from "@/src/components/ui/Card";
import GithubActivity from "@/app/dashboard/GithubActivity";

export default function ExplorePage() {
  return (
    <main className="min-h-screen p-6">
      <Container>
        <Card>
          <h1 className="text-3xl font-semibold mb-2">Explore</h1>
          <p className="text-zinc-600 mb-6">
            Guest režim: read-only prikaz GitHub analitike (bez logina).
          </p>

          <GithubActivity />
        </Card>
      </Container>
    </main>
  );
}