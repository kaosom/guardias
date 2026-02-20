/**
 * GET /api/admin/guards — Lista guardias (solo admin).
 * POST /api/admin/guards — Crea un guardia (solo admin). Body: { email, password, fullName, gate }
 */

import { NextRequest, NextResponse } from "next/server"
import bcrypt from "bcrypt"
import { listGuards, createGuard } from "@/api"
import { getSessionFromRequest } from "@/lib/auth"

async function requireAdmin(request: NextRequest) {
  const session = await getSessionFromRequest(request)
  if (!session || session.role !== "admin") {
    return null
  }
  return session
}

export async function GET(request: NextRequest) {
  const session = await requireAdmin(request)
  if (!session) {
    return NextResponse.json({ error: "No autorizado." }, { status: 403 })
  }
  try {
    const guards = await listGuards()
    return NextResponse.json(guards)
  } catch (err) {
    console.error("GET /api/admin/guards error:", err)
    return NextResponse.json(
      { error: "Error al listar guardias." },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  const session = await requireAdmin(request)
  if (!session) {
    return NextResponse.json({ error: "No autorizado." }, { status: 403 })
  }
  try {
    const body = await request.json()
    const email = typeof body?.email === "string" ? body.email.trim() : ""
    const password = typeof body?.password === "string" ? body.password : ""
    const fullName = typeof body?.fullName === "string" ? body.fullName.trim() : ""
    let gate = body?.gate != null ? Number(body.gate) : NaN
    if (!Number.isInteger(gate) || gate < 1 || gate > 15) gate = 1

    if (!email || !password || !fullName) {
      return NextResponse.json(
        { error: "email, password y fullName son obligatorios." },
        { status: 400 }
      )
    }

    const user = await createGuard(
      { email, password, fullName, gate },
      (plain) => bcrypt.hash(plain, 10)
    )
    return NextResponse.json(user, { status: 201 })
  } catch (err) {
    console.error("POST /api/admin/guards error:", err)
    return NextResponse.json(
      { error: "Error al crear guardia." },
      { status: 500 }
    )
  }
}
