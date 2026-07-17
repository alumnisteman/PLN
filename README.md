# Smart Construction ERP

ERP (Enterprise Resource Planning) khusus untuk perusahaan kontraktor utilitas — PLN, Telkom, PUPR, Pertamina, dan proyek infrastruktur lainnya.

Dibangun dengan **Laravel 12** (backend API) + **Next.js 15** (frontend), menggunakan arsitektur modular enterprise yang siap berkembang hingga 250–350 tabel dan 80–120 modul.

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

| Phase | Fokus | Status |
|---|---|---|
| **Phase 1** | Core System: Login, RBAC, Dashboard, Master, Project, Kontrak | 🚧 In Progress |
| **Phase 2** | Operasional: Progress, Material, Gudang, Peralatan, SDM, QC, HSE | 📋 Planned |
| **Phase 3** | Komersial: Purchase, Vendor, Invoice, Finance, Cashflow | 📋 Planned |
| **Phase 4** | Kolaborasi: Chat, Notifikasi Realtime, Portal Owner & Vendor | 📋 Planned |
| **Phase 5** | Smart: OCR, AI Assistant, Digital Signature, Integrasi WA | 📋 Planned |

---

## Standar Pengembangan

- **PHP**: PSR-12 + Laravel Pint
- **TypeScript**: ESLint + Prettier
- **Commit**: Conventional Commits (`feat:`, `fix:`, `refactor:`, `docs:`)
- **Branch**: `main`, `develop`, `feature/*`, `hotfix/*`
- **API**: Versioned `/api/v1/`, `/api/v2/` jika ada breaking change
- **UUID**: Integer PK untuk performa, UUID sebagai identitas publik di URL

---

## Lisensi

Proprietary — Internal use only.
