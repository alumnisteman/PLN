import { request } from "./auth";

export interface Contract {
  uuid: string;
  number: string;
  title: string;
  project_id: number;
  project?: { uuid: string; code: string; name: string };
  type: "main" | "addendum" | "subcontract" | "supply";
  status: "draft" | "active" | "completed" | "terminated";
  value: number;
  client_name?: string;
  signed_date?: string;
  start_date: string;
  end_date: string;
  scope?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface ContractsResponse {
  success: boolean;
  data: Contract[];
  meta: { current_page: number; last_page: number; per_page: number; total: number };
}

export const contractService = {
  list: (params?: Record<string, string | number>) => {
    const qs = params ? "?" + new URLSearchParams(params as Record<string, string>).toString() : "";
    return request<ContractsResponse>(`/contracts${qs}`);
  },
  get: (uuid: string) => request<{ success: boolean; data: Contract }>(`/contracts/${uuid}`),
  create: (data: Partial<Contract> & { project_id: number }) =>
    request<{ success: boolean; data: Contract }>("/contracts", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  update: (uuid: string, data: Partial<Contract>) =>
    request<{ success: boolean; data: Contract }>(`/contracts/${uuid}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),
  delete: (uuid: string) => request(`/contracts/${uuid}`, { method: "DELETE" }),
};
