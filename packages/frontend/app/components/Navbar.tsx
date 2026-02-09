"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { clearToken, getToken, getRole } from "../lib/api";

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();

  const isLoggedIn = !!getToken();
  const role = getRole();
  const isAdmin = role === "admin";

  const linkClass = (href: string) =>
    `px-3 py-2 rounded ${
      pathname === href ? "bg-zinc-200" : "hover:bg-zinc-100"
    }`;

  return (
    <nav className="border-b bg-white">
      <div className="max-w-5xl mx-auto px-4 py-3 flex justify-between items-center">
        <Link href="/" className="font-semibold text-lg">
          GH Dashboard
        </Link>

        <div className="flex gap-2 items-center">
          <Link href="/" className={linkClass("/")}>
            Home
          </Link>

          {!isLoggedIn && (
            <>
              <Link href="/login" className={linkClass("/login")}>
                Login
              </Link>
              <Link href="/register" className={linkClass("/register")}>
                Register
              </Link>
            </>
          )}

          {isLoggedIn && (
            <>
              <Link href="/dashboard" className={linkClass("/dashboard")}>
                Dashboard
              </Link>

              {isAdmin && (
                <Link href="/admin" className={linkClass("/admin")}>
                  Admin
                </Link>
              )}

              <button
                className="px-3 py-2 rounded hover:bg-zinc-100"
                onClick={() => {
                  clearToken();
                  router.push("/login");
                }}
              >
                Logout
              </button>

              <span className="ml-2 text-xs text-zinc-600">
                role: <b>{role ?? "—"}</b>
              </span>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

