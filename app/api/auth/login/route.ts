/**
 * POST /api/auth/login — Iniciar sesión. Body: { email, password }
 * Responde con { user } y setea cookie httpOnly con JWT.
 */

import { NextRequest, NextResponse } from "next/server"
import bcrypt from "bcrypt"
import { findByEmail } from "@/api"
import { createToken, getCookieName, sessionCookieOptions } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const email = typeof body?.email === "string" ? body.email.trim() : ""
    const password = typeof body?.password === "string" ? body.password : ""

    if (!email || !password) {
      return NextResponse.json(
        { error: "Correo y contraseña son obligatorios." },
        { status: 400 }
      )
    }

    const user = await findByEmail(email)
    if (!user) {
      return NextResponse.json(
        { error: "Credenciales incorrectas." },
        { status: 401 }
      )
    }

    const valid = await bcrypt.compare(password, user.password_hash)
    if (!valid) {
      return NextResponse.json(
        { error: "Credenciales incorrectas." },
        { status: 401 }
      )
    }

    const sessionUser = {
      id: user.id,
      email: user.email,
      role: user.role,
      fullName: user.full_name,
      ...(user.gate != null && { gate: user.gate }),
    }
    const token = await createToken(sessionUser)
    const opts = sessionCookieOptions()
    const res = NextResponse.json({ user: sessionUser }, { status: 200 })
    res.cookies.set(getCookieName(), token, opts)
    return res
  } catch (err) {
    console.error("POST /api/auth/login error:", err)
    return NextResponse.json(
      { error: "Error al iniciar sesión." },
      { status: 500 }
    )
  }
}
