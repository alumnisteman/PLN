import { useState } from 'react';
import { useAuth } from '../lib/auth';
import { Logo } from '../components/Logo';
import { Zap, TrendingUp, FileCheck, ShieldCheck, ArrowRight } from 'lucide-react';

export function AuthPage() {
  const { signIn, signUp } = useAuth();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [namaPerusahaan, setNamaPerusahaan] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null); setLoading(true);
    const result = mode === 'login'
      ? await signIn(email, password)
      : await signUp(email, password, namaPerusahaan);
    if (result.error) setError(result.error);
    setLoading(false);
  }

  return (
    <div className="min-h-screen flex">
      {/* Left: Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-pln-800 via-pln-700 to-pln-950 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 20% 80%, white 1px, transparent 1px)', backgroundSize: '32px 32px' }} />
        <div className="relative z-10 flex flex-col justify-between p-12 text-white">
          <Logo className="[&_span]:text-white [&_span:last-child]:text-pln-200" />
          <div className="space-y-8">
            <div>
              <h1 className="text-4xl font-bold leading-tight mb-3">Portal Vendor PLN e-Procurement</h1>
              <p className="text-pln-100 text-lg leading-relaxed">Sistem terintegrasi untuk kontraktor PLN — kelola tender, penawaran, evaluasi, dan eksekusi proyek dalam satu platform.</p>
            </div>
            <div className="space-y-4">
              {[
                { icon: TrendingUp, title: 'Pengumuman Tender', desc: 'Akses terhadap pengadaan terbaru PLN' },
                { icon: FileCheck, title: 'Penawaran & Evaluasi', desc: 'Submit dan pantau evaluasi penawaran' },
                { icon: ShieldCheck, title: 'Status DPT', desc: 'Kelola profil dan status penyedia terpilih' },
              ].map((f) => (
                <div key={f.title} className="flex items-start gap-3">
                  <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-white/10 backdrop-blur-sm flex-shrink-0">
                    <f.icon className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-white">{f.title}</p>
                    <p className="text-sm text-pln-200">{f.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <p className="text-sm text-pln-200">PT PLN (Persero) — e-Procurement Vendor Portal</p>
        </div>
      </div>

      {/* Right: Form */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12 bg-slate-50">
        <div className="w-full max-w-md animate-slide-up">
          <div className="lg:hidden mb-8"><Logo /></div>
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-slate-900">
              {mode === 'login' ? 'Masuk ke Akun' : 'Daftar Vendor Baru'}
            </h2>
            <p className="text-slate-500 mt-1.5">
              {mode === 'login' ? 'Selamat datang kembali, silakan masuk.' : 'Buat akun vendor untuk mengakses portal.'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'register' && (
              <div>
                <label className="label">Nama Perusahaan</label>
                <input className="input" value={namaPerusahaan} onChange={(e) => setNamaPerusahaan(e.target.value)} placeholder="PT. Contoh Kontraktor" required />
              </div>
            )}
            <div>
              <label className="label">Email</label>
              <input className="input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="vendor@perusahaan.co.id" required />
            </div>
            <div>
              <label className="label">Password</label>
              <input className="input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Minimal 6 karakter" required minLength={6} />
            </div>
            {error && (
              <div className="px-4 py-3 rounded-lg bg-danger-50 border border-danger-200 text-sm text-danger-700">{error}</div>
            )}
            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? 'Memproses...' : mode === 'login' ? 'Masuk' : 'Daftar'}
              {!loading && <ArrowRight className="w-4 h-4" />}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-slate-500">
            {mode === 'login' ? (
              <>Belum punya akun?{' '}
                <button onClick={() => { setMode('register'); setError(null); }} className="font-semibold text-pln-600 hover:text-pln-700">Daftar di sini</button>
              </>
            ) : (
              <>Sudah punya akun?{' '}
                <button onClick={() => { setMode('login'); setError(null); }} className="font-semibold text-pln-600 hover:text-pln-700">Masuk di sini</button>
              </>
            )}
          </div>

          <div className="mt-8 pt-6 border-t border-slate-200">
            <div className="flex items-center gap-2 text-xs text-slate-400 justify-center">
              <Zap className="w-3.5 h-3.5" />
              <span>Portal ini menggunakan autentikasi Supabase yang aman</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
