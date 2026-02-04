"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/src/components/ui/Button";
import { InputField } from "@/src/components/ui/InputField";
import { Card } from "@/src/components/ui/Card";

import { apiFetch, setToken } from "../lib/api";
import Container from "../components/Container";

type LoginResponse = {
  email: string;
  token: string;
};

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setError(null);
    setLoading(true);

    try {
      const res = await apiFetch<LoginResponse>("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });

      setToken(res.token);
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen p-6">
      <Container>
        <Card>
          <h1 className="text-2xl font-semibold mb-2">Login</h1>

          <p className="text-zinc-600 mb-6 text-sm">
            Prijavite se na svoj nalog
          </p>

          <div className="flex flex-col gap-3">
            <InputField
              label="Email"
              type="email"
              value={email}
              onChange={setEmail}
            />

            <InputField
              label="Password"
              type="password"
              value={password}
              onChange={setPassword}
            />

            {error && <p className="text-red-600 text-sm">{error}</p>}

            <Button onClick={handleLogin} disabled={loading}>
              {loading ? "Logging in..." : "Login"}
            </Button>
          </div>
        </Card>
      </Container>
    </main>
  );
}
