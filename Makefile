# ─────────────────────────────────────────────────────────────────
#  Smart Construction ERP — Makefile
#  Usage: make <target>
# ─────────────────────────────────────────────────────────────────

.PHONY: help up down restart build logs shell-php shell-frontend \
        migrate migrate-fresh seed test-backend test-frontend \
        lint-backend lint-frontend push-branch

# Default target
help:
	@echo ""
	@echo "  Smart Construction ERP — Available Commands"
	@echo " ──────────────────────────────────────────────"
	@echo "  make up              - Start semua container"
	@echo "  make down            - Stop semua container"
	@echo "  make restart         - Restart semua container"
	@echo "  make build           - Build ulang semua image"
	@echo "  make logs            - Lihat logs semua service"
	@echo "  make shell-php       - Masuk ke container PHP"
	@echo "  make shell-frontend  - Masuk ke container frontend"
	@echo "  make migrate         - Jalankan database migration"
	@echo "  make migrate-fresh   - Fresh migration + seed"
	@echo "  make seed            - Jalankan seeders"
	@echo "  make test-backend    - Jalankan Pest tests"
	@echo "  make test-frontend   - Jalankan Playwright tests"
	@echo "  make lint-backend    - Laravel Pint (PHP linter)"
	@echo "  make lint-frontend   - ESLint + Prettier"
	@echo ""

# ─── Docker ───────────────────────────────────────────────────────
up:
	docker compose up -d

down:
	docker compose down

restart:
	docker compose restart

build:
	docker compose build --no-cache

logs:
	docker compose logs -f

logs-php:
	docker compose logs -f php

logs-frontend:
	docker compose logs -f frontend

# ─── Shell ────────────────────────────────────────────────────────
shell-php:
	docker compose exec php sh

shell-frontend:
	docker compose exec frontend sh

shell-postgres:
	docker compose exec postgres psql -U $${DB_USERNAME:-erp_user} -d $${DB_DATABASE:-erp_db}

# ─── Laravel ──────────────────────────────────────────────────────
migrate:
	docker compose exec php php artisan migrate

migrate-fresh:
	docker compose exec php php artisan migrate:fresh --seed

seed:
	docker compose exec php php artisan db:seed

cache-clear:
	docker compose exec php php artisan cache:clear
	docker compose exec php php artisan config:clear
	docker compose exec php php artisan route:clear
	docker compose exec php php artisan view:clear

optimize:
	docker compose exec php php artisan config:cache
	docker compose exec php php artisan route:cache
	docker compose exec php php artisan view:cache

queue-work:
	docker compose exec php php artisan queue:work

# ─── Testing ──────────────────────────────────────────────────────
test-backend:
	docker compose exec php ./vendor/bin/pest

test-frontend:
	cd frontend && npx playwright test

# ─── Linting ──────────────────────────────────────────────────────
lint-backend:
	docker compose exec php ./vendor/bin/pint

lint-frontend:
	cd frontend && npm run lint

# ─── Install ──────────────────────────────────────────────────────
install:
	docker compose exec php composer install
	cd frontend && npm install

# ─── Backup ───────────────────────────────────────────────────────
backup:
	docker compose exec backup sh /backup.sh
