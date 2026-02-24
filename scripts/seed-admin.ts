/**
 * Crea el usuario administrador inicial: admin@buap.com
 * La contraseña en claro se imprime al final en consola (no se guarda en ningún archivo).
 * Ejecutar desde la raíz del proyecto: cd app && npm run seed-admin
 * Requiere: app/.env.local con MYSQL_*; tabla guards ya creada (schema.sql).
 */

import { createPool } from "mysql2/promise"
import bcrypt from "bcrypt"
import { readFileSync, existsSync } from "fs"
import { resolve } from "path"

const ROOT = resolve(__dirname, "../app")
const ENV_PATH = resolve(ROOT, ".env.local")
const ENV_ALT = resolve(ROOT, ".env")

function loadEnv() {
  const path = existsSync(ENV_PATH) ? ENV_PATH : existsSync(ENV_ALT) ? ENV_ALT : null
  if (!path) {
    console.error("No se encontró .env.local ni .env en app/. Crea uno con MYSQL_*.")
    process.exit(1)
  }
  const content = readFileSync(path, "utf-8")
  for (const line of content.split("\n")) {
    const m = line.match(/^\s*([A-Z_][A-Z0-9_]*)\s*=\s*(.*)$/)
    if (m) {
      const key = m[1]
      const val = m[2].replace(/^["']|["']$/g, "").trim()
      if (!(key in process.env)) process.env[key] = val
    }
  }
}

const ADMIN_EMAIL = "admin-guardias@buap.mx"
const ADMIN_NAME = "Administrador"
const PLAIN_PASSWORD = "eSC5R61r767Ac7nHMr"

async function main() {
  loadEnv()
  const host = process.env.MYSQL_HOST ?? "localhost"
  const port = Number(process.env.MYSQL_PORT) || 3306
  const user = process.env.MYSQL_USER ?? "root"
  const password = process.env.MYSQL_PASSWORD ?? ""
  const database = process.env.MYSQL_DATABASE ?? "guardias"

  const pool = createPool({ host, port, user, password, database, charset: "utf8mb4" })

  const passwordHash = await bcrypt.hash(PLAIN_PASSWORD, 10)

  try {
    await pool.execute(
      `INSERT INTO guards (email, password_hash, role, full_name, gate) VALUES (?, ?, 'admin', ?, NULL)
       ON DUPLICATE KEY UPDATE password_hash = VALUES(password_hash), full_name = VALUES(full_name)`,
      [ADMIN_EMAIL, passwordHash, ADMIN_NAME]
    )
    console.log("Admin creado o actualizado en guards: " + ADMIN_EMAIL)
    console.log("---")
    console.log("Contraseña del admin (guárdala y cámbiala después si quieres): " + PLAIN_PASSWORD)
    console.log("---")
  } catch (e) {
    console.error("Error:", e)
    process.exit(1)
  } finally {
    await pool.end()
  }
}

main()
