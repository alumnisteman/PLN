import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../lib/auth';
import { formatCurrency, formatDate, capitalizeWords } from '../lib/utils';
import { StatusBadge } from '../components/StatusBadge';
import { EmptyState } from '../components/EmptyState';
import { Modal } from '../components/Modal';
import type { Project, ProjectActivity, Tender } from '../lib/types';
import {
  FolderKanban, Plus, ChevronRight, Calendar, MapPin, TrendingUp,
  Clock, Trash2, CheckCircle2, Activity, ListChecks,
} from 'lucide-react';

export function ProjectsPage() {
  const { vendor } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [selected, setSelected] = useState<Project | null>(null);

  async function load() {
    if (!vendor) return;
    const { data } = await supabase.from('projects').select('*, tenders(*)').eq('vendor_id', vendor.id).order('created_at', { ascending: false });
    setProjects((data ?? []) as Project[]); setLoading(false);
  }

  useEffect(() => { load(); }, [vendor]);

  if (loading) return <div className="flex items-center justify-center py-20"><div className="w-8 h-8 border-3 border-pln-200 border-t-pln-600 rounded-full animate-spin" /></div>;

  const active = projects.filter((p) => p.status === 'berjalan');
  const completed = projects.filter((p) => p.status === 'selesai');
  const delayed = projects.filter((p) => p.status === 'tertunda' || (p.tanggal_selesai && new Date(p.tanggal_selesai) < new Date() && p.status !== 'selesai'));

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="grid grid-cols-3 gap-4">
        <div className="card p-4"><div className="flex items-center gap-2"><TrendingUp className="w-4 h-4 text-pln-600" /><div><p className="text-xl font-bold text-slate-900">{active.length}</p><p className="text-xs text-slate-500">Aktif</p></div></div></div>
        <div className="card p-4"><div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-success-600" /><div><p className="text-xl font-bold text-slate-900">{completed.length}</p><p className="text-xs text-slate-500">Selesai</p></div></div></div>
        <div className="card p-4"><div className="flex items-center gap-2"><Clock className="w-4 h-4 text-danger-600" /><div><p className="text-xl font-bold text-slate-900">{delayed.length}</p><p className="text-xs text-slate-500">Terlambat</p></div></div></div>
      </div>

      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500">{projects.length} proyek</p>
        <button onClick={() => setShowCreate(true)} className="btn-primary"><Plus className="w-4 h-4" /> Buat Proyek</button>
      </div>

      {projects.length === 0 ? (
        <EmptyState title="Belum ada proyek" message="Buat proyek dari tender yang dimenangkan untuk mulai mengelola eksekusi."
          action={<button onClick={() => setShowCreate(true)} className="btn-primary"><Plus className="w-4 h-4" /> Buat Proyek</button>} />
      ) : (
        <div className="grid gap-4">
          {projects.map((p) => (
            <button key={p.id} onClick={() => setSelected(p)} className="card p-5 text-left hover:shadow-md hover:border-pln-200 transition-all group">
              <div className="flex items-start gap-3">
                <div className="flex items-center justify-center w-11 h-11 rounded-lg bg-pln-50 flex-shrink-0">
                  <FolderKanban className="w-5 h-5 text-pln-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-bold text-pln-600">{p.kode_proyek}</span>
                    <StatusBadge status={p.status} />
                  </div>
                  <h3 className="text-base font-semibold text-slate-900 group-hover:text-pln-700 truncate">{p.nama_proyek}</h3>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-xs text-slate-500">
                    {p.lokasi && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {p.lokasi}</span>}
                    {p.tanggal_selesai && <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {formatDate(p.tanggal_selesai)}</span>}
                    <span>{formatCurrency(p.nilai_kontrak)}</span>
                  </div>
                  <div className="flex items-center gap-2 mt-3">
                    <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-pln-500 to-pln-600 rounded-full transition-all duration-500" style={{ width: `${p.progress}%` }} />
                    </div>
                    <span className="text-xs font-semibold text-slate-700 w-10 text-right">{p.progress}%</span>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-pln-500" />
              </div>
            </button>
          ))}
        </div>
      )}

      {showCreate && <CreateProjectModal vendorId={vendor?.id ?? null} onClose={() => setShowCreate(false)} onCreated={() => { setShowCreate(false); load(); }} />}
      {selected && <ProjectDetailModal project={selected} onClose={() => setSelected(null)} onChanged={load} />}
    </div>
  );
}

