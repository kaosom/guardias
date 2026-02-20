/**
 * POST /api/upload — Sube la foto de un vehículo (multipart: file, plate o vehicleId).
 * Devuelve { path: string } para guardar en vehiclePhotoPath al crear/actualizar vehículo.
 */

import { NextRequest, NextResponse } from "next/server"
import { saveVehiclePhoto } from "@/api"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File | null
    const plate = (formData.get("plate") as string) ?? ""
    const vehicleId = formData.get("vehicleId") as string | null

    if (!file || file.size === 0) {
      return NextResponse.json(
        { error: "Falta el archivo de la foto (campo 'file')." },
        { status: 400 }
      )
    }

    const identifier = plate.trim()
      ? plate.replace(/[^A-Za-z0-9]/g, "_").slice(0, 20)
      : (vehicleId ?? "vehicle")
    const buffer = Buffer.from(await file.arrayBuffer())
    const path = await saveVehiclePhoto(buffer, file.type, identifier)
    return NextResponse.json({ path }, { status: 201 })
  } catch (err) {
    console.error("POST /api/upload error:", err)
    const message = err instanceof Error ? err.message : "Error al subir la foto."
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
