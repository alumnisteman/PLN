"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { projectService } from "@/services/project";
import { cn } from "@/lib/utils";
import { ArrowLeft, Save, Loader2 } from "lucide-react";
import Link from "next/link";

const STATUS_OPTIONS = [
  { value: "draft", label: "Draft" },
  { value: "planning", label: "Perencanaan" },
  { value: "running", label: "Berjalan" },
  { value: "hold", label: "Ditunda" },
];

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

const inputClass = "w-full h-10 px-3 rounded-xl border border-slate-200 bg-white text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all";
const textareaClass = "w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all resize-none";

export default function CreateProjectPage() {
  const router = useRouter();
  const qc = useQueryClient();

  const [form, setForm] = useState({
    code: "", name: "", description: "", client_name: "", client_contact: "",
    location: "", province: "", city: "", type: "", status: "draft",
    contract_value: "", boq_value: "", start_date: "", end_date: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const mutation = useMutation({
    mutationFn: (data: typeof form) =>
      projectService.create({
        ...data,
        contract_value: parseFloat(data.contract_value) || 0,
        boq_value: parseFloat(data.boq_value) || 0,
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["projects"] });
      router.push("/projects");
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
    if (!form.code) newErrors.code = "Kode project wajib diisi.";
    if (!form.name) newErrors.name = "Nama project wajib diisi.";
    if (!form.client_name) newErrors.client_name = "Nama klien wajib diisi.";
    if (!form.location) newErrors.location = "Lokasi wajib diisi.";
    if (!form.contract_value) newErrors.contract_value = "Nilai kontrak wajib diisi.";
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
        <Link href="/projects" className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Kembali
        </Link>
        <h1 className="text-xl font-bold text-slate-900">Tambah Project Baru</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Identitas */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <h2 className="text-sm font-semibold text-slate-900 mb-5 pb-3 border-b border-slate-100">
            Identitas Project
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="Kode Project" required error={errors.code}>
              <input className={inputClass} placeholder="PRJ-2026-001" value={form.code}
                onChange={(e) => set("code", e.target.value)} />
            </FormField>
            <FormField label="Status" required>
              <select className={inputClass} value={form.status} onChange={(e) => set("status", e.target.value)}>
                {STATUS_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </FormField>
            <div className="sm:col-span-2">
              <FormField label="Nama Project" required error={errors.name}>
                <input className={inputClass} placeholder="Instalasi Jaringan Listrik 20kV..." value={form.name}
                  onChange={(e) => set("name", e.target.value)} />
              </FormField>
            </div>
            <div className="sm:col-span-2">
              <FormField label="Deskripsi">
                <textarea className={textareaClass} rows={3} placeholder="Deskripsi singkat project..." value={form.description}
                  onChange={(e) => set("description", e.target.value)} />
              </FormField>
            </div>
            <FormField label="Jenis Project">
              <input className={inputClass} placeholder="Instalasi Jaringan, Gardu Induk, dll." value={form.type}
                onChange={(e) => set("type", e.target.value)} />
            </FormField>
          </div>
        </div>

        {/* Klien & Lokasi */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <h2 className="text-sm font-semibold text-slate-900 mb-5 pb-3 border-b border-slate-100">
            Klien & Lokasi
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="Nama Klien" required error={errors.client_name}>
              <input className={inputClass} placeholder="PT PLN (Persero) ULP..." value={form.client_name}
                onChange={(e) => set("client_name", e.target.value)} />
            </FormField>
            <FormField label="Kontak Klien">
              <input className={inputClass} placeholder="Nama PIC / No. Telp" value={form.client_contact}
                onChange={(e) => set("client_contact", e.target.value)} />
            </FormField>
            <div className="sm:col-span-2">
              <FormField label="Lokasi" required error={errors.location}>
                <input className={inputClass} placeholder="Jl. ... / Kelurahan / Kecamatan" value={form.location}
                  onChange={(e) => set("location", e.target.value)} />
              </FormField>
            </div>
            <FormField label="Provinsi">
              <input className={inputClass} placeholder="Kalimantan Timur" value={form.province}
                onChange={(e) => set("province", e.target.value)} />
            </FormField>
            <FormField label="Kota / Kabupaten">
              <input className={inputClass} placeholder="Balikpapan" value={form.city}
                onChange={(e) => set("city", e.target.value)} />
            </FormField>
          </div>
        </div>

        {/* Nilai & Jadwal */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <h2 className="text-sm font-semibold text-slate-900 mb-5 pb-3 border-b border-slate-100">
            Nilai Kontrak & Jadwal
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="Nilai Kontrak (Rp)" required error={errors.contract_value}>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-400">Rp</span>
                <input
                  className={cn(inputClass, "pl-9")}
                  type="number" min="0" placeholder="4800000000"
                  value={form.contract_value}
                  onChange={(e) => set("contract_value", e.target.value)}
                />
              </div>
            </FormField>
            <FormField label="Nilai BOQ (Rp)">
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-400">Rp</span>
                <input
                  className={cn(inputClass, "pl-9")}
                  type="number" min="0" placeholder="4650000000"
                  value={form.boq_value}
                  onChange={(e) => set("boq_value", e.target.value)}
                />
              </div>
            </FormField>
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

        {/* Error global */}
        {mutation.isError && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
            Terjadi kesalahan. Periksa kembali form Anda.
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <Link href="/projects" className="px-5 py-2.5 border border-slate-200 text-slate-700 text-sm font-medium rounded-xl hover:bg-slate-50 transition-colors">
            Batal
          </Link>
          <button
            type="submit"
            disabled={mutation.isPending}
            className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-60"
          >
            {mutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {mutation.isPending ? "Menyimpan..." : "Simpan Project"}
          </button>
        </div>
      </form>
    </div>
  );
}
