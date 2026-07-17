import * as React from "react";
import { cn } from "../../utils/cn";

type StatusVariant =
  | "draft"
  | "pending"
  | "active"
  | "running"
  | "approved"
  | "completed"
  | "closed"
  | "rejected"
  | "hold"
  | "cancelled"
  | "paid"
  | "overdue";

const statusConfig: Record<StatusVariant, { label: string; className: string }> = {
  draft:     { label: "Draft",      className: "bg-slate-100 text-slate-600" },
  pending:   { label: "Pending",    className: "bg-amber-100 text-amber-700" },
  active:    { label: "Aktif",      className: "bg-blue-100 text-blue-700" },
  running:   { label: "Berjalan",   className: "bg-sky-100 text-sky-700" },
  approved:  { label: "Disetujui",  className: "bg-emerald-100 text-emerald-700" },
  completed: { label: "Selesai",    className: "bg-green-100 text-green-700" },
  closed:    { label: "Ditutup",    className: "bg-slate-200 text-slate-500" },
  rejected:  { label: "Ditolak",    className: "bg-red-100 text-red-700" },
  hold:      { label: "Ditunda",    className: "bg-orange-100 text-orange-700" },
  cancelled: { label: "Dibatalkan", className: "bg-red-100 text-red-600" },
  paid:      { label: "Lunas",      className: "bg-emerald-100 text-emerald-700" },
  overdue:   { label: "Jatuh Tempo",className: "bg-red-100 text-red-700" },
};

export interface StatusBadgeProps {
  status: StatusVariant | string;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status as StatusVariant] ?? {
    label: status,
    className: "bg-slate-100 text-slate-600",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        config.className,
        className
      )}
    >
      {config.label}
    </span>
  );
}
