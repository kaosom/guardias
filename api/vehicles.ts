/**
 * Servicio de vehículos: CRUD y búsqueda por placa o matrícula.
 * vehicles.user_id -> users (alumnos). studentId/studentName se obtienen por JOIN.
 */

import { getDb } from "@/database"
import { findOrCreateByMatriculaAndName, findByMatricula } from "./users"
import type { VehicleRecord, VehicleType } from "@/lib/types"

/** Vehículo con id para uso en API (crear, actualizar, eliminar). */
export type VehicleRecordWithId = VehicleRecord & { id: number }

// Fila de vehicles con datos del alumno (JOIN users)
interface VehicleRowWithUser {
  id: number
  user_id: number
  plate: string
  vehicle_type: VehicleType
  has_helmet: number
  helmet_count: number
  vehicle_description: string | null
  vehicle_photo_path: string | null
  status: "inside" | "outside"
  created_at: Date
  updated_at: Date
  matricula: string
  full_name: string
}

// Tipo para crear/actualizar vehículo (sin id ni timestamps)
export interface VehicleInput {
  plate: string
  studentId: string
  studentName: string
  vehicleType: VehicleType
  hasHelmet: boolean
  helmetCount: number
  helmets: { description: string }[]
  vehicleDescription?: string
  vehiclePhotoPath?: string | null
}

function rowToRecord(row: VehicleRowWithUser, helmets: { description: string }[]): VehicleRecordWithId {
  return {
    id: row.id,
    studentUserId: row.user_id,
    plate: row.plate,
    studentId: row.matricula,
    studentName: row.full_name,
    vehicleType: row.vehicle_type,
    hasHelmet: Boolean(row.has_helmet),
    helmetCount: row.helmet_count,
    helmets,
    vehicleDescription: row.vehicle_description ?? "",
    vehiclePhotoUrl: row.vehicle_photo_path,
    status: row.status,
  }
}

function normalizePlate(plate: string): string {
  const clean = plate.replace(/[^A-Za-z0-9]/g, "").toUpperCase()
  if (clean.length <= 3) return clean
  const letters = clean.slice(0, 3)
  const numbers = clean.slice(3)
  return `${letters}-${numbers}`
}

const VEHICLE_SELECT = `SELECT v.id, v.user_id, v.plate, v.vehicle_type, v.has_helmet, v.helmet_count,
  v.vehicle_description, v.vehicle_photo_path, v.status, v.created_at, v.updated_at,
  u.matricula, u.full_name
  FROM vehicles v
  JOIN users u ON u.id = v.user_id`

/**
 * Crea un vehículo y sus cascos. Encuentra o crea el alumno por matrícula y nombre.
 */
export async function create(data: VehicleInput): Promise<VehicleRecordWithId> {
  const db = getDb()
  const user = await findOrCreateByMatriculaAndName(data.studentId, data.studentName)
  const plate = normalizePlate(data.plate)
  await db.execute(
    `INSERT INTO vehicles (
      user_id, plate, vehicle_type, has_helmet, helmet_count,
      vehicle_description, vehicle_photo_path, status
    ) VALUES (?, ?, ?, ?, ?, ?, ?, 'outside')`,
    [
      user.id,
      plate,
      data.vehicleType,
      data.hasHelmet ? 1 : 0,
      data.helmetCount,
      data.vehicleDescription ?? null,
      data.vehiclePhotoPath ?? null,
    ]
  )
  const [rows] = await db.execute<{ id: number }[]>("SELECT LAST_INSERT_ID() AS id")
  const vehicleId = Array.isArray(rows) && rows[0] ? Number(rows[0].id) : 0

  if (data.helmets?.length) {
    const values = data.helmets
      .filter((h) => h.description?.trim())
      .map((h, i) => [vehicleId, h.description.trim(), i])
    if (values.length) {
      const placeholders = values.map(() => "(?, ?, ?)").join(", ")
      await db.execute(`INSERT INTO helmets (vehicle_id, description, sort_order) VALUES ${placeholders}`, values.flat())
    }
  }

  const created = await getById(vehicleId)
  if (!created) throw new Error("No se pudo obtener el vehículo recién creado")
  return created
}

/**
 * Obtiene un vehículo por id con sus cascos.
 */
export async function getById(id: number): Promise<VehicleRecordWithId | null> {
  const db = getDb()
  const [rows] = await db.execute<VehicleRowWithUser[]>(`${VEHICLE_SELECT} WHERE v.id = ?`, [id])
  const row = Array.isArray(rows) ? rows[0] : null
  if (!row) return null

  const [helmetRows] = await db.execute<{ description: string }[]>(
    "SELECT description FROM helmets WHERE vehicle_id = ? ORDER BY sort_order, id",
    [id]
  )
  const helmets = Array.isArray(helmetRows) ? helmetRows.map((h) => ({ description: h.description })) : []
  return rowToRecord(row, helmets)
}