function CreateProjectModal({ vendorId, onClose, onCreated }: { vendorId: string | null; onClose: () => void; onCreated: () => void }) {
  const [tenders, setTenders] = useState<Tender[]>([]);
  const [form, setForm] = useState({ kode_proyek: '', nama_proyek: '', deskripsi: '', lokasi: '', tanggal_mulai: '', tanggal_selesai: '', nilai_kontrak: '', tender_id: '', status: 'perencanaan' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    supabase.from('tenders').select('*').in('status', ['pemenang', 'selesai']).order('created_at', { ascending: false }).then(({ data }) => {
      setTenders((data ?? []) as Tender[]);
    });
  }, []);

  async function save() {
    if (!vendorId) return;
    setSaving(true);
    await supabase.from('projects').insert({
      vendor_id: vendorId,
      kode_proyek: form.kode_proyek,
      nama_proyek: form.nama_proyek,
      deskripsi: form.deskripsi || null,
      lokasi: form.lokasi || null,
      tanggal_mulai: form.tanggal_mulai || null,
      tanggal_selesai: form.tanggal_selesai || null,
      nilai_kontrak: form.nilai_kontrak ? parseFloat(form.nilai_kontrak) : null,
      tender_id: form.tender_id || null,
      status: form.status,
      progress: 0,
    });
    setSaving(false); onCreated();
  }

  return (
    <Modal open onClose={onClose} title="Buat Proyek Baru" size="lg">
      <div className="space-y-4">
        <div><label className="label">Tender (opsional)</label>
          <select className="input" value={form.tender_id} onChange={(e) => {
            const t = tenders.find((x) => x.id === e.target.value);
            setForm({ ...form, tender_id: e.target.value, nama_proyek: t?.judul ?? form.nama_proyek, nilai_kontrak: t?.nilai_hps?.toString() ?? form.nilai_kontrak, lokasi: t?.lokasi_pekerjaan ?? form.lokasi });
          }}>
            <option value="">— Tanpa tender —</option>
            {tenders.map((t) => <option key={t.id} value={t.id}>{t.kode_tender} — {t.judul}</option>)}
          </select>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div><label className="label">Kode Proyek</label><input className="input" value={form.kode_proyek} onChange={(e) => setForm({ ...form, kode_proyek: e.target.value })} placeholder="PRJ-001" /></div>
          <div><label className="label">Status</label>
            <select className="input" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
              <option value="perencanaan">Perencanaan</option><option value="berjalan">Berjalan</option><option value="tertunda">Tertunda</option><option value="selesai">Selesai</option>
            </select>
          </div>
        </div>
        <div><label className="label">Nama Proyek</label><input className="input" value={form.nama_proyek} onChange={(e) => setForm({ ...form, nama_proyek: e.target.value })} /></div>
        <div><label className="label">Deskripsi</label><textarea className="input" rows={2} value={form.deskripsi} onChange={(e) => setForm({ ...form, deskripsi: e.target.value })} /></div>
        <div><label className="label">Lokasi</label><input className="input" value={form.lokasi} onChange={(e) => setForm({ ...form, lokasi: e.target.value })} /></div>
        <div className="grid grid-cols-2 gap-4">
          <div><label className="label">Tanggal Mulai</label><input type="date" className="input" value={form.tanggal_mulai} onChange={(e) => setForm({ ...form, tanggal_mulai: e.target.value })} /></div>
          <div><label className="label">Tanggal Selesai</label><input type="date" className="input" value={form.tanggal_selesai} onChange={(e) => setForm({ ...form, tanggal_selesai: e.target.value })} /></div>
        </div>
        <div><label className="label">Nilai Kontrak (Rp)</label><input type="number" className="input" value={form.nilai_kontrak} onChange={(e) => setForm({ ...form, nilai_kontrak: e.target.value })} /></div>
        <div className="flex justify-end gap-2 pt-2">
          <button onClick={onClose} className="btn-ghost">Batal</button>
          <button onClick={save} disabled={saving || !form.kode_proyek || !form.nama_proyek} className="btn-primary">{saving ? 'Menyimpan...' : 'Simpan'}</button>
        </div>
      </div>
    </Modal>
  );
}

