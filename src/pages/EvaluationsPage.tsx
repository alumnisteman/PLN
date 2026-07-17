import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../lib/auth';
import { formatCurrency, formatDate, capitalizeWords } from '../lib/utils';
import { StatusBadge } from '../components/StatusBadge';
import { EmptyState } from '../components/EmptyState';
import { Modal } from '../components/Modal';
import type { Bid, BidEvaluation } from '../lib/types';
import { ClipboardCheck, ChevronRight, TrendingUp, AlertCircle, CheckCircle2, XCircle } from 'lucide-react';

export function EvaluationsPage() {
  const { vendor } = useAuth();
  const [bids, setBids] = useState<Bid[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Bid | null>(null);

  useEffect(() => {
    if (!vendor) return;
    supabase.from('bids').select('*, tenders(*)').eq('vendor_id', vendor.id).in('status', ['submitted', 'terbuka', 'diskualifikasi']).order('created_at', { ascending: false })
      .then(({ data }) => { setBids((data ?? []) as Bid[]); setLoading(false); });
  }, [vendor]);

  if (loading) return <div className="flex items-center justify-center py-20"><div className="w-8 h-8 border-3 border-pln-200 border-t-pln-600 rounded-full animate-spin" /></div>;

  return (
    <div className="space-y-5 animate-fade-in">
      <p className="text-sm text-slate-500">{bids.length} penawaran dalam evaluasi</p>
      {bids.length === 0 ? (
        <EmptyState title="Belum ada evaluasi" message="Penawaran yang sudah disubmit akan dievaluasi oleh panitia PLN." />
      ) : (
        <div className="grid gap-4">
          {bids.map((b) => (
            <button key={b.id} onClick={() => setSelected(b)} className="card p-5 text-left hover:shadow-md hover:border-pln-200 transition-all group">
              <div className="flex items-start gap-3">
                <div className="flex items-center justify-center w-11 h-11 rounded-lg bg-pln-50 flex-shrink-0">
                  <ClipboardCheck className="w-5 h-5 text-pln-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-bold text-pln-600">{b.tenders?.kode_tender}</span>
                    <StatusBadge status={b.status} />
                  </div>
                  <h3 className="text-base font-semibold text-slate-900 group-hover:text-pln-700 truncate">{b.tenders?.judul}</h3>
                  <div className="flex items-center gap-4 mt-2 text-xs text-slate-500">
                    <span>Nilai: {formatCurrency(b.nilai_penawaran)}</span>
                    <span>Submitted: {formatDate(b.submitted_at)}</span>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-pln-500" />
              </div>
            </button>
          ))}
        </div>
      )}
      {selected && <EvaluationDetailModal bid={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}

function EvaluationDetailModal({ bid, onClose }: { bid: Bid; onClose: () => void }) {
  const [evals, setEvals] = useState<BidEvaluation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.from('bid_evaluations').select('*').eq('bid_id', bid.id).order('created_at').then(({ data }) => {
      setEvals((data ?? []) as BidEvaluation[]); setLoading(false);
    });
  }, [bid.id]);

  const aspekList = ['administrasi', 'teknis', 'harga', 'kualifikasi'];
  const aspekData = aspekList.map((a) => evals.find((e) => e.aspek === a)).filter(Boolean) as BidEvaluation[];
  const totalSkor = aspekData.reduce((s, e) => s + (e.skor ?? 0), 0);
  const avgSkor = aspekData.length > 0 ? totalSkor / aspekData.length : 0;

  return (
    <Modal open onClose={onClose} title={`Evaluasi — ${bid.tenders?.kode_tender ?? ''}`} size="lg">
      <div className="space-y-5">
        <div>
          <h3 className="text-lg font-bold text-slate-900">{bid.tenders?.judul}</h3>
          <div className="flex items-center gap-2 mt-2">
            <StatusBadge status={bid.status} />
            <span className="text-sm text-slate-500">Nilai Penawaran: {formatCurrency(bid.nilai_penawaran)}</span>
          </div>
        </div>

        {loading ? <div className="py-8 text-center text-sm text-slate-400">Memuat evaluasi...</div> : (
          <>
            {evals.length === 0 ? (
              <div className="text-center py-8">
                <AlertCircle className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                <p className="text-sm text-slate-500">Evaluasi belum dilakukan. Panitia PLN akan mengevaluasi penawaran Anda setelah batas penawaran berakhir.</p>
              </div>
            ) : (
              <>
                {/* Score summary */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-4 rounded-lg bg-pln-50">
                    <p className="text-xs text-pln-600 font-medium">Rata-rata Skor</p>
                    <p className="text-2xl font-bold text-pln-700 mt-1">{avgSkor.toFixed(1)}</p>
                  </div>
                  <div className="p-4 rounded-lg bg-slate-50">
                    <p className="text-xs text-slate-500 font-medium">Total Aspek Dievaluasi</p>
                    <p className="text-2xl font-bold text-slate-700 mt-1">{aspekData.length} / {aspekList.length}</p>
                  </div>
                </div>

                {/* Aspect evaluations */}
                <div className="space-y-3">
                  {aspekData.map((e) => (
                    <div key={e.id} className="p-4 rounded-lg border border-slate-200">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <TrendingUp className="w-4 h-4 text-pln-500" />
                          <span className="text-sm font-semibold text-slate-900">{capitalizeWords(e.aspek)}</span>
                        </div>
                        {e.status === 'lulus' ? <CheckCircle2 className="w-5 h-5 text-success-500" /> :
                         e.status === 'gagal' ? <XCircle className="w-5 h-5 text-danger-500" /> :
                         <AlertCircle className="w-5 h-5 text-warning-500" />}
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs text-slate-400">Skor:</span>
                            <span className="text-sm font-bold text-slate-900">{e.skor ?? '-'}</span>
                            {e.nilai_bobot && <><span className="text-xs text-slate-400">Bobot:</span><span className="text-sm font-medium text-slate-700">{e.nilai_bobot}</span></>}
                          </div>
                          {e.catatan && <p className="text-xs text-slate-500 mt-1">{e.catatan}</p>}
                        </div>
                        <StatusBadge status={e.status} />
                      </div>
                      {e.evaluated_at && <p className="text-xs text-slate-400 mt-2">Dievaluasi: {formatDate(e.evaluated_at)}</p>}
                    </div>
                  ))}
                </div>
              </>
            )}
          </>
        )}
      </div>
    </Modal>
  );
}
