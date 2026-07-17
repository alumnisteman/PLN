"use client";
import { BarChart3 } from "lucide-react";
export default function ReportsPage() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="w-16 h-16 bg-purple-50 rounded-2xl flex items-center justify-center mb-4">
        <BarChart3 className="w-8 h-8 text-purple-400" />
      </div>
      <h3 className="text-base font-semibold text-slate-900 mb-1">Laporan</h3>
      <p className="text-sm text-slate-500">Report Engine akan tersedia di Phase 3.</p>
    </div>
  );
}
