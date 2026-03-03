#!/usr/bin/env bash
# =============================================================================
# Crea la base de datos guardias y aplica el esquema (schema.sql).
# Ejecutar desde la raíz del proyecto: ./scripts/setup-db.sh
# Requiere: MySQL en marcha y variables en app/.env.local o app/.env
# =============================================================================

set -e
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
APP_DIR="$ROOT_DIR/app"

if [ -f "$APP_DIR/.env.local" ]; then
  set -a
  source "$APP_DIR/.env.local"
  set +a
elif [ -f "$APP_DIR/.env" ]; then
  set -a
  source "$APP_DIR/.env"
  set +a
else
  echo "Error: crea app/.env.local (puedes copiar app/.env.example) con MYSQL_HOST, MYSQL_USER, MYSQL_PASSWORD, MYSQL_DATABASE."
  exit 1
fi

MYSQL_HOST="${MYSQL_HOST:-localhost}"
MYSQL_PORT="${MYSQL_PORT:-3306}"
MYSQL_USER="${MYSQL_USER:-root}"
MYSQL_PASSWORD="${MYSQL_PASSWORD:-}"
MYSQL_DATABASE="${MYSQL_DATABASE:-guardias}"

MYSQL_CMD=(mysql -h "$MYSQL_HOST" -P "$MYSQL_PORT" -u "$MYSQL_USER")
[ -n "$MYSQL_PASSWORD" ] && MYSQL_CMD+=(-p"$MYSQL_PASSWORD")

echo "[setup-db] Creando base de datos '$MYSQL_DATABASE' si no existe..."
"${MYSQL_CMD[@]}" -e "CREATE DATABASE IF NOT EXISTS \`$MYSQL_DATABASE\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

echo "[setup-db] Aplicando schema.sql..."
"${MYSQL_CMD[@]}" "$MYSQL_DATABASE" < "$ROOT_DIR/database/schema.sql"

MIGRATIONS_DIR="$ROOT_DIR/database/migrations"
if [ -d "$MIGRATIONS_DIR" ]; then
  for f in 003_rename_users_to_guards_and_add_users_table.sql 004_vehicles_user_id.sql 005_drop_users_old.sql; do
    if [ -f "$MIGRATIONS_DIR/$f" ]; then
      echo "[setup-db] Aplicando migración $f..."
      "${MYSQL_CMD[@]}" "$MYSQL_DATABASE" < "$MIGRATIONS_DIR/$f" || true
    fi
  done
fi

echo "[setup-db] Listo. Base '$MYSQL_DATABASE' creada; tablas (users, vehicles, helmets, guards, movements) listas."
