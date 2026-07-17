#!/bin/bash
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backup/database"

mkdir -p "$BACKUP_DIR"

PGPASSWORD="$DB_PASSWORD" pg_dump \
  -h "$DB_HOST" \
  -U "$DB_USERNAME" \
  -d "$DB_DATABASE" \
  --no-owner \
  --no-acl \
  -Fc \
  -f "$BACKUP_DIR/backup_$TIMESTAMP.dump"

# Keep only last 30 days
find "$BACKUP_DIR" -name "*.dump" -mtime +30 -delete
echo "Backup selesai: backup_$TIMESTAMP.dump"
