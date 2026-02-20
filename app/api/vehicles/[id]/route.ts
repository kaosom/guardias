/**
 * GET /api/vehicles/[id] — Obtiene un vehículo por id.
 * PUT /api/vehicles/[id] — Actualiza un vehículo.
 * DELETE /api/vehicles/[id] — Elimina un vehículo.
 */

import { NextRequest, NextResponse } from "next/server"
import { getById, update, deleteVehicle } from "@/api"
import type { VehicleInput } from "@/api"

function parseId(id: string): number | null {
  const n = Number(id)
  return Number.isInteger(n) && n > 0 ? n : null
}

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params
    const vehicleId = parseId(id)
    if (vehicleId === null) {
      return NextResponse.json({ error: "Id de vehículo no válido." }, { status: 400 })
    }
    const vehicle = await getById(vehicleId)
    if (!vehicle) {
      return NextResponse.json(null, { status: 404 })
    }
    return NextResponse.json(vehicle)
  } catch (err) {
    console.error("GET /api/vehicles/[id] error:", err)
    return NextResponse.json(
      { error: "Error al obtener el vehículo." },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params
    const vehicleId = parseId(id)
    if (vehicleId === null) {
      return NextResponse.json({ error: "Id de vehículo no válido." }, { status: 400 })
    }

    const json = await request.json()
    if (!json.plate || !json.studentId || !json.studentName) {
      return NextResponse.json(
        { error: "Faltan datos obligatorios: plate, studentId, studentName." },
        { status: 400 }
      )
    }

    const body: VehicleInput = {
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

    const vehicle = await update(vehicleId, body)
    if (!vehicle) {
      return NextResponse.json(null, { status: 404 })
    }
    return NextResponse.json(vehicle)
  } catch (err) {
    console.error("PUT /api/vehicles/[id] error:", err)
    return NextResponse.json(
      { error: "Error al actualizar el vehículo." },
      { status: 500 }
    )
  }
}

export async function DELETE(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params
    const vehicleId = parseId(id)
    if (vehicleId === null) {
      return NextResponse.json({ error: "Id de vehículo no válido." }, { status: 400 })
    }
    const deleted = await deleteVehicle(vehicleId)
    if (!deleted) {
      return NextResponse.json(null, { status: 404 })
    }
    return new NextResponse(null, { status: 204 })
  } catch (err) {
    console.error("DELETE /api/vehicles/[id] error:", err)
    return NextResponse.json(
      { error: "Error al eliminar el vehículo." },
      { status: 500 }
    )
  }
}
