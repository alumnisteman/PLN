import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { formatCurrency, formatDate, timeRemaining, capitalizeWords } from '../lib/utils';
import { StatusBadge } from '../components/StatusBadge';
import { EmptyState } from '../components/EmptyState';
import { Modal } from '../components/Modal';
import { useAuth } from '../lib/auth';
import type { Tender, TenderItem, TenderSchedule, TenderClarification, TenderCategory } from '../lib/types';
import {
  Search, MapPin, Building2, Calendar, Clock, FileText, Megaphone,
  ChevronRight, Download, MessageSquare, ListChecks, AlertCircle,
} from 'lucide-react';

export function TendersPage() {
  const { vendor } = useAuth();
  const [tenders, setTenders] = useState<Tender[]>([]);
  const [categories, setCategories] = useState<TenderCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [selected, setSelected] = useState<Tender | null>(null);

  useEffect(() => {
    (async () => {
      const [{ data: t }, { data: c }] = await Promise.all([
        supabase.from('tenders').select('*, tender_categories(*)').order('tanggal_pengumuman', { ascending: false }),
        supabase.from('tender_categories').select('*').order('nama'),
      ]);
      setTenders((t ?? []) as Tender[]);
      setCategories((c ?? []) as TenderCategory[]);
      setLoading(false);
    })();
  }, []);

  const filtered = tenders.filter((t) => {
    const ms = search.toLowerCase();
    const ms2 = t.judul.toLowerCase().includes(ms) || t.kode_tender.toLowerCase().includes(ms) || (t.lokasi_pekerjaan ?? '').toLowerCase().includes(ms);
    const st = filterStatus === 'all' || t.status === filterStatus;
    const ct = filterCategory === 'all' || t.kategori_id === filterCategory;
    return ms2 && st && ct;
  });

  if (loading) return <div className="flex items-center justify-center py-20"><div className="w-8 h-8 border-3 border-pln-200 border-t-pln-600 rounded-full animate-spin" /></div>;

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Filters */}
      <div className="card p-4">
        <div className="flex flex-col lg:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input className="input pl-10" placeholder="Cari tender, kode, atau lokasi..." value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <select className="input lg:w-48" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
            <option value="all">Semua Status</option>
            <option value="diumumkan">Diumumkan</option>
            <option value="pendaftaran">Pendaftaran</option>
            <option value="penawaran">Penawaran</option>
            <option value="evaluasi">Evaluasi</option>
            <option value="pemenang">Pemenang</option>
            <option value="selesai">Selesai</option>
          </select>
          <select className="input lg:w-48" value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}>
            <option value="all">Semua Kategori</option>
            {categories.map((c) => <option key={c.id} value={c.id}>{c.nama}</option>)}
          </select>
        </div>
      </div>

      <p className="text-sm text-slate-500">{filtered.length} tender ditemukan</p>

      {/* List */}
      {filtered.length === 0 ? (
        <EmptyState title="Tidak ada tender" message="Coba ubah filter atau kata kunci pencarian." />
      ) : (
        <div className="grid gap-4">
          {filtered.map((t) => (
            <button key={t.id} onClick={() => setSelected(t)} className="card p-5 text-left hover:shadow-md hover:border-pln-200 transition-all duration-200 group">
              <div className="flex flex-col lg:flex-row lg:items-start gap-4">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <div className="flex items-center justify-center w-11 h-11 rounded-lg bg-pln-50 flex-shrink-0">
                    <Megaphone className="w-5 h-5 text-pln-600" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-bold text-pln-600">{t.kode_tender}</span>
                      <StatusBadge status={t.status} />
                      {t.tender_categories && <span className="badge-info">{t.tender_categories.nama}</span>}
                    </div>
                    <h3 className="text-base font-semibold text-slate-900 group-hover:text-pln-700 transition-colors">{t.judul}</h3>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-xs text-slate-500">
                      <span className="flex items-center gap-1"><Building2 className="w-3 h-3" /> {t.unit_organisasi ?? '-'}</span>
                      <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {t.lokasi_pekerjaan ?? '-'}</span>
                      <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {formatDate(t.tanggal_pengumuman)}</span>
                    </div>
                  </div>
                </div>
                <div className="flex lg:flex-col lg:items-end justify-between gap-2 lg:gap-1 lg:w-48">
                  <div>
                    <p className="text-xs text-slate-400">Nilai HPS</p>
                    <p className="text-lg font-bold text-slate-900">{formatCurrency(t.nilai_hps)}</p>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs">
                    <Clock className="w-3.5 h-3.5 text-accent-500" />
                    <span className="font-medium text-accent-700">{timeRemaining(t.tanggal_akhir_penawaran)}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-end mt-3 pt-3 border-t border-slate-100">
                <span className="text-sm font-medium text-pln-600 flex items-center gap-1 group-hover:gap-2 transition-all">Lihat detail <ChevronRight className="w-4 h-4" /></span>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Detail modal */}
      {selected && (
        <TenderDetail tender={selected} vendorId={vendor?.id ?? null} onClose={() => setSelected(null)} />
      )}
    </div>
  );
}

function TenderDetail({ tender, vendorId, onClose }: { tender: Tender; vendorId: string | null; onClose: () => void }) {
  const [items, setItems] = useState<TenderItem[]>([]);
  const [schedules, setSchedules] = useState<TenderSchedule[]>([]);
  const [clarifications, setClarifications] = useState<TenderClarification[]>([]);
  const [tab, setTab] = useState<'info' | 'items' | 'schedule' | 'clarifications'>('info');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const [it, sc, cl] = await Promise.all([
        supabase.from('tender_items').select('*').eq('tender_id', tender.id).order('created_at'),
        supabase.from('tender_schedules').select('*').eq('tender_id', tender.id).order('tanggal_mulai'),
        supabase.from('tender_clarifications').select('*').eq('tender_id', tender.id).order('created_at'),
      ]);
      setItems((it.data ?? []) as TenderItem[]);
      setSchedules((sc.data ?? []) as TenderSchedule[]);
      setClarifications((cl.data ?? []) as TenderClarification[]);
      setLoading(false);
    })();
  }, [tender.id]);

  const tabs = [
    { key: 'info', label: 'Informasi', icon: FileText },
    { key: 'items', label: 'Item Pekerjaan', icon: ListChecks },
    { key: 'schedule', label: 'Jadwal', icon: Calendar },
    { key: 'clarifications', label: 'Klarifikasi', icon: MessageSquare },
  ] as const;

  return (
    <Modal open onClose={onClose} title={tender.kode_tender} size="xl">
      <div className="space-y-5">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <StatusBadge status={tender.status} />
            {tender.tender_categories && <span className="badge-info">{tender.tender_categories.nama}</span>}
            <span className="badge-neutral">{capitalizeWords(tender.metode_pengadaan)}</span>
          </div>
          <h3 className="text-xl font-bold text-slate-900">{tender.judul}</h3>
          {tender.deskripsi && <p className="text-sm text-slate-600 mt-2 leading-relaxed">{tender.deskripsi}</p>}
        </div>

        {/* Key info grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { label: 'Nilai HPS', value: formatCurrency(tender.nilai_hps) },
            { label: 'Nilai Pagu', value: formatCurrency(tender.nilai_pagu) },
            { label: 'Batas Penawaran', value: timeRemaining(tender.tanggal_akhir_penawaran) },
            { label: 'Metode', value: capitalizeWords(tender.metode_pengadaan) },
          ].map((i) => (
            <div key={i.label} className="bg-slate-50 rounded-lg p-3">
              <p className="text-xs text-slate-400">{i.label}</p>
              <p className="text-sm font-semibold text-slate-900 mt-0.5">{i.value}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 border-b border-slate-200">
          {tabs.map((t) => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
                tab === t.key ? 'border-pln-600 text-pln-700' : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}>
              <t.icon className="w-4 h-4" /> {t.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="py-8 text-center text-sm text-slate-400">Memuat...</div>
        ) : tab === 'info' ? (
          <div className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <InfoRow icon={Building2} label="Unit Organisasi" value={tender.unit_organisasi ?? '-'} />
              <InfoRow icon={MapPin} label="Lokasi Pekerjaan" value={tender.lokasi_pekerjaan ?? '-'} />
              <InfoRow icon={Calendar} label="Tanggal Pengumuman" value={formatDate(tender.tanggal_pengumuman)} />
              <InfoRow icon={Clock} label="Batas Pendaftaran" value={formatDate(tender.tanggal_akhir_daftar)} />
              <InfoRow icon={Calendar} label="Tanggal Pembukaan" value={formatDate(tender.tanggal_pembukaan)} />
              <InfoRow icon={Calendar} label="Tanggal Evaluasi" value={formatDate(tender.tanggal_evaluasi)} />
              <InfoRow icon={Calendar} label="Penetapan Pemenang" value={formatDate(tender.tanggal_pemenang)} />
              <InfoRow icon={FileText} label="Jenis Kontrak" value={tender.jenis_kontrak ? capitalizeWords(tender.jenis_kontrak) : '-'} />
            </div>
            <div className="flex gap-3 pt-2">
              {tender.dokumen_kualifikasi_url && (
                <a href={tender.dokumen_kualifikasi_url} target="_blank" rel="noreferrer" className="btn-secondary">
                  <Download className="w-4 h-4" /> Dokumen Kualifikasi
                </a>
              )}
              {tender.dokumen_pemilihan_url && (
                <a href={tender.dokumen_pemilihan_url} target="_blank" rel="noreferrer" className="btn-secondary">
                  <Download className="w-4 h-4" /> Dokumen Pemilihan
                </a>
              )}
            </div>
          </div>
        ) : tab === 'items' ? (
          items.length === 0 ? <EmptyState title="Tidak ada item" /> : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-left text-xs text-slate-500">
                    <th className="pb-2 font-medium">Item</th>
                    <th className="pb-2 font-medium text-right">Volume</th>
                    <th className="pb-2 font-medium">Satuan</th>
                    <th className="pb-2 font-medium text-right">Harga Satuan HPS</th>
                    <th className="pb-2 font-medium text-right">Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((it) => (
                    <tr key={it.id} className="border-b border-slate-100">
                      <td className="py-3 font-medium text-slate-900">{it.nama_item}</td>
                      <td className="py-3 text-right text-slate-600">{it.volume ?? '-'}</td>
                      <td className="py-3 text-slate-600">{it.satuan ?? '-'}</td>
                      <td className="py-3 text-right text-slate-600">{formatCurrency(it.harga_satuan_hps)}</td>
                      <td className="py-3 text-right font-medium text-slate-900">{formatCurrency((it.volume ?? 0) * (it.harga_satuan_hps ?? 0))}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr>
                    <td colSpan={4} className="pt-3 text-right font-semibold text-slate-700">Total HPS:</td>
                    <td className="pt-3 text-right font-bold text-pln-700">{formatCurrency(items.reduce((s, i) => s + (i.volume ?? 0) * (i.harga_satuan_hps ?? 0), 0))}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )
        ) : tab === 'schedule' ? (
          schedules.length === 0 ? <EmptyState title="Tidak ada jadwal" /> : (
            <div className="space-y-3">
              {schedules.map((s, i) => (
                <div key={s.id} className="flex items-start gap-3">
                  <div className="flex flex-col items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                      s.status === 'selesai' ? 'bg-success-100 text-success-700' :
                      s.status === 'berjalan' ? 'bg-warning-100 text-warning-700' :
                      'bg-slate-100 text-slate-500'
                    }`}>{i + 1}</div>
                    {i < schedules.length - 1 && <div className="w-0.5 h-8 bg-slate-200" />}
                  </div>
                  <div className="flex-1 pb-2">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold text-slate-900">{capitalizeWords(s.tahap)}</p>
                      <StatusBadge status={s.status} />
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">{formatDate(s.tanggal_mulai)} — {formatDate(s.tanggal_selesai)}</p>
                  </div>
                </div>
              ))}
            </div>
          )
        ) : tab === 'clarifications' ? (
          <ClarificationsTab tenderId={tender.id} vendorId={vendorId} clarifications={clarifications} setClarifications={setClarifications} />
        ) : null}
      </div>
    </Modal>
  );
}

function ClarificationsTab({ tenderId, vendorId, clarifications, setClarifications }: {
  tenderId: string; vendorId: string | null;
  clarifications: TenderClarification[]; setClarifications: (c: TenderClarification[]) => void;
}) {
  const [pesan, setPesan] = useState('');
  const [sending, setSending] = useState(false);

  async function send() {
    if (!pesan.trim() || !vendorId) return;
    setSending(true);
    const { data } = await supabase.from('tender_clarifications').insert({
      tender_id: tenderId, vendor_id: vendorId, dari_role: 'vendor', pesan: pesan.trim(),
    }).select('*').single();
    if (data) setClarifications([...clarifications, data as TenderClarification]);
    setPesan(''); setSending(false);
  }

  return (
    <div className="space-y-4">
      {clarifications.length === 0 ? (
        <div className="text-center py-6">
          <AlertCircle className="w-8 h-8 text-slate-300 mx-auto mb-2" />
          <p className="text-sm text-slate-500">Belum ada klarifikasi. Kirim pesan ke panitia jika ada pertanyaan.</p>
        </div>
      ) : (
        <div className="space-y-3 max-h-64 overflow-y-auto">
          {clarifications.map((c) => (
            <div key={c.id} className={`p-3 rounded-lg ${c.dari_role === 'panitia' ? 'bg-pln-50 border border-pln-100' : 'bg-slate-50 border border-slate-100'}`}>
              <div className="flex items-center gap-2 mb-1">
                <span className={`text-xs font-semibold ${c.dari_role === 'panitia' ? 'text-pln-700' : 'text-slate-700'}`}>
                  {c.dari_role === 'panitia' ? 'Panitia PLN' : 'Anda'}
                </span>
                <span className="text-xs text-slate-400">{formatDate(c.created_at)}</span>
              </div>
              <p className="text-sm text-slate-700">{c.pesan}</p>
            </div>
          ))}
        </div>
      )}
      {vendorId && (
        <div className="flex gap-2">
          <input className="input flex-1" placeholder="Tulis klarifikasi..." value={pesan} onChange={(e) => setPesan(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && send()} />
          <button onClick={send} disabled={sending || !pesan.trim()} className="btn-primary">Kirim</button>
        </div>
      )}
    </div>
  );
}

function InfoRow({ icon: Icon, label, value }: { icon: typeof FileText; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-50">
      <Icon className="w-4 h-4 text-slate-400 flex-shrink-0" />
      <div className="min-w-0">
        <p className="text-xs text-slate-400">{label}</p>
        <p className="text-sm font-medium text-slate-900 truncate">{value}</p>
      </div>
    </div>
  );
}
