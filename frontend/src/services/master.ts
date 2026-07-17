import { request } from "./auth";

export type MasterType = "positions" | "departments" | "material-categories" | "units";

export interface MasterItem {
  uuid: string;
  code: string;
  name: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  [key: string]: unknown;
}

export interface MasterListResponse {
  success: boolean;
  data: MasterItem[];
  meta: { current_page: number; last_page: number; per_page: number; total: number };
}

export const masterService = {
  list: (type: MasterType, params?: Record<string, string | number>) => {
    const qs = params ? "?" + new URLSearchParams(params as Record<string, string>).toString() : "";
    return request<MasterListResponse>(`/master/${type}${qs}`);
  },
  all: (type: MasterType) =>
    request<{ success: boolean; data: MasterItem[] }>(`/master/${type}/all`),
  get: (type: MasterType, uuid: string) =>
    request<{ success: boolean; data: MasterItem }>(`/master/${type}/${uuid}`),
  create: (type: MasterType, data: Record<string, unknown>) =>
    request<{ success: boolean; data: MasterItem }>(`/master/${type}`, {
      method: "POST",
      body: JSON.stringify(data),
    }),
  update: (type: MasterType, uuid: string, data: Record<string, unknown>) =>
    request<{ success: boolean; data: MasterItem }>(`/master/${type}/${uuid}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),
  delete: (type: MasterType, uuid: string) =>
    request(`/master/${type}/${uuid}`, { method: "DELETE" }),
};
