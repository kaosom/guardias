#!/usr/bin/env bash
# =============================================================================
# Crea el usuario admin (admin@buap.com). La contraseña se imprime en consola.
# Ejecutar desde la raíz del proyecto: ./scripts/seed-admin.sh
# Requiere: app/.env.local con MYSQL_*; tabla users ya creada (schema.sql).
# =============================================================================

set -e
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
APP_DIR="$ROOT_DIR/app"

cd "$APP_DIR"
npm run seed-admin
