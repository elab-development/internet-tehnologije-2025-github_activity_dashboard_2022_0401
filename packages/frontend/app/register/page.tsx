"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/src/components/ui/Card";
import { InputField } from "@/src/components/ui/InputField";
import { Button } from "@/src/components/ui/Button";
import { apiFetch } from "../lib/api";


type RegisterResponse = { id: number; email: string; username: string; role: string };

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
      await apiFetch<RegisterResponse>("/auth/register", {
        method: "POST",
        body: JSON.stringify({ email, username, password }),
      });
      router.push("/login");
    } catch (e: any) {
      setError(e.message || "Register failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <Card>
        <h1 className="text-2xl font-semibold mb-4">Register</h1>
        <div className="flex flex-col gap-3">
          <InputField label="Email" type="email" value={email} onChange={setEmail} />
          <InputField label="Username" value={username} onChange={setUsername} />
          <InputField label="Password" type="password" value={password} onChange={setPassword} />
          {error && <p className="text-red-600 text-sm">{error}</p>}
          <Button onClick={handleRegister} disabled={loading}>
            {loading ? "Creating..." : "Create account"}
          </Button>
        </div>
      </Card>
    </main>
  );
}