function ProjectDetailModal({ project, onClose, onChanged }: { project: Project; onClose: () => void; onChanged: () => void }) {
  const [activities, setActivities] = useState<ProjectActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [newActivity, setNewActivity] = useState({ nama_aktivitas: '', tanggal_mulai: '', tanggal_selesai: '', pic: '' });
  const [showAdd, setShowAdd] = useState(false);

  async function loadActivities() {
    const { data } = await supabase.from('project_activities').select('*').eq('project_id', project.id).order('created_at');
    setActivities((data ?? []) as ProjectActivity[]); setLoading(false);
  }

  useEffect(() => { loadActivities(); }, [project.id]);

  async function addActivity() {
    if (!newActivity.nama_aktivitas) return;
    await supabase.from('project_activities').insert({
      project_id: project.id, nama_aktivitas: newActivity.nama_aktivitas,
      tanggal_mulai: newActivity.tanggal_mulai || null, tanggal_selesai: newActivity.tanggal_selesai || null,
      pic: newActivity.pic || null, progress: 0, status: 'pending',
    });
    setNewActivity({ nama_aktivitas: '', tanggal_mulai: '', tanggal_selesai: '', pic: '' });
    setShowAdd(false); loadActivities();
  }

  async function updateProgress(act: ProjectActivity, progress: number) {
    await supabase.from('project_activities').update({
      progress, status: progress >= 100 ? 'selesai' : progress > 0 ? 'berjalan' : 'pending',
    }).eq('id', act.id);
    const updated = activities.map((a) => a.id === act.id ? { ...a, progress } : a);
    const avg = updated.length > 0 ? Math.round(updated.reduce((s, a) => s + a.progress, 0) / updated.length) : 0;
    await supabase.from('projects').update({ progress: avg }).eq('id', project.id);
    loadActivities(); onChanged();
  }

  async function deleteActivity(id: string) {
    await supabase.from('project_activities').delete().eq('id', id);
    loadActivities();
  }

  return (
    <Modal open onClose={onClose} title={project.kode_proyek} size="xl">
      <div className="space-y-5">
        <div>
          <div className="flex items-center gap-2 mb-2"><StatusBadge status={project.status} /><span className="text-sm text-slate-500">{formatCurrency(project.nilai_kontrak)}</span></div>
          <h3 className="text-lg font-bold text-slate-900">{project.nama_proyek}</h3>
          {project.deskripsi && <p className="text-sm text-slate-600 mt-1">{project.deskripsi}</p>}
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { label: 'Lokasi', value: project.lokasi ?? '-' },
            { label: 'Mulai', value: project.tanggal_mulai ? formatDate(project.tanggal_mulai) : '-' },
            { label: 'Selesai', value: project.tanggal_selesai ? formatDate(project.tanggal_selesai) : '-' },
            { label: 'Progress', value: `${project.progress}%` },
          ].map((i) => (
            <div key={i.label} className="bg-slate-50 rounded-lg p-3">
              <p className="text-xs text-slate-400">{i.label}</p>
              <p className="text-sm font-semibold text-slate-900 mt-0.5">{i.value}</p>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between">
          <h4 className="text-sm font-semibold text-slate-900 flex items-center gap-2"><ListChecks className="w-4 h-4" /> WBS / Aktivitas</h4>
          <button onClick={() => setShowAdd(!showAdd)} className="btn-secondary text-sm py-2"><Plus className="w-4 h-4" /> Tambah</button>
        </div>

        {showAdd && (
          <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-3">
            <div><label className="label">Nama Aktivitas</label><input className="input" value={newActivity.nama_aktivitas} onChange={(e) => setNewActivity({ ...newActivity, nama_aktivitas: e.target.value })} placeholder="Mobilisasi, Survey, Pondasi..." /></div>
            <div className="grid grid-cols-3 gap-3">
              <div><label className="label">Mulai</label><input type="date" className="input" value={newActivity.tanggal_mulai} onChange={(e) => setNewActivity({ ...newActivity, tanggal_mulai: e.target.value })} /></div>
              <div><label className="label">Selesai</label><input type="date" className="input" value={newActivity.tanggal_selesai} onChange={(e) => setNewActivity({ ...newActivity, tanggal_selesai: e.target.value })} /></div>
              <div><label className="label">PIC</label><input className="input" value={newActivity.pic} onChange={(e) => setNewActivity({ ...newActivity, pic: e.target.value })} /></div>
            </div>
            <button onClick={addActivity} className="btn-primary w-full">Tambah Aktivitas</button>
          </div>
        )}

        {loading ? <div className="py-4 text-center text-sm text-slate-400">Memuat...</div> : (
          activities.length === 0 ? <EmptyState title="Belum ada aktivitas" message="Tambahkan WBS/aktivitas untuk tracking progress proyek." /> : (
            <div className="space-y-3">
              {activities.map((a, i) => (
                <div key={a.id} className="p-4 rounded-lg border border-slate-200">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="flex items-center justify-center w-7 h-7 rounded-full bg-pln-100 text-xs font-bold text-pln-700">{i + 1}</span>
                      <div>
                        <p className="text-sm font-semibold text-slate-900">{a.nama_aktivitas}</p>
                        <p className="text-xs text-slate-500">
                          {a.tanggal_mulai ? formatDate(a.tanggal_mulai) : '-'} → {a.tanggal_selesai ? formatDate(a.tanggal_selesai) : '-'}
                          {a.pic && ` · PIC: ${a.pic}`}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <StatusBadge status={a.status} />
                      <button onClick={() => deleteActivity(a.id)} className="p-1 text-slate-300 hover:text-danger-500"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <input type="range" min={0} max={100} value={a.progress} onChange={(e) => updateProgress(a, parseInt(e.target.value))} className="flex-1 accent-pln-600" />
                    <span className="text-xs font-semibold text-slate-700 w-10 text-right">{a.progress}%</span>
                  </div>
                </div>
              ))}
            </div>
          )
        )}
      </div>
    </Modal>
  );
}
