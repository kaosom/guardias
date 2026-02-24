#!/usr/bin/env bash
# =============================================================================
# Deploy del proyecto guardias por SSH.
# Configura la conexión con variables de entorno o con un archivo deploy.conf.
#
# Variables de entorno (recomendado):
#   DEPLOY_HOST    - host o IP del servidor (ej. guardias.universidad.edu)
#   DEPLOY_USER    - usuario SSH (ej. deploy o ubuntu)
#   DEPLOY_KEY     - ruta a la clave privada SSH (ej. ~/.ssh/guardias_rsa)
#   DEPLOY_APP_DIR - ruta en el servidor donde está la app (ej. /var/www/guardias)
#
# Alternativa: crear scripts/deploy.conf con:
#   DEPLOY_HOST=...
#   DEPLOY_USER=...
#   DEPLOY_KEY=...
#   DEPLOY_APP_DIR=...
#
# Uso: ./scripts/deploy.sh
# =============================================================================

set -e
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
APP_DIR="$ROOT_DIR/app"

# Cargar config si existe
if [ -f "$SCRIPT_DIR/deploy.conf" ]; then
  set -a
  source "$SCRIPT_DIR/deploy.conf"
  set +a
fi

for var in DEPLOY_HOST DEPLOY_USER DEPLOY_APP_DIR; do
  if [ -z "${!var}" ]; then
    echo "Error: falta $var. Definelo en el entorno o en scripts/deploy.conf"
    exit 1
  fi
done

KEY_OPT=()
if [ -n "${DEPLOY_KEY:-}" ] && [ -f "${DEPLOY_KEY/\~/$HOME}" ]; then
  KEY_OPT=(-i "${DEPLOY_KEY/\~/$HOME}")
fi

SSH_OPTS=("${KEY_OPT[@]}" -o StrictHostKeyChecking=accept-new -o ConnectTimeout=10)
SSH_CMD=(ssh "${SSH_OPTS[@]}" "${DEPLOY_USER}@${DEPLOY_HOST}")
RSYNC_OPTS=(-avz --delete -e "ssh ${KEY_OPT[*]} -o StrictHostKeyChecking=accept-new")

echo "[deploy] Conectando a ${DEPLOY_USER}@${DEPLOY_HOST}..."

# Crear directorio remoto si no existe
"${SSH_CMD[@]}" "mkdir -p $DEPLOY_APP_DIR"

# Subir código (app, api, database, scripts); excluir node_modules y .next
echo "[deploy] Subiendo código..."
rsync "${RSYNC_OPTS[@]}" \
  --exclude 'app/node_modules' \
  --exclude 'app/.next' \
  --exclude 'app/.env' \
  --exclude 'app/.env.local' \
  --exclude '.git' \
  "$ROOT_DIR/" "${DEPLOY_USER}@${DEPLOY_HOST}:${DEPLOY_APP_DIR}/"

# En el servidor: install, build, schema, reiniciar app
echo "[deploy] Instalando dependencias, construyendo y aplicando esquema..."
"${SSH_CMD[@]}" "cd $DEPLOY_APP_DIR/app && npm ci && npm run build"

# Esquema MySQL: en el servidor ejecuta a mano una vez (con .env configurado):
#   cd $DEPLOY_APP_DIR && source app/.env && mysql -h $MYSQL_HOST -u $MYSQL_USER -p$MYSQL_PASSWORD -e "CREATE DATABASE IF NOT EXISTS \`$MYSQL_DATABASE\`;" && mysql -h $MYSQL_HOST -u $MYSQL_USER -p$MYSQL_PASSWORD $MYSQL_DATABASE < database/schema.sql

# Reiniciar app: pm2 si existe, si no matar proceso anterior y arrancar con nohup
"${SSH_CMD[@]}" "cd $DEPLOY_APP_DIR/app && if command -v pm2 &>/dev/null; then pm2 delete guardias 2>/dev/null; pm2 start npm --name guardias -- start; pm2 save 2>/dev/null; else (pkill -f 'node.*next' 2>/dev/null || true); sleep 1; nohup npm run start > /tmp/guardias.log 2>&1 & disown; fi"
echo "[deploy] Listo. App en $DEPLOY_APP_DIR/app. Proxy (Caddy/nginx) debe apuntar a localhost:3000."
