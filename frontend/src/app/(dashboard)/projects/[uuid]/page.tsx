"use client";

import { useQuery } from "@tanstack/react-query";
import { projectService, type Project } from "@/services/project";
import { formatCurrency, formatDateShort, formatPercent, cn } from "@/lib/utils";
import { use } from "react";
import Link from "next/link";
import {
  ArrowLeft, MapPin, Calendar, User, DollarSign,
  TrendingUp, FileText, Edit, Clock, CheckCircle,
  AlertCircle, FolderKanban,
} from "lucide-react";

const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  draft:     { label: "Draft",       className: "bg-slate-100 text-slate-700" },
  planning:  { label: "Perencanaan", className: "bg-amber-100 text-amber-700" },
  running:   { label: "Berjalan",    className: "bg-blue-100 text-blue-700" },
  hold:      { label: "Ditunda",     className: "bg-orange-100 text-orange-700" },
  completed: { label: "Selesai",     className: "bg-emerald-100 text-emerald-700" },
  closed:    { label: "Ditutup",     className: "bg-slate-200 text-slate-600" },
};

function InfoCard({ label, value, icon: Icon }: { label: string; value: string | number; icon?: React.ElementType }) {
  return (
    <div className="bg-slate-50 rounded-xl p-4">
      <p className="text-xs font-medium text-slate-500 mb-1">{label}</p>
      <div className="flex items-center gap-2">
        {Icon && <Icon className="w-4 h-4 text-slate-400" />}
        <span className="text-sm font-semibold text-slate-900">{value}</span>
      </div>
    </div>
  );
}

function ProgressBar({ percent }: { percent: number }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-slate-700">Progress Fisik</span>
        <span className="text-sm font-bold text-blue-600">{formatPercent(percent)}</span>
      </div>
      <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
        <div
          className={cn("h-full rounded-full transition-all", percent >= 100 ? "bg-emerald-500" : "bg-blue-500")}
          style={{ width: `${Math.min(percent, 100)}%` }}
        />
      </div>
    </div>
  );
}

function Skeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-8 w-64 bg-slate-200 rounded" />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-20 bg-white rounded-xl border border-slate-200" />)}
      </div>
    </div>
  );
}

