/**
 * GET /api/vehicles?q=... — Busca vehículo por placa o matrícula.
 * POST /api/vehicles — Crea un vehículo (body JSON; opcional multipart con foto).
 */

import { NextRequest, NextResponse } from "next/server"
import { search, create } from "@/api"
import type { VehicleInput } from "@/api"

export async function GET(request: NextRequest) {
  try {
    const q = request.nextUrl.searchParams.get("q")
    if (!q || !q.trim()) {
      return NextResponse.json(
        { error: "Falta el parámetro de búsqueda q (placa o matrícula)." },
        { status: 400 }
      )
    }
    const vehicle = await search(q.trim())
    if (!vehicle) {
      return NextResponse.json(null, { status: 404 })
    }
    return NextResponse.json(vehicle)
  } catch (err) {
    console.error("GET /api/vehicles error:", err)
    return NextResponse.json(
      { error: "Error al buscar el vehículo." },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get("content-type") ?? ""
    let body: VehicleInput
    let photoPath: string | null = null

    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData()
      const plate = formData.get("plate") as string | null
      const studentId = formData.get("studentId") as string | null
      const studentName = formData.get("studentName") as string | null
      const vehicleType = (formData.get("vehicleType") as VehicleInput["vehicleType"]) ?? "moto"
      const hasHelmet = formData.get("hasHelmet") === "true"
      const helmetCount = Number(formData.get("helmetCount")) || 0
      const vehicleDescription = (formData.get("vehicleDescription") as string) || ""
      const helmetsRaw = formData.get("helmets") as string | null
      const helmets = helmetsRaw ? JSON.parse(helmetsRaw) : []

      if (!plate || !studentId || !studentName) {
        return NextResponse.json(
          { error: "Faltan datos obligatorios: plate, studentId, studentName." },
          { status: 400 }
        )
      }

      const file = formData.get("photo") as File | null
      if (file && file.size > 0) {
        const { saveVehiclePhoto } = await import("@/api")
        const buffer = Buffer.from(await file.arrayBuffer())
        const identifier = plate.replace(/[^A-Za-z0-9]/g, "").toUpperCase().slice(0, 10) || "vehicle"
        photoPath = await saveVehiclePhoto(buffer, file.type, identifier)
      }

      body = {
        plate,
        studentId,
        studentName,
        vehicleType,
        hasHelmet,
        helmetCount,
        helmets: Array.isArray(helmets) ? helmets : [],
        vehicleDescription: vehicleDescription || undefined,
        vehiclePhotoPath: photoPath,
      }
    } else {
      const json = await request.json()
      if (!json.plate || !json.studentId || !json.studentName) {
        return NextResponse.json(
          { error: "Faltan datos obligatorios: plate, studentId, studentName." },
          { status: 400 }
        )
      }
      body = {
        plate: json.plate,
        studentId: json.studentId,
        studentName: json.studentName,
        vehicleType: json.vehicleType ?? "moto",
        hasHelmet: Boolean(json.hasHelmet),
        helmetCount: Number(json.helmetCount) || 0,
        helmets: Array.isArray(json.helmets) ? json.helmets : [],
        vehicleDescription: json.vehicleDescription,
        vehiclePhotoPath: json.vehiclePhotoPath ?? null,
      }
    }

    const vehicle = await create(body)
    return NextResponse.json(vehicle, { status: 201 })
  } catch (err) {
    console.error("POST /api/vehicles error:", err)
    return NextResponse.json(
      { error: "Error al crear el vehículo." },
      { status: 500 }
    )
  }
}
