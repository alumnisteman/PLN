"use client";

import { Settings } from "lucide-react";

export default function SettingsPage() {
  return (
    <div className="max-w-2xl">
      <h1 className="text-xl font-bold text-slate-900 mb-6">Pengaturan</h1>
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mb-4">
          <Settings className="w-8 h-8 text-slate-400" />
        </div>
        <h3 className="text-base font-semibold text-slate-900 mb-1">Pengaturan Sistem</h3>
        <p className="text-sm text-slate-500">Konfigurasi sistem akan tersedia di Phase berikutnya.</p>
      </div>
    </div>
  );
}
