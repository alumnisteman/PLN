import * as React from "react";
import { cn } from "../../utils/cn";

export interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({ icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center py-16 px-4 text-center",
        className
      )}
    >
      {icon && (
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 text-slate-400">
          {icon}
        </div>
      )}
      <h3 className="mb-1 text-base font-semibold text-slate-900">{title}</h3>
      {description && (
        <p className="mb-4 max-w-sm text-sm text-slate-500">{description}</p>
      )}
      {action && <div>{action}</div>}
    </div>
  );
}
