#!/usr/bin/env bash
# =============================================================================
# Ejecuta en local: MySQL, aplica esquema, arranca Express (API :3001) y
# Next.js (frontend :3000) en paralelo.
# Uso: ./scripts/run-local.sh
# =============================================================================

set -e
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
APP_DIR="$ROOT_DIR/app"
API_DIR="$ROOT_DIR/api"

cd "$ROOT_DIR"

echo "[guardias] Directorio raíz: $ROOT_DIR"

# Cargar variables de entorno desde api/.env (tiene MYSQL_* y JWT_SECRET)
if [ -f "$API_DIR/.env" ]; then
  set -a
  source "$API_DIR/.env"
  set +a
  echo "[guardias] Variables cargadas desde api/.env"
elif [ -f "$APP_DIR/.env.local" ]; then
  set -a
  source "$APP_DIR/.env.local"
  set +a
  echo "[guardias] Variables cargadas desde app/.env.local"
else
  echo "[guardias] Aviso: no hay api/.env ni app/.env.local."
fi

# Intentar arrancar MySQL si está instalado (macOS Homebrew o Linux systemd)
start_mysql() {
  if command -v brew &>/dev/null && brew services list 2>/dev/null | grep -q mysql; then
    echo "[guardias] Iniciando MySQL (Homebrew)..."
    brew services start mysql 2>/dev/null || true
    sleep 2
    return 0
  fi
  if command -v systemctl &>/dev/null && systemctl is-enabled mysql &>/dev/null 2>&1; then
    echo "[guardias] Iniciando MySQL (systemd)..."
    sudo systemctl start mysql 2>/dev/null || true
    sleep 2
    return 0
  fi
  return 1
}

if ! start_mysql; then
  echo "[guardias] MySQL no se pudo iniciar desde este script. Asegúrate de que MySQL esté corriendo."
fi

# Aplicar esquema si tenemos mysql y variables
if command -v mysql &>/dev/null && [ -n "${MYSQL_DATABASE:-}" ]; then
  echo "[guardias] Aplicando esquema a la base de datos..."
  mysql -h "${MYSQL_HOST:-localhost}" -P "${MYSQL_PORT:-3306}" -u "${MYSQL_USER:-root}" ${MYSQL_PASSWORD:+-p"$MYSQL_PASSWORD"} -e "CREATE DATABASE IF NOT EXISTS \`$MYSQL_DATABASE\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;" 2>/dev/null || true
  mysql -h "${MYSQL_HOST:-localhost}" -P "${MYSQL_PORT:-3306}" -u "${MYSQL_USER:-root}" ${MYSQL_PASSWORD:+-p"$MYSQL_PASSWORD"} "$MYSQL_DATABASE" < "$ROOT_DIR/database/schema.sql" 2>/dev/null || echo "[guardias] Aviso: no se pudo aplicar schema.sql."
  for f in "$ROOT_DIR/database/migrations"/003_rename_users_to_guards_and_add_users_table.sql "$ROOT_DIR/database/migrations"/004_vehicles_user_id.sql "$ROOT_DIR/database/migrations"/005_drop_users_old.sql; do
    [ -f "$f" ] && mysql -h "${MYSQL_HOST:-localhost}" -P "${MYSQL_PORT:-3306}" -u "${MYSQL_USER:-root}" ${MYSQL_PASSWORD:+-p"$MYSQL_PASSWORD"} "$MYSQL_DATABASE" < "$f" 2>/dev/null || true
  done
fi

# Instalar dependencias si hace falta
if [ ! -d "$API_DIR/node_modules" ]; then
  echo "[guardias] Instalando dependencias en api/..."
  (cd "$API_DIR" && npm install)
fi
if [ ! -d "$APP_DIR/node_modules" ]; then
  echo "[guardias] Instalando dependencias en app/..."
  (cd "$APP_DIR" && npm install)
fi

# Crear carpeta de uploads si no existe
mkdir -p "$ROOT_DIR/private-uploads/vehicles"

# Función de limpieza al salir (Ctrl+C)
cleanup() {
  echo ""
  echo "[guardias] Deteniendo servidores..."
  kill "$API_PID" "$APP_PID" 2>/dev/null || true
  exit 0
}
trap cleanup SIGINT SIGTERM

# Arrancar servidor Express (API)
echo "[guardias] Arrancando servidor Express (API) en api/ → http://localhost:3001 ..."
(cd "$API_DIR" && NODE_PATH=./node_modules node_modules/.bin/tsx watch server.ts) &
API_PID=$!

sleep 2  # Dar tiempo al API para iniciar antes del frontend

# Arrancar servidor Next.js (frontend) — PORT=3000 para no heredar PORT=3001 de api/.env
echo "[guardias] Arrancando servidor Next.js (frontend) en app/ → https://localhost:3000 ..."
(cd "$APP_DIR" && PORT=3000 npm run dev) &
APP_PID=$!

echo "[guardias] ✅ Ambos servidores en marcha. Ctrl+C para detener."
wait
