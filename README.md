# Smart Construction ERP

ERP (Enterprise Resource Planning) khusus untuk perusahaan kontraktor utilitas — PLN, Telkom, PUPR, Pertamina, dan proyek infrastruktur lainnya.

Dibangun dengan **Laravel 12** (backend API) + **Next.js 15** (frontend), menggunakan arsitektur modular enterprise yang siap berkembang hingga 250–350 tabel dan 80–120 modul.

---

## Daftar Isi

- [Stack Teknologi](#stack-teknologi)
- [Struktur Monorepo](#struktur-monorepo)
- [Arsitektur Backend (Laravel)](#arsitektur-backend-laravel)
- [Arsitektur Frontend (Next.js)](#arsitektur-frontend-nextjs)
- [Arsitektur Database](#arsitektur-database)
- [Cara Menjalankan (Development)](#cara-menjalankan-development)
- [Roadmap](#roadmap)
- [Standar Pengembangan](#standar-pengembangan)
- [Lisensi](#lisensi)

---

## Stack Teknologi

| Layer | Teknologi |
|---|---|
| Backend | Laravel 12, PHP 8.4 |
| Frontend | Next.js 15, TypeScript, Tailwind CSS 4 |
| Database | PostgreSQL 16 |
| Cache / Queue | Redis 7 |
| Web Server | Nginx |
| State Management | TanStack Query + Zustand |
| UI Library | Internal `@erp/ui` |
| Testing (BE) | Pest PHP |
| Testing (FE) | Playwright |
| Linting (BE) | Laravel Pint (PSR-12) |
| Linting (FE) | ESLint + Prettier |

---

## Struktur Monorepo

```
smart-construction-erp/
├── backend/          # Laravel 12 — Clean Architecture + Modular
├── frontend/         # Next.js 15 — App Router + @erp/ui
├── docker/           # Nginx, PHP-FPM, PostgreSQL, Redis, Backup
├── storage/          # File storage (private & public)
├── backup/           # Database & storage backup
├── docs/             # API, database, UI, deployment docs
├── docker-compose.yml
├── Makefile
└── .env.example
```

---

## Arsitektur Backend (Laravel)

Laravel menggunakan **Clean Architecture + Modular Monolith**:

```
backend/app/
├── Actions/          # Single-purpose action classes
├── Enums/            # PHP enums
├── Http/             # Controllers, Middleware, Requests, Resources
├── Models/           # Eloquent base models
├── Modules/          # ← Inti sistem (setiap domain berdiri sendiri)
├── Repositories/     # Data access layer
├── Services/         # Business logic
└── Jobs/             # Queue jobs
```

### Modul yang tersedia

| Domain | Modul |
|---|---|
| Core | Auth, Dashboard, Notification, Setting, Master |
| Project | Project, Contract, Tender |
| Engineering | Drawing, Document |
| Operation | Progress, Material, Warehouse, Equipment, HumanResource |
| Quality & Safety | QC, HSE |
| Procurement | Purchase, Vendor |
| Finance | Finance, Invoice |
| Reporting | Report |

Setiap modul memiliki struktur mandiri:
```
Modules/Project/
├── Controllers/
├── Models/
├── Services/
├── Repository/
├── Policies/
├── Requests/
├── Resources/
├── Routes/
├── Events/
├── Jobs/
├── Notifications/
└── Database/{Migrations,Seeders}
```

---

## Arsitektur Frontend (Next.js)

```
frontend/src/
├── app/              # Next.js App Router (pages & layouts)
├── modules/          # Fitur per domain (dashboard, project, dst.)
├── components/       # Komponen UI reusable
├── hooks/            # Custom React hooks
├── services/         # API service layer
├── store/            # Zustand client state
├── types/            # TypeScript type definitions
└── lib/              # Utilities & helpers

frontend/packages/
├── ui/               # @erp/ui — Internal UI Design System
├── config/           # Shared config (ESLint, TypeScript, Tailwind)
├── types/            # Shared types
└── utils/            # Shared utilities
```

---

## Arsitektur Database

Database menggunakan **PostgreSQL 16** dengan desain modular mengikuti domain bisnis. Setiap modul memiliki tabel-tabelnya sendiri, namun terhubung melalui foreign key yang jelas.

### Prinsip Desain

- **Integer PK** (`bigint GENERATED ALWAYS AS IDENTITY`) untuk performa tinggi pada tabel transaksional
- **UUID PK** untuk tabel yang terekspos ke publik (auth, profil)
- **Soft Deletes** pada tabel utama (`deleted_at`) untuk audit trail
- **Audit Columns** (`created_by`, `updated_at`, `created_at`) di semua tabel
- **Indexing** pada foreign key dan kolom yang sering di-query
- **Row Level Security (RLS)** untuk isolasi data antar pengguna

### Skema Tabel

#### Phase 1 — Core System (9 tabel)

| Tabel | Deskripsi | Kolom Utama |
|---|---|---|
| `users` | Akun pengguna sistem | `id`, `name`, `email`, `password` |
| `profiles` | Data tambahan pengguna | `id` (FK→users), `full_name`, `phone`, `role`, `avatar_url` |
| `departments` | Master departemen | `id`, `code`, `name`, `head_name`, `is_active` |
| `positions` | Master jabatan | `id`, `code`, `name`, `department_id` (FK→departments) |
| `units` | Master satuan ukur | `id`, `code`, `name`, `is_active` |
| `material_categories` | Master kategori material | `id`, `code`, `name`, `is_active` |
| `projects` | Data proyek konstruksi | `id`, `code`, `name`, `client_name`, `status`, `contract_value`, `progress_percent`, `start_date`, `end_date` |
| `project_members` | Anggota tim proyek (M2M) | `id`, `project_id` (FK→projects), `user_id` (FK→profiles), `role` |
| `contracts` | Kontrak proyek | `id`, `project_id` (FK→projects), `contract_no`, `title`, `type`, `status`, `value`, `signed_date` |
| `attachments` | Lampiran file (polymorphic) | `id`, `reference_module`, `reference_id`, `file_name`, `file_path` |

#### Phase 2 — Sistem Operasional (11 tabel)

| Tabel | Deskripsi | Kolom Utama |
|---|---|---|
| `warehouses` | Master gudang | `id`, `code`, `name`, `location`, `pic_name`, `phone` |
| `materials` | Master material | `id`, `code`, `name`, `category_id` (FK→material_categories), `unit_id` (FK→units), `spec`, `brand`, `unit_price` |
| `material_stocks` | Stok material per gudang | `id`, `material_id` (FK→materials), `warehouse_id` (FK→warehouses), `quantity`, `min_quantity` |
| `stock_movements` | Mutasi stok (masuk/keluar/transfer) | `id`, `material_id`, `warehouse_id`, `project_id`, `movement_type`, `quantity`, `movement_date` |
| `progress_logs` | Log progress harian proyek | `id`, `project_id` (FK→projects), `log_date`, `progress_percent`, `description`, `weather`, `obstacles` |
| `equipment` | Master alat berat & peralatan | `id`, `code`, `name`, `type`, `brand`, `model`, `plate_number`, `status`, `purchase_price` |
| `equipment_rentals` | Sewa alat | `id`, `equipment_id` (FK→equipment), `project_id`, `vendor_name`, `start_date`, `end_date`, `daily_rate`, `total_cost` |
| `employees` | Data karyawan | `id`, `nik`, `full_name`, `position_id` (FK→positions), `department_id` (FK→departments), `phone`, `email`, `hire_date`, `status` |
| `employee_assignments` | Penugasan karyawan ke proyek | `id`, `employee_id` (FK→employees), `project_id` (FK→projects), `role`, `start_date`, `end_date` |
| `qc_inspections` | Inspeksi mutu | `id`, `project_id` (FK→projects), `inspection_date`, `inspector`, `inspection_type`, `result`, `findings`, `corrective_action`, `status` |
| `hse_incidents` | Insiden K3 | `id`, `project_id` (FK→projects), `incident_date`, `type`, `severity`, `location`, `description`, `root_cause`, `corrective_action`, `status`, `reported_by` |

### Enum Status

**Project Status:** `planning` → `running` → `completed` | `on_hold` | `cancelled`

**Contract Status:** `draft` → `signed` → `completed` | `terminated`

**Contract Type:** `main` | `subcontract` | `addendum` | `amendment`

**Equipment Status:** `available` | `in_use` | `maintenance` | `broken`

**Stock Movement Type:** `in` | `out` | `transfer`

**QC Result:** `pass` | `conditional` | `fail`

**HSE Incident Type:** `near_miss` | `accident` | `unsafe_act` | `unsafe_condition` | `environmental`

**HSE Severity:** `low` | `medium` | `high` | `critical`

**Employee Status:** `active` | `on_leave` | `resigned` | `terminated`

### Relasi Antar Tabel (ERD Singkat)

```
users (1) ──── (1) profiles
                    │
                    ├── (1) project_members (N) ──── (N) projects
                    │                                    │
                    │                                    ├── (N) contracts
                    │                                    ├── (N) progress_logs
                    │                                    ├── (N) qc_inspections
                    │                                    ├── (N) hse_incidents
                    │                                    ├── (N) stock_movements
                    │                                    ├── (N) equipment_rentals
                    │                                    └── (N) employee_assignments
                    │
departments (1) ──── (N) positions
       │
       └── (N) employees ──── (N) employee_assignments

warehouses (1) ──── (N) material_stocks ──── (N) materials
     │                      │
     └── (N) stock_movements
```

### Roadmap Ekspansi Database

| Phase | Tabel Tambahan (Estimasi) |
|---|---|
| Phase 3 | `vendors`, `purchase_requests`, `purchase_orders`, `invoices`, `payments`, `cashflows`, `journal_entries` |
| Phase 4 | `chat_rooms`, `chat_messages`, `notifications`, `vendor_portals` |
| Phase 5 | `ocr_results`, `ai_assistant_logs`, `digital_signatures`, `wa_messages` |

---

## Cara Menjalankan (Development)

### Prasyarat
- Docker Desktop
- Node.js 20+
- PHP 8.4 + Composer

### Setup Awal

```bash
# 1. Clone repo
git clone https://github.com/alumnisteman/PLN.git
cd PLN

# 2. Copy environment
cp .env.example .env

# 3. Isi nilai di .env (DB_PASSWORD, APP_KEY, dll.)

# 4. Jalankan semua service
make up

# 5. Install dependencies & migrasi
make install
make migrate-fresh
```

Akses:
- **Frontend**: http://localhost
- **API**: http://localhost/api/v1

---

## Roadmap

### Phase 1 — Core System ✅ Selesai

| Modul | Fitur | Status |
|---|---|---|
| **Auth** | Login, Register, Logout, Session Management | ✅ Done |
| **RBAC** | Role-based Access Control (admin, manager, staff) | ✅ Done |
| **Dashboard** | Statistik proyek, nilai kontrak, progress, status | ✅ Done |
| **Master Data** | Departemen, Jabatan, Satuan, Kategori Material | ✅ Done |
| **Project** | CRUD proyek, progress tracking, filter & search | ✅ Done |
| **Contract** | CRUD kontrak, relasi proyek, tipe & status | ✅ Done |
| **Database** | 9 tabel core + RLS policies + trigger auto-profile | ✅ Done |

### Phase 2 — Sistem Operasional ✅ Selesai

| Modul | Fitur | Status |
|---|---|---|
| **Progress** | Log progress harian, cuaca, kendala, volume pekerjaan | ✅ Done |
| **Material** | Master material, kategori, satuan, spesifikasi, harga | ✅ Done |
| **Warehouse** | Master gudang, mutasi stok (masuk/keluar/transfer), update stok otomatis | ✅ Done |
| **Equipment** | Master alat berat, sewa alat (vendor, rate harian, total biaya) | ✅ Done |
| **Human Resource** | Data karyawan (NIK, jabatan, departemen, status) | ✅ Done |
| **QC** | Inspeksi mutu, temuan, tindakan korektif, hasil (pass/conditional/fail) | ✅ Done |
| **HSE** | Insiden K3, tipe, tingkat keparahan, root cause, corrective action | ✅ Done |
| **Database** | 11 tabel operasional + RLS policies + indexes | ✅ Done |

### Phase 3 — Sistem Komersial 📋 Planned

| Modul | Fitur | Prioritas |
|---|---|---|
| **Purchase** | PR, PO, penerimaan barang | Tinggi |
| **Vendor** | Master vendor, evaluasi, kategori | Tinggi |
| **Invoice** | Invoice vendor, invoice ke klien | Tinggi |
| **Finance** | Jurnal umum, Buku besar, laporan keuangan | Tinggi |
| **Cashflow** | Arus kas, anggaran, forecast | Sedang |

### Phase 4 — Sistem Kolaborasi 📋 Planned

| Modul | Fitur | Prioritas |
|---|---|---|
| **Chat** | Ruang obrolan per proyek, direct message | Sedang |
| **Notification** | Notifikasi realtime, push notification | Tinggi |
| **Owner Portal** | Portal untuk owner melihat progress | Sedang |
| **Vendor Portal** | Portal vendor untuk PO & invoice | Sedang |
| **Approval** | Workflow approval multi-level | Tinggi |

### Phase 5 — Sistem Cerdas 📋 Planned

| Modul | Fitur | Prioritas |
|---|---|---|
| **OCR** | Ekstraksi data dari dokumen scan | Sedang |
| **AI Assistant** | Chatbot untuk query data & laporan | Rendah |
| **Digital Signature** | Tanda tangan digital terverifikasi | Tinggi |
| **WhatsApp Integration** | Notifikasi & laporan via WA | Sedang |
| **BI & Analytics** | Dashboard analitik, prediksi, insight | Sedang |

### Ringkasan Progress

```
Phase 1  ████████████████████ 100%  ✅ Selesai
Phase 2  ████████████████████ 100%  ✅ Selesai
Phase 3  ░░░░░░░░░░░░░░░░░░░░   0%  📋 Planned
Phase 4  ░░░░░░░░░░░░░░░░░░░░   0%  📋 Planned
Phase 5  ░░░░░░░░░░░░░░░░░░░░   0%  📋 Planned
```

---

## Standar Pengembangan

- **PHP**: PSR-12 + Laravel Pint
- **TypeScript**: ESLint + Prettier
- **Commit**: Conventional Commits (`feat:`, `fix:`, `refactor:`, `docs:`)
- **Branch**: `main`, `develop`, `feature/*`, `hotfix/*`
- **API**: Versioned `/api/v1/`, `/api/v2/` jika ada breaking change
- **UUID**: Integer PK untuk performa, UUID sebagai identitas publik di URL
- **Database**: RLS wajib di semua tabel, 4 policy per tabel (SELECT, INSERT, UPDATE, DELETE)
- **Naming**: `snake_case` untuk tabel & kolom, `PascalCase` untuk model & class

---

## Lisensi

Proprietary — Internal use only.
