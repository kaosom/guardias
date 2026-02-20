/**
 * POST /api/movements — Registra una entrada o salida de vehículo.
 * Requiere sesión (guard o admin). Body: { vehicleId: number, type: 'entry' | 'exit' }
 */

import { NextRequest, NextResponse } from "next/server"
import { registerMovement } from "@/api"
import { getSessionFromRequest } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    const session = await getSessionFromRequest(request)
    if (!session) {
      return NextResponse.json({ error: "No autorizado." }, { status: 401 })
    }

    const body = await request.json()
    const vehicleId = body?.vehicleId != null ? Number(body.vehicleId) : NaN
    const type = body?.type

    if (!Number.isInteger(vehicleId) || vehicleId <= 0) {
      return NextResponse.json(
        { error: "vehicleId debe ser un número entero positivo." },
        { status: 400 }
      )
    }
    if (type !== "entry" && type !== "exit") {
      return NextResponse.json(
        { error: "type debe ser 'entry' o 'exit'." },
        { status: 400 }
      )
    }

    const result = await registerMovement(vehicleId, type, session.id)
    return NextResponse.json(
      { movementId: result.movementId, newStatus: result.newStatus },
      { status: 201 }
    )
  } catch (err) {
    console.error("POST /api/movements error:", err)
    return NextResponse.json(
      { error: "Error al registrar el movimiento." },
      { status: 500 }
    )
  }
}
