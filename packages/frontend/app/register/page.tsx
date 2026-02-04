"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/src/components/ui/Button";
import { InputField } from "@/src/components/ui/InputField";
import { Card } from "@/src/components/ui/Card";

import { apiFetch } from "../lib/api";
import Container from "../components/Container";

export default function RegisterPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    setError(null);
    setLoading(true);

    try {
      await apiFetch("/auth/register", {
        method: "POST",
        body: JSON.stringify({ email, username, password }),
      });

      router.push("/login");
    } catch (err: any) {
      setError(err.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen p-6">
      <Container>
        <Card>
          <h1 className="text-2xl font-semibold mb-2">Register</h1>

          <p className="text-zinc-600 mb-6 text-sm">
            Napravite novi nalog da biste pristupili aplikaciji
          </p>

          <div className="flex flex-col gap-3">
            <InputField
              label="Email"
              type="email"
              value={email}
              onChange={setEmail}
            />

            <InputField
              label="Username"
              value={username}
              onChange={setUsername}
            />

            <InputField
              label="Password"
              type="password"
              value={password}
              onChange={setPassword}
            />

            {error && <p className="text-red-600 text-sm">{error}</p>}

            <Button onClick={handleRegister} disabled={loading}>
              {loading ? "Creating..." : "Create account"}
            </Button>
          </div>
        </Card>
      </Container>
    </main>
  );
}
