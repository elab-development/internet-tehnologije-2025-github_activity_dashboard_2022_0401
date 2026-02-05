"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { clearToken, getToken } from "../lib/api";

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const isLoggedIn = !!getToken();

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
              <button
                className="px-3 py-2 rounded hover:bg-zinc-100"
                onClick={() => {
                  clearToken();
                  router.push("/login");
                }}
              >
                Logout
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
