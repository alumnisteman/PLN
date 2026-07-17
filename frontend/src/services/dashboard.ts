import { request } from "./auth";

export interface DashboardData {
  stats: {
    projects: { total: number; running: number; completed: number; draft: number };
    contracts: { total: number; active: number };
  };
  recent_projects: {
    uuid: string;
    code: string;
    name: string;
    status: string;
    progress_percent: number;
    contract_value: number;
    end_date: string;
    project_manager?: string;
  }[];
}

export const dashboardService = {
  get: () => request<{ success: boolean; data: DashboardData }>("/dashboard"),
};
