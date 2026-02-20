/**
 * GET /api/auth/session — Devuelve el usuario de la sesión actual o 401.
 */

import { NextRequest, NextResponse } from "next/server"
import { getSessionFromRequest } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    const user = await getSessionFromRequest(request)
    if (!user) {
      return NextResponse.json({ error: "No autorizado." }, { status: 401 })
    }
    return NextResponse.json({ user })
  } catch (err) {
    console.error("GET /api/auth/session error:", err)
    return NextResponse.json(
      { error: "Error al obtener la sesión." },
      { status: 500 }
    )
  }
}
