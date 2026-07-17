import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { formatCurrency } from '../lib/utils';
import { EmptyState } from '../components/EmptyState';
import { Modal } from '../components/Modal';
import type { Material } from '../lib/types';
import { Package, Search, Plus, Boxes } from 'lucide-react';

export function MaterialsPage() {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterCat, setFilterCat] = useState('all');
  const [showAdd, setShowAdd] = useState(false);

  useEffect(() => {
    supabase.from('materials').select('*').order('nama').then(({ data }) => {
      setMaterials((data ?? []) as Material[]); setLoading(false);
    });
  }, []);

  const categories = [...new Set(materials.map((m) => m.kategori).filter(Boolean))] as string[];
  const filtered = materials.filter((m) => {
    const ms = search.toLowerCase();
    const ms2 = m.nama.toLowerCase().includes(ms) || m.kode.toLowerCase().includes(ms);
    const ct = filterCat === 'all' || m.kategori === filterCat;
    return ms2 && ct;
  });

  if (loading) return <div className="flex items-center justify-center py-20"><div className="w-8 h-8 border-3 border-pln-200 border-t-pln-600 rounded-full animate-spin" /></div>;

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="card p-4">
        <div className="flex flex-col lg:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input className="input pl-10" placeholder="Cari material..." value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <select className="input lg:w-48" value={filterCat} onChange={(e) => setFilterCat(e.target.value)}>
            <option value="all">Semua Kategori</option>
            {categories.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          <button onClick={() => setShowAdd(true)} className="btn-primary"><Plus className="w-4 h-4" /> Tambah</button>
        </div>
      </div>

      <p className="text-sm text-slate-500">{filtered.length} material</p>

      {filtered.length === 0 ? (
        <EmptyState title="Tidak ada material" />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((m) => (
            <div key={m.id} className="card p-4 hover:shadow-md hover:border-pln-200 transition-all">
              <div className="flex items-start gap-3">
                <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-pln-50 flex-shrink-0">
                  <Package className="w-5 h-5 text-pln-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-pln-600">{m.kode}</p>
                  <p className="text-sm font-semibold text-slate-900 truncate">{m.nama}</p>
                  <div className="flex items-center gap-2 mt-1">
                    {m.kategori && <span className="badge-neutral">{m.kategori}</span>}
                    {m.satuan && <span className="text-xs text-slate-400">/ {m.satuan}</span>}
                  </div>
                  <p className="text-sm font-bold text-slate-900 mt-2">{formatCurrency(m.harga_satuan)}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showAdd && <AddMaterialModal onClose={() => setShowAdd(false)} onAdded={() => { setShowAdd(false);
        supabase.from('materials').select('*').order('nama').then(({ data }) => setMaterials((data ?? []) as Material[]));
      }} />}
    </div>
  );
}

function AddMaterialModal({ onClose, onAdded }: { onClose: () => void; onAdded: () => void }) {
  const [form, setForm] = useState({ kode: '', nama: '', satuan: '', kategori: '', harga_satuan: '' });
  const [saving, setSaving] = useState(false);

  async function save() {
    setSaving(true);
    await supabase.from('materials').insert({
      kode: form.kode, nama: form.nama, satuan: form.satuan || null,
      kategori: form.kategori || null, harga_satuan: form.harga_satuan ? parseFloat(form.harga_satuan) : null,
    });
    setSaving(false); onAdded();
  }

  return (
    <Modal open onClose={onClose} title="Tambah Material" size="md">
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div><label className="label">Kode</label><input className="input" value={form.kode} onChange={(e) => setForm({ ...form, kode: e.target.value })} placeholder="MAT-011" /></div>
          <div><label className="label">Kategori</label><input className="input" value={form.kategori} onChange={(e) => setForm({ ...form, kategori: e.target.value })} placeholder="Kabel, Trafo..." /></div>
        </div>
        <div><label className="label">Nama Material</label><input className="input" value={form.nama} onChange={(e) => setForm({ ...form, nama: e.target.value })} /></div>
        <div className="grid grid-cols-2 gap-4">
          <div><label className="label">Satuan</label><input className="input" value={form.satuan} onChange={(e) => setForm({ ...form, satuan: e.target.value })} placeholder="Meter, Unit..." /></div>
          <div><label className="label">Harga Satuan (Rp)</label><input type="number" className="input" value={form.harga_satuan} onChange={(e) => setForm({ ...form, harga_satuan: e.target.value })} /></div>
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <button onClick={onClose} className="btn-ghost">Batal</button>
          <button onClick={save} disabled={saving || !form.kode || !form.nama} className="btn-primary">{saving ? 'Menyimpan...' : 'Simpan'}</button>
        </div>
      </div>
    </Modal>
  );
}
