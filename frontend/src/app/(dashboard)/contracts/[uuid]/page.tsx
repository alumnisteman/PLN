"use client";

import { useQuery } from "@tanstack/react-query";
import { contractService, type Contract } from "@/services/contract";
import { formatCurrency, formatDateShort, cn } from "@/lib/utils";
import { use } from "react";
import Link from "next/link";
import {
  ArrowLeft, FileText, Calendar, DollarSign, Clock,
  AlertCircle, Edit, User, Briefcase,
} from "lucide-react";

const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  draft:      { label: "Draft",      className: "bg-slate-100 text-slate-700" },
  active:     { label: "Aktif",       className: "bg-blue-100 text-blue-700" },
  completed:  { label: "Selesai",     className: "bg-emerald-100 text-emerald-700" },
  terminated: { label: "Dihentikan",  className: "bg-red-100 text-red-700" },
};

const TYPE_LABELS: Record<string, string> = {
  main: "Kontrak Utama",
  addendum: "Addendum",
  subcontract: "Subkontrak",
  supply: "Pasokan",
};

function InfoRow({ label, value, icon: Icon }: { label: string; value: string; icon?: React.ElementType }) {
  return (
    <div className="flex items-start gap-3 py-2.5">
      {Icon && <Icon className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />}
      <div className="flex-1">
        <dt className="text-xs text-slate-500">{label}</dt>
        <dd className="text-sm font-medium text-slate-900">{value || "-"}</dd>
      </div>
    </div>
  );
}

function Skeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-8 w-64 bg-slate-200 rounded" />
      <div className="h-40 bg-white rounded-xl border border-slate-200" />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-20 bg-white rounded-xl border border-slate-200" />)}
      </div>
    </div>
  );
}

export default function ContractDetailPage({ params }: { params: Promise<{ uuid: string }> }) {
  const { uuid } = use(params);

  const { data, isLoading, error } = useQuery({
    queryKey: ["contract", uuid],
    queryFn: () => contractService.get(uuid),
  });

  if (isLoading) return <Skeleton />;

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <AlertCircle className="w-12 h-12 text-red-400 mb-4" />
        <h3 className="text-base font-semibold text-slate-900 mb-1">Kontrak tidak ditemukan</h3>
        <Link href="/contracts" className="text-sm text-blue-600 hover:underline mt-2">← Kembali ke daftar</Link>
      </div>
    );
  }

  const contract = data?.data as Contract;
  const status = STATUS_CONFIG[contract.status] ?? { label: contract.status, className: "bg-slate-100 text-slate-700" };
  const isOverdue = contract.status === "active" && new Date(contract.end_date) < new Date();
  const daysLeft = Math.ceil((new Date(contract.end_date).getTime() - Date.now()) / 86400000);

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Back + Actions */}
      <div className="flex items-center justify-between">
        <Link href="/contracts" className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Kembali ke daftar
        </Link>
        <Link
          href={`/contracts/${uuid}/edit`}
          className="flex items-center gap-2 px-4 py-2 border border-slate-200 text-slate-700 text-sm font-medium rounded-xl hover:bg-slate-50 transition-colors"
        >
          <Edit className="w-4 h-4" />
          Edit
        </Link>
      </div>

      {/* Header */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center shrink-0">
            <FileText className="w-6 h-6 text-amber-600" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-3 mb-2">
              <span className="font-mono text-sm text-slate-400">{contract.number}</span>
              <span className={cn("px-2.5 py-0.5 rounded-full text-xs font-medium", status.className)}>
                {status.label}
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600">
                {TYPE_LABELS[contract.type] ?? contract.type}
              </span>
              {isOverdue && (
                <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700">
                  <AlertCircle className="w-3 h-3" />
                  Terlambat
                </span>
              )}
            </div>
            <h1 className="text-xl font-bold text-slate-900 mb-1">{contract.title}</h1>
            {contract.project && (
              <Link
                href={`/projects/${contract.project.uuid}`}
                className="text-sm text-blue-600 hover:underline"
              >
                {contract.project.code} — {contract.project.name}
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <p className="text-xs font-medium text-slate-500 mb-1">Nilai Kontrak</p>
          <div className="flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-slate-400" />
            <span className="text-sm font-bold text-slate-900">{formatCurrency(contract.value)}</span>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <p className="text-xs font-medium text-slate-500 mb-1">Tanggal Mulai</p>
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-slate-400" />
            <span className="text-sm font-semibold text-slate-900">{formatDateShort(contract.start_date)}</span>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <p className="text-xs font-medium text-slate-500 mb-1">Tanggal Selesai</p>
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-slate-400" />
            <span className="text-sm font-semibold text-slate-900">{formatDateShort(contract.end_date)}</span>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <p className="text-xs font-medium text-slate-500 mb-1">
            {isOverdue ? "Terlambat" : daysLeft > 0 ? "Sisa Waktu" : "Selesai"}
          </p>
          <div className="flex items-center gap-2">
            <Clock className={cn("w-4 h-4", isOverdue ? "text-red-500" : "text-slate-400")} />
            <span className={cn("text-sm font-semibold", isOverdue ? "text-red-600" : "text-slate-900")}>
              {isOverdue ? `${Math.abs(daysLeft)} hari` : daysLeft > 0 ? `${daysLeft} hari` : "Selesai"}
            </span>
          </div>
        </div>
      </div>

      {/* Detail */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <h2 className="text-sm font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <Briefcase className="w-4 h-4 text-slate-500" />
            Informasi Kontrak
          </h2>
          <dl className="divide-y divide-slate-50">
            <InfoRow label="Klien" value={contract.client_name ?? "-"} icon={User} />
            <InfoRow label="Tanggal Tanda Tangan" value={contract.signed_date ? formatDateShort(contract.signed_date) : "-"} icon={Calendar} />
            <InfoRow label="Jenis" value={TYPE_LABELS[contract.type] ?? contract.type} icon={FileText} />
            <InfoRow label="Status" value={status.label} icon={FileText} />
          </dl>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <h2 className="text-sm font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <FileText className="w-4 h-4 text-slate-500" />
            Ruang Lingkup & Catatan
          </h2>
          {contract.scope ? (
            <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">{contract.scope}</p>
          ) : (
            <p className="text-sm text-slate-400 italic">Tidak ada ruang lingkup yang ditentukan.</p>
          )}
          {contract.notes && (
            <div className="mt-4 pt-4 border-t border-slate-100">
              <p className="text-xs font-medium text-slate-500 mb-1">Catatan</p>
              <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">{contract.notes}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
