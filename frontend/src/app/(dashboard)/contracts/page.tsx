"use client";

import { useQuery } from "@tanstack/react-query";
import { contractService, type Contract } from "@/services/contract";
import { formatCurrency, formatDateShort, cn } from "@/lib/utils";
import {
  FileText, Plus, Search, Filter, AlertCircle, Clock,
  TrendingUp, ArrowUpRight,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";

const STATUS_OPTIONS = [
  { value: "", label: "Semua Status" },
  { value: "draft", label: "Draft" },
  { value: "active", label: "Aktif" },
  { value: "completed", label: "Selesai" },
  { value: "terminated", label: "Dihentikan" },
];

const TYPE_OPTIONS: Record<string, string> = {
  main: "Kontrak Utama",
  addendum: "Addendum",
  subcontract: "Subkontrak",
  supply: "Pasokan",
};

const STATUS_CONFIG: Record<string, { label: string; className: string; dot: string }> = {
  draft:      { label: "Draft",      className: "bg-slate-100 text-slate-600",   dot: "bg-slate-400" },
  active:     { label: "Aktif",       className: "bg-blue-100 text-blue-700",     dot: "bg-blue-500" },
  completed:  { label: "Selesai",     className: "bg-emerald-100 text-emerald-700", dot: "bg-emerald-500" },
  terminated: { label: "Dihentikan",  className: "bg-red-100 text-red-700",       dot: "bg-red-500" },
};

function ContractRow({ contract }: { contract: Contract }) {
  const status = STATUS_CONFIG[contract.status] ?? { label: contract.status, className: "bg-slate-100 text-slate-600", dot: "bg-slate-400" };
  const isActive = contract.status === "active";
  const isOverdue = isActive && new Date(contract.end_date) < new Date();

  return (
    <Link
      href={`/contracts/${contract.uuid}`}
      className="flex items-center gap-4 px-5 py-4 hover:bg-slate-50 transition-colors border-b border-slate-100 last:border-0"
    >
      <div className="w-9 h-9 bg-amber-50 rounded-xl flex items-center justify-center shrink-0">
        <FileText className="w-4 h-4 text-amber-600" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-sm font-medium text-slate-900 truncate">{contract.title}</span>
          <span className={cn("inline-flex shrink-0 px-2 py-0.5 rounded-full text-xs font-medium", status.className)}>
            {status.label}
          </span>
          {isOverdue && <AlertCircle className="w-3.5 h-3.5 text-red-500 shrink-0" />}
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-400 font-mono">{contract.number}</span>
          <span className="text-xs text-slate-400">•</span>
          <span className="text-xs text-slate-500">{TYPE_OPTIONS[contract.type] ?? contract.type}</span>
          {contract.project && (
            <>
              <span className="text-xs text-slate-400">•</span>
              <span className="text-xs text-slate-500 truncate">{contract.project.code}</span>
            </>
          )}
        </div>
      </div>
      <div className="text-right shrink-0 hidden sm:block">
        <div className="text-sm font-semibold text-slate-700">{formatCurrency(contract.value)}</div>
        <div className="flex items-center gap-1 justify-end text-xs text-slate-400 mt-1">
          <Clock className="w-3 h-3" />
          {formatDateShort(contract.start_date)} — {formatDateShort(contract.end_date)}
        </div>
      </div>
      <ArrowUpRight className="w-4 h-4 text-slate-300 shrink-0" />
    </Link>
  );
}

function RowSkeleton() {
  return (
    <div className="flex items-center gap-4 px-5 py-4 border-b border-slate-100 last:border-0">
      <div className="w-9 h-9 bg-slate-200 rounded-xl shrink-0 animate-pulse" />
      <div className="flex-1 space-y-2">
        <div className="h-4 w-48 bg-slate-200 rounded animate-pulse" />
        <div className="h-3 w-32 bg-slate-100 rounded animate-pulse" />
      </div>
      <div className="h-8 w-24 bg-slate-100 rounded animate-pulse" />
    </div>
  );
}

export default function ContractsPage() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ["contracts", { search, status, page }],
    queryFn: () => contractService.list({ search, status, page, per_page: 15 }),
  });

  const contracts = data?.data ?? [];
  const meta = data?.meta;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Manajemen Kontrak</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            {meta ? `${meta.total} kontrak ditemukan` : "Kelola semua kontrak proyek"}
          </p>
        </div>
        <Link
          href="/contracts/create"
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-xl hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Tambah Kontrak</span>
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Cari nomor atau judul kontrak..."
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

      {/* List */}
      {isLoading ? (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          {Array.from({ length: 5 }).map((_, i) => <RowSkeleton key={i} />)}
        </div>
      ) : contracts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center bg-white rounded-xl border border-slate-200">
          <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mb-4">
            <FileText className="w-8 h-8 text-slate-400" />
          </div>
          <h3 className="text-base font-semibold text-slate-900 mb-1">
            {search || status ? "Tidak ada hasil" : "Belum ada kontrak"}
          </h3>
          <p className="text-sm text-slate-500 mb-6">
            {search || status ? "Coba ubah filter pencarian Anda." : "Buat kontrak pertama untuk proyek Anda."}
          </p>
          {!search && !status && (
            <Link
              href="/contracts/create"
              className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-xl hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Tambah Kontrak Pertama
            </Link>
          )}
        </div>
      ) : (
        <>
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            {contracts.map((c) => <ContractRow key={c.uuid} contract={c} />)}
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
              const count = contracts.filter((c) => c.status === key).length;
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
                {formatCurrency(contracts.reduce((s, c) => s + c.value, 0))}
              </strong>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
