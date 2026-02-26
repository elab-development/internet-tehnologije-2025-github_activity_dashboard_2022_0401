"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getRole, getToken } from "@/app/lib/api";

type Role = "guest" | "user" | "admin";

function currentRole(): Role {
  const token = getToken();
  if (!token) return "guest";
  return getRole() === "admin" ? "admin" : "user";
}

export default function RequireRole({
  allow,
  redirectTo = "/login",
  children,
}: {
  allow: Role[];
  redirectTo?: string;
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [ok, setOk] = useState<boolean | null>(null);

  useEffect(() => {
    const role = currentRole();
    if (!allow.includes(role)) {
      router.replace(redirectTo);
      setOk(false);
      return;
    }
    setOk(true);
  }, [allow, redirectTo, router]);

  if (ok === null) return null;
  if (ok === false) return null;
  return <>{children}</>;
}