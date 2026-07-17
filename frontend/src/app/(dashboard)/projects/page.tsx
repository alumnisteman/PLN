"use client";

import { useQuery } from "@tanstack/react-query";
import { projectService, type Project } from "@/services/project";
import { formatCurrency, formatDateShort, formatPercent, cn } from "@/lib/utils";
import {
  FolderKanban, Plus, Search, Filter, AlertCircle, Clock,
  TrendingUp, MapPin, User,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";

const STATUS_OPTIONS = [
  { value: "", label: "Semua Status" },
  { value: "draft", label: "Draft" },
  { value: "planning", label: "Perencanaan" },
  { value: "running", label: "Berjalan" },
  { value: "hold", label: "Ditunda" },
  { value: "completed", label: "Selesai" },
  { value: "closed", label: "Ditutup" },
];

const STATUS_CONFIG: Record<string, { label: string; className: string; dot: string }> = {
  draft:     { label: "Draft",       className: "bg-slate-100 text-slate-600",   dot: "bg-slate-400" },
  planning:  { label: "Perencanaan", className: "bg-amber-100 text-amber-700",   dot: "bg-amber-500" },
  running:   { label: "Berjalan",    className: "bg-blue-100 text-blue-700",     dot: "bg-blue-500" },
  hold:      { label: "Ditunda",     className: "bg-orange-100 text-orange-700", dot: "bg-orange-500" },
  completed: { label: "Selesai",     className: "bg-emerald-100 text-emerald-700", dot: "bg-emerald-500" },
  closed:    { label: "Ditutup",     className: "bg-slate-200 text-slate-500",   dot: "bg-slate-400" },
};

function ProgressBar({ percent }: { percent: number }) {
  return (
    <div className="flex items-center gap-2 mt-2">
      <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
        <div
          className={cn("h-full rounded-full", percent >= 100 ? "bg-emerald-500" : percent >= 50 ? "bg-blue-500" : "bg-amber-500")}
          style={{ width: `${Math.min(percent, 100)}%` }}
        />
      </div>
      <span className="text-xs text-slate-500 w-9 text-right font-medium">{formatPercent(percent, 0)}</span>
    </div>
  );
}

function ProjectCard({ project }: { project: Project }) {
  const status = STATUS_CONFIG[project.status] ?? { label: project.status, className: "bg-slate-100 text-slate-600", dot: "bg-slate-400" };
  const isOverdue = new Date(project.end_date) < new Date() && project.status === "running";

  return (
    <Link href={`/projects/${project.uuid}`}>
      <div className="bg-white rounded-xl border border-slate-200 p-5 hover:border-blue-300 hover:shadow-md transition-all cursor-pointer h-full">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-mono text-xs text-slate-400">{project.code}</span>
              {isOverdue && <AlertCircle className="w-3.5 h-3.5 text-red-500" />}
            </div>
            <h3 className="text-sm font-semibold text-slate-900 leading-snug line-clamp-2">{project.name}</h3>
          </div>
          <span className={cn("inline-flex items-center gap-1.5 shrink-0 px-2.5 py-1 rounded-full text-xs font-medium", status.className)}>
            <span className={cn("w-1.5 h-1.5 rounded-full", status.dot)} />
            {status.label}
          </span>
        </div>

        <div className="space-y-2 mb-3">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <MapPin className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">{project.location}</span>
          </div>
          {project.project_manager && (
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <User className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">{project.project_manager.name}</span>
            </div>
          )}
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <Clock className="w-3.5 h-3.5 shrink-0" />
            <span>{formatDateShort(project.start_date)} — {formatDateShort(project.end_date)}</span>
          </div>
        </div>

        <div className="pt-3 border-t border-slate-100">
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="text-slate-500">Progress</span>
            <span className="font-semibold text-slate-700">{formatCurrency(project.contract_value)}</span>
          </div>
          <ProgressBar percent={project.progress_percent} />
        </div>
      </div>
    </Link>
  );
}

function ProjectCardSkeleton() {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 animate-pulse">
      <div className="flex justify-between mb-3">
        <div className="space-y-2">
          <div className="h-3 w-24 bg-slate-200 rounded" />
          <div className="h-4 w-48 bg-slate-200 rounded" />
        </div>
        <div className="h-6 w-20 bg-slate-200 rounded-full" />
      </div>
      <div className="space-y-2 mb-3">
        <div className="h-3 w-36 bg-slate-100 rounded" />
        <div className="h-3 w-32 bg-slate-100 rounded" />
      </div>
      <div className="pt-3 border-t border-slate-100">
        <div className="h-1.5 bg-slate-100 rounded-full mt-2" />
      </div>
    </div>
  );
}

export default function ProjectsPage() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ["projects", { search, status, page }],
    queryFn: () => projectService.list({ search, status, page, per_page: 12 }),
  });

  const projects = data?.data ?? [];
  const meta = data?.meta;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Manajemen Project</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            {meta ? `${meta.total} project ditemukan` : "Kelola semua proyek konstruksi"}
          </p>
        </div>
        <Link
          href="/projects/create"
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-xl hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Tambah Project</span>
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Cari nama project, kode, atau klien..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full h-10 pl-9 pr-4 rounded-xl border border-slate-200 bg-white text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400 shrink-0" />
          <select
            value={status}
            onChange={(e) => { setStatus(e.target.value); setPage(1); }}
            className="h-10 px-3 rounded-xl border border-slate-200 bg-white text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-600"
          >
            {STATUS_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => <ProjectCardSkeleton key={i} />)}
        </div>
      ) : projects.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mb-4">
            <FolderKanban className="w-8 h-8 text-slate-400" />
          </div>
          <h3 className="text-base font-semibold text-slate-900 mb-1">
            {search || status ? "Tidak ada hasil" : "Belum ada project"}
          </h3>
          <p className="text-sm text-slate-500 mb-6">
            {search || status
              ? "Coba ubah filter pencarian Anda."
              : "Mulai dengan membuat project pertama."}
          </p>
          {!search && !status && (
            <Link
              href="/projects/create"
              className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-xl hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Tambah Project Pertama
            </Link>
          )}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {projects.map((p) => <ProjectCard key={p.uuid} project={p} />)}
          </div>

          {/* Pagination */}
          {meta && meta.last_page > 1 && (
            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-4 py-2 rounded-xl border border-slate-200 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                ← Sebelumnya
              </button>
              <span className="text-sm text-slate-500">
                Halaman {meta.current_page} dari {meta.last_page}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(meta.last_page, p + 1))}
                disabled={page === meta.last_page}
                className="px-4 py-2 rounded-xl border border-slate-200 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Berikutnya →
              </button>
            </div>
          )}

          {/* Summary */}
          <div className="flex items-center gap-6 py-3 border-t border-slate-100">
            {Object.entries(STATUS_CONFIG).map(([key, cfg]) => {
              const count = projects.filter((p) => p.status === key).length;
              if (count === 0) return null;
              return (
                <div key={key} className="flex items-center gap-2 text-xs">
                  <span className={cn("w-2 h-2 rounded-full", cfg.dot)} />
                  <span className="text-slate-500">{cfg.label}: <strong className="text-slate-700">{count}</strong></span>
                </div>
              );
            })}
            <div className="ml-auto flex items-center gap-2 text-xs text-slate-500">
              <TrendingUp className="w-3.5 h-3.5" />
              Total nilai:{" "}
              <strong className="text-slate-700">
                {formatCurrency(projects.reduce((s, p) => s + p.contract_value, 0))}
              </strong>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
