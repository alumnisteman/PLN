"use client";

import { FileText, Plus } from "lucide-react";
import Link from "next/link";

export default function ContractsPage() {
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Kontrak</h1>
          <p className="text-sm text-slate-500 mt-0.5">Kelola semua kontrak proyek</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-xl hover:bg-blue-700 transition-colors">
          <Plus className="w-4 h-4" />
          Tambah Kontrak
        </button>
      </div>
      <div className="flex flex-col items-center justify-center py-20 text-center bg-white rounded-xl border border-slate-200">
        <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mb-4">
          <FileText className="w-8 h-8 text-slate-400" />
        </div>
        <h3 className="text-base font-semibold text-slate-900 mb-1">Belum ada kontrak</h3>
        <p className="text-sm text-slate-500 mb-4">Kontrak akan muncul setelah project dibuat.</p>
        <Link href="/projects" className="text-sm text-blue-600 hover:underline">Lihat Daftar Project →</Link>
      </div>
    </div>
  );
}
