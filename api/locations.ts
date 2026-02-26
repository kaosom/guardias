/**
 * Servicio de planteles/lugares. Tabla locations.
 */

import { getDb } from "@/database"

export interface LocationRow {
  id: number
  code: string
  name: string
}

/**
 * Lista todos los planteles disponibles.
 */
export async function listLocations(): Promise<LocationRow[]> {
  const db = getDb()
  const [rows] = await db.execute<LocationRow[]>("SELECT id, code, name FROM locations ORDER BY id")
  return Array.isArray(rows) ? rows : []
}

