"use client";

import { useQuery } from "@tanstack/react-query";
import { dashboardService, type DashboardData } from "@/services/dashboard";
import { useAuthStore } from "@/store/auth";
import { formatCurrency, formatPercent, formatDateShort } from "@/lib/utils";
import {
  FolderKanban, FileText, TrendingUp, Play, CheckCircle, Clock,
  ArrowUpRight, AlertCircle,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  draft:     { label: "Draft",      className: "bg-slate-100 text-slate-600" },
  planning:  { label: "Perencanaan",className: "bg-amber-100 text-amber-700" },
  running:   { label: "Berjalan",   className: "bg-blue-100 text-blue-700" },
  hold:      { label: "Ditunda",    className: "bg-orange-100 text-orange-700" },
  completed: { label: "Selesai",    className: "bg-emerald-100 text-emerald-700" },
  closed:    { label: "Ditutup",    className: "bg-slate-200 text-slate-500" },
};

function StatCard({ title, value, subtitle, icon: Icon, color }: {
  title: string; value: string | number; subtitle?: string;
  icon: React.ElementType; color: string;
}) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <p className="text-3xl font-bold text-slate-900 mt-1">{value}</p>
          {subtitle && <p className="text-sm text-slate-500 mt-1">{subtitle}</p>}
        </div>
        <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", color)}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </div>
  );
}

function ProjectProgressBar({ percent }: { percent: number }) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
        <div
          className={cn("h-full rounded-full transition-all", percent >= 100 ? "bg-emerald-500" : percent >= 50 ? "bg-blue-500" : "bg-amber-500")}
          style={{ width: `${Math.min(percent, 100)}%` }}
        />
      </div>
      <span className="text-xs font-medium text-slate-600 w-10 text-right">{formatPercent(percent, 0)}</span>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-white rounded-xl border border-slate-200 p-5 h-28" />
        ))}
      </div>
      <div className="bg-white rounded-xl border border-slate-200 p-5 h-64" />
    </div>
  );
}

export default function DashboardPage() {
  const user = useAuthStore((s) => s.user);
  const { data, isLoading, error } = useQuery({
    queryKey: ["dashboard"],
    queryFn: () => dashboardService.get(),
  });

  if (isLoading) return <DashboardSkeleton />;

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <AlertCircle className="w-12 h-12 text-red-400 mb-4" />
        <h3 className="text-base font-semibold text-slate-900 mb-1">Gagal memuat data</h3>
        <p className="text-sm text-slate-500">Periksa koneksi ke server backend.</p>
      </div>
    );
  }

  const d = data?.data as DashboardData;
  const stats = d?.stats;
  const projects = d?.recent_projects ?? [];

  return (
    <div className="space-y-6">
      {/* Greeting */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">
          Selamat datang, {user?.name?.split(" ")[0]} 👋
        </h1>
        <p className="text-slate-500 mt-1">Berikut ringkasan proyek dan aktivitas hari ini.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Project"
          value={stats?.projects.total ?? 0}
          subtitle="Semua status"
          icon={FolderKanban}
          color="bg-blue-50 text-blue-600"
        />
        <StatCard
          title="Project Berjalan"
          value={stats?.projects.running ?? 0}
          subtitle="Sedang dikerjakan"
          icon={Play}
          color="bg-emerald-50 text-emerald-600"
        />
        <StatCard
          title="Project Selesai"
          value={stats?.projects.completed ?? 0}
          subtitle="Tahun ini"
          icon={CheckCircle}
          color="bg-purple-50 text-purple-600"
        />
        <StatCard
          title="Kontrak Aktif"
          value={stats?.contracts.active ?? 0}
          subtitle={`dari ${stats?.contracts.total ?? 0} total`}
          icon={FileText}
          color="bg-amber-50 text-amber-600"
        />
      </div>

      {/* Recent Projects */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-slate-500" />
            <h2 className="text-sm font-semibold text-slate-900">Project Terbaru</h2>
          </div>
          <Link
            href="/projects"
            className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
          >
            Lihat semua <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {projects.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <FolderKanban className="w-10 h-10 text-slate-300 mb-3" />
            <p className="text-sm font-medium text-slate-600">Belum ada project</p>
            <p className="text-xs text-slate-400 mt-1">Buat project pertama Anda</p>
            <Link
              href="/projects/create"
              className="mt-4 px-4 py-2 bg-blue-600 text-white text-sm rounded-xl hover:bg-blue-700 transition-colors"
            >
              + Tambah Project
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {projects.map((p) => {
              const statusCfg = STATUS_CONFIG[p.status] ?? { label: p.status, className: "bg-slate-100 text-slate-600" };
              const isOverdue = new Date(p.end_date) < new Date() && p.status === "running";

              return (
                <Link
                  key={p.uuid}
                  href={`/projects/${p.uuid}`}
                  className="flex items-center gap-4 px-5 py-4 hover:bg-slate-50 transition-colors"
                >
                  <div className="w-9 h-9 bg-blue-50 rounded-xl flex items-center justify-center shrink-0">
                    <FolderKanban className="w-4 h-4 text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium text-slate-900 truncate">{p.name}</span>
                      <span className={cn("inline-flex shrink-0 px-2 py-0.5 rounded-full text-xs font-medium", statusCfg.className)}>
                        {statusCfg.label}
                      </span>
                      {isOverdue && <AlertCircle className="w-3.5 h-3.5 text-red-500 shrink-0" />}
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-slate-400 font-mono">{p.code}</span>
                      <span className="text-xs text-slate-400">•</span>
                      <span className="text-xs text-slate-500">{formatCurrency(p.contract_value)}</span>
                    </div>
                    <div className="mt-2">
                      <ProjectProgressBar percent={p.progress_percent} />
                    </div>
                  </div>
                  <div className="text-right shrink-0 hidden sm:block">
                    <div className="flex items-center gap-1 text-xs text-slate-400">
                      <Clock className="w-3 h-3" />
                      {formatDateShort(p.end_date)}
                    </div>
                    {p.project_manager && (
                      <div className="text-xs text-slate-400 mt-1">{p.project_manager}</div>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