/**
 * Obtiene un vehículo por placa (normalizada) con sus cascos.
 */
export async function getByPlate(plate: string): Promise<VehicleRecordWithId | null> {
  const db = getDb()
  const normalized = normalizePlate(plate)
  const [rows] = await db.execute<VehicleRowWithUser[]>(`${VEHICLE_SELECT} WHERE v.plate = ?`, [normalized])
  const row = Array.isArray(rows) ? rows[0] : null
  if (!row) return null
  return getById(row.id)
}

/**
 * Obtiene un vehículo por matrícula del alumno (primer vehículo encontrado).
 */
export async function getByStudentId(studentId: string): Promise<VehicleRecordWithId | null> {
  const user = await findByMatricula(studentId)
  if (!user) return null
  const db = getDb()
  const [rows] = await db.execute<VehicleRowWithUser[]>(`${VEHICLE_SELECT} WHERE v.user_id = ? LIMIT 1`, [user.id])
  const row = Array.isArray(rows) ? rows[0] : null
  if (!row) return null
  return getById(row.id)
}

/**
 * Lista todos los vehículos registrados para una matrícula de alumno.
 */
export async function listByStudentId(studentId: string): Promise<VehicleRecordWithId[]> {
  const user = await findByMatricula(studentId)
  if (!user) return []

  const db = getDb()
  const [rows] = await db.execute<VehicleRowWithUser[]>(
    `${VEHICLE_SELECT} WHERE v.user_id = ? ORDER BY v.created_at DESC`,
    [user.id]
  )
  const list = Array.isArray(rows) ? rows : []

  if (!list.length) return []

  // Para simplicidad y dado que un alumno suele tener pocos vehículos,
  // reutilizamos getById para obtener cascos y foto normalizados.
  const results: VehicleRecordWithId[] = []
  for (const row of list) {
    const full = await getById(row.id)
    if (full) results.push(full)
  }
  return results
}

/**
 * Busca por placa o matrícula.
 */
export async function search(query: string): Promise<VehicleRecordWithId | null> {
  const trimmed = query.trim()
  if (!trimmed) return null

  const clean = trimmed.replace(/[^A-Za-z0-9]/g, "").toUpperCase()
  const onlyDigits = clean.replace(/\D/g, "")

  if (onlyDigits.length === 9 && clean === onlyDigits) {
    const byStudent = await getByStudentId(onlyDigits)
    if (byStudent) return byStudent
  }

  if (clean.length >= 6 && /^[A-Z]{3}/.test(clean)) {
    const byPlate = await getByPlate(clean)
    if (byPlate) return byPlate
  }

  if (onlyDigits.length >= 6) {
    const byStudent = await getByStudentId(onlyDigits)
    if (byStudent) return byStudent
  }

  return null
}

/**
 * Actualiza un vehículo. Encuentra o crea el alumno por matrícula y nombre.
 */
export async function update(id: number, data: VehicleInput): Promise<VehicleRecordWithId | null> {
  const db = getDb()
  const user = await findOrCreateByMatriculaAndName(data.studentId, data.studentName)
  const plate = normalizePlate(data.plate)
  const [result] = await db.execute(
    `UPDATE vehicles SET
      user_id = ?, plate = ?, vehicle_type = ?, has_helmet = ?, helmet_count = ?,
      vehicle_description = ?, vehicle_photo_path = ?
    WHERE id = ?`,
    [
      user.id,
      plate,
      data.vehicleType,
      data.hasHelmet ? 1 : 0,
      data.helmetCount,
      data.vehicleDescription ?? null,
      data.vehiclePhotoPath ?? null,
      id,
    ]
  )

  const affected = "affectedRows" in result ? (result as { affectedRows: number }).affectedRows : 0
  if (affected === 0) return null

  await db.execute("DELETE FROM helmets WHERE vehicle_id = ?", [id])
  if (data.helmets?.length) {
    const values = data.helmets
      .filter((h) => h.description?.trim())
      .map((h, i) => [id, h.description.trim(), i])
    if (values.length) {
      const placeholders = values.map(() => "(?, ?, ?)").join(", ")
      await db.execute(`INSERT INTO helmets (vehicle_id, description, sort_order) VALUES ${placeholders}`, values.flat())
    }
  }

  return getById(id)
}

/**
 * Elimina un vehículo. Cascos en cascada.
 */
export async function deleteVehicle(id: number): Promise<boolean> {
  const db = getDb()
  const [result] = await db.execute("DELETE FROM vehicles WHERE id = ?", [id])
  const affected = "affectedRows" in result ? (result as { affectedRows: number }).affectedRows : 0
  return affected > 0
}
