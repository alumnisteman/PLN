import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { supabase } from './supabase';
import type { VendorProfile } from './types';

interface AuthContextValue {
  session: Session | null; user: User | null; vendor: VendorProfile | null; loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signUp: (email: string, password: string, namaPerusahaan: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  refreshVendor: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [vendor, setVendor] = useState<VendorProfile | null>(null);
  const [loading, setLoading] = useState(true);

  async function loadVendor(userId: string) {
    const { data } = await supabase.from('vendor_profiles').select('*').eq('user_id', userId).maybeSingle();
    setVendor(data as VendorProfile | null);
  }

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session); setUser(session?.user ?? null);
      if (session?.user) loadVendor(session.user.id).finally(() => setLoading(false));
      else setLoading(false);
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_e, session) => {
      (async () => {
        setSession(session); setUser(session?.user ?? null);
        if (session?.user) await loadVendor(session.user.id);
        else setVendor(null);
        setLoading(false);
      })();
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  async function signIn(email: string, password: string) {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error?.message ?? null };
  }

  async function signUp(email: string, password: string, namaPerusahaan: string) {
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) return { error: error.message };
    if (data.user) {
      const { error: pe } = await supabase.from('vendor_profiles').insert({
        user_id: data.user.id, nama_perusahaan: namaPerusahaan, jenis_badan_usaha: 'PT', status_dpt: 'aktif',
      });
      if (pe) return { error: pe.message };
    }
    return { error: null };
  }

  async function signOut() { await supabase.auth.signOut(); setVendor(null); }
  async function refreshVendor() { if (user) await loadVendor(user.id); }

  return (
    <AuthContext.Provider value={{ session, user, vendor, loading, signIn, signUp, signOut, refreshVendor }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
