"use client";

import { Bell, CheckCheck } from "lucide-react";

export default function NotificationsPage() {
  return (
    <div className="max-w-2xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-slate-900">Notifikasi</h1>
        <button className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 font-medium">
          <CheckCheck className="w-4 h-4" />
          Tandai semua dibaca
        </button>
      </div>

      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mb-4">
          <Bell className="w-8 h-8 text-slate-400" />
        </div>
        <h3 className="text-base font-semibold text-slate-900 mb-1">Belum ada notifikasi</h3>
        <p className="text-sm text-slate-500">Notifikasi approval, reminder, dan update proyek akan muncul di sini.</p>
      </div>
    </div>
  );
}
