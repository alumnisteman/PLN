"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { masterService, type MasterType, type MasterItem } from "@/services/master";
import { cn } from "@/lib/utils";
import {
  Briefcase, Building2, Boxes, Ruler, Plus, Search, Edit,
  Trash2, X, Loader2, AlertCircle, CheckCircle, XCircle,
} from "lucide-react";

const TABS: { id: MasterType; label: string; icon: React.ElementType; color: string }[] = [
  { id: "positions",          label: "Jabatan",          icon: Briefcase,  color: "text-blue-600 bg-blue-50" },
  { id: "departments",        label: "Departemen",       icon: Building2,  color: "text-emerald-600 bg-emerald-50" },
  { id: "material-categories", label: "Kategori Material", icon: Boxes,    color: "text-amber-600 bg-amber-50" },
  { id: "units",               label: "Satuan",           icon: Ruler,     color: "text-purple-600 bg-purple-50" },
];

const inputClass = "w-full h-10 px-3 rounded-xl border border-slate-200 bg-white text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all";
const textareaClass = "w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all resize-none";

function FormField({ label, required, children, error }: {
  label: string; required?: boolean; children: React.ReactNode; error?: string;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-1.5">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {children}
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}

function getFields(type: MasterType): { key: string; label: string; required?: boolean; type?: string }[] {
  switch (type) {
    case "positions":
      return [
        { key: "code", label: "Kode", required: true },
        { key: "name", label: "Nama Jabatan", required: true },
        { key: "department", label: "Departemen" },
        { key: "description", label: "Deskripsi" },
      ];
    case "departments":
      return [
        { key: "code", label: "Kode", required: true },
        { key: "name", label: "Nama Departemen", required: true },
        { key: "head_name", label: "Kepala Departemen" },
        { key: "description", label: "Deskripsi" },
      ];
    case "material-categories":
      return [
        { key: "code", label: "Kode", required: true },
        { key: "name", label: "Nama Kategori", required: true },
        { key: "parent_code", label: "Kode Parent" },
        { key: "description", label: "Deskripsi" },
      ];
    case "units":
      return [
        { key: "code", label: "Kode", required: true },
        { key: "name", label: "Nama Satuan", required: true },
        { key: "symbol", label: "Simbol", required: true },
        { key: "description", label: "Deskripsi" },
      ];
  }
}

function getExtraColumns(type: MasterType): { key: string; label: string }[] {
  switch (type) {
    case "positions":          return [{ key: "department", label: "Departemen" }];
    case "departments":        return [{ key: "head_name", label: "Kepala" }];
    case "material-categories": return [{ key: "parent_code", label: "Parent" }];
    case "units":               return [{ key: "symbol", label: "Simbol" }];
  }
}

export default function MasterDataPage() {
  const [activeTab, setActiveTab] = useState<MasterType>("positions");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<MasterItem | null>(null);
  const [form, setForm] = useState<Record<string, string>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [deleteTarget, setDeleteTarget] = useState<MasterItem | null>(null);
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["master", activeTab, { search, page }],
    queryFn: () => masterService.list(activeTab, { search, page, per_page: 10 }),
  });

  const items = data?.data ?? [];
  const meta = data?.meta;
  const extraCols = getExtraColumns(activeTab);
  const fields = getFields(activeTab);

  const saveMutation = useMutation({
    mutationFn: (data: Record<string, string>) => {
      const payload = { ...data, is_active: true };
      if (editing) return masterService.update(activeTab, editing.uuid, payload);
      return masterService.create(activeTab, payload);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["master", activeTab] });
      setModalOpen(false);
      setEditing(null);
      setForm({});
      setErrors({});
    },
    onError: (err: unknown) => {
      const e = err as { errors?: Record<string, string[]> };
      if (e?.errors) {
        const errs: Record<string, string> = {};
        Object.entries(e.errors).forEach(([k, v]) => { errs[k] = v[0]; });
        setErrors(errs);
      }
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (uuid: string) => masterService.delete(activeTab, uuid),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["master", activeTab] });
      setDeleteTarget(null);
    },
  });

  function openCreate() {
    setEditing(null);
    setForm({});
    setErrors({});
    setModalOpen(true);
  }

  function openEdit(item: MasterItem) {
    setEditing(item);
    const f: Record<string, string> = {};
    fields.forEach((field) => { f[field.key] = String(item[field.key] ?? ""); });
    setForm(f);
    setErrors({});
    setModalOpen(true);
  }

  function set(field: string, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
    if (errors[field]) setErrors((e) => { const n = { ...e }; delete n[field]; return n; });
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const newErrors: Record<string, string> = {};
    fields.forEach((f) => {
      if (f.required && !form[f.key]) newErrors[f.key] = `${f.label} wajib diisi.`;
    });
    if (Object.keys(newErrors).length > 0) { setErrors(newErrors); return; }
    saveMutation.mutate(form);
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Data Master</h1>
          <p className="text-sm text-slate-500 mt-0.5">Kelola jabatan, departemen, kategori material, dan satuan</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2">
        {TABS.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => { setActiveTab(tab.id); setSearch(""); setPage(1); }}
              className={cn(
                "flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all",
                isActive
                  ? "bg-white border border-slate-200 text-slate-900 shadow-sm"
                  : "bg-transparent text-slate-500 hover:bg-slate-100"
              )}
            >
              <tab.icon className={cn("w-4 h-4", isActive ? tab.color : "")} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Filter + Add */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Cari kode atau nama..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full h-10 pl-9 pr-4 rounded-xl border border-slate-200 bg-white text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600"
          />
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-xl hover:bg-blue-700 transition-colors shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Tambah Data</span>
        </button>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 px-5 py-4 border-b border-slate-100 last:border-0">
              <div className="w-8 h-8 bg-slate-200 rounded-lg animate-pulse" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-40 bg-slate-200 rounded animate-pulse" />
                <div className="h-3 w-24 bg-slate-100 rounded animate-pulse" />
              </div>
              <div className="h-8 w-20 bg-slate-100 rounded animate-pulse" />
            </div>
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center bg-white rounded-xl border border-slate-200">
          <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mb-4">
            {(() => {
              const Icon = TABS.find((t) => t.id === activeTab)?.icon ?? Briefcase;
              return <Icon className="w-8 h-8 text-slate-400" />;
            })()}
          </div>
          <h3 className="text-base font-semibold text-slate-900 mb-1">
            {search ? "Tidak ada hasil" : "Belum ada data"}
          </h3>
          <p className="text-sm text-slate-500 mb-6">
            {search ? "Coba ubah pencarian Anda." : "Tambah data master pertama."}
          </p>
          {!search && (
            <button
              onClick={openCreate}
              className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-xl hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Tambah Data
            </button>
          )}
        </div>
      ) : (
        <>
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100">
                    <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Kode</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Nama</th>
                    {extraCols.map((col) => (
                      <th key={col.key} className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">{col.label}</th>
                    ))}
                    <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                    <th className="text-right px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {items.map((item) => (
                    <tr key={item.uuid} className="hover:bg-slate-50 transition-colors">
                      <td className="px-5 py-3.5">
                        <span className="font-mono text-xs text-slate-500">{item.code}</span>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="text-sm font-medium text-slate-900">{item.name}</span>
                      </td>
                      {extraCols.map((col) => (
                        <td key={col.key} className="px-5 py-3.5">
                          <span className="text-sm text-slate-600">{String(item[col.key] ?? "-")}</span>
                        </td>
                      ))}
                      <td className="px-5 py-3.5">
                        {item.is_active ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-600">
                            <CheckCircle className="w-3 h-3" />
                            Aktif
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-500">
                            <XCircle className="w-3 h-3" />
                            Nonaktif
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => openEdit(item)}
                            className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Edit"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDeleteTarget(item)}
                            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Hapus"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
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
        </>
      )}

      {/* Create/Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40" onClick={() => setModalOpen(false)}>
          <div
            className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <h2 className="text-base font-semibold text-slate-900">
                {editing ? "Edit Data" : "Tambah Data Baru"}
              </h2>
              <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-slate-600 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {fields.map((field) => (
                <FormField key={field.key} label={field.label} required={field.required} error={errors[field.key]}>
                  {field.key === "description" ? (
                    <textarea
                      className={textareaClass}
                      rows={3}
                      value={form[field.key] ?? ""}
                      onChange={(e) => set(field.key, e.target.value)}
                    />
                  ) : (
                    <input
                      className={inputClass}
                      value={form[field.key] ?? ""}
                      onChange={(e) => set(field.key, e.target.value)}
                      placeholder={field.label}
                    />
                  )}
                </FormField>
              ))}

              {saveMutation.isError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  Terjadi kesalahan. Periksa kembali form Anda.
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-5 py-2.5 border border-slate-200 text-slate-700 text-sm font-medium rounded-xl hover:bg-slate-50 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={saveMutation.isPending}
                  className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-60"
                >
                  {saveMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                  {saveMutation.isPending ? "Menyimpan..." : editing ? "Simpan Perubahan" : "Simpan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40" onClick={() => setDeleteTarget(null)}>
          <div
            className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 bg-red-50 rounded-2xl flex items-center justify-center mb-4">
                <Trash2 className="w-6 h-6 text-red-500" />
              </div>
              <h3 className="text-base font-semibold text-slate-900 mb-1">Hapus Data?</h3>
              <p className="text-sm text-slate-500 mb-6">
                Apakah Anda yakin ingin menghapus <strong className="text-slate-700">{deleteTarget.name}</strong> ({deleteTarget.code})?
                Tindakan ini tidak dapat dibatalkan.
              </p>
              <div className="flex items-center gap-3 w-full">
                <button
                  onClick={() => setDeleteTarget(null)}
                  className="flex-1 px-5 py-2.5 border border-slate-200 text-slate-700 text-sm font-medium rounded-xl hover:bg-slate-50 transition-colors"
                >
                  Batal
                </button>
                <button
                  onClick={() => deleteMutation.mutate(deleteTarget.uuid)}
                  disabled={deleteMutation.isPending}
                  className="flex-1 flex items-center justify-center gap-2 px-5 py-2.5 bg-red-600 text-white text-sm font-semibold rounded-xl hover:bg-red-700 transition-colors disabled:opacity-60"
                >
                  {deleteMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                  Hapus
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
