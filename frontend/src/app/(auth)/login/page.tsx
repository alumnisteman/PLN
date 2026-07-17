"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth";
import { authService } from "@/services/auth";
import { cn } from "@/lib/utils";
import { Eye, EyeOff, Zap, Loader2 } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await authService.login(email, password);
      if (res.success) {
        const { token, user } = res.data as { token: string; user: Parameters<typeof setAuth>[1] };
        setAuth(token, user);
        router.replace("/dashboard");
      }
    } catch (err: unknown) {
      const e = err as { message?: string };
      setError(e?.message ?? "Login gagal. Periksa email dan password Anda.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left — Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-blue-600 flex-col justify-between p-12 text-white relative overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-10">
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="1"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>

        <div className="relative">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
              <Zap className="w-6 h-6" />
            </div>
            <span className="text-xl font-bold">PLN ERP</span>
          </div>
        </div>

        <div className="relative">
          <h1 className="text-4xl font-bold leading-tight mb-4">
            Smart Construction<br />ERP System
          </h1>
          <p className="text-blue-100 text-lg leading-relaxed">
            Platform manajemen proyek konstruksi enterprise untuk kontraktor utilitas.
            Kelola project, material, SDM, keuangan, dan laporan dalam satu sistem.
          </p>

          <div className="mt-10 grid grid-cols-2 gap-4">
            {[
              { label: "Total Modul", value: "21+" },
              { label: "Tabel Database", value: "250+" },
              { label: "Fase Pengembangan", value: "5" },
              { label: "Jenis Laporan", value: "40+" },
            ].map((item) => (
              <div key={item.label} className="bg-white/10 rounded-xl p-4">
                <div className="text-2xl font-bold">{item.value}</div>
                <div className="text-blue-200 text-sm mt-1">{item.label}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="relative text-blue-200 text-sm">
          © 2026 Smart Construction ERP. All rights reserved.
        </div>
      </div>

      {/* Right — Login Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-slate-50">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="flex lg:hidden items-center gap-2 mb-8">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-bold text-slate-900">PLN ERP</span>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-slate-900">Masuk ke Akun</h2>
              <p className="text-slate-500 mt-2">
                Masukkan email dan password untuk mengakses sistem ERP.
              </p>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm flex items-start gap-3">
                <svg className="w-4 h-4 mt-0.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@erp.local"
                  required
                  className={cn(
                    "w-full h-11 px-4 rounded-xl border bg-white text-slate-900 placeholder-slate-400",
                    "focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent",
                    "border-slate-200 transition-all"
                  )}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPass ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Masukkan password"
                    required
                    className={cn(
                      "w-full h-11 px-4 pr-12 rounded-xl border bg-white text-slate-900 placeholder-slate-400",
                      "focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent",
                      "border-slate-200 transition-all"
                    )}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className={cn(
                  "w-full h-11 rounded-xl bg-blue-600 text-white font-semibold",
                  "hover:bg-blue-700 active:bg-blue-800 transition-colors",
                  "flex items-center justify-center gap-2",
                  "disabled:opacity-60 disabled:cursor-not-allowed"
                )}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Memproses...
                  </>
                ) : (
                  "Masuk"
                )}
              </button>
            </form>

            <div className="mt-6 p-4 bg-slate-50 rounded-xl border border-slate-200">
              <p className="text-xs font-medium text-slate-500 mb-2">Akun Demo:</p>
              <div className="space-y-1 text-xs text-slate-600">
                <div className="flex justify-between"><span>Super Admin</span><span className="font-mono">admin@erp.local / password</span></div>
                <div className="flex justify-between"><span>Direktur</span><span className="font-mono">director@erp.local / password</span></div>
                <div className="flex justify-between"><span>Project Manager</span><span className="font-mono">pm@erp.local / password</span></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
