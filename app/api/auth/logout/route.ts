/**
 * POST /api/auth/logout — Cerrar sesión. Borra la cookie.
 */

import { NextResponse } from "next/server"
import { getCookieName } from "@/lib/auth"

export async function POST() {
  const res = NextResponse.json({ ok: true }, { status: 200 })
  res.cookies.set(getCookieName(), "", { httpOnly: true, path: "/", maxAge: 0 })
  return res
}
