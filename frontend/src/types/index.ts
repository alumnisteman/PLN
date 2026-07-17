/**
 * Shared TypeScript types untuk Smart Construction ERP.
 */

// ─── Base Types ────────────────────────────────────────────────────────────

export interface BaseRecord {
  uuid: string;
  created_by: number;
  updated_by: number;
  created_at: string;
  updated_at: string;
}

// ─── Auth ──────────────────────────────────────────────────────────────────

export interface User extends BaseRecord {
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  is_active: boolean;
  roles: Role[];
}

export interface Role {
  uuid: string;
  name: string;
  display_name: string;
  permissions: Permission[];
}

export interface Permission {
  uuid: string;
  module: string;
  action: "view" | "create" | "edit" | "delete" | "approve" | "export";
}

// ─── Project ───────────────────────────────────────────────────────────────

export type ProjectStatus =
  | "draft"
  | "planning"
  | "running"
  | "hold"
  | "completed"
  | "closed";

export interface Project extends BaseRecord {
  code: string;
  name: string;
  description?: string;
  client_name: string;
  location: string;
  status: ProjectStatus;
  contract_value: number;
  start_date: string;
  end_date: string;
  progress_percent: number;
  project_manager?: User;
}

// ─── Contract ──────────────────────────────────────────────────────────────

export type ContractStatus = "draft" | "active" | "completed" | "terminated";

export interface Contract extends BaseRecord {
  number: string;
  title: string;
  project_uuid: string;
  vendor_uuid?: string;
  status: ContractStatus;
  value: number;
  signed_date?: string;
  start_date: string;
  end_date: string;
}

// ─── Material ──────────────────────────────────────────────────────────────

export interface Material extends BaseRecord {
  code: string;
  name: string;
  category: string;
  unit: string;
  unit_price: number;
  current_stock: number;
  minimum_stock: number;
}

// ─── Finance ───────────────────────────────────────────────────────────────

export type InvoiceStatus = "draft" | "submitted" | "approved" | "paid" | "overdue";

export interface Invoice extends BaseRecord {
  number: string;
  project_uuid: string;
  vendor_uuid?: string;
  status: InvoiceStatus;
  amount: number;
  tax_amount: number;
  total_amount: number;
  due_date: string;
  paid_date?: string;
}

// ─── UI / Pagination ───────────────────────────────────────────────────────

export interface PaginationMeta {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface TableColumn<T> {
  key: keyof T | string;
  title: string;
  sortable?: boolean;
  width?: number;
  render?: (value: unknown, row: T) => React.ReactNode;
}
