/**
 * DELETE /api/admin/guards/[id] — Elimina un guardia (solo admin).
 * No permite eliminar el último admin.
 */

import { NextRequest, NextResponse } from "next/server"
import { deleteGuard, getUserById } from "@/api"
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

export async function DELETE(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const session = await requireAdmin(_request)
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
    if (user.role !== "guard") {
      return NextResponse.json({ error: "No se puede eliminar un administrador." }, { status: 400 })
    }

    const ok = await deleteGuard(guardId)
    if (!ok) {
      return NextResponse.json({ error: "No se pudo eliminar." }, { status: 500 })
    }
    return new NextResponse(null, { status: 204 })
  } catch (err) {
    console.error("DELETE /api/admin/guards/[id] error:", err)
    return NextResponse.json(
      { error: "Error al eliminar guardia." },
      { status: 500 }
    )
  }
}
