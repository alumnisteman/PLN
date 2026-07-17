import * as React from "react";
import { cn } from "../../utils/cn";

export interface StatisticProps {
  title: string;
  value: string | number;
  prefix?: React.ReactNode;
  suffix?: string;
  trend?: "up" | "down" | "neutral";
  trendValue?: string;
  icon?: React.ReactNode;
  className?: string;
}

export function Statistic({
  title,
  value,
  prefix,
  suffix,
  trend,
  trendValue,
  icon,
  className,
}: StatisticProps) {
  return (
    <div className={cn("rounded-xl border border-slate-200 bg-white p-5 shadow-sm", className)}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <p className="mt-1 text-2xl font-bold text-slate-900">
            {prefix && <span className="mr-1 text-base font-medium text-slate-500">{prefix}</span>}
            {value}
            {suffix && <span className="ml-1 text-base font-medium text-slate-500">{suffix}</span>}
          </p>
          {trendValue && (
            <p
              className={cn("mt-1 text-xs font-medium", {
                "text-emerald-600": trend === "up",
                "text-red-500": trend === "down",
                "text-slate-500": trend === "neutral" || !trend,
              })}
            >
              {trend === "up" && "↑ "}
              {trend === "down" && "↓ "}
              {trendValue}
            </p>
          )}
        </div>
        {icon && (
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}
