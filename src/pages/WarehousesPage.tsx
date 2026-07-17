import { useEffect, useState } from 'react';
import { supabase as sb } from '../lib/supabase';
import { useAuth } from '../lib/auth';
import { formatCurrency, formatDate } from '../lib/utils';
import { EmptyState } from '../components/EmptyState';
import { Modal } from '../components/Modal';
import type { Warehouse, Inventory, Material } from '../lib/types';
import { Warehouse as WarehouseIcon, Plus, Search, Package, MapPin, User, Trash2, Boxes } from 'lucide-react';

export function WarehousesPage() {
  const { vendor } = useAuth();
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [inventory, setInventory] = useState<Inventory[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddWh, setShowAddWh] = useState(false);
  const [showAddInv, setShowAddInv] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedWh, setSelectedWh] = useState<string>('all');

  async function load() {
    if (!vendor) return;
    const [wh, inv, mat] = await Promise.all([
      sb.from('warehouses').select('*').eq('vendor_id', vendor.id).order('nama'),
      sb.from('inventory').select('*, materials(*), warehouses(*)').eq('warehouses.vendor_id', vendor.id).order('tanggal_masuk', { ascending: false }),
      sb.from('materials').select('*').order('nama'),
    ]);
    setWarehouses((wh.data ?? []) as Warehouse[]);
    setInventory((inv.data ?? []) as Inventory[]);
    setMaterials((mat.data ?? []) as Material[]);
    setLoading(false);
  }

  useEffect(() => { load(); }, [vendor]);

  if (loading) return <div className="flex items-center justify-center py-20"><div className="w-8 h-8 border-3 border-pln-200 border-t-pln-600 rounded-full animate-spin" /></div>;

  const filteredInv = inventory.filter((i) => {
    const ms = search.toLowerCase();
    const ms2 = (i.materials?.nama ?? '').toLowerCase().includes(ms) || (i.materials?.kode ?? '').toLowerCase().includes(ms);
    const wh = selectedWh === 'all' || i.warehouse_id === selectedWh;
    return ms2 && wh;
  });

  const totalValue = filteredInv.reduce((s, i) => s + (i.jumlah ?? 0) * (i.harga_satuan ?? 0), 0);

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="card p-4"><div className="flex items-center gap-2"><WarehouseIcon className="w-4 h-4 text-pln-600" /><div><p className="text-xl font-bold text-slate-900">{warehouses.length}</p><p className="text-xs text-slate-500">Gudang</p></div></div></div>
        <div className="card p-4"><div className="flex items-center gap-2"><Boxes className="w-4 h-4 text-accent-600" /><div><p className="text-xl font-bold text-slate-900">{inventory.length}</p><p className="text-xs text-slate-500">Item Stok</p></div></div></div>
        <div className="card p-4 col-span-2 lg:col-span-1"><div className="flex items-center gap-2"><Package className="w-4 h-4 text-success-600" /><div><p className="text-xl font-bold text-slate-900">{formatCurrency(totalValue)}</p><p className="text-xs text-slate-500">Nilai Stok</p></div></div></div>
      </div>

      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500">{filteredInv.length} item inventaris</p>
        <div className="flex gap-2">
          <button onClick={() => setShowAddWh(true)} className="btn-secondary"><Plus className="w-4 h-4" /> Gudang</button>
          <button onClick={() => setShowAddInv(true)} className="btn-primary"><Plus className="w-4 h-4" /> Stok</button>
        </div>
      </div>

      <div className="card p-4">
        <div className="flex flex-col lg:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input className="input pl-10" placeholder="Cari inventaris..." value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <select className="input lg:w-48" value={selectedWh} onChange={(e) => setSelectedWh(e.target.value)}>
            <option value="all">Semua Gudang</option>
            {warehouses.map((w) => <option key={w.id} value={w.id}>{w.nama}</option>)}
          </select>
        </div>
      </div>

      {filteredInv.length === 0 ? (
        <EmptyState title="Belum ada inventaris" message="Tambahkan stok material ke gudang Anda." />
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-left text-xs text-slate-500 bg-slate-50">
                  <th className="px-4 py-3 font-medium">Material</th>
                  <th className="px-4 py-3 font-medium">Gudang</th>
                  <th className="px-4 py-3 font-medium text-right">Jumlah</th>
                  <th className="px-4 py-3 font-medium text-right">Harga Satuan</th>
                  <th className="px-4 py-3 font-medium text-right">Total</th>
                  <th className="px-4 py-3 font-medium">Tanggal Masuk</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {filteredInv.map((i) => (
                  <tr key={i.id} className="border-b border-slate-100 hover:bg-slate-50/50">
                    <td className="px-4 py-3">
                      <p className="font-medium text-slate-900">{i.materials?.nama ?? '-'}</p>
                      <p className="text-xs text-slate-400">{i.materials?.kode}</p>
                    </td>
                    <td className="px-4 py-3 text-slate-600">{i.warehouses?.nama ?? '-'}</td>
                    <td className="px-4 py-3 text-right text-slate-900">{i.jumlah} {i.satuan ?? i.materials?.satuan ?? ''}</td>
                    <td className="px-4 py-3 text-right text-slate-600">{formatCurrency(i.harga_satuan)}</td>
                    <td className="px-4 py-3 text-right font-medium text-slate-900">{formatCurrency(i.jumlah * (i.harga_satuan ?? 0))}</td>
                    <td className="px-4 py-3 text-slate-500">{formatDate(i.tanggal_masuk)}</td>
                    <td className="px-4 py-3">
                      <button onClick={async () => { await sb.from('inventory').delete().eq('id', i.id); load(); }}
                        className="p-1 text-slate-300 hover:text-danger-500"><Trash2 className="w-4 h-4" /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {showAddWh && <AddWarehouseModal vendorId={vendor?.id ?? null} onClose={() => setShowAddWh(false)} onAdded={() => { setShowAddWh(false); load(); }} />}
      {showAddInv && <AddInventoryModal warehouses={warehouses} materials={materials} onClose={() => setShowAddInv(false)} onAdded={() => { setShowAddInv(false); load(); }} />}
    </div>
  );
}

function AddWarehouseModal({ vendorId, onClose, onAdded }: { vendorId: string | null; onClose: () => void; onAdded: () => void }) {
  const [form, setForm] = useState({ kode: '', nama: '', alamat: '', penanggung_jawab: '' });
  const [saving, setSaving] = useState(false);

  async function save() {
    if (!vendorId) return;
    setSaving(true);
    await sb.from('warehouses').insert({
      vendor_id: vendorId, kode: form.kode, nama: form.nama,
      alamat: form.alamat || null, penanggung_jawab: form.penanggung_jawab || null,
    });
    setSaving(false); onAdded();
  }

  return (
    <Modal open onClose={onClose} title="Tambah Gudang" size="md">
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div><label className="label">Kode</label><input className="input" value={form.kode} onChange={(e) => setForm({ ...form, kode: e.target.value })} placeholder="GD-01" /></div>
          <div><label className="label">Nama</label><input className="input" value={form.nama} onChange={(e) => setForm({ ...form, nama: e.target.value })} placeholder="Gudang Pusat" /></div>
        </div>
        <div><label className="label">Alamat</label><input className="input" value={form.alamat} onChange={(e) => setForm({ ...form, alamat: e.target.value })} /></div>
        <div><label className="label">Penanggung Jawab</label><input className="input" value={form.penanggung_jawab} onChange={(e) => setForm({ ...form, penanggung_jawab: e.target.value })} /></div>
        <div className="flex justify-end gap-2 pt-2">
          <button onClick={onClose} className="btn-ghost">Batal</button>
          <button onClick={save} disabled={saving || !form.kode || !form.nama} className="btn-primary">{saving ? 'Menyimpan...' : 'Simpan'}</button>
        </div>
      </div>
    </Modal>
  );
}

function AddInventoryModal({ warehouses, materials, onClose, onAdded }: { warehouses: Warehouse[]; materials: Material[]; onClose: () => void; onAdded: () => void }) {
  const [form, setForm] = useState({ warehouse_id: '', material_id: '', jumlah: '', satuan: '', harga_satuan: '', tanggal_masuk: new Date().toISOString().slice(0, 10) });
  const [saving, setSaving] = useState(false);

  async function save() {
    setSaving(true);
    await sb.from('inventory').insert({
      warehouse_id: form.warehouse_id, material_id: form.material_id,
      jumlah: parseFloat(form.jumlah) || 0, satuan: form.satuan || null,
      harga_satuan: form.harga_satuan ? parseFloat(form.harga_satuan) : null,
      tanggal_masuk: form.tanggal_masuk,
    });
    setSaving(false); onAdded();
  }

  return (
    <Modal open onClose={onClose} title="Tambah Stok Material" size="md">
      <div className="space-y-4">
        <div><label className="label">Gudang</label>
          <select className="input" value={form.warehouse_id} onChange={(e) => setForm({ ...form, warehouse_id: e.target.value })}>
            <option value="">— Pilih gudang —</option>
            {warehouses.map((w) => <option key={w.id} value={w.id}>{w.nama}</option>)}
          </select>
        </div>
        <div><label className="label">Material</label>
          <select className="input" value={form.material_id} onChange={(e) => {
            const m = materials.find((x) => x.id === e.target.value);
            setForm({ ...form, material_id: e.target.value, satuan: m?.satuan ?? '', harga_satuan: m?.harga_satuan?.toString() ?? '' });
          }}>
            <option value="">— Pilih material —</option>
            {materials.map((m) => <option key={m.id} value={m.id}>{m.kode} — {m.nama}</option>)}
          </select>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div><label className="label">Jumlah</label><input type="number" className="input" value={form.jumlah} onChange={(e) => setForm({ ...form, jumlah: e.target.value })} /></div>
          <div><label className="label">Satuan</label><input className="input" value={form.satuan} onChange={(e) => setForm({ ...form, satuan: e.target.value })} /></div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div><label className="label">Harga Satuan</label><input type="number" className="input" value={form.harga_satuan} onChange={(e) => setForm({ ...form, harga_satuan: e.target.value })} /></div>
          <div><label className="label">Tanggal Masuk</label><input type="date" className="input" value={form.tanggal_masuk} onChange={(e) => setForm({ ...form, tanggal_masuk: e.target.value })} /></div>
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <button onClick={onClose} className="btn-ghost">Batal</button>
          <button onClick={save} disabled={saving || !form.warehouse_id || !form.material_id || !form.jumlah} className="btn-primary">{saving ? 'Menyimpan...' : 'Simpan'}</button>
        </div>
      </div>
    </Modal>
  );
}
