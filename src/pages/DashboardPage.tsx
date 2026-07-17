import { useEffect, useState } from 'react';
import { useAuth } from '../lib/auth';
import { supabase } from '../lib/supabase';
import { formatCurrency, formatDate, timeRemaining, capitalizeWords } from '../lib/utils';
import { StatusBadge } from '../components/StatusBadge';
import { EmptyState } from '../components/EmptyState';
import type { Tender, Bid, Project, DptList } from '../lib/types';
import {
  Megaphone, FileText, FolderKanban, Trophy, TrendingUp, Clock,
  AlertTriangle, CheckCircle2, Activity, ArrowUpRight, Calendar,
} from 'lucide-react';

export function DashboardPage({ onNavigate }: { onNavigate: (p: string) => void }) {
  const { vendor } = useAuth();
  const [stats, setStats] = useState({ tenders: 0, bids: 0, projects: 0, dpt: 0, activeProjects: 0, completedProjects: 0, delayedProjects: 0 });
  const [recentTenders, setRecentTenders] = useState<Tender[]>([]);
  const [recentBids, setRecentBids] = useState<Bid[]>([]);
  const [activeProjects, setActiveProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!vendor) return;
    (async () => {
      const [{ count: tenderCount }, { count: bidCount }, { data: projects }, { count: dptCount }, { data: recentT }, { data: recentB }] = await Promise.all([
        supabase.from('tenders').select('*', { count: 'exact', head: true }),
        supabase.from('bids').select('*', { count: 'exact', head: true }).eq('vendor_id', vendor.id),
        supabase.from('projects').select('*').eq('vendor_id', vendor.id),
        supabase.from('dpt_lists').select('*', { count: 'exact', head: true }).eq('vendor_id', vendor.id),
        supabase.from('tenders').select('*, tender_categories(*)').order('created_at', { ascending: false }).limit(5),
        supabase.from('bids').select('*, tenders(*)').eq('vendor_id', vendor.id).order('created_at', { ascending: false }).limit(5),
      ]);
      const active = (projects ?? []).filter((p) => p.status === 'berjalan');
      const completed = (projects ?? []).filter((p) => p.status === 'selesai');
      const delayed = (projects ?? []).filter((p) => p.status === 'tertunda' || (p.tanggal_selesai && new Date(p.tanggal_selesai) < new Date() && p.status !== 'selesai'));
      setStats({
        tenders: tenderCount ?? 0, bids: bidCount ?? 0, projects: projects?.length ?? 0,
        dpt: dptCount ?? 0, activeProjects: active.length, completedProjects: completed.length, delayedProjects: delayed.length,
      });
      setRecentTenders(recentT ?? []);
      setRecentBids(recentB ?? []);
      setActiveProjects(active);
      setLoading(false);
    })();
  }, [vendor]);

  if (loading) return <div className="flex items-center justify-center py-20"><div className="w-8 h-8 border-3 border-pln-200 border-t-pln-600 rounded-full animate-spin" /></div>;

  const statCards = [
    { label: 'Tender Aktif', value: stats.tenders, icon: Megaphone, color: 'pln', onClick: () => onNavigate('tenders') },
    { label: 'Penawaran Saya', value: stats.bids, icon: FileText, color: 'accent', onClick: () => onNavigate('bids') },
    { label: 'DPT Saya', value: stats.dpt, icon: Trophy, color: 'success', onClick: () => onNavigate('profile') },
    { label: 'Proyek Berjalan', value: stats.activeProjects, icon: Activity, color: 'pln', onClick: () => onNavigate('projects') },
  ];

  const projectStats = [
    { label: 'Aktif', value: stats.activeProjects, icon: TrendingUp, color: 'text-pln-600', bg: 'bg-pln-50' },
    { label: 'Selesai', value: stats.completedProjects, icon: CheckCircle2, color: 'text-success-600', bg: 'bg-success-50' },
    { label: 'Terlambat', value: stats.delayedProjects, icon: AlertTriangle, color: 'text-danger-600', bg: 'bg-danger-50' },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Welcome */}
      <div className="bg-gradient-to-r from-pln-700 to-pln-900 rounded-2xl p-6 lg:p-8 text-white relative overflow-hidden">
        <div className="absolute right-0 top-0 w-64 h-64 opacity-10" style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
        <div className="relative z-10">
          <p className="text-pln-200 text-sm font-medium">Selamat datang kembali,</p>
          <h2 className="text-2xl lg:text-3xl font-bold mt-1">{vendor?.nama_perusahaan ?? 'Vendor'}</h2>
          <div className="flex flex-wrap gap-4 mt-4">
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="w-4 h-4 text-pln-300" />
              <span className="text-pln-100">Bergabung sejak {formatDate(vendor?.tanggal_bergabung)}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Trophy className="w-4 h-4 text-pln-300" />
              <span className="text-pln-100">Status DPT: {capitalizeWords(vendor?.status_dpt ?? '-')}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((s) => (
          <button key={s.label} onClick={s.onClick} className="card p-5 text-left hover:shadow-md hover:border-pln-200 transition-all duration-200 group">
            <div className="flex items-center justify-between mb-3">
              <div className={`flex items-center justify-center w-11 h-11 rounded-lg ${s.color === 'pln' ? 'bg-pln-50' : s.color === 'accent' ? 'bg-accent-50' : 'bg-success-50'}`}>
                <s.icon className={`w-5 h-5 ${s.color === 'pln' ? 'text-pln-600' : s.color === 'accent' ? 'text-accent-600' : 'text-success-600'}`} />
              </div>
              <ArrowUpRight className="w-4 h-4 text-slate-300 group-hover:text-pln-500 transition-colors" />
            </div>
            <p className="text-2xl font-bold text-slate-900">{s.value}</p>
            <p className="text-sm text-slate-500 mt-0.5">{s.label}</p>
          </button>
        ))}
      </div>

      {/* Project Director stats */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-semibold text-slate-900">Ringkasan Proyek</h3>
          <button onClick={() => onNavigate('projects')} className="text-sm text-pln-600 hover:text-pln-700 font-medium">Lihat semua</button>
        </div>
        <div className="grid grid-cols-3 gap-4">
          {projectStats.map((ps) => (
            <div key={ps.label} className={`${ps.bg} rounded-xl p-4`}>
              <ps.icon className={`w-5 h-5 ${ps.color} mb-2`} />
              <p className={`text-2xl font-bold ${ps.color}`}>{ps.value}</p>
              <p className="text-sm text-slate-600 mt-0.5">{ps.label}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent tenders */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold text-slate-900">Tender Terbaru</h3>
            <button onClick={() => onNavigate('tenders')} className="text-sm text-pln-600 hover:text-pln-700 font-medium">Lihat semua</button>
          </div>
          {recentTenders.length === 0 ? (
            <EmptyState title="Belum ada tender" />
          ) : (
            <div className="space-y-3">
              {recentTenders.map((t) => (
                <button key={t.id} onClick={() => onNavigate('tenders')} className="w-full text-left p-3 rounded-lg border border-slate-100 hover:border-pln-200 hover:bg-pln-50/50 transition-all">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-medium text-pln-600">{t.kode_tender}</p>
                      <p className="text-sm font-semibold text-slate-900 truncate">{t.judul}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{t.unit_organisasi} · {formatCurrency(t.nilai_hps)}</p>
                    </div>
                    <StatusBadge status={t.status} />
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Recent bids */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold text-slate-900">Penawaran Terbaru</h3>
            <button onClick={() => onNavigate('bids')} className="text-sm text-pln-600 hover:text-pln-700 font-medium">Lihat semua</button>
          </div>
          {recentBids.length === 0 ? (
            <EmptyState title="Belum ada penawaran" message="Mulai ikuti tender dan submit penawaran Anda." />
          ) : (
            <div className="space-y-3">
              {recentBids.map((b) => (
                <button key={b.id} onClick={() => onNavigate('bids')} className="w-full text-left p-3 rounded-lg border border-slate-100 hover:border-pln-200 hover:bg-pln-50/50 transition-all">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-medium text-pln-600">{b.tenders?.kode_tender ?? '-'}</p>
                      <p className="text-sm font-semibold text-slate-900 truncate">{b.tenders?.judul ?? '-'}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{formatCurrency(b.nilai_penawaran)}</p>
                    </div>
                    <StatusBadge status={b.status} />
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Active projects */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-semibold text-slate-900">Proyek Aktif</h3>
          <button onClick={() => onNavigate('projects')} className="text-sm text-pln-600 hover:text-pln-700 font-medium">Lihat semua</button>
        </div>
        {activeProjects.length === 0 ? (
          <EmptyState title="Belum ada proyek aktif" message="Proyek dari tender yang dimenangkan akan muncul di sini." />
        ) : (
          <div className="space-y-3">
            {activeProjects.map((p) => (
              <div key={p.id} className="p-4 rounded-lg border border-slate-100 hover:border-pln-200 transition-all">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-pln-600">{p.kode_proyek}</p>
                    <p className="text-sm font-semibold text-slate-900">{p.nama_proyek}</p>
                  </div>
                  <StatusBadge status={p.status} />
                </div>
                <div className="flex items-center gap-4 text-xs text-slate-500 mb-2">
                  <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {formatDate(p.tanggal_selesai)}</span>
                  <span>{formatCurrency(p.nilai_kontrak)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-pln-500 to-pln-600 rounded-full transition-all duration-500" style={{ width: `${p.progress}%` }} />
                  </div>
                  <span className="text-xs font-semibold text-slate-700 w-10 text-right">{p.progress}%</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
