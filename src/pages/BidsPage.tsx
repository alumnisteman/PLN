import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../lib/auth';
import { formatCurrency, formatDate, terbilang, capitalizeWords } from '../lib/utils';
import { StatusBadge } from '../components/StatusBadge';
import { EmptyState } from '../components/EmptyState';
import { Modal } from '../components/Modal';
import type { Bid, Tender, TenderItem, BidItem } from '../lib/types';
import {
  FileText, Plus, Clock, Calendar, ChevronRight, Trash2, Send,
  CheckCircle2, AlertCircle, TrendingUp,
} from 'lucide-react';

export function BidsPage() {
  const { vendor } = useAuth();
  const [bids, setBids] = useState<Bid[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [selected, setSelected] = useState<Bid | null>(null);

  async function loadBids() {
    if (!vendor) return;
    const { data } = await supabase.from('bids').select('*, tenders(*)').eq('vendor_id', vendor.id).order('created_at', { ascending: false });
    setBids((data ?? []) as Bid[]);
    setLoading(false);
  }

  useEffect(() => { loadBids(); }, [vendor]);

  if (loading) return <div className="flex items-center justify-center py-20"><div className="w-8 h-8 border-3 border-pln-200 border-t-pln-600 rounded-full animate-spin" /></div>;

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500">{bids.length} penawaran</p>
        <button onClick={() => setShowCreate(true)} className="btn-primary">
          <Plus className="w-4 h-4" /> Buat Penawaran
        </button>
      </div>

      {bids.length === 0 ? (
        <EmptyState title="Belum ada penawaran" message="Mulai buat penawaran untuk mengikuti tender PLN."
          action={<button onClick={() => setShowCreate(true)} className="btn-primary"><Plus className="w-4 h-4" /> Buat Penawaran</button>} />
      ) : (
        <div className="grid gap-4">
          {bids.map((b) => (
            <button key={b.id} onClick={() => setSelected(b)} className="card p-5 text-left hover:shadow-md hover:border-pln-200 transition-all group">
              <div className="flex flex-col lg:flex-row lg:items-start gap-4">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <div className="flex items-center justify-center w-11 h-11 rounded-lg bg-pln-50 flex-shrink-0">
                    <FileText className="w-5 h-5 text-pln-600" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-bold text-pln-600">{b.tenders?.kode_tender ?? '-'}</span>
                      <StatusBadge status={b.status} />
                    </div>
                    <h3 className="text-base font-semibold text-slate-900 group-hover:text-pln-700 transition-colors truncate">{b.tenders?.judul ?? '-'}</h3>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-xs text-slate-500">
                      <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> Dibuat {formatDate(b.created_at)}</span>
                      {b.submitted_at && <span className="flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Submitted {formatDate(b.submitted_at)}</span>}
                    </div>
                  </div>
                </div>
                <div className="lg:text-right">
                  <p className="text-xs text-slate-400">Nilai Penawaran</p>
                  <p className="text-lg font-bold text-slate-900">{formatCurrency(b.nilai_penawaran)}</p>
                  {b.jangka_waktu_pelaksanaan && <p className="text-xs text-slate-500 mt-0.5">{b.jangka_waktu_pelaksanaan} hari pelaksanaan</p>}
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {showCreate && <CreateBidModal vendorId={vendor?.id ?? null} onClose={() => setShowCreate(false)} onCreated={() => { setShowCreate(false); loadBids(); }} />}
      {selected && <BidDetailModal bid={selected} onClose={() => setSelected(null)} onChanged={loadBids} />}
    </div>
  );
}

function CreateBidModal({ vendorId, onClose, onCreated }: { vendorId: string | null; onClose: () => void; onCreated: () => void }) {
  const [tenders, setTenders] = useState<Tender[]>([]);
  const [tenderId, setTenderId] = useState('');
  const [items, setItems] = useState<TenderItem[]>([]);
  const [hargaSatuan, setHargaSatuan] = useState<Record<string, string>>({});
  const [jangkaWaktu, setJangkaWaktu] = useState('30');
  const [catatan, setCatatan] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    supabase.from('tenders').select('*').in('status', ['diumumkan', 'pendaftaran', 'penawaran']).order('tanggal_akhir_penawaran').then(({ data }) => {
      setTenders((data ?? []) as Tender[]);
    });
  }, []);

  useEffect(() => {
    if (!tenderId) return;
    supabase.from('tender_items').select('*').eq('tender_id', tenderId).order('created_at').then(({ data }) => {
      setItems((data ?? []) as TenderItem[]);
      setHargaSatuan({});
    });
  }, [tenderId]);

  const total = items.reduce((sum, it) => sum + (parseFloat(hargaSatuan[it.id] ?? '0') || 0) * (it.volume ?? 0), 0);

  async function handleSubmit() {
    if (!vendorId || !tenderId) return;
    setSaving(true); setError(null);
    const { data: bid } = await supabase.from('bids').insert({
      tender_id: tenderId, vendor_id: vendorId, nilai_penawaran: total,
      nilai_terbilang: terbilang(total) + ' rupiah', jangka_waktu_pelaksanaan: parseInt(jangkaWaktu) || 30,
      catatan, status: 'draft',
    }).select('*').single();

    if (!bid) { setError('Gagal membuat penawaran'); setSaving(false); return; }

    const bidItems = items.map((it) => ({
      bid_id: (bid as Bid).id, tender_item_id: it.id,
      harga_satuan: parseFloat(hargaSatuan[it.id] ?? '0') || 0,
      jumlah: (parseFloat(hargaSatuan[it.id] ?? '0') || 0) * (it.volume ?? 0),
    }));
    if (bidItems.length > 0) await supabase.from('bid_items').insert(bidItems);
    setSaving(false); onCreated();
  }

  return (
    <Modal open onClose={onClose} title="Buat Penawaran Baru" size="xl">
      <div className="space-y-4">
        {error && <div className="px-4 py-3 rounded-lg bg-danger-50 border border-danger-200 text-sm text-danger-700">{error}</div>}
        <div>
          <label className="label">Pilih Tender</label>
          <select className="input" value={tenderId} onChange={(e) => setTenderId(e.target.value)}>
            <option value="">— Pilih tender —</option>
            {tenders.map((t) => <option key={t.id} value={t.id}>{t.kode_tender} — {t.judul}</option>)}
          </select>
        </div>
        {items.length > 0 && (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-left text-xs text-slate-500">
                    <th className="pb-2 font-medium">Item</th>
                    <th className="pb-2 font-medium text-right">Volume</th>
                    <th className="pb-2 font-medium">Satuan</th>
                    <th className="pb-2 font-medium text-right">Harga Satuan</th>
                    <th className="pb-2 font-medium text-right">Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((it) => {
                    const hs = parseFloat(hargaSatuan[it.id] ?? '0') || 0;
                    return (
                      <tr key={it.id} className="border-b border-slate-100">
                        <td className="py-2.5 font-medium text-slate-900">{it.nama_item}</td>
                        <td className="py-2.5 text-right text-slate-600">{it.volume}</td>
                        <td className="py-2.5 text-slate-600">{it.satuan}</td>
                        <td className="py-2.5 text-right">
                          <input type="number" className="input w-32 text-right py-1.5" value={hargaSatuan[it.id] ?? ''}
                            onChange={(e) => setHargaSatuan({ ...hargaSatuan, [it.id]: e.target.value })} placeholder="0" />
                        </td>
                        <td className="py-2.5 text-right font-medium text-slate-900">{formatCurrency(hs * (it.volume ?? 0))}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div className="flex items-center justify-between p-4 bg-pln-50 rounded-lg">
              <span className="font-semibold text-pln-800">Total Penawaran</span>
              <span className="text-xl font-bold text-pln-700">{formatCurrency(total)}</span>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Jangka Waktu (hari)</label>
                <input type="number" className="input" value={jangkaWaktu} onChange={(e) => setJangkaWaktu(e.target.value)} />
              </div>
              <div>
                <label className="label">Catatan</label>
                <input className="input" value={catatan} onChange={(e) => setCatatan(e.target.value)} placeholder="Catatan opsional" />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button onClick={onClose} className="btn-ghost">Batal</button>
              <button onClick={handleSubmit} disabled={saving || !tenderId} className="btn-primary">
                {saving ? 'Menyimpan...' : 'Simpan Penawaran'} <CheckCircle2 className="w-4 h-4" />
              </button>
            </div>
          </>
        )}
      </div>
    </Modal>
  );
}

function BidDetailModal({ bid, onClose, onChanged }: { bid: Bid; onClose: () => void; onChanged: () => void }) {
  const [items, setItems] = useState<BidItem[]>([]);
  const [tenderItems, setTenderItems] = useState<TenderItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const [bi, ti] = await Promise.all([
        supabase.from('bid_items').select('*').eq('bid_id', bid.id),
        supabase.from('tender_items').select('*').eq('tender_id', bid.tender_id).order('created_at'),
      ]);
      setItems((bi.data ?? []) as BidItem[]);
      setTenderItems((ti.data ?? []) as TenderItem[]);
      setLoading(false);
    })();
  }, [bid.id, bid.tender_id]);

  async function submitBid() {
    await supabase.from('bids').update({ status: 'submitted', submitted_at: new Date().toISOString() }).eq('id', bid.id);
    onChanged(); onClose();
  }

  async function deleteBid() {
    await supabase.from('bids').delete().eq('id', bid.id);
    onChanged(); onClose();
  }

  return (
    <Modal open onClose={onClose} title={`Penawaran — ${bid.tenders?.kode_tender ?? ''}`} size="xl">
      <div className="space-y-5">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <StatusBadge status={bid.status} />
            <span className="badge-neutral">{bid.tenders?.tender_categories?.nama ?? '-'}</span>
          </div>
          <h3 className="text-lg font-bold text-slate-900">{bid.tenders?.judul}</h3>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { label: 'Nilai Penawaran', value: formatCurrency(bid.nilai_penawaran) },
            { label: 'Jangka Waktu', value: `${bid.jangka_waktu_pelaksanaan ?? 0} hari` },
            { label: 'Mata Uang', value: bid.mata_uang },
            { label: 'Submitted', value: bid.submitted_at ? formatDate(bid.submitted_at) : '-' },
          ].map((i) => (
            <div key={i.label} className="bg-slate-50 rounded-lg p-3">
              <p className="text-xs text-slate-400">{i.label}</p>
              <p className="text-sm font-semibold text-slate-900 mt-0.5">{i.value}</p>
            </div>
          ))}
        </div>

        {bid.nilai_terbilang && (
          <div className="p-3 rounded-lg bg-pln-50 border border-pln-100">
            <p className="text-xs text-pln-600 font-medium">Terbilang</p>
            <p className="text-sm text-slate-700 capitalize mt-0.5">{bid.nilai_terbilang}</p>
          </div>
        )}

        {loading ? <div className="py-8 text-center text-sm text-slate-400">Memuat...</div> : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-left text-xs text-slate-500">
                  <th className="pb-2 font-medium">Item</th>
                  <th className="pb-2 font-medium text-right">Volume</th>
                  <th className="pb-2 font-medium text-right">Harga Penawaran</th>
                  <th className="pb-2 font-medium text-right">Harga HPS</th>
                  <th className="pb-2 font-medium text-right">Subtotal</th>
                </tr>
              </thead>
              <tbody>
                {tenderItems.map((ti) => {
                  const bi = items.find((i) => i.tender_item_id === ti.id);
                  return (
                    <tr key={ti.id} className="border-b border-slate-100">
                      <td className="py-2.5 font-medium text-slate-900">{ti.nama_item}</td>
                      <td className="py-2.5 text-right text-slate-600">{ti.volume} {ti.satuan}</td>
                      <td className="py-2.5 text-right text-slate-900">{formatCurrency(bi?.harga_satuan)}</td>
                      <td className="py-2.5 text-right text-slate-400">{formatCurrency(ti.harga_satuan_hps)}</td>
                      <td className="py-2.5 text-right font-medium text-slate-900">{formatCurrency(bi?.jumlah)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {bid.catatan && (
          <div>
            <p className="text-xs text-slate-400 font-medium mb-1">Catatan</p>
            <p className="text-sm text-slate-600 p-3 rounded-lg bg-slate-50">{bid.catatan}</p>
          </div>
        )}

        <div className="flex items-center justify-between pt-3 border-t border-slate-100">
          {bid.status === 'draft' ? (
            <>
              <button onClick={deleteBid} className="btn-ghost text-danger-600 hover:bg-danger-50">
                <Trash2 className="w-4 h-4" /> Hapus
              </button>
              <button onClick={submitBid} className="btn-primary">
                <Send className="w-4 h-4" /> Submit Penawaran
              </button>
            </>
          ) : (
            <div className="flex items-center gap-2 text-sm text-slate-500 ml-auto">
              <AlertCircle className="w-4 h-4" />
              Penawaran telah disubmit dan tidak dapat diubah.
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}
