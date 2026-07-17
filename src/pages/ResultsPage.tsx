import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../lib/auth';
import { formatCurrency, formatDate, capitalizeWords } from '../lib/utils';
import { StatusBadge } from '../components/StatusBadge';
import { EmptyState } from '../components/EmptyState';
import { Modal } from '../components/Modal';
import type { TenderResult } from '../lib/types';
import { Trophy, ChevronRight, Calendar, FileText, Award, TrendingUp } from 'lucide-react';

export function ResultsPage() {
  const { vendor } = useAuth();
  const [results, setResults] = useState<TenderResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<TenderResult | null>(null);

  useEffect(() => {
    if (!vendor) return;
    supabase.from('tender_results').select('*, tenders(*)').eq('vendor_id', vendor.id).order('created_at', { ascending: false })
      .then(({ data }) => { setResults((data ?? []) as TenderResult[]); setLoading(false); });
  }, [vendor]);

  if (loading) return <div className="flex items-center justify-center py-20"><div className="w-8 h-8 border-3 border-pln-200 border-t-pln-600 rounded-full animate-spin" /></div>;

  const won = results.filter((r) => r.status === 'ditetapkan');
  const totalValue = won.reduce((s, r) => s + (r.nilai_kontrak ?? 0), 0);

  return (
    <div className="space-y-5 animate-fade-in">
      {results.length > 0 && (
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="card p-5">
            <div className="flex items-center gap-3 mb-2">
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-success-50"><Trophy className="w-5 h-5 text-success-600" /></div>
              <div><p className="text-2xl font-bold text-slate-900">{won.length}</p><p className="text-xs text-slate-500">Tender Dimenangkan</p></div>
            </div>
          </div>
          <div className="card p-5">
            <div className="flex items-center gap-3 mb-2">
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-pln-50"><TrendingUp className="w-5 h-5 text-pln-600" /></div>
              <div><p className="text-2xl font-bold text-slate-900">{formatCurrency(totalValue)}</p><p className="text-xs text-slate-500">Total Nilai Kontrak</p></div>
            </div>
          </div>
          <div className="card p-5 col-span-2 lg:col-span-1">
            <div className="flex items-center gap-3 mb-2">
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-accent-50"><Award className="w-5 h-5 text-accent-600" /></div>
              <div><p className="text-2xl font-bold text-slate-900">{results.length}</p><p className="text-xs text-slate-500">Total Hasil</p></div>
            </div>
          </div>
        </div>
      )}

      <p className="text-sm text-slate-500">{results.length} hasil pengadaan</p>

      {results.length === 0 ? (
        <EmptyState title="Belum ada hasil pengadaan" message="Hasil tender yang Anda ikuti akan muncul di sini setelah evaluasi selesai." />
      ) : (
        <div className="grid gap-4">
          {results.map((r) => (
            <button key={r.id} onClick={() => setSelected(r)} className="card p-5 text-left hover:shadow-md hover:border-pln-200 transition-all group">
              <div className="flex items-start gap-3">
                <div className={`flex items-center justify-center w-11 h-11 rounded-lg flex-shrink-0 ${r.status === 'ditetapkan' ? 'bg-success-50' : 'bg-slate-100'}`}>
                  <Trophy className={`w-5 h-5 ${r.status === 'ditetapkan' ? 'text-success-600' : 'text-slate-400'}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-bold text-pln-600">{r.tenders?.kode_tender}</span>
                    <StatusBadge status={r.status} />
                  </div>
                  <h3 className="text-base font-semibold text-slate-900 group-hover:text-pln-700 truncate">{r.tenders?.judul}</h3>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-xs text-slate-500">
                    <span className="flex items-center gap-1"><FileText className="w-3 h-3" /> {r.nomor_kontrak ?? 'Belum ada nomor'}</span>
                    {r.tanggal_kontrak && <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {formatDate(r.tanggal_kontrak)}</span>}
                    <span>Nilai: {formatCurrency(r.nilai_kontrak)}</span>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-pln-500" />
              </div>
            </button>
          ))}
        </div>
      )}

      {selected && <ResultDetailModal result={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}

function ResultDetailModal({ result, onClose }: { result: TenderResult; onClose: () => void }) {
  return (
    <Modal open onClose={onClose} title={`Hasil — ${result.tenders?.kode_tender ?? ''}`} size="lg">
      <div className="space-y-5">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <StatusBadge status={result.status} />
            {result.status === 'ditetapkan' && <span className="badge-success">Pemenang</span>}
          </div>
          <h3 className="text-lg font-bold text-slate-900">{result.tenders?.judul}</h3>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {[
            { label: 'Nilai Kontrak', value: formatCurrency(result.nilai_kontrak) },
            { label: 'Nomor Kontrak', value: result.nomor_kontrak ?? '-' },
            { label: 'Tanggal Kontrak', value: result.tanggal_kontrak ? formatDate(result.tanggal_kontrak) : '-' },
            { label: 'Jangka Waktu', value: result.jangka_waktu ? `${result.jangka_waktu} hari` : '-' },
          ].map((i) => (
            <div key={i.label} className="bg-slate-50 rounded-lg p-3">
              <p className="text-xs text-slate-400">{i.label}</p>
              <p className="text-sm font-semibold text-slate-900 mt-0.5">{i.value}</p>
            </div>
          ))}
        </div>

        {result.nilai_terbilang && (
          <div className="p-3 rounded-lg bg-pln-50 border border-pln-100">
            <p className="text-xs text-pln-600 font-medium">Nilai Terbilang</p>
            <p className="text-sm text-slate-700 capitalize mt-0.5">{result.nilai_terbilang}</p>
          </div>
        )}

        {result.catatan && (
          <div>
            <p className="text-xs text-slate-400 font-medium mb-1">Catatan</p>
            <p className="text-sm text-slate-600 p-3 rounded-lg bg-slate-50">{result.catatan}</p>
          </div>
        )}

        {result.ditetapkan_at && (
          <div className="flex items-center gap-2 text-sm text-slate-500 pt-2 border-t border-slate-100">
            <Calendar className="w-4 h-4" />
            Ditetapkan pada {formatDate(result.ditetapkan_at)}
          </div>
        )}
      </div>
    </Modal>
  );
}
