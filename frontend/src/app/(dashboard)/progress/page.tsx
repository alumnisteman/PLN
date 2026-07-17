"use client";

import { TrendingUp } from "lucide-react";

export default function ProgressPage() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mb-4">
        <TrendingUp className="w-8 h-8 text-blue-400" />
      </div>
      <h3 className="text-base font-semibold text-slate-900 mb-1">Progress Lapangan</h3>
      <p className="text-sm text-slate-500">Modul Progress akan tersedia di Phase 2.</p>
    </div>
  );
}
