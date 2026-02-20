/**
 * GET /api/admin/guards/[id]/movements — Lista movimientos de un guardia (solo admin).
 */

import { NextRequest, NextResponse } from "next/server"
import { getByGuardId, getUserById } from "@/api"
import { getSessionFromRequest } from "@/lib/auth"

async function requireAdmin(request: NextRequest) {
  const session = await getSessionFromRequest(request)
  if (!session || session.role !== "admin") {
    return null
  }
  return session
}

function parseId(id: string): number | null {
  const n = Number(id)
  return Number.isInteger(n) && n > 0 ? n : null
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const session = await requireAdmin(request)
  if (!session) {
    return NextResponse.json({ error: "No autorizado." }, { status: 403 })
  }

  try {
    const { id } = await context.params
    const guardId = parseId(id)
    if (guardId === null) {
      return NextResponse.json({ error: "Id no válido." }, { status: 400 })
    }

    const user = await getUserById(guardId)
    if (!user) {
      return NextResponse.json({ error: "Guardia no encontrado." }, { status: 404 })
    }

    const limit = Math.min(Number(request.nextUrl.searchParams.get("limit")) || 100, 500)
    const movements = await getByGuardId(guardId, limit)
    return NextResponse.json(movements)
  } catch (err) {
    console.error("GET /api/admin/guards/[id]/movements error:", err)
    return NextResponse.json(
      { error: "Error al listar movimientos." },
      { status: 500 }
    )
  }
}
