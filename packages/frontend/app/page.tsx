"use client";

import Link from "next/link";
import { getToken } from "./lib/api";
import Container from "./components/Container";
import { Card } from "@/src/components/ui/Card";
import { Button } from "@/src/components/ui/Button";

export default function HomePage() {
  const isLoggedIn = !!getToken();

  return (
    <main className="p-6">
      <Container>
        <Card>
          <h1 className="text-3xl font-semibold mb-3">
            OpenJS GitHub Activity Dashboard
          </h1>

          <p className="text-zinc-600 mb-6">
            Web aplikacija za prikaz GitHub public aktivnosti uz autentifikaciju.
          </p>

          <div className="flex gap-3 flex-wrap">
            {!isLoggedIn ? (
              <>
                <Link href="/register">
                  <Button>Register</Button>
                </Link>
                <Link href="/login">
                  <Button variant="secondary">Login</Button>
                </Link>
              </>
            ) : (
              <Link href="/dashboard">
                <Button>Go to Dashboard</Button>
              </Link>
            )}
          </div>

          <div className="mt-10 grid gap-4 md:grid-cols-3">
            <Card>
              <div className="text-sm text-zinc-600">Auth</div>
              <div className="font-semibold">Register / Login</div>
            </Card>

            <Card>
              <div className="text-sm text-zinc-600">Protected route</div>
              <div className="font-semibold">Dashboard</div>
            </Card>

            <Card>
              <div className="text-sm text-zinc-600">GitHub API</div>
              <div className="font-semibold">Activity feed</div>
            </Card>
          </div>
        </Card>
      </Container>
    </main>
  );
}
