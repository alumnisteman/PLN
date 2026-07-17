export function formatCurrency(value: number | null | undefined): string {
  if (value === null || value === undefined) return '-';
  return new Intl.NumberFormat('id-ID', {
    style: 'currency', currency: 'IDR', minimumFractionDigits: 0, maximumFractionDigits: 0,
  }).format(value);
}

export function formatNumber(value: number | null | undefined): string {
  if (value === null || value === undefined) return '-';
  return new Intl.NumberFormat('id-ID').format(value);
}

export function formatDate(value: string | null | undefined): string {
  if (!value) return '-';
  return new Intl.DateTimeFormat('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(value));
}

export function formatDateTime(value: string | null | undefined): string {
  if (!value) return '-';
  return new Intl.DateTimeFormat('id-ID', {
    day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
  }).format(new Date(value));
}

export function timeRemaining(deadline: string | null | undefined): string {
  if (!deadline) return '-';
  const diff = new Date(deadline).getTime() - Date.now();
  if (diff < 0) return 'Berakhir';
  const days = Math.floor(diff / 86400000);
  const hours = Math.floor((diff % 86400000) / 3600000);
  if (days > 0) return `${days}h ${hours}j lagi`;
  const mins = Math.floor((diff % 3600000) / 60000);
  if (hours > 0) return `${hours}j ${mins}m lagi`;
  return `${mins}m lagi`;
}

export function terbilang(n: number): string {
  const s = ['', 'satu', 'dua', 'tiga', 'empat', 'lima', 'enam', 'tujuh', 'delapan', 'sembilan', 'sepuluh', 'sebelas'];
  if (n < 12) return s[n];
  if (n < 20) return terbilang(n - 10) + ' belas';
  if (n < 100) return terbilang(Math.floor(n / 10)) + ' puluh' + (n % 10 ? ' ' + terbilang(n % 10) : '');
  if (n < 200) return 'seratus' + (n - 100 > 0 ? ' ' + terbilang(n - 100) : '');
  if (n < 1000) return terbilang(Math.floor(n / 100)) + ' ratus' + (n % 100 ? ' ' + terbilang(n % 100) : '');
  if (n < 2000) return 'seribu' + (n - 1000 > 0 ? ' ' + terbilang(n - 1000) : '');
  if (n < 1e6) return terbilang(Math.floor(n / 1000)) + ' ribu' + (n % 1000 ? ' ' + terbilang(n % 1000) : '');
  if (n < 1e9) return terbilang(Math.floor(n / 1e6)) + ' juta' + (n % 1e6 ? ' ' + terbilang(n % 1e6) : '');
  if (n < 1e12) return terbilang(Math.floor(n / 1e9)) + ' miliar' + (n % 1e9 ? ' ' + terbilang(n % 1e9) : '');
  return terbilang(Math.floor(n / 1e12)) + ' triliun' + (n % 1e12 ? ' ' + terbilang(n % 1e12) : '');
}

export function capitalizeWords(str: string): string {
  return str.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}
