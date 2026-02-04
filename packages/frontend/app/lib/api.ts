const BASE = process.env.NEXT_PUBLIC_API_BASE_URL;

export function setToken(token: string) {
  localStorage.setItem("ghad_token", token);
}

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("ghad_token");
}

export function clearToken() {
  localStorage.removeItem("ghad_token");
}

export async function apiFetch<T>(
  path: string,
  options: RequestInit & { auth?: boolean } = {}
): Promise<T> {
  if (!BASE) throw new Error("NEXT_PUBLIC_API_BASE_URL is missing");

  const headers = new Headers(options.headers);
  headers.set("Content-Type", "application/json");

  if (options.auth) {
    const token = getToken();
    if (token) headers.set("Authorization", `Bearer ${token}`);
  }

  const res = await fetch(`${BASE}${path}`, { ...options, headers });
  const isJson = res.headers.get("content-type")?.includes("application/json");
  const data = isJson ? await res.json().catch(() => null) : null;

  if (!res.ok) {
    throw {
      message: data?.message || data?.error || `Request failed (${res.status})`,
      status: res.status,
      details: data,
    };
  }

  return data as T;
}
