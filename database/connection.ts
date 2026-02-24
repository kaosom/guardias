/**
 * Conexión a MySQL para el sistema de guardias.
 * Usa variables de entorno: MYSQL_HOST, MYSQL_USER, MYSQL_PASSWORD, MYSQL_DATABASE, MYSQL_PORT (opcional).
 */

import { createPool, type Pool, type PoolConnection } from "mysql2/promise"

let pool: Pool | null = null

/**
 * Crea el pool de conexiones si aún no existe.
 * Las variables de entorno deben estar definidas (ej. en .env.local o en el servidor).
 */
function getPool(): Pool {
  if (!pool) {
    const host = process.env.MYSQL_HOST ?? "localhost"
    const user = process.env.MYSQL_USER ?? "root"
    const password = process.env.MYSQL_PASSWORD ?? ""
    const database = process.env.MYSQL_DATABASE ?? "guardias"
    const port = Number(process.env.MYSQL_PORT) || 3306

    pool = createPool({
      host,
      port,
      user,
      password,
      database,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      charset: "utf8mb4",
    })
  }
  return pool
}

/**
 * Obtiene una conexión del pool para ejecutar consultas.
 * Recuerda hacer release de la conexión cuando termines (o usar execute con pool directamente).
 */
export async function getConnection(): Promise<PoolConnection> {
  return getPool().getConnection()
}

/**
 * Pool para usar en consultas directas (query, execute) sin getConnection.
 * Útil cuando no necesitas transacciones y quieres que el pool gestione la conexión.
 */
export function getDb(): Pool {
  return getPool()
}
