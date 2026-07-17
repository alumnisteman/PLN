import { capitalizeWords } from '../lib/utils';

const STATUS_STYLES: Record<string, string> = {
  draft: 'badge-neutral', diumumkan: 'badge-info', pendaftaran: 'badge-info',
  penawaran: 'badge-warning', evaluasi: 'accent-100 text-accent-700', pemenang: 'badge-success',
  selesai: 'badge-success', dibatalkan: 'badge-danger',
  submitted: 'badge-info', terbuka: 'badge-warning', diskualifikasi: 'badge-danger',
  terverifikasi: 'badge-success', pending: 'badge-warning', ditolak: 'badge-danger',
  perencanaan: 'badge-neutral', berjalan: 'badge-info', tertunda: 'badge-warning',
  disetujui: 'badge-success', dikirim: 'badge-info', diterima: 'badge-success',
  aktif: 'badge-success', nonaktif: 'badge-neutral', suspend: 'badge-danger',
  ditetapkan: 'badge-success',
  terjadwal: 'badge-neutral', dilewati: 'badge-danger',
};

export function StatusBadge({ status }: { status: string }) {
  const cls = STATUS_STYLES[status] ?? 'badge-neutral';
  const isCustom = cls.includes(' ');
  return (
    <span className={isCustom ? `badge ${cls}` : cls}>
      {capitalizeWords(status)}
    </span>
  );
}
