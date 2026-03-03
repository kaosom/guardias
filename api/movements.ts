/**
 * Servicio de movimientos: registrar entrada/salida y consultar historial.
 * Actualiza el status del vehículo y guarda el movimiento en una transacción.
 */

import { getConnection } from "@/database"

export type MovementType = "entry" | "exit"

/**
 * Registra un movimiento (entrada o salida) y actualiza el status del vehículo.
 * guardId: usuario que registra el movimiento (opcional para compatibilidad).
 * Usa transacción para que todo sea atómico.
 */
export async function registerMovement(
  vehicleId: number,
  type: MovementType,
  guardId?: number | null
): Promise<{ movementId: number; newStatus: "inside" | "outside" }> {
  const conn = await getConnection()
  try {
    await conn.beginTransaction()
    const newStatus = type === "entry" ? "inside" : "outside"
    await conn.execute(
      "INSERT INTO movements (vehicle_id, guard_id, type) VALUES (?, ?, ?)",
      [vehicleId, guardId ?? null, type]
    )
    await conn.execute("UPDATE vehicles SET status = ? WHERE id = ?", [newStatus, vehicleId])
    await conn.commit()
    const [rows] = await conn.execute<{ id: number }[]>("SELECT LAST_INSERT_ID() AS id")
    const movementId = Array.isArray(rows) && rows[0] ? Number(rows[0].id) : 0
    return { movementId, newStatus }
  } catch (e) {
    await conn.rollback()
    throw e
  } finally {
    conn.release()
  }
}

/**
 * Lista los últimos movimientos de un vehículo (para historial).
 */
export async function getByVehicleId(
  vehicleId: number,
  limit: number = 50
): Promise<{ id: number; type: MovementType; created_at: Date }[]> {
  const db = (await import("@/database")).getDb()
  const [rows] = await db.execute<{ id: number; type: MovementType; created_at: Date }[]>(
    "SELECT id, type, created_at FROM movements WHERE vehicle_id = ? ORDER BY created_at DESC LIMIT ?",
    [vehicleId, limit]
  )
  return Array.isArray(rows) ? rows : []
}

/**
 * Lista movimientos registrados por un guardia (para panel admin).
 * Incluye placa del vehículo.
 */
export async function getByGuardId(
  guardId: number,
  limit: number = 100
): Promise<{ id: number; vehicle_id: number; plate: string; type: MovementType; created_at: Date }[]> {
  const db = (await import("@/database")).getDb()
  const safeLimit = Math.min(500, Math.max(1, Math.floor(Number(limit)) || 100))
  const [rows] = await db.execute<
    { id: number; vehicle_id: number; plate: string; type: MovementType; created_at: Date }[]
  >(
    `SELECT m.id, m.vehicle_id, v.plate, m.type, m.created_at
     FROM movements m
     JOIN vehicles v ON v.id = m.vehicle_id
     WHERE m.guard_id = ?
     ORDER BY m.created_at DESC
     LIMIT ?`,
    [guardId, safeLimit]
  )
  return Array.isArray(rows) ? rows : []
}
