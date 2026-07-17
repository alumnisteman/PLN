import { useAuthStore } from "@/store/auth";

const BASE = "/api/v1";

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = useAuthStore.getState().token;
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Accept: "application/json",
    ...(options.headers as Record<string, string>),
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${BASE}${endpoint}`, { ...options, headers });
  const json = await res.json();
  if (!res.ok) throw json;
  return json;
}

export const authService = {
  login: (email: string, password: string) =>
    request<{ success: boolean; data: { token: string; user: unknown } }>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),

  logout: () => request("/auth/logout", { method: "POST" }),

  me: () => request("/auth/me", { method: "GET" }),
};

export { request };
