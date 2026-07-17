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

Database menggunakan **PostgreSQL 16** dengan desain modular mengikuti domain bisnis. Setiap modul memiliki tabel-tabelenya sendiri, namun terhubung melalui foreign key yang jelas.

### Prinsip Desain

- **Integer PK** (`bigint GENERATED ALWAYS AS IDENTITY`) untuk performa tinggi pada tabel transaksional
- **UUID PK** untuk tabel yang terekspos ke publik (auth, profil)
- **Soft Deletes** pada tabel utama (`deleted_at`) untuk audit trail
- **Audit Columns** (`created_by`, `updated_at`, `created_at`) di semua tabel
- **Indexing** pada foreign key dan kolom yang sering di-query
- **Row Level Security (RLS)** untuk isolasi data antar pengguna

### Skema Tabel (Phase 1 — Core System)

#### Core & Auth

| Tabel | Deskripsi | Kolom Utama |
|---|---|---|
| `users` | Akun pengguna sistem | `id`, `name`, `email`, `password` |
| `profiles` | Data tambahan pengguna | `id` (FK→users), `full_name`, `phone`, `role`, `avatar_url` |
| `departments` | Master departemen | `id`, `code`, `name`, `head_name`, `is_active` |
| `positions` | Master jabatan | `id`, `code`, `name`, `department_id` (FK→departments) |
| `units` | Master satuan ukur | `id`, `code`, `name`, `is_active` |
| `material_categories` | Master kategori material | `id`, `code`, `name`, `is_active` |

#### Project & Contract

| Tabel | Deskripsi | Kolom Utama |
|---|---|---|
| `projects` | Data proyek konstruksi | `id`, `code`, `name`, `client_name`, `status`, `contract_value`, `progress_percent`, `start_date`, `end_date` |
| `project_members` | Anggota tim proyek (M2M) | `id`, `project_id` (FK→projects), `user_id` (FK→profiles), `role` |
| `contracts` | Kontrak proyek | `id`, `project_id` (FK→projects), `contract_no`, `title`, `type`, `status`, `value`, `signed_date` |
| `attachments` | Lampiran file (polymorphic) | `id`, `reference_module`, `reference_id`, `file_name`, `file_path` |

### Enum Status

**Project Status:** `planning` → `running` → `completed` | `on_hold` | `cancelled`

**Contract Status:** `draft` → `signed` → `completed` | `terminated`

**Contract Type:** `main` | `subcontract` | `addendum` | `amendment`

### Relasi Antar Tabel (ERD Singkat)

```
users (1) ──── (1) profiles
                    │
                    ├── (1) project_members (N) ──── (N) projects
                    │                                    │
                    │                                    ├── (N) contracts
                    │                                    └── (N) attachments
                    │
departments (1) ──── (N) positions
```

### Roadmap Ekspansi Database

| Phase | Tabel Tambahan (Estimasi) |
|---|---|
| Phase 2 | `progress_logs`, `materials`, `material_stocks`, `warehouses`, `equipment`, `equipment_rentals`, `employees`, `qc_inspections`, `hse_incidents` |
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

### Phase 2 — Sistem Operasional 📋 Planned

| Modul | Fitur | Prioritas |
|---|---|---|
| **Progress** | Log progress harian, milestone, kurva S | Tinggi |
| **Material** | Master material, stok, permintaan material | Tinggi |
| **Warehouse** | Mutasi stok, opname, transfer gudang | Tinggi |
| **Equipment** | Master alat, sewa, jadwal pemeliharaan | Sedang |
| **Human Resource** | Data karyawan, absensi, penugasan | Sedang |
| **QC** | Inspeksi mutu, temuan, tindak lanjut | Sedang |
| **HSE** | Insiden K3, investigasi, laporan | Sedang |

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
Phase 2  ░░░░░░░░░░░░░░░░░░░░   0%  📋 Planned
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
