import { request } from "./auth";

export interface Project {
  uuid: string;
  code: string;
  name: string;
  description?: string;
  client_name: string;
  location: string;
  province?: string;
  city?: string;
  type?: string;
  status: "draft" | "planning" | "running" | "hold" | "completed" | "closed";
  contract_value: number;
  boq_value: number;
  start_date: string;
  end_date: string;
  progress_percent: number;
  duration_days: number;
  is_overdue: boolean;
  project_manager?: { uuid: string; name: string; avatar?: string };
  site_engineer?: { uuid: string; name: string };
  contracts_count?: number;
  created_at: string;
}

export interface ProjectsResponse {
  success: boolean;
  data: Project[];
  meta: { current_page: number; last_page: number; per_page: number; total: number };
}

export const projectService = {
  list: (params?: Record<string, string | number>) => {
    const qs = params ? "?" + new URLSearchParams(params as Record<string, string>).toString() : "";
    return request<ProjectsResponse>(`/projects${qs}`);
  },
  get: (uuid: string) => request<{ success: boolean; data: Project }>(`/projects/${uuid}`),
  create: (data: Partial<Project>) => request("/projects", { method: "POST", body: JSON.stringify(data) }),
  update: (uuid: string, data: Partial<Project>) =>
    request(`/projects/${uuid}`, { method: "PATCH", body: JSON.stringify(data) }),
  delete: (uuid: string) => request(`/projects/${uuid}`, { method: "DELETE" }),
};
