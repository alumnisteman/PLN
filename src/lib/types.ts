export interface VendorProfile {
  id: string; user_id: string; nama_perusahaan: string; npwp: string | null; nib: string | null;
  jenis_badan_usaha: string; alamat: string | null; kota: string | null; provinsi: string | null;
  kode_pos: string | null; telepon: string | null; email_pic: string | null; nama_pic: string | null;
  jabatan_pic: string | null; website: string | null; bank_nama: string | null;
  bank_nomor_rekening: string | null; bank_atas_nama: string | null; status_dpt: string;
  tanggal_bergabung: string; nilai_aset: number | null; jumlah_karyawan: number | null;
  created_at: string; updated_at: string;
}

export interface VendorDocument {
  id: string; vendor_id: string; jenis_dokumen: string; nomor_dokumen: string | null;
  tanggal_terbit: string | null; tanggal_berlaku: string | null; penerbit: string | null;
  file_url: string | null; status_verifikasi: string; catatan_verifikasi: string | null;
  verified_by: string | null; verified_at: string | null; created_at: string; updated_at: string;
}

export interface TenderCategory {
  id: string; kode: string; nama: string; deskripsi: string | null; created_at: string;
}

export interface Tender {
  id: string; kode_tender: string; judul: string; deskripsi: string | null;
  kategori_id: string | null; unit_organisasi: string | null; lokasi_pekerjaan: string | null;
  nilai_hps: number | null; nilai_pagu: number | null; metode_pengadaan: string;
  jenis_kontrak: string | null; tanggal_pengumuman: string; tanggal_akhir_daftar: string | null;
  tanggal_akhir_penawaran: string | null; tanggal_pembukaan: string | null;
  tanggal_evaluasi: string | null; tanggal_pemenang: string | null; masa_berlaku_penawaran: number;
  status: string; dokumen_kualifikasi_url: string | null; dokumen_pemilihan_url: string | null;
  created_at: string; updated_at: string; tender_categories?: TenderCategory;
}

export interface TenderItem {
  id: string; tender_id: string; nama_item: string; volume: number | null; satuan: string | null;
  harga_satuan_hps: number | null; keterangan: string | null; created_at: string;
}

export interface DptList {
  id: string; tender_id: string; vendor_id: string; tanggal_masuk: string;
  status: string; catatan: string | null; created_at: string;
}

export interface Bid {
  id: string; tender_id: string; vendor_id: string; nilai_penawaran: number | null;
  nilai_terbilang: string | null; jangka_waktu_pelaksanaan: number | null; mata_uang: string;
  file_penawaran_url: string | null; file_harga_url: string | null; catatan: string | null;
  status: string; submitted_at: string | null; created_at: string; updated_at: string;
  tenders?: Tender;
}

export interface BidItem {
  id: string; bid_id: string; tender_item_id: string; harga_satuan: number | null;
  jumlah: number | null; keterangan: string | null; created_at: string;
}

export interface BidEvaluation {
  id: string; bid_id: string; evaluator_id: string | null; aspek: string;
  skor: number | null; nilai_bobot: number | null; catatan: string | null;
  status: string; evaluated_at: string | null; created_at: string;
}

export interface TenderResult {
  id: string; tender_id: string; vendor_id: string; nilai_kontrak: number | null;
  nilai_terbilang: string | null; nomor_kontrak: string | null; tanggal_kontrak: string | null;
  jangka_waktu: number | null; status: string; catatan: string | null;
  ditetapkan_at: string | null; created_at: string; tenders?: Tender;
}

export interface TenderClarification {
  id: string; tender_id: string; vendor_id: string | null; dari_role: string;
  pesan: string; file_url: string | null; created_at: string;
}

export interface TenderSchedule {
  id: string; tender_id: string; tahap: string; tanggal_mulai: string | null;
  tanggal_selesai: string | null; status: string; created_at: string;
}

export interface Project {
  id: string; vendor_id: string; tender_id: string | null; kode_proyek: string;
  nama_proyek: string; deskripsi: string | null; lokasi: string | null;
  tanggal_mulai: string | null; tanggal_selesai: string | null; nilai_kontrak: number | null;
  progress: number; status: string; created_at: string; updated_at: string;
  tenders?: Tender;
}

export interface ProjectActivity {
  id: string; project_id: string; nama_aktivitas: string; tanggal_mulai: string | null;
  tanggal_selesai: string | null; progress: number; status: string; pic: string | null;
  created_at: string;
}

export interface Material {
  id: string; kode: string; nama: string; satuan: string | null; kategori: string | null;
  harga_satuan: number | null; created_at: string; updated_at: string;
}

export interface Warehouse {
  id: string; vendor_id: string; kode: string; nama: string; alamat: string | null;
  penanggung_jawab: string | null; created_at: string;
}

export interface Inventory {
  id: string; warehouse_id: string; material_id: string; jumlah: number; satuan: string | null;
  harga_satuan: number | null; tanggal_masuk: string; created_at: string; updated_at: string;
  materials?: Material; warehouses?: Warehouse;
}

export interface MaterialRequest {
  id: string; project_id: string; material_id: string; jumlah: number; satuan: string | null;
  tanggal_permintaan: string; status: string; catatan: string | null;
  created_at: string; updated_at: string; materials?: Material; projects?: Project;
}
