/**
 * Servicio de guardias (y administradores). Tabla guards. Búsqueda por email y creación.
 */

import { getDb } from "@/database"

export type UserRole = "admin" | "guard"

export interface GuardRow {
  id: number
  email: string
  password_hash: string
  role: UserRole
  full_name: string
  gate: number | null
  location_name: string | null
  created_at: Date
  updated_at: Date
}

export interface UserSession {
  id: number
  email: string
  role: UserRole
  fullName: string
  gate?: number | null
  locationName?: string | null
}

/**
 * Busca un guardia por email. Devuelve null si no existe.
 */
export async function findByEmail(email: string): Promise<GuardRow | null> {
  const db = getDb()
  const [rows] = await db.execute<GuardRow[]>(
    "SELECT id, email, password_hash, role, full_name, gate, location_name, created_at, updated_at FROM guards WHERE email = ? LIMIT 1",
    [email.trim().toLowerCase()]
  )
  const row = Array.isArray(rows) ? rows[0] : null
  return row ?? null
}

/**
 * Crea un guardia. El password debe llegar en claro; se hasheará aquí.
 * gate: número de puerta 1-15.
 * locationName: nombre del plantel (nullable).
 */
export async function createGuard(data: {
  email: string
  password: string
  fullName: string
  gate: number
  locationName?: string | null
}, hashPassword: (plain: string) => Promise<string>): Promise<UserSession> {
  const db = getDb()
  const email = data.email.trim().toLowerCase()
  const passwordHash = await hashPassword(data.password)
  const gate = Math.min(15, Math.max(1, data.gate))
  const locationName =
    typeof data.locationName === "string" && data.locationName.trim() !== ""
      ? data.locationName.trim()
      : null
  await db.execute(
    "INSERT INTO guards (email, password_hash, role, full_name, gate, location_name) VALUES (?, ?, 'guard', ?, ?, ?)",
    [email, passwordHash, data.fullName.trim(), gate, locationName]
  )
  const [rows] = await db.execute<{ id: number }[]>("SELECT LAST_INSERT_ID() AS id")
  const id = Array.isArray(rows) && rows[0] ? Number(rows[0].id) : 0
  return { id, email, role: "guard", fullName: data.fullName.trim(), gate, locationName }
}

/**
 * Lista todos los guardias (role = 'guard').
 * Incluye información básica del plantel si existe.
 */
export async function listGuards(): Promise<UserSession[]> {
  const db = getDb()
  const [rows] = await db.execute<
    {
      id: number
      email: string
      full_name: string
      gate: number | null
      location_name: string | null
    }[]
  >(
    "SELECT id, email, full_name, gate, location_name FROM guards WHERE role = 'guard' ORDER BY full_name"
  )
  const list = Array.isArray(rows) ? rows : []
  return list.map((r) => ({
    id: r.id,
    email: r.email,
    role: "guard" as const,
    fullName: r.full_name,
    gate: r.gate ?? undefined,
    locationName: r.location_name,
  }))
}

/**
 * Obtiene un guardia por id (no exponer hash).
 */
export async function getById(id: number): Promise<UserSession | null> {
  const db = getDb()
  const [rows] = await db.execute<
    {
      id: number
      email: string
      role: string
      full_name: string
      gate: number | null
      location_name: string | null
    }[]
  >("SELECT id, email, role, full_name, gate, location_name FROM guards WHERE id = ? LIMIT 1", [id])
  const row = Array.isArray(rows) ? rows[0] : null
  if (!row) return null
  return {
    id: row.id,
    email: row.email,
    role: row.role as UserRole,
    fullName: row.full_name,
    gate: row.gate ?? undefined,
    locationName: row.location_name ?? undefined,
  }
}

/**
 * Actualiza los datos de un guardia (solo role = 'guard').
 * Permite cambiar correo, nombre, puerta y plantel.
 */
export async function updateGuard(data: {
  id: number
  email: string
  fullName: string
  gate: number
  locationName?: string | null
}): Promise<UserSession | null> {
  const db = getDb()
  const email = data.email.trim().toLowerCase()
  const gate = Math.min(15, Math.max(1, data.gate))
  const locationName =
    typeof data.locationName === "string" && data.locationName.trim() !== ""
      ? data.locationName.trim()
      : null

  const [result] = await db.execute<{ affectedRows: number }>(
    "UPDATE guards SET email = ?, full_name = ?, gate = ?, location_name = ? WHERE id = ? AND role = 'guard'",
    [email, data.fullName.trim(), gate, locationName, data.id]
  )
  const affected = Array.isArray(result) ? result[0] : result
  if (!affected || affected.affectedRows !== 1) return null

  return { id: data.id, email, role: "guard", fullName: data.fullName.trim(), gate, locationName }
}

/**
 * Elimina un guardia. Solo role = 'guard'.
 */
export async function deleteGuard(id: number): Promise<boolean> {
  const db = getDb()
  const [result] = await db.execute<{ affectedRows: number }>(
    "DELETE FROM guards WHERE id = ? AND role = 'guard'",
    [id]
  )
  const affected = Array.isArray(result) ? result[0] : result
  return affected?.affectedRows === 1
}

/**
 * Cuenta de admins.
 */
export async function countAdmins(): Promise<number> {
  const db = getDb()
  const [rows] = await db.execute<{ n: number }[]>("SELECT COUNT(*) AS n FROM guards WHERE role = 'admin'")
  const r = Array.isArray(rows) ? rows[0] : null
  return r ? Number(r.n) : 0
}
