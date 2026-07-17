import { useState, type ReactNode } from 'react';
import { useAuth } from '../lib/auth';
import { Logo } from './Logo';
import {
  LayoutDashboard, Megaphone, FileText, ClipboardCheck, Trophy,
  Building2, FolderKanban, Package, Warehouse, Menu, X, LogOut, ChevronRight,
} from 'lucide-react';

export type PageKey =
  | 'dashboard' | 'tenders' | 'bids' | 'evaluations' | 'results'
  | 'profile' | 'projects' | 'materials' | 'warehouses';

interface NavItem { key: PageKey; label: string; icon: typeof LayoutDashboard; group: string }

const NAV: NavItem[] = [
  { key: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, group: 'e-Procurement' },
  { key: 'tenders', label: 'Pengumuman Tender', icon: Megaphone, group: 'e-Procurement' },
  { key: 'bids', label: 'Penawaran', icon: FileText, group: 'e-Procurement' },
  { key: 'evaluations', label: 'Evaluasi', icon: ClipboardCheck, group: 'e-Procurement' },
  { key: 'results', label: 'Hasil Pengadaan', icon: Trophy, group: 'e-Procurement' },
  { key: 'profile', label: 'Profil & DPT', icon: Building2, group: 'e-Procurement' },
  { key: 'projects', label: 'Proyek', icon: FolderKanban, group: 'Operasional' },
  { key: 'materials', label: 'Material', icon: Package, group: 'Operasional' },
  { key: 'warehouses', label: 'Gudang', icon: Warehouse, group: 'Operasional' },
];

export function Layout({ currentPage, onNavigate, children }: {
  currentPage: PageKey; onNavigate: (page: PageKey) => void; children: ReactNode;
}) {
  const { vendor, signOut } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const groups = [...new Set(NAV.map((n) => n.group))];

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <aside className={`fixed lg:sticky top-0 left-0 z-40 h-screen w-64 bg-pln-950 text-white flex flex-col transition-transform duration-300 ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="flex items-center justify-between px-5 py-5 border-b border-white/10">
          <Logo className="[&_span]:text-white [&_span:last-child]:text-pln-300" />
          <button onClick={() => setMobileOpen(false)} className="lg:hidden text-white/60 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
          {groups.map((group) => (
            <div key={group}>
              <p className="px-3 mb-2 text-[10px] font-bold uppercase tracking-wider text-pln-400">{group}</p>
              <div className="space-y-1">
                {NAV.filter((n) => n.group === group).map((item) => {
                  const active = currentPage === item.key;
                  return (
                    <button key={item.key} onClick={() => { onNavigate(item.key); setMobileOpen(false); }}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                        active ? 'bg-pln-600 text-white shadow-md' : 'text-pln-200 hover:bg-white/10 hover:text-white'
                      }`}>
                      <item.icon className="w-4.5 h-4.5 flex-shrink-0" />
                      <span>{item.label}</span>
                      {active && <ChevronRight className="w-4 h-4 ml-auto" />}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>
        <div className="px-3 py-4 border-t border-white/10">
          <div className="px-3 mb-3">
            <p className="text-sm font-semibold text-white truncate">{vendor?.nama_perusahaan ?? 'Vendor'}</p>
            <p className="text-xs text-pln-300">Status DPT: {vendor?.status_dpt ?? '-'}</p>
          </div>
          <button onClick={signOut} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-pln-200 hover:bg-danger-600 hover:text-white transition-colors">
            <LogOut className="w-4 h-4" /> Keluar
          </button>
        </div>
      </aside>
      {mobileOpen && <div className="fixed inset-0 z-30 bg-slate-900/50 lg:hidden" onClick={() => setMobileOpen(false)} />}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="sticky top-0 z-20 bg-white border-b border-slate-200 px-4 lg:px-8 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => setMobileOpen(true)} className="lg:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100">
              <Menu className="w-5 h-5" />
            </button>
            <h1 className="text-lg font-bold text-slate-900">{NAV.find((n) => n.key === currentPage)?.label ?? 'Dashboard'}</h1>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-pln-50 border border-pln-100">
              <div className="w-2 h-2 rounded-full bg-success-500 animate-pulse" />
              <span className="text-xs font-medium text-pln-700">Sistem Aktif</span>
            </div>
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-pln-500 to-pln-700 flex items-center justify-center text-white text-sm font-semibold">
              {(vendor?.nama_perusahaan ?? 'V').charAt(0)}
            </div>
          </div>
        </header>
        <main className="flex-1 p-4 lg:p-8 overflow-x-hidden">{children}</main>
      </div>
    </div>
  );
}
