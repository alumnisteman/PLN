import { AuthProvider, useAuth } from './lib/auth';
import { AuthPage } from './pages/AuthPage';
import { Layout, type PageKey } from './components/Layout';
import { DashboardPage } from './pages/DashboardPage';
import { TendersPage } from './pages/TendersPage';
import { BidsPage } from './pages/BidsPage';
import { EvaluationsPage } from './pages/EvaluationsPage';
import { ResultsPage } from './pages/ResultsPage';
import { ProfilePage } from './pages/ProfilePage';
import { ProjectsPage } from './pages/ProjectsPage';
import { MaterialsPage } from './pages/MaterialsPage';
import { WarehousesPage } from './pages/WarehousesPage';
import { useState } from 'react';

function AppContent() {
  const { user, loading } = useAuth();
  const [page, setPage] = useState<PageKey>('dashboard');

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-pln-200 border-t-pln-600 rounded-full animate-spin" />
          <p className="text-sm text-slate-500">Memuat portal...</p>
        </div>
      </div>
    );
  }

  if (!user) return <AuthPage />;

  const navigate = (p: string) => setPage(p as PageKey);

  return (
    <Layout currentPage={page} onNavigate={setPage}>
      {page === 'dashboard' && <DashboardPage onNavigate={navigate} />}
      {page === 'tenders' && <TendersPage />}
      {page === 'bids' && <BidsPage />}
      {page === 'evaluations' && <EvaluationsPage />}
      {page === 'results' && <ResultsPage />}
      {page === 'profile' && <ProfilePage />}
      {page === 'projects' && <ProjectsPage />}
      {page === 'materials' && <MaterialsPage />}
      {page === 'warehouses' && <WarehousesPage />}
    </Layout>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
