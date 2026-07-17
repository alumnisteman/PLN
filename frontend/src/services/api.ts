/**
 * API Service — Base client untuk komunikasi dengan Laravel API.
 *
 * Menggunakan fetch native + TanStack Query untuk server state management.
 * Semua service module mengextend/menggunakan helper dari file ini.
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost/api/v1";

export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data: T;
}

export interface PaginatedResponse<T = unknown> {
  success: boolean;
  message: string;
  data: T[];
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number;
    to: number;
  };
  links: {
    first: string;
    last: string;
    prev: string | null;
    next: string | null;
  };
}

export interface ApiError {
  success: false;
  message: string;
  errors?: Record<string, string[]>;
}

/**
 * HTTP client yang otomatis menyertakan token Sanctum.
 */
async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE}${endpoint}`;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Accept: "application/json",
    ...(options.headers as Record<string, string>),
  };

  // Ambil token dari localStorage (atau cookie — sesuaikan dengan auth strategy)
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("erp_token");
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  const json = await response.json();

  if (!response.ok) {
    throw json as ApiError;
  }

  return json as T;
}

export const api = {
  get: <T>(endpoint: string) =>
    request<ApiResponse<T>>(endpoint, { method: "GET" }),

  getPaginated: <T>(endpoint: string) =>
    request<PaginatedResponse<T>>(endpoint, { method: "GET" }),

  post: <T>(endpoint: string, body: unknown) =>
    request<ApiResponse<T>>(endpoint, {
      method: "POST",
      body: JSON.stringify(body),
    }),

  patch: <T>(endpoint: string, body: unknown) =>
    request<ApiResponse<T>>(endpoint, {
      method: "PATCH",
      body: JSON.stringify(body),
    }),

  put: <T>(endpoint: string, body: unknown) =>
    request<ApiResponse<T>>(endpoint, {
      method: "PUT",
      body: JSON.stringify(body),
    }),

  delete: <T>(endpoint: string) =>
    request<ApiResponse<T>>(endpoint, { method: "DELETE" }),

  /** Upload file dengan FormData */
  upload: <T>(endpoint: string, formData: FormData) =>
    request<ApiResponse<T>>(endpoint, {
      method: "POST",
      body: formData,
      headers: { Accept: "application/json" }, // jangan set Content-Type (browser handle boundary)
    }),
};
