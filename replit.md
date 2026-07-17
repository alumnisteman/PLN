# Smart Construction ERP

ERP enterprise untuk perusahaan kontraktor utilitas (PLN, Telkom, PUPR, Pertamina, dll).

## Stack

- **Backend**: Laravel 12, PHP 8.4, Clean Architecture + Modular Monolith
- **Frontend**: Next.js 15, TypeScript, Tailwind CSS 4
- **Database**: PostgreSQL 16
- **Cache/Queue**: Redis 7
- **Web Server**: Nginx

## Menjalankan di Replit (development)

Replit tidak mendukung Docker secara native, sehingga untuk pengembangan di Replit:

### Backend (Laravel)

```bash
cd backend
php artisan serve --host=0.0.0.0 --port=8000
```

### Frontend (Next.js)

```bash
cd frontend
npm run dev
```

### Untuk production/full stack: gunakan Docker Compose

```bash
make up
```

## Struktur Monorepo

```
smart-construction-erp/
├── backend/          # Laravel 12 API
├── frontend/         # Next.js 15
├── docker/           # Docker configs
├── storage/          # File storage
├── backup/           # Backup storage
├── docs/             # Dokumentasi
├── docker-compose.yml
├── Makefile
└── .env.example
```

## Roadmap

- **Phase 1** (Current): Core System — Login, RBAC, Dashboard, Master, Project
- **Phase 2**: Operasional — Progress, Material, Gudang, QC, HSE
- **Phase 3**: Komersial — Purchase, Vendor, Invoice, Finance
- **Phase 4**: Kolaborasi — Chat, Notifikasi Realtime, Portal
- **Phase 5**: Smart Features — OCR, AI, Digital Signature

## User Preferences

- Bahasa komunikasi: **Indonesia**
- Push ke GitHub **setiap phase/fitur selesai** (jangan tunggu semuanya kelar)
- Arsitektur: **Modular Monolith** — setiap domain berdiri sendiri di `Modules/`
- Commit convention: **Conventional Commits** (`feat:`, `fix:`, `refactor:`, `docs:`)
- Branch strategy: `main` (production), `develop` (staging), `feature/*`, `hotfix/*`
- PHP standard: **PSR-12 + Laravel Pint**
- TypeScript standard: **ESLint + Prettier**
- State management: **TanStack Query** (server state) + **Zustand** (client state)
- UI: Internal library **@erp/ui** — semua komponen lewat sini
- Database: Integer PK untuk performa, UUID untuk URL publik
- API: Versioned `/api/v1/`