export default function ProjectDetailPage({ params }: { params: Promise<{ uuid: string }> }) {
  const { uuid } = use(params);

  const { data, isLoading, error } = useQuery({
    queryKey: ["project", uuid],
    queryFn: () => projectService.get(uuid),
  });

  if (isLoading) return <Skeleton />;

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <AlertCircle className="w-12 h-12 text-red-400 mb-4" />
        <h3 className="text-base font-semibold text-slate-900 mb-1">Project tidak ditemukan</h3>
        <Link href="/projects" className="text-sm text-blue-600 hover:underline mt-2">← Kembali ke daftar</Link>
      </div>
    );
  }

  const project = data?.data as Project;
  const status = STATUS_CONFIG[project.status] ?? { label: project.status, className: "bg-slate-100 text-slate-700" };
  const isOverdue = new Date(project.end_date) < new Date() && project.status === "running";
  const daysLeft = Math.ceil((new Date(project.end_date).getTime() - Date.now()) / 86400000);

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Back + Actions */}
      <div className="flex items-center justify-between">
        <Link href="/projects" className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Kembali ke daftar
        </Link>
        <div className="flex items-center gap-2">
          <Link
            href={`/projects/${uuid}/edit`}
            className="flex items-center gap-2 px-4 py-2 border border-slate-200 text-slate-700 text-sm font-medium rounded-xl hover:bg-slate-50 transition-colors"
          >
            <Edit className="w-4 h-4" />
            Edit
          </Link>
        </div>
      </div>

      {/* Header */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center shrink-0">
            <FolderKanban className="w-6 h-6 text-blue-600" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-3 mb-2">
              <span className="font-mono text-sm text-slate-400">{project.code}</span>
              <span className={cn("px-2.5 py-0.5 rounded-full text-xs font-medium", status.className)}>
                {status.label}
              </span>
              {project.type && (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600">
                  {project.type}
                </span>
              )}
              {isOverdue && (
                <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700">
                  <AlertCircle className="w-3 h-3" />
                  Terlambat
                </span>
              )}
            </div>
            <h1 className="text-xl font-bold text-slate-900 mb-1">{project.name}</h1>
            {project.description && (
              <p className="text-sm text-slate-500 leading-relaxed">{project.description}</p>
            )}
          </div>
        </div>

        <div className="mt-5">
          <ProgressBar percent={project.progress_percent} />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <InfoCard label="Nilai Kontrak" value={formatCurrency(project.contract_value)} icon={DollarSign} />
        <InfoCard label="Nilai BOQ" value={formatCurrency(project.boq_value)} icon={FileText} />
        <InfoCard label="Durasi" value={`${project.duration_days} hari`} icon={Clock} />
        <InfoCard
          label={isOverdue ? "Terlambat" : daysLeft > 0 ? "Sisa Waktu" : "Selesai"}
          value={isOverdue ? `${Math.abs(daysLeft)} hari` : daysLeft > 0 ? `${daysLeft} hari` : "Selesai"}
          icon={isOverdue ? AlertCircle : CheckCircle}
        />
      </div>

      {/* Detail Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Project Info */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <h2 className="text-sm font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <FolderKanban className="w-4 h-4 text-slate-500" />
            Informasi Project
          </h2>
          <dl className="space-y-3">
            {[
              { label: "Klien", value: project.client_name, icon: User },
              { label: "Lokasi", value: `${project.city ? project.city + ", " : ""}${project.location}`, icon: MapPin },
              { label: "Mulai", value: formatDateShort(project.start_date), icon: Calendar },
              { label: "Selesai", value: formatDateShort(project.end_date), icon: Calendar },
            ].map((item) => (
              <div key={item.label} className="flex items-start gap-3">
                <item.icon className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
                <div>
                  <dt className="text-xs text-slate-500">{item.label}</dt>
                  <dd className="text-sm font-medium text-slate-900">{item.value}</dd>
                </div>
              </div>
            ))}
          </dl>
        </div>

        {/* Team */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <h2 className="text-sm font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <User className="w-4 h-4 text-slate-500" />
            Tim Project
          </h2>
          <div className="space-y-3">
            {project.project_manager ? (
              <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 text-sm font-semibold shrink-0">
                  {project.project_manager.name.charAt(0)}
                </div>
                <div>
                  <p className="text-xs text-slate-500">Project Manager</p>
                  <p className="text-sm font-medium text-slate-900">{project.project_manager.name}</p>
                </div>
              </div>
            ) : (
              <div className="p-3 bg-slate-50 rounded-xl text-sm text-slate-400 text-center">
                Belum ada Project Manager
              </div>
            )}
            {project.site_engineer ? (
              <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-700 text-sm font-semibold shrink-0">
                  {project.site_engineer.name.charAt(0)}
                </div>
                <div>
                  <p className="text-xs text-slate-500">Site Engineer</p>
                  <p className="text-sm font-medium text-slate-900">{project.site_engineer.name}</p>
                </div>
              </div>
            ) : (
              <div className="p-3 bg-slate-50 rounded-xl text-sm text-slate-400 text-center">
                Belum ada Site Engineer
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Progress", href: `/projects/${uuid}/progress`, icon: TrendingUp, color: "text-blue-600 bg-blue-50" },
          { label: "Kontrak",  href: `/projects/${uuid}/contracts`, icon: FileText,    color: "text-purple-600 bg-purple-50" },
          { label: "Material", href: `/projects/${uuid}/materials`, icon: DollarSign,  color: "text-amber-600 bg-amber-50" },
          { label: "Dokumen",  href: `/projects/${uuid}/documents`, icon: FileText,    color: "text-emerald-600 bg-emerald-50" },
        ].map((item) => (
          <Link
            key={item.label}
            href={item.href}
            className="flex flex-col items-center gap-2 p-4 bg-white rounded-xl border border-slate-200 hover:border-blue-300 hover:shadow-sm transition-all text-center"
          >
            <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", item.color)}>
              <item.icon className="w-5 h-5" />
            </div>
            <span className="text-xs font-medium text-slate-700">{item.label}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
