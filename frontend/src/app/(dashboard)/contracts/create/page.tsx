"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { contractService } from "@/services/contract";
import { projectService } from "@/services/project";
import { cn } from "@/lib/utils";
import { ArrowLeft, Save, Loader2 } from "lucide-react";
import Link from "next/link";

const TYPE_OPTIONS = [
  { value: "main", label: "Kontrak Utama" },
  { value: "addendum", label: "Addendum" },
  { value: "subcontract", label: "Subkontrak" },
  { value: "supply", label: "Pasokan" },
];

const STATUS_OPTIONS = [
  { value: "draft", label: "Draft" },
  { value: "active", label: "Aktif" },
  { value: "completed", label: "Selesai" },
  { value: "terminated", label: "Dihentikan" },
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

export default function CreateContractPage() {
  const router = useRouter();
  const qc = useQueryClient();

  const { data: projectsData } = useQuery({
    queryKey: ["projects-for-select"],
    queryFn: () => projectService.list({ per_page: 100 }),
  });
  const projects = projectsData?.data ?? [];

  const [form, setForm] = useState({
    number: "", title: "", project_id: "", type: "main", status: "draft",
    value: "", client_name: "", signed_date: "", start_date: "", end_date: "",
    scope: "", notes: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const mutation = useMutation({
    mutationFn: (data: typeof form) =>
      contractService.create({
        ...data,
        project_id: parseInt(data.project_id),
        value: parseFloat(data.value) || 0,
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["contracts"] });
      router.push("/contracts");
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

  function set(field: string, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
    if (errors[field]) setErrors((e) => { const n = { ...e }; delete n[field]; return n; });
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const newErrors: Record<string, string> = {};
    if (!form.number) newErrors.number = "Nomor kontrak wajib diisi.";
    if (!form.title) newErrors.title = "Judul kontrak wajib diisi.";
    if (!form.project_id) newErrors.project_id = "Project wajib dipilih.";
    if (!form.value) newErrors.value = "Nilai kontrak wajib diisi.";
    if (!form.start_date) newErrors.start_date = "Tanggal mulai wajib diisi.";
    if (!form.end_date) newErrors.end_date = "Tanggal selesai wajib diisi.";
    if (form.start_date && form.end_date && form.end_date < form.start_date) {
      newErrors.end_date = "Tanggal selesai harus setelah tanggal mulai.";
    }
    if (Object.keys(newErrors).length > 0) { setErrors(newErrors); return; }
    mutation.mutate(form);
  }

  return (
    <div className="max-w-3xl">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/contracts" className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Kembali
        </Link>
        <h1 className="text-xl font-bold text-slate-900">Tambah Kontrak Baru</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Identitas */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <h2 className="text-sm font-semibold text-slate-900 mb-5 pb-3 border-b border-slate-100">
            Identitas Kontrak
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="Nomor Kontrak" required error={errors.number}>
              <input className={inputClass} placeholder="KTR-2026-001" value={form.number}
                onChange={(e) => set("number", e.target.value)} />
            </FormField>
            <FormField label="Project" required error={errors.project_id}>
              <select className={inputClass} value={form.project_id}
                onChange={(e) => set("project_id", e.target.value)}>
                <option value="">Pilih project...</option>
                {projects.map((p) => (
                  <option key={p.uuid} value={p.id ?? 0}>{p.code} — {p.name}</option>
                ))}
              </select>
            </FormField>
            <div className="sm:col-span-2">
              <FormField label="Judul Kontrak" required error={errors.title}>
                <input className={inputClass} placeholder="Kontrak Pelaksanaan Pekerjaan..." value={form.title}
                  onChange={(e) => set("title", e.target.value)} />
              </FormField>
            </div>
            <FormField label="Jenis Kontrak" required>
              <select className={inputClass} value={form.type} onChange={(e) => set("type", e.target.value)}>
                {TYPE_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </FormField>
            <FormField label="Status" required>
              <select className={inputClass} value={form.status} onChange={(e) => set("status", e.target.value)}>
                {STATUS_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </FormField>
          </div>
        </div>

        {/* Nilai & Tanggal */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <h2 className="text-sm font-semibold text-slate-900 mb-5 pb-3 border-b border-slate-100">
            Nilai & Jadwal
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="Nilai Kontrak (Rp)" required error={errors.value}>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-400">Rp</span>
                <input
                  className={cn(inputClass, "pl-9")}
                  type="number" min="0" placeholder="4800000000"
                  value={form.value}
                  onChange={(e) => set("value", e.target.value)}
                />
              </div>
            </FormField>
            <FormField label="Nama Klien">
              <input className={inputClass} placeholder="PT PLN (Persero)..." value={form.client_name}
                onChange={(e) => set("client_name", e.target.value)} />
            </FormField>
            <FormField label="Tanggal Tanda Tangan">
              <input className={inputClass} type="date" value={form.signed_date}
                onChange={(e) => set("signed_date", e.target.value)} />
            </FormField>
            <div />
            <FormField label="Tanggal Mulai" required error={errors.start_date}>
              <input className={inputClass} type="date" value={form.start_date}
                onChange={(e) => set("start_date", e.target.value)} />
            </FormField>
            <FormField label="Tanggal Selesai" required error={errors.end_date}>
              <input className={inputClass} type="date" value={form.end_date} min={form.start_date}
                onChange={(e) => set("end_date", e.target.value)} />
            </FormField>
          </div>
        </div>

        {/* Ruang Lingkup */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <h2 className="text-sm font-semibold text-slate-900 mb-5 pb-3 border-b border-slate-100">
            Ruang Lingkup & Catatan
          </h2>
          <div className="space-y-4">
            <FormField label="Ruang Lingkup Pekerjaan">
              <textarea className={textareaClass} rows={4} placeholder="Lingkup pekerjaan yang dicakup kontrak..."
                value={form.scope} onChange={(e) => set("scope", e.target.value)} />
            </FormField>
            <FormField label="Catatan">
              <textarea className={textareaClass} rows={3} placeholder="Catatan tambahan..."
                value={form.notes} onChange={(e) => set("notes", e.target.value)} />
            </FormField>
          </div>
        </div>

        {/* Error global */}
        {mutation.isError && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
            Terjadi kesalahan. Periksa kembali form Anda.
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <Link href="/contracts" className="px-5 py-2.5 border border-slate-200 text-slate-700 text-sm font-medium rounded-xl hover:bg-slate-50 transition-colors">
            Batal
          </Link>
          <button
            type="submit"
            disabled={mutation.isPending}
            className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-60"
          >
            {mutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {mutation.isPending ? "Menyimpan..." : "Simpan Kontrak"}
          </button>
        </div>
      </form>
    </div>
  );
}
