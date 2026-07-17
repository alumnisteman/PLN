import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../lib/auth';
import { formatCurrency, formatDate, capitalizeWords } from '../lib/utils';
import { StatusBadge } from '../components/StatusBadge';
import { EmptyState } from '../components/EmptyState';
import { Modal } from '../components/Modal';
import type { VendorProfile, VendorDocument, DptList, Tender } from '../lib/types';
import {
  Building2, MapPin, Phone, Mail, Globe, FileText, Plus, Trash2,
  Upload, CheckCircle2, AlertCircle, Shield, Award, Calendar, ChevronRight, User,
} from 'lucide-react';

export function ProfilePage() {
  const { vendor, refreshVendor } = useAuth();
  const [docs, setDocs] = useState<VendorDocument[]>([]);
  const [dpt, setDpt] = useState<(DptList & { tenders: Tender })[]>([]);
  const [loading, setLoading] = useState(true);
  const [showEdit, setShowEdit] = useState(false);
  const [showAddDoc, setShowAddDoc] = useState(false);

  async function loadData() {
    if (!vendor) return;
    const [d, dp] = await Promise.all([
      supabase.from('vendor_documents').select('*').eq('vendor_id', vendor.id).order('created_at', { ascending: false }),
      supabase.from('dpt_lists').select('*, tenders(*)').eq('vendor_id', vendor.id).order('created_at', { ascending: false }),
    ]);
    setDocs((d.data ?? []) as VendorDocument[]);
    setDpt((dp.data ?? []) as (DptList & { tenders: Tender })[]);
    setLoading(false);
  }

  useEffect(() => { loadData(); }, [vendor]);

  if (loading || !vendor) return <div className="flex items-center justify-center py-20"><div className="w-8 h-8 border-3 border-pln-200 border-t-pln-600 rounded-full animate-spin" /></div>;

  const docTypes = ['SIUJK', 'ISO 9001', 'ISO 14001', 'SPPJK', 'Akta Perusahaan', 'NPWP', 'NIB', 'Lainnya'];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Profile header */}
      <div className="card overflow-hidden">
        <div className="bg-gradient-to-r from-pln-700 to-pln-900 p-6 text-white">
          <div className="flex items-start gap-4">
            <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-sm text-2xl font-bold">
              {vendor.nama_perusahaan.charAt(0)}
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold">{vendor.nama_perusahaan}</h2>
              <p className="text-pln-200 text-sm mt-0.5">{vendor.jenis_badan_usaha} · NPWP: {vendor.npwp ?? '-'}</p>
              <div className="flex items-center gap-2 mt-3">
                <StatusBadge status={vendor.status_dpt} />
                <span className="text-xs text-pln-200">Bergabung sejak {formatDate(vendor.tanggal_bergabung)}</span>
              </div>
            </div>
            <button onClick={() => setShowEdit(true)} className="btn-secondary bg-white/10 border-white/20 text-white hover:bg-white/20">
              Edit Profil
            </button>
          </div>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <InfoRow icon={MapPin} label="Alamat" value={vendor.alamat ?? '-'} />
            <InfoRow icon={MapPin} label="Kota/Provinsi" value={[vendor.kota, vendor.provinsi].filter(Boolean).join(', ') || '-'} />
            <InfoRow icon={Phone} label="Telepon" value={vendor.telepon ?? '-'} />
            <InfoRow icon={Mail} label="Email PIC" value={vendor.email_pic ?? '-'} />
            <InfoRow icon={User} label="PIC" value={[vendor.nama_pic, vendor.jabatan_pic].filter(Boolean).join(' — ') || '-'} />
            <InfoRow icon={Globe} label="Website" value={vendor.website ?? '-'} />
            <InfoRow icon={Award} label="Nilai Aset" value={formatCurrency(vendor.nilai_aset)} />
            <InfoRow icon={Building2} label="Jumlah Karyawan" value={vendor.jumlah_karyawan?.toString() ?? '-'} />
          </div>
          {(vendor.bank_nama || vendor.bank_nomor_rekening) && (
            <div className="mt-4 pt-4 border-t border-slate-100">
              <p className="text-xs text-slate-400 font-medium mb-2">Informasi Bank</p>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <InfoRow icon={Building2} label="Bank" value={vendor.bank_nama ?? '-'} />
                <InfoRow icon={FileText} label="No. Rekening" value={vendor.bank_nomor_rekening ?? '-'} />
                <InfoRow icon={User} label="Atas Nama" value={vendor.bank_atas_nama ?? '-'} />
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Documents */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold text-slate-900">Dokumen Vendor</h3>
            <button onClick={() => setShowAddDoc(true)} className="btn-primary text-sm py-2">
              <Plus className="w-4 h-4" /> Tambah
            </button>
          </div>
          {docs.length === 0 ? (
            <EmptyState title="Belum ada dokumen" message="Upload dokumen administrasi & kualifikasi Anda." />
          ) : (
            <div className="space-y-3">
              {docs.map((d) => (
                <div key={d.id} className="flex items-start gap-3 p-3 rounded-lg border border-slate-100 hover:border-pln-200 transition-all">
                  <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-pln-50 flex-shrink-0">
                    <FileText className="w-5 h-5 text-pln-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-slate-900">{d.jenis_dokumen}</p>
                      <StatusBadge status={d.status_verifikasi} />
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {d.nomor_dokumen ?? 'Tanpa nomor'} · {d.penerbit ?? '-'}
                    </p>
                    {d.tanggal_berlaku && <p className="text-xs text-slate-400">Berlaku hingga {formatDate(d.tanggal_berlaku)}</p>}
                    {d.catatan_verifikasi && <p className="text-xs text-slate-500 mt-1 italic">"{d.catatan_verifikasi}"</p>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* DPT */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold text-slate-900">Status DPT</h3>
            <span className="badge-info">{dpt.length} tender</span>
          </div>
          {dpt.length === 0 ? (
            <EmptyState title="Belum ada DPT" message="Daftar Penyedia Terpilih akan muncul saat Anda lolos kualifikasi tender." />
          ) : (
            <div className="space-y-3">
              {dpt.map((d) => (
                <div key={d.id} className="flex items-start gap-3 p-3 rounded-lg border border-slate-100 hover:border-pln-200 transition-all">
                  <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-success-50 flex-shrink-0">
                    <Shield className="w-5 h-5 text-success-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-pln-600">{d.tenders?.kode_tender}</p>
                    <p className="text-sm font-semibold text-slate-900 truncate">{d.tenders?.judul}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <StatusBadge status={d.status} />
                      <span className="text-xs text-slate-400">Masuk: {formatDate(d.tanggal_masuk)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {showEdit && <EditProfileModal vendor={vendor} onClose={() => setShowEdit(false)} onSaved={() => { setShowEdit(false); refreshVendor(); }} />}
      {showAddDoc && <AddDocModal vendorId={vendor.id} docTypes={docTypes} onClose={() => setShowAddDoc(false)} onAdded={() => { setShowAddDoc(false); loadData(); }} />}
    </div>
  );
}

function EditProfileModal({ vendor, onClose, onSaved }: { vendor: VendorProfile; onClose: () => void; onSaved: () => void }) {
  const [form, setForm] = useState({
    nama_perusahaan: vendor.nama_perusahaan, npwp: vendor.npwp ?? '', nib: vendor.nib ?? '',
    jenis_badan_usaha: vendor.jenis_badan_usaha, alamat: vendor.alamat ?? '', kota: vendor.kota ?? '',
    provinsi: vendor.provinsi ?? '', kode_pos: vendor.kode_pos ?? '', telepon: vendor.telepon ?? '',
    email_pic: vendor.email_pic ?? '', nama_pic: vendor.nama_pic ?? '', jabatan_pic: vendor.jabatan_pic ?? '',
    website: vendor.website ?? '', bank_nama: vendor.bank_nama ?? '', bank_nomor_rekening: vendor.bank_nomor_rekening ?? '',
    bank_atas_nama: vendor.bank_atas_nama ?? '', nilai_aset: vendor.nilai_aset ?? '', jumlah_karyawan: vendor.jumlah_karyawan ?? '',
  });
  const [saving, setSaving] = useState(false);

  async function save() {
    setSaving(true);
    await supabase.from('vendor_profiles').update({
      ...form,
      nilai_aset: form.nilai_aset ? parseFloat(form.nilai_aset) : null,
      jumlah_karyawan: form.jumlah_karyawan ? parseInt(form.jumlah_karyawan) : null,
      updated_at: new Date().toISOString(),
    }).eq('id', vendor.id);
    setSaving(false); onSaved();
  }

  return (
    <Modal open onClose={onClose} title="Edit Profil Vendor" size="lg">
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div><label className="label">Nama Perusahaan</label><input className="input" value={form.nama_perusahaan} onChange={(e) => setForm({ ...form, nama_perusahaan: e.target.value })} /></div>
          <div><label className="label">Jenis Badan Usaha</label>
            <select className="input" value={form.jenis_badan_usaha} onChange={(e) => setForm({ ...form, jenis_badan_usaha: e.target.value })}>
              <option>PT</option><option>CV</option><option>Perorangan</option><option>Koperasi</option><option>BUMD</option>
            </select>
          </div>
          <div><label className="label">NPWP</label><input className="input" value={form.npwp} onChange={(e) => setForm({ ...form, npwp: e.target.value })} /></div>
          <div><label className="label">NIB</label><input className="input" value={form.nib} onChange={(e) => setForm({ ...form, nib: e.target.value })} /></div>
        </div>
        <div><label className="label">Alamat</label><input className="input" value={form.alamat} onChange={(e) => setForm({ ...form, alamat: e.target.value })} /></div>
        <div className="grid grid-cols-3 gap-4">
          <div><label className="label">Kota</label><input className="input" value={form.kota} onChange={(e) => setForm({ ...form, kota: e.target.value })} /></div>
          <div><label className="label">Provinsi</label><input className="input" value={form.provinsi} onChange={(e) => setForm({ ...form, provinsi: e.target.value })} /></div>
          <div><label className="label">Kode Pos</label><input className="input" value={form.kode_pos} onChange={(e) => setForm({ ...form, kode_pos: e.target.value })} /></div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div><label className="label">Telepon</label><input className="input" value={form.telepon} onChange={(e) => setForm({ ...form, telepon: e.target.value })} /></div>
          <div><label className="label">Email PIC</label><input className="input" type="email" value={form.email_pic} onChange={(e) => setForm({ ...form, email_pic: e.target.value })} /></div>
          <div><label className="label">Nama PIC</label><input className="input" value={form.nama_pic} onChange={(e) => setForm({ ...form, nama_pic: e.target.value })} /></div>
          <div><label className="label">Jabatan PIC</label><input className="input" value={form.jabatan_pic} onChange={(e) => setForm({ ...form, jabatan_pic: e.target.value })} /></div>
        </div>
        <div><label className="label">Website</label><input className="input" value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })} /></div>
        <div className="grid grid-cols-3 gap-4">
          <div><label className="label">Bank</label><input className="input" value={form.bank_nama} onChange={(e) => setForm({ ...form, bank_nama: e.target.value })} /></div>
          <div><label className="label">No. Rekening</label><input className="input" value={form.bank_nomor_rekening} onChange={(e) => setForm({ ...form, bank_nomor_rekening: e.target.value })} /></div>
          <div><label className="label">Atas Nama</label><input className="input" value={form.bank_atas_nama} onChange={(e) => setForm({ ...form, bank_atas_nama: e.target.value })} /></div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div><label className="label">Nilai Aset (Rp)</label><input type="number" className="input" value={form.nilai_aset} onChange={(e) => setForm({ ...form, nilai_aset: e.target.value })} /></div>
          <div><label className="label">Jumlah Karyawan</label><input type="number" className="input" value={form.jumlah_karyawan} onChange={(e) => setForm({ ...form, jumlah_karyawan: e.target.value })} /></div>
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <button onClick={onClose} className="btn-ghost">Batal</button>
          <button onClick={save} disabled={saving} className="btn-primary">{saving ? 'Menyimpan...' : 'Simpan'}</button>
        </div>
      </div>
    </Modal>
  );
}

function AddDocModal({ vendorId, docTypes, onClose, onAdded }: { vendorId: string; docTypes: string[]; onClose: () => void; onAdded: () => void }) {
  const [form, setForm] = useState({ jenis_dokumen: docTypes[0], nomor_dokumen: '', penerbit: '', tanggal_terbit: '', tanggal_berlaku: '', file_url: '' });
  const [saving, setSaving] = useState(false);

  async function save() {
    setSaving(true);
    await supabase.from('vendor_documents').insert({
      vendor_id: vendorId,
      jenis_dokumen: form.jenis_dokumen,
      nomor_dokumen: form.nomor_dokumen || null,
      penerbit: form.penerbit || null,
      tanggal_terbit: form.tanggal_terbit || null,
      tanggal_berlaku: form.tanggal_berlaku || null,
      file_url: form.file_url || null,
      status_verifikasi: 'pending',
    });
    setSaving(false); onAdded();
  }

  return (
    <Modal open onClose={onClose} title="Tambah Dokumen" size="md">
      <div className="space-y-4">
        <div><label className="label">Jenis Dokumen</label>
          <select className="input" value={form.jenis_dokumen} onChange={(e) => setForm({ ...form, jenis_dokumen: e.target.value })}>
            {docTypes.map((t) => <option key={t}>{t}</option>)}
          </select>
        </div>
        <div><label className="label">Nomor Dokumen</label><input className="input" value={form.nomor_dokumen} onChange={(e) => setForm({ ...form, nomor_dokumen: e.target.value })} /></div>
        <div><label className="label">Penerbit</label><input className="input" value={form.penerbit} onChange={(e) => setForm({ ...form, penerbit: e.target.value })} /></div>
        <div className="grid grid-cols-2 gap-4">
          <div><label className="label">Tanggal Terbit</label><input type="date" className="input" value={form.tanggal_terbit} onChange={(e) => setForm({ ...form, tanggal_terbit: e.target.value })} /></div>
          <div><label className="label">Berlaku Hingga</label><input type="date" className="input" value={form.tanggal_berlaku} onChange={(e) => setForm({ ...form, tanggal_berlaku: e.target.value })} /></div>
        </div>
        <div><label className="label">URL File (opsional)</label><input className="input" value={form.file_url} onChange={(e) => setForm({ ...form, file_url: e.target.value })} placeholder="https://..." /></div>
        <div className="flex justify-end gap-2 pt-2">
          <button onClick={onClose} className="btn-ghost">Batal</button>
          <button onClick={save} disabled={saving} className="btn-primary">{saving ? 'Menyimpan...' : 'Simpan'}</button>
        </div>
      </div>
    </Modal>
  );
}

function InfoRow({ icon: Icon, label, value }: { icon: typeof FileText; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3">
      <Icon className="w-4 h-4 text-slate-400 flex-shrink-0" />
      <div className="min-w-0">
        <p className="text-xs text-slate-400">{label}</p>
        <p className="text-sm font-medium text-slate-900 truncate">{value}</p>
      </div>
    </div>
  );
}
