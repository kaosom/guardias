/**
 * Servicio de usuarios (alumnos). Tabla users. Matrícula y nombre.
 */

import { getDb } from "@/database"

export interface UserRow {
  id: number
  matricula: string
  full_name: string
  email: string | null
  created_at: Date
  updated_at: Date
}

/**
 * Busca un alumno por matrícula.
 */
export async function findByMatricula(matricula: string): Promise<UserRow | null> {
  const db = getDb()
  const digits = matricula.replace(/\D/g, "").slice(0, 12)
  const [rows] = await db.execute<UserRow[]>(
    "SELECT id, matricula, full_name, email, created_at, updated_at FROM users WHERE matricula = ? LIMIT 1",
    [digits]
  )
  const row = Array.isArray(rows) ? rows[0] : null
  return row ?? null
}

/**
 * Obtiene o crea un alumno por matrícula y nombre. Usado al crear/actualizar vehículos.
 */
export async function findOrCreateByMatriculaAndName(matricula: string, fullName: string): Promise<UserRow> {
  const db = getDb()
  const digits = matricula.replace(/\D/g, "").slice(0, 12)
  const name = fullName.trim() || "Sin nombre"
  const existing = await findByMatricula(digits)
  if (existing) {
    return existing
  }
  await db.execute(
    "INSERT INTO users (matricula, full_name) VALUES (?, ?)",
    [digits, name]
  )
  const [rows] = await db.execute<{ id: number }[]>("SELECT LAST_INSERT_ID() AS id")
  const id = Array.isArray(rows) && rows[0] ? Number(rows[0].id) : 0
  return { id, matricula: digits, full_name: name, email: null, created_at: new Date(), updated_at: new Date() }
}

/**
 * Obtiene un alumno por id.
 */
export async function getById(id: number): Promise<UserRow | null> {
  const db = getDb()
  const [rows] = await db.execute<UserRow[]>(
    "SELECT id, matricula, full_name, email, created_at, updated_at FROM users WHERE id = ? LIMIT 1",
    [id]
  )
  const row = Array.isArray(rows) ? rows[0] : null
  return row ?? null
}
